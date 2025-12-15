import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

/**
 * SpeechBubble - Classic comic-style oval speech bubble
 *
 * Features:
 * - Clean oval/ellipse shape like classic comics
 * - Curved tail pointing to speaker
 * - Word-by-word display synced to audio timestamps
 * - Minimal, clean design
 */

// Helper function to clean SSML tags
const cleanWord = (word) => {
  return word
    .replace(/<[^>]*>/g, '')
    .replace(/\w+="[^"]*"/g, '')
    .replace(/[="]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const SpeechBubble = ({
  words,
  playbackRate = 1.9,
  frameOffset = 0,
  // Positioning
  top = 50,
  left = 180,
  // Bubble dimensions (oval)
  width = 160,
  height = 100,
  // Tail configuration
  tailDirection = 'bottom-left', // 'left', 'bottom-left', 'bottom-right'
  // Styling
  backgroundColor = '#FFFFFF',
  borderColor = '#000000',
  borderWidth = 3,
  // Text styling
  fontSize = 18,
  textColor = '#000000',
  // Animation
  maxWords = 1,
  showTrail = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - frameOffset;
  const currentTime = adjustedFrame / fps;

  // Scale timestamps for playback speed
  const scaledWords = words.map(w => ({
    ...w,
    word: cleanWord(w.word),
    start: w.start / playbackRate,
    end: w.end / playbackRate
  })).filter(w => w.word);

  // Find visible words
  const visibleWords = scaledWords.filter(w => currentTime >= w.start);
  const displayWords = showTrail
    ? visibleWords.slice(-maxWords)
    : visibleWords.slice(-1);

  // Find the currently speaking word - extend display time so words linger longer
  const wordDisplayBuffer = 0.15; // Extra time (seconds) to show each word
  const currentWord = scaledWords.find(w =>
    currentTime >= w.start && currentTime < (w.end + wordDisplayBuffer)
  );

  // Entrance animation
  const entranceScale = spring({
    frame,
    fps,
    config: { stiffness: 200, damping: 18 },
    durationInFrames: 25,
  });

  const entranceOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // SVG dimensions with padding for tail
  const svgWidth = width + 40;
  const svgHeight = height + 50;
  const cx = width / 2 + 20; // Center X (with padding)
  const cy = height / 2 + 5; // Center Y
  const rx = width / 2; // Radius X (horizontal)
  const ry = height / 2; // Radius Y (vertical)

  // Don't render if no words yet
  if (displayWords.length === 0 && !currentWord) {
    return null;
  }

  const wordToShow = currentWord || displayWords[displayWords.length - 1];
  if (!wordToShow) return null;

  // Word pop animation
  const wordAge = currentTime - wordToShow.start;
  const popScale = spring({
    frame: Math.floor(wordAge * fps),
    fps,
    config: { stiffness: 300, damping: 12 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: svgWidth,
        height: svgHeight,
        zIndex: 200,
        opacity: entranceOpacity,
        transform: `scale(${entranceScale})`,
        transformOrigin: 'top left',
      }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
        }}
      >
        {/* Drop shadow */}
        <defs>
          <filter id="speechShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Main ellipse bubble */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          filter="url(#speechShadow)"
        />

        {/* Simple triangular tail - small and clean */}
        <polygon
          points={`
            ${cx - rx * 0.3},${cy + ry * 0.7}
            ${cx - rx * 0.1},${cy + ry * 0.85}
            ${5},${svgHeight + 8}
          `}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeLinejoin="round"
        />

        {/* Cover the tail joint inside the ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx - borderWidth - 1}
          ry={ry - borderWidth - 1}
          fill={backgroundColor}
          stroke="none"
        />
      </svg>

      {/* Text container - centered in the ellipse */}
      <div
        style={{
          position: 'absolute',
          top: 5,
          left: 20,
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: fontSize,
            fontWeight: 900,
            fontFamily: 'Arial Black, Arial, sans-serif',
            color: textColor,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {wordToShow.word.replace(/—/g, '').replace(/-/g, '').trim()}
        </span>
      </div>
    </div>
  );
};

export default SpeechBubble;
