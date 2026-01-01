import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * TensionPneumothoraxMechanismEnhanced - FIRE Edition
 *
 * Phase 1: ONE-WAY VALVE - Air rushes in, can't escape (Red)
 * Phase 2: COMPRESSION - Mediastinal shift, heart kinked (Yellow)
 * Phase 3: NEEDLE DECOMPRESSION - Pop the pressure! (Green)
 * Phase 4: CLINICAL PEARL - Tension Triad (Purple)
 */

// ===== ANIMATION HELPERS =====
const getSpring = (localFrame, triggerFrame, fps, config = { damping: 12, stiffness: 200, mass: 0.8 }) => {
  if (localFrame < triggerFrame) return 0;
  return spring({
    frame: localFrame - triggerFrame,
    fps,
    config,
  });
};

const getProgress = (localFrame, startFrame, duration = 20) => {
  return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

const getPulse = (localFrame, triggerFrame, speed = 0.15, intensity = 0.08) => {
  if (localFrame < triggerFrame) return 1;
  return 1 + Math.sin((localFrame - triggerFrame) * speed) * intensity;
};

const getShake = (localFrame, startFrame, duration = 30, intensity = 12) => {
  if (localFrame < startFrame || localFrame > startFrame + duration) return { x: 0, y: 0 };
  const decay = 1 - (localFrame - startFrame) / duration;
  return {
    x: Math.sin(localFrame * 2.5) * intensity * decay,
    y: Math.cos(localFrame * 2) * intensity * 0.5 * decay,
  };
};

// ===== AIR PARTICLE COMPONENT =====
const AirParticle = ({ x, y, frame, delay, direction = 'in', size = 10 }) => {
  if (frame < delay) return null;

  const cycleLength = direction === 'out' ? 50 : 70;
  const progress = ((frame - delay) % cycleLength) / cycleLength;

  // Direction determines movement
  const moveX = direction === 'in'
    ? interpolate(progress, [0, 1], [x - 80, x])
    : interpolate(progress, [0, 1], [x, x + 120]);

  const moveY = y + Math.sin(progress * Math.PI * 3) * 12;
  const opacity = interpolate(progress, [0, 0.15, 0.85, 1], [0, 0.9, 0.9, 0]);
  const scale = direction === 'out'
    ? interpolate(progress, [0, 0.5, 1], [1, 1.3, 0.5])
    : interpolate(progress, [0, 0.5, 1], [0.5, 1, 1]);

  return (
    <div style={{
      position: 'absolute',
      left: moveX,
      top: moveY,
      width: size,
      height: size,
      borderRadius: '50%',
      background: direction === 'out'
        ? 'radial-gradient(circle, #86efac 0%, #22c55e 100%)'
        : 'radial-gradient(circle, #93c5fd 0%, #3b82f6 100%)',
      boxShadow: direction === 'out'
        ? `0 0 ${size * 1.5}px rgba(134, 239, 172, 0.7)`
        : `0 0 ${size * 1.5}px rgba(147, 197, 253, 0.6)`,
      opacity,
      transform: `scale(${scale})`,
      pointerEvents: 'none',
    }} />
  );
};

// ===== TRAPPED AIR BUBBLE =====
const TrappedAirBubble = ({ x, y, frame, delay, maxSize = 25 }) => {
  if (frame < delay) return null;

  const age = frame - delay;
  const growProgress = Math.min(1, age / 40);
  const size = maxSize * growProgress;
  const floatY = Math.sin(age * 0.08) * 5;
  const floatX = Math.cos(age * 0.06) * 3;
  const opacity = interpolate(growProgress, [0, 0.3, 1], [0, 0.8, 0.6]);

  return (
    <div style={{
      position: 'absolute',
      left: x + floatX - size / 2,
      top: y + floatY - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.9) 0%, rgba(59, 130, 246, 0.4) 70%, transparent 100%)',
      border: '1px solid rgba(147, 197, 253, 0.5)',
      boxShadow: '0 0 15px rgba(147, 197, 253, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)',
      opacity,
      pointerEvents: 'none',
    }} />
  );
};

// ===== ANATOMICAL CHEST CAVITY SVG =====
const ChestCavitySVG = ({
  localFrame,
  rightLungCollapse = 0,
  mediastinalShift = 0,
  heartKink = 0,
  showTrappedAir = false,
  trappedAirAmount = 0,
  showNeedle = false,
  needleProgress = 0,
  showAirRelease = false,
}) => {
  const breathe = Math.sin(localFrame * 0.08) * 0.02;
  const heartBeat = 1 + Math.sin(localFrame * 0.25) * 0.04;

  // Right lung shrinks with collapse
  const rightLungScale = 1 - rightLungCollapse * 0.6;
  const rightLungX = 420 + rightLungCollapse * 30;

  // Mediastinal shift pushes everything left
  const shiftX = -mediastinalShift * 80;

  // Heart rotation from kinking
  const heartRotation = heartKink * 25;

  return (
    <svg width="700" height="500" viewBox="0 0 700 500" style={{ position: 'absolute', left: 60, top: 50 }}>
      <defs>
        {/* Glow filters */}
        <filter id="lungGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feFlood floodColor="#3b82f6" floodOpacity="0.5"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <filter id="dangerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feFlood floodColor="#ef4444" floodOpacity="0.7"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <filter id="successGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feFlood floodColor="#22c55e" floodOpacity="0.7"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <filter id="airGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feFlood floodColor="#93c5fd" floodOpacity="0.6"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="ribGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f4"/>
          <stop offset="50%" stopColor="#d6d3d1"/>
          <stop offset="100%" stopColor="#a8a29e"/>
        </linearGradient>

        <linearGradient id="healthyLungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="50%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>

        <linearGradient id="collapsedLungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9ca3af"/>
          <stop offset="50%" stopColor="#6b7280"/>
          <stop offset="100%" stopColor="#4b5563"/>
        </linearGradient>

        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6"/>
          <stop offset="50%" stopColor="#ec4899"/>
          <stop offset="100%" stopColor="#db2777"/>
        </linearGradient>

        <linearGradient id="trappedAirGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(147, 197, 253, 0.3)"/>
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.15)"/>
        </linearGradient>

        <radialGradient id="needleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ade80"/>
          <stop offset="100%" stopColor="#22c55e"/>
        </radialGradient>
      </defs>

      {/* Chest wall outline */}
      <path
        d="M 100 80
           Q 80 200 100 350
           Q 120 420 200 450
           L 500 450
           Q 580 420 600 350
           Q 620 200 600 80
           Q 550 40 350 30
           Q 150 40 100 80 Z"
        fill="rgba(30, 30, 30, 0.4)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="3"
      />

      {/* Ribs */}
      {[100, 160, 220, 280, 340].map((y, i) => (
        <g key={i}>
          {/* Left rib */}
          <path
            d={`M 110 ${y} Q 200 ${y - 15} 320 ${y}`}
            fill="none"
            stroke="url(#ribGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Right rib */}
          <path
            d={`M 380 ${y} Q 500 ${y - 15} 590 ${y}`}
            fill="none"
            stroke="url(#ribGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      ))}

      {/* Trachea / Bronchi */}
      <g transform={`translate(${shiftX}, 0)`}>
        <path
          d="M 350 60 L 350 140 Q 350 160 320 180 L 280 220"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 350 140 Q 350 160 380 180 L 420 220"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>

      {/* LEFT LUNG (healthy) */}
      <g transform={`translate(${shiftX}, 0)`}>
        <ellipse
          cx={200}
          cy={280}
          rx={100 + breathe * 100}
          ry={150 + breathe * 100}
          fill="url(#healthyLungGrad)"
          filter="url(#lungGlow)"
          opacity="0.85"
        />
        <text x="200" y="290" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">
          LEFT
        </text>
        <text x="200" y="315" textAnchor="middle" fill="#93c5fd" fontSize="14">
          (Healthy)
        </text>
      </g>

      {/* Trapped air pocket (expanding) */}
      {showTrappedAir && (
        <ellipse
          cx={520}
          cy={250}
          rx={60 + trappedAirAmount * 80}
          ry={80 + trappedAirAmount * 100}
          fill="url(#trappedAirGrad)"
          filter="url(#airGlow)"
          stroke="rgba(147, 197, 253, 0.5)"
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity={0.7 + trappedAirAmount * 0.3}
        />
      )}

      {/* RIGHT LUNG (collapsing) */}
      <g transform={`translate(${rightLungX}, 0) scale(${rightLungScale}, ${rightLungScale})`}
         style={{ transformOrigin: '500px 280px' }}>
        <ellipse
          cx={500}
          cy={280}
          rx={100}
          ry={150}
          fill={rightLungCollapse > 0.3 ? "url(#collapsedLungGrad)" : "url(#healthyLungGrad)"}
          filter={rightLungCollapse > 0.5 ? "url(#dangerGlow)" : "url(#lungGlow)"}
          opacity={0.85 - rightLungCollapse * 0.3}
        />
        <text x="500" y="290" textAnchor="middle" fill={rightLungCollapse > 0.3 ? "#ef4444" : "#fff"} fontSize="22" fontWeight="700">
          RIGHT
        </text>
        {rightLungCollapse > 0.5 && (
          <text x="500" y="315" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="600">
            COLLAPSED!
          </text>
        )}
      </g>

      {/* HEART (shifting and kinking) */}
      <g transform={`translate(${350 + shiftX}, 320) rotate(${heartRotation}) scale(${heartBeat})`}
         style={{ transformOrigin: 'center' }}>
        <path
          d="M 0 -40
             C -25 -65 -55 -55 -55 -25
             C -55 15 0 50 0 50
             C 0 50 55 15 55 -25
             C 55 -55 25 -65 0 -40 Z"
          fill={heartKink > 0.3 ? "#ef4444" : "url(#heartGrad)"}
          filter={heartKink > 0.5 ? "url(#dangerGlow)" : undefined}
          stroke={heartKink > 0.3 ? "#991b1b" : "#db2777"}
          strokeWidth="3"
        />
        {/* Kink indicator */}
        {heartKink > 0.5 && (
          <>
            <line x1="-30" y1="-30" x2="30" y2="30" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
            <line x1="30" y1="-30" x2="-30" y2="30" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
          </>
        )}
      </g>

      {/* NEEDLE (decompression) */}
      {showNeedle && (
        <g transform={`translate(${600 - needleProgress * 60}, 120)`}>
          {/* Needle body */}
          <rect
            x="0"
            y="-4"
            width="80"
            height="8"
            rx="2"
            fill="url(#needleGrad)"
            filter="url(#successGlow)"
          />
          {/* Needle tip */}
          <polygon
            points="-15,0 0,-6 0,6"
            fill="#22c55e"
          />
          {/* Syringe body */}
          <rect
            x="80"
            y="-12"
            width="40"
            height="24"
            rx="4"
            fill="#16a34a"
            stroke="#22c55e"
            strokeWidth="2"
          />
        </g>
      )}

      {/* Air release particles */}
      {showAirRelease && Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 0.6 - Math.PI * 0.3;
        const distance = 30 + ((localFrame * 2 + i * 10) % 80);
        const particleX = 540 + Math.cos(angle) * distance;
        const particleY = 120 + Math.sin(angle) * distance * 0.5;
        const opacity = interpolate(distance, [30, 80, 110], [0.9, 0.6, 0]);

        return (
          <circle
            key={i}
            cx={particleX}
            cy={particleY}
            r={4 + (i % 3) * 2}
            fill="#86efac"
            opacity={Math.max(0, opacity)}
            filter="url(#successGlow)"
          />
        );
      })}
    </svg>
  );
};

// ===== ONE-WAY VALVE VISUALIZATION =====
const OneWayValve = ({ localFrame, triggerFrame, fps }) => {
  const opacity = getProgress(localFrame, triggerFrame, 15);
  const scale = getSpring(localFrame, triggerFrame, fps);
  const flapAngle = Math.sin(localFrame * 0.2) * 15 - 30; // Flaps open one way

  return (
    <div style={{
      position: 'absolute',
      right: 120,
      top: 180,
      opacity,
      transform: `scale(${scale})`,
    }}>
      <svg width="150" height="120" viewBox="0 0 150 120">
        <defs>
          <linearGradient id="valveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444"/>
            <stop offset="100%" stopColor="#dc2626"/>
          </linearGradient>
        </defs>

        {/* Valve housing */}
        <rect x="20" y="30" width="110" height="60" rx="8" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="3"/>

        {/* Valve flaps */}
        <g transform={`translate(75, 60)`}>
          {/* Top flap - opens inward */}
          <rect
            x="-25" y="-25" width="50" height="8" rx="2"
            fill="url(#valveGrad)"
            transform={`rotate(${flapAngle})`}
            style={{ transformOrigin: '-25px 0px' }}
          />
          {/* Bottom flap */}
          <rect
            x="-25" y="17" width="50" height="8" rx="2"
            fill="url(#valveGrad)"
            transform={`rotate(${-flapAngle})`}
            style={{ transformOrigin: '-25px 0px' }}
          />
        </g>

        {/* Arrow IN (green) */}
        <polygon points="5,60 20,50 20,70" fill="#22c55e"/>
        <text x="8" y="85" fill="#22c55e" fontSize="12" fontWeight="700">IN</text>

        {/* X for OUT (red) */}
        <g transform="translate(135, 60)">
          <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
          <line x1="8" y1="-8" x2="-8" y2="8" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
        </g>
        <text x="122" y="85" fill="#ef4444" fontSize="12" fontWeight="700">OUT</text>
      </svg>

      <div style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 18,
        fontWeight: 700,
        color: '#ef4444',
        textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
      }}>
        ONE-WAY VALVE
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const TensionPneumothoraxMechanismEnhanced = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== TIMESTAMPS FROM AUDIO =====
  const timestamps = {
    // Phase 1: One-Way Valve
    punctured: 70.694,
    valve: 72.934,
    airIn: 74.803,
    cantGetOut: 76.487,
    roachMotel: 79.018,
    neverChecksOut: 81.769,

    // Phase 2: Compression
    builds: 84.974,
    crushes: 87.075,
    shoving: 90.071,
    mediastinum: 91.232,
    kinked: 95.168,
    pinched: 97.443,
    jvd: 101.704,
    tension: 107.718,
    kill: 110.121,

    // Phase 3: Solution
    pops: 114.022,
    converting: 115.612,
    simple: 117.691,
    fourteen: 119.618,
    second: 122.962,
    midclavicular: 125.214,
    hiss: 130.264,
    climb: 132.865,

    // Phase 4: Why Traps Fail
    fail: 136.197,
    xray: 137.218,
    long: 139.482,
    clinical: 141.038,
    pericardiocentesis: 145.507,
    tamponade: 148.247,
    fluids: 152.009,
    crushed: 154.865,
    intubated: 157.965,
    moron: 159.521,

    // Clinical Pearl
    tensionTriad: 160.891,
    deviation: 162.806,
    jvdPearl: 163.747,
    absentBreath: 164.989,
    dontThink: 166.556,
    decompress: 168.948,
    secondICS: 170.701,
    fifth: 174.474,
    muscular: 178.503,
    wontKill: 180.407,
    welcome: 182.369,
  };

  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== DETERMINE CURRENT PHASE =====
  const getPhase = () => {
    if (localFrame < t.builds - 10) return 'valve';
    if (localFrame < t.pops - 10) return 'compression';
    if (localFrame < t.fail - 10) return 'solution';
    return 'pearl';
  };

  const phase = getPhase();

  const containerOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== PHASE 1: ONE-WAY VALVE =====
  const renderValve = () => {
    if (phase !== 'valve') return null;

    const opacity = getProgress(localFrame, 0, 20) *
      (localFrame > t.builds - 25 ? 1 - getProgress(localFrame, t.builds - 25, 20) : 1);

    const puncturedOpacity = getProgress(localFrame, t.punctured, 15);
    const valveOpacity = getProgress(localFrame, t.valve, 15);
    const airInOpacity = getProgress(localFrame, t.airIn, 12);
    const cantOutOpacity = getProgress(localFrame, t.cantGetOut, 12);
    const roachOpacity = getProgress(localFrame, t.roachMotel, 15);

    // Calculate progressive collapse
    const collapseProgress = interpolate(
      localFrame,
      [t.punctured, t.cantGetOut, t.neverChecksOut],
      [0, 0.3, 0.5],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 38,
          fontWeight: '800',
          color: '#ef4444',
          textShadow: '0 0 40px rgba(239, 68, 68, 0.6)',
          marginBottom: 10,
          opacity: puncturedOpacity,
          transform: `scale(${getSpring(localFrame, t.punctured, fps)})`,
          textAlign: 'center',
        }}>
          Broken Rib PUNCTURED the Lung
        </div>

        {/* Anatomical chest diagram */}
        <div style={{ position: 'relative', width: '100%', height: 520 }}>
          <ChestCavitySVG
            localFrame={localFrame}
            rightLungCollapse={collapseProgress}
            mediastinalShift={0}
            heartKink={0}
            showTrappedAir={localFrame > t.airIn}
            trappedAirAmount={interpolate(localFrame, [t.airIn, t.neverChecksOut], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          />

          {/* One-way valve visualization */}
          {localFrame >= t.valve && (
            <OneWayValve localFrame={localFrame} triggerFrame={t.valve} fps={fps} />
          )}

          {/* Air particles rushing IN */}
          {localFrame > t.airIn && Array.from({ length: 10 }).map((_, i) => (
            <AirParticle
              key={`in-${i}`}
              x={580}
              y={160 + (i % 4) * 35}
              frame={localFrame}
              delay={t.airIn + i * 6}
              direction="in"
              size={8 + (i % 3) * 3}
            />
          ))}

          {/* Trapped air bubbles accumulating */}
          {localFrame > t.cantGetOut && Array.from({ length: 8 }).map((_, i) => (
            <TrappedAirBubble
              key={`bubble-${i}`}
              x={480 + Math.cos(i * 1.2) * 60}
              y={220 + Math.sin(i * 0.9) * 80}
              frame={localFrame}
              delay={t.cantGetOut + i * 8}
              maxSize={18 + (i % 3) * 8}
            />
          ))}
        </div>

        {/* Roach motel analogy */}
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '22px 45px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderRadius: 18,
          border: '4px solid #ef4444',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
          opacity: roachOpacity,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 28, color: '#fca5a5', textAlign: 'center', fontWeight: '600' }}>
            Like a <span style={{ color: '#ef4444', fontWeight: '800' }}>ROACH MOTEL</span> for air
          </div>
          <div style={{ fontSize: 24, color: '#fca5a5', textAlign: 'center', marginTop: 8 }}>
            Checks in, <span style={{ color: '#ef4444', fontWeight: '800' }}>NEVER</span> checks out
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 2: COMPRESSION =====
  const renderCompression = () => {
    if (phase !== 'compression') return null;

    const opacity = getProgress(localFrame, t.builds - 10, 20) *
      (localFrame > t.pops - 25 ? 1 - getProgress(localFrame, t.pops - 25, 20) : 1);

    // Screen shake on KINKED
    const shake = getShake(localFrame, t.kinked, 35, 15);

    // Progressive compression values
    const collapseProgress = interpolate(
      localFrame,
      [t.builds, t.crushes],
      [0.5, 0.9],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const shiftProgress = interpolate(
      localFrame,
      [t.shoving, t.mediastinum + 30],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const kinkProgress = interpolate(
      localFrame,
      [t.kinked, t.pinched],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const buildsOpacity = getProgress(localFrame, t.builds, 12);
    const kinkedOpacity = getProgress(localFrame, t.kinked, 12);
    const pinchedOpacity = getProgress(localFrame, t.pinched, 12);
    const jvdOpacity = getProgress(localFrame, t.jvd, 12);
    const tensionOpacity = getProgress(localFrame, t.tension, 15);

    // Animated pressure wave dash offset
    const pressureWaveDash = localFrame * 3;

    return (
      <div style={{
        opacity,
        transform: `translate(${shake.x}px, ${shake.y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}>
        {/* Title - bigger */}
        <div style={{
          fontSize: 42,
          fontWeight: '900',
          color: '#fbbf24',
          textShadow: '0 0 50px rgba(251, 191, 36, 0.7)',
          marginBottom: 5,
          opacity: buildsOpacity,
          transform: `scale(${getPulse(localFrame, t.builds, 0.12, 0.08)})`,
        }}>
          Air BUILDS and BUILDS...
        </div>

        {/* LARGE SVG Chest Diagram - fills the space */}
        <svg width="760" height="580" viewBox="0 0 760 580" style={{ marginTop: 5 }}>
          <defs>
            {/* Glow filters */}
            <filter id="compLungGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor="#3b82f6" floodOpacity="0.6"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="compDangerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="compAirGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur"/>
              <feFlood floodColor="#93c5fd" floodOpacity="0.7"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="compPressureGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#fbbf24" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Gradients */}
            <linearGradient id="compHealthyLung" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="50%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="compCollapsedLung" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af"/>
              <stop offset="50%" stopColor="#6b7280"/>
              <stop offset="100%" stopColor="#4b5563"/>
            </linearGradient>
            <linearGradient id="compHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6"/>
              <stop offset="50%" stopColor="#ec4899"/>
              <stop offset="100%" stopColor="#db2777"/>
            </linearGradient>
            <linearGradient id="compHeartDanger" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5"/>
              <stop offset="50%" stopColor="#ef4444"/>
              <stop offset="100%" stopColor="#b91c1c"/>
            </linearGradient>
            <radialGradient id="compAirPocket" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.5)"/>
              <stop offset="70%" stopColor="rgba(59, 130, 246, 0.2)"/>
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)"/>
            </radialGradient>
          </defs>

          {/* Chest wall - large */}
          <path
            d="M 80 60 Q 50 180 80 380 Q 110 460 220 500 L 540 500 Q 650 460 680 380 Q 710 180 680 60 Q 620 20 380 10 Q 140 20 80 60 Z"
            fill="rgba(20, 20, 20, 0.5)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="4"
          />

          {/* Ribs - animated pulse */}
          {[90, 160, 230, 300, 370].map((y, i) => (
            <g key={i} opacity={0.7 + Math.sin(localFrame * 0.1 + i) * 0.1}>
              <path
                d={`M 95 ${y} Q 200 ${y - 20} 360 ${y}`}
                fill="none"
                stroke="#a8a29e"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d={`M 400 ${y} Q 560 ${y - 20} 665 ${y}`}
                fill="none"
                stroke="#a8a29e"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Trachea - shifts with mediastinum */}
          <g transform={`translate(${-shiftProgress * 100}, 0)`}>
            <path
              d="M 380 40 L 380 140 Q 380 170 340 200 L 280 260"
              fill="none"
              stroke="#64748b"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M 380 140 Q 380 170 420 200 L 480 260"
              fill="none"
              stroke="#64748b"
              strokeWidth="22"
              strokeLinecap="round"
            />
          </g>

          {/* TRAPPED AIR POCKET - HUGE and expanding */}
          <ellipse
            cx={580}
            cy={280}
            rx={80 + shiftProgress * 100}
            ry={120 + shiftProgress * 140}
            fill="url(#compAirPocket)"
            filter="url(#compAirGlow)"
            stroke="rgba(147, 197, 253, 0.6)"
            strokeWidth="3"
            strokeDasharray="12 6"
            opacity={buildsOpacity}
          />

          {/* Pressure label inside air pocket */}
          <text
            x={580}
            y={280}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="28"
            fontWeight="800"
            opacity={buildsOpacity}
          >
            TRAPPED
          </text>
          <text
            x={580}
            y={315}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="28"
            fontWeight="800"
            opacity={buildsOpacity}
          >
            AIR
          </text>

          {/* LEFT LUNG - healthy, being pushed */}
          <g transform={`translate(${-shiftProgress * 100}, 0)`}>
            <ellipse
              cx={220}
              cy={310}
              rx={120 - shiftProgress * 30}
              ry={180 - shiftProgress * 30}
              fill="url(#compHealthyLung)"
              filter="url(#compLungGlow)"
              opacity="0.9"
            />
            <text x="220" y="310" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">
              LEFT
            </text>
            <text x="220" y="345" textAnchor="middle" fill="#93c5fd" fontSize="18">
              (Healthy)
            </text>
          </g>

          {/* RIGHT LUNG - collapsed */}
          <g transform={`translate(${shiftProgress * 60}, 0) scale(${1 - collapseProgress * 0.6})`} style={{ transformOrigin: '540px 310px' }}>
            <ellipse
              cx={540}
              cy={310}
              rx={120}
              ry={180}
              fill="url(#compCollapsedLung)"
              filter={collapseProgress > 0.6 ? "url(#compDangerGlow)" : undefined}
              opacity={0.9 - collapseProgress * 0.4}
            />
            {collapseProgress > 0.5 && (
              <>
                <text x="540" y="310" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="800">
                  COLLAPSED
                </text>
              </>
            )}
          </g>

          {/* HEART - shifting and kinking */}
          <g transform={`translate(${380 - shiftProgress * 100}, 360) rotate(${kinkProgress * 30})`} style={{ transformOrigin: 'center' }}>
            <path
              d="M 0 -55 C -35 -90 -75 -75 -75 -35 C -75 20 0 70 0 70 C 0 70 75 20 75 -35 C 75 -75 35 -90 0 -55 Z"
              fill={kinkProgress > 0.3 ? "url(#compHeartDanger)" : "url(#compHeartGrad)"}
              filter={kinkProgress > 0.5 ? "url(#compDangerGlow)" : undefined}
              stroke={kinkProgress > 0.3 ? "#991b1b" : "#db2777"}
              strokeWidth="4"
              transform={`scale(${1 + Math.sin(localFrame * 0.25) * 0.06})`}
            />
            {/* Kink X marker */}
            {kinkProgress > 0.5 && (
              <g opacity={kinkProgress}>
                <line x1="-35" y1="-35" x2="35" y2="35" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
                <line x1="35" y1="-35" x2="-35" y2="35" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
              </g>
            )}
          </g>

          {/* Animated Pressure Waves - SVG path animation */}
          {localFrame >= t.shoving && [0, 1, 2, 3].map((i) => {
            const waveOpacity = getProgress(localFrame, t.shoving + i * 8, 15) * (1 - i * 0.2);
            return (
              <path
                key={i}
                d={`M ${620 - i * 30} 200 Q ${550 - i * 30} 280 ${620 - i * 30} 360`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={6 - i}
                strokeLinecap="round"
                strokeDasharray="20 10"
                strokeDashoffset={-pressureWaveDash}
                filter="url(#compPressureGlow)"
                opacity={waveOpacity}
              />
            );
          })}

          {/* Animated pressure arrows */}
          {localFrame >= t.shoving && (
            <g opacity={getProgress(localFrame, t.shoving, 15)}>
              {[0, 1, 2].map((i) => {
                const arrowX = 500 + Math.sin((localFrame + i * 12) * 0.15) * 20;
                return (
                  <g key={i} transform={`translate(${arrowX}, ${260 + i * 50})`} opacity={1 - i * 0.25}>
                    <polygon
                      points="-30,0 0,-20 0,20"
                      fill="#fbbf24"
                      filter="url(#compPressureGlow)"
                    />
                    <rect x="-60" y="-8" width="35" height="16" rx="4" fill="#fbbf24" filter="url(#compPressureGlow)"/>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Effects row - positioned below SVG */}
        <div style={{
          display: 'flex',
          gap: 15,
          justifyContent: 'center',
          marginTop: 10,
          flexWrap: 'wrap',
        }}>
          <EffectCard
            label="Heart KINKED"
            color="#ef4444"
            opacity={kinkedOpacity}
            scale={getSpring(localFrame, t.kinked, fps)}
            pulse={localFrame >= t.kinked}
            localFrame={localFrame}
          />
          <EffectCard
            label="Vena Cava PINCHED"
            color="#ef4444"
            opacity={pinchedOpacity}
            scale={getSpring(localFrame, t.pinched, fps)}
            pulse={localFrame >= t.pinched}
            localFrame={localFrame}
          />
          <EffectCard
            label="JVD ↑"
            color="#fbbf24"
            opacity={jvdOpacity}
            scale={getSpring(localFrame, t.jvd, fps)}
          />
          <EffectCard
            label="BP ↓"
            color="#ef4444"
            opacity={jvdOpacity}
            scale={getSpring(localFrame, t.jvd + 10, fps)}
            pulse={localFrame >= t.jvd + 10}
            localFrame={localFrame}
          />
        </div>

        {/* TENSION KILLS warning - at bottom */}
        <div style={{
          marginTop: 12,
          padding: '16px 40px',
          background: 'rgba(239, 68, 68, 0.25)',
          borderRadius: 18,
          border: '4px solid #ef4444',
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
          opacity: tensionOpacity,
          transform: `scale(${getSpring(localFrame, t.tension, fps) * getPulse(localFrame, t.tension, 0.1, 0.06)})`,
        }}>
          <div style={{ fontSize: 26, color: '#ef4444', fontWeight: '900', textAlign: 'center' }}>
            TENSION PHYSIOLOGY → KILLS in MINUTES
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 3: SOLUTION =====
  const renderSolution = () => {
    if (phase !== 'solution') return null;

    const opacity = getProgress(localFrame, t.pops - 10, 20) *
      (localFrame > t.fail - 25 ? 1 - getProgress(localFrame, t.fail - 25, 20) : 1);

    const popsOpacity = getProgress(localFrame, t.pops, 12);
    const fourteenOpacity = getProgress(localFrame, t.fourteen, 12);
    const hissOpacity = getProgress(localFrame, t.hiss, 12);
    const climbOpacity = getProgress(localFrame, t.climb, 15);

    // Needle insertion progress
    const needleProgress = interpolate(
      localFrame,
      [t.fourteen, t.second],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Lung re-expansion
    const reExpansion = interpolate(
      localFrame,
      [t.hiss, t.climb],
      [0, 0.8],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Air release animation
    const airReleaseDash = localFrame * 4;

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 40,
          fontWeight: '900',
          color: '#22c55e',
          textShadow: '0 0 50px rgba(34, 197, 94, 0.7)',
          marginBottom: 5,
          opacity: popsOpacity,
          transform: `scale(${getSpring(localFrame, t.pops, fps)})`,
          textAlign: 'center',
        }}>
          Needle Decompression POPS the Pressure!
        </div>

        {/* LARGE SVG - Needle decompression diagram */}
        <svg width="760" height="520" viewBox="0 0 760 520" style={{ marginTop: 5 }}>
          <defs>
            <filter id="solnLungGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor="#3b82f6" floodOpacity="0.6"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="solnSuccessGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feFlood floodColor="#22c55e" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="solnHealthyLung" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="50%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="solnRecoveringLung" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac"/>
              <stop offset="50%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#16a34a"/>
            </linearGradient>
            <linearGradient id="solnHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6"/>
              <stop offset="50%" stopColor="#ec4899"/>
              <stop offset="100%" stopColor="#db2777"/>
            </linearGradient>
            <linearGradient id="solnNeedleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80"/>
              <stop offset="100%" stopColor="#22c55e"/>
            </linearGradient>
          </defs>

          {/* Chest wall */}
          <path
            d="M 80 50 Q 50 160 80 340 Q 110 410 220 450 L 540 450 Q 650 410 680 340 Q 710 160 680 50 Q 620 15 380 5 Q 140 15 80 50 Z"
            fill="rgba(20, 20, 20, 0.5)"
            stroke="rgba(34, 197, 94, 0.4)"
            strokeWidth="4"
          />

          {/* Ribs */}
          {[80, 145, 210, 275, 340].map((y, i) => (
            <g key={i} opacity="0.7">
              <path d={`M 95 ${y} Q 200 ${y - 18} 360 ${y}`} fill="none" stroke="#a8a29e" strokeWidth="12" strokeLinecap="round"/>
              <path d={`M 400 ${y} Q 560 ${y - 18} 665 ${y}`} fill="none" stroke="#a8a29e" strokeWidth="12" strokeLinecap="round"/>
            </g>
          ))}

          {/* Trachea - returning to center */}
          <g transform={`translate(${-(1 - reExpansion) * 80}, 0)`}>
            <path d="M 380 30 L 380 120 Q 380 150 340 175 L 290 220" fill="none" stroke="#64748b" strokeWidth="20" strokeLinecap="round"/>
            <path d="M 380 120 Q 380 150 420 175 L 470 220" fill="none" stroke="#64748b" strokeWidth="20" strokeLinecap="round"/>
          </g>

          {/* LEFT LUNG - healthy */}
          <g transform={`translate(${-(1 - reExpansion) * 80}, 0)`}>
            <ellipse cx={220} cy={280} rx={110} ry={165} fill="url(#solnHealthyLung)" filter="url(#solnLungGlow)" opacity="0.9"/>
            <text x="220" y="280" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800">LEFT</text>
          </g>

          {/* RIGHT LUNG - re-expanding */}
          <ellipse
            cx={540}
            cy={280}
            rx={60 + reExpansion * 50}
            ry={90 + reExpansion * 75}
            fill={reExpansion > 0.5 ? "url(#solnRecoveringLung)" : "url(#solnHealthyLung)"}
            filter="url(#solnSuccessGlow)"
            opacity={0.6 + reExpansion * 0.3}
          />
          <text x="540" y="280" textAnchor="middle" fill="#22c55e" fontSize="22" fontWeight="800" opacity={reExpansion}>
            RE-EXPANDING
          </text>

          {/* HEART - returning to normal */}
          <g transform={`translate(${380 - (1 - reExpansion) * 80}, 320) rotate(${(1 - reExpansion) * 25})`}>
            <path
              d="M 0 -50 C -30 -80 -65 -70 -65 -32 C -65 15 0 60 0 60 C 0 60 65 15 65 -32 C 65 -70 30 -80 0 -50 Z"
              fill="url(#solnHeartGrad)"
              stroke="#db2777"
              strokeWidth="3"
              transform={`scale(${1 + Math.sin(localFrame * 0.25) * 0.05})`}
            />
          </g>

          {/* NEEDLE - inserting */}
          {localFrame >= t.fourteen && (
            <g transform={`translate(${680 - needleProgress * 80}, 90) rotate(-30)`} opacity={fourteenOpacity}>
              <rect x="0" y="-5" width="100" height="10" rx="3" fill="url(#solnNeedleGrad)" filter="url(#solnSuccessGlow)"/>
              <polygon points="-20,0 0,-8 0,8" fill="#22c55e"/>
              <rect x="100" y="-15" width="50" height="30" rx="5" fill="#16a34a" stroke="#22c55e" strokeWidth="2"/>
            </g>
          )}

          {/* Air escaping - animated streams */}
          {localFrame >= t.hiss && [0, 1, 2, 3, 4].map((i) => {
            const streamOpacity = hissOpacity * (1 - i * 0.15);
            return (
              <g key={i}>
                <path
                  d={`M ${600 + i * 8} ${80 + i * 15} Q ${650 + i * 10} ${70 + i * 10} ${720} ${60 + i * 20}`}
                  fill="none"
                  stroke="#86efac"
                  strokeWidth={4 - i * 0.5}
                  strokeLinecap="round"
                  strokeDasharray="15 8"
                  strokeDashoffset={-airReleaseDash + i * 10}
                  filter="url(#solnSuccessGlow)"
                  opacity={streamOpacity}
                />
              </g>
            );
          })}

          {/* HISS text */}
          {localFrame >= t.hiss && (
            <text
              x="700"
              y="130"
              fill="#22c55e"
              fontSize="28"
              fontWeight="900"
              fontStyle="italic"
              opacity={hissOpacity}
              filter="url(#solnSuccessGlow)"
            >
              *HISS*
            </text>
          )}

          {/* Technique info - INSIDE SVG at bottom */}
          <g transform="translate(380, 420)" opacity={fourteenOpacity}>
            <rect x="-200" y="-35" width="400" height="70" rx="16" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="3"/>
            <text x="0" y="-8" textAnchor="middle" fill="#22c55e" fontSize="24" fontWeight="800">14-16 gauge needle</text>
            <text x="0" y="22" textAnchor="middle" fill="#86efac" fontSize="18">2nd ICS midclavicular line</text>
          </g>
        </svg>

        {/* Result box - BP climbing */}
        <div style={{
          marginTop: 15,
          padding: '22px 60px',
          background: 'rgba(34, 197, 94, 0.25)',
          borderRadius: 20,
          border: '4px solid #22c55e',
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.5)',
          opacity: climbOpacity,
          transform: `scale(${getSpring(localFrame, t.climb, fps)})`,
        }}>
          <div style={{ fontSize: 32, color: '#22c55e', fontWeight: '900', textAlign: 'center' }}>
            Blood Pressure CLIMBS Back! ↑
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 4: CLINICAL PEARL =====
  const renderPearl = () => {
    if (phase !== 'pearl') return null;

    const opacity = getProgress(localFrame, t.fail - 10, 20);

    const failOpacity = getProgress(localFrame, t.fail, 12);
    const xrayOpacity = getProgress(localFrame, t.xray, 12);
    const triadOpacity = getProgress(localFrame, t.tensionTriad, 15);
    const decompressOpacity = getProgress(localFrame, t.decompress, 15);
    const welcomeOpacity = getProgress(localFrame, t.welcome, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        gap: 20,
      }}>
        {/* Why traps fail - BIGGER title */}
        <div style={{
          fontSize: 42,
          fontWeight: '900',
          color: '#fbbf24',
          opacity: failOpacity,
          textShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
        }}>
          Why Do Trap Answers FAIL?
        </div>

        {/* Trap cards - BIGGER and side by side */}
        <div style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={{
            flex: 1,
            maxWidth: 240,
            padding: '25px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 18,
            border: '3px solid #ef4444',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            opacity: xrayOpacity,
            transform: `scale(${getSpring(localFrame, t.xray, fps)})`,
          }}>
            <div style={{ fontSize: 28, color: '#ef4444', fontWeight: '800', marginBottom: 10 }}>X-ray?</div>
            <div style={{ fontSize: 18, color: '#fca5a5', lineHeight: 1.4 }}>Takes too LONG - CLINICAL diagnosis!</div>
          </div>

          <div style={{
            flex: 1,
            maxWidth: 240,
            padding: '25px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 18,
            border: '3px solid #ef4444',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            opacity: getProgress(localFrame, t.pericardiocentesis, 12),
            transform: `scale(${getSpring(localFrame, t.pericardiocentesis, fps)})`,
          }}>
            <div style={{ fontSize: 26, color: '#ef4444', fontWeight: '800', marginBottom: 10 }}>Pericardiocentesis?</div>
            <div style={{ fontSize: 18, color: '#fca5a5', lineHeight: 1.4 }}>That's for TAMPONADE!</div>
          </div>

          <div style={{
            flex: 1,
            maxWidth: 240,
            padding: '25px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 18,
            border: '3px solid #ef4444',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            opacity: getProgress(localFrame, t.fluids, 12),
            transform: `scale(${getSpring(localFrame, t.fluids, fps)})`,
          }}>
            <div style={{ fontSize: 28, color: '#ef4444', fontWeight: '800', marginBottom: 10 }}>IV Fluids?</div>
            <div style={{ fontSize: 18, color: '#fca5a5', lineHeight: 1.4 }}>Can't fill a CRUSHED heart!</div>
          </div>
        </div>

        {/* TENSION TRIAD - MUCH BIGGER */}
        <div style={{
          padding: '35px 60px',
          background: 'rgba(147, 51, 234, 0.15)',
          borderRadius: 24,
          border: '4px solid rgba(147, 51, 234, 0.7)',
          boxShadow: '0 0 60px rgba(147, 51, 234, 0.4)',
          opacity: triadOpacity,
          transform: `scale(${getSpring(localFrame, t.tensionTriad, fps)})`,
          width: '90%',
          maxWidth: 720,
        }}>
          <div style={{ fontSize: 38, fontWeight: '900', color: '#9333ea', marginBottom: 25, textAlign: 'center' }}>
            TENSION TRIAD
          </div>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'center' }}>
            <div style={{
              padding: '18px 28px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 14,
              border: '3px solid #ef4444',
              opacity: getProgress(localFrame, t.deviation, 12),
            }}>
              <span style={{ fontSize: 22, color: '#ef4444', fontWeight: '700' }}>Tracheal Deviation</span>
            </div>
            <div style={{
              padding: '18px 28px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: 14,
              border: '3px solid #fbbf24',
              opacity: getProgress(localFrame, t.jvdPearl, 12),
            }}>
              <span style={{ fontSize: 22, color: '#fbbf24', fontWeight: '700' }}>JVD</span>
            </div>
            <div style={{
              padding: '18px 28px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 14,
              border: '3px solid #ef4444',
              opacity: getProgress(localFrame, t.absentBreath, 12),
            }}>
              <span style={{ fontSize: 22, color: '#ef4444', fontWeight: '700' }}>Absent Breath Sounds</span>
            </div>
          </div>
        </div>

        {/* DECOMPRESS command - BIGGER */}
        <div style={{
          padding: '30px 70px',
          background: 'rgba(34, 197, 94, 0.25)',
          borderRadius: 24,
          border: '5px solid #22c55e',
          boxShadow: '0 0 70px rgba(34, 197, 94, 0.5)',
          opacity: decompressOpacity,
          transform: `scale(${getSpring(localFrame, t.decompress, fps) * getPulse(localFrame, t.decompress, 0.1, 0.05)})`,
        }}>
          <div style={{ fontSize: 36, color: '#22c55e', fontWeight: '900', textAlign: 'center' }}>
            Don't Think. Don't Image. DECOMPRESS!
          </div>
          <div style={{ fontSize: 24, color: '#86efac', textAlign: 'center', marginTop: 15 }}>
            2nd ICS midclavicular OR 5th ICS anterior axillary
          </div>
        </div>

        {/* Welcome - BIGGER */}
        <div style={{
          fontSize: 34,
          fontWeight: '900',
          background: 'linear-gradient(90deg, #f59e0b, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: welcomeOpacity,
          transform: `scale(${getSpring(localFrame, t.welcome, fps)})`,
          textAlign: 'center',
          marginTop: 10,
        }}>
          Now you won't KILL your patients. You're welcome.
        </div>
      </div>
    );
  };

  // Phase colors
  let phaseColor = '#ef4444';
  if (phase === 'valve') phaseColor = '#ef4444';
  else if (phase === 'compression') phaseColor = '#fbbf24';
  else if (phase === 'solution') phaseColor = '#22c55e';
  else if (phase === 'pearl') phaseColor = '#9333ea';

  return (
    <>
      {/* ===== MAIN CONTAINER ===== */}
      <div
        style={{
          position: 'absolute',
          top: 480,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 820,
          height: 1080,
          opacity: containerOpacity,
          zIndex: 100,
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0a0a0a',
            borderRadius: 22,
            border: `2px solid ${phaseColor}40`,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px ${phaseColor}15`,
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 22,
            background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.08), transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated conic border */}
        <div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: 25,
            background: `conic-gradient(from ${localFrame * 2}deg, ${phaseColor}35, transparent 20%)`,
            opacity: 0.5,
            zIndex: -1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '28px 32px',
            overflow: 'hidden',
          }}
        >
          {renderValve()}
          {renderCompression()}
          {renderSolution()}
          {renderPearl()}
        </div>

        {/* Phase indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 25,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 14,
            fontSize: 14,
            fontWeight: '500',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            background: 'rgba(0,0,0,0.8)',
            padding: '12px 24px',
            borderRadius: 24,
            border: '1.5px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {[
            { label: 'Valve', phases: ['valve'], color: '#ef4444' },
            { label: 'Compress', phases: ['compression'], color: '#fbbf24' },
            { label: 'Solution', phases: ['solution'], color: '#22c55e' },
            { label: 'Pearl', phases: ['pearl'], color: '#9333ea' },
          ].map((p, i) => {
            const isActive = p.phases.includes(phase);
            return (
              <span
                key={i}
                style={{
                  color: isActive ? p.color : 'rgba(255,255,255,0.3)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textShadow: isActive ? `0 0 15px ${p.color}` : 'none',
                }}
              >
                {isActive ? '●' : '○'} {p.label}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ===== HELPER COMPONENTS =====

const EffectCard = ({ label, color, opacity, scale, pulse = false, localFrame = 0 }) => {
  const pulseScale = pulse ? 1 + Math.sin(localFrame * 0.15) * 0.05 : 1;

  return (
    <div style={{
      padding: '14px 22px',
      background: `${color}20`,
      borderRadius: 14,
      border: `3px solid ${color}`,
      boxShadow: `0 0 25px ${color}40`,
      opacity,
      transform: `scale(${scale * pulseScale})`,
    }}>
      <div style={{ fontSize: 20, color, fontWeight: '700' }}>{label}</div>
    </div>
  );
};

const TrapCard = ({ title, reason, opacity, delay, localFrame, fps }) => (
  <div style={{
    padding: '14px 20px',
    background: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    border: '3px solid #ef4444',
    opacity,
    transform: `scale(${getSpring(localFrame, delay, fps)})`,
    maxWidth: 220,
  }}>
    <div style={{ fontSize: 18, color: '#ef4444', fontWeight: '700' }}>{title}</div>
    <div style={{ fontSize: 14, color: '#fca5a5', marginTop: 5 }}>{reason}</div>
  </div>
);

const TriadItem = ({ label, color, opacity }) => (
  <div style={{
    padding: '12px 20px',
    background: `${color}20`,
    borderRadius: 12,
    border: `2px solid ${color}`,
    opacity,
  }}>
    <span style={{ fontSize: 18, color, fontWeight: '600' }}>{label}</span>
  </div>
);

export default TensionPneumothoraxMechanismEnhanced;
