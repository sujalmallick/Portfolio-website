/**
 * tools/process-sheet.js
 * 
 * Production sheet processor:
 * 1. Cleans alpha (binary 0 or 255) and strips exterior halos.
 * 2. Separates effects (sparkles, sparks, flames, ground shadow) using component masks.
 * 3. Downsamples to native art pixels (factor = 3).
 * 4. Quantizes each character to <= 16 colors (plus alpha 0).
 * 5. Crops to uniform canvas per character, perfectly aligned to pivot with zero clipping.
 * 6. Exports PNG frames to assets/
 * 7. Renders 8x contact sheets on dark (#0d1117) and light (#ffffff) backgrounds.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sujal/.gemini/antigravity/brain/52bf8c8d-615f-434f-b81f-ecae8b58d117';

async function processSheet() {
  console.log('=== STEP 1: PROCESSING SPRITE SHEET ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const sheetPath = path.resolve('tools/mascots-sheet.png');
  if (!fs.existsSync(sheetPath)) {
    throw new Error('tools/mascots-sheet.png not found!');
  }
  const b64 = fs.readFileSync(sheetPath).toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  const result = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await new Promise(r => img.onload = r);

    const W = img.naturalWidth;
    const H = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const rawData = ctx.getImageData(0, 0, W, H);
    const d = rawData.data;

    // 1. Alpha Cleaning & Halo Removal
    for (let i = 0; i < d.length; i += 4) {
      d[i+3] = (d[i+3] < 128) ? 0 : 255;
    }

    const isTrans = (x, y) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return true;
      return d[(y * W + x) * 4 + 3] === 0;
    };

    // Remove near-white halo pixels on border of outlines
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i+3] === 255) {
          const r = d[i], g = d[i+1], b = d[i+2];
          if (r > 235 && g > 235 && b > 235) {
            let trans = 0;
            if (isTrans(x-1, y)) trans++;
            if (isTrans(x+1, y)) trans++;
            if (isTrans(x, y-1)) trans++;
            if (isTrans(x, y+1)) trans++;
            if (trans >= 2) {
              let hasDark = false;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const ni = ((y + dy) * W + (x + dx)) * 4;
                  if (d[ni+3] === 255 && d[ni] < 80 && d[ni+1] < 80 && d[ni+2] < 80) hasDark = true;
                }
              }
              if (hasDark) d[i+3] = 0;
            }
          }
        }
      }
    }
    ctx.putImageData(rawData, 0, 0);

    function colorDist(r1, g1, b1, r2, g2, b2) {
      const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
      return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    }

    function quantizePalette(pixelList, maxColors = 15) {
      if (pixelList.length === 0) return [];
      let centers = [pixelList[0]];
      const sampleStep = Math.max(1, Math.floor(pixelList.length / 300));
      while (centers.length < maxColors) {
        let maxD = -1, bestP = pixelList[0];
        for (let i = 0; i < pixelList.length; i += sampleStep) {
          const p = pixelList[i];
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

      for (let iter = 0; iter < 8; iter++) {
        const clusters = Array.from({ length: centers.length }, () => [0, 0, 0, 0]);
        for (let i = 0; i < pixelList.length; i += Math.max(1, Math.floor(pixelList.length / 2000))) {
          const p = pixelList[i];
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
      return centers;
    }

    function applyPalette(canvasTarget, centers) {
      const cctx = canvasTarget.getContext('2d');
      const cid = cctx.getImageData(0, 0, canvasTarget.width, canvasTarget.height);
      const cd = cid.data;
      for (let i = 0; i < cd.length; i += 4) {
        if (cd[i+3] > 0) {
          let minD = Infinity, bestC = centers[0];
          for (let c = 0; c < centers.length; c++) {
            const dist = colorDist(cd[i], cd[i+1], cd[i+2], centers[c][0], centers[c][1], centers[c][2]);
            if (dist < minD) {
              minD = dist;
              bestC = centers[c];
            }
          }
          cd[i] = bestC[0];
          cd[i+1] = bestC[1];
          cd[i+2] = bestC[2];
          cd[i+3] = 255;
        }
      }
      cctx.putImageData(cid, 0, 0);
    }

    function extractSubImage(sx, sy, sw, sh, factor = 3) {
      const dw = Math.round(sw / factor);
      const dh = Math.round(sh / factor);
      const c = document.createElement('canvas');
      c.width = dw;
      c.height = dh;
      const cctx = c.getContext('2d');
      cctx.imageSmoothingEnabled = false;
      cctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, dw, dh);
      return c;
    }

    function getPixelsFromCanvas(c) {
      const cctx = c.getContext('2d');
      const id = cctx.getImageData(0, 0, c.width, c.height).data;
      const px = [];
      for (let i = 0; i < id.length; i += 4) {
        if (id[i+3] > 0) px.push([id[i], id[i+1], id[i+2]]);
      }
      return px;
    }

    function extractRegionComponents(rx, ry, rw, rh) {
      const visited = new Uint8Array(rw * rh);
      const comps = [];
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = ((ry + y) * W + (rx + x)) * 4;
          if (d[idx + 3] >= 128 && !visited[y * rw + x]) {
            const q = [[x, y]];
            visited[y * rw + x] = 1;
            const pixels = [];
            let minX = x, maxX = x, minY = y, maxY = y;
            while (q.length > 0) {
              const [cx, cy] = q.pop();
              pixels.push([cx, cy]);
              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = cx + dx, ny = cy + dy;
                  if (nx >= 0 && nx < rw && ny >= 0 && ny < rh) {
                    if (!visited[ny * rw + nx]) {
                      const nIdx = ((ry + ny) * W + (rx + nx)) * 4;
                      if (d[nIdx + 3] >= 128) {
                        visited[ny * rw + nx] = 1;
                        q.push([nx, ny]);
                      }
                    }
                  }
                }
              }
            }
            comps.push({
              pixels,
              pixelCount: pixels.length,
              bbox: [rx + minX, ry + minY, maxX - minX + 1, maxY - minY + 1]
            });
          }
        }
      }
      comps.sort((a, b) => b.pixelCount - a.pixelCount);
      return comps;
    }

    // ==========================================
    // SEPARATE EFFECTS
    // ==========================================

    // 1. ChatGPT Sparkles
    const chatgptSparkles = [
      extractSubImage(153, 67, 18, 18, 3),
      extractSubImage(37, 68, 16, 16, 3),
      extractSubImage(135, 159, 15, 15, 3)
    ];

    // 2. Claude FX (orange sparks):
    // From F3: spark cluster at (476, 255, 38, 38)
    // From F6: spark cluster at (896, 272, 14, 14)
    const claudeFx = [
      extractSubImage(475, 255, 38, 38, 3),
      extractSubImage(896, 272, 14, 14, 3)
    ];

    // 3. Gemini Sparkles (loose star particles):
    const geminiSparkles = [
      extractSubImage(18, 518, 26, 28, 3),
      extractSubImage(144, 544, 15, 24, 3)
    ];

    // 4. Gemini Thruster Flames (3 frames)
    const geminiFlamesRaw = [
      extractSubImage(78, 602, 60, 51, 3),
      extractSubImage(285, 602, 63, 51, 3),
      extractSubImage(442, 600, 63, 51, 3)
    ];
    const geminiFlames = geminiFlamesRaw.map(fr => {
      const fc = document.createElement('canvas');
      fc.width = 24;
      fc.height = 18;
      const fctx = fc.getContext('2d');
      fctx.imageSmoothingEnabled = false;
      const ox = Math.round((24 - fr.width) / 2);
      fctx.drawImage(fr, ox, 0);
      return fc;
    });

    // ==========================================
    // RENDER CHARACTER BODY FRAMES (CLEANED)
    // ==========================================

    // --- A. CLAUDE (Row 2, 6 frames) ---
    // Uniform canvas: 48 x 64 art px.
    // Ground line at native canvas y = 61, center at x = 24.
    const claudeSpecs = [
      { rx: 28,  ry: 240, rw: 126, rh: 182, cx: 104, gy: 417 },
      { rx: 204, ry: 240, rw: 118, rh: 182, cx: 280, gy: 419 },
      { rx: 368, ry: 240, rw: 132, rh: 182, cx: 459, gy: 419, excludeSparks: true },
      { rx: 544, ry: 240, rw: 122, rh: 182, cx: 598, gy: 418 },
      { rx: 701, ry: 240, rw: 132, rh: 182, cx: 793, gy: 420 },
      { rx: 860, ry: 240, rw: 132, rh: 182, cx: 931, gy: 420, excludeBrokenAntennaFX: true }
    ];

    const claudeFramesRaw = claudeSpecs.map(spec => {
      const fc = document.createElement('canvas');
      fc.width = 48;
      fc.height = 64;
      const fctx = fc.getContext('2d');
      fctx.imageSmoothingEnabled = false;

      const tempC = document.createElement('canvas');
      tempC.width = spec.rw;
      tempC.height = spec.rh;
      const tempCtx = tempC.getContext('2d');
      tempCtx.drawImage(canvas, spec.rx, spec.ry, spec.rw, spec.rh, 0, 0, spec.rw, spec.rh);

      const tid = tempCtx.getImageData(0, 0, spec.rw, spec.rh);
      const td = tid.data;

      // In F3: remove spark marks at x > 105, y < 50
      if (spec.excludeSparks) {
        for (let y = 0; y < 50; y++) {
          for (let x = 105; x < spec.rw; x++) {
            td[(y * spec.rw + x) * 4 + 3] = 0;
          }
        }
      }
      // In F6: remove burst mark above antenna at x between 30 and 50, y < 45
      if (spec.excludeBrokenAntennaFX) {
        for (let y = 0; y < 45; y++) {
          for (let x = 30; x < 50; x++) {
            td[(y * spec.rw + x) * 4 + 3] = 0;
          }
        }
      }
      tempCtx.putImageData(tid, 0, 0);

      const dw = Math.round(spec.rw / 3);
      const dh = Math.round(spec.rh / 3);
      const subC = document.createElement('canvas');
      subC.width = dw;
      subC.height = dh;
      const sctx = subC.getContext('2d');
      sctx.imageSmoothingEnabled = false;
      sctx.drawImage(tempC, 0, 0, spec.rw, spec.rh, 0, 0, dw, dh);

      const subCx = Math.round((spec.cx - spec.rx) / 3);
      const subGy = Math.round((spec.gy - spec.ry) / 3);
      const targetX = 24 - subCx;
      const targetY = 61 - subGy;

      fctx.drawImage(subC, targetX, targetY);
      return fc;
    });

    // --- B. CHATGPT (Row 1, 6 frames) ---
    // Uniform canvas: 48 x 56 art px.
    // Base pivot at (x = 24, y = 52).
    // Sparkles and bottom oval base shadow removed!
    const chatgptSpecs = [
      { rx: 32,  ry: 38, rw: 145, rh: 150, cx: 92,  by: 187 },
      { rx: 201, ry: 38, rw: 141, rh: 150, cx: 269, by: 187 },
      { rx: 376, ry: 38, rw: 139, rh: 150, cx: 426, by: 187 },
      { rx: 540, ry: 38, rw: 133, rh: 150, cx: 593, by: 187 },
      { rx: 697, ry: 38, rw: 138, rh: 150, cx: 751, by: 187 },
      { rx: 862, ry: 38, rw: 139, rh: 150, cx: 918, by: 187 }
    ];

    const chatgptFramesRaw = chatgptSpecs.map(spec => {
      const fc = document.createElement('canvas');
      fc.width = 48;
      fc.height = 56;
      const fctx = fc.getContext('2d');
      fctx.imageSmoothingEnabled = false;

      const comps = extractRegionComponents(spec.rx, spec.ry, spec.rw, spec.rh);
      const bodyComp = comps[0];

      const tempC = document.createElement('canvas');
      tempC.width = spec.rw;
      tempC.height = spec.rh;
      const tempCtx = tempC.getContext('2d');
      const tid = tempCtx.createImageData(spec.rw, spec.rh);
      const td = tid.data;

      for (const [lx, ly] of bodyComp.pixels) {
        const srcIdx = ((spec.ry + ly) * W + (spec.rx + lx)) * 4;
        const dstIdx = (ly * spec.rw + lx) * 4;
        td[dstIdx]   = d[srcIdx];
        td[dstIdx+1] = d[srcIdx+1];
        td[dstIdx+2] = d[srcIdx+2];
        td[dstIdx+3] = d[srcIdx+3];
      }
      tempCtx.putImageData(tid, 0, 0);

      const dw = Math.round(spec.rw / 3);
      const dh = Math.round(spec.rh / 3);
      const subC = document.createElement('canvas');
      subC.width = dw;
      subC.height = dh;
      const sctx = subC.getContext('2d');
      sctx.imageSmoothingEnabled = false;
      sctx.drawImage(tempC, 0, 0, spec.rw, spec.rh, 0, 0, dw, dh);

      const subCx = Math.round((spec.cx - spec.rx) / 3);
      const subBy = Math.round((spec.by - spec.ry) / 3);
      const targetX = 24 - subCx;
      const targetY = 52 - subBy;

      fctx.drawImage(subC, targetX, targetY);
      return fc;
    });

    // --- C. GEMINI (Row 3, 5 frames) ---
    // Uniform canvas: 72 x 56 art px.
    // Nozzle pivot at (x = 36, y = 52).
    const geminiSpecs = [
      { rx: 25,  ry: 454, rw: 145, rh: 148, cx: 93,  ny: 602 },
      { rx: 188, ry: 454, rw: 178, rh: 148, cx: 303, ny: 602 },
      { rx: 395, ry: 454, rw: 180, rh: 148, cx: 462, ny: 600 },
      { rx: 610, ry: 452, rw: 215, rh: 151, cx: 708, ny: 603 },
      { rx: 865, ry: 454, rw: 155, rh: 150, cx: 925, ny: 603 }
    ];

    const geminiFramesRaw = geminiSpecs.map(spec => {
      const fc = document.createElement('canvas');
      fc.width = 72;
      fc.height = 56;
      const fctx = fc.getContext('2d');
      fctx.imageSmoothingEnabled = false;

      const comps = extractRegionComponents(spec.rx, spec.ry, spec.rw, spec.rh);
      const compsToKeep = comps.filter(c => c.pixelCount > 400);

      const tempC = document.createElement('canvas');
      tempC.width = spec.rw;
      tempC.height = spec.rh;
      const tempCtx = tempC.getContext('2d');
      const tid = tempCtx.createImageData(spec.rw, spec.rh);
      const td = tid.data;

      for (const comp of compsToKeep) {
        for (const [lx, ly] of comp.pixels) {
          const srcIdx = ((spec.ry + ly) * W + (spec.rx + lx)) * 4;
          const dstIdx = (ly * spec.rw + lx) * 4;
          td[dstIdx]   = d[srcIdx];
          td[dstIdx+1] = d[srcIdx+1];
          td[dstIdx+2] = d[srcIdx+2];
          td[dstIdx+3] = d[srcIdx+3];
        }
      }
      tempCtx.putImageData(tid, 0, 0);

      const dw = Math.round(spec.rw / 3);
      const dh = Math.round(spec.rh / 3);
      const subC = document.createElement('canvas');
      subC.width = dw;
      subC.height = dh;
      const sctx = subC.getContext('2d');
      sctx.imageSmoothingEnabled = false;
      sctx.drawImage(tempC, 0, 0, spec.rw, spec.rh, 0, 0, dw, dh);

      const subCx = Math.round((spec.cx - spec.rx) / 3);
      const subNy = Math.round((spec.ny - spec.ry) / 3);
      const targetX = 36 - subCx;
      const targetY = 52 - subNy;

      fctx.drawImage(subC, targetX, targetY);
      return fc;
    });

    // ==========================================
    // PALETTE QUANTIZATION (<= 16 COLORS)
    // ==========================================
    const gatherPixels = (frames) => {
      const allPx = [];
      frames.forEach(f => allPx.push(...getPixelsFromCanvas(f)));
      return allPx;
    };

    // 1. Claude palette
    const claudeCenters = quantizePalette(gatherPixels(claudeFramesRaw), 15);
    claudeFramesRaw.forEach(f => applyPalette(f, claudeCenters));
    claudeFx.forEach(f => applyPalette(f, claudeCenters));

    // 2. ChatGPT palette
    const chatgptCenters = quantizePalette(gatherPixels(chatgptFramesRaw), 14);
    chatgptFramesRaw.forEach(f => applyPalette(f, chatgptCenters));
    chatgptSparkles.forEach(f => applyPalette(f, chatgptCenters));

    // 3. Gemini palette
    const geminiPixels = gatherPixels(geminiFramesRaw);
    geminiFlames.forEach(f => geminiPixels.push(...getPixelsFromCanvas(f)));
    geminiSparkles.forEach(f => geminiPixels.push(...getPixelsFromCanvas(f)));
    const geminiCenters = quantizePalette(geminiPixels, 15);
    geminiFramesRaw.forEach(f => applyPalette(f, geminiCenters));
    geminiFlames.forEach(f => applyPalette(f, geminiCenters));
    geminiSparkles.forEach(f => applyPalette(f, geminiCenters));

    const toHex = centers => centers.map(([r,g,b]) => '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join(''));

    // ==========================================
    // RENDER 8x CONTACT SHEETS WITH PIVOT LINES
    // ==========================================
    function createContactSheet(bgColor) {
      const pad = 16;
      const scale = 8;

      const row1W = 6 * (48 * scale + pad);
      const row2W = 6 * (48 * scale + pad);
      const row3W = 5 * (72 * scale + pad) + 3 * (24 * scale + pad);

      const totalW = Math.max(row1W, row2W, row3W) + pad * 2;
      const totalH = (56 * scale + pad) + (64 * scale + pad) + (56 * scale + pad) + pad * 3;

      const cs = document.createElement('canvas');
      cs.width = totalW;
      cs.height = totalH;
      const csctx = cs.getContext('2d');
      csctx.imageSmoothingEnabled = false;

      csctx.fillStyle = bgColor;
      csctx.fillRect(0, 0, totalW, totalH);

      csctx.font = 'bold 13px monospace';
      csctx.fillStyle = (bgColor === '#ffffff') ? '#111111' : '#f0f6fc';

      let curY = pad;

      // Row 1: ChatGPT
      csctx.fillText('ChatGPT Mascot (Row 1, 6 Frames @ 48x56 native, pivot at base y=52)', pad, curY + 12);
      curY += 20;
      chatgptFramesRaw.forEach((f, idx) => {
        const x = pad + idx * (48 * scale + pad);
        csctx.drawImage(f, x, curY, 48 * scale, 56 * scale);

        // Red pivot line at y = 52
        csctx.strokeStyle = '#ff2244';
        csctx.lineWidth = 2;
        csctx.beginPath();
        csctx.moveTo(x, curY + 52 * scale);
        csctx.lineTo(x + 48 * scale, curY + 52 * scale);
        csctx.stroke();

        csctx.beginPath();
        csctx.moveTo(x + 24 * scale, curY + 49 * scale);
        csctx.lineTo(x + 24 * scale, curY + 55 * scale);
        csctx.stroke();
      });

      curY += 56 * scale + pad;

      // Row 2: Claude
      csctx.fillText('Claude Mascot (Row 2, 6 Frames @ 48x64 native, pivot at ground y=61)', pad, curY + 12);
      curY += 20;
      claudeFramesRaw.forEach((f, idx) => {
        const x = pad + idx * (48 * scale + pad);
        csctx.drawImage(f, x, curY, 48 * scale, 64 * scale);

        // Red ground line at y = 61
        csctx.strokeStyle = '#ff2244';
        csctx.lineWidth = 2;
        csctx.beginPath();
        csctx.moveTo(x, curY + 61 * scale);
        csctx.lineTo(x + 48 * scale, curY + 61 * scale);
        csctx.stroke();

        csctx.beginPath();
        csctx.moveTo(x + 24 * scale, curY + 58 * scale);
        csctx.lineTo(x + 24 * scale, curY + 63 * scale);
        csctx.stroke();
      });

      curY += 64 * scale + pad;

      // Row 3: Gemini
      csctx.fillText('Gemini Companion (Row 3, 5 Frames @ 72x56 native, nozzle pivot at y=52) + 3 Thruster Flames', pad, curY + 12);
      curY += 20;
      geminiFramesRaw.forEach((f, idx) => {
        const x = pad + idx * (72 * scale + pad);
        csctx.drawImage(f, x, curY, 72 * scale, 56 * scale);

        // Red nozzle line at y = 52
        csctx.strokeStyle = '#ff2244';
        csctx.lineWidth = 2;
        csctx.beginPath();
        csctx.moveTo(x, curY + 52 * scale);
        csctx.lineTo(x + 72 * scale, curY + 52 * scale);
        csctx.stroke();

        csctx.beginPath();
        csctx.moveTo(x + 36 * scale, curY + 49 * scale);
        csctx.lineTo(x + 36 * scale, curY + 55 * scale);
        csctx.stroke();
      });

      // Gemini flames
      const flameStartX = pad + 5 * (72 * scale + pad);
      geminiFlames.forEach((fl, idx) => {
        const x = flameStartX + idx * (24 * scale + pad);
        csctx.drawImage(fl, x, curY + (52 - 18) * scale, 24 * scale, 18 * scale);
        csctx.strokeStyle = '#ffaa00';
        csctx.strokeRect(x, curY + (52 - 18) * scale, 24 * scale, 18 * scale);
      });

      return cs.toDataURL('image/png');
    }

    const exportCanvas = c => c.toDataURL('image/png');

    return {
      chatgptPalette: toHex(chatgptCenters),
      claudePalette: toHex(claudeCenters),
      geminiPalette: toHex(geminiCenters),
      chatgptFrames: chatgptFramesRaw.map(exportCanvas),
      claudeFrames: claudeFramesRaw.map(exportCanvas),
      geminiFrames: geminiFramesRaw.map(exportCanvas),
      chatgptSparkles: chatgptSparkles.map(exportCanvas),
      claudeFx: claudeFx.map(exportCanvas),
      geminiSparkles: geminiSparkles.map(exportCanvas),
      geminiFlames: geminiFlames.map(exportCanvas),
      contactDark: createContactSheet('#0d1117'),
      contactLight: createContactSheet('#ffffff')
    };
  }, dataUrl);

  function saveB64(dataUrl, destPath) {
    const raw = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(destPath, Buffer.from(raw, 'base64'));
    console.log(`Saved: ${destPath}`);
  }

  // 1. ChatGPT Frames
  result.chatgptFrames.forEach((d, i) => saveB64(d, `assets/chatgpt-${i+1}.png`));
  result.chatgptSparkles.forEach((d, i) => saveB64(d, `assets/chatgpt-sparkle-${i+1}.png`));

  // 2. Claude Frames
  result.claudeFrames.forEach((d, i) => saveB64(d, `assets/claude-${i+1}.png`));
  result.claudeFx.forEach((d, i) => saveB64(d, `assets/claude-fx-${i+1}.png`));

  // 3. Gemini Frames
  result.geminiFrames.forEach((d, i) => saveB64(d, `assets/gemini-${i+1}.png`));
  result.geminiFlames.forEach((d, i) => saveB64(d, `assets/gemini-flame-${i+1}.png`));
  result.geminiSparkles.forEach((d, i) => saveB64(d, `assets/gemini-sparkle-${i+1}.png`));

  // 4. Contact Sheets
  saveB64(result.contactDark, 'tools/contact_sheet_dark_8x.png');
  saveB64(result.contactLight, 'tools/contact_sheet_light_8x.png');
  saveB64(result.contactDark, path.join(ARTIFACT_DIR, 'contact_sheet_dark_8x.png'));
  saveB64(result.contactLight, path.join(ARTIFACT_DIR, 'contact_sheet_light_8x.png'));

  console.log('\n=== PALETTE SUMMARY ===');
  console.log(`ChatGPT Palette (${result.chatgptPalette.length} colors):`, result.chatgptPalette);
  console.log(`Claude Palette (${result.claudePalette.length} colors):`, result.claudePalette);
  console.log(`Gemini Palette (${result.geminiPalette.length} colors):`, result.geminiPalette);

  await browser.close();
  return result;
}

if (require.main === module) {
  processSheet().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { processSheet };
