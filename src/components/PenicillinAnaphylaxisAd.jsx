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
import { PenicillinAnaphylaxisMechanism } from './diagrams/PenicillinAnaphylaxisMechanism';

const timestampsData = require('../../public/assets/audio/penicillin-anaphylaxis-timestamps.json');

export const PenicillinAnaphylaxisAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.2;
  const audioPath = staticFile('assets/audio/penicillin-anaphylaxis-narration.mp3');

  // ===== KEY TIMESTAMPS (from whisper output - Grandpa Oxley voice) =====
  const questionStartTimeRaw = 32.94;   // "A."
  const answerRevealTimeRaw = 51.52;    // "Eppeneffrin" after "It's D"
  const teachingStartTime = 65.7;       // "listen" in "Now listen up"

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const teachingStartFrame = Math.floor((teachingStartTime / PLAYBACK_RATE) * fps);

  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS =====
  const optionTimestamps = {
    A: 32.94,
    B: 35.68,
    C: 38.96,
    D: 41.6,
    E: 44.2,
  };

  // ===== TYPEWRITER VIGNETTE =====
  const fullVignetteText = "A 7-year-old boy presents 5 minutes after receiving penicillin for strep pharyngitis. He develops rapidly progressive facial swelling, diffuse urticaria, and respiratory distress. His lips are cyanotic and he is struggling to breathe.";

  const vignetteStartTimestamp = 1.3;  // "This"
  const clinicalFindingsTimestamp = 8.1;  // "penicillin for"

  const highlightPhrases = [
    { phrase: "5 minutes after receiving penicillin", color: "#ef4444", bold: true },
    { phrase: "facial swelling", color: "#fbbf24", bold: true },
    { phrase: "diffuse urticaria", color: "#fbbf24", bold: true },
    { phrase: "respiratory distress", color: "#ef4444", bold: true },
    { phrase: "cyanotic", color: "#ef4444", bold: true },
    { phrase: "struggling to breathe", color: "#ef4444", bold: true },
  ];

  const vignetteHighlights = [
    { phrase: "5 minutes after receiving penicillin", timestamp: 9.48, isCritical: true },
    { phrase: "facial swelling", timestamp: 5.4, isCritical: false },
    { phrase: "respiratory distress", timestamp: 13.36, isCritical: true },
    { phrase: "50/30", timestamp: 16.5, isCritical: true },
    { phrase: "142 bpm", timestamp: 11.28, isCritical: true },
  ];

  const labTimestamps = {
    "Blood pressure": 15.46,
    "Heart rate": 11.28,
    "O2 saturation": 13.36,
  };

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "penicillin-anaphylaxis",
    vignette: "",
    lab_values: [
      {
        label: "Blood pressure",
        value: "50/30 mmHg",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 120/80)"
      },
      {
        label: "Heart rate",
        value: "142 bpm",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 60-100)"
      },
      {
        label: "O2 saturation",
        value: "78%",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 95-100%)"
      },
    ],
    question_text: "What is the FIRST-LINE treatment for this patient?",
    options: [
      { letter: "A", text: "Diphenhydramine", is_correct: false },
      { letter: "B", text: "Methylprednisolone", is_correct: false },
      { letter: "C", text: "Albuterol", is_correct: false },
      { letter: "D", text: "Epinephrine", is_correct: true },
      { letter: "E", text: "Normal saline", is_correct: false },
    ],
    correct_answer: "D"
  };

  // ===== DOUBLE-TAKE SYSTEM =====
  // Correct answer is D, so pattern is: C→D→D
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15;

    if (frame < thinkingStartFrame || frame >= answerRevealFrame) return null;

    const framesIntoThinking = frame - thinkingStartFrame;

    // PHASE 1: Quick scan A→B→C→D→E (8 frames each)
    if (framesIntoThinking < 40) {
      return ['A', 'B', 'C', 'D', 'E'][Math.floor(framesIntoThinking / 8)];
    }

    // PHASE 2: Brief pause (5 frames)
    if (framesIntoThinking < 45) return null;

    // PHASE 3: Double-take for D being correct
    const doubleTakeFrames = framesIntoThinking - 45;
    if (doubleTakeFrames < 8) return 'C';  // First look at C
    if (doubleTakeFrames < 16) return 'D'; // Wait, D!
    return 'D'; // Definitely D!
  };

  const highlightedOption = getHighlightedOption();

  // ===== TIMER ANIMATION (Beta Blocker Style) =====
  const timerProgress = interpolate(
    frame,
    [questionStartFrame, answerRevealFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const secondsLeft = Math.max(0, Math.ceil((timerDuration - (frame - questionStartFrame)) / fps));

  const shakeIntensity = timerProgress * 3;
  const shakeX = Math.sin(frame * 0.8) * shakeIntensity;
  const shakeY = Math.cos(frame * 0.6) * shakeIntensity;
  const pulseScale = 1.0 + (Math.sin(frame * 0.3) * 0.08 * timerProgress);
  const baseZoom = secondsLeft <= 5 ? 1.0 + ((5 - secondsLeft) * 0.08) : 1.0;

  // ===== RENDER =====
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Branding - Question Phase */}
      {frame >= questionStartFrame && frame < teachingStartFrame && (
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
            opacity: interpolate(frame, [questionStartFrame, questionStartFrame + 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          synapticrecall.ai
        </div>
      )}

      {/* Audio */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SOUND EFFECTS ===== */}
      {/* Entrance whoosh */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Option appearance clicks */}
      {Object.entries(optionTimestamps).map(([letter, timestamp], idx) => {
        const optionFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`option-click-${letter}`} from={optionFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.5} />
          </Sequence>
        );
      })}

      {/* Timer ticking */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
      </Sequence>

      {/* Heartbeat slow */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
      </Sequence>

      {/* Heartbeat fast (final 3 seconds) */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
      </Sequence>

      {/* Breathing panic */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio src={staticFile('assets/sfx/breathing.mp3')} volume={0.25} playbackRate={1.3} />
      </Sequence>

      {/* Double-take clicks */}
      {highlightedOption && (
        <Sequence from={frame} durationInFrames={1}>
          <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.1} />
        </Sequence>
      )}

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

      {/* ===== BRAIN MASCOT ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-left"
        size={280}
        timestampsSource="penicillin-anaphylaxis"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((23.08 / PLAYBACK_RATE) * fps)} // "screaming"
        thinkingPeriod={{
          start: questionStartFrame,
          end: answerRevealFrame,
        }}
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

      {/* ===== MEMES ===== */}
      {/* "This is fine" meme when throat's swelling shut */}
      <StaticMemeOverlay
        imagePath="assets/memes/this-is-fine.jpg"
        timestamp={5.4}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* Roll Safe meme at answer reveal */}
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
      <PenicillinAnaphylaxisMechanism
        startTime={teachingStartTime}
        playbackRate={PLAYBACK_RATE}
      />

      {/* ===== TIMER (Beta Blocker Style) ===== */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <div
          style={{
            position: 'absolute',
            top: 250,
            right: 145,
            zIndex: 150,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 130,
              height: 130,
              transform: `translate(${shakeX}px, ${shakeY}px) scale(${pulseScale * baseZoom})`,
              filter: `drop-shadow(0 0 ${20 * timerProgress}px rgba(239, 68, 68, ${timerProgress * 0.8}))`,
            }}
          >
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="10" />
              {/* Progress circle with gradient */}
              <circle
                cx="65"
                cy="65"
                r="52"
                fill="none"
                stroke="url(#timerGradientPenicillin)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - timerProgress)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="timerGradientPenicillin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={timerProgress < 0.5 ? "#9333ea" : "#dc2626"} />
                  <stop offset="100%" stopColor={timerProgress < 0.5 ? "#db2777" : "#ef4444"} />
                </linearGradient>
              </defs>
            </svg>
            {/* Timer number */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 'bold',
                fontFamily: 'system-ui',
                color: timerProgress < 0.5 ? '#9333ea' : '#ef4444',
                textShadow: `0 0 20px ${timerProgress < 0.5 ? 'rgba(147, 51, 234, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
              }}
            >
              {secondsLeft}
            </div>
          </div>
        </div>
      </Sequence>

      {/* ===== RED ANXIETY OVERLAY ===== */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(220, 38, 38, ${
              interpolate(frame, [questionStartFrame, answerRevealFrame], [0, 0.25])
            }) 100%)`,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}

      {/* ===== GREEN FLASH ON REVEAL ===== */}
      {frame >= answerRevealFrame && frame < answerRevealFrame + 15 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(34, 197, 94, ${interpolate(
              frame,
              [answerRevealFrame, answerRevealFrame + 15],
              [0.4, 0]
            )})`,
            pointerEvents: 'none',
            zIndex: 200,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default PenicillinAnaphylaxisAd;
