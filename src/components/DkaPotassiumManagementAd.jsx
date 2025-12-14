import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  interpolate,
  Easing
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import StaticMemeOverlay from './StaticMemeOverlay';
import VideoMemeOverlay from './VideoMemeOverlay';
import { TeachingCard } from './TeachingCard';
import { DynamicVignette } from './DynamicVignette/DynamicVignette';
import { FullScreenZoom } from './FullScreenZoom';

const timestampsData = require('../../public/assets/audio/dka-potassium-management-timestamps.json');

/**
 * DkaPotassiumManagementAd - Diabetic Ketoacidosis Potassium Management
 *
 * V11.1 Production features:
 * - FloatingHighlight with spring animations
 * - Double-take option highlighting (adapts to answer B)
 * - Enhanced panic mode with breathing layer
 * - 6 vignette highlights with 3 critical shakes (lab values)
 * - Mobile-optimized captions (fontSize: 36, bottomOffset: 140)
 * - Timer positioned at right: 60px (TikTok-safe)
 * - Teaching temporal constraints validated
 */
export const DkaPotassiumManagementAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.2;
  const audioPath = staticFile('assets/audio/dka-potassium-management-narration.mp3');

  // ===== KEY TIMESTAMPS =====
  const questionStartTimeRaw = 50.526;  // First option "A," - timer starts here
  const answerRevealTimeRaw = 70.217;   // Answer reveal "B," (serum potassium)

  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // ===== OPTION TIMESTAMPS (auto-detected) =====
  const optionTimestamps = {
    A: 50.526,
    B: 54.067,
    C: 57.655,
    D: 61.393,
    E: 64.679,
  };

  // ===== DOUBLE-TAKE OPTION HIGHLIGHTING (adapts to answer B) =====
  const getHighlightedOption = () => {
    const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
    const thinkingStartFrame = lastOptionFrame + 15; // Start 0.5s after last option appears

    // Only activate during thinking phase (after all options visible, before answer)
    if (frame < thinkingStartFrame || frame >= answerRevealFrame) {
      return null;
    }

    const framesIntoThinking = frame - thinkingStartFrame;
    const availableFrames = answerRevealFrame - thinkingStartFrame;

    // PHASE 1: Quick scan A→B→C→D→E (8 frames each = 40 frames total)
    if (framesIntoThinking < 40) {
      const optionIndex = Math.floor(framesIntoThinking / 8);
      return ['A', 'B', 'C', 'D', 'E'][optionIndex];
    }

    // PHASE 2: Brief pause (5 frames)
    if (framesIntoThinking < 45) {
      return null; // No highlight during pause
    }

    // PHASE 3: Double-take - B→A→B (for answer B)
    const doubleTakeFrames = framesIntoThinking - 45;

    if (doubleTakeFrames < 8) return 'B';   // First look at B
    if (doubleTakeFrames < 16) return 'A';  // Wait, maybe A?
    if (doubleTakeFrames < availableFrames - 45) return 'B'; // No, definitely B!

    return null; // End before answer reveal
  };

  const highlightedOption = getHighlightedOption();

  // ===== DYNAMIC VIGNETTE SEGMENTS (REPLACES STATIC HIGHLIGHTS) =====
  // Each segment builds progressively as Grandpa narrates
  const dynamicVignetteSegments = [
    { text: "19-year-old male", timestamp: 3.599, effect: "typewriter" },
    { text: "found unresponsive in dorm room.", timestamp: 5.2, effect: "typewriter" },
    { text: "FRUITY BREATH ODOR", timestamp: 8.661, effect: "slam", isCritical: false },  // SLAM - "NAIL"
    { text: "(smells like nail salon).", timestamp: 10.1, effect: "typewriter" },
    { text: "Deep, rapid breathing", timestamp: 15.557, effect: "underline" },  // "freight" - Kussmaul
    { text: "(Kussmaul respirations).", timestamp: 17.0, effect: "typewriter" },
    { text: "Blood glucose:", timestamp: 24.0, effect: "typewriter" },
    { text: "500 mg/dL", timestamp: 25.878, effect: "slam", isCritical: true },  // SLAM + ZOOM - "FIVE"
    { text: "Arterial pH:", timestamp: 27.5, effect: "typewriter" },
    { text: "7.1", timestamp: 28.758, effect: "circle", isCritical: true },  // CIRCLE + ZOOM - "SEVEN"
    { text: "Serum ketones:", timestamp: 33.0, effect: "typewriter" },
    { text: "MARKEDLY ELEVATED", timestamp: 34.435, effect: "slam", isCritical: true },  // SLAM + ZOOM - "POURIN"
  ];

  // Full-screen zoom triggers for MAXIMUM IMPACT
  const zoomTriggers = [
    { timestamp: 25.878, scale: 1.5, holdFrames: 18 },  // Zoom on "500 mg/dL"
    { timestamp: 28.758, scale: 1.4, holdFrames: 15 },  // Zoom on "pH 7.1"
    { timestamp: 34.435, scale: 1.5, holdFrames: 18 },  // Zoom on "MARKEDLY ELEVATED"
  ];

  // Legacy vignette highlights (keep for MedicalQuestionCard compatibility)
  const vignetteHighlights = [
    { phrase: "19-year-old male", timestamp: 3.599, isCritical: false },
    { phrase: "Fruity breath odor", timestamp: 8.661, isCritical: false },
    { phrase: "Deep, rapid breathing", timestamp: 15.557, isCritical: false },
    { phrase: "500 mg/dL", timestamp: 25.878, isCritical: true },
    { phrase: "pH 7.1", timestamp: 28.758, isCritical: true },
    { phrase: "Ketones markedly elevated", timestamp: 34.435, isCritical: true },
  ];

  // ===== QUESTION DATA =====
  const questionData = {
    card_id: 1,
    topic: "dka-potassium-management",
    vignette: "19-year-old male found unresponsive in dorm room. Fruity breath odor. Deep, rapid breathing. Blood glucose 500 mg/dL. Arterial pH 7.1. Serum ketones markedly elevated.",
    lab_values: [
      {
        label: "Glucose",
        value: "500 mg/dL",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 70-100)"
      },
      {
        label: "pH",
        value: "7.1",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: 7.35-7.45)"
      },
      {
        label: "Ketones",
        value: "Markedly elevated",
        status: "critical",
        color: "#ef4444",
        note: "(Normal: Negative)"
      }
    ],
    question_text: "Before administering insulin, what must be checked FIRST?",
    options: [
      {
        letter: "A",
        text: "Hemoglobin A1C",
        is_correct: false
      },
      {
        letter: "B",
        text: "Serum potassium",
        is_correct: true
      },
      {
        letter: "C",
        text: "Liver enzymes",
        is_correct: false
      },
      {
        letter: "D",
        text: "Chest X-ray",
        is_correct: false
      },
      {
        letter: "E",
        text: "Urine culture",
        is_correct: false
      }
    ],
    correct_answer: "B"
  };

  // ===== TEACHING PHASES =====
  // All bullets validated: timestamps >= phase.startTime and sequential
  const teachingPhases = [
    {
      titleText: "THE POTASSIUM TRAP",
      startTime: 78.262, // "SIMMER"
      layout: 'split-view',
      elements: [
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#fbbf24',
          text: 'Serum K+ looks NORMAL on paper',
          timestamp: 85.925, // "OUTSIDE" - after phase start (78.262)
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Total body K+ is BONE DRY (depleted)',
          timestamp: 95.341, // "BONE" - sequential (> 85.925)
        }
      ]
    },
    {
      titleText: 'WHY INSULIN KILLS',
      startTime: 99.729, // "slam"
      layout: 'flow-diagram',
      elements: [
        {
          type: 'bullet',
          iconName: 'bolt',
          iconColor: '#9333ea',
          text: 'Insulin SHOVES K+ into cells',
          timestamp: 101.262, // "SHOVES" - after phase start (99.729)
        },
        {
          type: 'bullet',
          iconName: 'chart',
          iconColor: '#ef4444',
          text: 'Serum K+ drops like a STONE',
          timestamp: 106.045, // "STONE" - sequential (> 101.262)
        },
        {
          type: 'bullet',
          iconName: 'warning',
          iconColor: '#ef4444',
          text: 'Heart goes into ARREST',
          timestamp: 108.46, // "ARREST" - sequential (> 106.045)
        }
      ]
    },
    {
      titleText: 'BOARD PEARL',
      startTime: 109.993, // "Check"
      layout: 'pearl-card',
      elements: [
        {
          type: 'text',
          text: 'CHECK K+',
          timestamp: 110.55, // "FIRST" - after phase start (109.993)
          fontSize: 36,
          isEquals: false
        },
        {
          type: 'text',
          text: '→',
          timestamp: 111.455, // "replace"
          fontSize: 36,
          isEquals: false
        },
        {
          type: 'text',
          text: 'REPLACE if low',
          timestamp: 112.396, // "THEN"
          fontSize: 36,
          isEquals: false
        },
        {
          type: 'text',
          text: '→',
          timestamp: 113.371, // "insulin"
          fontSize: 36,
          isEquals: false
        },
        {
          type: 'text',
          text: 'THEN give insulin',
          timestamp: 114.207, // "This"
          fontSize: 36,
          isEquals: false
        }
      ]
    }
  ];

  // ===== MEME TIMING - MAXIMUM DENSITY =====
  // Micro-memes every 3-5 seconds for constant dopamine hits
  const microMemes = [
    // Vignette phase
    { imagePath: "assets/memes/confused-nick-young.jpg", timestamp: 3.599, duration: 25, position: "top-right", scale: 0.25 },  // "19-year-old" - quick flash
    { imagePath: "assets/memes/doge.jpg", timestamp: 8.661, duration: 30, position: "bottom-left", scale: 0.3 },  // "FRUITY" - such smell, very fruity
    { imagePath: "assets/memes/dramatic-chipmunk.gif", timestamp: 15.557, duration: 40, position: "top-left", scale: 0.3 },  // "Deep breathing" - dramatic
    { imagePath: "assets/memes/this-is-fine.jpg", timestamp: 25.878, duration: 35, position: "center", scale: 0.45 },  // "500 mg/dL" - this is fine (it's not)
    { imagePath: "assets/memes/elmo-fire.gif", timestamp: 28.758, duration: 35, position: "bottom-right", scale: 0.3 },  // "pH 7.1" - chaos
    { imagePath: "assets/memes/coffin-dance.gif", timestamp: 34.435, duration: 40, position: "top-right", scale: 0.3 },  // "KETONES" - patient almost dead

    // Question/thinking phase
    { imagePath: "assets/memes/hide-the-pain-harold.jpg", timestamp: 50.526, duration: 30, position: "bottom-left", scale: 0.25 },  // Options appear - pain
    { imagePath: "assets/memes/confused-math-lady.jpg", timestamp: 60.0, duration: 35, position: "top-left", scale: 0.28 },  // Mid-timer - confusion
    { imagePath: "assets/memes/disaster-girl.jpg", timestamp: 65.0, duration: 25, position: "top-right", scale: 0.25 },  // Final seconds - chaos

    // Answer phase
    { imagePath: "assets/memes/roll-safe.jpg", timestamp: 70.217, duration: 45, position: "center", scale: 0.5 },  // Answer reveal - can't fail if you check K+
    { imagePath: "assets/memes/success-kid.jpg", timestamp: 72.0, duration: 30, position: "bottom-right", scale: 0.3 },  // Victory
  ];

  // Legacy main meme
  const contextualMemeTimestamp = 45.313;  // "Hold" - Hold your horses

  // ===== SCREEN SHAKE SYSTEM =====
  const getScreenShake = () => {
    let shakeX = 0;
    let shakeY = 0;

    // Vignette shakes - all highlights get shakes
    vignetteHighlights.forEach((highlight, idx) => {
      const shakeFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
      if (frame >= shakeFrame && frame < shakeFrame + 8) {
        const framesIntoShake = frame - shakeFrame;
        // Critical highlights get stronger shake (intensity 6), non-critical get moderate (intensity 4)
        const maxIntensity = highlight.isCritical ? 6 : 4;
        const intensity = interpolate(framesIntoShake, [0, 3, 8], [0, maxIntensity, 0], {
          extrapolateRight: 'clamp'
        });
        shakeX += Math.sin(frame * 2) * intensity;
        shakeY += Math.cos(frame * 1.5) * intensity;
      }
    });

    // Teaching bullet shakes
    teachingPhases.forEach(phase => {
      phase.elements.forEach(element => {
        if (element.type === 'bullet' || !element.type) {
          const shakeFrame = Math.floor((element.timestamp / PLAYBACK_RATE) * fps);
          if (frame >= shakeFrame && frame < shakeFrame + 6) {
            const framesIntoShake = frame - shakeFrame;
            const intensity = interpolate(framesIntoShake, [0, 2, 6], [0, 5, 0], {
              extrapolateRight: 'clamp'
            });
            shakeX += Math.sin(frame * 2.5) * intensity;
            shakeY += Math.cos(frame * 2) * intensity;
          }
        }
      });
    });

    return { x: shakeX, y: shakeY };
  };

  const shake = getScreenShake();

  return (
    <FullScreenZoom triggers={zoomTriggers} playbackRate={PLAYBACK_RATE} frameOffset={0}>
      <AbsoluteFill style={{
        backgroundColor: '#0a0a0a',
        transform: `translate(${shake.x}px, ${shake.y}px)`
      }}>

        {/* ===== SINGLE CONTINUOUS AUDIO ===== */}
        <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* ===== SYSTEM SOUNDS ===== */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Vignette highlight sounds */}
      {vignetteHighlights.map((highlight, idx) => {
        if (highlight.timestamp >= answerRevealTimeRaw) return null;
        const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`highlight-sound-${idx}`} from={highlightFrame} durationInFrames={30}>
            <Audio
              src={staticFile('assets/sfx/underline-stroke.mp3')}
              startFrom={0.8}
              volume={highlight.isCritical ? 2.0 : 1.8}
            />
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

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio
          src={staticFile('assets/sfx/timer-ticking.mp3')}
          volume={0.6}
        />
      </Sequence>

      {/* Heartbeat - escalating anxiety (stops before panic mode to avoid overlap) */}
      {timerDuration > 90 && (
        <Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
          <Audio
            src={staticFile('assets/sfx/heartbeat.mp3')}
            volume={1.2}
            playbackRate={1.9}
          />
        </Sequence>
      )}

      {/* Heartbeat - PANIC MODE (final 3 seconds, doubled speed - NO OVERLAP) */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio
          src={staticFile('assets/sfx/heartbeat.mp3')}
          volume={2.5}
          playbackRate={2.8}
        />
      </Sequence>

      {/* Breathing sound - panic layer (final 3 seconds only) */}
      <Sequence from={answerRevealFrame - 90} durationInFrames={90}>
        <Audio
          src={staticFile('assets/sfx/breathing.mp3')}
          volume={0.25}
          playbackRate={1.3}
        />
      </Sequence>

      {/* Double-take option highlight clicks */}
      {(() => {
        const lastOptionFrame = Math.floor((optionTimestamps.E / PLAYBACK_RATE) * fps);
        const thinkingStartFrame = lastOptionFrame + 15;

        // PHASE 1: Quick scan clicks (A, B, C, D, E) - 8 frames apart
        const phase1Clicks = [0, 8, 16, 24, 32].map((offset, idx) => (
          <Sequence key={`phase1-click-${idx}`} from={thinkingStartFrame + offset} durationInFrames={10}>
            <Audio src={staticFile('assets/sfx/ui-click-97915.mp3')} volume={1.0} />
          </Sequence>
        ));

        // PHASE 3: Double-take clicks (B, A, B for answer B) - 8 frames apart, starting at frame 45
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

      <Sequence from={answerRevealFrame} durationInFrames={15}>
        <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
      </Sequence>

      <Sequence from={answerRevealFrame} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
      </Sequence>

      {/* Teaching phase sounds */}
      {teachingPhases.map((phase, phaseIdx) => {
        const phaseStartFrame = Math.floor((phase.startTime / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`phase-whoosh-${phaseIdx}`} from={phaseStartFrame} durationInFrames={20}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.35} />
          </Sequence>
        );
      })}

      {/* Teaching bullet sounds */}
      {teachingPhases.flatMap(phase =>
        phase.elements.filter(el => el.type === 'bullet' || !el.type).map((element, idx) => {
          const bulletFrame = Math.floor((element.timestamp / PLAYBACK_RATE) * fps);
          return (
            <Sequence key={`bullet-pop-${phase.startTime}-${idx}`} from={bulletFrame} durationInFrames={20}>
              <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.45} />
            </Sequence>
          );
        })
      )}


      {/* ===== BRAIN MASCOT WITH EMOTIONS ===== */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="dka-potassium-management"
        playbackRate={PLAYBACK_RATE}
        shockMoment={Math.floor((25.878 / PLAYBACK_RATE) * fps)}
        thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
        celebrationMoment={answerRevealFrame}
      />

      {/* ===== DYNAMIC VIGNETTE - Renders ABOVE question card ===== */}
      {frame < Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps) && (
        <DynamicVignette
          segments={dynamicVignetteSegments}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          position="top"
          fontSize={26}
          maxWidth={900}
          style={{ zIndex: 100 }}
        />
      )}

      {/* ===== QUESTION CARD (vignette disabled - using DynamicVignette above) ===== */}
      {frame < Math.floor((teachingPhases[0].startTime / PLAYBACK_RATE) * fps) && (
        <MedicalQuestionCard
          questionData={{...questionData, vignette: ""}}
          answerRevealTime={answerRevealTimeRaw}
          playbackRate={PLAYBACK_RATE}
          frameOffset={0}
          vignetteHighlights={[]}
          vignetteSegments={null}
          optionTimestamps={optionTimestamps}
          zoomMode={true}
          cursorHoverOption={highlightedOption}
        />
      )}

      {/* ===== CAPTIONS - MOBILE OPTIMIZED (V11.1) ===== */}
      <TikTokCaptions
        words={timestampsData.words}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        bottomOffset={140}
        fontSize={36}
      />

      {/* ===== MICRO-MEMES - MAXIMUM DENSITY FOR DOPAMINE HITS ===== */}
      {microMemes.map((meme, idx) => (
        <StaticMemeOverlay
          key={`micro-meme-${idx}`}
          imagePath={meme.imagePath}
          timestamp={meme.timestamp}
          durationInFrames={meme.duration}
          position={meme.position}
          scale={meme.scale}
          playbackRate={PLAYBACK_RATE}
          soundEffect={null}
          frameOffset={0}
        />
      ))}

      {/* ===== LEGACY MEMES (keep for backwards compatibility) ===== */}
      <StaticMemeOverlay
        imagePath="assets/memes/stop.jpg"
        timestamp={contextualMemeTimestamp}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={0}
      />

      {/* ===== TEACHING CARD ===== */}
      <TeachingCard
        phases={teachingPhases}
        playbackRate={PLAYBACK_RATE}
        frameOffset={0}
        startFrame={answerRevealFrame + 90}
        colorScheme={{
          background: '#0a0a0a',
          accent: 'linear-gradient(135deg, #9333ea, #db2777)',
          text: '#e5e7eb',
          highlight: '#FFD700',
          success: '#22c55e',
          warning: '#ef4444',
        }}
      />

      {/* ===== CIRCULAR PROGRESS TIMER - EXPLICIT POSITIONING (V11.1) ===== */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <div style={{
          position: 'absolute',
          top: 240,
          right: 60,
          zIndex: 150,
        }}>
          {(() => {
            const secondsLeft = Math.max(0, Math.ceil((timerDuration - (frame - questionStartFrame)) / fps));
            const progress = Math.max(0, Math.min(1, (frame - questionStartFrame) / timerDuration));
            const circumference = 2 * Math.PI * 50;
            const offset = circumference * (1 - progress);

            // ANXIETY EFFECTS: Shake and pulse intensify as time runs out
            const shakeIntensity = progress * 3;
            const shakeX = Math.sin(frame * 0.8) * shakeIntensity;
            const shakeY = Math.cos(frame * 0.6) * shakeIntensity;

            // Pulse effect
            const pulseScale = 1.0 + (Math.sin(frame * 0.3) * 0.08 * progress);

            // ZOOM effect - grows larger in final 5 seconds
            const baseZoom = secondsLeft <= 5 ? 1.0 + ((5 - secondsLeft) * 0.08) : 1.0;

            // Red color bleed
            const redIntensity = Math.min(1, progress * 1.5);

            return (
              <div style={{
                position: 'relative',
                width: 140,
                height: 140,
                transform: `translate(${shakeX}px, ${shakeY}px) scale(${pulseScale * baseZoom})`,
                filter: `drop-shadow(0 0 ${20 * progress}px rgba(239, 68, 68, ${redIntensity * 0.8}))`,
              }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="url(#timerGradientDka)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="timerGradientDka" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={progress < 0.5 ? "#9333ea" : "#dc2626"} />
                      <stop offset="100%" stopColor={progress < 0.5 ? "#db2777" : "#ef4444"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56 + (progress * 8),
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

      {/* ===== RED ANXIETY SCREEN - Intensifies as timer counts down ===== */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;
        const secondsRemaining = Math.max(0, Math.ceil((timerDuration - framesIntoTimer) / fps));

        // Red starts kicking in at 4 seconds remaining
        let baseIntensity = 0;
        if (secondsRemaining <= 4) {
          const redProgress = (4 - secondsRemaining) / 4;
          baseIntensity = redProgress * redProgress * 0.5;
        }

        // Pulse effect in final 3 seconds
        let pulseMultiplier = 1.0;
        if (secondsRemaining <= 3) {
          pulseMultiplier = 1.0 + Math.sin(frame * 0.6) * 0.3;
        }

        const finalIntensity = Math.min(0.6, baseIntensity * pulseMultiplier);

        return (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(239, 68, 68, ' + finalIntensity + ') 100%)',
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
    </FullScreenZoom>
  );
};

export default DkaPotassiumManagementAd;
