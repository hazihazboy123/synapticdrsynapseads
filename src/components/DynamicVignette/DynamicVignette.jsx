import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { TypewriterText } from './effects/TypewriterText';
import { SlamText } from './effects/SlamText';
import { CircleText } from './effects/CircleText';
import { UnderlineText } from './effects/UnderlineText';
import { HighlightText } from './effects/HighlightText';

/**
 * DynamicVignette - Main container for animated vignette text
 *
 * Takes an array of segments, each with its own effect and timing.
 * Renders segments progressively as their timestamps are reached.
 *
 * Props:
 * - segments: Array of segment objects
 *   - text: The text content
 *   - timestamp: When it appears (raw audio seconds)
 *   - effect: 'typewriter' | 'slam' | 'circle' | 'underline' | 'highlight'
 *   - triggerWord: (optional) Word that triggers this segment
 *   - isCritical: (optional) Whether this is critical info
 * - playbackRate: Video playback rate (default: 2.2)
 * - frameOffset: Offset for meme cutaways (default: 0)
 * - onScreenShake: Callback to trigger parent shake
 * - style: Additional container styles
 * - position: 'top' | 'center' | 'bottom' (default: 'top')
 */
export const DynamicVignette = ({
  segments = [],
  playbackRate = 2.2,
  frameOffset = 0,
  onScreenShake = null,
  style = {},
  position = 'top',
  fontSize = 26,
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for container
  const entranceOpacity = frame < 20 ? frame / 20 : 1;

  // Position presets
  const positionStyles = {
    top: { top: 480, left: 40, right: 40 },
    center: { top: '50%', left: 40, right: 40, transform: 'translateY(-50%)' },
    bottom: { bottom: 300, left: 40, right: 40 },
  };

  // Render a single segment based on its effect type
  const renderSegment = (segment, index) => {
    const { text, timestamp, effect = 'typewriter', isCritical = false } = segment;

    // Calculate if this segment should be visible
    const appearFrame = Math.floor((timestamp / playbackRate) * fps);
    const adjustedFrame = frame - frameOffset;

    // Don't render segments that haven't appeared yet
    if (adjustedFrame < appearFrame) return null;

    // Common props for all effects
    const commonProps = {
      key: `segment-${index}`,
      text,
      timestamp,
      playbackRate,
      frameOffset,
    };

    // Route to appropriate effect component
    switch (effect) {
      case 'slam':
        return (
          <SlamText
            {...commonProps}
            fontSize={fontSize + 6}
            color={isCritical ? '#ef4444' : '#fbbf24'}
            glowColor={isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}
          />
        );

      case 'circle':
        return (
          <CircleText
            {...commonProps}
            fontSize={fontSize}
            color="#fbbf24"
            circleColor={isCritical ? '#ef4444' : '#ef4444'}
          />
        );

      case 'underline':
        return (
          <UnderlineText
            {...commonProps}
            fontSize={fontSize}
            color="#e5e7eb"
            underlineColor={isCritical ? '#ef4444' : '#f97316'}
          />
        );

      case 'highlight':
        return (
          <HighlightText
            {...commonProps}
            fontSize={fontSize}
            color="#1f2937"
            highlightColor="rgba(250, 204, 21, 0.7)"
          />
        );

      case 'typewriter':
      default:
        return (
          <TypewriterText
            {...commonProps}
            fontSize={fontSize}
            color="#e5e7eb"
            showCursor={index === segments.length - 1 ||
              adjustedFrame < Math.floor((segments[index + 1]?.timestamp / playbackRate) * fps)}
          />
        );
    }
  };

  // Render all segments with spacing
  const renderAllSegments = () => {
    return segments.map((segment, index) => {
      const rendered = renderSegment(segment, index);
      if (!rendered) return null;

      // Add space after typewriter segments (they flow inline)
      const needsSpace = segment.effect === 'typewriter' || !segment.effect;

      return (
        <React.Fragment key={`segment-wrapper-${index}`}>
          {rendered}
          {needsSpace && ' '}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{
      position: 'absolute',
      ...positionStyles[position],
      zIndex: 60,
      opacity: entranceOpacity,
      ...style,
    }}>
      <div style={{
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        padding: '24px 32px',
        borderRadius: 16,
        maxWidth,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        borderLeft: '4px solid rgba(147, 51, 234, 0.5)',
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.08), transparent 60%)',
          borderRadius: 16,
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          lineHeight: 1.8,
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}>
          {renderAllSegments()}
        </div>
      </div>
    </div>
  );
};

export default DynamicVignette;
