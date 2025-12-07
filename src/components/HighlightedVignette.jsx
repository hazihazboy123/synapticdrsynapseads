import React from 'react';
import { useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';

/**
 * HighlightedVignette - Vignette text with animated marker squiggle underlines
 *
 * Features:
 * - Text always visible
 * - Wavy underline that draws in (like a hand-drawn marker)
 * - Pink/red gradient
 * - Text glow and scale effect
 * - Pulsing glow for critical highlights
 */
export const HighlightedVignette = ({
  text,
  highlights = [], // Array of { phrase: "chronic alcoholism", timestamp: 10.112, isCritical: false }
  playbackRate = 1.85,
  frameOffset = 0,
  soundVolume = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Adjust frame for meme offset
  const adjustedFrame = frame - frameOffset;
  const currentTime = (adjustedFrame / fps) * playbackRate;

  // Check which highlights are active
  const getHighlightState = (timestamp) => {
    const timeSinceHighlight = currentTime - timestamp;
    if (timeSinceHighlight < 0) return { active: false, progress: 0 };
    if (timeSinceHighlight > 2) return { active: true, progress: 1 };
    return { active: true, progress: Math.min(1, timeSinceHighlight / 0.15) };
  };

  // Build the text with highlights
  const renderTextWithHighlights = () => {
    let result = [];
    let lastIndex = 0;

    // Sort highlights by their position in the text
    const sortedHighlights = [...highlights].sort((a, b) => {
      const posA = text.toLowerCase().indexOf(a.phrase.toLowerCase());
      const posB = text.toLowerCase().indexOf(b.phrase.toLowerCase());
      return posA - posB;
    });

    sortedHighlights.forEach((highlight, idx) => {
      const phraseIndex = text.toLowerCase().indexOf(highlight.phrase.toLowerCase(), lastIndex);
      if (phraseIndex === -1) return;

      // Add text before this highlight
      if (phraseIndex > lastIndex) {
        result.push(
          <span key={`text-${idx}`}>
            {text.slice(lastIndex, phraseIndex)}
          </span>
        );
      }

      // Add the highlighted phrase
      const { active, progress } = getHighlightState(highlight.timestamp);
      const highlightFrame = Math.floor((highlight.timestamp / playbackRate) * fps) + frameOffset;
      const shouldPlaySound = frame === highlightFrame;

      // HIGHLIGHTER SWIPE: Calculate frames since highlight started
      const framesSinceHighlight = active ? Math.max(0, frame - highlightFrame) : 0;
      const swipeDurationFrames = 18; // 0.6 seconds at 30fps
      const swipeProgress = active ? Math.min(1, framesSinceHighlight / swipeDurationFrames) : 0;

      // Text scale animation (starts after swipe begins)
      const scaleStartFrame = 5; // Start scaling after 5 frames
      const scaleDurationFrames = 10;
      const scaleProgress = framesSinceHighlight > scaleStartFrame
        ? Math.min(1, (framesSinceHighlight - scaleStartFrame) / scaleDurationFrames)
        : 0;

      const scale = interpolate(scaleProgress, [0, 0.5, 1], [1, 1.015, 1.005]);

      // Glow intensity (more for critical highlights)
      const glowIntensity = highlight.isCritical
        ? interpolate(Math.sin(adjustedFrame * 0.15), [-1, 1], [15, 25])
        : 12;

      result.push(
        <span
          key={`highlight-${idx}`}
          style={{
            position: 'relative',
            display: 'inline-block',
            color: '#ffffff', // Bright white text when highlighted
            fontWeight: active ? 800 : 400,
            transform: `scale(${scale})`,
            transition: 'none',
          }}
        >
          {/* Red Underline Swipe */}
          {active && (
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                height: '3px',
                width: `${swipeProgress * 100}%`,
                background: '#ef4444',
                borderRadius: '1px',
                opacity: interpolate(swipeProgress, [0, 0.3, 1], [0.7, 0.9, 1]),
              }}
            />
          )}

          {text.slice(phraseIndex, phraseIndex + highlight.phrase.length)}

          {/* Underline stroke sound effect */}
          {shouldPlaySound && (
            <Audio
              src={staticFile('assets/sfx/underline-stroke.mp3')}
              startFrom={0.8}
              volume={soundVolume * 1.3}
            />
          )}
        </span>
      );

      lastIndex = phraseIndex + highlight.phrase.length;
    });

    // Add remaining text after last highlight
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div style={{
      fontSize: 24,
      lineHeight: 1.8,
      color: '#e5e7eb',
      margin: '24px 0',
      textAlign: 'left',
    }}>
      {renderTextWithHighlights()}
    </div>
  );
};

export default HighlightedVignette;
