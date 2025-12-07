import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import VideoMemeOverlay from './VideoMemeOverlay';
import { ThinkingCursor } from './ThinkingCursor';
import { TeachingCard } from './TeachingCard';

// Import timestamps directly
const timestampsData = require('../../public/assets/audio/pyrazinamide-timestamps.json');

/**
 * PyrazinamideAd - Pyrazinamide (PZA) Hepatotoxicity
 *
 * NO FULL-SCREEN CUTAWAY - Using video overlay instead
 * - "this-is-fine" video overlay at TORCHED (~22.88s) - dog in burning room = liver being destroyed
 * - success-kid static overlay at answer reveal
 *
 * This is a different style - no audio pause, just overlays on top of content
 */
export const PyrazinamideAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate which option the cursor is currently hovering over
  const getCursorHoverOption = () => {
    const thinkingDuration = answerRevealFrame - questionStartFrame;
    const frameIntoThinking = frame - questionStartFrame;

    if (frameIntoThinking < 0 || frameIntoThinking >= thinkingDuration) {
      return null;
    }

    const progress = frameIntoThinking / thinkingDuration;

    // Match the sequence from ThinkingCursor
    const movementSequence = [
      { option: 'A', startProgress: 0.0, endProgress: 0.18 },
      { option: 'B', startProgress: 0.2, endProgress: 0.38 },
      { option: 'C', startProgress: 0.4, endProgress: 0.58 },
      { option: 'D', startProgress: 0.6, endProgress: 0.78 },
      { option: 'E', startProgress: 0.8, endProgress: 0.95 },
    ];

    for (const phase of movementSequence) {
      if (progress >= phase.startProgress && progress <= phase.endProgress) {
        return phase.option;
      }
    }

    return null;
  };

  const PLAYBACK_RATE = 1.85;

  // NO meme cutaway - just overlays, so no audio splitting needed
  // frameOffset = 0 throughout

  // Key timestamps (in raw audio seconds)
  const questionStartTimeRaw = 34.91;  // "Think"
  const answerRevealTimeRaw = 41.761;  // "Pyrazinamide" - when checkmarks/X's and strikethrough appear

  // Video overlay timestamp
  const torchedTimestamp = 22.88; // "TORCHED" - this-is-fine video overlay

  // NEW: Option timestamps for staggered reveal
  const optionTimestamps = {
    A: 30.523,  // "A?"
    B: 31.196,  // "B?"
    C: 32.055,  // "C?"
    D: 32.903,  // "D?"
    E: 34.273,  // "E?"
  };

  // Convert to frames (no offset since no cutaway)
  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // Vignette highlights - timestamps when narrator mentions these concepts
  // Order: top to bottom through vignette text
  const vignetteHighlights = [
    { phrase: "RIPE therapy", timestamp: 5.62 },        // "RIPE"
    { phrase: "jaundice", timestamp: 8.03 },            // "YELLOW"
    { phrase: "850 U/L", timestamp: 15.00 },            // "850" - ALT (critical)
    { phrase: "720 U/L", timestamp: 16.50 },            // "720" - AST (critical) - ADD THIS
    { phrase: "9.2 mg/dL", timestamp: 18.62 },          // "9.2" - Uric acid
  ];

  const questionData = {
    card_id: 1,
    topic: "pyrazinamide-hepatotoxicity",
    vignette: "32-year-old woman with newly diagnosed pulmonary TB started on RIPE therapy (rifampin, isoniazid, pyrazinamide, ethambutol). Three weeks later, she develops jaundice, nausea, and severe fatigue.",
    lab_values: [
      {
        label: "ALT",
        value: "850 U/L",
        status: "critical",
        color: "#ef4444",
        note: "(normal <40)"
      },
      {
        label: "AST",
        value: "720 U/L",
        status: "critical",
        color: "#ef4444",
        note: "(normal <40)"
      },
      {
        label: "Uric acid",
        value: "9.2 mg/dL",
        status: "elevated",
        color: "#ef4444",
        note: "(normal 2.5-7.0)"
      },
      {
        label: "Total bilirubin",
        value: "4.8 mg/dL",
        status: "elevated",
        color: "#ef4444",
        note: "(normal <1.2)"
      }
    ],
    question_text: "Which medication is most likely causing her symptoms?",
    options: [
      { letter: "A", text: "Rifampin", is_correct: false },
      { letter: "B", text: "Isoniazid", is_correct: false },
      { letter: "C", text: "Ethambutol", is_correct: false },
      { letter: "D", text: "Pyrazinamide", is_correct: true },
      { letter: "E", text: "Streptomycin", is_correct: false }
    ],
    correct_answer: "D"
  };

  const audioPath = staticFile('assets/audio/pyrazinamide-narration.mp3');

  // ===== TEACHING PHASES - Post-answer explanation =====
  const teachingPhases = [
    {
      titleText: 'MECHANISM OF ACTION',
      startTime: 50.12, // "Here's how PZA"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'box',
          text: 'Pyrazinamide (PZA)',
          subtext: 'prodrug - inactive form',
          timestamp: 50.457, // "PZA"
          fontSize: 28,
        },
        {
          type: 'arrow',
          timestamp: 53.615, // "Needs"
        },
        {
          type: 'box-highlight',
          text: 'Pyrazinamidase',
          subtext: 'enzyme converts it',
          timestamp: 54.799, // "pyrazinamidase"
          fontSize: 28,
        },
        {
          type: 'arrow',
          timestamp: 56.773, // "CONVERT"
        },
        {
          type: 'box-highlight',
          text: 'Pyrazinoic Acid',
          subtext: 'active form',
          timestamp: 57.586, // "pyrazinoic"
          fontSize: 28,
        },
        {
          type: 'arrow',
          timestamp: 61.266, // "DISRUPTS"
        },
        {
          type: 'bullet',
          iconName: 'bolt',
          iconColor: '#fbbf24',
          text: 'Disrupts bacterial membrane transport',
          timestamp: 61.266, // "DISRUPTS"
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Drops pH inside bacteria → kills it',
          timestamp: 64.714, // "DROPS"
        },
        {
          type: 'bullet',
          iconName: 'lightbulb',
          iconColor: '#FFD700',
          text: 'Works best in acidic environments (abscesses)',
          timestamp: 69.463, // "PECULIAR"
        },
      ]
    },
    {
      titleText: 'TOXICITY PROFILE',
      startTime: 73.27, // "But here's"
      layout: 'split-view',
      elements: [
        // Left side - What it does to bacteria (good)
        {
          side: 'left',
          iconName: 'virus',
          text: 'Kills TB bacteria',
          subtext: 'especially in acidic abscesses',
          timestamp: 69.149, // "Works"
        },
        {
          side: 'left',
          iconName: 'check',
          text: 'Part of RIPE therapy',
          subtext: 'essential first-line treatment',
          timestamp: 73.27, // "But"
        },
        // Right side - Toxicity (bad)
        {
          side: 'right',
          iconName: 'alert',
          text: 'Hepatocyte destruction',
          subtext: 'dose-dependent hepatotoxicity',
          timestamp: 76.637, // "OBLITERATES"
        },
        {
          side: 'right',
          iconName: 'chart',
          iconColor: '#fbbf24',
          text: '15% of patients affected',
          timestamp: 81.363, // "15"
        },
        {
          side: 'right',
          iconName: 'alert',
          text: 'Blocks uric acid excretion',
          subtext: '→ hyperuricemia',
          timestamp: 84.393, // "CRANKS"
        },
        {
          side: 'right',
          iconName: 'stop',
          text: 'Stop if ALT/AST >3× normal',
          timestamp: 94.099, // "YANK"
        },
      ]
    },
    {
      titleText: 'BOARDS PEARL - REMEMBER THIS!',
      startTime: 98.859, // "Yellow patient"
      layout: 'pearl-card',
      elements: [
        {
          text: 'Yellow patient (jaundice)',
          timestamp: 98.859, // "Yellow"
          fontSize: 30,
        },
        {
          text: '+',
          timestamp: 99.672, // "plus"
          fontSize: 40,
          isEquals: false,
        },
        {
          text: 'Hyperuricemia',
          timestamp: 100.055, // "hyperuricemia"
          fontSize: 30,
        },
        {
          text: '+',
          timestamp: 101.634, // "plus"
          fontSize: 40,
          isEquals: false,
        },
        {
          text: 'Recent TB treatment',
          timestamp: 102.087, // "recent"
          fontSize: 30,
        },
        {
          text: '=',
          timestamp: 103.758, // "equals"
          fontSize: 48,
          isEquals: true,
        },
        {
          text: 'PZA TOXICITY',
          timestamp: 104.559, // "PZA"
          fontSize: 38,
          isEquals: true,
        },
      ]
    }
  ];

  // ===== SCREEN SHAKE SYSTEM =====
  // ONLY shake on critical lab value highlights - makes them feel DANGEROUS
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Shake 1: "850 U/L" (ALT) critical value appears (15.00s)
    const shake1Frame = Math.floor((15.00 / PLAYBACK_RATE) * fps);
    const shake1Duration = 8; // 8 frames = ~0.27s
    if (frame >= shake1Frame && frame < shake1Frame + shake1Duration) {
      const framesIntoShake = frame - shake1Frame;
      const intensity = interpolate(framesIntoShake, [0, 3, shake1Duration], [0, 6, 0], {
        extrapolateRight: 'clamp'
      });
      shakeX += Math.sin(frame * 2) * intensity;
      shakeY += Math.cos(frame * 1.5) * intensity;
    }

    // Shake 2: "720 U/L" (AST) critical value appears (16.50s)
    const shake2Frame = Math.floor((16.50 / PLAYBACK_RATE) * fps);
    const shake2Duration = 8;
    if (frame >= shake2Frame && frame < shake2Frame + shake2Duration) {
      const framesIntoShake = frame - shake2Frame;
      const intensity = interpolate(framesIntoShake, [0, 3, shake2Duration], [0, 6, 0], {
        extrapolateRight: 'clamp'
      });
      shakeX += Math.sin(frame * 2) * intensity;
      shakeY += Math.cos(frame * 1.5) * intensity;
    }

    // Shake 3: "9.2 mg/dL" (Uric acid) elevated value appears (18.62s)
    const shake3Frame = Math.floor((18.62 / PLAYBACK_RATE) * fps);
    const shake3Duration = 8;
    if (frame >= shake3Frame && frame < shake3Frame + shake3Duration) {
      const framesIntoShake = frame - shake3Frame;
      const intensity = interpolate(framesIntoShake, [0, 3, shake3Duration], [0, 6, 0], {
        extrapolateRight: 'clamp'
      });
      shakeX += Math.sin(frame * 2) * intensity;
      shakeY += Math.cos(frame * 1.5) * intensity;
    }

    return { x: shakeX, y: shakeY };
  };

  const shake = getScreenShake();

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
      transform: `translate(${shake.x}px, ${shake.y}px)`
    }}>
      {/* Single continuous audio - no cutaway, no splitting */}
      <Audio
        src={audioPath}
        playbackRate={PLAYBACK_RATE}
        volume={1}
      />

      {/* System sounds */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Vignette highlight pops */}
      {vignetteHighlights.map((highlight, idx) => {
        const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`pop-${idx}`} from={highlightFrame} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
          </Sequence>
        );
      })}

      {/* Screen shake sound for critical values */}
      <Sequence from={Math.floor((15.00 / PLAYBACK_RATE) * fps)} durationInFrames={10}>
        <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
      </Sequence>
      <Sequence from={Math.floor((16.50 / PLAYBACK_RATE) * fps)} durationInFrames={10}>
        <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
      </Sequence>

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      {/* Heartbeat sound during countdown - LOUD and FAST */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.5} />
      </Sequence>

      <Sequence from={answerRevealFrame}>
        <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
      </Sequence>

      {/* Brain mascot - uses timestamps for sync + EMOTIONAL REACTIONS */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="pyrazinamide"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((15.00 / PLAYBACK_RATE) * fps)} // Shock at "850 U/L"
        thinkingPeriod={{
          start: questionStartFrame,
          end: answerRevealFrame
        }} // Thinking during countdown
        celebrationMoment={answerRevealFrame} // Celebrate at answer reveal
      />

      {/* Question card - no frameOffset since no cutaway */}
      {/* Hide question card when teaching starts */}
      {frame < Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps) && (
        <MedicalQuestionCard
          questionData={questionData}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          vignetteHighlights={vignetteHighlights}
          optionTimestamps={optionTimestamps}
          zoomMode={true}
          cursorHoverOption={getCursorHoverOption()}
        />
      )}

      {/* Word-synced captions - no frameOffset */}
      <TikTokCaptions
        words={timestampsData.words}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        bottomOffset={320}
      />

      {/* VIDEO MEME OVERLAY - this-is-fine at TORCHED */}
      {/* Dog in burning room = liver being destroyed by PZA - PERFECT contextual match */}
      <VideoMemeOverlay
        videoPath="assets/memes/videos/this-is-fine.mp4"
        timestamp={torchedTimestamp}
        durationInFrames={75}  // 2.5 seconds at 30fps
        position="center"
        scale={0.6}
        playbackRate={PLAYBACK_RATE}
        videoVolume={0.7}
        frameOffset={0}
        loop={true}
      />

      {/* STATIC MEME OVERLAY - success-kid at answer reveal */}
      <StaticMemeOverlay
        imagePath="assets/memes/success-kid.jpg"
        timestamp={answerRevealTimeRaw}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* THINKING CURSOR - Simulates user considering options, then clicking correct answer */}
      <ThinkingCursor
        questionStartFrame={questionStartFrame}
        answerRevealFrame={answerRevealFrame}
        optionPositions={{
          // Approximate positions based on typical card layout
          // Card is centered at ~540px width, options start around y=1150
          A: { x: 320, y: 1150 },  // First option
          B: { x: 320, y: 1210 },  // Second option
          C: { x: 320, y: 1270 },  // Third option
          D: { x: 320, y: 1330 },  // Fourth option (CORRECT)
          E: { x: 320, y: 1390 },  // Fifth option
        }}
        correctAnswer="D"
        playbackRate={PLAYBACK_RATE}
      />

      {/* TEACHING CARD - Post-answer explanation with visual teaching */}
      <TeachingCard
        phases={teachingPhases}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        startFrame={answerRevealFrame + 90} // Start ~3 seconds after answer reveal
        colorScheme={{
          background: '#0a0a0a',
          accent: 'linear-gradient(135deg, #9333ea, #db2777)',
          text: '#e5e7eb',
          highlight: '#FFD700',
          success: '#22c55e',
          warning: '#ef4444',
        }}
      />

      {/* Countdown Timer - 5 seconds before answer with ENHANCED EFFECTS */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;
        const secondsRemaining = Math.max(1, Math.ceil((timerDuration - framesIntoTimer) / fps));

        // Color based on progress
        let borderColor = '#10b981'; // green
        if (progress > 0.8) {
          borderColor = '#ef4444'; // red
        } else if (progress > 0.5) {
          borderColor = '#f97316'; // orange
        } else if (progress > 0.3) {
          borderColor = '#fbbf24'; // yellow
        }

        // ENHANCED: Pulse grow in final 2 seconds
        let timerScale = 1.0;
        if (secondsRemaining <= 2) {
          // Pulse between 1.0 and 1.15
          timerScale = 1.0 + Math.sin(frame * 0.4) * 0.075;
        }

        // ENHANCED: Ring ripple at each second tick
        const currentSecond = Math.floor((timerDuration - framesIntoTimer) / fps);
        const previousSecond = Math.floor((timerDuration - (framesIntoTimer - 1)) / fps);
        const justTicked = currentSecond !== previousSecond && framesIntoTimer > 0;

        return (
          <>
            {/* Red screen vignette in final second */}
            {secondsRemaining === 1 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 30%, rgba(239, 68, 68, 0.35) 100%)',
                pointerEvents: 'none',
                zIndex: 35,
                opacity: interpolate(
                  Math.sin(frame * 0.3),
                  [-1, 1],
                  [0.5, 1],
                  { extrapolateRight: 'clamp' }
                ),
              }} />
            )}

            {/* Second tick ripple */}
            {justTicked && secondsRemaining > 0 && (
              <div style={{
                position: 'absolute',
                top: '15%',
                right: '8%',
                width: '140px',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 39,
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `3px solid ${borderColor}`,
                  animation: 'ripple 0.6s ease-out',
                  opacity: 0,
                }} />
              </div>
            )}

            {/* Main timer */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                right: '8%',
                width: '140px',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderRadius: '50%',
                border: '6px solid',
                borderColor: borderColor,
                boxShadow: secondsRemaining <= 2
                  ? `0 8px 32px rgba(239, 68, 68, 0.6), 0 0 ${20 + Math.sin(frame * 0.4) * 10}px ${borderColor}`
                  : '0 8px 32px rgba(0, 0, 0, 0.4)',
                zIndex: 40,
                transform: `scale(${timerScale})`,
                transition: 'none',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {secondsRemaining}
              </div>
            </div>
          </>
        );
      })()}

      {/* Green flash on answer reveal */}
      <Sequence from={answerRevealFrame} durationInFrames={Math.floor(0.3 * fps)}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 255, 0, 0.25)',
          opacity: interpolate(
            frame - answerRevealFrame,
            [0, 3, Math.floor(0.3 * fps)],
            [0, 1, 0],
            { extrapolateRight: 'clamp' }
          ),
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      </Sequence>
    </AbsoluteFill>
  );
};

export default PyrazinamideAd;
