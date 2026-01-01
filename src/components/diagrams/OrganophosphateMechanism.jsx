import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * OrganophosphateMechanism - PROFESSIONAL EDITION
 *
 * Clean, focused animations with custom SVG icons
 * Card positioned below brain mascot
 * Smooth cinematic flow
 */

// ===== CUSTOM SVG ICONS =====
const SkullIcon = ({ size = 64, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 3.313 1.607 6.248 4.09 8.073V22a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-1.927C20.393 18.248 22 15.313 22 12c0-5.523-4.477-10-10-10z"
      fill={color}
      opacity="0.9"
    />
    <circle cx="8.5" cy="11" r="2" fill="#0a0a0a" />
    <circle cx="15.5" cy="11" r="2" fill="#0a0a0a" />
    <path
      d="M9 16h6M10 18h1M13 18h1"
      stroke="#0a0a0a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LungsIcon = ({ size = 140, color = '#22c55e', breathing = false, frame = 0 }) => {
  const scale = breathing ? 1 + Math.sin(frame * 0.15) * 0.08 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ transform: `scale(${scale})` }}>
      <defs>
        <linearGradient id="lungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* Trachea */}
      <path
        d="M32 8v12M32 20c-6 2-10 8-10 16s4 14 10 12M32 20c6 2 10 8 10 16s-4 14-10 12"
        stroke="url(#lungGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left lung */}
      <path
        d="M22 24c-8 4-14 12-14 22 0 8 6 12 12 10 4-2 6-6 6-12v-20"
        fill={color}
        opacity="0.3"
      />
      <path
        d="M22 24c-8 4-14 12-14 22 0 8 6 12 12 10 4-2 6-6 6-12v-20"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Right lung */}
      <path
        d="M42 24c8 4 14 12 14 22 0 8-6 12-12 10-4-2-6-6-6-12v-20"
        fill={color}
        opacity="0.3"
      />
      <path
        d="M42 24c8 4 14 12 14 22 0 8-6 12-12 10-4-2-6-6-6-12v-20"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

const CheckIcon = ({ size = 22, color = '#86efac' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = ({ size = 64, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      fill={color}
      opacity="0.2"
    />
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoleculeIcon = ({ size = 64, color = '#ec4899' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill={color} />
    <circle cx="12" cy="4" r="2" fill={color} opacity="0.7" />
    <circle cx="12" cy="20" r="2" fill={color} opacity="0.7" />
    <circle cx="4" cy="12" r="2" fill={color} opacity="0.7" />
    <circle cx="20" cy="12" r="2" fill={color} opacity="0.7" />
    <line x1="12" y1="9" x2="12" y2="6" stroke={color} strokeWidth="2" />
    <line x1="12" y1="15" x2="12" y2="18" stroke={color} strokeWidth="2" />
    <line x1="9" y1="12" x2="6" y2="12" stroke={color} strokeWidth="2" />
    <line x1="15" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2" />
  </svg>
);

const ClockIcon = ({ size = 32, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SyringeIcon = ({ size = 42, color = '#9333ea' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M18.5 2.5l3 3M19 6l-2-2M14 4l6 6-10 10H6v-4L16 6l-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 10l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const OrganophosphateMechanism = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== TIMESTAMPS =====
  const words = {
    organophosphates: 79.377,
    irreversibly: 81.223,
    bind: 82.337,
    acetylcholinesterase: 83.301,
    breakDown: 87.48,
    pilesUp: 91.277,
    drowning: 93.39,
    muscarinic: 95.236,
    haywire: 96.827,
    sludge: 98.766,
    nicotinic: 103.247,
    paralysis: 108.82,
    diaphragm: 110.793,
    atropineBlocks: 111.885,
    stopsTheSludge: 115.066,
    canBreathe: 118.235,
    pralidoxime: 122.682,
    within24to48: 124.725,
    enzymeAges: 128.348,
    unbinds: 132.272,
    reactivates: 135.14,
    atropineForSymptoms: 136.951,
    cure: 139.784,
    twoMilligrams: 142.292,
    thenPralidoxime: 149.489,
    oneToTwoGrams: 150.395,
  };

  const t = {};
  Object.entries(words).forEach(([key, time]) => {
    t[key] = toFrame(time) - diagramStartFrame;
  });

  // ===== ANIMATIONS =====
  const fadeIn = (startFrame, duration = 15) => {
    return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    });
  };

  const fadeOut = (startFrame, duration = 10) => {
    return interpolate(localFrame, [startFrame, startFrame + duration], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });
  };

  const scaleIn = (startFrame) => {
    if (localFrame < startFrame) return 0;
    return spring({
      frame: localFrame - startFrame,
      fps,
      config: { damping: 14, stiffness: 150, mass: 0.9 },
    });
  };

  const slideUp = (startFrame, distance = 40) => {
    return interpolate(localFrame, [startFrame, startFrame + 20], [distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.2)),
    });
  };

  const pulse = (startFrame, speed = 0.12, intensity = 0.06) => {
    if (localFrame < startFrame) return 1;
    return 1 + Math.sin((localFrame - startFrame) * speed) * intensity;
  };

  const shake = (startFrame, duration = 18, intensity = 5) => {
    if (localFrame < startFrame || localFrame > startFrame + duration) return { x: 0, y: 0 };
    const progress = (localFrame - startFrame) / duration;
    const decay = 1 - progress;
    return {
      x: Math.sin(localFrame * 2.2) * intensity * decay,
      y: Math.cos(localFrame * 1.8) * intensity * 0.4 * decay,
    };
  };

  // ===== CURRENT VISUAL =====
  const getCurrentVisual = () => {
    if (localFrame < t.organophosphates) return 'none';
    if (localFrame < t.acetylcholinesterase - 12) return 'op-molecule';
    if (localFrame < t.pilesUp - 12) return 'enzyme-blocked';
    if (localFrame < t.muscarinic - 12) return 'ach-pileup';
    if (localFrame < t.sludge - 12) return 'muscarinic';
    if (localFrame < t.nicotinic - 12) return 'sludge';
    if (localFrame < t.atropineBlocks - 12) return 'paralysis';
    if (localFrame < t.canBreathe - 12) return 'atropine';
    if (localFrame < t.pralidoxime - 12) return 'breathe';
    if (localFrame < t.unbinds - 12) return 'pralidoxime';
    if (localFrame < t.atropineForSymptoms - 12) return 'reactivate';
    if (localFrame < t.twoMilligrams - 12) return 'summary';
    return 'dosing';
  };

  const currentVisual = getCurrentVisual();

  const containerOpacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== RENDER FUNCTIONS =====
  const CheckItem = ({ children, delay = 0 }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity: fadeIn(delay),
      transform: `translateX(${slideUp(delay, 20)}px)`,
    }}>
      <CheckIcon size={24} />
      <span style={{ fontSize: 20 }}>{children}</span>
    </div>
  );

  const renderOPMolecule = () => {
    if (currentVisual !== 'op-molecule') return null;
    const opacity = fadeIn(t.organophosphates) * (localFrame > t.acetylcholinesterase - 20 ? fadeOut(t.acetylcholinesterase - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.organophosphates)}) translateY(${slideUp(t.organophosphates)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 290,
          height: 290,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 100px rgba(239, 68, 68, 0.5),
            0 0 180px rgba(239, 68, 68, 0.2),
            inset 0 -12px 30px rgba(0,0,0,0.3)
          `,
          border: '5px solid rgba(252, 165, 165, 0.6)',
          transform: `scale(${pulse(t.organophosphates)}) translate(${shake(t.organophosphates).x}px, ${shake(t.organophosphates).y}px)`,
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>ORGANO-</span>
          <span style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>PHOSPHATE</span>
          <div style={{ marginTop: 20 }}>
            <SkullIcon size={68} color="#fff" />
          </div>
        </div>
        <div style={{
          marginTop: 50,
          fontSize: 44,
          fontWeight: '700',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 50px rgba(239, 68, 68, 0.6)',
          letterSpacing: 3,
          opacity: fadeIn(t.irreversibly),
          transform: `translateY(${slideUp(t.irreversibly)}px)`,
        }}>
          IRREVERSIBLY BINDS
        </div>
        <div style={{
          marginTop: 20,
          fontSize: 26,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          opacity: fadeIn(t.bind),
        }}>
          to the enzyme...
        </div>
      </div>
    );
  };

  const renderEnzymeBlocked = () => {
    if (currentVisual !== 'enzyme-blocked') return null;
    const opacity = fadeIn(t.acetylcholinesterase - 12) * (localFrame > t.pilesUp - 20 ? fadeOut(t.pilesUp - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.acetylcholinesterase - 12)}) translateY(${slideUp(t.acetylcholinesterase - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 480,
            height: 170,
            borderRadius: 28,
            background: 'linear-gradient(145deg, #3B82F6 0%, #1e40af 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '6px solid #ef4444',
            boxShadow: `
              0 0 80px rgba(239, 68, 68, 0.4),
              inset 0 -10px 25px rgba(0,0,0,0.3)
            `,
          }}>
            <span style={{
              fontSize: 30,
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              letterSpacing: 1.5,
            }}>ACETYLCHOLINESTERASE</span>
            <span style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              marginTop: 8,
            }}>(AChE Enzyme)</span>
          </div>

          <div style={{
            position: 'absolute',
            top: -85,
            left: '50%',
            transform: `translateX(-50%) scale(${pulse(t.acetylcholinesterase, 0.18, 0.08)})`,
            width: 115,
            height: 115,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
            border: '5px solid rgba(252, 165, 165, 0.6)',
          }}>
            <SkullIcon size={58} color="#fff" />
          </div>

          <svg style={{
            position: 'absolute',
            top: -40,
            left: -25,
            width: 530,
            height: 250,
            opacity: fadeIn(t.breakDown - 5),
          }}>
            <line x1="35" y1="35" x2="495" y2="215" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
            <line x1="495" y1="35" x2="35" y2="215" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{
          marginTop: 65,
          fontSize: 46,
          fontWeight: '700',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 60px rgba(239, 68, 68, 0.5)',
          letterSpacing: 2.5,
          transform: `translate(${shake(t.breakDown).x}px, ${shake(t.breakDown).y}px)`,
        }}>
          ENZYME BLOCKED
        </div>
        <div style={{
          marginTop: 18,
          fontSize: 26,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        }}>
          Can't break down acetylcholine
        </div>
      </div>
    );
  };

  const renderACHPileup = () => {
    if (currentVisual !== 'ach-pileup') return null;
    const opacity = fadeIn(t.pilesUp - 12) * (localFrame > t.muscarinic - 20 ? fadeOut(t.muscarinic - 20) : 1);
    const numBalls = Math.min(10, Math.floor((localFrame - t.pilesUp + 12) / 4) + 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.pilesUp - 12)})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', width: 520, height: 340 }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 300,
            height: 95,
            borderRadius: 22,
            background: 'linear-gradient(145deg, #8b5cf6 0%, #5b21b6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid rgba(167, 139, 250, 0.6)',
            boxShadow: 'inset 0 -6px 16px rgba(0,0,0,0.3)',
          }}>
            <span style={{
              fontSize: 26,
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              letterSpacing: 2,
            }}>RECEPTORS</span>
          </div>

          {Array.from({ length: numBalls }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const x = 100 + col * 80 + (row % 2) * 40;
            const y = 175 - row * 60;
            const jitter = Math.sin(localFrame * 0.1 + i * 1.8) * 3;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y + jitter,
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #fbbf24 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 26px rgba(251, 191, 36, 0.4), inset 0 -4px 10px rgba(0,0,0,0.2)',
                  border: '3px solid rgba(253, 224, 71, 0.6)',
                  transform: `scale(${scaleIn(t.pilesUp + i * 4)})`,
                }}
              >
                <span style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#fff',
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                }}>ACh</span>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 40,
          fontSize: 44,
          fontWeight: '700',
          color: '#fbbf24',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 55px rgba(251, 191, 36, 0.5)',
          letterSpacing: 2,
        }}>
          ACh PILES UP
        </div>
        <div style={{
          marginTop: 18,
          fontSize: 30,
          fontWeight: '600',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
          opacity: fadeIn(t.drowning),
          transform: `translate(${shake(t.drowning).x}px, ${shake(t.drowning).y}px)`,
        }}>
          Drowning the nervous system
        </div>
      </div>
    );
  };

  const renderMuscarinic = () => {
    if (currentVisual !== 'muscarinic') return null;
    const opacity = fadeIn(t.muscarinic - 12) * (localFrame > t.sludge - 20 ? fadeOut(t.sludge - 20) : 1);
    const isHaywire = localFrame >= t.haywire;

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.muscarinic - 12)}) translate(${shake(t.haywire, 30, 6).x}px, ${shake(t.haywire, 30, 6).y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 380,
          height: 140,
          borderRadius: 26,
          background: isHaywire
            ? 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)'
            : 'linear-gradient(145deg, #8b5cf6 0%, #5b21b6 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: isHaywire ? '5px solid rgba(252, 165, 165, 0.6)' : '4px solid rgba(167, 139, 250, 0.6)',
          boxShadow: isHaywire
            ? '0 0 70px rgba(239, 68, 68, 0.5)'
            : '0 0 40px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontSize: 34,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
          }}>MUSCARINIC</span>
          <span style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>RECEPTORS</span>
        </div>

        <div style={{
          marginTop: 50,
          fontSize: 52,
          fontWeight: '700',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 55px rgba(239, 68, 68, 0.5)',
          letterSpacing: 3,
          opacity: fadeIn(t.haywire),
        }}>
          GO HAYWIRE
        </div>
      </div>
    );
  };

  const renderSLUDGE = () => {
    if (currentVisual !== 'sludge') return null;
    const opacity = fadeIn(t.sludge - 12) * (localFrame > t.nicotinic - 20 ? fadeOut(t.nicotinic - 20) : 1);

    const items = [
      { letter: 'S', text: 'alivation' },
      { letter: 'L', text: 'acrimation' },
      { letter: 'U', text: 'rination' },
      { letter: 'D', text: 'efecation' },
      { letter: 'G', text: 'I distress' },
      { letter: 'E', text: 'mesis' },
    ];

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.sludge - 12)}) translateY(${slideUp(t.sludge - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: '800',
          color: '#fbbf24',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 80px rgba(251, 191, 36, 0.5)',
          marginBottom: 40,
          letterSpacing: 18,
        }}>
          SLUDGE
        </div>

        <div style={{
          padding: '40px 65px',
          background: 'rgba(251, 191, 36, 0.08)',
          borderRadius: 28,
          border: '4px solid rgba(251, 191, 36, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            fontSize: 30,
            color: '#fff',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            lineHeight: 1.9,
          }}>
            {items.map((item, i) => (
              <div key={i} style={{
                opacity: fadeIn(t.sludge + i * 3),
                transform: `translateX(${slideUp(t.sludge + i * 3, 15)}px)`,
              }}>
                <span style={{ color: '#fbbf24', fontWeight: '700' }}>{item.letter}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderParalysis = () => {
    if (currentVisual !== 'paralysis') return null;
    const opacity = fadeIn(t.nicotinic - 12) * (localFrame > t.atropineBlocks - 20 ? fadeOut(t.atropineBlocks - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.nicotinic - 12)})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 380,
          height: 140,
          borderRadius: 26,
          background: 'linear-gradient(145deg, #06b6d4 0%, #0e7490 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid rgba(103, 232, 249, 0.6)',
          boxShadow: 'inset 0 -6px 16px rgba(0,0,0,0.3)',
        }}>
          <span style={{
            fontSize: 34,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
          }}>NICOTINIC</span>
          <span style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>RECEPTORS</span>
        </div>

        <div style={{
          marginTop: 40,
          padding: '30px 55px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderRadius: 22,
          border: '4px solid #ef4444',
          opacity: fadeIn(t.paralysis),
          transform: `translate(${shake(t.paralysis).x}px, ${shake(t.paralysis).y}px)`,
        }}>
          <div style={{
            fontSize: 46,
            fontWeight: '700',
            color: '#ef4444',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
            textAlign: 'center',
          }}>
            PARALYSIS
          </div>
          <div style={{
            fontSize: 26,
            color: '#fca5a5',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 14,
            textAlign: 'center',
            opacity: fadeIn(t.diaphragm),
          }}>
            Including the diaphragm
          </div>
          <div style={{
            fontSize: 22,
            color: '#fff',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 10,
            textAlign: 'center',
            opacity: fadeIn(t.diaphragm + 5),
          }}>
            → Can't breathe
          </div>
        </div>
      </div>
    );
  };

  const renderAtropine = () => {
    if (currentVisual !== 'atropine') return null;
    const opacity = fadeIn(t.atropineBlocks - 12) * (localFrame > t.canBreathe - 20 ? fadeOut(t.canBreathe - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.atropineBlocks - 12)}) translateY(${slideUp(t.atropineBlocks - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 80px rgba(34, 197, 94, 0.5),
            0 0 160px rgba(34, 197, 94, 0.2),
            inset 0 -8px 20px rgba(0,0,0,0.3)
          `,
          border: '5px solid rgba(134, 239, 172, 0.6)',
          transform: `scale(${pulse(t.atropineBlocks)})`,
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>ATROPINE</span>
          <span style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 6,
          }}>(M-blocker)</span>
        </div>

        <div style={{
          marginTop: 40,
          fontSize: 36,
          fontWeight: '700',
          color: '#22c55e',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
          letterSpacing: 1,
        }}>
          Blocks Muscarinic Receptors
        </div>

        <div style={{
          marginTop: 30,
          padding: '26px 45px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 18,
          border: '3px solid rgba(34, 197, 94, 0.4)',
          opacity: fadeIn(t.stopsTheSludge),
        }}>
          <div style={{
            fontSize: 30,
            fontWeight: '700',
            color: '#22c55e',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            marginBottom: 16,
          }}>
            Stops the SLUDGE
          </div>
          <div style={{
            fontSize: 20,
            color: '#86efac',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <CheckItem delay={t.stopsTheSludge + 3}>No more secretions</CheckItem>
            <CheckItem delay={t.stopsTheSludge + 6}>Bronchorrhea stops</CheckItem>
          </div>
        </div>
      </div>
    );
  };

  const renderBreathe = () => {
    if (currentVisual !== 'breathe') return null;
    const opacity = fadeIn(t.canBreathe - 12) * (localFrame > t.pralidoxime - 20 ? fadeOut(t.pralidoxime - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.canBreathe - 12)}) translateY(${slideUp(t.canBreathe - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <LungsIcon size={140} color="#22c55e" breathing={true} frame={localFrame} />

        <div style={{
          marginTop: 35,
          padding: '35px 65px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: 24,
          border: '4px solid #22c55e',
          boxShadow: '0 0 70px rgba(34, 197, 94, 0.3)',
        }}>
          <div style={{
            fontSize: 46,
            fontWeight: '700',
            color: '#22c55e',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
          }}>
            Patient can BREATHE
          </div>
        </div>
      </div>
    );
  };

  const renderPralidoxime = () => {
    if (currentVisual !== 'pralidoxime') return null;
    const opacity = fadeIn(t.pralidoxime - 12) * (localFrame > t.unbinds - 20 ? fadeOut(t.unbinds - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.pralidoxime - 12)}) translateY(${slideUp(t.pralidoxime - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #ec4899 0%, #9d174d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 80px rgba(236, 72, 153, 0.5),
            0 0 160px rgba(236, 72, 153, 0.2),
            inset 0 -10px 24px rgba(0,0,0,0.3)
          `,
          border: '5px solid rgba(249, 168, 212, 0.6)',
          transform: `scale(${pulse(t.pralidoxime, 0.1, 0.08)})`,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>PRALIDOXIME</span>
          <span style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 6,
          }}>(2-PAM)</span>
        </div>

        <div style={{
          marginTop: 40,
          padding: '24px 40px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: 18,
          border: '3px solid rgba(251, 191, 36, 0.5)',
          opacity: fadeIn(t.within24to48),
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}>
          <ClockIcon size={36} color="#fbbf24" />
          <div>
            <div style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#fbbf24',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>
              Within 24-48 hours
            </div>
            <div style={{
              fontSize: 20,
              color: 'rgba(251, 191, 36, 0.8)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              marginTop: 6,
              opacity: fadeIn(t.enzymeAges),
            }}>
              Before enzyme ages permanently
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReactivate = () => {
    if (currentVisual !== 'reactivate') return null;
    const opacity = fadeIn(t.unbinds - 12) * (localFrame > t.atropineForSymptoms - 20 ? fadeOut(t.atropineForSymptoms - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.unbinds - 12)}) translateY(${slideUp(t.unbinds - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: '700',
          color: '#ec4899',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 40px rgba(236, 72, 153, 0.5)',
          marginBottom: 30,
        }}>
          Unbinds the organophosphate
        </div>

        <svg width="480" height="160" viewBox="0 0 350 120">
          <defs>
            <filter id="enzymeGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feFlood floodColor="#22c55e" floodOpacity="0.5"/>
              <feComposite in2="blur" operator="in"/>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect x="100" y="30" width="150" height="60" rx="12" fill="url(#enzymeGradReact)" stroke="#22c55e" strokeWidth="4" filter="url(#enzymeGlow)"/>
          <defs>
            <linearGradient id="enzymeGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#1e40af"/>
            </linearGradient>
          </defs>
          <text x="175" y="60" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="SF Pro Display, -apple-system, sans-serif">ENZYME FREED</text>
          <text x="175" y="78" textAnchor="middle" fill="#22c55e" fontSize="11" fontFamily="SF Pro Text, -apple-system, sans-serif">Reactivated</text>
          <circle cx="45" cy="60" r="22" fill="#ef4444" opacity="0.3" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3"/>
          <text x="45" y="95" textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="10" fontFamily="SF Pro Text, -apple-system, sans-serif">OP removed</text>
          <path d="M 70 60 L 95 60" stroke="#ec4899" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowhead)"/>
        </svg>

        <div style={{
          marginTop: 30,
          padding: '30px 55px',
          background: 'rgba(236, 72, 153, 0.2)',
          borderRadius: 20,
          border: '4px solid #ec4899',
          boxShadow: '0 0 50px rgba(236, 72, 153, 0.3)',
          opacity: fadeIn(t.reactivates),
        }}>
          <div style={{
            fontSize: 40,
            fontWeight: '700',
            color: '#ec4899',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 0 35px rgba(236, 72, 153, 0.5)',
          }}>
            Reactivates the enzyme
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (currentVisual !== 'summary') return null;
    const opacity = fadeIn(t.atropineForSymptoms - 12) * (localFrame > t.twoMilligrams - 20 ? fadeOut(t.twoMilligrams - 20) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.atropineForSymptoms - 12)}) translateY(${slideUp(t.atropineForSymptoms - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 90, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 80px rgba(34, 197, 94, 0.4)',
              border: '5px solid rgba(134, 239, 172, 0.6)',
            }}>
              <ShieldIcon size={72} color="#fff" />
            </div>
            <div style={{
              marginTop: 20,
              fontSize: 30,
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '600',
            }}>
              ATROPINE
            </div>
            <div style={{
              fontSize: 22,
              color: 'rgba(134, 239, 172, 0.9)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}>
              for symptoms
            </div>
          </div>

          <div style={{
            fontSize: 72,
            fontWeight: '300',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>+</div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: fadeIn(t.cure),
            transform: `translateY(${slideUp(t.cure)}px)`,
          }}>
            <div style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #ec4899 0%, #9d174d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 80px rgba(236, 72, 153, 0.4)',
              border: '5px solid rgba(249, 168, 212, 0.6)',
            }}>
              <MoleculeIcon size={72} color="#fff" />
            </div>
            <div style={{
              marginTop: 20,
              fontSize: 30,
              color: '#ec4899',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '600',
            }}>
              PRALIDOXIME
            </div>
            <div style={{
              fontSize: 22,
              color: 'rgba(249, 168, 212, 0.9)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}>
              for the cure
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 55,
          padding: '28px 60px',
          background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(236, 72, 153, 0.15))',
          borderRadius: 20,
          border: '3px solid rgba(255,255,255,0.2)',
          opacity: fadeIn(t.cure),
        }}>
          <div style={{
            fontSize: 40,
            fontWeight: '700',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            background: 'linear-gradient(90deg, #22c55e, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Complete Treatment
          </div>
        </div>
      </div>
    );
  };

  const renderDosing = () => {
    if (currentVisual !== 'dosing') return null;
    const opacity = fadeIn(t.twoMilligrams - 12);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.twoMilligrams - 12)}) translateY(${slideUp(t.twoMilligrams - 12)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          padding: '35px 55px',
          background: 'rgba(147, 51, 234, 0.1)',
          borderRadius: 28,
          border: '4px solid rgba(147, 51, 234, 0.5)',
          boxShadow: '0 0 60px rgba(147, 51, 234, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 28,
          }}>
            <SyringeIcon size={36} color="#9333ea" />
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#9333ea',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              letterSpacing: 2,
            }}>
              CLINICAL PEARL
            </span>
          </div>

          <div style={{
            marginBottom: 24,
            padding: '22px 32px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 16,
            border: '3px solid rgba(34, 197, 94, 0.5)',
          }}>
            <div style={{
              fontSize: 26,
              fontWeight: '700',
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>ATROPINE</div>
            <div style={{
              fontSize: 34,
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              marginTop: 8,
            }}>2mg IV push</div>
            <div style={{
              fontSize: 19,
              color: '#86efac',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              marginTop: 8,
            }}>Repeat q5min until dry</div>
          </div>

          <div style={{
            padding: '22px 32px',
            background: 'rgba(236, 72, 153, 0.1)',
            borderRadius: 16,
            border: '3px solid rgba(236, 72, 153, 0.5)',
            opacity: fadeIn(t.thenPralidoxime),
          }}>
            <div style={{
              fontSize: 26,
              fontWeight: '700',
              color: '#ec4899',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>PRALIDOXIME</div>
            <div style={{
              fontSize: 34,
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              marginTop: 8,
              opacity: fadeIn(t.oneToTwoGrams),
            }}>1-2g IV</div>
            <div style={{
              fontSize: 19,
              color: '#f9a8d4',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              marginTop: 8,
              opacity: fadeIn(t.oneToTwoGrams + 5),
            }}>over 30 minutes</div>
          </div>
        </div>
      </div>
    );
  };

  // Phase color
  let phaseColor = '#ef4444';
  if (currentVisual === 'sludge') phaseColor = '#fbbf24';
  else if (['atropine', 'breathe'].includes(currentVisual)) phaseColor = '#22c55e';
  else if (['pralidoxime', 'reactivate', 'summary', 'dosing'].includes(currentVisual)) phaseColor = '#ec4899';

  return (
    <>
      {/* Branding */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 150,
        fontSize: '17px',
        fontWeight: '600',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        zIndex: 200,
        background: 'linear-gradient(135deg, #9333ea, #db2777)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        opacity: containerOpacity,
        letterSpacing: 0.5,
      }}>
        synapticrecall.ai
      </div>

      {/* Main container - MOVED DOWN and SCALED UP */}
      <div style={{
        position: 'absolute',
        top: 620,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 780,
        height: 720,
        opacity: containerOpacity,
        zIndex: 100,
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(8, 8, 12, 0.95) 0%,
            rgba(12, 8, 20, 0.97) 100%)`,
          borderRadius: 28,
          border: `2px solid ${phaseColor}40`,
          boxShadow: `
            0 0 60px ${phaseColor}15,
            0 20px 40px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
          backdropFilter: 'blur(20px)',
        }} />

        {/* Subtle animated border */}
        <div style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 30,
          background: `conic-gradient(from ${localFrame * 1.5}deg, ${phaseColor}30, transparent 25%, ${phaseColor}20, transparent 60%)`,
          opacity: 0.4,
          zIndex: -1,
        }} />

        {/* Content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 35,
        }}>
          {renderOPMolecule()}
          {renderEnzymeBlocked()}
          {renderACHPileup()}
          {renderMuscarinic()}
          {renderSLUDGE()}
          {renderParalysis()}
          {renderAtropine()}
          {renderBreathe()}
          {renderPralidoxime()}
          {renderReactivate()}
          {renderSummary()}
          {renderDosing()}
        </div>

        {/* Phase indicator */}
        <div style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          fontSize: 11,
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 20px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          {[
            { label: 'Problem', phases: ['op-molecule', 'enzyme-blocked', 'ach-pileup'], color: '#ef4444' },
            { label: 'Effects', phases: ['muscarinic', 'sludge', 'paralysis'], color: '#fbbf24' },
            { label: 'Atropine', phases: ['atropine', 'breathe'], color: '#22c55e' },
            { label: 'Cure', phases: ['pralidoxime', 'reactivate', 'summary', 'dosing'], color: '#ec4899' },
          ].map((p, i) => {
            const isActive = p.phases.includes(currentVisual);
            return (
              <span
                key={i}
                style={{
                  color: isActive ? p.color : 'rgba(255,255,255,0.25)',
                  fontWeight: isActive ? '600' : '400',
                  textShadow: isActive ? `0 0 12px ${p.color}` : 'none',
                  letterSpacing: 0.3,
                  transition: 'all 0.3s ease',
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

export default OrganophosphateMechanism;
