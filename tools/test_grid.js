const { chromium } = require('playwright');
const fs = require('fs');

async function testGrid() {
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
    const id = ctx.getImageData(0, 0, W, H);
    const data = id.data;

    // Check pixel transition boundaries: find where horizontal or vertical color transitions occur
    // If drawn on an NxN grid, transitions (x % N == offset) will be strongly concentrated!
    const testRow = (y1, y2) => {
      const stats = {};
      for (let N = 2; N <= 8; N++) {
        stats[N] = { horizontal: new Array(N).fill(0), vertical: new Array(N).fill(0) };
      }

      for (let y = y1; y <= y2; y++) {
        for (let x = 1; x < W; x++) {
          const i1 = (y * W + x) * 4;
          const i0 = (y * W + x - 1) * 4;
          // check if transition
          const diff = Math.abs(data[i1] - data[i0]) + Math.abs(data[i1+1] - data[i0+1]) + Math.abs(data[i1+2] - data[i0+2]) + Math.abs(data[i1+3] - data[i0+3]);
          if (diff > 50) {
            for (let N = 2; N <= 8; N++) {
              stats[N].horizontal[x % N]++;
            }
          }
        }
      }

      for (let x = 0; x < W; x++) {
        for (let y = y1 + 1; y <= y2; y++) {
          const i1 = (y * W + x) * 4;
          const i0 = ((y - 1) * W + x) * 4;
          const diff = Math.abs(data[i1] - data[i0]) + Math.abs(data[i1+1] - data[i0+1]) + Math.abs(data[i1+2] - data[i0+2]) + Math.abs(data[i1+3] - data[i0+3]);
          if (diff > 50) {
            for (let N = 2; N <= 8; N++) {
              stats[N].vertical[y % N]++;
            }
          }
        }
      }

      return stats;
    };

    return {
      chatgpt: testRow(35, 207),
      claude: testRow(242, 421),
      gemini: testRow(452, 657)
    };
  }, dataUrl);

  console.log('--- ChatGPT Transitions ---');
  for (let N = 2; N <= 6; N++) {
    console.log(`N=${N}: H=${JSON.stringify(res.chatgpt[N].horizontal)}, V=${JSON.stringify(res.chatgpt[N].vertical)}`);
  }
  console.log('--- Claude Transitions ---');
  for (let N = 2; N <= 6; N++) {
    console.log(`N=${N}: H=${JSON.stringify(res.claude[N].horizontal)}, V=${JSON.stringify(res.claude[N].vertical)}`);
  }
  console.log('--- Gemini Transitions ---');
  for (let N = 2; N <= 6; N++) {
    console.log(`N=${N}: H=${JSON.stringify(res.gemini[N].horizontal)}, V=${JSON.stringify(res.gemini[N].vertical)}`);
  }

  await browser.close();
}

testGrid();
