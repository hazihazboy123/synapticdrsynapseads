import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

// Helper function to clean SSML tags and tone markers from words
const cleanWord = (word) => {
  // Remove ALL SSML/XML tags and attributes aggressively
  let cleaned = word
    // Remove complete XML-style tags (e.g., <speak>, <break time="0.3s"/>, <prosody rate="fast">)
    .replace(/<[^>]*>/g, '')
    // Remove any remaining attribute patterns (e.g., time="0.3s", rate="fast")
    .replace(/\w+="[^"]*"/g, '')
    // Remove any remaining equals signs and quotes
    .replace(/[="]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

// Helper function to group words into lines (4-5 words per line for punchier captions)
const groupWordsIntoLines = (words) => {
  const lines = [];
  let currentLine = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanedWord = cleanWord(word.word);

    // Skip empty words (pure SSML tags with no actual text)
    if (!cleanedWord) continue;

    // Add cleaned word to current line
    currentLine.push({ ...word, cleanedWord });

    // Create new line after 4-5 words or at punctuation
    if (currentLine.length >= 4 && (cleanedWord.includes('.') || cleanedWord.includes(',') || cleanedWord.includes('?') || cleanedWord.includes('!'))) {
      lines.push(currentLine);
      currentLine = [];
    } else if (currentLine.length >= 5) {
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

export const TikTokCaptions = ({
  words,
  playbackRate = 1.75,
  bottomOffset = 350,
  frameOffset = 0,
  fontSize = 44,
  position = 'bottom', // 'bottom', 'top', 'top-bar', 'top-right', or 'speech-bubble'
  topOffset = 380, // Position below Dr. Synapse (mascot is ~350px)
  leftOffset = 180, // For top-bar mode: offset from left (after mascot)
  mode = 'line', // 'line' (old behavior) or 'word' (word by word)
  maxWords = 6, // Max words to show at once in 'word' mode
  // Custom positioning (for speech-bubble mode)
  customTop = null, // Custom top position in pixels
  customLeft = null, // Custom left position in pixels
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - frameOffset;
  const currentTime = adjustedFrame / fps;

  // Entrance animation
  const entranceOpacity = frame < 20 ? frame / 20 : 1;

  // Scale timestamps for playback speed
  const scaledWords = words.map(w => ({
    ...w,
    word: cleanWord(w.word),
    start: w.start / playbackRate,
    end: w.end / playbackRate
  })).filter(w => w.word); // Filter out empty words

  // ===== WORD-BY-WORD MODE =====
  if (mode === 'word') {
    // Find all words that have started (appeared)
    const visibleWords = scaledWords.filter(w => currentTime >= w.start);

    // Only show the last N words (sliding window)
    const displayWords = visibleWords.slice(-maxWords);

    if (displayWords.length === 0) return null;

    // Find the currently speaking word
    const currentWordIndex = displayWords.findIndex(w =>
      currentTime >= w.start && currentTime < w.end
    );

    // Position modes
    const isTopBar = position === 'top-bar';
    const isTopRight = position === 'top-right';
    const isSpeechBubble = position === 'speech-bubble';

    // Calculate position based on mode
    const getContainerStyle = () => {
      if (isSpeechBubble) {
        return {
          top: customTop ?? 200,
          left: customLeft ?? 200,
          right: 'auto',
          bottom: 'auto',
          justifyContent: 'flex-start',
          padding: 0,
        };
      }
      if (isTopBar || isTopRight) {
        return {
          top: 60,
          left: isTopBar ? leftOffset : 'auto',
          right: isTopRight ? 40 : 'auto',
          bottom: 'auto',
          justifyContent: 'flex-start',
          padding: 0,
        };
      }
      return {
        top: position === 'top' ? topOffset : 'auto',
        bottom: position === 'bottom' ? bottomOffset : 'auto',
        left: 0,
        right: 0,
        justifyContent: 'center',
        padding: '0 40px',
      };
    };

    const containerStyle = getContainerStyle();

    return (
      <div style={{
        position: 'absolute',
        top: containerStyle.top,
        bottom: containerStyle.bottom,
        left: containerStyle.left,
        right: containerStyle.right,
        display: 'flex',
        justifyContent: containerStyle.justifyContent,
        alignItems: 'center',
        padding: containerStyle.padding,
        zIndex: 100,
        opacity: entranceOpacity,
      }}>
        <div style={{
          backgroundColor: isSpeechBubble ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)',
          padding: (isTopBar || isTopRight || isSpeechBubble) ? '10px 20px' : '14px 28px',
          borderRadius: isSpeechBubble ? 16 : (isTopBar || isTopRight) ? 12 : 16,
          backdropFilter: 'blur(12px)',
          boxShadow: isSpeechBubble
            ? '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255, 215, 0, 0.3)'
            : '0 4px 24px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          maxWidth: (isTopBar || isTopRight || isSpeechBubble) ? 'none' : '85%',
          border: isSpeechBubble ? '2px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: (isTopBar || isTopRight || isSpeechBubble) ? 120 : 'auto',
        }}>
          {displayWords.map((wordData, index) => {
            const isCurrentWord = index === currentWordIndex;
            const wordAge = currentTime - wordData.start;

            // Pop-in animation for new words
            const popProgress = Math.min(1, wordAge * 8); // Fast pop
            const wordScale = isCurrentWord
              ? 1.1
              : 0.85 + (popProgress * 0.15); // 0.85 -> 1.0
            const wordOpacity = 0.4 + (popProgress * 0.6); // Older words fade slightly

            return (
              <span
                key={`${wordData.start}-${index}`}
                style={{
                  fontSize: fontSize,
                  fontWeight: 800,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isCurrentWord ? '#FFD700' : '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  textShadow: isCurrentWord
                    ? '0 0 30px rgba(255, 215, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 1)'
                    : '0 2px 8px rgba(0, 0, 0, 0.9)',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  transform: `scale(${wordScale})`,
                  opacity: isCurrentWord ? 1 : wordOpacity,
                  transformOrigin: 'center center',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {wordData.word.replace(/—/g, ' ').replace(/-/g, ' ')}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== LINE MODE (original behavior) =====
  const lines = groupWordsIntoLines(scaledWords);

  let currentLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineWords = lines[i];
    const lineStart = lineWords[0].start;
    const lineEnd = lineWords[lineWords.length - 1].end;

    if (currentTime >= lineStart && currentTime < lineEnd) {
      currentLineIndex = i;
      break;
    }
  }

  if (currentLineIndex === -1) return null;

  const currentLine = lines[currentLineIndex];

  return (
    <div style={{
      position: 'absolute',
      top: position === 'top' ? topOffset : 'auto',
      bottom: position === 'bottom' ? bottomOffset : 'auto',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 40px',
      zIndex: 100,
      opacity: entranceOpacity,
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: '16px 30px',
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '90%',
      }}>
        {currentLine.map((wordData, index) => {
          const isHighlighted = currentTime >= wordData.start && currentTime < wordData.end;

          return (
            <span
              key={index}
              style={{
                fontSize: fontSize,
                fontWeight: 'bold',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: isHighlighted ? '#FFD700' : '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                textShadow: isHighlighted
                  ? '0 0 20px rgba(255, 215, 0, 0.6), 0 5px 12px rgba(0, 0, 0, 1)'
                  : '0 3px 8px rgba(0, 0, 0, 1)',
                transition: 'none',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: '8px',
                transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center center',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              {wordData.cleanedWord.replace(/—/g, ' ').replace(/-/g, ' ')}
            </span>
          );
        })}
      </div>
    </div>
  );
};
