import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const HighlightedText = ({ words, style, goldColor = '#FFD700', defaultColor = '#FFFFFF' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Current time in seconds
  const currentTime = frame / fps;

  return (
    <div style={style}>
      {words.map((wordData, index) => {
        // Check if this word should be highlighted
        const isHighlighted = currentTime >= wordData.start && currentTime < wordData.end;

        return (
          <span
            key={index}
            style={{
              color: isHighlighted ? goldColor : defaultColor,
              transition: 'color 0.1s ease',
              fontWeight: isHighlighted ? '700' : '400',
              textShadow: isHighlighted
                ? `0 0 20px ${goldColor}, 0 0 30px ${goldColor}`
                : 'none',
            }}
          >
            {wordData.word}
          </span>
        );
      })}
    </div>
  );
};
