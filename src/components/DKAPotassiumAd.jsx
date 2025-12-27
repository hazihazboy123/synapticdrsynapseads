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
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { DKAPotassiumMechanism } from './diagrams/DKAPotassiumMechanism';
import SAFE_ZONES from '../constants/safeZones';

const timestampsData = require('../../public/assets/audio/dka-potassium-management-timestamps.json');

/**
 * DKAPotassiumAd - DKA Potassium Management
 *
 * The classic "gotcha" - students rush to slam insulin but forget
 * to check potassium first and stop the patient's heart.
 *
 * Based on GOLD STANDARD: BetaBlockerOverdoseAd template
 */
export const DKAPotassiumAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/dka-potassium-management-narration.mp3');

  // ===== KEY TIMESTAMPS (from audio) =====
  const questionStartTimeRaw = 50.526;   // "A," - first option
  const answerRevealTimeRaw = 70.217;    // "B," answer reveal

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 50.526,   // "A, Hemoglobin A1C?"
    B: 54.067,   // "B, Serum potassium?"
    C: 57.655,   // "C, Liver enzymes?"
    D: 61.393,   // "D, Chest X-ray?"
    E: 64.679,   // "E, Urine culture?"
  };

  // ===== FULL VIGNETTE TEXT =====
  const fullVignetteText = "A 19-year-old college student is found unresponsive in his dorm room. Roommate reports fruity breath odor. He has deep, rapid respirations and is severely lethargic.";

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15;

    if (frame < thinkingStartFrame || frame >= answerRevealFrame) {
      return null;
    }

    const framesIntoThinking = frame - thinkingStartFrame;
    const availableFrames = answerRevealFrame - thinkingStartFrame;

    // PHASE 1: Quick scan A→B→C→D→E
    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    // PHASE 2: Brief pause
    if (framesIntoThinking < 45) {
      return null;
    }

    // PHASE 3: Double-take B→A→B (answer is B, but A seems tempting)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'B';   // First look at B
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (A1C)?
    if (doubleTakeFrames < availableFrames - 45) return 'B'; // No, definitely B!

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "unresponsive", color: "#ef4444", bold: true },
    { phrase: "fruity breath odor", color: "#fbbf24", bold: true },
    { phrase: "deep, rapid respirations", color: "#ef4444", bold: true },
    { phrase: "severely lethargic", color: "#ef4444", bold: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 2,
    topic: "dka-potassium-management",
    vignette: "",
    lab_values: [
      {
        label: "Glucose",
        value: "500 mg/dL",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 70-100)"
      },
      {
        label: "pH",
        value: "7.1",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 7.35-7.45)"
      },
      {
        label: "Potassium",
        value: "4.8 mEq/L",
        status: "normal",
        color: "#22c55e",
        note: "(Normal: 3.5-5.0)"
      }
    ],
    question_text: "What must you CHECK before giving insulin?",
    options: [
      { letter: "A", text: "Hemoglobin A1C", is_correct: false },
      { letter: "B", text: "Serum potassium", is_correct: true },
      { letter: "C", text: "Liver enzymes", is_correct: false },
      { letter: "D", text: "Chest X-ray", is_correct: false },
      { letter: "E", text: "Urine culture", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 24.0;
  const labTimestamps = {
    "Glucose": 24.996,       // "Glucose is FIVE HUNDRED"
    "pH": 27.237,            // "pH is down to SEVEN POINT ONE"
    "Potassium": 84.566,     // "potassium" - appears later during teaching
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "unresponsive", timestamp: 5.851, isCritical: true },
    { phrase: "fruity breath", timestamp: 8.661, isCritical: true },
    { phrase: "500 mg/dL", timestamp: 25.878, isCritical: true },
    { phrase: "7.1", timestamp: 28.758, isCritical: true },
    { phrase: "4.8 mEq/L", timestamp: 84.566, isCritical: false },
  ];

  // ===== TEACHING PHASE =====
  const teachingStartTime = 78.262; // "SIMMER DOWN" - teaching begins
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 42.295; // "SLAM insulin" - eager beaver moment

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

      {/* Branding */}
      {frame < teachingStartFrame && (
        <div
          style={{
            position: 'absolute',
            top: 515,
            left: 150,
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            zIndex: 150,
            background: 'linear-gradient(135deg, #9333ea, #db2777, #9333ea)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          synapticrecall.ai
        </div>
      )}

      {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Typewriter sound */}
      {(() => {
        const typingStartFrame = Math.floor((3.599 / PLAYBACK_RATE) * fps);
        const typingDurationSeconds = fullVignetteText.length / 20;
        const typingDurationFrames = Math.floor((typingDurationSeconds / PLAYBACK_RATE) * fps);

        return (
          <Sequence from={typingStartFrame} durationInFrames={typingDurationFrames}>
            <Audio src={staticFile('assets/sfx/typewriter-typing.mp3')} volume={0.8} />
          </Sequence>
        );
      })()}

      {/* Lab value sounds */}
      {Object.entries(labTimestamps).map(([label, timestamp], idx) => {
        const labFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`lab-sound-${idx}`} from={labFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.5} />
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
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
      </Sequence>

      {/* Heartbeat - normal phase */}
      {timerDuration > 90 && (
        <Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
          <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
        </Sequence>
      )}

      {/* Heartbeat - PANIC MODE */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
      </Sequence>

      {/* Breathing - panic layer */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/breathing.mp3')} volume={0.25} playbackRate={1.3} />
      </Sequence>

      {/* Double-take clicks */}
      {(() => {
        const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
        const thinkingStartFrame = lastOptionFrame + 15;

        const phase1Clicks = [0, 8, 16, 24, 32].map((offset, idx) => (
          <Sequence key={`phase1-click-${idx}`} from={thinkingStartFrame + offset} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.0} />
          </Sequence>
        ));

        const phase3Clicks = [
          <Sequence key="doubletake-b1" from={thinkingStartFrame + 45} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.1} />
          </Sequence>,
          <Sequence key="doubletake-a" from={thinkingStartFrame + 53} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.1} />
          </Sequence>,
          <Sequence key="doubletake-b2" from={thinkingStartFrame + 61} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.2} />
          </Sequence>,
        ];

        return [...phase1Clicks, ...phase3Clicks];
      })()}

      {/* Answer reveal sounds */}
      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
      </Sequence>

      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
      </Sequence>

      {/* Teaching phase transition sound */}
      <Sequence from={teachingStartFrame} durationInFrames={20}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* ===== BRAIN MASCOT WITH ATTACHED SPEECH BUBBLE ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-left"
        size={280}
        timestampsSource="dka-potassium-management"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((25.878 / PLAYBACK_RATE) * fps)} // "FIVE HUNDRED"
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
        customTop={250}
        customLeft={120}
        showSpeechBubble={true}
        speechBubbleWords={timestampsData.words}
        speechBubbleSize={{ width: 180, height: 100 }}
        speechBubbleFontSize={20}
      />

      {/* ===== QUESTION CARD WITH CONTINUOUS TYPEWRITER ===== */}
      {frame < teachingStartFrame && (
        <MedicalQuestionCard
          questionData={questionData}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          fullVignetteText={fullVignetteText}
          vignetteStartTimestamp={3.599}
          highlightPhrases={highlightPhrases}
          vignetteHighlights={vignetteHighlights}
          optionTimestamps={optionTimestamps}
          zoomMode={false}
          cursorHoverOption={highlightedOption}
          clinicalFindingsTimestamp={clinicalFindingsTimestamp}
          labTimestamps={labTimestamps}
          cardTopOffset={480}
        />
      )}

      {/* ===== ANSWER REVEAL MEME ===== */}
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

      {/* ===== MECHANISM DIAGRAM - THE STAR OF THE SHOW ===== */}
      <DKAPotassiumMechanism
        startTime={teachingStartTime}
        playbackRate={PLAYBACK_RATE}
      />

      {/* ===== ANXIETY TIMER - TOP RIGHT ===== */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <div style={{
          position: 'absolute',
          top: 250,
          right: 145,
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
                width: 130,
                height: 130,
                transform: `translate(${shakeX}px, ${shakeY}px) scale(${pulseScale * baseZoom})`,
                filter: `drop-shadow(0 0 ${20 * progress}px rgba(239, 68, 68, ${redIntensity * 0.8}))`,
              }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="10" />
                  <circle
                    cx="65" cy="65" r="52" fill="none"
                    stroke="url(#timerGradientDKA)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
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
                  fontSize: 52 + (progress * 8),
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

export default DKAPotassiumAd;
