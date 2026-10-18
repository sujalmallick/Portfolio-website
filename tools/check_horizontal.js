const { chromium } = require('playwright');
const fs = require('fs');

async function checkHorizontalGrid() {
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

    // Claude F1: top edge y=282. Let's look at y=295 (across the white top of head into the dark screen)
    // From x=50 to x=115
    const id = ctx.getImageData(50, 295, 65, 1);
    const d = id.data;
    const pixels = [];
    for (let x = 0; x < 65; x++) {
      const i = x * 4;
      pixels.push({
        x: 50 + x,
        r: d[i], g: d[i+1], b: d[i+2], a: d[i+3]
      });
    }

    return pixels;
  }, dataUrl);

  // Group into runs of similar color
  let curRun = [res[0]];
  const runs = [];
  for (let i = 1; i < res.length; i++) {
    const p = res[i];
    const prev = res[i-1];
    const diff = Math.abs(p.r - prev.r) + Math.abs(p.g - prev.g) + Math.abs(p.b - prev.b);
    if (diff < 30) {
      curRun.push(p);
    } else {
      runs.push({ len: curRun.length, startX: curRun[0].x, endX: curRun[curRun.length-1].x, rgb: `${curRun[0].r},${curRun[0].g},${curRun[0].b}` });
      curRun = [p];
    }
  }
  runs.push({ len: curRun.length, startX: curRun[0].x, endX: curRun[curRun.length-1].x, rgb: `${curRun[0].r},${curRun[0].g},${curRun[0].b}` });

  console.log('Horizontal runs across Claude head at y=295:');
  console.log(JSON.stringify(runs, null, 2));
  await browser.close();
}

checkHorizontalGrid();
