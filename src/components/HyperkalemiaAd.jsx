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

const timestampsData = require('../../public/assets/audio/hyperkalemia-timestamps.json');

/**
 * HyperkalemiaAd - BRAIN ROT MEME EDITION
 *
 * Topic: Hyperkalemia (K+ 7.8) -> Calcium Gluconate
 * Voice: Grandpa Spuds Oxley
 * Playback: 2.0x
 *
 * Hook: "This man's heart is about to FLATLINE and he just asked me if he'll make his CRUISE"
 * Answer: B) Calcium gluconate
 * Common Wrong Answer: A) Insulin (fixes the NUMBER but doesn't stabilize the heart)
 * Teaching: Calcium is a BOUNCER - stabilizes the heart while you fix the actual problem
 */
export const HyperkalemiaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== LOCKED CONSTANTS - DO NOT MODIFY =====
  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/hyperkalemia-narration.mp3');

  // ===== KEY TIMESTAMPS (from audio generation) =====
  const questionStartTimeRaw = 37.871;  // First option "A)"
  const answerRevealTimeRaw = 56.308;   // "gluconate!"
  const teachingStartTime = 68.475;     // "Calcium's a BOUNCER"
  const videoEndTime = 81.27;           // End of audio

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);
  const videoEndFrame = Math.floor((videoEndTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 37.871,  // Insulin (WRONG - fixes number not heart)
    B: 39.624,  // Calcium gluconate (CORRECT - stabilizes heart)
    C: 42.213,  // Kayexalate
    D: 44.709,  // Albuterol
    E: 47.078,  // Furosemide
  };

  // ===== FULL VIGNETTE TEXT (continuous typewriter) =====
  const fullVignetteText = "A dialysis patient skipped THREE WEEKS of treatment for a trip to the Bahamas. Now presents with K+ of 7.8 mEq/L. EKG shows widened QRS complexes and peaked T-waves.";

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "dialysis", color: "#fbbf24", bold: true },
    { phrase: "THREE WEEKS", color: "#ef4444", bold: true },
    { phrase: "7.8", color: "#ef4444", bold: true },
    { phrase: "widened QRS", color: "#ef4444", bold: true },
    { phrase: "peaked T-waves", color: "#fbbf24", bold: true },
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
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (insulin to fix number)?
    return 'B'; // No, definitely B - stabilize the heart first!
  };

  const highlightedOption = getHighlightedOption();

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 2,
    topic: "hyperkalemia",
    vignette: "",
    lab_values: [
      {
        label: "Potassium",
        value: "7.8 mEq/L",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 3.5-5.0)"
      },
      {
        label: "EKG",
        value: "Wide QRS",
        status: "critical",
        color: "#ef4444",
        note: "(Peaked T-waves)"
      },
      {
        label: "Dialysis",
        value: "3 weeks missed",
        status: "critical",
        color: "#fbbf24",
        note: "(Non-compliant)"
      }
    ],
    question_text: "What do you slam into this man FIRST?",
    options: [
      { letter: "A", text: "Insulin", is_correct: false },
      { letter: "B", text: "Calcium gluconate", is_correct: true },
      { letter: "C", text: "Kayexalate", is_correct: false },
      { letter: "D", text: "Albuterol", is_correct: false },
      { letter: "E", text: "Furosemide", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 18.715; // "potassium"
  const labTimestamps = {
    "Potassium": 20.039,     // "SEVEN POINT EIGHT"
    "EKG": 28.375,           // "QRS"
    "Dialysis": 15.372,      // "THREE WEEKS"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "dialysis", timestamp: 13.874, isCritical: true },
    { phrase: "THREE WEEKS", timestamp: 15.372, isCritical: true },
    { phrase: "7.8", timestamp: 20.039, isCritical: true },
    { phrase: "widened QRS", timestamp: 28.375, isCritical: true },
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
        const typingStartFrame = Math.floor((2.0 / PLAYBACK_RATE) * fps);
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
            // Start subtle, build to intense
            const progress = f / timerDuration;
            const baseVolume = 0.15;
            const maxVolume = 0.45;
            // Exponential build for more dramatic effect
            return baseVolume + (maxVolume - baseVolume) * (progress * progress);
          }}
          playbackRate={1.1} // Slightly faster for more urgency
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
        timestampsSource="hyperkalemia"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((20.039 / PLAYBACK_RATE) * fps)}
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
          vignetteStartTimestamp={2.0}
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
          Different entrance/exit animations for variety
          ======================================== */}

      {/* 1. FLATLINE - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-01.mp4"
        timestamp={1.486}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="MINECRAFT OOF.mp3"
        soundVolume={0.5}
        entrance="slideDown"
        exit="fade"
      />

      {/* 2. CRUISE - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-02.mp4"
        timestamp={4.957}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="WOW.mp3"
        soundVolume={0.4}
        entrance="slideRight"
        exit="fade"
      />

      {/* 3. SIR. SIR. - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-03.mp4"
        timestamp={7.256}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="HUH.mp3"
        soundVolume={0.4}
        entrance="slideLeft"
        exit="fade"
      />

      {/* 4. JAZZ - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-04.mp4"
        timestamp={10.101}
        durationInFrames={50}
        position="center"
        scale={0.75}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BOOMBAMBOP.mp3"
        soundVolume={0.5}
        entrance="bounce"
        exit="fade"
      />

      {/* 5. BAHAMAS - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-05.mp4"
        timestamp={16.846}
        durationInFrames={40}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="boing.mp3"
        soundVolume={0.35}
        entrance="slideUp"
        exit="fade"
      />

      {/* 6. SEVEN POINT EIGHT - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-06.mp4"
        timestamp={20.039}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="OH!!!!!!!.mp3"
        soundVolume={0.5}
        entrance="slam"
        exit="fade"
      />

      {/* 7. THREAT - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-07.mp4"
        timestamp={23.139}
        durationInFrames={45}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Metal Boom.mp3"
        soundVolume={0.45}
        entrance="slideRight"
        exit="fade"
      />

      {/* 8. CHEESECAKE FACTORY - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-08.mp4"
        timestamp={29.698}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BRUH.mp3"
        soundVolume={0.4}
        entrance="slideLeft"
        exit="fade"
      />

      {/* 9. WASHING MACHINE - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-09.mp4"
        timestamp={34.063}
        durationInFrames={40}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="RIMSHOT.mp3"
        soundVolume={0.35}
        entrance="bounce"
        exit="fade"
      />

      {/* 10. TICK TOCK - slideDown/fade (SAFE) */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/hk-clock.mp4"
        timestamp={49.353}
        durationInFrames={40}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="The Screaming Sheep.mp3"
        soundVolume={0.4}
        entrance="slideDown"
        exit="fade"
      />

      {/* 11. FORTY FIVE SECONDS - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-11.mp4"
        timestamp={52.918}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="TBC.mp3"
        soundVolume={0.45}
        entrance="bounce"
        exit="fade"
      />

      {/* 12. ANSWER - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-12.mp4"
        timestamp={56.308}
        durationInFrames={55}
        position="center"
        scale={0.75}
        playbackRate={PLAYBACK_RATE}
        soundEffect="DING.mp3"
        soundVolume={0.6}
        entrance="slam"
        exit="fade"
      />

      {/* 13. sweet summer children - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-13.mp4"
        timestamp={60.766}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Sadness-1.mp3"
        soundVolume={0.4}
        entrance="slideRight"
        exit="fade"
      />

      {/* 14. HARLEM SHAKE - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-14.mp4"
        timestamp={65.479}
        durationInFrames={45}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Wait a minute....mp3"
        soundVolume={0.45}
        entrance="slideUp"
        exit="fade"
      />

      {/* 15. BOUNCER - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-15.mp4"
        timestamp={69.636}
        durationInFrames={50}
        position="center"
        scale={0.7}
        playbackRate={PLAYBACK_RATE}
        soundEffect="pop.mp3"
        soundVolume={0.4}
        entrance="slideLeft"
        exit="fade"
      />

      {/* 16. LOSING MIND - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-16.mp4"
        timestamp={73.06}
        durationInFrames={45}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="BOOMBAMBOP.mp3"
        soundVolume={0.4}
        entrance="slideUp"
        exit="fade"
      />

      {/* 17. NO CRUISE - MP4 */}
      <AnimatedMemeOverlay
        imagePath="assets/memes/meme-17.mp4"
        timestamp={80.294}
        durationInFrames={40}
        position="center"
        scale={0.65}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Sadness-1.mp3"
        soundVolume={0.35}
        entrance="zoom"
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
                    stroke="url(#timerGradientHyperkalemia)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientHyperkalemia" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default HyperkalemiaAd;
