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

const timestampsData = require('../../public/assets/audio/digoxin-narration-timestamps.json');

/**
 * DigoxinToxicityAd - BRAIN ROT MEME EDITION
 *
 * Topic: Digoxin Toxicity -> Digoxin Immune Fab (DigiFab)
 * Voice: Grandpa Spuds Oxley
 * Playback: 2.0x
 *
 * Hook: "Grandma doubled her heart pills and now she's seeing YELLOW HALOS"
 * Answer: C) Digoxin immune Fab
 * Common Wrong Answer: A) Calcium gluconate (makes dig tox WORSE!)
 * Teaching: DigiFab binds digoxin, YANKS it out
 */
export const DigoxinToxicityAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== LOCKED CONSTANTS - DO NOT MODIFY =====
  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/digoxin-narration.mp3');

  // ===== KEY TIMESTAMPS (from audio generation) =====
  const questionStartTimeRaw = 30.116;   // First option "A)"
  const answerRevealTimeRaw = 52.686;    // "DigiFab!"
  const videoEndTime = 58.932;           // End of audio

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const videoEndFrame = Math.floor((videoEndTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 30.116,  // Calcium gluconate (WRONG - makes it worse!)
    B: 32.461,  // Atropine
    C: 34.342,  // Digoxin immune Fab (CORRECT)
    D: 36.954,  // Lidocaine
    E: 38.8,    // Magnesium sulfate
  };

  // ===== FULL VIGNETTE TEXT (continuous typewriter) =====
  const fullVignetteText = "Elderly patient doubled her digoxin dose after forgetting she took it. Now presenting with yellow halos, HR 38, vomiting, confusion, K+ 2.9 mEq/L, bizarre EKG.";

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "doubled", color: "#ef4444", bold: true },
    { phrase: "digoxin", color: "#fbbf24", bold: true },
    { phrase: "yellow halos", color: "#fbbf24", bold: true },
    { phrase: "HR 38", color: "#ef4444", bold: true },
    { phrase: "K+ 2.9", color: "#f59e0b", bold: true },
    { phrase: "bizarre EKG", color: "#ef4444", bold: true },
  ];

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  // Answer is C - double-take pattern: scan → C → A? → C!
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

    // PHASE 3: Double-take C→A→C (answer is C, plausible wrong is A)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';   // First look at C
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (calcium like hyperkalemia)?
    return 'C'; // No, definitely C - DigiFab for dig tox!
  };

  const highlightedOption = getHighlightedOption();

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "digoxin-toxicity",
    vignette: "",
    lab_values: [
      {
        label: "Heart rate",
        value: "38 bpm",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 60-100)"
      },
      {
        label: "Potassium",
        value: "2.9 mEq/L",
        status: "low",
        color: "#f59e0b",
        note: "(Normal: 3.5-5.0)"
      }
    ],
    question_text: "Which treatment is most appropriate?",
    options: [
      { letter: "A", text: "Calcium gluconate", is_correct: false },
      { letter: "B", text: "Atropine", is_correct: false },
      { letter: "C", text: "Digoxin immune Fab", is_correct: true },
      { letter: "D", text: "Lidocaine", is_correct: false },
      { letter: "E", text: "Magnesium sulfate", is_correct: false }
    ],
    correct_answer: "C"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 11.947; // "THIRTY-EIGHT"
  const labTimestamps = {
    "Heart rate": 11.947,     // "THIRTY-EIGHT"
    "Potassium": 22.442,      // "TWO POINT NINE"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "doubled", timestamp: 1.881, isCritical: true },
    { phrase: "yellow halos", timestamp: 6.827, isCritical: true },
    { phrase: "HR 38", timestamp: 11.947, isCritical: true },
    { phrase: "K+ 2.9", timestamp: 22.442, isCritical: true },
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
        const typingStartFrame = Math.floor((1.242 / PLAYBACK_RATE) * fps);
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
          <Sequence key="doubletake-a" from={thinkingStartFrame + 53} durationInFrames={10}>
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
        timestampsSource="digoxin"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((11.947 / PLAYBACK_RATE) * fps)}
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
          vignetteStartTimestamp={1.242}
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
          BRAIN ROT MEME EXPLOSION - VIRAL ANIMATED EDITION
          ======================================== */}

      {/* 1. Grandma Double-Dosed (1s) - CHAOS - Pills gif */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-01.mp4"
        timestamp={1.242}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="MINECRAFT OOF.mp3"
        soundVolume={0.5}
        entrance="slideDown"
        exit="fall"
      />

      {/* 2. Yellow Halos Acid Trip (6.8s) - CHAOS - Trippy SpongeBob */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-02.mp4"
        timestamp={6.827}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="WOW.mp3"
        soundVolume={0.4}
        entrance="zoom"
        exit="fade"
      />

      {/* 3. Heart Rate 38 (11.9s) - PANIC - Slow/lame */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-03.mp4"
        timestamp={11.947}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="HUH.mp3"
        soundVolume={0.4}
        entrance="slideLeft"
        exit="fade"
      />

      {/* 4. Closed Casket Warning (18.2s) - DEATH - Funeral */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-04.mp4"
        timestamp={18.262}
        durationInFrames={50}
        position="center"
        scale={0.75}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Metal Boom.mp3"
        soundVolume={0.5}
        entrance="slam"
        exit="fade"
      />

      {/* 5. Tick Tock Dying (41.2s) - DEATH - Time running out */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-05.mp4"
        timestamp={41.203}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="The Screaming Sheep.mp3"
        soundVolume={0.4}
        entrance="slideDown"
        exit="fade"
      />

      {/* 6. Morons Reached for Calcium (44.5s) - ROAST - Trump WRONG */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-06.mp4"
        timestamp={44.558}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BRUH.mp3"
        soundVolume={0.5}
        entrance="slideRight"
        exit="fade"
      />

      {/* 7. Murdered Grandma (47.5s) - DARK_HUMOR - Emotional Damage */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-07.mp4"
        timestamp={47.542}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="OH!!!!!!!.mp3"
        soundVolume={0.5}
        entrance="slam"
        exit="fade"
      />

      {/* 8. DigiFab Saves Grandma (52.6s) - CELEBRATION - Let's Go */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/digoxin/meme-08.mp4"
        timestamp={52.686}
        durationInFrames={55}
        position="center"
        scale={0.75}
        playbackRate={PLAYBACK_RATE}
        soundEffect="DING.mp3"
        soundVolume={0.6}
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
                    stroke="url(#timerGradientDigoxin)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientDigoxin" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default DigoxinToxicityAd;
