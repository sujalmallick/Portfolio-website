const { chromium } = require('playwright');
const fs = require('fs');

async function checkChatgptBottom() {
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

    // ChatGPT F1: x: 32..176, y: 160..210
    const id = ctx.getImageData(50, 165, 100, 45);
    const d = id.data;
    const rows = [];
    for (let y = 0; y < 45; y++) {
      let r = '';
      for (let x = 0; x < 100; x++) {
        const i = (y * 100 + x) * 4;
        const a = d[i+3];
        const lum = (d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114);
        if (a < 50) r += ' ';
        else if (lum < 50) r += '#';
        else if (lum < 150) r += '=';
        else r += '.';
      }
      rows.push(`y=${165+y}: ` + r);
    }
    return rows;
  }, dataUrl);

  res.forEach(r => console.log(r));
  await browser.close();
}

checkChatgptBottom();
