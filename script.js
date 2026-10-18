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
  // STRICT RULE: Original Terminator sprites and projectile assets remain untouched
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

  // Terminator Geometry & Motion Constants
  var ROBOT_DRAW_W = 50;
  var ROBOT_DRAW_H = 55;
  var BARREL_OFFSET_X = 2;
  var BARREL_OFFSET_Y = 24;
  var WALK_SPEED = 0.42;

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
  var stateTimer = 60;
  var walkFrame = 0;
  var walkStepTimer = 0;
  var burstRemaining = 0;
  var burstCooldown = 0;

  // Badge Stream Items & Particles
  var streamItems = [];
  var pixelDust = [];
  var muzzleSparks = [];

  function getSceneLayout(w, h) {
    var gY = 96; // Terminator feet land exactly at bottom of 96px canvas
    var isSmallMobile = w < 480;
    var minPatrolX = isSmallMobile ? Math.round(w * 0.26) : Math.round(w * 0.32);
    var maxPatrolX = isSmallMobile ? Math.round(w * 0.48) : Math.max(minPatrolX + 60, Math.round(w * 0.54));

    return {
      groundY: gY,
      minPatrolX: minPatrolX,
      maxPatrolX: maxPatrolX,
      leftBound: isSmallMobile ? Math.round(w * 0.18) : Math.round(w * 0.26),
      rightBound: isSmallMobile ? Math.round(w * 0.65) : Math.round(w * 0.58)
    };
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width || window.innerWidth));
    height = 96;
    canvas.width = width;
    canvas.height = height;

    var layout = getSceneLayout(width, height);
    if (robotX < layout.minPatrolX) robotX = layout.minPatrolX;
    if (robotX > layout.maxPatrolX) robotX = layout.maxPatrolX;
  }

  function spawnMuzzleSparks(x, y, dir) {
    var count = isOverdrive ? 5 : 3;
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
        if (actionRoll < 0.55 && (layout.maxPatrolX - layout.minPatrolX > 40)) {
          patrolState = 'WALK';
          robotTargetX = layout.minPatrolX + Math.random() * (layout.maxPatrolX - layout.minPatrolX);
          facing = robotTargetX > robotX ? 1 : -1;
        } else {
          patrolState = 'AIM_FIRE';
          burstRemaining = isOverdrive ? 4 : 3;
          burstCooldown = 0;
          facing = Math.random() < 0.6 ? -1 : 1;
        }
      }
    } else if (patrolState === 'WALK') {
      var moveDist = robotTargetX - robotX;
      var currentSpeed = WALK_SPEED * (isOverdrive ? 1.4 : 1.0);

      if (Math.abs(moveDist) <= currentSpeed) {
        robotX = robotTargetX;
        patrolState = 'AIM_FIRE';
        burstRemaining = isOverdrive ? 4 : 3;
        burstCooldown = 12;
        facing = Math.random() < 0.65 ? -1 : 1;
      } else {
        robotX += (moveDist > 0 ? 1 : -1) * currentSpeed;
        walkStepTimer++;
        if (walkStepTimer >= 14) {
          walkStepTimer = 0;
          walkFrame = walkFrame === 0 ? 1 : 0;
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

        var projVx = facing * (isOverdrive ? 3.4 : 2.4);

        // Spawn Badge
        streamItems.push({
          type: 'badge',
          key: key,
          x: muzzleTipX,
          y: muzzleTipY,
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
          vx: projVx,
          alpha: 1,
          dist: 0,
          waveOffset: Math.random() * 6.28
        });

        recoilOffset = isOverdrive ? 3.4 : 2.0;
        spawnMuzzleSparks(muzzleTipX, muzzleTipY, facing);
        burstRemaining--;
        burstCooldown = isOverdrive ? 12 : 20;
      } else if (burstRemaining <= 0 && burstCooldown <= 0) {
        patrolState = 'IDLE_SCAN';
        stateTimer = 55 + Math.floor(Math.random() * 45);
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
        if (Math.random() < 0.4) {
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
        if (Math.random() < 0.4) {
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
      else if (item.dist > 300) {
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
    // 1. Transparent Clear (Site background and starfield show through 100%!)
    ctx.clearRect(0, 0, width, height);

    var layout = getSceneLayout(width, height);
    var gY = layout.groundY;

    // 2. Streaming Tech Badges & Glowing Cyan Dots (Terminator Code Burst Stream)
    var isMoving = (patrolState === 'WALK');
    var stepBob = isMoving ? (Math.sin(frameCount * 0.32) * 1.2) : 0;
    var drawRobotX = robotX + (facing === -1 ? recoilOffset : -recoilOffset);
    var rx = Math.round(drawRobotX);
    var ry = Math.round(gY - ROBOT_DRAW_H + stepBob);
    var muzzleTipX = facing === -1 ? (rx + BARREL_OFFSET_X) : (rx + ROBOT_DRAW_W - BARREL_OFFSET_X);
    var muzzleTipY = ry + BARREL_OFFSET_Y;

    for (var bIdx = 0; bIdx < streamItems.length; bIdx++) {
      var item = streamItems[bIdx];
      if (item.alpha <= 0.02) continue;

      var floatY = Math.sin(item.dist * 0.06 + item.waveOffset) * 1.4;
      var drawCenterY = Math.round(item.y + floatY);

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
          var bw = bInfo.w || bInfo.img.naturalWidth;
          var bh = bInfo.h || bInfo.img.naturalHeight;
          var bx = Math.round(item.x - bw / 2);
          var by = Math.round(drawCenterY - bh / 2);
          ctx.drawImage(bInfo.img, bx, by, bw, bh);
          ctx.restore();
        }
      }
    }

    // 3. Dissolving Pixel Dust
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

    // 4. Cyan Muzzle Flash (When Terminator fires)
    if (patrolState === 'AIM_FIRE' && burstCooldown > (isOverdrive ? 6 : 12) && muzzleImg.complete && muzzleImg.naturalWidth > 0) {
      ctx.save();
      var mPulse = isOverdrive ? (1.15 + 0.25 * Math.sin(frameCount * 0.6)) : (0.85 + 0.15 * Math.sin(frameCount * 0.35));
      var mWidth = Math.round(20 * mPulse);
      var mHeight = Math.round(18 * mPulse);
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

    // 6. Preserved Authentic Terminator Character (Sprite & Animation)
    // Feet land at y = 96 (the ground baseline)
    var droidSprite = (walkFrame === 1 && robotStepImg.complete && robotStepImg.naturalWidth > 0)
      ? robotStepImg
      : robotImg;

    if (droidSprite.complete && droidSprite.naturalWidth > 0) {
      ctx.save();
      if (facing === -1) {
        // Facing Left
        ctx.drawImage(droidSprite, rx, ry, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Glowing Cyan Visor Glint
        if (patrolState === 'IDLE_SCAN' || patrolState === 'AIM_FIRE' || Math.sin(frameCount * 0.08) > 0.6) {
          ctx.fillStyle = '#22d3ee';
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 4;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(rx + 9, ry + 15, 3, 2);
        }
      } else {
        // Facing Right (Mirrored)
        ctx.translate(rx + ROBOT_DRAW_W, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(droidSprite, 0, 0, ROBOT_DRAW_W, ROBOT_DRAW_H);

        // Visor Glint
        if (patrolState === 'IDLE_SCAN' || patrolState === 'AIM_FIRE' || Math.sin(frameCount * 0.08) > 0.6) {
          ctx.fillStyle = '#22d3ee';
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 4;
          ctx.globalAlpha = 0.85;
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

  // Interactive Click Handlers: Terminator Overdrive Burst
  if (container) {
    container.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
      var clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

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
  }

  init();
})();

  /* ═══════════════════════════════════════════════════════════════════════════
     AUTONOMOUS INTERACTIVE FOOTER DROID
     Step 2 State Machine: IDLE -> MOVE -> PAUSE -> TURN -> MOVE
     Outer wrapper sets translate3d(Math.round(x)px, 0, 0) only.
     Inner element sets CSS bob only.
     Flipper element sets scaleX for facing and squash animation.
     Delta-time based movement with ease-in/ease-out.
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
    var turnDuration = 0.2; // 200ms squash & turn
    var turnTimer = 0;
    var oldFacing = 1;
    var newFacing = -1;
    var facing = 1; // 1 = right, -1 = left

    // Position and motion
    var x = 65;
    var targetX = 65;
    var startX = 65;
    var moveElapsed = 0;
    var walkTimer = 0;
    var walkFrame = 0;

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
        maxX = Math.min(190, Math.floor(w * 0.30));
      } else {
        minX = 16;
        maxX = Math.min(105, Math.floor(w * 0.32));
      }
      return { minX: minX, maxX: Math.max(minX + 60, maxX) };
    }

    var bounds = getBounds();
    x = Math.max(bounds.minX + 15, Math.min(bounds.maxX - 15, 65));
    targetX = x;
    wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
    flipper.style.transform = 'scaleX(' + facing + ')';

    function setFrame(frameIdx) {
      sprite.style.backgroundPosition = (-(frameIdx * 32)) + 'px 0px';
    }

    function pickNextMove() {
      bounds = getBounds();
      var curBounds = bounds;
      var maxSpan = curBounds.maxX - curBounds.minX;
      // Randomized walk distance between 80px and 220px
      var desiredDist = 80 + Math.random() * Math.min(140, maxSpan - 30);

      var canContinue = false;
      var possibleTarget;
      if (facing === 1) {
        possibleTarget = x + desiredDist;
        if (possibleTarget <= curBounds.maxX - 8) {
          canContinue = true;
        }
      } else {
        possibleTarget = x - desiredDist;
        if (possibleTarget >= curBounds.minX + 8) {
          canContinue = true;
        }
      }

      var shouldTurn = false;
      if (!canContinue) {
        shouldTurn = true;
      } else if (Math.random() < 0.35) {
        var openSpaceOtherSide = facing === 1 ? (x - curBounds.minX) : (curBounds.maxX - x);
        if (openSpaceOtherSide >= 80) {
          shouldTurn = true;
        }
      }

      if (shouldTurn) {
        newFacing = -facing;
        var available = newFacing === 1 ? (curBounds.maxX - x) : (x - curBounds.minX);
        var dist = 80 + Math.random() * Math.min(140, available - 10);
        dist = Math.max(50, Math.min(dist, available - 8));
        if (newFacing === 1) {
          targetX = x + dist;
        } else {
          targetX = x - dist;
        }
        state = 'TURN';
        turnTimer = 0;
        oldFacing = facing;
        setFrame(0);
      } else {
        targetX = possibleTarget;
        startX = x;
        moveElapsed = 0;
        state = 'MOVE';
        setFrame(4);
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
        setFrame(0);
        rAF = requestAnimationFrame(step);
        return;
      }

      if (state === 'IDLE') {
        stateTimer -= dt;
        if (stateTimer < 0.35 && stateTimer > 0.15) {
          setFrame(1); // Subtle optic blink
        } else {
          setFrame(0);
        }
        if (stateTimer <= 0) {
          pickNextMove();
        }
      } else if (state === 'TURN') {
        turnTimer += dt;
        var progress = Math.min(1, turnTimer / turnDuration);
        var currentScale;
        if (progress < 0.5) {
          var p1 = progress / 0.5;
          currentScale = oldFacing * (1.0 - 0.85 * p1); // Squash 1.0 -> 0.15
        } else {
          var p2 = (progress - 0.5) / 0.5;
          currentScale = newFacing * (0.15 + 0.85 * p2); // Expand 0.15 -> 1.0
        }
        flipper.style.transform = 'scaleX(' + currentScale.toFixed(3) + ')';
        setFrame(0);

        if (progress >= 1) {
          facing = newFacing;
          flipper.style.transform = 'scaleX(' + facing + ')';
          startX = x;
          moveElapsed = 0;
          state = 'MOVE';
          setFrame(4);
        }
      } else if (state === 'MOVE') {
        moveElapsed += dt;
        var remaining = Math.abs(targetX - x);

        // Subtle 300ms ease-in and ease-out
        var easeIn = Math.min(1, moveElapsed / easeDuration);
        var easeOut = Math.min(1, Math.max(0.18, remaining / (baseSpeed * easeDuration)));
        var curSpeed = baseSpeed * Math.min(easeIn, easeOut);

        var stepDist = curSpeed * dt;
        if (remaining <= stepDist || remaining < 0.5) {
          x = targetX;
          state = 'PAUSE';
          // Random pause between moves (1.0s to 3.0s)
          stateTimer = 1.0 + Math.random() * 2.0;
          setFrame(0);
        } else {
          x += facing * stepDist;
          bounds = getBounds();
          if (x < bounds.minX) x = bounds.minX;
          if (x > bounds.maxX) x = bounds.maxX;

          walkTimer += dt;
          if (walkTimer >= 0.13) {
            walkTimer = 0;
            walkFrame = (walkFrame + 1) % 4;
            setFrame(4 + walkFrame); // Cycles frames 4, 5, 6, 7
          }
        }
        // Outer wrapper sets translate3d with Math.round(x) only
        wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
      } else if (state === 'PAUSE') {
        stateTimer -= dt;
        if (stateTimer < 0.8 && stateTimer > 0.4) {
          setFrame(2); // Look around
        } else {
          setFrame(0);
        }
        if (stateTimer <= 0) {
          pickNextMove();
        }
      } else if (state === 'HAPPY') {
        stateTimer -= dt;
        setFrame(8); // Happy hop
        if (stateTimer <= 0) {
          state = 'PAUSE';
          stateTimer = 1.0;
          setFrame(0);
        }
      }

      rAF = requestAnimationFrame(step);
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        lastTime = performance.now(); // Reset dt so no jump occurs
      }
    });

    window.addEventListener('resize', function () {
      bounds = getBounds();
      if (x < bounds.minX) x = bounds.minX;
      if (x > bounds.maxX) x = bounds.maxX;
      wrap.style.transform = 'translate3d(' + Math.round(x) + 'px, 0, 0)';
    });

    wrap.addEventListener('click', function (e) {
      e.stopPropagation();
      state = 'HAPPY';
      stateTimer = 0.65;
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
     PIXEL SPACE ROCKET COMPANION (HERO / PROFILE SECTION)
     Stationary retro pixel-art rocket resting on mechanical landing legs in the
     profile cosmic background. On mouse click, mobile tap, or keyboard Enter/Space,
     triggers a visible launch sequence: thruster flares, pixel plasma emissions,
     parabolic ascent and apogee arc, controlled descent with retro-burn braking,
     and soft touchdown. Remains stationary once landed until activated again.
     ═══════════════════════════════════════════════════════════════════════════ */
  (function initRoamingPixelRocket() {
    var canvas = document.getElementById('space-rocket-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var profile = document.getElementById('profile');
    var btn = document.getElementById('pixel-rocket-btn');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var rocketImg = new Image();
    rocketImg.src = 'assets/pixel-rocket.png';

    // Section dimensions
    var width = profile ? profile.clientWidth : (window.innerWidth || 1200);
    var height = profile ? profile.clientHeight : (window.innerHeight || 800);

    // Responsive sizing (sprite native ratio: 216x508)
    var isMobile = width <= 600;
    var ROCKET_W = isMobile ? 18 : 24;
    var ROCKET_H = Math.round(ROCKET_W * (508 / 216));
    var legDropDist = Math.round(ROCKET_H * 0.52);

    // Rocket State
    var mode = 'LANDED'; // 'LANDED', 'LAUNCH'
    var isLaunching = false;
    var legDeploy = 1; // 0 to 1
    var angle = 0;
    var x = 0;
    var y = 0;
    var vx = 0;
    var vy = 0;

    // Launch flight parameters
    var launchStep = 0;
    var launchStartX = 0;
    var launchStartY = 0;
    var arcApexX = 0;
    var arcApexY = 0;

    // Particles
    var particles = [];

    // Loop control
    var isRunning = true;
    var rafId = null;

    function getHomePos() {
      var hx, hy;
      if (width > 900) {
        // Desktop: Open cosmic sky to the right of profile photo, below the planet
        hx = Math.round(Math.min(width - 55, Math.max(width * 0.86, 1200)));
        hy = Math.round(height * 0.50);
      } else if (width > 600) {
        // Tablet: Open right margin beside centered photo
        hx = Math.round(width * 0.86);
        hy = Math.round(height * 0.35);
      } else {
        // Mobile: Open right margin beside photo, clear of centered text
        hx = Math.round(width - 32);
        hy = Math.round(height * 0.34);
      }
      return { x: hx, y: hy };
    }

    function updateButtonPos() {
      if (!btn) return;
      var hitW = Math.max(56, ROCKET_W + 28);
      var hitH = Math.max(76, ROCKET_H + 28);
      btn.style.left = Math.round(x - hitW / 2) + 'px';
      btn.style.top = Math.round(y - ROCKET_H / 2 - 14) + 'px';
      btn.style.width = hitW + 'px';
      btn.style.height = hitH + 'px';
      btn.style.cursor = isLaunching ? 'default' : 'pointer';
    }

    function resize() {
      width = profile ? profile.clientWidth : (window.innerWidth || 1200);
      height = profile ? profile.clientHeight : (window.innerHeight || 800);
      isMobile = width <= 600;
      ROCKET_W = isMobile ? 18 : 24;
      ROCKET_H = Math.round(ROCKET_W * (508 / 216));
      legDropDist = Math.round(ROCKET_H * 0.52);

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      // Keep rocket stationed in its responsive home position when landed
      if (!isLaunching) {
        var home = getHomePos();
        x = home.x;
        y = home.y;
        angle = 0;
        legDeploy = 1;
        updateButtonPos();
      }
    }

    function triggerLaunch() {
      if (isLaunching) return; // Prevent repeated clicks from breaking active flight
      if (prefersReducedMotion) {
        // Subtle coolant whisper puff without sudden motion
        for (var p = 0; p < 6; p++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + ROCKET_H * 0.44,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 0.4 + Math.random() * 0.5,
            color: Math.random() > 0.4 ? '#22D3EE' : '#FFFFFF',
            size: Math.random() > 0.5 ? 2 : 1,
            alpha: 0.9,
            decay: 0.04
          });
        }
        return;
      }

      isLaunching = true;
      mode = 'LAUNCH';
      launchStep = 0;
      launchStartX = x;
      launchStartY = y;

      // Climb apex in open upper cosmic sky of profile
      arcApexX = Math.round(width > 900 ? width * 0.56 : (width > 600 ? width * 0.50 : width * 0.42));
      arcApexY = Math.round(Math.max(35, height * 0.10));
      updateButtonPos();
    }

    function update() {
      // ── FLIGHT MODE STATE MACHINE ──
      if (mode === 'LANDED') {
        // Rocket remains completely stationary; no autodrift, no wandering
        vx = 0;
        vy = 0;
        angle = 0;
        legDeploy = 1;

        // Occasional faint idle coolant whisper (every 220 frames)
        if (Math.random() < 0.005) {
          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + ROCKET_H * 0.42,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.3,
            color: '#CFC6B5',
            size: 1,
            alpha: 0.4,
            decay: 0.025
          });
        }

      } else if (mode === 'LAUNCH') {
        launchStep++;

        var nozzleDist = ROCKET_H * 0.44;

        if (launchStep <= 12) {
          // Phase 1: Ignition & Flame Flare at landing site
          legDeploy = Math.max(0, 1 - (launchStep / 12));
          x = launchStartX + (Math.random() - 0.5) * 1.0;
          y = launchStartY + (Math.random() - 0.5) * 1.0;

          for (var p = 0; p < 4; p++) {
            var rand = Math.random();
            var pColor = rand > 0.6 ? '#FFFFFF' : (rand > 0.25 ? '#22D3EE' : '#38BDF8');
            particles.push({
              x: x + (Math.random() - 0.5) * 8,
              y: y + nozzleDist,
              vx: (Math.random() - 0.5) * 1.8,
              vy: 2.4 + Math.random() * 2.0,
              color: pColor,
              size: Math.random() > 0.4 ? 2 : 1,
              alpha: 1,
              decay: 0.04
            });
          }

        } else if (launchStep <= 54) {
          // Phase 2: Upward Lift & Ascent Acceleration
          legDeploy = 0;
          var t = (launchStep - 12) / 42; // 0 to 1
          var easeY = Math.sin(t * (Math.PI / 2));
          var easeX = t;
          x = launchStartX + (arcApexX - launchStartX) * easeX;
          y = launchStartY + (arcApexY - launchStartY) * easeY;

          var desiredAngle = -0.24;
          angle += (desiredAngle - angle) * 0.08;

          // Main thruster plume backwards along heading
          var fx = Math.sin(angle);
          var fy = -Math.cos(angle);
          var nx = x - fx * nozzleDist;
          var ny = y - fy * nozzleDist;

          for (var p = 0; p < 3; p++) {
            var spread = (Math.random() - 0.5) * 0.8;
            var pSpeed = 2.4 + Math.random() * 1.8;
            particles.push({
              x: nx + (Math.random() - 0.5) * 4,
              y: ny + (Math.random() - 0.5) * 4,
              vx: -fx * pSpeed + spread,
              vy: -fy * pSpeed + spread,
              color: Math.random() > 0.5 ? '#FFFFFF' : '#22D3EE',
              size: Math.random() > 0.4 ? 2 : 1,
              alpha: 1,
              decay: 0.045
            });
          }

        } else if (launchStep <= 86) {
          // Phase 3: Cosmic Apogee Arc & RCS Attitude Burn
          var tApogee = (launchStep - 54) / 32;
          x = arcApexX + (launchStartX - arcApexX) * (tApogee * 0.25);
          y = arcApexY + (launchStartY - arcApexY) * (tApogee * tApogee * 0.25);

          angle += (0.12 - angle) * 0.06;

          // Side RCS thrusters fire puffs on hull
          if (launchStep % 3 === 0) {
            particles.push({
              x: x - Math.cos(angle) * (ROCKET_W * 0.44),
              y: y - Math.sin(angle) * (ROCKET_W * 0.44),
              vx: -Math.cos(angle) * 1.4,
              vy: -Math.sin(angle) * 1.4,
              color: '#22D3EE',
              size: 1,
              alpha: 0.85,
              decay: 0.06
            });
          }

        } else if (launchStep <= 134) {
          // Phase 4: Descent & Retro-burn Braking
          var tDesc = (launchStep - 86) / 48;
          var curStartX = arcApexX + (launchStartX - arcApexX) * 0.25;
          var curStartY = arcApexY + (launchStartY - arcApexY) * 0.25;
          var easeDesc = 1 - Math.cos(tDesc * (Math.PI / 2));

          x = curStartX + (launchStartX - curStartX) * tDesc;
          y = curStartY + (launchStartY - curStartY) * easeDesc;

          angle += (0 - angle) * 0.14;
          legDeploy = Math.min(1, tDesc * 1.35);

          // Retro thrusters firing downward in deceleration bursts
          for (var p = 0; p < 2; p++) {
            particles.push({
              x: x + (Math.random() - 0.5) * 6,
              y: y + nozzleDist,
              vx: (Math.random() - 0.5) * 0.8,
              vy: 1.6 + Math.random() * 1.0,
              color: Math.random() > 0.4 ? '#22D3EE' : '#FFFFFF',
              size: 1,
              alpha: 0.8,
              decay: 0.055
            });
          }

        } else {
          // Phase 5: Clean Touchdown on landing pad
          x = launchStartX;
          y = launchStartY;
          angle = 0;
          vx = 0;
          vy = 0;
          legDeploy = 1;
          mode = 'LANDED';
          isLaunching = false;

          // Soft settle dust burst across footpads
          for (var s = 0; s < 8; s++) {
            particles.push({
              x: x + (Math.random() - 0.5) * 14,
              y: y + legDropDist,
              vx: (Math.random() - 0.5) * 1.8,
              vy: -0.3 - Math.random() * 0.4,
              color: '#CFC6B5',
              size: Math.random() > 0.4 ? 2 : 1,
              alpha: 0.9,
              decay: 0.035
            });
          }

          updateButtonPos();
        }
      }

      // Update active particles
      for (var i = particles.length - 1; i >= 0; i--) {
        var pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 70) {
        particles.splice(0, particles.length - 70);
      }

      // Keep asteroid avoidance position updated
      if (profile) {
        var profRect = profile.getBoundingClientRect();
        window.__roamingRocketPos = {
          x: profRect.left + x,
          y: profRect.top + y,
          radius: Math.max(ROCKET_W, ROCKET_H) + 16
        };
        window.__roamingRocketMode = mode;
        window.__roamingRocketIsLaunching = isLaunching;
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
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(0);
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
      } else {
        rocketImg.onload = function () {
          if (!isRunning) return;
          render();
        };
      }

      // Hitbox Button Trigger (Primary click, tap, and keyboard trigger)
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          triggerLaunch();
        });

        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerLaunch();
          }
        });

        btn.addEventListener('pointerdown', function (e) {
          triggerLaunch();
        });
      }

      // Secondary Profile Section click / tap detection fallback
      if (profile) {
        profile.addEventListener('click', function (e) {
          var rect = canvas.getBoundingClientRect();
          var px = e.clientX - rect.left;
          var py = e.clientY - rect.top;
          if (Math.hypot(x - px, y - py) < 48) {
            triggerLaunch();
          }
        });
      }

      // Window pointer click fallback
      window.addEventListener('click', function (e) {
        if (!canvas) return;
        var rect = canvas.getBoundingClientRect();
        var canvasPx = e.clientX - rect.left;
        var canvasPy = e.clientY - rect.top;
        if (Math.hypot(x - canvasPx, y - canvasPy) < 48) {
          triggerLaunch();
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

    var claudeBody = el.querySelector('.claude-body');
    var claudeSprite = el.querySelector('.claude-sprite');
    var expSection = document.getElementById('experience');
    if (!claudeBody || !claudeSprite) return;

    var isActing = false;
    var cooldownUntil = 0;
    var actionTimer = null;
    var currentState = 'idle';

    function setState(st) {
      if (currentState === st) return;
      currentState = st;
      el.setAttribute('data-state', st);
    }

    // Dynamic divider line calibration
    function calibrateFeet() {
      if (!expSection) return;
      var secRect = expSection.getBoundingClientRect();
      var sprRect = claudeSprite.getBoundingClientRect();
      var currentBodyTop = parseFloat(getComputedStyle(claudeBody).top) || 5;
      var currentFeetY = sprRect.top + 61;
      var diff = secRect.top - currentFeetY;
      if (Math.abs(diff) > 0.5 && Math.abs(diff) < 20) {
        claudeBody.style.top = (currentBodyTop + diff) + 'px';
      }
    }

    window.addEventListener('resize', calibrateFeet);
    setTimeout(calibrateFeet, 300);

    var claudeBubble = el.querySelector('.claude-bubble');

    function triggerDoubleClickAction(pointerX) {
      var now = Date.now();
      if (now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 2800;

      // 1. Show only Claude's Anthropic speech bubble
      showOnlyMascotBubble(claudeBubble, 2800);

      // 2. Orient body and trigger alert/surprised reaction
      if (typeof pointerX === 'number') {
        var rect = el.getBoundingClientRect();
        var mascotCenter = rect.left + rect.width / 2;
        if (pointerX < mascotCenter) {
          claudeBody.classList.remove('facing-right');
          claudeBody.classList.add('facing-left');
        } else {
          claudeBody.classList.remove('facing-left');
          claudeBody.classList.add('facing-right');
        }
      }

      setState('surprised');

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
        setState('idle');
      }, 2800);
    }

    // Double-click triggers Claude speech bubble & reaction
    el.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      e.preventDefault();
      triggerDoubleClickAction(e.clientX);
    });

    // Single-click is strictly suppressed to avoid single-click triggers
    el.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Double-tap support for mobile/touch screens (two taps within 350ms)
    var lastTapTime = 0;
    el.addEventListener('touchend', function (e) {
      var now = Date.now();
      var tapGap = now - lastTapTime;
      if (tapGap > 30 && tapGap < 350) {
        e.preventDefault();
        var touch = e.changedTouches && e.changedTouches[0];
        triggerDoubleClickAction(touch ? touch.clientX : null);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    }, { passive: false });

    // Keyboard accessibility: double-press Enter or Space triggers reaction
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

    // Hover subtly faces pointer without popping speech bubble
    el.addEventListener('pointerenter', function (e) {
      if (!isActing && typeof e.clientX === 'number') {
        var rect = el.getBoundingClientRect();
        var mascotCenter = rect.left + rect.width / 2;
        if (e.clientX < mascotCenter) {
          claudeBody.classList.remove('facing-right');
          claudeBody.classList.add('facing-left');
        } else {
          claudeBody.classList.remove('facing-left');
          claudeBody.classList.add('facing-right');
        }
      }
    });

    if (prefersReduced) return;

    var mode = 'IDLE'; // 'IDLE', 'TURNING', 'WALKING'
    var currentX = 64;
    var targetX = 64;
    var direction = 1;
    var walkStepTick = 0;
    var walkFrames = ['walk-1', 'walk-2', 'walk-3', 'walk-4'];
    var frameIdx = 0;
    var idleTimer = null;
    var turnTimer = null;

    el.style.left = currentX + 'px';

    function getBounds() {
      var parent = el.offsetParent || document.getElementById('experience') || document.body;
      var parentW = parent.offsetWidth || window.innerWidth;
      var minX = 40;
      var maxX = Math.max(minX + 80, Math.min(320, Math.round(parentW * 0.35)));
      return { minX: minX, maxX: maxX };
    }

    function planNextWalk() {
      if (isActing || document.hidden || el.classList.contains('mascot-offscreen')) {
        idleTimer = setTimeout(planNextWalk, 2000);
        return;
      }

      var bounds = getBounds();
      var candidate;
      for (var iter = 0; iter < 6; iter++) {
        candidate = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        if (Math.abs(candidate - currentX) >= 50) break;
      }

      targetX = Math.round(candidate);
      var newDirection = targetX > currentX ? 1 : -1;

      if (newDirection !== direction) {
        mode = 'TURNING';
        setState('idle');
        turnTimer = setTimeout(function () {
          direction = newDirection;
          if (direction > 0) {
            claudeBody.classList.remove('facing-left');
            claudeBody.classList.add('facing-right');
          } else {
            claudeBody.classList.remove('facing-right');
            claudeBody.classList.add('facing-left');
          }
          mode = 'WALKING';
          walkStepTick = 0;
          frameIdx = 0;
          setState(walkFrames[0]);
        }, 300);
      } else {
        mode = 'WALKING';
        walkStepTick = 0;
        frameIdx = 0;
        setState(walkFrames[0]);
      }
    }

    function scheduleIdleReaction() {
      if (mode !== 'IDLE' || isActing) return;
      var r = Math.random();
      if (r < 0.5) {
        setState('alert');
        setTimeout(function () {
          if (mode === 'IDLE' && !isActing) setState('idle');
        }, 1100);
      } else {
        setState('surprised');
        setTimeout(function () {
          if (mode === 'IDLE' && !isActing) setState('idle');
        }, 900);
      }
    }

    var lastRafTime = performance.now();
    function walkLoop(now) {
      requestAnimationFrame(walkLoop);

      if (el.classList.contains('mascot-offscreen') || isActing || document.hidden) {
        lastRafTime = now;
        return;
      }

      var dt = Math.min(34, now - lastRafTime);
      lastRafTime = now;

      if (mode === 'WALKING') {
        var dist = Math.abs(targetX - currentX);
        var stepDist = 0.030 * dt;

        if (dist <= stepDist) {
          currentX = targetX;
          el.style.left = Math.round(currentX) + 'px';
          mode = 'IDLE';
          setState('idle');

          var idleDuration = 1200 + Math.floor(Math.random() * 1800);
          if (Math.random() < 0.6) {
            setTimeout(scheduleIdleReaction, Math.round(idleDuration * 0.35));
          }
          idleTimer = setTimeout(planNextWalk, idleDuration);
        } else {
          currentX += direction * stepDist;
          el.style.left = Math.round(currentX) + 'px';

          walkStepTick += dt;
          if (walkStepTick >= 180) {
            walkStepTick = 0;
            frameIdx = (frameIdx + 1) % walkFrames.length;
            setState(walkFrames[frameIdx]);
          }
        }
      }
    }

    requestAnimationFrame(walkLoop);
    idleTimer = setTimeout(planNextWalk, 2500);
  })();

  // 3. Gemini Cosmic Companion Controller
  (function initGemini() {
    var el = document.getElementById('mascot-gemini');
    if (!el) return;

    var isActing = false;
    var cooldownUntil = 0;
    var actionTimer = null;
    var gestureTimer = null;
    var blinkTimer = null;
    var currentState = 'idle';

    function setState(st) {
      if (currentState === st) return;
      currentState = st;
      el.setAttribute('data-state', st);
    }

    var geminiBubble = el.querySelector('.gemini-bubble');

    function triggerDoubleClickAction() {
      var now = Date.now();
      if (now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 2800;

      // 1. Show only Gemini's Google Gemini speech bubble
      showOnlyMascotBubble(geminiBubble, 2800);

      // 2. Trigger celebration constellation sparkles & joyful eyes
      setState('celebrate');

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
        setState('idle');
      }, 2800);
    }

    // Double-click triggers Gemini speech bubble & celebration
    el.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      e.preventDefault();
      triggerDoubleClickAction();
    });

    // Single-click is strictly suppressed to avoid single-click triggers
    el.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Double-tap support for mobile/touch screens (two taps within 350ms)
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

    // Keyboard accessibility: double-press Enter or Space triggers reaction
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

    // Hover subtly blinks without popping speech bubble
    el.addEventListener('pointerenter', function () {
      if (!isActing && currentState === 'idle') {
        setState('blink');
        setTimeout(function () {
          if (!isActing && currentState === 'blink') setState('idle');
        }, 180);
      }
    });

    if (prefersReduced) return;

    // Autonomous behavior:
    // A. 2-frame idle/blink swap every 3-6s for 120ms
    function runBlink() {
      if (!isActing && !document.hidden && !el.classList.contains('mascot-offscreen')) {
        setState('blink');
        setTimeout(function () {
          if (!isActing && currentState === 'blink') setState('idle');
        }, 120);
      }
      var delay = 3200 + Math.floor(Math.random() * 2800);
      blinkTimer = setTimeout(runBlink, delay);
    }

    // B. Welcome gesture every 8-12s: sequential swap to arm-up frames
    function runGesture() {
      if (!isActing && !document.hidden && !el.classList.contains('mascot-offscreen')) {
        var gestureFrames = ['star-rise', 'star-high', 'celebrate', 'star-low', 'idle'];
        var gIdx = 0;
        function stepGesture() {
          if (isActing) return;
          if (gIdx < gestureFrames.length) {
            setState(gestureFrames[gIdx]);
            gIdx++;
            setTimeout(stepGesture, 380);
          }
        }
        stepGesture();
      }
      var delay = 8000 + Math.floor(Math.random() * 4000);
      gestureTimer = setTimeout(runGesture, delay);
    }

    blinkTimer = setTimeout(runBlink, 3000);
    gestureTimer = setTimeout(runGesture, 7000);
  })();

  // 4. Terminal Robot Mascot Controller (Hackathons Divider Line Walker)
  (function initTerminalRobot() {
    var el = document.getElementById('mascot-terminal-robot');
    if (!el) return;

    var bodyEl = el.querySelector('.terminal-robot-body');
    var spriteEl = el.querySelector('.terminal-robot-sprite');
    var fxEl = el.querySelector('.terminal-robot-fx');
    var bubbleEl = document.getElementById('terminal-robot-bubble');
    var hackSection = document.getElementById('hackathons');
    if (!bodyEl || !spriteEl || !fxEl) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sprite frames coordinates in assets/terminal-mascot-sheet.png (750x504)
    var FRAMES = {
      'idle-1': [0, 0], 'idle-2': [-75, 0], 'idle-3': [-150, 0], 'idle-4': [-225, 0], 'idle-5': [-300, 0],
      'walk-1': [-375, 0], 'walk-2': [-450, 0], 'walk-3': [-525, 0], 'walk-4': [-600, 0], 'walk-5': [-675, 0], 'walk-6': [0, -84],
      'turn-1': [-75, -84], 'turn-2': [-150, -84], 'turn-3': [-225, -84], 'turn-4': [-300, -84], 'turn-5': [-375, -84],
      'type-1': [-450, -84], 'type-2': [-525, -84], 'type-3': [-600, -84], 'type-4': [-675, -84],
      'celebrate-1': [0, -168], 'celebrate-2': [-75, -168], 'celebrate-3': [-150, -168],
      'curious-1': [-225, -168], 'curious-2': [-300, -168], 'curious-3': [-375, -168], 'curious-4': [-450, -168],
      'curious-5': [-525, -168], 'curious-6': [-600, -168], 'curious-7': [-675, -168],
      'idle-var-1': [0, -252], 'idle-var-2': [-75, -252], 'idle-var-3': [-150, -252], 'idle-var-4': [-225, -252], 'idle-var-5': [-300, -252],
      'run-1': [-375, -252], 'run-2': [-450, -252], 'run-3': [-525, -252], 'run-4': [-600, -252],
      'sleep-1': [-675, -252], 'sleep-2': [0, -336], 'sleep-3': [-75, -336],
      'face-1': [-150, -336], 'face-2': [-225, -336], 'face-3': [-300, -336], 'face-4': [-375, -336],
      'face-5': [-450, -336], 'face-6': [-525, -336], 'face-7': [-600, -336], 'face-8': [-675, -336], 'face-9': [0, -420],
      'fx-question': [-75, -420], 'fx-exclaim': [-150, -420], 'fx-zzz': [-225, -420],
      'fx-dust-1': [-300, -420], 'fx-dust-2': [-375, -420], 'fx-dust-3': [-450, -420], 'fx-dust-4': [-525, -420]
    };

    function setFrame(frameName, fxName) {
      var coords = FRAMES[frameName] || FRAMES['idle-1'];
      spriteEl.style.backgroundPosition = coords[0] + 'px ' + coords[1] + 'px';
      if (fxName && FRAMES[fxName]) {
        var fxCoords = FRAMES[fxName];
        fxEl.style.display = 'block';
        fxEl.style.backgroundPosition = fxCoords[0] + 'px ' + fxCoords[1] + 'px';
      } else {
        fxEl.style.display = 'none';
      }
    }

    var currentState = 'pause';
    function setState(st) {
      if (currentState === st) return;
      currentState = st;
      el.setAttribute('data-state', st);
    }

    // Dynamic divider line calibration: feet baseline touches divider line within +/- 1px
    function calibrateFeet() {
      if (!hackSection) return;
      var secRect = hackSection.getBoundingClientRect();
      var sprRect = spriteEl.getBoundingClientRect();
      var currentBodyTop = parseFloat(getComputedStyle(bodyEl).top) || 0;
      // In the 75x84 frame, the sole rests at y = 83px (baseline at y = 82px)
      var currentFeetY = sprRect.top + 83;
      var diff = secRect.top - currentFeetY;
      if (Math.abs(diff) > 0.5 && Math.abs(diff) < 25) {
        bodyEl.style.top = (currentBodyTop + diff) + 'px';
      }
    }

    window.addEventListener('resize', calibrateFeet);
    setTimeout(calibrateFeet, 250);
    setTimeout(calibrateFeet, 800);

    // Speech bubble controller
    var bubbleTimer = null;
    function showBubble(text, duration) {
      if (!bubbleEl) return;
      if (text) {
        var textEl = bubbleEl.querySelector('.bubble-text');
        if (textEl) textEl.textContent = text;
      }
      bubbleEl.classList.add('is-visible');
      if (bubbleTimer) clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(function () {
        bubbleEl.classList.remove('is-visible');
      }, duration || 2000);
    }

    var isActing = false;
    var isSleeping = false;
    var lastInteractionTime = Date.now();
    var lastTapTime = 0;
    var sleepTimer = null;
    var sleepLoopTimer = null;
    var stateTimer = null;
    var idleTimer = null;

    function resetSleepTimer() {
      lastInteractionTime = Date.now();
      if (sleepTimer) clearTimeout(sleepTimer);
      if (isSleeping) {
        wakeUp();
      }
      sleepTimer = setTimeout(checkGoToSleep, 45000);
    }

    function checkGoToSleep() {
      if (isActing || document.hidden || el.classList.contains('mascot-offscreen')) {
        sleepTimer = setTimeout(checkGoToSleep, 10000);
        return;
      }
      var idleElapsed = Date.now() - lastInteractionTime;
      if (idleElapsed >= 44000) {
        goToSleep();
      } else {
        sleepTimer = setTimeout(checkGoToSleep, 45000 - idleElapsed);
      }
    }

    function goToSleep() {
      if (isActing || isSleeping) return;
      isSleeping = true;
      setState('sleep');
      setFrame('sleep-1');
      stateTimer = setTimeout(function () {
        if (!isSleeping) return;
        setFrame('sleep-2');
        stateTimer = setTimeout(function () {
          if (!isSleeping) return;
          setFrame('sleep-3', 'fx-zzz');
          startSleepLoop();
        }, 320);
      }, 300);
    }

    function startSleepLoop() {
      if (!isSleeping) return;
      var flip = false;
      function loopZz() {
        if (!isSleeping) return;
        flip = !flip;
        setFrame(flip ? 'sleep-3' : 'sleep-2', 'fx-zzz');
        sleepLoopTimer = setTimeout(loopZz, 900);
      }
      sleepLoopTimer = setTimeout(loopZz, 900);
    }

    function wakeUp() {
      if (!isSleeping) return;
      isSleeping = false;
      if (sleepLoopTimer) clearTimeout(sleepLoopTimer);
      if (stateTimer) clearTimeout(stateTimer);
      setFrame('sleep-1');
      setState('pause');
      stateTimer = setTimeout(function () {
        setFrame('idle-1');
        if (prefersReduced) return;
        idleTimer = setTimeout(planNextWalk, 1200);
      }, 280);
    }

    // Wake listeners on window
    ['pointermove', 'scroll', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, resetSleepTimer, { passive: true });
    });
    sleepTimer = setTimeout(checkGoToSleep, 45000);

    // Interaction triggers: Curious on Hover/Tap, Celebrate on Double-tap
    function triggerCurious(pointerX) {
      resetSleepTimer();
      if (isActing) return;
      isActing = true;
      setState('react');

      if (typeof pointerX === 'number') {
        var rect = el.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        if (pointerX < centerX) {
          bodyEl.classList.remove('facing-right');
          bodyEl.classList.add('facing-left');
        } else {
          bodyEl.classList.remove('facing-left');
          bodyEl.classList.add('facing-right');
        }
      }

      showBubble('hello_world', 2000);

      var curiousFrames = ['curious-1', 'curious-2', 'curious-3', 'curious-4', 'curious-5', 'curious-6', 'curious-7'];
      var cIdx = 0;
      function stepCurious() {
        if (!isActing) return;
        if (cIdx < curiousFrames.length) {
          setFrame(curiousFrames[cIdx], 'fx-question');
          cIdx++;
          stateTimer = setTimeout(stepCurious, 160);
        } else {
          // Finish reaction
          setFrame('idle-1');
          isActing = false;
          setState('pause');
          if (!prefersReduced) {
            idleTimer = setTimeout(planNextWalk, 1200);
          }
        }
      }
      stepCurious();
    }

    function triggerCelebrate() {
      resetSleepTimer();
      if (isActing) return;
      isActing = true;
      setState('react');
      showBubble('hello_world', 2200);

      var celFrames = ['celebrate-1', 'celebrate-2', 'celebrate-3', 'celebrate-2', 'celebrate-1', 'celebrate-2', 'celebrate-3'];
      var celIdx = 0;
      function stepCelebrate() {
        if (!isActing) return;
        if (celIdx < celFrames.length) {
          setFrame(celFrames[celIdx], 'fx-exclaim');
          celIdx++;
          stateTimer = setTimeout(stepCelebrate, 180);
        } else {
          setFrame('idle-1');
          isActing = false;
          setState('pause');
          if (!prefersReduced) {
            idleTimer = setTimeout(planNextWalk, 1400);
          }
        }
      }
      stepCelebrate();
    }

    // Pointer & click handlers
    el.addEventListener('pointerenter', function (e) {
      if (isSleeping) {
        wakeUp();
      } else if (!isActing) {
        triggerCurious(e.clientX);
      }
    });

    el.addEventListener('click', function (e) {
      e.stopPropagation();
      var now = Date.now();
      if (now - lastTapTime < 2000 && lastTapTime > 0) {
        lastTapTime = 0;
        if (stateTimer) clearTimeout(stateTimer);
        isActing = false;
        triggerCelebrate();
      } else {
        lastTapTime = now;
        triggerCurious(e.clientX);
      }
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var now = Date.now();
        if (now - lastTapTime < 2000 && lastTapTime > 0) {
          lastTapTime = 0;
          if (stateTimer) clearTimeout(stateTimer);
          isActing = false;
          triggerCelebrate();
        } else {
          lastTapTime = now;
          triggerCurious();
        }
      }
    });

    // Touch support without blocking page scroll
    var touchStartX = 0, touchStartY = 0;
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
          var now = Date.now();
          if (now - lastTapTime < 2000 && lastTapTime > 0) {
            lastTapTime = 0;
            if (stateTimer) clearTimeout(stateTimer);
            isActing = false;
            triggerCelebrate();
          } else {
            lastTapTime = now;
            triggerCurious(touchStartX);
          }
        }
      }
    }, { passive: true });

    // Handle prefers-reduced-motion
    if (prefersReduced) {
      setState('pause');
      setFrame('idle-1');
      function slowBlink() {
        if (isActing || isSleeping || document.hidden) {
          setTimeout(slowBlink, 5000);
          return;
        }
        setFrame('idle-2');
        setTimeout(function () {
          setFrame('idle-3');
          setTimeout(function () {
            setFrame('idle-1');
            setTimeout(slowBlink, 6000 + Math.random() * 4000);
          }, 140);
        }, 120);
      }
      setTimeout(slowBlink, 3500);
      return;
    }

    // Walking & Navigation Controller
    // Bounds: walk horizontally inside the hackathons divider line section bounds
    function getBounds() {
      var parent = el.offsetParent || hackSection || document.body;
      var parentW = parent.offsetWidth || window.innerWidth;
      var minR = 24;
      var maxR = Math.max(minR + 90, Math.min(parentW - 120, Math.round(parentW * 0.45)));
      return { minR: minR, maxR: maxR };
    }

    var currentRight = parseFloat(getComputedStyle(el).right) || 48;
    var targetRight = currentRight;
    var walkDir = 1; // +1: moving left (right increases), -1: moving right (right decreases)
    var walkSpeed = 32; // px per second
    var walkFrames = ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6'];
    var walkIdx = 0;
    var walkStepTick = 0;
    var walkStartTime = 0;
    var totalWalkDist = 0;
    var isWalking = false;

    el.style.right = Math.round(currentRight) + 'px';

    function planNextWalk() {
      if (isActing || isSleeping || document.hidden || el.classList.contains('mascot-offscreen')) {
        idleTimer = setTimeout(planNextWalk, 2000);
        return;
      }

      var bounds = getBounds();
      // Route: walk 80-250px (randomized +/- 20%)
      var desiredDist = (80 + Math.random() * 170) * (0.8 + Math.random() * 0.4);
      var candidate;
      for (var iter = 0; iter < 8; iter++) {
        var sign = Math.random() < 0.5 ? 1 : -1;
        candidate = currentRight + sign * desiredDist;
        if (candidate >= bounds.minR && candidate <= bounds.maxR && Math.abs(candidate - currentRight) >= 60) {
          break;
        }
      }

      if (!candidate || candidate < bounds.minR || candidate > bounds.maxR) {
        candidate = bounds.minR + Math.random() * (bounds.maxR - bounds.minR);
      }

      targetRight = Math.round(Math.max(bounds.minR, Math.min(bounds.maxR, candidate)));
      var newWalkDir = targetRight > currentRight ? 1 : -1;
      // In our sheet: sprite naturally faces right.
      // Moving right means right is decreasing (newWalkDir < 0) -> facing-right.
      // Moving left means right is increasing (newWalkDir > 0) -> facing-left.
      var desiredFacing = newWalkDir > 0 ? 'left' : 'right';
      var currentFacing = bodyEl.classList.contains('facing-left') ? 'left' : 'right';

      if (desiredFacing !== currentFacing) {
        // Turning state: stop on idle frame for ~300ms, play three-quarter frames in sequence, then mirror
        setState('turn');
        setFrame('idle-1');
        var turnDuration = 300 * (0.8 + Math.random() * 0.4);
        stateTimer = setTimeout(function () {
          if (isActing || isSleeping) return;
          var turnFrames = ['turn-1', 'turn-2', 'turn-3', 'turn-4', 'turn-5'];
          var tIdx = 0;
          function stepTurn() {
            if (isActing || isSleeping) return;
            if (tIdx < turnFrames.length) {
              setFrame(turnFrames[tIdx]);
              tIdx++;
              stateTimer = setTimeout(stepTurn, 75);
            } else {
              // Flip facing direction
              if (desiredFacing === 'left') {
                bodyEl.classList.remove('facing-right');
                bodyEl.classList.add('facing-left');
              } else {
                bodyEl.classList.remove('facing-left');
                bodyEl.classList.add('facing-right');
              }
              setFrame('idle-1');
              stateTimer = setTimeout(function () {
                startWalking(newWalkDir);
              }, 150);
            }
          }
          stepTurn();
        }, turnDuration);
      } else {
        startWalking(newWalkDir);
      }
    }

    function startWalking(dir) {
      if (isActing || isSleeping) return;
      walkDir = dir;
      // Speed 25-40 px/s with +/- 20% random variation
      walkSpeed = 26 + Math.random() * 10;
      totalWalkDist = Math.abs(targetRight - currentRight);
      walkStartTime = performance.now();
      walkIdx = 0;
      walkStepTick = 0;
      isWalking = true;
      setState('walk');
      setFrame(walkFrames[0]);
    }

    function onWalkFinished() {
      isWalking = false;
      currentRight = targetRight;
      el.style.right = Math.round(currentRight) + 'px';
      setState('pause');
      setFrame('idle-1');

      // Random pause duration: 1-3s (+/- 20%)
      var pauseDuration = (1000 + Math.random() * 2000) * (0.8 + Math.random() * 0.4);

      // Pause behaviours: 1 in 5 (20%) typing sequence, else blink or look around
      var pauseChoice = Math.random();
      if (pauseChoice < 0.20) {
        // Typing on laptop sequence in order (>_, npm i, building..., done), then stand up
        stateTimer = setTimeout(function () {
          if (isActing || isSleeping || currentState !== 'pause') return;
          var typeSteps = [
            { frame: 'type-1', time: 650 },
            { frame: 'type-2', time: 650 },
            { frame: 'type-3', time: 700 },
            { frame: 'type-4', time: 800 }
          ];
          var tpIdx = 0;
          function stepType() {
            if (isActing || isSleeping || currentState !== 'pause') return;
            if (tpIdx < typeSteps.length) {
              setFrame(typeSteps[tpIdx].frame);
              var wait = typeSteps[tpIdx].time;
              tpIdx++;
              stateTimer = setTimeout(stepType, wait);
            } else {
              setFrame('idle-1');
              idleTimer = setTimeout(planNextWalk, 400);
            }
          }
          stepType();
        }, 300);
      } else if (pauseChoice < 0.60) {
        // Idle blink
        stateTimer = setTimeout(function () {
          if (isActing || isSleeping || currentState !== 'pause') return;
          setFrame('idle-2');
          stateTimer = setTimeout(function () {
            setFrame('idle-3');
            stateTimer = setTimeout(function () {
              setFrame('idle-4');
              stateTimer = setTimeout(function () {
                setFrame('idle-1');
              }, 120);
            }, 120);
          }, 100);
        }, Math.round(pauseDuration * 0.35));
        idleTimer = setTimeout(planNextWalk, pauseDuration);
      } else {
        // Look around using idle variants
        stateTimer = setTimeout(function () {
          if (isActing || isSleeping || currentState !== 'pause') return;
          setFrame('idle-var-1');
          stateTimer = setTimeout(function () {
            setFrame('idle-var-2');
            stateTimer = setTimeout(function () {
              setFrame('idle-var-3');
              stateTimer = setTimeout(function () {
                setFrame('idle-1');
              }, 400);
            }, 400);
          }, 350);
        }, Math.round(pauseDuration * 0.3));
        idleTimer = setTimeout(planNextWalk, pauseDuration);
      }
    }

    // Main requestAnimationFrame walk loop with acceleration and deceleration
    var lastRafTime = performance.now();
    function robotLoop(now) {
      requestAnimationFrame(robotLoop);

      if (document.hidden || el.classList.contains('mascot-offscreen') || isActing || isSleeping) {
        lastRafTime = now;
        return;
      }

      var dtMs = Math.min(40, now - lastRafTime);
      lastRafTime = now;

      if (isWalking && currentState === 'walk') {
        var remainDist = Math.abs(targetRight - currentRight);
        var elapsedMs = now - walkStartTime;

        // Acceleration over ~300ms, deceleration over ~300ms before stopping
        var accelFactor = Math.min(1, elapsedMs / 300);
        var decelDist = walkSpeed * 0.35; // distance needed for deceleration
        var decelFactor = remainDist < decelDist ? Math.max(0.25, remainDist / decelDist) : 1;
        var currentSpeed = walkSpeed * accelFactor * decelFactor;

        var stepDist = (currentSpeed * dtMs) / 1000;

        if (remainDist <= Math.max(1, stepDist)) {
          onWalkFinished();
        } else {
          currentRight += walkDir * stepDist;
          el.style.right = Math.round(currentRight) + 'px';

          walkStepTick += dtMs;
          if (walkStepTick >= 130) {
            walkStepTick = 0;
            walkIdx = (walkIdx + 1) % walkFrames.length;
            setFrame(walkFrames[walkIdx]);
          }
        }
      }
    }

    requestAnimationFrame(robotLoop);
    idleTimer = setTimeout(planNextWalk, 2800);
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

    ['mascot-chatgpt', 'mascot-claude', 'mascot-gemini', 'mascot-terminal-robot'].forEach(function (id) {
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

  var FRAME_W = 44;
  var FRAME_H = 44;
  var tuxWidth = 44;
  var tuxHeight = 44;
  var feetOffset = 40; // baseline of feet is 40px from top of 44px box

  // Sprite atlas rows (4 frames per row, 88x88px native cells scaled to 44x44px):
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
    var minX = spanRect.right - formRect.left + 16;
    var maxX = Math.max(minX + 35, formRect.width - tuxWidth - 14);

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
    var m = getFieldMetrics(currentField);
    posY = m.lineY - feetOffset;
    posX = Math.min(Math.max(posX, m.minX), m.maxX);
    renderTux(facing === -1 ? -1.0 : 1.0, 1.0, 0, 0);
  }

  function init() {
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
      supportsScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll(root)');
    } catch (e) {}

    if (!supportsScrollTimeline && satellite && !prefersReduced) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY < 900) {
              satellite.style.transform = 'translate3d(0, ' + (scrollY * 0.18) + 'px, 0)';
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
     mascots, footer scenery, and the roaming rocket companion)
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
      { id: 5, sectionId: 'about', relX: 0.945, relY: 0.14, tier: 3, sprite: 1, size: 30, orbitRx: 30, orbitRy: 20, orbitSpeed: 0.00052, wobbleSpeed: 0.00095, wobbleAmp: 6, rotSpeed: 0.052, phase: 0.9, inclination: -30 },
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

      // Footer Outpost Cosmic Background (3 asteroids: 1 distant, 1 mid, 1 distant cluster)
      { id: 30, sectionId: 'footer', relX: 0.09, relY: 0.18, tier: 3, sprite: 1, size: 28, orbitRx: 29, orbitRy: 19, orbitSpeed: 0.00049, wobbleSpeed: 0.00095, wobbleAmp: 6, rotSpeed: -0.050, phase: 4.3, inclination: -30 },
      { id: 31, sectionId: 'footer', relX: 0.89, relY: 0.16, tier: 1, sprite: 3, size: 8, orbitRx: 8, orbitRy: 6, orbitSpeed: 0.00016, wobbleSpeed: 0.00038, wobbleAmp: 1.8, rotSpeed: 0.012, phase: 1.2, inclination: 20 },
      { id: 32, sectionId: 'footer', relX: 0.70, relY: 0.22, tier: 2, sprite: 2, size: 16, orbitRx: 16, orbitRy: 11, orbitSpeed: 0.00033, wobbleSpeed: 0.00065, wobbleAmp: 3.8, rotSpeed: 0.025, phase: 3.5, inclination: -15 }
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
      '.mascot-chatgpt',
      '.mascot-claude',
      '.mascot-gemini',
      '.mascot-terminal-robot',
      '.footer-robot-patrol'
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

        var targetX = docWidth * ast.cfg.relX - (ast.width / 2);
        targetX = Math.max(10, Math.min(docWidth - ast.width - 10, targetX));
        var targetY = secTop + (secH * ast.cfg.relY) - (ast.height / 2);

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

      var rocket = window.__roamingRocketPos;
      var rocketDocX = rocket ? scrollX + rocket.x : -9999;
      var rocketDocY = rocket ? scrollY + rocket.y : -9999;
      var rocketRadius = rocket ? rocket.radius : 40;

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
        var safePadding = 35 + astRadius;

        for (var b = 0; b < protectedBoxes.length; b++) {
          var box = protectedBoxes[b];
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

        // 3. Dynamic Avoidance of Roaming Rocket Companion
        if (rocket) {
          var rdx = ast.x - rocketDocX;
          var rdy = ast.y - rocketDocY;
          var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          var rocketSafeDist = rocketRadius + astRadius + 28;
          if (rdist < rocketSafeDist) {
            var rForce = ((rocketSafeDist - rdist) / rocketSafeDist) * (0.95 / ast.mass);
            var dirX = rdist > 0.01 ? (rdx / rdist) : 1;
            var dirY = rdist > 0.01 ? (rdy / rdist) : 0;
            ax += dirX * rForce;
            ay += dirY * rForce;
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
   - Collision avoidance against section header and dynamic rocket companion
   - Fully scoped within Projects section; reduced motion compliance
   ═══════════════════════════════════════════════════════════════════════════ */
(function initDistantRingedPlanet() {
  function start() {
    var planet = document.getElementById('projects-pixel-planet');
    var driftWrap = document.getElementById('projects-planet-drift-wrap');
    var projectsSec = document.getElementById('projects');
    if (!planet || !driftWrap || !projectsSec) return;

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

      // 2. Dynamic avoidance of roaming rocket companion
      var rocket = window.__roamingRocketPos;
      if (rocket) {
        var planetRect = planet.getBoundingClientRect();
        var planetCX = planetRect.left + planetRect.width / 2;
        var planetCY = planetRect.top + planetRect.height / 2;
        var rdx = planetCX - rocket.x;
        var rdy = planetCY - rocket.y;
        var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        var safeDist = (planetRect.width / 2) + rocket.radius + 30;
        if (rdist < safeDist) {
          var rForce = ((safeDist - rdist) / safeDist) * (0.8 / state.mass);
          var dirX = rdist > 0.01 ? (rdx / rdist) : 1;
          var dirY = rdist > 0.01 ? (rdy / rdist) : 0;
          ax += dirX * rForce;
          ay += dirY * rForce;
        }
      }

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
      var secRect = projectsSec.getBoundingClientRect();
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
