import React from 'react';
import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';
import memeLibrary from '../assets/memes/meme-library.json';

const MemeOverlay = ({
  memeId,
  timestamp,
  durationInFrames,
  position = 'bottom-right',
  scale = 0.3,
  playbackRate = 2.0,
  overlayText = null,
  soundEffect = null,
  soundVolume = 0.4
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Adjust timestamp for playback rate
  const adjustedTimestamp = timestamp / playbackRate;
  const startFrame = Math.floor(adjustedTimestamp * fps);
  const endFrame = startFrame + durationInFrames;

  // Don't render if outside time window
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Calculate opacity (fade in/out)
  const fadeFrames = 5; // 5 frames for fade (~0.17s at 30fps)
  const framesIntoMeme = frame - startFrame;
  const framesUntilEnd = endFrame - frame;

  const opacity = interpolate(
    framesIntoMeme,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Position presets
  const positions = {
    'bottom-right': { bottom: '15%', right: '5%' },
    'bottom-left': { bottom: '15%', left: '5%' },
    'top-right': { top: '15%', right: '5%' },
    'top-left': { top: '15%', left: '5%' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  const positionStyle = positions[position] || positions['bottom-right'];

  // Get meme file path with correct extension from library
  const memeInfo = memeLibrary[memeId];
  const memePath = memeInfo ? memeInfo.local_path : `memes/${memeId}.jpg`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
      {/* Sound effect - plays once when meme appears */}
      {soundEffect && frame === startFrame && (
        <Audio
          src={staticFile(`assets/sfx/memes/${soundEffect}`)}
          volume={soundVolume}
        />
      )}

      <div
        style={{
          position: 'absolute',
          ...positionStyle,
          opacity,
          width: `${scale * 100}%`,
          maxWidth: '400px'
        }}
      >
        <Img
          src={staticFile(memePath)}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '3px solid white'
          }}
        />

        {overlayText && (
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              fontFamily: 'Impact, sans-serif',
              fontSize: '24px',
              color: 'white',
              textAlign: 'center',
              textTransform: 'uppercase',
              WebkitTextStroke: '2px black',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {overlayText.reject && (
              <div style={{ marginBottom: '10px' }}>❌ {overlayText.reject}</div>
            )}
            {overlayText.approve && (
              <div>✅ {overlayText.approve}</div>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default MemeOverlay;
