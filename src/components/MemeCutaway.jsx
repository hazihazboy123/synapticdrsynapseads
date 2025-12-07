import React from 'react';
import { AbsoluteFill, OffthreadVideo, Audio, useCurrentFrame, useVideoConfig, staticFile, Sequence } from 'remotion';
import memeLibrary from '../assets/memes/library.json';

/**
 * MemeCutaway - Creates a hard cut to a full-screen meme video
 *
 * This is the TikTok-style meme integration where:
 * 1. Main content plays
 * 2. HARD CUT to full-screen meme (with its audio)
 * 3. HARD CUT back to main content
 *
 * Usage:
 * <MemeCutaway
 *   memeId="coffin-dance"
 *   triggerTimestamp={19.39}  // When to trigger (adjusted for playback rate)
 *   playbackRate={1.85}
 * />
 */
export const MemeCutaway = ({
  memeId,
  triggerTimestamp,
  playbackRate = 1.0,
  customDuration = null,  // Optional: override meme duration
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get meme data from library
  const memeData = memeLibrary.memes[memeId];

  if (!memeData) {
    console.error(`Meme "${memeId}" not found in library`);
    return null;
  }

  // Calculate frame timing
  const triggerFrame = Math.floor(triggerTimestamp * fps);
  const memeDuration = customDuration || memeData.duration;
  const memeDurationFrames = Math.floor(memeDuration * fps);
  const endFrame = triggerFrame + memeDurationFrames;

  // Use Sequence to properly time the meme cutaway
  // Sequence creates its own timeline starting from 0 when it begins
  return (
    <Sequence from={triggerFrame} durationInFrames={memeDurationFrames}>
      <AbsoluteFill style={{ zIndex: 9999, backgroundColor: '#000' }}>
        {/* Full-screen meme video */}
        <OffthreadVideo
          src={staticFile(memeData.video)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Meme's native audio (if it has any) */}
        {memeData.hasAudio && (
          <Audio
            src={staticFile(memeData.video)}
            volume={memeData.volume}
          />
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

export default MemeCutaway;
