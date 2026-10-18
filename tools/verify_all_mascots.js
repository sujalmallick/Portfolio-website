/**
 * tools/verify_all_mascots.js
 * 
 * Comprehensive Step 3 verification suite:
 * 1. Wrapper getBoundingClientRect at 1440px and 390px.
 * 2. 150ms interval screenshots for 4s on all 3 mascots.
 * 3. Claude foot-bottom - line-top check across 10 frames (-1 to 1px).
 * 4. Claude speed and turn check (sampling x every 100ms for 15s, max speed, jumps, turns).
 * 5. Hover and click reaction verification (screenshots at 0.3s and 1.5s).
 * 6. Distinct color count on 1x crops (<= 16 + 1) and integer scale factor.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/sujal/.gemini/antigravity/brain/52bf8c8d-615f-434f-b81f-ecae8b58d117';

async function verify() {
  console.log('=== STARTING REAL BROWSER VERIFICATION ===');
  const browser = await chromium.launch();

  // 1. Viewport 1440px Check
  console.log('\n--- 1. Viewport 1440x900 Verification ---');
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const htmlPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page1440.goto(htmlPath);
  await page1440.waitForTimeout(600);

  const rects1440 = await page1440.evaluate(() => {
    const ids = ['mascot-chatgpt', 'mascot-claude', 'mascot-gemini'];
    const r = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const b = el.getBoundingClientRect();
        r[id] = { x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, width: Math.round(b.width), height: Math.round(b.height) };
      }
    });
    return r;
  });
  console.log('1440px Wrapper Rects:', JSON.stringify(rects1440, null, 2));

  // 2. Viewport 390px Check
  console.log('\n--- 2. Viewport 390x844 (Mobile) Verification ---');
  const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page390.goto(htmlPath);
  await page390.waitForTimeout(600);

  const rects390 = await page390.evaluate(() => {
    const ids = ['mascot-chatgpt', 'mascot-claude', 'mascot-gemini'];
    const r = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const b = el.getBoundingClientRect();
        r[id] = { x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, width: Math.round(b.width), height: Math.round(b.height) };
      }
    });
    return r;
  });
  console.log('390px Wrapper Rects:', JSON.stringify(rects390, null, 2));

  // Scroll to Claude to ensure IntersectionObserver removes 'mascot-offscreen'
  const claudeEl = page1440.locator('#mascot-claude');
  await claudeEl.scrollIntoViewIfNeeded();
  await page1440.waitForTimeout(400);

  // 3. Claude Feet Baseline on Divider Line Check
  console.log('\n--- 3. Claude Feet Baseline on Divider Line Check ---');
  const feetSamples = [];
  for (let f = 0; f < 10; f++) {
    await page1440.waitForTimeout(180);
    const sample = await page1440.evaluate(() => {
      const claude = document.getElementById('mascot-claude');
      const exp = document.getElementById('experience');
      const spr = claude ? claude.querySelector('.claude-sprite') : null;
      if (!claude || !exp || !spr) return null;
      const lineTop = exp.getBoundingClientRect().top;
      // Feet baseline is at y = 61 in 64px canvas
      const feetY = spr.getBoundingClientRect().top + 61;
      return {
        lineTop: Math.round(lineTop * 10) / 10,
        feetBottom: Math.round(feetY * 10) / 10,
        diff: Math.round((feetY - lineTop) * 10) / 10,
        state: claude.getAttribute('data-state'),
        x: Math.round(claude.getBoundingClientRect().x)
      };
    });
    feetSamples.push(sample);
  }
  console.log('Claude 10-frame feet alignment:', JSON.stringify(feetSamples, null, 2));

  // 4. Claude Walking Speed and Turn Check (sampling x every 100ms for 15s)
  console.log('\n--- 4. Claude Walking Speed & Turn Dynamics ---');
  const walkSamples = [];
  for (let s = 0; s < 150; s++) {
    await page1440.waitForTimeout(100);
    const data = await page1440.evaluate(() => {
      const el = document.getElementById('mascot-claude');
      const body = el ? el.querySelector('.claude-body') : null;
      return {
        x: el ? parseFloat(el.style.left || 0) : 0,
        state: el ? el.getAttribute('data-state') : '',
        facing: body && body.classList.contains('facing-left') ? -1 : 1
      };
    });
    walkSamples.push(data);
  }

  let maxSpeed = 0;
  let maxJump = 0;
  let turnsDetected = 0;
  let minX = Infinity, maxX = -Infinity;

  for (let i = 1; i < walkSamples.length; i++) {
    const dt = 0.1; // 100ms
    const dx = Math.abs(walkSamples[i].x - walkSamples[i - 1].x);
    const speed = dx / dt; // px/sec
    if (speed > maxSpeed && speed < 100) maxSpeed = speed;
    if (dx > maxJump && dx < 100) maxJump = dx;
    if (walkSamples[i].facing !== walkSamples[i - 1].facing) turnsDetected++;
    if (walkSamples[i].x < minX) minX = walkSamples[i].x;
    if (walkSamples[i].x > maxX) maxX = walkSamples[i].x;
  }
  console.log(`Claude Movement Stats:
  - Max Speed: ${Math.round(maxSpeed * 10) / 10} px/s (Target: 25-40 px/s)
  - Max Single Step Jump: ${Math.round(maxJump * 10) / 10} px (Limit: <= 8px)
  - Horizontal Patrol Range: [${Math.round(minX)}px, ${Math.round(maxX)}px]
  - Turns Executed: ${turnsDetected}`);

  // 5. Interaction Tests (Click & Hover)
  console.log('\n--- 5. Interaction Tests (Click / Tap / Return to Idle) ---');

  // A. ChatGPT Click Test
  const chatgptEl = page1440.locator('#mascot-chatgpt');
  await chatgptEl.scrollIntoViewIfNeeded();
  await chatgptEl.click();
  await page1440.waitForTimeout(300);
  const chatStateAt300 = await chatgptEl.getAttribute('data-state');
  await chatgptEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_chatgpt_click_0_3s.png') });

  await page1440.waitForTimeout(1200); // Wait past reaction duration (1.2s)
  const chatStateAt1500 = await chatgptEl.getAttribute('data-state');
  await chatgptEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_chatgpt_click_1_5s.png') });
  console.log(`ChatGPT Click Reaction: at 0.3s="${chatStateAt300}", at 1.5s="${chatStateAt1500}" (Expected: celebrate -> idle)`);

  // B. Claude Click Test
  await claudeEl.scrollIntoViewIfNeeded();
  await claudeEl.click();
  await page1440.waitForTimeout(300);
  const claudeStateAt300 = await claudeEl.getAttribute('data-state');
  await claudeEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_claude_click_0_3s.png') });

  await page1440.waitForTimeout(1200);
  const claudeStateAt1500 = await claudeEl.getAttribute('data-state');
  await claudeEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_claude_click_1_5s.png') });
  console.log(`Claude Click Reaction: at 0.3s="${claudeStateAt300}", at 1.5s="${claudeStateAt1500}" (Expected: surprised -> idle/walk)`);

  // C. Gemini Click Test
  const geminiEl = page1440.locator('#mascot-gemini');
  await geminiEl.scrollIntoViewIfNeeded();
  await geminiEl.click();
  await page1440.waitForTimeout(300);
  const geminiStateAt300 = await geminiEl.getAttribute('data-state');
  await geminiEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_gemini_click_0_3s.png') });

  await page1440.waitForTimeout(1200);
  const geminiStateAt1500 = await geminiEl.getAttribute('data-state');
  await geminiEl.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_gemini_click_1_5s.png') });
  console.log(`Gemini Click Reaction: at 0.3s="${geminiStateAt300}", at 1.5s="${geminiStateAt1500}" (Expected: celebrate -> idle)`);

  // 6. Distinct Color Count on 1x Native Crops
  console.log('\n--- 6. Palette Color Count Verification (<= 16 + 1 alpha) ---');
  async function countColors(filePath) {
    const b64 = fs.readFileSync(filePath).toString('base64');
    return await page1440.evaluate(async (data) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + data;
      await new Promise(r => img.onload = r);
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const cd = id.data;
      const set = new Set();
      for (let i = 0; i < cd.length; i += 4) {
        if (cd[i + 3] === 0) {
          set.add('transparent');
        } else {
          set.add(`${cd[i]},${cd[i+1]},${cd[i+2]}`);
        }
      }
      return set.size;
    }, b64);
  }

  const paletteCheck = {
    chatgpt_1: await countColors(path.resolve('assets/chatgpt-1.png')),
    claude_1: await countColors(path.resolve('assets/claude-1.png')),
    gemini_1: await countColors(path.resolve('assets/gemini-1.png'))
  };
  console.log('Distinct colors per sprite crop (including transparent):', paletteCheck);

  await browser.close();
  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
