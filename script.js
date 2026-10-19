/* ════════════════════════════════════════════════════════
   SCRIPT.JS — SUJAL MALLICK PORTFOLIO
   - Theme toggle (light/dark, sessionStorage, system pref)
   - Hamburger menu
   - Scroll reveal (IntersectionObserver)
   - Scrollspy (active nav link)
   - Contact form → mailto handler
   ════════════════════════════════════════════════════════ */

/* ── 1. THEME LOCK (DARK MODE ONLY) ───────────────────────── */
document.documentElement.setAttribute('data-theme', 'dark');
sessionStorage.setItem('theme', 'dark');

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

    // Using Gmail web compose URL for maximum reliability across devices, with secure noopener,noreferrer
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=sujalmallick123@gmail.com&su=' + subject + '&body=' + body;
    var mailWin = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!mailWin || mailWin.closed || typeof mailWin.closed === 'undefined') {
      window.location.href = 'mailto:sujalmallick123@gmail.com?subject=' + subject + '&body=' + body;
    }
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
  var canvas = document.getElementById('footer-cyborg-canvas') || document.getElementById('footer-terminator-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var container = canvas.closest('.footer-scenery-strip') || canvas.parentElement;

  var width = 1000;
  var height = 96;
  var isRunning = true;
  var rafId = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── PROTECTED Terminator Character & Code Projectiles ─────────────────────────
  // ── High-Detail 16-Bit Cyborg Shooter 4-Frame Walk Suite & Recoil State ──────
  var cyborgWalkFrames = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
  ];
  cyborgWalkFrames[0].src = 'assets/wasteland/cyborg-shooter-0.png?v=45';
  cyborgWalkFrames[1].src = 'assets/wasteland/cyborg-shooter-1.png?v=45';
  cyborgWalkFrames[2].src = 'assets/wasteland/cyborg-shooter-2.png?v=45';
  cyborgWalkFrames[3].src = 'assets/wasteland/cyborg-shooter-3.png?v=45';

  var cyborgFireImg = new Image();
  cyborgFireImg.src = 'assets/wasteland/cyborg-shooter-fire.png?v=45';

  // Backwards-compatible aliases
  var robotImg = cyborgWalkFrames[0];
  var robotStepImg = cyborgWalkFrames[1];

  var muzzleImg = new Image();
  muzzleImg.src = 'assets/muzzle-flash.png';

  var badgeImages = {
    html:   { img: new Image(), src: 'assets/badge-html.png',   w: 20, h: 20, glow: '#f97316' },
    css:    { img: new Image(), src: 'assets/badge-css.png',    w: 20, h: 20, glow: '#38bdf8' },
    js:     { img: new Image(), src: 'assets/badge-js.png',     w: 20, h: 20, glow: '#facc15' },
    react:  { img: new Image(), src: 'assets/badge-react.png',  w: 20, h: 20, glow: '#22d3ee' },
    python: { img: new Image(), src: 'assets/badge-python.png', w: 20, h: 20, glow: '#38bdf8' }
  };
  var BADGE_SEQUENCE = ['html', 'css', 'js', 'react', 'python'];
  for (var k in badgeImages) {
    badgeImages[k].img.src = badgeImages[k].src;
  }

  // Terminator Geometry & Motion Constants
  var currentScale = 1.0;
  var ROBOT_DRAW_W = 75;
  var ROBOT_DRAW_H = 74;
  var BARREL_OFFSET_X = 0; // True muzzle barrel tip alignment
  var BARREL_OFFSET_Y = 26;
  var WALK_SPEED = 0.34; // Slower deliberate mechanical walking pace

  // Runtime State
  var frameCount = 0;
  var recoilOffset = 0;
  var isOverdrive = false;
  var overdriveTimer = 0;
  var nextBadgeIndex = 0;
  var isHovered = false;

  // Protected Terminator Patrol & Firing State (Patrols clear gap 32% to 54%)
  var robotX = 460;
  var robotTargetX = 460;
  var facing = -1; // -1 = left, 1 = right
  var patrolState = 'IDLE_SCAN'; // 'IDLE_SCAN', 'WALK', 'AIM_FIRE'
  var stateTimer = 90;
  var walkFrame = 0;
  var walkStepTimer = 0;
  var burstRemaining = 0;
  var burstCooldown = 0;

  // Badge Stream Items & Particles
  var streamItems = [];
  var pixelDust = [];
  var muzzleSparks = [];

  function getSceneScale(w) {
    if (w >= 1024) return 1.0;
    if (w >= 768) return 0.85;
    if (w >= 480) return 0.78;
    return 0.72; // Crisp, integer-coherent 54x53px on mobile - keeps soles, knees, and armor plates solid
  }

  function getSceneLayout(w, h) {
    var gY = 96; // Terminator feet land exactly at bottom of 96px canvas
    var isSmallMobile = w < 480;
    var isTablet = w < 768;
    var minPatrolX, maxPatrolX;
    var leftBound, rightBound;

    if (isSmallMobile) {
      // On mobile, the Retro Droid patrols 4%..22% (left edge).
      // The open central-to-east wasteland sector spans 27% to 68%, giving the Cyborg 150+ px of continuous walking room
      minPatrolX = Math.round(w * 0.27);
      maxPatrolX = Math.round(w * 0.68);
      leftBound = Math.round(w * 0.16);
      rightBound = Math.min(w - 20, Math.max(Math.round(w * 0.86), w - 80));
    } else if (isTablet) {
      minPatrolX = Math.round(w * 0.28);
      maxPatrolX = Math.round(w * 0.56);
      leftBound = Math.round(w * 0.20);
      rightBound = Math.min(w - 25, Math.max(Math.round(w * 0.83), w - 110));
    } else {
      minPatrolX = Math.round(w * 0.32);
      maxPatrolX = Math.max(minPatrolX + 60, Math.round(w * 0.54));
      leftBound = Math.round(w * 0.26);
      rightBound = Math.min(w - 30, Math.max(Math.round(w * 0.86), w - 160));
    }

    return {
      groundY: gY,
      minPatrolX: minPatrolX,
      maxPatrolX: maxPatrolX,
      leftBound: leftBound,
      rightBound: rightBound
    };
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width || window.innerWidth));
    height = 96;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false; // Nearest-neighbor crisp pixel edges

    currentScale = getSceneScale(width);
    ROBOT_DRAW_W = Math.round(75 * currentScale);
    ROBOT_DRAW_H = Math.round(74 * currentScale);
    BARREL_OFFSET_X = Math.round(0 * currentScale);
    BARREL_OFFSET_Y = Math.round(26 * currentScale);

    var layout = getSceneLayout(width, height);
    if (robotX < layout.minPatrolX) robotX = layout.minPatrolX;
    if (robotX > layout.maxPatrolX) robotX = layout.maxPatrolX;
  }

  function spawnMuzzleSparks(x, y, dir) {
    if (muzzleSparks.length >= 25) {
      muzzleSparks.splice(0, muzzleSparks.length - 15);
    }
    var count = isOverdrive ? 4 : 3;
    var baseAngle = dir === -1 ? Math.PI : 0;
    for (var i = 0; i < count; i++) {
      var angle = baseAngle + (Math.random() - 0.5) * 0.8;
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

  function pickPatrolTarget(layout, curX, curFacing) {
    var minX = layout.minPatrolX;
    var maxX = layout.maxPatrolX;
    var span = maxX - minX;
    var isSmallMobile = width < 480;
    // Guaranteed minimum stride distance so the cyborg always completes multiple full walk cycles
    var minWalkDist = isSmallMobile ? Math.min(48, Math.round(span * 0.38)) : Math.min(85, Math.round(span * 0.32));

    var canContinue = false;
    if (curFacing === 1 && (maxX - curX) >= minWalkDist) {
      canContinue = true;
    } else if (curFacing === -1 && (curX - minX) >= minWalkDist) {
      canContinue = true;
    }

    var nextFacing = curFacing;
    if (!canContinue || Math.random() < 0.28) {
      nextFacing = -curFacing;
    }

    var target;
    if (nextFacing === 1) {
      var avail = maxX - curX;
      var stride = minWalkDist + Math.random() * Math.max(0, avail - minWalkDist);
      target = Math.min(maxX, Math.round(curX + stride));
    } else {
      var avail = curX - minX;
      var stride = minWalkDist + Math.random() * Math.max(0, avail - minWalkDist);
      target = Math.max(minX, Math.round(curX - stride));
    }

    return { targetX: target, facing: nextFacing };
  }

  function update() {
    frameCount++;
    var layout = getSceneLayout(width, height);
    var gY = layout.groundY;

    // Recoil recovery
    if (recoilOffset > 0) {
      recoilOffset = Math.max(0, recoilOffset - 0.28);
    }

    // Overdrive timer
    if (isOverdrive) {
      overdriveTimer--;
      if (overdriveTimer <= 0) {
        isOverdrive = false;
      }
    }

    // State Machine
    if (patrolState === 'IDLE_SCAN') {
      stateTimer--;
      walkFrame = 0;
      if (stateTimer <= 0) {
        var actionRoll = Math.random();
        var isSmallMobile = width < 480;
        var walkProb = isSmallMobile ? 0.76 : 0.62;
        if (actionRoll < walkProb && (layout.maxPatrolX - layout.minPatrolX > 30)) {
          patrolState = 'WALK';
          var nextMove = pickPatrolTarget(layout, robotX, facing);
          robotTargetX = nextMove.targetX;
          facing = nextMove.facing;
        } else {
          patrolState = 'AIM_FIRE';
          burstRemaining = isOverdrive ? 3 : 2;
          burstCooldown = 26; // Deliberate pre-fire aim delay
          facing = Math.random() < 0.5 ? -1 : 1;
        }
      }
    } else if (patrolState === 'WALK') {
      var moveDist = robotTargetX - robotX;
      var isSmallMobile = width < 480;
      var baseSpeed = isSmallMobile ? 0.44 : WALK_SPEED;
      var currentSpeed = baseSpeed * (isOverdrive ? 1.4 : 1.0);

      if (Math.abs(moveDist) <= currentSpeed) {
        robotX = robotTargetX;
        patrolState = 'AIM_FIRE';
        burstRemaining = isOverdrive ? 3 : 2;
        burstCooldown = 26; // Deliberate aim pause
      } else {
        robotX += (moveDist > 0 ? 1 : -1) * currentSpeed;
        walkStepTimer++;
        var stepCadence = isSmallMobile ? 10 : 14; // Crisp 4-frame mechanical stride cadence
        if (walkStepTimer >= stepCadence) {
          walkStepTimer = 0;
          walkFrame = (walkFrame + 1) % 4;
        }
      }
    } else if (patrolState === 'AIM_FIRE') {
      walkFrame = 0;
      if (burstCooldown > 0) {
        burstCooldown--;
      }

      if (burstRemaining > 0 && burstCooldown <= 0) {
        var robotY = gY - ROBOT_DRAW_H;
        var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
        var muzzleTipX = facing === -1 ? (drawRobotX + BARREL_OFFSET_X) : (drawRobotX + ROBOT_DRAW_W - BARREL_OFFSET_X);
        var muzzleTipY = robotY + BARREL_OFFSET_Y;

        var key = BADGE_SEQUENCE[nextBadgeIndex];
        nextBadgeIndex = (nextBadgeIndex + 1) % BADGE_SEQUENCE.length;

        var projVx = facing * (isOverdrive ? 3.6 : 2.8);

        // Cap stream items to prevent unbounded array buildup on rapid bursts
        if (streamItems.length >= 20) {
          streamItems.splice(0, 2);
        }

        // Spawn Badge
        streamItems.push({
          type: 'badge',
          key: key,
          x: muzzleTipX,
          y: muzzleTipY,
          baseY: muzzleTipY,
          vx: projVx,
          alpha: 1,
          dist: 0,
          waveOffset: Math.random() * 6.28
        });

        // Spawn Glowing Cyan Separator Dot
        streamItems.push({
          type: 'dot',
          x: muzzleTipX - facing * 14,
          y: muzzleTipY,
          baseY: muzzleTipY,
          vx: projVx,
          alpha: 1,
          dist: 0,
          waveOffset: Math.random() * 6.28
        });

        recoilOffset = isOverdrive ? 3.6 : 2.4;
        spawnMuzzleSparks(muzzleTipX, muzzleTipY, facing);
        burstRemaining--;
        burstCooldown = isOverdrive ? 24 : 44; // Deliberate firing interval

        // Dispatch firing event for coordinated Service Droid reaction
        try {
          window.dispatchEvent(new CustomEvent('cyborg-fire-burst', {
            detail: { x: robotX, facing: facing }
          }));
        } catch (evErr) {}
      } else if (burstRemaining <= 0 && burstCooldown <= 0) {
        patrolState = 'IDLE_SCAN';
        var isSmallMobile = width < 480;
        stateTimer = isSmallMobile
          ? (70 + Math.floor(Math.random() * 40)) // Mobile pause ~1.2s to 1.8s
          : (140 + Math.floor(Math.random() * 70)); // Desktop pause ~2.3s to 3.5s
      }
    }

    // Badge Stream Update & Dissolution
    for (var i = streamItems.length - 1; i >= 0; i--) {
      var item = streamItems[i];
      item.x += item.vx;
      item.dist += Math.abs(item.vx);

      // Dissolution near left boundary
      if (item.vx < 0 && item.x <= layout.leftBound + 25) {
        item.alpha = Math.max(0, (item.x - layout.leftBound) / 25);
        if (pixelDust.length < 30 && Math.random() < 0.35) {
          pixelDust.push({
            x: item.x + Math.random() * 8,
            y: item.y + (Math.random() - 0.5) * 8,
            vx: -0.6 - Math.random() * 0.6,
            vy: (Math.random() - 0.5) * 1.0,
            color: Math.random() > 0.4 ? '#22d3ee' : '#cfc6b5',
            alpha: 1,
            size: Math.random() > 0.5 ? 2 : 1,
            decay: 0.04 + Math.random() * 0.03
          });
        }
      }
      // Dissolution near right boundary
      else if (item.vx > 0 && item.x >= layout.rightBound - 25) {
        item.alpha = Math.max(0, (layout.rightBound - item.x) / 25);
        if (pixelDust.length < 30 && Math.random() < 0.35) {
          pixelDust.push({
            x: item.x - Math.random() * 8,
            y: item.y + (Math.random() - 0.5) * 8,
            vx: 0.6 + Math.random() * 0.6,
            vy: (Math.random() - 0.5) * 1.0,
            color: Math.random() > 0.4 ? '#22d3ee' : '#cfc6b5',
            alpha: 1,
            size: Math.random() > 0.5 ? 2 : 1,
            decay: 0.04 + Math.random() * 0.03
          });
        }
      }
      else if (item.dist > (item.vx > 0 ? 1200 : 320)) {
        item.alpha -= 0.025;
      }

      if (item.alpha <= 0 || item.x < layout.leftBound - 15 || item.x > layout.rightBound + 20) {
        streamItems.splice(i, 1);
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
  }

  function render() {
    ctx.imageSmoothingEnabled = false; // Nearest-neighbor crisp pixel edges
    // 1. Transparent Clear (Site background and starfield show through 100%!)
    ctx.clearRect(0, 0, width, height);

    var layout = getSceneLayout(width, height);
    var gY = layout.groundY;

    // 2. Streaming Tech Badges & Glowing Cyan Dots (Terminator Code Burst Stream)
    var isMoving = (patrolState === 'WALK');
    var stepBob = isMoving ? (walkFrame === 1 ? 1 : 0) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var rx = Math.round(drawRobotX);
    var ry = Math.round(gY - ROBOT_DRAW_H + stepBob);
    var muzzleTipX = facing === -1 ? (rx + BARREL_OFFSET_X) : (rx + ROBOT_DRAW_W - BARREL_OFFSET_X);
    var muzzleTipY = ry + BARREL_OFFSET_Y;

    for (var bIdx = 0; bIdx < streamItems.length; bIdx++) {
      var item = streamItems[bIdx];
      if (item.alpha <= 0.02) continue;

      var drawCenterY = Math.round(item.y);

      if (item.type === 'dot') {
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
          var bw = Math.round((bInfo.w || bInfo.img.naturalWidth) * currentScale);
          var bh = Math.round((bInfo.h || bInfo.img.naturalHeight) * currentScale);
          var bx = Math.round(item.x - bw / 2);
          var by = Math.round(drawCenterY - bh / 2);
          ctx.shadowColor = bInfo.glow || '#22d3ee';
          ctx.shadowBlur = Math.max(3, Math.round(6 * currentScale));
          ctx.drawImage(bInfo.img, bx, by, bw, bh);
          ctx.restore();
        }
      }
    }

    // 3. Dissolving Pixel Dust
    for (var pd = 0; pd < pixelDust.length; pd++) {
      var dust = pixelDust[pd];
      if (dust.alpha > 0) {
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, dust.alpha));
        ctx.fillRect(Math.round(dust.x), Math.round(dust.y), dust.size, dust.size);
      }
    }
    ctx.globalAlpha = 1.0;

    // 4. Cyan Muzzle Flash (When Terminator fires)
    if (patrolState === 'AIM_FIRE' && burstCooldown > (isOverdrive ? 6 : 12) && muzzleImg.complete && muzzleImg.naturalWidth > 0) {
      ctx.save();
      var mPulse = isOverdrive ? (1.15 + 0.25 * Math.sin(frameCount * 0.6)) : (0.85 + 0.15 * Math.sin(frameCount * 0.35));
      var mWidth = Math.round(20 * mPulse * currentScale);
      var mHeight = Math.round(18 * mPulse * currentScale);
      var mJitterX = (Math.random() - 0.5) * 0.8;
      var mJitterY = (Math.random() - 0.5) * 0.8;
      var mX = facing === -1 ? Math.round(muzzleTipX - mWidth + 2 + mJitterX) : Math.round(muzzleTipX - 2 + mJitterX);
      var mY = Math.round(muzzleTipY - mHeight / 2 + mJitterY);

      ctx.globalAlpha = isOverdrive ? 1 : 0.92;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = isOverdrive ? 10 : 6;
      if (facing === 1) {
        ctx.translate(mX + mWidth, mY);
        ctx.scale(-1, 1);
        ctx.drawImage(muzzleImg, 0, 0, mWidth, mHeight);
      } else {
        ctx.drawImage(muzzleImg, mX, mY, mWidth, mHeight);
      }
      ctx.restore();
    }

    // 5. Muzzle Sparks
    for (var spkIdx = 0; spkIdx < muzzleSparks.length; spkIdx++) {
      var spk = muzzleSparks[spkIdx];
      var sAlpha = (spk.life / spk.maxLife);
      ctx.fillStyle = spk.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, sAlpha));
      ctx.fillRect(Math.round(spk.x), Math.round(spk.y), spk.size, spk.size);
    }
    ctx.globalAlpha = 1.0;

    // 6. High-Detail 16-Bit Cyborg Character (4-Frame Walk Suite & Firing State)
    // Feet land at y = 96 (the ground baseline)
    var activeSprite;
    if (patrolState === 'AIM_FIRE' && (recoilOffset > 0.4 || (burstCooldown > 0 && burstRemaining > 0))) {
      activeSprite = (cyborgFireImg.complete && cyborgFireImg.naturalWidth > 0) ? cyborgFireImg : cyborgWalkFrames[0];
    } else if (patrolState === 'WALK') {
      var curF = cyborgWalkFrames[walkFrame];
      activeSprite = (curF && curF.complete && curF.naturalWidth > 0) ? curF : cyborgWalkFrames[0];
    } else {
      activeSprite = cyborgWalkFrames[0];
    }

    if (activeSprite && activeSprite.complete && activeSprite.naturalWidth > 0) {
      ctx.save();
      var isFiringNow = (patrolState === 'AIM_FIRE' && recoilOffset > 0.4);
      var visorX = Math.round(44 * currentScale);
      var visorY = Math.round(8 * currentScale);
      var visorW = Math.max(2, Math.round(4 * currentScale));
      var visorH = Math.max(2, Math.round(3 * currentScale));
      var visorAlpha = isFiringNow
        ? 1.0
        : 0.70 + 0.30 * Math.sin(frameCount * 0.12);

      if (facing === -1) {
        // Facing Left
        ctx.drawImage(activeSprite, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Amber Visor Glint
        ctx.fillStyle = isFiringNow ? '#fff7ed' : '#f59e0b';
        ctx.shadowColor = isFiringNow ? '#f97316' : '#f59e0b';
        ctx.shadowBlur = isFiringNow ? 8 : 4;
        ctx.globalAlpha = visorAlpha;
        ctx.fillRect(rx + visorX, ry + visorY, visorW, visorH);
      } else {
        // Facing Right (Mirrored)
        ctx.translate(rx + ROBOT_DRAW_W, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(activeSprite, 0, 0, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Amber Visor Glint
        ctx.fillStyle = isFiringNow ? '#fff7ed' : '#f59e0b';
        ctx.shadowColor = isFiringNow ? '#f97316' : '#f59e0b';
        ctx.shadowBlur = isFiringNow ? 8 : 4;
        ctx.globalAlpha = visorAlpha;
        ctx.fillRect(visorX, visorY, visorW, visorH);
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

  // Coordinated Companion Response: Acknowledge Droid Cheer
  window.addEventListener('droid-happy-cheer', function () {
    if (patrolState === 'IDLE_SCAN') {
      facing = -1; // Glance toward wasteland droid partner
      stateTimer = Math.max(stateTimer, 60);
    }
  });

  // Interactive Click Handlers: Terminator Overdrive Burst
  var lastOverdriveClick = 0;
  var OVERDRIVE_COOLDOWN = 650; // Guard against crash-inducing rapid click spam

  if (container) {
    container.addEventListener('click', function (e) {
      var now = Date.now();
      if (now - lastOverdriveClick < OVERDRIVE_COOLDOWN) return;
      if (isOverdrive && burstRemaining > 0) return;
      lastOverdriveClick = now;

      var layout = getSceneLayout(width, height);
      var gY = layout.groundY;

      // Trigger Terminator Rapid-Fire Overdrive burst
      isOverdrive = true;
      overdriveTimer = 90;
      patrolState = 'AIM_FIRE';
      burstRemaining = 4;
      burstCooldown = 2;
      recoilOffset = 3.6;

      var robotY = gY - ROBOT_DRAW_H;
      var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
      var muzzleTipX = facing === -1 ? (drawRobotX + BARREL_OFFSET_X) : (drawRobotX + ROBOT_DRAW_W - BARREL_OFFSET_X);
      var muzzleTipY = robotY + BARREL_OFFSET_Y;
      spawnMuzzleSparks(muzzleTipX, muzzleTipY, facing);
    });

    container.addEventListener('mouseenter', function () {
      isHovered = true;
    });
    container.addEventListener('mouseleave', function () {
      isHovered = false;
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
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    window.__cyborgDebug = {
      get robotX() { return robotX; },
      get facing() { return facing; },
      get patrolState() { return patrolState; },
      get streamItems() { return streamItems; },
      getLayout: function () { return getSceneLayout(width, height); },
      triggerFireRight: function (startX) {
        if (typeof startX === 'number') robotX = startX;
        facing = 1;
        patrolState = 'AIM_FIRE';
        burstRemaining = 3;
        burstCooldown = 0;
      }
    };
  }

  init();
})();

/* ═══════════════════════════════════════════════════════════════════════════
   WASTELAND TOWERS INTERACTIVITY & MULTI-PLANE DEPTH CONTROLLER
   - Smooth mouse parallax across distant mountains, citadel, cables & factories
   - Click overcharge & radar ping on Citadel Tower (#tower-citadel)
   - Click steam purge & venting on Left Factory (#tower-factory)
   - Click winch cycling & hazard cycle on Right Refinery (#tower-refinery)
   - 16-bit HUD badge updates & accessible keyboard activation
   ═══════════════════════════════════════════════════════════════════════════ */
(function initWastelandTowersDepthAndInteractivity() {
  var scenery = document.querySelector('.footer-scenery-strip.wasteland-scenery') || document.querySelector('.footer-scenery-strip');
  if (!scenery) return;

  var citadel = document.getElementById('tower-citadel');
  var factory = document.getElementById('tower-factory');
  var refinery = document.getElementById('tower-refinery');
  var mountains = document.querySelector('.wasteland-mountains');
  var cables = document.querySelector('.wasteland-cables-svg');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Multi-Plane Mouse Parallax Depth
  if (!prefersReducedMotion) {
    var targetNormX = 0;
    var currentNormX = 0;
    var rafParallax = null;

    function applyParallax() {
      currentNormX += (targetNormX - currentNormX) * 0.08;

      if (mountains) {
        mountains.style.transform = 'translateX(' + (currentNormX * 3.5).toFixed(2) + 'px)';
      }
      if (citadel) {
        citadel.style.transform = 'translateX(calc(-50% + ' + (currentNormX * 6.5).toFixed(2) + 'px))';
      }
      if (cables) {
        cables.style.transform = 'translateX(' + (currentNormX * 2.0).toFixed(2) + 'px)';
      }
      if (factory) {
        factory.style.transform = 'translateX(' + (currentNormX * 4.5).toFixed(2) + 'px)';
      }
      if (refinery) {
        refinery.style.transform = 'translateX(' + (currentNormX * 4.5).toFixed(2) + 'px)';
      }

      if (Math.abs(targetNormX - currentNormX) > 0.001) {
        rafParallax = requestAnimationFrame(applyParallax);
      } else {
        rafParallax = null;
      }
    }

    scenery.addEventListener('mousemove', function (e) {
      var rect = scenery.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width;
      targetNormX = (relX - 0.5) * 2;
      if (!rafParallax) {
        rafParallax = requestAnimationFrame(applyParallax);
      }
    });

    scenery.addEventListener('mouseleave', function () {
      targetNormX = 0;
      if (!rafParallax) {
        rafParallax = requestAnimationFrame(applyParallax);
      }
    });
  }

  // 2. Tower Interactivity: Clicks & Status Transitions
  function setupTowerAction(el, activeClass, activeStatusText, defaultStatusText, pulseDuration) {
    if (!el) return;
    var statusEl = el.querySelector('.hud-status');
    var isBusy = false;

    function trigger() {
      if (isBusy) return;
      isBusy = true;
      el.classList.add(activeClass);
      el.classList.add('show-hud');
      if (statusEl) statusEl.textContent = activeStatusText;

      setTimeout(function () {
        el.classList.remove(activeClass);
        if (statusEl) statusEl.textContent = defaultStatusText;
        el.classList.remove('show-hud');
        isBusy = false;
      }, pulseDuration || 1800);
    }

    el.addEventListener('click', function (e) {
      e.stopPropagation();
      trigger();
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  }

  setupTowerAction(citadel, 'is-pulsing', '⚡ OVERCHARGE +250MW', 'ΩN CORE ACTIVE', 1800);
  setupTowerAction(factory, 'is-venting', '💨 STEAM PURGED', 'SMELTER RUNNING', 1800);
  setupTowerAction(refinery, 'is-cycling', '⚠️ WINCH CYCLED', 'CARGO DOCKED', 1800);
})();


  /* ═══════════════════════════════════════════════════════════════════════════
     AUTONOMOUS INTERACTIVE FOOTER DROID
     Step 2 State Machine: IDLE -> MOVE -> PAUSE -> TURN -> MOVE
     Outer wrapper sets translate3d(Math.round(x)px, 0, 0) only.
     Inner element sets CSS bob only.
     Flipper element sets scaleX for facing and squash animation.
     Delta-time based movement with ease-in/ease-out.
     ═══════════════════════════════════════════════════════════════════════════ */
  /* ═══════════════════════════════════════════════════════════════════════════
     WASTELAND SERVICE DROID (Articulated 16-Bit Caterpillar Unit)
     Autonomous patrol along the wasteland baseline (X=40 to X=280 desktop).
     CSS keyframes handle 4-frame articulated walk cycle (.is-moving),
     gentle chassis breathing (.is-idle), and interactive cheerful hop (.is-happy).
     Flipper element sets scaleX for facing and squash turnaround.
     ═══════════════════════════════════════════════════════════════════════════ */
  (function initFooterDroid() {
    var wrap = document.getElementById('footer-droid-wrap');
    if (!wrap) return;
    var inner = document.getElementById('footer-droid-inner');
    var flipper = document.getElementById('footer-droid-flipper');
    var sprite = document.getElementById('footer-droid-sprite');
    if (!flipper || !sprite) return;

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', function (e) {
      prefersReducedMotion = e.matches;
    });

    // Single State Machine: 'IDLE' | 'MOVE' | 'PAUSE' | 'TURN' | 'HAPPY'
    var state = 'IDLE';
    var stateTimer = 1.0; // Initial idle duration (seconds)
    var turnDuration = 0.22; // 220ms turnaround
    var turnTimer = 0;
    var oldFacing = 1;
    var newFacing = -1;
    var facing = 1; // 1 = right, -1 = left

    // Position and motion
    var x = 65;
    var targetX = 65;
    var startX = 65;
    var moveElapsed = 0;

    var baseSpeed = 32; // px/s (strictly between 25 and 40 px/s)
    var easeDuration = 0.3; // 300ms ease-in / ease-out

    // Dynamic patrol bounds based on scenery width
    function getBounds() {
      var container = wrap.closest('.footer-scenery-strip') || wrap.parentElement;
      var w = container ? container.offsetWidth : window.innerWidth;
      w = Math.max(320, w || window.innerWidth);
      var minX, maxX;
      if (w >= 900) {
        minX = 40;
        maxX = Math.min(280, Math.floor(w * 0.28));
      } else if (w >= 600) {
        minX = 25;
        maxX = Math.min(170, Math.floor(w * 0.25));
      } else {
        minX = 14;
        maxX = Math.min(80, Math.floor(w * 0.23));
      }
      return { minX: minX, maxX: Math.max(minX + 45, maxX) };
    }

    var bounds = getBounds();
    x = Math.max(bounds.minX + 15, Math.min(bounds.maxX - 15, 65));
    targetX = x;
    wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
    flipper.style.transform = 'scaleX(' + facing + ')';
    inner.classList.add('is-idle');

    function setMoving() {
      inner.classList.add('is-moving');
      inner.classList.remove('is-idle', 'is-happy', 'is-alert');
    }

    function setIdle() {
      inner.classList.add('is-idle');
      inner.classList.remove('is-moving', 'is-happy', 'is-alert');
    }

    function pickNextMove() {
      bounds = getBounds();
      var curBounds = bounds;
      var maxSpan = curBounds.maxX - curBounds.minX;
      var desiredDist = 50 + Math.random() * Math.min(110, Math.max(30, maxSpan - 30));

      var canContinue = false;
      var possibleTarget;
      if (facing === 1) {
        possibleTarget = x + desiredDist;
        if (possibleTarget <= curBounds.maxX - 10) {
          canContinue = true;
        }
      } else {
        possibleTarget = x - desiredDist;
        if (possibleTarget >= curBounds.minX + 10) {
          canContinue = true;
        }
      }

      var shouldTurn = false;
      if (!canContinue) {
        shouldTurn = true;
      } else if (Math.random() < 0.35) {
        var openSpaceOtherSide = facing === 1 ? (x - curBounds.minX) : (curBounds.maxX - x);
        if (openSpaceOtherSide >= 60) {
          shouldTurn = true;
        }
      }

      if (shouldTurn) {
        newFacing = -facing;
        var available = newFacing === 1 ? (curBounds.maxX - x) : (x - curBounds.minX);
        var dist = Math.min(available - 10, Math.max(25, 40 + Math.random() * 60));
        dist = Math.max(20, dist);
        if (newFacing === 1) {
          targetX = Math.min(curBounds.maxX - 6, x + dist);
        } else {
          targetX = Math.max(curBounds.minX + 6, x - dist);
        }
        state = 'TURN';
        turnTimer = 0;
        oldFacing = facing;
        setIdle();
      } else {
        targetX = Math.max(curBounds.minX + 6, Math.min(curBounds.maxX - 6, possibleTarget));
        startX = x;
        moveElapsed = 0;
        state = 'MOVE';
        setMoving();
      }
    }

    var lastTime = performance.now();
    var rAF = null;

    function step(now) {
      if (document.hidden) {
        lastTime = now;
        rAF = requestAnimationFrame(step);
        return;
      }

      var dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) dt = 0.1; // Cap delta-time on lag spikes

      if (prefersReducedMotion) {
        wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
        flipper.style.transform = 'scaleX(' + facing + ')';
        inner.classList.remove('is-moving', 'is-happy');
        inner.classList.add('is-idle');
        rAF = requestAnimationFrame(step);
        return;
      }

      if (state === 'IDLE') {
        stateTimer -= dt;
        if (stateTimer <= 0) {
          pickNextMove();
        }
      } else if (state === 'TURN') {
        turnTimer += dt;
        // Mechanical turnaround: pause in idle stance for a beat, then cleanly orient toward new direction
        if (turnTimer >= 0.10 && facing !== newFacing) {
          facing = newFacing;
          flipper.style.transform = 'scaleX(' + facing + ')';
        }

        if (turnTimer >= turnDuration) {
          facing = newFacing;
          flipper.style.transform = 'scaleX(' + facing + ')';
          startX = x;
          moveElapsed = 0;
          state = 'MOVE';
          setMoving();
        }
      } else if (state === 'MOVE') {
        moveElapsed += dt;
        var remaining = Math.abs(targetX - x);

        // Subtle 300ms ease-in and ease-out
        var easeIn = Math.min(1, moveElapsed / easeDuration);
        var easeOut = Math.min(1, Math.max(0.18, remaining / (baseSpeed * easeDuration)));
        var curSpeed = baseSpeed * Math.min(easeIn, easeOut);

        var stepDist = curSpeed * dt;
        bounds = getBounds();
        var atLeftWall = (facing === -1 && x <= bounds.minX + 2);
        var atRightWall = (facing === 1 && x >= bounds.maxX - 2);

        if (remaining <= stepDist || remaining < 1.0 || atLeftWall || atRightWall) {
          x = Math.max(bounds.minX, Math.min(bounds.maxX, (atLeftWall ? bounds.minX : (atRightWall ? bounds.maxX : targetX))));
          state = 'PAUSE';
          // Random pause between moves (1.2s to 2.6s)
          stateTimer = 1.2 + Math.random() * 1.4;
          setIdle();
        } else {
          x += facing * stepDist;
          if (x < bounds.minX) x = bounds.minX;
          if (x > bounds.maxX) x = bounds.maxX;
        }
        wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
      } else if (state === 'PAUSE') {
        stateTimer -= dt;
        if (stateTimer <= 0) {
          pickNextMove();
        }
      } else if (state === 'HAPPY') {
        stateTimer -= dt;
        if (stateTimer <= 0) {
          inner.classList.remove('is-happy');
          state = 'PAUSE';
          stateTimer = 1.0;
          setIdle();
        }
      }

      rAF = requestAnimationFrame(step);
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        lastTime = performance.now();
      }
    });

    window.addEventListener('resize', function () {
      bounds = getBounds();
      if (x < bounds.minX) x = bounds.minX;
      if (x > bounds.maxX) x = bounds.maxX;
      wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
    });

    var happyTimeout = null;
    function triggerHappyHop() {
      if (state === 'HAPPY') return;
      state = 'HAPPY';
      stateTimer = 0.65;
      inner.classList.remove('is-idle', 'is-moving', 'is-alert');
      inner.classList.add('is-happy');
      try {
        window.dispatchEvent(new CustomEvent('droid-happy-cheer'));
      } catch (ev) {}
      if (happyTimeout) clearTimeout(happyTimeout);
      happyTimeout = setTimeout(function () {
        inner.classList.remove('is-happy');
        if (state === 'HAPPY') {
          state = 'PAUSE';
          stateTimer = 0.5;
        }
        setIdle();
      }, 650);
    }

    // Coordinated companion alert scan when Cyborg fires across the wasteland
    var alertTimeout = null;
    window.addEventListener('cyborg-fire-burst', function (e) {
      if (state === 'IDLE' || state === 'PAUSE') {
        if (inner && !inner.classList.contains('is-happy') && !inner.classList.contains('is-alert')) {
          inner.classList.remove('is-idle');
          inner.classList.add('is-alert');
          if (alertTimeout) clearTimeout(alertTimeout);
          alertTimeout = setTimeout(function () {
            if (inner && inner.classList.contains('is-alert')) {
              inner.classList.remove('is-alert');
              inner.classList.add('is-idle');
            }
          }, 520);
        }
      }
    });

    wrap.addEventListener('click', function (e) {
      e.stopPropagation();
      triggerHappyHop();
    });

    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        triggerHappyHop();
      }
    });

    rAF = requestAnimationFrame(step);
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     FOOTER OUTPOST PROPS INTERACTIVITY
     Interactive behaviors for communication dish antenna and tool workbench:
     - Click / Keyboard (Enter/Space) on #prop-antenna triggers a rapid signal
       transmission sweep (.is-transmitting) with cyan beacon pulsing.
     - Click / Keyboard (Enter/Space) on #prop-workbench triggers a diagnostic
       test sequence (.is-testing) with rapid LED indicator cycling.
     ═══════════════════════════════════════════════════════════════════════════ */
  (function initFooterPropsInteractivity() {
    var antenna = document.getElementById('prop-antenna');
    var workbench = document.getElementById('prop-workbench');

    if (antenna) {
      var antennaTimeout = null;
      function triggerAntennaTransmission() {
        antenna.classList.add('is-transmitting');
        if (antennaTimeout) clearTimeout(antennaTimeout);
        antennaTimeout = setTimeout(function () {
          antenna.classList.remove('is-transmitting');
        }, 1300);
      }
      antenna.addEventListener('click', function (e) {
        e.stopPropagation();
        triggerAntennaTransmission();
      });
      antenna.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          triggerAntennaTransmission();
        }
      });
    }

    if (workbench) {
      var workbenchTimeout = null;
      function triggerWorkbenchDiagnostic() {
        workbench.classList.add('is-testing');
        if (workbenchTimeout) clearTimeout(workbenchTimeout);
        workbenchTimeout = setTimeout(function () {
          workbench.classList.remove('is-testing');
        }, 1300);
      }
      workbench.addEventListener('click', function (e) {
        e.stopPropagation();
        triggerWorkbenchDiagnostic();
      });
      workbench.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          triggerWorkbenchDiagnostic();
        }
      });
    }
  })();


  /* ═══════════════════════════════════════════════════════════════════════════
     PIXELATED COSMIC STARFIELD BACKGROUND
     Subtle retro 1px/2px pixel stars and 3px cross-stars (+) twinkling gently
     across the dark portfolio background.
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

  /* ── 10. AI PIXEL MASCOTS CONTROLLER ──────────────────────────────────── */
(function initMascots() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Shared AI Mascot Speech-Bubble Manager (Ensures only one logo bubble is visible at any time)
  var currentActiveBubble = null;
  var bubbleDismissTimer = null;

  function showOnlyMascotBubble(bubbleEl, durationMs) {
    var dur = durationMs || 2800;
    if (currentActiveBubble && currentActiveBubble !== bubbleEl) {
      currentActiveBubble.classList.remove('bubble-active');
      currentActiveBubble.setAttribute('aria-hidden', 'true');
    }
    if (bubbleDismissTimer) {
      clearTimeout(bubbleDismissTimer);
      bubbleDismissTimer = null;
    }

    if (!bubbleEl) return;
    bubbleEl.classList.add('bubble-active');
    bubbleEl.setAttribute('aria-hidden', 'false');
    currentActiveBubble = bubbleEl;

    bubbleDismissTimer = setTimeout(function () {
      bubbleEl.classList.remove('bubble-active');
      bubbleEl.setAttribute('aria-hidden', 'true');
      if (currentActiveBubble === bubbleEl) {
        currentActiveBubble = null;
      }
    }, dur);
  }

  // 1. ChatGPT Companion Controller
  (function initChatGPT() {
    var el = document.getElementById('mascot-chatgpt');
    if (!el) return;

    var bubbleEl = el.querySelector('.chatgpt-bubble');
    var currentState = 'idle';
    var isActing = false;
    var cooldownUntil = 0;
    var actionTimer = null;
    var idleTimer = null;
    var blinkTimer = null;
    var hopTimer = null;

    function setState(st) {
      if (currentState === st) return;
      currentState = st;
      el.setAttribute('data-state', st);
    }

    function triggerDoubleClickAction() {
      var now = Date.now();
      if (now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 2800;

      // 1. Show only this mascot's speech bubble with its OpenAI logo
      showOnlyMascotBubble(bubbleEl, 2800);

      // 2. Animate mascot moving forward to the right
      el.classList.remove('chatgpt-forward');
      void el.offsetWidth; // Force CSS reflow to cleanly restart keyframe animation
      el.classList.add('chatgpt-forward');

      // 3. Cheerful celebratory reaction during flight
      setState('celebrate');

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
        el.classList.remove('chatgpt-forward');
        setState('idle');
      }, 2800);
    }

    // Double-click triggers speech bubble and forward motion
    el.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      e.preventDefault();
      triggerDoubleClickAction();
    });

    // Single click is strictly suppressed to avoid single-click triggers
    el.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Double-tap detection for touch screens (two taps within 350ms)
    var lastTapTime = 0;
    el.addEventListener('touchend', function (e) {
      var now = Date.now();
      var tapGap = now - lastTapTime;
      if (tapGap > 30 && tapGap < 350) {
        e.preventDefault();
        triggerDoubleClickAction();
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }, { passive: false });

    // Keyboard accessibility: double-press Enter/Space triggers action
    var lastKeyTime = 0;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var now = Date.now();
        if (now - lastKeyTime > 30 && now - lastKeyTime < 450) {
          triggerDoubleClickAction();
          lastKeyTime = 0;
        } else {
          lastKeyTime = now;
        }
      }
    });

    // Hover keeps the subtle tilt without triggering bubble or forward move
    el.addEventListener('pointerenter', function () {
      if (!isActing) {
        setState('tilt');
        setTimeout(function () {
          if (!isActing && currentState === 'tilt') setState('idle');
        }, 800);
      }
    });

    if (prefersReduced) return;

    // Autonomous behavior:
    // A. Alternating idle / flare every 2.5s - 3.5s
    function cycleIdlePose() {
      if (!isActing && !document.hidden && !el.classList.contains('mascot-offscreen')) {
        if (currentState === 'idle') {
          setState('flare');
        } else if (currentState === 'flare') {
          setState('idle');
        }
      }
      var delay = 2600 + Math.floor(Math.random() * 900);
      idleTimer = setTimeout(cycleIdlePose, delay);
    }

    // B. Screen blink every 4-7s for 150ms
    function runBlink() {
      if (!isActing && !document.hidden && !el.classList.contains('mascot-offscreen')) {
        var prev = currentState;
        setState('blink');
        setTimeout(function () {
          if (!isActing && currentState === 'blink') setState(prev);
        }, 150);
      }
      var delay = 4000 + Math.floor(Math.random() * 3000);
      blinkTimer = setTimeout(runBlink, delay);
    }

    // C. Occasional look or hop every 6-10s
    function runHopGesture() {
      if (!isActing && !document.hidden && !el.classList.contains('mascot-offscreen')) {
        var r = Math.random();
        if (r < 0.5) {
          setState('tilt');
          setTimeout(function () {
            if (!isActing && currentState === 'tilt') setState('idle');
          }, 1000);
        } else {
          setState('hop');
          setTimeout(function () {
            if (!isActing && currentState === 'hop') setState('idle');
          }, 850);
        }
      }
      var delay = 6000 + Math.floor(Math.random() * 4000);
      hopTimer = setTimeout(runHopGesture, delay);
    }

    idleTimer = setTimeout(cycleIdlePose, 2000);
    blinkTimer = setTimeout(runBlink, 3500);
    hopTimer = setTimeout(runHopGesture, 6500);
  })();

  // 2. Claude Mascot Controller (Divider Line Walker)
  (function initClaude() {
    var el = document.getElementById('mascot-claude');
    if (!el) return;

    var claudeBubble = el.querySelector('.claude-bubble');
    var isActing = false;
    var cooldownUntil = 0;
    var actionTimer = null;

    function triggerDoubleClickAction() {
      var now = Date.now();
      if (now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 2800;

      // Show Claude Anthropic speech bubble
      showOnlyMascotBubble(claudeBubble, 2800);

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
      }, 2800);
    }

    // Double-click triggers Claude speech bubble
    el.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      e.preventDefault();
      triggerDoubleClickAction();
    });

    // Suppress single-click
    el.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Double-tap support for mobile/touch screens
    var lastTapTime = 0;
    el.addEventListener('touchend', function (e) {
      var now = Date.now();
      var tapGap = now - lastTapTime;
      if (tapGap > 30 && tapGap < 350) {
        e.preventDefault();
        triggerDoubleClickAction();
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }, { passive: false });

    // Keyboard accessibility: double-press Enter or Space
    var lastKeyTime = 0;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var now = Date.now();
        if (now - lastKeyTime > 30 && now - lastKeyTime < 450) {
          triggerDoubleClickAction();
          lastKeyTime = 0;
        } else {
          lastKeyTime = now;
        }
      }
    });
  })();

  // 3. Gemini Cosmic Companion Controller (Floating in Projects Section)
  (function initGemini() {
    var el = document.getElementById('mascot-gemini');
    if (!el) return;

    var geminiBubble = el.querySelector('.gemini-bubble');
    var isActing = false;
    var cooldownUntil = 0;
    var actionTimer = null;

    function triggerDoubleClickAction() {
      var now = Date.now();
      if (now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 2800;

      // Show Gemini Google speech bubble
      showOnlyMascotBubble(geminiBubble, 2800);

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
      }, 2800);
    }

    // Double-click triggers Gemini speech bubble
    el.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      e.preventDefault();
      triggerDoubleClickAction();
    });

    // Suppress single-click
    el.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Double-tap support for mobile/touch screens
    var lastTapTime = 0;
    el.addEventListener('touchend', function (e) {
      var now = Date.now();
      var tapGap = now - lastTapTime;
      if (tapGap > 30 && tapGap < 350) {
        e.preventDefault();
        triggerDoubleClickAction();
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }, { passive: false });

    // Keyboard accessibility: double-press Enter or Space
    var lastKeyTime = 0;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var now = Date.now();
        if (now - lastKeyTime > 30 && now - lastKeyTime < 450) {
          triggerDoubleClickAction();
          lastKeyTime = 0;
        } else {
          lastKeyTime = now;
        }
      }
    });
  })();

  // IntersectionObserver: pause animations when scrolled out of view to preserve CPU/battery
  if ('IntersectionObserver' in window) {
    var mascotObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('mascot-offscreen');
        } else {
          entry.target.classList.add('mascot-offscreen');
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });

    ['mascot-chatgpt', 'mascot-claude', 'mascot-gemini'].forEach(function (id) {
      var el = document.getElementById(id);
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
  var tuxHeight = 36;
  var FRAME_W = 36;
  var FRAME_H = 36;
  var feetOffset = 33; // baseline of feet is ~91% of sprite box height (80/88 in native cell)

  function updateDimensions() {
    var screenW = window.innerWidth;
    if (screenW <= 600) {
      tuxWidth = 32;
      tuxHeight = 32;
    } else if (screenW <= 900) {
      tuxWidth = 34;
      tuxHeight = 34;
    } else {
      tuxWidth = 36;
      tuxHeight = 36;
    }
    FRAME_W = tuxWidth;
    FRAME_H = tuxHeight;
    feetOffset = Math.round(tuxHeight * (80 / 88));

    sprite.style.width = tuxWidth + 'px';
    sprite.style.height = tuxHeight + 'px';
    sprite.style.backgroundSize = (tuxWidth * 4) + 'px ' + (tuxHeight * 6) + 'px';
  }

  // Sprite atlas rows (4 frames per row, 88x88px native cells scaled responsively):
  // Row 0: IDLE (frame 0=stand, 1=blink, 2=breath/wide, 3=soft)
  // Row 1: WALK_RIGHT (frames 0..3: 4-step waddle cycle facing right)
  // Row 2: WALK_LEFT (frames 0..3: 4-step waddle cycle facing left)
  // Row 3: JUMP (0=crouch, 1=launch, 2=apex glide, 3=landing squash)
  // Row 4: LOOK_AROUND (0=center, 1=look left, 2=center, 3=look right)
  // Row 5: HAPPY (0..3: celebratory flipper wave & jump)
  var ROW_IDLE = 0;
  var ROW_WALK_R = 1;
  var ROW_WALK_L = 2;
  var ROW_JUMP = 3;
  var ROW_LOOK = 4;
  var ROW_HAPPY = 5;

  function setFrame(row, col) {
    var posX = -(col * FRAME_W);
    var posY = -(row * FRAME_H);
    sprite.style.backgroundPosition = posX + 'px ' + posY + 'px';
  }

  function getFieldMetrics(index) {
    var field = fields[index];
    if (!field) return { lineY: 0, minX: 80, maxX: 260 };

    var input = document.getElementById(field.id);
    var group = input ? input.closest('.form-group') : null;
    var label = group ? group.querySelector('label') : null;

    if (!group || !label) {
      return { lineY: 0, minX: 80, maxX: 260 };
    }

    var formRect = form.getBoundingClientRect();
    var labelRect = label.getBoundingClientRect();
    var lineY = labelRect.top - formRect.top + Math.floor(labelRect.height / 2);

    var span = label.querySelector('.form-label-text');
    var spanRect = span ? span.getBoundingClientRect() : labelRect;
    var minX = spanRect.right - formRect.left + 14;
    var maxX = Math.max(minX + 30, formRect.width - tuxWidth - 12);

    return { lineY: lineY, minX: minX, maxX: maxX };
  }

  // State variables
  var currentField = 0;       // 0 = Name, 1 = Email, 2 = Message
  var targetField = 0;
  var journeyDir = 1;         // +1 = going down (Name -> Email -> Message), -1 = returning up
  var state = 'WALK';         // 'WALK', 'PAUSE', 'HOP', 'LAND', 'HAPPY'

  var posX = 90;
  var posY = 0;
  var facing = 1;             // +1 = facing right, -1 = facing left
  var speed = 0.38;           // gentle waddle speed (~23px/sec)

  // Walk animation
  var walkAnimTimer = 0;
  var walkFrameIndex = 0;
  var walkDistanceRemaining = 0;

  // Pause / Idle animation
  var pauseTimer = 0;
  var fieldTimeElapsed = 0;
  var fieldTimeLimit = 4200;  // 4.2s exploration on divider before next hop
  var blinkTimer = 0;
  var isBlinking = false;
  var lookTimer = 0;
  var isLookingAround = false;
  var lookStep = 0;

  // Hop trajectory
  var hopStartTime = 0;
  var hopDuration = 2400;     // 2.2s - 2.6s slow, graceful parabolic arc
  var hopStartX = 0;
  var hopStartY = 0;
  var hopEndX = 0;
  var hopEndY = 0;
  var hopPeakH = 22;

  // Land squash
  var landTimer = 0;

  // Happy celebration
  var happyTimer = 0;
  var happyAnimTimer = 0;
  var happyFrame = 0;

  var isVisible = true;
  var isRunning = true;
  var rafId = null;
  var lastTime = 0;

  function renderTux(extraScaleX, extraScaleY, extraRotate, extraOffsetY) {
    var sX = extraScaleX !== undefined ? extraScaleX : 1.0;
    var sY = extraScaleY !== undefined ? extraScaleY : 1.0;
    var rot = extraRotate ? ' rotate(' + extraRotate.toFixed(1) + 'deg)' : '';
    var offY = extraOffsetY || 0;

    sprite.style.left = Math.round(posX) + 'px';
    sprite.style.top = Math.round(posY + offY) + 'px';
    sprite.style.transform = 'scale(' + sX.toFixed(3) + ', ' + sY.toFixed(3) + ')' + rot;
  }

  function chooseNewWalk() {
    var m = getFieldMetrics(currentField);
    var dist = 24 + Math.random() * 36;
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
    walkAnimTimer = 0;
    walkFrameIndex = 0;
    state = 'WALK';
  }

  function startPause(duration) {
    state = 'PAUSE';
    pauseTimer = duration || (1800 + Math.random() * 1600);
    blinkTimer = 1600 + Math.random() * 1800; // time until next blink
    isBlinking = false;
    isLookingAround = false;
    lookStep = 0;
    // Chance to look around during long pauses (> 2.4s)
    if (pauseTimer > 2400 && Math.random() < 0.45) {
      isLookingAround = true;
      lookTimer = 500;
    }
    setFrame(ROW_IDLE, 0);
    renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, 0);
  }

  function triggerNextHop() {
    // Sequence: Name -> Email -> Message -> Email -> Name
    var nextField;
    if (journeyDir > 0) {
      if (currentField === 0) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 2;
        journeyDir = -1;
      }
    } else {
      if (currentField === 2) {
        nextField = 1;
      } else if (currentField === 1) {
        nextField = 0;
        journeyDir = 1;
      }
    }

    var startMetrics = getFieldMetrics(currentField);
    var endMetrics = getFieldMetrics(nextField);

    hopStartX = posX;
    hopStartY = startMetrics.lineY - feetOffset;

    // Gentle landing X on target field
    var targetX = endMetrics.minX + 20 + Math.random() * Math.max(10, endMetrics.maxX - endMetrics.minX - 40);
    hopEndX = Math.min(Math.max(targetX, endMetrics.minX), endMetrics.maxX);
    hopEndY = endMetrics.lineY - feetOffset;

    facing = hopEndX >= hopStartX ? 1 : -1;

    // Parabolic arc peak and timing
    if (nextField < currentField) {
      hopPeakH = 28; // Upward leap arc
      hopDuration = 2400 + Math.random() * 250;
    } else {
      hopPeakH = 20; // Downward hop arc
      hopDuration = 2200 + Math.random() * 250;
    }

    hopStartTime = performance.now();
    targetField = nextField;
    state = 'HOP';
    setFrame(ROW_JUMP, 0); // Crouch prep
  }

  function triggerHappy() {
    if (state === 'HOP') return; // Don't interrupt mid-air jump
    state = 'HAPPY';
    happyTimer = 900;
    happyAnimTimer = 0;
    happyFrame = 0;
    setFrame(ROW_HAPPY, 0);
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

      // 4-step waddle animation
      walkAnimTimer += dt;
      if (walkAnimTimer >= 140) {
        walkAnimTimer = 0;
        walkFrameIndex = (walkFrameIndex + 1) % 4;
      }

      // WALK_RIGHT and WALK_LEFT dedicated frames
      if (facing > 0) {
        setFrame(ROW_WALK_R, walkFrameIndex);
        renderTux(1.0, 1.0, 0, 0);
      } else {
        setFrame(ROW_WALK_L, walkFrameIndex);
        renderTux(1.0, 1.0, 0, 0);
      }

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

      // Gentle 0.8px breathing bob
      var idleBob = Math.sin(performance.now() * 0.003) * 0.8;

      if (isLookingAround) {
        lookTimer -= dt;
        if (lookTimer <= 0) {
          lookTimer = 220;
          lookStep++;
          if (lookStep > 4) {
            isLookingAround = false;
            setFrame(ROW_IDLE, 0);
          } else {
            var lookFrames = [0, 1, 2, 3, 0];
            setFrame(ROW_LOOK, lookFrames[lookStep % 5]);
          }
        }
      } else {
        // Natural blinking
        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          if (!isBlinking) {
            isBlinking = true;
            blinkTimer = 160; // blink duration
            setFrame(ROW_IDLE, 1); // blink frame
          } else {
            isBlinking = false;
            blinkTimer = 2600 + Math.random() * 2200; // next blink
            setFrame(ROW_IDLE, 0);
          }
        }
      }

      renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, idleBob);

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

      // Parabolic flight trajectory
      posX = hopStartX + (hopEndX - hopStartX) * t;
      posY = hopStartY + (hopEndY - hopStartY) * t - 4 * hopPeakH * t * (1.0 - t);

      // Trajectory poses:
      // 0.00 - 0.08: crouch
      // 0.08 - 0.42: launch stretch
      // 0.42 - 0.86: apex glide
      // 0.86 - 1.00: landing preparation
      if (t < 0.08) {
        setFrame(ROW_JUMP, 0); // Crouch
      } else if (t < 0.42) {
        setFrame(ROW_JUMP, 1); // Takeoff / wings up
      } else if (t < 0.86) {
        setFrame(ROW_JUMP, 2); // Apex flight glide
      } else {
        setFrame(ROW_JUMP, 3); // Pre-touchdown
      }

      // Smooth parabolic flight tilt
      var tilt = facing * Math.sin(t * Math.PI) * 4.0;
      renderTux(facing === -1 ? -1.0 : 1.0, 1.0, tilt, 0);

      if (t >= 1.0) {
        // Touchdown on destination divider
        posX = hopEndX;
        posY = hopEndY;
        currentField = targetField;
        state = 'LAND';
        landTimer = 180;
        setFrame(ROW_JUMP, 3); // Landing squash frame
        renderTux(facing === -1 ? -1.12 : 1.12, 0.88, 0, 1);
      }
    } else if (state === 'LAND') {
      landTimer -= dt;
      if (landTimer <= 0) {
        renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, 0);
        startPause(1600 + Math.random() * 1000);
      }
    } else if (state === 'HAPPY') {
      happyTimer -= dt;
      happyAnimTimer += dt;
      if (happyAnimTimer >= 140) {
        happyAnimTimer = 0;
        happyFrame = (happyFrame + 1) % 4;
        setFrame(ROW_HAPPY, happyFrame);
      }
      var joyfulHop = -Math.abs(Math.sin(performance.now() * 0.009)) * 3.5;
      renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, joyfulHop);

      if (happyTimer <= 0) {
        startPause(1400);
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
    updateDimensions();
    var m = getFieldMetrics(currentField);
    posY = m.lineY - feetOffset;
    posX = Math.min(Math.max(posX, m.minX), m.maxX);
    renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, 0);
  }

  function init() {
    updateDimensions();
    var m = getFieldMetrics(0);
    currentField = 0;
    journeyDir = 1;
    posX = m.minX + 24;
    posY = m.lineY - feetOffset;
    facing = 1;

    setFrame(ROW_IDLE, 0);
    renderTux(1.0, 1.0, 0, 0);

    // Interactive reactions on click and hover
    sprite.setAttribute('role', 'img');
    sprite.setAttribute('aria-label', 'Linux Tux mascot exploring form dividers');
    sprite.title = 'Click Tux!';
    sprite.addEventListener('click', function (e) {
      e.stopPropagation();
      triggerHappy();
    });
    sprite.addEventListener('mouseenter', function () {
      if (state === 'PAUSE' && Math.random() < 0.6) {
        triggerHappy();
      }
    });

    if (prefersReduced) return;

    window.addEventListener('resize', snapToField, { passive: true });

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

/* ═══════════════════════════════════════════════════════════════════════════
   DISTANT PIXEL SATELLITE — PARALLAX & LIFECYCLE MANAGEMENT
   Provides smooth, lightweight scroll parallax fallback for browsers without
   native CSS scroll-driven animation support, and pauses orbital drift when
   offscreen to optimize CPU and battery.
═══════════════════════════════════════════════════════════════════════════ */
(function initDistantPixelSatellite() {
  function init() {
    var satellite = document.getElementById('hero-pixel-satellite');
    var planet = document.getElementById('hero-pixel-planet');
    if (!satellite && !planet) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pause offscreen to conserve CPU/battery
    if ('IntersectionObserver' in window) {
      var celestialObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('celestial-offscreen');
          } else {
            entry.target.classList.add('celestial-offscreen');
          }
        });
      }, { threshold: 0.02, rootMargin: '100px 0px 100px 0px' });

      if (satellite) celestialObserver.observe(satellite);
      if (planet) celestialObserver.observe(planet);
    }

    // Scroll parallax fallback if native CSS animation-timeline is unsupported
    var supportsScrollTimeline = false;
    try {
      supportsScrollTimeline = window.CSS && CSS.supports && (CSS.supports('animation-timeline', 'view()') || CSS.supports('animation-timeline', 'scroll(root)'));
    } catch (e) {}

    if (!supportsScrollTimeline && !prefersReduced) {
      var station = document.getElementById('projects-orbital-station');
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            if (station) {
              var stationSec = document.getElementById('projects');
              if (stationSec) {
                var sTop = stationSec.offsetTop;
                var sRel = scrollY - sTop;
                station.style.transform = 'translate3d(0, ' + (sRel * -0.05) + 'px, 0)';
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   CHUNKY PIXEL-ART ASTEROID FIELD (COSMIC GRAVITY & INERTIA ENGINE)
   - Natural, irregular 3D cosmic distribution across all 8 page sections
   - 3 distinct depth tiers (micro distant, mid-field, chunky near)
   - Independent floating motion: distinct speeds, directions, orbits, rotations
   - Orbital gravitational simulation with smooth momentum and damping
   - Collision avoidance around all protected elements (text, buttons, cards,
     mascots, and footer scenery)
   - Zero pointer events interference; crisp pixel edges; reduced motion support
   ═══════════════════════════════════════════════════════════════════════════ */
(function initChunkyPixelAsteroidField() {
  function startEngine() {
    var container = document.getElementById('asteroid-field');
    if (!container) return;

        var ASTEROID_CONFIGS = [
      // Hero / Profile Section (5 asteroids: 2 distant specks, 2 mid rocks, 1 distant cluster)
      { id: 0, sectionId: 'profile', relX: 0.04, relY: 0.08, tier: 1, sprite: 3, size: 8, orbitRx: 9, orbitRy: 7, orbitSpeed: 0.00018, wobbleSpeed: 0.00045, wobbleAmp: 2, rotSpeed: 0.012, phase: 0.4, inclination: -25 },
      { id: 1, sectionId: 'profile', relX: 0.03, relY: 0.52, tier: 3, sprite: 1, size: 32, orbitRx: 32, orbitRy: 22, orbitSpeed: 0.00055, wobbleSpeed: 0.0010, wobbleAmp: 6, rotSpeed: 0.060, phase: 3.2, inclination: 35 },
      { id: 2, sectionId: 'profile', relX: 0.94, relY: 0.09, tier: 2, sprite: 2, size: 18, orbitRx: 18, orbitRy: 12, orbitSpeed: 0.00036, wobbleSpeed: 0.00075, wobbleAmp: 4, rotSpeed: -0.032, phase: 1.8, inclination: -15 },
      { id: 3, sectionId: 'profile', relX: 0.92, relY: 0.68, tier: 1, sprite: 3, size: 7, orbitRx: 8, orbitRy: 6, orbitSpeed: 0.00016, wobbleSpeed: 0.0004, wobbleAmp: 1.5, rotSpeed: -0.014, phase: 4.5, inclination: 40 },
      { id: 4, sectionId: 'profile', relX: 0.955, relY: 0.88, tier: 2, sprite: 2, size: 19, orbitRx: 20, orbitRy: 14, orbitSpeed: 0.00038, wobbleSpeed: 0.0008, wobbleAmp: 4.5, rotSpeed: 0.030, phase: 5.6, inclination: -20 },

      // About Section (4 asteroids: 2 distant, 1 mid, 1 distant cluster)
      { id: 5, sectionId: 'about', relX: 0.965, relY: 0.04, tier: 2, sprite: 2, size: 16, orbitRx: 14, orbitRy: 10, orbitSpeed: 0.00030, wobbleSpeed: 0.0006, wobbleAmp: 3, rotSpeed: 0.025, phase: 0.9, inclination: -15 },
      { id: 6, sectionId: 'about', relX: 0.035, relY: 0.32, tier: 1, sprite: 3, size: 8, orbitRx: 10, orbitRy: 7, orbitSpeed: 0.00019, wobbleSpeed: 0.00045, wobbleAmp: 2, rotSpeed: -0.015, phase: 2.3, inclination: 20 },
      { id: 7, sectionId: 'about', relX: 0.045, relY: 0.62, tier: 2, sprite: 2, size: 18, orbitRx: 19, orbitRy: 14, orbitSpeed: 0.00036, wobbleSpeed: 0.00075, wobbleAmp: 4, rotSpeed: 0.032, phase: 5.1, inclination: -45 },
      { id: 8, sectionId: 'about', relX: 0.935, relY: 0.82, tier: 1, sprite: 3, size: 8, orbitRx: 9, orbitRy: 6, orbitSpeed: 0.00017, wobbleSpeed: 0.0004, wobbleAmp: 1.8, rotSpeed: -0.012, phase: 3.8, inclination: 15 },

      // Experience Section (4 asteroids: 1 distant, 2 mid, 1 distant cluster)
      { id: 9, sectionId: 'experience', relX: 0.045, relY: 0.18, tier: 2, sprite: 2, size: 18, orbitRx: 18, orbitRy: 13, orbitSpeed: 0.00038, wobbleSpeed: 0.0008, wobbleAmp: 4.5, rotSpeed: -0.030, phase: 1.1, inclination: 30 },
      { id: 10, sectionId: 'experience', relX: 0.025, relY: 0.74, tier: 3, sprite: 1, size: 33, orbitRx: 34, orbitRy: 23, orbitSpeed: 0.00058, wobbleSpeed: 0.0011, wobbleAmp: 7, rotSpeed: 0.065, phase: 4.8, inclination: -35 },
      { id: 11, sectionId: 'experience', relX: 0.95, relY: 0.38, tier: 1, sprite: 3, size: 7, orbitRx: 8, orbitRy: 5, orbitSpeed: 0.00016, wobbleSpeed: 0.00035, wobbleAmp: 1.5, rotSpeed: 0.011, phase: 3.7, inclination: -15 },
      { id: 12, sectionId: 'experience', relX: 0.935, relY: 0.78, tier: 2, sprite: 2, size: 17, orbitRx: 17, orbitRy: 12, orbitSpeed: 0.00035, wobbleSpeed: 0.0007, wobbleAmp: 4, rotSpeed: 0.028, phase: 2.7, inclination: 45 },

      // Projects Section (7 asteroids: drifting through margins, central gap, and behind cards)
      { id: 13, sectionId: 'projects', relX: 0.035, relY: 0.10, tier: 1, sprite: 3, size: 9, orbitRx: 10, orbitRy: 7, orbitSpeed: 0.00018, wobbleSpeed: 0.0004, wobbleAmp: 2, rotSpeed: -0.014, phase: 0.6, inclination: 25 },
      { id: 14, sectionId: 'projects', relX: 0.24, relY: 0.68, tier: 2, sprite: 1, size: 26, orbitRx: 18, orbitRy: 13, orbitSpeed: 0.00035, wobbleSpeed: 0.00075, wobbleAmp: 4.5, rotSpeed: 0.028, phase: 2.1, inclination: -20 },
      { id: 15, sectionId: 'projects', relX: 0.945, relY: 0.38, tier: 3, sprite: 1, size: 34, orbitRx: 35, orbitRy: 22, orbitSpeed: 0.00060, wobbleSpeed: 0.0011, wobbleAmp: 7, rotSpeed: -0.065, phase: 3.9, inclination: 35 },
      { id: 16, sectionId: 'projects', relX: 0.445, relY: 0.70, tier: 2, sprite: 2, size: 16, orbitRx: 12, orbitRy: 18, orbitSpeed: 0.00026, wobbleSpeed: 0.0006, wobbleAmp: 3, rotSpeed: 0.018, phase: 1.4, inclination: 15 },
      { id: 17, sectionId: 'projects', relX: 0.66, relY: 0.68, tier: 2, sprite: 1, size: 24, orbitRx: 19, orbitRy: 14, orbitSpeed: 0.00036, wobbleSpeed: 0.0008, wobbleAmp: 4.5, rotSpeed: -0.030, phase: 4.7, inclination: -15 },
      { id: 18, sectionId: 'projects', relX: 0.28, relY: 0.92, tier: 3, sprite: 1, size: 31, orbitRx: 31, orbitRy: 21, orbitSpeed: 0.00054, wobbleSpeed: 0.0010, wobbleAmp: 6.5, rotSpeed: 0.055, phase: 1.5, inclination: -25 },
      { id: 19, sectionId: 'projects', relX: 0.94, relY: 0.88, tier: 1, sprite: 3, size: 8, orbitRx: 9, orbitRy: 6, orbitSpeed: 0.00017, wobbleSpeed: 0.0004, wobbleAmp: 2, rotSpeed: -0.014, phase: 5.4, inclination: 45 },

      // Hackathons Section (3 asteroids: 1 distant, 1 mid, 1 distant cluster)
      { id: 20, sectionId: 'hackathons', relX: 0.04, relY: 0.22, tier: 3, sprite: 1, size: 29, orbitRx: 30, orbitRy: 20, orbitSpeed: 0.00050, wobbleSpeed: 0.00095, wobbleAmp: 6, rotSpeed: 0.052, phase: 2.8, inclination: -40 },
      { id: 21, sectionId: 'hackathons', relX: 0.945, relY: 0.38, tier: 1, sprite: 3, size: 8, orbitRx: 9, orbitRy: 6, orbitSpeed: 0.00017, wobbleSpeed: 0.0004, wobbleAmp: 1.8, rotSpeed: -0.012, phase: 4.1, inclination: 30 },
      { id: 22, sectionId: 'hackathons', relX: 0.93, relY: 0.76, tier: 2, sprite: 2, size: 17, orbitRx: 17, orbitRy: 12, orbitSpeed: 0.00034, wobbleSpeed: 0.0007, wobbleAmp: 4, rotSpeed: 0.026, phase: 0.7, inclination: -15 },

      // Certificates Section (4 asteroids: 1 distant, 2 mid, 1 distant cluster)
      { id: 23, sectionId: 'certificates', relX: 0.95, relY: 0.16, tier: 2, sprite: 2, size: 19, orbitRx: 19, orbitRy: 14, orbitSpeed: 0.00036, wobbleSpeed: 0.00075, wobbleAmp: 4.5, rotSpeed: -0.032, phase: 1.9, inclination: 25 },
      { id: 24, sectionId: 'certificates', relX: 0.035, relY: 0.42, tier: 1, sprite: 3, size: 7, orbitRx: 8, orbitRy: 5, orbitSpeed: 0.00015, wobbleSpeed: 0.00035, wobbleAmp: 1.5, rotSpeed: 0.010, phase: 3.4, inclination: -30 },
      { id: 25, sectionId: 'certificates', relX: 0.94, relY: 0.68, tier: 3, sprite: 1, size: 32, orbitRx: 33, orbitRy: 22, orbitSpeed: 0.00056, wobbleSpeed: 0.0010, wobbleAmp: 6.8, rotSpeed: 0.060, phase: 5.7, inclination: 35 },
      { id: 26, sectionId: 'certificates', relX: 0.045, relY: 0.88, tier: 2, sprite: 2, size: 16, orbitRx: 16, orbitRy: 11, orbitSpeed: 0.00032, wobbleSpeed: 0.00065, wobbleAmp: 3.8, rotSpeed: -0.025, phase: 4.2, inclination: -20 },

      // Contacts Section (3 asteroids: 2 distant, 1 mid)
      { id: 27, sectionId: 'contacts', relX: 0.035, relY: 0.28, tier: 2, sprite: 2, size: 17, orbitRx: 17, orbitRy: 12, orbitSpeed: 0.00035, wobbleSpeed: 0.0007, wobbleAmp: 4, rotSpeed: 0.028, phase: 0.6, inclination: 40 },
      { id: 28, sectionId: 'contacts', relX: 0.955, relY: 0.48, tier: 1, sprite: 3, size: 8, orbitRx: 9, orbitRy: 6, orbitSpeed: 0.00017, wobbleSpeed: 0.0004, wobbleAmp: 2, rotSpeed: -0.013, phase: 2.6, inclination: -25 },
      { id: 29, sectionId: 'contacts', relX: 0.04, relY: 0.76, tier: 1, sprite: 3, size: 7, orbitRx: 7, orbitRy: 5, orbitSpeed: 0.00015, wobbleSpeed: 0.00035, wobbleAmp: 1.4, rotSpeed: 0.010, phase: 5.0, inclination: 15 },

      // Contacts Section Cosmic Background (3 asteroids: 1 mid cluster, 2 distant)
      { id: 30, sectionId: 'contacts', relX: 0.09, relY: 0.70, tier: 3, sprite: 1, size: 28, orbitRx: 14, orbitRy: 7, orbitSpeed: 0.00045, wobbleSpeed: 0.00085, wobbleAmp: 2.5, rotSpeed: -0.050, phase: 4.3, inclination: -30 },
      { id: 31, sectionId: 'contacts', relX: 0.93, relY: 0.80, tier: 1, sprite: 3, size: 8, orbitRx: 8, orbitRy: 6, orbitSpeed: 0.00016, wobbleSpeed: 0.00038, wobbleAmp: 1.8, rotSpeed: 0.012, phase: 1.2, inclination: 20 },
      { id: 32, sectionId: 'contacts', relX: 0.88, relY: 0.22, tier: 2, sprite: 2, size: 16, orbitRx: 16, orbitRy: 11, orbitSpeed: 0.00033, wobbleSpeed: 0.00065, wobbleAmp: 3.8, rotSpeed: 0.025, phase: 3.5, inclination: -15 }
    ];

    var PROTECTED_SELECTORS = [
      '#profile .section__pic-container',
      '#profile .section__text',
      '#profile .btn-container',
      '#profile #socials-container',
      '#hero-pixel-satellite',
      '#hero-pixel-planet',
      '#projects-pixel-planet',
      '.section-header h2',
      '.section-header .section-label',
      '.about-grid',
      '.about-education',
      '#space-nebula-wrap',
      '.space-nebula-wrap',
      '.space-nebula-img',
      '.marquee',
      '.experience-layout',
      '.project-featured',
      '.project-grid',
      '.hackathon-card',
      '.cert-card',
      '.contact-card',
      '.contact-form',
      '#contact-form',
      '.contact-info',
      '#mascot-chatgpt',
      '.mascot-chatgpt-wrap',
      '#mascot-claude',
      '.mascot-claude-patrol-wrap',
      '#mascot-gemini',
      '.mascot-gemini-wrap',
      '#contact-tux-track',
      '#footer-droid-wrap',
      '.prop-droid',
      '#pixel-starfighter-wrap',
      '#hackathons-starfighter',
      '.pixel-starfighter-flight-wrap',
      '#space-helmet-wrap',
      '#tiny-probe-wrap',
      '.tiny-space-probe-drift-wrap',
      '#projects-orbital-station',
      '.projects-orbital-station',
      '#prop-wasteland-beacon',
      '.prop-wasteland-beacon',
      '.contacts-pixel-moon'
    ];

    var protectedBoxes = [];
    var asteroids = [];
    var lastTime = null;
    var simTime = 0;
    var animFrameId = null;

    function getSectionEl(id) {
      if (id === 'footer') {
        return document.querySelector('footer');
      }
      return document.getElementById(id);
    }

    container.innerHTML = '';
    ASTEROID_CONFIGS.forEach(function (cfg) {
      var el = document.createElement('div');
      el.className = 'pixel-asteroid pixel-asteroid--tier-' + cfg.tier;
      el.setAttribute('aria-hidden', 'true');

      var nativeW = cfg.sprite === 1 ? 48 : (cfg.sprite === 2 ? 36 : 24);
      var nativeH = cfg.sprite === 1 ? 44 : (cfg.sprite === 2 ? 28 : 22);
      var renderH = Math.round(cfg.size * (nativeH / nativeW));

      el.style.width = cfg.size + 'px';
      el.style.height = renderH + 'px';

      var img = document.createElement('img');
      img.src = './assets/asteroid-' + cfg.sprite + '.png';
      img.alt = '';
      img.className = 'pixel-asteroid-img';
      img.width = cfg.size;
      img.height = renderH;
      img.draggable = false;

      el.appendChild(img);
      container.appendChild(el);

      var mass = cfg.tier === 3 ? 4.8 : (cfg.tier === 2 ? 2.4 : 1.0);
      var maxSpeed = cfg.tier === 3 ? 0.52 : (cfg.tier === 2 ? 0.32 : 0.14);

      asteroids.push({
        el: el,
        cfg: cfg,
        width: cfg.size,
        height: renderH,
        radius: Math.max(cfg.size, renderH) / 2,
        mass: mass,
        maxSpeed: maxSpeed,
        homeX: 0,
        homeY: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle: (cfg.id * 53) % 360,
        initialized: false
      });
    });

    function updateProtectedBoxes() {
      protectedBoxes = [];
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var scrollX = window.pageXOffset || document.documentElement.scrollLeft;

      PROTECTED_SELECTORS.forEach(function (sel) {
        try {
          var els = document.querySelectorAll(sel);
          for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) continue;
            var r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              protectedBoxes.push({
                left: r.left + scrollX,
                top: r.top + scrollY,
                right: r.right + scrollX,
                bottom: r.bottom + scrollY,
                cx: r.left + scrollX + r.width / 2,
                cy: r.top + scrollY + r.height / 2
              });
            }
          }
        } catch (e) {}
      });
    }

    function updateHomes() {
      var docWidth = document.documentElement.clientWidth || window.innerWidth;
      var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      container.style.height = docHeight + 'px';

      asteroids.forEach(function (ast) {
        var secEl = getSectionEl(ast.cfg.sectionId);
        if (!secEl) return;
        var secRect = secEl.getBoundingClientRect();
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        var secTop = secRect.top + scrollY;
        var secH = secEl.offsetHeight;

        var targetRelX = ast.cfg.relX;
        var targetRelY = ast.cfg.relY;

        if (ast.cfg.id === 30) {
          if (docWidth <= 900) {
            // Positioned in open cosmic space below contact form, matching user's mobile placement
            var btnEl = document.getElementById('submit-btn');
            var footerEl = document.querySelector('footer');
            if (btnEl && footerEl) {
              var btnRect = btnEl.getBoundingClientRect();
              var footerRect = footerEl.getBoundingClientRect();
              var btnBottom = btnRect.bottom + scrollY;
              var footerTop = footerRect.top + scrollY;
              targetX = docWidth * 0.10 - (ast.width / 2);
              targetY = (btnBottom + footerTop) / 2 - (ast.height / 2);
            } else {
              targetRelX = 0.10;
              targetRelY = 0.94;
              targetX = docWidth * targetRelX - (ast.width / 2);
              targetY = secTop + (secH * targetRelY) - (ast.height / 2);
            }
          } else {
            // Desktop (2-column layout): sits in open cosmic space on the left below contact links
            targetRelX = 0.08;
            targetRelY = 0.70;
            targetX = docWidth * targetRelX - (ast.width / 2);
            targetY = secTop + (secH * targetRelY) - (ast.height / 2);
          }
        } else {
          targetX = docWidth * targetRelX - (ast.width / 2);
          targetY = secTop + (secH * targetRelY) - (ast.height / 2);
        }

        // Absolute safeguard against clipping into footer:
        // Ensure no asteroid's downward orbital reach can ever cross footerTop
        var footerEl = document.querySelector('footer');
        if (footerEl) {
          var footerTop = footerEl.getBoundingClientRect().top + scrollY;
          var safeMargin = (ast.cfg.orbitRy || 10) + (ast.cfg.wobbleAmp || 4) + ast.height + 12;
          if (targetY + safeMargin > footerTop) {
            targetY = footerTop - safeMargin;
          }
        }

        ast.homeX = targetX;
        ast.homeY = targetY;

        if (!ast.initialized) {
          ast.x = targetX;
          ast.y = targetY;
          ast.vx = 0;
          ast.vy = 0;
          ast.initialized = true;
        }
      });

      updateProtectedBoxes();
    }

    updateHomes();

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReduced = motionQuery.matches;

    if (prefersReduced) {
      asteroids.forEach(function (ast) {
        ast.el.style.transform = 'translate3d(' + ast.homeX.toFixed(1) + 'px, ' + ast.homeY.toFixed(1) + 'px, 0) rotate(' + ast.angle.toFixed(2) + 'deg)';
      });
      return;
    }

    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      simTime += dt * 60;

      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      var footerEl = document.querySelector('footer');
      var footerTopLimit = footerEl ? (footerEl.getBoundingClientRect().top + scrollY) : 999999;

      for (var i = 0; i < asteroids.length; i++) {
        var ast = asteroids[i];
        var cfg = ast.cfg;

        // 1. Orbital Gravity & Inertia
        var t = simTime;
        var orbitAngle = t * cfg.orbitSpeed + cfg.phase;
        var wobble = Math.sin(t * cfg.wobbleSpeed) * cfg.wobbleAmp;
        var wobbleY = Math.cos(t * cfg.wobbleSpeed * 0.8) * (cfg.wobbleAmp * 0.7);

        // Unrotated elliptical displacement
        var u = Math.cos(orbitAngle) * cfg.orbitRx + wobble;
        var v = Math.sin(orbitAngle) * cfg.orbitRy + wobbleY;

        // Rotate by unique 3D orbital inclination angle
        var incRad = (cfg.inclination || 0) * (Math.PI / 180);
        var cosInc = Math.cos(incRad);
        var sinInc = Math.sin(incRad);

        var targetX = ast.homeX + (u * cosInc - v * sinInc);
        var targetY = ast.homeY + (u * sinInc + v * cosInc);

        var kGrav = 0.0016 / ast.mass;
        var ax = (targetX - ast.x) * kGrav;
        var ay = (targetY - ast.y) * kGrav;

        // 2. Collision Avoidance against Protected Elements
        var astRadius = ast.radius;
        var safePadding = (ast.cfg.id === 30) ? (10 + astRadius) : (35 + astRadius);

        for (var b = 0; b < protectedBoxes.length; b++) {
          var box = protectedBoxes[b];
          if (ast.cfg.id === 30 && box.bottom <= ast.y + 4) {
            continue;
          }
          if (ast.x + safePadding < box.left || ast.x - safePadding > box.right ||
              ast.y + safePadding < box.top || ast.y - safePadding > box.bottom) {
            continue;
          }

          var closestX = Math.max(box.left, Math.min(ast.x, box.right));
          var closestY = Math.max(box.top, Math.min(ast.y, box.bottom));
          var cdx = ast.x - closestX;
          var cdy = ast.y - closestY;
          var cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < safePadding) {
            if (cdist < 0.01) {
              var pushAngle = Math.atan2(ast.y - box.cy, ast.x - box.cx);
              ax += Math.cos(pushAngle) * 0.9;
              ay += Math.sin(pushAngle) * 0.9;
            } else {
              var repulse = (safePadding - cdist) / safePadding;
              var repForce = repulse * repulse * (0.65 / ast.mass);
              ax += (cdx / cdist) * repForce;
              ay += (cdy / cdist) * repForce;
            }
          }
        }

        // 4. Asteroid-to-Asteroid Soft Separation
        for (var j = i + 1; j < asteroids.length; j++) {
          var other = asteroids[j];
          var mdx = ast.x - other.x;
          var mdy = ast.y - other.y;
          var mDistSq = mdx * mdx + mdy * mdy;
          var minDist = astRadius + other.radius + 18;
          if (mDistSq < minDist * minDist) {
            var mDist = Math.sqrt(mDistSq) || 0.1;
            var sep = ((minDist - mDist) / minDist) * 0.15;
            var sx = (mdx / mDist) * sep;
            var sy = (mdy / mDist) * sep;
            ax += sx / ast.mass;
            ay += sy / ast.mass;
            other.vx -= sx / other.mass;
            other.vy -= sy / other.mass;
          }
        }

        // 5. Integrate Physics: Inertia, Damping & Speed Clamping
        ast.vx = (ast.vx + ax) * 0.988;
        ast.vy = (ast.vy + ay) * 0.988;

        var speed = Math.sqrt(ast.vx * ast.vx + ast.vy * ast.vy);
        if (speed > ast.maxSpeed) {
          ast.vx = (ast.vx / speed) * ast.maxSpeed;
          ast.vy = (ast.vy / speed) * ast.maxSpeed;
        }

        ast.x += ast.vx;
        ast.y += ast.vy;

        // Absolute physics bound: ensure asteroid never crosses into opaque footer
        if (ast.y + ast.height > footerTopLimit - 4) {
          ast.y = footerTopLimit - ast.height - 4;
          if (ast.vy > 0) ast.vy = -Math.abs(ast.vy) * 0.4;
        }

        ast.angle += cfg.rotSpeed;

        // 6. Viewport Culling & DOM Rendering
        var isVisible = (ast.y + ast.height >= scrollY - 250) && (ast.y <= scrollY + viewportHeight + 250);
        if (isVisible) {
          ast.el.style.transform = 'translate3d(' + ast.x.toFixed(1) + 'px, ' + ast.y.toFixed(1) + 'px, 0) rotate(' + ast.angle.toFixed(2) + 'deg)';
        }
      }

      animFrameId = requestAnimationFrame(step);
    }

    animFrameId = requestAnimationFrame(step);

    setInterval(updateProtectedBoxes, 3000);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHomes, 180);
    });
    window.addEventListener('orientationchange', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHomes, 180);
    });

    motionQuery.addEventListener('change', function (e) {
      if (e.matches) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        asteroids.forEach(function (ast) {
          ast.el.style.transform = 'translate3d(' + ast.homeX.toFixed(1) + 'px, ' + ast.homeY.toFixed(1) + 'px, 0) rotate(' + ast.angle.toFixed(2) + 'deg)';
        });
      } else {
        lastTime = null;
        animFrameId = requestAnimationFrame(step);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startEngine);
  } else {
    startEngine();
  }
})();



/* ═══════════════════════════════════════════════════════════════════════════
   DISTANT RINGED PIXEL PLANET (PROJECTS SECTION BACKGROUND)
   - Slow, continuous rotation creating a calm, distant-in-space effect
   - Subtle dual-harmonic orbital drift with gentle celestial gravity and inertia
   - Independent motion state (position, velocity, angle, angular velocity)
   - Collision avoidance against section header
   - Fully scoped within Projects section; reduced motion compliance
   ═══════════════════════════════════════════════════════════════════════════ */
(function initDistantRingedPlanet() {
  function start() {
    var planet = document.getElementById('projects-pixel-planet');
    var driftWrap = document.getElementById('projects-planet-drift-wrap');
    var planetSec = planet.closest('section') || document.getElementById('experience') || document.getElementById('projects');
    if (!planet || !driftWrap || !planetSec) return;

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prefersReduced = motionQuery.matches;

    // Independent state with high celestial mass (smooth inertia)
    var state = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -8, // Initial subtle cosmic tilt
      rotSpeed: 0.022, // ~1.3 deg/sec slow, deliberate continuous rotation
      orbitRx: 18,
      orbitRy: 12,
      orbitFreq: 0.00032,
      wobbleFreq: 0.00075,
      wobbleAmp: 4.5,
      phase: 1.85,
      mass: 8.5,
      time: 0
    };

    if (prefersReduced) {
      planet.style.transform = 'translate3d(0, 0, 0)';
      driftWrap.style.transform = 'rotate(' + state.angle + 'deg)';
      return;
    }

    var animFrame = null;
    var lastTime = null;

    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      state.time += dt * 60;
      var t = state.time;

      // 1. Dual-harmonic orbital gravity target
      var targetX = Math.cos(t * state.orbitFreq + state.phase) * state.orbitRx +
                    Math.sin(t * state.wobbleFreq) * state.wobbleAmp;
      var targetY = Math.sin(t * state.orbitFreq + state.phase) * state.orbitRy +
                    Math.cos(t * state.wobbleFreq * 0.75) * (state.wobbleAmp * 0.65);

      // Restoring celestial gravitational acceleration towards orbital equilibrium
      var kGrav = 0.0009 / state.mass;
      var ax = (targetX - state.x) * kGrav;
      var ay = (targetY - state.y) * kGrav;

      // 3. Integrate inertia, vacuum damping & speed limit
      state.vx = (state.vx + ax) * 0.990;
      state.vy = (state.vy + ay) * 0.990;

      var speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      var maxSpeed = 0.28;
      if (speed > maxSpeed) {
        state.vx = (state.vx / speed) * maxSpeed;
        state.vy = (state.vy / speed) * maxSpeed;
      }

      state.x += state.vx;
      state.y += state.vy;

      // 4. Continuous deliberate rotation
      state.angle += state.rotSpeed;

      // 5. Viewport check & transform updates
      var secRect = planetSec.getBoundingClientRect();
      var inView = (secRect.bottom > -200 && secRect.top < window.innerHeight + 200);
      if (inView) {
        planet.style.transform = 'translate3d(' + state.x.toFixed(2) + 'px, ' + state.y.toFixed(2) + 'px, 0)';
        driftWrap.style.transform = 'rotate(' + state.angle.toFixed(2) + 'deg)';
      }

      animFrame = requestAnimationFrame(step);
    }

    animFrame = requestAnimationFrame(step);

    motionQuery.addEventListener('change', function (e) {
      if (e.matches) {
        if (animFrame) cancelAnimationFrame(animFrame);
        planet.style.transform = 'translate3d(0, 0, 0)';
        driftWrap.style.transform = 'rotate(' + state.angle + 'deg)';
      } else {
        lastTime = null;
        animFrame = requestAnimationFrame(step);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* ════════════════════════════════════════════════════════════════════
   ABANDONED DROID HEAD INTERACTIVE SENSOR CONTROLLER
   ════════════════════════════════════════════════════════════════════ */
(function initAbandonedDroidHead() {
  function setup() {
    var droidHead = document.getElementById('prop-droid-head');
    if (!droidHead) return;

    var activeTimeout = null;
    function triggerSensor() {
      droidHead.classList.add('active-sensor');
      if (activeTimeout) clearTimeout(activeTimeout);
      activeTimeout = setTimeout(function () {
        droidHead.classList.remove('active-sensor');
      }, 1600);
    }

    droidHead.addEventListener('click', function (e) {
      if (e) e.stopPropagation();
      triggerSensor();
    });
    droidHead.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        triggerSensor();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

