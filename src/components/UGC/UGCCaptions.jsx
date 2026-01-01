import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// =====================================
// UGC CAPTIONS COMPONENT
// TikTok/Instagram style captions synced to timestamps
// =====================================

/**
 * UGCCaptions Component
 *
 * Features:
 * - Word-by-word or phrase-by-phrase display
 * - Synced to Whisper timestamps
 * - TikTok/Instagram style captions
 * - Current word highlight with scale effect
 * - Bottom center positioned pill container
 *
 * Props:
 * @param {Array} words - Array of word objects with { word, start, end } timestamps in seconds
 * @param {number} playbackRate - Audio playback speed multiplier (default: 1)
 * @param {number} bottomOffset - Distance from bottom in pixels (default: 150)
 * @param {number} frameOffset - Frame offset for timing adjustment (default: 0)
 * @param {number} fontSize - Base font size in pixels (default: 36)
 * @param {string} mode - 'word' for word-by-word, 'line' for grouped phrases (default: 'word')
 * @param {number} maxWords - Max words to show at once in word mode (default: 5)
 * @param {boolean} showBackground - Whether to show pill background (default: true)
 */
export const UGCCaptions = ({
  words = [],
  playbackRate = 1,
  bottomOffset = 150,
  frameOffset = 0,
  fontSize = 36,
  mode = 'word',
  maxWords = 5,
  showBackground = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Adjust frame for offset
  const adjustedFrame = frame - frameOffset;
  const currentTime = adjustedFrame / fps;

  // Scale timestamps for playback speed
  const scaledWords = words.map(w => ({
    ...w,
    start: w.start / playbackRate,
    end: w.end / playbackRate,
  }));

  // Entrance animation
  const entranceOpacity = adjustedFrame < 15
    ? interpolate(adjustedFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
    : 1;

  if (mode === 'word') {
    return (
      <WordByWordCaptions
        scaledWords={scaledWords}
        currentTime={currentTime}
        maxWords={maxWords}
        fontSize={fontSize}
        bottomOffset={bottomOffset}
        entranceOpacity={entranceOpacity}
        showBackground={showBackground}
        frame={adjustedFrame}
      />
    );
  }

  return (
    <LineCaptions
      scaledWords={scaledWords}
      currentTime={currentTime}
      fontSize={fontSize}
      bottomOffset={bottomOffset}
      entranceOpacity={entranceOpacity}
      showBackground={showBackground}
    />
  );
};

// Word-by-word display with sliding window
const WordByWordCaptions = ({
  scaledWords,
  currentTime,
  maxWords,
  fontSize,
  bottomOffset,
  entranceOpacity,
  showBackground,
  frame,
}) => {
  // Find all words that have started (appeared)
  const visibleWords = scaledWords.filter(w => currentTime >= w.start);

  // Only show the last N words (sliding window)
  const displayWords = visibleWords.slice(-maxWords);

  if (displayWords.length === 0) return null;

  // Find the currently speaking word
  const currentWordIndex = displayWords.findIndex(w =>
    currentTime >= w.start && currentTime < w.end
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 40px',
        zIndex: 100,
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          // TikTok-style pill container
          background: showBackground ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
          backdropFilter: showBackground ? 'blur(8px)' : 'none',
          padding: showBackground ? '14px 28px' : '0',
          borderRadius: 9999, // rounded-full (pill shape)
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          maxWidth: '80%',
          boxShadow: showBackground ? '0 4px 24px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {displayWords.map((wordData, index) => {
          const isCurrentWord = index === currentWordIndex;
          const wordAge = currentTime - wordData.start;

          // Pop-in animation for new words
          const popProgress = Math.min(1, wordAge * 8);
          const wordScale = isCurrentWord
            ? 1.1
            : 0.85 + (popProgress * 0.15);
          const wordOpacity = 0.4 + (popProgress * 0.6);

          return (
            <span
              key={`${wordData.start}-${index}`}
              style={{
                fontSize: fontSize,
                fontWeight: 800,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                // Current word: yellow-400 (#facc15), others: white
                color: isCurrentWord ? '#facc15' : '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                textShadow: isCurrentWord
                  ? '0 0 30px rgba(250, 204, 21, 0.8), 0 4px 12px rgba(0, 0, 0, 1)'
                  : '0 2px 8px rgba(0, 0, 0, 0.9)',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                transform: `scale(${wordScale})`,
                opacity: isCurrentWord ? 1 : wordOpacity,
                transformOrigin: 'center center',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {wordData.word.replace(/[—-]/g, ' ').trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Group words into lines (4-5 words per line)
const groupWordsIntoLines = (words, wordsPerLine = 5) => {
  const lines = [];
  let currentLine = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentLine.push(word);

    // Create new line after N words or at punctuation
    const wordText = word.word || '';
    const hasPunctuation = /[.!?,]$/.test(wordText);

    if (currentLine.length >= wordsPerLine || (currentLine.length >= 3 && hasPunctuation)) {
      lines.push(currentLine);
      currentLine = [];
    }
  }

  // Add remaining words
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};

// Line-by-line display (phrases)
const LineCaptions = ({
  scaledWords,
  currentTime,
  fontSize,
  bottomOffset,
  entranceOpacity,
  showBackground,
}) => {
  const lines = groupWordsIntoLines(scaledWords);

  // Find current line
  let currentLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineWords = lines[i];
    const lineStart = lineWords[0].start;
    const lineEnd = lineWords[lineWords.length - 1].end;

    if (currentTime >= lineStart && currentTime < lineEnd + 0.5) {
      currentLineIndex = i;
      break;
    }
  }

  if (currentLineIndex === -1) return null;

  const currentLine = lines[currentLineIndex];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 40px',
        zIndex: 100,
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          // TikTok-style pill container
          background: showBackground ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
          backdropFilter: showBackground ? 'blur(8px)' : 'none',
          padding: showBackground ? '16px 30px' : '0',
          borderRadius: 16,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 8,
          maxWidth: '85%',
          boxShadow: showBackground ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {currentLine.map((wordData, index) => {
          const isHighlighted = currentTime >= wordData.start && currentTime < wordData.end;

          return (
            <span
              key={index}
              style={{
                fontSize: fontSize,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                // Current word: yellow-400, others: white
                color: isHighlighted ? '#facc15' : '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                textShadow: isHighlighted
                  ? '0 0 20px rgba(250, 204, 21, 0.6), 0 5px 12px rgba(0, 0, 0, 1)'
                  : '0 3px 8px rgba(0, 0, 0, 1)',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: 8,
                transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center center',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {wordData.word.replace(/[—-]/g, ' ').trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default UGCCaptions;
