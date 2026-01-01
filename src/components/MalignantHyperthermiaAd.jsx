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
import AnimatedMemeOverlay from './AnimatedMemeOverlay';

const timestampsData = require('../../public/assets/audio/malignant-hyperthermia-narration-timestamps.json');

/**
 * MalignantHyperthermiaAd - BRAIN ROT MEME MASTERPIECE
 *
 * Topic: Malignant Hyperthermia → Dantrolene
 * Voice: Grandpa Spuds Oxley
 * Playback: 2.0x
 *
 * Hook: "This man walked in for a HERNIA repair. Now his temp is ONE HUNDRED AND SEVEN"
 * Answer: C) Dantrolene
 * Common Wrong Answer: B) Cooling blankets (LOL - "SQUIRT GUN to a HOUSE FIRE")
 * Teaching: Dantrolene blocks calcium channels, muscles RELAX
 */
export const MalignantHyperthermiaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== LOCKED CONSTANTS - DO NOT MODIFY =====
  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/malignant-hyperthermia-narration.mp3');

  // ===== KEY TIMESTAMPS (from audio generation) =====
  const questionStartTimeRaw = 32.159;   // First option "A)"
  const answerRevealTimeRaw = 45.488;    // "DANTROLENE!"
  const videoEndTime = 75.047;           // End of audio

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const videoEndFrame = Math.floor((videoEndTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 32.159,  // Tylenol
    B: 34.412,  // Cooling blankets (WRONG - the roast bait!)
    C: 36.235,  // Dantrolene (CORRECT)
    D: 37.965,  // Beta blockers
    E: 39.938,  // Epinephrine
  };

  // ===== FULL VIGNETTE TEXT (continuous typewriter) =====
  const fullVignetteText = "Man undergoing routine hernia repair. After succinylcholine, develops severe muscle rigidity, temp climbing to 107°F. OR in full panic mode.";

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "routine hernia", color: "#3b82f6", bold: true },
    { phrase: "succinylcholine", color: "#fbbf24", bold: true },
    { phrase: "severe muscle rigidity", color: "#ef4444", bold: true },
    { phrase: "107°F", color: "#ef4444", bold: true },
    { phrase: "panic mode", color: "#ef4444", bold: true },
  ];

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  // Answer is C - double-take pattern: scan → C → B? → C!
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

    // PHASE 3: Double-take C→B→C (answer is C, plausible wrong is B cooling blankets)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';   // First look at C
    if (doubleTakeFrames < 16) return 'B';  // Wait, maybe B (cooling blankets)?
    return 'C'; // No, definitely C - Dantrolene!
  };

  const highlightedOption = getHighlightedOption();

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "malignant-hyperthermia",
    vignette: "",
    lab_values: [
      {
        label: "Temperature",
        value: "107°F",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 98.6°F)"
      },
      {
        label: "Muscle rigidity",
        value: "Severe",
        status: "critical",
        color: "#ef4444",
        note: "(After succinylcholine)"
      }
    ],
    question_text: "What do you SLAM into this man?",
    options: [
      { letter: "A", text: "Tylenol", is_correct: false },
      { letter: "B", text: "Cooling blankets", is_correct: false },
      { letter: "C", text: "Dantrolene", is_correct: true },
      { letter: "D", text: "Beta blockers", is_correct: false },
      { letter: "E", text: "Epinephrine", is_correct: false }
    ],
    correct_answer: "C"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 9.067; // "ONE HUNDRED AND SEVEN"
  const labTimestamps = {
    "Temperature": 9.067,         // "ONE HUNDRED AND SEVEN"
    "Muscle rigidity": 19.4,      // "RIGID"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "hernia", timestamp: 3.053, isCritical: false },
    { phrase: "succinylcholine", timestamp: 16.602, isCritical: true },
    { phrase: "rigidity", timestamp: 19.4, isCritical: true },
    { phrase: "107°F", timestamp: 9.067, isCritical: true },
  ];

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

      {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}

      {/* Entrance whoosh */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Typewriter sound - continuous typing audio */}
      {(() => {
        const typingStartFrame = Math.floor((1.254 / PLAYBACK_RATE) * fps);
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

      {/* ===== TENSION MUSIC - Builds anxiety during question phase ===== */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio
          src={staticFile('assets/sfx/thinking-music/anxiety-tension.mp3')}
          volume={(f) => {
            const progress = f / timerDuration;
            const baseVolume = 0.15;
            const maxVolume = 0.45;
            return baseVolume + (maxVolume - baseVolume) * (progress * progress);
          }}
          playbackRate={1.1}
        />
      </Sequence>

      {/* Heartbeat - normal phase */}
      {timerDuration > 90 && (
        <Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
          <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
        </Sequence>
      )}

      {/* Heartbeat - PANIC MODE (final 3 seconds) */}
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

        return [...phase1Clicks, ...phase3Clicks];
      })()}

      {/* Answer reveal sounds */}
      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
      </Sequence>

      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
      </Sequence>

      {/* ===== BRAIN MASCOT WITH ATTACHED SPEECH BUBBLE ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-left"
        size={280}
        timestampsSource="malignant-hyperthermia"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((9.067 / PLAYBACK_RATE) * fps)}
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
      {frame < videoEndFrame && (
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
          cardTopOffset={480}
        />
      )}

      {/* ========================================
          BRAIN ROT MEMES - TRIMMED & SPACED
          Only the KEY moments that LAND
          ======================================== */}

      {/* 1. HERNIA (3.05s) - "wait that's it?" - confused reaction */}
      <AnimatedMemeOverlay
        imagePath="vlipsy-videos/russell-westbrook-what-bro.mp4"
        timestamp={3.053}
        durationInFrames={45}
        position="center"
        scale={0.95}
        playbackRate={PLAYBACK_RATE}
        soundVolume={0.7}
        entrance="slideDown"
        exit="fade"
      />


      {/* 3. RIGID as a FENCE POST (19.4s) - IShowSpeed WHAT - 1-2 sec w/ sound */}
      <AnimatedMemeOverlay
        imagePath="vlipsy-videos/what-ishowspeed.mp4"
        timestamp={19.4}
        durationInFrames={45}
        position="center"
        scale={0.95}
        playbackRate={PLAYBACK_RATE}
        soundVolume={0.8}
        entrance="slam"
        exit="fade"
      />

      {/* 4. PANIC mode (26.97s) - scared dog */}
      <AnimatedMemeOverlay
        imagePath="vlipsy-videos/scared-dog.mp4"
        timestamp={26.97}
        durationInFrames={45}
        position="center"
        scale={0.9}
        playbackRate={PLAYBACK_RATE}
        soundVolume={0.7}
        entrance="zoom"
        exit="fade"
      />

      {/* 5. DANTROLENE! (46.5s) - NOICE - start later, let him finish "nice" */}
      <AnimatedMemeOverlay
        imagePath="vlipsy-videos/noice-michael-rosen.mp4"
        timestamp={46.5}
        durationInFrames={100}
        position="center"
        scale={1.1}
        playbackRate={PLAYBACK_RATE}
        soundVolume={0.8}
        entrance="bounce"
        exit="fade"
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
                    stroke="url(#timerGradientMH)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientMH" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default MalignantHyperthermiaAd;
