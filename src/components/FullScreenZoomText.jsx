import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from 'remotion';

/**
 * FullScreenZoomText - THE BRAIN-ROT ZOOM EFFECT
 *
 * When triggered, the ENTIRE screen composition zooms and centers
 * on a specific value that types out at HUGE size (~120px).
 * Creates the TikTok "dynamic camera movement without cuts" aesthetic.
 *
 * Flow:
 * 1. Normal view (composition at scale 1.0)
 * 2. TRIGGER: Zoom in rapidly (15 frames), centering on target position
 * 3. HOLD: Value types out at 120px while zoomed (20-25 frames)
 * 4. PULL BACK: Spring animation back to normal view (15 frames)
 *
 * Props:
 * - children: The rest of your composition (AbsoluteFill contents)
 * - zoomTriggers: Array of zoom trigger objects
 *   - text: The value to display (e.g., "32 bpm", "70/40")
 *   - timestamp: When to trigger zoom (raw audio seconds)
 *   - color: Text color (e.g., "#ef4444" for critical red)
 *   - zoomDuration: Total frames for zoom sequence (default: 45)
 *   - zoomScale: How much to zoom in (default: 3.5)
 *   - sound: Whether to play whoosh (default: true)
 * - playbackRate: Video playback rate (default: 1.9)
 * - frameOffset: Offset for meme cutaways (default: 0)
 */
export const FullScreenZoomText = ({
  children,
  zoomTriggers = [],
  playbackRate = 1.9,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Find if we're currently in a zoom trigger
  const getActiveZoom = () => {
    const adjustedFrame = frame - frameOffset;

    for (const trigger of zoomTriggers) {
      const triggerFrame = Math.floor((trigger.timestamp / playbackRate) * fps);
      const zoomInFrames = 12;
      const holdFrames = trigger.holdFrames || 20;
      const zoomOutFrames = 15;
      const totalDuration = zoomInFrames + holdFrames + zoomOutFrames;

      // Check if we're in this zoom's time window
      if (adjustedFrame >= triggerFrame && adjustedFrame < triggerFrame + totalDuration) {
        const framesIntoZoom = adjustedFrame - triggerFrame;
        const targetScale = trigger.zoomScale || 3.5;

        // Calculate typewriter progress (chars revealed during hold phase)
        const textLength = trigger.text.length;
        const framesPerChar = 2;
        const charsToShow = Math.min(
          textLength,
          Math.max(0, Math.floor((framesIntoZoom - zoomInFrames) / framesPerChar))
        );
        const visibleText = trigger.text.slice(0, charsToShow);
        const typingComplete = charsToShow >= textLength;

        // Phase 1: Zoom IN (fast, punchy)
        if (framesIntoZoom < zoomInFrames) {
          const progress = framesIntoZoom / zoomInFrames;
          const currentScale = interpolate(
            progress,
            [0, 1],
            [1, targetScale],
            { easing: Easing.out(Easing.cubic) }
          );

          return {
            scale: currentScale,
            text: '',
            visibleText: '',
            isZoomingIn: true,
            isHolding: false,
            isZoomingOut: false,
            shouldPlaySound: framesIntoZoom === 0,
            trigger,
            typingComplete: false,
          };
        }

        // Phase 2: HOLD (text types at full zoom)
        if (framesIntoZoom < zoomInFrames + holdFrames) {
          return {
            scale: targetScale,
            text: trigger.text,
            visibleText,
            isZoomingIn: false,
            isHolding: true,
            isZoomingOut: false,
            shouldPlaySound: false,
            trigger,
            typingComplete,
          };
        }

        // Phase 3: Zoom OUT (spring animation for smooth settle)
        if (framesIntoZoom < totalDuration) {
          const zoomOutProgress = spring({
            frame: framesIntoZoom - zoomInFrames - holdFrames,
            fps,
            config: {
              damping: 15,
              stiffness: 100,
              mass: 0.5,
            },
          });

          const currentScale = interpolate(
            zoomOutProgress,
            [0, 1],
            [targetScale, 1]
          );

          // Text fades out during zoom out
          const textOpacity = interpolate(
            framesIntoZoom - zoomInFrames - holdFrames,
            [0, 8],
            [1, 0],
            { extrapolateRight: 'clamp' }
          );

          return {
            scale: currentScale,
            text: trigger.text,
            visibleText: trigger.text,
            textOpacity,
            isZoomingIn: false,
            isHolding: false,
            isZoomingOut: true,
            shouldPlaySound: false,
            trigger,
            typingComplete: true,
          };
        }
      }
    }

    // No active zoom
    return {
      scale: 1,
      text: '',
      visibleText: '',
      isZoomingIn: false,
      isHolding: false,
      isZoomingOut: false,
      shouldPlaySound: false,
      trigger: null,
      typingComplete: false,
    };
  };

  const activeZoom = getActiveZoom();
  const isZooming = activeZoom.isZoomingIn || activeZoom.isHolding || activeZoom.isZoomingOut;

  // Calculate cursor blink for typewriter effect
  const cursorVisible = Math.floor(frame / 8) % 2 === 0;

  return (
    <>
      {/* Whoosh sound on zoom start */}
      {activeZoom.shouldPlaySound && (
        <Audio
          src={staticFile('assets/sfx/whoosh.mp3')}
          volume={0.8}
        />
      )}

      {/* The main composition - scales when zooming */}
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${activeZoom.scale})`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}>
        {children}
      </div>

      {/* Vignette darkening during zoom to focus attention */}
      {isZooming && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 200,
          opacity: activeZoom.isHolding ? 0.8 : activeZoom.isZoomingOut ? 0.4 : 0.6,
        }} />
      )}

      {/* THE BIG TEXT - appears during hold phase */}
      {(activeZoom.isHolding || activeZoom.isZoomingOut) && activeZoom.trigger && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 250,
          pointerEvents: 'none',
          opacity: activeZoom.textOpacity !== undefined ? activeZoom.textOpacity : 1,
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Glow effect behind text */}
            <div style={{
              position: 'absolute',
              fontSize: 140,
              fontWeight: 900,
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: activeZoom.trigger.color || '#ef4444',
              filter: `blur(30px)`,
              opacity: 0.6,
            }}>
              {activeZoom.visibleText}
            </div>

            {/* Main text with typewriter effect */}
            <span style={{
              fontSize: 140,
              fontWeight: 900,
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: activeZoom.trigger.color || '#ef4444',
              textShadow: `
                0 0 40px ${activeZoom.trigger.color || '#ef4444'},
                0 0 80px ${activeZoom.trigger.color || 'rgba(239, 68, 68, 0.5)'},
                0 8px 16px rgba(0, 0, 0, 0.8)
              `,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              {activeZoom.visibleText}
            </span>

            {/* Blinking cursor during typing */}
            {activeZoom.isHolding && !activeZoom.typingComplete && (
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 120,
                marginLeft: 8,
                background: 'linear-gradient(180deg, #a855f7, #ec4899)',
                borderRadius: 4,
                opacity: cursorVisible ? 1 : 0,
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)',
              }} />
            )}
          </div>
        </div>
      )}

      {/* Impact flash on zoom start */}
      {activeZoom.isZoomingIn && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: activeZoom.trigger?.color || 'rgba(239, 68, 68, 0.3)',
          opacity: interpolate(
            activeZoom.scale,
            [1, 2, activeZoom.trigger?.zoomScale || 3.5],
            [0, 0.4, 0]
          ),
          pointerEvents: 'none',
          zIndex: 300,
        }} />
      )}
    </>
  );
};

export default FullScreenZoomText;
