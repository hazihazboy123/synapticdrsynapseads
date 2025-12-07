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

export const TikTokCaptions = ({ words, playbackRate = 1.75, bottomOffset = 350, frameOffset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Apply frame offset to account for meme pauses - subtract offset to get "audio time"
  const adjustedFrame = frame - frameOffset;
  const currentTime = adjustedFrame / fps;

  // Entrance animation (sync with Dr. Synapse entrance - frames 0-20)
  const entranceOpacity = frame < 20 ? frame / 20 : 1;

  // Scale timestamps for playback speed (divide original timestamps by playback rate)
  const scaledWords = words.map(w => ({
    ...w,
    start: w.start / playbackRate,
    end: w.end / playbackRate
  }));

  // Group words into lines
  const lines = groupWordsIntoLines(scaledWords);

  // Find which line should be displayed based on current time
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
      bottom: bottomOffset,  // Configurable position
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 40px',
      zIndex: 100,
      opacity: entranceOpacity,  // Fade in with Dr. Synapse
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: '16px 30px',  // Slightly smaller padding
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
          // Use exact ElevenLabs timestamps
          const isHighlighted = currentTime >= wordData.start && currentTime < wordData.end;

          return (
            <span
              key={index}
              style={{
                fontSize: 44,
                fontWeight: 'bold',
                fontFamily: 'Helvetica, Arial, sans-serif',  // Clean, classic font
                color: isHighlighted ? '#FFD700' : '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                textShadow: isHighlighted
                  ? '0 0 20px rgba(255, 215, 0, 0.6), 0 5px 12px rgba(0, 0, 0, 1)' // ENHANCED: Stronger shadow when highlighted
                  : '0 3px 8px rgba(0, 0, 0, 1)',
                transition: 'none', // NO transition - instant, clean cuts
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: '8px',
                transform: isHighlighted ? 'scale(1.05)' : 'scale(1)', // NEW: Scale up current word (reduced from 1.12 to 1.05)
                transformOrigin: 'center center',
                // Font rendering optimizations for crisp text
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
