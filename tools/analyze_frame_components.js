const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeFrameComponents() {
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

    // Helper: find connected components in a bounding box
    function getComponents(bx, by, bw, bh) {
      const visited = new Uint8Array(bw * bh);
      const comps = [];

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const idx = ( (by + y) * W + (bx + x) ) * 4;
          const a = data[idx + 3];
          if (a >= 128 && !visited[y * bw + x]) {
            // BFS
            const q = [[x, y]];
            visited[y * bw + x] = 1;
            let minX = x, maxX = x, minY = y, maxY = y;
            let pixelCount = 0;
            const pixels = [];

            while (q.length > 0) {
              const [cx, cy] = q.pop();
              pixelCount++;
              pixels.push([cx, cy]);
              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;

              // 8-way neighbors
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = cx + dx;
                  const ny = cy + dy;
                  if (nx >= 0 && nx < bw && ny >= 0 && ny < bh) {
                    if (!visited[ny * bw + nx]) {
                      const nIdx = ( (by + ny) * W + (bx + nx) ) * 4;
                      if (data[nIdx + 3] >= 128) {
                        visited[ny * bw + nx] = 1;
                        q.push([nx, ny]);
                      }
                    }
                  }
                }
              }
            }

            comps.push({
              pixelCount,
              x: bx + minX,
              y: by + minY,
              w: maxX - minX + 1,
              h: maxY - minY + 1,
              localX: minX,
              localY: minY
            });
          }
        }
      }

      // Sort by pixel count descending
      comps.sort((a, b) => b.pixelCount - a.pixelCount);
      return comps;
    }

    const frames = {
      chatgpt: [
        { name: 'F1', box: [32, 35, 145, 175] },
        { name: 'F2', box: [201, 35, 141, 175] },
        { name: 'F3', box: [376, 35, 139, 175] },
        { name: 'F4', box: [540, 35, 133, 175] },
        { name: 'F5', box: [697, 35, 138, 175] },
        { name: 'F6', box: [862, 35, 139, 175] }
      ],
      claude: [
        { name: 'F1', box: [28, 240, 126, 185] },
        { name: 'F2', box: [204, 240, 118, 185] },
        { name: 'F3', box: [368, 240, 143, 185] },
        { name: 'F4', box: [544, 240, 122, 185] },
        { name: 'F5', box: [701, 240, 132, 185] },
        { name: 'F6', box: [860, 240, 132, 185] }
      ],
      gemini: [
        { name: 'F1', box: [13, 450, 160, 210] },
        { name: 'F2', box: [191, 450, 180, 210] },
        { name: 'F3', box: [399, 450, 195, 210] },
        { name: 'F4', box: [610, 450, 215, 210] },
        { name: 'F5', box: [865, 450, 160, 210] }
      ]
    };

    const result = {};
    for (const char of ['chatgpt', 'claude', 'gemini']) {
      result[char] = frames[char].map(f => ({
        name: f.name,
        components: getComponents(...f.box)
      }));
    }

    return result;
  }, dataUrl);

  fs.writeFileSync('scratch/components.json', JSON.stringify(res, null, 2));
  console.log('Saved scratch/components.json');
  await browser.close();
}

analyzeFrameComponents();
