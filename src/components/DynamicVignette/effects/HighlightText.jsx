import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';

/**
 * HighlightText - Yellow highlighter swipes across text
 *
 * Flow:
 * 1. Text fades in (8 frames)
 * 2. Yellow highlight swipes left-to-right (12 frames)
 * 3. Highlight settles with slight transparency
 *
 * Props:
 * - text: The text to display
 * - timestamp: When this segment hits (in seconds, raw audio time)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - fontSize: Text size (default: 28)
 * - color: Text color (default: white)
 * - highlightColor: Background highlight color (default: yellow)
 * - sound: Whether to play sound effect
 */
export const HighlightText = ({
  text,
  timestamp,
  playbackRate = 2.2,
  frameOffset = 0,
  fontSize = 28,
  color = '#1f2937',
  highlightColor = 'rgba(250, 204, 21, 0.7)',
  fontWeight = 600,
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

  // Phase 1: Text fades in (0-8 frames)
  const textOpacity = interpolate(framesVisible, [0, 8], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Phase 2: Highlight swipes (8-20 frames)
  const highlightStartFrame = 8;
  const highlightEndFrame = 20;
  const highlightWidth = interpolate(
    framesVisible,
    [highlightStartFrame, highlightEndFrame],
    [0, 105],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  // Highlight opacity settles after swipe
  const highlightOpacity = framesVisible > highlightEndFrame
    ? 0.6
    : interpolate(framesVisible, [highlightStartFrame, highlightEndFrame], [0.8, 0.6]);

  // Play highlight sound
  const shouldPlaySound = sound && framesVisible === highlightStartFrame;

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
      padding: '2px 6px',
      margin: '0 2px',
    }}>
      {/* Highlight background (behind text) */}
      {framesVisible >= highlightStartFrame && (
        <span style={{
          position: 'absolute',
          top: 2,
          left: -2,
          bottom: 2,
          width: `${highlightWidth}%`,
          backgroundColor: highlightColor,
          opacity: highlightOpacity,
          transform: 'skewX(-3deg)',
          zIndex: 1,
          borderRadius: 3,
        }} />
      )}

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

      {/* Highlight swipe sound */}
      {shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/button-click.mp3')}
          volume={0.35}
        />
      )}
    </span>
  );
};

export default HighlightText;
