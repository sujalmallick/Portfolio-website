/* ════════════════════════════════════════════════════════
   SWARM BACKGROUND — Boids simulation
   ════════════════════════════════════════════════════════ */

(function() {
  const canvas = document.getElementById('swarm-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  const particleCount = 45; // Reduced number of swarms
  let mouse = { x: -1000, y: -1000 };
  let isMobile = false;

  function resize() {
    // Determine if we should disable for performance (mobile/tablet)
    isMobile = window.innerWidth < 900;
    if (isMobile) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    
    // Canvas matches its container size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        baseVx: (Math.random() - 0.5) * 1.5,
        baseVy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 1.5 + 0.5
      });
    }
  }

  function getThemeColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  }

  function animate() {
    if (isMobile) {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const themeColor = getThemeColor();
    ctx.fillStyle = themeColor;

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      // Interaction radius
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const interactRadius = 120;
      
      if (dist < interactRadius) {
        // Smoothly steer away from mouse, creating a fluid pushing effect
        const force = (interactRadius - dist) / interactRadius;
        p.vx += (dx / dist) * force * 0.4;
        p.vy += (dy / dist) * force * 0.4;
        
        // Draw a connecting line to the mouse cursor itself
        ctx.beginPath();
        ctx.strokeStyle = themeColor.replace('0.2', (0.2 * force).toFixed(2));
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      } else {
        // Gradually return to base velocity
        p.vx += (p.baseVx - p.vx) * 0.05;
        p.vy += (p.baseVy - p.vy) * 0.05;
      }

      // Enforce speed limits so they don't fly away infinitely
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2.5) {
        p.vx = (p.vx / speed) * 2.5;
        p.vy = (p.vy / speed) * 2.5;
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges seamlessly
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Connect near particles to each other
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        const dx2 = p.x - p2.x;
        const dy2 = p.y - p2.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (dist2 < 70) {
          ctx.beginPath();
          ctx.strokeStyle = themeColor.replace('0.2', (0.2 * (1 - dist2/70)).toFixed(2));
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  
  // Track mouse relative to canvas
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  });
  
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Init
  resize();
  animate();
})();
