import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Video,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
  OffthreadVideo,
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { TeachingCard } from './TeachingCard';

const timestampsData = require('../../public/assets/audio/beta-blocker-overdose-timestamps.json');

/**
 * BetaBlockerOverdoseBrainrot - SPLIT SCREEN EDITION
 *
 * Top half: Medical content
 * Bottom half: Subway Surfers gameplay (the brain rot)
 */
export const BetaBlockerOverdoseBrainrot = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/beta-blocker-overdose-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 32.322;
  const answerRevealTimeRaw = 47.091;

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 32.322,
    B: 33.600,
    C: 35.620,
    D: 37.280,
    E: 39.149,
  };

  // ===== FULL VIGNETTE TEXT =====
  const fullVignetteText = "A 28-year-old woman presents after intentional propranolol overdose. She is lethargic with severely decreased heart rate and blood pressure.";

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15;

    if (frame < thinkingStartFrame || frame >= answerRevealFrame) {
      return null;
    }

    const framesIntoThinking = frame - thinkingStartFrame;
    const availableFrames = answerRevealFrame - thinkingStartFrame;

    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    if (framesIntoThinking < 45) {
      return null;
    }

    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';
    if (doubleTakeFrames < 16) return 'A';
    if (doubleTakeFrames < availableFrames - 45) return 'C';

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES =====
  const highlightPhrases = [
    { phrase: "intentional propranolol overdose", color: "#ef4444", bold: true },
    { phrase: "lethargic", color: "#fbbf24", bold: true },
    { phrase: "heart rate", color: "#ef4444", bold: true },
    { phrase: "blood pressure", color: "#ef4444", bold: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "beta-blocker-overdose",
    vignette: "",
    lab_values: [
      {
        label: "Heart rate",
        value: "32 bpm",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 60-100)"
      },
      {
        label: "Blood pressure",
        value: "70/40 mmHg",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 120/80)"
      },
      {
        label: "Glucose",
        value: "62 mg/dL",
        status: "low",
        color: "#f59e0b",
        note: "(Normal: 70-100)"
      }
    ],
    question_text: "Which treatment is most appropriate for this patient?",
    options: [
      { letter: "A", text: "Atropine", is_correct: false },
      { letter: "B", text: "Calcium gluconate", is_correct: false },
      { letter: "C", text: "Glucagon", is_correct: true },
      { letter: "D", text: "Epinephrine", is_correct: false },
      { letter: "E", text: "Sodium bicarbonate", is_correct: false }
    ],
    correct_answer: "C"
  };

  // ===== LAB TIMESTAMPS =====
  const clinicalFindingsTimestamp = 12.5;
  const labTimestamps = {
    "Heart rate": 12.666,
    "Blood pressure": 17.02,
    "Glucose": 27.376,
  };

  const vignetteHighlights = [
    { phrase: "intentional propranolol overdose", timestamp: 2.276, isCritical: true },
    { phrase: "Lethargic", timestamp: 25.519, isCritical: false },
    { phrase: "32 bpm", timestamp: 13.874, isCritical: true },
    { phrase: "70/40", timestamp: 18.425, isCritical: true },
    { phrase: "62 mg/dL", timestamp: 27.376, isCritical: false },
  ];

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "WHY ATROPINE FAILS",
      startTime: 67.060,
      layout: 'flow-diagram',
      elements: [
        { type: 'bullet', iconName: 'stop', iconColor: '#ef4444', text: 'Beta-blockers CHOKE OUT beta receptors', timestamp: 74.108 },
        { type: 'bullet', iconName: 'warning', iconColor: '#fbbf24', text: 'Atropine = muscarinic pathway (DIFFERENT SYSTEM)', timestamp: 83.082 },
        { type: 'bullet', iconName: 'chart', iconColor: '#ef4444', text: 'Beta receptors BLOCKED = atropine does SQUAT', timestamp: 88.852 }
      ]
    },
    {
      titleText: 'HOW GLUCAGON SAVES THE DAY',
      startTime: 95.540,
      layout: 'flow-diagram',
      elements: [
        { type: 'bullet', iconName: 'microscope', iconColor: '#9333ea', text: 'Bypasses beta receptors entirely', timestamp: 98.767 },
        { type: 'bullet', iconName: 'bolt', iconColor: '#22c55e', text: 'Activates OWN receptor → cAMP ROCKETS', timestamp: 103.481 },
        { type: 'bullet', iconName: 'heart', iconColor: '#ec4899', text: 'Calcium FLOODS cardiac cells (BACK DOOR)', timestamp: 105.257 }
      ]
    },
    {
      titleText: 'CLINICAL PEARL',
      startTime: 119.514,
      layout: 'pearl-card',
      elements: [
        { type: 'text', text: 'Dose: 5-10 mg IV push', timestamp: 119.514, fontSize: 34 },
        { type: 'text', text: '→', timestamp: 120.432, fontSize: 36 },
        { type: 'text', text: 'Start a DRIP if needed', timestamp: 122.684, fontSize: 34 },
        { type: 'text', text: 'Raises HR + BP + Glucose = TRIPLE WIN', timestamp: 116.206, fontSize: 32 }
      ]
    }
  ];

  const teachingStartFrame = Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps);
  const contextualMemeTimestamp = 29.513;

  // ===== SPLIT SCREEN DIMENSIONS =====
  const TOP_HEIGHT = 1150; // Top portion for medical content
  const BOTTOM_HEIGHT = 1920 - TOP_HEIGHT; // Bottom for gameplay

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>

      {/* ===== BOTTOM HALF: SUBWAY SURFERS GAMEPLAY ===== */}
      <div style={{
        position: 'absolute',
        top: TOP_HEIGHT,
        left: 0,
        width: 1080,
        height: BOTTOM_HEIGHT,
        overflow: 'hidden',
      }}>
        <OffthreadVideo
          src={staticFile('assets/video/subway-surfers.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          volume={0}
          loop
          playbackRate={1}
        />
        {/* Gradient fade at top for smooth transition */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to bottom, #0a0a0a, transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ===== TOP HALF: MEDICAL CONTENT ===== */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: TOP_HEIGHT,
        overflow: 'hidden',
      }}>
        {/* Content at full size, positioned to fit */}
        <div style={{
          width: 1080,
          height: TOP_HEIGHT,
          position: 'relative',
        }}>

          {/* ===== AUDIO ===== */}
          <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

          {/* ===== SYSTEM SOUNDS ===== */}
          <Sequence from={0} durationInFrames={30}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
          </Sequence>

          {/* Timer ticking */}
          <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
            <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
          </Sequence>

          {/* Heartbeat */}
          {timerDuration > 90 && (
            <Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
              <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
            </Sequence>
          )}

          <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
            <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
          </Sequence>

          {/* Answer reveal */}
          <Sequence from={answerRevealFrame} durationInFrames={15}>
            <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
          </Sequence>

          <Sequence from={answerRevealFrame} durationInFrames={30}>
            <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
          </Sequence>

          {/* ===== BRAIN MASCOT ===== */}
          <BrainMascot
            audioPath={audioPath}
            position="top-left"
            size={120}
            timestampsSource="beta-blocker-overdose"
            playbackRate={PLAYBACK_RATE}
            shockMoment={Math.floor((13.874 / PLAYBACK_RATE) * fps)}
            thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
            celebrationMoment={answerRevealFrame}
            customTop={30}
            customLeft={40}
          />

          {/* ===== QUESTION CARD ===== */}
          {frame < teachingStartFrame && (
            <MedicalQuestionCard
              questionData={questionData}
              answerRevealTime={answerRevealTimeRaw}
              playbackRate={PLAYBACK_RATE}
              frameOffset={0}
              fullVignetteText={fullVignetteText}
              vignetteStartTimestamp={1.254}
              highlightPhrases={highlightPhrases}
              vignetteHighlights={vignetteHighlights}
              optionTimestamps={optionTimestamps}
              zoomMode={false}
              cursorHoverOption={highlightedOption}
              clinicalFindingsTimestamp={clinicalFindingsTimestamp}
              labTimestamps={labTimestamps}
              cardTopOffset={140}
            />
          )}

          {/* ===== CAPTIONS ===== */}
          <TikTokCaptions
            words={timestampsData.words}
            playbackRate={PLAYBACK_RATE}
            frameOffset={0}
            position="speech-bubble"
            fontSize={22}
            mode="word"
            maxWords={1}
            customTop={50}
            customLeft={180}
          />

          {/* ===== MEMES ===== */}
          <StaticMemeOverlay
            imagePath="assets/memes/this-is-fine.jpg"
            timestamp={contextualMemeTimestamp}
            durationInFrames={50}
            position="center"
            scale={0.55}
            playbackRate={PLAYBACK_RATE}
            soundEffect={null}
            frameOffset={0}
          />

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

          {/* ===== TIMER ===== */}
          <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
            <div style={{
              position: 'absolute',
              top: 30,
              right: 40,
              zIndex: 150,
            }}>
              {(() => {
                const secondsLeft = Math.max(0, Math.ceil((timerDuration - (frame - questionStartFrame)) / fps));
                const progress = Math.max(0, Math.min(1, (frame - questionStartFrame) / timerDuration));
                const circumference = 2 * Math.PI * 40;
                const offset = circumference * (1 - progress);

                const shakeIntensity = progress * 3;
                const shakeX = Math.sin(frame * 0.8) * shakeIntensity;
                const shakeY = Math.cos(frame * 0.6) * shakeIntensity;
                const pulseScale = 1.0 + (Math.sin(frame * 0.3) * 0.08 * progress);
                const baseZoom = secondsLeft <= 5 ? 1.0 + ((5 - secondsLeft) * 0.08) : 1.0;
                const redIntensity = Math.min(1, progress * 1.5);

                return (
                  <div style={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    transform: `translate(${shakeX}px, ${shakeY}px) scale(${pulseScale * baseZoom})`,
                    filter: `drop-shadow(0 0 ${20 * progress}px rgba(239, 68, 68, ${redIntensity * 0.8}))`,
                  }}>
                    <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="url(#timerGradientBrainrot)"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="timerGradientBrainrot" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={progress < 0.5 ? "#9333ea" : "#dc2626"} />
                          <stop offset="100%" stopColor={progress < 0.5 ? "#db2777" : "#ef4444"} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40 + (progress * 6),
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: progress < 0.5 ? '#FFFFFF' : `rgb(255, ${255 - progress * 255}, ${255 - progress * 255})`,
                      textShadow: `0 0 ${10 + progress * 20}px rgba(239, 68, 68, ${progress})`,
                    }}>
                      {secondsLeft}
                    </div>
                  </div>
                );
              })()}
            </div>
          </Sequence>

          {/* ===== RED ANXIETY SCREEN ===== */}
          {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
            const framesIntoTimer = frame - questionStartFrame;
            const secondsRemaining = Math.max(0, Math.ceil((timerDuration - framesIntoTimer) / fps));

            let baseIntensity = 0;
            if (secondsRemaining <= 4) {
              const redProgress = (4 - secondsRemaining) / 4;
              baseIntensity = redProgress * redProgress * 0.5;
            }

            let pulseMultiplier = 1.0;
            if (secondsRemaining <= 3) {
              pulseMultiplier = 1.0 + Math.sin(frame * 0.6) * 0.3;
            }

            const finalIntensity = Math.min(0.6, baseIntensity * pulseMultiplier);

            return (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, ${finalIntensity}) 100%)`,
                pointerEvents: 'none',
                zIndex: 45,
              }} />
            );
          })()}

          {/* ===== GREEN FLASH ===== */}
          <Sequence from={answerRevealFrame} durationInFrames={Math.floor(0.3 * fps)}>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 255, 0, 0.25)',
              opacity: interpolate(frame - answerRevealFrame, [0, 3, 9], [0, 1, 0], { extrapolateRight: 'clamp' }),
              pointerEvents: 'none',
              zIndex: 50,
            }} />
          </Sequence>

        </div>
      </div>

      {/* ===== DIVIDER LINE ===== */}
      <div style={{
        position: 'absolute',
        top: TOP_HEIGHT - 3,
        left: 0,
        right: 0,
        height: 6,
        background: 'linear-gradient(90deg, #9333ea, #db2777, #9333ea)',
        boxShadow: '0 0 30px rgba(147, 51, 234, 0.8)',
        zIndex: 100,
      }} />

    </AbsoluteFill>
  );
};

export default BetaBlockerOverdoseBrainrot;
