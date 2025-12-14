import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';

/**
 * UnderlineText - Text appears, then red underline draws beneath it
 *
 * Flow:
 * 1. Text fades in (10 frames)
 * 2. Underline draws left-to-right (15 frames)
 * 3. Subtle glow pulse
 *
 * Props:
 * - text: The text to display
 * - timestamp: When this segment hits (in seconds, raw audio time)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - fontSize: Text size (default: 28)
 * - color: Text color (default: white)
 * - underlineColor: Underline color (default: red-orange gradient)
 * - sound: Whether to play sound effect
 */
export const UnderlineText = ({
  text,
  timestamp,
  playbackRate = 2.2,
  frameOffset = 0,
  fontSize = 28,
  color = '#e5e7eb',
  underlineColor = '#ef4444',
  fontWeight = 500,
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

  // Phase 2: Underline draws (10-25 frames)
  const underlineStartFrame = 10;
  const underlineEndFrame = 25;
  const underlineWidth = interpolate(
    framesVisible,
    [underlineStartFrame, underlineEndFrame],
    [0, 100],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  // Glow pulse after underline completes
  const isComplete = framesVisible > underlineEndFrame;
  const glowIntensity = isComplete
    ? 8 + Math.sin((framesVisible - underlineEndFrame) * 0.15) * 3
    : 0;

  // Play underline drawing sound
  const shouldPlaySound = sound && framesVisible === underlineStartFrame;

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
      padding: '0 4px',
      margin: '0 2px',
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

      {/* Underline that draws */}
      {framesVisible >= underlineStartFrame && (
        <span style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          height: 4,
          width: `${underlineWidth}%`,
          background: `linear-gradient(90deg, ${underlineColor}, #f97316)`,
          borderRadius: 2,
          boxShadow: glowIntensity > 0
            ? `0 0 ${glowIntensity}px rgba(239, 68, 68, 0.6)`
            : 'none',
          zIndex: 1,
        }} />
      )}

      {/* Underline drawing sound */}
      {shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/underline-stroke.mp3')}
          volume={0.4}
        />
      )}
    </span>
  );
};

export default UnderlineText;
