import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * DKAPotassiumMechanism - TEACHING DIAGRAM
 *
 * Visual story explaining why you MUST check potassium before insulin:
 *
 * Phase 1: THE LIE - Serum K+ looks normal (4.8) but total body is BONE DRY
 * Phase 2: THE TRAP - Insulin SHOVES K+ back into cells
 * Phase 3: THE CRASH - Serum drops like a STONE → heart ARREST
 * Phase 4: THE SOLUTION - Check first, replace if low, THEN insulin
 */
export const DKAPotassiumMechanism = ({ startTime, playbackRate = 1.9 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ===== FRAME CONVERSION =====
  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== AUDIO TIMESTAMPS (from DKA script) =====
  const timestamps = {
    // Phase 1: The Lie
    simmerDown: 78.262,     // "SIMMER DOWN"
    learnYou: 79.841,       // "I'll learn you"
    thisMatters: 81.292,    // "this matters"
    plentyK: 83.904,        // "PLENTY of potassium"
    outside: 85.925,        // "OUTSIDE his cells"
    looksNormal: 88.548,    // "looks NORMAL on paper"
    dadgumLie: 91.079,      // "DADGUM LIE"

    // Phase 2: The Trap
    boneDry: 95.341,        // "BONE DRY"
    pissin: 97.268,         // "PISSIN' it out"
    slamInsulin: 99.729,    // "slam insulin"
    shoves: 101.262,        // "SHOVES"
    backInto: 103.108,      // "BACK into cells"

    // Phase 3: The Crash
    serumDrops: 104.71,     // "Serum drops"
    stone: 106.045,         // "STONE"
    heartArrest: 108.46,    // "ARREST"

    // Phase 4: The Solution
    checkFirst: 109.993,    // "Check it FIRST"
    replaceIfLow: 110.968,  // "replace if it's low"
    thenInsulin: 112.93,    // "THEN give insulin"
    keepinHearts: 117.272,  // "keepin' hearts"
    beatin: 118.224,        // "BEATIN'"
  };

  // Convert to local frames
  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== ANIMATION HELPERS =====
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
  const showLie = localFrame >= t.plentyK;
  const showLieExposed = localFrame >= t.dadgumLie;
  const showTrap = localFrame >= t.slamInsulin;
  const showShift = localFrame >= t.shoves;
  const showCrash = localFrame >= t.serumDrops;
  const showArrest = localFrame >= t.heartArrest;
  const showSolution = localFrame >= t.checkFirst;
  const showSuccess = localFrame >= t.beatin;

  // ===== CURRENT PHASE COLOR =====
  let phaseColor = '#fbbf24'; // Yellow - warning
  if (showLieExposed && !showTrap) {
    phaseColor = '#ef4444'; // Red - danger exposed
  } else if (showTrap && !showSolution) {
    phaseColor = '#ef4444'; // Red - the crash
  } else if (showSolution) {
    phaseColor = '#22c55e'; // Green - solution
  }

  // ===== POTASSIUM PARTICLE SHIFT =====
  const potassiumParticles = [];
  if (showShift) {
    const numParticles = Math.min(12, Math.floor((localFrame - t.shoves) / 3));
    for (let i = 0; i < numParticles; i++) {
      const particleFrame = localFrame - t.shoves - i * 3;
      const progress = Math.min(1, particleFrame / 25);
      if (progress > 0 && progress < 1) {
        // Move from outside (serum) to inside (cell)
        const startX = 250 + (i % 4) * 40;
        const startY = 480 + Math.floor(i / 4) * 30;
        const endX = 550;
        const endY = 520;

        potassiumParticles.push({
          id: i,
          x: interpolate(progress, [0, 1], [startX, endX]) + Math.sin(i * 1.2) * 8,
          y: interpolate(progress, [0, 1], [startY, endY]) + Math.cos(i * 1.5) * 6,
          opacity: interpolate(progress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.3]),
          scale: interpolate(progress, [0, 0.5, 1], [1, 1.1, 0.8]),
        });
      }
    }
  }

  // ===== ENTRANCE ANIMATION =====
  const containerProgress = getProgress(0, 25);
  const slideUp = interpolate(localFrame, [0, 20], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  // ===== RENDER =====
  return (
    <>
      {/* Branding */}
      <div
        style={{
          position: 'absolute',
          top: 515,
          left: 200,
          fontSize: '16px',
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
          transform: 'translateX(-50%)',
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

        {/* ===== LEGEND ===== */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 25,
            display: 'flex',
            gap: 16,
            fontSize: 14,
            fontFamily: 'system-ui, sans-serif',
            background: 'rgba(0,0,0,0.6)',
            padding: '10px 18px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>● The Lie</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>● The Crash</span>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>● Solution</span>
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
            <linearGradient id="serumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id="cellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>

            <linearGradient id="kGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="insulinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>

            <linearGradient id="heartGradDKA" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            <filter id="glowDKA" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="redGlowDKA" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="greenGlowDKA" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#22c55e" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="yellowGlowDKA" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feFlood floodColor="#fbbf24" floodOpacity="0.8"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <marker
              id="arrowRed"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>

            <marker
              id="arrowGreenDKA"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
          </defs>

          {/* ===== TITLE ===== */}
          <text x="460" y="50" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold" fontFamily="system-ui" opacity={getProgress(0, 15)}>
            DKA: THE POTASSIUM TRAP
          </text>

          {/* ===== PHASE 1: THE LIE - Serum looks normal ===== */}
          {showLie && (
            <g transform="translate(200, 140)" opacity={getSpring(t.plentyK)}>
              {/* Serum compartment */}
              <rect
                x="-130"
                y="-30"
                width="260"
                height="120"
                rx="16"
                fill="url(#serumGrad)"
                stroke={showLieExposed ? '#ef4444' : '#3B82F6'}
                strokeWidth={showLieExposed ? 4 : 2}
                filter={showLieExposed ? 'url(#redGlowDKA)' : 'none'}
              />
              <text x="0" y="-5" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">
                SERUM (Blood)
              </text>

              {/* K+ ions floating - look abundant */}
              {[...Array(8)].map((_, i) => (
                <g key={i} transform={`translate(${-90 + (i % 4) * 55}, ${30 + Math.floor(i / 4) * 35})`}>
                  <circle
                    r="16"
                    fill="url(#kGrad)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    style={{
                      transform: `scale(${getPulse(t.plentyK + i * 2, 0.15, 0.08)})`,
                      transformOrigin: '0 0',
                    }}
                  />
                  <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="system-ui">
                    K⁺
                  </text>
                </g>
              ))}

              {/* "Looks Normal" label */}
              <text x="0" y="120" textAnchor="middle" fill="#fbbf24" fontSize="20" fontWeight="bold" fontFamily="system-ui" opacity={getSpring(t.looksNormal)} filter="url(#yellowGlowDKA)">
                "LOOKS NORMAL" - 4.8 mEq/L
              </text>

              {/* THE LIE exposed */}
              {showLieExposed && (
                <g opacity={getSpring(t.dadgumLie)} transform={`translate(${getShake(t.dadgumLie, 20, 10).x}, ${getShake(t.dadgumLie, 20, 10).y})`}>
                  <line x1="-140" y1="-40" x2="140" y2="100" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
                  <line x1="140" y1="-40" x2="-140" y2="100" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
                  <text x="0" y="165" textAnchor="middle" fill="#ef4444" fontSize="22" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowDKA)">
                    DADGUM LIE!
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ===== Total Body K+ - BONE DRY ===== */}
          {showLieExposed && (
            <g transform="translate(660, 180)" opacity={getSpring(t.boneDry)}>
              <rect
                x="-100"
                y="-40"
                width="200"
                height="100"
                rx="12"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="8,4"
              />
              <text x="0" y="-10" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="system-ui">
                TOTAL BODY K⁺
              </text>
              <text x="0" y="20" textAnchor="middle" fill="#ef4444" fontSize="28" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowDKA)">
                BONE DRY!
              </text>
              <text x="0" y="48" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13" fontFamily="system-ui">
                (Pissin' it out for DAYS)
              </text>
            </g>
          )}

          {/* ===== PHASE 2: THE TRAP - Insulin ===== */}
          {showTrap && (
            <g transform="translate(460, 380)" opacity={getSpring(t.slamInsulin)}>
              {/* Insulin syringe */}
              <rect
                x="-60"
                y="-25"
                width="120"
                height="50"
                rx="10"
                fill="url(#insulinGrad)"
                stroke="#06B6D4"
                strokeWidth="3"
                filter="url(#glowDKA)"
                style={{
                  transform: showShift ? `scale(${getPulse(t.shoves, 0.4, 0.1)})` : 'scale(1)',
                  transformOrigin: '0 0',
                }}
              />
              <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="system-ui">
                INSULIN
              </text>

              {/* Arrow showing K+ moving INTO cells */}
              {showShift && (
                <g opacity={getProgress(t.shoves, 20)}>
                  <path
                    d="M 0 35 Q 50 80, 100 150"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeLinecap="round"
                    markerEnd="url(#arrowRed)"
                    filter="url(#redGlowDKA)"
                  />
                  <text x="130" y="100" fill="#ef4444" fontSize="18" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowDKA)">
                    SHOVES K⁺
                  </text>
                  <text x="130" y="125" fill="#ef4444" fontSize="18" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowDKA)">
                    INTO CELLS!
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ===== CELL - K+ destination ===== */}
          {showShift && (
            <g transform="translate(580, 560)" opacity={getSpring(t.shoves)}>
              <ellipse
                cx="0"
                cy="0"
                rx="100"
                ry="70"
                fill="url(#cellGrad)"
                stroke="#8B5CF6"
                strokeWidth="4"
              />
              <text x="0" y="-20" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">
                CELL
              </text>
              <text x="0" y="10" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="system-ui">
                (K⁺ floods in)
              </text>

              {/* K+ accumulating inside */}
              {[...Array(6)].map((_, i) => {
                const delay = t.shoves + i * 4;
                return localFrame > delay && (
                  <g key={i} transform={`translate(${-40 + (i % 3) * 40}, ${25 + Math.floor(i / 3) * 25})`} opacity={getSpring(delay)}>
                    <circle r="12" fill="url(#kGrad)" stroke="#D97706" strokeWidth="2"/>
                    <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui">K⁺</text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ===== POTASSIUM PARTICLES IN FLIGHT ===== */}
          {potassiumParticles.map((p) => (
            <g key={p.id} transform={`translate(${p.x}, ${p.y})`} opacity={p.opacity}>
              <circle
                r={14 * p.scale}
                fill="url(#kGrad)"
                stroke="#D97706"
                strokeWidth="2"
              />
              <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui">
                K⁺
              </text>
            </g>
          ))}

          {/* ===== PHASE 3: THE CRASH ===== */}
          {showCrash && (
            <g transform="translate(200, 520)" opacity={getSpring(t.serumDrops)}>
              <rect
                x="-100"
                y="-40"
                width="200"
                height="100"
                rx="12"
                fill="rgba(239, 68, 68, 0.3)"
                stroke="#ef4444"
                strokeWidth="4"
                filter="url(#redGlowDKA)"
              />
              <text x="0" y="-10" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="system-ui">
                SERUM K⁺
              </text>

              {/* Dropping number animation */}
              <text
                x="0"
                y="30"
                textAnchor="middle"
                fill="#ef4444"
                fontSize="32"
                fontWeight="bold"
                fontFamily="system-ui"
                filter="url(#redGlowDKA)"
                style={{
                  transform: `translateY(${showArrest ? 0 : Math.sin(localFrame * 0.3) * 5}px)`,
                }}
              >
                {showArrest ? '1.8 ↓↓' : '2.5 ↓'}
              </text>

              <text x="0" y="75" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="system-ui" opacity={getSpring(t.stone)}>
                DROPS LIKE A STONE!
              </text>
            </g>
          )}

          {/* ===== HEART - ARREST ===== */}
          {showArrest && (
            <g transform="translate(200, 720)" opacity={getSpring(t.heartArrest)}>
              {/* Heart shape - DYING */}
              <path
                d="M 0 -20 C -20 -40, -60 -20, -60 15 C -60 50, 0 80, 0 80 C 0 80, 60 50, 60 15 C 60 -20, 20 -40, 0 -20"
                fill="#1a1a1a"
                stroke="#ef4444"
                strokeWidth={5}
                filter="url(#redGlowDKA)"
                style={{
                  transform: `translate(${getShake(t.heartArrest, 30, 8).x}px, ${getShake(t.heartArrest, 30, 8).y}px)`,
                }}
              />

              {/* Flatline */}
              <line x1="-70" y1="30" x2="70" y2="30" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>

              {/* X marks */}
              <g transform="translate(0, 30)">
                <line x1="-15" y1="-15" x2="15" y2="15" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
                <line x1="15" y1="-15" x2="-15" y2="15" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
              </g>

              <text x="0" y="115" textAnchor="middle" fill="#ef4444" fontSize="26" fontWeight="bold" fontFamily="system-ui" filter="url(#redGlowDKA)">
                CARDIAC ARREST!
              </text>
            </g>
          )}

          {/* ===== PHASE 4: THE SOLUTION ===== */}
          {showSolution && (
            <g transform="translate(580, 750)" opacity={getSpring(t.checkFirst)}>
              <rect
                x="-160"
                y="-90"
                width="320"
                height="240"
                rx="20"
                fill="rgba(34, 197, 94, 0.15)"
                stroke="#22c55e"
                strokeWidth="4"
                filter="url(#greenGlowDKA)"
              />

              <text x="0" y="-55" textAnchor="middle" fill="#22c55e" fontSize="20" fontWeight="bold" fontFamily="system-ui" letterSpacing="2">
                THE RIGHT WAY
              </text>

              {/* Step 1 */}
              <g transform="translate(0, -15)" opacity={getProgress(t.checkFirst, 15)}>
                <circle cx="-120" cy="0" r="20" fill="#22c55e"/>
                <text x="-120" y="7" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">1</text>
                <text x="-85" y="7" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">CHECK K⁺ FIRST</text>
              </g>

              {/* Step 2 */}
              <g transform="translate(0, 40)" opacity={getProgress(t.replaceIfLow, 15)}>
                <circle cx="-120" cy="0" r="20" fill="#22c55e"/>
                <text x="-120" y="7" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">2</text>
                <text x="-85" y="7" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">REPLACE IF LOW</text>
              </g>

              {/* Step 3 */}
              <g transform="translate(0, 95)" opacity={getProgress(t.thenInsulin, 15)}>
                <circle cx="-120" cy="0" r="20" fill="#22c55e"/>
                <text x="-120" y="7" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">3</text>
                <text x="-85" y="7" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">THEN INSULIN</text>
              </g>

              {/* Threshold reminder */}
              <text x="0" y="140" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="14" fontFamily="system-ui" opacity={getProgress(t.thenInsulin + 10, 15)}>
                (Hold insulin if K⁺ &lt; 3.3)
              </text>
            </g>
          )}

          {/* ===== SUCCESS HEART ===== */}
          {showSuccess && (
            <g transform="translate(200, 850)" opacity={getSpring(t.beatin)}>
              <path
                d="M 0 -15 C -15 -30, -45 -15, -45 10 C -45 35, 0 55, 0 55 C 0 55, 45 35, 45 10 C 45 -15, 15 -30, 0 -15"
                fill="url(#heartGradDKA)"
                stroke="#EC4899"
                strokeWidth={4}
                filter="url(#greenGlowDKA)"
                style={{
                  transform: `scale(${getPulse(t.beatin, 0.35, 0.1)})`,
                  transformOrigin: '0 20px',
                }}
              />
              <text x="0" y="85" textAnchor="middle" fill="#22c55e" fontSize="22" fontWeight="bold" fontFamily="system-ui" filter="url(#greenGlowDKA)">
                HEART KEEPS BEATIN'!
              </text>
            </g>
          )}

          {/* ===== CLINICAL PEARL ===== */}
          {showSuccess && (
            <g transform="translate(580, 950)" opacity={getProgress(t.beatin + 15, 20)}>
              <rect x="-140" y="-35" width="280" height="80" rx="16" fill="rgba(147, 51, 234, 0.25)" stroke="#9333ea" strokeWidth="3"/>
              <text x="0" y="-8" textAnchor="middle" fill="#9333ea" fontSize="14" fontWeight="bold" fontFamily="system-ui" letterSpacing="1">
                CLINICAL PEARL
              </text>
              <text x="0" y="20" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="system-ui">
                K⁺ &lt; 3.3 → Replace BEFORE insulin
              </text>
              <text x="0" y="42" textAnchor="middle" fill="#22c55e" fontSize="14" fontFamily="system-ui">
                K⁺ 3.3-5.3 → Replace WITH insulin
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
            gap: 16,
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
            background: 'rgba(0,0,0,0.75)',
            padding: '10px 20px',
            borderRadius: 24,
            border: '1.5px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {[
            { label: 'The Lie', active: showLie && !showTrap, color: '#fbbf24' },
            { label: 'The Trap', active: showTrap && !showSolution, color: '#ef4444' },
            { label: 'The Crash', active: showCrash && !showSolution, color: '#ef4444' },
            { label: 'Solution', active: showSolution, color: '#22c55e' },
          ].map((phase, i) => (
            <span
              key={i}
              style={{
                color: phase.active ? phase.color : 'rgba(255,255,255,0.4)',
                fontWeight: phase.active ? 'bold' : '500',
                textShadow: phase.active ? `0 0 20px ${phase.color}, 0 0 40px ${phase.color}50` : 'none',
                letterSpacing: 0.5,
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

export default DKAPotassiumMechanism;
