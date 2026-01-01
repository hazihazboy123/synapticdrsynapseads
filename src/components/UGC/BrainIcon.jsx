import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';

export const BrainIcon = ({ size = 80, animate = true, showOnFrame = 0 }) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Floating animation
  const floatY = animate
    ? interpolate(Math.sin((frame - showOnFrame) * 0.05), [-1, 1], [-5, 5])
    : 0;

  // Scale in animation
  const scale = spring({
    frame: frame - showOnFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Glow pulse
  const glowIntensity = animate
    ? interpolate(Math.sin((frame - showOnFrame) * 0.08), [-1, 1], [0.3, 0.6])
    : 0.4;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translateY(${floatY}px) scale(${scale})`,
        boxShadow: `0 0 ${30 * glowIntensity}px rgba(168, 85, 247, ${glowIntensity})`,
        position: 'relative',
      }}
    >
      {/* Glass overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Brain SVG */}
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
      </svg>
    </div>
  );
};
