import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, staticFile, OffthreadVideo, Sequence } from 'remotion';

// NOTE: <Gif> component removed - causes flashing during render
// Now using OffthreadVideo with MP4 files for stable rendering

// Detect if source is a video file
const isVideoFile = (src) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
};

/**
 * StaticMemeOverlay - Video-compatible meme overlay
 *
 * Updated to use OffthreadVideo for MP4 files for stable rendering.
 * GIF support removed due to flashing issues with @remotion/gif.
 */
const StaticMemeOverlay = ({
  src, // Can be URL or path to local asset
  imagePath, // Legacy: path to local asset (use src instead)
  timestamp,
  durationInFrames = 50,
  position = 'center',
  scale = 0.55,
  playbackRate = 2.0,
  soundEffect = null,
  soundVolume = 0.4,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Calculate when to show
  const adjustedTimestamp = timestamp / playbackRate;
  const startFrame = Math.floor(adjustedTimestamp * fps) + frameOffset;
  const endFrame = startFrame + durationInFrames;

  // Simple: show or don't show
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Fixed dimensions for the container
  const containerWidth = Math.floor(scale * 700);
  const containerHeight = Math.floor(scale * 500);

  // Determine the source - prefer src (URL) over imagePath (local)
  const mediaSource = src || staticFile(imagePath);
  const isVideo = isVideoFile(mediaSource);

  // Position styles based on position prop
  const getPositionStyles = () => {
    const base = {
      position: 'absolute',
      zIndex: 100,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 100, left: 50 };
      case 'top-right':
        return { ...base, top: 100, right: 50 };
      case 'bottom-left':
        return { ...base, bottom: 100, left: 50 };
      case 'bottom-right':
        return { ...base, bottom: 100, right: 50 };
      case 'center':
      default:
        return {
          ...base,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Sound effect - only on first frame */}
      {soundEffect && frame === startFrame && (
        <Audio
          src={staticFile(`assets/sfx/memes/${soundEffect}`)}
          volume={soundVolume}
        />
      )}

      {/* Fixed-size container */}
      <div
        style={{
          ...getPositionStyles(),
          width: containerWidth,
          height: containerHeight,
          borderRadius: 16,
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.7)',
          border: '4px solid white',
          backgroundColor: '#000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isVideo ? (
          <Sequence from={startFrame} layout="none">
            <OffthreadVideo
              src={mediaSource}
              style={{
                width: containerWidth,
                height: containerHeight,
                objectFit: 'contain',
                display: 'block',
              }}
              muted
              loop
            />
          </Sequence>
        ) : (
          <img
            src={mediaSource}
            style={{
              width: containerWidth,
              height: containerHeight,
              objectFit: 'contain',
              display: 'block',
            }}
            alt=""
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default StaticMemeOverlay;
