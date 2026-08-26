import React, { useEffect, useRef } from 'react';

interface SkyFireworksProps {
  winnerSide?: 'left' | 'right' | 'center';
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  trail: { x: number; y: number }[];
  flicker: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  trail: { x: number; y: number }[];
  exploded: boolean;
}

// Full Spectrum Bright Night Sky Fireworks Palette
const BRIGHT_FIREWORK_COLORS = [
  '#29d9e6d2', // Electric Cyan
  '#e0177bff', // Neon Magenta / Hot Pink
  '#ffd700', // Radiant Gold
  '#1ee128ff', // Bright Emerald / Mint
  '#7800e9ff', // Electric Purple
  '#ff6a00ff', // Saffron Fire / Bright Orange
  '#0673d2ff', // Neon Sky Blue
  '#c80828ff', // Bright Coral / Ruby
  '#ccc366ff', // Electric Yellow
  '#7f05faff', // Bright Lavender
  '#ffffff'  // Diamond White Sparkle
];

export const SkyFireworks: React.FC<SkyFireworksProps> = ({
  winnerSide = 'right',
  durationMs = 5000
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    // Target directly above the winning team
    const getTargetX = () => {
      if (winnerSide === 'left') {
        return width * (0.16 + Math.random() * 0.18);
      }
      if (winnerSide === 'right') {
        return width * (0.66 + Math.random() * 0.18);
      }
      return width * (0.38 + Math.random() * 0.24);
    };

    // Create vibrant multi-color explosion
    const createExplosion = (x: number, y: number, primaryColor: string) => {
      const particleCount = 55 + Math.floor(Math.random() * 25);
      const secondaryColor = BRIGHT_FIREWORK_COLORS[Math.floor(Math.random() * BRIGHT_FIREWORK_COLORS.length)];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 3.6;
        const pColor = Math.random() > 0.4 ? primaryColor : (Math.random() > 0.5 ? secondaryColor : '#ffffff');

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: pColor,
          alpha: 1,
          decay: 0.011 + Math.random() * 0.015,
          size: 1.5 + Math.random() * 1.8,
          trail: [],
          flicker: Math.random() > 0.35
        });
      }
    };

    // Launch sky rocket in diverse bright colors
    const launchRocket = () => {
      const startX = getTargetX() + (Math.random() * 50 - 25);
      const targetY = height * (0.10 + Math.random() * 0.22);
      const color = BRIGHT_FIREWORK_COLORS[Math.floor(Math.random() * (BRIGHT_FIREWORK_COLORS.length - 1))];

      rockets.push({
        x: startX,
        y: height,
        targetY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(5.5 + Math.random() * 2.8),
        color: color || '#00f0ff',
        trail: [],
        exploded: false
      });
    };

    // Initial rapid volley of 3 rockets
    launchRocket();
    setTimeout(launchRocket, 140);
    setTimeout(launchRocket, 320);

    // Recurring sky launches
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime < durationMs) {
        launchRocket();
        if (Math.random() > 0.45) {
          setTimeout(launchRocket, 160);
        }
      } else {
        clearInterval(interval);
      }
    }, 420);

    // Ultra-smooth 60fps night-time shining animation loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Additive hardware blending for luminous night-time glow
      ctx.globalCompositeOperation = 'lighter';

      // 1. Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.06;

        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 6) r.trail.shift();

        // Draw shining luminous trail behind rising rocket
        ctx.beginPath();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Rising sparkling beads along tail
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff8db';
          ctx.fill();
        }

        // Rocket white-hot shining head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Check if rocket reached altitude or slowed down
        if (r.y <= r.targetY || r.vy >= -0.5) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // 2. Update & Draw Explosion Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.065;
        p.vx *= 0.982;
        p.vy *= 0.982;
        p.alpha -= p.decay;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const currentAlpha = Math.max(0, p.alpha * (p.flicker ? 0.7 + Math.random() * 0.3 : 1));

        // Draw Shining Spark Trail (golden ray)
        if (p.trail.length > 1) {
          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
        }

        // Draw Shining Incandescent Spark Head (White-hot core + Colorful radiant aura)
        ctx.save();
        ctx.globalAlpha = currentAlpha;

        // Outer radiant color halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Inner white-hot glowing core (makes it shine in the dark!)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Diamond 4-point sparkle glint for shining twinkling stars
        if (p.flicker && p.alpha > 0.45) {
          const glintSize = p.size * 2.2;
          ctx.beginPath();
          ctx.moveTo(p.x - glintSize, p.y);
          ctx.lineTo(p.x + glintSize, p.y);
          ctx.moveTo(p.x, p.y - glintSize);
          ctx.lineTo(p.x, p.y + glintSize);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, [winnerSide, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="sky-fireworks-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 25
      }}
    />
  );
};

