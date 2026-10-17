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
  var isRunning = true;
  var rafId = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load Sprite Assets
  var robotImg = new Image();
  robotImg.src = 'assets/pixel-terminator.png';

  var robotStepImg = new Image();
  robotStepImg.src = 'assets/pixel-terminator-step.png';

  var muzzleImg = new Image();
  muzzleImg.src = 'assets/muzzle-flash.png';

  var badgeImages = {
    python: { img: new Image(), src: 'assets/badge-python.png', w: 19, h: 21 },
    js:     { img: new Image(), src: 'assets/badge-js.png',     w: 20, h: 17 },
    cpp:    { img: new Image(), src: 'assets/badge-cpp.png',    w: 22, h: 15 },
    java:   { img: new Image(), src: 'assets/badge-java.png',   w: 22, h: 24 },
    code:   { img: new Image(), src: 'assets/badge-code.png',   w: 18, h: 14 }
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
  var WALK_SPEED = 0.62;    // Speed at which the robot patrols horizontally

  // State variables
  var frameCount = 0;
  var recoilOffset = 0;
  var isOverdrive = false;
  var overdriveTimer = 0;
  var nextBadgeIndex = 0;

  // Robot Patrol State
  var robotX = 380;
  var facing = -1; // -1 = left, 1 = right
  var patrolState = 'PATROL_LEFT'; // 'PATROL_LEFT', 'SCAN', 'PATROL_RIGHT'
  var stateTimer = 0;
  var walkFrame = 0;
  var walkStepTimer = 0;

  // Stream items: array of { type: 'badge'|'dot', key: string, x: number, y: number, alpha: number, waveOffset: number }
  var streamItems = [];
  var pixelDust = [];

  // Ground rubble stones distributed dynamically across baseline
  function buildRubblePoints(w) {
    var pts = [];
    for (var rx = 35; rx < w - 15; rx += 38) {
      pts.push({ x: rx, y: (rx % 76 === 0) ? 1 : 0 });
    }
    return pts;
  }
  var rubblePoints = buildRubblePoints(760);

  function resize() {
    if (!container) return;
    var rect = container.getBoundingClientRect();
    width = Math.round(rect.width) || 760;
    height = Math.round(rect.height) || 58;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    rubblePoints = buildRubblePoints(width);

    // Keep robot in bounds
    var maxX = width - ROBOT_DRAW_W - 8;
    if (robotX > maxX) {
      robotX = maxX;
    }
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
    var wSpeed = isOverdrive ? WALK_SPEED * 1.6 : WALK_SPEED;
    var groundY = height - 3;
    var robotY = groundY - ROBOT_DRAW_H;

    var maxX = width - ROBOT_DRAW_W - 8;
    var minX = 45;

    // ── ROBOT PATROL MOVEMENT ──
    if (patrolState === 'PATROL_LEFT') {
      facing = -1;
      robotX -= wSpeed;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX <= minX) {
        robotX = minX;
        patrolState = 'SCAN';
        stateTimer = 48; // pause and scan
      }
    } else if (patrolState === 'PATROL_RIGHT') {
      facing = 1;
      robotX += wSpeed;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX >= maxX) {
        robotX = maxX;
        patrolState = 'SCAN';
        stateTimer = 40; // pause at post
      }
    } else if (patrolState === 'SCAN') {
      walkFrame = 0;
      stateTimer--;
      if (stateTimer <= 0) {
        // Toggle direction
        if (facing === -1) {
          patrolState = 'PATROL_RIGHT';
          facing = 1;
        } else {
          patrolState = 'PATROL_LEFT';
          facing = -1;
        }
      }
    }

    var isMoving = (patrolState === 'PATROL_LEFT' || patrolState === 'PATROL_RIGHT');
    var stepBob = isMoving ? (Math.sin(frameCount * 0.3) * 1.5) : 0;
    var muzzleTipX = robotX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y + stepBob;

    // ── BADGE CONVEYOR STREAM ──
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

    // Firing logic: only fire from muzzle when facing left or paused left
    if (facing === -1) {
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
    var isMoving = (patrolState === 'PATROL_LEFT' || patrolState === 'PATROL_RIGHT');
    var stepBob = isMoving ? (Math.sin(frameCount * 0.3) * 1.5) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var muzzleTipX = drawRobotX + BARREL_OFFSET_X;
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
          var bw = bInfo.img.naturalWidth;
          var bh = bInfo.img.naturalHeight;
          var bx = Math.round(item.x - bw / 2);
          var by = Math.round(drawCenterY - bh / 2);
          ctx.drawImage(bInfo.img, bx, by, bw, bh);
          ctx.restore();
        }
      }
    }

    // 4. Draw cyan muzzle flash (when facing left and firing)
    if (facing === -1 && muzzleImg.complete && muzzleImg.naturalWidth > 0) {
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

    // 5. Draw Terminator robot (with 2-frame walking step and direction mirroring)
    var sprite = (walkFrame === 1 && robotStepImg.complete && robotStepImg.naturalWidth > 0) ? robotStepImg : robotImg;
    if (sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      var rx = Math.round(drawRobotX);
      var ry = Math.round(robotY + stepBob);

      if (facing === -1) {
        // Facing left
        ctx.drawImage(sprite, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);
        // Cyan visor glint
        if (Math.sin(frameCount * 0.08) > 0.65) {
          ctx.fillStyle = '#22D3EE';
          ctx.globalAlpha = 0.75;
          ctx.fillRect(rx + 9, ry + 15, 3, 2);
        }
      } else {
        // Mirrored for facing right
        ctx.translate(rx + ROBOT_DRAW_W, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, 0, 0, ROBOT_DRAW_W, ROBOT_DRAW_H);
        // Cyan visor glint
        if (Math.sin(frameCount * 0.08) > 0.65) {
          ctx.fillStyle = '#22D3EE';
          ctx.globalAlpha = 0.75;
          ctx.fillRect(9, 15, 3, 2);
        }
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
      var muzzleTipX = robotX + BARREL_OFFSET_X;
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
    var robotStaticX = width - ROBOT_DRAW_W - 8;
    var muzzleTipX = robotStaticX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y;

    // Ground line
    ctx.fillStyle = '#1A1A1D';
    ctx.fillRect(0, groundY, width, 1);
    ctx.fillStyle = '#2A2A2E';
    ctx.fillRect(0, groundY + 1, width, 1);

    // Robot
    if (robotImg.complete) {
      ctx.drawImage(robotImg, robotStaticX, robotY, ROBOT_DRAW_W, ROBOT_DRAW_H);
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
        var bw = bInfo.img.naturalWidth || bInfo.w;
        var bh = bInfo.img.naturalHeight || bInfo.h;
        ctx.drawImage(bInfo.img, curX - Math.round(bw / 2), muzzleTipY - Math.round(bh / 2), bw, bh);
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

    // Render immediately once images load so canvas is NEVER blank
    robotImg.onload = render;
    if (robotImg.complete) render();

    if (prefersReducedMotion) {
      robotImg.onload = drawStaticFallback;
      if (robotImg.complete) drawStaticFallback();
      return;
    }

    // Start loop immediately
    isRunning = true;
    rafId = requestAnimationFrame(loop);

    // IntersectionObserver to pause loop when far off-screen
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
      }, { rootMargin: '200px' });
      observer.observe(container);
    }
  }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     PIXELATED COSMIC STARFIELD BACKGROUND
     Subtle retro 1px/2px pixel stars and 3px cross-stars (+) twinkling gently
     across the dark portfolio background, matching the roaming space rocket.
     ═══════════════════════════════════════════════════════════════════════════ */
  (function initPixelStarfield() {
    var canvas = document.getElementById('pixel-stars-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var width = window.innerWidth || 1200;
    var height = window.innerHeight || 800;
    var stars = [];

    function resize() {
      width = window.innerWidth || 1200;
      height = window.innerHeight || 800;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      stars = [];
      var count = Math.min(85, Math.max(45, Math.round((width * height) / 18000)));
      for (var i = 0; i < count; i++) {
        var rand = Math.random();
        var type = rand < 0.65 ? 'dot1' : (rand < 0.88 ? 'dot2' : 'cross');
        var color = Math.random() < 0.82 ? '#CFC6B5' : '#22D3EE';
        stars.push({
          x: Math.round(Math.random() * width),
          y: Math.round(Math.random() * height),
          type: type,
          color: color,
          baseAlpha: 0.18 + Math.random() * 0.42,
          twinkleSpeed: 0.015 + Math.random() * 0.025,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    var frame = 0;
    function render() {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = prefersReducedMotion
          ? s.baseAlpha
          : s.baseAlpha + Math.sin(frame * s.twinkleSpeed + s.phase) * (s.baseAlpha * 0.55);
        if (alpha < 0.06) alpha = 0.06;
        if (alpha > 0.95) alpha = 0.95;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        if (s.type === 'dot1') {
          ctx.fillRect(s.x, s.y, 1, 1);
        } else if (s.type === 'dot2') {
          ctx.fillRect(s.x, s.y, 2, 2);
        } else if (s.type === 'cross') {
          ctx.fillRect(s.x, s.y - 1, 1, 3);
          ctx.fillRect(s.x - 1, s.y, 3, 1);
        }
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        requestAnimationFrame(render);
      }
    }

    render();
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     ROAMING PIXEL SPACE ROCKET COMPANION
     Autonomous retro pixel-art rocket roaming randomly across the viewport with
     dynamic main plasma plume, directional attitude (RCS) thrusters, and cursor
     interaction.
     ═══════════════════════════════════════════════════════════════════════════ */
  (function initRoamingPixelRocket() {
    var canvas = document.getElementById('space-rocket-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var rocketImg = new Image();
    rocketImg.src = 'assets/pixel-rocket.png';

    // Screen dimensions
    var width = window.innerWidth || 1200;
    var height = window.innerHeight || 800;

    // Responsive sizing (sprite native ratio: 216x508)
    var isMobile = width <= 600;
    var ROCKET_W = isMobile ? 24 : 32;
    var ROCKET_H = Math.round(ROCKET_W * (508 / 216));

    // Rocket state
    var x = width * 0.8;
    var y = height * 0.3;
    var vx = -0.7;
    var vy = 0.5;
    var angle = Math.atan2(vx, -vy);
    var boostTimer = 0;
    var frameCount = 0;

    // Waypoint navigation
    var targetX = width * 0.25;
    var targetY = height * 0.65;
    var waypointTimer = 200;

    // Particles
    var particles = [];

    // Mouse interaction
    var mouseX = -1000;
    var mouseY = -1000;
    var mouseActive = 0;

    // Loop control
    var isRunning = true;
    var rafId = null;

    function resize() {
      width = window.innerWidth || 1200;
      height = window.innerHeight || 800;
      isMobile = width <= 600;
      ROCKET_W = isMobile ? 24 : 32;
      ROCKET_H = Math.round(ROCKET_W * (508 / 216));

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
    }

    function pickNewWaypoint() {
      var marginX = Math.max(70, width * 0.12);
      var marginY = Math.max(70, height * 0.12);
      targetX = marginX + Math.random() * (width - 2 * marginX);
      targetY = marginY + Math.random() * (height - 2 * marginY);
      waypointTimer = 180 + Math.floor(Math.random() * 140);
    }

    function update() {
      frameCount++;
      if (boostTimer > 0) boostTimer--;
      if (mouseActive > 0) mouseActive--;

      // 1. Waypoint countdown
      waypointTimer--;
      var distToTarget = Math.hypot(targetX - x, targetY - y);
      if (distToTarget < 90 || waypointTimer <= 0) {
        pickNewWaypoint();
      }

      // 2. Desired heading calculation
      var dx = targetX - x;
      var dy = targetY - y;
      var desiredAngle = Math.atan2(dx, -dy);

      // Mouse proximity evasion
      if (mouseActive > 0) {
        var mDist = Math.hypot(x - mouseX, y - mouseY);
        if (mDist < 140) {
          desiredAngle = Math.atan2(x - mouseX, -(y - mouseY));
          if (boostTimer < 15) boostTimer = 15;
        }
      }

      // Screen edge soft boundaries
      var margin = isMobile ? 40 : 70;
      if (x < margin) desiredAngle = Math.PI / 2;
      else if (x > width - margin) desiredAngle = -Math.PI / 2;
      else if (y < margin) desiredAngle = Math.PI;
      else if (y > height - margin) desiredAngle = 0;

      // Smooth heading rotation
      var angleDiff = Math.atan2(Math.sin(desiredAngle - angle), Math.cos(desiredAngle - angle));
      var turnRate = boostTimer > 0 ? 0.055 : 0.032;
      angle += angleDiff * turnRate;

      // Unit vectors based on current heading
      var fx = Math.sin(angle);
      var fy = -Math.cos(angle);
      var rx = Math.cos(angle);
      var ry = Math.sin(angle);
      var lx = -rx;
      var ly = -ry;

      // Propulsion along heading
      var thrust = boostTimer > 0 ? 0.11 : 0.042;
      vx += fx * thrust;
      vy += fy * thrust;

      // Space drag (damping)
      vx *= 0.982;
      vy *= 0.982;

      // Speed clamping
      var maxSpeed = boostTimer > 0 ? 2.8 : 1.45;
      var speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }

      // Update position
      x += vx;
      y += vy;

      // Hard bounds safety check
      if (x < 10) x = 10;
      if (x > width - 10) x = width - 10;
      if (y < 10) y = 10;
      if (y > height - 10) y = height - 10;

      // ── THRUSTER EMISSION ──
      // 1. Main Plasma Plume (rear nozzle)
      var nozzleDist = ROCKET_H * 0.44;
      var nx = x - fx * nozzleDist;
      var ny = y - fy * nozzleDist;
      var pCount = boostTimer > 0 ? 3 : (frameCount % 2 === 0 ? 2 : 1);

      for (var p = 0; p < pCount; p++) {
        var spread = (Math.random() - 0.5) * 0.8;
        var pSpeed = (boostTimer > 0 ? 2.4 : 1.4) + Math.random() * 1.6;
        var rand = Math.random();
        var pColor = rand > 0.6 ? '#FFFFFF' : (rand > 0.25 ? '#22D3EE' : '#38BDF8');

        particles.push({
          x: nx + rx * (Math.random() - 0.5) * 4,
          y: ny + ry * (Math.random() - 0.5) * 4,
          vx: -fx * pSpeed + rx * spread,
          vy: -fy * pSpeed + ry * spread,
          color: pColor,
          size: Math.random() > 0.4 ? 2 : 1,
          alpha: 1,
          decay: boostTimer > 0 ? 0.035 : 0.045
        });
      }

      // 2. Small Attitude (RCS) Thrusters on side hull
      var rcsDistX = ROCKET_W * 0.44;
      var rcsDistY = ROCKET_H * 0.12;

      // Turning starboard: port (left) side thruster fires
      if (angleDiff > 0.045) {
        particles.push({
          x: x + lx * rcsDistX - fx * rcsDistY,
          y: y + ly * rcsDistX - fy * rcsDistY,
          vx: lx * (1.1 + Math.random() * 0.9) - fx * 0.2,
          vy: ly * (1.1 + Math.random() * 0.9) - fy * 0.2,
          color: Math.random() > 0.3 ? '#22D3EE' : '#FFFFFF',
          size: 1,
          alpha: 0.9,
          decay: 0.07 + Math.random() * 0.04
        });
      }
      // Turning port: starboard (right) side thruster fires
      else if (angleDiff < -0.045) {
        particles.push({
          x: x + rx * rcsDistX - fx * rcsDistY,
          y: y + ry * rcsDistX - fy * rcsDistY,
          vx: rx * (1.1 + Math.random() * 0.9) - fx * 0.2,
          vy: ry * (1.1 + Math.random() * 0.9) - fy * 0.2,
          color: Math.random() > 0.3 ? '#22D3EE' : '#FFFFFF',
          size: 1,
          alpha: 0.9,
          decay: 0.07 + Math.random() * 0.04
        });
      }
      // Periodic attitude stabilization micro-puff
      else if (frameCount % 60 === 0) {
        particles.push({
          x: x + lx * rcsDistX - fx * rcsDistY,
          y: y + ly * rcsDistX - fy * rcsDistY,
          vx: lx * 0.8,
          vy: ly * 0.8,
          color: '#22D3EE',
          size: 1,
          alpha: 0.75,
          decay: 0.08
        });
        particles.push({
          x: x + rx * rcsDistX - fx * rcsDistY,
          y: y + ry * rcsDistX - fy * rcsDistY,
          vx: rx * 0.8,
          vy: ry * 0.8,
          color: '#22D3EE',
          size: 1,
          alpha: 0.75,
          decay: 0.08
        });
      }

      // 3. Update active particles
      for (var i = particles.length - 1; i >= 0; i--) {
        var pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // Cap particle count
      if (particles.length > 70) {
        particles.splice(0, particles.length - 70);
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw thruster particles
      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
      }
      ctx.globalAlpha = 1;

      // 2. Draw Rocket Sprite
      if (rocketImg.complete && rocketImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(angle);
        ctx.drawImage(
          rocketImg,
          -Math.round(ROCKET_W / 2),
          -Math.round(ROCKET_H / 2),
          ROCKET_W,
          ROCKET_H
        );
        ctx.restore();
      }
    }

    function loop() {
      if (!isRunning) return;
      update();
      render();
      rafId = requestAnimationFrame(loop);
    }

    function drawStaticFallback() {
      resize();
      ctx.clearRect(0, 0, width, height);
      if (rocketImg.complete && rocketImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(Math.round(width * 0.88), Math.round(height * 0.18));
        ctx.rotate(-0.4);
        ctx.drawImage(rocketImg, -Math.round(ROCKET_W / 2), -Math.round(ROCKET_H / 2), ROCKET_W, ROCKET_H);
        ctx.restore();
      }
    }

    function init() {
      resize();
      window.addEventListener('resize', resize);

      if (prefersReducedMotion) {
        rocketImg.onload = drawStaticFallback;
        if (rocketImg.complete) drawStaticFallback();
        return;
      }

      rocketImg.onload = function () {
        if (!isRunning) return;
        render();
      };

      // Mouse tracking for reactive flight
      window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = 90;
      }, { passive: true });

      // Interactive Click: Fun speed burst
      window.addEventListener('click', function (e) {
        var clickDist = Math.hypot(x - e.clientX, y - e.clientY);
        if (clickDist < 250) {
          boostTimer = 40;
          targetX = Math.random() > 0.5 ? width * 0.2 : width * 0.8;
          targetY = Math.random() > 0.5 ? height * 0.2 : height * 0.8;
        }
      }, { passive: true });

      // Battery / Background Tab Saver: pause loop when tab hidden
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          isRunning = false;
          if (rafId) cancelAnimationFrame(rafId);
        } else {
          if (!isRunning) {
            isRunning = true;
            rafId = requestAnimationFrame(loop);
          }
        }
      });

      isRunning = true;
      rafId = requestAnimationFrame(loop);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();