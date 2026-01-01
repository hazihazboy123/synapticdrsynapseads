import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';

// Import real timestamps
import timestampsData from '../../public/assets/audio/heart-attack-timestamps.json';

export const HeartAttackCinematic = ({
  showBrain = true,
  showAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== PLAYBACK RATE =====
  // Audio is 88.61 seconds, video is 35 seconds
  // 88.61 / 35 = 2.53x playback rate needed
  const PLAYBACK_RATE = 2.53;

  // Clip durations at 30fps
  const CLIP_FRAMES = 150; // 5 seconds at 30fps
  const TOTAL_FRAMES = CLIP_FRAMES * 7; // 1050 frames = 35 seconds

  // Clip timing
  const clipTimings = [
    { start: 0, file: 'clip_1_the_open_road.mp4', title: 'The Open Road' },
    { start: CLIP_FRAMES, file: 'clip_2_the_narrowing.mp4', title: 'The Narrowing' },
    { start: CLIP_FRAMES * 2, file: 'clip_3_the_rupture.mp4', title: 'The Rupture' },
    { start: CLIP_FRAMES * 3, file: 'clip_4_the_clot_forms.mp4', title: 'The Clot Forms' },
    { start: CLIP_FRAMES * 4, file: 'clip_5_total_occlusion_v2.mp4', title: 'Total Occlusion' },
    { start: CLIP_FRAMES * 5, file: 'clip_6_the_cells_die.mp4', title: 'The Cells Die' },
    { start: CLIP_FRAMES * 6, file: 'clip_7_the_infarct_zone.mp4', title: 'The Infarct Zone' },
  ];

  // Dramatic moments for brain reactions (in frames)
  // Plaque rupture happens around clip 3 start
  const SHOCK_MOMENT = CLIP_FRAMES * 2 + 30;
  const CELEBRATION_MOMENT = null;

  // Get words from timestamps, adjusting for playback rate
  const words = timestampsData.words || [];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>

      {/* ===== KLING VIDEO (STITCHED - ALL 7 CLIPS) ===== */}
      {/* Using OffthreadVideo for stable rendering - prevents zoom/glitch issues */}
      <OffthreadVideo
        src={staticFile('assets/clips/heart_attack_complete.mp4')}
        volume={0.3}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* ===== WHOOSH SOUND ON BRAIN ENTRANCE ===== */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.5} />
      </Sequence>

      {/* ===== SUBTLE VIGNETTE OVERLAY ===== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* ===== DRAMATIC RED OVERLAY FOR DANGER MOMENTS ===== */}
      {frame >= CLIP_FRAMES * 2 && frame < CLIP_FRAMES * 5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(220, 38, 38, ${
              interpolate(
                frame,
                [CLIP_FRAMES * 2, CLIP_FRAMES * 3, CLIP_FRAMES * 4, CLIP_FRAMES * 5],
                [0, 0.15, 0.25, 0.1],
                { extrapolateRight: 'clamp' }
              )
            }) 100%)`,
            pointerEvents: 'none',
            zIndex: 11,
          }}
        />
      )}

      {/* ===== DR. SYNAPSE VOICEOVER ===== */}
      {showAudio && (
        <Audio
          src={staticFile('assets/audio/heart-attack-narration.mp3')}
          volume={1}
          playbackRate={PLAYBACK_RATE}
        />
      )}

      {/* ===== DR. SYNAPSE BRAIN MASCOT (bigger) ===== */}
      {showBrain && (
        <BrainMascot
          audioPath={showAudio ? staticFile('assets/audio/heart-attack-narration.mp3') : null}
          position="top-left"
          size={320}
          timestampsSource="heart-attack-cinematic"
          playbackRate={PLAYBACK_RATE}
          customTop={380}
          customLeft={100}
          showSpeechBubble={true}
          speechBubbleWords={words}
          speechBubbleSize={{ width: 240, height: 110 }}
          speechBubbleFontSize={20}
          shockMoment={SHOCK_MOMENT}
          thinkingPeriod={null}
          celebrationMoment={CELEBRATION_MOMENT}
        />
      )}


    </AbsoluteFill>
  );
};

export default HeartAttackCinematic;
