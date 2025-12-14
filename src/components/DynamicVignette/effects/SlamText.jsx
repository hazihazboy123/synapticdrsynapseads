import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from 'remotion';

/**
 * SlamText - Text SLAMS down onto screen with impact
 *
 * The text starts scaled up (2x) and above position, then SLAMS down
 * with spring physics, slight overshoot, and optional screen shake trigger.
 *
 * Props:
 * - text: The text to display
 * - timestamp: When this segment hits (in seconds, raw audio time)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - fontSize: Text size (default: 32)
 * - color: Text color (default: red for critical)
 * - onScreenShake: Callback to trigger parent screen shake
 * - glowColor: Color of the glow effect
 * - slamDuration: How long the slam takes in frames (default: 8)
 */
export const SlamText = ({
  text,
  timestamp,
  playbackRate = 2.2,
  frameOffset = 0,
  fontSize = 32,
  color = '#ef4444',
  glowColor = 'rgba(239, 68, 68, 0.6)',
  slamDuration = 8,
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate when this segment appears
  const appearFrame = Math.floor((timestamp / playbackRate) * fps);
  const adjustedFrame = frame - frameOffset;

  // Not visible yet
  if (adjustedFrame < appearFrame) return null;

  // Frames since slam started
  const framesVisible = adjustedFrame - appearFrame;

  // SLAM animation using spring physics
  // Starts at scale 2.0, translates from -50px above, slams to final position
  const slamProgress = spring({
    frame: framesVisible,
    fps,
    config: {
      damping: 12,      // Lower = more bounce
      stiffness: 300,   // Higher = faster snap
      mass: 0.8,        // Lower = snappier
    },
  });

  // Scale: 2.0 → 1.0 with slight overshoot
  const scale = interpolate(slamProgress, [0, 1], [2.0, 1.0]);

  // Y position: -60px → 0 (slam down)
  const translateY = interpolate(slamProgress, [0, 1], [-60, 0]);

  // Opacity: quick fade in during first 3 frames
  const opacity = interpolate(framesVisible, [0, 3], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Impact flash - bright white flash on impact
  const impactFrame = 4; // Flash peaks around frame 4
  const flashIntensity = framesVisible >= impactFrame - 2 && framesVisible <= impactFrame + 2
    ? interpolate(framesVisible, [impactFrame - 2, impactFrame, impactFrame + 2], [0, 1, 0])
    : 0;

  // Glow intensity - starts strong, settles to subtle pulse
  const baseGlow = interpolate(framesVisible, [0, slamDuration, slamDuration + 30], [30, 20, 12], {
    extrapolateRight: 'clamp'
  });

  // Subtle pulse after landing
  const pulseGlow = framesVisible > slamDuration
    ? Math.sin((framesVisible - slamDuration) * 0.15) * 4
    : 0;

  const glowIntensity = baseGlow + pulseGlow;

  // Play slam sound on impact
  const shouldPlaySound = sound && framesVisible === 0;

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
    }}>
      {/* Impact flash overlay */}
      {flashIntensity > 0 && (
        <span style={{
          position: 'absolute',
          inset: -10,
          backgroundColor: `rgba(255, 255, 255, ${flashIntensity * 0.3})`,
          borderRadius: 8,
          pointerEvents: 'none',
        }} />
      )}

      {/* Main text */}
      <span style={{
        display: 'inline-block',
        fontSize,
        fontWeight: 900,
        color,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        textShadow: `
          0 0 ${glowIntensity}px ${glowColor},
          0 0 ${glowIntensity * 2}px ${glowColor},
          0 4px 8px rgba(0, 0, 0, 0.5)
        `,
        fontFamily: 'Helvetica, Arial, sans-serif',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}>
        {text}
      </span>

      {/* Slam sound effect */}
      {shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/whoosh.mp3')}
          volume={0.6}
        />
      )}
    </span>
  );
};

export default SlamText;
