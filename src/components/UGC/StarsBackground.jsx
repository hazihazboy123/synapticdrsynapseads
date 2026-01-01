import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const StarsBackground = ({ starCount = 100, twinkle = true }) => {
  const frame = useCurrentFrame();

  // Generate deterministic star positions
  const stars = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < starCount; i++) {
      // Use seeded random-like distribution
      const x = ((i * 7919) % 100);
      const y = ((i * 104729) % 100);
      const size = 1 + ((i * 31) % 3);
      const opacity = 0.2 + ((i * 17) % 30) / 100;
      const twinkleSpeed = 0.5 + ((i * 13) % 50) / 100;
      const twinkleOffset = (i * 23) % 60;

      result.push({ x, y, size, opacity, twinkleSpeed, twinkleOffset });
    }
    return result;
  }, [starCount]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {stars.map((star, i) => {
        const twinkleOpacity = twinkle
          ? interpolate(
              Math.sin((frame + star.twinkleOffset) * star.twinkleSpeed * 0.1),
              [-1, 1],
              [star.opacity * 0.5, star.opacity]
            )
          : star.opacity;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: twinkleOpacity,
            }}
          />
        );
      })}

      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 30%, transparent 70%, rgba(0,0,0,0.5))',
        }}
      />
    </AbsoluteFill>
  );
};
