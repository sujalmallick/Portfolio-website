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

// Close mobile menu when clicking outside or pressing Escape
document.addEventListener('click', function (e) {
  var menu = document.getElementById('mobile-menu');
  var icon = document.getElementById('hamburger-btn');
  if (!menu || !icon || !menu.classList.contains('open')) return;
  if (!menu.contains(e.target) && !icon.contains(e.target)) {
    menu.classList.remove('open');
    icon.classList.remove('open');
    icon.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var menu = document.getElementById('mobile-menu');
    var icon = document.getElementById('hamburger-btn');
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      icon.classList.remove('open');
      icon.setAttribute('aria-expanded', 'false');
    }
  }
});

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
     3. Terminator character patrolling with authentic firing recoil, visor glint, and muzzle flash
     4. Code Badge Conveyor Stream: shoots Python, JS, C++, Java, and Code badges with glowing cyan separator dots
     5. Interactive Click Overdrive burst and seamless transparent background
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

  // Workstation + right-props are drawn as pure canvas pixel art (no PNGs)
  // so there is zero risk of opaque background panels.

  var robotImg = new Image();
  robotImg.src = 'assets/pixel-terminator.png';

  var robotStepImg = new Image();
  robotStepImg.src = 'assets/pixel-terminator-step.png';

  var muzzleImg = new Image();
  muzzleImg.src = 'assets/muzzle-flash.png';

  // Floating Code Badges (Restored Original Tech Badges)
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

  // Constants
  var ROBOT_DRAW_W = 50;
  var ROBOT_DRAW_H = 55;
  var BARREL_OFFSET_X = 2;   // Relative to droid top-left when facing left
  var BARREL_OFFSET_Y = 24;  // Rifle tip Y relative to droid top
  var BADGE_SPACING = 38;
  var BASE_SPEED = 1.05;
  var WALK_SPEED = 0.58;

  // State variables
  var frameCount = 0;
  var recoilOffset = 0;
  var isOverdrive = false;
  var overdriveTimer = 0;
  var nextBadgeIndex = 0;

  // Terminator Patrol State
  var robotX = 640;
  var facing = -1; // -1 = left, 1 = right
  var patrolState = 'PATROL_LEFT';
  var stateTimer = 0;
  var walkFrame = 0;
  var walkStepTimer = 0;

  // Badge Conveyor Stream Items & Particles
  var streamItems = [];
  var pixelDust = [];
  var muzzleSparks = [];

  // Workstation Server Rack LEDs (4 bays, staggered blinking intervals)
  var serverLeds = [
    { xOff: 11, yOff: 9,  period: 22, phase: 2,  color: '#10b981' },
    { xOff: 18, yOff: 9,  period: 38, phase: 11, color: '#34d399' },
    { xOff: 25, yOff: 9,  period: 50, phase: 24, color: '#f59e0b' },
    { xOff: 11, yOff: 21, period: 28, phase: 7,  color: '#10b981' },
    { xOff: 18, yOff: 21, period: 44, phase: 19, color: '#10b981' },
    { xOff: 25, yOff: 21, period: 32, phase: 14, color: '#34d399' },
    { xOff: 11, yOff: 33, period: 35, phase: 5,  color: '#34d399' },
    { xOff: 18, yOff: 33, period: 26, phase: 17, color: '#10b981' },
    { xOff: 25, yOff: 33, period: 55, phase: 31, color: '#f59e0b' },
    { xOff: 11, yOff: 45, period: 40, phase: 9,  color: '#10b981' },
    { xOff: 18, yOff: 45, period: 30, phase: 21, color: '#34d399' },
    { xOff: 25, yOff: 45, period: 48, phase: 3,  color: '#10b981' }
  ];

  // Ambient gentle floating fireflies / data specks
  var ambientFireflies = [];
  for (var a = 0; a < 6; a++) {
    ambientFireflies.push({
      x: Math.random() * 1000,
      y: 20 + Math.random() * 68,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.15 - Math.random() * 0.25,
      color: Math.random() > 0.4 ? '#22d3ee' : '#f59e0b',
      phase: Math.random() * 6.28,
      size: Math.random() > 0.5 ? 2 : 1
    });
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(54, Math.floor(rect.height || 96));
    canvas.width = width;
    canvas.height = height;

    var minPatrolX = Math.max(380, Math.min(width * 0.45, width - 210));
    var maxPatrolX = Math.min(width - 130, Math.max(minPatrolX + 60, width * 0.78));
    if (robotX < minPatrolX) robotX = minPatrolX;
    if (robotX > maxPatrolX) robotX = maxPatrolX;
  }

  function spawnMuzzleSparks(x, y) {
    var count = isOverdrive ? 5 : 3;
    for (var i = 0; i < count; i++) {
      var angle = Math.PI + (Math.random() - 0.5) * 0.8;
      var spd = 1.4 + Math.random() * 2.4;
      muzzleSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: Math.random() > 0.3 ? '#22d3ee' : '#cfc6b5',
        life: 12 + Math.floor(Math.random() * 8),
        maxLife: 20,
        size: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  function update() {
    frameCount++;

    if (isOverdrive) {
      overdriveTimer--;
      if (overdriveTimer <= 0) isOverdrive = false;
    }

    recoilOffset *= 0.82;
    if (recoilOffset < 0.1) recoilOffset = 0;

    var streamSpeed = isOverdrive ? BASE_SPEED * 1.9 : BASE_SPEED;
    var wSpeed = isOverdrive ? WALK_SPEED * 1.5 : WALK_SPEED;
    var groundY = height - 2;
    var robotY = groundY - ROBOT_DRAW_H + 2;

    var minPatrolX = Math.max(380, Math.min(width * 0.45, width - 210));
    var maxPatrolX = Math.min(width - 130, Math.max(minPatrolX + 60, width * 0.78));

    // Terminator Robot Patrol
    if (patrolState === 'PATROL_LEFT') {
      facing = -1;
      robotX -= wSpeed;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX <= minPatrolX) {
        robotX = minPatrolX;
        patrolState = 'SCAN';
        stateTimer = 48; // pause and scan
        walkFrame = 0;
      }
    } else if (patrolState === 'PATROL_RIGHT') {
      facing = 1;
      robotX += wSpeed;
      walkStepTimer++;
      if (walkStepTimer >= 8) {
        walkStepTimer = 0;
        walkFrame = (walkFrame + 1) % 2;
      }
      if (robotX >= maxPatrolX) {
        robotX = maxPatrolX;
        patrolState = 'SCAN';
        stateTimer = 44; // pause and scan
        walkFrame = 0;
      }
    } else if (patrolState === 'SCAN') {
      walkFrame = 0;
      stateTimer--;
      if (stateTimer <= 0) {
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
    var stepBob = isMoving ? (Math.sin(frameCount * 0.32) * 1.4) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var muzzleTipX = drawRobotX + BARREL_OFFSET_X;
    var muzzleTipY = robotY + BARREL_OFFSET_Y + stepBob;

    // Badge Conveyor Stream Update
    for (var i = streamItems.length - 1; i >= 0; i--) {
      var item = streamItems[i];
      item.x -= streamSpeed;

      // Dissolve near workstation boundary (x < 375) and spawn glowing pixel dust
      if (item.x < 375) {
        item.alpha = Math.max(0, (item.x - 330) / 45);
        if (Math.random() < 0.35) {
          pixelDust.push({
            x: item.x + Math.random() * 10,
            y: item.y + (Math.random() - 0.5) * 10,
            vx: -0.8 - Math.random() * 0.8,
            vy: (Math.random() - 0.5) * 1.2,
            color: Math.random() > 0.4 ? '#22d3ee' : '#cfc6b5',
            alpha: 1,
            size: Math.random() > 0.5 ? 2 : 1,
            decay: 0.04 + Math.random() * 0.03
          });
        }
      }

      if (item.x < 310 || item.alpha <= 0) {
        streamItems.splice(i, 1);
      }
    }

    // Firing logic: fire tech badges from muzzle when facing left or scanning left
    if (facing === -1) {
      var rightmost = streamItems.length > 0 ? streamItems[streamItems.length - 1] : null;
      var spawnStartX = muzzleTipX - 16;

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
          recoilOffset = isOverdrive ? 3.0 : 1.8;
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
      var dust = pixelDust[j];
      dust.x += dust.vx;
      dust.y += dust.vy;
      dust.alpha -= dust.decay;
      if (dust.alpha <= 0) {
        pixelDust.splice(j, 1);
      }
    }

    // Update muzzle sparks
    for (var sIdx = muzzleSparks.length - 1; sIdx >= 0; sIdx--) {
      var spk = muzzleSparks[sIdx];
      spk.x += spk.vx;
      spk.y += spk.vy;
      spk.life--;
      if (spk.life <= 0) {
        muzzleSparks.splice(sIdx, 1);
      }
    }

    // Update ambient fireflies
    for (var af = 0; af < ambientFireflies.length; af++) {
      var ff = ambientFireflies[af];
      ff.x += ff.vx;
      ff.y += ff.vy;
      if (ff.y < 10) {
        ff.y = groundY - 6;
        ff.x = Math.random() * width;
      }
      if (ff.x < 0) ff.x = width;
      if (ff.x > width) ff.x = 0;
    }
  }

  function render() {
    // 1. Transparent Clear (Matches page background seamlessly with ZERO rectangular boundary!)
    ctx.clearRect(0, 0, width, height);

    var groundY = height - 2;

    // 2. Integrated Thin Ground Line across full footer
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(0, groundY, width, 1);
    ctx.fillStyle = '#282b34';
    ctx.fillRect(0, groundY + 1, width, 1);

    // Full-width grass tufts along the ground line (matches reference image)
    var grassSeeds = [0, 22, 38, 55, 74, 92, 110, 130, 148, 166, 188, 208,
                      228, 248, 268, 292, 314, 336, 358, 380, 406, 428,
                      452, 474, 498, 524, 548, 574, 598, 624, 652, 678,
                      704, 728, 754, 778, 804, 828, 856, 882, 908, 932,
                      958, 984];
    for (var gi = 0; gi < grassSeeds.length; gi++) {
      var gx = Math.round(grassSeeds[gi] * width / 1000);
      if (gx < 0 || gx > width - 4) continue;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(gx,     groundY - 5, 2, 5);
      ctx.fillRect(gx + 4, groundY - 7, 2, 7);
      ctx.fillRect(gx + 8, groundY - 4, 2, 4);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(gx + 2, groundY - 3, 2, 3);
      ctx.fillRect(gx + 6, groundY - 5, 2, 5);
    }

    // 3. Ambient Floating Fireflies
    for (var af = 0; af < ambientFireflies.length; af++) {
      var ff = ambientFireflies[af];
      var ffAlpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(frameCount * 0.05 + ff.phase));
      ctx.fillStyle = ff.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, ffAlpha));
      ctx.fillRect(Math.round(ff.x), Math.round(ff.y), ff.size, ff.size);
    }
    ctx.globalAlpha = 1.0;

    // 4. LEFT WORKSTATION — pure canvas pixel art, all elements bottomed at groundY
    (function drawWorkstation() {
      var gY = groundY;

      // ── Amber street lamp ────────────────────────────────────────────────
      var lmpX = 14, lmpH = 60;
      // base plate
      ctx.fillStyle = '#374151';
      ctx.fillRect(lmpX - 4, gY - 6, 14, 6);
      // pole
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(lmpX + 2, gY - lmpH, 4, lmpH - 6);
      // horizontal arm
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(lmpX + 2, gY - lmpH, 22, 3);
      // lamp head
      ctx.fillStyle = '#374151';
      ctx.fillRect(lmpX + 18, gY - lmpH - 10, 14, 10);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(lmpX + 20, gY - lmpH - 8, 10, 6);
      // amber lens (pulses)
      var lampGlow = 0.75 + 0.22 * Math.sin(frameCount * 0.045);
      ctx.fillStyle = 'rgba(251,191,36,' + lampGlow.toFixed(2) + ')';
      ctx.fillRect(lmpX + 21, gY - lmpH - 7, 8, 4);
      // bloom
      var lg = ctx.createRadialGradient(lmpX+25, gY-lmpH-5, 1, lmpX+25, gY-lmpH-5, 32);
      lg.addColorStop(0, 'rgba(251,191,36,0.18)');
      lg.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(lmpX+25, gY-lmpH-5, 32, 0, Math.PI*2); ctx.fill();

      // ── Potted plant ─────────────────────────────────────────────────────
      var pX = 54;
      // pot body — bottomed at gY
      ctx.fillStyle = '#f5f5f4';
      ctx.fillRect(pX,     gY - 16, 18, 12);
      ctx.fillStyle = '#d6d3d1';
      ctx.fillRect(pX + 2, gY - 18, 14, 4);
      // soil
      ctx.fillStyle = '#3f2d1e';
      ctx.fillRect(pX + 2, gY - 16, 14, 4);
      // stem
      ctx.fillStyle = '#15803d';
      ctx.fillRect(pX + 8, gY - 34, 2, 18);
      // leaves
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(pX + 2, gY - 40, 8, 6);
      ctx.fillRect(pX + 10, gY - 44, 8, 6);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(pX + 4,  gY - 38, 6, 4);
      ctx.fillRect(pX + 12, gY - 42, 6, 4);
      ctx.fillStyle = '#166534';
      ctx.fillRect(pX + 2,  gY - 36, 4, 3);
      ctx.fillRect(pX + 14, gY - 40, 4, 3);

      // ── R2-style droid ───────────────────────────────────────────────────
      var dX = 92;
      // legs — bottom at gY
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(dX + 2,  gY - 14, 6, 14);
      ctx.fillRect(dX + 16, gY - 14, 6, 14);
      // feet
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(dX,      gY - 4, 8, 4);
      ctx.fillRect(dX + 16, gY - 4, 8, 4);
      // body — bottom at gY-14
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(dX + 2, gY - 34, 20, 20);
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(dX + 4, gY - 32, 16, 16);
      // chest panel
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(dX + 7, gY - 30, 10, 12);
      ctx.fillStyle = '#374151';
      ctx.fillRect(dX + 9, gY - 28, 6, 8);
      // shoulder collar
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(dX, gY - 36, 24, 4);
      // dome
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(dX + 4, gY - 48, 16, 14);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(dX + 2, gY - 38, 20, 4);
      // visor band
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(dX + 4, gY - 46, 16, 5);
      // optic (blinks)
      if (Math.sin(frameCount * 0.08) > 0.3) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(dX + 9, gY - 44, 6, 3);
      }
      if ((frameCount % 120) < 18) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dX + 17, gY - 43, 2, 2);
      }

      // ── CRT monitor on desk ──────────────────────────────────────────────
      var mX = 138;
      var dkH = 14; // desk height
      // desk top
      ctx.fillStyle = '#92400e';
      ctx.fillRect(mX - 6, gY - dkH, 58, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(mX - 6, gY - dkH, 58, 2);
      // desk legs
      ctx.fillStyle = '#6b3a1f';
      ctx.fillRect(mX - 4,  gY - dkH + 4, 5, dkH - 4);
      ctx.fillRect(mX + 45, gY - dkH + 4, 5, dkH - 4);
      // monitor neck / stand
      ctx.fillStyle = '#374151';
      ctx.fillRect(mX + 20, gY - dkH - 6, 6, 6);
      ctx.fillRect(mX + 16, gY - dkH - 8, 14, 3);
      // monitor outer bezel
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(mX + 2, gY - dkH - 52, 42, 46);
      // inner bezel
      ctx.fillStyle = '#111827';
      ctx.fillRect(mX + 4, gY - dkH - 50, 38, 42);
      // screen
      ctx.fillStyle = '#052e16';
      ctx.fillRect(mX + 6, gY - dkH - 48, 34, 38);
      // code lines
      ctx.fillStyle = 'rgba(74,222,128,0.65)';
      ctx.fillRect(mX + 8,  gY - dkH - 46, 18, 2);
      ctx.fillRect(mX + 8,  gY - dkH - 42, 26, 2);
      ctx.fillRect(mX + 8,  gY - dkH - 38, 14, 2);
      ctx.fillRect(mX + 12, gY - dkH - 34, 22, 2);
      ctx.fillRect(mX + 8,  gY - dkH - 30, 20, 2);
      ctx.fillRect(mX + 8,  gY - dkH - 26, 10, 2);
      ctx.fillRect(mX + 8,  gY - dkH - 22, 16, 2);
      // scan shimmer
      if ((frameCount % 160) < 20) {
        ctx.fillStyle = 'rgba(74,222,128,0.15)';
        ctx.fillRect(mX + 6, gY - dkH - 36, 34, 3);
      }
      // blinking cursor
      if ((frameCount % 50) < 26) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(mX + 8, gY - dkH - 18, 6, 3);
      }
      // power LED
      ctx.fillStyle = (frameCount % 60) < 30 ? '#22d3ee' : '#164e63';
      ctx.fillRect(mX + 38, gY - dkH - 8, 2, 2);

      // ── Server rack ──────────────────────────────────────────────────────
      var rX = 206;
      var rkH = 80; // rack height — bottom at gY
      // outer chassis
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rX, gY - rkH, 46, rkH);
      // inner panel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rX + 2, gY - rkH + 2, 42, rkH - 4);
      // 4 rack bays
      for (var bay = 0; bay < 4; bay++) {
        var byY = gY - rkH + 4 + bay * 18;
        // bay face
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rX + 3, byY, 40, 16);
        // bay top stripe
        ctx.fillStyle = '#334155';
        ctx.fillRect(rX + 4, byY + 1, 38, 2);
        // drive slot
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rX + 28, byY + 5, 12, 7);
        // LED indicators
        for (var lIdx = 0; lIdx < serverLeds.length; lIdx++) {
          var led = serverLeds[lIdx];
          if (Math.floor(led.yOff / 12) === bay) {
            var isOn = ((frameCount + led.phase) % led.period) < (led.period * 0.52);
            if (isOn) {
              ctx.fillStyle = led.color;
              ctx.fillRect(rX + 5 + led.xOff, byY + 5, 2, 2);
            }
          }
        }
      }
      // vent strip at bottom
      ctx.fillStyle = '#0f172a';
      for (var vt = 0; vt < 6; vt++) {
        ctx.fillRect(rX + 4 + vt * 7, gY - 8, 4, 5);
      }
      // rack handles
      ctx.fillStyle = '#475569';
      ctx.fillRect(rX + 2, gY - rkH + 4, 2, rkH - 12);
      ctx.fillRect(rX + 42, gY - rkH + 4, 2, rkH - 12);
    })();

    // 5. RIGHT PROPS — pure canvas pixel art, all elements bottomed at groundY
    (function drawRightProps() {
      var gY = groundY;
      var rBase = width - 148;

      // ── Scattered rocks ──────────────────────────────────────────────────
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(rBase,      gY - 8,  16, 8);
      ctx.fillRect(rBase + 20, gY - 5,  12, 5);
      ctx.fillStyle = '#374151';
      ctx.fillRect(rBase + 4,  gY - 10,  8, 4);
      ctx.fillRect(rBase + 22, gY - 7,   6, 3);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(rBase + 2,  gY - 6,   6, 2);

      // ── Wooden crate ─────────────────────────────────────────────────────
      var cX = rBase + 36;
      // main body
      ctx.fillStyle = '#a16207';
      ctx.fillRect(cX, gY - 32, 32, 32);
      // wood grain planks
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(cX,      gY - 20, 32, 3);
      ctx.fillRect(cX + 14, gY - 32, 3, 32);
      // metal corner braces
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(cX,      gY - 32, 5, 5);
      ctx.fillRect(cX + 27, gY - 32, 5, 5);
      ctx.fillRect(cX,      gY - 5,  5, 5);
      ctx.fillRect(cX + 27, gY - 5,  5, 5);
      // highlight top edge
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(cX + 1, gY - 31, 30, 2);

      // ── Rocks right of crate ─────────────────────────────────────────────
      ctx.fillStyle = '#374151';
      ctx.fillRect(rBase + 72, gY - 7, 14, 7);
      ctx.fillRect(rBase + 90, gY - 4,  8, 4);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(rBase + 76, gY - 9,  6, 4);

      // ── Amber standing lantern ────────────────────────────────────────────
      var lX = rBase + 108;
      var lH  = 62;
      // base plate
      ctx.fillStyle = '#374151';
      ctx.fillRect(lX - 4, gY - 6, 16, 6);
      // pole
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(lX + 2, gY - lH, 4, lH - 6);
      // horizontal arm
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(lX - 8, gY - lH, 4, 3);
      ctx.fillRect(lX - 8, gY - lH, 22, 3);
      // lamp head
      ctx.fillStyle = '#374151';
      ctx.fillRect(lX - 10, gY - lH - 10, 14, 10);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(lX - 8,  gY - lH - 8,  10, 6);
      // flame flicker
      var flameBob = Math.round(Math.sin(frameCount * 0.28) * 1.5);
      ctx.fillStyle = 'rgba(251,191,36,' + (0.75 + 0.22 * Math.sin(frameCount * 0.045)).toFixed(2) + ')';
      ctx.fillRect(lX - 7, gY - lH - 7 + flameBob, 8, 4);
      // bloom
      var tg = ctx.createRadialGradient(lX-3, gY-lH-5, 1, lX-3, gY-lH-5, 28);
      tg.addColorStop(0, 'rgba(251,191,36,0.16)');
      tg.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(lX-3, gY-lH-5, 28, 0, Math.PI*2); ctx.fill();
    })();

    // 6. Streaming Tech Badges & Glowing Cyan Dots (Terminator Code Stream)
    var isMoving = (patrolState === 'PATROL_LEFT' || patrolState === 'PATROL_RIGHT');
    var stepBob = isMoving ? (Math.sin(frameCount * 0.32) * 1.4) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var rx = Math.round(drawRobotX);
    var ry = Math.round(groundY - ROBOT_DRAW_H + 2 + stepBob);
    var muzzleTipX = rx + BARREL_OFFSET_X;
    var muzzleTipY = ry + BARREL_OFFSET_Y;

    for (var bIdx = 0; bIdx < streamItems.length; bIdx++) {
      var item = streamItems[bIdx];
      if (item.alpha <= 0.02) continue;

      var floatY = Math.sin(item.x * 0.05 + item.waveOffset) * 1.2;
      var drawCenterY = Math.round(muzzleTipY + floatY);

      if (item.type === 'dot') {
        // Glowing cyan separator dot
        ctx.save();
        ctx.globalAlpha = Math.max(0, item.alpha);
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
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

    // 7. Dissolving Pixel Dust
    for (var pd = 0; pd < pixelDust.length; pd++) {
      var dust = pixelDust[pd];
      if (dust.alpha > 0) {
        ctx.save();
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, dust.alpha));
        ctx.fillRect(Math.round(dust.x), Math.round(dust.y), dust.size, dust.size);
        ctx.restore();
      }
    }

    // 8. Cyan Muzzle Flash (When Terminator fires)
    if (facing === -1 && muzzleImg.complete && muzzleImg.naturalWidth > 0) {
      ctx.save();
      var mPulse = isOverdrive ? (1.15 + 0.25 * Math.sin(frameCount * 0.6)) : (0.85 + 0.15 * Math.sin(frameCount * 0.35));
      var mWidth = Math.round(20 * mPulse);
      var mHeight = Math.round(18 * mPulse);
      var mJitterX = (Math.random() - 0.5) * 0.8;
      var mJitterY = (Math.random() - 0.5) * 0.8;
      var mX = Math.round(muzzleTipX - mWidth + 2 + mJitterX);
      var mY = Math.round(muzzleTipY - mHeight / 2 + mJitterY);

      ctx.globalAlpha = isOverdrive ? 1 : 0.92;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = isOverdrive ? 10 : 6;
      ctx.drawImage(muzzleImg, mX, mY, mWidth, mHeight);
      ctx.restore();
    }

    // 9. Muzzle Sparks
    for (var spkIdx = 0; spkIdx < muzzleSparks.length; spkIdx++) {
      var s = muzzleSparks[spkIdx];
      var sAlpha = (s.life / s.maxLife);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, sAlpha));
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }
    ctx.globalAlpha = 1.0;

    // 10. Preserved Terminator Character (Sprite & Animation)
    var droidSprite = (walkFrame === 1 && robotStepImg.complete && robotStepImg.naturalWidth > 0)
      ? robotStepImg
      : robotImg;

    if (droidSprite.complete && droidSprite.naturalWidth > 0) {
      ctx.save();
      if (facing === -1) {
        // Facing Left (Firing towards workstation)
        ctx.drawImage(droidSprite, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Cyan Visor Glint
        if (patrolState === 'SCAN' || Math.sin(frameCount * 0.08) > 0.6) {
          ctx.fillStyle = '#22d3ee';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(rx + 9, ry + 15, 3, 2);
        }
      } else {
        // Facing Right (Mirrored)
        ctx.translate(rx + ROBOT_DRAW_W, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(droidSprite, 0, 0, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Visor Glint
        if (patrolState === 'SCAN' || Math.sin(frameCount * 0.08) > 0.6) {
          ctx.fillStyle = '#22d3ee';
          ctx.globalAlpha = 0.8;
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

  // Interactive Click Easter Egg: Rapid-fire overdrive
  if (container) {
    container.addEventListener('click', function () {
      isOverdrive = true;
      overdriveTimer = 90; // ~1.5s overdrive
      recoilOffset = 3.6;
      var groundY = height - 2;
      var ry = groundY - ROBOT_DRAW_H + 2;
      var muzzleTipX = robotX + BARREL_OFFSET_X;
      var muzzleTipY = ry + BARREL_OFFSET_Y;
      spawnMuzzleSparks(muzzleTipX, muzzleTipY);
      spawnMuzzleSparks(muzzleTipX, muzzleTipY);
    });
  }

  function drawStaticFallback() {
    resize();
    render();
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      // Workstation & right-props are pure canvas now — no image to wait for.
      // Just draw once the Terminator sprite is ready (or immediately).
      robotImg.onload = drawStaticFallback;
      drawStaticFallback();
      return;
    }

    isRunning = true;
    rafId = requestAnimationFrame(loop);

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

  var tuxWidth = 36;
  var tuxHeight = 37;

  // Sprite frames (36x37 frames in 144x37 sheet: 4 frames)
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

    // Precise client bounding rect relative to form container
    var formRect = form.getBoundingClientRect();
    var labelRect = label.getBoundingClientRect();
    var lineY = labelRect.top - formRect.top + Math.floor(labelRect.height / 2);

    // Horizontal boundaries: never overlap label text, never overflow form
    var span = label.querySelector('.form-label-text');
    var spanRect = span ? span.getBoundingClientRect() : labelRect;
    var minX = spanRect.right - formRect.left + 16;
    var maxX = Math.max(minX + 35, formRect.width - tuxWidth - 14);

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
  var speed = 0.40;           // slow waddle speed (~24px/sec)

  var walkAnimTimer = 0;
  var walkFrameIndex = 0;
  var walkDistanceRemaining = 0;

  var pauseTimer = 0;
  var fieldTimeElapsed = 0;
  var fieldTimeLimit = 4200;  // 4.2s exploration before next hop

  // Hop trajectory
  var hopStartTime = 0;
  var hopDuration = 2400;     // 2.2s - 2.6s slow, graceful parabolic arc
  var hopStartX = 0;
  var hopStartY = 0;
  var hopEndX = 0;
  var hopEndY = 0;
  var hopPeakH = 20;

  var landTimer = 0;
  var isVisible = true;
  var isRunning = true;
  var rafId = null;
  var lastTime = 0;

  function setFrame(framePosition) {
    sprite.style.backgroundPosition = framePosition;
  }

  function renderTux(extraScaleX, extraScaleY, extraRotate, extraOffsetY) {
    var sX = (extraScaleX !== undefined ? extraScaleX : 1.0) * facing;
    var sY = extraScaleY !== undefined ? extraScaleY : 1.0;
    var rot = extraRotate ? ' rotate(' + extraRotate.toFixed(1) + 'deg)' : '';
    var offY = extraOffsetY || 0;

    sprite.style.left = Math.round(posX) + 'px';
    sprite.style.top = Math.round(posY + offY) + 'px';
    sprite.style.transform = 'scale(' + sX.toFixed(3) + ', ' + sY.toFixed(3) + ')' + rot;
  }

  function chooseNewWalk() {
    var m = getFieldMetrics(currentField);
    var dist = 25 + Math.random() * 35;
    if (Math.random() < 0.45) {
      facing = -facing;
    }
    // Keep strictly within field divider boundaries
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
    // Sequence: Name -> Email -> Message -> Email -> Name
    var nextField;
    if (journeyDir > 0) {
      if (currentField === 0) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 2;
        journeyDir = -1; // Begin return journey next
      }
    } else {
      if (currentField === 2) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 0;
        journeyDir = 1;  // Repeat cycle from Name
      }
    }

    var startMetrics = getFieldMetrics(currentField);
    var endMetrics = getFieldMetrics(nextField);

    // Row 35 is Tux's feet, aligning precisely with lineY
    hopStartX = posX;
    hopStartY = startMetrics.lineY - 35;

    // Gentle landing X on target field
    var targetX = endMetrics.minX + 20 + Math.random() * Math.max(10, endMetrics.maxX - endMetrics.minX - 40);
    hopEndX = Math.min(Math.max(targetX, endMetrics.minX), endMetrics.maxX);
    hopEndY = endMetrics.lineY - 35;

    facing = hopEndX >= hopStartX ? 1 : -1;

    // Parabolic arc peak and timing: upward jumps get more vertical clearance
    if (nextField < currentField) {
      hopPeakH = 30; // Upward leap arc
      hopDuration = 2400 + Math.random() * 250;
    } else {
      hopPeakH = 20; // Downward hop arc
      hopDuration = 2200 + Math.random() * 250;
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

      // Waddle leg swing
      walkAnimTimer += dt;
      if (walkAnimTimer >= 140) {
        walkAnimTimer = 0;
        walkFrameIndex = (walkFrameIndex + 1) % WALK_CYCLE.length;
        setFrame(WALK_CYCLE[walkFrameIndex]);
      }

      renderTux(1.0, 1.0);

      if (walkDistanceRemaining <= 0) {
        startPause();
      } else if (fieldTimeElapsed >= fieldTimeLimit) {
        fieldTimeElapsed = 0;
        fieldTimeLimit = 3600 + Math.random() * 2000;
        triggerNextHop();
      }
    } else if (state === 'PAUSE') {
      fieldTimeElapsed += dt;
      pauseTimer -= dt;

      // Gentle 1px breathing bob during idle
      var idleBob = Math.sin(performance.now() * 0.0032) * 1.0;
      renderTux(1.0, 1.0, 0, idleBob);

      if (pauseTimer <= 0) {
        if (fieldTimeElapsed >= fieldTimeLimit) {
          fieldTimeElapsed = 0;
          fieldTimeLimit = 3600 + Math.random() * 2000;
          triggerNextHop();
        } else {
          chooseNewWalk();
        }
      }
    } else if (state === 'HOP') {
      var elapsed = performance.now() - hopStartTime;
      var t = Math.min(1.0, elapsed / hopDuration);

      // Smooth parabolic arc: y(t) = y0 + (y1 - y0)*t - 4*peak*t*(1-t)
      posX = hopStartX + (hopEndX - hopStartX) * t;
      posY = hopStartY + (hopEndY - hopStartY) * t - 4 * hopPeakH * t * (1.0 - t);

      // Gentle parabolic flight tilt
      var tilt = facing * Math.sin(t * Math.PI) * 4.5;
      renderTux(1.0, 1.0, tilt);

      if (t >= 1.0) {
        // Land on target divider line
        posX = hopEndX;
        posY = hopEndY;
        currentField = targetField;
        state = 'LAND';
        landTimer = 160; // 160ms squash duration
        setFrame(FRAMES.STRIDE_1);
        renderTux(1.12, 0.88, 0); // Gentle landing squash
      }
    } else if (state === 'LAND') {
      landTimer -= dt;
      if (landTimer <= 0) {
        // Return to normal posture and pause
        renderTux(1.0, 1.0, 0);
        startPause(1600 + Math.random() * 1000);
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
    posY = m.lineY - 35;
    posX = Math.min(Math.max(posX, m.minX), m.maxX);
    renderTux(1.0, 1.0);
  }

  function init() {
    // Initial resting position on Name divider line
    var m = getFieldMetrics(0);
    currentField = 0;
    journeyDir = 1;
    posX = m.minX + 28;
    posY = m.lineY - 35;
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
