import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
  Video,
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { SickleCellMechanism } from './diagrams/SickleCellMechanism';

const timestampsData = require('../../public/assets/audio/sickle-cell-acute-chest-timestamps.json');

/**
 * SickleCellAcuteChestAd - Sickle Cell Acute Chest Syndrome
 *
 * Based on BetaBlockerOverdoseAd gold standard pattern:
 * - Pure typewriter effect
 * - Speech bubble captions
 * - Mechanism diagram for teaching
 * - No TikTokCaptions
 */
export const SickleCellAcuteChestAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== LOCKED CONSTANTS =====
  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/sickle-cell-acute-chest-narration.mp3');

  // ===== KEY TIMESTAMPS (from generated audio) =====
  const questionStartTimeRaw = 45.604;  // First option "A)"
  const answerRevealTimeRaw = 64.888;   // "exchange" (answer reveal)
  const teachingStartTime = 76.463;     // "SHUT" - teaching begins

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 45.604,
    B: 47.984,
    C: 50.840,
    D: 53.824,
    E: 56.575,
  };

  // ===== FULL VIGNETTE TEXT (for continuous typewriter) =====
  const fullVignetteText = "A 19-year-old woman with sickle cell disease presents with fever, chest pain, and cough for 2 days. She is in respiratory distress with oxygen saturation of 78% on room air. Chest X-ray reveals a new pulmonary infiltrate.";

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

    // PHASE 3: Double-take A→B→B (answer is B - exchange transfusion)
    // Common mistake is A (simple transfusion)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'A';   // First instinct - simple transfusion
    if (doubleTakeFrames < 16) return 'B';  // Wait, exchange?
    return 'B'; // Yes, definitely B!
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
  const highlightPhrases = [
    { phrase: "sickle cell disease", color: "#ef4444", bold: true },
    { phrase: "78%", color: "#ef4444", bold: true },
    { phrase: "respiratory distress", color: "#ef4444", bold: true },
    { phrase: "new pulmonary infiltrate", color: "#fbbf24", bold: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "sickle-cell-acute-chest",
    vignette: "",
    lab_values: [
      {
        label: "O2 Saturation",
        value: "78%",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 95-100%)"
      },
      {
        label: "Hemoglobin",
        value: "6.2 g/dL",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 12-16)"
      },
      {
        label: "Reticulocyte",
        value: "18%",
        status: "elevated",
        color: "#fbbf24",
        note: "(Normal: 0.5-2.5%)"
      },
      {
        label: "HbS Level",
        value: "85%",
        status: "critical",
        color: "#ef4444",
        note: "(Target: <30%)"
      }
    ],
    question_text: "What is the most appropriate next step in management?",
    options: [
      { letter: "A", text: "Simple blood transfusion", is_correct: false },
      { letter: "B", text: "Exchange transfusion", is_correct: true },
      { letter: "C", text: "High-flow oxygen only", is_correct: false },
      { letter: "D", text: "IV antibiotics and observation", is_correct: false },
      { letter: "E", text: "Hydroxyurea", is_correct: false }
    ],
    correct_answer: "B"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 15.627; // "GASPING" - before clinical findings
  const labTimestamps = {
    "O2 Saturation": 36.269,   // "SEVENTY-EIGHT"
    "Hemoglobin": 27.957,      // "hemoglobin"
    "Reticulocyte": 40.530,    // "ROOF" (reticulocyte through the roof)
    "HbS Level": 80.619,       // During teaching - "POLYMERIZING" (HbS context)
  };

  // ===== VIGNETTE HIGHLIGHTS (for lab value boxes) =====
  const vignetteHighlights = [
    { phrase: "sickle cell disease", timestamp: 2.717, isCritical: true },
    { phrase: "respiratory distress", timestamp: 15.627, isCritical: true },
    { phrase: "78%", timestamp: 36.269, isCritical: true },
    { phrase: "pulmonary infiltrate", timestamp: 34.017, isCritical: false },
  ];

  // ===== SHOCK MOMENT =====
  const shockMomentTimestamp = 7.814; // "KILL" - dramatic moment

  // ===== VIDEO MEME TIMESTAMPS =====
  const fishMemeTimestamp = 15.627; // "GASPING" - fish out of water
  const chairBreakTimestamp = 80.619; // "POLYMERIZING" - hemoglobin breaking
  const sickleCellMemeTimestamp = 88.166; // "SICKLES" - anemia falciforme

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

      {/* Branding moved to MedicalQuestionCard component */}

      {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}

      {/* Entrance whoosh */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Option reveal sounds */}
      {Object.entries(optionTimestamps).map(([letter, timestamp]) => {
        const optionFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`option-sound-${letter}`} from={optionFrame} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.5} />
          </Sequence>
        );
      })}

      {/* Typewriter sound - only during actual vignette typing */}
      {(() => {
        const vignetteStartFrame = Math.floor((2.717 / PLAYBACK_RATE) * fps);
        // Calculate actual typing duration based on text length and speed
        const vignetteText = "A 19-year-old woman with sickle cell disease presents with fever, chest pain, and cough for 2 days. She is in respiratory distress with oxygen saturation of 78% on room air. Chest X-ray reveals a new pulmonary infiltrate.";
        const charsPerSecond = 25; // From ContinuousTypewriter default
        const typingDurationSeconds = vignetteText.length / charsPerSecond / PLAYBACK_RATE;
        const typingDurationFrames = Math.floor(typingDurationSeconds * fps);
        const numSounds = Math.floor(typingDurationFrames / 8);

        // Different playback rates for variation (different key pitches)
        const playbackRates = [0.85, 0.95, 1.0, 1.05, 1.15];

        return Array.from({ length: numSounds }).map((_, i) => (
          <Sequence key={`typing-${i}`} from={vignetteStartFrame + (i * 8)} durationInFrames={10}>
            <Audio
              src={staticFile('assets/sfx/typewriter-key.mp3')}
              volume={0.25}
              playbackRate={playbackRates[i % playbackRates.length]}
            />
          </Sequence>
        ));
      })()}

      {/* Typewriter sound - only during actual option typing */}
      {(() => {
        const playbackRates = [0.85, 0.95, 1.0, 1.05, 1.15];
        const charsPerSecond = 40; // From MedicalQuestionCard option typing speed
        const sounds = [];

        // Type sound for each option as it types
        questionData.options.forEach((option, idx) => {
          const optionStartFrame = Math.floor((optionTimestamps[option.letter] / PLAYBACK_RATE) * fps);
          const letterPopDuration = 5; // frames for letter to pop in
          const textStartFrame = optionStartFrame + letterPopDuration;
          const typingDurationFrames = Math.floor((option.text.length / charsPerSecond) * fps);
          const numSounds = Math.floor(typingDurationFrames / 8);

          for (let i = 0; i < numSounds; i++) {
            sounds.push(
              <Sequence key={`option-${option.letter}-${i}`} from={textStartFrame + (i * 8)} durationInFrames={10}>
                <Audio
                  src={staticFile('assets/sfx/typewriter-key.mp3')}
                  volume={0.25}
                  playbackRate={playbackRates[i % playbackRates.length]}
                />
              </Sequence>
            );
          }
        });

        return sounds;
      })()}

      {/* Timer ticking */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
      </Sequence>

      {/* Heartbeat slow */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
      </Sequence>

      {/* Heartbeat PANIC - final 3 seconds */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
      </Sequence>

      {/* Breathing panic */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/breathing.mp3')} volume={0.25} playbackRate={1.3} />
      </Sequence>

      {/* Answer click */}
      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
      </Sequence>

      {/* Success sound */}
      <Sequence from={answerRevealFrame} durationInFrames={60}>
        <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
      </Sequence>

      {/* Teaching transition whoosh */}
      <Sequence from={teachingStartFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* ===== BRAIN MASCOT WITH ATTACHED SPEECH BUBBLE ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-left"
        size={280}
        timestampsSource="sickle-cell-acute-chest"
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
          vignetteStartTimestamp={2.717}
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

      {/* ===== VIDEO MEME - Fish gasping for air (QUESTION PHASE) ===== */}
      <Sequence from={Math.floor((fishMemeTimestamp / PLAYBACK_RATE) * fps)} durationInFrames={60}>
        <AbsoluteFill style={{
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
        }}>
          <Video
            src={staticFile('assets/memes/enbabyfazball-fish.mp4')}
            style={{
              width: '50%',
              height: 'auto',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            volume={0.3}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ===== VIDEO MEME - Chair breaking (TEACHING PHASE - smaller, lower) ===== */}
      <Sequence from={Math.floor((chairBreakTimestamp / PLAYBACK_RATE) * fps)} durationInFrames={90}>
        <AbsoluteFill style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '100px',
          zIndex: 200,
        }}>
          <Video
            src={staticFile('assets/memes/chair-break-broken.mp4')}
            style={{
              width: '35%',
              height: 'auto',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            volume={0.4}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ===== VIDEO MEME - Anemia falciforme (TEACHING PHASE - smaller, lower) ===== */}
      <Sequence from={Math.floor((sickleCellMemeTimestamp / PLAYBACK_RATE) * fps)} durationInFrames={120}>
        <AbsoluteFill style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '100px',
          zIndex: 200,
        }}>
          <Video
            src={staticFile('assets/memes/anemia-falciforme.mp4')}
            style={{
              width: '40%',
              height: 'auto',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            volume={0.5}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ===== ANSWER REVEAL MEME - Roll Safe ===== */}
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

      {/* ===== MECHANISM DIAGRAM ===== */}
      <SickleCellMechanism
        startTime={teachingStartTime}
        playbackRate={PLAYBACK_RATE}
      />

      {/* ===== ANXIETY TIMER - TOP RIGHT (same level as brain) ===== */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (
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
                    stroke="url(#timerGradientSickleCell)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientSickleCell" x1="0%" y1="0%" x2="100%" y2="100%">
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
      )}

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

export default SickleCellAcuteChestAd;
