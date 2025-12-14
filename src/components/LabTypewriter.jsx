import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * LabTypewriter - Types out lab values character by character
 *
 * Each lab value types out at its designated timestamp, creating
 * continuous motion on screen without the boxy look.
 */
export const LabTypewriter = ({
  labValues, // Array of { label, value, status, color, note }
  labTimestamps, // { "Heart rate": 12.666, "Blood pressure": 17.02 }
  playbackRate = 1.9,
  frameOffset = 0,
  charsPerSecond = 30, // Fast typing
  fontSize = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - frameOffset;

  // Cursor blink
  const cursorVisible = Math.floor(adjustedFrame / 12) % 2 === 0;

  // Find which lab is currently typing (the latest one that has started)
  let activeLabIndex = -1;
  let activeLabProgress = 0;

  const labsWithTiming = labValues.map((lab, i) => {
    const timestamp = labTimestamps?.[lab.label] || 0;
    const startFrame = Math.floor((timestamp / playbackRate) * fps);
    const isStarted = adjustedFrame >= startFrame;

    // Full text for this lab: "Heart rate       32 bpm ⚠️ (Normal: 60-100)"
    const statusIcon = lab.status === 'critical' ? ' ⚠️' : lab.status === 'low' ? ' ✅' : ' ↑';
    // Pad label to consistent width for alignment
    const paddedLabel = lab.label.padEnd(18, ' ');
    const fullLine = `${paddedLabel}${lab.value}${statusIcon} ${lab.note || ''}`;

    // Calculate typing progress
    const framesPerChar = fps / charsPerSecond;
    const framesIntoTyping = Math.max(0, adjustedFrame - startFrame);
    const charsTyped = Math.floor(framesIntoTyping / framesPerChar);
    const visibleText = fullLine.slice(0, Math.min(charsTyped, fullLine.length));
    const isComplete = charsTyped >= fullLine.length;

    if (isStarted && !isComplete) {
      activeLabIndex = i;
    }

    return {
      ...lab,
      startFrame,
      isStarted,
      fullLine,
      visibleText,
      isComplete,
      charsTyped,
    };
  });

  // Render each lab value
  return (
    <div style={{
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize,
      lineHeight: 2.2,
      whiteSpace: 'pre', // IMPORTANT: Preserve spaces
    }}>
      {labsWithTiming.map((lab, i) => {
        if (!lab.isStarted) return null;

        // Split visible text into label and value portions for coloring
        // Label is padded to 18 chars
        const labelEndIndex = 18;
        const visibleLabel = lab.visibleText.slice(0, Math.min(lab.visibleText.length, labelEndIndex));
        const visibleRest = lab.visibleText.slice(labelEndIndex);

        // Determine value color based on status
        const valueColor = lab.color || (lab.status === 'critical' ? '#ef4444' : lab.status === 'low' ? '#f59e0b' : '#22c55e');

        // Subtle glow for critical values
        const isCritical = lab.status === 'critical';
        const glowIntensity = isCritical && lab.isComplete ? 4 + Math.sin(frame * 0.15) * 2 : 0;

        return (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
            opacity: 1,
          }}>
            {/* Label portion (purple) */}
            <span style={{ color: '#a78bfa' }}>
              {visibleLabel}
            </span>

            {/* Value + note portion (colored by status) */}
            <span style={{
              color: valueColor,
              fontWeight: 600,
              textShadow: glowIntensity > 0
                ? `0 0 ${glowIntensity}px rgba(239, 68, 68, 0.6)`
                : 'none',
            }}>
              {visibleRest}
            </span>

            {/* Cursor on the active line */}
            {!lab.isComplete && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: fontSize,
                marginLeft: 2,
                background: 'linear-gradient(180deg, #a855f7, #ec4899)',
                borderRadius: 1,
                opacity: cursorVisible ? 1 : 0,
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LabTypewriter;
