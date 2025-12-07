import React from 'react';
import { AbsoluteFill, Img, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

/**
 * StaticMemeOverlay - Static meme image overlay with optional sound
 *
 * This overlays a meme image on top of the content WITHOUT interrupting audio.
 * For full-screen video cutaways that pause audio, use MemeCutaway instead.
 */
const StaticMemeOverlay = ({
  imagePath, // Direct path to image in public folder (e.g., 'assets/memes/success-kid.jpg')
  timestamp, // Raw timestamp in seconds when meme should appear
  durationInFrames = 50,
  position = 'center',
  scale = 0.55,
  playbackRate = 1.85,
  soundEffect = null, // Sound file in public/assets/sfx/memes/ (e.g., 'Wait a minute....mp3')
  soundVolume = 0.4,
  frameOffset = 0 // Offset for meme cutaway timing
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Adjust timestamp for playback rate
  const adjustedTimestamp = timestamp / playbackRate;
  const startFrame = Math.floor(adjustedTimestamp * fps) + frameOffset;
  const endFrame = startFrame + durationInFrames;

  // Don't render if outside time window
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Calculate opacity (fade in/out)
  const fadeFrames = 5;
  const framesIntoMeme = frame - startFrame;

  const opacity = interpolate(
    framesIntoMeme,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Pop-in scale animation
  const popScale = interpolate(
    framesIntoMeme,
    [0, 8],
    [0.8, 1],
    { extrapolateRight: 'clamp' }
  );

  // Position presets - optimized for TikTok vertical format
  const positions = {
    'bottom-right': { bottom: '20%', right: '5%' },
    'bottom-left': { bottom: '20%', left: '5%' },
    'top-right': { top: '25%', right: '5%' },
    'top-left': { top: '25%', left: '5%' },
    'center': { top: '45%', left: '50%', transform: `translate(-50%, -50%) scale(${popScale})` },
    'center-low': { top: '55%', left: '50%', transform: `translate(-50%, -50%) scale(${popScale})` },
  };

  const positionStyle = positions[position] || positions['center'];

  // For non-center positions, add the popScale to transform
  const finalPositionStyle = position.includes('center')
    ? positionStyle
    : { ...positionStyle, transform: `scale(${popScale})` };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
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
          ...finalPositionStyle,
          opacity,
          width: `${scale * 100}%`,
          maxWidth: '500px',
        }}
      >
        <Img
          src={staticFile(imagePath)}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
            border: '4px solid white',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default StaticMemeOverlay;
