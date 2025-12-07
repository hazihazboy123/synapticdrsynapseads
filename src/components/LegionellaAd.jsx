import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  staticFile
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import MemeOverlay from './MemeOverlay';
import timestampsData from '../assets/audio/legionella-aligned-timestamps.json';
import memePlacements from '../assets/memes/legionella-meme-placements.json';

export const LegionellaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.85;
  const durationInFrames = 1501;

  // Key timestamps (in raw audio seconds, NOT adjusted)
  const questionStartTime = 40.229;
  const answerRevealTime = 46.417;

  // Convert to frames
  const questionStartFrame = Math.floor((questionStartTime / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  const questionData = {
    card_id: 1,
    vignette: "A 62-year-old man presents with fever, productive cough, watery diarrhea, and confusion. He recently returned from a business convention at a hotel. Physical exam reveals crackles in the right lower lobe.",
    lab_values: [
      {
        label: "Sodium:",
        value: "126 mEq/L",
        status: "critical",
        color: "#ef4444",
        note: "(normal: 136-145)"
      },
      {
        label: "AST:",
        value: "89 U/L",
        status: "elevated",
        color: "#fbbf24",
        note: "(normal: 10-40)"
      },
      {
        label: "WBC:",
        value: "14,200/μL",
        status: "elevated",
        color: "#fbbf24",
        note: "(normal: 4,500-11,000)"
      }
    ],
    question_text: "Which diagnostic finding is MOST specific for the causative organism?",
    options: [
      { letter: "A", text: "Urinary antigen detection", is_correct: true },
      { letter: "B", text: "Cold agglutinin antibodies", is_correct: false },
      { letter: "C", text: "Gram stain showing lancet-shaped diplococci", is_correct: false },
      { letter: "D", text: "Growth on chocolate agar with factors V and X", is_correct: false },
      { letter: "E", text: "Positive rapid strep antigen test", is_correct: false }
    ],
    correct_answer: "A"
  };

  const audioPath = staticFile('assets/audio/legionella-narration.mp3');

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Audio narration */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} />

      {/* System sounds */}
      <Sequence from={0}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      <Sequence from={answerRevealFrame}>
        <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
      </Sequence>

      {/* Brain mascot */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="legionella"
        playbackRate={PLAYBACK_RATE}
      />

      {/* Question card */}
      <MedicalQuestionCard questionData={questionData} />

      {/* Captions */}
      <TikTokCaptions
        words={timestampsData}
        playbackRate={PLAYBACK_RATE}
        bottomOffset={320}
      />

      {/* Meme Overlays with Sounds */}
      {memePlacements.memes && memePlacements.memes.map((meme, index) => (
        <MemeOverlay
          key={`meme-${index}`}
          memeId={meme.id}
          timestamp={meme.timestamp}
          durationInFrames={meme.duration_frames}
          position={meme.position}
          scale={meme.scale}
          playbackRate={PLAYBACK_RATE}
          soundEffect={meme.sound_effect}
          soundVolume={meme.sound_volume}
          overlayText={meme.overlayText}
        />
      ))}

      {/* Standalone Sound Effects */}
      {memePlacements.standalone_sounds && memePlacements.standalone_sounds.map((sound, index) => {
        const soundFrame = Math.floor((sound.timestamp / PLAYBACK_RATE) * fps);
        return (
          <Sequence key={`sound-${index}`} from={soundFrame}>
            <Audio
              src={staticFile(`assets/sfx/memes/${sound.sound_effect}`)}
              volume={sound.sound_volume}
            />
          </Sequence>
        );
      })}

      {/* Countdown Timer */}
      {frame >= questionStartFrame && frame < answerRevealFrame && (() => {
        const framesIntoTimer = frame - questionStartFrame;
        const progress = framesIntoTimer / timerDuration;

        // Simple color selection based on progress
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
