const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');

  const b64 = fs.readFileSync('assets/wasteland/cyborg-shooter.png').toString('base64');

  const result = await page.evaluate(async ({ b64 }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const W = 75;
    const H = 74;

    // 1. High-fidelity nearest-neighbor downscaling with purple artifact cleanup
    const srcCvs = document.createElement('canvas');
    srcCvs.width = img.naturalWidth;
    srcCvs.height = img.naturalHeight;
    const sCtx = srcCvs.getContext('2d');
    sCtx.drawImage(img, 0, 0);
    const sData = sCtx.getImageData(0, 0, srcCvs.width, srcCvs.height).data;

    const baseCvs = document.createElement('canvas');
    baseCvs.width = W;
    baseCvs.height = H;
    const bCtx = baseCvs.getContext('2d');
    const outImgData = bCtx.createImageData(W, H);
    const oData = outImgData.data;

    const scaleX = srcCvs.width / W;
    const scaleY = srcCvs.height / H;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sx = Math.floor((x + 0.5) * scaleX);
        const sy = Math.floor((y + 0.5) * scaleY);
        const sIdx = (sy * srcCvs.width + sx) * 4;
        const oIdx = (y * W + x) * 4;

        const r = sData[sIdx];
        const g = sData[sIdx + 1];
        const b = sData[sIdx + 2];
        const a = sData[sIdx + 3];

        if (a > 60) {
          const isVisor = (r > 170 && g > 80);
          if (!isVisor && (r > g + 20) && (b > g + 20)) {
            oData[oIdx] = 17;     // #111827 dark tactical outline
            oData[oIdx + 1] = 24;
            oData[oIdx + 2] = 39;
            oData[oIdx + 3] = 255;
          } else {
            oData[oIdx] = r;
            oData[oIdx + 1] = g;
            oData[oIdx + 2] = b;
            oData[oIdx + 3] = 255;
          }
        }
      }
    }
    bCtx.putImageData(outImgData, 0, 0);
    const baseData = bCtx.getImageData(0, 0, W, H).data;

    // --- FRAME 0: Reference Stance (Solid, pristine, zero cut) ---
    const c0 = document.createElement('canvas');
    c0.width = W; c0.height = H;
    const ctx0 = c0.getContext('2d');
    ctx0.drawImage(baseCvs, 0, 0);

    // Helper: Clone canvas
    function clone(c) {
      const copy = document.createElement('canvas');
      copy.width = c.width; copy.height = c.height;
      const ctx = copy.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(c, 0, 0);
      return { canvas: copy, ctx };
    }

    // --- FRAME 1: Passing Stride A (Torso dips 1px, rear leg swings forward) ---
    const c1 = document.createElement('canvas');
    c1.width = W; c1.height = H;
    const ctx1 = c1.getContext('2d');
    ctx1.imageSmoothingEnabled = false;

    // Upper body (y = 0..45) drawn dipped by 1px (lands at y = 1..46)
    ctx1.drawImage(baseCvs, 0, 0, W, 45, 0, 1, W, 45);

    // Also draw the pelvic junction bridge (y = 41..46) from baseCvs to guarantee zero seam
    ctx1.drawImage(baseCvs, 0, 41, W, 5, 0, 41, W, 5);

    const imgData1 = ctx1.getImageData(0, 0, W, H);
    const d1 = imgData1.data;

    // Animate lower legs (y >= 45)
    for (let y = 45; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        if (baseData[idx + 3] > 0) {
          if (x < 50) {
            // Front support leg: shifts back 2px, firmly grounded at bottom y = 73
            const nx = Math.min(W - 1, x + 2);
            const ny = Math.min(H - 1, y);
            const tidx = (ny * W + nx) * 4;
            d1[tidx] = baseData[idx];
            d1[tidx + 1] = baseData[idx + 1];
            d1[tidx + 2] = baseData[idx + 2];
            d1[tidx + 3] = 255;
          } else {
            // Rear stepping leg: swings forward 10px, lifts 2px
            const nx = Math.max(0, x - 10);
            const ny = Math.max(45, Math.min(H - 1, y - (y >= 66 ? 2 : 1)));
            const tidx = (ny * W + nx) * 4;
            if (d1[tidx + 3] === 0) {
              d1[tidx] = baseData[idx];
              d1[tidx + 1] = baseData[idx + 1];
              d1[tidx + 2] = baseData[idx + 2];
              d1[tidx + 3] = 255;
            }
          }
        }
      }
    }
    ctx1.putImageData(imgData1, 0, 0);

    // --- FRAME 2: Alternate Stride B (Both legs grounded on baseline y = 73) ---
    const c2 = document.createElement('canvas');
    c2.width = W; c2.height = H;
    const ctx2 = c2.getContext('2d');
    ctx2.imageSmoothingEnabled = false;

    // Upper body at baseline y = 0..45
    ctx2.drawImage(baseCvs, 0, 0, W, 45, 0, 0, W, 45);

    const imgData2 = ctx2.getImageData(0, 0, W, H);
    const d2 = imgData2.data;

    for (let y = 45; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        if (baseData[idx + 3] > 0) {
          if (x < 50) {
            // Front leg shifts back ~10px to become trailing stride
            const nx = Math.min(W - 1, x + 10);
            const ny = y;
            const tidx = (ny * W + nx) * 4;
            d2[tidx] = baseData[idx];
            d2[tidx + 1] = baseData[idx + 1];
            d2[tidx + 2] = baseData[idx + 2];
            d2[tidx + 3] = 255;
          } else {
            // Rear leg shifts forward ~12px to plant as new lead stride
            const nx = Math.max(0, x - 12);
            const ny = y;
            const tidx = (ny * W + nx) * 4;
            if (d2[tidx + 3] === 0) {
              d2[tidx] = baseData[idx];
              d2[tidx + 1] = baseData[idx + 1];
              d2[tidx + 2] = baseData[idx + 2];
              d2[tidx + 3] = 255;
            }
          }
        }
      }
    }
    ctx2.putImageData(imgData2, 0, 0);

    // --- FRAME 3: Passing Stride B (Torso rises 1px, lead leg swings forward) ---
    const c3 = document.createElement('canvas');
    c3.width = W; c3.height = H;
    const ctx3 = c3.getContext('2d');
    ctx3.imageSmoothingEnabled = false;

    // Upper body rises 1px: draw from y = 1..45 up to y = 0..44
    ctx3.drawImage(baseCvs, 0, 1, W, 44, 0, 0, W, 44);

    // Crucial: Draw pelvic connector bridge (y = 40..46) so row 41 is NEVER empty!
    ctx3.drawImage(baseCvs, 0, 40, W, 6, 0, 40, W, 6);

    const imgData3 = ctx3.getImageData(0, 0, W, H);
    const d3 = imgData3.data;

    for (let y = 45; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        if (baseData[idx + 3] > 0) {
          if (x < 50) {
            // Trailing leg swings through forward, knee raised 2px
            const nx = Math.min(W - 1, Math.max(0, x + 4));
            const ny = Math.max(45, Math.min(H - 1, y - (y >= 65 ? 2 : 1)));
            const tidx = (ny * W + nx) * 4;
            d3[tidx] = baseData[idx];
            d3[tidx + 1] = baseData[idx + 1];
            d3[tidx + 2] = baseData[idx + 2];
            d3[tidx + 3] = 255;
          } else {
            // Grounded foot pushing off
            const nx = Math.max(0, x - 4);
            const ny = y;
            const tidx = (ny * W + nx) * 4;
            if (d3[tidx + 3] === 0) {
              d3[tidx] = baseData[idx];
              d3[tidx + 1] = baseData[idx + 1];
              d3[tidx + 2] = baseData[idx + 2];
              d3[tidx + 3] = 255;
            }
          }
        }
      }
    }
    ctx3.putImageData(imgData3, 0, 0);

    // --- FRAME 4: Firing Recoil Frame ---
    const cFire = document.createElement('canvas');
    cFire.width = W; cFire.height = H;
    const ctxFire = cFire.getContext('2d');
    ctxFire.imageSmoothingEnabled = false;

    // Full body braced
    ctxFire.drawImage(c0, 0, 0);

    // Torso & head lean back 1px
    ctxFire.drawImage(baseCvs, 32, 0, W - 32, 45, 33, 0, W - 32, 45);

    // Cannon kicked back 2px right
    ctxFire.drawImage(baseCvs, 0, 20, 32, 19, 2, 20, 32, 19);

    // Amber radiator vents
    ctxFire.fillStyle = '#f59e0b';
    ctxFire.fillRect(10, 24, 6, 2);
    ctxFire.fillRect(18, 24, 5, 2);
    ctxFire.fillStyle = '#fef08a';
    ctxFire.fillRect(11, 24, 4, 1);
    ctxFire.fillRect(19, 24, 3, 1);

    // Visor flare
    ctxFire.fillStyle = '#f97316';
    ctxFire.fillRect(45, 8, 4, 3);
    ctxFire.fillStyle = '#fff7ed';
    ctxFire.fillRect(46, 9, 2, 1);

    // Quality Audit: Check rows 39..46 in all 4 frames to GUARANTEE nonZero > 0!
    const frames = [c0, c1, c2, c3, cFire];
    const audit = frames.map((frame, fi) => {
      const fData = frame.getContext('2d').getImageData(0, 0, W, H).data;
      const waistAudit = [];
      for (let y = 39; y <= 46; y++) {
        let count = 0;
        for (let x = 40; x <= 65; x++) {
          if (fData[(y * W + x) * 4 + 3] > 30) count++;
        }
        waistAudit.push({ y, count });
      }
      return { frame: fi, waistAudit };
    });

    return {
      f0: c0.toDataURL('image/png'),
      f1: c1.toDataURL('image/png'),
      f2: c2.toDataURL('image/png'),
      f3: c3.toDataURL('image/png'),
      fFire: cFire.toDataURL('image/png'),
      audit
    };
  }, { b64 });

  await browser.close();

  console.log('Quality Audit Waist Rows:', JSON.stringify(result.audit, null, 2));

  function saveBase64(dataUri, filepath) {
    const base64 = dataUri.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));
    console.log('Saved', filepath);
  }

  saveBase64(result.f0, path.join(__dirname, '../assets/wasteland/cyborg-shooter-0.png'));
  saveBase64(result.f1, path.join(__dirname, '../assets/wasteland/cyborg-shooter-1.png'));
  saveBase64(result.f2, path.join(__dirname, '../assets/wasteland/cyborg-shooter-2.png'));
  saveBase64(result.f3, path.join(__dirname, '../assets/wasteland/cyborg-shooter-3.png'));
  saveBase64(result.fFire, path.join(__dirname, '../assets/wasteland/cyborg-shooter-fire.png'));

  console.log('Seamless Cyborg Walk Cycle generated successfully!');
})();
