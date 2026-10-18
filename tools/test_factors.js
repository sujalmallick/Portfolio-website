const { chromium } = require('playwright');
const fs = require('fs');

async function testResample() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  // Let's test downsampling Claude F1 and Gemini F1 by factor of 3 and factor of 4
  // and see how crisp the pixels and details are when scaled back up to 8x
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #0d1117; color: #fff; font-family: monospace; padding: 20px; }
      .row { display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-start; }
      .item { border: 1px solid #333; padding: 10px; background: #161b22; }
      canvas { image-rendering: pixelated; border: 1px dashed #555; }
    </style>
  </head>
  <body>
    <h1>Downsampling Comparison: /3 vs /4 vs /3.5 (Shown at 8x)</h1>
    <div id="container"></div>

    <script>
      const img = new Image();
      img.src = "${dataUrl}";
      img.onload = () => {
        const container = document.getElementById('container');

        const testSprite = (name, sx, sy, sw, sh) => {
          const row = document.createElement('div');
          row.className = 'row';
          row.innerHTML = '<h3>' + name + '</h3>';

          [3, 3.5, 4].forEach(factor => {
            const nw = Math.round(sw / factor);
            const nh = Math.round(sh / factor);

            // Step A: sample at factor
            const cNative = document.createElement('canvas');
            cNative.width = nw;
            cNative.height = nh;
            const ctxN = cNative.getContext('2d');
            ctxN.imageSmoothingEnabled = false;
            ctxN.drawImage(img, sx, sy, sw, sh, 0, 0, nw, nh);

            // Step B: render at 8x
            const c8x = document.createElement('canvas');
            c8x.width = nw * 8;
            c8x.height = nh * 8;
            const ctx8 = c8x.getContext('2d');
            ctx8.imageSmoothingEnabled = false;
            ctx8.drawImage(cNative, 0, 0, nw, nh, 0, 0, nw * 8, nh * 8);

            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = '<div>Factor ' + factor + ' (' + nw + 'x' + nh + ' native)</div>';
            item.appendChild(c8x);
            row.appendChild(item);
          });

          container.appendChild(row);
        };

        testSprite('ChatGPT F1', 32, 42, 145, 166);
        testSprite('Claude F1', 28, 242, 126, 176);
        testSprite('Gemini F1', 13, 455, 153, 199);
      };
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/test_factors.png', fullPage: true });
  console.log('Saved tools/test_factors.png');
  await browser.close();
}

testResample();
