import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

/**
 * ContinuousTypewriter - Pure continuous character-by-character typing
 *
 * NO separate segments, NO different effects - just types the full text
 * character by character as one continuous stream.
 *
 * Props:
 * - fullText: The complete text to type out
 * - startTimestamp: When typing begins (raw audio seconds)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - charsPerSecond: Typing speed (default: 25 chars/sec = fast TikTok pace)
 * - fontSize: Text size
 * - highlightPhrases: Optional array of { phrase, color } to style certain words
 */
export const ContinuousTypewriter = ({
  fullText,
  startTimestamp = 0,
  playbackRate = 1.9,
  frameOffset = 0,
  charsPerSecond = 25, // Fast typing for engagement
  fontSize = 24,
  highlightPhrases = [], // e.g., [{ phrase: "propranolol overdose", color: "#ef4444", bold: true }]
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - frameOffset;
  const startFrame = Math.floor((startTimestamp / playbackRate) * fps);

  // Not started yet
  if (adjustedFrame < startFrame) {
    return (
      <div style={{
        fontSize,
        lineHeight: 1.8,
        color: '#e5e7eb',
        margin: '24px 0',
        textAlign: 'left',
        minHeight: fontSize * 3, // Reserve space
      }}>
        {/* Blinking cursor waiting to start */}
        <span style={{
          display: 'inline-block',
          width: 2,
          height: fontSize - 4,
          background: 'linear-gradient(180deg, #a855f7, #ec4899)',
          borderRadius: 1,
          opacity: Math.floor(adjustedFrame / 15) % 2 === 0 ? 1 : 0,
          boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
        }} />
      </div>
    );
  }

  // Calculate how many characters to show
  const framesPerChar = fps / charsPerSecond;
  const framesIntoTyping = adjustedFrame - startFrame;
  const charsToShow = Math.floor(framesIntoTyping / framesPerChar);
  const visibleText = fullText.slice(0, Math.min(charsToShow, fullText.length));
  const isComplete = charsToShow >= fullText.length;

  // Cursor blink
  const cursorVisible = Math.floor(adjustedFrame / 15) % 2 === 0;

  // Render text with optional highlights - colors apply AS text types (not after)
  const renderTextWithHighlights = (text) => {
    if (highlightPhrases.length === 0) {
      return text;
    }

    // Build a character-by-character style map based on where highlights WILL be in the full text
    // This ensures characters are colored from the moment they appear
    const styleMap = new Array(fullText.length).fill(null);

    for (const hp of highlightPhrases) {
      const lowerFull = fullText.toLowerCase();
      const lowerPhrase = hp.phrase.toLowerCase();
      let searchStart = 0;

      // Find all occurrences of this phrase in the full text
      while (true) {
        const index = lowerFull.indexOf(lowerPhrase, searchStart);
        if (index === -1) break;

        // Mark these character positions with this highlight style
        for (let i = index; i < index + hp.phrase.length; i++) {
          styleMap[i] = hp;
        }
        searchStart = index + 1;
      }
    }

    // Now render only the visible portion, but with pre-computed styles
    let result = [];
    let key = 0;
    let i = 0;

    while (i < text.length) {
      const currentStyle = styleMap[i];

      // Find the run of characters with the same style
      let runEnd = i + 1;
      while (runEnd < text.length && styleMap[runEnd] === currentStyle) {
        runEnd++;
      }

      const chunk = text.slice(i, runEnd);

      if (currentStyle) {
        result.push(
          <span
            key={key++}
            style={{
              color: currentStyle.color || '#fbbf24',
              fontWeight: currentStyle.bold ? 600 : 400,
              textDecoration: currentStyle.underline ? 'underline' : 'none',
              textDecorationColor: currentStyle.color || '#fbbf24',
            }}
          >
            {chunk}
          </span>
        );
      } else {
        result.push(<span key={key++}>{chunk}</span>);
      }

      i = runEnd;
    }

    return result;
  };

  return (
    <div style={{
      fontSize,
      lineHeight: 1.8,
      color: '#e5e7eb',
      margin: '24px 0',
      textAlign: 'left',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {renderTextWithHighlights(visibleText)}

      {/* Blinking cursor */}
      {!isComplete && (
        <span style={{
          display: 'inline-block',
          width: 2,
          height: fontSize - 4,
          marginLeft: 2,
          verticalAlign: 'middle',
          background: 'linear-gradient(180deg, #a855f7, #ec4899)',
          borderRadius: 1,
          opacity: cursorVisible ? 1 : 0,
          boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
        }} />
      )}
    </div>
  );
};

export default ContinuousTypewriter;
