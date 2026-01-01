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
// Mechanism diagram removed - video cuts after GABA receptors

const timestampsData = require('../../public/assets/audio/opioid-overdose-timestamps.json');

/**
 * OpioidOverdoseAd - SCENE-BASED ARCHITECTURE
 *
 * Topic: Opioid Overdose → Naloxone
 * Voice: Grandpa Spuds Oxley
 * Playback: 2.0x
 *
 * Hook: "SWEET MOTHER OF MERCY, this man's lips are BLUER than a SMURF"
 * Answer: B) Naloxone
 * Common Wrong Answer: A) Flumazenil (benzo reversal, not opioid)
 */
export const OpioidOverdoseAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== LOCKED CONSTANTS - DO NOT MODIFY =====
  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/opioid-overdose-narration.mp3');

  // ===== KEY TIMESTAMPS (from audio generation) =====
  const questionStartTimeRaw = 38.614;  // First option "A)"
  const answerRevealTimeRaw = 54.670;   // "naloxone!"
  const teachingStartTime = 69.078;     // "LISTEN UP"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 38.614,  // Flumazenil
    B: 40.564,  // Naloxone (CORRECT)
    C: 42.585,  // Activated charcoal
    D: 45.023,  // Physostigmine
    E: 47.287,  // Atropine
  };

  // ===== FULL VIGNETTE TEXT (continuous typewriter) =====
  const fullVignetteText = "A 32-year-old man is found unresponsive in a gas station bathroom. He has pinpoint pupils, cyanotic lips, and minimal respiratory effort. A needle is found nearby.";

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "unresponsive", color: "#ef4444", bold: true },
    { phrase: "pinpoint pupils", color: "#fbbf24", bold: true },
    { phrase: "cyanotic", color: "#3b82f6", bold: true },
    { phrase: "minimal respiratory effort", color: "#ef4444", bold: true },
    { phrase: "needle", color: "#ef4444", bold: true },
  ];

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  // Answer is B - double-take pattern: scan → B → A? → B!
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

    // PHASE 3: Double-take B→A→B (answer is B, plausible wrong is A)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'B';   // First look at B
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (flumazenil)?
    return 'B'; // No, definitely B!
  };

  const highlightedOption = getHighlightedOption();

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "opioid-overdose",
    vignette: "",
    lab_values: [
      {
        label: "Respiratory rate",
        value: "4/min",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 12-20)"
      },
      {
        label: "O2 Saturation",
        value: "74%",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 95-100%)"
      },
      {
        label: "Pupils",
        value: "Pinpoint",
        status: "critical",
        color: "#fbbf24",
        note: "(Miosis)"
      }
    ],
    question_text: "What is the most appropriate IMMEDIATE treatment?",
    options: [
      { letter: "A", text: "Flumazenil", is_correct: false },
      { letter: "B", text: "Naloxone", is_correct: true },
      { letter: "C", text: "Activated charcoal", is_correct: false },
      { letter: "D", text: "Physostigmine", is_correct: false },
      { letter: "E", text: "Atropine", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 15.778; // "Pupils?"
  const labTimestamps = {
    "Respiratory rate": 20.073,  // "FOUR"
    "O2 Saturation": 22.0,       // Shortly after
    "Pupils": 17.055,            // "PINPOINT"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "unresponsive", timestamp: 4.0, isCritical: true },
    { phrase: "pinpoint pupils", timestamp: 17.055, isCritical: true },
    { phrase: "cyanotic", timestamp: 3.32, isCritical: true },
    { phrase: "4/min", timestamp: 20.073, isCritical: true },
    { phrase: "74%", timestamp: 22.0, isCritical: true },
  ];

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 4.110; // "SMURF" - dark humor moment

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

      {/* Branding removed for brain rot version */}

      {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}

      {/* Entrance whoosh */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Typewriter sound - continuous typing audio */}
      {(() => {
        const typingStartFrame = Math.floor((2.322 / PLAYBACK_RATE) * fps);
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
        timestampsSource="opioid-overdose"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((20.073 / PLAYBACK_RATE) * fps)}
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
          vignetteStartTimestamp={2.322}
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
          BRAIN ROT MEME EXPLOSION - 25+ OVERLAYS
          Maximum visual chaos for virality
          ======================================== */}

      {/* 1. SWEET MOTHER OF MERCY (0.4s) - shocked face - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/shocked-face.mp4"
        timestamp={0.4}
        durationInFrames={40}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="WOW.mp3"
        soundVolume={0.4}
        frameOffset={0}
      />

      {/* 2. BLUER (3.32s) - blue/cold face */}
      <StaticMemeOverlay
        imagePath="assets/memes/blue-face.mp4"
        timestamp={3.32}
        durationInFrames={20}
        position="center"
        scale={0.45}
        playbackRate={PLAYBACK_RATE}
        soundEffect="boing.mp3"
        soundVolume={0.3}
        frameOffset={0}
      />

      {/* 3. SMURF (4.11s) - smurf image */}
      <StaticMemeOverlay
        imagePath="assets/memes/smurf.jpg"
        timestamp={4.11}
        durationInFrames={40}
        position="center"
        scale={0.6}
        playbackRate={PLAYBACK_RATE}
        soundEffect="pop.mp3"
        soundVolume={0.5}
        frameOffset={0}
      />

      {/* 4. breathed (5.5s) - lungs */}
      <StaticMemeOverlay
        imagePath="assets/memes/lungs-breathing.mp4"
        timestamp={5.5}
        durationInFrames={22}
        position="bottom-right"
        scale={0.35}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 5. TWICE (7.0s) - number 2 - EXTENDED (big gap to 10.5s) */}
      <StaticMemeOverlay
        imagePath="assets/memes/number-two.mp4"
        timestamp={7.0}
        durationInFrames={45}
        position="top-right"
        scale={0.3}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 6. gas station bathroom (10.5s) - gross bathroom */}
      <StaticMemeOverlay
        imagePath="assets/memes/bathroom-gross.mp4"
        timestamp={10.5}
        durationInFrames={28}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BRUH.mp3"
        soundVolume={0.4}
        frameOffset={0}
      />

      {/* 7. NEEDLE (12.75s) - syringe - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/needle-syringe.mp4"
        timestamp={12.75}
        durationInFrames={55}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect="OH!!!!!!!.mp3"
        soundVolume={0.4}
        frameOffset={0}
      />

      {/* 8. PINPOINT pupils (17.05s) - eyes - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/pinpoint-eyes.mp4"
        timestamp={17.05}
        durationInFrames={40}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="HUH.mp3"
        soundVolume={0.35}
        frameOffset={0}
      />

      {/* 9. FOUR breaths (20.07s) - number 4 - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/number-four.mp4"
        timestamp={20.07}
        durationInFrames={55}
        position="top-right"
        scale={0.3}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 10. SCREAMIN' (24.5s) - internal screaming - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/screaming-internal.mp4"
        timestamp={24.5}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect="The Screaming Sheep.mp3"
        soundVolume={0.4}
        frameOffset={0}
      />

      {/* 11. back surgery (28.4s) - surgery - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/surgery.mp4"
        timestamp={28.4}
        durationInFrames={45}
        position="bottom-right"
        scale={0.4}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 12. DIE (31.98s) - skull death - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/skull-death.mp4"
        timestamp={31.98}
        durationInFrames={55}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Metal Boom.mp3"
        soundVolume={0.5}
        frameOffset={0}
      />

      {/* 13. filthy bathroom - REMOVED (anime) */}

      {/* 14. SNATCH (36.43s) - grab/catch */}
      <StaticMemeOverlay
        imagePath="assets/memes/grab-snatch.mp4"
        timestamp={36.43}
        durationInFrames={22}
        position="center"
        scale={0.45}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 15. grave (38.2s) - Squidward gravestone - EXTENDED (big gap to 49s) */}
      <StaticMemeOverlay
        imagePath="assets/memes/gravestone.mp4"
        timestamp={38.2}
        durationInFrames={80}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Sadness-1.mp3"
        soundVolume={0.3}
        frameOffset={0}
      />

      {/* 16-20. Drug choice memes - REMOVED (don't make sense during options) */}

      {/* 21. TICK TOCK (49.05s) - sweating stress */}
      <StaticMemeOverlay
        imagePath="assets/memes/sweating-stress.mp4"
        timestamp={49.05}
        durationInFrames={30}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="HUH.mp3"
        soundVolume={0.45}
        frameOffset={0}
      />

      {/* 22. DILLY-DALLY (51.57s) - wasting time */}
      <StaticMemeOverlay
        imagePath="assets/memes/wasting-time.mp4"
        timestamp={51.57}
        durationInFrames={22}
        position="center"
        scale={0.45}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 23. brain cell DYIN' (52.44s) - galaxy brain */}
      <StaticMemeOverlay
        imagePath="assets/memes/galaxy-brain.mp4"
        timestamp={52.44}
        durationInFrames={25}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="MINECRAFT OOF.mp3"
        soundVolume={0.4}
        frameOffset={0}
      />

      {/* 24. ANSWER REVEAL - naloxone! (54.67s) - pointing Leonardo */}
      <StaticMemeOverlay
        imagePath="assets/memes/pointing-leonardo.mp4"
        timestamp={answerRevealTimeRaw}
        durationInFrames={45}
        position="center"
        scale={0.6}
        playbackRate={PLAYBACK_RATE}
        soundEffect="DING.mp3"
        soundVolume={0.6}
        frameOffset={0}
      />

      {/* 25. GENIUSES (56.3s) - sarcastic clap - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/sarcastic-clap.mp4"
        timestamp={56.3}
        durationInFrames={55}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="RIMSHOT.mp3"
        soundVolume={0.35}
        frameOffset={0}
      />

      {/* 26. OPIOID (60.82s) - opioid pill */}
      <StaticMemeOverlay
        imagePath="assets/memes/opioid-pill.mp4"
        timestamp={60.82}
        durationInFrames={25}
        position="center"
        scale={0.45}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 27. BENZO (62.0s) - pills again - EXTENDED */}
      <StaticMemeOverlay
        imagePath="assets/memes/pills-drugs.mp4"
        timestamp={62.0}
        durationInFrames={45}
        position="center"
        scale={0.45}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* 28. FLATLINED (65.58s) - flatline monitor */}
      <StaticMemeOverlay
        imagePath="assets/memes/flatline.mp4"
        timestamp={65.58}
        durationInFrames={35}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect="TBC.mp3"
        soundVolume={0.5}
        frameOffset={0}
      />

      {/* 29. GABA receptors (68.2s) - brain neurons */}
      <StaticMemeOverlay
        imagePath="assets/memes/brain-neurons.mp4"
        timestamp={68.2}
        durationInFrames={30}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BOOMBAMBOP.mp3"
        soundVolume={0.4}
        frameOffset={0}
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
                    stroke="url(#timerGradientOpioid)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientOpioid" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default OpioidOverdoseAd;
