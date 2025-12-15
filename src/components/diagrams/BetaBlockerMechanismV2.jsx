import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { Animated, Move, Scale, Fade } from 'remotion-animated';
import SAFE_ZONES from '../../constants/safeZones';

/**
 * BetaBlockerMechanismV2 - GOLD STANDARD TEMPLATE
 *
 * A beautiful, animated mechanism diagram that tells a visual story
 * synchronized perfectly with Dr. Synapse's narration.
 *
 * Features:
 * - Uses remotion-animated for declarative animations
 * - Uses @remotion/paths for animated signal pathways
 * - Particle system for calcium flooding
 * - Pulsing/glowing effects tied to key moments
 * - Phase-based storytelling
 */
export const BetaBlockerMechanismV2 = ({ startTime, playbackRate = 1.9 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ===== FRAME CONVERSION =====
  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  // Don't render before diagram starts
  if (frame < diagramStartFrame) return null;

  // ===== AUDIO TIMESTAMPS (in seconds) =====
  // These are the exact moments things should happen
  const timestamps = {
    // Phase 1: Beta Blocker Blockade
    betaBlockers: 72.877,    // "Beta-blockers"
    choke: 74.108,           // "CHOKE OUT"
    blocking: 75.942,        // "BLOCKIN'"
    betaReceptors: 76.522,   // "beta receptors"

    // Phase 2: Atropine Fails
    atropineWorks: 81.7,     // "atropine works through"
    muscarinic: 83.082,      // "muscarinic receptors"
    different: 85.799,       // "COMPLETELY DIFFERENT"
    squat: 88.852,           // "SQUAT" - fail moment
    blocked: 91.058,         // "BLOCKED"

    // Phase 3: Glucagon Saves
    butGlucagon: 95.54,      // "But glucagon?"
    bypasses: 98.767,        // "bypasses"
    activates: 101.031,      // "Activates"
    ownReceptor: 102.308,    // "OWN receptor"
    cAMP: 103.005,           // "cAMP"
    rockets: 103.481,        // "ROCKETS"
    calcium: 104.63,         // "calcium"
    floods: 105.257,         // "FLOODS"
    cardiacCells: 106.511,   // "cardiac cells"
    backDoor: 107.173,       // "BACK DOOR"

    // Phase 4: Recovery
    heartRate: 110.702,      // "Heart rate climbs"
    dead: 112.328,           // "DEAD"
    bloodPressure: 113.291,  // "blood pressure"
    glucose: 114.87,         // "glucose"
    boost: 116.206,          // "BOOST"
    perfect: 117.993,        // "PERFECT"

    // Clinical Pearl
    fiveToTen: 119.514,      // "Five to ten milligrams"
    ivPush: 121.72,          // "IV push"
    drip: 123.392,           // "DRIP"
    antidotes: 131.519,      // "ANTIDOTES"
  };

  // Convert all timestamps to local frames
  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== ANIMATION PROGRESS HELPERS =====
  const getProgress = (startFrame, duration = 20) => {
    return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  };

  const getSpring = (startFrame) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config: { damping: 12, stiffness: 200, mass: 0.8 },
    });
  };

  const getPulse = (startFrame, speed = 0.3, intensity = 0.15) => {
    if (localFrame < startFrame) return 1;
    const elapsed = localFrame - startFrame;
    return 1 + Math.sin(elapsed * speed) * intensity;
  };

  const getShake = (startFrame, duration = 15, intensity = 5) => {
    if (localFrame < startFrame || localFrame > startFrame + duration) return { x: 0, y: 0 };
    const progress = (localFrame - startFrame) / duration;
    const decay = 1 - progress;
    return {
      x: Math.sin(localFrame * 2.5) * intensity * decay,
      y: Math.cos(localFrame * 2) * intensity * 0.6 * decay,
    };
  };

  // ===== PHASE STATES =====
  const showBetaBlock = localFrame >= t.choke;
  const showAtropine = localFrame >= t.atropineWorks;
  const showAtropineFail = localFrame >= t.squat;
  const showGlucagon = localFrame >= t.butGlucagon;
  const showBypass = localFrame >= t.bypasses;
  const showActivation = localFrame >= t.activates;
  const showCAMP = localFrame >= t.cAMP;
  const showRockets = localFrame >= t.rockets;
  const showCalcium = localFrame >= t.floods;
  const showRecovery = localFrame >= t.heartRate;
  const showPerfect = localFrame >= t.perfect;
  const showDose = localFrame >= t.fiveToTen;

  // ===== CURRENT PHASE COLOR =====
  let phaseColor = '#ef4444';
  if (showAtropine && !showGlucagon) {
    phaseColor = '#fbbf24';
  } else if (showGlucagon && !showRecovery) {
    phaseColor = '#22c55e';
  } else if (showRecovery) {
    phaseColor = '#ec4899';
  }

  // ===== SIGNAL LINE PROGRESS =====
  // Progress for glucagon receptor to cAMP line (120px down)
  const glucagonSignalProgress = showActivation ? getProgress(t.activates, 25) : 0;

  // Progress for cAMP to heart line (-255x, 270y)
  const calciumPathProgress = showCalcium ? getProgress(t.floods, 30) : 0;

  // ===== CALCIUM PARTICLES =====
  // Follow the straight line from near cAMP to heart top
  const calciumParticles = [];
  if (showCalcium) {
    const numParticles = Math.min(15, Math.floor((localFrame - t.floods) / 2));
    for (let i = 0; i < numParticles; i++) {
      const particleFrame = localFrame - t.floods - i * 2;
      const progress = Math.min(1, particleFrame / 35);
      if (progress > 0 && progress < 1) {
        // Linear interpolation along line from cAMP to heart
        const startX = 740, startY = 595;
        const endX = 510, endY = 815;

        calciumParticles.push({
          id: i,
          x: interpolate(progress, [0, 1], [startX, endX]) + Math.sin(i * 1.5) * 10,
          y: interpolate(progress, [0, 1], [startY, endY]) + Math.cos(i * 2) * 7,
          opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
          scale: interpolate(progress, [0, 0.5, 1], [0.5, 1, 0.7]),
        });
      }
    }
  }

  // ===== ENTRANCE ANIMATION =====
  const containerProgress = getProgress(0, 25);
  const containerScale = getSpring(0);
  const slideUp = interpolate(localFrame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  // ===== RENDER =====
  return (
    <>
      {/* Branding - Inside card at top-left */}
      <div
        style={{
          position: 'absolute',
          top: 500,
          left: 210,
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Inter, sans-serif',
          zIndex: 200,
          background: 'linear-gradient(135deg, #9333ea, #db2777, #9333ea)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: containerProgress,
        }}
      >
        synapticrecall.ai
      </div>

      <div
        style={{
          position: 'absolute',
          top: 480 + slideUp,
          left: '50%',
          transform: `translateX(-50%) scale(${Math.min(1, containerScale)})`,
          width: 700,
          height: 1000,
          opacity: containerProgress,
          zIndex: 100,
        }}
      >
        {/* ===== GLASSMORPHISM BACKGROUND ===== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(10, 10, 15, 0.92) 0%,
            rgba(15, 10, 25, 0.95) 100%)`,
          borderRadius: 32,
          border: `2px solid ${phaseColor}50`,
          boxShadow: `
            0 0 80px ${phaseColor}25,
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 0 100px rgba(0, 0, 0, 0.3)
          `,
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* ===== ANIMATED BORDER GLOW ===== */}
      <div
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 35,
          background: `conic-gradient(from ${localFrame * 2}deg,
            ${phaseColor}60, transparent 40%,
            ${phaseColor}40, transparent 80%,
            ${phaseColor}60)`,
          opacity: 0.6,
          zIndex: -1,
          filter: 'blur(2px)',
        }}
      />

      {/* ===== LEGEND (TOP RIGHT - BIGGER) ===== */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 25,
          display: 'flex',
          gap: 20,
          fontSize: 16,
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(0,0,0,0.6)',
          padding: '12px 20px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <span style={{ color: '#ef4444', fontWeight: 700 }}>● Blocked</span>
        <span style={{ color: '#fbbf24', fontWeight: 700 }}>● Wrong</span>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>● Success</span>
      </div>

      {/* ===== MAIN SVG DIAGRAM ===== */}
      <svg
        viewBox="0 0 920 1100"
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          width: 700,
          height: 880,
        }}
      >
        {/* Definitions */}
        <defs>
          {/* Gradients */}
          <linearGradient id="membraneGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E56E78" />
            <stop offset="50%" stopColor="#AD253C" />
            <stop offset="100%" stopColor="#E56E78" />
          </linearGradient>

          <linearGradient id="betaGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="glucagonGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="campGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="calciumGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>

          <linearGradient id="heartGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Glows */}
          <filter id="glowV2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlowV2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="redGlowV2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="greenGlowV2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feFlood floodColor="#22c55e" floodOpacity="0.8"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="pinkGlowV2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feFlood floodColor="#ec4899" floodOpacity="0.8"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Arrow Markers - auto-orient to path direction */}
          <marker
            id="arrowGreen"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>

          <marker
            id="arrowCyan"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#06B6D4" />
          </marker>
        </defs>

        {/* ===== ZONE LABELS ===== */}
        <text x="50" y="50" fill="rgba(255,255,255,0.5)" fontSize="16" fontFamily="system-ui" fontWeight="600" letterSpacing="2">
          EXTRACELLULAR
        </text>

        {/* ===== CELL MEMBRANE ===== */}
        <g transform="translate(0, 360)">
          <rect x="30" y="0" width="860" height="60" rx="30" fill="url(#membraneGradV2)" opacity="0.95"/>
          <text x="460" y="38" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold" fontFamily="system-ui" letterSpacing="2">
            CELL MEMBRANE
          </text>
        </g>

        {/* ===== BETA RECEPTOR (LEFT - GETS BLOCKED) ===== */}
        <g transform={`translate(180, 240)`}>
          {/* Receptor body */}
          <rect
            x="-70"
            y="-50"
            width="140"
            height="95"
            rx="14"
            fill="url(#betaGradV2)"
            stroke={showBetaBlock ? '#ef4444' : '#3B82F6'}
            strokeWidth={showBetaBlock ? 5 : 3}
            filter={showBetaBlock ? 'url(#redGlowV2)' : 'none'}
            opacity={getProgress(0, 15)}
          />
          <text x="0" y="-12" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(0, 15)}>
            BETA
          </text>
          <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(0, 15)}>
            RECEPTOR
          </text>

          {/* Propranolol blocker - appears on "CHOKE" */}
          {showBetaBlock && (
            <g opacity={getSpring(t.choke)} transform={`translate(${getShake(t.choke, 20, 8).x}, ${getShake(t.choke, 20, 8).y})`}>
              {/* Blocker pill */}
              <rect x="-50" y="45" width="100" height="50" rx="8" fill="#1a1a1a" stroke="#ef4444" strokeWidth="3"/>
              <text x="0" y="68" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="system-ui">
                PROPRANOLOL
              </text>
              <text x="0" y="84" textAnchor="middle" fill="#ef4444" fontSize="10" fontFamily="system-ui">
                (BLOCKER)
              </text>

              {/* Big X across receptor */}
              <line x1="-55" y1="-40" x2="55" y2="30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
              <line x1="55" y1="-40" x2="-55" y2="30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
            </g>
          )}

          {/* BLOCKED label */}
          {showBetaBlock && (
            <text
              x="0"
              y="-75"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui"
              opacity={getSpring(t.choke)}
              filter="url(#glowV2)"
            >
              BLOCKED!
            </text>
          )}

          {/* Blocked signal path - shows "NO SIGNAL" */}
          {showBetaBlock && (
            <g opacity={getProgress(t.blocking, 20)}>
              <line
                x1="0" y1="105"
                x2="0" y2="280"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="8,6"
                opacity="0.8"
              />
              {/* X at end */}
              <g transform="translate(0, 310)">
                <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
                <line x1="12" y1="-12" x2="-12" y2="12" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
              </g>
              <text x="0" y="355" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowV2)">
                NO SIGNAL
              </text>
            </g>
          )}
        </g>

        {/* ===== ATROPINE PATHWAY (CENTER - FAILS) ===== */}
        {showAtropine && (
          <g transform={`translate(460, 240)`} opacity={getSpring(t.atropineWorks)}>
            {/* Atropine molecule floating above */}
            <circle cx="0" cy="-80" r="30" fill="#9333ea" stroke="#7c3aed" strokeWidth="3"/>
            <text x="0" y="-78" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="system-ui">
              ATROPINE
            </text>

            {/* Dashed line trying to connect */}
            <line x1="0" y1="-48" x2="0" y2="-15" stroke="#9333ea" strokeWidth="3" strokeDasharray="5,4" opacity="0.8"/>

            {/* Muscarinic receptor */}
            <rect x="-65" y="-12" width="130" height="75" rx="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4"/>
            <text x="0" y="16" textAnchor="middle" fill="#1a1a1a" fontSize="16" fontWeight="bold" fontFamily="system-ui">
              MUSCARINIC
            </text>
            <text x="0" y="38" textAnchor="middle" fill="#1a1a1a" fontSize="16" fontWeight="bold" fontFamily="system-ui">
              RECEPTOR
            </text>

            {/* Different system label */}
            <text x="0" y="92" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold" fontFamily="system-ui">
              DIFFERENT SYSTEM!
            </text>

            {/* Big X on fail - appears on "SQUAT" */}
            {showAtropineFail && (
              <g opacity={getSpring(t.squat)} transform={`translate(${getShake(t.squat, 15, 6).x}, ${getShake(t.squat, 15, 6).y})`}>
                <line x1="-65" y1="-90" x2="65" y2="60" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
                <line x1="65" y1="-90" x2="-65" y2="60" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
              </g>
            )}
          </g>
        )}

        {/* ===== GLUCAGON PATHWAY (RIGHT - SUCCESS) ===== */}
        {showGlucagon && (
          <g transform="translate(740, 240)" opacity={getSpring(t.butGlucagon)}>
            {/* Glucagon molecule - glowing */}
            <circle
              cx="0"
              cy="-80"
              r="32"
              fill="url(#glucagonGradV2)"
              stroke="#15803d"
              strokeWidth="4"
              filter="url(#greenGlowV2)"
              style={{ transform: `scale(${getPulse(t.butGlucagon, 0.2, 0.08)})`, transformOrigin: '0 -80px' }}
            />
            <text x="0" y="-88" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui">
              GLUCA-
            </text>
            <text x="0" y="-72" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui">
              GON
            </text>

            {/* Connection line */}
            <line x1="0" y1="-45" x2="0" y2="-12" stroke="#22c55e" strokeWidth="4" opacity="0.9"/>

            {/* Glucagon receptor */}
            <rect
              x="-65"
              y="-12"
              width="130"
              height="75"
              rx="12"
              fill="url(#glucagonGradV2)"
              stroke={showActivation ? '#22c55e' : '#16a34a'}
              strokeWidth={showActivation ? 6 : 4}
              filter={showActivation ? 'url(#greenGlowV2)' : 'none'}
            />
            <text x="0" y="16" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="system-ui">
              GLUCAGON
            </text>
            <text x="0" y="38" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="system-ui">
              RECEPTOR
            </text>

            {/* OWN RECEPTOR label */}
            {showActivation && (
              <text x="0" y="92" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="bold" fontFamily="system-ui" opacity={getSpring(t.ownReceptor)}>
                OWN RECEPTOR ✓
              </text>
            )}
          </g>
        )}

        {/* ===== INTRACELLULAR ZONE ===== */}
        <rect x="40" y="630" width="840" height="380" rx="20" fill="rgba(15, 10, 25, 0.5)" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="2"/>
        <text x="460" y="665" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="16" fontFamily="system-ui" letterSpacing="1">
          INSIDE CARDIAC CELL (INTRACELLULAR)
        </text>

        {/* ===== SIGNAL PATHWAY FROM GLUCAGON RECEPTOR ===== */}
        {showActivation && (
          <g transform="translate(740, 320)">
            {/* Straight line with arrow marker - goes to cAMP */}
            <line
              x1="0" y1="0"
              x2="0" y2={185 * glucagonSignalProgress}
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#glowV2)"
              markerEnd="url(#arrowGreen)"
            />
          </g>
        )}

        {/* ===== cAMP BOX ===== */}
        {showCAMP && (
          <g transform="translate(720, 540)">
            <rect
              x="-55"
              y="-26"
              width="110"
              height="52"
              rx="26"
              fill="url(#campGradV2)"
              stroke="#22c55e"
              strokeWidth={showRockets ? 5 : 3}
              filter={showRockets ? 'url(#strongGlowV2)' : 'url(#glowV2)'}
              style={{
                transform: `scale(${showRockets ? getPulse(t.rockets, 0.4, 0.15) : 1})`,
                transformOrigin: '0 0',
              }}
            />
            <text x="0" y="10" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold" fontFamily="system-ui">
              cAMP
            </text>

            {/* Rocket trails when "ROCKETS" */}
            {showRockets && (
              <g>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const offset = ((localFrame - t.rockets + i * 4) % 20);
                  const opacity = 1 - offset / 20;
                  return (
                    <ellipse
                      key={i}
                      cx={Math.sin(i * 1.3) * 20}
                      cy={-30 - offset * 2}
                      rx="8"
                      ry="4"
                      fill="#22c55e"
                      opacity={opacity * 0.7}
                    />
                  );
                })}
                <text x="80" y="0" fill="#22c55e" fontSize="32" fontWeight="bold" fontFamily="system-ui" filter="url(#glowV2)">
                  ↑↑
                </text>
                <text x="80" y="28" fill="#22c55e" fontSize="15" fontWeight="bold" fontFamily="system-ui">
                  ROCKETS!
                </text>
              </g>
            )}
          </g>
        )}

        {/* ===== CALCIUM PATHWAY WITH ARROW ===== */}
        {showCalcium && (
          <g transform="translate(720, 600)">
            {/* Shorter line to heart with visible arrow tip */}
            <line
              x1="0" y1="0"
              x2={-190 * calciumPathProgress}
              y2={190 * calciumPathProgress}
              stroke="#06B6D4"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#glowV2)"
              markerEnd="url(#arrowCyan)"
            />
          </g>
        )}

        {/* ===== CALCIUM PARTICLES ===== */}
        {calciumParticles.map((p) => (
          <g key={p.id} transform={`translate(${p.x}, ${p.y})`} opacity={p.opacity}>
            <rect
              x="-14"
              y="-10"
              width="28"
              height="20"
              rx="6"
              fill="url(#calciumGradV2)"
              stroke="#0891B2"
              strokeWidth="2"
              style={{ transform: `scale(${p.scale})`, transformOrigin: '0 0' }}
            />
            <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui" style={{ transform: `scale(${p.scale})`, transformOrigin: '0 0' }}>
              Ca²⁺
            </text>
          </g>
        ))}

        {/* Calcium label - positioned to the RIGHT of arrow (clear of overlap) */}
        {showCalcium && (
          <g opacity={getProgress(t.floods, 15)} style={{ zIndex: 1000 }}>
            <text x="680" y="680" fill="#06B6D4" fontSize="18" fontWeight="bold" fontFamily="system-ui" filter="url(#glowV2)">
              CALCIUM FLOODS IN!
            </text>
            <text x="720" y="705" fill="#06B6D4" fontSize="15" fontFamily="system-ui" opacity="0.8">
              (BACK DOOR)
            </text>
          </g>
        )}

        {/* ===== HEART ===== */}
        {showRecovery && (
          <g transform="translate(460, 820)" opacity={getSpring(t.heartRate)}>
            {/* Heart shape - pulsing (scaled up) */}
            <path
              d="M 0 -26 C -26 -52, -75 -26, -75 18 C -75 63, 0 105, 0 105 C 0 105, 75 63, 75 18 C 75 -26, 26 -52, 0 -26"
              fill="url(#heartGradV2)"
              stroke="#EC4899"
              strokeWidth={5}
              filter="url(#pinkGlowV2)"
              style={{
                transform: `scale(${getPulse(t.heartRate, 0.35, 0.12)})`,
                transformOrigin: '0 35px',
              }}
            />

            {/* Recovery text */}
            <text x="0" y="145" textAnchor="middle" fill="#22c55e" fontSize="26" fontWeight="bold" fontFamily="system-ui" filter="url(#greenGlowV2)">
              HEART RECOVERS!
            </text>

            {/* Stats */}
            <g transform="translate(0, 190)">
              <text x="-110" y="0" textAnchor="middle" fill="#22c55e" fontSize="19" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(t.heartRate + 5, 10)}>
                HR ↑
              </text>
              <text x="0" y="0" textAnchor="middle" fill="#22c55e" fontSize="19" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(t.bloodPressure - t.heartRate + 5, 10)}>
                BP ↑
              </text>
              <text x="110" y="0" textAnchor="middle" fill="#22c55e" fontSize="19" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(t.glucose - t.heartRate + 5, 10)}>
                Glucose ↑
              </text>
            </g>
          </g>
        )}

        {/* ===== CLINICAL PEARL ===== */}
        {showDose && (
          <g transform="translate(200, 850)" opacity={getSpring(t.fiveToTen)}>
            <rect x="-140" y="-35" width="280" height="100" rx="16" fill="rgba(147, 51, 234, 0.25)" stroke="#9333ea" strokeWidth="3"/>
            <text x="0" y="-8" textAnchor="middle" fill="#9333ea" fontSize="14" fontWeight="bold" fontFamily="system-ui" letterSpacing="1">
              CLINICAL PEARL
            </text>
            <text x="0" y="22" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold" fontFamily="system-ui">
              5-10 mg IV push
            </text>
            <text x="0" y="48" textAnchor="middle" fill="#22c55e" fontSize="15" fontFamily="system-ui" opacity={getProgress(t.drip - t.fiveToTen, 15)}>
              then start a DRIP
            </text>
          </g>
        )}
      </svg>

      {/* ===== PHASE PROGRESS INDICATOR ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 20,
          fontSize: 14,
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(0,0,0,0.75)',
          padding: '12px 24px',
          borderRadius: 24,
          border: '1.5px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {[
          { label: 'Beta Blocked', active: showBetaBlock && !showAtropine, color: '#ef4444' },
          { label: 'Atropine Fails', active: showAtropine && !showGlucagon, color: '#fbbf24' },
          { label: 'Glucagon Bypass', active: showGlucagon && !showRecovery, color: '#22c55e' },
          { label: 'Recovery', active: showRecovery, color: '#ec4899' },
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

export default BetaBlockerMechanismV2;
