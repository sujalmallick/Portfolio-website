const { chromium } = require('playwright');
const fs = require('fs');

async function renderPixelGrids() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  // Let's crop Claude F1 (x: 28, y: 242, w: 126, h: 176)
  // ChatGPT F1 (x: 32, y: 42, w: 145, h: 166)
  // Gemini F1 (x: 13, y: 455, w: 153, h: 199)
  // and render them at 4x with canvas image-rendering: pixelated
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
      .container { display: flex; gap: 30px; }
      canvas { image-rendering: pixelated; border: 1px solid #444; }
    </style>
  </head>
  <body>
    <div class="container">
      <div>
        <h3>ChatGPT F1 (4x)</h3>
        <canvas id="c1" width="580" height="664"></canvas>
      </div>
      <div>
        <h3>Claude F1 (4x)</h3>
        <canvas id="c2" width="504" height="704"></canvas>
      </div>
      <div>
        <h3>Gemini F1 (4x)</h3>
        <canvas id="c3" width="612" height="796"></canvas>
      </div>
    </div>
    <script>
      const img = new Image();
      img.src = "${dataUrl}";
      img.onload = () => {
        const draw = (id, sx, sy, sw, sh, dw, dh) => {
          const c = document.getElementById(id);
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        };
        draw('c1', 32, 42, 145, 166, 580, 664);
        draw('c2', 28, 242, 126, 176, 504, 704);
        draw('c3', 13, 455, 153, 199, 612, 796);
      };
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/zoomed_f1.png', fullPage: true });
  console.log('Saved tools/zoomed_f1.png');
  await browser.close();
}

renderPixelGrids();
