import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { evolvePath, getPointAtLength, getTangentAtLength, getLength } from '@remotion/paths';

/**
 * PenicillinAnaphylaxisMechanism - SIMPLIFIED EDITION
 *
 * Features:
 * - @remotion/paths for curved epinephrine flow
 * - Two-way branching particle system (airways + heart)
 * - Path-following with rotation
 * - Actual airways SVG from icon library
 * - Particle trails
 * - Receptor binding glow
 *
 * Visual story: IgE on mast cells → Penicillin binds → BOOM degranulation →
 * Histamine flood → Airway closes → Epinephrine FLOWS in →
 * Two pathways activate (airways + heart) → Complete rescue
 */
export const PenicillinAnaphylaxisMechanism = ({ startTime, playbackRate = 2.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== AUDIO TIMESTAMPS =====
  const timestamps = {
    listenUp: 65.7,
    penicillin: 66.98,
    ige: 68.6,
    antibodies: 69.48,
    mastCells: 71.58,
    cells: 71.92,
    bombs: 72.82,
    waiting: 73.48,
    blow: 74.3,
    boom: 76.68,
    mastCells2: 79.08,
    explode: 80.04,
    dumping: 81.3,
    histamine: 81.52,
    bloodstream: 82.56,
    busted: 83.82,
    dam: 84.38,
    histamine2: 86.34,
    wrecks: 86.9,
    airways: 88.44,
    slam: 88.82,
    shut: 89.28,
    vessels: 90.34,
    leak: 90.72,
    pressure: 92.3,
    tanks: 92.48,
    epinephrine: 93.58,
    only: 94.22,
    brakes: 96.6,        // START FLOW HERE
    constricts: 98.42,   // VESSELS CONSTRICT
    leaky: 99.5,
    opens: 100.8,        // AIRWAYS OPEN
    airways2: 101.36,
    kicks: 102.28,       // HEART ACTIVATES
    heart: 102.92,
    gear: 103.68,
    benadryl: 104.2,
    backup: 106.76,
    epiFirst: 110.34,
    dosing: 111.72,
    thigh: 114.8,
  };

  const t = {};
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
  const showEpinephrine = localFrame >= t.epinephrine;
  const showFlow = localFrame >= t.brakes;
  const showVesselConstriction = localFrame >= t.constricts;
  const showAirwayOpen = localFrame >= t.opens;
  const showHeartActivation = localFrame >= t.kicks;

  // ===== ANIMATION HELPERS =====
  const getSpring = (startFrame, config = { damping: 12, stiffness: 200, mass: 0.8 }) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config,
    });
  };

  const fadeIn = (startFrame, duration = 15) => {
    return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  };

  const getPulse = (startFrame, speed = 0.3, intensity = 0.15) => {
    if (localFrame < startFrame) return 1;
    const elapsed = localFrame - startFrame;
    return 1 + Math.sin(elapsed * speed) * intensity;
  };

  const getShake = (startFrame, duration = 15, intensity = 8) => {
    if (localFrame < startFrame || localFrame > startFrame + duration)
      return { x: 0, y: 0 };
    const progress = (localFrame - startFrame) / duration;
    const decay = 1 - progress;
    return {
      x: Math.sin(localFrame * 2.5) * intensity * decay,
      y: Math.cos(localFrame * 2) * intensity * 0.6 * decay,
    };
  };

  // ===== HISTAMINE PARTICLES - FLOW TO AIRWAYS & HEART =====
  const histamineParticles = {
    toAirways: [],
    toHeart: [],
  };

  if (showHistamine && !showFlow) {
    const numParticles = Math.min(40, Math.floor((localFrame - t.histamine) / 1));
    for (let i = 0; i < numParticles; i++) {
      const particleFrame = localFrame - t.histamine - i * 1;
      const progress = Math.min(1, particleFrame / 50);

      if (progress > 0 && progress < 1) {
        // Split particles toward airways and heart (2-way)
        const target = i % 2; // 0=airways, 1=heart

        if (target === 0) {
          // To Airways
          const x = interpolate(progress, [0, 1], [460, 220]) + Math.sin(i * 1.5) * 12;
          const y = interpolate(progress, [0, 1], [400, 650]) + Math.cos(i * 2) * 8;
          histamineParticles.toAirways.push({
            x, y,
            opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.4]),
            scale: 1 + Math.sin(i) * 0.3,
          });
        } else {
          // To Heart
          const x = interpolate(progress, [0, 1], [460, 680]) + Math.sin(i * 1.5) * 10;
          const y = interpolate(progress, [0, 1], [400, 750]) + Math.cos(i * 2) * 10;
          histamineParticles.toHeart.push({
            x, y,
            opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]),
            scale: 1 + Math.sin(i) * 0.3,
          });
        }
      }
    }
  }

  // ===== EPINEPHRINE FLOW PATHS (CURVED!) - TWO-WAY =====
  // Main path: Injection → Bloodstream (curved entry from bottom-left)
  const epiMainPath = "M250,950 C250,870 320,800 460,700 L460,650";
  const epiMainLength = getLength(epiMainPath);

  // Branch paths from bloodstream to targets (airways + heart only)
  const epiPathToAirways = "M460,650 C360,640 280,640 200,650";
  const epiPathToHeart = "M460,650 C560,700 640,740 680,780";

  const airwaysPathLength = getLength(epiPathToAirways);
  const heartPathLength = getLength(epiPathToHeart);

  // ===== EPINEPHRINE PARTICLES WITH ROTATION =====
  const epiParticles = {
    main: [],
    airways: [],
    heart: [],
  };

  if (showFlow) {
    // PHASE 1: Main flow to bloodstream
    const mainFlowDuration = 50;
    const numMainParticles = Math.min(25, Math.floor((localFrame - t.brakes) / 1.5));

    for (let i = 0; i < numMainParticles; i++) {
      const particleFrame = localFrame - t.brakes - i * 1.5;
      const progress = Math.min(1, particleFrame / mainFlowDuration);

      if (progress > 0 && progress < 1) {
        try {
          const point = getPointAtLength(epiMainPath, progress * epiMainLength);
          const tangent = getTangentAtLength(epiMainPath, progress * epiMainLength);

          epiParticles.main.push({
            x: point.x,
            y: point.y,
            rotation: Math.atan2(tangent.y, tangent.x) * (180 / Math.PI),
            opacity: interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
            scale: interpolate(progress, [0, 0.5, 1], [0.6, 1, 0.8]),
          });
        } catch (e) {
          // Fallback if path functions fail
          epiParticles.main.push({
            x: 460,
            y: interpolate(progress, [0, 1], [900, 750]),
            rotation: -90,
            opacity: interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
            scale: 1,
          });
        }
      }
    }

    // PHASE 2: Branch to airways (starts after main flow reaches split)
    const branchDelay = 35;
    const branchDuration = 60;

    if (localFrame >= t.brakes + branchDelay) {
      const numBranchParticles = Math.min(20, Math.floor((localFrame - t.brakes - branchDelay) / 2));

      // To Airways
      for (let i = 0; i < numBranchParticles; i++) {
        const particleFrame = localFrame - t.brakes - branchDelay - i * 2;
        const progress = Math.min(1, particleFrame / branchDuration);

        if (progress > 0 && progress < 1) {
          try {
            const point = getPointAtLength(epiPathToAirways, progress * airwaysPathLength);
            const tangent = getTangentAtLength(epiPathToAirways, progress * airwaysPathLength);

            epiParticles.airways.push({
              x: point.x,
              y: point.y,
              rotation: Math.atan2(tangent.y, tangent.x) * (180 / Math.PI),
              opacity: interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
              scale: 0.9,
            });
          } catch (e) {
            // Fallback
          }
        }
      }

      // To Heart
      for (let i = 0; i < numBranchParticles; i++) {
        const particleFrame = localFrame - t.brakes - branchDelay - i * 2;
        const progress = Math.min(1, particleFrame / branchDuration);

        if (progress > 0 && progress < 1) {
          try {
            const point = getPointAtLength(epiPathToHeart, progress * heartPathLength);
            const tangent = getTangentAtLength(epiPathToHeart, progress * heartPathLength);

            epiParticles.heart.push({
              x: point.x,
              y: point.y,
              rotation: Math.atan2(tangent.y, tangent.x) * (180 / Math.PI),
              opacity: interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
              scale: 0.9,
            });
          } catch (e) {
            // Fallback
          }
        }
      }
    }
  }

  // ===== AIRWAY EXPANSION ANIMATION =====
  const airwayOpenProgress = showAirwayOpen
    ? getSpring(t.opens, { damping: 18, stiffness: 220, mass: 0.9 })
    : 0;

  // Airway paths (morphing from closed to open)
  const closedAirwayLeft = "M-20,-50 Q-8,0 -20,50";
  const closedAirwayRight = "M20,-50 Q8,0 20,50";
  const openAirwayLeft = "M-50,-50 Q-25,0 -50,50";
  const openAirwayRight = "M50,-50 Q25,0 50,50";

  const currentAirwayLeft = showAirwayOpen
    ? `M${interpolate(airwayOpenProgress, [0, 1], [-20, -50])},-50 Q${interpolate(airwayOpenProgress, [0, 1], [-8, -25])},0 ${interpolate(airwayOpenProgress, [0, 1], [-20, -50])},50`
    : closedAirwayLeft;

  const currentAirwayRight = showAirwayOpen
    ? `M${interpolate(airwayOpenProgress, [0, 1], [20, 50])},-50 Q${interpolate(airwayOpenProgress, [0, 1], [8, 25])},0 ${interpolate(airwayOpenProgress, [0, 1], [20, 50])},50`
    : closedAirwayRight;

  // ===== PHASE INDICATOR =====
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

  const slideUp = interpolate(localFrame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shake = showBoom ? getShake(t.boom, 20, 12) : { x: 0, y: 0 };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 600 + slideUp,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 750,
          opacity: fadeIn(0, 15),
          zIndex: 100,
        }}
      >
        {/* Background panel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            height: 1280,
            background: 'linear-gradient(180deg, rgba(10, 8, 15, 0.92) 0%, rgba(15, 10, 25, 0.95) 100%)',
            borderRadius: 24,
            border: `2px solid ${phaseColor}50`,
            boxShadow: `0 0 50px ${phaseColor}30`,
          }}
        />

        <svg viewBox="0 0 920 1300" style={{ position: 'relative', zIndex: 1, width: 750, height: 1180 }}>
          <defs>
            {/* Gradients */}
            <radialGradient id="mastCellGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
            <radialGradient id="histamineGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
            <linearGradient id="epiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="epiParticleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="brandingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            {/* Glows */}
            <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGreenGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow markers */}
            <marker
              id="arrowGreen"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
          </defs>

          {/* Title */}
          <text x="460" y="60" textAnchor="middle" fill={phaseColor} fontSize="48" fontWeight="bold" fontFamily="system-ui">
            {currentPhase}
          </text>

          {/* ===== FLOW PATHS (drawn progressively) ===== */}
          {showFlow && (
            <>
              {/* Main path to bloodstream */}
              <path
                d={evolvePath(Math.min(1, (localFrame - t.brakes) / 35), epiMainPath)}
                stroke="#22c55e"
                strokeWidth="4"
                fill="none"
                opacity="0.4"
                strokeDasharray="8,4"
              />

              {/* Branch paths (appear after main flow) */}
              {localFrame >= t.brakes + 35 && (
                <>
                  <path
                    d={evolvePath(Math.min(1, (localFrame - t.brakes - 35) / 45), epiPathToAirways)}
                    stroke="#22c55e"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.4"
                    strokeDasharray="6,3"
                    markerEnd="url(#arrowGreen)"
                  />
                  <path
                    d={evolvePath(Math.min(1, (localFrame - t.brakes - 35) / 45), epiPathToHeart)}
                    stroke="#22c55e"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.4"
                    strokeDasharray="6,3"
                    markerEnd="url(#arrowGreen)"
                  />
                </>
              )}
            </>
          )}

          {/* ===== MAST CELL (fades out after degranulation) ===== */}
          {showMastCell && !showDamage && (
            <g
              transform={`translate(${460 + shake.x}, ${360 + shake.y}) scale(${getSpring(t.ige) * 1.2})`}
              opacity={showDegranulation ? interpolate(localFrame, [t.explode, t.explode + 20], [1, 0], { extrapolateRight: 'clamp' }) : 1}
            >
              <ellipse
                cx="0"
                cy="0"
                rx={showDegranulation ? 150 : 130}
                ry={showDegranulation ? 140 : 125}
                fill="url(#mastCellGrad)"
                stroke={showBoom ? '#ef4444' : '#a855f7'}
                strokeWidth={showBoom ? 10 : 6}
                filter={showBoom ? 'url(#redGlow)' : 'url(#purpleGlow)'}
                style={{
                  transform: `scale(${getPulse(t.boom, 0.5, 0.1)})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />

              {/* Granules inside */}
              {!showDegranulation && (
                <>
                  {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const r = 40 + (i % 3) * 22;
                    return (
                      <circle
                        key={i}
                        cx={Math.cos(angle) * r}
                        cy={Math.sin(angle) * r}
                        r={16 + (i % 2) * 6}
                        fill="#fbbf24"
                        opacity={0.8}
                      />
                    );
                  })}
                </>
              )}

              {/* BOOM text */}
              {showBoom && !showDegranulation && (
                <text x="0" y="20" textAnchor="middle" fill="#ef4444" fontSize="80" fontWeight="900" fontFamily="system-ui" filter="url(#redGlow)">
                  BOOM!
                </text>
              )}

              <text x="0" y="175" textAnchor="middle" fill="#e9d5ff" fontSize="34" fontWeight="bold" fontFamily="system-ui">
                MAST CELL
              </text>
            </g>
          )}

          {/* ===== IgE ANTIBODIES ===== */}
          {showIgE && !showDegranulation && (
            <>
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const x = 460 + Math.cos(angle) * 115 + shake.x;
                const y = 400 + Math.sin(angle) * 110 + shake.y;
                return (
                  <g key={i} transform={`translate(${x}, ${y})`} opacity={getSpring(t.antibodies + i * 3)}>
                    <path
                      d="M0,-28 L0,0 M-16,16 L0,0 L16,16"
                      stroke={showBombs ? '#ef4444' : '#fbbf24'}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {showBombs && (
                      <circle cx="0" cy="-30" r="10" fill="#ef4444" filter="url(#redGlow)" />
                    )}
                  </g>
                );
              })}

              <text x="620" y="280" fill="#fbbf24" fontSize="22" fontWeight="bold" fontFamily="system-ui">
                IgE ANTIBODIES
              </text>
              <line x1="600" y1="290" x2="550" y2="340" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6,6" />
            </>
          )}

          {/* ===== HISTAMINE PARTICLES (flowing to airways and heart) ===== */}
          {[...histamineParticles.toAirways, ...histamineParticles.toHeart].map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20 * p.scale}
                fill="url(#histamineGrad)"
                opacity={p.opacity}
                filter="url(#redGlow)"
              />
              <text
                x={p.x}
                y={p.y + 6}
                textAnchor="middle"
                fill="#fff"
                fontSize="18"
                fontWeight="bold"
                fontFamily="system-ui"
                opacity={p.opacity}
              >
                H
              </text>
            </g>
          ))}

          {showHistamine && !showFlow && (
            <g opacity={fadeIn(t.histamine, 10)}>
              <text x="460" y="200" textAnchor="middle" fill="#fbbf24" fontSize="36" fontWeight="bold" fontFamily="system-ui">
                HISTAMINE FLOOD
              </text>
              <text x="460" y="240" textAnchor="middle" fill="#fbbf2480" fontSize="22" fontFamily="system-ui">
                → Bronchoconstriction → Cardiovascular Collapse
              </text>
            </g>
          )}

          {/* ===== EPINEPHRINE PARTICLES (flowing with rotation!) ===== */}
          {/* Main flow particles */}
          {epiParticles.main.map((p, i) => (
            <g key={`main-${i}`} transform={`translate(${p.x}, ${p.y}) rotate(${p.rotation})`} opacity={p.opacity}>
              <rect
                x="-10"
                y="-6"
                width="20"
                height="12"
                rx="4"
                fill="url(#epiParticleGrad)"
                stroke="#15803d"
                strokeWidth="1.5"
                filter="url(#greenGlow)"
                style={{
                  transform: `scale(${p.scale})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />
              <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui">
                EPI
              </text>
            </g>
          ))}

          {/* Airways branch particles */}
          {epiParticles.airways.map((p, i) => (
            <g key={`air-${i}`} transform={`translate(${p.x}, ${p.y}) rotate(${p.rotation})`} opacity={p.opacity}>
              <rect
                x="-8"
                y="-5"
                width="16"
                height="10"
                rx="3"
                fill="url(#epiParticleGrad)"
                stroke="#15803d"
                strokeWidth="1.5"
                filter="url(#greenGlow)"
                style={{
                  transform: `scale(${p.scale})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />
            </g>
          ))}

          {/* Heart branch particles */}
          {epiParticles.heart.map((p, i) => (
            <g key={`heart-${i}`} transform={`translate(${p.x}, ${p.y}) rotate(${p.rotation})`} opacity={p.opacity}>
              <rect
                x="-8"
                y="-5"
                width="16"
                height="10"
                rx="3"
                fill="url(#epiParticleGrad)"
                stroke="#15803d"
                strokeWidth="1.5"
                filter="url(#greenGlow)"
                style={{
                  transform: `scale(${p.scale})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />
            </g>
          ))}

          {/* ===== AIRWAYS (with morphing animation) - BIGGER & BETTER SPACING ===== */}
          {showAirway && (
            <g transform="translate(200, 630) scale(1.15)" opacity={getSpring(t.slam)}>
              <rect
                x="-140"
                y="-110"
                width="280"
                height="220"
                rx="20"
                fill={showAirwayOpen ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                strokeWidth="4"
              />

              {/* Beta-2 Receptor (appears when epi arrives) - BIGGER */}
              {epiParticles.airways.length > 10 && (
                <g opacity={fadeIn(t.opens - 20, 10)}>
                  <rect
                    x="-90"
                    y="-145"
                    width="70"
                    height="45"
                    rx="8"
                    fill="#10b981"
                    stroke="#22c55e"
                    strokeWidth="3"
                    filter="url(#greenGlow)"
                    style={{
                      transform: `scale(${getPulse(t.opens, 0.3, 0.1)})`,
                      transformOrigin: 'center',
                      transformBox: 'fill-box',
                    }}
                  />
                  <text x="-55" y="-115" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="system-ui">
                    β2-R
                  </text>
                </g>
              )}

              {/* Morphing airway tubes - BIGGER */}
              <path
                d={currentAirwayLeft}
                stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                filter={showAirwayOpen ? 'url(#greenGlow)' : 'none'}
                transform="scale(1.3)"
              />
              <path
                d={currentAirwayRight}
                stroke={showAirwayOpen ? '#22c55e' : '#ef4444'}
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                filter={showAirwayOpen ? 'url(#greenGlow)' : 'none'}
                transform="scale(1.3)"
              />

              <text x="0" y="120" textAnchor="middle" fill={showAirwayOpen ? '#22c55e' : '#ef4444'} fontSize="24" fontWeight="bold" fontFamily="system-ui">
                {showAirwayOpen ? 'AIRWAYS OPEN!' : 'AIRWAYS SLAM SHUT'}
              </text>
            </g>
          )}

          {/* ===== BLOOD VESSEL (on right, with constriction) ===== */}
          {showAirway && (
            <g transform="translate(720, 630) scale(1.15)" opacity={getSpring(t.slam)}>
              <rect
                x="-140"
                y="-110"
                width="280"
                height="220"
                rx="20"
                fill={showVesselConstriction ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                stroke={showVesselConstriction ? '#22c55e' : '#ef4444'}
                strokeWidth="4"
              />

              {/* Alpha-1 Receptor (appears when epi arrives) */}
              {showVesselConstriction && (
                <g opacity={fadeIn(t.brakes + 50, 10)}>
                  <rect
                    x="20"
                    y="-165"
                    width="70"
                    height="45"
                    rx="8"
                    fill="#10b981"
                    stroke="#22c55e"
                    strokeWidth="3"
                    filter="url(#greenGlow)"
                    style={{
                      transform: `scale(${getPulse(t.brakes + 50, 0.3, 0.1)})`,
                      transformOrigin: 'center',
                      transformBox: 'fill-box',
                    }}
                  />
                  <text x="55" y="-135" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="system-ui">
                    α1-R
                  </text>
                </g>
              )}

              {/* Blood vessel tubes showing dilation/constriction */}
              <g transform="translate(0, -20)">
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
                    filter: showVesselConstriction ? 'url(#greenGlow)' : 'none'
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
                    filter: showVesselConstriction ? 'url(#greenGlow)' : 'none'
                  }}
                />

                {/* Compression arrows when constricted */}
                {showVesselConstriction && (
                  <>
                    <path
                      d="M -90 0 L -70 -10 L -70 10 Z"
                      fill="#22c55e"
                      opacity={0.8}
                    />
                    <path
                      d="M 90 0 L 70 -10 L 70 10 Z"
                      fill="#22c55e"
                      opacity={0.8}
                    />
                  </>
                )}
              </g>

              <text x="0" y="135" textAnchor="middle" fill={showVesselConstriction ? '#22c55e' : '#ef4444'} fontSize="24" fontWeight="bold" fontFamily="system-ui">
                {showVesselConstriction ? 'VESSELS CONSTRICT!' : 'VESSELS DILATE'}
              </text>
            </g>
          )}

          {/* ===== HEART (pulsing when activated) - BIGGER & BETTER SPACING ===== */}
          {showHeartActivation && (
            <g transform="translate(460, 980) scale(1.4)" opacity={getSpring(t.kicks)}>
              {/* Beta-1 Receptor - BIGGER */}
              <g opacity={fadeIn(t.kicks - 15, 10)}>
                <rect
                  x="-35"
                  y="-160"
                  width="70"
                  height="45"
                  rx="8"
                  fill="#10b981"
                  stroke="#22c55e"
                  strokeWidth="3"
                  filter="url(#greenGlow)"
                  style={{
                    transform: `scale(${getPulse(t.heart, 0.3, 0.1)})`,
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                  }}
                />
                <text x="0" y="-130" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="system-ui">
                  β1-R
                </text>
              </g>

              {/* Heart shape - INTENSE PULSING - BIGGER */}
              <path
                d="M 0 -25 C -25 -50, -75 -25, -75 17 C -75 60, 0 100, 0 100 C 0 100, 75 60, 75 17 C 75 -25, 25 -50, 0 -25"
                fill="#ec4899"
                stroke="#f472b6"
                strokeWidth={5}
                filter="url(#strongGreenGlow)"
                style={{
                  transform: `scale(${getPulse(t.heart, 0.45, 0.18)})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />

              <text x="0" y="-175" textAnchor="middle" fill="#22c55e" fontSize="24" fontWeight="bold" fontFamily="system-ui">
                ↑ HR • ↑ CO
              </text>
            </g>
          )}

          {/* ===== EPINEPHRINE SOURCE (syringe - BOTTOM LEFT) ===== */}
          {showEpinephrine && !showFlow && (
            <g transform="translate(250, 930) scale(1.2)" opacity={getSpring(t.epinephrine)}>
              <rect
                x="-110"
                y="-50"
                width="220"
                height="100"
                rx="50"
                fill="url(#epiGrad)"
                stroke="#15803d"
                strokeWidth="5"
                filter="url(#greenGlow)"
                style={{
                  transform: `scale(${getPulse(t.epinephrine, 0.25, 0.08)})`,
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                }}
              />

              <text x="0" y="10" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="system-ui">
                EPINEPHRINE
              </text>

              {localFrame >= t.dosing && (
                <text x="0" y="-70" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="bold" fontFamily="system-ui" opacity={fadeIn(t.dosing, 10)}>
                  0.3-0.5 mg IM • THIGH
                </text>
              )}
            </g>
          )}

          {/* ===== EFFECTS SUMMARY (better spacing) ===== */}
          {showHeartActivation && (
            <g transform="translate(460, 1160)" opacity={fadeIn(t.gear, 15)}>
              <text x="0" y="0" textAnchor="middle" fill="#22c55e" fontSize="28" fontWeight="bold" fontFamily="system-ui" filter="url(#greenGlow)">
                α1-Vasoconstriction • β2-Bronchodilation • β1-↑ Cardiac Output
              </text>
            </g>
          )}

        </svg>

        {/* ===== PHASE PROGRESS INDICATOR (MATCHING BETA BLOCKER STYLE) ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 36,
            fontSize: 22,
            fontFamily: 'system-ui, sans-serif',
            background: 'rgba(0,0,0,0.75)',
            padding: '22px 44px',
            borderRadius: 32,
            border: '2px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
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
                textShadow: phase.active ? `0 0 20px ${phase.color}, 0 0 40px ${phase.color}50` : 'none',
                letterSpacing: 1,
                transition: 'all 0.3s ease',
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

export default PenicillinAnaphylaxisMechanism;
