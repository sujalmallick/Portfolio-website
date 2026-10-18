const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');

  const b64 = fs.readFileSync('assets/pixel-service-droid.png').toString('base64');

  const sheetData = await page.evaluate(async ({ b64 }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const W = img.naturalWidth;  // 868
    const H = img.naturalHeight; // 905

    // High-resolution source canvas
    const srcCvs = document.createElement('canvas');
    srcCvs.width = W;
    srcCvs.height = H;
    const sCtx = srcCvs.getContext('2d');
    sCtx.drawImage(img, 0, 0);
    const sData = sCtx.getImageData(0, 0, W, H).data;

    function createLayer() {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const imgData = ctx.createImageData(W, H);
      return { canvas: c, ctx, imgData, data: imgData.data };
    }

    const torso = createLayer();
    const leftLeg = createLayer();
    const centerLeg = createLayer();
    const rightLeg = createLayer();

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const a = sData[idx + 3];
        if (a === 0) continue;

        const r = sData[idx];
        const g = sData[idx + 1];
        const b = sData[idx + 2];

        if (y < 560) {
          torso.data[idx] = r;
          torso.data[idx + 1] = g;
          torso.data[idx + 2] = b;
          torso.data[idx + 3] = a;
        } else {
          if (x < 285) {
            leftLeg.data[idx] = r;
            leftLeg.data[idx + 1] = g;
            leftLeg.data[idx + 2] = b;
            leftLeg.data[idx + 3] = a;
          } else if (x >= 580) {
            rightLeg.data[idx] = r;
            rightLeg.data[idx + 1] = g;
            rightLeg.data[idx + 2] = b;
            rightLeg.data[idx + 3] = a;
          } else {
            centerLeg.data[idx] = r;
            centerLeg.data[idx + 1] = g;
            centerLeg.data[idx + 2] = b;
            centerLeg.data[idx + 3] = a;
          }

          if (y < 585 && (r < 60 && g < 70 && b < 85)) {
            torso.data[idx] = r;
            torso.data[idx + 1] = g;
            torso.data[idx + 2] = b;
            torso.data[idx + 3] = a;
          }
        }
      }
    }

    torso.ctx.putImageData(torso.imgData, 0, 0);
    leftLeg.ctx.putImageData(leftLeg.imgData, 0, 0);
    centerLeg.ctx.putImageData(centerLeg.imgData, 0, 0);
    rightLeg.ctx.putImageData(rightLeg.imgData, 0, 0);

    const FW = 434;
    const FH = 452;
    // Groundline anchored to the absolute bottom of the frame (y = 451)
    const groundY = FH - 1; // 451: ZERO bottom air gap!
    const droidOriginY = 904;
    const scale = 0.495; // Crisp integer scaling down to 447px, touching y = 451

    const leftHip = { x: 200, y: 565 };
    const centerHip = { x: 415, y: 555 };
    const rightHip = { x: 660, y: 565 };

    const gaitPhases = [
      // Phase 0: Solid Stance (All 3 feet grounded firmly at baseline y = 451)
      {
        torsoY: 0,
        torsoRot: 0,
        left:   { angle: 0,      liftY: 0,  shiftX: 0 },
        center: { angle: 0,      liftY: 0,  shiftX: 0 },
        right:  { angle: 0,      liftY: 0,  shiftX: 0 }
      },
      // Phase 1: Left Leg Step Forward (Left tread lifts 20px, center & right anchored at y = 451)
      {
        torsoY: 2,
        torsoRot: -0.012,
        left:   { angle: -0.07,  liftY: -20, shiftX: 10 },
        center: { angle: 0.01,   liftY: 0,   shiftX: -3 },
        right:  { angle: 0.01,   liftY: 0,   shiftX: -3 }
      },
      // Phase 2: Center Leg Step Forward (Left & right anchored at y = 451, center lifts 16px)
      {
        torsoY: 0,
        torsoRot: 0,
        left:   { angle: 0.015,  liftY: 0,   shiftX: 6  },
        center: { angle: 0,      liftY: -16, shiftX: 8  },
        right:  { angle: -0.015, liftY: 0,   shiftX: -5 }
      },
      // Phase 3: Right Leg Step Forward (Right tread lifts 20px, left & center anchored at y = 451)
      {
        torsoY: 2,
        torsoRot: 0.012,
        left:   { angle: -0.01,  liftY: 0,   shiftX: -3 },
        center: { angle: -0.01,  liftY: 0,   shiftX: -3 },
        right:  { angle: 0.07,   liftY: -20, shiftX: 10 }
      }
    ];

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = FW * 4;
    sheetCanvas.height = FH;
    const ctx = sheetCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < 4; f++) {
      const g = gaitPhases[f];
      const frameX = f * FW;
      const anchorX = frameX + FW / 2;
      const anchorY = groundY;

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.scale(scale, scale);

      // 1. Center Leg
      ctx.save();
      ctx.translate(g.center.shiftX, g.torsoY + g.center.liftY);
      ctx.translate(centerHip.x - W / 2, centerHip.y - droidOriginY);
      ctx.rotate(g.center.angle);
      ctx.translate(-(centerHip.x - W / 2), -(centerHip.y - droidOriginY));
      ctx.drawImage(centerLeg.canvas, -W / 2, -droidOriginY);
      ctx.restore();

      // 2. Left Leg
      ctx.save();
      ctx.translate(g.left.shiftX, g.torsoY + g.left.liftY);
      ctx.translate(leftHip.x - W / 2, leftHip.y - droidOriginY);
      ctx.rotate(g.left.angle);
      ctx.translate(-(leftHip.x - W / 2), -(leftHip.y - droidOriginY));
      ctx.drawImage(leftLeg.canvas, -W / 2, -droidOriginY);
      ctx.restore();

      // 3. Right Leg
      ctx.save();
      ctx.translate(g.right.shiftX, g.torsoY + g.right.liftY);
      ctx.translate(rightHip.x - W / 2, rightHip.y - droidOriginY);
      ctx.rotate(g.right.angle);
      ctx.translate(-(rightHip.x - W / 2), -(rightHip.y - droidOriginY));
      ctx.drawImage(rightLeg.canvas, -W / 2, -droidOriginY);
      ctx.restore();

      // 4. Torso & Head
      ctx.save();
      ctx.translate(0, g.torsoY);
      ctx.translate(0, 560 - droidOriginY);
      ctx.rotate(g.torsoRot);
      ctx.translate(0, -(560 - droidOriginY));
      ctx.drawImage(torso.canvas, -W / 2, -droidOriginY);
      ctx.restore();

      ctx.restore();
    }

    return sheetCanvas.toDataURL('image/png');
  }, { b64 });

  await browser.close();

  function saveBase64(dataUri, filepath) {
    const base64 = dataUri.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));
    console.log('Saved', filepath);
  }

  saveBase64(sheetData, path.join(__dirname, '../assets/mascot-service-droid-sheet.png'));

  const brainPath = 'C:\\Users\\sujal\\.gemini\\antigravity\\brain\\06665287-4e95-4e17-9850-c987ec9c02e0\\mascot-service-droid-sheet.png';
  if (fs.existsSync(path.dirname(brainPath))) {
    saveBase64(sheetData, brainPath);
  }

  console.log('Zero-gap grounded Service Droid Sheet generated successfully!');
})();
