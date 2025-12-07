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
// ThinkingCursor removed - using audio-synced highlights instead
import { TeachingCard } from './TeachingCard';

const timestampsData = require('../../public/assets/audio/squamous-cell-lung-hypercalcemia-timestamps.json');

/**
 * SquamousCellLungHypercalcemiaAd - Squamous Cell Carcinoma with PTHrP
 *
 * PyrazinamideAd-style production:
 * - Video overlay: smoking-man.mp4 at "smoking" (~11.3s)
 * - Static overlay: success-kid at answer reveal
 * - 4 vignette highlights with 2 critical shakes
 * - All standard features enabled
 */
export const SquamousCellLungHypercalcemiaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.75;
  const audioPath = staticFile('assets/audio/squamous-cell-lung-hypercalcemia-narration.mp3');

  // ===== NO MEME CUTAWAY - frameOffset = 0 throughout =====

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 40.252;  // "So"
  const answerRevealTimeRaw = 58.503;   // "D."

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 41.889,
    B: 44.803,
    C: 47.45,
    D: 49.935,
    E: 53.104,
  };

  // ===== AUDIO-SYNCED OPTION HIGHLIGHTING =====
  // Options pulse/glow when narrator says them
  const getHighlightedOption = () => {
    const currentTime = (frame / fps) * PLAYBACK_RATE;

    // Check if we're within 0.4s of any option timestamp
    for (const [letter, timestamp] of Object.entries(optionTimestamps)) {
      const timeDiff = Math.abs(currentTime - timestamp);
      if (timeDiff < 0.4) {
        return letter; // Highlight this option
      }
    }

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== VIGNETTE HIGHLIGHTS (top to bottom) =====
  const vignetteHighlights = [
    { phrase: "40 pack-year smoking", timestamp: 10.031 },      // "Forty"
    { phrase: "hemoptysis", timestamp: 18.298 },                // "BLOOD"
    { phrase: "15.8 mg/dL", timestamp: 30.871 },                // "fifteen" - CRITICAL SHAKE
    { phrase: "Central location", timestamp: 71.564 },          // "DEAD" - CRITICAL SHAKE
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "squamous-cell-lung-hypercalcemia",
    vignette: "62-year-old man with 40 pack-year smoking history presents with 3-month history of hemoptysis, fatigue, and severe weakness. Unable to walk more than 20 feet. Chest X-ray reveals a centrally located white, flaky mass near the right main bronchus.",
    lab_values: [
      {
        label: "Calcium",
        value: "15.8 mg/dL",
        status: "critical",
        color: "#ef4444",
        note: "(normal 8.5-10.3)"
      },
      {
        label: "PTH",
        value: "12 pg/mL",
        status: "normal",
        color: "#10b981",
        note: "(normal 10-65, suppressed)"
      },
      {
        label: "Creatinine",
        value: "0.9 mg/dL",
        status: "normal",
        color: "#10b981",
        note: "(normal 0.7-1.3)"
      },
      {
        label: "Location",
        value: "Central mass",
        status: "elevated",
        color: "#fbbf24",
        note: "(key finding)"
      }
    ],
    question_text: "Which diagnosis best explains this patient's presentation?",
    options: [
      {
        letter: "A",
        text: "Adenocarcinoma with bone metastases",
        is_correct: false
      },
      {
        letter: "B",
        text: "Small cell carcinoma with SIADH",
        is_correct: false
      },
      {
        letter: "C",
        text: "Primary hyperparathyroidism",
        is_correct: false
      },
      {
        letter: "D",
        text: "Squamous cell carcinoma with PTHrP production",
        is_correct: true
      },
      {
        letter: "E",
        text: "Large cell carcinoma",
        is_correct: false
      }
    ],
    correct_answer: "D"
  };


  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: 'SQUAMOUS CELL',
      startTime: 66.107, // "Dead wrong" - start earlier
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'microscope',
          iconColor: '#22c55e',
          text: 'Dead center location (not peripheral)',
          timestamp: 71.564, // "DEAD CENTER"
        },
        {
          type: 'bullet',
          iconName: 'bolt',
          iconColor: '#c4b5fd',
          text: 'PTHrP secretion',
          timestamp: 77.555, // "PTHrP"
        },
        {
          type: 'bullet',
          iconName: 'alert',
          iconColor: '#c4b5fd',
          text: 'Activates osteoclasts',
          timestamp: 84.823, // "HIJACKS"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Mobilizes calcium from bone',
          timestamp: 87.504, // "calcium"
        },
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'Causes hypercalcemia',
          timestamp: 89.014, // "FLOODS"
        },
      ]
    },
    {
      titleText: 'BOARDS PEARL - REMEMBER THIS!',
      startTime: 96.85, // "Remember this"
      layout: 'pearl-card',
      elements: [
        {
          text: 'Central lung mass',
          timestamp: 96.85, // "Central"
          fontSize: 30,
        },
        {
          text: '+',
          timestamp: 98.174, // "plus"
          fontSize: 40,
          isEquals: false,
        },
        {
          text: 'Heavy smoker (40+ pack-years)',
          timestamp: 10.031,
          fontSize: 30,
        },
        {
          text: '+',
          timestamp: 98.174,
          fontSize: 40,
          isEquals: false,
        },
        {
          text: 'High calcium + LOW PTH',
          timestamp: 98.557, // "calcium"
          fontSize: 30,
        },
        {
          text: '=',
          timestamp: 100.054, // "equals"
          fontSize: 48,
          isEquals: true,
        },
        {
          text: 'SQUAMOUS CELL + PTHrP',
          timestamp: 100.078, // "squamous"
          fontSize: 38,
          isEquals: true,
        },
      ]
    },
  ];

  // ===== MEME TIMING =====
  const memeTimestamp = 11.331;  // "smoking"

  // ===== SCREEN SHAKE SYSTEM =====
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Shake 1: Critical calcium value "15.8 mg/dL"
    const shake1Frame = Math.floor((30.871 / PLAYBACK_RATE) * fps);
    if (frame >= shake1Frame && frame < shake1Frame + 8) {
      const framesIntoShake = frame - shake1Frame;
      const intensity = interpolate(framesIntoShake, [0, 3, 8], [0, 6, 0], {
        extrapolateRight: 'clamp'
      });
      shakeX += Math.sin(frame * 2) * intensity;
      shakeY += Math.cos(frame * 1.5) * intensity;
    }

    // Shake 2: "DEAD CENTER" - key diagnostic clue
    const shake2Frame = Math.floor((71.564 / PLAYBACK_RATE) * fps);
    if (frame >= shake2Frame && frame < shake2Frame + 8) {
      const framesIntoShake = frame - shake2Frame;
      const intensity = interpolate(framesIntoShake, [0, 3, 8], [0, 6, 0], {
        extrapolateRight: 'clamp'
      });
      shakeX += Math.sin(frame * 2) * intensity;
      shakeY += Math.cos(frame * 1.5) * intensity;
    }

    // Teaching bullet shakes - shake on each bullet appearance
    const teachingShakes = [
      77.555, // PTHrP
      84.823, // Hijacks/Activates
      87.504, // Calcium
      89.014, // Floods/Hypercalcemia
    ];

    teachingShakes.forEach(timestamp => {
      const shakeFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
      if (frame >= shakeFrame && frame < shakeFrame + 6) {
        const framesIntoShake = frame - shakeFrame;
        const intensity = interpolate(framesIntoShake, [0, 2, 6], [0, 5, 0], {
          extrapolateRight: 'clamp'
        });
        shakeX += Math.sin(frame * 2.5) * intensity;
        shakeY += Math.cos(frame * 2) * intensity;
      }
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

      {/* Vignette highlight sounds - interface.mp3 for highlighting */}
      {vignetteHighlights.map((highlight, idx) => {
        // Only play sounds BEFORE answer reveal (during question period)
        if (highlight.timestamp >= answerRevealTimeRaw) return null;

        const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
        const isCritical = idx >= vignetteHighlights.length - 2; // Last 2 are critical

        return (
          <Sequence key={`highlight-sound-${idx}`} from={highlightFrame} durationInFrames={30}>
            <Audio
              src={staticFile('assets/sfx/interface.mp3')}
              volume={isCritical ? 0.6 : 0.4}
            />
          </Sequence>
        );
      })}

      {/* Option reveal clicks - button-click.mp3 for option reveals */}
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

      {/* Heartbeat - gets REALLY loud in final 2 seconds */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio
          src={staticFile('assets/sfx/heartbeat.mp3')}
          volume={(frame) => {
            const timeRemaining = answerRevealFrame - frame;
            const secondsRemaining = timeRemaining / fps;
            // Last 2 seconds: REALLY LOUD (1.5), otherwise moderate (0.5)
            return secondsRemaining <= 2 ? 1.5 : 0.5;
          }}
          playbackRate={1.5}
        />
      </Sequence>

      {/* Mouse click sound when cursor clicks the answer */}
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
        timestampsSource="squamous-cell-lung-hypercalcemia"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((30.871 / PLAYBACK_RATE) * fps)}
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
      />

      {/* ===== QUESTION CARD (hides when teaching starts) ===== */}
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

      {/* ===== CAPTIONS (raised for teaching card) ===== */}
      <TikTokCaptions
        words={timestampsData.words}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        bottomOffset={320}
      />

      {/* ===== VIDEO MEME OVERLAY (contextual) ===== */}
      <VideoMemeOverlay
        videoPath="assets/memes/videos/smoking-man.mp4"
        timestamp={memeTimestamp}
        durationInFrames={75}
        position="center"
        scale={0.6}
        playbackRate={PLAYBACK_RATE}
        videoVolume={0.7}
        frameOffset={0}
        loop={true}
      />

      {/* ===== STATIC MEME OVERLAY (answer reveal) ===== */}
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

export default SquamousCellLungHypercalcemiaAd;
