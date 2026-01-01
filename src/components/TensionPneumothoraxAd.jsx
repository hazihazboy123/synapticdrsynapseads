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
import { TensionPneumothoraxMechanismEnhanced } from './diagrams/TensionPneumothoraxMechanismEnhanced';

const timestampsData = require('../../public/assets/audio/tension-pneumothorax-timestamps.json');

/**
 * TensionPneumothoraxAd - Needle Decompression
 *
 * Hook: "This patient's lung just became a ONE-WAY DEATH TRAP"
 * Case: Motorcycle accident, intubated, suddenly crashing
 * Answer: B) Needle decompression
 * Trap: A) Chest X-ray (wastes time - clinical diagnosis!)
 * Teaching: One-way valve → tension physiology → mediastinal shift → death
 * Pearl: 2nd ICS midclavicular or 5th ICS anterior axillary
 */
export const TensionPneumothoraxAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/tension-pneumothorax-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 36.885;  // First option "A)"
  const answerRevealTimeRaw = 60.581;   // "B," - answer reveal
  const teachingStartTime = 66.711;     // "JACKASSES" - teaching begins

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 36.885,
    B: 40.403,
    C: 42.388,
    D: 44.640,
    E: 47.183,
  };

  // ===== FULL VIGNETTE TEXT =====
  const fullVignetteText = "A 22-year-old male is brought to the emergency department after a motorcycle accident. He was intubated in the field and initially stable. His oxygen saturation suddenly drops to 82%, blood pressure falls to 70/40 mmHg, and trachea is deviated to the left. Breath sounds are absent on the right. Neck veins are distended.";

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15;

    if (frame < thinkingStartFrame || frame >= answerRevealFrame) {
      return null;
    }

    const framesIntoThinking = frame - thinkingStartFrame;

    // PHASE 1: Quick scan A→B→C→D→E
    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    // PHASE 2: Brief pause
    if (framesIntoThinking < 45) {
      return null;
    }

    // PHASE 3: Double-take B→A→B (answer is B, trap is A)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'B';   // First look at B
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (X-ray)?
    return 'B'; // No, definitely B!
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES =====
  const highlightPhrases = [
    { phrase: "motorcycle accident", color: "#fbbf24", bold: true },
    { phrase: "intubated", color: "#f59e0b", bold: true },
    { phrase: "oxygen saturation suddenly drops", color: "#ef4444", bold: true },
    { phrase: "82%", color: "#ef4444", bold: true },
    { phrase: "blood pressure falls", color: "#ef4444", bold: true },
    { phrase: "70/40", color: "#ef4444", bold: true },
    { phrase: "trachea is deviated", color: "#ef4444", bold: true },
    { phrase: "Breath sounds are absent", color: "#ef4444", bold: true },
    { phrase: "Neck veins are distended", color: "#fbbf24", bold: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "tension-pneumothorax",
    vignette: "",
    lab_values: [
      {
        label: "O2 Sat",
        value: "82%",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 95-100%)"
      },
      {
        label: "BP",
        value: "70/40 mmHg",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 120/80)"
      },
      {
        label: "Trachea",
        value: "Deviated LEFT",
        status: "critical",
        color: "#ef4444",
        note: ""
      },
      {
        label: "Breath sounds",
        value: "Absent R",
        status: "critical",
        color: "#ef4444",
        note: ""
      },
      {
        label: "Neck veins",
        value: "Distended",
        status: "warning",
        color: "#fbbf24",
        note: "(JVD)"
      }
    ],
    question_text: "What is the most appropriate FIRST step in management?",
    options: [
      { letter: "A", text: "Chest X-ray", is_correct: false },
      { letter: "B", text: "Needle decompression", is_correct: true },
      { letter: "C", text: "Emergent intubation", is_correct: false },
      { letter: "D", text: "Pericardiocentesis", is_correct: false },
      { letter: "E", text: "IV fluid bolus", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 18.623; // "SUDDENLY"
  const labTimestamps = {
    "O2 Sat": 20.945,        // "EIGHTY-TWO"
    "BP": 24.126,            // "seventy"
    "Trachea": 28.514,       // "LEFT"
    "Breath sounds": 30.511, // "GONE"
    "Neck veins": 33.019,    // "BULGING"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "motorcycle accident", timestamp: 12.516, isCritical: false },
    { phrase: "82%", timestamp: 20.945, isCritical: true },
    { phrase: "70/40", timestamp: 24.126, isCritical: true },
    { phrase: "LEFT", timestamp: 28.514, isCritical: true },
    { phrase: "Absent", timestamp: 30.511, isCritical: true },
    { phrase: "Distended", timestamp: 33.019, isCritical: false },
  ];

  // ===== MEME TIMING =====
  const shockMomentTimestamp = 3.251; // "DEATH" - shock moment

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>

      {/* ===== BRANDING - Question Phase ===== */}
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

      {/* ===== MAIN AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SOUND EFFECTS ===== */}

      {/* Entrance whoosh */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Typewriter sound during vignette */}
      {(() => {
        const typingStartFrame = Math.floor((10.565 / PLAYBACK_RATE) * fps);
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
        timestampsSource="tension-pneumothorax"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((shockMomentTimestamp / PLAYBACK_RATE) * fps)}
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
          vignetteStartTimestamp={10.565}
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
        imagePath="assets/memes/vlips/vlipsy-borat-great-success-S9m9C3YK.mp4"
        timestamp={answerRevealTimeRaw}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== MECHANISM DIAGRAM ===== */}
      <TensionPneumothoraxMechanismEnhanced
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
                    stroke="url(#timerGradientTensionPneumo)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientTensionPneumo" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default TensionPneumothoraxAd;
