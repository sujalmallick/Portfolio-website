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
  var canvas = document.getElementById('footer-terminator-canvas');
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
          var bw = bInfo.img.naturalWidth;
          var bh = bInfo.img.naturalHeight;
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
    var mode = 'ROAM'; // 'ROAM', 'APPROACH', 'LANDING', 'LANDED', 'TOUCH_REACTION'
    var roamCountdown = 280 + Math.floor(Math.random() * 200); // 4-8s roam before initiating descent
    var landingTarget = null;
    var legDeploy = 0; // 0 to 1
    var reactionTimer = 0;

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
        legDeploy = 1;

        // Occasional faint idle coolant whisper (every 180 frames)
        if (frameCount % 180 === 0) {
          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + ROCKET_H * 0.42,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.4,
            color: '#CFC6B5',
            size: 1,
            alpha: 0.5,
            decay: 0.03
          });
        }

      } else if (mode === 'TOUCH_REACTION') {
        if (landingTarget && landingTarget.el) {
          var r = landingTarget.el.getBoundingClientRect();
          landingTarget.y = Math.round(r.top);
        }
        angle = 0;
        vx = 0;
        vy = 0;
        legDeploy = 1;
        reactionTimer--;

        // Gentle parabolic hop (max 4.5px up)
        var bounceOffset = Math.sin((reactionTimer / 24) * Math.PI) * 4.5;
        var baseY = landingTarget ? landingTarget.y - legDropDist : y;
        y = baseY - bounceOffset;

        if (reactionTimer <= 0) {
          mode = 'LANDED';
          y = baseY;
          // Soft settle dust puff
          for (var s = 0; s < 3; s++) {
            particles.push({
              x: x + (Math.random() - 0.5) * 10,
              y: y + legDropDist,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -0.3,
              color: '#CFC6B5',
              size: 1,
              alpha: 0.7,
              decay: 0.04
            });
          }
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

      // Interactive Click: Fun speed burst when flying, or gentle bounce reaction when landed
      window.addEventListener('click', function (e) {
        var clickDist = Math.hypot(x - e.clientX, y - e.clientY);
        if (mode === 'LANDED' || mode === 'TOUCH_REACTION') {
          if (clickDist < 160) {
            mode = 'TOUCH_REACTION';
            reactionTimer = 24;
            // Small puff of exhaust
            for (var p = 0; p < 4; p++) {
              particles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + ROCKET_H * 0.44,
                vx: (Math.random() - 0.5) * 1.2,
                vy: 0.6 + Math.random() * 0.6,
                color: Math.random() > 0.5 ? '#22D3EE' : '#CFC6B5',
                size: Math.random() > 0.5 ? 2 : 1,
                alpha: 0.85,
                decay: 0.05
              });
            }
          }
        } else if (clickDist < 200) {
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

/* ── 10. AI PIXEL MASCOTS CONTROLLER ──────────────────────────────────── */
(function initMascots() {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // 1. ChatGPT Companion Controller
  (function initChatGPT() {
    var el = document.getElementById('mascot-chatgpt');
    if (!el) return;

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

    function triggerReaction() {
      var now = Date.now();
      if (isActing || now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 1200;

      setState('celebrate');

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
        setState('idle');
      }, 1200);
    }

    el.addEventListener('pointerenter', function () {
      if (!isActing) {
        setState('tilt');
        setTimeout(function () {
          if (!isActing && currentState === 'tilt') setState('idle');
        }, 800);
      }
    });

    el.addEventListener('click', function (e) {
      e.stopPropagation();
      triggerReaction();
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerReaction();
      }
    });

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
        if (dx < 10 && dy < 10) triggerReaction();
      }
    }, { passive: true });

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

    function triggerReaction(pointerX) {
      var now = Date.now();
      if (isActing || now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 1200;

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
      }, 1200);
    }

    el.addEventListener('pointerenter', function (e) {
      triggerReaction(e.clientX);
    });

    el.addEventListener('click', function (e) {
      e.stopPropagation();
      triggerReaction(e.clientX);
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerReaction();
      }
    });

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
        if (dx < 10 && dy < 10) triggerReaction(touchStartX);
      }
    }, { passive: true });

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

    function triggerReaction() {
      var now = Date.now();
      if (isActing || now < cooldownUntil) return;
      isActing = true;
      cooldownUntil = now + 1200;

      setState('celebrate');

      if (actionTimer) clearTimeout(actionTimer);
      actionTimer = setTimeout(function () {
        isActing = false;
        setState('idle');
      }, 1200);
    }

    el.addEventListener('pointerenter', function () {
      triggerReaction();
    });

    el.addEventListener('click', function (e) {
      e.stopPropagation();
      triggerReaction();
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerReaction();
      }
    });

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
        if (dx < 10 && dy < 10) triggerReaction();
      }
    }, { passive: true });

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
