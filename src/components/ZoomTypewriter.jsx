import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

/**
 * ZoomTypewriter - Cinematic word-by-word zoom effect
 *
 * Each word FILLS THE SCREEN as it appears, then camera pulls back
 * to reveal the full sentence. Movie-style kinetic typography.
 */
export const ZoomTypewriter = ({
  fullText,
  startTimestamp = 0,
  playbackRate = 1.9,
  frameOffset = 0,
  wordsPerSecond = 2.5, // How fast words appear
  highlightPhrases = [],
  zoomOutDelay = 10, // Frames to hold on last word before zoom out
  zoomOutDuration = 25, // Frames for the zoom out animation
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const adjustedFrame = frame - frameOffset;
  const startFrame = Math.floor((startTimestamp / playbackRate) * fps);

  // Split text into words
  const words = fullText.split(/\s+/);
  const framesPerWord = Math.floor(fps / wordsPerSecond);

  // Calculate which word we're on
  const framesIntoTyping = Math.max(0, adjustedFrame - startFrame);
  const currentWordIndex = Math.floor(framesIntoTyping / framesPerWord);
  const isComplete = currentWordIndex >= words.length;

  // Zoom out phase
  const zoomOutStartFrame = startFrame + (words.length * framesPerWord) + zoomOutDelay;
  const isZoomingOut = adjustedFrame >= zoomOutStartFrame;
  const zoomOutProgress = isZoomingOut
    ? Math.min(1, (adjustedFrame - zoomOutStartFrame) / zoomOutDuration)
    : 0;

  // Build style map for highlights (same logic as ContinuousTypewriter)
  const getWordStyle = (word, wordIndex) => {
    // Calculate character position of this word in full text
    let charPos = 0;
    for (let i = 0; i < wordIndex; i++) {
      charPos += words[i].length + 1; // +1 for space
    }

    for (const hp of highlightPhrases) {
      const phraseStart = fullText.toLowerCase().indexOf(hp.phrase.toLowerCase());
      if (phraseStart !== -1) {
        const phraseEnd = phraseStart + hp.phrase.length;
        // Check if this word overlaps with the phrase
        if (charPos < phraseEnd && charPos + word.length > phraseStart) {
          return {
            color: hp.color || '#fbbf24',
            fontWeight: hp.bold ? 800 : 600,
          };
        }
      }
    }
    return { color: '#ffffff', fontWeight: 600 };
  };

  // Not started yet - show blinking cursor
  if (adjustedFrame < startFrame) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
      }}>
        <span style={{
          width: 4,
          height: 80,
          background: 'linear-gradient(180deg, #a855f7, #ec4899)',
          borderRadius: 2,
          opacity: Math.floor(adjustedFrame / 15) % 2 === 0 ? 1 : 0,
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)',
        }} />
      </div>
    );
  }

  // During word-by-word zoom phase
  if (!isZoomingOut && currentWordIndex < words.length) {
    const currentWord = words[currentWordIndex];
    const wordStyle = getWordStyle(currentWord, currentWordIndex);

    // Progress within current word (for entrance animation)
    const wordProgress = (framesIntoTyping % framesPerWord) / framesPerWord;

    // Scale animation: pop in from 0.5 -> 1.1 -> 1.0
    const scale = interpolate(
      wordProgress,
      [0, 0.3, 0.5, 1],
      [0.5, 1.15, 1.0, 1.0],
      { extrapolateRight: 'clamp' }
    );

    // Opacity: fade in quickly
    const opacity = interpolate(
      wordProgress,
      [0, 0.2],
      [0, 1],
      { extrapolateRight: 'clamp' }
    );

    // Slight blur at start
    const blur = interpolate(
      wordProgress,
      [0, 0.3],
      [8, 0],
      { extrapolateRight: 'clamp' }
    );

    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: Math.min(200, width / (currentWord.length * 0.6)),
          fontWeight: wordStyle.fontWeight,
          color: wordStyle.color,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transform: `scale(${scale})`,
          opacity,
          filter: `blur(${blur}px)`,
          textShadow: `0 0 60px ${wordStyle.color}40, 0 0 120px ${wordStyle.color}20`,
        }}>
          {currentWord}
        </div>

        {/* Word counter */}
        <div style={{
          position: 'absolute',
          bottom: 100,
          right: 60,
          fontSize: 24,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
        }}>
          {currentWordIndex + 1} / {words.length}
        </div>
      </div>
    );
  }

  // Zoom out phase - reveal full text
  const finalScale = interpolate(
    zoomOutProgress,
    [0, 1],
    [3, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const finalOpacity = interpolate(
    zoomOutProgress,
    [0, 0.3, 1],
    [0, 1, 1],
    { extrapolateRight: 'clamp' }
  );

  // Render full text with highlights
  const renderFullText = () => {
    return words.map((word, idx) => {
      const style = getWordStyle(word, idx);
      return (
        <span key={idx}>
          <span style={{
            color: style.color,
            fontWeight: style.fontWeight,
          }}>
            {word}
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      overflow: 'hidden',
    }}>
      <div style={{
        fontSize: 28,
        lineHeight: 1.8,
        color: '#e5e7eb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        maxWidth: '85%',
        padding: '0 40px',
        transform: `scale(${finalScale})`,
        opacity: finalOpacity,
      }}>
        {renderFullText()}
      </div>
    </div>
  );
};

export default ZoomTypewriter;
