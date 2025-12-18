import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * SickleCellMechanism - Acute Chest Syndrome
 *
 * Visual Story:
 * Phase 1 (RED): Normal RBCs → Deoxygenation → HbS polymerizes → Cells sickle
 * Phase 2 (YELLOW): Sickled cells JAM in pulmonary vessels → Logjam forms
 * Phase 3 (GREEN): Exchange transfusion → Remove sickled cells → Unclog river
 * Phase 4 (PINK): Blood flows freely → Oxygen restored → Patient recovers
 */
export const SickleCellMechanism = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== FRAME CONVERSION =====
  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== AUDIO TIMESTAMPS (actual values from generated audio) =====
  const timestamps = {
    // Phase 1: Sickling Mechanism
    polymerizing: 80.619,
    rigidRods: 84.822,
    warp: 85.484,
    sickles: 88.166,

    // Phase 2: Vaso-occlusion (The Logjam)
    bentUp: 90.465,
    jamUp: 93.890,
    logs: 94.772,
    logjam: 97.245,
    oxygenCantGet: 99.195,
    tissueDying: 102.051,
    deathSpiral: 107.891,

    // Phase 3: Why Simple Transfusion Fails
    simpleTransfusion: 109.412,
    addingFluid: 111.304,
    viscosity: 114.869,
    worseLogjam: 117.783,

    // Phase 4: Exchange Transfusion Solution
    exchangeTransfusion: 119.257,
    removes: 121.475,
    replacing: 123.576,
    unclogging: 126.781,
    breakingSpiral: 128.557,
    heal: 132.388,
    thirtyPercent: 135.663,
  };

  // Convert to local frames
  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== ANIMATION HELPERS =====
  const getSpring = (startFrame, config = { damping: 12, stiffness: 200, mass: 0.8 }) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config,
    });
  };

  const getProgress = (startFrame, duration = 20) => {
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

  // ===== PHASE STATES =====
  const showPhase1 = localFrame >= t.polymerizing;
  const showPhase2 = localFrame >= t.jamUp;
  const showPhase3 = localFrame >= t.exchangeTransfusion;
  const showPhase4 = localFrame >= t.unclogging;

  // ===== PHASE COLOR =====
  let phaseColor = '#ef4444'; // Red - problem
  if (showPhase2 && !showPhase3) phaseColor = '#fbbf24'; // Yellow - logjam
  else if (showPhase3 && !showPhase4) phaseColor = '#22c55e'; // Green - solution
  else if (showPhase4) phaseColor = '#ec4899'; // Pink - recovery

  // ===== RBC MORPHING (Normal disc to sickle shape) =====
  const sickleProgress = showPhase1 ? getProgress(t.sickles, 30) : 0;

  // ===== ENTRANCE ANIMATION =====
  const containerProgress = getProgress(0, 25);
  const slideUp = interpolate(localFrame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  // ===== VESSEL CONSTRICTION & DILATION =====
  // Use vessel gap (distance between top and bottom walls) to show constriction
  // Phase 1: Normal gap (100px between walls)
  // Phase 2: Constricts dramatically (50px gap) when logjam forms
  // Phase 3: Stays constricted during exchange
  // Phase 4: Dilates back to normal (100px gap) during recovery
  const vesselGap = showPhase4
    ? interpolate(localFrame, [t.heal, t.heal + 40], [50, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })
    : showPhase2
    ? interpolate(localFrame, [t.jamUp, t.jamUp + 30], [100, 50], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })
    : 100;

  const vesselStrokeWidth = 40; // Keep stroke width constant

  // ===== PARTICLE SYSTEM: Sickled cells in vessel =====
  const createSickledParticles = () => {
    const particles = [];
    if (!showPhase2) return particles;

    const numParticles = 15;

    for (let i = 0; i < numParticles; i++) {
      const spawnFrame = t.jamUp + i * 3;
      if (localFrame < spawnFrame) continue;

      const particleFrame = localFrame - spawnFrame;
      const baseX = 100 + (i % 5) * 140;
      const jammed = particleFrame > 20;

      const yOffset = jammed
        ? Math.sin(particleFrame * 0.1 + i) * 15
        : interpolate(particleFrame, [0, 20], [0, 20], { extrapolateRight: 'clamp' });

      particles.push({
        id: i,
        x: baseX + (jammed ? Math.sin(i * 1.3 + localFrame * 0.2) * 8 : 0),
        y: 600 + yOffset,
        opacity: interpolate(particleFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        scale: jammed ? 1 + Math.sin(localFrame * 0.1 + i) * 0.1 : 0.8,
        rotation: jammed ? Math.sin(localFrame * 0.05 + i * 0.5) * 15 : 0,
      });
    }
    return particles;
  };

  // ===== EXCHANGE TRANSFUSION PARTICLES (CENTERED) =====
  const createExchangeParticles = () => {
    const goodParticles = [];
    const badParticles = [];

    if (!showPhase3) return { goodParticles, badParticles };

    const numBadLeaving = Math.min(10, Math.floor((localFrame - t.removes) / 4));
    const numGoodEntering = Math.min(10, Math.floor((localFrame - t.replacing) / 4));

    const vesselCenterY = 600; // Center Y coordinate of vessel

    // Bad cells leaving (going UP and OUT) - CENTERED
    for (let i = 0; i < numBadLeaving; i++) {
      const particleFrame = localFrame - t.removes - i * 4;
      const progress = Math.min(1, particleFrame / 40);

      if (progress > 0 && progress < 1) {
        badParticles.push({
          id: `bad-${i}`,
          x: 300 + i * 40,
          y: interpolate(progress, [0, 1], [vesselCenterY, 200]),
          opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
          scale: interpolate(progress, [0, 0.5, 1], [1, 0.8, 0.5]),
        });
      }
    }

    // Good cells entering (coming DOWN and IN) - CENTERED
    for (let i = 0; i < numGoodEntering; i++) {
      const particleFrame = localFrame - t.replacing - i * 4;
      const progress = Math.min(1, particleFrame / 40);

      if (progress > 0 && progress < 1) {
        goodParticles.push({
          id: `good-${i}`,
          x: 450 + i * 40,
          y: interpolate(progress, [0, 1], [200, vesselCenterY]),
          opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]),
          scale: interpolate(progress, [0, 0.5, 1], [0.5, 1, 1]),
        });
      }
    }

    return { goodParticles, badParticles };
  };

  const sickledParticles = createSickledParticles();
  const { goodParticles, badParticles } = createExchangeParticles();

  // ===== RENDER =====
  return (
    <>
      {/* Branding removed - now handled by MedicalQuestionCard */}

      {/* Main Container */}
      <div
        style={{
          position: 'absolute',
          top: 480 + slideUp,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 1000,
          opacity: containerProgress,
          zIndex: 100,
        }}
      >
        {/* Glassmorphism Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 32,
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${phaseColor}40`,
            boxShadow: `0 0 60px ${phaseColor}20, inset 0 0 60px rgba(0,0,0,0.5)`,
          }}
        />

        {/* Animated Border */}
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

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 30,
            right: 30,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            zIndex: 10,
          }}
        >
          {[
            { label: 'Normal RBC', color: '#22c55e', shape: 'circle' },
            { label: 'Sickled RBC', color: '#ef4444', shape: 'sickle' },
            { label: 'HbS Polymer', color: '#9333ea', shape: 'rect' },
            { label: 'O2', color: '#3b82f6', shape: 'circle' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 14,
                  height: item.shape === 'rect' ? 6 : 14,
                  borderRadius: item.shape === 'sickle' ? '2px' : item.shape === 'rect' ? '2px' : '50%',
                  background: item.color,
                  transform: item.shape === 'sickle' ? 'rotate(45deg) skewX(-10deg)' : 'none',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main SVG */}
        <svg
          viewBox="0 0 800 850"
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            width: '100%',
            height: 'calc(100% - 120px)',
          }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="vesselGradSickle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7f1d1d" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="healthyGradSickle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            <linearGradient id="sickleCellGradSickle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            <linearGradient id="polymerGradSickle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Glows */}
            <filter id="glowSickle" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="redGlowSickle" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="greenGlowSickle" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#22c55e" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Arrow markers */}
            <marker id="arrowRedSickle" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/>
            </marker>

            <marker id="arrowGreenSickle" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/>
            </marker>
          </defs>

          {/* ===== PHASE 1: SICKLING MECHANISM ===== */}
          {showPhase1 && (
            <g opacity={getSpring(t.polymerizing)}>
              {/* Title */}
              <text
                x="400"
                y="80"
                textAnchor="middle"
                fill="white"
                fontSize="26"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
                filter="url(#glowSickle)"
              >
                HbS POLYMERIZATION
              </text>

              {/* Normal RBC transforming to sickle */}
              <g transform="translate(180, 200)">
                <text x="0" y="-80" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="18" fontWeight="600">
                  Low O2 triggers sickling
                </text>

                {/* The morphing RBC - BIGGER */}
                <g transform={`scale(${getPulse(t.sickles, 0.2, 0.1)})`}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={interpolate(sickleProgress, [0, 1], [60, 80])}
                    ry={interpolate(sickleProgress, [0, 1], [60, 28])}
                    fill={`url(#${sickleProgress > 0.5 ? 'sickleCellGradSickle' : 'healthyGradSickle'})`}
                    filter={sickleProgress > 0.5 ? 'url(#redGlowSickle)' : 'url(#greenGlowSickle)'}
                    transform={`rotate(${interpolate(sickleProgress, [0, 1], [0, 30])})`}
                  />

                  {/* HbS polymer rods inside */}
                  {sickleProgress > 0.3 && (
                    <g opacity={interpolate(sickleProgress, [0.3, 0.8], [0, 1])}>
                      {[-18, 0, 18].map((y, i) => (
                        <rect
                          key={i}
                          x={-55 * sickleProgress}
                          y={y - 3}
                          width={110 * sickleProgress}
                          height={6}
                          rx={3}
                          fill="url(#polymerGradSickle)"
                          opacity={0.8}
                        />
                      ))}
                    </g>
                  )}
                </g>
              </g>

              {/* Arrow showing transformation */}
              <path
                d="M280,200 L400,200"
                stroke="#fbbf24"
                strokeWidth="4"
                fill="none"
                markerEnd="url(#arrowRedSickle)"
                opacity={getProgress(t.warp, 20)}
                strokeDasharray="8 4"
              />

              {/* Resulting sickle cell - BIGGER */}
              <g transform="translate(520, 200)" opacity={getProgress(t.sickles, 25)}>
                <text x="0" y="-90" textAnchor="middle" fill="#ef4444" fontSize="22" fontWeight="bold">
                  SICKLED CELL
                </text>
                <g transform={`rotate(25) scale(${getPulse(t.sickles, 0.15, 0.08)})`}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="90"
                    ry="30"
                    fill="url(#sickleCellGradSickle)"
                    filter="url(#redGlowSickle)"
                  />
                  {/* Polymer rods */}
                  {[-12, 0, 12].map((y, i) => (
                    <rect
                      key={i}
                      x="-75"
                      y={y - 3}
                      width="150"
                      height={6}
                      rx={3}
                      fill="url(#polymerGradSickle)"
                    />
                  ))}
                </g>
              </g>

              {/* Rigid rods label */}
              {localFrame >= t.rigidRods && (
                <text
                  x="520"
                  y="290"
                  textAnchor="middle"
                  fill="#9333ea"
                  fontSize="18"
                  fontWeight="bold"
                  opacity={getProgress(t.rigidRods, 15)}
                >
                  RIGID POLYMER RODS
                </text>
              )}
            </g>
          )}

          {/* ===== PHASE 2: VASO-OCCLUSION (THE LOGJAM) ===== */}
          {showPhase2 && (
            <g opacity={getSpring(t.jamUp)}>
              {/* Vessel label */}
              <text
                x="400"
                y="380"
                textAnchor="middle"
                fill="#ef4444"
                fontSize="22"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
                filter="url(#redGlowSickle)"
                opacity={getPulse(t.logjam, 0.2, 0.2)}
              >
                LOGJAM IN PULMONARY VESSEL
              </text>

              {/* Blood vessel walls - with dynamic constriction */}
              <path
                d={`M50,${600 - vesselGap/2} Q400,${570 - vesselGap/2} 750,${600 - vesselGap/2}`}
                stroke="url(#vesselGradSickle)"
                strokeWidth={vesselStrokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M50,${600 + vesselGap/2} Q400,${630 + vesselGap/2} 750,${600 + vesselGap/2}`}
                stroke="url(#vesselGradSickle)"
                strokeWidth={vesselStrokeWidth}
                fill="none"
                strokeLinecap="round"
              />

              {/* Vessel interior */}
              <path
                d={`M50,${600 - vesselGap/2} Q400,${570 - vesselGap/2} 750,${600 - vesselGap/2} L750,${600 + vesselGap/2} Q400,${630 + vesselGap/2} 50,${600 + vesselGap/2} Z`}
                fill="rgba(127, 29, 29, 0.3)"
              />

              {/* Sickled particles jamming - BIGGER (hide in Phase 4 recovery) */}
              {!showPhase4 && sickledParticles.map((p) => (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y}) rotate(${p.rotation}) scale(${p.scale})`}
                  opacity={p.opacity}
                >
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="50"
                    ry="20"
                    fill="url(#sickleCellGradSickle)"
                    filter="url(#redGlowSickle)"
                  />
                </g>
              ))}

              {/* Blocked oxygen indicator - BIGGER (hide in Phase 4 recovery) */}
              {!showPhase4 && localFrame >= t.oxygenCantGet && (
                <g transform="translate(100, 600)" opacity={getProgress(t.oxygenCantGet, 20)}>
                  <circle cx="0" cy="0" r="35" fill="#3b82f6" opacity="0.5"/>
                  <text x="0" y="8" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
                    O2
                  </text>
                  <line x1="45" y1="-35" x2="80" y2="35" stroke="#ef4444" strokeWidth="7"/>
                  <line x1="80" y1="-35" x2="45" y2="35" stroke="#ef4444" strokeWidth="7"/>
                  <text x="65" y="70" textAnchor="middle" fill="#ef4444" fontSize="20" fontWeight="bold">
                    BLOCKED!
                  </text>
                </g>
              )}

              {/* Death spiral removed to free up space for larger components */}
            </g>
          )}

          {/* ===== PHASE 3: EXCHANGE TRANSFUSION ===== */}
          {showPhase3 && (
            <g opacity={getSpring(t.exchangeTransfusion)}>
              <text
                x="400"
                y="720"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="22"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
                filter="url(#greenGlowSickle)"
              >
                EXCHANGE TRANSFUSION
              </text>

              {/* Bad cells leaving (red, going up) - BIGGER */}
              {badParticles.map((p) => (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y}) scale(${p.scale})`}
                  opacity={p.opacity}
                >
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="40"
                    ry="16"
                    fill="url(#sickleCellGradSickle)"
                    filter="url(#redGlowSickle)"
                  />
                </g>
              ))}

              {/* Good cells entering (green, coming down) - BIGGER */}
              {goodParticles.map((p) => (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y}) scale(${p.scale})`}
                  opacity={p.opacity}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill="url(#healthyGradSickle)"
                    filter="url(#greenGlowSickle)"
                  />
                </g>
              ))}

              {/* Labels for the exchange - BIGGER */}
              <g transform="translate(200, 150)" opacity={getProgress(t.removes, 20)}>
                <text fill="#ef4444" fontSize="20" fontWeight="bold">
                  REMOVING
                </text>
                <text y="24" fill="rgba(255,255,255,0.6)" fontSize="16">
                  Sickled cells OUT
                </text>
              </g>

              <g transform="translate(520, 150)" opacity={getProgress(t.replacing, 20)}>
                <text fill="#22c55e" fontSize="20" fontWeight="bold">
                  REPLACING
                </text>
                <text y="24" fill="rgba(255,255,255,0.6)" fontSize="16">
                  Normal cells IN
                </text>
              </g>

              {/* Unclogging indicator - BIGGER */}
              {localFrame >= t.unclogging && (
                <text
                  x="400"
                  y="755"
                  textAnchor="middle"
                  fill="#22c55e"
                  fontSize="20"
                  fontWeight="bold"
                  opacity={getProgress(t.unclogging, 15)}
                >
                  UNCLOGGING THE RIVER
                </text>
              )}
            </g>
          )}

          {/* ===== PHASE 4: CLINICAL PEARL ===== */}
          {showPhase4 && localFrame >= t.thirtyPercent && (
            <g transform="translate(400, 810)" opacity={getProgress(t.thirtyPercent, 20)}>
              <rect
                x="-150"
                y="-30"
                width="300"
                height="60"
                rx="12"
                fill="rgba(34, 197, 94, 0.2)"
                stroke="#22c55e"
                strokeWidth="2"
              />
              <text
                x="0"
                y="8"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="20"
                fontWeight="bold"
              >
                TARGET: HbS {'<'} 30%
              </text>
            </g>
          )}

          {/* ===== HEALTHY FLOWING BLOOD WITH OXYGEN (Phase 4) ===== */}
          {showPhase4 && (
            <g opacity={getSpring(t.heal)}>
              {/* Healthy RBCs flowing smoothly */}
              {Array.from({ length: 8 }).map((_, i) => {
                const flowProgress = ((localFrame - t.heal + i * 8) % 60) / 60;
                const x = interpolate(flowProgress, [0, 1], [50, 750]);
                const y = 600 + Math.sin(flowProgress * Math.PI * 2) * 15;

                return (
                  <circle
                    key={`flow-rbc-${i}`}
                    cx={x}
                    cy={y}
                    r="25"
                    fill="url(#healthyGradSickle)"
                    filter="url(#greenGlowSickle)"
                    opacity={0.9}
                  />
                );
              })}

              {/* Oxygen molecules flowing alongside RBCs */}
              {Array.from({ length: 12 }).map((_, i) => {
                const flowProgress = ((localFrame - t.heal + i * 5) % 50) / 50;
                const x = interpolate(flowProgress, [0, 1], [50, 750]);
                const y = 600 + Math.sin(flowProgress * Math.PI * 3 + i) * 30;

                return (
                  <g key={`o2-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="#3b82f6"
                      opacity={0.7}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      O₂
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Phase Progress Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 20,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {[
            { label: 'Sickling', color: '#ef4444', active: showPhase1 && !showPhase2 },
            { label: 'Logjam', color: '#fbbf24', active: showPhase2 && !showPhase3 },
            { label: 'Exchange', color: '#22c55e', active: showPhase3 && !showPhase4 },
            { label: 'Recovery', color: '#ec4899', active: showPhase4 },
          ].map((phase) => (
            <span
              key={phase.label}
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

export default SickleCellMechanism;
