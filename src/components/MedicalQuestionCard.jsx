import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from 'remotion';
import { HighlightedVignette } from './HighlightedVignette';

// Sleek SVG Checkmark
const Checkmark = ({ scale = 1 }) => (
  <svg width={28 * scale} height={28 * scale} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke="#22c55e"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Sleek SVG X Mark
const XMark = ({ scale = 1 }) => (
  <svg width={28 * scale} height={28 * scale} viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="#ef4444"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MedicalQuestionCard = ({
  questionData,
  answerRevealTime,
  playbackRate = 1.85,
  frameOffset = 0,
  vignetteHighlights = [], // Array of { phrase: "fever", timestamp: 16.73 }
  highlightSoundVolume = 10.0, // Volume for highlight swipe sounds (MAXIMUM BOOST)
  optionTimestamps = null, // NEW: { A: 30.523, B: 31.196, C: 32.055, D: 32.903, E: 34.273 }
  zoomMode = false, // NEW: Enable zoomed/focused view before options appear
  cursorHoverOption = null, // NEW: Which option the cursor is currently hovering over (A, B, C, D, or E)
  onOptionPositionMeasured = null, // NEW: Callback to report actual option positions to parent
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate answer reveal frame (accounting for meme offset)
  const adjustedFrame = frame - frameOffset;
  const answerRevealFrame = Math.floor((answerRevealTime / playbackRate) * fps);
  const isRevealed = adjustedFrame >= answerRevealFrame;

  // NEW: Calculate option appearance frames if optionTimestamps provided
  const optionFrames = optionTimestamps ? {
    A: Math.floor((optionTimestamps.A / playbackRate) * fps),
    B: Math.floor((optionTimestamps.B / playbackRate) * fps),
    C: Math.floor((optionTimestamps.C / playbackRate) * fps),
    D: Math.floor((optionTimestamps.D / playbackRate) * fps),
    E: Math.floor((optionTimestamps.E / playbackRate) * fps),
  } : null;

  // NEW: Determine if we're in zoom transition
  const firstOptionFrame = optionFrames ? optionFrames.A : 0;
  const lastOptionFrame = optionFrames ? optionFrames.E : 0;
  const zoomTransitionDuration = 20; // 20 frames for smooth zoom out
  const isInZoomTransition = zoomMode && optionFrames && adjustedFrame >= firstOptionFrame && adjustedFrame < firstOptionFrame + zoomTransitionDuration;
  const hasZoomedOut = zoomMode && optionFrames && adjustedFrame >= firstOptionFrame + zoomTransitionDuration;
  const isZoomedIn = zoomMode && optionFrames && adjustedFrame < firstOptionFrame;

  // NEW: No zoom/repositioning - just keep card at normal position
  // Options will fly in when their timestamp hits
  const containerScale = 1.0;
  const containerTopOffset = 450; // Always at normal position

  // Pop-in animation for checkmark/X
  const revealProgress = isRevealed ? Math.min(1, (adjustedFrame - answerRevealFrame) / 8) : 0;
  const iconScale = interpolate(revealProgress, [0, 1], [0.3, 1], { extrapolateRight: 'clamp' });
  const iconOpacity = interpolate(revealProgress, [0, 0.5, 1], [0, 1, 1], { extrapolateRight: 'clamp' });

  // Entrance animation (sync with Dr. Synapse - frames 0-20)
  const entranceOpacity = frame < 20 ? frame / 20 : 1;

  return (
    <div style={{
      position: 'absolute',
      top: containerTopOffset,
      left: 0,
      right: 0,
      bottom: 200,  // Leave room for captions (matches sarcoidosis 80px gap)
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '0 20px',
      opacity: entranceOpacity,
      transform: `scale(${containerScale})`,
      transformOrigin: 'top center',
      transition: 'none', // Remotion handles animation via interpolate
    }}>
      <div style={{
        background: '#0a0a0a',
        padding: '28px 36px',
        borderRadius: 24,
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '1000px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Gradient background overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(219, 39, 119, 0.05), transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h3 style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.5px',
              background: 'linear-gradient(135deg, #9333ea, #db2777, #9333ea)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              🩺 Practice Question #{questionData.card_id}
            </h3>
          </div>

          {/* Vignette with highlights */}
          {vignetteHighlights.length > 0 ? (
            <HighlightedVignette
              text={questionData.vignette}
              highlights={vignetteHighlights}
              playbackRate={playbackRate}
              frameOffset={frameOffset}
              soundVolume={highlightSoundVolume}
            />
          ) : (
            <div style={{
              fontSize: 24,
              lineHeight: 1.8,
              color: '#e5e7eb',
              margin: '24px 0',
              textAlign: 'left',
            }}>
              {questionData.vignette}
            </div>
          )}

          {/* Lab Values */}
          <div style={{
            marginTop: 16,
            padding: 16,
            background: 'rgba(147, 51, 234, 0.05)',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            borderLeft: '3px solid rgba(147, 51, 234, 0.3)',
          }}>
            <div style={{
              fontSize: 18,
              color: '#c084fc',
              fontWeight: 600,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                background: 'linear-gradient(135deg, #9333ea, #db2777)',
                borderRadius: '50%',
              }}></span>
              Clinical Findings
            </div>
            <div style={{
              display: 'grid',
              gap: 10,
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 20,
            }}>
              {questionData.lab_values.map((lab, i) => {
                // Check if this lab value should be highlighted
                const labHighlight = vignetteHighlights.find(h =>
                  lab.value.includes(h.phrase) || h.phrase.includes(lab.value)
                );

                let isHighlighted = false;
                let highlightProgress = 0;
                let framesSinceHighlight = 0;

                if (labHighlight) {
                  const highlightTime = labHighlight.timestamp;
                  const highlightFrame = Math.floor((highlightTime / playbackRate) * fps) + frameOffset;
                  const currentTime = (adjustedFrame / fps) * playbackRate;
                  const timeSinceHighlight = currentTime - highlightTime;

                  if (timeSinceHighlight >= 0) {
                    isHighlighted = true;
                    framesSinceHighlight = adjustedFrame - highlightFrame;
                    const drawDurationFrames = 35; // 1.16 seconds at 30fps (slower)
                    highlightProgress = Math.min(1, framesSinceHighlight / drawDurationFrames);
                  }
                }

                // NEW: DANGER PULSE for critical values - pulse the VALUE text only (SUBTLE)
                const isCritical = lab.status === 'critical';
                const isElevated = lab.status === 'elevated';
                let valuePulseScale = 1;
                let valueGlowIntensity = 0;

                if (isCritical && isHighlighted) {
                  // CRITICAL: Very subtle pulse between 1.0 and 1.03
                  valuePulseScale = 1 + Math.sin(frame * 0.2) * 0.015;
                  // Subtle pulsing text shadow
                  valueGlowIntensity = 4 + Math.sin(frame * 0.2) * 2; // 2-6px range
                } else if (isElevated && isHighlighted) {
                  // ELEVATED: Even more subtle
                  valuePulseScale = 1 + Math.sin(frame * 0.2) * 0.01;
                  valueGlowIntensity = 2 + Math.sin(frame * 0.2) * 1; // 1-3px range
                }

                const borderOpacity = isHighlighted ? interpolate(highlightProgress, [0, 1], [0, 1]) : 0;
                const boxScale = isHighlighted
                  ? interpolate(highlightProgress, [0, 0.5, 1], [1, 1.05, 1])
                  : 1; // Box does NOT pulse continuously

                // Animated border drawing - 4 sides draw in sequence
                const borderColor = `rgba(251, 191, 36, ${borderOpacity})`;
                const sideDuration = 0.25; // Each side takes 0.25 of total animation

                // Top border (0-25%)
                const topProgress = Math.min(1, Math.max(0, (highlightProgress - 0) / sideDuration));
                // Right border (25-50%)
                const rightProgress = Math.min(1, Math.max(0, (highlightProgress - 0.25) / sideDuration));
                // Bottom border (50-75%)
                const bottomProgress = Math.min(1, Math.max(0, (highlightProgress - 0.5) / sideDuration));
                // Left border (75-100%)
                const leftProgress = Math.min(1, Math.max(0, (highlightProgress - 0.75) / sideDuration));

                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: isHighlighted ? 8 : 0,
                    borderRadius: 8,
                    border: '3px solid transparent',
                    boxShadow: isHighlighted
                      ? `0 0 20px rgba(251, 191, 36, ${borderOpacity * 0.4})`
                      : 'none',
                    transform: `scale(${boxScale})`,
                    transition: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Animated borders - each side draws in sequence */}
                    {isHighlighted && topProgress > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${topProgress * 100}%`,
                        height: 3,
                        background: borderColor,
                        boxShadow: `0 0 8px ${borderColor}`,
                      }} />
                    )}
                    {isHighlighted && rightProgress > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 3,
                        height: `${rightProgress * 100}%`,
                        background: borderColor,
                        boxShadow: `0 0 8px ${borderColor}`,
                      }} />
                    )}
                    {isHighlighted && bottomProgress > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: `${bottomProgress * 100}%`,
                        height: 3,
                        background: borderColor,
                        boxShadow: `0 0 8px ${borderColor}`,
                      }} />
                    )}
                    {isHighlighted && leftProgress > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: 3,
                        height: `${leftProgress * 100}%`,
                        background: borderColor,
                        boxShadow: `0 0 8px ${borderColor}`,
                      }} />
                    )}

                    <span style={{
                      color: '#a78bfa',
                      minWidth: 180,
                    }}>
                      {lab.label}
                    </span>
                    <span style={{
                      color: lab.color,
                      fontWeight: 600,
                      transform: `scale(${valuePulseScale})`,
                      display: 'inline-block',
                      textShadow: (isCritical || isElevated) && isHighlighted && valueGlowIntensity > 0
                        ? `0 0 ${valueGlowIntensity}px rgba(239, 68, 68, ${isCritical ? 0.6 : 0.4})`
                        : 'none',
                      transition: 'none',
                    }}>
                      {lab.value}
                    </span>
                    {lab.note && (
                      <span style={{
                        color: lab.status === 'critical' ? '#fca5a5' : '#fbbf24',
                        fontSize: 17,
                      }}>
                        {lab.status === 'critical' ? '⚠️' : lab.status === 'elevated' ? '↑' : '✅'} {lab.note}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question */}
          <div style={{
            background: 'linear-gradient(135deg, #9333ea, #db2777)',
            padding: 22,
            borderRadius: 12,
            margin: '24px 0',
            boxShadow: '0 10px 40px rgba(147, 51, 234, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              ❓ {questionData.question_text}
            </div>
          </div>

          {/* Options with Checkmark/X */}
          <div style={{
            color: '#e5e7eb',
            fontSize: 22,
            lineHeight: 1.8,
            paddingLeft: 0, // Align with question box
          }}>
            {questionData.options.map((option, i) => {
              const isCorrect = option.is_correct;
              const isCursorHovering = cursorHoverOption === option.letter; // NEW: Audio-synced highlight

              // Pulsing scale animation when highlighted (audio-synced)
              const pulseScale = isCursorHovering && !isRevealed
                ? 1 + Math.sin(adjustedFrame * 0.3) * 0.03 // Pulse between 1.0 and 1.06
                : 1;

              // NEW: Option fly-in animation logic
              const optionFrame = optionFrames ? optionFrames[option.letter] : 0;
              const isOptionVisible = !optionFrames || adjustedFrame >= optionFrame;
              const flyInDuration = 10; // 10 frames for fly-in animation
              const framesIntoFlyIn = optionFrames ? Math.max(0, Math.min(flyInDuration, adjustedFrame - optionFrame)) : flyInDuration;
              const flyInProgress = optionFrames ? framesIntoFlyIn / flyInDuration : 1;

              // Fly-in: slide from right + scale pop
              const translateX = optionFrames ? interpolate(flyInProgress, [0, 1], [100, 0]) : 0;
              const flyInScale = optionFrames ? interpolate(flyInProgress, [0, 0.5, 1], [0.8, 1.05, 1.0]) : 1;
              const flyInOpacity = optionFrames ? interpolate(flyInProgress, [0, 0.3, 1], [0, 1, 1]) : 1;

              // Strikethrough animation for wrong answers (12 frames)
              const strikethroughDuration = 12;
              const strikeProgress = isRevealed && !isCorrect
                ? Math.min(1, (adjustedFrame - answerRevealFrame) / strikethroughDuration)
                : 0;

              // Don't render option until it's time to fly in
              if (!isOptionVisible) return null;

              return (
                <div
                  key={i}
                  data-option={option.letter}
                  style={{
                    position: 'relative',
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 10,
                    background: isRevealed && isCorrect
                      ? 'rgba(34, 197, 94, 0.15)'
                      : isCursorHovering && !isRevealed
                        ? 'rgba(147, 51, 234, 0.35)' // AUDIO-SYNC HIGHLIGHT - brighter purple
                        : 'rgba(147, 51, 234, 0.05)',
                    borderLeft: isRevealed && isCorrect
                      ? '3px solid #22c55e'
                      : isCursorHovering && !isRevealed
                        ? '4px solid #c084fc' // AUDIO-SYNC HIGHLIGHT - thicker, brighter border
                        : '3px solid transparent',
                    boxShadow: 'none',
                    transition: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transform: `translateX(${translateX}%) scale(${(isCursorHovering && !isRevealed ? flyInScale * 1.08 : flyInScale) * pulseScale})`, // AUDIO-SYNC HIGHLIGHT - bigger scale + pulse
                    opacity: flyInOpacity,
                  }}
                >
                    {optionFrames && adjustedFrame === optionFrame && (
                      <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={0.5} />
                    )}

                    {/* Option text */}
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <span>
                        <strong style={{
                          color: isRevealed && isCorrect ? '#22c55e' : '#c084fc',
                        }}>
                          {option.letter}.
                        </strong>{' '}
                        <span style={{
                          color: isRevealed && isCorrect ? '#22c55e' : '#e5e7eb',
                          fontWeight: isRevealed && isCorrect ? 600 : 400,
                          opacity: isRevealed && !isCorrect ? 0.5 : 1,
                        }}>
                          {option.text}
                        </span>
                      </span>

                      {/* Strikethrough line for wrong answers */}
                      {isRevealed && !isCorrect && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          height: 3,
                          backgroundColor: '#ef4444',
                          width: `${strikeProgress * 100}%`,
                          transformOrigin: 'left',
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                        }} />
                      )}
                    </div>

                    {/* Checkmark or X indicator - RIGHT side after text */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: iconOpacity,
                      transform: `scale(${iconScale})`,
                      marginLeft: 4,
                    }}>
                      {isRevealed && (
                        isCorrect ? <Checkmark scale={1.1} /> : <XMark scale={1.1} />
                      )}
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
