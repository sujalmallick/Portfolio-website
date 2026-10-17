/* ════════════════════════════════════════════════════════
   SCRIPT.JS — SUJAL MALLICK PORTFOLIO
   - Theme toggle (light/dark, sessionStorage, system pref)
   - Hamburger menu
   - Scroll reveal (IntersectionObserver)
   - Scrollspy (active nav link)
   - Contact form → mailto handler
   ════════════════════════════════════════════════════════ */

/* ── 1. THEME TOGGLE ─────────────────────────────────────── */
function getEffectiveTheme() {
  var saved = sessionStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  sessionStorage.setItem('theme', theme);
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || getEffectiveTheme();
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Ensure correct theme is applied (inline head script handles initial set,
// this also handles edge cases where it wasn't set yet)
if (!document.documentElement.hasAttribute('data-theme')) {
  applyTheme(getEffectiveTheme());
}

// Bind both nav theme buttons
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggleTheme);

/* ── 2. HAMBURGER MENU ───────────────────────────────────── */
function toggleMenu() {
  var menu = document.getElementById('mobile-menu');
  var icon = document.getElementById('hamburger-btn');
  if (!menu || !icon) return;

  var isOpen = menu.classList.toggle('open');
  icon.classList.toggle('open');
  icon.setAttribute('aria-expanded', isOpen.toString());
}

/* ── 3. SCROLL REVEAL ────────────────────────────────────── */
(function () {
  var reveals = document.querySelectorAll('.reveal, .reveal-divider');
  if (!reveals.length) return;

  var observer = new IntersectionObserver(function (entries) {
    // Group entries that intersect at the same time to apply stagger
    var intersecting = entries.filter(function(e) { return e.isIntersecting; });
    
    intersecting.forEach(function (entry, index) {
      // Calculate stagger delay (e.g. 100ms per index)
      var delay = index * 100;
      entry.target.style.transitionDelay = delay + 'ms';
      
      // Force reflow to ensure delay is applied before class
      void entry.target.offsetWidth;
      
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  reveals.forEach(function(el) { observer.observe(el); });
})();

/* ── 4. SCROLLSPY — Active nav link ─────────────────────── */
(function () {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(function (section) { spy.observe(section); });
})();

/* ── 5. CONTACT FORM — mailto handler ───────────────────── */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = (document.getElementById('contact-name')?.value    || '').trim();
    var email   = (document.getElementById('contact-email')?.value   || '').trim();
    var message = (document.getElementById('contact-message')?.value || '').trim();

    if (!name || !email || !message) return;

    var subject = encodeURIComponent('Portfolio enquiry from ' + name);
    var body    = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n\n' +
      'Message:\n' + message
    );

    // Using Gmail web compose URL for maximum reliability across devices
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=sujalmallick123@gmail.com&su=' + subject + '&body=' + body;
    window.open(gmailUrl, '_blank');
  });
})();

/* ── 6. TYPOGRAPHY REVEAL ───────────────────────────────── */
(function() {
  window.addEventListener('load', function() {
    var masks = document.querySelectorAll('.mask-reveal');
    masks.forEach(function(el) {
      el.classList.add('visible');
    });
  });
})();





/* ── 9. SMOOTH SCROLL & CLEAN URL ────────────────────────── */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        
        // Account for sticky nav
        var headerOffset = 64; 
        var elementPosition = target.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL cleanly without jumping or leaving #hash
        history.replaceState(null, null, window.location.pathname);
        
        // Close mobile menu if open
        var menu = document.getElementById('mobile-menu');
        var icon = document.getElementById('hamburger-btn');
        if (menu && menu.classList.contains('open')) {
          menu.classList.remove('open');
          if (icon) {
            icon.classList.remove('open');
            icon.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });
})();

/* ── 10. RETRO PIXEL AI ROBOT & FIRING CONVEYOR (FOOTER SENTRY) ──────── */
(function () {
  var canvas = document.getElementById('footer-robot-canvas');
  if (!canvas) return;
  var container = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 440;
  var height = 58;
  var isRunning = false;
  var rafId = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load Sprite Assets
  var robotImg = new Image();
  robotImg.src = 'assets/pixel-terminator.png';

  var muzzleImg = new Image();
  muzzleImg.src = 'assets/muzzle-flash.png';

  var badgeImages = {
    python: { img: new Image(), src: 'assets/badge-python.png', w: 20, h: 22 },
    js:     { img: new Image(), src: 'assets/badge-js.png',     w: 18, h: 18 },
    cpp:    { img: new Image(), src: 'assets/badge-cpp.png',    w: 20, h: 18 },
    java:   { img: new Image(), src: 'assets/badge-java.png',   w: 18, h: 24 },
    code:   { img: new Image(), src: 'assets/badge-code.png',   w: 20, h: 20 }
  };

  var BADGE_SEQUENCE = ['code', 'java', 'cpp', 'js', 'python'];
  for (var k in badgeImages) {
    badgeImages[k].img.src = badgeImages[k].src;
  }

  // Animation constants
  var ROBOT_DRAW_W = 50;
  var ROBOT_DRAW_H = 55;
  var BARREL_OFFSET_X = 1;  // Barrel tip relative to robot top-left
  var BARREL_OFFSET_Y = 24; // Barrel tip relative to robot top-left
  var BADGE_SPACING = 38;   // Distance between consecutive badges
  var BASE_SPEED = 1.05;    // Pixels per frame badges move left

  // State variables
  var frameCount = 0;
  var recoilOffset = 0;
  var isOverdrive = false;
  var overdriveTimer = 0;
  var nextBadgeIndex = 0;

  // Stream items: array of { type: 'badge'|'dot', key: string, x: number, y: number, alpha: number, waveOffset: number }
  var streamItems = [];
  var pixelDust = [];

  // Ground rubble stones (fixed relative x positions)
  var rubblePoints = [
    { x: 38, y: 1 }, { x: 74, y: 0 }, { x: 125, y: 1 }, { x: 168, y: 0 },
    { x: 215, y: 1 }, { x: 260, y: 0 }, { x: 305, y: 1 }, { x: 350, y: 0 },
    { x: 395, y: 1 }, { x: 420, y: 0 }
  ];

  function resize() {
    if (!container) return;
    var rect = container.getBoundingClientRect();
    width = Math.round(rect.width) || 440;
    height = Math.round(rect.height) || 58;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;
  }

  function spawnMuzzleSparks(muzzleTipX, muzzleTipY) {
    var count = isOverdrive ? 4 : 2;
    for (var i = 0; i < count; i++) {
      pixelDust.push({
        x: muzzleTipX - 8 + (Math.random() - 0.5) * 6,
        y: muzzleTipY + (Math.random() - 0.5) * 6,
        vx: -0.6 - Math.random() * 1.2,
        vy: (Math.random() - 0.5) * 1.0,
        color: Math.random() > 0.3 ? '#22D3EE' : '#CFC6B5',
        alpha: 1,
        size: Math.random() > 0.5 ? 2 : 1,
        decay: 0.05 + Math.random() * 0.03
      });
    }
  }

  function update() {
    frameCount++;

    if (isOverdrive) {
      overdriveTimer--;
      if (overdriveTimer <= 0) {
        isOverdrive = false;
      }
    }

    // Smoothly relax recoil spring
    recoilOffset *= 0.82;

    var speed = isOverdrive ? BASE_SPEED * 1.9 : BASE_SPEED;
    var groundY = height - 3;
    var robotY = groundY - ROBOT_DRAW_H;
    var stepBob = Math.sin(frameCount * 0.12) * 1.0;
    var robotX = width - ROBOT_DRAW_W - 8 + recoilOffset;
    var muzzleTipX = robotX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y + stepBob;

    // Move existing stream items leftward
    for (var i = streamItems.length - 1; i >= 0; i--) {
      var item = streamItems[i];
      item.x -= speed;

      // When approaching the left edge, dissolve and spawn pixel dust
      if (item.x < 50) {
        item.alpha = Math.max(0, (item.x - 12) / 38);
        if (Math.random() < 0.45) {
          pixelDust.push({
            x: item.x + Math.random() * 12,
            y: item.y + (Math.random() - 0.5) * 12,
            vx: -0.8 - Math.random() * 0.8,
            vy: (Math.random() - 0.5) * 1.4,
            color: Math.random() > 0.4 ? '#22D3EE' : '#CFC6B5',
            alpha: 1,
            size: Math.random() > 0.5 ? 2 : 1,
            decay: 0.04 + Math.random() * 0.03
          });
        }
      }

      if (item.x < 8 || item.alpha <= 0) {
        streamItems.splice(i, 1);
      }
    }

    // Spawning conveyor logic
    var rightmost = streamItems.length > 0 ? streamItems[streamItems.length - 1] : null;
    var spawnStartX = muzzleTipX - 18;

    if (!rightmost || (spawnStartX - rightmost.x) >= (BADGE_SPACING / 2)) {
      if (!rightmost || rightmost.type === 'dot') {
        // Spawn next badge
        var key = BADGE_SEQUENCE[nextBadgeIndex];
        nextBadgeIndex = (nextBadgeIndex + 1) % BADGE_SEQUENCE.length;
        streamItems.push({
          type: 'badge',
          key: key,
          x: spawnStartX,
          y: muzzleTipY,
          alpha: 1,
          waveOffset: Math.random() * 6.28
        });
        recoilOffset = isOverdrive ? 2.4 : 1.4;
        spawnMuzzleSparks(muzzleTipX, muzzleTipY);
      } else {
        // Spawn separator dot between badges
        streamItems.push({
          type: 'dot',
          x: spawnStartX,
          y: muzzleTipY,
          alpha: 1,
          waveOffset: Math.random() * 6.28
        });
      }
    }

    // Update pixel dust particles
    for (var j = pixelDust.length - 1; j >= 0; j--) {
      var d = pixelDust[j];
      d.x += d.vx;
      d.y += d.vy;
      d.alpha -= d.decay;
      if (d.alpha <= 0) {
        pixelDust.splice(j, 1);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    var groundY = height - 3;
    var robotY = groundY - ROBOT_DRAW_H;
    var stepBob = Math.sin(frameCount * 0.12) * 1.0;
    var robotX = width - ROBOT_DRAW_W - 8 + recoilOffset;
    var muzzleTipX = robotX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y + stepBob;

    // 1. Draw subtle pixel ground baseline
    ctx.fillStyle = '#1A1A1D';
    ctx.fillRect(0, groundY, width, 1);
    ctx.fillStyle = '#2A2A2E';
    ctx.fillRect(0, groundY + 1, width, 1);

    // Rubble dots along the baseline
    ctx.fillStyle = '#3A3A40';
    for (var r = 0; r < rubblePoints.length; r++) {
      var pt = rubblePoints[r];
      if (pt.x < width) {
        ctx.fillRect(pt.x, groundY - pt.y - 1, 2, 1);
      }
    }

    // 2. Draw scattered pixel dust
    for (var d = 0; d < pixelDust.length; d++) {
      var dust = pixelDust[d];
      if (dust.alpha > 0) {
        ctx.save();
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = Math.max(0, dust.alpha);
        ctx.fillRect(Math.round(dust.x), Math.round(dust.y), dust.size, dust.size);
        ctx.restore();
      }
    }

    // 3. Draw streaming badges and glowing dots
    for (var i = 0; i < streamItems.length; i++) {
      var item = streamItems[i];
      if (item.alpha <= 0.02) continue;

      var floatY = Math.sin(item.x * 0.05 + item.waveOffset) * 1.2;
      var drawCenterY = Math.round(muzzleTipY + floatY);

      if (item.type === 'dot') {
        // Glowing cyan separator dot
        ctx.save();
        ctx.globalAlpha = Math.max(0, item.alpha);
        ctx.fillStyle = '#22D3EE';
        ctx.shadowColor = '#22D3EE';
        ctx.shadowBlur = 4;
        ctx.fillRect(Math.round(item.x) - 1, drawCenterY - 1, 3, 3);
        ctx.restore();
      } else if (item.type === 'badge') {
        var bInfo = badgeImages[item.key];
        if (bInfo && bInfo.img.complete && bInfo.img.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, item.alpha);
          var bx = Math.round(item.x - bInfo.w / 2);
          var by = Math.round(drawCenterY - bInfo.h / 2);
          ctx.drawImage(bInfo.img, bx, by, bInfo.w, bInfo.h);
          ctx.restore();
        }
      }
    }

    // 4. Draw cyan muzzle flash
    if (muzzleImg.complete && muzzleImg.naturalWidth > 0) {
      ctx.save();
      var mPulse = isOverdrive ? (1.1 + 0.2 * Math.sin(frameCount * 0.6)) : (0.85 + 0.15 * Math.sin(frameCount * 0.35));
      var mWidth = Math.round(20 * mPulse);
      var mHeight = Math.round(18 * mPulse);
      var mJitterX = (Math.random() - 0.5) * 0.8;
      var mJitterY = (Math.random() - 0.5) * 0.8;
      var mX = Math.round(muzzleTipX - mWidth + 2 + mJitterX);
      var mY = Math.round(muzzleTipY - mHeight / 2 + mJitterY);

      ctx.globalAlpha = isOverdrive ? 1 : 0.92;
      ctx.shadowColor = '#22D3EE';
      ctx.shadowBlur = isOverdrive ? 10 : 6;
      ctx.drawImage(muzzleImg, mX, mY, mWidth, mHeight);
      ctx.restore();
    }

    // 5. Draw Terminator robot
    if (robotImg.complete && robotImg.naturalWidth > 0) {
      ctx.save();
      var rx = Math.round(robotX);
      var ry = Math.round(robotY + stepBob);
      ctx.drawImage(robotImg, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);

      // Cyan visor glint
      if (Math.sin(frameCount * 0.08) > 0.65) {
        ctx.fillStyle = '#22D3EE';
        ctx.globalAlpha = 0.75;
        ctx.fillRect(rx + 9, ry + 15, 3, 2);
      }
      ctx.restore();
    }
  }

  function loop() {
    if (!isRunning) return;
    update();
    render();
    rafId = requestAnimationFrame(loop);
  }

  // Interactive Click Easter Egg: Overdrive rapid fire burst
  if (container) {
    container.addEventListener('click', function () {
      isOverdrive = true;
      overdriveTimer = 90; // ~1.5 seconds of overdrive
      recoilOffset = 3.2;
      var groundY = height - 3;
      var robotY = groundY - ROBOT_DRAW_H;
      var muzzleTipX = width - ROBOT_DRAW_W - 8 + BARREL_OFFSET_X;
      var muzzleTipY = robotY + BARREL_OFFSET_Y;
      spawnMuzzleSparks(muzzleTipX, muzzleTipY);
      spawnMuzzleSparks(muzzleTipX, muzzleTipY);
    });
  }

  function drawStaticFallback() {
    resize();
    ctx.clearRect(0, 0, width, height);

    var groundY = height - 3;
    var robotY = groundY - ROBOT_DRAW_H;
    var robotX = width - ROBOT_DRAW_W - 8;
    var muzzleTipX = robotX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y;

    // Ground line
    ctx.fillStyle = '#1A1A1D';
    ctx.fillRect(0, groundY, width, 1);
    ctx.fillStyle = '#2A2A2E';
    ctx.fillRect(0, groundY + 1, width, 1);

    // Robot
    if (robotImg.complete) {
      ctx.drawImage(robotImg, robotX, robotY, ROBOT_DRAW_W, ROBOT_DRAW_H);
    }

    // Muzzle
    if (muzzleImg.complete) {
      ctx.drawImage(muzzleImg, muzzleTipX - 18, muzzleTipY - 9, 20, 18);
    }

    // Static badges
    var staticBadges = ['code', 'java', 'cpp', 'js', 'python'];
    var curX = muzzleTipX - 36;
    for (var i = 0; i < staticBadges.length; i++) {
      var bInfo = badgeImages[staticBadges[i]];
      if (bInfo && bInfo.img.complete) {
        ctx.drawImage(bInfo.img, curX - Math.round(bInfo.w / 2), muzzleTipY - Math.round(bInfo.h / 2), bInfo.w, bInfo.h);
      }
      // Dot
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(curX - 18, muzzleTipY - 1, 3, 3);
      curX -= BADGE_SPACING;
    }
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      robotImg.onload = drawStaticFallback;
      if (robotImg.complete) drawStaticFallback();
      return;
    }

    // IntersectionObserver to pause loop when off-screen
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!isRunning) {
              isRunning = true;
              rafId = requestAnimationFrame(loop);
            }
          } else {
            isRunning = false;
            if (rafId) cancelAnimationFrame(rafId);
          }
        });
      }, { threshold: 0.05 });
      observer.observe(container);
    } else {
      isRunning = true;
      rafId = requestAnimationFrame(loop);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();