const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeComponents() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  // Let's create an inspection page that displays each row and frame
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #1a1a24; color: #fff; font-family: sans-serif; padding: 20px; }
      .row { margin-bottom: 30px; }
      .frames { display: flex; gap: 15px; flex-wrap: wrap; }
      .frame-box { border: 1px solid #444; background: #222; padding: 5px; text-align: center; }
      canvas { image-rendering: pixelated; border: 1px dashed #666; }
    </style>
  </head>
  <body>
    <h1>Sheet Diagnostic</h1>
    <div id="container"></div>
    <script>
      const src = "${dataUrl}";
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const bands = [
          { name: "ChatGPT (Row 1)", y1: 30, y2: 215, frames: [
            {x: 32, y: 35, w: 145, h: 175},
            {x: 201, y: 35, w: 141, h: 175},
            {x: 376, y: 35, w: 139, h: 175},
            {x: 540, y: 35, w: 133, h: 175},
            {x: 697, y: 35, w: 138, h: 175},
            {x: 862, y: 35, w: 139, h: 175}
          ]},
          { name: "Claude (Row 2)", y1: 235, y2: 430, frames: [
            {x: 28, y: 240, w: 126, h: 185},
            {x: 204, y: 240, w: 118, h: 185},
            {x: 368, y: 240, w: 143, h: 185},
            {x: 544, y: 240, w: 122, h: 185},
            {x: 701, y: 240, w: 132, h: 185},
            {x: 860, y: 240, w: 132, h: 185}
          ]},
          { name: "Gemini (Row 3)", y1: 445, y2: 665, frames: [
            {x: 13, y: 450, w: 160, h: 210},
            {x: 191, y: 450, w: 180, h: 210},
            {x: 399, y: 450, w: 195, h: 210},
            {x: 610, y: 450, w: 215, h: 210},
            {x: 865, y: 450, w: 160, h: 210}
          ]}
        ];

        const container = document.getElementById('container');
        bands.forEach(band => {
          const rowDiv = document.createElement('div');
          rowDiv.className = 'row';
          rowDiv.innerHTML = '<h2>' + band.name + '</h2>';
          const framesDiv = document.createElement('div');
          framesDiv.className = 'frames';
          
          band.frames.forEach((f, idx) => {
            const box = document.createElement('div');
            box.className = 'frame-box';
            box.innerHTML = '<div>F' + (idx+1) + ' (' + f.w + 'x' + f.h + ')</div>';
            const c = document.createElement('canvas');
            c.width = f.w;
            c.height = f.h;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
            box.appendChild(c);
            framesDiv.appendChild(box);
          });
          rowDiv.appendChild(framesDiv);
          container.appendChild(rowDiv);
        });
      };
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/diagnostic_preview.png', fullPage: true });
  console.log('Saved tools/diagnostic_preview.png');
  await browser.close();
}

analyzeComponents();
