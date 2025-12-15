import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

/**
 * BetaBlockerMechanism - THE STAR OF THE SHOW
 *
 * Full-screen animated mechanism diagram showing:
 * - Beta receptor blockade by propranolol
 * - Why atropine fails (different system)
 * - How glucagon bypasses and saves the day
 * - cAMP rockets up, calcium floods in
 * - Heart recovery
 *
 * This is an exemplar component for future mechanism diagrams.
 */
export const BetaBlockerMechanism = ({ startTime, playbackRate = 1.9 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Convert timestamp to frame
  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);

  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  // Don't render before diagram starts
  if (frame < diagramStartFrame) return null;

  // ===== EXACT TIMESTAMPS FROM AUDIO =====
  const timestamps = {
    betaBlockers: 72.877,    // "Beta-blockers"
    choke: 74.108,           // "CHOKE"
    betaReceptors: 76.522,   // "beta receptors"
    atropine: 81.7,          // "atropine works"
    muscarinic: 83.082,      // "muscarinic receptors"
    differentSystem: 85.799, // "COMPLETELY DIFFERENT"
    squat: 88.852,           // "SQUAT"
    glucagon: 95.540,        // "glucagon?"
    bypasses: 98.767,        // "bypasses"
    activates: 101.031,      // "Activates"
    ownReceptor: 102.308,    // "OWN receptor"
    cAMP: 103.005,           // "cAMP"
    rockets: 103.481,        // "ROCKETS"
    calcium: 104.630,        // "calcium"
    floods: 105.257,         // "FLOODS"
    cardiacCells: 106.511,   // "cardiac cells"
    backDoor: 107.173,       // "BACK DOOR"
    heartRate: 110.702,      // "Heart rate climbs"
    perfect: 117.993,        // "PERFECT"
    dose: 119.514,           // "Five to ten milligrams"
    drip: 122.684,           // "start a DRIP"
  };

  // Convert to local frames
  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== ANIMATION HELPERS =====
  const fadeIn = (startFrame, duration = 12) => {
    return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  const scaleIn = (startFrame) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config: { damping: 12, stiffness: 180 },
    });
  };

  const shake = (startFrame, duration = 20, intensity = 4) => {
    if (localFrame < startFrame || localFrame > startFrame + duration) return { x: 0, y: 0 };
    const progress = (localFrame - startFrame) / duration;
    const decay = 1 - progress;
    return {
      x: Math.sin(localFrame * 2.5) * intensity * decay,
      y: Math.cos(localFrame * 2) * intensity * 0.6 * decay,
    };
  };

  const pulse = (startFrame, speed = 0.25, amount = 0.08) => {
    if (localFrame < startFrame) return 1;
    return 1 + Math.sin((localFrame - startFrame) * speed) * amount;
  };

  // ===== PHASE STATES =====
  const showBlock = localFrame >= t.choke;
  const showAtropine = localFrame >= t.atropine;
  const showAtropineFail = localFrame >= t.squat;
  const showGlucagon = localFrame >= t.glucagon;
  const showBypass = localFrame >= t.bypasses;
  const showActivation = localFrame >= t.activates;
  const showCAMP = localFrame >= t.cAMP;
  const showRockets = localFrame >= t.rockets;
  const showCalcium = localFrame >= t.floods;
  const showRecovery = localFrame >= t.heartRate;
  const showPerfect = localFrame >= t.perfect;
  const showDose = localFrame >= t.dose;

  // ===== CALCULATED ANIMATIONS =====
  const blockScale = scaleIn(t.choke);
  const blockShake = shake(t.choke, 25, 8);

  const atropineOpacity = fadeIn(t.atropine, 15);
  const failScale = scaleIn(t.squat);
  const failShake = shake(t.squat, 20, 6);

  const glucagonScale = scaleIn(t.glucagon);
  const bypassOpacity = fadeIn(t.bypasses, 12);
  const activationGlow = showActivation
    ? interpolate(localFrame - t.activates, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  const campScale = showRockets ? pulse(t.rockets, 0.4, 0.18) : 1;
  const campGlow = showRockets
    ? interpolate((localFrame - t.rockets) % 15, [0, 7, 15], [0.4, 1, 0.4])
    : 0;

  // Calcium particles - flowing from cAMP down to heart
  const calciumParticles = [];
  if (showCalcium) {
    const numParticles = Math.min(15, Math.floor((localFrame - t.floods) / 2.5));
    for (let i = 0; i < numParticles; i++) {
      const pFrame = localFrame - t.floods - i * 2.5;
      const progress = Math.min(1, pFrame / 50);
      if (progress > 0 && progress < 1) {
        // Flow diagonally from cAMP (780, 700) to heart (470, 880)
        calciumParticles.push({
          x: interpolate(progress, [0, 1], [760, 500]) + Math.sin(i * 1.2) * 30,
          y: interpolate(progress, [0, 1], [720, 900]),
          opacity: 1 - progress * 0.3,
          scale: 1 - progress * 0.1,
        });
      }
    }
  }

  const heartScale = showRecovery ? pulse(t.heartRate, 0.35, 0.15) : 1;
  const heartGlow = showRecovery
    ? interpolate((localFrame - t.heartRate) % 20, [0, 10, 20], [0.3, 1, 0.3])
    : 0;

  // Container animation
  const containerOpacity = fadeIn(0, 20);
  const containerScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Current phase for title
  let currentPhase = 'BETA RECEPTOR BLOCKADE';
  let phaseColor = '#ef4444';
  if (showAtropine && !showGlucagon) {
    currentPhase = 'WHY ATROPINE FAILS';
    phaseColor = '#fbbf24';
  }
  if (showGlucagon && !showRecovery) {
    currentPhase = 'GLUCAGON BYPASS MECHANISM';
    phaseColor = '#22c55e';
  }
  if (showRecovery) {
    currentPhase = 'CARDIAC RECOVERY';
    phaseColor = '#ec4899';
  }

  // Slide up animation from bottom
  const slideUp = interpolate(localFrame, [0, 25], [150, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 380 + slideUp,
        left: '50%',
        transform: `translateX(-50%) scale(${Math.min(1, containerScale)})`,
        width: 1000,
        height: 1450,
        opacity: containerOpacity,
        zIndex: 100,
      }}
    >
      {/* Background panel with glassmorphism - more transparent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.85) 0%, rgba(12, 8, 20, 0.90) 100%)',
          borderRadius: 28,
          border: `2px solid ${phaseColor}40`,
          boxShadow: `0 0 60px ${phaseColor}30, inset 0 0 80px rgba(0, 0, 0, 0.4)`,
          backdropFilter: 'blur(16px)',
        }}
      />

      {/* Animated border glow - subtle */}
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${phaseColor}50, transparent 50%, ${phaseColor}30)`,
          opacity: 0.5,
          zIndex: -1,
        }}
      />

      {/* Phase Title - with glow animation */}
      <div
        style={{
          position: 'absolute',
          top: 25,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          color: phaseColor,
          textShadow: `0 0 20px ${phaseColor}, 0 0 40px ${phaseColor}60`,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: fadeIn(0, 15),
        }}
      >
        {currentPhase}
      </div>

      {/* Color Legend - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: 25,
          right: 25,
          display: 'flex',
          gap: 18,
          fontSize: 11,
          fontFamily: 'Arial, sans-serif',
          opacity: 0.8,
          background: 'rgba(0,0,0,0.4)',
          padding: '8px 14px',
          borderRadius: 12,
        }}
      >
        <span style={{ color: '#ef4444' }}>● Blocked</span>
        <span style={{ color: '#fbbf24' }}>● Wrong Target</span>
        <span style={{ color: '#22c55e' }}>● Success</span>
      </div>

      {/* SVG Diagram - Expanded to fit all content with proper spacing */}
      <svg
        viewBox="0 0 940 1300"
        style={{
          position: 'absolute',
          top: 75,
          left: 30,
          width: 940,
          height: 1300,
        }}
      >
        {/* Definitions */}
        <defs>
          <linearGradient id="membraneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E56E78" />
            <stop offset="50%" stopColor="#AD253C" />
            <stop offset="100%" stopColor="#E56E78" />
          </linearGradient>
          <linearGradient id="betaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#17BAE2" />
            <stop offset="100%" stopColor="#FF9914" />
          </linearGradient>
          <linearGradient id="glucagonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="campGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E6600" />
            <stop offset="100%" stopColor="#73BABF" />
          </linearGradient>
          <linearGradient id="calciumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06A2B2" />
            <stop offset="100%" stopColor="#0052AF" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="redGlow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feFlood floodColor="#ef4444" floodOpacity="0.7"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="greenGlow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feFlood floodColor="#22c55e" floodOpacity="0.7"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="pinkGlow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feFlood floodColor="#ec4899" floodOpacity="0.7"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ===== CELL MEMBRANE ===== */}
        <rect x="30" y="420" width="880" height="55" rx="27" fill="url(#membraneGrad)" opacity="0.95"/>
        <text x="470" y="455" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Arial" letterSpacing="1">
          CELL MEMBRANE
        </text>

        {/* Zone Labels */}
        <text x="50" y="50" fill="rgba(255,255,255,0.6)" fontSize="14" fontFamily="Arial" fontWeight="bold" letterSpacing="2">
          EXTRACELLULAR
        </text>
        <text x="50" y="510" fill="rgba(255,255,255,0.6)" fontSize="14" fontFamily="Arial" fontWeight="bold" letterSpacing="2">
          INTRACELLULAR
        </text>

        {/* ===== BETA RECEPTOR (LEFT - BLOCKED) ===== */}
        <g transform={`translate(${160 + blockShake.x}, ${280 + blockShake.y})`}>
          {/* Receptor body - larger and cleaner */}
          <rect
            x="-65"
            y="-50"
            width="130"
            height="85"
            rx="14"
            fill="url(#betaGrad)"
            stroke={showBlock ? '#ef4444' : '#17BAE2'}
            strokeWidth={showBlock ? 4 : 2}
            filter={showBlock ? 'url(#redGlow)' : 'none'}
          />
          <text x="0" y="-15" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="Arial">BETA</text>
          <text x="0" y="10" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="Arial">RECEPTOR</text>

          {/* Propranolol block overlay */}
          {showBlock && (
            <g opacity={blockScale}>
              {/* Blocker pill - positioned below receptor */}
              <rect x="-55" y="45" width="110" height="55" rx="10" fill="#1a1a1a" stroke="#ef4444" strokeWidth="3"/>
              <text x="0" y="70" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="Arial">PROPRANOLOL</text>
              <text x="0" y="88" textAnchor="middle" fill="#ef4444" fontSize="11" fontFamily="Arial">(BLOCKER)</text>

              {/* X across receptor */}
              <line x1="-60" y1="-45" x2="60" y2="30" stroke="#ef4444" strokeWidth="7" strokeLinecap="round"/>
              <line x1="60" y1="-45" x2="-60" y2="30" stroke="#ef4444" strokeWidth="7" strokeLinecap="round"/>
            </g>
          )}

          {/* BLOCKED label - positioned above */}
          {showBlock && (
            <text x="0" y="-80" textAnchor="middle" fill="#ef4444" fontSize="22" fontWeight="bold" fontFamily="Arial"
              opacity={blockScale} filter="url(#glow)">
              BLOCKED!
            </text>
          )}

          {/* Blocked signal path indicator - goes down into intracellular */}
          {showBlock && (
            <g opacity={fadeIn(t.choke + 10, 15)}>
              <path
                d="M 0 110 L 0 320"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="10,8"
                opacity="0.9"
              />
              {/* X mark at end of blocked path */}
              <g transform="translate(0, 350)">
                <line x1="-15" y1="-15" x2="15" y2="15" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
                <line x1="15" y1="-15" x2="-15" y2="15" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/>
              </g>
              <text x="0" y="400" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="Arial" filter="url(#redGlow)">
                NO SIGNAL
              </text>
            </g>
          )}
        </g>

        {/* ===== ATROPINE PATHWAY (CENTER - FAILS) ===== */}
        {showAtropine && (
          <g transform={`translate(${470 + failShake.x}, ${280 + failShake.y})`} opacity={atropineOpacity}>
            {/* Atropine molecule - positioned above */}
            <circle cx="0" cy="-90" r="32" fill="#9333ea" stroke="#7c3aed" strokeWidth="4"/>
            <text x="0" y="-88" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="Arial">ATROPINE</text>

            {/* Arrow trying to connect */}
            <line x1="0" y1="-55" x2="0" y2="-15" stroke="#9333ea" strokeWidth="4" strokeDasharray="6,4" opacity="0.9"/>

            {/* Muscarinic receptor - aligned with others */}
            <rect x="-60" y="-10" width="120" height="70" rx="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3"/>
            <text x="0" y="18" textAnchor="middle" fill="#1a1a1a" fontSize="13" fontWeight="bold" fontFamily="Arial">MUSCARINIC</text>
            <text x="0" y="38" textAnchor="middle" fill="#1a1a1a" fontSize="13" fontWeight="bold" fontFamily="Arial">RECEPTOR</text>

            {/* Different system label - below receptor */}
            <text x="0" y="90" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold" fontFamily="Arial">
              DIFFERENT SYSTEM!
            </text>

            {/* BIG FAIL X - covering both */}
            {showAtropineFail && (
              <g opacity={failScale}>
                <line x1="-70" y1="-100" x2="70" y2="70" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
                <line x1="70" y1="-100" x2="-70" y2="70" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
              </g>
            )}
          </g>
        )}

        {/* ===== GLUCAGON PATHWAY (RIGHT - SUCCESS) ===== */}
        {showGlucagon && (
          <g transform="translate(780, 280)" opacity={glucagonScale}>
            {/* Glucagon molecule - above receptor */}
            <circle cx="0" cy="-90" r="35" fill="#22c55e" stroke="#15803d" strokeWidth="5" filter="url(#glow)"/>
            <text x="0" y="-98" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Arial">GLUCA-</text>
            <text x="0" y="-82" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Arial">GON</text>

            {/* Connection line */}
            <line x1="0" y1="-52" x2="0" y2="-15" stroke="#22c55e" strokeWidth="4" opacity="0.8"/>

            {/* Glucagon receptor - aligned with others */}
            <rect
              x="-60"
              y="-10"
              width="120"
              height="70"
              rx="12"
              fill="url(#glucagonGrad)"
              stroke={showActivation ? '#22c55e' : '#16a34a'}
              strokeWidth={3 + activationGlow * 5}
              filter={activationGlow > 0.5 ? 'url(#greenGlow)' : 'none'}
            />
            <text x="0" y="18" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="Arial">GLUCAGON</text>
            <text x="0" y="38" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="Arial">RECEPTOR</text>

            {/* Bypass arrow from blocked receptor */}
            {showBypass && (
              <g opacity={bypassOpacity}>
                <path
                  d="M -320 0 C -280 -80, -120 -110, -20 -100"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="5"
                  strokeDasharray={localFrame >= t.bypasses + 20 ? "none" : "12,6"}
                  filter="url(#glow)"
                />
                <polygon points="-25,-105 0,-90 -10,-85" fill="#22c55e"/>
                <text x="-180" y="-95" fill="#22c55e" fontSize="15" fontWeight="bold" fontFamily="Arial" filter="url(#glow)">
                  BYPASSES BLOCK!
                </text>
              </g>
            )}

            {/* OWN RECEPTOR label */}
            {showActivation && (
              <text x="0" y="90" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold" fontFamily="Arial">
                OWN RECEPTOR ✓
              </text>
            )}
          </g>
        )}

        {/* ===== INTRACELLULAR ZONE ===== */}
        <rect x="40" y="500" width="860" height="750" rx="20" fill="rgba(15, 10, 25, 0.6)" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="2"/>
        <text x="470" y="540" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14" fontFamily="Arial" letterSpacing="1">
          INSIDE CARDIAC CELL
        </text>

        {/* ===== SIGNAL FLOW ARROWS ===== */}
        {/* Glucagon receptor to cAMP - straight vertical line */}
        {showActivation && (
          <g opacity={fadeIn(t.activates, 15)}>
            {/* Straight line down from receptor to cAMP */}
            <line
              x1="780"
              y1="360"
              x2="780"
              y2="600"
              stroke="#22c55e"
              strokeWidth="5"
              strokeDasharray={showCAMP ? "none" : "10,5"}
              filter="url(#glow)"
              opacity={0.9}
            />
            {/* Arrow head pointing down */}
            <polygon points="780,620 765,595 795,595" fill="#22c55e" filter="url(#glow)"/>
          </g>
        )}

        {/* cAMP to Heart flow - straight diagonal */}
        {showCalcium && (
          <g opacity={fadeIn(t.floods, 12)}>
            <line
              x1="720"
              y1="680"
              x2="520"
              y2="850"
              stroke="#ec4899"
              strokeWidth="4"
              strokeDasharray="8,4"
              filter="url(#pinkGlow)"
              opacity={0.8}
            />
            {/* Arrow head pointing to heart */}
            <polygon points="510,860 535,845 525,835" fill="#ec4899" filter="url(#pinkGlow)"/>
          </g>
        )}

        {/* ===== cAMP ROCKETS ===== */}
        {showCAMP && (
          <g transform="translate(780, 660)">
            {/* cAMP pill shape */}
            <rect
              x="-45"
              y="-20"
              width="90"
              height="40"
              rx="20"
              fill="url(#campGrad)"
              stroke="#22c55e"
              strokeWidth={2 + campGlow * 3}
              filter={campGlow > 0.6 ? 'url(#strongGlow)' : 'url(#glow)'}
              transform={`scale(${campScale})`}
              style={{ transformOrigin: '0 0' }}
            />
            <text x="0" y="7" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Arial"
              transform={`scale(${campScale})`} style={{ transformOrigin: '0 0' }}>
              cAMP
            </text>

            {/* Rocket trails */}
            {showRockets && (
              <g>
                {[0, 1, 2, 3, 4].map((i) => {
                  const trailOffset = ((localFrame - t.rockets + i * 5) % 25);
                  const trailOpacity = 1 - trailOffset / 25;
                  return (
                    <ellipse
                      key={i}
                      cx={Math.sin(i * 1.5) * 18}
                      cy={28 + trailOffset}
                      rx="10"
                      ry="5"
                      fill="#22c55e"
                      opacity={trailOpacity * 0.7}
                    />
                  );
                })}
              </g>
            )}

            {/* UP arrows and label */}
            {showRockets && (
              <g>
                <text x="70" y="-5" fill="#22c55e" fontSize="32" fontWeight="bold" fontFamily="Arial" filter="url(#glow)">↑↑</text>
                <text x="70" y="26" fill="#22c55e" fontSize="13" fontWeight="bold" fontFamily="Arial">ROCKETS</text>
              </g>
            )}
          </g>
        )}

        {/* ===== CALCIUM FLOOD ===== */}
        {calciumParticles.map((p, i) => (
          <g key={i} transform={`translate(${p.x}, ${p.y})`} opacity={p.opacity}>
            <rect
              x="-14"
              y="-10"
              width="28"
              height="20"
              rx="5"
              fill="url(#calciumGrad)"
              stroke="#0052AF"
              strokeWidth="2"
              transform={`scale(${p.scale})`}
              style={{ transformOrigin: '0 0' }}
            />
            <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial"
              transform={`scale(${p.scale})`} style={{ transformOrigin: '0 0' }}>
              Ca²⁺
            </text>
          </g>
        ))}

        {showCalcium && (
          <g>
            <text x="620" y="800" fill="#06A2B2" fontSize="16" fontWeight="bold" fontFamily="Arial" filter="url(#glow)">
              CALCIUM FLOODS IN!
            </text>
            <text x="620" y="825" fill="#06A2B2" fontSize="12" fontFamily="Arial">(BACK DOOR)</text>
          </g>
        )}

        {/* ===== HEART RECOVERY ===== */}
        {showRecovery && (
          <g transform="translate(470, 880)">
            {/* Heart shape - pulsing */}
            <path
              d="M 0 -25 C -25 -50, -70 -25, -70 15 C -70 60, 0 95, 0 95 C 0 95, 70 60, 70 15 C 70 -25, 25 -50, 0 -25"
              fill={`rgba(236, 72, 153, ${0.85 + heartGlow * 0.15})`}
              stroke="#ec4899"
              strokeWidth={4 + heartGlow * 4}
              transform={`scale(${heartScale})`}
              style={{ transformOrigin: '0 25px' }}
              filter="url(#pinkGlow)"
            />

            {/* Recovery stats */}
            <text x="0" y="130" textAnchor="middle" fill="#22c55e" fontSize="24" fontWeight="bold" fontFamily="Arial" filter="url(#glow)">
              HEART RECOVERS!
            </text>
            <g transform="translate(0, 170)">
              <text x="-110" y="0" textAnchor="middle" fill="#22c55e" fontSize="18" fontFamily="Arial" fontWeight="bold">HR ↑</text>
              <text x="0" y="0" textAnchor="middle" fill="#22c55e" fontSize="18" fontFamily="Arial" fontWeight="bold">BP ↑</text>
              <text x="110" y="0" textAnchor="middle" fill="#22c55e" fontSize="18" fontFamily="Arial" fontWeight="bold">Glucose ↑</text>
            </g>
          </g>
        )}

        {/* ===== CLINICAL PEARL - DOSING ===== */}
        {showDose && (
          <g transform="translate(470, 1150)" opacity={fadeIn(t.dose, 15)}>
            <rect x="-140" y="-45" width="280" height="115" rx="16" fill="rgba(147, 51, 234, 0.35)" stroke="#9333ea" strokeWidth="2"/>
            <text x="0" y="-15" textAnchor="middle" fill="#9333ea" fontSize="16" fontWeight="bold" fontFamily="Arial">
              CLINICAL PEARL
            </text>
            <text x="0" y="18" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold" fontFamily="Arial">
              5-10 mg IV push
            </text>
            <text x="0" y="50" textAnchor="middle" fill="#22c55e" fontSize="16" fontFamily="Arial">
              then start a DRIP
            </text>
          </g>
        )}
      </svg>

      {/* Phase indicator - sleek progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 20,
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          background: 'rgba(0,0,0,0.6)',
          padding: '14px 28px',
          borderRadius: 25,
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {[
          { label: 'Beta Blocked', active: showBlock && !showAtropine, color: '#ef4444' },
          { label: 'Atropine Fails', active: showAtropine && !showGlucagon, color: '#fbbf24' },
          { label: 'Glucagon Bypass', active: showGlucagon && !showRecovery, color: '#22c55e' },
          { label: 'Recovery', active: showRecovery, color: '#ec4899' },
        ].map((phase, i) => (
          <span
            key={i}
            style={{
              color: phase.active ? phase.color : 'rgba(255,255,255,0.4)',
              fontWeight: phase.active ? 'bold' : 'normal',
              textShadow: phase.active ? `0 0 20px ${phase.color}` : 'none',
              letterSpacing: 0.8,
              transition: 'all 0.3s ease',
            }}
          >
            {phase.active ? '●' : '○'} {phase.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BetaBlockerMechanism;
