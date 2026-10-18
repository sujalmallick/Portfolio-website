const { chromium } = require('playwright');
const fs = require('fs');

async function findBlockSize() {
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

    // Let's test Claude F1: x: 28, y: 242, w: 126, h: 176
    // Auto-correlation for horizontal shift dx = 1..10
    const testAutocorr = (sx, sy, sw, sh) => {
      const id = ctx.getImageData(sx, sy, sw, sh);
      const d = id.data;
      const scoresX = {};
      const scoresY = {};

      for (let s = 1; s <= 8; s++) {
        let diffX = 0, countX = 0;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw - s; x++) {
            const i1 = (y * sw + x) * 4;
            const i2 = (y * sw + x + s) * 4;
            if (d[i1+3] > 128 && d[i2+3] > 128) {
              const diff = Math.abs(d[i1]-d[i2]) + Math.abs(d[i1+1]-d[i2+1]) + Math.abs(d[i1+2]-d[i2+2]);
              diffX += diff;
              countX++;
            }
          }
        }
        scoresX[s] = (diffX / countX).toFixed(2);

        let diffY = 0, countY = 0;
        for (let y = 0; y < sh - s; y++) {
          for (let x = 0; x < sw; x++) {
            const i1 = (y * sw + x) * 4;
            const i2 = ((y + s) * sw + x) * 4;
            if (d[i1+3] > 128 && d[i2+3] > 128) {
              const diff = Math.abs(d[i1]-d[i2]) + Math.abs(d[i1+1]-d[i2+1]) + Math.abs(d[i1+2]-d[i2+2]);
              diffY += diff;
              countY++;
            }
          }
        }
        scoresY[s] = (diffY / countY).toFixed(2);
      }
      return { scoresX, scoresY };
    };

    return {
      chatgpt: testAutocorr(32, 42, 145, 166),
      claude: testAutocorr(28, 242, 126, 176),
      gemini: testAutocorr(13, 455, 153, 199)
    };
  }, dataUrl);

  console.log('Autocorrelation (lower diff means more similar):');
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

findBlockSize();
