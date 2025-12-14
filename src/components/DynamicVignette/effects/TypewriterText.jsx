import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';

/**
 * TypewriterText - Characters appear progressively synced to audio
 *
 * Props:
 * - text: The text to display
 * - timestamp: When this segment starts (in seconds, raw audio time)
 * - playbackRate: Video playback rate (default 2.2 for DKA)
 * - frameOffset: Offset for meme cutaways
 * - charsPerFrame: How fast to type (default: 0.8 chars per frame at playback rate)
 * - showCursor: Whether to show blinking cursor (default: true)
 * - fontSize: Text size (default: 28)
 * - color: Text color (default: white)
 * - onComplete: Callback when typing finishes
 */
export const TypewriterText = ({
  text,
  timestamp,
  playbackRate = 2.2,
  frameOffset = 0,
  charsPerFrame = 0.8,
  showCursor = true,
  fontSize = 28,
  color = '#e5e7eb',
  fontWeight = 400,
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate when this segment appears
  const appearFrame = Math.floor((timestamp / playbackRate) * fps);
  const adjustedFrame = frame - frameOffset;

  // Not visible yet
  if (adjustedFrame < appearFrame) return null;

  // Frames since we started typing
  const framesVisible = adjustedFrame - appearFrame;

  // Calculate how many characters to show
  // At 2.2x playback, we want text to appear roughly as fast as speech
  const charsToShow = Math.floor(framesVisible * charsPerFrame);
  const visibleText = text.slice(0, Math.min(charsToShow, text.length));
  const isComplete = charsToShow >= text.length;

  // Cursor blink (every 15 frames = 0.5s at 30fps)
  const cursorVisible = !isComplete && Math.floor(framesVisible / 15) % 2 === 0;

  // Subtle fade-in for the whole element
  const opacity = interpolate(framesVisible, [0, 5], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Play typing sound on first frame
  const shouldPlaySound = sound && framesVisible === 0;

  return (
    <span style={{
      display: 'inline',
      fontSize,
      color,
      fontWeight,
      opacity,
      fontFamily: 'Helvetica, Arial, sans-serif',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    }}>
      {visibleText}

      {/* Blinking cursor */}
      {showCursor && !isComplete && (
        <span style={{
          display: 'inline-block',
          width: 2,
          height: fontSize * 0.8,
          backgroundColor: '#c084fc',
          marginLeft: 2,
          opacity: cursorVisible ? 1 : 0,
          verticalAlign: 'middle',
          boxShadow: '0 0 8px rgba(192, 132, 252, 0.6)',
        }} />
      )}

      {/* Typing sound effect */}
      {shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/button-click.mp3')}
          volume={0.3}
        />
      )}
    </span>
  );
};

export default TypewriterText;
