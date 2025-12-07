import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * BrandLogo - Sleek SynapticRecall.ai branding in top left corner
 *
 * Props:
 * - opacity: 0-1 (default 0.95)
 * - size: 'small' | 'medium' | 'large' (default 'medium')
 */
export const BrandLogo = ({ opacity = 0.95, size = 'medium' }) => {
  const sizes = {
    small: { fontSize: 16, padding: 12 },
    medium: { fontSize: 19, padding: 16 },
    large: { fontSize: 22, padding: 20 }
  };

  const { fontSize, padding } = sizes[size];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      <div
        style={{
          position: 'absolute',
          top: padding,
          left: padding,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #9333ea, #db2777)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
          opacity,
          textShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
        }}
      >
        SynapticRecall.ai
      </div>
    </AbsoluteFill>
  );
};
