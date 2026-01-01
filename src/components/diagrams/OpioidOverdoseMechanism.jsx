import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
} from 'remotion';

/**
 * OpioidOverdoseMechanism - WORD-SYNCED ANIMATIONS
 *
 * Every animation happens EXACTLY when Grandpa says the word.
 * One concept per scene. Visual changes on EVERY emphasized word.
 *
 * Story: Opioid Overdose → Naloxone Reversal
 * Metaphor: "Kicking out the squatter" - Naloxone BOOTS opioid off receptor
 */
export const OpioidOverdoseMechanism = ({ startTime, playbackRate = 2.0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== FRAME CONVERSION =====
  const toFrame = (timestamp) => Math.floor((timestamp / playbackRate) * fps);
  const diagramStartFrame = toFrame(startTime);
  const localFrame = frame - diagramStartFrame;

  if (frame < diagramStartFrame) return null;

  // ===== EXACT WORD TIMESTAMPS (from ElevenLabs) =====
  const t = {
    // Scene 1: Opioid Binding (73-79s)
    opioids: toFrame(72.41) - diagramStartFrame,
    latch: toFrame(73.362) - diagramStartFrame,
    muReceptors: toFrame(74.523) - diagramStartFrame,
    brainstem: toFrame(75.638) - diagramStartFrame,
    drunk: toFrame(76.764) - diagramStartFrame,
    couch: toFrame(78.215) - diagramStartFrame,

    // Scene 2: Respiratory Depression (80-97s)
    breathin: toFrame(80.793) - diagramStartFrame,
    occupied: toFrame(82.523) - diagramStartFrame,
    forgets: toFrame(84.659) - diagramStartFrame,
    lungs: toFrame(85.843) - diagramStartFrame,
    tanks: toFrame(89.349) - diagramStartFrame,
    plummets: toFrame(91.381) - diagramStartFrame,
    roomTemp: toFrame(95.015) - diagramStartFrame,

    // Scene 3: Naloxone Introduction (98-108s)
    beautiful: toFrame(99.426) - diagramStartFrame,
    affinity: toFrame(101.725) - diagramStartFrame,
    block: toFrame(107.333) - diagramStartFrame,

    // Scene 4: The Boot (109-119s)
    boots: toFrame(109.864) - diagramStartFrame,
    bouncer: toFrame(112.801) - diagramStartFrame,
    flyin: toFrame(116.307) - diagramStartFrame,
    clears: toFrame(117.816) - diagramStartFrame,

    // Scene 5: Recovery (120-124s)
    remembers: toFrame(121.044) - diagramStartFrame,
    breathe: toFrame(122.263) - diagramStartFrame,

    // Scene 6: Clinical Pearl (124-166s)
    catch: toFrame(124.063) - diagramStartFrame,
    lasts: toFrame(126.559) - diagramStartFrame,
    hours: toFrame(132.712) - diagramStartFrame,
    blueAgain: toFrame(141.083) - diagramStartFrame,
    watch: toFrame(146.563) - diagramStartFrame,
    nasal: toFrame(147.259) - diagramStartFrame,
    fourMg: toFrame(148.420) - diagramStartFrame,
    ivIm: toFrame(149.187) - diagramStartFrame,
    pointFour: toFrame(150.766) - diagramStartFrame,
    narcan: toFrame(155.851) - diagramStartFrame,
    vending: toFrame(157.639) - diagramStartFrame,
    saveLife: toFrame(164.384) - diagramStartFrame,
  };

  // ===== ANIMATION HELPERS =====
  const getSpring = (triggerFrame, config = { damping: 12, stiffness: 200 }) => {
    if (localFrame < triggerFrame) return 0;
    return spring({
      frame: localFrame - triggerFrame,
      fps,
      config,
    });
  };

  const getProgress = (startFrame, endFrame) => {
    const duration = Math.max(endFrame - startFrame, 1);
    return interpolate(localFrame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  const getPulse = (triggerFrame, speed = 0.4, intensity = 0.15) => {
    if (localFrame < triggerFrame) return 1;
    const elapsed = localFrame - triggerFrame;
    return 1 + Math.sin(elapsed * speed) * intensity;
  };

  // ===== DETERMINE ACTIVE SCENE =====
  const getActiveScene = () => {
    if (localFrame < t.beautiful) return 'binding-depression';
    if (localFrame < t.boots) return 'naloxone-intro';
    if (localFrame < t.remembers) return 'the-boot';
    if (localFrame < t.catch) return 'recovery';
    return 'clinical-pearl';
  };

  const activeScene = getActiveScene();

  // ===== SCENE TRANSITION =====
  const sceneTransition = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // ===== COMMON STYLES =====
  const containerStyle = {
    position: 'absolute',
    top: 380,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 780,
    height: 750,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    borderRadius: 24,
    background: activeScene === 'the-boot' || activeScene === 'recovery'
      ? 'linear-gradient(180deg, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0.95) 100%)'
      : activeScene === 'clinical-pearl'
        ? 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0.95) 100%)'
        : 'linear-gradient(180deg, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.95) 100%)',
    border: `2px solid ${
      activeScene === 'the-boot' || activeScene === 'recovery' ? 'rgba(34,197,94,0.4)' :
      activeScene === 'clinical-pearl' ? 'rgba(59,130,246,0.4)' :
      'rgba(239,68,68,0.4)'
    }`,
    opacity: interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
  };

  // ===== RENDER SCENES =====
  const renderBindingDepressionScene = () => {
    // Progressive reveals based on exact word timing
    const showOpioid = localFrame >= t.opioids;
    const opioidLatched = localFrame >= t.latch;
    const showReceptor = localFrame >= t.muReceptors;
    const showDrunk = localFrame >= t.drunk;
    const showCouch = localFrame >= t.couch;
    const showBreathing = localFrame >= t.breathin;
    const receptorOccupied = localFrame >= t.occupied;
    const brainForgets = localFrame >= t.forgets;
    const showLungs = localFrame >= t.lungs;
    const rrTanks = localFrame >= t.tanks;
    const o2Plummets = localFrame >= t.plummets;
    const deathImminent = localFrame >= t.roomTemp;

    // Animation values
    const opioidDrop = getSpring(t.latch, { damping: 8, stiffness: 150 });
    const drunkAppear = getSpring(t.drunk);
    const couchAppear = getSpring(t.couch);
    const forgetShake = brainForgets ? Math.sin(localFrame * 0.5) * 8 : 0;
    const tanksPulse = rrTanks ? getPulse(t.tanks, 0.6, 0.2) : 1;
    const plummetsPulse = o2Plummets ? getPulse(t.plummets, 0.8, 0.25) : 1;
    const deathGlow = deathImminent ? 0.8 + Math.sin(localFrame * 0.4) * 0.2 : 0;

    // Calculate title based on progress
    let title = "OPIOID BINDING";
    let titleColor = "#ef4444";
    if (brainForgets) {
      title = "BRAIN FORGETS TO BREATHE";
      titleColor = "#ef4444";
    }
    if (deathImminent) {
      title = "⚠️ DEATH IN 4 MINUTES ⚠️";
      titleColor = "#ff0000";
    }

    return (
      <>
        {/* Title */}
        <div style={{
          fontSize: 42,
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: titleColor,
          textAlign: 'center',
          marginBottom: 30,
          textShadow: deathImminent ? `0 0 30px rgba(255,0,0,${deathGlow})` : '0 0 20px rgba(239,68,68,0.5)',
          transform: deathImminent ? `scale(${1 + Math.sin(localFrame * 0.3) * 0.05})` : 'none',
        }}>
          {title}
        </div>

        {/* Main visualization area */}
        <div style={{
          position: 'relative',
          width: 700,
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* RECEPTOR (appears on "mu receptors") */}
          {showReceptor && (
            <div style={{
              position: 'absolute',
              top: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scale(${getSpring(t.muReceptors)})`,
            }}>
              {/* Receptor shape */}
              <div style={{
                width: 180,
                height: 100,
                background: receptorOccupied
                  ? 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)'
                  : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '20px 20px 40px 40px',
                border: `4px solid ${receptorOccupied ? '#fca5a5' : '#93c5fd'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: receptorOccupied
                  ? '0 0 40px rgba(239,68,68,0.6)'
                  : '0 0 30px rgba(59,130,246,0.4)',
                transition: 'all 0.3s ease',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  MU-RECEPTOR
                </span>
              </div>
              <span style={{
                color: '#94a3b8',
                fontSize: 14,
                marginTop: 8,
                fontFamily: 'Inter, sans-serif',
              }}>
                (Brainstem)
              </span>
            </div>
          )}

          {/* OPIOID molecule (appears on "Opioids", drops on "LATCH") */}
          {showOpioid && (
            <div style={{
              position: 'absolute',
              top: opioidLatched ? 70 : -50,
              transform: `translateY(${opioidLatched ? opioidDrop * 0 : (1 - opioidDrop) * -100}px) scale(${opioidLatched ? 1 + Math.sin(localFrame * 0.2) * 0.05 : 1})`,
              transition: opioidLatched ? 'none' : 'top 0.5s ease',
            }}>
              <div style={{
                width: 90,
                height: 60,
                background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                borderRadius: '50% 50% 20px 20px',
                border: '3px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(239,68,68,0.6)',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  OPIOID
                </span>
              </div>
            </div>
          )}

          {/* Status text */}
          {receptorOccupied && (
            <div style={{
              position: 'absolute',
              top: 250,
              fontSize: 28,
              fontWeight: 800,
              color: '#ef4444',
              fontFamily: 'Inter, sans-serif',
              transform: `scale(${getSpring(t.occupied)})`,
              textShadow: '0 0 20px rgba(239,68,68,0.5)',
            }}>
              🔒 RECEPTOR OCCUPIED
            </div>
          )}

          {/* DRUNK/COUCH metaphor (appears progressively) */}
          {showDrunk && (
            <div style={{
              position: 'absolute',
              bottom: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              opacity: drunkAppear,
              transform: `translateY(${(1 - drunkAppear) * 30}px)`,
            }}>
              <span style={{
                fontSize: 50,
                transform: `rotate(${Math.sin(localFrame * 0.15) * 15}deg)`,
              }}>🥴</span>
              {showCouch && (
                <>
                  <span style={{
                    color: '#94a3b8',
                    fontSize: 22,
                    fontFamily: 'Inter, sans-serif',
                    opacity: couchAppear,
                  }}>on your</span>
                  <span style={{
                    fontSize: 50,
                    opacity: couchAppear,
                    transform: `scale(${couchAppear})`,
                  }}>🛋️</span>
                </>
              )}
            </div>
          )}

          {/* VITAL SIGNS (appear during depression phase) */}
          {showBreathing && (
            <div style={{
              position: 'absolute',
              right: 30,
              top: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              opacity: getSpring(t.breathin),
            }}>
              {/* Respiratory Rate */}
              <div style={{
                background: rrTanks ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.1)',
                padding: '12px 20px',
                borderRadius: 12,
                border: `2px solid ${rrTanks ? '#ef4444' : '#3b82f6'}`,
                transform: `scale(${tanksPulse})`,
              }}>
                <div style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>RR</div>
                <div style={{
                  color: rrTanks ? '#ef4444' : '#3b82f6',
                  fontSize: 32,
                  fontWeight: 900,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {rrTanks ? '4' : '16'}
                  <span style={{ fontSize: 16 }}>/min</span>
                </div>
                {rrTanks && (
                  <div style={{
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 4,
                  }}>📉 TANKS!</div>
                )}
              </div>

              {/* O2 Saturation */}
              <div style={{
                background: o2Plummets ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.1)',
                padding: '12px 20px',
                borderRadius: 12,
                border: `2px solid ${o2Plummets ? '#ef4444' : '#3b82f6'}`,
                transform: `scale(${plummetsPulse})`,
              }}>
                <div style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>O₂</div>
                <div style={{
                  color: o2Plummets ? '#ef4444' : '#3b82f6',
                  fontSize: 32,
                  fontWeight: 900,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {o2Plummets ? '74' : '98'}%
                </div>
                {o2Plummets && (
                  <div style={{
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 4,
                  }}>📉 PLUMMETS!</div>
                )}
              </div>
            </div>
          )}

          {/* BRAIN with X (forgets) */}
          {brainForgets && (
            <div style={{
              position: 'absolute',
              left: 30,
              top: 80,
              opacity: getSpring(t.forgets),
            }}>
              <div style={{
                position: 'relative',
                transform: `translateX(${forgetShake}px)`,
              }}>
                <span style={{ fontSize: 70 }}>🧠</span>
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  fontSize: 40,
                  color: '#ef4444',
                  fontWeight: 900,
                  textShadow: '0 0 10px rgba(239,68,68,0.8)',
                }}>✗</div>
              </div>
              <div style={{
                color: '#ef4444',
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
                marginTop: 8,
                fontFamily: 'Inter, sans-serif',
              }}>FORGETS</div>
            </div>
          )}

          {/* LUNGS (deflating) */}
          {showLungs && (
            <div style={{
              position: 'absolute',
              left: 30,
              bottom: 100,
              opacity: getSpring(t.lungs),
            }}>
              <div style={{
                display: 'flex',
                gap: 10,
                transform: `scale(${brainForgets ? 0.7 + Math.sin(localFrame * 0.1) * 0.1 : 1})`,
              }}>
                <span style={{ fontSize: 50, opacity: brainForgets ? 0.5 : 1 }}>🫁</span>
              </div>
              {brainForgets && (
                <div style={{
                  color: '#ef4444',
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: 'center',
                  marginTop: 8,
                  fontFamily: 'Inter, sans-serif',
                }}>NOT WORKING</div>
              )}
            </div>
          )}
        </div>

        {/* Bottom metaphor */}
        {showDrunk && (
          <div style={{
            color: '#94a3b8',
            fontSize: 20,
            fontFamily: 'Inter, sans-serif',
            marginTop: 20,
            opacity: drunkAppear,
          }}>
            Like a <span style={{ color: '#fbbf24', fontWeight: 700 }}>DRUNK</span> passed out on your <span style={{ color: '#fbbf24', fontWeight: 700 }}>COUCH</span>
          </div>
        )}
      </>
    );
  };

  const renderNaloxoneIntroScene = () => {
    const showNaloxone = localFrame >= t.beautiful;
    const showAffinity = localFrame >= t.affinity;
    const naloxoneScale = getSpring(t.beautiful, { damping: 10, stiffness: 150 });
    const affinityPop = getSpring(t.affinity, { damping: 8, stiffness: 200 });

    return (
      <>
        {/* Title */}
        <div style={{
          fontSize: 42,
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: '#22c55e',
          textAlign: 'center',
          marginBottom: 30,
          textShadow: '0 0 30px rgba(34,197,94,0.6)',
          transform: `scale(${naloxoneScale})`,
        }}>
          ✨ NALOXONE: THE BOUNCER ✨
        </div>

        {/* Main viz */}
        <div style={{
          position: 'relative',
          width: 700,
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Naloxone molecule - BIG and BEAUTIFUL */}
          {showNaloxone && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scale(${naloxoneScale})`,
            }}>
              <div style={{
                width: 200,
                height: 120,
                background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                borderRadius: 24,
                border: '4px solid #86efac',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 50px rgba(34,197,94,0.6)',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: 28,
                  fontWeight: 900,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  NALOXONE
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 16,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  (NARCAN)
                </span>
              </div>

              {/* HIGH AFFINITY badge */}
              {showAffinity && (
                <div style={{
                  marginTop: 20,
                  padding: '12px 24px',
                  background: 'rgba(34,197,94,0.2)',
                  borderRadius: 100,
                  border: '2px solid #22c55e',
                  transform: `scale(${affinityPop})`,
                }}>
                  <span style={{
                    color: '#22c55e',
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    ⬆️ HIGHER AFFINITY
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Comparison */}
          {showAffinity && (
            <div style={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              gap: 60,
              alignItems: 'center',
              opacity: affinityPop,
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 50,
                  background: 'rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ef4444',
                  opacity: 0.6,
                }}>
                  <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>OPIOID</span>
                </div>
                <span style={{ color: '#ef4444', fontSize: 16, marginTop: 8, fontWeight: 700 }}>LOW</span>
              </div>

              <div style={{
                fontSize: 40,
                color: '#22c55e',
              }}>
                {'<'}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: 100,
                  height: 60,
                  background: 'rgba(34,197,94,0.3)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #22c55e',
                  boxShadow: '0 0 20px rgba(34,197,94,0.4)',
                }}>
                  <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>NALOXONE</span>
                </div>
                <span style={{ color: '#22c55e', fontSize: 18, marginTop: 8, fontWeight: 900 }}>HIGH! 💪</span>
              </div>
            </div>
          )}
        </div>

        <div style={{
          color: '#94a3b8',
          fontSize: 20,
          fontFamily: 'Inter, sans-serif',
          marginTop: 20,
          textAlign: 'center',
        }}>
          {showAffinity ? (
            <span>It doesn't just <span style={{ color: '#fbbf24' }}>BLOCK</span> - it straight up <span style={{ color: '#22c55e', fontWeight: 700 }}>BOOTS</span> the opioid OFF!</span>
          ) : (
            <span>Here's where naloxone is a <span style={{ color: '#22c55e', fontWeight: 700 }}>BEAUTIFUL</span> thing...</span>
          )}
        </div>
      </>
    );
  };

  const renderBootScene = () => {
    const bootStart = localFrame >= t.boots;
    const bouncerMention = localFrame >= t.bouncer;
    const opioidFlying = localFrame >= t.flyin;
    const receptorCleared = localFrame >= t.clears;

    const bootImpact = getSpring(t.boots, { damping: 6, stiffness: 300 });
    const flyProgress = opioidFlying ? getProgress(t.flyin, t.flyin + 20) : 0;
    const clearPop = getSpring(t.clears, { damping: 10, stiffness: 200 });

    // Opioid flying animation
    const opioidX = opioidFlying ? interpolate(flyProgress, [0, 1], [0, 300]) : 0;
    const opioidY = opioidFlying ? interpolate(flyProgress, [0, 0.5, 1], [0, -100, 50]) : 0;
    const opioidRotate = opioidFlying ? flyProgress * 720 : 0;
    const opioidOpacity = opioidFlying ? interpolate(flyProgress, [0.7, 1], [1, 0], { extrapolateLeft: 'clamp' }) : 1;

    return (
      <>
        {/* Title */}
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: '#22c55e',
          textAlign: 'center',
          marginBottom: 30,
          textShadow: '0 0 40px rgba(34,197,94,0.8)',
          transform: `scale(${bootStart ? bootImpact : 0})`,
        }}>
          🥾 OPIOID GETS BOOTED! 🥾
        </div>

        {/* Main viz */}
        <div style={{
          position: 'relative',
          width: 700,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Receptor */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Naloxone on receptor (after clear) */}
            {receptorCleared && (
              <div style={{
                position: 'absolute',
                top: -50,
                transform: `scale(${clearPop})`,
                zIndex: 10,
              }}>
                <div style={{
                  width: 80,
                  height: 50,
                  background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                  borderRadius: '50% 50% 15px 15px',
                  border: '3px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(34,197,94,0.6)',
                }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>NALOXONE</span>
                </div>
              </div>
            )}

            {/* Receptor base */}
            <div style={{
              width: 160,
              height: 90,
              background: receptorCleared
                ? 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)'
                : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '15px 15px 35px 35px',
              border: `4px solid ${receptorCleared ? '#86efac' : '#93c5fd'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: receptorCleared
                ? '0 0 50px rgba(34,197,94,0.6)'
                : '0 0 30px rgba(59,130,246,0.4)',
              transform: bootStart ? `scale(${1 + (bootImpact - 1) * 0.3})` : 'none',
            }}>
              <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>MU-RECEPTOR</span>
            </div>

            {/* Status */}
            <div style={{
              marginTop: 20,
              fontSize: 26,
              fontWeight: 900,
              color: receptorCleared ? '#22c55e' : '#3b82f6',
              fontFamily: 'Inter, sans-serif',
              transform: receptorCleared ? `scale(${clearPop})` : 'none',
            }}>
              {receptorCleared ? '✅ RECEPTOR CLEARED!' : '🔄 DISPLACING...'}
            </div>
          </div>

          {/* Flying opioid */}
          {bootStart && !receptorCleared && (
            <div style={{
              position: 'absolute',
              transform: `translate(${opioidX}px, ${opioidY}px) rotate(${opioidRotate}deg)`,
              opacity: opioidOpacity,
            }}>
              <div style={{
                width: 70,
                height: 45,
                background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                borderRadius: '50% 50% 15px 15px',
                border: '3px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>OPIOID</span>
              </div>
            </div>
          )}

          {/* Bouncer emoji */}
          {bouncerMention && (
            <div style={{
              position: 'absolute',
              right: 50,
              opacity: getSpring(t.bouncer),
              transform: `scale(${getSpring(t.bouncer)})`,
            }}>
              <span style={{ fontSize: 80 }}>🦸</span>
              <div style={{
                color: '#22c55e',
                fontSize: 16,
                fontWeight: 700,
                textAlign: 'center',
                marginTop: 8,
              }}>BOUNCER</div>
            </div>
          )}
        </div>

        <div style={{
          color: '#94a3b8',
          fontSize: 20,
          fontFamily: 'Inter, sans-serif',
          marginTop: 20,
        }}>
          Like a <span style={{ color: '#22c55e', fontWeight: 700 }}>bouncer</span> throwin' out a <span style={{ color: '#ef4444', fontWeight: 700 }}>troublemaker</span>
        </div>
      </>
    );
  };

  const renderRecoveryScene = () => {
    const brainRemembers = localFrame >= t.remembers;
    const lungsBreathe = localFrame >= t.breathe;

    const rememberPop = getSpring(t.remembers, { damping: 8, stiffness: 200 });
    const breatheScale = lungsBreathe ? 1 + Math.sin((localFrame - t.breathe) * 0.15) * 0.1 : 1;

    return (
      <>
        {/* Title */}
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: '#22c55e',
          textAlign: 'center',
          marginBottom: 30,
          textShadow: '0 0 40px rgba(34,197,94,0.8)',
          transform: `scale(${rememberPop})`,
        }}>
          🧠 BRAIN REMEMBERS! 🎉
        </div>

        {/* Main viz */}
        <div style={{
          position: 'relative',
          width: 700,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Brain with signals */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${rememberPop})`,
          }}>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 100 }}>🧠</span>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontSize: 40,
                color: '#22c55e',
              }}>💡</div>
            </div>

            {/* Signal to lungs */}
            {lungsBreathe && (
              <>
                <div style={{
                  width: 4,
                  height: 60,
                  background: 'linear-gradient(180deg, #22c55e, transparent)',
                  marginTop: 10,
                  opacity: getSpring(t.breathe),
                }} />

                <div style={{
                  display: 'flex',
                  gap: 20,
                  marginTop: 10,
                  transform: `scale(${breatheScale})`,
                }}>
                  <span style={{ fontSize: 80 }}>🫁</span>
                </div>

                <div style={{
                  color: '#22c55e',
                  fontSize: 24,
                  fontWeight: 700,
                  marginTop: 15,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  BREATHING RESTORED!
                </div>
              </>
            )}
          </div>

          {/* Vitals - recovered */}
          <div style={{
            position: 'absolute',
            right: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            opacity: lungsBreathe ? getSpring(t.breathe) : 0,
          }}>
            <div style={{
              background: 'rgba(34,197,94,0.2)',
              padding: '12px 20px',
              borderRadius: 12,
              border: '2px solid #22c55e',
            }}>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>RR</div>
              <div style={{ color: '#22c55e', fontSize: 32, fontWeight: 900 }}>16<span style={{ fontSize: 16 }}>/min</span></div>
              <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>✅ NORMAL</div>
            </div>

            <div style={{
              background: 'rgba(34,197,94,0.2)',
              padding: '12px 20px',
              borderRadius: 12,
              border: '2px solid #22c55e',
            }}>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>O₂</div>
              <div style={{ color: '#22c55e', fontSize: 32, fontWeight: 900 }}>98%</div>
              <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>✅ NORMAL</div>
            </div>
          </div>
        </div>

        <div style={{
          color: '#94a3b8',
          fontSize: 20,
          fontFamily: 'Inter, sans-serif',
          marginTop: 20,
        }}>
          Receptor <span style={{ color: '#22c55e', fontWeight: 700 }}>CLEARS</span> → Brain <span style={{ color: '#22c55e', fontWeight: 700 }}>REMEMBERS</span> → Lungs <span style={{ color: '#22c55e', fontWeight: 700 }}>WORK</span>
        </div>
      </>
    );
  };

  const renderClinicalPearlScene = () => {
    const showCatch = localFrame >= t.catch;
    const showDuration = localFrame >= t.lasts;
    const showHours = localFrame >= t.hours;
    const showBlueAgain = localFrame >= t.blueAgain;
    const showWatch = localFrame >= t.watch;
    const showDosing = localFrame >= t.nasal;
    const showNarcan = localFrame >= t.narcan;
    const showVending = localFrame >= t.vending;
    const showSaveLife = localFrame >= t.saveLife;

    return (
      <>
        {/* Title */}
        <div style={{
          fontSize: 42,
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: showBlueAgain ? '#ef4444' : '#3b82f6',
          textAlign: 'center',
          marginBottom: 20,
          textShadow: showBlueAgain ? '0 0 30px rgba(239,68,68,0.6)' : '0 0 30px rgba(59,130,246,0.5)',
          transform: `scale(${getSpring(t.catch)})`,
        }}>
          {showBlueAgain ? '⚠️ BUT WATCH OUT! ⚠️' : showNarcan ? '💊 NARCAN DOSING' : '⚠️ THE CATCH'}
        </div>

        {/* Content area */}
        <div style={{
          width: 700,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: '0 20px',
        }}>
          {/* Duration warning */}
          {showDuration && !showDosing && (
            <div style={{
              background: 'rgba(251,191,36,0.15)',
              border: '2px solid #fbbf24',
              borderRadius: 16,
              padding: 20,
              opacity: getSpring(t.lasts),
            }}>
              <div style={{ color: '#fbbf24', fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
                ⏱️ DURATION MISMATCH
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#22c55e', fontSize: 28, fontWeight: 900 }}>30-90 min</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Naloxone</div>
                </div>
                <div style={{ color: '#fbbf24', fontSize: 30 }}>vs</div>
                <div style={{ textAlign: 'center', opacity: showHours ? 1 : 0.3 }}>
                  <div style={{ color: '#ef4444', fontSize: 28, fontWeight: 900 }}>HOURS</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Long-acting opioids</div>
                </div>
              </div>
            </div>
          )}

          {/* Blue again warning */}
          {showBlueAgain && !showDosing && (
            <div style={{
              background: 'rgba(239,68,68,0.2)',
              border: '3px solid #ef4444',
              borderRadius: 16,
              padding: 20,
              opacity: getSpring(t.blueAgain),
              transform: `scale(${1 + Math.sin(localFrame * 0.2) * 0.02})`,
            }}>
              <div style={{ color: '#ef4444', fontSize: 22, fontWeight: 900, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                😰 RE-SEDATION RISK
              </div>
              <div style={{ color: '#fca5a5', fontSize: 18, textAlign: 'center', marginTop: 10, fontFamily: 'Inter, sans-serif' }}>
                Patient can turn <span style={{ color: '#3b82f6', fontWeight: 700 }}>BLUE AGAIN</span> when naloxone wears off!
              </div>
            </div>
          )}

          {/* Watch them */}
          {showWatch && !showDosing && (
            <div style={{
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid #22c55e',
              borderRadius: 16,
              padding: 20,
              opacity: getSpring(t.watch),
            }}>
              <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 900, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                👁️ WATCH 'EM
              </div>
              <div style={{ color: '#86efac', fontSize: 16, textAlign: 'center', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
                Monitor for re-sedation after initial response
              </div>
            </div>
          )}

          {/* Dosing info */}
          {showDosing && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 15,
              opacity: getSpring(t.nasal),
            }}>
              {/* Nasal */}
              <div style={{
                background: 'rgba(147,51,234,0.15)',
                border: '2px solid #9333ea',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}>
                <span style={{ fontSize: 50 }}>👃</span>
                <div>
                  <div style={{ color: '#9333ea', fontSize: 20, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>NASAL SPRAY</div>
                  <div style={{ color: '#c4b5fd', fontSize: 28, fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>4 mg</div>
                </div>
              </div>

              {/* IV/IM */}
              <div style={{
                background: 'rgba(59,130,246,0.15)',
                border: '2px solid #3b82f6',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: localFrame >= t.ivIm ? getSpring(t.ivIm) : 0,
              }}>
                <span style={{ fontSize: 50 }}>💉</span>
                <div>
                  <div style={{ color: '#3b82f6', fontSize: 20, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>IV or IM</div>
                  <div style={{ color: '#93c5fd', fontSize: 28, fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>0.4-2 mg</div>
                  <div style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Repeat q2-3 min PRN</div>
                </div>
              </div>
            </div>
          )}

          {/* NARCAN brand / vending machines */}
          {showNarcan && (
            <div style={{
              background: showVending ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.2))' : 'rgba(34,197,94,0.15)',
              border: '2px solid #22c55e',
              borderRadius: 16,
              padding: 20,
              marginTop: 10,
              opacity: getSpring(t.narcan),
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 15,
              }}>
                <span style={{ fontSize: 40 }}>💊</span>
                <span style={{
                  color: '#22c55e',
                  fontSize: 32,
                  fontWeight: 900,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  NARCAN
                </span>
                {showVending && (
                  <>
                    <span style={{ color: '#94a3b8', fontSize: 24 }}>→</span>
                    <span style={{ fontSize: 40 }}>🏧</span>
                    <span style={{
                      color: '#3b82f6',
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      VENDING MACHINES
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Save a life CTA */}
          {showSaveLife && (
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              borderRadius: 20,
              padding: 25,
              marginTop: 10,
              transform: `scale(${getSpring(t.saveLife, { damping: 8, stiffness: 150 })})`,
              boxShadow: '0 0 50px rgba(34,197,94,0.5)',
            }}>
              <div style={{
                color: 'white',
                fontSize: 32,
                fontWeight: 900,
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
              }}>
                🚨 LEARN IT. CARRY IT. SAVE A LIFE. 🚨
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // ===== PHASE INDICATOR =====
  const phases = [
    { id: 'binding', label: 'Binding', active: activeScene === 'binding-depression' && localFrame < t.forgets },
    { id: 'depression', label: 'Depression', active: activeScene === 'binding-depression' && localFrame >= t.forgets },
    { id: 'naloxone', label: 'Naloxone', active: activeScene === 'naloxone-intro' },
    { id: 'boot', label: 'Boot', active: activeScene === 'the-boot' },
    { id: 'recovery', label: 'Recovery', active: activeScene === 'recovery' },
    { id: 'dosing', label: 'Dosing', active: activeScene === 'clinical-pearl' },
  ];

  return (
    <div style={containerStyle}>
      {/* Branding */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 20,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #9333ea, #db2777)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        opacity: 0.8,
      }}>
        synapticrecall.ai
      </div>

      {/* Scene content */}
      {activeScene === 'binding-depression' && renderBindingDepressionScene()}
      {activeScene === 'naloxone-intro' && renderNaloxoneIntroScene()}
      {activeScene === 'the-boot' && renderBootScene()}
      {activeScene === 'recovery' && renderRecoveryScene()}
      {activeScene === 'clinical-pearl' && renderClinicalPearlScene()}

      {/* Phase indicator */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        display: 'flex',
        gap: 15,
        background: 'rgba(0,0,0,0.6)',
        padding: '10px 20px',
        borderRadius: 100,
      }}>
        {phases.map((phase) => (
          <div key={phase.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: phase.active ? '#22c55e' : 'rgba(148,163,184,0.3)',
              boxShadow: phase.active ? '0 0 10px rgba(34,197,94,0.6)' : 'none',
            }} />
            <span style={{
              color: phase.active ? '#22c55e' : '#64748b',
              fontSize: 12,
              fontWeight: phase.active ? 700 : 400,
              fontFamily: 'Inter, sans-serif',
            }}>
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpioidOverdoseMechanism;
