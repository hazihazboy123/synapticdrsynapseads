import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * AcetaminophenMechanism - SILENT KILLER TEACHING DIAGRAM
 *
 * Visual narrative:
 * 1. Normal metabolism: Tylenol → 95% glucuronidation (safe) + 5% CYP450 → NAPQI
 * 2. Glutathione saves the day: NAPQI neutralized
 * 3. Overdose: Glucuronidation overwhelmed → NAPQI piles up → Glutathione depleted
 * 4. Liver destruction: NAPQI attacks hepatocytes → Zone 3 necrosis
 * 5. The paradox: Patient feels fine while dying
 * 6. NAC to the rescue: Cysteine → Glutathione regeneration → NAPQI neutralized
 * 7. Timing matters: 8h/24h windows
 * 8. Clinical pearl: Rumack-Matthew nomogram + dosing
 */

// ===== CUSTOM SVG ICONS =====
const LiverIcon = ({ size = 120, healthy = true, damage = 0, frame = 0 }) => {
  const breathe = healthy ? 1 + Math.sin(frame * 0.1) * 0.03 : 1;
  const damageColor = interpolate(damage, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: `scale(${breathe})` }}>
      <defs>
        <linearGradient id="liverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={healthy ? "#a855f7" : `rgb(${168 + damageColor * 71}, ${85 - damageColor * 17}, ${247 - damageColor * 179})`} />
          <stop offset="100%" stopColor={healthy ? "#7c3aed" : `rgb(${124 + damageColor * 115}, ${58 - damageColor * 58}, ${237 - damageColor * 169})`} />
        </linearGradient>
      </defs>
      {/* Liver shape */}
      <path
        d="M52 20c4 8 6 18 2 28-4 10-16 14-26 12s-20-10-22-22c-2-10 4-18 12-22 6-4 14-4 22 0 4 2 8 6 12 4z"
        fill="url(#liverGrad)"
        stroke={healthy ? "#c084fc" : "#ef4444"}
        strokeWidth="2"
      />
      {/* Damage spots when not healthy */}
      {damage > 0 && (
        <>
          <circle cx="28" cy="32" r={4 * damage} fill="#ef4444" opacity={0.7 * damage} />
          <circle cx="38" cy="28" r={3 * damage} fill="#ef4444" opacity={0.6 * damage} />
          <circle cx="34" cy="40" r={3.5 * damage} fill="#ef4444" opacity={0.65 * damage} />
        </>
      )}
    </svg>
  );
};

const PillIcon = ({ size = 48, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="8" width="16" height="8" rx="4" fill={color} />
    <rect x="4" y="8" width="8" height="8" rx="0" fill={color} opacity="0.6" />
    <rect x="4" y="8" width="16" height="8" rx="4" stroke="#fff" strokeWidth="1" opacity="0.3" />
  </svg>
);

const ShieldIcon = ({ size = 64, color = '#22c55e', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      fill={color}
      opacity={active ? 0.3 : 0.1}
    />
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    {active && (
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const SkullIcon = ({ size = 48, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 3.313 1.607 6.248 4.09 8.073V22a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-1.927C20.393 18.248 22 15.313 22 12c0-5.523-4.477-10-10-10z"
      fill={color}
      opacity="0.9"
    />
    <circle cx="8.5" cy="11" r="2" fill="#0a0a0a" />
    <circle cx="15.5" cy="11" r="2" fill="#0a0a0a" />
    <path d="M9 16h6M10 18h1M13 18h1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
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

export const AcetaminophenMechanism = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== TIMESTAMPS (relative to teaching start) =====
  const words = {
    silentKiller: 93.45,        // "SILENT KILLER"
    normallyTylenol: 97.0,      // "Normally when you take Tylenol"
    liverChamp: 100.25,         // "liver handles it like a CHAMP"
    glucuronidated: 102.5,      // "glucuronidated"
    fivePercent: 106.65,        // "five percent"
    cyp450: 108.0,              // "CYP450"
    napqi: 111.25,              // "NAPQI"
    glutathione: 119.0,         // "GLUTATHIONE"
    bodyguard: 121.5,           // "BODYGUARD"
    tacklesNapqi: 123.35,       // "TACKLES that NAPQI"
    wholeBottle: 129.95,        // "WHOLE BOTTLE"
    overwhelmed: 132.6,         // "OVERWHELMED"
    napqiPiling: 137.9,         // "NAPQI starts PILING UP"
    depleted: 141.4,            // "DEPLETED"
    destroys: 148.85,           // "DESTROYS them"
    zone3: 150.2,               // "Zone 3 necrosis"
    centrilobular: 151.5,       // "CENTRILOBULAR"
    terrifying: 155.5,          // "terrifying part"
    twentyFourHours: 159.15,    // "TWENTY-FOUR HOURS"
    feelsFine: 161.4,           // "Patient feels FINE"
    liverDestroyed: 166.0,      // "liver is being DESTROYED"
    hourSeventyTwo: 168.8,      // "hour seventy-two"
    fulminant: 169.8,           // "Fulminant hepatic failure"
    enterNac: 176.8,            // "Enter N-ACETYLCYSTEINE"
    antidote: 179.4,            // "ANTIDOTE"
    cysteine: 181.45,           // "CYSTEINE"
    rebuildGlutathione: 184.15, // "REBUILD glutathione"
    liverSurvives: 192.65,      // "liver SURVIVES"
    timingEverything: 193.8,    // "TIMING is EVERYTHING"
    eightHours: 196.0,          // "EIGHT HOURS"
    hundredPercent: 198.15,     // "ONE HUNDRED PERCENT"
    rumackMatthew: 214.8,       // "RUMACK-MATTHEW NOMOGRAM"
    loadingDose: 227.5,         // "Loading dose"
    twentyOneHour: 237.2,       // "Twenty-one hour protocol"
    savePatient: 239.55,        // "SAVE this patient"
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
    if (localFrame < t.silentKiller) return 'none';
    if (localFrame < t.fivePercent - 10) return 'normal-metabolism';
    if (localFrame < t.glutathione - 10) return 'napqi-creation';
    if (localFrame < t.wholeBottle - 10) return 'glutathione-saves';
    if (localFrame < t.destroys - 10) return 'overdose-chaos';
    if (localFrame < t.terrifying - 10) return 'liver-death';
    if (localFrame < t.enterNac - 10) return 'silent-killer';
    if (localFrame < t.liverSurvives - 10) return 'nac-rescue';
    if (localFrame < t.rumackMatthew - 10) return 'timing';
    if (localFrame < t.savePatient - 10) return 'dosing';
    return 'summary';
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

  const renderNormalMetabolism = () => {
    if (currentVisual !== 'normal-metabolism') return null;
    const opacity = fadeIn(t.silentKiller) * (localFrame > t.fivePercent - 18 ? fadeOut(t.fivePercent - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.silentKiller)}) translateY(${slideUp(t.silentKiller)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <PillIcon size={80} color="#f59e0b" />
            <span style={{
              marginTop: 10,
              fontSize: 24,
              fontWeight: '700',
              color: '#f59e0b',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>TYLENOL</span>
          </div>

          <div style={{
            fontSize: 48,
            color: 'rgba(255,255,255,0.4)',
            fontWeight: '300',
          }}>→</div>

          <LiverIcon size={140} healthy={true} frame={localFrame} />
        </div>

        <div style={{
          marginTop: 40,
          fontSize: 42,
          fontWeight: '700',
          color: '#22c55e',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 40px rgba(34, 197, 94, 0.5)',
          opacity: fadeIn(t.liverChamp),
        }}>
          Liver handles it like a CHAMP
        </div>

        <div style={{
          marginTop: 30,
          padding: '25px 45px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 20,
          border: '3px solid rgba(34, 197, 94, 0.4)',
          opacity: fadeIn(t.glucuronidated),
        }}>
          <div style={{
            fontSize: 28,
            color: '#22c55e',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontWeight: '600',
          }}>
            95% → Glucuronidation → Peed out
          </div>
        </div>
      </div>
    );
  };

  const renderNapqiCreation = () => {
    if (currentVisual !== 'napqi-creation') return null;
    const opacity = fadeIn(t.fivePercent - 10) * (localFrame > t.glutathione - 18 ? fadeOut(t.glutathione - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.fivePercent - 10)}) translateY(${slideUp(t.fivePercent - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          marginBottom: 25,
        }}>
          But 5% goes through...
        </div>

        <div style={{
          padding: '25px 50px',
          background: 'linear-gradient(145deg, #3b82f6 0%, #1e40af 100%)',
          borderRadius: 16,
          border: '4px solid rgba(96, 165, 250, 0.6)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
        }}>
          <span style={{
            fontSize: 36,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
          }}>CYP450</span>
        </div>

        <div style={{
          fontSize: 48,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: '300',
          margin: '20px 0',
        }}>↓</div>

        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 80px rgba(239, 68, 68, 0.5), 0 0 140px rgba(239, 68, 68, 0.2)',
          border: '5px solid rgba(252, 165, 165, 0.6)',
          transform: `scale(${pulse(t.napqi)})`,
          opacity: fadeIn(t.napqi),
        }}>
          <span style={{
            fontSize: 36,
            fontWeight: '800',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            letterSpacing: 2,
          }}>NAPQI</span>
          <SkullIcon size={50} color="#fff" />
        </div>

        <div style={{
          marginTop: 30,
          fontSize: 28,
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontWeight: '600',
          textShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
        }}>
          TOXIC Metabolite
        </div>
      </div>
    );
  };

  const renderGlutathioneSaves = () => {
    if (currentVisual !== 'glutathione-saves') return null;
    const opacity = fadeIn(t.glutathione - 10) * (localFrame > t.wholeBottle - 18 ? fadeOut(t.wholeBottle - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.glutathione - 10)}) translateY(${slideUp(t.glutathione - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          marginBottom: 25,
        }}>
          Normally? No problem!
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <div style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
            border: '4px solid rgba(252, 165, 165, 0.5)',
            opacity: 0.6,
          }}>
            <span style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#fff',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>NAPQI</span>
          </div>

          <div style={{
            fontSize: 60,
            color: '#22c55e',
            fontWeight: '300',
          }}>+</div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: fadeIn(t.glutathione),
            transform: `scale(${scaleIn(t.glutathione)})`,
          }}>
            <ShieldIcon size={100} color="#22c55e" active={true} />
            <span style={{
              marginTop: 10,
              fontSize: 26,
              fontWeight: '700',
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>GLUTATHIONE</span>
          </div>
        </div>

        <div style={{
          fontSize: 48,
          color: 'rgba(255,255,255,0.4)',
          fontWeight: '300',
          margin: '25px 0',
        }}>↓</div>

        <div style={{
          padding: '30px 60px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: 20,
          border: '4px solid #22c55e',
          boxShadow: '0 0 50px rgba(34, 197, 94, 0.3)',
          opacity: fadeIn(t.tacklesNapqi),
        }}>
          <div style={{
            fontSize: 36,
            fontWeight: '700',
            color: '#22c55e',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>
            NEUTRALIZED!
          </div>
        </div>

        <div style={{
          marginTop: 25,
          fontSize: 26,
          color: '#86efac',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          opacity: fadeIn(t.bodyguard),
        }}>
          Glutathione = Your liver's BODYGUARD
        </div>
      </div>
    );
  };

  const renderOverdoseChaos = () => {
    if (currentVisual !== 'overdose-chaos') return null;
    const opacity = fadeIn(t.wholeBottle - 10) * (localFrame > t.destroys - 18 ? fadeOut(t.destroys - 18) : 1);
    const napqiCount = Math.min(8, Math.floor((localFrame - t.napqiPiling + 10) / 5) + 1);
    const glutathioneCount = Math.max(0, 4 - Math.floor((localFrame - t.depleted + 10) / 8));

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.wholeBottle - 10)}) translate(${shake(t.overwhelmed, 25, 6).x}px, ${shake(t.overwhelmed, 25, 6).y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 42,
          fontWeight: '700',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
          marginBottom: 30,
        }}>
          WHOLE BOTTLE = DISASTER
        </div>

        <div style={{
          display: 'flex',
          gap: 60,
          alignItems: 'center',
        }}>
          {/* NAPQI piling up */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'relative',
              width: 200,
              height: 200,
            }}>
              {Array.from({ length: napqiCount }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 50 + (i % 3) * 25;
                const x = 100 + Math.cos(angle) * r - 30;
                const y = 100 + Math.sin(angle) * r - 30;
                const jitter = Math.sin(localFrame * 0.15 + i * 1.5) * 4;

                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: x + jitter,
                    top: y + jitter,
                    width: 55,
                    height: 55,
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                    border: '2px solid rgba(252, 165, 165, 0.6)',
                    transform: `scale(${scaleIn(t.napqiPiling + i * 5)})`,
                  }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#fff',
                    }}>NAPQI</span>
                  </div>
                );
              })}
            </div>
            <span style={{
              fontSize: 24,
              color: '#ef4444',
              fontWeight: '600',
              marginTop: 10,
            }}>NAPQI PILING UP</span>
          </div>

          {/* Glutathione depleting */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              width: 150,
              justifyContent: 'center',
            }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ShieldIcon
                  key={i}
                  size={55}
                  color={i < glutathioneCount ? '#22c55e' : '#6b7280'}
                  active={i < glutathioneCount}
                />
              ))}
            </div>
            <span style={{
              fontSize: 24,
              color: localFrame >= t.depleted ? '#ef4444' : '#fbbf24',
              fontWeight: '600',
              marginTop: 15,
            }}>
              {localFrame >= t.depleted ? 'DEPLETED!' : 'Depleting...'}
            </span>
          </div>
        </div>

        <div style={{
          marginTop: 35,
          fontSize: 30,
          color: '#fbbf24',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontWeight: '600',
          opacity: fadeIn(t.overwhelmed),
        }}>
          Glucuronidation OVERWHELMED
        </div>
      </div>
    );
  };

  const renderLiverDeath = () => {
    if (currentVisual !== 'liver-death') return null;
    const opacity = fadeIn(t.destroys - 10) * (localFrame > t.terrifying - 18 ? fadeOut(t.terrifying - 18) : 1);
    const damage = interpolate(localFrame, [t.destroys - 10, t.destroys + 30], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.destroys - 10)}) translate(${shake(t.destroys, 20, 8).x}px, ${shake(t.destroys, 20, 8).y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <LiverIcon size={180} healthy={false} damage={damage} frame={localFrame} />

        <div style={{
          marginTop: 30,
          fontSize: 44,
          fontWeight: '700',
          color: '#ef4444',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
        }}>
          NAPQI DESTROYS HEPATOCYTES
        </div>

        <div style={{
          marginTop: 25,
          padding: '25px 45px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderRadius: 18,
          border: '4px solid #ef4444',
          opacity: fadeIn(t.zone3),
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#ef4444',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>
            Zone 3 Necrosis
          </div>
          <div style={{
            fontSize: 24,
            color: '#fca5a5',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 10,
            opacity: fadeIn(t.centrilobular),
          }}>
            CENTRILOBULAR Pattern
          </div>
          <div style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            marginTop: 8,
          }}>
            (USMLE Buzzword!)
          </div>
        </div>
      </div>
    );
  };

  const renderSilentKiller = () => {
    if (currentVisual !== 'silent-killer') return null;
    const opacity = fadeIn(t.terrifying - 10) * (localFrame > t.enterNac - 18 ? fadeOut(t.enterNac - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.terrifying - 10)}) translateY(${slideUp(t.terrifying - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 38,
          fontWeight: '700',
          color: '#fbbf24',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
          marginBottom: 30,
        }}>
          THE TERRIFYING PART:
        </div>

        <div style={{
          display: 'flex',
          gap: 60,
          alignItems: 'center',
        }}>
          <div style={{
            padding: '35px 50px',
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 20,
            border: '4px solid #22c55e',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 28,
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '600',
            }}>First 24 hours:</div>
            <div style={{
              fontSize: 42,
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '700',
              marginTop: 10,
            }}>Patient feels FINE</div>
          </div>

          <div style={{
            fontSize: 60,
            color: 'rgba(255,255,255,0.3)',
          }}>BUT</div>

          <div style={{
            padding: '35px 50px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 20,
            border: '4px solid #ef4444',
            textAlign: 'center',
            opacity: fadeIn(t.liverDestroyed),
          }}>
            <div style={{
              fontSize: 28,
              color: '#ef4444',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '600',
            }}>Meanwhile:</div>
            <div style={{
              fontSize: 36,
              color: '#ef4444',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '700',
              marginTop: 10,
            }}>Liver is being</div>
            <div style={{
              fontSize: 42,
              color: '#ef4444',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              fontWeight: '800',
            }}>DESTROYED</div>
          </div>
        </div>

        <div style={{
          marginTop: 35,
          padding: '25px 45px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 18,
          border: '3px solid #ef4444',
          opacity: fadeIn(t.hourSeventyTwo),
        }}>
          <div style={{
            fontSize: 26,
            color: '#fca5a5',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            By hour 72: Fulminant failure → DEATH
          </div>
        </div>
      </div>
    );
  };

  const renderNacRescue = () => {
    if (currentVisual !== 'nac-rescue') return null;
    const opacity = fadeIn(t.enterNac - 10) * (localFrame > t.liverSurvives - 18 ? fadeOut(t.liverSurvives - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.enterNac - 10)}) translateY(${slideUp(t.enterNac - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 80px rgba(34, 197, 94, 0.5), 0 0 160px rgba(34, 197, 94, 0.2)',
          border: '5px solid rgba(134, 239, 172, 0.6)',
          transform: `scale(${pulse(t.enterNac)})`,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>N-ACETYL-</span>
          <span style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#fff',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          }}>CYSTEINE</span>
          <span style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#fff',
            marginTop: 5,
          }}>(NAC)</span>
        </div>

        <div style={{
          marginTop: 30,
          fontSize: 36,
          fontWeight: '700',
          color: '#22c55e',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          textShadow: '0 0 40px rgba(34, 197, 94, 0.5)',
          opacity: fadeIn(t.antidote),
        }}>
          THE ANTIDOTE!
        </div>

        <div style={{
          marginTop: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: 15,
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: 26,
            color: '#86efac',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            opacity: fadeIn(t.cysteine),
          }}>
            NAC provides CYSTEINE
          </div>
          <div style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.4)',
          }}>↓</div>
          <div style={{
            fontSize: 26,
            color: '#22c55e',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            fontWeight: '600',
            opacity: fadeIn(t.rebuildGlutathione),
          }}>
            REBUILDS Glutathione
          </div>
          <div style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.4)',
          }}>↓</div>
          <div style={{
            padding: '20px 40px',
            background: 'rgba(34, 197, 94, 0.2)',
            borderRadius: 16,
            border: '3px solid #22c55e',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            }}>
              NAPQI Neutralized → LIVER SURVIVES!
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTiming = () => {
    if (currentVisual !== 'timing') return null;
    const opacity = fadeIn(t.liverSurvives - 10) * (localFrame > t.rumackMatthew - 18 ? fadeOut(t.rumackMatthew - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.liverSurvives - 10)}) translateY(${slideUp(t.liverSurvives - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          marginBottom: 35,
        }}>
          <ClockIcon size={50} color="#fbbf24" />
          <div style={{
            fontSize: 46,
            fontWeight: '700',
            color: '#fbbf24',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            textShadow: '0 0 50px rgba(251, 191, 36, 0.5)',
          }}>
            TIMING IS EVERYTHING!
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{
            padding: '22px 40px',
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 16,
            border: '3px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: 25,
            opacity: fadeIn(t.eightHours),
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#22c55e',
            }}>&lt;8 hours:</span>
            <span style={{
              fontSize: 26,
              color: '#86efac',
            }}>~100% effective</span>
            <span style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#22c55e',
            }}>GIVE IT!</span>
          </div>

          <div style={{
            padding: '22px 40px',
            background: 'rgba(251, 191, 36, 0.15)',
            borderRadius: 16,
            border: '3px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: 25,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#fbbf24',
            }}>8-24 hours:</span>
            <span style={{
              fontSize: 26,
              color: '#fde68a',
            }}>Still helps significantly</span>
            <span style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#fbbf24',
            }}>GIVE IT!</span>
          </div>

          <div style={{
            padding: '22px 40px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 16,
            border: '3px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 25,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#ef4444',
            }}>&gt;24 hours:</span>
            <span style={{
              fontSize: 26,
              color: '#fca5a5',
            }}>May be too late BUT...</span>
            <span style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#ef4444',
            }}>STILL GIVE IT!</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDosing = () => {
    if (currentVisual !== 'dosing') return null;
    const opacity = fadeIn(t.rumackMatthew - 10) * (localFrame > t.savePatient - 18 ? fadeOut(t.savePatient - 18) : 1);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.rumackMatthew - 10)}) translateY(${slideUp(t.rumackMatthew - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          padding: '30px 50px',
          background: 'rgba(147, 51, 234, 0.1)',
          borderRadius: 24,
          border: '4px solid rgba(147, 51, 234, 0.5)',
          boxShadow: '0 0 50px rgba(147, 51, 234, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 25,
          }}>
            <SyringeIcon size={36} color="#9333ea" />
            <span style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#9333ea',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              letterSpacing: 2,
            }}>CLINICAL PEARL</span>
          </div>

          <div style={{
            fontSize: 24,
            color: '#c4b5fd',
            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
            fontWeight: '600',
            marginBottom: 20,
            textAlign: 'center',
          }}>
            RUMACK-MATTHEW NOMOGRAM
          </div>

          <div style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            textAlign: 'center',
            marginBottom: 25,
          }}>
            Plot acetaminophen level vs. time → Above line? TREAT!
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 16,
            padding: '20px 30px',
            border: '3px solid rgba(34, 197, 94, 0.5)',
            opacity: fadeIn(t.loadingDose),
          }}>
            <div style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#22c55e',
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              marginBottom: 15,
            }}>NAC Protocol (21-hour):</div>
            <div style={{
              fontSize: 18,
              color: '#86efac',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              lineHeight: 1.8,
            }}>
              <div>• 150 mg/kg over 1 hour (loading)</div>
              <div>• 50 mg/kg over 4 hours</div>
              <div>• 100 mg/kg over 16 hours</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (currentVisual !== 'summary') return null;
    const opacity = fadeIn(t.savePatient - 10);

    return (
      <div style={{
        opacity,
        transform: `scale(${scaleIn(t.savePatient - 10)}) translateY(${slideUp(t.savePatient - 10)}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 40,
          fontWeight: '700',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          background: 'linear-gradient(90deg, #f59e0b, #ef4444, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 35,
        }}>
          NOW YOU KNOW!
        </div>

        <div style={{
          display: 'flex',
          gap: 40,
        }}>
          <div style={{
            padding: '30px 40px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 20,
            border: '3px solid #ef4444',
            textAlign: 'center',
          }}>
            <PillIcon size={60} color="#f59e0b" />
            <div style={{
              fontSize: 24,
              color: '#ef4444',
              fontWeight: '600',
              marginTop: 15,
            }}>Tylenol OD</div>
            <div style={{
              fontSize: 18,
              color: '#fca5a5',
              marginTop: 8,
            }}>Silent Killer</div>
          </div>

          <div style={{
            fontSize: 50,
            color: 'rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
          }}>→</div>

          <div style={{
            padding: '30px 40px',
            background: 'rgba(34, 197, 94, 0.15)',
            borderRadius: 20,
            border: '3px solid #22c55e',
            textAlign: 'center',
          }}>
            <ShieldIcon size={60} color="#22c55e" active={true} />
            <div style={{
              fontSize: 24,
              color: '#22c55e',
              fontWeight: '600',
              marginTop: 15,
            }}>NAC</div>
            <div style={{
              fontSize: 18,
              color: '#86efac',
              marginTop: 8,
            }}>The Cure</div>
          </div>
        </div>

        <div style={{
          marginTop: 35,
          fontSize: 26,
          color: 'rgba(255,255,255,0.8)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          textAlign: 'center',
        }}>
          Don't let YOUR patient walk out feeling fine<br />
          and come back in a body bag.
        </div>
      </div>
    );
  };

  // Phase color
  let phaseColor = '#ef4444';
  if (['normal-metabolism', 'glutathione-saves'].includes(currentVisual)) phaseColor = '#22c55e';
  else if (['napqi-creation', 'overdose-chaos', 'liver-death', 'silent-killer'].includes(currentVisual)) phaseColor = '#ef4444';
  else if (['nac-rescue', 'timing', 'summary'].includes(currentVisual)) phaseColor = '#22c55e';
  else if (currentVisual === 'dosing') phaseColor = '#9333ea';

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

      {/* Main container */}
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

        {/* Animated border */}
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
          {renderNormalMetabolism()}
          {renderNapqiCreation()}
          {renderGlutathioneSaves()}
          {renderOverdoseChaos()}
          {renderLiverDeath()}
          {renderSilentKiller()}
          {renderNacRescue()}
          {renderTiming()}
          {renderDosing()}
          {renderSummary()}
        </div>

        {/* Phase indicator */}
        <div style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 14,
          fontSize: 11,
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 18px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          {[
            { label: 'Normal', phases: ['normal-metabolism', 'glutathione-saves'], color: '#22c55e' },
            { label: 'Toxic', phases: ['napqi-creation'], color: '#ef4444' },
            { label: 'Overdose', phases: ['overdose-chaos', 'liver-death', 'silent-killer'], color: '#ef4444' },
            { label: 'NAC', phases: ['nac-rescue', 'timing'], color: '#22c55e' },
            { label: 'Pearl', phases: ['dosing', 'summary'], color: '#9333ea' },
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

export default AcetaminophenMechanism;
