import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Video,
  Img,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import { AcetaminophenMechanismEnhanced } from './diagrams/AcetaminophenMechanismEnhanced';

const timestampsData = require('../../public/assets/audio/acetaminophen-overdose-timestamps.json');

/**
 * AcetaminophenOverdoseAd - SILENT KILLER EDITION
 *
 * Topic: Acetaminophen (Tylenol) Overdose
 * Correct Answer: C) N-Acetylcysteine (NAC)
 * Common Wrong Answer: A) Activated charcoal (too late at 8 hours!)
 *
 * Hook Strategy: FEAR + PARADOX
 * - "This girl is gonna DIE in 48 hours and she doesn't even KNOW it"
 * - Patient feels FINE but liver is being destroyed
 * - Creates tension that gets resolved by learning the mechanism
 *
 * Key Teaching Points:
 * - NAPQI is the toxic metabolite
 * - Glutathione normally neutralizes it
 * - Overdose depletes glutathione → NAPQI destroys hepatocytes
 * - Zone 3 (centrilobular) necrosis
 * - NAC provides cysteine to rebuild glutathione
 * - Timing is critical: <8h = best, 8-24h = still good, >24h = still give it
 * - Rumack-Matthew nomogram for treatment decisions
 */
export const AcetaminophenOverdoseAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.0;
  const audioPath = staticFile('assets/audio/acetaminophen-overdose-narration.mp3');

  // ===== KEY TIMESTAMPS (from ElevenLabs audio generation) =====
  const questionStartTimeRaw = 60.871;  // "A) Activated charcoal"
  const answerRevealTimeRaw = 75.256;   // "it's C, N-Acetylcysteine!"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS (from ElevenLabs audio generation) =====
  const optionTimestamps = {
    A: 60.871,   // "A) Activated charcoal"
    B: 62.996,   // "B) Fomepizole"
    C: 64.900,   // "C) N-Acetylcysteine"
    D: 67.512,   // "D) Hemodialysis"
    E: 69.451,   // "E) Supportive care only"
  };

  // ===== FULL VIGNETTE TEXT =====
  const fullVignetteText = "A 22-year-old college student presents saying she took 'a bunch of Tylenol' after a breakup. She took the whole bottle about 8 hours ago. She feels fine but labs show AST 2847, ALT 3156, INR 2.8.";

  // ===== VIGNETTE START =====
  const vignetteStartTimestamp = 0.0; // "This girl is gonna DIE"

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING =====
  // Pattern: A→B→C→D→E scan, then C→A→C (answer is C, students tempted by A - charcoal)
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

    // PHASE 3: Double-take C→A→C (answer is C, students tempted by A - charcoal)
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';   // First look at C (NAC)
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A (charcoal)?
    if (doubleTakeFrames < availableFrames - 45) return 'C'; // No, definitely C!

    return null;
  };

  const highlightedOption = getHighlightedOption();

  // ===== HIGHLIGHT PHRASES =====
  const highlightPhrases = [
    { phrase: "bunch of Tylenol", color: "#ef4444", bold: true },
    { phrase: "whole bottle", color: "#ef4444", bold: true },
    { phrase: "8 hours ago", color: "#fbbf24", bold: true },
    { phrase: "feels fine", color: "#22c55e", bold: false },
    { phrase: "AST 2847", color: "#ef4444", bold: true },
    { phrase: "ALT 3156", color: "#ef4444", bold: true },
    { phrase: "INR 2.8", color: "#ef4444", bold: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "acetaminophen-overdose",
    vignette: "",
    lab_values: [
      {
        label: "AST",
        value: "2,847 U/L",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: <40)"
      },
      {
        label: "ALT",
        value: "3,156 U/L",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: <40)"
      },
      {
        label: "INR",
        value: "2.8",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: <1.1)"
      }
    ],
    question_text: "Which treatment is most appropriate for this patient?",
    options: [
      { letter: "A", text: "Activated charcoal", is_correct: false },
      { letter: "B", text: "Fomepizole", is_correct: false },
      { letter: "C", text: "N-Acetylcysteine", is_correct: true },
      { letter: "D", text: "Hemodialysis", is_correct: false },
      { letter: "E", text: "Supportive care only", is_correct: false }
    ],
    correct_answer: "C"
  };

  // ===== PROGRESSIVE LAB REVEAL =====
  const clinicalFindingsTimestamp = 35.736; // "Labs just came back - TWENTY-EIGHT"
  const labTimestamps = {
    "AST": 35.736,    // "TWENTY-EIGHT FORTY-SEVEN"
    "ALT": 47.056,    // "THIRTY-ONE FIFTY-SIX"
    "INR": 50.5,      // "INR 2.8"
  };

  // ===== VIGNETTE HIGHLIGHTS =====
  const vignetteHighlights = [
    { phrase: "whole BOTTLE", timestamp: 6.711, isCritical: true },
    { phrase: "feels FINE", timestamp: 12.899, isCritical: false },
    { phrase: "2,847", timestamp: 35.736, isCritical: true },
    { phrase: "3,156", timestamp: 47.056, isCritical: true },
    { phrase: "2.8", timestamp: 50.5, isCritical: true },
  ];

  // ===== TEACHING PHASE =====
  const teachingStartTime = 108.647; // "Now SHUT UP and let me teach"
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);

  // ===== MEME TIMESTAMPS (from ElevenLabs audio generation) =====
  const memeTimestamps = {
    pillBottle: 6.711,        // "whole BOTTLE"
    feelsFine1: 12.899,       // "feels FINE"
    guarantee: 24.451,        // "GUARANTEE" 80% pick wrong
    blinkingGuy: 35.736,      // "TWENTY-EIGHT FORTY-SEVEN"
    screamingInternal: 24.5,  // "MELTS from inside" (before labs)
    // Answer reveal celebration
    answerReveal: 75.256,     // "N-Acetylcysteine!" - CELEBRATION
    // Wrong answer roast sequence
    charcoalWrong: 79.575,    // "half you picked activated charcoal"
    killedPatient: 87.319,    // "KILLED this patient"
    charcoalUseless: 107.138, // "USELESS"
    // Teaching phase memes
    elmoFire: 100.0,          // "MURDERING hepatocytes"
    feelsFine2: 189.405,      // "Patient feels FINE" (teaching phase paradox)
    clockPanic: 227.033,      // "TIMING is EVERYTHING"
  };

  // ===== THE RENDER =====
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
    }}>

      {/* Branding - Left of Practice Question #1 */}
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
        const typingStartFrame = Math.floor((vignetteStartTimestamp / PLAYBACK_RATE) * fps);
        const typingDurationSeconds = fullVignetteText.length / 20;
        const typingDurationFrames = Math.floor((typingDurationSeconds / PLAYBACK_RATE) * fps);

        return (
          <Sequence from={typingStartFrame + 30} durationInFrames={typingDurationFrames}>
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
          volume={0.35}
        />
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
        timestampsSource="acetaminophen-overdose"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((27.3 / PLAYBACK_RATE) * fps)} // AST reveal shock
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
        customTop={250}
        customLeft={120}
        showSpeechBubble={true}
        speechBubbleWords={timestampsData.words}
        speechBubbleSize={{ width: 180, height: 100 }}
        speechBubbleFontSize={20}
      />

      {/* ===== QUESTION CARD ===== */}
      {frame < teachingStartFrame && (
        <MedicalQuestionCard
          questionData={questionData}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          fullVignetteText={fullVignetteText}
          vignetteStartTimestamp={vignetteStartTimestamp}
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

      {/* ===== MEME: PILL BOTTLE (on "whole BOTTLE") ===== */}
      {(() => {
        const memeFrame = Math.floor((memeTimestamps.pillBottle / PLAYBACK_RATE) * fps);
        const memeDuration = 60; // ~2 seconds

        return (
          <Sequence from={memeFrame} durationInFrames={memeDuration}>
            <div style={{
              position: 'absolute',
              bottom: '28%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              maxWidth: '500px',
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

      {/* ===== MEME: THIS IS FINE (on "feels FINE") ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/this-is-fine.jpg"
        timestamp={memeTimestamps.feelsFine1}
        durationInFrames={50}
        position="center"
        scale={0.5}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== MEME: BLINKING GUY (on AST reveal) ===== */}
      {(() => {
        const memeFrame = Math.floor((memeTimestamps.blinkingGuy / PLAYBACK_RATE) * fps);
        const memeDuration = 45;

        return (
          <Sequence from={memeFrame} durationInFrames={memeDuration}>
            <div style={{
              position: 'absolute',
              bottom: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '55%',
              maxWidth: '450px',
              zIndex: 100,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
              border: '4px solid white',
            }}>
              <Video
                src={staticFile('assets/memes/blinking-white-guy.mp4')}
                style={{ width: '100%', height: 'auto' }}
                volume={0}
              />
            </div>
          </Sequence>
        );
      })()}


      {/* ===== MEME: ANSWER REVEAL (roll-safe) ===== */}
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

      {/* ===== MEME: ANSWER REVEAL CELEBRATION (GTA Mission Passed) ===== */}
      {(() => {
        const memeFrame = Math.floor((memeTimestamps.answerReveal / PLAYBACK_RATE) * fps) + 10;
        const memeDuration = 60;

        return (
          <Sequence from={memeFrame} durationInFrames={memeDuration}>
            <div style={{
              position: 'absolute',
              bottom: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '55%',
              maxWidth: '450px',
              zIndex: 100,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(34, 197, 94, 0.4)',
              border: '4px solid #22c55e',
            }}>
              <Video
                src={staticFile('assets/memes/correct/gta-mission-passed.mp4')}
                style={{ width: '100%', height: 'auto' }}
                volume={0.3}
              />
            </div>
          </Sequence>
        );
      })()}


      {/* ===== MEME: KILLED PATIENT (Office - We Are Screwed) ===== */}
      {(() => {
        const memeFrame = Math.floor((memeTimestamps.killedPatient / PLAYBACK_RATE) * fps);
        const memeDuration = 50;

        return (
          <Sequence from={memeFrame} durationInFrames={memeDuration}>
            <div style={{
              position: 'absolute',
              bottom: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '55%',
              maxWidth: '450px',
              zIndex: 100,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(239, 68, 68, 0.4)',
              border: '4px solid #ef4444',
            }}>
              <Video
                src={staticFile('assets/memes/wrong/office-we-are-screwed.mp4')}
                style={{ width: '100%', height: 'auto' }}
                volume={0.2}
              />
            </div>
          </Sequence>
        );
      })()}

      {/* ===== MEME: CHARCOAL USELESS (This Ain't It Chief) ===== */}
      {(() => {
        const memeFrame = Math.floor((memeTimestamps.charcoalUseless / PLAYBACK_RATE) * fps);
        const memeDuration = 45;

        return (
          <Sequence from={memeFrame} durationInFrames={memeDuration}>
            <div style={{
              position: 'absolute',
              bottom: '26%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50%',
              maxWidth: '400px',
              zIndex: 100,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(239, 68, 68, 0.4)',
              border: '4px solid #ef4444',
            }}>
              <Video
                src={staticFile('assets/memes/wrong/this-aint-it-chief.mp4')}
                style={{ width: '100%', height: 'auto' }}
                volume={0.2}
              />
            </div>
          </Sequence>
        );
      })()}

      {/* ===== MECHANISM DIAGRAM - THE STAR OF THE SHOW ===== */}
      <AcetaminophenMechanismEnhanced
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
                    stroke="url(#timerGradientAcetaminophen)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientAcetaminophen" x1="0%" y1="0%" x2="100%" y2="100%">
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

export default AcetaminophenOverdoseAd;
