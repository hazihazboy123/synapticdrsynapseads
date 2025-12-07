import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { TeachingCard } from './TeachingCard';

const timestampsData = require('../../public/assets/audio/pseudomonas-ecthyma-gangrenosum-timestamps.json');

/**
 * PseudomonasEcthymaGangrenosumAd - Pseudomonas Ecthyma Gangrenosum
 *
 * Production features:
 * - Audio-synced option highlighting (no ThinkingCursor)
 * - Static overlay: success-kid at answer reveal
 * - 4 vignette highlights with 2 critical shakes (fever & hypotension)
 * - 3 teaching phases with context-based icons
 * - Pearl card formula for boards pearl
 * - All highlights synced to actual speech timing
 */
export const PseudomonasEcthymaGangrenosumAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/pseudomonas-ecthyma-gangrenosum-narration.mp3');

  // ===== NO MEME CUTAWAY - frameOffset = 0 throughout =====

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 39.37;  // First option "A)" - timer starts here
  const answerRevealTimeRaw = 58.248;  // "HORNSWOGGLED"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);  // ~14.8 seconds

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 39.37,
    B: 42.621,
    C: 45.988,
    D: 49.517,
    E: 52.826,
  };

  // ===== AUDIO-SYNCED OPTION HIGHLIGHTING =====
  const getHighlightedOption = () => {
    const currentTime = (frame / fps) * PLAYBACK_RATE;

    for (const [letter, timestamp] of Object.entries(optionTimestamps)) {
      const timeDiff = Math.abs(currentTime - timestamp);
      if (timeDiff < 0.4) {
        return letter;
      }
    }

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "40% third-degree burns", timestamp: 7.152, isCritical: false },
    { phrase: "black necrotic lesions with erythematous halos", timestamp: 13.851, isCritical: false },
    { phrase: "40.0°C (104°F)", timestamp: 22.593, isCritical: true },
    { phrase: "85/50 mmHg", timestamp: 24.822, isCritical: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "pseudomonas-ecthyma-gangrenosum",
    vignette: "28-year-old man, 3 days post-admission to burn unit with 40% third-degree burns. Develops fever, hypotension, and multiple black necrotic lesions with erythematous halos on trunk.",
    lab_values: [
      {
        label: "Temperature",
        value: "40.0°C",
        status: "critical",
        color: "#ef4444",
        note: "(104°F)"
      },
      {
        label: "BP",
        value: "85/50 mmHg",
        status: "critical",
        color: "#ef4444",
        note: "(hypotensive)"
      },
      {
        label: "WBC",
        value: "24,000/μL",
        status: "critical",
        color: "#ef4444",
        note: "(severe leukocytosis)"
      },
      {
        label: "Blood Culture",
        value: "Gram-negative rods",
        status: "critical",
        color: "#ef4444",
        note: "(pending ID)"
      }
    ],
    question_text: "What is causing the pathognomonic black necrotic lesions?",
    options: [
      {
        letter: "A",
        text: "Staphylococcus aureus",
        is_correct: false
      },
      {
        letter: "B",
        text: "Streptococcus pyogenes",
        is_correct: false
      },
      {
        letter: "C",
        text: "Pseudomonas aeruginosa",
        is_correct: true
      },
      {
        letter: "D",
        text: "Candida albicans",
        is_correct: false
      },
      {
        letter: "E",
        text: "Clostridium perfringens",
        is_correct: false
      }
    ],
    correct_answer: "C"
  };

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "ECTHYMA GANGRENOSUM - THE SIGNATURE",
      startTime: 63.949,
      layout: 'split-view',
      elements: [
        {
          type: 'bullet',
          iconName: 'virus',
          iconColor: '#9333ea',
          text: 'Pathognomonic for Pseudomonas septicemia',
          timestamp: 66.038,
        },
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'Blood vessel invasion causes necrosis',
          timestamp: 71.623,
        },
        {
          type: 'bullet',
          iconName: 'alert',
          iconColor: '#fbbf24',
          text: 'Black center with red halo (bulls-eye)',
          timestamp: 76.255,
        }
      ]
    },
    {
      titleText: 'HIGH-RISK PATIENTS',
      startTime: 80.76,
      layout: 'split-view',
      elements: [
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#10b981',
          text: 'Burn victims (compromised skin barrier)',
          timestamp: 84.962,
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#10b981',
          text: 'Neutropenic patients (chemo, leukemia)',
          timestamp: 85.845,
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#10b981',
          text: 'Immunocompromised hosts',
          timestamp: 86.588,
        }
      ]
    },
    {
      titleText: 'TREATMENT',
      startTime: 92.962,
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'Antipseudomonal β-lactam',
          timestamp: 94.517,
          fontSize: 28,
          isEquals: false
        },
        {
          type: 'text',
          text: '+',
          timestamp: 97.141,
          fontSize: 48,
          isEquals: false
        },
        {
          type: 'text',
          text: 'Aminoglycoside',
          timestamp: 97.722,
          fontSize: 28,
          isEquals: false
        },
        {
          type: 'text',
          text: '=',
          timestamp: 98.894,
          fontSize: 48,
          isEquals: true
        },
        {
          type: 'text',
          text: 'DOUBLE COVERAGE',
          timestamp: 99.266,
          fontSize: 36,
          isEquals: true
        },
        {
          type: 'text',
          text: 'OR YOU\'RE TOAST!',
          timestamp: 100.253,
          fontSize: 32,
          isEquals: true
        }
      ]
    }
  ];


  // ===== SCREEN SHAKE SYSTEM =====
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Vignette critical shakes
    vignetteHighlights.forEach((highlight, idx) => {
      if (highlight.isCritical) {
        const shakeFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
        if (frame >= shakeFrame && frame < shakeFrame + 8) {
          const framesIntoShake = frame - shakeFrame;
          const intensity = interpolate(framesIntoShake, [0, 3, 8], [0, 6, 0], {
            extrapolateRight: 'clamp'
          });
          shakeX += Math.sin(frame * 2) * intensity;
          shakeY += Math.cos(frame * 1.5) * intensity;
        }
      }
    });

    // Teaching bullet shakes (ALL bullets shake)
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
              src={staticFile('assets/sfx/interface.mp3')}
              volume={highlight.isCritical ? 0.6 : 0.4}
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

      {/* Timer ticking */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      {/* Heartbeat - DYNAMIC VOLUME (CRITICAL!) */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio
          src={staticFile('assets/sfx/heartbeat.mp3')}
          volume={(frame) => {
            const timeRemaining = answerRevealFrame - frame;
            const secondsRemaining = timeRemaining / fps;
            return secondsRemaining <= 2 ? 1.5 : 0.5;
          }}
          playbackRate={1.5}
        />
      </Sequence>

      {/* Answer reveal click */}
      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.6} />
      </Sequence>

      {/* Correct answer sound */}
      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/correct-new.mp3')} volume={0.4} />
      </Sequence>

      {/* ===== BRAIN MASCOT WITH EMOTIONS ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="pseudomonas-ecthyma-gangrenosum"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((22.593 / PLAYBACK_RATE) * fps)}
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
          vignetteHighlights={vignetteHighlights}
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
        bottomOffset={320}
      />

      {/* ===== STATIC MEME OVERLAY (ANSWER REVEAL) ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/success-kid.jpg"
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

      {/* ===== ENHANCED COUNTDOWN TIMER ===== */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;
        const secondsRemaining = Math.max(1, Math.ceil((timerDuration - framesIntoTimer) / fps));

        let borderColor = '#10b981';
        if (progress > 0.8) borderColor = '#ef4444';
        else if (progress > 0.5) borderColor = '#f97316';
        else if (progress > 0.3) borderColor = '#fbbf24';

        let timerScale = 1.0;
        if (secondsRemaining <= 2) {
          timerScale = 1.0 + Math.sin(frame * 0.4) * 0.075;
        }

        return (
          <>
            {/* Red vignette in final second */}
            {secondsRemaining === 1 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 30%, rgba(239, 68, 68, 0.35) 100%)',
                opacity: interpolate(Math.sin(frame * 0.3), [-1, 1], [0.5, 1]),
                zIndex: 35,
              }} />
            )}

            {/* Timer circle */}
            <div style={{
              position: 'absolute',
              top: '15%',
              right: '8%',
              width: '140px',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              borderRadius: '50%',
              border: `6px solid ${borderColor}`,
              boxShadow: secondsRemaining <= 2
                ? `0 8px 32px rgba(239, 68, 68, 0.6), 0 0 ${20 + Math.sin(frame * 0.4) * 10}px ${borderColor}`
                : '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 40,
              transform: `scale(${timerScale})`,
            }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', color: 'white' }}>
                {secondsRemaining}
              </div>
            </div>
          </>
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

export default PseudomonasEcthymaGangrenosumAd;
