import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  wobble: number;
}

const PARTICLE_COUNT = 60;
const CYAN = 'rgba(0, 242, 255, 0.15)';
const GLOW = 'rgba(0, 242, 255, 0.2)';

const keyframesStyle = `
@keyframes particle-drift {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(var(--wobble)); opacity: 0; }
}
`;

export default function AmbientParticles() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 15,
        wobble: -30 + Math.random() * 60,
      })),
    [],
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <style>{keyframesStyle}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: CYAN,
            borderRadius: '50%',
            boxShadow: `0 0 4px ${GLOW}`,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            '--wobble': `${p.wobble}px`,
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
