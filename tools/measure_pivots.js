const { chromium } = require('playwright');
const fs = require('fs');

async function measurePivots() {
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
    const H = img.naturalHeight;
    const data = ctx.getImageData(0, 0, W, H).data;

    // Helper: is non-transparent pixel
    const isSolid = (x, y) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return false;
      return data[(y * W + x) * 4 + 3] >= 128;
    };

    // 1. Claude frames (Row 2, y in [240, 425]):
    // Find bottom-most solid pixel (feet contact) and center X of feet for F1..F6
    const claudeBoxes = [
      [28, 240, 126, 185],
      [204, 240, 118, 185],
      [368, 240, 126, 185], // exclude right spark marks at >480
      [544, 240, 122, 185],
      [701, 240, 132, 185],
      [860, 240, 132, 185]
    ];

    const claudePivots = claudeBoxes.map(([bx, by, bw, bh], idx) => {
      let maxY = -1;
      let feetPixels = [];
      for (let y = by + bh - 1; y >= by; y--) {
        for (let x = bx; x < bx + bw; x++) {
          if (isSolid(x, y)) {
            if (maxY === -1) maxY = y;
            if (y >= maxY - 3) feetPixels.push(x);
          }
        }
        if (maxY !== -1 && y < maxY - 3) break;
      }
      const avgX = feetPixels.length ? (feetPixels.reduce((a, b) => a + b, 0) / feetPixels.length) : bx + bw / 2;
      return { frame: idx + 1, groundY: maxY, centerX: Math.round(avgX) };
    });

    // 2. ChatGPT frames (Row 1, y in [35, 190]):
    // Without the oval shadow (which starts around y=187-190)
    // Find bottom-most point of the central pedestal (y in [175, 192], x near center)
    const chatgptBoxes = [
      [32, 35, 145, 155], // up to y = 190
      [201, 35, 141, 155],
      [376, 35, 139, 155],
      [540, 35, 133, 155],
      [697, 35, 138, 155],
      [862, 35, 139, 155]
    ];

    const chatgptPivots = chatgptBoxes.map(([bx, by, bw, bh], idx) => {
      // Find the bottom of the central pedestal between x = bx + 40 and bx + bw - 40
      let maxY = -1;
      let basePixels = [];
      for (let y = by + bh; y >= by + 120; y--) {
        for (let x = bx + 35; x < bx + bw - 35; x++) {
          if (isSolid(x, y)) {
            if (maxY === -1) maxY = y;
            if (y >= maxY - 3) basePixels.push(x);
          }
        }
        if (maxY !== -1 && y < maxY - 3) break;
      }
      const avgX = basePixels.length ? (basePixels.reduce((a, b) => a + b, 0) / basePixels.length) : bx + bw / 2;
      return { frame: idx + 1, baseY: maxY, centerX: Math.round(avgX) };
    });

    // 3. Gemini frames (Row 3, y in [450, 605]):
    // Nozzle rim is around y=600-602
    const geminiBoxes = [
      [13, 450, 160, 155], // up to y = 605
      [191, 450, 180, 155],
      [399, 450, 195, 155],
      [610, 450, 215, 155],
      [865, 450, 160, 155]
    ];

    const geminiPivots = geminiBoxes.map(([bx, by, bw, bh], idx) => {
      // Find the nozzle rim between x = bx + 40 and bx + bw - 40 near y=595..605
      let nozzleY = -1;
      let nozzlePixels = [];
      for (let y = by + bh; y >= by + 130; y--) {
        for (let x = bx + 30; x < bx + bw - 30; x++) {
          if (isSolid(x, y)) {
            // Check if dark nozzle pixel
            const pIdx = (y * W + x) * 4;
            const r = data[pIdx], g = data[pIdx+1], b = data[pIdx+2];
            if (r < 60 && g < 60 && b < 60) {
              if (nozzleY === -1) nozzleY = y;
              if (y >= nozzleY - 3) nozzlePixels.push(x);
            }
          }
        }
        if (nozzleY !== -1 && y < nozzleY - 3) break;
      }
      const avgX = nozzlePixels.length ? (nozzlePixels.reduce((a, b) => a + b, 0) / nozzlePixels.length) : bx + bw / 2;
      return { frame: idx + 1, nozzleY, centerX: Math.round(avgX) };
    });

    return {
      claudePivots,
      chatgptPivots,
      geminiPivots
    };
  }, dataUrl);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

measurePivots();
