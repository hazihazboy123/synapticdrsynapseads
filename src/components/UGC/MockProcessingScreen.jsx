import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring } from 'remotion';
import { StarsBackground } from './StarsBackground';
import { BrainIcon } from './BrainIcon';

// =====================================
// EXACT WEBSITE STYLING VALUES
// Source: /Users/haziq/synaptic-recall-repo/src/components/flashcard/FlashcardFeed.tsx
// Source: /Users/haziq/synaptic-recall-repo/src/components/flashcard/CardGrid.tsx
// =====================================

// Sample flashcard data
const SAMPLE_FLASHCARDS = [
  {
    id: 1,
    front: 'What is the pathophysiology of acute myocardial infarction?',
    back: 'Acute MI occurs when coronary artery occlusion leads to myocardial necrosis due to ischemia.',
    hasVignette: true,
    hasVisual: false,
  },
  {
    id: 2,
    front: 'List the classic symptoms of pneumonia',
    back: 'Fever, productive cough, dyspnea, chest pain. Mnemonic: FPDC',
    hasVignette: false,
    hasVisual: false,
  },
  {
    id: 3,
    front: 'What are the contraindications for thrombolytic therapy?',
    back: 'Active bleeding, recent surgery (<3 weeks), severe HTN (>180/110), history of hemorrhagic stroke',
    hasVignette: true,
    hasVisual: true,
  },
  {
    id: 4,
    front: 'Define the pathophysiology of diabetic ketoacidosis (DKA)',
    back: 'Insulin deficiency leads to lipolysis, producing ketones. Results in metabolic acidosis, dehydration, electrolyte imbalances.',
    hasVignette: true,
    hasVisual: false,
  },
  {
    id: 5,
    front: 'What is the first-line treatment for anaphylaxis?',
    back: 'Intramuscular epinephrine (0.3-0.5mg of 1:1000) in the anterolateral thigh',
    hasVignette: true,
    hasVisual: false,
  },
  {
    id: 6,
    front: 'What are the Beck\'s triad findings in cardiac tamponade?',
    back: 'Hypotension, JVD (jugular venous distension), muffled heart sounds',
    hasVignette: false,
    hasVisual: true,
  },
];

// Single flashcard component - EXACT WEBSITE MATCH
// From CardGrid.tsx: h-[400px], rounded-xl
// Front: bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-indigo-900/80
// Border: border border-purple-500/20
const FlashcardPreview = ({ card, index, showOnFrame, isFlipped = false }) => {
  const frame = useCurrentFrame();
  const delay = index * 8;

  const scale = spring({
    frame: frame - showOnFrame - delay,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(
    frame - showOnFrame - delay,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Flip animation - matches website: duration: 0.4s ease-in-out
  const flipProgress = isFlipped
    ? interpolate(
        frame - showOnFrame - delay - 20,
        [0, 12], // 0.4s at 30fps = 12 frames
        [0, 180],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
      )
    : 0;

  const showFront = flipProgress < 90;

  return (
    <div
      style={{
        width: '100%',
        height: 360, // h-[400px] but slightly smaller for video
        perspective: 1000, // perspective-1000
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d', // transform-style-preserve-3d
          transform: `rotateY(${flipProgress}deg)`,
        }}
      >
        {/* Front of card - EXACT WEBSITE STYLING */}
        {/* bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-indigo-900/80 */}
        {/* border border-purple-500/20 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: 12, // rounded-xl = 12px
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.8), rgba(107, 33, 168, 0.8), rgba(79, 70, 229, 0.8))',
            padding: 24, // p-6 = 24px
            border: '1px solid rgba(168, 85, 247, 0.2)', // border-purple-500/20
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-xl
            backdropFilter: 'blur(4px)', // backdrop-blur-sm
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16, // mb-4
              flexShrink: 0,
            }}
          >
            {/* Card number: text-sm font-medium text-purple-200 */}
            <span style={{ fontSize: 14, fontWeight: 500, color: '#ddd6fe' }}>
              #{card.id}
            </span>
            {/* Vignette indicator: w-5 h-5 bg-green-400/20 rounded-full */}
            {card.hasVignette && (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.2)', // bg-green-400/20
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </div>
            )}
          </div>

          {/* Question: text-base font-medium leading-relaxed */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              paddingBottom: 48, // room for "Tap for answer"
            }}
          >
            <p
              style={{
                fontSize: 16, // text-base = 16px
                fontWeight: 500, // font-medium
                color: '#fff',
                lineHeight: 1.625, // leading-relaxed
                textAlign: 'center',
              }}
            >
              {card.front}
            </p>
          </div>

          {/* "Tap for answer": text-xs text-purple-300/70 */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(88, 28, 135, 1), rgba(88, 28, 135, 0.95), transparent)',
              paddingTop: 32,
              paddingBottom: 12,
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.7)', textAlign: 'center' }}>
              Tap for answer
            </p>
          </div>
        </div>

        {/* Back of card - EXACT WEBSITE STYLING */}
        {/* bg-gradient-to-br from-gray-900/95 to-gray-800/95 */}
        {/* border border-gray-700/30 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 12, // rounded-xl
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
            padding: 24, // p-6
            border: '1px solid rgba(55, 65, 81, 0.3)', // border-gray-700/30
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12, // mb-3
              flexShrink: 0,
            }}
          >
            {/* "Answer": text-sm font-medium text-green-400 */}
            <span style={{ fontSize: 14, fontWeight: 500, color: '#4ade80' }}>
              Answer
            </span>
            {/* Card number: text-xs text-gray-400 */}
            <span style={{ fontSize: 12, color: 'rgba(156, 163, 175, 1)' }}>
              #{card.id}
            </span>
          </div>

          {/* Answer: text-sm leading-relaxed text-gray-100 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontSize: 14, // text-sm = 14px
                color: 'rgba(243, 244, 246, 1)', // text-gray-100
                lineHeight: 1.625, // leading-relaxed
              }}
            >
              {card.back}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress indicator component - EXACT WEBSITE STYLING
// bg-black/80 backdrop-blur-xl rounded-xl p-6
const ProgressIndicator = ({ current, total, showOnFrame, status = 'generating' }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - showOnFrame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const progress = (current / total) * 100;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 800,
        padding: 24, // p-6 = 24px
        background: 'rgba(0, 0, 0, 0.8)', // bg-black/80
        backdropFilter: 'blur(24px)', // backdrop-blur-xl
        borderRadius: 12, // rounded-xl = 12px
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12, // mb-3
        }}
      >
        {/* Label: text-white opacity-70 font-light text-lg */}
        <span style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 300 }}>
          Generating cards...
        </span>
        {/* Progress text: text-white opacity-90 font-light text-lg */}
        <span style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 300 }}>
          {current} / {total}
        </span>
      </div>

      {/* Progress bar: bg-gray-800 bg-opacity-50 rounded-full h-3 */}
      <div
        style={{
          width: '100%',
          height: 12, // h-3 = 12px
          background: 'rgba(31, 41, 55, 0.5)', // bg-gray-800 bg-opacity-50
          borderRadius: 9999, // rounded-full
          overflow: 'hidden',
        }}
      >
        {/* Bar fill: gradient from-purple-500 to-pink-500 */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #a855f7, #ec4899)', // from-purple-500 to-pink-500
            borderRadius: 9999,
          }}
        />
      </div>
    </div>
  );
};

export const MockProcessingScreen = ({
  showOnFrame = 0,
  fileName = 'Pathophysiology_Lecture_23.pdf',
  cardCount = 6,
  totalCards = 25,
  showCards = true,
  showProgress = true,
  flipCardIndex = -1, // Which card to flip (-1 = none)
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Header animation
  const headerScale = spring({
    frame: frame - showOnFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Processing dots animation - EXACT WEBSITE VALUES
  // w-2 h-2, colors #a855f7, #ec4899, #3b82f6
  // Animation: scale [1, 1.5, 1], opacity [1, 0.5, 1], 1s repeat
  const dotPhase = (frame - showOnFrame) * 0.21; // ~1s cycle at 30fps
  const dot1Scale = interpolate(Math.sin(dotPhase), [-1, 1], [1, 1.5]);
  const dot2Scale = interpolate(Math.sin(dotPhase + 0.7), [-1, 1], [1, 1.5]);
  const dot3Scale = interpolate(Math.sin(dotPhase + 1.4), [-1, 1], [1, 1.5]);
  const dot1Opacity = interpolate(Math.sin(dotPhase), [-1, 1], [0.5, 1]);
  const dot2Opacity = interpolate(Math.sin(dotPhase + 0.7), [-1, 1], [0.5, 1]);
  const dot3Opacity = interpolate(Math.sin(dotPhase + 1.4), [-1, 1], [0.5, 1]);

  // Calculate which cards to show based on cardCount
  const visibleCards = SAMPLE_FLASHCARDS.slice(0, Math.min(cardCount, SAMPLE_FLASHCARDS.length));

  return (
    <AbsoluteFill>
      <StarsBackground starCount={60} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 40px',
        }}
      >
        {/* Header Section - EXACT WEBSITE STYLING */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
            transform: `scale(${headerScale})`,
            opacity: headerScale,
          }}
        >
          {/* Brain icon: w-16 h-16 (64px) in rounded-2xl container */}
          <BrainIcon size={64} showOnFrame={showOnFrame} />

          {/* Title: text-3xl md:text-4xl font-bold */}
          <h1
            style={{
              fontSize: 36, // text-4xl = 36px
              fontWeight: 700, // font-bold
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: 20,
            }}
          >
            Generating Your Flashcards
          </h1>

          {/* Subtitle: text-base text-gray-300 */}
          <p style={{ fontSize: 16, color: 'rgba(209, 213, 219, 1)', marginTop: 8 }}>
            Creating cards from{' '}
            <span style={{ color: '#a855f7', fontWeight: 500 }}>{fileName}</span>
          </p>

          {/* Processing dots - w-2 h-2 = 8px, colors #a855f7, #ec4899, #3b82f6 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <div
              style={{
                width: 8, // w-2 = 8px
                height: 8, // h-2 = 8px
                borderRadius: '50%',
                background: '#a855f7', // purple-500
                transform: `scale(${dot1Scale})`,
                opacity: dot1Opacity,
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ec4899', // pink-500
                transform: `scale(${dot2Scale})`,
                opacity: dot2Opacity,
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#3b82f6', // blue-500
                transform: `scale(${dot3Scale})`,
                opacity: dot3Opacity,
              }}
            />
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div style={{ marginBottom: 32, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ProgressIndicator
              current={cardCount}
              total={totalCards}
              showOnFrame={showOnFrame + 10}
            />
          </div>
        )}

        {/* Cards Grid - 3 columns, gap-6 = 24px */}
        {showCards && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
              gap: 24, // gap-6 = 24px
              width: '100%',
              maxWidth: 900,
              flex: 1,
              alignContent: 'start',
            }}
          >
            {visibleCards.map((card, index) => (
              <FlashcardPreview
                key={card.id}
                card={card}
                index={index}
                showOnFrame={showOnFrame + 20}
                isFlipped={index === flipCardIndex}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
