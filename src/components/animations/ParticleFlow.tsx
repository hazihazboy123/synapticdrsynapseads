import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

/**
 * ParticleFlow - Reusable particle system component
 *
 * Replace all manual particle code with this declarative component.
 *
 * Usage:
 * <ParticleFlow
 *   startFrame={100}
 *   count={30}
 *   from={{ x: 460, y: 400 }}
 *   to={{ x: 220, y: 650 }}
 *   color="#fbbf24"
 *   size={16}
 *   duration={50}
 *   particleComponent={(props) => <CustomParticle {...props} />}
 * />
 */

interface Point {
  x: number;
  y: number;
}

interface ParticleFlowProps {
  startFrame: number;
  count: number;
  from: Point;
  to: Point | Point[]; // Single target or multiple targets
  color?: string;
  gradient?: { id: string; colors: string[] };
  size?: number;
  duration?: number;
  stagger?: number;
  waviness?: number; // How much particles wave/deviate from path
  particleComponent?: (props: {
    x: number;
    y: number;
    opacity: number;
    scale: number;
    index: number;
  }) => React.ReactNode;
  filter?: string;
}

export const ParticleFlow: React.FC<ParticleFlowProps> = ({
  startFrame,
  count,
  from,
  to,
  color = '#fbbf24',
  gradient,
  size = 16,
  duration = 50,
  stagger = 1,
  waviness = 12,
  particleComponent,
  filter,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Don't render before start
  if (frame < startFrame) return null;

  const particles: Array<{
    x: number;
    y: number;
    opacity: number;
    scale: number;
    index: number;
  }> = [];

  // Handle multiple targets (for branching flows)
  const targets = Array.isArray(to) ? to : [to];

  const numParticles = Math.min(count, Math.floor((frame - startFrame) / stagger));

  for (let i = 0; i < numParticles; i++) {
    const particleFrame = frame - startFrame - i * stagger;
    const progress = Math.min(1, particleFrame / duration);

    if (progress > 0 && progress < 1) {
      // Select target based on particle index (for multi-target flows)
      const target = targets[i % targets.length];

      // Calculate position with wave effect
      const baseX = interpolate(progress, [0, 1], [from.x, target.x]);
      const baseY = interpolate(progress, [0, 1], [from.y, target.y]);

      const x = baseX + Math.sin(i * 1.5 + progress * Math.PI * 2) * waviness;
      const y = baseY + Math.cos(i * 2 + progress * Math.PI * 2) * (waviness * 0.6);

      const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
      const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1, 0.7]);

      particles.push({ x, y, opacity, scale, index: i });
    }
  }

  // Use custom particle component or default circle
  if (particleComponent) {
    return (
      <>
        {particles.map((p, idx) => (
          <g key={idx} opacity={p.opacity}>
            {particleComponent(p)}
          </g>
        ))}
      </>
    );
  }

  // Default particle rendering
  return (
    <>
      {gradient && (
        <defs>
          <radialGradient id={gradient.id}>
            {gradient.colors.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (gradient.colors.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </radialGradient>
        </defs>
      )}
      {particles.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r={size * p.scale}
          fill={gradient ? `url(#${gradient.id})` : color}
          opacity={p.opacity}
          filter={filter}
        />
      ))}
    </>
  );
};

export default ParticleFlow;
