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
import MemeCutaway from './MemeCutaway';
import StaticMemeOverlay from './StaticMemeOverlay';

// Import timestamps directly
const timestampsData = require('../../public/assets/audio/aspiration-pneumonia-timestamps.json');
const memePlacements = require('../../public/assets/memes/aspiration-pneumonia-meme-placements.json');

/**
 * AspirationPneumoniaAd - Aspiration Pneumonia with drunk man falling meme
 *
 * ARCHITECTURE FOR MEME PAUSE:
 * - Meme triggers at "wind." and lasts 72 frames (2.4s)
 * - During meme: main audio PAUSES (not just mutes)
 * - After meme: main audio RESUMES from where it left off
 *
 * STATIC OVERLAYS (don't interrupt audio):
 * - success-kid at HORNSWOGGLED (answer reveal) - no sound, DING plays from card
 * - confused-nick-young at PECULIAR - "Wait a minute...." sound
 * - hide-the-pain-harold at DISCOMBOBULATED - "Sadness-3.mp3" sound
 */
export const AspirationPneumoniaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.85;

  // Meme cutaway timing (drunk-man-falling) - triggers at "Chronic drunk."
  const memeTimestamp = 11.099; // "drunk." ends at 11.099s in raw audio
  const memeStartFrame = Math.floor((memeTimestamp / PLAYBACK_RATE) * fps); // ~180 frames
  const memeDurationFrames = 72; // 72 frames (2.4s)
  const memeEndFrame = memeStartFrame + memeDurationFrames;

  // Audio timing - the raw audio timestamp when meme triggers
  const audioSplitTime = memeTimestamp; // 11.099s in raw audio time

  // Key timestamps (in raw audio seconds) - these need to be OFFSET by meme duration
  const questionStartTimeRaw = 43.90;  // "Think" in raw audio
  const answerRevealTimeRaw = 52.23;   // "HORNSWOGGLED" in raw audio

  // Convert to frames, accounting for meme pause
  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // Static overlay timestamps (raw audio seconds) - also need offset
  const peculiarTimestamp = 78.87;
  const discombobulatedTimestamp = 100.24;

  // Vignette highlights - timestamps when narrator mentions these concepts
  // These highlight key clinical clues as they're spoken
  const vignetteHighlights = [
    { phrase: "foul-smelling sputum", timestamp: 3.1 },    // "smells so PUTRID"
    { phrase: "chronic alcoholism", timestamp: 10.112 },   // "Chronic drunk"
    { phrase: "'passing out'", timestamp: 11.598 },        // "Passed out"
    { phrase: "fever", timestamp: 16.73 },                 // "fever"
  ];

  const questionData = {
    card_id: 1,
    topic: "aspiration-pneumonia",
    vignette: "55-year-old man with chronic alcoholism presents to the ED with fever, productive cough, and foul-smelling sputum. He reports 'passing out' at home 2 days ago.",
    lab_values: [
      {
        label: "WBC:",
        value: "18,000/μL",
        status: "elevated",
        color: "#ef4444",
        note: "(elevated)"
      },
      {
        label: "Temperature:",
        value: "39.2°C",
        status: "elevated",
        color: "#ef4444",
        note: "(fever)"
      }
    ],
    question_text: "Chest X-ray shows right lower lobe infiltrate. What is the most likely diagnosis?",
    options: [
      { letter: "A", text: "Community-acquired pneumonia (S. pneumoniae)", is_correct: false },
      { letter: "B", text: "Tuberculosis", is_correct: false },
      { letter: "C", text: "Aspiration pneumonia", is_correct: true },
      { letter: "D", text: "Pulmonary embolism with infarction", is_correct: false },
      { letter: "E", text: "Hospital-acquired pneumonia", is_correct: false }
    ],
    correct_answer: "C"
  };

  const audioPath = staticFile('assets/audio/aspiration-pneumonia-narration.mp3');

  // Check if current frame is during the meme cutaway
  const isInMemeCutaway = frame >= memeStartFrame && frame < memeEndFrame;

  // ===== SCREEN SHAKE ON VIGNETTE HIGHLIGHTS =====
  // Shake screen when important text gets underlined
  let screenShakeX = 0;
  let screenShakeY = 0;
  const SHAKE_DURATION_FRAMES = 6; // Quick shake (0.2s)
  const SHAKE_INTENSITY = 8; // pixels

  vignetteHighlights.forEach(highlight => {
    const highlightFrame = (highlight.timestamp / PLAYBACK_RATE) * fps;
    const framesSinceHighlight = frame - highlightFrame;

    if (framesSinceHighlight >= 0 && framesSinceHighlight < SHAKE_DURATION_FRAMES) {
      // Create shake pattern: left-right-left oscillation
      const shakeProgress = framesSinceHighlight / SHAKE_DURATION_FRAMES;
      const shakeFalloff = 1 - shakeProgress; // Decay over time

      screenShakeX = Math.sin(framesSinceHighlight * 2) * SHAKE_INTENSITY * shakeFalloff;
      screenShakeY = Math.cos(framesSinceHighlight * 2.5) * (SHAKE_INTENSITY * 0.5) * shakeFalloff;
    }
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
      transform: `translate(${screenShakeX}px, ${screenShakeY}px)`
    }}>
      {/* Branding - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '3%',
          left: '5%',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ec4899',
          fontFamily: 'Inter, sans-serif',
          zIndex: 100,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
        }}
      >
        synapticrecall.ai
      </div>

      {/*
        AUDIO PART 1: Plays from start until meme trigger
        - Starts at frame 0
        - Plays until memeStartFrame (when it gets cut off by the meme)
      */}
      <Sequence from={0} durationInFrames={memeStartFrame}>
        <Audio
          src={audioPath}
          playbackRate={PLAYBACK_RATE}
          volume={1}
        />
      </Sequence>

      {/*
        AUDIO PART 2: Resumes after meme ends
        - Starts at memeEndFrame (after meme finishes)
        - Audio startFrom = where Part 1 left off (audioSplitTime converted to frames at 1x speed)
        - This makes the audio "resume" from the exact spot
      */}
      <Sequence from={memeEndFrame}>
        <Audio
          src={audioPath}
          playbackRate={PLAYBACK_RATE}
          startFrom={Math.floor(audioSplitTime * fps)} // Resume from 13.96s in the audio file
          volume={1}
        />
      </Sequence>

      {/* System sounds - adjusted for meme offset */}
      {!isInMemeCutaway && (
        <>
          <Sequence from={0} durationInFrames={memeStartFrame}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
          </Sequence>

          {/* Heartbeat - gets LOUDER and FASTER as timer progresses */}
          <Sequence from={questionStartFrame} durationInFrames={Math.floor(timerDuration / 3)}>
            <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={0.3} playbackRate={1.0} />
          </Sequence>
          <Sequence from={questionStartFrame + Math.floor(timerDuration / 3)} durationInFrames={Math.floor(timerDuration / 3)}>
            <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={0.5} playbackRate={1.3} />
          </Sequence>
          <Sequence from={questionStartFrame + Math.floor(2 * timerDuration / 3)} durationInFrames={Math.ceil(timerDuration / 3)}>
            <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={0.8} playbackRate={1.6} />
          </Sequence>

          <Sequence from={answerRevealFrame}>
            <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
          </Sequence>
        </>
      )}

      {/* Main content - HIDDEN during meme cutaway */}
      {!isInMemeCutaway && (
        <>
          {/* Brain mascot - uses timestamps for sync */}
          <BrainMascot
            audioPath={audioPath}
            position="top-center"
            size={350}
            timestampsSource="aspiration-pneumonia"
            playbackRate={PLAYBACK_RATE}
          />

          {/* Question card - uses adjusted timing */}
          <MedicalQuestionCard
            questionData={questionData}
            answerRevealTime={answerRevealTimeRaw}
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
            vignetteHighlights={vignetteHighlights}
          />

          {/* Word-synced captions - uses frame offset for proper sync */}
          <TikTokCaptions
            words={timestampsData.words}
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
          />
        </>
      )}

      {/* MEME CUTAWAY - Hard cut to full screen meme (drunk-man-falling) */}
      <MemeCutaway
        memeId="drunk-man-falling"
        triggerTimestamp={memeTimestamp / PLAYBACK_RATE} // Adjusted timestamp
        playbackRate={1.0}
        customDuration={memeDurationFrames / fps}
      />

      {/* STATIC MEME OVERLAYS - These DON'T interrupt audio */}
      {/* success-kid at answer reveal - no sound (DING plays from card) */}
      <StaticMemeOverlay
        imagePath="assets/memes/success-kid.jpg"
        timestamp={answerRevealTimeRaw}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        frameOffset={memeDurationFrames}
      />

      {/* confused-nick-young at PECULIAR */}
      <StaticMemeOverlay
        imagePath="assets/memes/confused-nick-young.jpg"
        timestamp={peculiarTimestamp}
        durationInFrames={50}
        position="center"
        scale={0.6}
        playbackRate={PLAYBACK_RATE}
        soundEffect="Wait a minute....mp3"
        soundVolume={0.5}
        frameOffset={memeDurationFrames}
      />

      {/* hide-the-pain-harold at DISCOMBOBULATED - no sound, narration continues */}
      <StaticMemeOverlay
        imagePath="assets/memes/hide-the-pain-harold.jpg"
        timestamp={discombobulatedTimestamp}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}
        soundVolume={0}
        frameOffset={memeDurationFrames}
      />

      {/* Countdown Timer - 5 seconds before answer (with offset) */}
      {!isInMemeCutaway && frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;

        // Color based on progress
        let borderColor = '#10b981'; // green
        if (progress > 0.8) {
          borderColor = '#ef4444'; // red
        } else if (progress > 0.5) {
          borderColor = '#f97316'; // orange
        } else if (progress > 0.3) {
          borderColor = '#fbbf24'; // yellow
        }

        return (
          <div
            style={{
              position: 'absolute',
              top: '5%',
              right: '5%',
              width: '140px',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              borderRadius: '50%',
              border: '6px solid',
              borderColor: borderColor,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 40,
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
              {Math.max(1, Math.ceil((timerDuration - framesIntoTimer) / fps))}
            </div>
          </div>
        );
      })()}

      {/* Green flash on answer reveal */}
      {!isInMemeCutaway && (
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
      )}
    </AbsoluteFill>
  );
};

export default AspirationPneumoniaAd;
