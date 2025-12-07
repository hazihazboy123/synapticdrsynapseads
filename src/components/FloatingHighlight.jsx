import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const FloatingHighlight = ({
  phrase,
  timestamp,
  playbackRate = 1.9,
  color = '#ef4444',
  shouldShake = false,
  displayDuration = 2.5, // seconds
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert timestamp to frame
  const appearFrame = Math.floor((timestamp / playbackRate) * fps);
  const disappearFrame = appearFrame + Math.floor(displayDuration * fps);

  // Don't render if not in time window
  if (frame < appearFrame || frame > disappearFrame) {
    return null;
  }

  const localFrame = frame - appearFrame;

  // ===== ENTRANCE ANIMATION =====
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const yPosition = interpolate(entranceProgress, [0, 1], [100, 0]);
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

  // ===== EXIT ANIMATION =====
  const exitStartFrame = Math.floor((displayDuration - 0.5) * fps);
  const exitProgress = localFrame > exitStartFrame
    ? (localFrame - exitStartFrame) / (fps * 0.5)
    : 0;
  const exitOpacity = 1 - exitProgress;

  // ===== UNDERLINE ANIMATION =====
  const underlineProgress = spring({
    frame: localFrame,
    fps,
    delay: 5, // Start drawing slightly after entrance
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // ===== SHAKE EFFECT (for critical highlights) =====
  const shakeOffset = shouldShake
    ? Math.sin(localFrame * 0.8) * 3 * (localFrame < 20 ? 1 : 0)
    : 0;

  // ===== GLOW EFFECT =====
  const glowIntensity = shouldShake
    ? interpolate(
        Math.sin(localFrame * 0.3),
        [-1, 1],
        [10, 25]
      )
    : 15;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 280, // Position at vignette card level
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `translateY(${yPosition}px) translateX(${shakeOffset}px)`,
          opacity: opacity * exitOpacity,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Main Text */}
        <div
          style={{
            fontSize: phrase.length > 30 ? 38 : 48,
            fontWeight: 800,
            color: '#ffffff',
            textShadow: `0 0 ${glowIntensity}px ${color}, 0 0 ${glowIntensity * 2}px ${color}`,
            padding: '0 40px',
            position: 'relative',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {phrase}

          {/* Animated Underline */}
          <svg
            style={{
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '100%',
              height: 12,
              overflow: 'visible',
            }}
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
          >
            {/* Wavy underline path */}
            <path
              d="M 0 6 Q 12.5 3, 25 6 T 50 6 T 75 6 T 100 6"
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
                strokeDasharray: 100,
                strokeDashoffset: 100 - underlineProgress * 100,
                transition: 'stroke-dashoffset 0.3s ease-out',
              }}
            />
          </svg>
        </div>

        {/* Glow Background (for critical highlights) */}
        {shouldShake && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              filter: 'blur(20px)',
              zIndex: -1,
              opacity: interpolate(Math.sin(localFrame * 0.2), [-1, 1], [0.3, 0.7]),
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
