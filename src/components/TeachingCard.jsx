import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile, Sequence, Easing } from 'remotion';

// ===== ENHANCED SVG ICON COMPONENTS =====

const MicroscopeIcon = ({ size = 24, color = '#9333ea' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 3L5 7L10 12L14 8L9 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="17" cy="17" r="3" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WarningIcon = ({ size = 24, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 20H22L12 2Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M12 9V13" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill={color}/>
  </svg>
);

const LightbulbIcon = ({ size = 24, color = '#FFD700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18H15M10 22H14M12 2C8.68629 2 6 4.68629 6 8C6 10.5 7.5 12.5 9 14V18H15V14C16.5 12.5 18 10.5 18 8C18 4.68629 15.3137 2 12 2Z"
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="12" cy="8" r="2" fill={color} opacity="0.4"/>
  </svg>
);

const BoltIcon = ({ size = 20, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = ({ size = 20, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3V21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 14L12 9L16 13L20 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="14" r="1.5" fill={color}/>
    <circle cx="12" cy="9" r="1.5" fill={color}/>
    <circle cx="16" cy="13" r="1.5" fill={color}/>
    <circle cx="20" cy="9" r="1.5" fill={color}/>
  </svg>
);

const CheckCircleIcon = ({ size = 20, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlertCircleIcon = ({ size = 20, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M12 8V12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill={color}/>
  </svg>
);

const StopIcon = ({ size = 20, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" fill="none"/>
    <path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const VirusIcon = ({ size = 20, color = '#9333ea' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill="rgba(147, 51, 234, 0.2)"/>
    <path d="M12 2V7M12 17V22M2 12H7M17 12H22M5.64 5.64L9.17 9.17M14.83 14.83L18.36 18.36M18.36 5.64L14.83 9.17M9.17 14.83L5.64 18.36"
          stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>
);

const PillIcon = ({ size = 20, color = '#6366f1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8" y="3" width="8" height="18" rx="4" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M8 12H16" stroke={color} strokeWidth="2.5"/>
    <rect x="8" y="3" width="8" height="9" rx="4" fill={color} opacity="0.15"/>
  </svg>
);

// Icon mapping for easy lookup
const ICON_MAP = {
  'microscope': MicroscopeIcon,
  'warning': WarningIcon,
  'lightbulb': LightbulbIcon,
  'bolt': BoltIcon,
  'chart': ChartIcon,
  'check': CheckCircleIcon,
  'alert': AlertCircleIcon,
  'stop': StopIcon,
  'virus': VirusIcon,
  'pill': PillIcon,
};

/**
 * TeachingCard - Post-answer teaching moment with synced visual explanations
 */
export const TeachingCard = ({
  phases = [],
  playbackRate = 1.85,
  frameOffset = 0,
  startFrame = 0,
  colorScheme = {
    background: '#0a0a0a',
    accent: 'linear-gradient(135deg, #9333ea, #db2777)',
    text: '#e5e7eb',
    highlight: '#FFD700',
    success: '#22c55e',
    warning: '#ef4444',
  },
  onScreenShake = null // Callback to trigger screen shake
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - frameOffset;
  const currentTime = adjustedFrame / fps;

  if (adjustedFrame < startFrame) return null;

  // Entrance animation - slide up from below with easing
  const framesIntoTeaching = adjustedFrame - startFrame;
  const entranceProgress = Math.min(1, framesIntoTeaching / 25);
  const cardY = interpolate(entranceProgress, [0, 1], [120, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2))
  });
  const cardOpacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const cardScale = interpolate(entranceProgress, [0, 1], [0.92, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease)
  });

  // Determine current phase
  let currentPhase = null;
  for (const phase of phases) {
    const phaseStartTime = phase.startTime / playbackRate;
    const nextPhaseStartTime = phases[phases.indexOf(phase) + 1]?.startTime / playbackRate;

    if (currentTime >= phaseStartTime && (!nextPhaseStartTime || currentTime < nextPhaseStartTime)) {
      currentPhase = phase;
      break;
    }
  }

  if (!currentPhase) return null;

  // Calculate which elements should be visible - ACCUMULATE as spoken
  // Show all elements that have been reached, they stay on screen
  const visibleElements = currentPhase.elements.filter(element => {
    const elementTime = element.timestamp / playbackRate;
    return currentTime >= elementTime;
  });


  return (
    <>
      <div style={{
        position: 'absolute',
        top: '22%',
        left: 0,
        right: 0,
        bottom: 320,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        zIndex: 30,
      }}>
        <div style={{
          background: 'rgba(10, 10, 10, 0.95)',
          padding: '20px 32px',
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '800px',
          height: 'fit-content',
          maxHeight: '100%',
          width: '100%',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Phase Title - Only for flow-diagram and pearl-card, NOT split-view */}
            {currentPhase.layout !== 'split-view' && (
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <h3 style={{
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  background: 'linear-gradient(135deg, #9333ea, #db2777)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                }}>
                  {currentPhase.titleText}
                </h3>
              </div>
            )}

            {/* Render layout */}
            {currentPhase.layout === 'flow-diagram' && (
              <FlowDiagram
                elements={visibleElements}
                colorScheme={colorScheme}
                adjustedFrame={adjustedFrame}
                frameOffset={frameOffset}
                fps={fps}
                playbackRate={playbackRate}
                globalFrame={frame}
              />
            )}

            {currentPhase.layout === 'split-view' && (
              <SplitView
                elements={visibleElements}
                colorScheme={colorScheme}
                adjustedFrame={adjustedFrame}
                frameOffset={frameOffset}
                fps={fps}
                playbackRate={playbackRate}
                globalFrame={frame}
                titleText={currentPhase.titleText}
              />
            )}

            {currentPhase.layout === 'pearl-card' && (
              <PearlCard
                elements={visibleElements}
                colorScheme={colorScheme}
                adjustedFrame={adjustedFrame}
                frameOffset={frameOffset}
                fps={fps}
                playbackRate={playbackRate}
                globalFrame={frame}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ===== FLOW DIAGRAM LAYOUT =====
const FlowDiagram = ({ elements, colorScheme, adjustedFrame, frameOffset, fps, playbackRate, globalFrame }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'hidden',
    }}>
      {elements.map((element, idx) => {
        const elementFrame = Math.floor((element.timestamp / playbackRate) * fps) - frameOffset;
        const framesVisible = adjustedFrame - elementFrame;

        // Smooth slide-down + fade animation (stays visible after appearing)
        const opacity = interpolate(framesVisible, [0, 20], [0, 1], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
          easing: Easing.out(Easing.ease)
        });

        const translateY = interpolate(framesVisible, [0, 20], [-40, 0], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
          easing: Easing.out(Easing.cubic)
        });

        if (element.type === 'arrow') {
          return (
            <div key={idx} style={{
              opacity: opacity,
              transform: `translateY(${translateY}px)`,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M12 2 L12 18 M12 18 L8 14 M12 18 L16 14"
                  stroke="#9333ea"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </div>
          );
        }

        if (element.type === 'box' || element.type === 'box-highlight') {
          const isHighlighted = element.type === 'box-highlight';

          return (
            <div key={idx} style={{
              backgroundColor: isHighlighted
                ? 'rgba(147, 51, 234, 0.1)'
                : 'rgba(255, 255, 255, 0.03)',
              border: isHighlighted
                ? '1.5px solid rgba(147, 51, 234, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '10px 24px',
              minWidth: '400px',
              textAlign: 'center',
              opacity: opacity,
              transform: `translateY(${translateY}px)`,
              boxShadow: isHighlighted
                ? '0 2px 6px rgba(147, 51, 234, 0.12)'
                : '0 1px 3px rgba(0, 0, 0, 0.2)',
            }}>
              <div style={{
                fontSize: element.fontSize || 20,
                fontWeight: 700,
                color: isHighlighted ? '#c4b5fd' : colorScheme.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                letterSpacing: '0.2px',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              }}>
                {element.text}
              </div>
              {element.subtext && (
                <div style={{
                  fontSize: 14,
                  color: '#9ca3af',
                  marginTop: 3,
                  fontStyle: 'italic',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.1px',
                }}>
                  {element.subtext}
                </div>
              )}
            </div>
          );
        }

        if (element.type === 'bullet') {
          const IconComponent = ICON_MAP[element.iconName] || BoltIcon;

          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '12px 0',
              opacity: opacity,
              transform: `translateY(${translateY}px)`,
              maxWidth: '700px',
            }}>
              <div style={{
                flexShrink: 0,
              }}>
                <IconComponent size={element.fontSize ? element.fontSize * 0.9 : 24} color={element.iconColor || '#fbbf24'} />
              </div>
              <div style={{
                fontSize: element.fontSize || 24,
                color: colorScheme.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                fontWeight: 600,
                lineHeight: 1.4,
                textAlign: 'left',
                letterSpacing: '0.1px',
              }}>
                {element.text}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

// ===== SPLIT VIEW LAYOUT =====
const SplitView = ({ elements, colorScheme, adjustedFrame, frameOffset, fps, playbackRate, globalFrame, titleText }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '0 60px',
    }}>
      {/* Title - Purple, Larger */}
      {titleText && (
        <h2 style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#c4b5fd',
          margin: '0 0 30px 0',
          fontFamily: 'Inter, -apple-system, sans-serif',
          letterSpacing: '1.5px',
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadow: '0 0 16px rgba(196, 181, 253, 0.5), 0 2px 12px rgba(0, 0, 0, 0.9)',
        }}>
          {titleText}
        </h2>
      )}

      {/* Centered bullets */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '700px',
        alignItems: 'center',
      }}>
        {elements.map((element, idx) => {
          const elementFrame = Math.floor((element.timestamp / playbackRate) * fps) - frameOffset;
          const framesVisible = adjustedFrame - elementFrame;

          const opacity = interpolate(framesVisible, [0, 20], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
            easing: Easing.out(Easing.ease)
          });

          const translateY = interpolate(framesVisible, [0, 20], [-40, 0], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
            easing: Easing.out(Easing.cubic)
          });

          // Shake animation when appearing
          const shakeX = framesVisible >= 0 && framesVisible < 8
            ? Math.sin(framesVisible * 2) * (4 - framesVisible * 0.5)
            : 0;

          const IconComponent = ICON_MAP[element.iconName] || CheckCircleIcon;
          const iconColor = element.iconColor || '#c4b5fd';

          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              opacity: opacity,
              transform: `translate(${shakeX}px, ${translateY}px)`,
              transition: 'none',
              width: '100%',
            }}>
              <div style={{
                flexShrink: 0,
              }}>
                <IconComponent size={26} color={iconColor} />
              </div>
              <div style={{
                fontSize: 24,
                color: colorScheme.text,
                fontFamily: 'Inter, -apple-system, sans-serif',
                lineHeight: 1.4,
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}>
                {element.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== PEARL CARD LAYOUT =====
const PearlCard = ({ elements, colorScheme, adjustedFrame, frameOffset, fps, playbackRate, globalFrame }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '200px',
    }}>
      {elements.map((element, idx) => {
        const elementFrame = Math.floor((element.timestamp / playbackRate) * fps) - frameOffset;
        const framesVisible = adjustedFrame - elementFrame;

        // Sleek slide-down + fade animation (stays visible after appearing)
        const opacity = interpolate(framesVisible, [0, 20], [0, 1], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
          easing: Easing.out(Easing.ease)
        });

        const translateY = interpolate(framesVisible, [0, 20], [-50, 0], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
          easing: Easing.out(Easing.cubic)
        });

        return (
          <div key={idx} style={{
            fontSize: element.fontSize || 32,
            fontWeight: element.isEquals ? 800 : 600,
            color: element.isEquals ? '#f0abfc' : colorScheme.text,
            textAlign: 'center',
            opacity: opacity,
            transform: `translateY(${translateY}px)`,
            transition: 'none',
            fontFamily: 'Inter, -apple-system, sans-serif',
            letterSpacing: element.isEquals ? '1px' : '0.4px',
            textShadow: element.isEquals
              ? '0 2px 12px rgba(240, 171, 252, 0.4), 0 1px 4px rgba(0, 0, 0, 0.7)'
              : '0 1px 4px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.4,
            padding: '8px 16px',
          }}>
            {element.text}
          </div>
        );
      })}
    </div>
  );
};

// ===== HELPER: ELEMENT ITEM =====
const ElementItem = ({ element, adjustedFrame, frameOffset, colorScheme, fps, playbackRate, globalFrame }) => {
  const elementFrame = Math.floor((element.timestamp / playbackRate) * fps) - frameOffset;
  const framesVisible = adjustedFrame - elementFrame;

  // Sleek slide-down + fade animation (stays visible after appearing)
  const opacity = interpolate(framesVisible, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.ease)
  });

  const translateY = interpolate(framesVisible, [0, 20], [-40, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  const IconComponent = ICON_MAP[element.iconName] || AlertCircleIcon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '18px',
      marginBottom: 22,
      opacity: opacity,
      transform: `translateY(${translateY}px)`,
      transition: 'none',
      padding: '12px 16px',
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.03)',
    }}>
      <div style={{
        flexShrink: 0,
        paddingTop: '3px',
      }}>
        <IconComponent size={26} color={element.iconColor || (element.side === 'left' ? colorScheme.success : colorScheme.warning)} />
      </div>
      <div>
        <div style={{
          fontSize: 21,
          color: colorScheme.text,
          fontFamily: 'Inter, -apple-system, sans-serif',
          lineHeight: 1.5,
          fontWeight: 600,
          letterSpacing: '0.2px',
        }}>
          {element.text}
        </div>
        {element.subtext && (
          <div style={{
            fontSize: 19,
            color: '#a1a8b0',
            marginTop: 7,
            fontStyle: 'italic',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.1px',
          }}>
            {element.subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingCard;
