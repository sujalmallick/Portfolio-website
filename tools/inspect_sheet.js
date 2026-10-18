const { chromium } = require('playwright');
const fs = require('fs');

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  const info = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const id = ctx.getImageData(0, 0, W, H);
    const data = id.data;

    // Run length analysis on consecutive horizontal and vertical identical/similar pixels
    // to detect cell size
    const runLengths = {};
    for (let y = 50; y < H - 50; y += 5) {
      let run = 1;
      for (let x = 1; x < W; x++) {
        const i1 = (y * W + x) * 4;
        const i0 = (y * W + x - 1) * 4;
        const a1 = data[i1 + 3];
        const a0 = data[i0 + 3];
        if (a1 > 128 && a0 > 128) {
          const diff = Math.abs(data[i1] - data[i0]) + Math.abs(data[i1+1] - data[i0+1]) + Math.abs(data[i1+2] - data[i0+2]);
          if (diff < 15) {
            run++;
          } else {
            if (run > 1 && run < 20) runLengths[run] = (runLengths[run] || 0) + 1;
            run = 1;
          }
        } else {
          if (run > 1 && run < 20) runLengths[run] = (runLengths[run] || 0) + 1;
          run = 1;
        }
      }
    }

    return {
      width: W,
      height: H,
      runLengths
    };
  }, dataUrl);

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

inspect();
