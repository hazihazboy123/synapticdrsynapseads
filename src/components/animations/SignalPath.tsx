import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { evolvePath } from '@remotion/paths';

/**
 * SignalPath - Animated SVG path with progress tracking
 *
 * Simplifies pathway animations using @remotion/paths
 *
 * Usage:
 * <SignalPath
 *   d="M100,100 Q200,50 300,100"
 *   startFrame={50}
 *   duration={40}
 *   color="#22c55e"
 *   strokeWidth={4}
 *   showArrow={true}
 *   dashed={true}
 * />
 */

interface SignalPathProps {
  d: string; // SVG path data
  startFrame: number;
  duration?: number;
  color?: string;
  strokeWidth?: number;
  showArrow?: boolean;
  dashed?: boolean;
  dashArray?: string;
  opacity?: number;
  glow?: boolean;
  glowColor?: string;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

export const SignalPath: React.FC<SignalPathProps> = ({
  d,
  startFrame,
  duration = 40,
  color = '#22c55e',
  strokeWidth = 4,
  showArrow = false,
  dashed = false,
  dashArray = '8,4',
  opacity = 0.6,
  glow = false,
  glowColor,
  easing = 'easeOut',
}) => {
  const frame = useCurrentFrame();

  // Don't render before start
  if (frame < startFrame) return null;

  const localFrame = frame - startFrame;

  // Progress calculation with easing
  let progress = Math.min(1, localFrame / duration);

  if (easing === 'easeOut') {
    progress = Easing.out(Easing.cubic)(progress);
  } else if (easing === 'easeInOut') {
    progress = Easing.inOut(Easing.cubic)(progress);
  }

  // Evolve path based on progress
  const evolvedPath = evolvePath(progress, d);

  // Generate unique ID for arrow marker
  const markerId = `arrow-${Math.random().toString(36).substr(2, 9)}`;
  const filterId = `glow-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <defs>
        {/* Arrow marker */}
        {showArrow && (
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        )}

        {/* Glow filter */}
        {glow && (
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor={glowColor || color} floodOpacity="0.8" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <path
        d={evolvedPath}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeDasharray={dashed ? dashArray : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={showArrow && progress >= 0.95 ? `url(#${markerId})` : undefined}
        filter={glow ? `url(#${filterId})` : undefined}
      />
    </>
  );
};

export default SignalPath;
