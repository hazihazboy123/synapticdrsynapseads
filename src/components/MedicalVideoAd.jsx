import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Img,
  spring,
  staticFile
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import timestampsData from '../assets/audio/aligned-timestamps.json';

export const MedicalVideoAd = ({ audioPath, script, memes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Helper function to get meme size (bigger sizes for better visibility)
  const getMemeSize = (size) => {
    switch(size) {
      case 'small': return 500;
      case 'medium': return 700;
      case 'large': return 900;
      default: return 700;
    }
  };

  // Helper function to get position styles
  const getPositionStyle = (position) => {
    const base = {
      position: 'absolute',
    };

    switch(position) {
      case 'center':
        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom-right':
        return { ...base, bottom: 200, right: 80 };
      case 'bottom-left':
        return { ...base, bottom: 200, left: 80 };
      case 'top-right':
        return { ...base, top: 200, right: 80 };
      case 'top-left':
        return { ...base, top: 200, left: 80 };
      default:
        return { ...base, bottom: 200, right: 80 };
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Audio narration - sped up 1.75x */}
      {audioPath && <Audio src={audioPath} playbackRate={1.75} />}

      {/* Whoosh sound effect at start */}
      <Sequence from={0}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
      </Sequence>

      {/* Timer ticking sound when asking question - starts at "Which mechanism", stops before ding */}
      <Sequence from={Math.floor((37.187 / 1.75) * fps)} durationInFrames={Math.floor(((46.068 - 37.187) / 1.75) * fps)}>
        <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
      </Sequence>

      {/* Correct answer ding - when he says "C." */}
      <Sequence from={Math.floor((46.068 / 1.75) * fps)}>
        <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
      </Sequence>

      {/* Dr. Synapse - CENTER TOP (The Star!) */}
      <BrainMascot
        audioPath={audioPath}
        position="top-center"
        size={350}
      />

      {/* Background image - medical question (positioned below Dr. Synapse) */}
      <div style={{
        position: 'absolute',
        top: 420,  // Leave room for Dr. Synapse (350px + 70px padding)
        left: 0,
        right: 0,
        bottom: 200,  // Leave room for captions
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 20px',
      }}>
        <Img
          src={staticFile('assets/background.png')}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>

      {/* TikTok-style captions - line by line at bottom */}
      <TikTokCaptions words={timestampsData.words} />

      {/* Green screen flash when answer C is revealed */}
      <Sequence from={Math.floor((46.068 / 1.75) * fps)} durationInFrames={Math.floor(0.3 * fps)}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 255, 0, 0.25)',
          opacity: interpolate(
            frame - Math.floor((46.068 / 1.75) * fps),
            [0, 3, Math.floor(0.3 * fps)],
            [0, 1, 0],
            { extrapolateRight: 'clamp' }
          ),
          pointerEvents: 'none',
          zIndex: 50,
        }} />
      </Sequence>

      {/* MEME OVERLAYS - Dynamic positioning and sizing */}
      {memes && memes.map((meme, index) => {
        const startFrame = meme.timestamp * fps;
        const durationFrames = meme.duration * fps;
        const memeSize = getMemeSize(meme.size);

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <AbsoluteFill>
              <div style={getPositionStyle(meme.position)}>
                <Img
                  src={staticFile(meme.path.replace('/assets/', 'assets/'))}
                  style={{
                    width: memeSize,
                    height: memeSize,
                    objectFit: 'contain',
                    borderRadius: 20,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                    border: '3px solid rgba(255,255,255,0.2)',
                  }}
                />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
