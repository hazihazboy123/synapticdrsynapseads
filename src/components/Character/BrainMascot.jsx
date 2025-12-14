import React from 'react';
import { useCurrentFrame, useVideoConfig, Img, staticFile, spring, interpolate, Easing } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import sarcoidosisTimestamps from '../../assets/audio/aligned-timestamps.json';
import fluoroquinoloneTimestamps from '../../assets/audio/fluoroquinolone-aligned-timestamps.json';
import mucormycosisTimestamps from '../../assets/audio/mucormycosis-aligned-timestamps.json';
import desquamativeTimestamps from '../../assets/audio/desquamative-aligned-timestamps.json';
import legionellaTimestamps from '../../assets/audio/legionella-aligned-timestamps.json';
import squamousCellLungCarcinomaTimestamps from '../../assets/audio/squamous-cell-lung-carcinoma-aligned-timestamps.json';
import wernickeTimestamps from '../../../public/assets/audio/wernicke-timestamps.json';
import aspirationPneumoniaTimestamps from '../../../public/assets/audio/aspiration-pneumonia-timestamps.json';
import pyrazinamideTimestamps from '../../../public/assets/audio/pyrazinamide-timestamps.json';
import squamousCellLungHypercalcemiaTimestamps from '../../../public/assets/audio/squamous-cell-lung-hypercalcemia-timestamps.json';
import nephroticSyndromeMinimalChangeTimestamps from '../../../public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json';
import pseudomonasEcthymaGangrenosumTimestamps from '../../../public/assets/audio/pseudomonas-ecthyma-gangrenosum-timestamps.json';
import bphFiveAlphaReductaseTimestamps from '../../../public/assets/audio/bph-5-alpha-reductase-timestamps.json';
import streptococcusPneumoniaeLobarPneumoniaTimestamps from '../../../public/assets/audio/streptococcus-pneumoniae-lobar-pneumonia-timestamps.json';
import epiduralHematomaTimestamps from '../../../public/assets/audio/epidural-hematoma-timestamps.json';
import dkaPotassiumManagementTimestamps from '../../../public/assets/audio/dka-potassium-management-timestamps.json';
import betaBlockerOverdoseTimestamps from '../../../public/assets/audio/beta-blocker-overdose-timestamps.json';

export const BrainMascot = ({
  audioPath,
  position = 'top-center',
  size = 350,
  timestampsSource = 'sarcoidosis', // 'sarcoidosis', 'fluoroquinolone', 'mucormycosis', or 'desquamative'
  playbackRate = 1.75, // Default to sarcoidosis speed (1.75x)
  // NEW: Emotional reactions
  shockMoment = null, // Frame when brain should react with shock (e.g., critical value)
  thinkingPeriod = null, // { start: frame, end: frame } for thinking animation
  celebrationMoment = null, // Frame when brain should celebrate (answer reveal)
  // Custom positioning (overrides position preset)
  customTop = null, // Custom top value in pixels
  customLeft = null, // Custom left value in pixels or string like '50%'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get audio data for animation
  const audioData = useAudioData(audioPath);

  // Select the correct timestamps based on which ad is playing
  const timestampsData =
    timestampsSource === 'beta-blocker-overdose'
      ? betaBlockerOverdoseTimestamps
      : timestampsSource === 'dka-potassium-management'
      ? dkaPotassiumManagementTimestamps
      : timestampsSource === 'epidural-hematoma'
      ? epiduralHematomaTimestamps
      : timestampsSource === 'streptococcus-pneumoniae-lobar-pneumonia'
      ? streptococcusPneumoniaeLobarPneumoniaTimestamps
      : timestampsSource === 'bph-5-alpha-reductase'
      ? bphFiveAlphaReductaseTimestamps
      : timestampsSource === 'pseudomonas-ecthyma-gangrenosum'
      ? pseudomonasEcthymaGangrenosumTimestamps
      : timestampsSource === 'nephrotic-syndrome-minimal-change'
      ? nephroticSyndromeMinimalChangeTimestamps
      : timestampsSource === 'squamous-cell-lung-hypercalcemia'
        ? squamousCellLungHypercalcemiaTimestamps
        : timestampsSource === 'pyrazinamide'
          ? pyrazinamideTimestamps
        : timestampsSource === 'aspiration-pneumonia'
          ? aspirationPneumoniaTimestamps
          : timestampsSource === 'wernicke'
            ? wernickeTimestamps
            : timestampsSource === 'squamous-cell-lung-carcinoma'
              ? squamousCellLungCarcinomaTimestamps
              : timestampsSource === 'legionella'
                ? legionellaTimestamps
                : timestampsSource === 'desquamative'
                  ? desquamativeTimestamps
                  : timestampsSource === 'mucormycosis'
                    ? mucormycosisTimestamps
                    : timestampsSource === 'fluoroquinolone'
                      ? fluoroquinoloneTimestamps
                      : sarcoidosisTimestamps;

  // Normalize timestamps data (handle both array and {words: []} formats)
  const words = Array.isArray(timestampsData) ? timestampsData : timestampsData.words;

  // ===== ENTRANCE ANIMATION (Frames 0-40) =====
  const entranceScale = spring({
    frame,
    fps,
    config: {
      stiffness: 100,
      damping: 15,
    },
    durationInFrames: 40,
    from: 0.3,
    to: 1,
  });

  const entranceOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // ===== IDLE BREATHING ANIMATION (Always Active) =====
  // Gentle scale pulse: 1.0 → 1.015 → 1.0 (very subtle)
  const breathingCycle = Math.sin(frame * 0.04) * 0.015; // 0.04 = slow breathing speed
  const breathingScale = 1 + breathingCycle;

  // ===== PACING ANIMATION (Slow left-right drift like walking/teaching) =====
  // DISABLED: Too distracting
  const pacingOffset = 0;

  // ===== ENHANCED SPEECH ANIMATION (WORD-DURATION MATCHED) =====
  let speechBounceY = 0; // Vertical bounce during speech
  let speechRotation = 0; // Head tilt during speech
  let speechDriftX = 0; // Horizontal drift
  let forwardLeanScale = 1.0; // Forward lean (pop out at viewer)
  const glowIntensity = 0; // NO glow at all

  if (frame >= 40) {
    // Find the CURRENT word being spoken
    const currentWord = words.find(word => {
      const wordStartFrame = (word.start / playbackRate) * fps;
      const wordEndFrame = (word.end / playbackRate) * fps;
      return frame >= wordStartFrame && frame < wordEndFrame;
    });

    if (currentWord) {
      // ===== ACTIVE SPEECH - Brain is talking! =====
      const wordStartFrame = (currentWord.start / playbackRate) * fps;
      const wordEndFrame = (currentWord.end / playbackRate) * fps;
      const wordDuration = wordEndFrame - wordStartFrame;
      const frameIntoWord = frame - wordStartFrame;
      const progressInWord = frameIntoWord / wordDuration; // 0.0 → 1.0

      // ===== FORWARD LEAN (Pop out at viewer!) =====
      // INCREASED: Lean FORWARD more aggressively at word start
      // Makes it feel like brain is jumping RIGHT AT YOU
      if (progressInWord < 0.35) {
        // Lean forward (get BIGGER = closer to camera)
        forwardLeanScale = interpolate(progressInWord, [0, 0.35], [1.0, 1.18], {
          easing: Easing.out(Easing.quad)
        });
      } else {
        // Pull back to normal
        forwardLeanScale = interpolate(progressInWord, [0.35, 1.0], [1.18, 1.0], {
          easing: Easing.inOut(Easing.quad)
        });
      }

      // NOTE: Squash & stretch removed - too busy at fast playback speeds
      // Can add back later for specific moments if needed

      // ===== VERTICAL BOUNCE (Pop up on word start) =====
      // Bounce up at word start, settle down as word progresses
      const bounceHeight = 8; // pixels
      if (progressInWord < 0.3) {
        // Quick bounce up
        speechBounceY = -interpolate(progressInWord, [0, 0.3], [0, bounceHeight], {
          easing: Easing.out(Easing.quad)
        });
      } else {
        // Settle back down
        speechBounceY = -interpolate(progressInWord, [0.3, 1.0], [bounceHeight, 0], {
          easing: Easing.inOut(Easing.quad)
        });
      }

      // ===== HEAD TILT (Expressive rotation) =====
      // DISABLED: Rotation creates perception of side-to-side movement
      speechRotation = 0; // No head tilt

      // ===== HORIZONTAL DRIFT (Side-to-side sway) =====
      // DISABLED: Too much movement, keeping it simple
      speechDriftX = 0; // No side-to-side drift

      // NOTE: Speech glow removed - keeping constant glow

    } else {
      // ===== SILENT (Between words) - Return to neutral =====
      speechBounceY = 0;
      speechRotation = 0;
      speechDriftX = 0;
      forwardLeanScale = 1.0;
    }
  }

  // ===== EMOTIONAL REACTIONS =====
  let reactionRotate = 0;
  let reactionScale = 1;
  let reactionTranslateX = 0;
  let reactionTranslateY = 0;

  // REACTION 1: SHOCK at critical value (head shake)
  // DISABLED: Don't want brain moving when lab values appear
  // if (shockMoment !== null && frame >= shockMoment && frame < shockMoment + 9) {
  //   const shockFrame = frame - shockMoment;
  //   reactionRotate = interpolate(
  //     shockFrame,
  //     [0, 3, 6, 9],
  //     [0, -8, 8, 0],
  //     { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  //   );
  //   reactionScale = interpolate(
  //     shockFrame,
  //     [0, 3, 9],
  //     [1, 1.1, 1],
  //     { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  //   );
  // }

  // REACTION 2: THINKING during countdown (BIG sway - REALLY thinking hard!)
  if (thinkingPeriod && frame >= thinkingPeriod.start && frame < thinkingPeriod.end) {
    // BIGGER side-to-side sway + up/down bob
    reactionTranslateX = Math.sin((frame - thinkingPeriod.start) * 0.18) * 18; // Increased from 12 to 18px
    reactionTranslateY = Math.cos((frame - thinkingPeriod.start) * 0.18) * 8; // Increased from 4 to 8px
  }

  // REACTION 3: CELEBRATION at answer reveal (HUGE bounce/jump)
  if (celebrationMoment !== null && frame >= celebrationMoment && frame < celebrationMoment + 20) {
    const celebFrame = frame - celebrationMoment;
    // HUGE bouncy jump with elastic return
    reactionTranslateY = -Math.abs(Math.sin(celebFrame * 0.35)) *
      interpolate(celebFrame, [0, 20], [50, 0], { // Increased from 40 to 50px
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.5)) // Elastic bounce
      });
    // Scale up EVEN MORE at peak
    reactionScale = 1 + Math.abs(Math.sin(celebFrame * 0.35)) * 0.22; // Increased from 0.18 to 0.22
  }

  // ===== COMBINE ANIMATIONS =====
  // During entrance: use entrance scale
  // After entrance: combine breathing + forward lean + reaction scale
  // (Uniform scale - squash/stretch removed for cleaner look at fast speeds)
  const finalScale = frame < 40
    ? entranceScale
    : breathingScale * forwardLeanScale * reactionScale;

  // Position styles
  const getPositionStyle = () => {
    const base = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Custom positioning overrides presets
    if (customTop !== null || customLeft !== null) {
      return {
        ...base,
        top: customTop ?? 80,
        left: customLeft ?? 40,
        transform: typeof customLeft === 'string' && customLeft.includes('%') ? 'translateX(-50%)' : 'none',
      };
    }

    switch(position) {
      case 'top-center':
        return {
          ...base,
          top: 80,  // Moved down from 50 to 80
          left: '50%',
          transform: `translateX(-50%)`,
        };
      case 'bottom-left':
        return { ...base, bottom: 80, left: 40 };
      case 'bottom-right':
        return { ...base, bottom: 80, right: 40 };
      case 'top-left':
        return { ...base, top: 80, left: 40 };
      case 'top-right':
        return { ...base, top: 80, right: 40 };
      default:
        return {
          ...base,
          top: 80,  // Moved down from 50 to 80
          left: '50%',
          transform: `translateX(-50%)`,
        };
    }
  };

  return (
    <div style={{
      ...getPositionStyle(),
      width: size,
      height: size,
    }}>
      <Img
        src={staticFile('assets/character/brain-mascot.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: entranceOpacity,
          transform: `
            translate(
              ${reactionTranslateX + speechDriftX + pacingOffset}px,
              ${reactionTranslateY + speechBounceY}px
            )
            scale(${finalScale})
            rotate(${reactionRotate + speechRotation}deg)
          `,
          transformOrigin: 'center center', // Center pivot for natural reactions
          filter: 'none', // No glow/shadow effects
          transition: 'none', // INSTANT snap both ways - fast pace energy!
          willChange: 'transform',
        }}
      />
    </div>
  );
};
