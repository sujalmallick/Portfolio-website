const { chromium } = require('playwright');
const fs = require('fs');

async function checkOutline() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  const res = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Claude F1: top of the head is at y around 275..295, x around 60..100
    // Let's print a 20x20 ASCII grid of luminance around the top edge of Claude's head
    // Let's find top-most dark pixel in column x = 80
    let topY = 0;
    for (let y = 240; y < 350; y++) {
      const idx = (y * img.naturalWidth + 80) * 4;
      if (ctx.getImageData(80, y, 1, 1).data[3] > 200) {
        topY = y;
        break;
      }
    }

    // Now extract a 30x30 slice around (x=70, y=topY)
    const id = ctx.getImageData(70, topY - 2, 25, 25);
    const d = id.data;
    const rows = [];
    for (let y = 0; y < 25; y++) {
      let r = '';
      for (let x = 0; x < 25; x++) {
        const i = (y * 25 + x) * 4;
        const a = d[i+3];
        const lum = (d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114);
        if (a < 50) r += '  ';
        else if (lum < 50) r += '##';
        else if (lum < 150) r += '==';
        else r += '..';
      }
      rows.push(r);
    }

    return { topY, rows };
  }, dataUrl);

  console.log('Top edge of Claude head at y=' + res.topY);
  res.rows.forEach(r => console.log(r));
  await browser.close();
}

checkOutline();
