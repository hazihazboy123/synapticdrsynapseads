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

const timestampsData = require('../../public/assets/audio/epidural-hematoma-timestamps.json');

/**
 * EpiduralHematomaAd - "Talk and Die" Epidural Hematoma
 *
 * Production features (v11.0):
 * - FloatingHighlight with spring animations
 * - Double-take option highlighting (adapts to answer C)
 * - Medical CT scan overlay at LENS moment
 * - Enhanced panic mode with breathing layer
 * - 5 vignette highlights with 2 critical shakes
 * - All standard features enabled
 */
export const EpiduralHematomaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.1;
  const audioPath = staticFile('assets/audio/epidural-hematoma-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 57.644;  // First option "A)" - timer starts here
  const answerRevealTimeRaw = 70.287;   // Answer reveal "C."

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);  // ~15.1 seconds

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 57.644,
    B: 59.641,
    C: 61.347,
    D: 63.484,
    E: 65.887,
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
    { phrase: "unconscious for approximately 30 seconds", timestamp: 10.159, isCritical: false },
    { phrase: "alert and oriented, GCS 15", timestamp: 13.526, isCritical: false },
    { phrase: "Two hours after being discharged", timestamp: 27.574, isCritical: false },
    { phrase: "lethargic with slurred speech", timestamp: 29.304, isCritical: true },  // CRITICAL SHAKE
    { phrase: "tonic-clonic seizure", timestamp: 32.45, isCritical: true },  // CRITICAL SHAKE
    // Lab value highlights (triggers boxes in Clinical Findings)
    { phrase: "6mm", timestamp: 33.925, isCritical: true },  // "BLOWN" - dilated pupil
    { phrase: "52 bpm", timestamp: 38.848, isCritical: true },  // "SLOW" - bradycardia
    { phrase: "180/100", timestamp: 40.194, isCritical: true },  // "pressure" - hypertension
    { phrase: "Lens-shaped", timestamp: 45.709, isCritical: true },  // "LENS" - epidural hematoma
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "epidural-hematoma",
    vignette: "A 17-year-old boy is brought to the emergency department following a motorcycle accident. He was not wearing a helmet and struck his head on the pavement. Witnesses report he was unconscious for approximately 30 seconds before regaining consciousness. On arrival, he is alert and oriented, GCS 15, with only a mild headache. His parents request to take him home. Two hours after being discharged against medical advice, paramedics are called to his home. He is now lethargic with slurred speech. He has a tonic-clonic seizure en route to the hospital.",
    lab_values: [
      {
        label: "Heart rate",
        value: "52 bpm",
        status: "critical",
        color: "#ef4444",
        note: "(bradycardia)"
      },
      {
        label: "Blood pressure",
        value: "180/100",
        status: "critical",
        color: "#ef4444",
        note: "(hypertensive)"
      },
      {
        label: "Left pupil",
        value: "6mm",
        status: "critical",
        color: "#ef4444",
        note: "(dilated, non-reactive)"
      },
      {
        label: "Right pupil",
        value: "3mm",
        status: "normal",
        color: "#10b981",
        note: "(normal)"
      },
      {
        label: "CT skull",
        value: "Temporal bone fracture",
        status: "critical",
        color: "#ef4444",
        note: ""
      },
      {
        label: "CT brain",
        value: "Lens-shaped hyperdensity",
        status: "critical",
        color: "#ef4444",
        note: "(epidural)"
      }
    ],
    question_text: "Which artery was most likely injured in this patient?",
    options: [
      {
        letter: "A",
        text: "Anterior cerebral artery",
        is_correct: false
      },
      {
        letter: "B",
        text: "Middle cerebral artery",
        is_correct: false
      },
      {
        letter: "C",
        text: "Middle meningeal artery",
        is_correct: true
      },
      {
        letter: "D",
        text: "Posterior cerebral artery",
        is_correct: false
      },
      {
        letter: "E",
        text: "Vertebral artery",
        is_correct: false
      }
    ],
    correct_answer: "C"
  };

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "THE LUCID INTERVAL TRAP",
      startTime: 93.5,
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'Skull fracture CRACKS temporal bone',
          timestamp: 95.284, // "CRACKED"
        },
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'Middle meningeal artery runs in GROOVES inside bone',
          timestamp: 100.833, // "GROOVES"
        },
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'Fracture TEARS artery → High-pressure arterial spray',
          timestamp: 105.593, // "TEARS"
        }
      ]
    },
    {
      titleText: 'WHY THIS KILLS SO FAST',
      startTime: 108.217,
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'HIGH PRESSURE arterial blood = rapid accumulation',
          timestamp: 109.03, // "high pressure"
        },
        {
          type: 'bullet',
          iconName: 'clock',
          iconColor: '#fbbf24',
          text: 'Lucid interval = Kid seems fine while dying',
          timestamp: 111.491, // "lucid interval"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Brain getting PANCAKED against skull',
          timestamp: 114.672, // "PANCAKED"
        },
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'MINUTES before brainstem HERNIATES → GAME OVER',
          timestamp: 119.432, // "MINUTES"
        }
      ]
    },
    {
      titleText: 'BOARDS PEARL',
      startTime: 132.0,
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'Lucid Interval + Lens-Shaped Bleed',
          timestamp: 132.5,
          fontSize: 34,
          isEquals: false
        },
        {
          type: 'text',
          text: '=',
          timestamp: 134.0,
          fontSize: 38,
          isEquals: true
        },
        {
          type: 'text',
          text: 'EPIDURAL',
          timestamp: 135.0,
          fontSize: 40,
          isEquals: true
        },
        {
          type: 'text',
          text: 'Middle meningeal = 99% of cases',
          timestamp: 98.987,
          fontSize: 32,
          isEquals: false
        },
        {
          type: 'text',
          text: 'NEVER discharge without CT',
          timestamp: 139.007,
          fontSize: 32,
          isEquals: false
        }
      ]
    }
  ];

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 45.709;  // "LENS" - CT scan showing lens-shaped hematoma

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
        timestampsSource="epidural-hematoma"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((29.304 / PLAYBACK_RATE) * fps)}
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
        bottomOffset={140}
        fontSize={36}
      />

      {/* ===== MEDICAL IMAGE: CT SCAN SHOWING LENS-SHAPED HEMATOMA ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/epidural-hematoma-ct.png"
        timestamp={contextualMemeTimestamp}
        durationInFrames={70}
        position="center"
        scale={0.75}
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
          top: 240,
          right: 60,
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

    </AbsoluteFill>
  );
};

export default EpiduralHematomaAd;
