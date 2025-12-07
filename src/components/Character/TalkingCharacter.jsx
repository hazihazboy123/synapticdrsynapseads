import React from 'react';
import { useCurrentFrame, useVideoConfig, Img, staticFile, Audio } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

export const TalkingCharacter = ({
  characterImagePath,
  audioPath,
  position = 'bottom-left',
  size = 600
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get audio data for mouth sync
  const audioData = useAudioData(audioPath);

  // Calculate mouth opening based on audio amplitude
  let mouthOpen = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: 16,
    });

    // Average the visualization to get overall amplitude
    const amplitude = visualization.reduce((a, b) => a + b, 0) / visualization.length;

    // Map amplitude to mouth opening (0 to 1)
    mouthOpen = Math.min(amplitude * 3, 1); // Amplify for more visible movement
  }

  // Position styles based on prop
  const getPositionStyle = () => {
    const base = {
      position: 'absolute',
    };

    switch(position) {
      case 'bottom-left':
        return { ...base, bottom: 100, left: 50 };
      case 'bottom-right':
        return { ...base, bottom: 100, right: 50 };
      case 'top-left':
        return { ...base, top: 100, left: 50 };
      case 'top-right':
        return { ...base, top: 100, right: 50 };
      case 'center':
        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return { ...base, bottom: 100, left: 50 };
    }
  };

  // Calculate mouth height based on amplitude
  const mouthHeight = 10 + (mouthOpen * 40); // 10px to 50px
  const mouthWidth = 60;

  return (
    <div style={{
      ...getPositionStyle(),
      width: size,
      height: size,
    }}>
      {/* Character image */}
      <Img
        src={staticFile(characterImagePath)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
        }}
      />

      {/* Animated mouth overlay - simple oval that scales with audio */}
      <div style={{
        position: 'absolute',
        bottom: '30%', // Adjust this based on your character image
        left: '50%',
        transform: 'translateX(-50%)',
        width: mouthWidth,
        height: mouthHeight,
        backgroundColor: '#2a0a0a',
        borderRadius: '50%',
        border: '2px solid #1a0505',
        transition: 'height 0.05s ease-out',
      }} />
    </div>
  );
};
