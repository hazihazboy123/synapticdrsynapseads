import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * AcetaminophenMechanismEnhanced - FULLY REBUILT v2
 *
 * RULES:
 * - NO element appears before it's spoken in the audio
 * - EVERY element has an entrance animation tied to its timestamp
 * - All components scaled up for visibility
 */

// ===== ANIMATION HELPERS =====
const getSpring = (localFrame, triggerFrame, fps, config = { damping: 12, stiffness: 200 }) => {
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

const getShake = (localFrame, startFrame, duration = 25, intensity = 8) => {
  if (localFrame < startFrame || localFrame > startFrame + duration) return { x: 0, y: 0 };
  const decay = 1 - (localFrame - startFrame) / duration;
  return {
    x: Math.sin(localFrame * 2.5) * intensity * decay,
    y: Math.cos(localFrame * 2) * intensity * 0.5 * decay,
  };
};

// ===== FLOWING PARTICLE COMPONENT =====
const FlowingParticle = ({ startX, endX, y, frame, delay, color, size = 14, cycleLength = 80 }) => {
  if (frame < delay) return null;

  const progress = ((frame - delay) % cycleLength) / cycleLength;
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wobble = Math.sin(progress * Math.PI * 4) * 8;

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + wobble,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 ${size}px ${color}`,
      opacity,
      pointerEvents: 'none',
    }}/>
  );
};

// ===== ATTACK PARTICLE COMPONENT - For NAPQI attacking liver =====
const AttackParticle = ({ targetX, targetY, frame, delay, startAngle = 0, color = '#ef4444', size = 12 }) => {
  if (frame < delay) return null;

  const attackDuration = 35;
  const progress = Math.min(1, (frame - delay) / attackDuration);

  // Start from edge of screen, spiral toward target
  const radius = interpolate(progress, [0, 1], [300, 0], { extrapolateRight: 'clamp' });
  const angle = startAngle + progress * Math.PI * 1.5;
  const x = targetX + Math.cos(angle) * radius;
  const y = targetY + Math.sin(angle) * radius;

  // Opacity fades out at end
  const opacity = progress < 0.9 ? 1 : interpolate(progress, [0.9, 1], [1, 0], { extrapolateRight: 'clamp' });

  // Scale grows as it gets closer
  const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1, 1.3], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      left: x - size/2,
      top: y - size/2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      boxShadow: `0 0 ${size * 1.5}px ${color}`,
      opacity,
      transform: `scale(${scale})`,
      pointerEvents: 'none',
    }}/>
  );
};

// ===== BURST PARTICLE - For explosions/impacts =====
const BurstParticle = ({ x, y, frame, delay, angle, color = '#ef4444', size = 8 }) => {
  if (frame < delay) return null;

  const duration = 25;
  const progress = Math.min(1, (frame - delay) / duration);

  const distance = interpolate(progress, [0, 1], [0, 80]);
  const px = x + Math.cos(angle) * distance;
  const py = y + Math.sin(angle) * distance;
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0], { extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 0.5, 1], [1.5, 1, 0.3], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      left: px - size/2,
      top: py - size/2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 ${size}px ${color}`,
      opacity,
      transform: `scale(${scale})`,
      pointerEvents: 'none',
    }}/>
  );
};

// ===== TOXIC MOLECULE COMPONENT =====
const ToxicMolecule = ({ x, y, size = 65, frame, delay = 0, scale = 1 }) => {
  const floatY = Math.sin((frame + delay) * 0.12) * 6;
  const floatX = Math.cos((frame + delay) * 0.08) * 3;
  const pulse = 1 + Math.sin((frame + delay) * 0.2) * 0.08;

  return (
    <div style={{
      position: 'absolute',
      left: x + floatX,
      top: y + floatY,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #ef4444 0%, #991b1b 100%)',
      boxShadow: `0 0 ${18 * pulse}px rgba(239, 68, 68, 0.6), 0 0 ${35 * pulse}px rgba(239, 68, 68, 0.3)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${pulse * scale})`,
      border: '3px solid rgba(252, 165, 165, 0.6)',
    }}>
      <span style={{
        fontSize: size * 0.28,
        fontWeight: '800',
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
      }}>NAPQI</span>
    </div>
  );
};

// ===== SVG ICONS =====
const LiverIcon = ({ size = 160, healthy = true, damage = 0, frame = 0 }) => {
  const breathe = healthy ? 1 + Math.sin(frame * 0.08) * 0.04 : 1 - damage * 0.03;

  // Healthy = purple, Damaged = red
  const baseColor = damage > 0 ? '#ef4444' : '#a855f7';
  const glowColor = damage > 0 ? '#ef4444' : '#a855f7';

  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${breathe})`,
    }}>
      <svg width={size * 0.9} height={size * 0.9} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="liverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={damage > 0 ? '#f87171' : '#c084fc'} />
            <stop offset="100%" stopColor={damage > 0 ? '#dc2626' : '#7c3aed'} />
          </linearGradient>
          <filter id="liverGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor={glowColor} floodOpacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Solid liver shape - anatomically styled */}
        <g filter="url(#liverGlow)">
          {/* Main liver body */}
          <path
            d="M52 18 C58 22, 60 32, 58 42 C56 52, 48 58, 38 58 C28 58, 18 54, 14 44 C10 34, 12 24, 20 18 C28 12, 42 14, 52 18 Z"
            fill="url(#liverGrad)"
            stroke={damage > 0 ? '#fca5a5' : '#e9d5ff'}
            strokeWidth="2"
          />
          {/* Left lobe detail */}
          <path
            d="M20 18 C16 22, 12 30, 14 38"
            stroke={damage > 0 ? '#fca5a5' : '#e9d5ff'}
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          {/* Divider line */}
          <path
            d="M36 16 C34 26, 32 38, 30 50"
            stroke={damage > 0 ? '#fca5a5' : '#e9d5ff'}
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
        </g>

        {/* Damage spots when injured */}
        {damage > 0 && (
          <>
            <circle cx="42" cy="34" r={6 * damage} fill="#ef4444" opacity={0.7 * damage}/>
            <circle cx="28" cy="40" r={5 * damage} fill="#ef4444" opacity={0.6 * damage}/>
            <circle cx="38" cy="48" r={4 * damage} fill="#ef4444" opacity={0.5 * damage}/>
          </>
        )}
      </svg>
    </div>
  );
};

const SkullIcon = ({ size = 60, color = '#ef4444', pulse = false, frame = 0 }) => {
  const scale = pulse ? 1 + Math.sin(frame * 0.2) * 0.08 : 1;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: `scale(${scale})` }}>
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 3.313 1.607 6.248 4.09 8.073V22a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-1.927C20.393 18.248 22 15.313 22 12c0-5.523-4.477-10-10-10z"
        fill={color}
        opacity="0.95"
      />
      <circle cx="8.5" cy="11" r="2" fill="#0a0a0a" />
      <circle cx="15.5" cy="11" r="2" fill="#0a0a0a" />
      <path d="M9 16h6M10 18h1M13 18h1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

const ClockIcon = ({ size = 55, color = '#fbbf24', frame = 0 }) => {
  const handRotation = (frame * 3) % 360;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5"/>
      <line
        x1="12" y1="12" x2="12" y2="7"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
        transform={`rotate(${handRotation}, 12, 12)`}
      />
      <line x1="12" y1="12" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

const SyringeIcon = ({ size = 50, color = '#22c55e', animate = false, frame = 0 }) => {
  const plungerY = animate ? Math.sin(frame * 0.1) * 1.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d={`M18.5 ${2.5 + plungerY}l3 3M19 ${6 + plungerY}l-2-2M14 4l6 6-10 10H6v-4L16 6l-2-2z`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 10l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// Simple shield for glutathione defense (single, no duplicates)
const GlutathioneShield = ({ size = 140, frame }) => {
  const pulse = 1 + Math.sin(frame * 0.15) * 0.05;

  return (
    <div style={{ transform: `scale(${pulse})` }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          fill="#22c55e"
          opacity={0.3}
        />
        <path
          d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="#22c55e"
          strokeWidth="2"
          fill="none"
        />
        <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

// Depleted shield indicator (no checkmark, just X)
const DepletedShieldGrid = ({ depleted, frame }) => {
  const shields = [0, 1, 2, 3];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {shields.map((i) => {
        const isDepleted = i >= (4 - depleted);
        const floatY = Math.sin((frame + i * 15) * 0.1) * 3;
        const color = isDepleted ? '#6b7280' : '#22c55e';

        return (
          <div key={i} style={{ transform: `translateY(${floatY}px)`, opacity: isDepleted ? 0.4 : 1 }}>
            <svg width={55} height={55} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                fill={color}
                opacity={0.25}
              />
              <path
                d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                stroke={color}
                strokeWidth="2"
                fill="none"
              />
              {isDepleted ? (
                <>
                  <line x1="8" y1="8" x2="16" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="8" x2="8" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const AcetaminophenMechanismEnhanced = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== EXACT TIMESTAMPS FROM AUDIO JSON =====
  const timestamps = {
    // Phase 1: Normal Metabolism
    silentKiller: 111.909,
    normallyTylenol: 115.659,
    liverChamp: 118.922,
    glucuronidated: 121.824,

    // Phase 2: NAPQI Creation
    fivePercent: 126.747,
    cyp450: 128.048,
    toxic: 129.986,
    napqi: 131.728,

    // Phase 3: Glutathione Defense
    glutathione: 140.493,
    bodyguard: 143.071,
    tackles: 145.103,

    // Phase 4: Overdose Chaos
    wholeBottle: 151.662,
    overwhelmed: 155.296,
    napqiPiling: 163.516,
    depleted: 166.163,
    exhausted: 166.987,
    gone: 168.067,
    destroys: 173.883,
    zone3: 175.694,
    centrilobular: 177.866,

    // Phase 5: Silent Killer
    terrifyingPart: 181.209,
    twentyFourHours: 185.504,
    patientFeelsFine: 189.405,
    liverDestroyed: 195.210,
    hourSeventyTwo: 198.972,
    dead: 204.452,

    // Phase 6: NAC Rescue
    enterNac: 206.553,
    nacShort: 209.223,
    antidote: 210.547,
    cysteine: 212.671,
    rebuild: 215.933,
    online: 219.591,
    neutralizing: 221.251,
    survives: 225.872,

    // Phase 7: Timing
    timing: 227.033,
    everything: 227.822,
    eightHours: 229.413,
    hundredPercent: 232.025,
    eightToTwentyFour: 237.494,
    afterTwentyFour: 241.383,

    // Phase 8: Clinical Pearl
    rumackMatthew: 250.787,
    loadingDose: 265.950,
    savePatient: 280.532,
  };

  const t = {};
  Object.entries(timestamps).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== DETERMINE CURRENT PHASE =====
  const getPhase = () => {
    if (localFrame < t.fivePercent - 8) return 'normal';
    if (localFrame < t.glutathione - 8) return 'napqi-creation';
    if (localFrame < t.wholeBottle - 8) return 'glutathione-defense';
    if (localFrame < t.terrifyingPart - 8) return 'overdose';
    if (localFrame < t.enterNac - 8) return 'silent-killer';
    if (localFrame < t.timing - 8) return 'nac-rescue';
    if (localFrame < t.rumackMatthew - 8) return 'timing';
    return 'pearl';
  };

  const phase = getPhase();

  const containerOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== PHASE 1: NORMAL METABOLISM =====
  const renderNormal = () => {
    if (phase !== 'normal') return null;
    const opacity = getProgress(localFrame, 0, 20) * (localFrame > t.fivePercent - 20 ? 1 - getProgress(localFrame, t.fivePercent - 20, 15) : 1);
    const scale = getSpring(localFrame, 5, fps, { damping: 14, stiffness: 120 });

    // Everything animates in based on when it's spoken
    // NOTE: t[key] values are ALREADY relative to diagramStartFrame - don't subtract again!
    const liverChampOpacity = getProgress(localFrame, t.liverChamp, 15);
    const tylenolOpacity = getProgress(localFrame, t.normallyTylenol, 15);
    const glucOpacity = getProgress(localFrame, t.glucuronidated, 15);

    return (
      <div style={{
        opacity,
        transform: `scale(${Math.min(1, scale)})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
      }}>
        {/* Title only appears when "CHAMP" is said */}
        <div style={{
          fontSize: 42,
          fontWeight: '700',
          color: '#22c55e',
          textShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
          marginBottom: 30,
          opacity: liverChampOpacity,
          transform: `scale(${getSpring(localFrame, t.liverChamp, fps)})`,
        }}>
          Liver handles it like a CHAMP!
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 50, marginBottom: 30, opacity: tylenolOpacity }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${getPulse(localFrame, 10, 0.08, 0.04)})`,
          }}>
            <div style={{
              width: 90,
              height: 40,
              borderRadius: 20,
              background: 'linear-gradient(90deg, #f59e0b 0%, #f59e0b 50%, #fbbf24 50%, #fbbf24 100%)',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
              border: '3px solid rgba(255,255,255,0.3)',
            }}/>
            <span style={{ marginTop: 12, fontSize: 26, fontWeight: '700', color: '#f59e0b' }}>TYLENOL</span>
          </div>

          {/* Arrow only appears with Tylenol */}
          <div style={{ fontSize: 55, color: 'rgba(255,255,255,0.4)' }}>→</div>

          <LiverIcon size={160} healthy={true} frame={localFrame} />
        </div>

        {/* Glucuronidation box only when spoken */}
        <div style={{
          padding: '28px 55px',
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: 20,
          border: '4px solid rgba(34, 197, 94, 0.5)',
          boxShadow: '0 0 45px rgba(34, 197, 94, 0.2)',
          opacity: glucOpacity,
          transform: `scale(${getSpring(localFrame, t.glucuronidated, fps)})`,
        }}>
          <div style={{ fontSize: 30, color: '#22c55e', fontWeight: '600', textAlign: 'center' }}>
            95% → Glucuronidation → <span style={{ color: '#86efac' }}>Safely excreted</span>
          </div>
        </div>

        {/* Particles only after glucuronidation is mentioned */}
        {localFrame > t.glucuronidated && Array.from({ length: 5 }).map((_, i) => (
          <FlowingParticle
            key={i}
            startX={180}
            endX={580}
            y={300 + (i % 3) * 25}
            frame={localFrame}
            delay={t.glucuronidated + i * 12}
            color="#22c55e"
            size={11}
          />
        ))}
      </div>
    );
  };

  // ===== PHASE 2: NAPQI CREATION =====
  const renderNapqiCreation = () => {
    if (phase !== 'napqi-creation') return null;
    const opacity = getProgress(localFrame, t.fivePercent - 8, 20) * (localFrame > t.glutathione - 20 ? 1 - getProgress(localFrame, t.glutathione - 20, 15) : 1);

    // Each element appears when spoken
    const fivePercentOpacity = getProgress(localFrame, t.fivePercent, 12);
    const cyp450Opacity = getProgress(localFrame, t.cyp450, 12);
    const napqiOpacity = getProgress(localFrame, t.napqi, 12);
    const toxicOpacity = getProgress(localFrame, t.toxic, 12);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* 5% text */}
        <div style={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: 25,
          opacity: fivePercentOpacity,
          transform: `scale(${getSpring(localFrame, t.fivePercent, fps)})`,
        }}>
          But <span style={{ color: '#fbbf24', fontWeight: '700' }}>5%</span> goes through...
        </div>

        {/* CYP450 - appears when spoken */}
        <div style={{
          padding: '22px 50px',
          background: 'linear-gradient(145deg, #3b82f6 0%, #1e40af 100%)',
          borderRadius: 16,
          border: '4px solid rgba(96, 165, 250, 0.6)',
          boxShadow: '0 0 55px rgba(59, 130, 246, 0.5)',
          transform: `scale(${cyp450Opacity * getPulse(localFrame, t.cyp450, 0.1, 0.04)})`,
          opacity: cyp450Opacity,
        }}>
          <span style={{ fontSize: 38, fontWeight: '700', color: '#fff', letterSpacing: 2 }}>CYP450</span>
        </div>

        {/* Arrow appears after CYP450 */}
        <div style={{
          fontSize: 55,
          color: 'rgba(255,255,255,0.4)',
          margin: '20px 0',
          opacity: cyp450Opacity,
        }}>↓</div>

        {/* NAPQI ball - appears when "NAPQI" is spoken */}
        <div style={{
          width: 230,
          height: 230,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #ef4444 0%, #991b1b 70%, #7f1d1d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 ${65 + Math.sin(localFrame * 0.2) * 20}px rgba(239, 68, 68, 0.6), 0 0 130px rgba(239, 68, 68, 0.3)`,
          border: '5px solid rgba(252, 165, 165, 0.6)',
          transform: `scale(${getSpring(localFrame, t.napqi, fps, { damping: 10, stiffness: 180 }) * getPulse(localFrame, t.napqi, 0.12, 0.07)})`,
          opacity: napqiOpacity,
        }}>
          <span style={{ fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: 2, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>NAPQI</span>
          <SkullIcon size={60} color="#fff" pulse={true} frame={localFrame} />
        </div>

        {/* TOXIC label - appears when "toxic" is spoken */}
        <div style={{
          marginTop: 30,
          fontSize: 38,
          fontWeight: '700',
          color: '#ef4444',
          textShadow: '0 0 45px rgba(239, 68, 68, 0.5)',
          opacity: toxicOpacity,
          transform: `scale(${getSpring(localFrame, t.toxic, fps)})`,
        }}>
          TOXIC Metabolite
        </div>

        {/* Toxic particles emanating from NAPQI */}
        {localFrame > t.napqi && Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 + localFrame * 0.03;
          const radius = 140 + Math.sin(localFrame * 0.08 + i) * 25;
          const px = 410 + Math.cos(angle) * radius;
          const py = 350 + Math.sin(angle) * radius;
          const pulse = 0.4 + Math.sin(localFrame * 0.12 + i * 0.4) * 0.3;

          return (
            <div
              key={`toxic-${i}`}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
                opacity: pulse * napqiOpacity,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
    );
  };

  // ===== PHASE 3: GLUTATHIONE DEFENSE =====
  const renderGlutathioneDefense = () => {
    if (phase !== 'glutathione-defense') return null;
    const opacity = getProgress(localFrame, t.glutathione - 8, 20) * (localFrame > t.wholeBottle - 20 ? 1 - getProgress(localFrame, t.wholeBottle - 20, 15) : 1);

    const glutOpacity = getProgress(localFrame, t.glutathione, 15);
    const bodyguardOpacity = getProgress(localFrame, t.bodyguard, 12);
    const tacklesOpacity = getProgress(localFrame, t.tackles, 12);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 34,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: 30,
          opacity: glutOpacity,
        }}>
          Normally? <span style={{ color: '#22c55e', fontWeight: '700' }}>No problem!</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 45, opacity: glutOpacity }}>
          {/* Small NAPQI */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ef4444 0%, #991b1b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
          }}>
            <span style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>NAPQI</span>
          </div>

          <div style={{ fontSize: 60, color: '#22c55e', fontWeight: '300' }}>+</div>

          {/* Single Glutathione shield - NOT multiple */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${getSpring(localFrame, t.glutathione, fps, { damping: 12, stiffness: 150 })})`,
          }}>
            <GlutathioneShield size={140} frame={localFrame} />
            <span style={{ fontSize: 28, fontWeight: '700', color: '#22c55e', marginTop: 12 }}>GLUTATHIONE</span>
          </div>
        </div>

        {/* Arrow - only after glutathione appears */}
        <div style={{
          fontSize: 55,
          color: 'rgba(255,255,255,0.4)',
          margin: '25px 0',
          opacity: tacklesOpacity,
        }}>↓</div>

        {/* NEUTRALIZED - appears when "tackles" is spoken */}
        <div style={{
          padding: '32px 65px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: 20,
          border: '5px solid #22c55e',
          boxShadow: '0 0 65px rgba(34, 197, 94, 0.4)',
          opacity: tacklesOpacity,
          transform: `scale(${getSpring(localFrame, t.tackles, fps)})`,
        }}>
          <span style={{ fontSize: 40, fontWeight: '700', color: '#22c55e' }}>NEUTRALIZED!</span>
        </div>

        {/* Bodyguard text */}
        <div style={{
          marginTop: 25,
          fontSize: 28,
          color: '#86efac',
          opacity: bodyguardOpacity,
          transform: `scale(${getSpring(localFrame, t.bodyguard, fps)})`,
        }}>
          Glutathione = Your liver's <span style={{ fontWeight: '700' }}>BODYGUARD</span>
        </div>
      </div>
    );
  };

  // ===== PHASE 4: OVERDOSE =====
  const renderOverdose = () => {
    if (phase !== 'overdose') return null;
    const opacity = getProgress(localFrame, t.wholeBottle - 8, 20) * (localFrame > t.terrifyingPart - 20 ? 1 - getProgress(localFrame, t.terrifyingPart - 20, 15) : 1);
    const shake = getShake(localFrame, t.overwhelmed, 30, 10);

    // Calculate depletion (0-4 shields remaining)
    const depletionProgress = interpolate(localFrame, [t.depleted, t.gone], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const shieldsRemaining = Math.max(0, 4 - Math.floor(depletionProgress));
    const damage = interpolate(localFrame, [t.destroys - 15, t.destroys + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const wholeBottleOpacity = getProgress(localFrame, t.wholeBottle, 12);
    const napqiPilingOpacity = getProgress(localFrame, t.napqiPiling, 15);
    const depletedOpacity = getProgress(localFrame, t.depleted, 12);
    const destroysOpacity = getProgress(localFrame, t.destroys, 15);
    const zone3Opacity = getProgress(localFrame, t.zone3, 12);

    return (
      <div style={{
        opacity,
        transform: `translate(${shake.x}px, ${shake.y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* WHOLE BOTTLE title */}
        <div style={{
          fontSize: 46,
          fontWeight: '700',
          color: '#ef4444',
          textShadow: '0 0 65px rgba(239, 68, 68, 0.6)',
          marginBottom: 25,
          transform: `scale(${getPulse(localFrame, t.wholeBottle, 0.14, 0.06)})`,
          opacity: wholeBottleOpacity,
        }}>
          WHOLE BOTTLE = DISASTER
        </div>

        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginBottom: 25 }}>
          {/* NAPQI molecules - only appear when "piling" is said */}
          <div style={{ position: 'relative', width: 220, height: 220, opacity: napqiPilingOpacity }}>
            {Array.from({ length: Math.min(6, Math.floor((localFrame - t.napqiPiling + 10) / 10) + 1) }).map((_, i) => {
              if (localFrame < t.napqiPiling) return null;
              const angle = (i / 6) * Math.PI * 2 + localFrame * 0.015;
              const r = 45 + (i % 3) * 25;
              const x = 110 + Math.cos(angle) * r - 30;
              const y = 110 + Math.sin(angle) * r - 30;

              return (
                <ToxicMolecule
                  key={i}
                  x={x}
                  y={y}
                  size={58}
                  frame={localFrame}
                  delay={i * 15}
                  scale={getSpring(localFrame, t.napqiPiling + i * 5, fps)}
                />
              );
            })}
            <div style={{
              position: 'absolute',
              bottom: -35,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 22,
              color: '#ef4444',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
              NAPQI PILING UP
            </div>
          </div>

          {/* Glutathione depleting - appears when "depleted" is said */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: depletedOpacity }}>
            <DepletedShieldGrid depleted={shieldsRemaining} frame={localFrame} />
            <span style={{
              marginTop: 20,
              fontSize: 22,
              color: localFrame >= t.gone ? '#ef4444' : '#fbbf24',
              fontWeight: '700',
            }}>
              {localFrame >= t.gone ? 'GONE!' : localFrame >= t.exhausted ? 'EXHAUSTED!' : 'DEPLETED!'}
            </span>
          </div>
        </div>

        {/* Liver damage - appears when "destroys" is said */}
        {localFrame >= t.destroys - 15 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: destroysOpacity,
            position: 'relative',
          }}>
            <LiverIcon size={180} healthy={false} damage={damage} frame={localFrame} />

            {/* Attack particles spiraling into liver */}
            {Array.from({ length: 8 }).map((_, i) => (
              <AttackParticle
                key={`attack-${i}`}
                targetX={90}
                targetY={90}
                frame={localFrame}
                delay={t.destroys + i * 5}
                startAngle={(i / 8) * Math.PI * 2}
                color="#ef4444"
                size={14}
              />
            ))}

            {/* Burst particles on impact */}
            {localFrame > t.destroys + 30 && Array.from({ length: 12 }).map((_, i) => (
              <BurstParticle
                key={`burst-${i}`}
                x={90}
                y={90}
                frame={localFrame}
                delay={t.destroys + 30 + Math.floor(i / 4) * 8}
                angle={(i / 12) * Math.PI * 2}
                color="#ef4444"
                size={6}
              />
            ))}

            {/* Zone 3 box */}
            <div style={{
              marginTop: 25,
              padding: '22px 45px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 16,
              border: '4px solid #ef4444',
              opacity: zone3Opacity,
              transform: `scale(${getSpring(localFrame, t.zone3, fps)})`,
            }}>
              <div style={{ fontSize: 30, color: '#ef4444', fontWeight: '700', textAlign: 'center' }}>
                Zone 3 Necrosis
              </div>
              <div style={{
                fontSize: 22,
                color: '#fca5a5',
                marginTop: 8,
                textAlign: 'center',
                opacity: getProgress(localFrame, t.centrilobular, 10),
              }}>
                CENTRILOBULAR Pattern
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== PHASE 5: SILENT KILLER =====
  const renderSilentKiller = () => {
    if (phase !== 'silent-killer') return null;
    const opacity = getProgress(localFrame, t.terrifyingPart - 8, 20) * (localFrame > t.enterNac - 20 ? 1 - getProgress(localFrame, t.enterNac - 20, 15) : 1);

    const titleOpacity = getProgress(localFrame, t.terrifyingPart, 12);
    const twentyFourOpacity = getProgress(localFrame, t.twentyFourHours, 15);
    const fineOpacity = getProgress(localFrame, t.patientFeelsFine, 12);
    const destroyedOpacity = getProgress(localFrame, t.liverDestroyed, 15);
    const hourSeventyTwoOpacity = getProgress(localFrame, t.hourSeventyTwo, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 40,
          fontWeight: '700',
          color: '#fbbf24',
          textShadow: '0 0 45px rgba(251, 191, 36, 0.5)',
          marginBottom: 35,
          opacity: titleOpacity,
          transform: `scale(${getSpring(localFrame, t.terrifyingPart, fps)})`,
        }}>
          THE TERRIFYING PART:
        </div>

        <div style={{ display: 'flex', gap: 35, alignItems: 'stretch' }}>
          {/* First 24 hours box - appears when "24 hours" is spoken */}
          <div style={{
            padding: '30px 45px',
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 20,
            border: '4px solid #22c55e',
            textAlign: 'center',
            flex: 1,
            opacity: twentyFourOpacity,
            transform: `scale(${getSpring(localFrame, t.twentyFourHours, fps)})`,
          }}>
            <div style={{ fontSize: 26, color: '#22c55e', fontWeight: '600' }}>First 24 hours:</div>
            {/* FINE only when spoken */}
            <div style={{
              fontSize: 40,
              color: '#22c55e',
              fontWeight: '700',
              marginTop: 15,
              opacity: fineOpacity,
              transform: `scale(${getSpring(localFrame, t.patientFeelsFine, fps)})`,
            }}>
              Patient feels FINE
            </div>
          </div>

          {/* BUT - appears after "fine" */}
          <div style={{
            fontSize: 50,
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            opacity: fineOpacity,
          }}>BUT</div>

          {/* Meanwhile box - appears when "destroyed" is spoken */}
          <div style={{
            padding: '30px 45px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 20,
            border: '4px solid #ef4444',
            textAlign: 'center',
            flex: 1,
            opacity: destroyedOpacity,
            transform: `scale(${getSpring(localFrame, t.liverDestroyed, fps)})`,
          }}>
            <div style={{ fontSize: 26, color: '#ef4444', fontWeight: '600' }}>Meanwhile:</div>
            <div style={{ fontSize: 32, color: '#ef4444', fontWeight: '700', marginTop: 15 }}>Liver is being</div>
            <div style={{
              fontSize: 42,
              color: '#ef4444',
              fontWeight: '800',
              transform: `scale(${getPulse(localFrame, t.liverDestroyed, 0.12, 0.05)})`,
            }}>DESTROYED</div>
          </div>
        </div>

        {/* Hour 72 box */}
        <div style={{
          marginTop: 35,
          padding: '26px 55px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 18,
          border: '4px solid #ef4444',
          boxShadow: '0 0 45px rgba(239, 68, 68, 0.3)',
          opacity: hourSeventyTwoOpacity,
          transform: `scale(${getSpring(localFrame, t.hourSeventyTwo, fps)})`,
        }}>
          <div style={{ fontSize: 26, color: '#fca5a5', textAlign: 'center' }}>
            By hour 72: <span style={{ color: '#ef4444', fontWeight: '700' }}>Fulminant failure → DEATH</span>
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 6: NAC RESCUE =====
  const renderNacRescue = () => {
    if (phase !== 'nac-rescue') return null;
    const opacity = getProgress(localFrame, t.enterNac - 8, 20) * (localFrame > t.timing - 20 ? 1 - getProgress(localFrame, t.timing - 20, 15) : 1);

    const nacOpacity = getProgress(localFrame, t.enterNac, 12);
    const antidoteOpacity = getProgress(localFrame, t.antidote, 12);
    const cysteineOpacity = getProgress(localFrame, t.cysteine, 12);
    const rebuildOpacity = getProgress(localFrame, t.rebuild, 12);
    const survivesOpacity = getProgress(localFrame, t.survives, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
      }}>
        {/* NAC ball */}
        <div style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #22c55e 0%, #15803d 70%, #14532d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 ${85 + Math.sin(localFrame * 0.15) * 20}px rgba(34, 197, 94, 0.6), 0 0 160px rgba(34, 197, 94, 0.3)`,
          border: '5px solid rgba(134, 239, 172, 0.7)',
          transform: `scale(${getSpring(localFrame, t.enterNac, fps, { damping: 10, stiffness: 180 }) * getPulse(localFrame, t.enterNac, 0.1, 0.05)})`,
          opacity: nacOpacity,
        }}>
          <span style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>N-ACETYL-</span>
          <span style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>CYSTEINE</span>
          <span style={{ fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 8 }}>(NAC)</span>
        </div>

        {/* THE ANTIDOTE! */}
        <div style={{
          marginTop: 28,
          fontSize: 44,
          fontWeight: '700',
          color: '#22c55e',
          textShadow: '0 0 55px rgba(34, 197, 94, 0.6)',
          opacity: antidoteOpacity,
          transform: `scale(${getSpring(localFrame, t.antidote, fps)})`,
        }}>
          THE ANTIDOTE!
        </div>

        {/* Flow chain - each element appears when spoken */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* Cysteine */}
          <div style={{
            fontSize: 28,
            color: '#86efac',
            opacity: cysteineOpacity,
            transform: `scale(${getSpring(localFrame, t.cysteine, fps)})`,
          }}>
            NAC provides <span style={{ fontWeight: '700', color: '#22c55e' }}>CYSTEINE</span>
          </div>

          {/* Arrow - only after cysteine */}
          <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.4)', opacity: cysteineOpacity }}>↓</div>

          {/* Rebuild */}
          <div style={{
            fontSize: 28,
            color: '#22c55e',
            fontWeight: '600',
            opacity: rebuildOpacity,
            transform: `scale(${getSpring(localFrame, t.rebuild, fps)})`,
          }}>
            REBUILDS Glutathione
          </div>

          {/* Arrow - only after rebuild */}
          <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.4)', opacity: rebuildOpacity }}>↓</div>

          {/* LIVER SURVIVES! */}
          <div style={{
            padding: '24px 55px',
            background: 'rgba(34, 197, 94, 0.25)',
            borderRadius: 18,
            border: '4px solid #22c55e',
            boxShadow: '0 0 55px rgba(34, 197, 94, 0.4)',
            opacity: survivesOpacity,
            transform: `scale(${getSpring(localFrame, t.survives, fps)})`,
          }}>
            <span style={{ fontSize: 34, fontWeight: '700', color: '#22c55e' }}>LIVER SURVIVES!</span>
          </div>
        </div>

        {/* Flowing particles only after rebuild - MORE of them */}
        {localFrame > t.rebuild && Array.from({ length: 10 }).map((_, i) => (
          <FlowingParticle
            key={i}
            startX={80 + (i % 2) * 60}
            endX={650 + (i % 2) * 60}
            y={180 + (i % 4) * 40}
            frame={localFrame}
            delay={t.rebuild + i * 6}
            color="#22c55e"
            size={12 + (i % 3) * 2}
            cycleLength={70}
          />
        ))}

        {/* Healing burst particles around NAC when it's working */}
        {localFrame > t.online && Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2 + localFrame * 0.02;
          const radius = 140 + Math.sin(localFrame * 0.1 + i) * 15;
          const px = 410 + Math.cos(angle) * radius;
          const py = 140 + Math.sin(angle) * radius * 0.6;
          const pulse = 0.6 + Math.sin(localFrame * 0.15 + i * 0.5) * 0.4;

          return (
            <div
              key={`heal-${i}`}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 12px #22c55e',
                opacity: pulse,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
    );
  };

  // ===== PHASE 7: TIMING =====
  const renderTiming = () => {
    if (phase !== 'timing') return null;
    const opacity = getProgress(localFrame, t.timing - 8, 20) * (localFrame > t.rumackMatthew - 20 ? 1 - getProgress(localFrame, t.rumackMatthew - 20, 15) : 1);

    const titleOpacity = getProgress(localFrame, t.timing, 12);
    const eightHoursOpacity = getProgress(localFrame, t.eightHours, 12);
    const eightToTwentyFourOpacity = getProgress(localFrame, t.eightToTwentyFour, 12);
    const afterTwentyFourOpacity = getProgress(localFrame, t.afterTwentyFour, 12);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 35,
          opacity: titleOpacity,
          transform: `scale(${getSpring(localFrame, t.timing, fps)})`,
        }}>
          <ClockIcon size={55} color="#fbbf24" frame={localFrame} />
          <div style={{
            fontSize: 44,
            fontWeight: '700',
            color: '#fbbf24',
            textShadow: '0 0 55px rgba(251, 191, 36, 0.6)',
          }}>
            TIMING IS EVERYTHING!
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 700 }}>
          {/* <8 hours */}
          <div style={{
            padding: '22px 40px',
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 14,
            border: '4px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: eightHoursOpacity,
            transform: `translateX(${interpolate(eightHoursOpacity, [0, 1], [-40, 0])}) scale(${getSpring(localFrame, t.eightHours, fps)})`,
          }}>
            <span style={{ fontSize: 30, fontWeight: '700', color: '#22c55e' }}>&lt;8 hours:</span>
            <span style={{ fontSize: 26, color: '#86efac' }}>~100% effective</span>
            <span style={{ fontSize: 28, fontWeight: '700', color: '#22c55e' }}>GIVE IT!</span>
          </div>

          {/* 8-24 hours */}
          <div style={{
            padding: '22px 40px',
            background: 'rgba(251, 191, 36, 0.15)',
            borderRadius: 14,
            border: '4px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: eightToTwentyFourOpacity,
            transform: `translateX(${interpolate(eightToTwentyFourOpacity, [0, 1], [-40, 0])}) scale(${getSpring(localFrame, t.eightToTwentyFour, fps)})`,
          }}>
            <span style={{ fontSize: 30, fontWeight: '700', color: '#fbbf24' }}>8-24 hours:</span>
            <span style={{ fontSize: 26, color: '#fde68a' }}>Still helps significantly</span>
            <span style={{ fontSize: 28, fontWeight: '700', color: '#fbbf24' }}>GIVE IT!</span>
          </div>

          {/* >24 hours */}
          <div style={{
            padding: '22px 40px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 14,
            border: '4px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: afterTwentyFourOpacity,
            transform: `translateX(${interpolate(afterTwentyFourOpacity, [0, 1], [-40, 0])}) scale(${getSpring(localFrame, t.afterTwentyFour, fps)})`,
          }}>
            <span style={{ fontSize: 30, fontWeight: '700', color: '#ef4444' }}>&gt;24 hours:</span>
            <span style={{ fontSize: 26, color: '#fca5a5' }}>May be late BUT...</span>
            <span style={{ fontSize: 28, fontWeight: '700', color: '#ef4444' }}>STILL GIVE IT!</span>
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 8: CLINICAL PEARL =====
  const renderPearl = () => {
    if (phase !== 'pearl') return null;
    const opacity = getProgress(localFrame, t.rumackMatthew - 8, 20);

    const rumackOpacity = getProgress(localFrame, t.rumackMatthew, 15);
    const loadingOpacity = getProgress(localFrame, t.loadingDose, 15);
    const saveOpacity = getProgress(localFrame, t.savePatient, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Rumack-Matthew box */}
        <div style={{
          padding: '28px 50px',
          background: 'rgba(147, 51, 234, 0.15)',
          borderRadius: 22,
          border: '4px solid rgba(147, 51, 234, 0.6)',
          boxShadow: '0 0 55px rgba(147, 51, 234, 0.3)',
          marginBottom: 30,
          opacity: rumackOpacity,
          transform: `scale(${getSpring(localFrame, t.rumackMatthew, fps)})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <SyringeIcon size={40} color="#9333ea" animate={true} frame={localFrame} />
            <span style={{ fontSize: 28, fontWeight: '700', color: '#9333ea', letterSpacing: 1.5 }}>CLINICAL PEARL</span>
          </div>

          <div style={{
            fontSize: 26,
            color: '#c4b5fd',
            fontWeight: '600',
            marginBottom: 14,
            textAlign: 'center',
          }}>
            RUMACK-MATTHEW NOMOGRAM
          </div>

          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
            Plot acetaminophen level vs. time → Above line? <span style={{ color: '#9333ea', fontWeight: '700' }}>TREAT!</span>
          </div>
        </div>

        {/* NAC Protocol */}
        <div style={{
          padding: '28px 50px',
          background: 'rgba(34, 197, 94, 0.12)',
          borderRadius: 18,
          border: '4px solid rgba(34, 197, 94, 0.5)',
          opacity: loadingOpacity,
          transform: `scale(${getSpring(localFrame, t.loadingDose, fps)})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <SyringeIcon size={32} color="#22c55e" />
            <span style={{ fontSize: 26, fontWeight: '700', color: '#22c55e' }}>NAC PROTOCOL (21-hour)</span>
          </div>

          <div style={{ fontSize: 22, color: '#86efac', lineHeight: 1.9 }}>
            <div>• <span style={{ fontWeight: '600' }}>150 mg/kg</span> over 1 hour (loading)</div>
            <div>• <span style={{ fontWeight: '600' }}>50 mg/kg</span> over 4 hours</div>
            <div>• <span style={{ fontWeight: '600' }}>100 mg/kg</span> over 16 hours</div>
          </div>
        </div>

        {/* Save patient */}
        <div style={{
          marginTop: 30,
          fontSize: 32,
          fontWeight: '700',
          background: 'linear-gradient(90deg, #f59e0b, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: saveOpacity,
          transform: `scale(${getSpring(localFrame, t.savePatient, fps)})`,
        }}>
          That's how you SAVE this patient!
        </div>
      </div>
    );
  };

  // Phase colors
  let phaseColor = '#ef4444';
  if (['normal', 'glutathione-defense'].includes(phase)) phaseColor = '#22c55e';
  else if (['napqi-creation', 'overdose', 'silent-killer'].includes(phase)) phaseColor = '#ef4444';
  else if (['nac-rescue'].includes(phase)) phaseColor = '#22c55e';
  else if (['timing'].includes(phase)) phaseColor = '#fbbf24';
  else if (phase === 'pearl') phaseColor = '#9333ea';

  return (
    <>
      {/* Main container - MATCHES question card exactly (width: 820, top: 480, borderRadius: 22) */}
      <div style={{
        position: 'absolute',
        top: 480,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 820,
        height: 1080,
        opacity: containerOpacity,
        zIndex: 100,
      }}>
        {/* Background with glow - matches MedicalQuestionCard styling */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          borderRadius: 22,
          border: `2px solid ${phaseColor}40`,
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 60px ${phaseColor}15
          `,
        }} />

        {/* Gradient overlay - matches question card */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 22,
          background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(219, 39, 119, 0.05), transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Animated conic border */}
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 25,
          background: `conic-gradient(from ${localFrame * 2}deg, ${phaseColor}35, transparent 20%, ${phaseColor}28, transparent 50%, ${phaseColor}18, transparent 80%)`,
          opacity: 0.5,
          zIndex: -1,
        }} />

        {/* Content - matches question card padding */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 32px',
          overflow: 'hidden',
        }}>
          {renderNormal()}
          {renderNapqiCreation()}
          {renderGlutathioneDefense()}
          {renderOverdose()}
          {renderSilentKiller()}
          {renderNacRescue()}
          {renderTiming()}
          {renderPearl()}
        </div>

        {/* BIGGER Phase indicator */}
        <div style={{
          position: 'absolute',
          bottom: 25,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 14,
          fontSize: 15,
          fontWeight: '500',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          background: 'rgba(0,0,0,0.75)',
          padding: '14px 28px',
          borderRadius: 25,
          border: '2px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(14px)',
        }}>
          {[
            { label: 'Normal', phases: ['normal', 'glutathione-defense'], color: '#22c55e' },
            { label: 'Toxic', phases: ['napqi-creation'], color: '#ef4444' },
            { label: 'Crisis', phases: ['overdose', 'silent-killer'], color: '#ef4444' },
            { label: 'NAC', phases: ['nac-rescue'], color: '#22c55e' },
            { label: 'Timing', phases: ['timing'], color: '#fbbf24' },
            { label: 'Pearl', phases: ['pearl'], color: '#9333ea' },
          ].map((p, i) => {
            const isActive = p.phases.includes(phase);
            return (
              <span
                key={i}
                style={{
                  color: isActive ? p.color : 'rgba(255,255,255,0.28)',
                  fontWeight: isActive ? '700' : '500',
                  textShadow: isActive ? `0 0 18px ${p.color}` : 'none',
                  letterSpacing: 0.3,
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

export default AcetaminophenMechanismEnhanced;
