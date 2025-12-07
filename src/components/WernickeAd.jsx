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
// Import timestamps directly - wernicke uses public folder
const timestampsData = require('../../public/assets/audio/wernicke-timestamps.json');
const memePlacements = require('../../public/assets/memes/wernicke-meme-placements.json');

/**
 * WernickeAd - Wernicke Encephalopathy with drunk man falling meme
 *
 * ARCHITECTURE FOR MEME PAUSE:
 * - Meme triggers at frame 95 (3.18s adjusted) and lasts 72 frames (2.4s)
 * - During meme: main audio PAUSES (not just mutes)
 * - After meme: main audio RESUMES from where it left off
 *
 * We achieve this by:
 * 1. Playing audio Part 1: from frame 0, plays until meme trigger
 * 2. Meme plays for 72 frames
 * 3. Playing audio Part 2: starts at (memeEndFrame), but audio starts from where Part 1 left off
 */
export const WernickeAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.85;

  // Meme timing
  const meme = memePlacements.memes[0]; // drunk-man-falling
  const memeStartFrame = Math.floor(meme.adjustedTimestamp * fps); // ~95 frames (3.18s)
  const memeDurationFrames = meme.durationFrames; // 72 frames (2.4s)
  const memeEndFrame = memeStartFrame + memeDurationFrames; // ~167 frames

  // Audio timing - the raw audio timestamp when meme triggers
  const audioSplitTime = meme.timestamp; // 5.886s in raw audio time (when "years." ends)

  // Key timestamps (in raw audio seconds) - these need to be OFFSET by meme duration
  const questionStartTimeRaw = 23.103;  // "Think" in raw audio
  const answerRevealTimeRaw = 28.119;   // "It's" in raw audio

  // Convert to frames, accounting for meme pause
  // Before meme: normal calculation
  // After meme: add memeDurationFrames offset
  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  const questionData = {
    card_id: 1,
    topic: "wernicke-encephalopathy",
    vignette: "A 54-year-old man with a history of chronic alcohol use disorder is brought to the emergency department by his family. He appears confused and disoriented. Physical examination reveals horizontal nystagmus, lateral rectus palsy, and a wide-based ataxic gait. His glucose is 68 mg/dL. The ER physician prepares to start IV fluids.",
    lab_values: [
      {
        label: "Blood alcohol:",
        value: "0.08%",
        status: "elevated",
        color: "#fbbf24"
      },
      {
        label: "Glucose:",
        value: "68 mg/dL",
        status: "normal",
        color: "#22c55e",
        note: "(low-normal)"
      },
      {
        label: "MCV:",
        value: "102 fL",
        status: "elevated",
        color: "#fbbf24",
        note: "(macrocytic)"
      }
    ],
    question_text: "Which of the following should be administered FIRST?",
    options: [
      { letter: "A", text: "Intravenous dextrose", is_correct: false },
      { letter: "B", text: "Naloxone", is_correct: false },
      { letter: "C", text: "Lorazepam", is_correct: false },
      { letter: "D", text: "Thiamine", is_correct: true },
      { letter: "E", text: "Haloperidol", is_correct: false }
    ],
    correct_answer: "D"
  };

  const audioPath = staticFile('assets/audio/wernicke-narration.mp3');

  // Check if current frame is during the meme cutaway
  const isInMemeCutaway = frame >= memeStartFrame && frame < memeEndFrame;

  // Calculate "virtual frame" for components - this is the frame as if the meme pause didn't exist
  // Used for captions, mascot, etc. so they sync with the actual audio playback
  const getVirtualFrame = () => {
    if (frame < memeStartFrame) {
      return frame; // Before meme: normal
    } else if (frame < memeEndFrame) {
      return memeStartFrame; // During meme: frozen at meme start
    } else {
      return frame - memeDurationFrames; // After meme: subtract meme duration
    }
  };
  const virtualFrame = getVirtualFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
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
          startFrom={Math.floor(audioSplitTime * fps)} // Resume from 5.886s in the audio file
          volume={1}
        />
      </Sequence>

      {/* System sounds - adjusted for meme offset */}
      {!isInMemeCutaway && (
        <>
          <Sequence from={0} durationInFrames={memeStartFrame}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
          </Sequence>

          <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
            <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
          </Sequence>

          <Sequence from={answerRevealFrame}>
            <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
          </Sequence>
        </>
      )}

      {/* Main content - HIDDEN during meme cutaway */}
      {!isInMemeCutaway && (
        <>
          {/* Brain mascot - uses virtual frame for sync */}
          <BrainMascot
            audioPath={audioPath}
            position="top-center"
            size={350}
            timestampsSource="wernicke"
            playbackRate={PLAYBACK_RATE}
          />

          {/* Question card - uses adjusted timing */}
          <MedicalQuestionCard
            questionData={questionData}
            answerRevealTime={answerRevealTimeRaw}
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
          />

          {/* Word-synced captions - uses virtual frame for proper sync */}
          <TikTokCaptions
            words={timestampsData}
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
          />
        </>
      )}

      {/* MEME CUTAWAY - Hard cut to full screen meme */}
      <MemeCutaway
        memeId={meme.id}
        triggerTimestamp={meme.adjustedTimestamp}
        playbackRate={1.0}
        customDuration={memeDurationFrames / fps}
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

export default WernickeAd;
