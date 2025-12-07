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
import timestampsData from '../assets/audio/mucormycosis-aligned-timestamps.json';

export const MucormycosisAd = ({ audioPath, questionData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 2.0;

  // CRITICAL: Key timestamps from audio
  const questionStartTime = 48.135; // End of "I'll wait."
  const answerRevealTime = 54.799;  // Start of "It's D."

  const questionStartFrame = Math.floor((questionStartTime / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTime / PLAYBACK_RATE) * fps);
  const timerDuration = answerRevealFrame - questionStartFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {audioPath && <Audio src={audioPath} playbackRate={2.0} />}

      <Sequence from={0}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      <Sequence from={answerRevealFrame}>
        <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
      </Sequence>

      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
        timestampsSource="mucormycosis"
        playbackRate={PLAYBACK_RATE}
      />

      <MedicalQuestionCard questionData={questionData} />

      <TikTokCaptions words={timestampsData.words} playbackRate={PLAYBACK_RATE} />

      {/* Countdown Timer */}
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
            const circumference = 2 * Math.PI * 45;
            const offset = circumference * (1 - progress);

            return (
              <div style={{
                position: 'relative',
                width: 120,
                height: 120,
              }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="8"
                  />
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
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#db2777" />
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
