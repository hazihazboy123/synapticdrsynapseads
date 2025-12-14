import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

/**
 * TypewriterVignette - Smooth character-by-character typewriter effect
 *
 * Matches the website's WelcomeAnimation style:
 * - ~2 frames per character at 30fps (smooth like 65ms)
 * - Blinking gradient cursor
 * - SLAM effects for critical text
 */
export const TypewriterVignette = ({
  segments = [],
  playbackRate = 2.2,
  frameOffset = 0,
  framesPerChar = 2, // ~66ms at 30fps - matches website
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - frameOffset;

  // Cursor blink (30 frames = 1s cycle, like website)
  const cursorVisible = Math.floor(adjustedFrame / 15) % 2 === 0;

  // Find the currently typing segment (for cursor placement)
  let activeSegmentIndex = -1;
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    const appearFrame = Math.floor((seg.timestamp / playbackRate) * fps);
    if (adjustedFrame >= appearFrame) {
      activeSegmentIndex = i;
      break;
    }
  }

  // Render segments
  const renderSegments = () => {
    return segments.map((segment, index) => {
      const { text, timestamp, effect = 'typewriter', isCritical = false } = segment;

      const appearFrame = Math.floor((timestamp / playbackRate) * fps);

      // Not visible yet
      if (adjustedFrame < appearFrame) return null;

      const framesVisible = adjustedFrame - appearFrame;

      // Character-by-character reveal (smooth like website)
      const charsToShow = Math.floor(framesVisible / framesPerChar);
      const visibleText = text.slice(0, Math.min(charsToShow, text.length));
      const isComplete = charsToShow >= text.length;
      const isActiveSegment = index === activeSegmentIndex;

      // Effect styling
      const isSlam = effect === 'slam';
      const isUnderline = effect === 'underline';

      let textStyle = {
        display: 'inline',
        fontSize: 24,
        lineHeight: 1.8,
        color: '#e5e7eb',
        fontWeight: 400,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      };

      // Underline effect - red animated underline
      let underlineElement = null;
      if (isUnderline && isComplete) {
        // Underline draws in over 15 frames after text completes
        const underlineStartFrame = appearFrame + (text.length * framesPerChar);
        const underlineProgress = interpolate(
          adjustedFrame - underlineStartFrame,
          [0, 15],
          [0, 100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        textStyle = {
          ...textStyle,
          display: 'inline-block',
          position: 'relative',
          fontWeight: 600,
        };

        underlineElement = (
          <span style={{
            position: 'absolute',
            bottom: 2,
            left: 0,
            width: `${underlineProgress}%`,
            height: 3,
            background: isCritical ? '#ef4444' : '#fbbf24',
            borderRadius: 2,
            boxShadow: isCritical
              ? '0 0 8px rgba(239, 68, 68, 0.6)'
              : '0 0 8px rgba(251, 191, 36, 0.5)',
          }} />
        );
      }

      if (isSlam && visibleText.length > 0) {
        // Spring animation for slam
        const slamProgress = spring({
          frame: framesVisible,
          fps,
          config: { damping: 12, stiffness: 200, mass: 0.6 },
        });

        const scale = interpolate(slamProgress, [0, 1], [1.5, 1]);
        const translateY = interpolate(slamProgress, [0, 1], [-15, 0]);

        // Glow that fades
        const glowIntensity = interpolate(framesVisible, [0, 5, 20], [25, 18, 10], {
          extrapolateRight: 'clamp'
        });

        textStyle = {
          ...textStyle,
          display: 'inline-block',
          color: isCritical ? '#ef4444' : '#fbbf24',
          fontWeight: 800,
          transform: `translateY(${translateY}px) scale(${scale})`,
          textShadow: `0 0 ${glowIntensity}px ${isCritical ? 'rgba(239, 68, 68, 0.7)' : 'rgba(251, 191, 36, 0.6)'}`,
        };
      }

      // Fade in
      const opacity = interpolate(framesVisible, [0, 3], [0, 1], {
        extrapolateRight: 'clamp'
      });

      return (
        <React.Fragment key={`segment-${index}`}>
          <span style={{ ...textStyle, opacity }}>
            {visibleText}
            {underlineElement}
          </span>

          {/* Blinking cursor - only on active segment, not complete */}
          {isActiveSegment && !isComplete && (
            <span style={{
              display: 'inline-block',
              width: 2,
              height: 22,
              marginLeft: 1,
              verticalAlign: 'middle',
              background: 'linear-gradient(180deg, #a855f7, #ec4899)',
              borderRadius: 1,
              opacity: cursorVisible ? 1 : 0,
              boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
              transition: 'opacity 0.05s',
            }} />
          )}

          {/* Space after complete segments */}
          {isComplete && !isSlam && !isUnderline && ' '}
          {(isSlam || isUnderline) && ' '}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{
      fontSize: 24,
      lineHeight: 1.8,
      color: '#e5e7eb',
      margin: '24px 0',
      textAlign: 'left',
    }}>
      {renderSegments()}
    </div>
  );
};

export default TypewriterVignette;
