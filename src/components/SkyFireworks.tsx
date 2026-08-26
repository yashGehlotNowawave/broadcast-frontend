import React, { useEffect, useRef } from 'react';

interface SkyFireworksProps {
  winnerSide?: 'left' | 'right' | 'center';
  durationMs?: number;
}

// True Pyrotechnic Metal-Salt Color Spectrum (as used in Stadium Celebrations)
const PYRO_PALETTES = [
  {
    name: 'Brocade Crown (Gold Willow)',
    primary: '#ffd700',
    secondary: '#fff8db',
    core: '#ffffff',
    type: 'willow'
  },
  {
    name: 'Electric Blue & Ruby Ring',
    primary: '#001affff',
    secondary: '#ff1744',
    core: '#ffffff',
    type: 'chrysanthemum'
  },
  {
    name: 'Emerald & Gold Peony',
    primary: '#0cad24ff',
    secondary: '#ffd600',
    core: '#fff9c4',
    type: 'peony'
  },
  {
    name: 'Royal Purple & Saffron Palm',
    primary: '#f20606ff',
    secondary: '#ff6d00',
    core: '#ffffff',
    type: 'palm'
  },
  {
    name: 'Titanium Silver Sparkler & Cyan',
    primary: '#ffffff',
    secondary: '#1500ffff',
    core: '#ffd700',
    type: 'strobe'
  }
];

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  drag: number;
  trail: { x: number; y: number }[];
  maxTrail: number;
  flicker: boolean;
  strobeSpeed?: number;
  hasCrackle?: boolean;
}

interface MortarShell {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  paletteIndex: number;
  trail: { x: number; y: number }[];
  exploded: boolean;
}

export const SkyFireworks: React.FC<SkyFireworksProps> = ({
  winnerSide = 'right',
  durationMs = 6000
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

    const stars: Star[] = [];
    const mortars: MortarShell[] = [];

    // Stadium Mortar target location above winning team area
    const getTargetApex = () => {
      let x = width * 0.5;
      if (winnerSide === 'left') {
        x = width * (0.15 + Math.random() * 0.22);
      } else if (winnerSide === 'right') {
        x = width * (0.63 + Math.random() * 0.22);
      } else {
        x = width * (0.35 + Math.random() * 0.3);
      }
      const y = height * (0.10 + Math.random() * 0.24);
      return { x, y };
    };

    // Detonate Aerial Shell in Sky
    const detonateShell = (x: number, y: number, paletteIndex: number) => {
      const palette = PYRO_PALETTES[paletteIndex % PYRO_PALETTES.length];
      const isWillow = palette.type === 'willow';
      const isStrobe = palette.type === 'strobe';
      const starCount = isWillow ? 75 : (isStrobe ? 60 : 70);

      // 1. Central flash shockwave (Incandescent White Core)
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.0;
        stars.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: palette.core,
          alpha: 1,
          decay: 0.035, // short bright flash
          size: 2.2,
          gravity: 0.02,
          drag: 0.94,
          trail: [],
          maxTrail: 3,
          flicker: false
        });
      }

      // 2. Spherical Star Pellet Explosion
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + (Math.random() * 0.08 - 0.04);
        const baseSpeed = isWillow ? (2.2 + Math.random() * 3.4) : (2.8 + Math.random() * 3.6);
        const color = Math.random() > 0.4 ? palette.primary : (Math.random() > 0.5 ? palette.secondary : palette.core);

        stars.push({
          x,
          y,
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed,
          color,
          alpha: 1,
          decay: isWillow ? 0.009 : 0.013, // willow hangs longer in the sky
          size: isWillow ? 1.8 : 2.0,
          gravity: isWillow ? 0.065 : 0.05, // gravitational waterfall curve
          drag: isWillow ? 0.978 : 0.965, // atmospheric deceleration
          trail: [],
          maxTrail: isWillow ? 7 : 5,
          flicker: Math.random() > 0.35,
          strobeSpeed: isStrobe ? (0.2 + Math.random() * 0.3) : undefined,
          hasCrackle: Math.random() > 0.7
        });
      }
    };

    // Launch Mortar from Stadium Floor
    const launchMortar = () => {
      const target = getTargetApex();
      const paletteIndex = Math.floor(Math.random() * PYRO_PALETTES.length);
      const startX = target.x + (Math.random() * 40 - 20);

      const distY = height - target.y;
      const initialVy = -Math.sqrt(2 * 0.12 * distY); // physics flight to apex

      mortars.push({
        x: startX,
        y: height,
        targetY: target.y,
        vx: (target.x - startX) / (Math.abs(initialVy) / 0.12),
        vy: initialVy,
        paletteIndex,
        trail: [],
        exploded: false
      });
    };

    // Initial rapid stadium salvo (3 shells)
    launchMortar();
    setTimeout(launchMortar, 130);
    setTimeout(launchMortar, 290);

    // Continuous championship celebration show
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime < durationMs) {
        launchMortar();
        if (Math.random() > 0.4) {
          setTimeout(launchMortar, 150);
        }
      } else {
        clearInterval(interval);
      }
    }, 420);

    // 60FPS Stadium Rendering Loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Additive hardware blending for luminous night sky emission
      ctx.globalCompositeOperation = 'lighter';

      // 1. Draw Rising Mortar Shells
      for (let i = mortars.length - 1; i >= 0; i--) {
        const m = mortars[i];
        m.x += m.vx;
        m.y += m.vy;
        m.vy += 0.12; // ascent gravity deceleration

        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 6) m.trail.shift();

        // Glowing comet spark trail
        ctx.beginPath();
        for (let t = 0; t < m.trail.length; t++) {
          const pt = m.trail[t];
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = '#ffb703';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Shell incandescent head
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Apex Detonation
        if (m.y <= m.targetY || m.vy >= -0.8) {
          detonateShell(m.x, m.y, m.paletteIndex);
          mortars.splice(i, 1);
        }
      }

      // 2. Draw Detonated Star Pellets & Radiant Trails
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= s.drag;
        s.vy *= s.drag;
        s.vy += s.gravity; // natural gravity curve
        s.alpha -= s.decay;

        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > s.maxTrail) s.trail.shift();

        if (s.alpha <= 0) {
          stars.splice(i, 1);
          continue;
        }

        const flickerMultiplier = s.flicker ? (0.75 + Math.sin(Date.now() * 0.02) * 0.25) : 1;
        const currentAlpha = Math.max(0, s.alpha * flickerMultiplier);

        // Draw Streamer / Spark Trail
        if (s.trail.length > 1) {
          ctx.save();
          ctx.globalAlpha = currentAlpha * 0.85;
          ctx.beginPath();
          ctx.moveTo(s.trail[0].x, s.trail[0].y);
          for (let t = 1; t < s.trail.length; t++) {
            ctx.lineTo(s.trail[t].x, s.trail[t].y);
          }
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
        }

        // Draw Glowing Star Head (Incandescent Core + Vivid Outer Halo)
        ctx.save();
        ctx.globalAlpha = currentAlpha;

        // Outer radiant pyrotechnic color aura
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        // Inner white-hot magnesium/titanium core (night luminescence)
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Stadium Crackling Micro-Sparks
        if (s.hasCrackle && s.alpha < 0.6 && Math.random() > 0.5) {
          const crackleOffset = (Math.random() - 0.5) * 6;
          ctx.beginPath();
          ctx.arc(s.x + crackleOffset, s.y + crackleOffset, 1, 0, Math.PI * 2);
          ctx.fillStyle = '#fff8db';
          ctx.fill();
        }

        ctx.restore();
      }

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

