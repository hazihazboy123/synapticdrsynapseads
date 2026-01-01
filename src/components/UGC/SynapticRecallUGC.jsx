import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { MockUploadScreen } from './MockUploadScreen';
import { MockProcessingScreen } from './MockProcessingScreen';
import { MockDownloadScreen } from './MockDownloadScreen';
import { StarsBackground } from './StarsBackground';
import { BrainIcon } from './BrainIcon';

/**
 * SCENE TIMING CONFIGURATION
 * These timestamps can be adjusted based on your voiceover
 * All values are in frames (30 fps = 1 second)
 */
const SCENE_CONFIG = {
  fps: 30,

  // Scene 1: Hook (0-3s) - "If you're in med school..."
  hook: {
    start: 0,
    duration: 90, // 3 seconds
  },

  // Scene 2: Pain Point (3-8s) - "I used to spend 2-3 hours..."
  painPoint: {
    start: 90,
    duration: 150, // 5 seconds
  },

  // Scene 3: Product Reveal (8-10s) - "Then I found Synaptic Recall!"
  productReveal: {
    start: 240,
    duration: 60, // 2 seconds
  },

  // Scene 4: Upload Demo (10-14s) - "You upload your lecture..."
  uploadDemo: {
    start: 300,
    duration: 120, // 4 seconds
  },

  // Scene 5: Processing (14-18s) - "creates the perfect amount of cards"
  processing: {
    start: 420,
    duration: 120, // 4 seconds
  },

  // Scene 6: Features (18-24s) - "Key terms highlighted, slides embedded..."
  features: {
    start: 540,
    duration: 180, // 6 seconds
  },

  // Scene 7: Results (24-27s) - "I went from barely keeping up..."
  results: {
    start: 720,
    duration: 90, // 3 seconds
  },

  // Scene 8: CTA (27-30s) - "Upload your first lecture free..."
  cta: {
    start: 810,
    duration: 90, // 3 seconds
  },
};

// Total duration
const TOTAL_DURATION = 900; // 30 seconds at 30fps

// Hook scene - attention grabber
const HookScene = () => {
  const frame = useCurrentFrame();

  const textScale = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  const glowPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.5, 1]
  );

  return (
    <AbsoluteFill>
      <StarsBackground starCount={100} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        {/* Attention grabber text */}
        <div
          style={{
            transform: `scale(${textScale})`,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 24,
              lineHeight: 1.2,
              textShadow: `0 0 ${40 * glowPulse}px rgba(168, 85, 247, ${glowPulse})`,
            }}
          >
            Med School?
          </h1>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 32,
            }}
          >
            Making Anki Cards?
          </h2>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(156, 163, 175, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                width: 60,
                height: 3,
                background: 'linear-gradient(90deg, transparent, #a855f7)',
              }}
            />
            Stop scrolling
            <span
              style={{
                width: 60,
                height: 3,
                background: 'linear-gradient(90deg, #ec4899, transparent)',
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Pain point scene - relatability
const PainPointScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Clock animation
  const clockRotation = frame * 2;

  return (
    <AbsoluteFill>
      <StarsBackground starCount={60} twinkle={false} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          opacity: fadeIn,
        }}
      >
        {/* Time representation */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '4px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            position: 'relative',
          }}
        >
          {/* Clock hand */}
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 50,
              background: '#ef4444',
              borderRadius: 2,
              transformOrigin: 'bottom center',
              transform: `rotate(${clockRotation}deg)`,
            }}
          />
          <span style={{ fontSize: 24, color: '#ef4444', fontWeight: 700 }}>
            2-3h
          </span>
        </div>

        {/* Pain text */}
        <h2
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 1.3,
          }}
        >
          Hours spent making cards
        </h2>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(239, 68, 68, 1)',
            textAlign: 'center',
          }}
        >
          No energy left to study them
        </p>

        {/* Frustration icons */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
          }}
        >
          {['😩', '📚', '💤'].map((emoji, i) => (
            <span
              key={i}
              style={{
                fontSize: 48,
                opacity: interpolate(frame, [30 + i * 10, 40 + i * 10], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Product reveal scene
const ProductRevealScene = () => {
  const frame = useCurrentFrame();

  const iconScale = spring({
    frame,
    fps: 30,
    config: { damping: 8, stiffness: 120 },
  });

  const textScale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 10, stiffness: 100 },
  });

  const glowIntensity = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.4, 0.8]
  );

  return (
    <AbsoluteFill>
      <StarsBackground starCount={120} />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center, rgba(168, 85, 247, ${glowIntensity * 0.3}) 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ transform: `scale(${iconScale})` }}>
          <BrainIcon size={120} showOnFrame={0} />
        </div>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a855f7, #ec4899, #a855f7)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: 32,
            transform: `scale(${textScale})`,
            opacity: textScale,
          }}
        >
          Synaptic Recall
        </h1>

        <p
          style={{
            fontSize: 24,
            color: 'rgba(209, 213, 219, 1)',
            marginTop: 16,
            opacity: Math.min(textScale, 1),
          }}
        >
          AI-Powered Flashcards for Med Students
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Feature highlight scene
const FeaturesScene = () => {
  const frame = useCurrentFrame();

  // Cycle through features
  const featureIndex = Math.floor(frame / 60) % 3; // Change every 2 seconds

  const features = [
    {
      icon: '🎯',
      title: 'Key Terms Highlighted',
      subtitle: 'AI identifies what\'s high-yield',
    },
    {
      icon: '📑',
      title: 'Slides Embedded',
      subtitle: 'Visual context in every card',
    },
    {
      icon: '📝',
      title: '10+ Practice Questions',
      subtitle: 'Exam-style questions included',
    },
  ];

  const currentFeature = features[featureIndex];
  const featureProgress = (frame % 60) / 60;

  const featureScale = spring({
    frame: frame % 60,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill>
      <StarsBackground starCount={80} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        {/* Feature card */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 48,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.2)',
            transform: `scale(${featureScale})`,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          <span style={{ fontSize: 72, marginBottom: 24, display: 'block' }}>
            {currentFeature.icon}
          </span>

          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 12,
            }}
          >
            {currentFeature.title}
          </h2>

          <p style={{ fontSize: 22, color: 'rgba(192, 132, 252, 1)' }}>
            {currentFeature.subtitle}
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {features.map((_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: i === featureIndex ? '#a855f7' : 'rgba(75, 85, 99, 1)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Results scene
const ResultsScene = () => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 10, stiffness: 80 },
  });

  return (
    <AbsoluteFill>
      <StarsBackground starCount={100} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          transform: `scale(${scale})`,
        }}
      >
        {/* Before/After comparison */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginBottom: 40,
          }}
        >
          {/* Before */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              width: 200,
            }}
          >
            <span style={{ fontSize: 14, color: 'rgba(239, 68, 68, 1)', textTransform: 'uppercase' }}>
              Before
            </span>
            <p style={{ fontSize: 20, color: '#fff', marginTop: 12 }}>
              Barely keeping up
            </p>
            <span style={{ fontSize: 40, marginTop: 12, display: 'block' }}>😓</span>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 40 }}>→</span>
          </div>

          {/* After */}
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              width: 200,
            }}
          >
            <span style={{ fontSize: 14, color: 'rgba(34, 197, 94, 1)', textTransform: 'uppercase' }}>
              After
            </span>
            <p style={{ fontSize: 20, color: '#fff', marginTop: 12 }}>
              Crushing exams
            </p>
            <span style={{ fontSize: 40, marginTop: 12, display: 'block' }}>🎯</span>
          </div>
        </div>

        <h2
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          While saving{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #22c55e, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            hours
          </span>{' '}
          every day
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// CTA scene
const CTAScene = () => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 10, stiffness: 80 },
  });

  const pulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [1, 1.05]
  );

  return (
    <AbsoluteFill>
      <StarsBackground starCount={100} />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          transform: `scale(${scale})`,
        }}
      >
        <BrainIcon size={80} showOnFrame={0} />

        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginTop: 32,
            marginBottom: 16,
          }}
        >
          Try it{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #22c55e, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FREE
          </span>
        </h1>

        <p style={{ fontSize: 24, color: 'rgba(209, 213, 219, 1)', marginBottom: 32, textAlign: 'center' }}>
          No credit card required
        </p>

        {/* CTA Button */}
        <button
          style={{
            padding: '24px 64px',
            borderRadius: 9999,
            background: 'linear-gradient(90deg, #a855f7, #ec4899)',
            border: 'none',
            color: '#fff',
            fontSize: 24,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(168, 85, 247, 0.5)',
            transform: `scale(${pulse})`,
          }}
        >
          Click Link Below ⬇️
        </button>
      </div>
    </AbsoluteFill>
  );
};

/**
 * MAIN COMPOSITION
 * This orchestrates all scenes based on the voiceover timing
 */
export const SynapticRecallUGC = ({
  audioSrc, // Optional: path to voiceover audio
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Audio track (if provided) */}
      {audioSrc && <Audio src={staticFile(audioSrc)} />}

      {/* Scene 1: Hook */}
      <Sequence from={SCENE_CONFIG.hook.start} durationInFrames={SCENE_CONFIG.hook.duration}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Pain Point */}
      <Sequence from={SCENE_CONFIG.painPoint.start} durationInFrames={SCENE_CONFIG.painPoint.duration}>
        <PainPointScene />
      </Sequence>

      {/* Scene 3: Product Reveal */}
      <Sequence from={SCENE_CONFIG.productReveal.start} durationInFrames={SCENE_CONFIG.productReveal.duration}>
        <ProductRevealScene />
      </Sequence>

      {/* Scene 4: Upload Demo */}
      <Sequence from={SCENE_CONFIG.uploadDemo.start} durationInFrames={SCENE_CONFIG.uploadDemo.duration}>
        <MockUploadScreen
          showOnFrame={0}
          selectedMode="anki"
          showFileSelected={false}
          userName="Future Doctor"
        />
      </Sequence>

      {/* Scene 4b: File Selected */}
      <Sequence from={SCENE_CONFIG.uploadDemo.start + 60} durationInFrames={60}>
        <MockUploadScreen
          showOnFrame={0}
          selectedMode="anki"
          showFileSelected={true}
          fileName="Cardiology_Lecture_15.pdf"
          fileSize="8.2 MB"
          userName="Future Doctor"
        />
      </Sequence>

      {/* Scene 5: Processing */}
      <Sequence from={SCENE_CONFIG.processing.start} durationInFrames={SCENE_CONFIG.processing.duration}>
        <MockProcessingScreen
          showOnFrame={0}
          fileName="Cardiology_Lecture_15.pdf"
          cardCount={6}
          totalCards={25}
        />
      </Sequence>

      {/* Scene 6: Features */}
      <Sequence from={SCENE_CONFIG.features.start} durationInFrames={SCENE_CONFIG.features.duration}>
        <FeaturesScene />
      </Sequence>

      {/* Scene 7: Results */}
      <Sequence from={SCENE_CONFIG.results.start} durationInFrames={SCENE_CONFIG.results.duration}>
        <ResultsScene />
      </Sequence>

      {/* Scene 8: CTA */}
      <Sequence from={SCENE_CONFIG.cta.start} durationInFrames={SCENE_CONFIG.cta.duration}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
