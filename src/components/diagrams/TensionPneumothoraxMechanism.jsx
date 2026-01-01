import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * TensionPneumothoraxMechanism - Scene-Based Mechanism Diagram
 *
 * Phase 1: ONE-WAY VALVE (Problem) - Red
 * Phase 2: COMPRESSION (Danger) - Yellow
 * Phase 3: NEEDLE DECOMPRESSION (Solution) - Green
 * Phase 4: CLINICAL PEARL - Purple
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

// ===== AIR PARTICLE COMPONENT =====
const AirParticle = ({ x, y, frame, delay, expanding = false }) => {
  if (frame < delay) return null;

  const cycleLength = 60;
  const progress = ((frame - delay) % cycleLength) / cycleLength;
  const floatY = Math.sin(progress * Math.PI * 2) * 8;
  const floatX = Math.cos(progress * Math.PI * 3) * 5;

  const size = expanding ? 8 + (frame - delay) * 0.1 : 8;
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      left: x + floatX,
      top: y + floatY,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(147, 197, 253, 0.8)',
      boxShadow: '0 0 10px rgba(147, 197, 253, 0.5)',
      opacity,
      pointerEvents: 'none',
    }} />
  );
};

// ===== LUNG ICON =====
const LungIcon = ({ x, y, size = 120, collapsed = false, frame }) => {
  const breathe = collapsed ? 0.6 : 1 + Math.sin(frame * 0.08) * 0.04;
  const color = collapsed ? '#6b7280' : '#60a5fa';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${breathe})`,
        transformOrigin: 'center',
      }}
    >
      <path
        d="M12 2v8m0 0c-3 0-6 3-6 8s3 6 6 6m0-14c3 0 6 3 6 8s-3 6-6 6"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 12c-2 0-4 2-4 5s2 5 4 5"
        stroke={color}
        strokeWidth="2"
        fill={collapsed ? '#374151' : '#3b82f6'}
        fillOpacity="0.3"
      />
      <path
        d="M16 12c2 0 4 2 4 5s-2 5-4 5"
        stroke={color}
        strokeWidth="2"
        fill={collapsed ? '#374151' : '#3b82f6'}
        fillOpacity="0.3"
      />
    </svg>
  );
};

// ===== HEART ICON =====
const HeartIcon = ({ x, y, size = 80, kinked = false, frame }) => {
  const beat = kinked ? 1 : 1 + Math.sin(frame * 0.2) * 0.08;
  const color = kinked ? '#ef4444' : '#ec4899';
  const rotation = kinked ? 15 + Math.sin(frame * 0.1) * 3 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${beat}) rotate(${rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      {kinked && (
        <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" opacity="0.6" />
      )}
    </svg>
  );
};

// ===== NEEDLE ICON =====
const NeedleIcon = ({ x, y, size = 60, inserting = false, frame, delay = 0 }) => {
  if (frame < delay) return null;

  const insertProgress = inserting ? getProgress(frame - delay, 0, 30) : 0;
  const needleX = x - insertProgress * 40;
  const rotation = -45;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: needleX,
        top: y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        opacity: getProgress(frame - delay, 0, 15),
      }}
    >
      <defs>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <line x1="4" y1="20" x2="20" y2="4" stroke="url(#needleGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="4" r="3" fill="#22c55e" />
      <line x1="16" y1="8" x2="20" y2="4" stroke="#22c55e" strokeWidth="2" />
    </svg>
  );
};

// ===== MAIN COMPONENT =====
export const TensionPneumothoraxMechanism = ({ startTime, playbackRate = 1.9 }) => {
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
    if (localFrame < t.builds - 8) return 'valve';
    if (localFrame < t.pops - 8) return 'compression';
    if (localFrame < t.fail - 8) return 'solution';
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
    const opacity = getProgress(localFrame, 0, 20) * (localFrame > t.builds - 20 ? 1 - getProgress(localFrame, t.builds - 20, 15) : 1);

    const puncturedOpacity = getProgress(localFrame, t.punctured, 15);
    const valveOpacity = getProgress(localFrame, t.valve, 15);
    const airInOpacity = getProgress(localFrame, t.airIn, 12);
    const cantOutOpacity = getProgress(localFrame, t.cantGetOut, 12);
    const roachOpacity = getProgress(localFrame, t.roachMotel, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        height: '100%',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 36,
          fontWeight: '700',
          color: '#ef4444',
          textShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
          marginBottom: 25,
          opacity: puncturedOpacity,
          transform: `scale(${getSpring(localFrame, t.punctured, fps)})`,
        }}>
          Broken Rib PUNCTURED the Lung
        </div>

        {/* Lung diagram with one-way valve */}
        <div style={{ position: 'relative', width: 500, height: 350 }}>
          {/* Chest wall */}
          <div style={{
            position: 'absolute',
            left: 50,
            top: 20,
            width: 400,
            height: 300,
            borderRadius: 30,
            border: '4px solid rgba(255,255,255,0.3)',
            background: 'rgba(0,0,0,0.3)',
          }} />

          {/* Left lung (healthy) */}
          <div style={{
            position: 'absolute',
            left: 80,
            top: 60,
            width: 120,
            height: 200,
            borderRadius: '60px 30px 30px 60px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            opacity: 0.8,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
          }}>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 16,
              color: '#fff',
              fontWeight: '600',
            }}>LEFT</span>
          </div>

          {/* Right lung (punctured) */}
          <div style={{
            position: 'absolute',
            right: 80,
            top: 60,
            width: 120,
            height: 200,
            borderRadius: '30px 60px 60px 30px',
            background: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)',
            opacity: puncturedOpacity * 0.8,
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
            transform: `scale(${0.6 + getProgress(localFrame, t.punctured, 30) * 0.4})`,
          }}>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 16,
              color: '#ef4444',
              fontWeight: '600',
            }}>RIGHT</span>

            {/* Puncture hole */}
            <div style={{
              position: 'absolute',
              top: 40,
              left: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 15px #ef4444',
              opacity: puncturedOpacity,
            }} />
          </div>

          {/* ONE-WAY VALVE visualization */}
          {localFrame >= t.valve && (
            <div style={{
              position: 'absolute',
              right: 190,
              top: 90,
              opacity: valveOpacity,
              transform: `scale(${getSpring(localFrame, t.valve, fps)})`,
            }}>
              <div style={{
                padding: '12px 20px',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                border: '3px solid #ef4444',
              }}>
                <div style={{ fontSize: 18, color: '#ef4444', fontWeight: '700' }}>ONE-WAY VALVE</div>
              </div>
              {/* Arrow showing air going IN */}
              <div style={{
                fontSize: 40,
                color: '#22c55e',
                marginTop: 10,
                textAlign: 'center',
                opacity: airInOpacity,
              }}>→</div>
              <div style={{
                fontSize: 14,
                color: '#22c55e',
                textAlign: 'center',
                opacity: airInOpacity,
              }}>Air IN</div>

              {/* X showing can't get out */}
              <div style={{
                fontSize: 40,
                color: '#ef4444',
                marginTop: 5,
                textAlign: 'center',
                opacity: cantOutOpacity,
              }}>✕←</div>
              <div style={{
                fontSize: 14,
                color: '#ef4444',
                textAlign: 'center',
                opacity: cantOutOpacity,
              }}>CAN'T get out!</div>
            </div>
          )}

          {/* Air particles accumulating */}
          {localFrame > t.airIn && Array.from({ length: 8 }).map((_, i) => (
            <AirParticle
              key={i}
              x={300 + Math.cos(i * 0.8) * 50}
              y={120 + Math.sin(i * 0.9) * 60 + (i % 3) * 30}
              frame={localFrame}
              delay={t.airIn + i * 8}
              expanding={true}
            />
          ))}
        </div>

        {/* Roach motel analogy */}
        <div style={{
          marginTop: 30,
          padding: '20px 40px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderRadius: 16,
          border: '3px solid #ef4444',
          opacity: roachOpacity,
          transform: `scale(${getSpring(localFrame, t.roachMotel, fps)})`,
        }}>
          <div style={{ fontSize: 26, color: '#fca5a5', textAlign: 'center' }}>
            Like a <span style={{ color: '#ef4444', fontWeight: '700' }}>ROACH MOTEL</span> for air
          </div>
          <div style={{ fontSize: 22, color: '#fca5a5', textAlign: 'center', marginTop: 8 }}>
            Checks in, <span style={{ color: '#ef4444', fontWeight: '700' }}>NEVER</span> checks out
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 2: COMPRESSION =====
  const renderCompression = () => {
    if (phase !== 'compression') return null;
    const opacity = getProgress(localFrame, t.builds - 8, 20) * (localFrame > t.pops - 20 ? 1 - getProgress(localFrame, t.pops - 20, 15) : 1);
    const shake = getShake(localFrame, t.kinked, 30, 10);

    const buildsOpacity = getProgress(localFrame, t.builds, 12);
    const crushesOpacity = getProgress(localFrame, t.crushes, 12);
    const shovingOpacity = getProgress(localFrame, t.shoving, 12);
    const kinkedOpacity = getProgress(localFrame, t.kinked, 12);
    const pinchedOpacity = getProgress(localFrame, t.pinched, 12);
    const jvdOpacity = getProgress(localFrame, t.jvd, 12);
    const tensionOpacity = getProgress(localFrame, t.tension, 15);

    // Calculate mediastinal shift
    const shiftProgress = interpolate(localFrame, [t.shoving, t.shoving + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const mediastinalShift = shiftProgress * 60;

    return (
      <div style={{
        opacity,
        transform: `translate(${shake.x}px, ${shake.y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        gap: 12,
      }}>
        {/* Title */}
        <div style={{
          fontSize: 30,
          fontWeight: '700',
          color: '#fbbf24',
          textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
          opacity: buildsOpacity,
          transform: `scale(${getPulse(localFrame, t.builds, 0.12, 0.06)})`,
        }}>
          Air BUILDS and BUILDS...
        </div>

        {/* Chest diagram showing compression - more compact */}
        <div style={{ position: 'relative', width: 500, height: 260 }}>
          {/* Chest wall */}
          <div style={{
            position: 'absolute',
            left: 25,
            top: 5,
            width: 450,
            height: 230,
            borderRadius: 25,
            border: '3px solid rgba(255,255,255,0.3)',
            background: 'rgba(0,0,0,0.3)',
          }} />

          {/* Left lung (healthy) */}
          <div style={{
            position: 'absolute',
            left: 55 - mediastinalShift * 0.3,
            top: 30,
            width: 90 - mediastinalShift * 0.3,
            height: 160,
            borderRadius: '45px 20px 20px 45px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: '600' }}>LEFT</span>
            <span style={{ fontSize: 10, color: '#93c5fd', position: 'absolute', bottom: 8 }}>(Healthy)</span>
          </div>

          {/* Right lung (collapsed) */}
          <div style={{
            position: 'absolute',
            right: 120 + mediastinalShift * 0.5,
            top: 55,
            width: 50,
            height: 100,
            borderRadius: '12px 25px 25px 12px',
            background: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)',
            opacity: crushesOpacity,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
          }} />

          {/* Heart (shifting and kinked) */}
          <div style={{
            position: 'absolute',
            left: 195 - mediastinalShift,
            top: 60,
            transform: `rotate(${kinkedOpacity * 20}deg)`,
          }}>
            <HeartIcon x={0} y={0} size={70} kinked={localFrame >= t.kinked} frame={localFrame} />
          </div>

          {/* Trapped air (expanding) */}
          <div style={{
            position: 'absolute',
            right: 50,
            top: 30,
            width: 100 + mediastinalShift,
            height: 170,
            borderRadius: 16,
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, rgba(147, 197, 253, 0.1) 70%)',
            border: '2px dashed rgba(147, 197, 253, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: buildsOpacity,
          }}>
            <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: '600' }}>TRAPPED<br/>AIR</span>
          </div>

          {/* Arrows showing shift */}
          {localFrame >= t.shoving && (
            <div style={{
              position: 'absolute',
              right: 170,
              top: 100,
              fontSize: 40,
              color: '#fbbf24',
              opacity: shovingOpacity,
              transform: `translateX(${Math.sin(localFrame * 0.15) * 8}px)`,
            }}>
              ←
            </div>
          )}
        </div>

        {/* Effects - 2x2 grid layout for better spacing */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          width: '100%',
          maxWidth: 480,
        }}>
          <div style={{
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 10,
            border: '2px solid #ef4444',
            opacity: kinkedOpacity,
            transform: `scale(${getSpring(localFrame, t.kinked, fps)})`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#ef4444', fontWeight: '700' }}>Heart KINKED</div>
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 10,
            border: '2px solid #ef4444',
            opacity: pinchedOpacity,
            transform: `scale(${getSpring(localFrame, t.pinched, fps)})`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#ef4444', fontWeight: '700' }}>Vena Cava PINCHED</div>
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(251, 191, 36, 0.15)',
            borderRadius: 10,
            border: '2px solid #fbbf24',
            opacity: jvdOpacity,
            transform: `scale(${getSpring(localFrame, t.jvd, fps)})`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#fbbf24', fontWeight: '700' }}>JVD ↑</div>
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 10,
            border: '2px solid #ef4444',
            opacity: jvdOpacity,
            transform: `scale(${getSpring(localFrame, t.jvd + 10, fps)})`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#ef4444', fontWeight: '700' }}>BP CRASHING ↓</div>
          </div>
        </div>

        {/* TENSION warning - more compact */}
        <div style={{
          marginTop: 8,
          padding: '14px 35px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 14,
          border: '3px solid #ef4444',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
          opacity: tensionOpacity,
          transform: `scale(${getSpring(localFrame, t.tension, fps) * getPulse(localFrame, t.tension, 0.1, 0.05)})`,
        }}>
          <div style={{ fontSize: 22, color: '#ef4444', fontWeight: '800', textAlign: 'center' }}>
            TENSION PHYSIOLOGY → KILLS in MINUTES
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 3: SOLUTION =====
  const renderSolution = () => {
    if (phase !== 'solution') return null;
    const opacity = getProgress(localFrame, t.pops - 8, 20) * (localFrame > t.fail - 20 ? 1 - getProgress(localFrame, t.fail - 20, 15) : 1);

    const popsOpacity = getProgress(localFrame, t.pops, 12);
    const simpleOpacity = getProgress(localFrame, t.simple, 12);
    const fourteenOpacity = getProgress(localFrame, t.fourteen, 12);
    const secondOpacity = getProgress(localFrame, t.second, 12);
    const hissOpacity = getProgress(localFrame, t.hiss, 12);
    const climbOpacity = getProgress(localFrame, t.climb, 15);

    return (
      <div style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
      }}>
        {/* Title */}
        <div style={{
          fontSize: 36,
          fontWeight: '700',
          color: '#22c55e',
          textShadow: '0 0 40px rgba(34, 197, 94, 0.5)',
          marginBottom: 20,
          opacity: popsOpacity,
          transform: `scale(${getSpring(localFrame, t.pops, fps)})`,
        }}>
          Needle Decompression POPS the Pressure!
        </div>

        {/* Chest diagram with needle */}
        <div style={{ position: 'relative', width: 500, height: 280 }}>
          {/* Chest wall */}
          <div style={{
            position: 'absolute',
            left: 50,
            top: 10,
            width: 400,
            height: 250,
            borderRadius: 30,
            border: '4px solid rgba(34, 197, 94, 0.4)',
            background: 'rgba(0,0,0,0.3)',
          }} />

          {/* Left lung */}
          <div style={{
            position: 'absolute',
            left: 80,
            top: 40,
            width: 120,
            height: 180,
            borderRadius: '60px 30px 30px 60px',
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            opacity: 0.8,
          }} />

          {/* Right lung (re-expanding) */}
          <div style={{
            position: 'absolute',
            right: 80,
            top: 40,
            width: 100 + simpleOpacity * 20,
            height: 150 + simpleOpacity * 30,
            borderRadius: '30px 60px 60px 30px',
            background: `linear-gradient(180deg, ${simpleOpacity > 0.5 ? '#3b82f6' : '#6b7280'} 0%, ${simpleOpacity > 0.5 ? '#1d4ed8' : '#374151'} 100%)`,
            opacity: 0.8,
            transition: 'all 0.3s',
          }}>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 14,
              color: simpleOpacity > 0.5 ? '#22c55e' : '#fbbf24',
              fontWeight: '700',
            }}>{simpleOpacity > 0.5 ? 'SIMPLE' : 'TENSION'}</span>
          </div>

          {/* Needle insertion */}
          <div style={{
            position: 'absolute',
            right: 40,
            top: 30,
            transform: 'rotate(-45deg)',
            opacity: fourteenOpacity,
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24">
              <line x1="4" y1="20" x2="18" y2="6" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="18" cy="6" r="4" fill="#22c55e" />
            </svg>
          </div>

          {/* Air escaping (hiss) */}
          {localFrame >= t.hiss && Array.from({ length: 10 }).map((_, i) => {
            const progress = ((localFrame - t.hiss + i * 5) % 40) / 40;
            const x = 380 + progress * 80;
            const y = 50 + Math.sin(i + localFrame * 0.2) * 20;
            const fadeOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#93c5fd',
                  boxShadow: '0 0 8px #93c5fd',
                  opacity: fadeOpacity * hissOpacity,
                }}
              />
            );
          })}

          {/* HISS label */}
          <div style={{
            position: 'absolute',
            right: -20,
            top: 80,
            fontSize: 24,
            color: '#22c55e',
            fontWeight: '700',
            fontStyle: 'italic',
            opacity: hissOpacity,
          }}>
            *HISS*
          </div>
        </div>

        {/* Technique box */}
        <div style={{
          marginTop: 25,
          padding: '20px 35px',
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: 16,
          border: '3px solid #22c55e',
          opacity: secondOpacity,
          transform: `scale(${getSpring(localFrame, t.second, fps)})`,
        }}>
          <div style={{ fontSize: 24, color: '#22c55e', fontWeight: '700', textAlign: 'center' }}>
            14-16 gauge needle
          </div>
          <div style={{ fontSize: 22, color: '#86efac', textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontWeight: '700' }}>2nd ICS</span> midclavicular line
          </div>
          <div style={{ fontSize: 18, color: '#86efac', textAlign: 'center', marginTop: 5 }}>
            (2 finger-widths below clavicle)
          </div>
        </div>

        {/* Result */}
        <div style={{
          marginTop: 20,
          padding: '18px 40px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: 16,
          border: '4px solid #22c55e',
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)',
          opacity: climbOpacity,
          transform: `scale(${getSpring(localFrame, t.climb, fps)})`,
        }}>
          <div style={{ fontSize: 26, color: '#22c55e', fontWeight: '700', textAlign: 'center' }}>
            Blood Pressure CLIMBS Back! ↑
          </div>
        </div>
      </div>
    );
  };

  // ===== PHASE 4: CLINICAL PEARL =====
  const renderPearl = () => {
    if (phase !== 'pearl') return null;
    const opacity = getProgress(localFrame, t.fail - 8, 20);

    const failOpacity = getProgress(localFrame, t.fail, 12);
    const xrayOpacity = getProgress(localFrame, t.xray, 12);
    const clinicalOpacity = getProgress(localFrame, t.clinical, 12);
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
      }}>
        {/* Why traps fail */}
        <div style={{
          fontSize: 28,
          fontWeight: '700',
          color: '#fbbf24',
          marginBottom: 20,
          opacity: failOpacity,
        }}>
          Why Do Trap Answers FAIL?
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 25, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 12,
            border: '2px solid #ef4444',
            opacity: xrayOpacity,
            maxWidth: 200,
          }}>
            <div style={{ fontSize: 18, color: '#ef4444', fontWeight: '700' }}>X-ray?</div>
            <div style={{ fontSize: 14, color: '#fca5a5' }}>Takes too LONG - CLINICAL diagnosis!</div>
          </div>

          <div style={{
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 12,
            border: '2px solid #ef4444',
            opacity: getProgress(localFrame, t.pericardiocentesis, 12),
            maxWidth: 200,
          }}>
            <div style={{ fontSize: 18, color: '#ef4444', fontWeight: '700' }}>Pericardiocentesis?</div>
            <div style={{ fontSize: 14, color: '#fca5a5' }}>That's for TAMPONADE - different triad!</div>
          </div>

          <div style={{
            padding: '12px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 12,
            border: '2px solid #ef4444',
            opacity: getProgress(localFrame, t.fluids, 12),
            maxWidth: 200,
          }}>
            <div style={{ fontSize: 18, color: '#ef4444', fontWeight: '700' }}>IV Fluids?</div>
            <div style={{ fontSize: 14, color: '#fca5a5' }}>Can't fill a CRUSHED heart!</div>
          </div>
        </div>

        {/* TENSION TRIAD box */}
        <div style={{
          padding: '22px 40px',
          background: 'rgba(147, 51, 234, 0.15)',
          borderRadius: 18,
          border: '4px solid rgba(147, 51, 234, 0.6)',
          boxShadow: '0 0 50px rgba(147, 51, 234, 0.3)',
          marginBottom: 20,
          opacity: triadOpacity,
          transform: `scale(${getSpring(localFrame, t.tensionTriad, fps)})`,
        }}>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#9333ea', marginBottom: 15, textAlign: 'center' }}>
            TENSION TRIAD
          </div>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              padding: '10px 18px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 10,
              border: '2px solid #ef4444',
            }}>
              <span style={{ fontSize: 18, color: '#ef4444', fontWeight: '600' }}>Tracheal Deviation</span>
            </div>
            <div style={{
              padding: '10px 18px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: 10,
              border: '2px solid #fbbf24',
            }}>
              <span style={{ fontSize: 18, color: '#fbbf24', fontWeight: '600' }}>JVD</span>
            </div>
            <div style={{
              padding: '10px 18px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 10,
              border: '2px solid #ef4444',
            }}>
              <span style={{ fontSize: 18, color: '#ef4444', fontWeight: '600' }}>Absent Breath Sounds</span>
            </div>
          </div>
        </div>

        {/* DECOMPRESS command */}
        <div style={{
          padding: '18px 50px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: 18,
          border: '4px solid #22c55e',
          boxShadow: '0 0 50px rgba(34, 197, 94, 0.4)',
          marginBottom: 15,
          opacity: decompressOpacity,
          transform: `scale(${getSpring(localFrame, t.decompress, fps) * getPulse(localFrame, t.decompress, 0.1, 0.05)})`,
        }}>
          <div style={{ fontSize: 28, color: '#22c55e', fontWeight: '800', textAlign: 'center' }}>
            Don't Think. Don't Image. DECOMPRESS!
          </div>
          <div style={{ fontSize: 20, color: '#86efac', textAlign: 'center', marginTop: 10 }}>
            2nd ICS midclavicular OR 5th ICS anterior axillary
          </div>
        </div>

        {/* Welcome */}
        <div style={{
          fontSize: 28,
          fontWeight: '700',
          background: 'linear-gradient(90deg, #f59e0b, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: welcomeOpacity,
          transform: `scale(${getSpring(localFrame, t.welcome, fps)})`,
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
            alignItems: 'center',
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
            background: 'rgba(0,0,0,0.75)',
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

export default TensionPneumothoraxMechanism;
