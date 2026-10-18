const { chromium } = require('playwright');
const fs = require('fs');

async function checkGeminiFlame() {
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

    // Gemini F1: x: 30..166, y: 456..653
    // Torso into thruster nozzle into flame:
    // Let's sample y from 560 to 655
    const id = ctx.getImageData(50, 560, 95, 95);
    const d = id.data;
    const rows = [];
    for (let y = 0; y < 95; y++) {
      let r = '';
      for (let x = 0; x < 95; x++) {
        const i = (y * 95 + x) * 4;
        const a = d[i+3];
        const red = d[i], grn = d[i+1], blu = d[i+2];
        if (a < 50) r += ' ';
        // Blue flame
        else if (blu > 180 && red < 80) r += '*';
        // White or light cyan flame core
        else if (blu > 220 && red > 180) r += '+';
        // Dark outline or metal nozzle
        else if (red < 50 && grn < 50 && blu < 50) r += '#';
        // Cream body
        else if (red > 200 && grn > 180) r += '.';
        else r += '=';
      }
      rows.push(`y=${560+y}: ` + r);
    }
    return rows;
  }, dataUrl);

  res.forEach(r => console.log(r));
  await browser.close();
}

checkGeminiFlame();
