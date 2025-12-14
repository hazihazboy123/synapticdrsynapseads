import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';

/**
 * CircleText - Text appears, then a hand-drawn circle animates around it
 *
 * Flow:
 * 1. Text fades in (10 frames)
 * 2. Red circle draws around it (20 frames)
 * 3. Circle pulses subtly
 *
 * Props:
 * - text: The text to display
 * - timestamp: When this segment hits (in seconds, raw audio time)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - fontSize: Text size (default: 28)
 * - color: Text color (default: yellow for attention)
 * - circleColor: Circle stroke color (default: red)
 * - sound: Whether to play sound effect
 */
export const CircleText = ({
  text,
  timestamp,
  playbackRate = 2.2,
  frameOffset = 0,
  fontSize = 28,
  color = '#fbbf24',
  circleColor = '#ef4444',
  fontWeight = 700,
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate when this segment appears
  const appearFrame = Math.floor((timestamp / playbackRate) * fps);
  const adjustedFrame = frame - frameOffset;

  // Not visible yet
  if (adjustedFrame < appearFrame) return null;

  // Frames since appearance
  const framesVisible = adjustedFrame - appearFrame;

  // Phase 1: Text fades in (0-10 frames)
  const textOpacity = interpolate(framesVisible, [0, 10], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Phase 2: Circle draws (10-30 frames)
  const circleStartFrame = 10;
  const circleEndFrame = 30;
  const circleProgress = interpolate(
    framesVisible,
    [circleStartFrame, circleEndFrame],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  // SVG path for hand-drawn circle (slightly imperfect for organic feel)
  // Uses a bezier curve that goes around the text
  const pathLength = 280;
  const dashOffset = pathLength * (1 - circleProgress);

  // Subtle pulse after circle completes
  const isPulsing = framesVisible > circleEndFrame;
  const pulseScale = isPulsing
    ? 1 + Math.sin((framesVisible - circleEndFrame) * 0.1) * 0.02
    : 1;

  // Play circle drawing sound
  const shouldPlaySound = sound && framesVisible === circleStartFrame;

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
      padding: '4px 12px',
      margin: '0 4px',
    }}>
      {/* Text */}
      <span style={{
        fontSize,
        color,
        fontWeight,
        opacity: textOpacity,
        fontFamily: 'Helvetica, Arial, sans-serif',
        position: 'relative',
        zIndex: 2,
      }}>
        {text}
      </span>

      {/* Hand-drawn circle SVG overlay */}
      {framesVisible >= circleStartFrame && (
        <svg
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            width: 'calc(100% + 16px)',
            height: 'calc(100% + 16px)',
            pointerEvents: 'none',
            transform: `scale(${pulseScale})`,
            zIndex: 1,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Hand-drawn ellipse path - slightly wobbly for organic feel */}
          <ellipse
            cx="50"
            cy="50"
            rx="48"
            ry="46"
            fill="none"
            stroke={circleColor}
            strokeWidth="3"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            opacity={0.9}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))',
            }}
          />
        </svg>
      )}

      {/* Circle drawing sound */}
      {shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/underline-stroke.mp3')}
          volume={0.5}
        />
      )}
    </span>
  );
};

export default CircleText;
