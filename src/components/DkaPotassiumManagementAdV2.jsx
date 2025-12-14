import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { TeachingCard } from './TeachingCard';

const timestampsData = require('../../public/assets/audio/dka-potassium-management-timestamps.json');

/**
 * DkaPotassiumManagementAdV2 - With Typewriter Vignette!
 *
 * Uses the EXISTING MedicalQuestionCard UI but with typewriter effect
 * for the vignette text. Text builds in sync with Grandpa's narration.
 */
export const DkaPotassiumManagementAdV2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.2;
  const audioPath = staticFile('assets/audio/dka-potassium-management-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 50.526;
  const answerRevealTimeRaw = 70.217;

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 50.526,
    B: 54.067,
    C: 57.655,
    D: 61.393,
    E: 64.679,
  };

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
    if (doubleTakeFrames < 8) return 'B';
    if (doubleTakeFrames < 16) return 'A';
    if (doubleTakeFrames < availableFrames - 45) return 'B';

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== TYPEWRITER VIGNETTE SEGMENTS =====
  // These type in sync with Grandpa's narration - inside the card!
  const vignetteSegments = [
    { text: "19-year-old male", timestamp: 3.599, effect: "typewriter" },
    { text: " found ", timestamp: 5.538, effect: "typewriter" },
    { text: "FACE DOWN", timestamp: 5.851, effect: "slam", isCritical: true },
    { text: " in dorm room. ", timestamp: 6.757, effect: "typewriter" },
    { text: "Fruity breath odor. ", timestamp: 8.661, effect: "typewriter" },
    { text: "Deep, ", timestamp: 18.111, effect: "typewriter" },
    { text: "DESPERATE", timestamp: 18.831, effect: "slam", isCritical: false },
    { text: " breathing. ", timestamp: 19.621, effect: "typewriter" },
    { text: "Blood glucose ", timestamp: 24.996, effect: "typewriter" },
    { text: "500 mg/dL", timestamp: 25.878, effect: "slam", isCritical: true },
    { text: ". Arterial pH ", timestamp: 27.237, effect: "typewriter" },
    { text: "7.1", timestamp: 28.758, effect: "slam", isCritical: true },
    { text: ". Serum ketones ", timestamp: 33.622, effect: "typewriter" },
    { text: "markedly elevated", timestamp: 34.435, effect: "slam", isCritical: true },
    { text: ".", timestamp: 35.5, effect: "typewriter" },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "dka-potassium-management",
    vignette: "", // Not used when vignetteSegments is provided
    lab_values: [
      { label: "Glucose", value: "500 mg/dL", status: "critical", color: "#ef4444", note: "(Normal: 70-100)" },
      { label: "pH", value: "7.1", status: "critical", color: "#ef4444", note: "(Normal: 7.35-7.45)" },
      { label: "Ketones", value: "Markedly elevated", status: "critical", color: "#ef4444", note: "(Normal: Negative)" }
    ],
    question_text: "Before administering insulin, what must be checked FIRST?",
    options: [
      { letter: "A", text: "Hemoglobin A1C", is_correct: false },
      { letter: "B", text: "Serum potassium", is_correct: true },
      { letter: "C", text: "Liver enzymes", is_correct: false },
      { letter: "D", text: "Chest X-ray", is_correct: false },
      { letter: "E", text: "Urine culture", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE REVEAL TIMESTAMPS =====
  const clinicalFindingsTimestamp = 24.5; // Just before "Glucose is FIVE HUNDRED"
  const labTimestamps = {
    "Glucose": 25.878,  // "FIVE HUNDRED"
    "pH": 28.758,       // "SEVEN POINT ONE"
    "Ketones": 34.435,  // "POURIN'"
  };
  const questionTimestamp = 47.96; // "What do you CHECK"

  // ===== SCREEN SHAKE SYSTEM =====
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Shake on SLAM segments
    const slamSegments = vignetteSegments.filter(s => s.effect === 'slam');
    slamSegments.forEach((segment) => {
      const shakeFrame = Math.floor((segment.timestamp / PLAYBACK_RATE) * fps);
      if (frame >= shakeFrame && frame < shakeFrame + 10) {
        const framesIntoShake = frame - shakeFrame;
        const maxIntensity = segment.isCritical ? 8 : 5;
        const intensity = interpolate(framesIntoShake, [0, 4, 10], [0, maxIntensity, 0], {
          extrapolateRight: 'clamp'
        });
        shakeX += Math.sin(frame * 2.5) * intensity;
        shakeY += Math.cos(frame * 2) * intensity;
      }
    });

    return { x: shakeX, y: shakeY };
  };

  const shake = getScreenShake();

  // ===== TEACHING PHASES =====
  const teachingPhases = [
    {
      titleText: "THE POTASSIUM TRAP",
      startTime: 78.262,
      layout: 'split-view',
      elements: [
        { type: 'bullet', iconName: 'warning', iconColor: '#fbbf24', text: 'Serum K+ looks NORMAL on paper', timestamp: 85.925 },
        { type: 'bullet', iconName: 'chart', iconColor: '#ef4444', text: 'Total body K+ is BONE DRY (depleted)', timestamp: 95.341 }
      ]
    },
    {
      titleText: 'WHY INSULIN KILLS',
      startTime: 99.729,
      layout: 'flow-diagram',
      elements: [
        { type: 'bullet', iconName: 'bolt', iconColor: '#9333ea', text: 'Insulin SHOVES K+ into cells', timestamp: 101.262 },
        { type: 'bullet', iconName: 'chart', iconColor: '#ef4444', text: 'Serum K+ drops like a STONE', timestamp: 106.045 },
        { type: 'bullet', iconName: 'warning', iconColor: '#ef4444', text: 'Heart goes into ARREST', timestamp: 108.46 }
      ]
    },
    {
      titleText: 'BOARD PEARL',
      startTime: 109.993,
      layout: 'pearl-card',
      elements: [
        { type: 'text', text: 'CHECK K+', timestamp: 110.55, fontSize: 36 },
        { type: 'text', text: '→', timestamp: 111.455, fontSize: 36 },
        { type: 'text', text: 'REPLACE if low', timestamp: 112.396, fontSize: 36 },
        { type: 'text', text: '→', timestamp: 113.371, fontSize: 36 },
        { type: 'text', text: 'THEN give insulin', timestamp: 114.207, fontSize: 36 }
      ]
    }
  ];

  const teachingStartFrame = Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps);

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
      transform: `translate(${shake.x}px, ${shake.y}px)`
    }}>

      {/* ===== AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
      </Sequence>

      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
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

      {/* Typewriter sounds - multiple clicks per segment for realistic typing */}
      {vignetteSegments.flatMap((segment, idx) => {
        const segmentFrame = Math.floor((segment.timestamp / PLAYBACK_RATE) * fps);
        const textLength = segment.text.length;
        const framesPerChar = 2; // Match TypewriterVignette
        const typingDuration = textLength * framesPerChar;

        // Skip slam effects - they have their own sound
        if (segment.effect === 'slam') return [];

        // Create multiple click sounds throughout the typing (every 3-4 chars)
        const clickCount = Math.max(1, Math.ceil(textLength / 4));
        const clickInterval = Math.floor(typingDuration / clickCount);

        return Array.from({ length: clickCount }, (_, clickIdx) => (
          <Sequence
            key={`typewriter-${idx}-${clickIdx}`}
            from={segmentFrame + (clickIdx * clickInterval)}
            durationInFrames={10}
          >
            <Audio
              src={staticFile('assets/sfx/typewriter-key.mp3')}
              volume={2.5}
            />
          </Sequence>
        ));
      })}

      {/* Slam sounds for critical reveals */}
      {vignetteSegments.filter(s => s.effect === 'slam').map((segment, idx) => {
        const segmentFrame = Math.floor((segment.timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`slam-${idx}`} from={segmentFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/underline-stroke.mp3')} volume={segment.isCritical ? 1.5 : 1.0} startFrom={0.5} />
          </Sequence>
        );
      })}

      {/* Lab value appearance sounds */}
      {Object.entries(labTimestamps).map(([label, timestamp], idx) => {
        const labFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`lab-sound-${idx}`} from={labFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.4} />
          </Sequence>
        );
      })}

      {/* ===== BRAIN MASCOT ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="dka-potassium-management"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((25.878 / PLAYBACK_RATE) * fps)}
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
      />

      {/* ===== QUESTION CARD WITH TYPEWRITER VIGNETTE ===== */}
      {frame < teachingStartFrame && (
        <MedicalQuestionCard
          questionData={questionData}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          vignetteSegments={vignetteSegments}
          optionTimestamps={optionTimestamps}
          zoomMode={true}
          cursorHoverOption={highlightedOption}
          clinicalFindingsTimestamp={clinicalFindingsTimestamp}
          labTimestamps={labTimestamps}
          questionTimestamp={questionTimestamp}
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

      {/* ===== MEME OVERLAYS ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/stop.jpg"
        timestamp={45.313}
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

      {/* ===== ANXIETY TIMER (from EpiduralHematomaAd) ===== */}
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
            const baseZoom = secondsLeft <= 5 ? 1.0 + ((5 - secondsLeft) * 0.08) : 1.0;

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
                  <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="10" />
                  {/* Progress circle with gradient */}
                  <circle
                    cx="70" cy="70" r="50" fill="none"
                    stroke="url(#timerGradientDKA)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientDKA" x1="0%" y1="0%" x2="100%" y2="100%">
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
            background: `radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, ${finalIntensity}) 100%)`,
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
          opacity: interpolate(frame - answerRevealFrame, [0, 3, 9], [0, 1, 0], { extrapolateRight: 'clamp' }),
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      </Sequence>

    </AbsoluteFill>
  );
};

export default DkaPotassiumManagementAdV2;
