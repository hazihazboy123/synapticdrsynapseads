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
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { BetaBlockerMechanismV2 } from './diagrams/BetaBlockerMechanismV2';
import SAFE_ZONES from '../constants/safeZones';

const timestampsData = require('../../public/assets/audio/beta-blocker-overdose-timestamps.json');

/**
 * BetaBlockerOverdoseAd - PURE TYPEWRITER EDITION
 *
 * Simplified to focus on continuous typewriter effect:
 * - ALL text types out character by character
 * - No zoom effects, no screen shake - just typewriter
 * - Always something moving on screen
 * - Clean, readable, engaging
 */
export const BetaBlockerOverdoseAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.9;
  const audioPath = staticFile('assets/audio/beta-blocker-overdose-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 32.322;  // First option "A)"
  const answerRevealTimeRaw = 47.091;   // "glucagon!"

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

  // ===== FULL VIGNETTE TEXT (for continuous typewriter) =====
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

    // PHASE 1: Quick scan A→B→C→D→E
    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    // PHASE 2: Brief pause
    if (framesIntoThinking < 45) {
      return null;
    }

    // PHASE 3: Double-take C→A→C (answer is C)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';   // First look at C
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (atropine)?
    if (doubleTakeFrames < availableFrames - 45) return 'C'; // No, definitely C!

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES (styled while typing) =====
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
    vignette: "", // Using vignetteSegments for typewriter
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

  // ===== PROGRESSIVE LAB REVEAL =====
  // Labs appear when Dr. Synapse says them
  const clinicalFindingsTimestamp = 12.5; // Just before "Heart rate?"
  const labTimestamps = {
    "Heart rate": 12.666,      // "Heart rate?"
    "Blood pressure": 17.02,   // "Blood pressure?"
    "Glucose": 27.376,         // "SIXTY-TWO"
  };

  // ===== VIGNETTE HIGHLIGHTS (for lab value boxes) =====
  const vignetteHighlights = [
    { phrase: "intentional propranolol overdose", timestamp: 2.276, isCritical: true },
    { phrase: "Lethargic", timestamp: 25.519, isCritical: false },
    { phrase: "32 bpm", timestamp: 13.874, isCritical: true },
    { phrase: "70/40", timestamp: 18.425, isCritical: true },
    { phrase: "62 mg/dL", timestamp: 27.376, isCritical: false },
  ];

  // ===== TEACHING PHASE =====
  // The mechanism diagram is now the star - it handles all teaching visuals
  const teachingStartTime = 67.060; // "SHUT UP" - when teaching begins
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);

  // (Screen shake removed - keeping it clean)

  // ===== MEME TIMING =====
  const contextualMemeTimestamp = 29.513; // "QUIT" - ticker about to quit

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

        {/* Branding - Left of Practice Question #1 with gradient */}
        {frame < teachingStartFrame && (
          <div
            style={{
              position: 'absolute',
              top: 510,
              left: 120,
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

        {/* Typewriter sound - continuous typing audio */}
        {(() => {
          const typingStartFrame = Math.floor((1.254 / PLAYBACK_RATE) * fps);
          const typingDurationSeconds = fullVignetteText.length / 20; // 20 chars/sec
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

        {/* Teaching phase transition sound */}
        <Sequence from={teachingStartFrame} durationInFrames={20}>
          <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
        </Sequence>

        {/* ===== BRAIN MASCOT WITH ATTACHED SPEECH BUBBLE ===== */}
        <BrainMascot
          audioPath={audioPath}
          position="top-left"
          size={280}
          timestampsSource="beta-blocker-overdose"
          playbackRate={PLAYBACK_RATE}
          shockMoment={Math.floor((13.874 / PLAYBACK_RATE) * fps)}
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

        {/* ===== PILL CHUGGING VIDEO MEME ===== */}
        {(() => {
          const pillTimestamp = 2.276; // "CHUGGED"
          const pillStartFrame = Math.floor((pillTimestamp / PLAYBACK_RATE) * fps);
          const pillDuration = 75; // ~2.5 seconds

          return (
            <Sequence from={pillStartFrame} durationInFrames={pillDuration}>
              <div style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '65%',
                maxWidth: '550px',
                zIndex: 100,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
                border: '4px solid white',
              }}>
                <Video
                  src={staticFile('assets/memes/pill.mp4')}
                  style={{ width: '100%', height: 'auto' }}
                  volume={0}
                />
              </div>
            </Sequence>
          );
        })()}

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

        {/* ===== MECHANISM DIAGRAM V2 - THE STAR OF THE SHOW ===== */}
        <BetaBlockerMechanismV2
          startTime={teachingStartTime}
          playbackRate={PLAYBACK_RATE}
        />

        {/* ===== ANXIETY TIMER - TOP RIGHT (same level as brain) ===== */}
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
                      stroke="url(#timerGradientBetaBlocker)"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 52}
                      strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="timerGradientBetaBlocker" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default BetaBlockerOverdoseAd;
