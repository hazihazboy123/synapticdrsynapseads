import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';

/**
 * ThinkingCursor - Simulates a user considering options, then clicking the correct answer
 *
 * PERFECT POSITIONING VERSION:
 * - Uses MEASURED positions from MedicalQuestionCard (not calculated)
 * - Timestamp-based movement (cursor arrives exactly when narrator says option)
 * - Instant highlight synchronization
 * - Works with ANY vignette length, ANY card layout
 */
export const ThinkingCursor = ({
  questionStartFrame,
  answerRevealFrame,
  optionPositions, // MEASURED positions: { A: {x, y}, B: {x, y}, ... }
  optionTimestamps = {}, // When each option appears in audio
  correctAnswer = 'D',
  playbackRate = 1.85,
  onHoverChange, // Callback to notify parent which option is being hovered
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate visibility first (before any early returns to avoid hook issues)
  const clickAnimationDuration = 15; // frames for click animation
  const isVisible = frame >= questionStartFrame && frame <= answerRevealFrame + clickAnimationDuration;

  // ===== TIMESTAMP-BASED MOVEMENT (FRAME-PERFECT) =====
  // Cursor moves to each option EXACTLY when narrator says it
  // No progress-based guessing - pure timestamp synchronization

  // Convert option timestamps to frames
  const optionFrames = {};
  ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    if (optionTimestamps[letter]) {
      optionFrames[letter] = Math.floor((optionTimestamps[letter] / playbackRate) * fps);
    }
  });

  // Check if positions are ready
  const hasPositions = optionPositions && Object.keys(optionPositions).length > 0;

  // Determine which option cursor should target RIGHT NOW
  let targetOption = null;
  let previousOption = null;
  let isClicking = false;
  let transitionStartFrame = 0;

  const letters = ['A', 'B', 'C', 'D', 'E'];

  if (hasPositions && isVisible) {
    // Find current target based on timestamps
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const optionFrame = optionFrames[letter];
      const nextOptionFrame = optionFrames[letters[i + 1]] || answerRevealFrame;

      if (optionFrame && frame >= optionFrame && frame < nextOptionFrame) {
        targetOption = letter;
        previousOption = i > 0 ? letters[i - 1] : null;
        transitionStartFrame = optionFrame;
        break;
      }
    }

    // At answer reveal, jump to correct answer
    if (frame >= answerRevealFrame) {
      const lastOption = letters[letters.length - 1];
      previousOption = optionFrames[lastOption] ? lastOption : targetOption;
      targetOption = correctAnswer;
      transitionStartFrame = answerRevealFrame;
      isClicking = true;
    }
  }

  // ===== SMOOTH MOVEMENT CALCULATION =====
  let cursorX = 0;
  let cursorY = 0;

  if (targetOption && optionPositions[targetOption]) {
    const targetPos = optionPositions[targetOption];
    const transitionDuration = Math.floor(0.25 * fps); // 0.25 second smooth transition
    const framesSinceTransitionStart = frame - transitionStartFrame;

    // Check if we're in transition to new option
    if (previousOption && previousOption !== targetOption &&
        optionPositions[previousOption] && framesSinceTransitionStart < transitionDuration) {

      // TRANSITIONING - smooth bezier curve from previous to current
      const startPos = optionPositions[previousOption];
      const endPos = targetPos;
      const progress = framesSinceTransitionStart / transitionDuration;
      const easedProgress = Easing.out(Easing.ease)(progress);

      // Bezier curve with slight arc for natural movement
      const midX = (startPos.x + endPos.x) / 2;
      const midY = (startPos.y + endPos.y) / 2 - 8; // Arc upward slightly

      // Quadratic bezier interpolation
      cursorX = Math.pow(1 - easedProgress, 2) * startPos.x +
                2 * (1 - easedProgress) * easedProgress * midX +
                Math.pow(easedProgress, 2) * endPos.x;

      cursorY = Math.pow(1 - easedProgress, 2) * startPos.y +
                2 * (1 - easedProgress) * easedProgress * midY +
                Math.pow(easedProgress, 2) * endPos.y;

    } else {
      // HOVERING - stay on target with subtle wobble (realistic hand movement)
      const wobbleX = isClicking ? 0 : Math.sin(frame * 0.12) * 0.8;
      const wobbleY = isClicking ? 0 : Math.cos(frame * 0.15) * 0.6;

      cursorX = targetPos.x + wobbleX;
      cursorY = targetPos.y + wobbleY;
    }
  }

  // ===== CLICK ANIMATION =====
  let clickScale = 1;
  let rippleOpacity = 0;
  let rippleScale = 1;

  if (isClicking) {
    const clickFrame = frame - answerRevealFrame;

    // Cursor shrinks then bounces back
    clickScale = interpolate(
      clickFrame,
      [0, 4, 8],
      [1, 0.7, 1],
      { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
    );

    // Ripple expands and fades
    rippleScale = interpolate(
      clickFrame,
      [0, 15],
      [1, 2.5],
      { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }
    );

    rippleOpacity = interpolate(
      clickFrame,
      [0, 5, 15],
      [0, 0.6, 0],
      { extrapolateRight: 'clamp' }
    );
  }

  // ===== HOVER GLOW =====
  // Always show hover glow when not clicking
  const hoverGlow = !isClicking ? 0.3 : 0;

  // Don't render if not visible or no target
  if (!isVisible || !targetOption || !hasPositions) {
    return null;
  }

  return (
    <>
      {/* Click ripple effect */}
      {isClicking && (
        <div style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          borderRadius: '50%',
          border: '3px solid #9333ea',
          transform: `scale(${rippleScale})`,
          opacity: rippleOpacity,
          pointerEvents: 'none',
          zIndex: 100,
        }} />
      )}

      {/* Cursor */}
      <div style={{
        position: 'absolute',
        left: cursorX,
        top: cursorY,
        width: 32,
        height: 32,
        marginLeft: -16,
        marginTop: -16,
        transform: `scale(${clickScale})`,
        pointerEvents: 'none',
        zIndex: 101,
        filter: hoverGlow > 0 ? `drop-shadow(0 0 12px rgba(147, 51, 234, ${hoverGlow}))` : 'none',
      }}>
        {/* Cursor SVG - realistic mouse pointer */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          {/* Shadow */}
          <path
            d="M5 3L5 17L9 13L12 19L14.5 18L11.5 12L17 12L5 3Z"
            fill="rgba(0, 0, 0, 0.3)"
            transform="translate(1, 1)"
          />
          {/* Main cursor */}
          <path
            d="M5 3L5 17L9 13L12 19L14.5 18L11.5 12L17 12L5 3Z"
            fill="white"
            stroke="#000"
            strokeWidth="0.5"
          />
        </svg>

        {/* Hover glow circle */}
        {hoverGlow > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 60,
            height: 60,
            marginLeft: -30,
            marginTop: -30,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(147, 51, 234, ${hoverGlow * 0.4}), transparent 70%)`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        )}
      </div>
    </>
  );
};

/**
 * Helper function: Get which option cursor is currently hovering
 * Use this in parent component to sync highlights with cursor position
 *
 * @param {number} frame - Current frame
 * @param {number} fps - Frames per second
 * @param {number} playbackRate - Audio playback rate
 * @param {object} optionTimestamps - { A: 30.5, B: 31.2, ... }
 * @param {number} answerRevealTimeRaw - When answer is revealed (raw seconds)
 * @param {string} correctAnswer - Correct answer letter
 * @returns {string|null} - Currently hovered option letter or null
 */
export const getCursorHoverOption = (frame, fps, playbackRate, optionTimestamps, answerRevealTimeRaw, correctAnswer) => {
  const currentTime = (frame / fps) * playbackRate;

  // At reveal time, return correct answer
  if (currentTime >= answerRevealTimeRaw) {
    return correctAnswer;
  }

  // Find which option should be hovered based on timestamp
  const letters = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const timestamp = optionTimestamps[letter];
    const nextTimestamp = optionTimestamps[letters[i + 1]] || answerRevealTimeRaw;

    if (currentTime >= timestamp && currentTime < nextTimestamp) {
      return letter;
    }
  }

  return null;
};

export default ThinkingCursor;
