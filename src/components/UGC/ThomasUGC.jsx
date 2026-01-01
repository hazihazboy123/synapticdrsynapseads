import React, { useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Video,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
  Img,
} from 'remotion';
import { MockUploadScreen } from './MockUploadScreen';
import { MockProcessingScreen } from './MockProcessingScreen';
import { UGCCaptions } from './UGCCaptions';
import { StarsBackground } from './StarsBackground';

// =====================================
// THOMAS UGC AD COMPOSITION
// B-roll footage synced to Thomas's voiceover
// =====================================

/**
 * Scene Timing Configuration
 * Based on Whisper timestamps from the user's plan
 * All times are in seconds, converted to frames at 30fps
 */
const FPS = 30;

const SCENE_TIMING = {
  // 0.0s - 4.4s: Thomas talking (no overlay)
  intro: {
    startTime: 0,
    endTime: 4.4,
  },

  // 5.5s - 21.6s: Pain point about making cards (Thomas talking)
  painPoint: {
    startTime: 5.5,
    endTime: 21.6,
  },

  // 22.3s - 24.1s: "Then I found Synaptic Recall" - Flash logo
  productReveal: {
    startTime: 22.3,
    endTime: 24.1,
  },

  // 24.7s - 25.8s: "You upload your lecture" - UPLOAD SCREEN + PDF DRAG
  uploadDemo: {
    startTime: 24.7,
    endTime: 25.8,
  },

  // 26.2s - 31.7s: "automatically pulls out... perfect amount of cards" - PROCESSING SCREEN
  processingDemo: {
    startTime: 26.2,
    endTime: 31.7,
  },

  // 32.3s - 34.3s: "Key terms are highlighted for you" - SHOW HIGHLIGHTED CARD
  highlightedCard: {
    startTime: 32.3,
    endTime: 34.3,
  },

  // 34.8s - 38.4s: "exact slide from the lecture is embedded" - SHOW EMBEDDED SLIDE
  embeddedSlide: {
    startTime: 34.8,
    endTime: 38.4,
  },

  // 39.5s - 47.0s: "generates over 10 exam style practice questions" - SHOW PRACTICE QUIZ
  practiceQuiz: {
    startTime: 39.5,
    endTime: 47.0,
  },

  // 47.5s - 54.9s: "I went from barely keeping up..." - Thomas talking
  results: {
    startTime: 47.5,
    endTime: 54.9,
  },

  // 55.8s - 63.8s: "You can go now... click the link below" - CTA
  cta: {
    startTime: 55.8,
    endTime: 63.8,
  },
};

// Convert time to frames
const toFrames = (seconds) => Math.round(seconds * FPS);

// Sample timestamps (replace with actual Whisper timestamps)
const SAMPLE_WORDS = [
  { word: 'If', start: 0.0, end: 0.2 },
  { word: "you're", start: 0.2, end: 0.4 },
  { word: 'in', start: 0.4, end: 0.5 },
  { word: 'med', start: 0.5, end: 0.7 },
  { word: 'school', start: 0.7, end: 1.0 },
  { word: 'and', start: 1.0, end: 1.2 },
  { word: 'making', start: 1.2, end: 1.5 },
  { word: 'Anki', start: 1.5, end: 1.8 },
  { word: 'cards', start: 1.8, end: 2.1 },
  { word: 'stop', start: 2.5, end: 2.8 },
  { word: 'scrolling', start: 2.8, end: 3.3 },
  // ... add more words as needed
];

/**
 * Main ThomasUGC Composition
 *
 * @param {string} videoSrc - Path to Thomas's video file (e.g., "thomas-voiceover.mp4")
 * @param {Array} words - Whisper timestamp words array
 * @param {boolean} showCaptions - Whether to show captions
 * @param {number} playbackRate - Video playback speed
 */
export const ThomasUGC = ({
  videoSrc = 'thomas-voiceover.mp4',
  words = SAMPLE_WORDS,
  showCaptions = true,
  playbackRate = 1,
  showVideo = true, // Set to false to preview B-roll only
}) => {
  const frame = useCurrentFrame();
  const [videoError, setVideoError] = useState(false);

  // Calculate total duration from scene timing
  const totalDuration = toFrames(SCENE_TIMING.cta.endTime);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background - shown when video fails or is disabled */}
      {(!showVideo || videoError) && <StarsBackground starCount={80} />}

      {/* Thomas's video as base layer */}
      {showVideo && !videoError && (
        <Video
          src={staticFile(videoSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => {
            console.warn(`Video not found: ${videoSrc}. Showing B-roll only.`);
            setVideoError(true);
          }}
        />
      )}

      {/* B-Roll Overlays */}

      {/* Scene: Upload Demo (24.7s - 25.8s) with PDF Drag */}
      <Sequence
        from={toFrames(SCENE_TIMING.uploadDemo.startTime)}
        durationInFrames={toFrames(SCENE_TIMING.uploadDemo.endTime - SCENE_TIMING.uploadDemo.startTime)}
      >
        <UploadDemoScene />
      </Sequence>

      {/* Scene: Processing Demo (26.2s - 31.7s) */}
      <Sequence
        from={toFrames(SCENE_TIMING.processingDemo.startTime)}
        durationInFrames={toFrames(SCENE_TIMING.processingDemo.endTime - SCENE_TIMING.processingDemo.startTime)}
      >
        <ProcessingDemoScene />
      </Sequence>

      {/* Scene: Highlighted Card (32.3s - 34.3s) */}
      <Sequence
        from={toFrames(SCENE_TIMING.highlightedCard.startTime)}
        durationInFrames={toFrames(SCENE_TIMING.highlightedCard.endTime - SCENE_TIMING.highlightedCard.startTime)}
      >
        <HighlightedCardScene />
      </Sequence>

      {/* Captions */}
      {showCaptions && (
        <UGCCaptions
          words={words}
          playbackRate={playbackRate}
          bottomOffset={150}
          fontSize={36}
          mode="word"
          maxWords={5}
        />
      )}
    </AbsoluteFill>
  );
};

// Phone mockup wrapper - shows B-roll in a floating phone frame
const PhoneMockup = ({ children, position = 'right' }) => {
  const frame = useCurrentFrame();

  // Slide in animation
  const slideIn = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
  });

  const xOffset = position === 'right' ? 100 : -100;

  return (
    <div
      style={{
        position: 'absolute',
        top: 200,
        right: position === 'right' ? 40 : 'auto',
        left: position === 'left' ? 40 : 'auto',
        width: 340,
        height: 700,
        borderRadius: 40,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.1)',
        transform: `translateX(${(1 - slideIn) * xOffset}px) scale(${0.9 + slideIn * 0.1})`,
        opacity: slideIn,
        border: '3px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Phone screen content - scaled down */}
      <div
        style={{
          width: 1080,
          height: 1920,
          transform: 'scale(0.315)',
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Upload Demo Scene with PDF drag animation
const UploadDemoScene = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // PDF drag completes in ~30 frames (1 second)
  const pdfDragProgress = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <PhoneMockup position="right">
      <MockUploadScreen
        showOnFrame={0}
        selectedMode="anki"
        showFileSelected={false}
        showPDFDrag={true}
        pdfDragProgress={pdfDragProgress}
        userName="Future Doctor"
        showModeCards={false}
        showUploadZone={true}
      />
    </PhoneMockup>
  );
};

// Processing Demo Scene with animated cards
const ProcessingDemoScene = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Progressively show more cards (1 every 25 frames)
  const cardCount = Math.min(6, 1 + Math.floor(frame / 25));

  // Flip card 0 around frame 100
  const flipCardIndex = frame > 100 ? 0 : -1;

  return (
    <PhoneMockup position="right">
      <MockProcessingScreen
        showOnFrame={0}
        fileName="Cardiology_Lecture_15.pdf"
        cardCount={cardCount}
        totalCards={25}
        showCards={true}
        showProgress={true}
        flipCardIndex={flipCardIndex}
      />
    </PhoneMockup>
  );
};

// Highlighted Card Scene - showing a single card with highlighted text
const HighlightedCardScene = () => {
  const frame = useCurrentFrame();

  // Fade in
  const fadeIn = interpolate(
    frame,
    [0, 5],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Scale effect
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 10, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      }}
    >
      <div
        style={{
          width: 600,
          minHeight: 400,
          transform: `scale(${scale})`,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95), rgba(107, 33, 168, 0.95), rgba(79, 70, 229, 0.95))',
          padding: 32,
          border: '2px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.5)',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontSize: 16, color: '#ddd6fe' }}>#1</span>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(52, 211, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#34d399', fontSize: 12 }}>✓</span>
          </div>
        </div>

        {/* Question with highlighted key terms */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 22, color: '#fff', lineHeight: 1.6, fontWeight: 500 }}>
            What is the{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, rgba(250, 204, 21, 0.4), rgba(251, 191, 36, 0.4))',
                padding: '4px 8px',
                borderRadius: 4,
                color: '#facc15',
                fontWeight: 700,
              }}
            >
              pathophysiology
            </span>{' '}
            of{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, rgba(250, 204, 21, 0.4), rgba(251, 191, 36, 0.4))',
                padding: '4px 8px',
                borderRadius: 4,
                color: '#facc15',
                fontWeight: 700,
              }}
            >
              acute myocardial infarction
            </span>
            ?
          </p>
        </div>

        {/* Key Terms Label */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(250, 204, 21, 0.2)',
              border: '1px solid rgba(250, 204, 21, 0.5)',
              borderRadius: 20,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: '#facc15', fontSize: 14 }}>✨</span>
            <span style={{ color: '#facc15', fontSize: 14, fontWeight: 500 }}>
              Key terms highlighted automatically
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default ThomasUGC;
