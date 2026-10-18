const { chromium } = require('playwright');
const fs = require('fs');

async function measureStrokes() {
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

    // Let's inspect Claude F1:
    // Box: x: 28, y: 242, w: 126, h: 176
    // The antenna stalk is around x: 45..60, y: 255..275.
    // Let's find the antenna ball and stalk
    const id = ctx.getImageData(28, 242, 126, 176);
    const d = id.data;
    const W = 126;

    // Scan horizontal lines across the antenna stalk (y around 25 to 45 in local coords)
    const stalkWidths = [];
    for (let y = 20; y < 45; y++) {
      let blackPixels = 0;
      let inStalk = false;
      let curWidth = 0;
      for (let x = 10; x < 40; x++) {
        const idx = (y * W + x) * 4;
        const isDark = (d[idx] < 60 && d[idx+1] < 60 && d[idx+2] < 60 && d[idx+3] > 128);
        if (isDark) {
          curWidth++;
        } else if (curWidth > 0) {
          stalkWidths.push(curWidth);
          curWidth = 0;
        }
      }
      if (curWidth > 0) stalkWidths.push(curWidth);
    }

    // Now look at Claude F1 eye bars (local y around 65..95, x around 60..95)
    const eyeWidths = [];
    for (let y = 70; y < 90; y++) {
      let curWidth = 0;
      for (let x = 55; x < 100; x++) {
        const idx = (y * W + x) * 4;
        const isOrange = (d[idx] > 180 && d[idx+1] > 80 && d[idx+1] < 160 && d[idx+2] < 40 && d[idx+3] > 128);
        if (isOrange) {
          curWidth++;
        } else if (curWidth > 0) {
          eyeWidths.push(curWidth);
          curWidth = 0;
        }
      }
      if (curWidth > 0) eyeWidths.push(curWidth);
    }

    // Now look at Gemini F1 face / eye (local y around 60..100, x around 40..120)
    const gId = ctx.getImageData(13, 455, 153, 199);
    const gd = gId.data;
    const gW = 153;
    const geminiEyeStroke = [];
    for (let y = 75; y < 95; y++) {
      let curWidth = 0;
      for (let x = 40; x < 120; x++) {
        const idx = (y * gW + x) * 4;
        const isEyeBlue = (gd[idx] < 60 && gd[idx+1] > 120 && gd[idx+2] > 200 && gd[idx+3] > 128);
        if (isEyeBlue) {
          curWidth++;
        } else if (curWidth > 0) {
          geminiEyeStroke.push(curWidth);
          curWidth = 0;
        }
      }
      if (curWidth > 0) geminiEyeStroke.push(curWidth);
    }

    return {
      stalkWidthsHistogram: stalkWidths.reduce((a, v) => { a[v] = (a[v]||0)+1; return a; }, {}),
      eyeWidthsHistogram: eyeWidths.reduce((a, v) => { a[v] = (a[v]||0)+1; return a; }, {}),
      geminiEyeStrokeHistogram: geminiEyeStroke.reduce((a, v) => { a[v] = (a[v]||0)+1; return a; }, {})
    };
  }, dataUrl);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

measureStrokes();
