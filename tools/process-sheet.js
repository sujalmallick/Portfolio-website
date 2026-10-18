/**
 * tools/process-sheet.js
 * 
 * Master Pipeline to convert high-res Canva sheet into clean pixel-art SVG symbols.
 * Features:
 * - Decodes transparent source PNG from assets/source/terminal-sheet-transparent.png.
 * - Detects each sprite with small alpha dilation (Rule 1).
 * - Separates loose effects (?, !, Zz, dust puffs) into standalone effect symbols (Rule 2).
 * - Native grid: 38 cols x 42 rows (cell = 2 screen px), 16-color quantized palette (Rule 3).
 * - Uniform world scale across all frames.
 * - Despeckle pass to suppress isolated 1-cell noise (Rule 3).
 * - Thickened continuous limb reconstruction (>= 3 cells wide) & vertical connectivity bridge (Rule 4).
 * - Solid foot pads grounded at feet baseline row 40 (Rule 4 & 5).
 * - Single common pivot (centerCol = 19, baselineRow = 40) (Rule 5).
 * - Crisp legible CRT monitor expressions & retro terminal typography.
 * - 2D greedy rectangle run merging to keep SVG file size under 200 KB (Rule 6).
 * - Generates assets/terminal-sprite.svg with <symbol> tags only (no <image>, <mask<, <filter>).
 * - Generates 8x scale contact sheets for checkpoint review (Rule 6 & Checkpoint).
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ARTIFACT_DIR = 'C:/Users/sujal/.gemini/antigravity/brain/c7f937bb-b9aa-4f4f-abf4-2a391a60f104';
const TRANSPARENT_PNG = path.join(__dirname, '..', 'assets', 'source', 'terminal-sheet-transparent.png');
const OUTPUT_SVG = path.join(__dirname, '..', 'assets', 'terminal-sprite.svg');

const GRID_COLS = 38;
const GRID_ROWS = 42;
const BASELINE_ROW = 40;
const CENTER_COL = 19;

async function processSheet() {
  console.log('=== Running Master process-sheet.js Pipeline ===');

  if (!fs.existsSync(TRANSPARENT_PNG)) {
    throw new Error(`Source transparent sheet not found at ${TRANSPARENT_PNG}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const buf = fs.readFileSync(TRANSPARENT_PNG);
  const b64 = buf.toString('base64');

  const result = await page.evaluate(async ({ b64, gridCols, gridRows, baselineRow, centerCol }) => {
    function load(src) {
      return new Promise(r => { const img = new Image(); img.onload = () => r(img); img.src = src; });
    }
    const sheetImg = await load('data:image/png;base64,' + b64);
    const W = sheetImg.naturalWidth;
    const H = sheetImg.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sheetImg, 0, 0);
    const sData = ctx.getImageData(0, 0, W, H).data;

    // Cleaned 16-color authentic pixel palette
    const PALETTE = [
      [26, 24, 27],     // 0: #1A181B Dark Outline & Sole
      [42, 39, 44],     // 1: #2A272C Dark Shadow
      [245, 242, 235],  // 2: #F5F2EB Cream Body Base
      [227, 222, 195],  // 3: #E3DEC3 Cream Midtone
      [208, 202, 174],  // 4: #D0CAAE Cream Shadow
      [179, 172, 143],  // 5: #B3AC8F Cream Deep Shadow
      [0, 255, 102],    // 6: #00FF66 Green Bright CRT Visor Graphics
      [0, 200, 75],     // 7: #00C84B Green Mid CRT
      [11, 32, 20],     // 8: #0B2014 CRT Visor Glass
      [5, 18, 11],      // 9: #05120B CRT Visor Bezel
      [107, 114, 128],  // 10: #6B7280 Metal Joint Light
      [60, 68, 80],     // 11: #3C4450 Metal Joint Mid
      [245, 158, 11],   // 12: #F59E0B Accent Amber Dial
      [217, 119, 6],    // 13: #D97706 Accent Amber Shadow
      [56, 189, 248],   // 14: #38BDF8 Dust Cyan
      [255, 255, 255]   // 15: #FFFFFF Specular Glint
    ];

    function rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    const PALETTE_HEX = PALETTE.map(p => rgbToHex(p[0], p[1], p[2]));

    function findClosestColor(r, g, b) {
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let i = 0; i < PALETTE.length; i++) {
        const p = PALETTE[i];
        const dr = (r - p[0]) * 0.30;
        const dg = (g - p[1]) * 0.59;
        const db = (b - p[2]) * 0.11;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    // Step 1: Detect sprite with small alpha dilation (Rule 1)
    function extractComponentWithDilation(minX, maxX, minY, maxY, rad = 2) {
      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      const alphaMask = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (sData[((minY + y) * W + (minX + x)) * 4 + 3] > 25) {
            alphaMask[y * w + x] = 1;
          }
        }
      }

      const dilated = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (alphaMask[y * w + x]) {
            for (let dy = -rad; dy <= rad; dy++) {
              for (let dx = -rad; dx <= rad; dx++) {
                const ny = y + dy, nx = x + dx;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                  dilated[ny * w + nx] = 1;
                }
              }
            }
          }
        }
      }

      const visited = new Uint8Array(w * h);
      const comps = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (visited[y * w + x] || !dilated[y * w + x]) continue;
          const q = [[x, y]];
          visited[y * w + x] = 1;
          let cMinX = x, cMaxX = x, cMinY = y, cMaxY = y, count = 0;
          const compPixels = [];
          while (q.length > 0) {
            const [cx, cy] = q.pop();
            count++;
            if (cx < cMinX) cMinX = cx;
            if (cx > cMaxX) cMaxX = cx;
            if (cy < cMinY) cMinY = cy;
            if (cy > cMaxY) cMaxY = cy;
            if (alphaMask[cy * w + cx]) {
              compPixels.push([minX + cx, minY + cy]);
            }
            for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
              const nx = cx + dx, ny = cy + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx] && dilated[ny * w + nx]) {
                visited[ny * w + nx] = 1;
                q.push([nx, ny]);
              }
            }
          }
          comps.push({
            minX: minX + cMinX,
            maxX: minX + cMaxX,
            minY: minY + cMinY,
            maxY: minY + cMaxY,
            pixels: compPixels,
            count
          });
        }
      }
      comps.sort((a, b) => b.count - a.count);
      return comps;
    }

    // Sprite definitions
    const row0Blocks = [
      { id: 'terminal-idle-1', minX: 27, maxX: 143, minY: 87, maxY: 254 },
      { id: 'terminal-idle-2', minX: 164, maxX: 288, minY: 89, maxY: 254 },
      { id: 'terminal-idle-3', minX: 306, maxX: 427, minY: 90, maxY: 254 },
      { id: 'terminal-idle-4', minX: 443, maxX: 561, minY: 90, maxY: 254 },
      { id: 'terminal-idle-5', minX: 575, maxX: 692, minY: 90, maxY: 254 },
      { id: 'terminal-walk-1', minX: 763, maxX: 878, minY: 90, maxY: 254, isWalk: true },
      { id: 'terminal-walk-2', minX: 891, maxX: 1001, minY: 90, maxY: 254, isWalk: true },
      { id: 'terminal-walk-3', minX: 1022, maxX: 1136, minY: 90, maxY: 254, isWalk: true },
      { id: 'terminal-walk-4', minX: 1154, maxX: 1264, minY: 92, maxY: 254, isWalk: true },
      { id: 'terminal-walk-5', minX: 1280, maxX: 1394, minY: 90, maxY: 254, isWalk: true },
      { id: 'terminal-walk-6', minX: 1416, maxX: 1522, minY: 90, maxY: 254, isWalk: true }
    ];

    const row1Blocks = [
      { id: 'terminal-turn-1', minX: 29, maxX: 142, minY: 294, maxY: 451, isTurn: true },
      { id: 'terminal-turn-2', minX: 164, maxX: 277, minY: 292, maxY: 449, isTurn: true },
      { id: 'terminal-turn-3', minX: 312, maxX: 418, minY: 295, maxY: 449, isTurn: true },
      { id: 'terminal-turn-4', minX: 450, maxX: 561, minY: 291, maxY: 449, isTurn: true },
      { id: 'terminal-turn-5', minX: 594, maxX: 703, minY: 295, maxY: 450, isTurn: true },
      { id: 'terminal-type-1', minX: 759, maxX: 925, minY: 304, maxY: 450, isType: true, step: '>_' },
      { id: 'terminal-type-2', minX: 947, maxX: 1120, minY: 306, maxY: 450, isType: true, step: 'npm i' },
      { id: 'terminal-type-3', minX: 1138, maxX: 1312, minY: 302, maxY: 450, isType: true, step: 'build' },
      { id: 'terminal-type-4', minX: 1331, maxX: 1509, minY: 306, maxY: 450, isType: true, step: 'done' }
    ];

    const row2Blocks = [
      { id: 'terminal-celebrate-1', minX: 29, maxX: 166, minY: 490, maxY: 675, isCelebrate: true },
      { id: 'terminal-celebrate-2', minX: 168, maxX: 305, minY: 490, maxY: 675, isCelebrate: true },
      { id: 'terminal-celebrate-3', minX: 332, maxX: 491, minY: 490, maxY: 675, isCelebrate: true },
      { id: 'terminal-curious-1', minX: 561, maxX: 666, minY: 530, maxY: 672 },
      { id: 'terminal-curious-2', minX: 698, maxX: 816, minY: 495, maxY: 672 },
      { id: 'terminal-curious-3', minX: 829, maxX: 932, minY: 490, maxY: 672 },
      { id: 'terminal-curious-4', minX: 979, maxX: 1077, minY: 528, maxY: 672 },
      { id: 'terminal-curious-5', minX: 1121, maxX: 1233, minY: 518, maxY: 666 },
      { id: 'terminal-curious-6', minX: 1251, maxX: 1373, minY: 505, maxY: 672 },
      { id: 'terminal-curious-7', minX: 1397, maxX: 1523, minY: 490, maxY: 672 }
    ];

    const row3Blocks = [
      { id: 'terminal-idle-var-1', minX: 25, maxX: 132, minY: 708, maxY: 858 },
      { id: 'terminal-idle-var-2', minX: 142, maxX: 248, minY: 708, maxY: 858 },
      { id: 'terminal-idle-var-3', minX: 255, maxX: 358, minY: 712, maxY: 858 },
      { id: 'terminal-idle-var-4', minX: 370, maxX: 478, minY: 712, maxY: 858 },
      { id: 'terminal-idle-var-5', minX: 490, maxX: 597, minY: 708, maxY: 858 },
      { id: 'terminal-run-1', minX: 628, maxX: 710, minY: 705, maxY: 850, isRun: true },
      { id: 'terminal-run-2', minX: 723, maxX: 817, minY: 702, maxY: 851, isRun: true },
      { id: 'terminal-run-3', minX: 827, maxX: 928, minY: 705, maxY: 851, isRun: true },
      { id: 'terminal-run-4', minX: 932, maxX: 1034, minY: 705, maxY: 851, isRun: true },
      { id: 'terminal-sleep-1', minX: 1071, maxX: 1217, minY: 708, maxY: 865, isSleep: true },
      { id: 'terminal-sleep-2', minX: 1218, maxX: 1359, minY: 708, maxY: 865, isSleep: true },
      { id: 'terminal-sleep-3', minX: 1360, maxX: 1521, minY: 708, maxY: 865, isSleep: true }
    ];

    const row4Blocks = [
      { id: 'face-1', minX: 22, maxX: 149, minY: 892, maxY: 985, isFace: true, faceType: 'smile' },
      { id: 'face-2', minX: 160, maxX: 297, minY: 892, maxY: 985, isFace: true, faceType: 'prompt' },
      { id: 'face-3', minX: 308, maxX: 447, minY: 892, maxY: 985, isFace: true, faceType: 'npm' },
      { id: 'face-4', minX: 460, maxX: 630, minY: 892, maxY: 985, isFace: true, faceType: 'build' },
      { id: 'face-5', minX: 643, maxX: 800, minY: 892, maxY: 985, isFace: true, faceType: 'done' },
      { id: 'face-6', minX: 813, maxX: 961, minY: 892, maxY: 985, isFace: true, faceType: 'error' },
      { id: 'face-7', minX: 973, maxX: 1110, minY: 892, maxY: 985, isFace: true, faceType: 'surprised' },
      { id: 'face-8', minX: 1124, maxX: 1306, minY: 892, maxY: 985, isFace: true, faceType: 'heart' },
      { id: 'face-9', minX: 1322, maxX: 1508, minY: 892, maxY: 985, isFace: true, faceType: 'sleep' }
    ];

    const allBlocks = [...row0Blocks, ...row1Blocks, ...row2Blocks, ...row3Blocks, ...row4Blocks];
    const repairedLimbFrames = [];
    const frameGrids = {};

    // UNIFORM WORLD SCALE: 165 source px = 38 grid rows
    const SCALE = 165 / 38;

    for (const block of allBlocks) {
      if (block.isFace) {
        // Face monitor casing
        const grid = Array.from({ length: gridRows }, () => new Int16Array(gridCols).fill(-1));
        const fTop = 10, fBottom = 32, fLeft = 2, fRight = 35;
        for (let y = fTop; y <= fBottom; y++) {
          for (let x = fLeft; x <= fRight; x++) {
            if (y === fTop || y === fBottom || x === fLeft || x === fRight) grid[y][x] = 0;
            else if (y === fTop + 1 || y === fBottom - 1 || x === fLeft + 1 || x === fRight - 1) grid[y][x] = 2;
            else if (y === fTop + 2 || y === fBottom - 2 || x === fLeft + 2 || x === fRight - 2) grid[y][x] = 9;
            else grid[y][x] = 8;
          }
        }

        function drawG(gx, gy, matrix, cIdx = 6) {
          for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
              if (matrix[r][c] === 1) {
                const px = gx + c, py = gy + r;
                if (px >= 0 && px < gridCols && py >= 0 && py < gridRows) grid[py][px] = cIdx;
              }
            }
          }
        }

        if (block.faceType === 'smile') {
          drawG(11, 18, [[1,1,0],[1,0,1]]);
          drawG(24, 18, [[0,1,1],[1,0,1]]);
          drawG(16, 23, [[1,0,0,0,0,1],[0,1,1,1,1,0]]);
        } else if (block.faceType === 'prompt') {
          drawG(12, 19, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
          drawG(18, 23, [[1,1,1,1]]);
        } else if (block.faceType === 'npm') {
          drawG(7, 19, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
          drawG(12, 19, [[1,1,1],[1,0,1],[1,0,1]]);
          drawG(17, 19, [[1,1,1],[1,0,1],[1,1,1],[1,0,0]]);
          drawG(22, 19, [[1,0,1,0,1],[1,1,1,1,1],[1,0,1,0,1]]);
          drawG(29, 18, [[1],[0],[1],[1],[1]]);
        } else if (block.faceType === 'build') {
          drawG(6, 17, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
          drawG(11, 17, [[1,1,0],[1,0,1],[1,1,0]]);
          drawG(15, 17, [[1,0,1],[1,0,1],[0,1,1]]);
          drawG(19, 17, [[1],[1],[1]]);
          drawG(22, 17, [[1,0],[1,0],[1,1]]);
          drawG(25, 17, [[0,1,1],[1,0,1],[0,1,1]]);
          for (let x = 7; x <= 30; x++) { grid[24][x] = 7; grid[26][x] = 7; }
          grid[25][7] = 7; grid[25][30] = 7;
          for (let x = 9; x <= 23; x++) grid[25][x] = 6;
        } else if (block.faceType === 'done') {
          drawG(8, 19, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
          drawG(13, 19, [[0,1,1],[1,0,1],[0,1,1]]);
          drawG(18, 19, [[1,1,1],[1,0,1],[1,1,1]]);
          drawG(23, 19, [[1,1,1],[1,0,1],[1,0,1]]);
          drawG(29, 18, [[0,0,1],[0,1,0],[1,0,0],[0,1,0],[0,0,1]]);
        } else if (block.faceType === 'error') {
          drawG(8, 19, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]], 13);
          drawG(13, 19, [[1,1,1],[1,1,0],[1,1,1]], 13);
          drawG(18, 19, [[1,1,0],[1,0,0],[1,0,0]], 13);
          drawG(22, 19, [[1,1,0],[1,0,0],[1,0,0]], 13);
          drawG(26, 19, [[1,1,1],[1,0,1],[1,1,1]], 13);
          drawG(31, 18, [[1],[1],[1],[0],[1]], 13);
        } else if (block.faceType === 'surprised') {
          drawG(11, 18, [[1,1,1],[1,0,1],[1,0,1],[1,1,1]]);
          drawG(18, 22, [[1,1]]);
          drawG(23, 18, [[1,1,1],[1,0,1],[1,0,1],[1,1,1]]);
        } else if (block.faceType === 'heart') {
          drawG(15, 18, [
            [0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0],
            [0,0,0,1,0,0,0]
          ]);
        } else if (block.faceType === 'sleep') {
          drawG(13, 18, [[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,1,1,1]]);
          drawG(19, 20, [[1,1,1],[0,1,0],[1,1,1]]);
          drawG(24, 23, [[1,1,1]]);
        }

        frameGrids[block.id] = grid;
        continue;
      }

      // Character extraction using small alpha dilation
      const comps = extractComponentWithDilation(block.minX, block.maxX, block.minY, block.maxY, 2);
      const charComp = comps[0];
      const cMinX = charComp.minX, cMaxX = charComp.maxX, cMinY = charComp.minY, cMaxY = charComp.maxY;
      const charW = cMaxX - cMinX + 1;
      const charH = cMaxY - cMinY + 1;

      const charPixelSet = new Set(charComp.pixels.map(([px, py]) => `${px},${py}`));

      let targetCharH = Math.round(charH / SCALE);
      let targetCharW = Math.round(charW / SCALE);
      if (targetCharH > 38) targetCharH = 38;
      if (targetCharW > 36) targetCharW = 36;

      const dstYStart = baselineRow - targetCharH + 1;
      const dstXStart = Math.max(1, Math.min(gridCols - targetCharW - 1, Math.round(centerCol - targetCharW / 2)));

      const grid = Array.from({ length: gridRows }, () => new Int16Array(gridCols).fill(-1));
      const scaleX = charW / targetCharW;
      const scaleY = charH / targetCharH;

      for (let ty = 0; ty < targetCharH; ty++) {
        const gy = dstYStart + ty;
        if (gy < 0 || gy >= gridRows) continue;

        for (let tx = 0; tx < targetCharW; tx++) {
          const gx = dstXStart + tx;
          if (gx < 0 || gx >= gridCols) continue;

          const srcX0 = cMinX + tx * scaleX;
          const srcX1 = cMinX + (tx + 1) * scaleX;
          const srcY0 = cMinY + ty * scaleY;
          const srcY1 = cMinY + (ty + 1) * scaleY;

          let rSum = 0, gSum = 0, bSum = 0, aSum = 0, weightSum = 0;
          let maxA = 0;
          let maskCount = 0, totalSampleCount = 0;

          const startIX = Math.floor(srcX0);
          const endIX = Math.ceil(srcX1);
          const startIY = Math.floor(srcY0);
          const endIY = Math.ceil(srcY1);

          for (let sy = startIY; sy < endIY; sy++) {
            const overlapY = Math.max(0, Math.min(sy + 1, srcY1) - Math.max(sy, srcY0));
            if (overlapY <= 0) continue;

            for (let sx = startIX; sx < endIX; sx++) {
              const overlapX = Math.max(0, Math.min(sx + 1, srcX1) - Math.max(sx, srcX0));
              if (overlapX <= 0) continue;

              const weight = overlapX * overlapY;
              const sIdx = (sy * W + sx) * 4;
              const a = sData[sIdx + 3];

              totalSampleCount++;
              if (charPixelSet.has(`${sx},${sy}`)) maskCount++;

              if (a > maxA) maxA = a;
              rSum += sData[sIdx] * weight;
              gSum += sData[sIdx + 1] * weight;
              bSum += sData[sIdx + 2] * weight;
              aSum += a * weight;
              weightSum += weight;
            }
          }

          const avgA = weightSum > 0 ? (aSum / weightSum) : 0;
          const isCharPixel = maskCount > 0 && (maskCount / totalSampleCount >= 0.12);

          if (isCharPixel && (avgA >= 35 || (maxA >= 140 && avgA >= 20))) {
            grid[gy][gx] = findClosestColor(rSum / weightSum, gSum / weightSum, bSum / weightSum);
          }
        }
      }

      // Continuous Limb & Thickening Pass (Rule 4)
      let repairedLimb = false;
      if (!block.isSleep) {
        const legStartRow = Math.round(dstYStart + targetCharH * 0.54);

        for (let y = legStartRow; y <= baselineRow; y++) {
          let runs = [];
          let inRun = false, rStart = 0;
          for (let x = 0; x < gridCols; x++) {
            if (grid[y][x] !== -1) {
              if (!inRun) { inRun = true; rStart = x; }
            } else if (inRun) {
              inRun = false;
              runs.push({ x: rStart, len: x - rStart });
            }
          }
          if (inRun) runs.push({ x: rStart, len: gridCols - rStart });

          // Thickening: ensure every leg run is at least 3 cells wide
          for (const run of runs) {
            if (run.len < 3 && run.len > 0) {
              const needed = 3 - run.len;
              let added = 0;
              if (run.x + run.len < gridCols - 1 && grid[y][run.x + run.len] === -1) {
                grid[y][run.x + run.len] = 0;
                added++;
              }
              if (added < needed && run.x > 1 && grid[y][run.x - 1] === -1) {
                grid[y][run.x - 1] = 0;
                added++;
              }
              repairedLimb = true;
            }
          }

          // Vertical continuity bridge
          if (y > legStartRow) {
            let prevRuns = [];
            let pInRun = false, pStart = 0;
            for (let x = 0; x < gridCols; x++) {
              if (grid[y - 1][x] !== -1) {
                if (!pInRun) { pInRun = true; pStart = x; }
              } else if (pInRun) {
                pInRun = false;
                prevRuns.push({ x: pStart, len: x - pStart });
              }
            }
            if (pInRun) prevRuns.push({ x: pStart, len: gridCols - pStart });

            for (const pr of prevRuns) {
              if (pr.len > 12) continue; // Skip torso
              let connected = false;
              for (const cr of runs) {
                if (!(cr.x + cr.len < pr.x || cr.x > pr.x + pr.len)) {
                  connected = true; break;
                }
              }
              if (!connected && y <= baselineRow) {
                const bridgeMid = Math.round(pr.x + pr.len / 2);
                grid[y][bridgeMid - 1] = 0;
                grid[y][bridgeMid] = 11; // metal fill
                grid[y][bridgeMid + 1] = 0;
                repairedLimb = true;
              }
            }
          }
        }

        // Foot grounding at baseline
        if (!block.id.includes('run') && !block.id.includes('celebrate')) {
          let lowestY = legStartRow;
          for (let y = legStartRow; y <= baselineRow; y++) {
            for (let x = 0; x < gridCols; x++) {
              if (grid[y][x] !== -1 && y > lowestY) lowestY = y;
            }
          }
          if (lowestY < baselineRow && lowestY >= baselineRow - 2) {
            for (let x = 0; x < gridCols; x++) {
              if (grid[lowestY][x] !== -1) {
                grid[baselineRow][x] = 0;
                if (lowestY < baselineRow - 1) grid[baselineRow - 1][x] = grid[lowestY][x];
              }
            }
            repairedLimb = true;
          }
          for (let x = 0; x < gridCols - 4; x++) {
            if (grid[baselineRow][x] !== -1 && grid[baselineRow][x + 1] !== -1) {
              grid[baselineRow][x] = 0;
              grid[baselineRow][x + 1] = 0;
              if (x + 2 < gridCols) grid[baselineRow][x + 2] = 0;
              if (x + 3 < gridCols) grid[baselineRow][x + 3] = 0;
            }
          }
        }
      }

      // Despeckle pass to suppress isolated 1-cell noise & consolidate solid blocks
      for (let y = 1; y < gridRows - 1; y++) {
        for (let x = 1; x < gridCols - 1; x++) {
          const c = grid[y][x];
          if (c === -1 || c === 0 || c === 6) continue;
          const neighbors = [grid[y - 1][x], grid[y + 1][x], grid[y][x - 1], grid[y][x + 1]];
          const matchCount = neighbors.filter(v => v === c).length;
          if (matchCount === 0) {
            const valid = neighbors.filter(v => v !== -1 && v !== 0);
            if (valid.length > 0) {
              grid[y][x] = valid[0];
            }
          }
        }
      }

      if (repairedLimb) repairedLimbFrames.push(block.id);

      // CRT Face polish for robot heads
      if (!block.isSleep && !block.isType) {
        let vMinX = gridCols, vMaxX = 0, vMinY = gridRows, vMaxY = 0;
        for (let y = 8; y <= 24; y++) {
          for (let x = 6; x < gridCols - 6; x++) {
            const c = grid[y][x];
            if (c === 6 || c === 7 || c === 8 || c === 9) {
              if (x < vMinX) vMinX = x;
              if (x > vMaxX) vMaxX = x;
              if (y < vMinY) vMinY = y;
              if (y > vMaxY) vMaxY = y;
            }
          }
        }
        if (vMaxX > vMinX && vMaxY > vMinY) {
          for (let y = vMinY + 1; y < vMaxY; y++) {
            for (let x = vMinX + 1; x < vMaxX; x++) {
              const c = grid[y][x];
              if (c === 6 || c === 7) grid[y][x] = 6;
            }
          }
        }
      }

      // Typing monitor text
      if (block.isType) {
        let vMinX = gridCols, vMaxX = 0, vMinY = gridRows, vMaxY = 0;
        for (let y = 10; y <= 22; y++) {
          for (let x = 8; x <= 24; x++) {
            const c = grid[y][x];
            if (c === 8 || c === 9 || c === 6 || c === 7) {
              if (x < vMinX) vMinX = x;
              if (x > vMaxX) vMaxX = x;
              if (y < vMinY) vMinY = y;
              if (y > vMaxY) vMaxY = y;
            }
          }
        }
        if (vMaxX > vMinX && vMaxY > vMinY) {
          for (let y = vMinY; y <= vMaxY; y++) {
            for (let x = vMinX; x <= vMaxX; x++) {
              grid[y][x] = 8;
            }
          }
          function drawVisorG(vx, vy, mat) {
            for (let r = 0; r < mat.length; r++) {
              for (let c = 0; c < mat[r].length; c++) {
                if (mat[r][c] === 1 && vy + r <= vMaxY && vx + c <= vMaxX) {
                  grid[vy + r][vx + c] = 6;
                }
              }
            }
          }
          const cy = Math.round((vMinY + vMaxY) / 2);
          if (block.step === '>_') {
            drawVisorG(vMinX + 2, cy - 2, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
            drawVisorG(vMinX + 7, cy + 2, [[1,1,1]]);
          } else if (block.step === 'npm i') {
            drawVisorG(vMinX + 1, cy - 2, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
            drawVisorG(vMinX + 5, cy - 1, [[1,1],[1,1]]);
            drawVisorG(vMinX + 8, cy - 1, [[1,1],[1,0]]);
            drawVisorG(vMinX + 11, cy - 2, [[1],[1],[1]]);
          } else if (block.step === 'build') {
            drawVisorG(vMinX + 1, cy - 2, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
            drawVisorG(vMinX + 5, cy - 1, [[1,1],[1,1]]);
            for (let px = vMinX + 2; px <= vMaxX - 2; px++) {
              grid[vMaxY - 1][px] = (px <= vMinX + 8) ? 6 : 7;
            }
          } else if (block.step === 'done') {
            drawVisorG(vMinX + 1, cy - 2, [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]]);
            drawVisorG(vMinX + 5, cy - 1, [[1,1],[1,1]]);
            drawVisorG(vMinX + 10, cy - 2, [[0,0,1],[0,1,0],[1,0,0]]);
          }
        }
      }

      frameGrids[block.id] = grid;
    }

    // Standalone Effect symbols (Rule 2)
    function makeEmptyGrid() {
      return Array.from({ length: gridRows }, () => new Int16Array(gridCols).fill(-1));
    }

    const qGrid = makeEmptyGrid();
    const qM = [[1,1,1],[1,0,1],[0,0,1],[0,1,0],[0,1,0],[0,0,0],[0,1,0]];
    for (let r = 0; r < qM.length; r++) {
      for (let c = 0; c < qM[r].length; c++) {
        if (qM[r][c] === 1) qGrid[5 + r][centerCol - 1 + c] = 6;
      }
    }
    frameGrids['fx-question'] = qGrid;

    const exGrid = makeEmptyGrid();
    const exM = [[1,1],[1,1],[1,1],[1,1],[0,1],[0,0],[1,1]];
    for (let r = 0; r < exM.length; r++) {
      for (let c = 0; c < exM[r].length; c++) {
        if (exM[r][c] === 1) exGrid[5 + r][centerCol + c] = 6;
      }
    }
    frameGrids['fx-exclaim'] = exGrid;

    const zGrid = makeEmptyGrid();
    const z1 = [[1,1,1],[0,1,0],[1,1,1]];
    const z2 = [[1,1],[1,0],[1,1]];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (z1[r][c] === 1) zGrid[6 + r][24 + c] = 6;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        if (z2[r][c] === 1) zGrid[11 + r][20 + c] = 7;
      }
    }
    frameGrids['fx-zzz'] = zGrid;

    for (let d = 1; d <= 4; d++) {
      const dGrid = makeEmptyGrid();
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 4 + d; dx++) {
          if ((dx + dy) % 2 === 0 || dx === 2) dGrid[baselineRow - dy][8 + dx] = 14;
        }
      }
      frameGrids[`fx-dust-${d}`] = dGrid;
    }

    return {
      allBlockIds: allBlocks.map(b => b.id),
      repairedLimbFrames,
      frameGrids,
      paletteHex: PALETTE_HEX
    };
  }, {
    b64,
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    baselineRow: BASELINE_ROW,
    centerCol: CENTER_COL
  });

  console.log(`Extracted ${result.allBlockIds.length} blocks.`);
  console.log(`Repaired / thickened limbs in ${result.repairedLimbFrames.length} frames:`, result.repairedLimbFrames);

  // 2D RECTANGLE MERGER to optimize SVG size
  const symbols = [];
  const symbolIds = Object.keys(result.frameGrids);
  let totalRectCount = 0;
  const rectsPerFrame = {};

  for (const id of symbolIds) {
    const grid = result.frameGrids[id];
    const colorPaths = {};
    let frameRects = 0;

    for (let c = 0; c < result.paletteHex.length; c++) {
      const mask = Array.from({ length: GRID_ROWS }, (_, y) =>
        Array.from({ length: GRID_COLS }, (_, x) => grid[y][x] === c)
      );

      let d = '';
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          if (!mask[y][x]) continue;

          let w = 0;
          while (x + w < GRID_COLS && mask[y][x + w]) w++;

          let h = 1;
          while (y + h < GRID_ROWS) {
            let rowMatch = true;
            for (let dx = 0; dx < w; dx++) {
              if (!mask[y + h][x + dx]) { rowMatch = false; break; }
            }
            if (!rowMatch) break;
            h++;
          }

          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              mask[y + dy][x + dx] = false;
            }
          }

          frameRects++;
          totalRectCount++;
          d += `M${x} ${y}h${w}v${h}h-${w}z`;
        }
      }

      if (d) {
        colorPaths[result.paletteHex[c]] = d;
      }
    }

    rectsPerFrame[id] = frameRects;

    let pathsSvg = '';
    for (const [hex, d] of Object.entries(colorPaths)) {
      pathsSvg += `  <path d="${d}" fill="${hex}"/>\n`;
    }

    symbols.push(`  <symbol id="${id}" viewBox="0 0 ${GRID_COLS} ${GRID_ROWS}" shape-rendering="crispEdges">\n${pathsSvg}  </symbol>`);
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n<defs>\n${symbols.join('\n')}\n</defs>\n</svg>\n`;
  fs.writeFileSync(OUTPUT_SVG, svgContent);
  const sizeKB = (Buffer.byteLength(svgContent) / 1024).toFixed(1);
  console.log(`Written ${OUTPUT_SVG}: ${sizeKB} KB (Total 2D rects: ${totalRectCount}, avg ${(totalRectCount / symbolIds.length).toFixed(1)} rects/frame)`);

  // Render 8x Contact Sheets (Light & Dark)
  async function renderContactSheet(bgColor, textColor, outPath) {
    const cols = 6;
    const rows = Math.ceil(symbolIds.length / cols);
    const cellSize = 8;
    const frameW = GRID_COLS * cellSize;
    const frameH = GRID_ROWS * cellSize;
    const pad = 12;

    const totalW = cols * (frameW + pad) + pad;
    const totalH = rows * (frameH + pad + 24) + pad;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: ${pad}px;
      background: ${bgColor};
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      display: grid;
      grid-template-columns: repeat(${cols}, ${frameW}px);
      gap: ${pad}px;
    }
    .card {
      position: relative;
      width: ${frameW}px;
      height: ${frameH + 24}px;
      background: ${bgColor === '#0A0D12' ? '#141820' : '#FFFFFF'};
      border: 1px solid ${bgColor === '#0A0D12' ? '#232936' : '#E2E8F0'};
      border-radius: 4px;
      overflow: hidden;
    }
    .svg-wrap {
      position: relative;
      width: ${frameW}px;
      height: ${frameH}px;
    }
    svg.sprite {
      width: 100%;
      height: 100%;
      shape-rendering: crispEdges;
    }
    .baseline-line {
      position: absolute;
      left: 0;
      right: 0;
      top: ${BASELINE_ROW * cellSize}px;
      height: 1px;
      background: rgba(239, 68, 68, 0.7);
      z-index: 5;
    }
    .pivot-mark {
      position: absolute;
      left: ${CENTER_COL * cellSize}px;
      top: ${(BASELINE_ROW - 2) * cellSize}px;
      width: 2px;
      height: ${4 * cellSize}px;
      background: rgba(56, 189, 248, 0.9);
      z-index: 6;
    }
    .label {
      height: 24px;
      line-height: 24px;
      font-size: 11px;
      padding: 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-top: 1px solid ${bgColor === '#0A0D12' ? '#232936' : '#E2E8F0'};
      display: flex;
      justify-content: space-between;
    }
    .badge-repaired {
      color: #F59E0B;
      font-weight: bold;
    }
  </style>
</head>
<body>
${svgContent}
${symbolIds.map(id => {
  const isRepaired = result.repairedLimbFrames.includes(id);
  const rCount = rectsPerFrame[id];
  return `
  <div class="card">
    <div class="svg-wrap">
      <svg class="sprite" viewBox="0 0 ${GRID_COLS} ${GRID_ROWS}"><use href="#${id}"></use></svg>
      <div class="baseline-line"></div>
      <div class="pivot-mark"></div>
    </div>
    <div class="label">
      <span>${id} (${rCount}r)</span>
      ${isRepaired ? '<span class="badge-repaired">[limb+]</span>' : ''}
    </div>
  </div>`;
}).join('\n')}
</body>
</html>
    `;

    await page.setViewportSize({ width: totalW, height: totalH });
    await page.setContent(html);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved contact sheet to ${outPath}`);
  }

  const darkPath = path.join(ARTIFACT_DIR, 'terminal_contact_sheet_dark_8x.png');
  const lightPath = path.join(ARTIFACT_DIR, 'terminal_contact_sheet_light_8x.png');

  await renderContactSheet('#0A0D12', '#F1F5F9', darkPath);
  await renderContactSheet('#F8FAFC', '#0F172A', lightPath);

  await browser.close();
  console.log('=== Done Running process-sheet.js ===');
}

if (require.main === module) {
  processSheet().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { processSheet };
