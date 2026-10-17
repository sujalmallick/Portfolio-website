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

/* ── 10. RETRO PIXEL AI ROBOT PATROL (FOOTER SENTRY) ──────── */
(function () {
  var canvas = document.getElementById('footer-robot-canvas');
  if (!canvas) return;
  var container = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 280;
  var height = 50;
  var isRunning = false;
  var rafId = null;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load sprite sheet
  var robotImg = new Image();
  robotImg.src = 'assets/pixel-footer-robot.png';

  // Constants
  var FRAME_W = 36;
  var FRAME_H = 40;
  var SPEED = 0.65;
  var CODE_SYMBOLS = ['Python', 'JS', 'C++', 'Java', '</>', '{}', '01', '=>'];
  var WALK_FRAMES = [1, 2, 3, 2];

  // Robot State
  var x = 200;
  var facing = -1; // -1 = moving left, 1 = moving right
  var state = 'PATROL'; // 'PATROL', 'SCAN', 'FIRE'
  var stateTimer = 0;
  var walkStep = 0;
  var walkTimer = 0;
  var recoilOffset = 0;
  var scanGlint = 0;

  // Particle System
  var projectiles = [];
  var pixelDust = [];

  function resize() {
    if (!container) return;
    var rect = container.getBoundingClientRect();
    width = Math.round(rect.width) || 280;
    height = Math.round(rect.height) || 50;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // Keep robot in bounds
    if (x > width - FRAME_W - 8) {
      x = Math.max(8, width - FRAME_W - 8);
    }
  }

  function spawnBurst(isManual) {
    var count = isManual ? 2 : 1;
    for (var i = 0; i < count; i++) {
      var symbol = CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)];
      var spawnX = facing === 1 ? x + 35 : x + 1;
      var spawnY = height - FRAME_H - 2 + 15 + (i * 2 - 1);
      var pVx = facing * (1.8 + Math.random() * 0.7);
      var pVy = (Math.random() - 0.5) * 0.4;
      projectiles.push({
        text: symbol,
        x: spawnX,
        y: spawnY,
        vx: pVx,
        vy: pVy,
        life: 0,
        maxLife: 45 + Math.floor(Math.random() * 15),
        scattered: false,
        color: Math.random() > 0.3 ? '#22D3EE' : '#CFC6B5',
        alpha: 1
      });
    }
  }

  function update() {
    var minX = 8;
    var maxX = Math.max(minX + 20, width - FRAME_W - 8);

    if (state === 'PATROL') {
      recoilOffset = 0;
      x += facing * SPEED;
      walkTimer++;
      if (walkTimer >= 7) {
        walkTimer = 0;
        walkStep = (walkStep + 1) % WALK_FRAMES.length;
      }

      // Check boundary turn
      if (facing === -1 && x <= minX) {
        x = minX;
        state = 'SCAN';
        stateTimer = 55;
      } else if (facing === 1 && x >= maxX) {
        x = maxX;
        state = 'SCAN';
        stateTimer = 55;
      } else if (Math.random() < 0.0035) {
        // Occasional mid-patrol pause & scan
        state = 'SCAN';
        stateTimer = 45 + Math.floor(Math.random() * 30);
      }
    } else if (state === 'SCAN') {
      recoilOffset = 0;
      stateTimer--;
      scanGlint = Math.sin(stateTimer * 0.15);

      if (stateTimer <= 0) {
        // 60% chance to fire code burst, 40% chance to turn or patrol
        if (Math.random() < 0.6) {
          state = 'FIRE';
          stateTimer = 20;
          recoilOffset = facing === 1 ? -2.5 : 2.5;
          spawnBurst(false);
        } else {
          // Turn if at boundary
          if (x <= minX) facing = 1;
          else if (x >= maxX) facing = -1;
          state = 'PATROL';
        }
      }
    } else if (state === 'FIRE') {
      stateTimer--;
      // Dampen recoil
      if (stateTimer <= 10) {
        recoilOffset *= 0.7;
      }
      if (stateTimer <= 0) {
        recoilOffset = 0;
        if (x <= minX) facing = 1;
        else if (x >= maxX) facing = -1;
        state = 'PATROL';
      }
    }

    // Update projectiles
    var isMobile = window.innerWidth <= 600;
    for (var i = projectiles.length - 1; i >= 0; i--) {
      var p = projectiles[i];
      p.life++;

      if (!p.scattered) {
        p.x += p.vx;
        p.y += p.vy;

        // Disperse into pixels after 55% of life
        if (p.life >= p.maxLife * 0.55) {
          p.scattered = true;
          var dustCount = isMobile ? 5 : 8;
          for (var d = 0; d < dustCount; d++) {
            pixelDust.push({
              x: p.x + (Math.random() - 0.5) * 12,
              y: p.y + (Math.random() - 0.5) * 6,
              vx: p.vx * 0.35 + (Math.random() - 0.5) * 1.6,
              vy: (Math.random() - 0.5) * 1.4,
              size: Math.random() > 0.5 ? 2 : 1,
              color: Math.random() > 0.3 ? '#22D3EE' : '#CFC6B5',
              alpha: 1,
              decay: 0.04 + Math.random() * 0.02
            });
          }
        }
      } else {
        p.alpha -= 0.15;
      }

      if (p.life >= p.maxLife || p.alpha <= 0) {
        projectiles.splice(i, 1);
      }
    }

    // Update pixel dust
    for (var j = pixelDust.length - 1; j >= 0; j--) {
      var dust = pixelDust[j];
      dust.x += dust.vx;
      dust.y += dust.vy;
      dust.alpha -= dust.decay;
      if (dust.alpha <= 0) {
        pixelDust.splice(j, 1);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    var drawY = height - FRAME_H - 2;

    // Draw robot sprite
    if (robotImg.complete && robotImg.naturalWidth > 0) {
      var frame = 0;
      if (state === 'PATROL') {
        frame = WALK_FRAMES[walkStep];
      } else if (state === 'SCAN') {
        frame = 0;
      } else if (state === 'FIRE') {
        frame = 4;
      }

      var drawX = Math.round(x + recoilOffset);

      ctx.save();
      if (facing === 1) {
        ctx.drawImage(
          robotImg,
          frame * FRAME_W, 0, FRAME_W, FRAME_H,
          drawX, drawY, FRAME_W, FRAME_H
        );
      } else {
        // Mirrored for left-facing
        ctx.translate(drawX + Math.round(FRAME_W / 2), drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(
          robotImg,
          frame * FRAME_W, 0, FRAME_W, FRAME_H,
          -Math.round(FRAME_W / 2), 0, FRAME_W, FRAME_H
        );
      }
      ctx.restore();

      // Scan glint on visor during SCAN
      if (state === 'SCAN' && scanGlint > 0.3) {
        ctx.save();
        ctx.fillStyle = '#22D3EE';
        ctx.globalAlpha = 0.8;
        var eyeX = facing === 1 ? drawX + 20 : drawX + (FRAME_W - 20 - 2);
        var eyeY = drawY + 15;
        ctx.fillRect(eyeX, eyeY, 2, 2);
        ctx.restore();
      }
    }

    // Draw floating code projectiles
    for (var i = 0; i < projectiles.length; i++) {
      var p = projectiles[i];
      if (!p.scattered && p.alpha > 0.05) {
        ctx.save();
        ctx.font = 'bold 9px "Courier New", monospace';
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = '#22D3EE';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
        ctx.restore();
      }
    }

    // Draw scattered pixel dust
    for (var j = 0; j < pixelDust.length; j++) {
      var d = pixelDust[j];
      if (d.alpha > 0) {
        ctx.save();
        ctx.fillStyle = d.color;
        ctx.globalAlpha = Math.max(0, d.alpha);
        ctx.fillRect(Math.round(d.x), Math.round(d.y), d.size, d.size);
        ctx.restore();
      }
    }
  }

  function loop() {
    if (!isRunning) return;
    update();
    render();
    rafId = requestAnimationFrame(loop);
  }

  // Interactive Click Easter Egg
  if (container) {
    container.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      facing = clickX < x ? -1 : 1;
      state = 'FIRE';
      stateTimer = 24;
      recoilOffset = facing === 1 ? -3 : 3;
      spawnBurst(true);
    });
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      // Draw static guard pose fallback without animation loop
      robotImg.onload = function () {
        ctx.clearRect(0, 0, width, height);
        var drawX = Math.round(width - FRAME_W - 12);
        var drawY = height - FRAME_H - 2;
        ctx.drawImage(robotImg, 0, 0, FRAME_W, FRAME_H, drawX, drawY, FRAME_W, FRAME_H);
      };
      if (robotImg.complete) {
        robotImg.onload();
      }
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