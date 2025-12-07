import React from 'react';
import { AbsoluteFill, Video, Sequence, useCurrentFrame, interpolate, staticFile } from 'remotion';

/**
 * VideoMemeOverlay - Video meme overlay (like StaticMemeOverlay but with video)
 *
 * This overlays a meme VIDEO on top of the content WITHOUT interrupting main audio.
 * Video plays in a smaller window like static memes, not full screen.
 * For full-screen video cutaways that pause audio, use MemeCutaway instead.
 */
const VideoMemeOverlay = ({
  videoPath, // Direct path to video in public folder (e.g., 'assets/memes/videos/this-is-fine.mp4')
  timestamp, // Raw timestamp in seconds when meme should appear
  durationInFrames = 75, // Default 2.5 seconds at 30fps
  position = 'center',
  scale = 0.55,
  playbackRate = 1.85,
  videoVolume = 0.7, // Volume of the meme video audio
  frameOffset = 0, // Offset for meme cutaway timing
  loop = true, // Loop the video if duration exceeds video length
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
    <Sequence from={startFrame} durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
        <div
          style={{
            position: 'absolute',
            ...finalPositionStyle,
            opacity,
            width: `${scale * 100}%`,
            maxWidth: '500px',
          }}
        >
          <Video
            src={staticFile(videoPath)}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '16px',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
              border: '4px solid white',
            }}
            volume={videoVolume}
            loop={loop}
          />
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

export default VideoMemeOverlay;
