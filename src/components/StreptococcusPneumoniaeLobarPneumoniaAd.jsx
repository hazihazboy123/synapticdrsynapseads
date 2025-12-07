import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
  Easing
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import VideoMemeOverlay from './VideoMemeOverlay';
import { TeachingCard } from './TeachingCard';
import { FloatingHighlight } from './FloatingHighlight';
import { BrandLogo } from './BrandLogo';

const timestampsData = require('../../public/assets/audio/streptococcus-pneumoniae-lobar-pneumonia-timestamps.json');

/**
 * StreptococcusPneumoniaeLobarPneumoniaAd - Lobar Pneumonia with Strep Pneumo
 *
 * Production features:
 * - Audio-synced option highlighting (no ThinkingCursor)
 * - Static overlay: roll-safe at answer reveal
 * - Contextual meme: dogs-eyes-closed at 8.94s
 * - 5 vignette highlights with 2 critical shakes
 * - All standard features enabled
 */
export const StreptococcusPneumoniaeLobarPneumoniaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/streptococcus-pneumoniae-lobar-pneumonia-narration.mp3');

  // ===== NO MEME CUTAWAY - frameOffset = 0 throughout =====

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 53.929;  // First option "A)" - timer starts here
  const answerRevealTimeRaw = 69.068;   // Answer reveal

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);  // ~15.1 seconds

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 53.929,
    B: 56.483,
    C: 58.677,
    D: 61.15,
    E: 63.669,
  };

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15; // Start 0.5s after last option appears

    // Only activate during thinking phase (after all options visible, before answer)
    if (frame < thinkingStartFrame || frame >= answerRevealFrame) {
      return null;
    }

    const framesIntoThinking = frame - thinkingStartFrame;
    const availableFrames = answerRevealFrame - thinkingStartFrame; // ~71 frames total

    // PHASE 1: Quick scan A→B→C→D→E (8 frames each = 40 frames total)
    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    // PHASE 2: Brief pause (5 frames)
    if (framesIntoThinking < 45) {
      return null; // No highlight during pause
    }

    // PHASE 3: Double-take - C→B→C (remaining ~26 frames)
    const doubleTakeFrames = framesIntoThinking - 45;

    if (doubleTakeFrames < 8) return 'C';   // First look at C
    if (doubleTakeFrames < 16) return 'B';  // Wait, maybe B?
    if (doubleTakeFrames < availableFrames - 45) return 'C'; // No, definitely C!

    return null; // End before answer reveal
  };

  const highlightedOption = getHighlightedOption();

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "62-year-old man", timestamp: 4.272, isCritical: false },
    { phrase: "104°F", timestamp: 6.629, isCritical: true },            // "ONE-OH-FOUR" - CRITICAL SHAKE (Brain shock here)
    { phrase: "rust-colored sputum", timestamp: 24.973, isCritical: false },
    { phrase: "right lower lobe consolidation", timestamp: 33.565, isCritical: false },
    { phrase: "gram-positive lancet-shaped diplococci", timestamp: 41.912, isCritical: true },  // "LANCET-SHAPED" - CRITICAL SHAKE
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "streptococcus-pneumoniae-lobar-pneumonia",
    vignette: "62-year-old man presents to the emergency department with 3 days of productive cough, fever, and shortness of breath. He reports coughing up rust-colored sputum. Vital signs show temperature 104°F (40°C), heart rate 110 bpm, respiratory rate 28/min, blood pressure 128/82 mmHg, and oxygen saturation 88% on room air. Physical examination reveals decreased breath sounds and dullness to percussion over the right lower lobe. Chest X-ray demonstrates right lower lobe consolidation with air bronchograms. Sputum gram stain reveals gram-positive lancet-shaped diplococci.",
    lab_values: [
      {
        label: "Temperature",
        value: "104°F (40°C)",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 98.6°F)"
      },
      {
        label: "WBC",
        value: "18,500/μL",
        status: "elevated",
        color: "#fbbf24",
        note: "(Normal: 4,500-11,000/μL)"
      },
      {
        label: "Oxygen saturation",
        value: "88% on room air",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: >95%)"
      }
    ],
    question_text: "What is the most likely causative organism?",
    options: [
      {
        letter: "A",
        text: "Klebsiella pneumoniae",
        is_correct: false
      },
      {
        letter: "B",
        text: "Mycoplasma pneumoniae",
        is_correct: false
      },
      {
        letter: "C",
        text: "Streptococcus pneumoniae",
        is_correct: true
      },
      {
        letter: "D",
        text: "Haemophilus influenzae",
        is_correct: false
      },
      {
        letter: "E",
        text: "Legionella pneumophila",
        is_correct: false
      }
    ],
    correct_answer: "C"
  };

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "WHY RUSTY SPUTUM?",
      startTime: 77.589, // "somethin"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'RBCs get CHEWED UP in alveoli',
          timestamp: 81.711, // "CHEWED"
        },
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'Hemoglobin breaks down into rust color',
          timestamp: 85.24, // "degraded"
        }
      ]
    },
    {
      titleText: 'LOBAR PNEUMONIA',
      startTime: 88.724, // "LOBAR"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'Fills ONE WHOLE LOBE with inflammatory GUNK',
          timestamp: 91.208, // "LOBE"
        },
        {
          type: 'bullet',
          iconName: 'bolt',
          iconColor: '#fbbf24',
          text: 'Lung becomes solid as a ROCK',
          timestamp: 94.691, // "ROCK"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#10b981',
          text: 'NUMBER ONE cause of CAP',
          timestamp: 96.317, // "NUMBER"
        },
        {
          type: 'bullet',
          iconName: 'virus',
          iconColor: '#9333ea',
          text: 'PATHOGNOMONIC for Strep pneumo',
          timestamp: 100.88, // "PATHOGNOMONIC"
        }
      ]
    },
    {
      titleText: 'TREATMENT PEARL',
      startTime: 103.898, // "beta-lactam"
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'Beta-lactam',
          timestamp: 103.898, // "beta-lactam"
          fontSize: 38,
          isEquals: false
        },
        {
          type: 'text',
          text: '+',
          timestamp: 107.265, // "amoxicillin"
          fontSize: 38,
          isEquals: false
        },
        {
          type: 'text',
          text: "Don't delay",
          timestamp: 111.12, // "DILLY-DALLY"
          fontSize: 38,
          isEquals: false
        },
        {
          type: 'text',
          text: '=',
          timestamp: 112.71, // "Man's"
          fontSize: 38,
          isEquals: true
        },
        {
          type: 'text',
          text: 'Saves lives',
          timestamp: 113.953, // "turned"
          fontSize: 38,
          isEquals: true
        }
      ]
    }
  ];

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 8.94;  // "dog" - dogs-eyes-closed.jpg

  // ===== SCREEN SHAKE SYSTEM =====
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Vignette shakes - now ALL highlights get shakes
    vignetteHighlights.forEach((highlight, idx) => {
      const shakeFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
      if (frame >= shakeFrame && frame < shakeFrame + 8) {
        const framesIntoShake = frame - shakeFrame;
        // Critical highlights get stronger shake (intensity 6), non-critical get moderate (intensity 4)
        const maxIntensity = highlight.isCritical ? 6 : 4;
        const intensity = interpolate(framesIntoShake, [0, 3, 8], [0, maxIntensity, 0], {
          extrapolateRight: 'clamp'
        });
        shakeX += Math.sin(frame * 2) * intensity;
        shakeY += Math.cos(frame * 1.5) * intensity;
      }
    });

    // Teaching bullet shakes
    teachingPhases.forEach(phase => {
      phase.elements.forEach(element => {
        if (element.type === 'bullet' || !element.type) {
          const shakeFrame = Math.floor((element.timestamp / PLAYBACK_RATE) * fps);
          if (frame >= shakeFrame && frame < shakeFrame + 6) {
            const framesIntoShake = frame - shakeFrame;
            const intensity = interpolate(framesIntoShake, [0, 2, 6], [0, 5, 0], {
              extrapolateRight: 'clamp'
            });
            shakeX += Math.sin(frame * 2.5) * intensity;
            shakeY += Math.cos(frame * 2) * intensity;
          }
        }
      });
    });

    return { x: shakeX, y: shakeY };
  };

  const shake = getScreenShake();

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
      transform: `translate(${shake.x}px, ${shake.y}px)`
    }}>

      {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Vignette highlight sounds */}
      {vignetteHighlights.map((highlight, idx) => {
        if (highlight.timestamp >= answerRevealTimeRaw) return null;
        const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`highlight-sound-${idx}`} from={highlightFrame} durationInFrames={30}>
            <Audio
              src={staticFile('assets/sfx/underline-stroke.mp3')}
              startFrom={0.8}
              volume={highlight.isCritical ? 2.0 : 1.8}
            />
          </Sequence>
        );
      })}

      {/* Option reveal clicks */}
      {Object.values(optionTimestamps).map((timestamp, idx) => {
        const optionFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`option-click-${idx}`} from={optionFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.5} />
          </Sequence>
        );
      })}

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio
          src={staticFile('assets/sfx/timer-ticking.mp3')}
          volume={0.6}
        />
      </Sequence>

      {/* Heartbeat - escalating anxiety (stops before panic mode to avoid overlap) */}
      {timerDuration > 90 && (
        <Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
          <Audio
            src={staticFile('assets/sfx/heartbeat.mp3')}
            volume={1.2}
            playbackRate={1.9}
          />
        </Sequence>
      )}

      {/* Heartbeat - PANIC MODE (final 3 seconds, doubled speed - NO OVERLAP) */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio
          src={staticFile('assets/sfx/heartbeat.mp3')}
          volume={2.5}
          playbackRate={2.8}
        />
      </Sequence>

      {/* Breathing sound - panic layer (final 3 seconds only) */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio
          src={staticFile('assets/sfx/breathing.mp3')}
          volume={0.25}
          playbackRate={1.3}
        />
      </Sequence>

      {/* Double-take option highlight clicks - NEW SOUND */}
      {(() => {
        const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
        const thinkingStartFrame = lastOptionFrame + 15;

        // PHASE 1: Quick scan clicks (A, B, C, D, E) - 8 frames apart
        const phase1Clicks = [0, 8, 16, 24, 32].map((offset, idx) => (
          <Sequence key={`phase1-click-${idx}`} from={thinkingStartFrame + offset} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.0} />
          </Sequence>
        ));

        // PHASE 3: Double-take clicks (C, B, C) - 8 frames apart, starting at frame 45
        const phase3Clicks = [
          <Sequence key="doubletake-c1" from={thinkingStartFrame + 45} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.1} />
          </Sequence>,
          <Sequence key="doubletake-b" from={thinkingStartFrame + 53} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.1} />
          </Sequence>,
          <Sequence key="doubletake-c2" from={thinkingStartFrame + 61} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.2} />
          </Sequence>,
        ];

        // All clicks now happen within the thinking window (before answerRevealFrame)
        return [...phase1Clicks, ...phase3Clicks];
      })()}

      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
      </Sequence>

      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
      </Sequence>

      {/* Teaching phase sounds */}
      {teachingPhases.map((phase, phaseIdx) => {
        const phaseStartFrame = Math.floor((phase.startTime / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`phase-whoosh-${phaseIdx}`} from={phaseStartFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.35} />
          </Sequence>
        );
      })}

      {/* Teaching bullet sounds */}
      {teachingPhases.flatMap(phase =>
        phase.elements.filter(el => el.type === 'bullet' || !el.type).map((element, idx) => {
          const bulletFrame = Math.floor((element.timestamp / PLAYBACK_RATE) * fps);
          return (
            <Sequence key={`bullet-pop-${phase.startTime}-${idx}`} from={bulletFrame} durationInFrames={20}>
              <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.45} />
            </Sequence>
          );
        })
      )}

      {/* ===== BRAIN MASCOT WITH EMOTIONS ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="streptococcus-pneumoniae-lobar-pneumonia"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((6.629 / PLAYBACK_RATE) * fps)}
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
      />

      {/* ===== QUESTION CARD ===== */}
      {frame < Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps) && (
        <MedicalQuestionCard
          questionData={questionData}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          vignetteHighlights={vignetteHighlights} // Re-enabled for positioning reference
          optionTimestamps={optionTimestamps}
          zoomMode={true}
          cursorHoverOption={highlightedOption}
        />
      )}

      {/* ===== CAPTIONS ===== */}
      <TikTokCaptions
        words={timestampsData.words}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        bottomOffset={200}
      />

      {/* ===== CONTEXTUAL MEME OVERLAY ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/dogs-eyes-closed.jpg"
        timestamp={contextualMemeTimestamp}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== CHEST X-RAY OVERLAY ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/strep-pneumo-lung.jpg"
        timestamp={18.785}
        durationInFrames={60}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== ANSWER REVEAL MEME OVERLAY ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/roll-safe.jpg"
        timestamp={answerRevealTimeRaw}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== TEACHING CARD ===== */}
      <TeachingCard
        phases={teachingPhases}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        startFrame={answerRevealFrame + 90}
        colorScheme={{
          background: '#0a0a0a',
          accent: 'linear-gradient(135deg, #9333ea, #db2777)',
          text: '#e5e7eb',
          highlight: '#FFD700',
          success: '#22c55e',
          warning: '#ef4444',
        }}
      />

      {/* ===== CIRCULAR PROGRESS TIMER ===== */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 150,
        }}>
          {(() => {
            const secondsLeft = Math.max(0, Math.ceil((timerDuration - (frame - questionStartFrame)) / fps));
            const progress = Math.max(0, Math.min(1, (frame - questionStartFrame) / timerDuration));
            const circumference = 2 * Math.PI * 50;
            const offset = circumference * (1 - progress);

            // ANXIETY EFFECTS: Shake and pulse intensify as time runs out
            const shakeIntensity = progress * 3; // 0 → 3px
            const shakeX = Math.sin(frame * 0.8) * shakeIntensity;
            const shakeY = Math.cos(frame * 0.6) * shakeIntensity;

            // Pulse effect - more dramatic as time runs out
            const pulseScale = 1.0 + (Math.sin(frame * 0.3) * 0.08 * progress);

            // ZOOM effect - grows larger in final 5 seconds
            const baseZoom = secondsLeft <= 5 ? 1.0 + ((5 - secondsLeft) * 0.08) : 1.0; // 1.0 → 1.4 in final 5s

            // Red color bleed in final seconds
            const redIntensity = Math.min(1, progress * 1.5);

            return (
              <div style={{
                position: 'relative',
                width: 140,
                height: 140,
                transform: `translate(${shakeX}px, ${shakeY}px) scale(${pulseScale * baseZoom})`,
                filter: `drop-shadow(0 0 ${20 * progress}px rgba(239, 68, 68, ${redIntensity * 0.8}))`,
              }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="10"
                  />
                  {/* Progress circle with gradient */}
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={progress < 0.5 ? "#9333ea" : "#dc2626"} />
                      <stop offset="100%" stopColor={progress < 0.5 ? "#db2777" : "#ef4444"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56 + (progress * 8), // Grows from 56 → 64px
                  fontWeight: 'bold',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  color: progress < 0.5 ? '#FFFFFF' : `rgb(255, ${255 - progress * 255}, ${255 - progress * 255})`,
                  textShadow: `0 0 ${10 + progress * 20}px rgba(239, 68, 68, ${progress}), 0 0 ${20 + progress * 30}px rgba(239, 68, 68, ${progress * 0.6})`,
                  transform: `scale(${1.0 + Math.sin(frame * 0.5) * 0.1 * progress})`,
                }}>
                  {secondsLeft}
                </div>
              </div>
            );
          })()}
        </div>
      </Sequence>

      {/* ===== RED ANXIETY SCREEN - Intensifies as timer counts down ===== */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;
        const secondsRemaining = Math.max(0, Math.ceil((timerDuration - framesIntoTimer) / fps));

        // Red starts kicking in at 4 seconds remaining
        let baseIntensity = 0;
        if (secondsRemaining <= 4) {
          // Ramp from 0 → 0.5 in final 4 seconds
          const redProgress = (4 - secondsRemaining) / 4;
          baseIntensity = redProgress * redProgress * 0.5;
        }

        // Pulse effect in final 3 seconds
        let pulseMultiplier = 1.0;
        if (secondsRemaining <= 3) {
          pulseMultiplier = 1.0 + Math.sin(frame * 0.6) * 0.3;
        }

        const finalIntensity = Math.min(0.6, baseIntensity * pulseMultiplier);

        return (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, ' + finalIntensity + ') 100%)',
            pointerEvents: 'none',
            zIndex: 45,
          }} />
        );
      })()}

      {/* ===== GREEN FLASH ON REVEAL ===== */}
      <Sequence from={answerRevealFrame} durationInFrames={Math.floor(0.3 * fps)}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 255, 0, 0.25)',
          opacity: interpolate(
            frame - answerRevealFrame,
            [0, 3, Math.floor(0.3 * fps)],
            [0, 1, 0],
            { extrapolateRight: 'clamp' }
          ),
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      </Sequence>

      {/* ===== SYNAPTIC RECALL BRANDING ===== */}
      <BrandLogo size="medium" opacity={0.9} />

    </AbsoluteFill>
  );
};

export default StreptococcusPneumoniaeLobarPneumoniaAd;
