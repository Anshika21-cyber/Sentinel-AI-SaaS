import { memo } from 'react';

/**
 * ParticleField — a fixed, GPU-friendly canvas of soft floating glowing dots.
 * Purely decorative; pointer-events disabled. Respects reduced-motion.
 *
 * Uses a single rAF loop with depth-based parallax drift. Particle count and
 * size scale down on small viewports for performance.
 */
interface Particle {
  x: number;
  y: number;
  z: number; // depth 0..1 for parallax + size
  vx: number;
  vy: number;
  r: number;
  hue: number; // 0 = blue, 1 = cyan
}

function ParticleFieldImpl() {
  return (
    <canvas
      ref={(canvas) => {
        if (!canvas || canvas.dataset.init === '1') return;
        canvas.dataset.init = '1';
        run(canvas);
      }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
      aria-hidden
    />
  );
}

function run(canvas: HTMLCanvasElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let raf = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(28, Math.min(70, Math.floor((w * h) / 26000)));
    particles = Array.from({ length: count }, () => spawn());
  };

  const spawn = (): Particle => {
    const z = Math.random();
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z,
      vx: (Math.random() - 0.5) * 0.18 * (0.4 + z),
      vy: (-0.15 - Math.random() * 0.25) * (0.4 + z),
      r: 0.6 + z * 2.2,
      hue: Math.random() < 0.6 ? 0 : 1,
    };
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // wrap around edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      const alpha = 0.15 + p.z * 0.5;
      const color = p.hue === 0 ? '59,130,246' : '34,211,238';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.shadowBlur = 8 + p.z * 10;
      ctx.shadowColor = `rgba(${color},${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduce) {
    // render a single static frame
    draw();
    cancelAnimationFrame(raf);
  } else {
    raf = requestAnimationFrame(draw);
  }
}

export const ParticleField = memo(ParticleFieldImpl);
