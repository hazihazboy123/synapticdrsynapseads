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
import VideoMemeOverlay from './VideoMemeOverlay';
import { TeachingCard } from './TeachingCard';

const timestampsData = require('../../public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json');

/**
 * NephroticSyndromeMinimalChangeAd - Minimal Change Disease in Kids
 *
 * SquamousCellLung-style production:
 * - Audio-synced option highlighting (no ThinkingCursor)
 * - Video overlay: beer-foam at "FROTHY" (~15.7s)
 * - Static overlay: success-kid at answer reveal
 * - 4 vignette highlights with 2 critical shakes
 * - All standard features enabled
 */
export const NephroticSyndromeMinimalChangeAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/nephrotic-syndrome-minimal-change-narration.mp3');

  // ===== NO MEME CUTAWAY - frameOffset = 0 throughout =====

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 40.438;  // First option "A)" - timer starts here
  const answerRevealTimeRaw = 59.478;   // "HORNSWOGGLED"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);  // ~10.6 seconds

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 40.438,
    B: 44.257,
    C: 47.032,
    D: 50.538,
    E: 54.184,
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
    { phrase: "periorbital and lower extremity edema", timestamp: 6.885, isCritical: false },      // "BALLOON"
    { phrase: "frothy urine", timestamp: 15.662, isCritical: false },             // "FROTHY"
    { phrase: "4+ g/day", timestamp: 27.516, isCritical: true },            // "four" - CRITICAL SHAKE
    { phrase: "1.8 g/dL", timestamp: 30.79, isCritical: true },             // "one" - CRITICAL SHAKE
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "nephrotic-syndrome-minimal-change",
    vignette: "5-year-old boy presents with periorbital and lower extremity edema for 2 weeks. Mother reports frothy urine. No recent infections. Blood pressure 95/60 mmHg (normal for age).",
    lab_values: [
      {
        label: "Urine Protein",
        value: "4+ g/day",
        status: "critical",
        color: "#ef4444",
        note: "(normal <150 mg/day)"
      },
      {
        label: "Serum Albumin",
        value: "1.8 g/dL",
        status: "critical",
        color: "#ef4444",
        note: "(normal 3.5-5.0)"
      },
      {
        label: "Total Cholesterol",
        value: "400 mg/dL",
        status: "elevated",
        color: "#fbbf24",
        note: "(normal <200)"
      },
      {
        label: "BP",
        value: "95/60 mmHg",
        status: "normal",
        color: "#10b981",
        note: "(normal for age)"
      }
    ],
    question_text: "What is the most likely diagnosis?",
    options: [
      {
        letter: "A",
        text: "Post-streptococcal glomerulonephritis",
        is_correct: false
      },
      {
        letter: "B",
        text: "Minimal change disease",
        is_correct: true
      },
      {
        letter: "C",
        text: "IgA nephropathy",
        is_correct: false
      },
      {
        letter: "D",
        text: "Hemolytic uremic syndrome",
        is_correct: false
      },
      {
        letter: "E",
        text: "Acute tubular necrosis",
        is_correct: false
      }
    ],
    correct_answer: "B"
  };

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "NEPHROTIC SYNDROME'S GOT FOUR THINGS",
      startTime: 75.535, // "massive"
      layout: 'split-view',
      elements: [
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Massive proteinuria',
          timestamp: 75.535, // "massive"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Hypoalbuminemia',
          timestamp: 78.043, // "hypoalbuminemia"
        },
        {
          type: 'bullet',
          iconName: 'alert',
          iconColor: '#fbbf24',
          text: 'EDEMA',
          timestamp: 79.506, // "EDEMA"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#fbbf24',
          text: 'Hyperlipidemia',
          timestamp: 81.038, // "hyperlipidemia"
        }
      ]
    },
    {
      titleText: 'IN YOUNGSTERS - MINIMAL CHANGE',
      startTime: 83.708, // "youngsters"
      layout: 'split-view',
      elements: [
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#22c55e',
          text: 'Most common in children',
          timestamp: 83.708, // "youngsters"
        },
        {
          type: 'bullet',
          iconName: 'pill',
          iconColor: '#6366f1',
          text: 'Treat with corticosteroids',
          timestamp: 87.412, // "steroids"
        },
        {
          type: 'bullet',
          iconName: 'check',
          iconColor: '#22c55e',
          text: 'Excellent prognosis',
          timestamp: 89.491, // "better"
        }
      ]
    },
    {
      titleText: 'REMEMBER THIS',
      startTime: 93.383, // "Remember"
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'Frothy urine',
          timestamp: 93.383, // "Remember"
          fontSize: 32
        },
        {
          type: 'text',
          text: '+',
          timestamp: 94.134, // "plus"
          fontSize: 40,
          isEquals: false
        },
        {
          type: 'text',
          text: 'Puffy kid',
          timestamp: 94.134, // "puffy"
          fontSize: 32
        },
        {
          type: 'text',
          text: '=',
          timestamp: 94.912, // "equals"
          fontSize: 48,
          isEquals: true
        },
        {
          type: 'text',
          text: 'MINIMAL CHANGE',
          timestamp: 95.699, // "minimal"
          fontSize: 38,
          isEquals: true
        }
      ]
    }
  ];

  // ===== MEME TIMING =====
  const memeTimestamp = 15.662;  // "FROTHY"

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

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      {/* Heartbeat - dynamic volume */}
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

      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.6} />
      </Sequence>

      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/correct-new.mp3')} volume={0.4} />
      </Sequence>

      {/* ===== BRAIN MASCOT WITH EMOTIONS ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="nephrotic-syndrome-minimal-change"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((27.516 / PLAYBACK_RATE) * fps)}
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

      {/* ===== STATIC MEME OVERLAY ===== */}
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
            {secondsRemaining === 1 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 30%, rgba(239, 68, 68, 0.35) 100%)',
                opacity: interpolate(Math.sin(frame * 0.3), [-1, 1], [0.5, 1]),
                zIndex: 35,
              }} />
            )}

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

export default NephroticSyndromeMinimalChangeAd;
