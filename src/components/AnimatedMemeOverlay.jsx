import React from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, Img, OffthreadVideo, Sequence } from 'remotion';
import { staticFile } from 'remotion';

// NOTE: spring() removed - causes jitter due to oscillation
// NOTE: <Gif> component removed - causes flashing during render
// Now using OffthreadVideo with MP4 files for stable rendering

// Detect if source is a video file
const isVideoFile = (src) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
};

/**
 * AnimatedMemeOverlay - VIRAL EDITION v4
 *
 * FIXED: No more boxes, no more jitter, no more letterboxing
 * - GIFs display at natural aspect ratio
 * - No container/border/background
 * - Smooth animations via CSS transform on wrapper only
 * - Scale controls overall size uniformly
 */
const AnimatedMemeOverlay = ({
  src,
  imagePath,
  timestamp,
  durationInFrames = 50,
  position = 'center',
  scale = 0.6,
  playbackRate = 2.0,
  soundEffect = null,
  soundVolume = 0.4,
  frameOffset = 0,
  entrance = 'bounce',
  exit = 'shrink',
  whileEffect = null,
  entranceDuration = 12,
  exitDuration = 8,
  rotation = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate timing
  const adjustedTimestamp = timestamp / playbackRate;
  const startFrame = Math.floor(adjustedTimestamp * fps) + frameOffset;
  const endFrame = startFrame + durationInFrames;
  const exitStartFrame = endFrame - exitDuration;

  // Don't render outside our window
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  const localFrame = frame - startFrame;
  const isEntering = localFrame < entranceDuration;
  const isExiting = frame >= exitStartFrame;
  const exitLocalFrame = frame - exitStartFrame;

  // Media source (MP4 or GIF)
  const mediaSource = src || staticFile(imagePath);
  const isVideo = isVideoFile(mediaSource);

  // ========== ENTRANCE ANIMATIONS ==========
  // ALL animations use frame-based interpolation ONLY - NO springs (they cause jitter)
  const getEntranceTransform = () => {
    if (!isEntering) return { scale: 1, x: 0, y: 0, rotate: rotation };

    // Frame-based progress (0 to 1) - NO SPRING
    const progress = interpolate(localFrame, [0, entranceDuration], [0, 1], { extrapolateRight: 'clamp' });

    switch (entrance) {
      case 'bounce':
        // Fake bounce with overshoot using keyframes
        const bounceScale = interpolate(localFrame,
          [0, entranceDuration * 0.5, entranceDuration * 0.75, entranceDuration],
          [0, 1.15, 0.95, 1],
          { extrapolateRight: 'clamp' }
        );
        return { scale: bounceScale, x: 0, y: 0, rotate: rotation };

      case 'slam':
        const slamScale = interpolate(localFrame, [0, entranceDuration * 0.3, entranceDuration], [4, 0.9, 1], {
          extrapolateRight: 'clamp',
        });
        return { scale: slamScale, x: 0, y: 0, rotate: rotation };

      case 'slideLeft':
        return {
          scale: 1,
          x: interpolate(progress, [0, 1], [-800, 0], { extrapolateRight: 'clamp' }),
          y: 0,
          rotate: rotation,
        };

      case 'slideRight':
        return {
          scale: 1,
          x: interpolate(progress, [0, 1], [800, 0], { extrapolateRight: 'clamp' }),
          y: 0,
          rotate: rotation,
        };

      case 'slideUp':
        return {
          scale: 1,
          x: 0,
          y: interpolate(progress, [0, 1], [600, 0], { extrapolateRight: 'clamp' }),
          rotate: rotation,
        };

      case 'slideDown':
        return {
          scale: 1,
          x: 0,
          y: interpolate(progress, [0, 1], [-600, 0], { extrapolateRight: 'clamp' }),
          rotate: rotation,
        };

      case 'spin':
        return {
          scale: progress,
          x: 0,
          y: 0,
          rotate: interpolate(progress, [0, 1], [360, rotation], { extrapolateRight: 'clamp' }),
        };

      case 'zoom':
        // Smooth zoom with slight overshoot
        const zoomScale = interpolate(localFrame,
          [0, entranceDuration * 0.7, entranceDuration],
          [0, 1.05, 1],
          { extrapolateRight: 'clamp' }
        );
        return { scale: zoomScale, x: 0, y: 0, rotate: rotation };

      default:
        return { scale: progress, x: 0, y: 0, rotate: rotation };
    }
  };

  // ========== EXIT ANIMATIONS ==========
  const getExitTransform = () => {
    if (!isExiting) return { scale: 1, x: 0, y: 0, rotate: rotation, opacity: 1 };

    const exitProgress = interpolate(exitLocalFrame, [0, exitDuration], [0, 1], {
      extrapolateRight: 'clamp',
    });

    switch (exit) {
      case 'shrink':
        return {
          scale: interpolate(exitProgress, [0, 1], [1, 0]),
          x: 0,
          y: 0,
          rotate: rotation + exitProgress * 180,
          opacity: 1,
        };

      case 'fade':
        return {
          scale: 1,
          x: 0,
          y: 0,
          rotate: rotation,
          opacity: interpolate(exitProgress, [0, 1], [1, 0]),
        };

      case 'slideOut':
        return {
          scale: 1,
          x: interpolate(exitProgress, [0, 1], [0, 800]),
          y: 0,
          rotate: rotation + exitProgress * 20,
          opacity: 1,
        };

      case 'spin':
        return {
          scale: interpolate(exitProgress, [0, 1], [1, 0]),
          x: 0,
          y: 0,
          rotate: rotation + exitProgress * 540,
          opacity: 1,
        };

      case 'fall':
        return {
          scale: 1,
          x: 0,
          y: interpolate(exitProgress, [0, 1], [0, 800]),
          rotate: rotation + exitProgress * 45,
          opacity: interpolate(exitProgress, [0.5, 1], [1, 0]),
        };

      case 'none':
        return { scale: 1, x: 0, y: 0, rotate: rotation, opacity: 1 };

      default:
        return {
          scale: interpolate(exitProgress, [0, 1], [1, 0]),
          x: 0,
          y: 0,
          rotate: rotation,
          opacity: 1,
        };
    }
  };

  // ========== NO WHILE EFFECTS - They cause jitter ==========
  // Removed whileEffect to prevent shaking during display

  // Combine transforms
  const entranceT = getEntranceTransform();
  const exitT = getExitTransform();

  const finalScale = (isExiting ? exitT.scale : entranceT.scale) * scale;
  const finalX = isExiting ? exitT.x : entranceT.x;
  const finalY = isExiting ? exitT.y : entranceT.y;
  const finalRotate = isExiting ? exitT.rotate : entranceT.rotate;
  const finalOpacity = isExiting ? exitT.opacity : 1;

  // Position styles - centered positioning
  const getPositionStyles = () => {
    const base = {
      position: 'absolute',
      zIndex: 100,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 150, left: 80 };
      case 'top-right':
        return { ...base, top: 150, right: 80 };
      case 'bottom-left':
        return { ...base, bottom: 200, left: 80 };
      case 'bottom-right':
        return { ...base, bottom: 200, right: 80 };
      case 'center-left':
        return { ...base, top: '50%', left: 80, transform: 'translateY(-50%)' };
      case 'center-right':
        return { ...base, top: '50%', right: 80, transform: 'translateY(-50%)' };
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

  const positionStyles = getPositionStyles();
  const baseTransform = positionStyles.transform || '';

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Sound effect on entrance - only if not a video (videos have their own audio) */}
      {soundEffect && localFrame === 0 && !isVideo && (
        <Audio
          src={staticFile(`assets/sfx/memes/${soundEffect}`)}
          volume={soundVolume}
        />
      )}

      {/*
        DYNAMIC MEME DISPLAY:
        - Large container (800x600) acts as max bounds
        - fit="contain" shows FULL GIF at natural aspect ratio
        - No cropping - wide GIFs stay wide, tall GIFs stay tall
        - Scale controls final size uniformly
        - Drop shadow for pop without a visible box
      */}
      <div
        style={{
          ...positionStyles,
          transform: `${baseTransform} translate(${finalX}px, ${finalY}px) scale(${finalScale}) rotate(${finalRotate}deg)`,
          opacity: finalOpacity,
          filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6))',
        }}
      >
{isVideo ? (
          <Sequence from={startFrame} layout="none">
            <OffthreadVideo
              src={mediaSource}
              style={{
                width: 800,
                height: 600,
                objectFit: 'contain',
                display: 'block',
                borderRadius: 8,
              }}
              volume={soundVolume || 0.6}
              loop
            />
          </Sequence>
        ) : (
          <img
            src={mediaSource}
            style={{
              width: 800,
              height: 600,
              objectFit: 'contain',
              display: 'block',
              borderRadius: 8,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default AnimatedMemeOverlay;
