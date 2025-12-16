import React, { CSSProperties } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing, staticFile } from 'remotion';

/**
 * AnimatedIcon - Wrapper for SVG icons with preset animations
 *
 * Replaces manual icon drawing with library icons + declarative animations
 *
 * Usage:
 * <AnimatedIcon
 *   iconPath="assets/icon-lib-svg/R-ICO-013338.svg"
 *   entranceFrame={50}
 *   position={{ x: 460, y: 400 }}
 *   size={120}
 *   animations={['fadeIn', 'spring', 'pulse']}
 *   color="#ef4444"
 *   glow={true}
 * />
 */

interface AnimatedIconProps {
  iconPath: string; // Path to SVG in assets
  entranceFrame: number;
  position: { x: number; y: number };
  size?: number;
  animations?: Array<'fadeIn' | 'spring' | 'pulse' | 'shake' | 'glow' | 'rotate'>;
  color?: string;
  strokeWidth?: number;
  glowColor?: string;
  duration?: number;
  exitFrame?: number;
  customStyle?: CSSProperties;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  iconPath,
  entranceFrame,
  position,
  size = 100,
  animations = ['fadeIn'],
  color,
  strokeWidth,
  glowColor,
  duration = 20,
  exitFrame,
  customStyle = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Don't render before entrance
  if (frame < entranceFrame) return null;

  // Exit animation
  if (exitFrame && frame >= exitFrame) {
    const exitProgress = interpolate(
      frame,
      [exitFrame, exitFrame + duration],
      [1, 0],
      { extrapolateRight: 'clamp' }
    );
    if (exitProgress <= 0) return null;
  }

  const localFrame = frame - entranceFrame;

  // Animation calculations
  let opacity = 1;
  let scale = 1;
  let rotation = 0;
  let translateX = 0;
  let translateY = 0;
  let filterValue = '';

  // Fade In
  if (animations.includes('fadeIn')) {
    opacity = interpolate(
      localFrame,
      [0, duration],
      [0, 1],
      {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      }
    );
  }

  // Spring entrance
  if (animations.includes('spring')) {
    const springValue = spring({
      frame: localFrame,
      fps,
      config: { damping: 12, stiffness: 200, mass: 0.8 },
    });
    scale = springValue;
  }

  // Pulse
  if (animations.includes('pulse') && localFrame >= duration) {
    const pulseSpeed = 0.3;
    const pulseIntensity = 0.15;
    scale *= 1 + Math.sin(localFrame * pulseSpeed) * pulseIntensity;
  }

  // Shake
  if (animations.includes('shake') && localFrame < duration) {
    const intensity = 8;
    const decay = 1 - localFrame / duration;
    translateX = Math.sin(localFrame * 2.5) * intensity * decay;
    translateY = Math.cos(localFrame * 2) * intensity * 0.6 * decay;
  }

  // Rotate
  if (animations.includes('rotate')) {
    rotation = interpolate(
      localFrame,
      [0, duration],
      [0, 360],
      { extrapolateLeft: 'clamp', extrapolateRight: 'extend' }
    );
  }

  // Glow
  if (animations.includes('glow')) {
    const glowAmount = glowColor
      ? `drop-shadow(0 0 ${20 + Math.sin(localFrame * 0.2) * 8}px ${glowColor})`
      : `drop-shadow(0 0 20px ${color || 'rgba(147, 51, 234, 0.8)'})`;
    filterValue = glowAmount;
  }

  // Exit fade
  if (exitFrame && frame >= exitFrame) {
    const exitProgress = interpolate(
      frame,
      [exitFrame, exitFrame + duration],
      [1, 0],
      { extrapolateRight: 'clamp' }
    );
    opacity *= exitProgress;
  }

  const transformString = `
    translate(${position.x + translateX}px, ${position.y + translateY}px)
    scale(${scale})
    rotate(${rotation}deg)
  `;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        transform: transformString,
        transformOrigin: 'center',
        opacity,
        filter: filterValue,
        ...customStyle,
      }}
    >
      <img
        src={staticFile(iconPath)}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: color ? `brightness(0) saturate(100%) ${colorToFilter(color)}` : 'none',
        }}
      />
    </div>
  );
};

// Helper to convert hex color to CSS filter (approximation)
// For precise color control, use SVG fill/stroke manipulation instead
function colorToFilter(hex: string): string {
  // This is a simplified version - for production, use a proper color conversion library
  if (hex === '#ef4444') return 'invert(33%) sepia(91%) saturate(5474%) hue-rotate(347deg) brightness(98%) contrast(90%)';
  if (hex === '#22c55e') return 'invert(64%) sepia(63%) saturate(448%) hue-rotate(85deg) brightness(96%) contrast(88%)';
  if (hex === '#fbbf24') return 'invert(78%) sepia(74%) saturate(1102%) hue-rotate(358deg) brightness(101%) contrast(97%)';
  if (hex === '#9333ea') return 'invert(29%) sepia(87%) saturate(3695%) hue-rotate(264deg) brightness(92%) contrast(95%)';
  return '';
}

export default AnimatedIcon;
