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
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
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

    window.location.href =
      'mailto:sujalmallick123@gmail.com?subject=' + subject + '&body=' + body;
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



/* ── 8. PROJECT PREVIEWS ─────────────────────────────────── */
(function() {
  var preview = document.getElementById('project-preview');
  if (!preview) return;

  var triggers = document.querySelectorAll('[data-preview]');
  var mouse = { x: -1000, y: -1000 };
  
  document.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (preview.classList.contains('visible')) {
      // Offset slightly from cursor
      preview.style.left = (mouse.x + 20) + 'px';
      preview.style.top = (mouse.y + 20) + 'px';
    }
  });

  triggers.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      var id = this.getAttribute('data-preview');
      preview.setAttribute('data-active', id);
      preview.classList.add('visible');
      preview.style.left = (mouse.x + 20) + 'px';
      preview.style.top = (mouse.y + 20) + 'px';
    });
    
    el.addEventListener('mouseleave', function() {
      preview.classList.remove('visible');
    });
  });
})();