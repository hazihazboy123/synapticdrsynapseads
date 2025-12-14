import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from 'remotion';

/**
 * LabLine - Individual lab value that types out like a hospital monitor
 */
const LabLine = ({
  label,
  value,
  timestamp,
  status = 'normal', // 'normal' | 'elevated' | 'critical'
  playbackRate = 2.2,
  frameOffset = 0,
  charsPerFrame = 1.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appearFrame = Math.floor((timestamp / playbackRate) * fps);
  const adjustedFrame = frame - frameOffset;

  if (adjustedFrame < appearFrame) return null;

  const framesVisible = adjustedFrame - appearFrame;

  // Type out the full line: "Glucose: 500 mg/dL"
  const fullText = `${label} ${value}`;
  const charsToShow = Math.floor(framesVisible * charsPerFrame);
  const visibleText = fullText.slice(0, Math.min(charsToShow, fullText.length));
  const isComplete = charsToShow >= fullText.length;

  // Status colors
  const statusColors = {
    normal: { text: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', alarm: false },
    elevated: { text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)', alarm: false },
    critical: { text: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', alarm: true },
  };

  const colors = statusColors[status] || statusColors.normal;

  // Critical flash effect when complete
  const flashIntensity = status === 'critical' && isComplete
    ? 0.3 + Math.sin(framesVisible * 0.3) * 0.15
    : 0;

  // Cursor blink
  const cursorVisible = !isComplete && Math.floor(framesVisible / 12) % 2 === 0;

  // Entry scale pop
  const scale = spring({
    frame: framesVisible,
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.5 },
  });

  // Play alarm sound on critical values
  const shouldPlayAlarm = status === 'critical' && framesVisible === 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      marginBottom: 8,
      backgroundColor: `rgba(0, 0, 0, ${0.3 + flashIntensity})`,
      borderLeft: `3px solid ${colors.text}`,
      borderRadius: 4,
      transform: `scale(${interpolate(scale, [0, 1], [0.95, 1])})`,
      opacity: interpolate(framesVisible, [0, 5], [0, 1], { extrapolateRight: 'clamp' }),
      boxShadow: status === 'critical' && isComplete
        ? `0 0 ${15 + flashIntensity * 20}px ${colors.glow}`
        : 'none',
    }}>
      {/* Status indicator light */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colors.text,
        boxShadow: `0 0 ${isComplete ? 8 : 4}px ${colors.glow}`,
        animation: status === 'critical' && isComplete ? 'none' : undefined,
        opacity: status === 'critical' && isComplete
          ? 0.7 + Math.sin(framesVisible * 0.4) * 0.3
          : 1,
      }} />

      {/* Lab text */}
      <span style={{
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: 22,
        color: colors.text,
        fontWeight: status === 'critical' ? 700 : 500,
        textShadow: isComplete ? `0 0 8px ${colors.glow}` : 'none',
        letterSpacing: '0.5px',
      }}>
        {visibleText}
        {/* Blinking cursor */}
        {!isComplete && (
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 18,
            backgroundColor: '#22c55e',
            marginLeft: 2,
            opacity: cursorVisible ? 1 : 0,
            verticalAlign: 'middle',
          }} />
        )}
      </span>

      {/* Critical indicator */}
      {status === 'critical' && isComplete && (
        <span style={{
          marginLeft: 'auto',
          fontSize: 14,
          fontWeight: 700,
          color: '#ef4444',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.7 + Math.sin(framesVisible * 0.3) * 0.3,
        }}>
          CRITICAL
        </span>
      )}

      {/* Alarm sound */}
      {shouldPlayAlarm && (
        <Audio
          src={staticFile('assets/sfx/underline-stroke.mp3')}
          volume={1.5}
          startFrom={0.5}
        />
      )}
    </div>
  );
};

/**
 * LabMonitor - Hospital monitor style lab values display
 *
 * Props:
 * - labs: Array of lab objects
 *   - label: "Glucose:"
 *   - value: "500 mg/dL"
 *   - timestamp: When it prints
 *   - status: 'normal' | 'elevated' | 'critical'
 * - playbackRate: Video playback rate
 * - frameOffset: Offset for meme cutaways
 * - title: Header text (default: "LAB VALUES")
 */
export const LabMonitor = ({
  labs = [],
  playbackRate = 2.2,
  frameOffset = 0,
  title = 'LAB VALUES',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find when first lab appears to show monitor
  const firstLabTimestamp = labs.length > 0 ? labs[0].timestamp : Infinity;
  const monitorAppearFrame = Math.floor((firstLabTimestamp / playbackRate) * fps) - 10; // Appear slightly before
  const adjustedFrame = frame - frameOffset;

  if (adjustedFrame < monitorAppearFrame) return null;

  const framesVisible = adjustedFrame - monitorAppearFrame;

  // Monitor entrance animation
  const entranceProgress = spring({
    frame: framesVisible,
    fps,
    config: { damping: 20, stiffness: 150, mass: 0.8 },
  });

  const scale = interpolate(entranceProgress, [0, 1], [0.9, 1]);
  const opacity = interpolate(framesVisible, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Scanline effect
  const scanlinePosition = (framesVisible * 3) % 200;

  return (
    <div style={{
      position: 'absolute',
      top: 480,
      right: 40,
      width: 380,
      zIndex: 65,
      transform: `scale(${scale})`,
      opacity,
      ...style,
    }}>
      <div style={{
        backgroundColor: '#0a0f0a',
        border: '2px solid #22c55e',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 0 30px rgba(34, 197, 94, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.8)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(transparent ${scanlinePosition}px, rgba(34, 197, 94, 0.03) ${scanlinePosition + 2}px, transparent ${scanlinePosition + 4}px)`,
          pointerEvents: 'none',
        }} />

        {/* CRT curve effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          pointerEvents: 'none',
          borderRadius: 12,
        }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <span style={{
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: 14,
            color: '#22c55e',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            {title}
          </span>

          {/* Blinking status light */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              opacity: 0.5 + Math.sin(framesVisible * 0.2) * 0.5,
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
            }} />
            <span style={{
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: 11,
              color: '#22c55e',
              opacity: 0.7,
            }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Lab values */}
        <div style={{ position: 'relative' }}>
          {labs.map((lab, index) => (
            <LabLine
              key={`lab-${index}`}
              label={lab.label}
              value={lab.value}
              timestamp={lab.timestamp}
              status={lab.status}
              playbackRate={playbackRate}
              frameOffset={frameOffset}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabMonitor;
