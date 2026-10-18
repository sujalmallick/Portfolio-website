const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function analyzeSheet() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync('tools/mascots-sheet.png').toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  const sheetData = await page.evaluate(async (src) => {
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

    // 1. Alpha analysis
    let fullTransparent = 0;
    let fullOpaque = 0;
    let semiTransparent = 0;
    let whiteOrNearWhiteHalos = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];

      if (a === 0) fullTransparent++;
      else if (a === 255) fullOpaque++;
      else {
        semiTransparent++;
        if (r > 240 && g > 240 && b > 240) whiteOrNearWhiteHalos++;
      }
    }

    // 2. Row segmentation: find non-empty pixel rows
    const rowDensity = new Array(H).fill(0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const a = data[(y * W + x) * 4 + 3];
        if (a > 10) rowDensity[y]++;
      }
    }

    // Group rows into 3 distinct bands
    const bands = [];
    let inBand = false;
    let startY = 0;
    for (let y = 0; y < H; y++) {
      if (rowDensity[y] > 5 && !inBand) {
        inBand = true;
        startY = y;
      } else if (rowDensity[y] <= 5 && inBand) {
        inBand = false;
        bands.push({ startY, endY: y - 1 });
      }
    }
    if (inBand) bands.push({ startY, endY: H - 1 });

    // For each band, find frame columns
    const analyzedBands = bands.map((band, bIdx) => {
      const colDensity = new Array(W).fill(0);
      for (let x = 0; x < W; x++) {
        for (let y = band.startY; y <= band.endY; y++) {
          const a = data[(y * W + x) * 4 + 3];
          if (a > 10) colDensity[x]++;
        }
      }

      const frames = [];
      let inFrame = false;
      let startX = 0;
      for (let x = 0; x < W; x++) {
        if (colDensity[x] > 2 && !inFrame) {
          inFrame = true;
          startX = x;
        } else if (colDensity[x] <= 2 && inFrame) {
          inFrame = false;
          // Calculate tight bbox for this frame
          let minX = startX, maxX = x - 1, minY = band.endY, maxY = band.startY;
          for (let cy = band.startY; cy <= band.endY; cy++) {
            for (let cx = startX; cx < x; cx++) {
              if (data[(cy * W + cx) * 4 + 3] > 10) {
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;
              }
            }
          }
          frames.push({
            frameIdx: frames.length + 1,
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
          });
        }
      }
      if (inFrame) {
        frames.push({
          frameIdx: frames.length + 1,
          x: startX,
          y: band.startY,
          width: W - startX,
          height: band.endY - band.startY + 1
        });
      }

      return {
        bandIdx: bIdx + 1,
        startY: band.startY,
        endY: band.endY,
        frameCount: frames.length,
        frames
      };
    });

    return {
      sheetWidth: W,
      sheetHeight: H,
      alphaStats: {
        totalPixels: W * H,
        fullTransparent,
        fullOpaque,
        semiTransparent,
        semiTransparentPct: ((semiTransparent / (W * H)) * 100).toFixed(2) + '%',
        whiteOrNearWhiteHalos
      },
      rows: analyzedBands
    };
  }, dataUrl);

  console.log('=== SPRITE SHEET ANALYSIS ===');
  console.log(JSON.stringify(sheetData, null, 2));

  // Now measure the 3 live mascots in index.html
  const livePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const url = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await livePage.goto(url);
  await livePage.waitForTimeout(500);

  const mascotsData = await livePage.evaluate(() => {
    function inspect(id) {
      const el = document.getElementById(id);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const parent = el.closest('section');
      return {
        id,
        section: parent ? parent.id : null,
        wrapperCSS: {
          position: cs.position,
          top: cs.top,
          right: cs.right,
          bottom: cs.bottom,
          left: cs.left,
          width: cs.width,
          height: cs.height,
          zIndex: cs.zIndex,
          transform: cs.transform
        },
        rect: {
          x: Math.round(r.x * 100) / 100,
          y: Math.round(r.y * 100) / 100,
          width: Math.round(r.width * 100) / 100,
          height: Math.round(r.height * 100) / 100,
          top: Math.round(r.top * 100) / 100,
          right: Math.round(r.right * 100) / 100,
          bottom: Math.round(r.bottom * 100) / 100,
          left: Math.round(r.left * 100) / 100
        },
        innerHtmlSnippet: el.innerHTML.trim().substring(0, 200).replace(/\s+/g, ' ')
      };
    }

    return {
      chatgpt: inspect('mascot-chatgpt'),
      claude: inspect('mascot-claude'),
      gemini: inspect('mascot-gemini')
    };
  });

  console.log('=== LIVE MASCOTS INVENTORY ===');
  console.log(JSON.stringify(mascotsData, null, 2));

  fs.writeFileSync('scratch/inventory_step0.json', JSON.stringify({ sheetData, mascotsData }, null, 2));

  await browser.close();
}

analyzeSheet().catch(console.error);
