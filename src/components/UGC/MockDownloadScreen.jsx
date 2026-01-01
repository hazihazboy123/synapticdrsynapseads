import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring } from 'remotion';
import { StarsBackground } from './StarsBackground';

// Download icon
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Layers/deck icon
const LayersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 2,7 12,12 22,7 12,2" />
    <polyline points="2,17 12,22 22,17" />
    <polyline points="2,12 12,17 22,12" />
  </svg>
);

// Checkmark icon
const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// Confetti particle component
const ConfettiParticle = ({ index, showOnFrame }) => {
  const frame = useCurrentFrame();
  const delay = index * 2;

  // Random-ish properties based on index
  const startX = ((index * 7919) % 100);
  const speed = 2 + ((index * 31) % 4);
  const rotation = (index * 17) % 360;
  const size = 8 + ((index * 13) % 8);
  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b'];
  const color = colors[index % colors.length];

  const y = interpolate(
    frame - showOnFrame - delay,
    [0, 60],
    [-50, 500],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const opacity = interpolate(
    frame - showOnFrame - delay,
    [0, 10, 50, 60],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const rotate = rotation + (frame - showOnFrame) * 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${startX}%`,
        top: y,
        width: size,
        height: size * 0.6,
        background: color,
        borderRadius: 2,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
    />
  );
};

export const MockDownloadScreen = ({
  showOnFrame = 0,
  cardCount = 25,
  showConfetti = true,
  showDownloadButton = true,
  downloadProgress = 0, // 0-100, 0 means not downloading
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Main container animation
  const containerScale = spring({
    frame: frame - showOnFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Success icon bounce
  const iconScale = spring({
    frame: frame - showOnFrame - 10,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Text fade in
  const textOpacity = interpolate(
    frame - showOnFrame,
    [15, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Button animation
  const buttonScale = spring({
    frame: frame - showOnFrame - 25,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin((frame - showOnFrame) * 0.08),
    [-1, 1],
    [0.3, 0.6]
  );

  // Deck icon float
  const deckFloat = interpolate(
    Math.sin((frame - showOnFrame) * 0.06),
    [-1, 1],
    [-3, 3]
  );

  return (
    <AbsoluteFill>
      <StarsBackground starCount={80} />

      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} showOnFrame={showOnFrame} />
          ))}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        {/* Main Card */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 48,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: `0 0 ${60 * glowIntensity}px rgba(168, 85, 247, ${glowIntensity * 0.5})`,
            transform: `scale(${containerScale})`,
            opacity: containerScale,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              transform: `scale(${iconScale})`,
            }}
          >
            <CheckIcon />
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 16,
              opacity: textOpacity,
            }}
          >
            Deck Ready!
          </h1>

          {/* Card count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 24,
              opacity: textOpacity,
            }}
          >
            <div
              style={{
                color: '#a855f7',
                transform: `translateY(${deckFloat}px)`,
              }}
            >
              <LayersIcon />
            </div>
            <p style={{ fontSize: 20, color: 'rgba(209, 213, 219, 1)' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{cardCount}</span> flashcards generated
            </p>
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              marginBottom: 32,
              opacity: textOpacity,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#22c55e', fontSize: 12 }}>✓</span>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(156, 163, 175, 1)' }}>
                Clinical vignettes
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#22c55e', fontSize: 12 }}>✓</span>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(156, 163, 175, 1)' }}>
                High-yield content
              </span>
            </div>
          </div>

          {/* Download Button */}
          {showDownloadButton && (
            <div style={{ transform: `scale(${buttonScale})`, opacity: buttonScale }}>
              {downloadProgress > 0 && downloadProgress < 100 ? (
                // Download progress
                <div
                  style={{
                    background: 'rgba(75, 85, 99, 0.3)',
                    borderRadius: 9999,
                    padding: 4,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: `${downloadProgress}%`,
                      height: 8,
                      background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                      borderRadius: 9999,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              ) : null}

              <button
                style={{
                  width: '100%',
                  padding: '20px 40px',
                  borderRadius: 9999,
                  background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)',
                }}
              >
                <DownloadIcon />
                Download Anki-Compatible Deck
              </button>
            </div>
          )}

          {/* Anki compatibility note */}
          <p
            style={{
              fontSize: 13,
              color: 'rgba(107, 114, 128, 1)',
              marginTop: 20,
              opacity: textOpacity,
            }}
          >
            Compatible with Anki on Desktop, iOS & Android
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
