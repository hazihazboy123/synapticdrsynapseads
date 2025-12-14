import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile, Easing } from 'remotion';

/**
 * FullScreenZoom - Creates a "crash zoom" / "punch in" effect
 *
 * The ENTIRE screen composition zooms in on a specific target element for dramatic effect.
 * This creates the illusion of a cut without actually cutting.
 *
 * Flow:
 * 1. Quick zoom in (5-8 frames)
 * 2. Hold at zoomed state (10-15 frames)
 * 3. Quick zoom out (5-8 frames)
 *
 * Props:
 * - children: The content to zoom
 * - triggers: Array of zoom trigger objects
 *   - timestamp: When to trigger zoom (raw audio seconds)
 *   - targetElement: String describing what's being focused (for positioning)
 *   - scale: How much to zoom in (default: 1.3)
 *   - holdFrames: How long to hold zoom (default: 12)
 *   - sound: Whether to play zoom sound (default: true)
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 *
 * Example usage:
 * <FullScreenZoom
 *   triggers={[
 *     { timestamp: 25.878, targetElement: 'glucose', scale: 1.4, holdFrames: 15 },
 *     { timestamp: 34.435, targetElement: 'ketones', scale: 1.3, holdFrames: 12 },
 *   ]}
 *   playbackRate={2.2}
 * >
 *   <YourContentHere />
 * </FullScreenZoom>
 */
export const FullScreenZoom = ({
  children,
  triggers = [],
  playbackRate = 2.2,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find if we're in a zoom trigger
  const getActiveZoom = () => {
    const adjustedFrame = frame - frameOffset;

    for (const trigger of triggers) {
      const triggerFrame = Math.floor((trigger.timestamp / playbackRate) * fps);
      const zoomInDuration = trigger.zoomInFrames || 6;
      const holdDuration = trigger.holdFrames || 12;
      const zoomOutDuration = trigger.zoomOutFrames || 6;
      const totalDuration = zoomInDuration + holdDuration + zoomOutDuration;

      // Check if we're in this zoom's time window
      if (adjustedFrame >= triggerFrame && adjustedFrame < triggerFrame + totalDuration) {
        const framesIntoZoom = adjustedFrame - triggerFrame;
        const scale = trigger.scale || 1.3;

        // Phase 1: Zoom in (easing out for punch)
        if (framesIntoZoom < zoomInDuration) {
          const progress = framesIntoZoom / zoomInDuration;
          const currentScale = interpolate(
            progress,
            [0, 1],
            [1, scale],
            {
              easing: Easing.out(Easing.cubic),
              extrapolateRight: 'clamp'
            }
          );

          return {
            scale: currentScale,
            isZooming: true,
            isHolding: false,
            isZoomingOut: false,
            shouldPlaySound: framesIntoZoom === 0,
            trigger,
          };
        }

        // Phase 2: Hold
        if (framesIntoZoom < zoomInDuration + holdDuration) {
          return {
            scale,
            isZooming: false,
            isHolding: true,
            isZoomingOut: false,
            shouldPlaySound: false,
            trigger,
          };
        }

        // Phase 3: Zoom out (easing in for smooth return)
        if (framesIntoZoom < totalDuration) {
          const zoomOutStart = zoomInDuration + holdDuration;
          const progress = (framesIntoZoom - zoomOutStart) / zoomOutDuration;
          const currentScale = interpolate(
            progress,
            [0, 1],
            [scale, 1],
            {
              easing: Easing.in(Easing.cubic),
              extrapolateRight: 'clamp'
            }
          );

          return {
            scale: currentScale,
            isZooming: false,
            isHolding: false,
            isZoomingOut: true,
            shouldPlaySound: false,
            trigger,
          };
        }
      }
    }

    // No active zoom
    return { scale: 1, isZooming: false, isHolding: false, isZoomingOut: false, shouldPlaySound: false, trigger: null };
  };

  const activeZoom = getActiveZoom();

  return (
    <>
      {/* Zoom sound effect */}
      {activeZoom.shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/whoosh.mp3')}
          volume={0.7}
        />
      )}

      {/* Wrapper that scales the entire composition */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${activeZoom.scale})`,
        transformOrigin: 'center center',
        transition: 'none', // All animation via Remotion interpolate
      }}>
        {children}
      </div>

      {/* Vignette darkening during zoom to focus attention */}
      {(activeZoom.isZooming || activeZoom.isHolding || activeZoom.isZoomingOut) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)',
          pointerEvents: 'none',
          zIndex: 200,
          opacity: activeZoom.isHolding ? 0.6 : 0.3,
        }} />
      )}
    </>
  );
};

export default FullScreenZoom;
