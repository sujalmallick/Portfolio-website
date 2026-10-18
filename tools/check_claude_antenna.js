const { chromium } = require('playwright');
const fs = require('fs');

async function checkClaudeAntenna() {
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

    const W = img.naturalWidth;
    const d = ctx.getImageData(0, 0, W, img.naturalHeight).data;

    // Check minY in columns around F3 antenna (x in 370..410) and F5 antenna (x in 700..740)
    // for y between 230 and 260
    const findMinY = (x1, x2) => {
      for (let y = 220; y < 260; y++) {
        for (let x = x1; x <= x2; x++) {
          if (d[(y * W + x) * 4 + 3] >= 128) {
            return { minY: y, x };
          }
        }
      }
      return null;
    };

    return {
      f1: findMinY(28, 60),
      f2: findMinY(204, 230),
      f3: findMinY(368, 400),
      f4: findMinY(544, 570),
      f5: findMinY(701, 730),
      f6: findMinY(860, 890)
    };
  }, dataUrl);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

checkClaudeAntenna();
