import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { evolvePath, getPointAtLength, getTangentAtLength, getLength } from '@remotion/paths';
import { ParticleFlow } from '../animations/ParticleFlow';
import { SignalPath } from '../animations/SignalPath';

/**
 * PenicillinAnaphylaxisMechanismEnhanced - GOLD STANDARD V2
 *
 * IMPROVEMENTS:
 * ✅ Uses new ParticleFlow component (90% less particle code)
 * ✅ Uses SignalPath component for cleaner pathway animations
 * ✅ Fixed overlapping - proper spacing for 1080x1920 (TikTok/Instagram)
 * ✅ Bigger components - scaled up for mobile viewing
 * ✅ Better organization - clear visual hierarchy
 * ✅ Optimized performance - reusable components
 *
 * LAYOUT (TikTok/Instagram 9:16 ratio):
 * - Teaching diagram: 520px - 1720px (1200px tall)
 * - Proper spacing: nothing overlaps, everything visible
 * - Bigger text and icons for mobile readability
 */

interface Props {
  startTime: number;
  playbackRate?: number;
}

export const PenicillinAnaphylaxisMechanismEnhanced: React.FC<Props> = ({
  startTime,
  playbackRate = 2.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp: number) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== TIMESTAMPS =====
  const timestamps = {
    listenUp: 65.7,
    penicillin: 66.98,
    ige: 68.6,
    antibodies: 69.48,
    mastCells: 71.58,
    bombs: 72.82,
    boom: 76.68,
    explode: 80.04,
    histamine: 81.52,
    wrecks: 86.9,
    airways: 88.44,
    slam: 88.82,
    vessels: 90.34,
    leak: 90.72,
    epinephrine: 93.58,
    brakes: 96.6,
    constricts: 98.42,
    opens: 100.8,
    kicks: 102.28,
    heart: 102.92,
    dosing: 111.72,
  };

  const t: Record<string, number> = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== PHASE STATES =====
  const showMastCell = localFrame >= t.ige;
  const showIgE = localFrame >= t.antibodies;
  const showBombs = localFrame >= t.bombs;
  const showBoom = localFrame >= t.boom;
  const showDegranulation = localFrame >= t.explode;
  const showHistamine = localFrame >= t.histamine;
  const showDamage = localFrame >= t.wrecks;
  const showAirway = localFrame >= t.slam;
  const showVessels = localFrame >= t.leak;
  const showEpinephrine = localFrame >= t.epinephrine;
  const showFlow = localFrame >= t.brakes;
  const showVesselConstriction = localFrame >= t.constricts;
  const showAirwayOpen = localFrame >= t.opens;
  const showHeartActivation = localFrame >= t.kicks;

  // ===== HELPERS =====
  const getSpring = (startFrame: number) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config: { damping: 12, stiffness: 200, mass: 0.8 },
    });
  };

  const fadeIn = (startFrame: number, duration = 15) =>
    interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });

  const getPulse = (startFrame: number, speed = 0.3, intensity = 0.15) => {
    if (localFrame < startFrame) return 1;
    return 1 + Math.sin((localFrame - startFrame) * speed) * intensity;
  };

  const getShake = (startFrame: number, duration = 15, intensity = 8) => {
    if (localFrame < startFrame || localFrame > startFrame + duration)
      return { x: 0, y: 0 };
    const progress = (localFrame - startFrame) / duration;
    const decay = 1 - progress;
    return {
      x: Math.sin(localFrame * 2.5) * intensity * decay,
      y: Math.cos(localFrame * 2) * intensity * 0.6 * decay,
    };
  };

  // ===== PHASE COLOR =====
  let currentPhase = 'IgE SENSITIZATION';
  let phaseColor = '#a855f7';
  if (showBoom) {
    currentPhase = 'MAST CELL DEGRANULATION';
    phaseColor = '#ef4444';
  }
  if (showDamage) {
    currentPhase = 'HISTAMINE CASCADE';
    phaseColor = '#f59e0b';
  }
  if (showEpinephrine) {
    currentPhase = 'EPINEPHRINE RESCUE';
    phaseColor = '#22c55e';
  }

  // ===== VESSEL ANIMATIONS =====
  const histamineVesselDilation = showDamage && !showFlow
    ? getSpring(t.wrecks)
    : 0;
  const dilatedVesselWidth = interpolate(histamineVesselDilation, [0, 1], [70, 120]);

  const vesselConstrictProgress = showVesselConstriction
    ? getSpring(t.constricts)
    : 0;
  const vesselWidth = interpolate(vesselConstrictProgress, [0, 1], [100, 50]);

  // ===== AIRWAY ANIMATIONS =====
  const airwayOpenProgress = showAirwayOpen ? getSpring(t.opens) : 0;

  const shake = showBoom ? getShake(t.boom, 20, 12) : { x: 0, y: 0 };

  // ===== EPINEPHRINE PATHS (UPDATED FOR CENTERED POSITION & NEW TARGETS) =====
  const epiMainPath = "M460,1050 L460,850";
  const epiPathToAirways = "M460,850 C380,870 280,890 200,960";
  const epiPathToVessels = "M460,850 C540,870 640,890 720,960";
  const epiPathToHeart = "M460,850 L460,750";

  // ===== RENDER =====
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 520,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 750,
          opacity: fadeIn(0, 15),
          zIndex: 100,
        }}
      >
        {/* Background panel - TALLER for better fit */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            height: 1200,
            background: 'linear-gradient(180deg, rgba(10, 8, 15, 0.92) 0%, rgba(15, 10, 25, 0.95) 100%)',
            borderRadius: 28,
            border: `2px solid ${phaseColor}50`,
            boxShadow: `0 0 60px ${phaseColor}35`,
          }}
        />

        {/* NEW LAYOUT - OPTIMIZED FOR 1080x1920 */}
        <svg
          viewBox="0 0 920 1200"
          style={{
            position: 'relative',
            zIndex: 1,
            width: 750,
            height: 1000,
          }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="mastCellGradEnhanced">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
            <radialGradient id="histamineGradEnhanced">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <linearGradient id="epiGradEnhanced" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="brandingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            {/* Filters */}
            <filter id="redGlowEnhanced" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="greenGlowEnhanced" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ===== BRANDING (TOP LEFT IN CARD) ===== */}
          <text
            x="30"
            y="35"
            textAnchor="start"
            fill="url(#brandingGrad)"
            fontSize="22"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            opacity={fadeIn(0, 15)}
          >
            synapticrecall.ai
          </text>

          {/* ===== TITLE (BIGGER FOR MOBILE) =====*/}
          <text
            x="460"
            y="80"
            textAnchor="middle"
            fill={phaseColor}
            fontSize="56"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            {currentPhase}
          </text>

          {/* ===== MAST CELL (TOP CENTER - BIGGER) ===== */}
          {showMastCell && !showDamage && (
            <g
              transform={`translate(${460 + shake.x}, ${350 + shake.y}) scale(${getSpring(t.ige) * 1.3})`}
              opacity={showDegranulation ? interpolate(localFrame, [t.explode, t.explode + 20], [1, 0]) : 1}
            >
              <ellipse
                rx={showDegranulation ? 150 : 130}
                ry={showDegranulation ? 140 : 125}
                fill="url(#mastCellGradEnhanced)"
                stroke={showBoom ? '#ef4444' : '#a855f7'}
                strokeWidth={showBoom ? 10 : 6}
                filter={showBoom ? 'url(#redGlowEnhanced)' : undefined}
                style={{
                  transform: `scale(${getPulse(t.boom, 0.5, 0.1)})`,
                  transformOrigin: 'center',
                }}
              />

              {/* BOOM text - BIGGER */}
              {showBoom && !showDegranulation && (
                <text
                  y="25"
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="105"
                  fontWeight="900"
                  fontFamily="system-ui"
                  filter="url(#redGlowEnhanced)"
                >
                  BOOM!
                </text>
              )}

              <text
                y="190"
                textAnchor="middle"
                fill="#e9d5ff"
                fontSize="42"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                MAST CELL
              </text>
            </g>
          )}

          {/* ===== HISTAMINE PARTICLES (Using new ParticleFlow!) ===== */}
          {showHistamine && !showFlow && (
            <>
              {/* To Airways */}
              <ParticleFlow
                startFrame={t.histamine}
                count={18}
                from={{ x: 460, y: 350 }}
                to={{ x: 200, y: 580 }}
                gradient={{ id: 'histamineGradEnhanced', colors: ['#fbbf24', '#f59e0b'] }}
                size={20}
                duration={50}
                stagger={2}
                waviness={15}
                filter="url(#redGlowEnhanced)"
              />
              {/* To Vessels */}
              <ParticleFlow
                startFrame={t.histamine}
                count={18}
                from={{ x: 460, y: 350 }}
                to={{ x: 720, y: 580 }}
                gradient={{ id: 'histamineGradEnhanced', colors: ['#fbbf24', '#f59e0b'] }}
                size={20}
                duration={50}
                stagger={2}
                waviness={15}
                filter="url(#redGlowEnhanced)"
              />
              {/* To Heart */}
              <ParticleFlow
                startFrame={t.histamine}
                count={18}
                from={{ x: 460, y: 350 }}
                to={{ x: 460, y: 700 }}
                gradient={{ id: 'histamineGradEnhanced', colors: ['#fbbf24', '#f59e0b'] }}
                size={20}
                duration={50}
                stagger={2}
                waviness={10}
                filter="url(#redGlowEnhanced)"
              />

              <text
                x="460"
                y="200"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="48"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                HISTAMINE FLOOD
              </text>
            </>
          )}

          {/* ===== EPINEPHRINE FLOW PATHS (Using SignalPath!) ===== */}
          {showFlow && (
            <>
              <SignalPath
                d={epiMainPath}
                startFrame={t.brakes}
                duration={35}
                color="#22c55e"
                strokeWidth={5}
                dashed={true}
                glow={true}
              />
              {localFrame >= t.brakes + 35 && (
                <>
                  <SignalPath
                    d={epiPathToAirways}
                    startFrame={t.brakes + 35}
                    duration={45}
                    color="#22c55e"
                    strokeWidth={4}
                    dashed={true}
                    showArrow={true}
                  />
                  <SignalPath
                    d={epiPathToVessels}
                    startFrame={t.brakes + 35}
                    duration={45}
                    color="#22c55e"
                    strokeWidth={4}
                    dashed={true}
                    showArrow={true}
                  />
                  <SignalPath
                    d={epiPathToHeart}
                    startFrame={t.brakes + 35}
                    duration={45}
                    color="#22c55e"
                    strokeWidth={4}
                    dashed={true}
                    showArrow={true}
                  />
                </>
              )}
            </>
          )}

          {/* ===== AIRWAYS (LEFT, MIDDLE SECTION - BIGGER FOR MOBILE) ===== */}
          {showAirway && (
            <g transform="translate(200, 580)" opacity={getSpring(t.slam)}>
              <rect
                x="-200"
                y="-160"
                width="400"
                height="320"
                rx="32"
                fill={showAirwayOpen ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                strokeWidth="8"
              />

              {/* Airway tube visualization - BIGGER */}
              <g transform="translate(0, -20)">
                {/* Two bronchi tubes showing constriction/dilation */}
                <ellipse
                  cx="-60"
                  cy="0"
                  rx={showAirwayOpen ? 28 : 12}
                  ry="100"
                  fill="none"
                  stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                  strokeWidth="14"
                  style={{
                    transition: 'rx 0.5s ease',
                    filter: showAirwayOpen ? 'url(#greenGlowEnhanced)' : undefined
                  }}
                />
                <ellipse
                  cx="60"
                  cy="0"
                  rx={showAirwayOpen ? 28 : 12}
                  ry="100"
                  fill="none"
                  stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                  strokeWidth="14"
                  style={{
                    transition: 'rx 0.5s ease',
                    filter: showAirwayOpen ? 'url(#greenGlowEnhanced)' : undefined
                  }}
                />

                {/* Arrow indicators */}
                {showAirwayOpen && (
                  <>
                    <path
                      d="M -60 0 L -45 -8 L -45 8 Z"
                      fill="#22c55e"
                      opacity={interpolate(localFrame, [t.opens, t.opens + 20], [0, 1], {extrapolateRight: 'clamp'})}
                    />
                    <path
                      d="M 60 0 L 45 -8 L 45 8 Z"
                      fill="#22c55e"
                      opacity={interpolate(localFrame, [t.opens, t.opens + 20], [0, 1], {extrapolateRight: 'clamp'})}
                    />
                  </>
                )}
              </g>

              <text
                y="175"
                textAnchor="middle"
                fill={showAirwayOpen ? '#22c55e' : '#ef4444'}
                fontSize="40"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {showAirwayOpen ? 'AIRWAYS OPEN!' : 'AIRWAYS SHUT'}
              </text>

              {showAirwayOpen && (
                <text
                  y="210"
                  textAnchor="middle"
                  fill="#22c55e"
                  fontSize="28"
                  fontWeight="600"
                  fontFamily="system-ui"
                  opacity={fadeIn(t.opens + 10, 10)}
                >
                  β2-Bronchodilation
                </text>
              )}
            </g>
          )}

          {/* ===== VESSELS (RIGHT, MIDDLE SECTION - BIGGER FOR MOBILE) ===== */}
          {showVessels && (
            <g transform="translate(720, 580)" opacity={getSpring(t.leak)}>
              <rect
                x="-200"
                y="-160"
                width="400"
                height="320"
                rx="32"
                fill={showVesselConstriction ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                stroke={showVesselConstriction ? '#22c55e' : '#ef4444'}
                strokeWidth="8"
              />

              {/* Vessel visualization showing dilation/constriction - BIGGER */}
              <g transform="translate(0, -20)">
                {/* Two vessel tubes showing dilation/constriction */}
                <ellipse
                  cx="-60"
                  cy="0"
                  rx={showVesselConstriction ? 12 : 28}
                  ry="100"
                  fill="none"
                  stroke={showVesselConstriction ? '#22c55e' : '#ef4444'}
                  strokeWidth="14"
                  style={{
                    transition: 'rx 0.5s ease',
                    filter: showVesselConstriction ? 'url(#greenGlowEnhanced)' : undefined
                  }}
                />
                <ellipse
                  cx="60"
                  cy="0"
                  rx={showVesselConstriction ? 12 : 28}
                  ry="100"
                  fill="none"
                  stroke={showVesselConstriction ? '#22c55e' : '#ef4444'}
                  strokeWidth="14"
                  style={{
                    transition: 'rx 0.5s ease',
                    filter: showVesselConstriction ? 'url(#greenGlowEnhanced)' : undefined
                  }}
                />

                {/* Leak droplets when dilated */}
                {!showVesselConstriction && (
                  <>
                    <circle
                      cx="-80"
                      cy="40"
                      r="6"
                      fill="#ef4444"
                      opacity={interpolate((localFrame - t.leak) % 30, [0, 15], [0.8, 0.2])}
                    />
                    <circle
                      cx="0"
                      cy="50"
                      r="5"
                      fill="#ef4444"
                      opacity={interpolate((localFrame - t.leak + 10) % 30, [0, 15], [0.8, 0.2])}
                    />
                    <circle
                      cx="80"
                      cy="45"
                      r="6"
                      fill="#ef4444"
                      opacity={interpolate((localFrame - t.leak + 20) % 30, [0, 15], [0.8, 0.2])}
                    />
                  </>
                )}

                {/* Compression arrows when constricted */}
                {showVesselConstriction && (
                  <>
                    <path
                      d="M -90 0 L -70 -10 L -70 10 Z"
                      fill="#22c55e"
                      opacity={interpolate(localFrame, [t.constricts, t.constricts + 20], [0, 1], {extrapolateRight: 'clamp'})}
                    />
                    <path
                      d="M 90 0 L 70 -10 L 70 10 Z"
                      fill="#22c55e"
                      opacity={interpolate(localFrame, [t.constricts, t.constricts + 20], [0, 1], {extrapolateRight: 'clamp'})}
                    />
                  </>
                )}
              </g>

              <text
                y="175"
                textAnchor="middle"
                fill={showVesselConstriction ? '#22c55e' : '#ef4444'}
                fontSize="40"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {showVesselConstriction ? 'VESSELS CONSTRICT' : 'VESSELS LEAK'}
              </text>

              {showVesselConstriction && (
                <text
                  y="210"
                  textAnchor="middle"
                  fill="#22c55e"
                  fontSize="28"
                  fontWeight="600"
                  fontFamily="system-ui"
                  opacity={fadeIn(t.constricts + 10, 10)}
                >
                  α1-Vasoconstriction
                </text>
              )}
            </g>
          )}

          {/* ===== HEART (CENTER BOTTOM - BIGGER) ===== */}
          {showHeartActivation && (
            <g transform="translate(460, 850) scale(1.4)" opacity={getSpring(t.kicks)}>
              {/* Heart shape with enhanced pulsing */}
              <path
                d="M 0 -30 C -30 -60, -90 -30, -90 20 C -90 70, 0 120, 0 120 C 0 120, 90 70, 90 20 C 90 -30, 30 -60, 0 -30"
                fill="#ec4899"
                stroke="#22c55e"
                strokeWidth={10}
                filter="url(#greenGlowEnhanced)"
                style={{
                  transform: `scale(${getPulse(t.heart, 0.45, 0.2)})`,
                  transformOrigin: 'center',
                }}
              />

              {/* Pulse wave rings */}
              <circle
                r={interpolate((localFrame - t.kicks) % 40, [0, 40], [30, 100])}
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                opacity={interpolate((localFrame - t.kicks) % 40, [0, 40], [0.8, 0])}
              />
              <circle
                r={interpolate((localFrame - t.kicks + 20) % 40, [0, 40], [30, 100])}
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                opacity={interpolate((localFrame - t.kicks + 20) % 40, [0, 40], [0.8, 0])}
              />

              {/* Heart rate indicator - BIGGER */}
              <text
                y="150"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="38"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                ↑ HR • ↑ CO
              </text>

              <text
                y="185"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="26"
                fontWeight="600"
                fontFamily="system-ui"
                opacity={fadeIn(t.heart + 10, 10)}
              >
                β1-Inotrope/Chronotrope
              </text>
            </g>
          )}

          {/* ===== EPINEPHRINE SOURCE (CENTERED BOTTOM - BIGGER) ===== */}
          {showEpinephrine && !showFlow && (
            <g transform="translate(460, 1050) scale(1.4)" opacity={getSpring(t.epinephrine)}>
              <rect
                x="-130"
                y="-60"
                width="260"
                height="120"
                rx="60"
                fill="url(#epiGradEnhanced)"
                stroke="#15803d"
                strokeWidth="10"
                filter="url(#greenGlowEnhanced)"
                style={{
                  transform: `scale(${getPulse(t.epinephrine, 0.25, 0.08)})`,
                  transformOrigin: 'center',
                }}
              />
              <text
                textAnchor="middle"
                fill="white"
                fontSize="42"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                EPINEPHRINE
              </text>
              {localFrame >= t.dosing && (
                <text
                  y="-80"
                  textAnchor="middle"
                  fill="#22c55e"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="system-ui"
                  opacity={fadeIn(t.dosing, 10)}
                >
                  0.3-0.5 mg IM • THIGH
                </text>
              )}
            </g>
          )}

          {/* ===== EPINEPHRINE ACTION SEQUENCE INDICATOR (BIGGER FOR MOBILE) ===== */}
          {showEpinephrine && (
            <g transform="translate(460, 200)">
              <text
                y="0"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="34"
                fontWeight="bold"
                fontFamily="system-ui"
                opacity={fadeIn(t.brakes, 10)}
              >
                EPINEPHRINE'S 3-STEP RESCUE:
              </text>

              {/* Step indicators - BIGGER FOR MOBILE */}
              <g transform="translate(-200, 40)">
                {/* Step 1: Constrict Vessels */}
                <g opacity={showVesselConstriction ? 1 : 0.3}>
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill={showVesselConstriction ? '#22c55e' : 'rgba(34, 197, 94, 0.2)'}
                    stroke="#22c55e"
                    strokeWidth="5"
                  />
                  <text
                    y="11"
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    1
                  </text>
                  <text
                    y="62"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Constrict
                  </text>
                  <text
                    y="86"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Vessels
                  </text>
                </g>

                {/* Step 2: Open Airways */}
                <g transform="translate(200, 0)" opacity={showAirwayOpen ? 1 : 0.3}>
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill={showAirwayOpen ? '#22c55e' : 'rgba(34, 197, 94, 0.2)'}
                    stroke="#22c55e"
                    strokeWidth="5"
                  />
                  <text
                    y="11"
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    2
                  </text>
                  <text
                    y="62"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Open
                  </text>
                  <text
                    y="86"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Airways
                  </text>
                </g>

                {/* Step 3: Activate Heart */}
                <g transform="translate(400, 0)" opacity={showHeartActivation ? 1 : 0.3}>
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill={showHeartActivation ? '#22c55e' : 'rgba(34, 197, 94, 0.2)'}
                    stroke="#22c55e"
                    strokeWidth="5"
                  />
                  <text
                    y="11"
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    3
                  </text>
                  <text
                    y="62"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Activate
                  </text>
                  <text
                    y="86"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="24"
                    fontWeight="600"
                    fontFamily="system-ui"
                  >
                    Heart
                  </text>
                </g>

                {/* Connecting arrows */}
                {showVesselConstriction && (
                  <path
                    d="M 30 0 L 170 0"
                    stroke="#22c55e"
                    strokeWidth="3"
                    markerEnd="url(#arrowGreen)"
                  />
                )}
                {showAirwayOpen && (
                  <path
                    d="M 230 0 L 370 0"
                    stroke="#22c55e"
                    strokeWidth="3"
                    markerEnd="url(#arrowGreen)"
                  />
                )}
              </g>
            </g>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowGreen"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
            </marker>
          </defs>

          {/* ===== EFFECTS SUMMARY (BIGGER FOR MOBILE) ===== */}
          {showHeartActivation && (
            <text
              x="460"
              y="1180"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="38"
              fontWeight="bold"
              fontFamily="system-ui"
              filter="url(#greenGlowEnhanced)"
              opacity={fadeIn(t.heart + 20, 15)}
            >
              α1-Vasoconstriction • β2-Bronchodilation • β1-↑ CO
            </text>
          )}
        </svg>

        {/* ===== PHASE INDICATOR (MOVED TO BOTTOM OF SCREEN) ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: -320,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 50,
            fontSize: 36,
            background: 'rgba(0,0,0,0.95)',
            padding: '32px 60px',
            borderRadius: 50,
            border: '5px solid rgba(255,255,255,0.3)',
          }}
        >
          {[
            { label: 'IgE', active: showIgE && !showBoom, color: '#a855f7' },
            { label: 'BOOM', active: showBoom && !showDamage, color: '#ef4444' },
            { label: 'Histamine', active: showDamage && !showEpinephrine, color: '#f59e0b' },
            { label: 'EPI RESCUE', active: showEpinephrine, color: '#22c55e' },
          ].map((phase, i) => (
            <span
              key={i}
              style={{
                color: phase.active ? phase.color : 'rgba(255,255,255,0.4)',
                fontWeight: phase.active ? 'bold' : '500',
                textShadow: phase.active ? `0 0 25px ${phase.color}` : 'none',
              }}
            >
              {phase.active ? '●' : '○'} {phase.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default PenicillinAnaphylaxisMechanismEnhanced;
