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
import timestampsData from '../assets/audio/fluoroquinolone-aligned-timestamps.json';

export const FluoroquinoloneAd = ({ audioPath, questionData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Audio timing (with 1.5x playback - slower, more digestible)
  const PLAYBACK_RATE = 1.5;

  // Key timestamps from NEW audio:
  // "Think" = 41.831s
  // "wait." = 42.736s - 43.084s
  // "It's A." = 47.009s
  // Timer pause = 43.084s (end of "wait.") to 47.009s (start of "It's A") = ~4 seconds

  const questionStartTime = 43.084; // End of "I'll wait."
  const answerRevealTime = 47.009; // Start of "It's A"

  // Convert to frames with playback speed adjustment
  const questionStartFrame = Math.floor((questionStartTime / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTime / PLAYBACK_RATE) * fps);
  const timerDuration = answerRevealFrame - questionStartFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Audio narration - 1.5x speed (slower, easier to follow) */}
      {audioPath && <Audio src={audioPath} playbackRate={1.5} />}

      {/* Whoosh sound effect at start */}
      <Sequence from={0}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Timer ticking sound - starts at "Think about it", stops before "It's A" */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      {/* Correct answer ding - when he says "It's A" */}
      <Sequence from={answerRevealFrame}>
        <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
      </Sequence>

      {/* Dr. Synapse - CENTER TOP (uses timestamps for word-sync animation) */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="fluoroquinolone"
        playbackRate={PLAYBACK_RATE}
      />

      {/* Medical Question Card - HTML rendered, not image! (Perfect template spacing) */}
      <MedicalQuestionCard questionData={questionData} />

      {/* TikTok-style captions - line by line at bottom */}
      <TikTokCaptions words={timestampsData.words} playbackRate={PLAYBACK_RATE} />

      {/* Countdown Timer - Circular clock in top right corner */}
      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <div style={{
          position: 'absolute',
          top: 100,
          right: 60,
          zIndex: 150,
        }}>
          {(() => {
            const secondsLeft = Math.max(0, Math.ceil((timerDuration - (frame - questionStartFrame)) / fps));
            const progress = Math.max(0, Math.min(1, (frame - questionStartFrame) / timerDuration));
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference * (1 - progress);

            return (
              <div style={{
                position: 'relative',
                width: 120,
                height: 120,
              }}>
                {/* SVG Circle Timer */}
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Number in center */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 'bold',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  color: '#FFFFFF',
                }}>
                  {secondsLeft}
                </div>
              </div>
            );
          })()}
        </div>
      </Sequence>


      {/* Green screen flash when answer "A" is revealed */}
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
