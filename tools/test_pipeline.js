const { chromium } = require('playwright');
const fs = require('fs');

async function testPipeline() {
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
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;

    // 1. Color distance helper
    function colorDist(r1, g1, b1, r2, g2, b2) {
      const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
      return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    }

    // 2. Simple median cut / k-means quantizer for <= 16 colors
    function quantize(pixels, maxColors = 16) {
      if (pixels.length === 0) return [];
      // Initialize k-means with diverse seeds
      let centers = [];
      centers.push(pixels[0]);
      while (centers.length < maxColors) {
        let maxD = -1;
        let bestP = pixels[0];
        // sample candidate pixels
        for (let i = 0; i < pixels.length; i += Math.max(1, Math.floor(pixels.length / 200))) {
          const p = pixels[i];
          let minD = Infinity;
          for (const c of centers) {
            const dist = colorDist(p[0], p[1], p[2], c[0], c[1], c[2]);
            if (dist < minD) minD = dist;
          }
          if (minD > maxD) {
            maxD = minD;
            bestP = p;
          }
        }
        centers.push(bestP);
      }

      // 5 iterations of k-means
      for (let iter = 0; iter < 6; iter++) {
        const clusters = Array.from({ length: centers.length }, () => [0, 0, 0, 0]);
        for (let i = 0; i < pixels.length; i++) {
          const p = pixels[i];
          let minD = Infinity, bestIdx = 0;
          for (let c = 0; c < centers.length; c++) {
            const dist = colorDist(p[0], p[1], p[2], centers[c][0], centers[c][1], centers[c][2]);
            if (dist < minD) { minD = dist; bestIdx = c; }
          }
          clusters[bestIdx][0] += p[0];
          clusters[bestIdx][1] += p[1];
          clusters[bestIdx][2] += p[2];
          clusters[bestIdx][3]++;
        }
        for (let c = 0; c < centers.length; c++) {
          if (clusters[c][3] > 0) {
            centers[c] = [
              Math.round(clusters[c][0] / clusters[c][3]),
              Math.round(clusters[c][1] / clusters[c][3]),
              Math.round(clusters[c][2] / clusters[c][3])
            ];
          }
        }
      }

      // Convert to hex
      const hexPalette = centers.map(([r, g, b]) => {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      });
      return { centers, hexPalette: Array.from(new Set(hexPalette)) };
    }

    // Let's test on Claude row
    // Sample non-transparent pixels from Claude F1..F6
    const claudePixels = [];
    for (let y = 240; y < 420; y += 3) {
      for (let x = 20; x < 1000; x += 3) {
        const i = (y * W + x) * 4;
        if (d[i+3] >= 128) {
          claudePixels.push([d[i], d[i+1], d[i+2]]);
        }
      }
    }

    const claudeQ = quantize(claudePixels, 15);
    return {
      claudePaletteCount: claudeQ.hexPalette.length,
      claudePalette: claudeQ.hexPalette
    };
  }, dataUrl);

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

testPipeline();
