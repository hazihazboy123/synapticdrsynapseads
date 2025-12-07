import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import MemeOverlay from './MemeOverlay';
import timestampsData from '../assets/audio/squamous-cell-lung-carcinoma-aligned-timestamps.json';
import memePlacements from '../assets/memes/squamous-cell-lung-carcinoma-meme-placements.json';

export const SquamousCellLungCarcinomaAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.85;
  const durationInFrames = 1714;

  // Key timestamps (in raw audio seconds, NOT adjusted)
  const questionStartTime = 31.94;
  const answerRevealTime = 37.08;

  // Convert to frames
  const questionStartFrame = Math.floor((questionStartTime / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTime / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  const questionData = {
    card_id: 1,
    vignette: "A 58-year-old man with a 60 pack-year smoking history presents with hemoptysis and weight loss. Chest CT reveals a 4 cm central hilar mass with cavitation. Laboratory studies show serum calcium of 12.8 mg/dL with suppressed PTH. Bone scan shows no metastatic lesions. Bronchoscopy with biopsy is performed.",
    lab_values: [
      {
        label: "Calcium:",
        value: "12.8 mg/dL",
        status: "critical",
        color: "#ef4444",
        note: "(normal: 8.5-10.5)"
      },
      {
        label: "PTH:",
        value: "8 pg/mL",
        status: "low",
        color: "#3b82f6",
        note: "(normal: 10-65)"
      },
      {
        label: "PTHrP:",
        value: "elevated",
        status: "elevated",
        color: "#fbbf24",
        note: ""
      },
      {
        label: "Phosphate:",
        value: "low",
        status: "low",
        color: "#3b82f6",
        note: ""
      }
    ],
    question_text: "Which histologic finding is most likely present on biopsy?",
    options: [
      { letter: "A", text: "Glandular differentiation with mucin production", is_correct: false },
      { letter: "B", text: "Small cells with nuclear molding and crush artifact", is_correct: false },
      { letter: "C", text: "Keratin pearls and intercellular bridges", is_correct: true },
      { letter: "D", text: "Clear cells with abundant glycogen", is_correct: false },
      { letter: "E", text: "Psammoma bodies with papillary architecture", is_correct: false }
    ],
    correct_answer: "C"
  };

  const audioPath = staticFile('assets/audio/squamous-cell-lung-carcinoma-narration.mp3');

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
        timestampsSource="squamous-cell-lung-carcinoma"
        playbackRate={PLAYBACK_RATE}
      />

      {/* Question card */}
      <MedicalQuestionCard
        questionData={questionData}
        answerRevealTime={answerRevealTime}
        playbackRate={PLAYBACK_RATE}
      />

      {/* Word-synced captions */}
      <TikTokCaptions
        words={timestampsData}
        playbackRate={PLAYBACK_RATE}
      />

      {/* Meme overlays */}
      {memePlacements.memes && memePlacements.memes.map((meme, index) => (
        <MemeOverlay
          key={index}
          memeId={meme.id}
          timestamp={meme.timestamp}
          durationInFrames={meme.durationFrames}
          scale={meme.scale}
          position={meme.position}
          soundEffect={meme.soundEffect}
          soundVolume={meme.soundVolume}
          playbackRate={PLAYBACK_RATE}
        />
      ))}
    </AbsoluteFill>
  );
};
