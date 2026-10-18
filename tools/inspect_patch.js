const { chromium } = require('playwright');
const fs = require('fs');

async function inspectPixels() {
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

    // Let's sample a small patch from Claude frame 1: head area
    // Frame 1 is around x: 28..154, y: 242..418
    // Let's sample x: 70..110, y: 260..300
    const id = ctx.getImageData(70, 260, 40, 40);
    const d = id.data;
    
    // Let's see unique colors in this 40x40 patch
    const colors = {};
    for (let i = 0; i < d.length; i += 4) {
      if (d[i+3] > 128) {
        const hex = '#' + ((1<<24) + (d[i]<<16) + (d[i+1]<<8) + d[i+2]).toString(16).slice(1);
        colors[hex] = (colors[hex] || 0) + 1;
      }
    }

    // Let's check run lengths inside a single frame
    const hRuns = [];
    for (let y = 0; y < 40; y++) {
      let r = 1;
      for (let x = 1; x < 40; x++) {
        const idx = (y * 40 + x) * 4;
        const prev = (y * 40 + x - 1) * 4;
        if (d[idx] === d[prev] && d[idx+1] === d[prev+1] && d[idx+2] === d[prev+2] && d[idx+3] === d[prev+3]) {
          r++;
        } else {
          hRuns.push(r);
          r = 1;
        }
      }
      hRuns.push(r);
    }

    return {
      colorsCount: Object.keys(colors).length,
      topColors: Object.entries(colors).sort((a,b) => b[1] - a[1]).slice(0, 15),
      hRunsHistogram: hRuns.reduce((acc, v) => { acc[v] = (acc[v]||0)+1; return acc; }, {})
    };
  }, dataUrl);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

inspectPixels();
