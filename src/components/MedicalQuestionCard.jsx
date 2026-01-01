import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from 'remotion';
import { HighlightedVignette } from './HighlightedVignette';
import { TypewriterVignette } from './TypewriterVignette';
import { ContinuousTypewriter } from './ContinuousTypewriter';
import { LabTypewriter } from './LabTypewriter';

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
  vignetteSegments = null, // Array of { text, timestamp, effect?, isCritical? } for typewriter mode
  highlightSoundVolume = 10.0, // Volume for highlight swipe sounds (MAXIMUM BOOST)
  optionTimestamps = null, // { A: 30.523, B: 31.196, C: 32.055, D: 32.903, E: 34.273 }
  zoomMode = false, // Enable zoomed/focused view before options appear
  cursorHoverOption = null, // Which option the cursor is currently hovering over (A, B, C, D, or E)
  onOptionPositionMeasured = null, // Callback to report actual option positions to parent
  // Progressive reveal timestamps (raw audio seconds)
  labTimestamps = null, // { "Glucose": 25.878, "pH": 28.758, "Ketones": 34.435 }
  questionTimestamp = null, // When the question box appears
  clinicalFindingsTimestamp = null, // When Clinical Findings header appears
  // NEW: Continuous typewriter mode
  fullVignetteText = null, // Full text for continuous typewriter
  vignetteStartTimestamp = 1.0, // When to start typing vignette
  highlightPhrases = [], // { phrase, color, bold, underline } for styling while typing
  // Layout customization
  cardTopOffset = 450, // Top position of the card container
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
  const containerTopOffset = cardTopOffset; // Use prop for positioning

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
      left: '50%',
      transform: `translateX(-50%) scale(${containerScale})`,
      transformOrigin: 'top center',
      padding: '0 20px',
      opacity: entranceOpacity,
      // No flex - just absolute positioning
    }}>
      <div style={{
        background: '#0a0a0a',
        padding: '28px 32px',
        borderRadius: 22,
        position: 'relative',
        overflow: 'visible',
        width: 820,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        // No height constraint - pure content sizing
      }}>
        {/* Gradient background overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(219, 39, 119, 0.05), transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'block' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {/* Question title centered */}
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
              textAlign: 'center',
              flex: 1,
            }}>
              🩺 Practice Question #{questionData.card_id}
            </h3>
            {/* Spacer for balance */}
            <div style={{ width: '150px' }}></div>
          </div>

          {/* Vignette with highlights or typewriter */}
          {fullVignetteText ? (
            <ContinuousTypewriter
              fullText={fullVignetteText}
              startTimestamp={vignetteStartTimestamp}
              playbackRate={playbackRate}
              frameOffset={frameOffset}
              highlightPhrases={highlightPhrases}
              charsPerSecond={20}
              fontSize={28}
            />
          ) : vignetteSegments ? (
            <TypewriterVignette
              segments={vignetteSegments}
              playbackRate={playbackRate}
              frameOffset={frameOffset}
            />
          ) : vignetteHighlights.length > 0 ? (
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

          {/* Lab Values - Typewriter Style */}
          {(() => {
            // Calculate if Clinical Findings section should be visible
            const cfTimestamp = clinicalFindingsTimestamp || (labTimestamps ? Math.min(...Object.values(labTimestamps)) - 1 : 0);
            const cfAppearFrame = Math.floor((cfTimestamp / playbackRate) * fps);
            // Fix: Only show when frame is reached
            const showClinicalFindings = adjustedFrame >= cfAppearFrame;

            if (!showClinicalFindings) return null;

            // Entrance animation for Clinical Findings header
            const cfFramesVisible = adjustedFrame - cfAppearFrame;
            const cfOpacity = interpolate(cfFramesVisible, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

            return (
              <div style={{
                marginTop: 16,
                padding: '12px 0',
                opacity: cfOpacity,
              }}>
                <div style={{
                  fontSize: 22,
                  color: '#c084fc',
                  fontWeight: 600,
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: 'linear-gradient(135deg, #9333ea, #db2777)',
                    borderRadius: '50%',
                  }}></span>
                  Clinical Findings
                </div>
                <LabTypewriter
                  labValues={questionData.lab_values}
                  labTimestamps={labTimestamps}
                  playbackRate={playbackRate}
                  frameOffset={frameOffset}
                  charsPerSecond={35}
                  fontSize={24}
                />
              </div>
            );
          })()}

          {/* Question - Progressive Reveal */}
          {(() => {
            const qTimestamp = questionTimestamp || (optionTimestamps ? optionTimestamps.A - 3 : 0);
            const qAppearFrame = Math.floor((qTimestamp / playbackRate) * fps);
            // Fix: Only show question when frame is reached (not always true when timestamp is undefined)
            const showQuestion = adjustedFrame >= qAppearFrame;

            if (!showQuestion) return null;

            const qFramesVisible = adjustedFrame - qAppearFrame;
            const qOpacity = interpolate(qFramesVisible, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
            const qScale = interpolate(qFramesVisible, [0, 12], [0.9, 1], { extrapolateRight: 'clamp' });

            return (
          <div style={{
            background: 'linear-gradient(135deg, #9333ea, #db2777)',
            padding: 26,
            borderRadius: 14,
            opacity: qOpacity,
            transform: `scale(${qScale})`,
            margin: '28px 0',
            boxShadow: '0 10px 40px rgba(147, 51, 234, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{
              color: 'white',
              fontSize: 28,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              ❓ {questionData.question_text}
            </div>
          </div>
            );
          })()}

          {/* Options with Typewriter Effect - only render container when first option is visible */}
          {(() => {
            const firstOptionFrame = optionFrames ? optionFrames.A : 0;
            const anyOptionVisible = !optionFrames || adjustedFrame >= firstOptionFrame;
            if (!anyOptionVisible) return null;

            return (
          <div style={{
            color: '#e5e7eb',
            fontSize: 26,
            lineHeight: 1.9,
            paddingLeft: 0,
          }}>
            {questionData.options.map((option, i) => {
              const isCorrect = option.is_correct;
              const isCursorHovering = cursorHoverOption === option.letter;

              // Pulsing scale animation when highlighted
              const pulseScale = isCursorHovering && !isRevealed
                ? 1 + Math.sin(adjustedFrame * 0.3) * 0.03
                : 1;

              // Option timing
              const optionFrame = optionFrames ? optionFrames[option.letter] : 0;
              const isOptionVisible = !optionFrames || adjustedFrame >= optionFrame;
              const framesIntoOption = optionFrames ? Math.max(0, adjustedFrame - optionFrame) : 999;

              // Typewriter settings
              const charsPerSecond = 40; // Fast typing
              const framesPerChar = fps / charsPerSecond;

              // Letter "A." pops in first (5 frames), then text types
              const letterPopDuration = 5;
              const letterProgress = Math.min(1, framesIntoOption / letterPopDuration);
              const letterScale = interpolate(letterProgress, [0, 0.5, 1], [0.5, 1.15, 1.0], { extrapolateRight: 'clamp' });
              const letterOpacity = interpolate(letterProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

              // Text starts typing after letter pops in
              const textStartFrame = letterPopDuration;
              const framesIntoTyping = Math.max(0, framesIntoOption - textStartFrame);
              const charsToShow = Math.floor(framesIntoTyping / framesPerChar);
              const visibleText = option.text.slice(0, Math.min(charsToShow, option.text.length));
              const isTypingComplete = charsToShow >= option.text.length;

              // Cursor blink (only while typing)
              const cursorVisible = !isTypingComplete && Math.floor(adjustedFrame / 8) % 2 === 0;

              // Strikethrough animation for wrong answers
              const strikethroughDuration = 12;
              const strikeProgress = isRevealed && !isCorrect
                ? Math.min(1, (adjustedFrame - answerRevealFrame) / strikethroughDuration)
                : 0;

              // Don't render until timestamp
              if (!isOptionVisible) return null;

              return (
                <div
                  key={i}
                  data-option={option.letter}
                  style={{
                    position: 'relative',
                    padding: '14px 18px',
                    borderRadius: 10,
                    marginBottom: 10,
                    background: isRevealed && isCorrect
                      ? 'rgba(34, 197, 94, 0.15)'
                      : isCursorHovering && !isRevealed
                        ? 'rgba(147, 51, 234, 0.35)'
                        : 'rgba(147, 51, 234, 0.05)',
                    borderLeft: isRevealed && isCorrect
                      ? '3px solid #22c55e'
                      : isCursorHovering && !isRevealed
                        ? '4px solid #c084fc'
                        : '3px solid transparent',
                    boxShadow: 'none',
                    transition: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transform: `scale(${(isCursorHovering && !isRevealed ? 1.08 : 1) * pulseScale})`,
                    minHeight: 48,
                  }}
                >
                    {/* Option letter with pop animation */}
                    <strong style={{
                      color: isRevealed && isCorrect ? '#22c55e' : '#c084fc',
                      transform: `scale(${letterScale})`,
                      opacity: letterOpacity,
                      display: 'inline-block',
                    }}>
                      {option.letter}.
                    </strong>

                    {/* Option text with typewriter */}
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flex: 1 }}>
                      <span style={{
                        color: isRevealed && isCorrect ? '#22c55e' : '#e5e7eb',
                        fontWeight: isRevealed && isCorrect ? 600 : 400,
                        opacity: isRevealed && !isCorrect ? 0.5 : 1,
                      }}>
                        {visibleText}
                        {/* Blinking cursor while typing */}
                        {!isTypingComplete && framesIntoOption > letterPopDuration && (
                          <span style={{
                            display: 'inline-block',
                            width: 2,
                            height: 18,
                            marginLeft: 1,
                            background: 'linear-gradient(180deg, #c084fc, #ec4899)',
                            borderRadius: 1,
                            opacity: cursorVisible ? 1 : 0,
                            verticalAlign: 'middle',
                          }} />
                        )}
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

                    {/* Checkmark or X indicator */}
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
            );
          })()}
        </div>
      </div>
    </div>
  );
};
