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

const timestampsData = require('../../public/assets/audio/bph-5-alpha-reductase-timestamps.json');

/**
 * BphFiveAlphaReductaseAd - BPH 5-Alpha Reductase Inhibitor Treatment
 *
 * Production specs:
 * - Audio-synced option highlighting (no ThinkingCursor)
 * - Contextual meme: michael-jordan-crying at "ENGINE" (~89.002s)
 * - Static overlay: roll-safe at answer reveal
 * - 5 vignette highlights with 1 critical shake
 * - All standard features enabled
 */
export const BphFiveAlphaReductaseAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/bph-5-alpha-reductase-narration.mp3');

  // ===== NO MEME CUTAWAY - frameOffset = 0 throughout =====

  // ===== OPTION TIMESTAMPS (from timestamps-with-icons file) =====
  const optionTimestamps = {
    A: 40.333,
    B: 40.821,
    C: 41.204,
    D: 41.529,
    E: 41.947,
  };

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = optionTimestamps.A;  // Timer starts at first option
  const answerRevealTimeRaw = 50.399;   // "BAMBOOZLED"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = answerRevealFrame - questionStartFrame;  // ~5.3 seconds

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
    { phrase: "affecting their sleep", timestamp: 8.115, isCritical: false },      // "BOOT"
    { phrase: "5 times per night", timestamp: 10.832, isCritical: false },         // "five"
    { phrase: "size of a baseball", timestamp: 18.495, isCritical: false },        // "BASEBALL"
    { phrase: "65 grams", timestamp: 20.201, isCritical: true },                   // "SIXTY" - CRITICAL SHAKE
    { phrase: "7.2 ng/mL", timestamp: 29.513, isCritical: false },                 // "seven"
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "bph-5-alpha-reductase",
    vignette: "A 70-year-old man presents with severe urinary hesitancy and nocturia 5 times per night. His wife reports his symptoms are affecting their sleep quality. Digital rectal exam reveals a firm, symmetrically enlarged prostate estimated at 65 grams (size of a baseball). Urinalysis is normal. PSA is 7.2 ng/mL.",
    lab_values: [
      {
        label: "Prostate Size",
        value: "65 grams",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: ~20g)"
      },
      {
        label: "PSA",
        value: "7.2 ng/mL",
        status: "elevated",
        color: "#fbbf24",
        note: "(Normal: <4.0)"
      }
    ],
    question_text: "What is the BEST medication class to reduce prostate volume and prevent surgical intervention?",
    options: [
      {
        letter: "A",
        text: "Anticholinergic agents",
        is_correct: false
      },
      {
        letter: "B",
        text: "Alpha-1 blockers",
        is_correct: false
      },
      {
        letter: "C",
        text: "5-alpha reductase inhibitor",
        is_correct: true
      },
      {
        letter: "D",
        text: "PDE-5 inhibitors",
        is_correct: false
      },
      {
        letter: "E",
        text: "Immediate TURP referral",
        is_correct: false
      }
    ],
    correct_answer: "C"
  };

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "MECHANISM OF ACTION",
      startTime: 62.265, // "pipe"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#9333ea',
          text: 'Blocks 5-alpha-reductase enzyme',
          timestamp: 72.029, // "BLOCKIN"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'stop',
          iconColor: '#ef4444',
          text: 'Stops testosterone → DHT conversion',
          timestamp: 74.513, // "DHT"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Prostate SHRINKS 20-30% in 6 months',
          timestamp: 81.699, // "SHRINKS"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#10b981',
          text: 'Reduces bleeding risk',
          timestamp: 85.391, // "miraculous"
          fontSize: 38
        }
      ]
    },
    {
      titleText: 'SIDE EFFECTS VS BENEFITS',
      startTime: 87.702, // "fellas"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'Erectile dysfunction possible',
          timestamp: 89.002, // "ENGINE"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'check',
          iconColor: '#22c55e',
          text: 'Better than surgical complications',
          timestamp: 91.939, // "better"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'But worth avoiding surgery',
          timestamp: 92.346, // "LIMP"
          fontSize: 38
        },
        {
          type: 'bullet',
          iconName: 'check',
          iconColor: '#22c55e',
          text: 'Prevents surgery (TURP)',
          timestamp: 93.031, // "CARVED"
          fontSize: 38
        }
      ]
    },
    {
      titleText: 'BOARDS PEARL - KEY CONTRAST',
      startTime: 95.991, // "Alpha"
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'Alpha blockers',
          timestamp: 95.991, // "Alpha"
          fontSize: 38,
          isEquals: false
        },
        {
          type: 'text',
          text: '=',
          timestamp: 97.338, // "just"
          fontSize: 38,
          isEquals: true
        },
        {
          type: 'text',
          text: 'RELAX smooth muscle',
          timestamp: 97.814, // "LOOSEN"
          fontSize: 32,
          isEquals: false
        },
        {
          type: 'text',
          text: '+',
          timestamp: 99.068, // "don't"
          fontSize: 38,
          isEquals: false
        },
        {
          type: 'text',
          text: 'NO SIZE REDUCTION',
          timestamp: 99.788, // "SQUAT"
          fontSize: 32,
          isEquals: true
        }
      ]
    }
  ];

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 89.002;  // "ENGINE"

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
        timestampsSource="bph-5-alpha-reductase"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((20.201 / PLAYBACK_RATE) * fps)}
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

      {/* ===== CONTEXTUAL MEME OVERLAY ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/michael-jordan-crying.jpg"
        timestamp={contextualMemeTimestamp}
        durationInFrames={45}
        position="center"
        scale={0.55}
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

export default BphFiveAlphaReductaseAd;
