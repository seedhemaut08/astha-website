import { useEffect, useRef } from 'react';

/*
=========================================================
CONFETTI BURST
=========================================================
Fires a short canvas confetti burst whenever `trigger`
changes to a new truthy value (pass an incrementing id,
not a boolean, so it can re-fire on repeated clicks).
=========================================================
*/

export default function Confetti({ trigger }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#d4af37', '#f4e4b8', '#b8860b', '#fff5e0', '#e8c674', '#ffffff'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.4,
      size: 6 + Math.random() * 6,
      speedY: 2 + Math.random() * 3,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: -6 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    }));

    let frame;
    let elapsed = 0;
    let last = performance.now();
    const duration = 2600;

    function draw(now) {
      const dt = now - last;
      last = now;
      elapsed += dt;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      pieces.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (elapsed < duration) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  );
}