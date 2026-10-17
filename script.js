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

/* ── 10. PROJECTS SECTION — COLLAPSIBLE EXPANSION TOGGLE ─────────────── */
(function initProjectsToggle() {
  var btn = document.getElementById('projects-toggle-btn');
  if (!btn) return;
  var collapsibleCards = document.querySelectorAll('.project-collapsible');
  if (!collapsibleCards.length) return;

  var isExpanded = false;

  btn.addEventListener('click', function () {
    isExpanded = !isExpanded;
    btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    var textSpan = btn.querySelector('.projects-toggle-text');
    if (textSpan) {
      textSpan.textContent = isExpanded ? 'Show Fewer Projects' : 'See More Projects';
    }

    for (var i = 0; i < collapsibleCards.length; i++) {
      var card = collapsibleCards[i];
      if (isExpanded) {
        card.classList.remove('is-collapsed');
        card.classList.add('visible');
      } else {
        card.classList.add('is-collapsed');
      }
    }

    if (!isExpanded) {
      var projectsHeader = document.querySelector('#projects .section-header');
      if (projectsHeader) {
        projectsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════
   LIVING RETRO PIXEL-ART FOOTER WORLD
   A living, spacious 8-bit/16-bit retro developer scene:
   - Spaced workstation (plant, street lamp, R2-D2 & cat, coding desk, 4-tier server rack, books crate)
   - Independent workstation life: asynchronous server rack LEDs, blinking terminal cursor,
     subtle amber lamp pulse, R2-D2 sensor glint, right torch flickering flame, and starry sky
   - Main combat droid patrol-and-fire cycle:
     1. Walks along platform with alternating 2-frame leg stride & bob
     2. Pauses & aims plasma rifle with glowing cyan visor
     3. Fires cyan energy < / > code bolt with recoil kickback and muzzle flash
     4. Independent projectile travels with trailing sparks and detonates in pixel burst
     5. Pauses, turns, and loops the patrol sequence
   ═══════════════════════════════════════════════════════════════════════════ */
(function initFooterWorld() {
  var canvas = document.getElementById('footer-world-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var container = canvas.parentElement;

  var width = 1000;
  var height = 96;
  var isRunning = true;
  var rafId = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load Sprites
  var workstationImg = new Image();
  workstationImg.src = 'assets/footer-workstation-spaced.png';

  var rightPropsImg = new Image();
  rightPropsImg.src = 'assets/footer-right-props.png';

  var robotImg = new Image();
  robotImg.src = 'assets/pixel-terminator.png';

  var robotStepImg = new Image();
  robotStepImg.src = 'assets/pixel-terminator-step.png';

  var muzzleImg = new Image();
  muzzleImg.src = 'assets/muzzle-flash.png';

  var projectileImg = new Image();
  projectileImg.src = 'assets/combat-projectile-code.png';

  // Constants
  var ROBOT_DRAW_W = 48;
  var ROBOT_DRAW_H = 53;
  var BARREL_OFFSET_X = 2;   // Relative to droid when facing left
  var BARREL_OFFSET_Y = 24;  // Rifle tip Y relative to droid top

  // Droid State Machine: WALK_LEFT -> AIM -> FIRE -> COOLDOWN -> WALK_RIGHT -> SCAN -> WALK_LEFT
  var robotX = 640;
  var facing = -1; // -1 = left, 1 = right
  var patrolState = 'WALK_LEFT';
  var stateTimer = 0;
  var walkFrame = 0;
  var walkStepTimer = 0;
  var recoilOffset = 0;
  var showMuzzleFlash = false;
  var muzzleTimer = 0;

  var WALK_SPEED = 0.58;

  // Active Projectiles & Spark Particles
  var projectiles = [];
  var sparks = [];

  // Starry Sky
  var stars = [
    { x: 0.12, y: 16, size: 2, phase: 0.2, speed: 0.04 },
    { x: 0.24, y: 12, size: 1, phase: 1.5, speed: 0.03 },
    { x: 0.38, y: 22, size: 2, phase: 2.8, speed: 0.05 },
    { x: 0.48, y: 10, size: 1, phase: 0.9, speed: 0.025 },
    { x: 0.58, y: 18, size: 2, phase: 3.4, speed: 0.045 },
    { x: 0.72, y: 14, size: 1, phase: 4.1, speed: 0.035 },
    { x: 0.84, y: 20, size: 2, phase: 5.2, speed: 0.04 },
    { x: 0.94, y: 12, size: 1, phase: 1.8, speed: 0.03 }
  ];
  var shootingStar = null;

  // Workstation LEDs (4 bays on server rack, independent blinking intervals)
  var serverLeds = [
    { bay: 0, xOff: 11, yOff: 9,  period: 22, phase: 2,  color: '#10b981' },
    { bay: 0, xOff: 18, yOff: 9,  period: 38, phase: 11, color: '#34d399' },
    { bay: 0, xOff: 25, yOff: 9,  period: 50, phase: 24, color: '#f59e0b' },
    { bay: 1, xOff: 11, yOff: 21, period: 28, phase: 7,  color: '#10b981' },
    { bay: 1, xOff: 18, yOff: 21, period: 44, phase: 19, color: '#10b981' },
    { bay: 1, xOff: 25, yOff: 21, period: 32, phase: 14, color: '#34d399' },
    { bay: 2, xOff: 11, yOff: 33, period: 35, phase: 5,  color: '#34d399' },
    { bay: 2, xOff: 18, yOff: 33, period: 26, phase: 17, color: '#10b981' },
    { bay: 2, xOff: 25, yOff: 33, period: 55, phase: 31, color: '#f59e0b' },
    { bay: 3, xOff: 11, yOff: 45, period: 40, phase: 9,  color: '#10b981' },
    { bay: 3, xOff: 18, yOff: 45, period: 30, phase: 21, color: '#34d399' },
    { bay: 3, xOff: 25, yOff: 45, period: 48, phase: 3,  color: '#10b981' }
  ];

  var frameCount = 0;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(54, Math.floor(rect.height || 96));
    canvas.width = width;
    canvas.height = height;

    // Keep droid in reasonable patrol range
    var minPatrolX = Math.max(340, Math.min(width * 0.42, width - 220));
    var maxPatrolX = Math.min(width - 100, Math.max(minPatrolX + 60, width * 0.8));
    if (robotX < minPatrolX) robotX = minPatrolX;
    if (robotX > maxPatrolX) robotX = maxPatrolX;
  }

  function spawnMuzzleSparks(x, y) {
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI + (Math.random() - 0.5) * 0.9;
      var speed = 1.5 + Math.random() * 2.8;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? '#22d3ee' : '#38bdf8',
        life: 14 + Math.floor(Math.random() * 8),
        maxLife: 22,
        size: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  function spawnImpactBurst(x, y) {
    for (var i = 0; i < 12; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.2 + Math.random() * 2.5;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: Math.random() > 0.4 ? '#22d3ee' : (Math.random() > 0.5 ? '#f97316' : '#ffffff'),
        life: 16 + Math.floor(Math.random() * 10),
        maxLife: 26,
        size: Math.random() > 0.4 ? 2 : 1
      });
    }
  }

  function update() {
    frameCount++;

    var groundY = height - 4;
    var minPatrolX = Math.max(330, Math.min(width * 0.42, width - 210));
    var maxPatrolX = Math.min(width - 95, Math.max(minPatrolX + 60, width * 0.78));

    // Droid Patrol State Machine
    if (patrolState === 'WALK_LEFT') {
      facing = -1;
      robotX -= WALK_SPEED;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX <= minPatrolX) {
        robotX = minPatrolX;
        patrolState = 'AIM';
        stateTimer = 40; // Aim pause
        walkFrame = 0;
      }
    } else if (patrolState === 'AIM') {
      facing = -1;
      stateTimer--;
      if (stateTimer <= 0) {
        patrolState = 'FIRE';
        stateTimer = 6;
      }
    } else if (patrolState === 'FIRE') {
      showMuzzleFlash = true;
      muzzleTimer = 5;
      recoilOffset = 3.6;

      var stepBob = 0;
      var rx = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
      var ry = groundY - ROBOT_DRAW_H + 2;
      var muzzleTipX = rx + BARREL_OFFSET_X;
      var muzzleTipY = ry + BARREL_OFFSET_Y;

      spawnMuzzleSparks(muzzleTipX, muzzleTipY);

      // Launch < / > projectile
      projectiles.push({
        x: muzzleTipX - 20,
        y: muzzleTipY - 14,
        vx: -5.2,
        life: 68,
        maxLife: 68
      });

      patrolState = 'COOLDOWN';
      stateTimer = 55;
    } else if (patrolState === 'COOLDOWN') {
      stateTimer--;
      if (stateTimer <= 0) {
        patrolState = 'WALK_RIGHT';
        facing = 1;
      }
    } else if (patrolState === 'WALK_RIGHT') {
      facing = 1;
      robotX += WALK_SPEED;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX >= maxPatrolX) {
        robotX = maxPatrolX;
        patrolState = 'SCAN';
        stateTimer = 42;
        walkFrame = 0;
      }
    } else if (patrolState === 'SCAN') {
      facing = -1; // Turn back left to survey
      stateTimer--;
      if (stateTimer <= 0) {
        patrolState = 'WALK_LEFT';
      }
    }

    // Damp recoil
    if (recoilOffset > 0) {
      recoilOffset *= 0.82;
      if (recoilOffset < 0.1) recoilOffset = 0;
    }

    // Muzzle timer
    if (muzzleTimer > 0) {
      muzzleTimer--;
      if (muzzleTimer === 0) showMuzzleFlash = false;
    }

    // Update Projectiles
    for (var pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
      var p = projectiles[pIdx];
      p.x += p.vx;
      p.life--;

      // Spawn trail particle
      if (frameCount % 2 === 0) {
        sparks.push({
          x: p.x + 22,
          y: p.y + 16 + (Math.random() * 4 - 2),
          vx: Math.random() * 0.6 + 0.2,
          vy: (Math.random() - 0.5) * 0.8,
          color: Math.random() > 0.3 ? '#22d3ee' : '#38bdf8',
          life: 10 + Math.floor(Math.random() * 6),
          maxLife: 16,
          size: 1
        });
      }

      // Detonate near workstation edge (x ≈ 362) or when life expires
      if (p.x <= 362 || p.life <= 0) {
        spawnImpactBurst(p.x + 10, p.y + 14);
        projectiles.splice(pIdx, 1);
      }
    }

    // Update Sparks
    for (var sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
      var s = sparks[sIdx];
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      if (s.life <= 0) {
        sparks.splice(sIdx, 1);
      }
    }

    // Random Shooting Star
    if (!shootingStar && (frameCount % 480 === 120)) {
      shootingStar = {
        x: width * (0.35 + Math.random() * 0.3),
        y: 4 + Math.random() * 12,
        vx: -(2.8 + Math.random() * 1.5),
        vy: 1.2 + Math.random() * 0.8,
        life: 22,
        maxLife: 22
      };
    } else if (shootingStar) {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life--;
      if (shootingStar.life <= 0) shootingStar = null;
    }
  }

  function render() {
    ctx.imageSmoothingEnabled = false;

    // 1. Dark almost-black retro background
    ctx.fillStyle = '#08090d';
    ctx.fillRect(0, 0, width, height);

    var groundY = height - 4;

    // 2. Starry Sky
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var sx = Math.floor(st.x * width);
      var sy = st.y;
      var alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frameCount * st.speed + st.phase));
      ctx.fillStyle = 'rgba(226, 232, 240, ' + alpha.toFixed(2) + ')';
      ctx.fillRect(sx, sy, st.size, st.size);
    }

    // Shooting star trail
    if (shootingStar) {
      var sLifeRatio = shootingStar.life / shootingStar.maxLife;
      ctx.strokeStyle = 'rgba(56, 189, 248, ' + (sLifeRatio * 0.8).toFixed(2) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(shootingStar.x - shootingStar.vx * 3.5, shootingStar.y - shootingStar.vy * 3.5);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(shootingStar.x), Math.round(shootingStar.y), 2, 2);
    }

    // 3. Platform Ground Lines across full width
    ctx.fillStyle = '#2c2f38';
    ctx.fillRect(0, groundY, width, 2);
    ctx.fillStyle = '#16181f';
    ctx.fillRect(0, groundY + 2, width, 2);

    // Subtle platform grass/stone specs in open stretch
    ctx.fillStyle = '#10b981';
    ctx.fillRect(Math.floor(width * 0.52), groundY - 1, 3, 1);
    ctx.fillRect(Math.floor(width * 0.78), groundY - 1, 4, 1);
    ctx.fillStyle = '#475569';
    ctx.fillRect(Math.floor(width * 0.44), groundY - 1, 2, 1);
    ctx.fillRect(Math.floor(width * 0.68), groundY - 1, 3, 1);

    // 4. Spaced Workstation Sprite (Left Side)
    if (workstationImg.complete && workstationImg.naturalWidth > 0) {
      var wsY = groundY - 92;
      ctx.drawImage(workstationImg, 0, wsY, 366, 95);

      // Independent Workstation Life:
      // A) Street Lamp Amber Pulse
      var lampX = 112;
      var lampY = wsY + 20;
      var lampGlow = 0.14 + 0.05 * Math.sin(frameCount * 0.045);
      var lampGrad = ctx.createRadialGradient(lampX, lampY, 2, lampX, lampY, 28);
      lampGrad.addColorStop(0, 'rgba(245, 158, 11, ' + lampGlow.toFixed(2) + ')');
      lampGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(lampX, lampY, 28, 0, Math.PI * 2);
      ctx.fill();

      // B) R2-D2 Droid Sensor Pulse
      var r2X = 138;
      var r2Y = wsY + 54;
      if (Math.sin(frameCount * 0.08) > 0.4) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(r2X, r2Y, 2, 2);
      }
      if ((frameCount % 120) < 18) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(r2X + 6, r2Y, 1, 1);
      }

      // C) Coding Screen Blinking Terminal Cursor & Refresh
      var crtX = 188;
      var crtY = wsY + 41;
      if ((frameCount % 50) < 26) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(crtX + 22, crtY + 13, 3, 3);
      }
      if ((frameCount % 160) < 20) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.fillRect(crtX + 4, crtY + 7, 24, 2);
      }

      // D) 4-Tier Server Rack Asynchronous Blinking LEDs
      var rackX = 265;
      var rackY = wsY + 31;
      for (var lIdx = 0; lIdx < serverLeds.length; lIdx++) {
        var led = serverLeds[lIdx];
        var isLedOn = ((frameCount + led.phase) % led.period) < (led.period * 0.52);
        if (isLedOn) {
          ctx.fillStyle = led.color;
          ctx.fillRect(rackX + led.xOff, rackY + led.yOff, 2, 2);
        }
      }
    }

    // 5. Right Props (Tech Crate & Torch Post on Far Right)
    if (rightPropsImg.complete && rightPropsImg.naturalWidth > 0) {
      var rpX = width - 106;
      var rpY = groundY - 92;
      ctx.drawImage(rightPropsImg, rpX, rpY, 106, 95);

      // Flickering Torch Flame
      var torchX = rpX + 57;
      var torchY = rpY + 47;
      var flameBob = Math.sin(frameCount * 0.28) * 1.5;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(torchX - 1, torchY - 2 + flameBob, 3, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(torchX, torchY - 4 + flameBob, 2, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(torchX, torchY + 1 + flameBob, 2, 2);
    }

    // 6. Combat Droid (2-frame alternating stride, aim, and recoil)
    var isMoving = (patrolState === 'WALK_LEFT' || patrolState === 'WALK_RIGHT');
    var stepBob = isMoving ? (Math.sin(frameCount * 0.35) * 1.4) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var rx = Math.round(drawRobotX);
    var ry = Math.round(groundY - ROBOT_DRAW_H + 2 + stepBob);

    var droidSprite = (walkFrame === 1 && robotStepImg.complete && robotStepImg.naturalWidth > 0)
      ? robotStepImg
      : robotImg;

    if (droidSprite.complete && droidSprite.naturalWidth > 0) {
      ctx.save();
      if (facing === -1) {
        // Facing Left
        ctx.drawImage(droidSprite, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Cyan Visor Glint
        if (patrolState === 'AIM' || Math.sin(frameCount * 0.1) > 0.3) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(rx + 15, ry + 16, 5, 2);
        }

        // Muzzle Flash
        if (showMuzzleFlash && muzzleImg.complete && muzzleImg.naturalWidth > 0) {
          ctx.drawImage(muzzleImg, rx - 18, ry + BARREL_OFFSET_Y - 11, 24, 22);
        }
      } else {
        // Facing Right (Mirrored)
        ctx.translate(rx + ROBOT_DRAW_W, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(droidSprite, 0, 0, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Cyan Visor Glint
        if (patrolState === 'AIM' || Math.sin(frameCount * 0.1) > 0.3) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(15, 16, 5, 2);
        }
      }
      ctx.restore();
    }

    // 7. Active Code Projectiles (< / >)
    for (var prj = 0; prj < projectiles.length; prj++) {
      var proj = projectiles[prj];
      var px = Math.round(proj.x);
      var py = Math.round(proj.y);

      if (projectileImg.complete && projectileImg.naturalWidth > 0) {
        ctx.drawImage(projectileImg, px, py, 38, 28);
      } else {
        // Fallback crisp pixel projectile
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('</>', px, py + 12);
      }
    }

    // 8. Spark Particles
    for (var spk = 0; spk < sparks.length; spk++) {
      var spark = sparks[spk];
      var sparkAlpha = (spark.life / spark.maxLife);
      ctx.fillStyle = spark.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, sparkAlpha));
      ctx.fillRect(Math.round(spark.x), Math.round(spark.y), spark.size, spark.size);
    }
    ctx.globalAlpha = 1.0;
  }

  function loop() {
    if (!isRunning) return;
    update();
    render();
    rafId = requestAnimationFrame(loop);
  }

  function drawStaticFallback() {
    resize();
    render();
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      workstationImg.onload = drawStaticFallback;
      rightPropsImg.onload = drawStaticFallback;
      robotImg.onload = drawStaticFallback;
      if (workstationImg.complete) drawStaticFallback();
      return;
    }

    // Start loop
    isRunning = true;
    rafId = requestAnimationFrame(loop);

    // Performance: Pause when scrolled off-screen
    if ('IntersectionObserver' in window && container) {
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
      }, { rootMargin: '150px' });
      observer.observe(container);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        if (!isRunning && (!container || container.getBoundingClientRect().bottom > 0)) {
          isRunning = true;
          rafId = requestAnimationFrame(loop);
        }
      }
    });
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

    // Flight & Landing State
    var mode = 'ROAM'; // 'ROAM', 'APPROACH', 'LANDING', 'LANDED', 'LIFTOFF'
    var roamCountdown = 450 + Math.floor(Math.random() * 350); // 7-13s roam before attempting landing
    var landingTarget = null;
    var legDeploy = 0; // 0 to 1
    var landedTimer = 0;

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

    function findVisibleLandingLine() {
      var candidates = document.querySelectorAll('.reveal-divider, .about-education, footer');
      var lines = [];
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        var rect = el.getBoundingClientRect();
        if (rect.top >= 100 && rect.top <= height - 120 && rect.width >= 240) {
          var isEdu = el.classList.contains('about-education');
          var minX = Math.max(40, rect.left + 50);
          var maxX = isEdu ? (rect.left + rect.width * 0.55) : Math.min(width - 50, rect.right - 50);
          if (maxX > minX + 50) {
            lines.push({
              x: minX + Math.random() * (maxX - minX),
              y: Math.round(rect.top),
              el: el
            });
          }
        }
      }
      if (lines.length === 0) return null;
      return lines[Math.floor(Math.random() * lines.length)];
    }

    function update() {
      frameCount++;
      if (boostTimer > 0) boostTimer--;
      if (mouseActive > 0) mouseActive--;

      var legDropDist = ROCKET_H * 0.52; // distance from rocket center to footpads

      // ── FLIGHT MODE STATE MACHINE ──
      if (mode === 'ROAM') {
        roamCountdown--;
        if (roamCountdown <= 0) {
          var targetLine = findVisibleLandingLine();
          if (targetLine) {
            landingTarget = targetLine;
            mode = 'APPROACH';
          } else {
            roamCountdown = 240;
          }
        }

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

        if (legDeploy > 0) legDeploy = Math.max(0, legDeploy - 0.05);

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
        } else if (angleDiff < -0.045) {
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

      } else if (mode === 'APPROACH') {
        if (landingTarget && landingTarget.el) {
          var r = landingTarget.el.getBoundingClientRect();
          if (r.top < 40 || r.top > height - 60) {
            mode = 'ROAM';
            roamCountdown = 240;
            return;
          }
          landingTarget.y = Math.round(r.top);
        }

        var hoverY = landingTarget.y - legDropDist - 40;
        var adx = landingTarget.x - x;
        var ady = hoverY - y;
        var distToHover = Math.hypot(adx, ady);

        // Turn upright (angle = 0 points straight up)
        var desiredAngle = 0;
        var angleDiff = Math.atan2(Math.sin(desiredAngle - angle), Math.cos(desiredAngle - angle));
        angle += angleDiff * 0.08;

        vx += Math.sign(adx) * Math.min(0.08, Math.abs(adx) * 0.003);
        vy += Math.sign(ady) * Math.min(0.08, Math.abs(ady) * 0.003);
        vx *= 0.94;
        vy *= 0.94;

        x += vx;
        y += vy;

        if (frameCount % 12 === 0) {
          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + ROCKET_H * 0.44,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.2,
            color: '#22D3EE',
            size: 1,
            alpha: 0.7,
            decay: 0.06
          });
        }

        if (distToHover < 35 && Math.abs(angleDiff) < 0.15) {
          mode = 'LANDING';
        }

      } else if (mode === 'LANDING') {
        if (landingTarget && landingTarget.el) {
          var r = landingTarget.el.getBoundingClientRect();
          landingTarget.y = Math.round(r.top);
        }

        angle += (0 - angle) * 0.15;
        if (legDeploy < 1) legDeploy = Math.min(1, legDeploy + 0.045);

        var touchY = landingTarget.y - legDropDist;
        x += (landingTarget.x - x) * 0.08;
        vy = 0.38;
        y += vy;

        if (frameCount % 4 === 0) {
          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + ROCKET_H * 0.44,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.2 + Math.random() * 0.6,
            color: '#22D3EE',
            size: 1,
            alpha: 0.8,
            decay: 0.06
          });
        }

        if (y >= touchY) {
          y = touchY;
          vx = 0;
          vy = 0;
          mode = 'LANDED';
          landedTimer = 260; // 4.5 seconds

          for (var s = 0; s < 6; s++) {
            particles.push({
              x: x + (Math.random() - 0.5) * 12,
              y: touchY + legDropDist,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -0.4 - Math.random() * 0.5,
              color: '#CFC6B5',
              size: Math.random() > 0.4 ? 2 : 1,
              alpha: 0.9,
              decay: 0.03
            });
          }
        }

      } else if (mode === 'LANDED') {
        if (landingTarget && landingTarget.el) {
          var r = landingTarget.el.getBoundingClientRect();
          landingTarget.y = Math.round(r.top);
          y = landingTarget.y - legDropDist;
        }

        angle = 0;
        vx = 0;
        vy = 0;
        landedTimer--;

        if (frameCount % 60 === 0) {
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + ROCKET_H * 0.42,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.5,
            color: '#CFC6B5',
            size: 1,
            alpha: 0.7,
            decay: 0.04
          });
        }

        if (landedTimer <= 0) {
          mode = 'LIFTOFF';
        }

      } else if (mode === 'LIFTOFF') {
        vy -= 0.16;
        if (vy < -2.4) vy = -2.4;
        y += vy;

        if (legDeploy > 0) legDeploy = Math.max(0, legDeploy - 0.05);

        for (var p = 0; p < 3; p++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + ROCKET_H * 0.44,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2.2 + Math.random() * 1.4,
            color: Math.random() > 0.5 ? '#FFFFFF' : '#22D3EE',
            size: 2,
            alpha: 1,
            decay: 0.04
          });
        }

        if (landingTarget && (y < landingTarget.y - legDropDist - 90)) {
          mode = 'ROAM';
          roamCountdown = 700 + Math.floor(Math.random() * 400);
          pickNewWaypoint();
        }
      }

      // Hard bounds safety check
      if (x < 10) x = 10;
      if (x > width - 10) x = width - 10;
      if (y < 10) y = 10;
      if (y > height - 10) y = height - 10;

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

      // 2. Draw Rocket Sprite & Landing Legs
      if (rocketImg.complete && rocketImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(angle);

        // Draw Landing Legs if deployed
        if (legDeploy > 0.01) {
          var deploy = legDeploy;
          var strutW = Math.max(1, Math.round(ROCKET_W * 0.07));
          var baseW = ROCKET_W * 0.32;
          var baseY = ROCKET_H * 0.36;
          var footSpread = ROCKET_W * 0.22 * deploy;
          var footDrop = ROCKET_H * 0.16 * deploy;

          var lFootX = -baseW - footSpread;
          var rFootX = baseW + footSpread;
          var footY = baseY + footDrop;

          // Outer dark outline
          ctx.strokeStyle = '#1A1A1D';
          ctx.lineWidth = strutW + 2;
          ctx.beginPath();
          ctx.moveTo(-baseW, baseY);
          ctx.lineTo(lFootX, footY);
          ctx.moveTo(baseW, baseY);
          ctx.lineTo(rFootX, footY);
          ctx.stroke();

          // Strut core in cream
          ctx.strokeStyle = '#CFC6B5';
          ctx.lineWidth = strutW;
          ctx.beginPath();
          ctx.moveTo(-baseW, baseY);
          ctx.lineTo(lFootX, footY);
          ctx.moveTo(baseW, baseY);
          ctx.lineTo(rFootX, footY);
          ctx.stroke();

          // Pixel footpads
          var padW = Math.round(strutW * 2.8);
          ctx.fillStyle = '#1A1A1D';
          ctx.fillRect(Math.round(lFootX - padW / 2 - 1), Math.round(footY), padW + 2, 2);
          ctx.fillRect(Math.round(rFootX - padW / 2 - 1), Math.round(footY), padW + 2, 2);
          ctx.fillStyle = '#22D3EE';
          ctx.fillRect(Math.round(lFootX - padW / 2), Math.round(footY), padW, 1);
          ctx.fillRect(Math.round(rFootX - padW / 2), Math.round(footY), padW, 1);
        }

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

      // Interactive Click: Fun speed burst / liftoff
      window.addEventListener('click', function (e) {
        var clickDist = Math.hypot(x - e.clientX, y - e.clientY);
        if (mode === 'LANDED' || clickDist < 250) {
          if (mode === 'LANDED') {
            mode = 'LIFTOFF';
          } else {
            boostTimer = 40;
            targetX = Math.random() > 0.5 ? width * 0.2 : width * 0.8;
            targetY = Math.random() > 0.5 ? height * 0.2 : height * 0.8;
          }
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

/* ── 10. AI PIXEL MASCOTS INTERACTION ──────────────────────────────────── */
(function () {
  var mascots = [
    { id: 'mascot-chatgpt', clickDuration: 750 },
    { id: 'mascot-claude',  clickDuration: 1050 },
    { id: 'mascot-gemini',  clickDuration: 850 }
  ];

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  mascots.forEach(function (m) {
    var el = document.getElementById(m.id);
    if (!el) return;

    // Click / Tap reaction with bounce & kick re-triggers
    var timer = null;
    function triggerAction(e) {
      el.classList.remove('is-acting');
      void el.offsetWidth; // Force reflow to restart CSS keyframe
      el.classList.add('is-acting');

      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        el.classList.remove('is-acting');
      }, m.clickDuration);
    }

    el.addEventListener('click', triggerAction);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerAction();
      }
    });

    // Mobile touch handling (non-intrusive tap detection)
    var touchStartX = 0;
    var touchStartY = 0;
    el.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    el.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
        var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
        if (dx < 12 && dy < 12) {
          triggerAction(e);
        }
      }
    }, { passive: true });
  });

  // Pointer Proximity: subtle interactive tilt when cursor approaches (fine pointer only)
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var ticking = false;
    var mascotEls = mascots.map(function (m) { return document.getElementById(m.id); }).filter(Boolean);

    window.addEventListener('mousemove', function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var mouseX = e.clientX;
        var mouseY = e.clientY;

        mascotEls.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dist = Math.hypot(mouseX - cx, mouseY - cy);

          if (dist < 150) {
            var tilt = ((mouseX - cx) / 150) * 4;
            el.style.setProperty('--tilt-x', tilt.toFixed(2) + 'deg');
          } else {
            el.style.setProperty('--tilt-x', '0deg');
          }
        });
      });
    }, { passive: true });
  }

  // IntersectionObserver: pause animations when scrolled out of view to save CPU/battery
  if ('IntersectionObserver' in window) {
    var mascotObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('mascot-offscreen');
        } else {
          entry.target.classList.add('mascot-offscreen');
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px 120px 0px' });

    mascots.forEach(function (m) {
      var el = document.getElementById(m.id);
      if (el) mascotObserver.observe(el);
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   RETRO LINUX TUX PENGUIN — CONTACT FORM FIELD HOPPER
   Waddles along Name, Email, and Message dividers; executes graceful
   parabolic hops between form fields with landing squash and natural pauses.
═══════════════════════════════════════════════════════════════════════════ */
(function initContactTux() {
  var form = document.getElementById('contact-form');
  var sprite = document.getElementById('contact-tux-sprite');
  if (!form || !sprite) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Field configuration: 0 = Name, 1 = Email, 2 = Message
  var fields = [
    { id: 'contact-name', labelText: 'NAME' },
    { id: 'contact-email', labelText: 'EMAIL' },
    { id: 'contact-message', labelText: 'MESSAGE' }
  ];

  var tuxWidth = 32;
  var tuxHeight = 33;

  // Sprite frames (36x37 frames in 144x37 sheet)
  var FRAMES = {
    STRIDE_1: '0% 0',
    MID_STEP: '33.333% 0',
    STRIDE_2: '66.666% 0',
    AIRBORNE: '100% 0'
  };
  var WALK_CYCLE = [FRAMES.STRIDE_1, FRAMES.MID_STEP, FRAMES.STRIDE_2, FRAMES.MID_STEP];

  function getFieldMetrics(index) {
    var field = fields[index];
    if (!field) return { lineY: 0, minX: 80, maxX: 260 };

    var input = document.getElementById(field.id);
    var group = input ? input.closest('.form-group') : null;
    var label = group ? group.querySelector('label') : null;

    if (!group || !label) {
      return { lineY: 0, minX: 80, maxX: 260 };
    }

    // Vertical line position relative to form
    var lineY = label.offsetTop + Math.floor(label.offsetHeight / 2);

    // Horizontal boundaries: never overlap label text, never overflow form
    var span = label.querySelector('.form-label-text');
    var labelTextRight = span ? (span.offsetLeft + span.offsetWidth) : 60;
    var formWidth = form.offsetWidth || 300;

    var minX = Math.max(72, labelTextRight + 14);
    var maxX = Math.max(minX + 35, formWidth - tuxWidth - 10);

    return { lineY: lineY, minX: minX, maxX: maxX };
  }

  // State variables
  var currentField = 0;       // 0 = Name, 1 = Email, 2 = Message
  var targetField = 0;
  var journeyDir = 1;         // +1 = going down (Name -> Email -> Message), -1 = returning up
  var state = 'WALK';         // 'WALK', 'PAUSE', 'HOP', 'LAND'

  var posX = 90;
  var posY = 0;
  var facing = 1;             // +1 = facing right, -1 = facing left
  var speed = 0.42;           // slow waddle speed (~25px/sec)

  var walkAnimTimer = 0;
  var walkFrameIndex = 0;
  var walkDistanceRemaining = 0;

  var pauseTimer = 0;
  var fieldTimeElapsed = 0;
  var fieldTimeLimit = 6500;  // 6.5s exploration before next hop

  // Hop trajectory
  var hopStartTime = 0;
  var hopDuration = 1000;     // 1000ms slow, graceful arc
  var hopStartX = 0;
  var hopStartY = 0;
  var hopEndX = 0;
  var hopEndY = 0;
  var hopPeakH = 24;

  var landTimer = 0;
  var isVisible = true;
  var isRunning = true;
  var rafId = null;
  var lastTime = 0;

  function setFrame(framePosition) {
    sprite.style.backgroundPosition = framePosition;
  }

  function renderTux(extraScaleX, extraScaleY, extraRotate) {
    var sX = (extraScaleX !== undefined ? extraScaleX : 1.0) * facing;
    var sY = extraScaleY !== undefined ? extraScaleY : 1.0;
    var rot = extraRotate ? ' rotate(' + extraRotate.toFixed(1) + 'deg)' : '';

    sprite.style.left = Math.round(posX) + 'px';
    sprite.style.top = Math.round(posY) + 'px';
    sprite.style.transform = 'scale(' + sX.toFixed(3) + ', ' + sY.toFixed(3) + ')' + rot;
  }

  function chooseNewWalk() {
    var m = getFieldMetrics(currentField);
    // Pick distance: 30 to 65px
    var dist = 30 + Math.random() * 35;
    if (Math.random() < 0.45) {
      facing = -facing;
    }
    // Ensure we don't walk outside bounds
    if (facing > 0 && posX + dist > m.maxX) {
      facing = -1;
    } else if (facing < 0 && posX - dist < m.minX) {
      facing = 1;
    }
    walkDistanceRemaining = dist;
    state = 'WALK';
  }

  function startPause(duration) {
    state = 'PAUSE';
    pauseTimer = duration || (1800 + Math.random() * 1600);
    setFrame(FRAMES.STRIDE_1);
    renderTux(1.0, 1.0);
  }

  function triggerNextHop() {
    // Determine next field
    var nextField;
    if (journeyDir > 0) {
      // Going downwards: 0 -> 1 -> 2
      if (currentField === 0) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 2;
        journeyDir = -1; // Next journey will be return
      }
    } else {
      // Going upwards: 2 -> 1 -> 0
      if (currentField === 2) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 0;
        journeyDir = 1;  // Cycle repeats
      }
    }

    var startMetrics = getFieldMetrics(currentField);
    var endMetrics = getFieldMetrics(nextField);

    hopStartX = posX;
    hopStartY = startMetrics.lineY - tuxHeight + 1;

    // Choose a gentle landing X on target field
    var targetX = endMetrics.minX + 20 + Math.random() * (endMetrics.maxX - endMetrics.minX - 40);
    hopEndX = Math.min(Math.max(targetX, endMetrics.minX), endMetrics.maxX);
    hopEndY = endMetrics.lineY - tuxHeight + 1;

    facing = hopEndX >= hopStartX ? 1 : -1;

    // Arc peak: upward jumps need more vertical clearance
    if (nextField < currentField) {
      hopPeakH = 34; // Leaping up
      hopDuration = 1100;
    } else {
      hopPeakH = 22; // Leaping down
      hopDuration = 950;
    }

    hopStartTime = performance.now();
    targetField = nextField;
    state = 'HOP';
    setFrame(FRAMES.AIRBORNE);
  }

  function update(dt) {
    if (prefersReduced) return;

    if (state === 'WALK') {
      fieldTimeElapsed += dt;
      var step = speed * (dt / 16.666);
      posX += facing * step;
      walkDistanceRemaining -= step;

      var m = getFieldMetrics(currentField);
      if (posX < m.minX) {
        posX = m.minX;
        facing = 1;
      } else if (posX > m.maxX) {
        posX = m.maxX;
        facing = -1;
      }

      // Animate waddle frames
      walkAnimTimer += dt;
      if (walkAnimTimer >= 135) {
        walkAnimTimer = 0;
        walkFrameIndex = (walkFrameIndex + 1) % WALK_CYCLE.length;
        setFrame(WALK_CYCLE[walkFrameIndex]);
      }

      renderTux(1.0, 1.0);

      if (walkDistanceRemaining <= 0) {
        startPause();
      } else if (fieldTimeElapsed >= fieldTimeLimit) {
        fieldTimeElapsed = 0;
        fieldTimeLimit = 6000 + Math.random() * 3000;
        triggerNextHop();
      }
    } else if (state === 'PAUSE') {
      fieldTimeElapsed += dt;
      pauseTimer -= dt;
      if (pauseTimer <= 0) {
        if (fieldTimeElapsed >= fieldTimeLimit) {
          fieldTimeElapsed = 0;
          fieldTimeLimit = 6000 + Math.random() * 3000;
          triggerNextHop();
        } else {
          chooseNewWalk();
        }
      }
    } else if (state === 'HOP') {
      var elapsed = performance.now() - hopStartTime;
      var t = Math.min(1.0, elapsed / hopDuration);

      // Parabolic trajectory: y(t) = y0 + (y1 - y0)*t - 4*peak*t*(1-t)
      posX = hopStartX + (hopEndX - hopStartX) * t;
      posY = hopStartY + (hopEndY - hopStartY) * t - 4 * hopPeakH * t * (1.0 - t);

      // Airborne flight tilt
      var tilt = facing * Math.sin(t * Math.PI) * 7.5;
      renderTux(1.0, 1.0, tilt);

      if (t >= 1.0) {
        // Land precisely on target divider
        posX = hopEndX;
        posY = hopEndY;
        currentField = targetField;
        state = 'LAND';
        landTimer = 140; // 140ms squash duration
        setFrame(FRAMES.STRIDE_1);
        // Squash: widen and flatten slightly
        renderTux(1.15, 0.85, 0);
      }
    } else if (state === 'LAND') {
      landTimer -= dt;
      if (landTimer <= 0) {
        // Recover from squash back to normal scale
        renderTux(1.0, 1.0, 0);
        startPause(1400 + Math.random() * 1000);
      }
    }
  }

  function loop(now) {
    if (!isRunning) return;
    if (!lastTime) lastTime = now;
    var dt = Math.min(100, now - lastTime);
    lastTime = now;

    if (isVisible) {
      update(dt);
    }

    rafId = requestAnimationFrame(loop);
  }

  function snapToField() {
    var m = getFieldMetrics(currentField);
    posY = m.lineY - tuxHeight + 1;
    posX = Math.min(Math.max(posX, m.minX), m.maxX);
    renderTux(1.0, 1.0);
  }

  function init() {
    // Initial positioning on Name divider line
    var m = getFieldMetrics(0);
    currentField = 0;
    journeyDir = 1;
    posX = m.minX + 24;
    posY = m.lineY - tuxHeight + 1;
    facing = 1;

    setFrame(FRAMES.STRIDE_1);
    renderTux(1.0, 1.0);

    if (prefersReduced) return;

    window.addEventListener('resize', snapToField, { passive: true });

    // Pause when scrolled off-screen or tab hidden
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          isVisible = e.isIntersecting;
        });
      }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
      obs.observe(form);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        isVisible = false;
      } else {
        isVisible = true;
        lastTime = performance.now();
      }
    });

    lastTime = performance.now();
    startPause(2000);
    rafId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
