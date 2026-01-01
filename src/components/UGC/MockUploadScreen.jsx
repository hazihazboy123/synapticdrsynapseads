import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring } from 'remotion';
import { StarsBackground } from './StarsBackground';
import { BrainIcon } from './BrainIcon';

// =====================================
// EXACT WEBSITE STYLING VALUES
// Source: /Users/haziq/synaptic-recall-repo/src/pages/Upload.tsx
// =====================================

// Mode selection card component - EXACT WEBSITE MATCH
const ModeCard = ({
  selected,
  title,
  icon,
  color, // 'blue' or 'red'
  features,
  showOnFrame,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();

  const scale = spring({
    frame: frame - showOnFrame - animationDelay,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  // EXACT WEBSITE VALUES:
  // Selected Anki: border-blue-600, bg from-blue-700/30 to-blue-800/30, shadow-lg shadow-blue-500/25
  // Selected Practice: border-red-600, bg from-red-700/30 to-red-800/30, shadow-lg shadow-red-500/25
  // Unselected: border-gray-700, bg-gray-900/30

  const borderColors = {
    blue: selected ? '#2563eb' : 'rgba(55, 65, 81, 1)', // border-blue-600 / border-gray-700
    red: selected ? '#dc2626' : 'rgba(55, 65, 81, 1)',  // border-red-600 / border-gray-700
  };

  const bgGradients = {
    blue: selected
      ? 'linear-gradient(135deg, rgba(29, 78, 216, 0.3), rgba(30, 64, 175, 0.3))' // from-blue-700/30 to-blue-800/30
      : 'rgba(17, 24, 39, 0.3)', // bg-gray-900/30
    red: selected
      ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.3), rgba(153, 27, 27, 0.3))' // from-red-700/30 to-red-800/30
      : 'rgba(17, 24, 39, 0.3)',
  };

  const shadows = {
    blue: selected ? '0 10px 15px -3px rgba(59, 130, 246, 0.25)' : 'none', // shadow-lg shadow-blue-500/25
    red: selected ? '0 10px 15px -3px rgba(239, 68, 68, 0.25)' : 'none',   // shadow-lg shadow-red-500/25
  };

  const iconBgGradients = {
    blue: selected
      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' // from-blue-600 to-blue-700
      : 'rgba(31, 41, 55, 1)', // bg-gray-800
    red: selected
      ? 'linear-gradient(135deg, #dc2626, #b91c1c)' // from-red-600 to-red-700
      : 'rgba(31, 41, 55, 1)',
  };

  const featureColors = {
    blue: selected ? 'rgba(219, 234, 254, 1)' : 'rgba(75, 85, 99, 1)', // text-blue-50 / text-gray-600
    red: selected ? 'rgba(254, 226, 226, 1)' : 'rgba(75, 85, 99, 1)',  // text-red-50 / text-gray-600
  };

  const checkmarkColors = {
    blue: selected ? '#93c5fd' : 'rgba(55, 65, 81, 1)', // text-blue-300 / text-gray-700
    red: selected ? '#fca5a5' : 'rgba(55, 65, 81, 1)',  // text-red-300 / text-gray-700
  };

  return (
    <div
      style={{
        flex: 1,
        padding: 20, // p-5 = 20px
        borderRadius: 16, // rounded-2xl = 16px
        border: `2px solid ${borderColors[color]}`, // border-2
        background: bgGradients[color],
        boxShadow: shadows[color],
        transform: `scale(${scale})`,
        opacity: scale,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 500ms', // transition-all duration-500
      }}
    >
      {/* Animated background glow for selected state */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: color === 'blue'
              ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(29, 78, 216, 0.15))' // from-blue-600/15 to-blue-700/15
              : 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.15))', // from-red-600/15 to-red-700/15
            borderRadius: 16,
            filter: 'blur(20px)', // blur-xl
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon container - p-4 rounded-xl */}
        <div
          style={{
            display: 'inline-flex',
            padding: 16, // p-4 = 16px
            borderRadius: 12, // rounded-xl = 12px
            background: iconBgGradients[color],
            marginBottom: 16,
            transition: 'all 500ms',
          }}
        >
          {icon}
        </div>

        {/* Title - text-2xl font-semibold */}
        <h3
          style={{
            fontSize: 24, // text-2xl = 24px
            fontWeight: 600, // font-semibold
            color: selected ? '#fff' : 'rgba(209, 213, 219, 1)', // text-white / text-gray-300
            marginBottom: 16,
            textAlign: 'center',
            transition: 'color 500ms',
          }}
        >
          {title}
        </h3>

        {/* Features - text-base with checkmarks, centered */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {features.map((feature, i) => (
            <li
              key={i}
              style={{
                fontSize: 16, // text-base = 16px
                color: featureColors[color],
                marginBottom: 8, // space-y-2
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 500ms',
              }}
            >
              <span
                style={{
                  marginRight: 8,
                  color: checkmarkColors[color],
                  transition: 'color 500ms',
                }}
              >
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Selected indicator - top-4 right-4 */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: 16, // top-4 = 16px
              right: 16, // right-4 = 16px
              width: 24, // w-6 = 24px
              height: 24, // h-6 = 24px
              borderRadius: '50%',
              background: color === 'blue'
                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' // from-blue-600 to-blue-700
                : 'linear-gradient(135deg, #dc2626, #b91c1c)', // from-red-600 to-red-700
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 12 }}>✓</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Book icon SVG - w-8 h-8 = 32px
const BookIcon = ({ color = '#fff' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

// Target icon SVG - w-8 h-8 = 32px
const TargetIcon = ({ color = '#fff' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// Upload icon SVG
const UploadIcon = ({ size = 24, color = 'rgba(107, 114, 128, 1)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// File icon SVG - w-12 h-12 = 48px in file selected state
const FileIcon = ({ color = '#a855f7' }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

// PDF File visual for drag animation
const PDFFile = ({ scale = 1, rotation = 0, shadowOpacity = 0.3 }) => (
  <div
    style={{
      width: 120 * scale,
      height: 150 * scale,
      background: '#fff',
      borderRadius: 8,
      boxShadow: `0 ${20 * scale}px ${40 * scale}px rgba(0, 0, 0, ${shadowOpacity})`,
      transform: `rotate(${rotation}deg)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* PDF Icon */}
    <div
      style={{
        width: 50 * scale,
        height: 60 * scale,
        background: '#dc2626', // red-600
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8 * scale,
      }}
    >
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 * scale }}>PDF</span>
    </div>
    {/* Filename */}
    <span
      style={{
        fontSize: 10 * scale,
        color: '#374151',
        textAlign: 'center',
        padding: `0 ${8 * scale}px`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '90%',
      }}
    >
      Lecture_23.pdf
    </span>
  </div>
);

export const MockUploadScreen = ({
  showOnFrame = 0,
  selectedMode = 'anki', // 'anki' or 'practice'
  showFileSelected = false,
  showPDFDrag = false, // NEW: Show PDF drag animation
  pdfDragProgress = 0, // 0 to 1, controls drag animation
  fileName = 'Pathophysiology_Lecture_23.pdf',
  fileSize = '4.2 MB',
  userName = 'Haziq',
  showModeCards = true,
  showUploadZone = true,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Staggered entrance animations
  const headerScale = spring({
    frame: frame - showOnFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const greetingOpacity = interpolate(
    frame - showOnFrame,
    [10, 25],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const modeCardsOpacity = interpolate(
    frame - showOnFrame,
    [20, 40],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const uploadZoneOpacity = interpolate(
    frame - showOnFrame,
    [35, 50],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // File selection animation
  const fileScale = showFileSelected
    ? spring({
        frame: frame - showOnFrame - 60,
        fps,
        config: { damping: 10, stiffness: 120 },
      })
    : 0;

  // PDF Drag animation calculations (1 second = 30 frames)
  // Start: top right, End: center of drop zone
  const pdfStartX = 900;
  const pdfStartY = 100;
  const pdfEndX = 540; // center
  const pdfEndY = 1200; // drop zone center

  const pdfX = interpolate(pdfDragProgress, [0, 1], [pdfStartX, pdfEndX]);
  const pdfY = interpolate(pdfDragProgress, [0, 1], [pdfStartY, pdfEndY]);
  const pdfScale = interpolate(pdfDragProgress, [0, 0.8, 1], [1, 1, 0.9]); // shrinks as it lands
  const pdfRotation = interpolate(pdfDragProgress, [0, 0.5, 1], [-5, 3, 0]); // slight wobble
  const pdfShadow = interpolate(pdfDragProgress, [0, 1], [0.3, 0.5]);

  // Drop zone highlight when PDF approaches
  const dropZoneHighlight = pdfDragProgress > 0.5;

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
          padding: '60px 40px',
        }}
      >
        {/* Brain Icon & Greeting - EXACT WEBSITE VALUES */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 48, // mb-12 = 48px
            transform: `scale(${headerScale})`,
            opacity: headerScale,
          }}
        >
          {/* Brain icon: w-20 h-20 (80px), rounded-2xl, gradient */}
          <BrainIcon size={80} showOnFrame={showOnFrame} />

          {/* Greeting: text-5xl md:text-6xl (48-60px), font-bold, gradient */}
          <h1
            style={{
              fontSize: 60, // text-6xl = 60px
              fontWeight: 700, // font-bold
              background: 'linear-gradient(90deg, #c084fc, #f472b6)', // from-purple-400 to-pink-400
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: 24, // mb-6 from brain icon
              opacity: greetingOpacity,
            }}
          >
            Hey there, {userName}!
          </h1>

          {/* Subtitle: text-xl md:text-2xl text-gray-400 font-light */}
          <p
            style={{
              fontSize: 24, // text-2xl = 24px
              color: 'rgba(156, 163, 175, 1)', // text-gray-400
              marginTop: 16, // mb-4
              fontWeight: 300, // font-light
              maxWidth: 700,
              textAlign: 'center',
              opacity: greetingOpacity,
            }}
          >
            {selectedMode === 'anki'
              ? 'Create Anki-compatible flashcards with clinical vignettes'
              : 'Generate board exam-style practice questions from your PDFs'}
          </p>
        </div>

        {/* Mode Selection Cards - max-w-6xl = 1152px */}
        {showModeCards && (
          <div
            style={{
              display: 'flex',
              gap: 24, // gap-6 = 24px
              width: '100%',
              maxWidth: 900,
              marginBottom: 48, // mb-12 = 48px
              opacity: modeCardsOpacity,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <ModeCard
              selected={selectedMode === 'anki'}
              title="Anki Flashcards"
              color="blue"
              icon={<BookIcon color={selectedMode === 'anki' ? '#fff' : 'rgba(156, 163, 175, 1)'} />}
              features={[
                'Images from slides embedded in cards',
                'AI generates optimal number of cards',
                'Real clinical vignettes included',
                'Download as .apkg file for Anki',
              ]}
              showOnFrame={showOnFrame}
              animationDelay={25}
            />

            <ModeCard
              selected={selectedMode === 'practice'}
              title="Practice Exam"
              color="red"
              icon={<TargetIcon color={selectedMode === 'practice' ? '#fff' : 'rgba(156, 163, 175, 1)'} />}
              features={[
                'USMLE-style multiple choice questions',
                'Take exam right in your browser',
                'Instant scoring with detailed explanations',
                'Track your performance over time',
              ]}
              showOnFrame={showOnFrame}
              animationDelay={30}
            />
          </div>
        )}

        {/* Upload Zone Container - bg-transparent border border-gray-800 rounded-2xl p-8 md:p-10 */}
        {showUploadZone && (
          <div
            style={{
              width: '100%',
              maxWidth: 900,
              opacity: uploadZoneOpacity,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <div
              style={{
                background: dropZoneHighlight ? 'rgba(126, 34, 206, 0.15)' : 'transparent', // hover:bg-purple-700/15
                border: dropZoneHighlight
                  ? '1px solid #9333ea' // hover:border-purple-600
                  : '1px solid rgba(31, 41, 55, 1)', // border-gray-800
                borderRadius: 16, // rounded-2xl = 16px
                padding: 40, // p-10 = 40px
                transition: 'all 300ms',
              }}
            >
              {/* Header - text-3xl md:text-4xl font-light */}
              <h2
                style={{
                  fontSize: 36, // text-4xl = 36px
                  fontWeight: 300, // font-light
                  color: '#fff',
                  textAlign: 'center',
                  marginBottom: 32, // mb-8
                }}
              >
                <span
                  style={{
                    background: selectedMode === 'anki'
                      ? 'linear-gradient(90deg, #60a5fa, #22d3ee)' // from-blue-400 to-cyan-400
                      : 'linear-gradient(90deg, #f87171, #ef4444)', // from-red-400 to-red-500
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {selectedMode === 'anki' ? 'Create Anki Cards' : 'Create Practice Exam'}
                </span>
              </h2>

              {/* File Selected State */}
              {showFileSelected ? (
                <div
                  style={{
                    transform: `scale(${fileScale})`,
                    opacity: fileScale,
                  }}
                >
                  {/* File preview container - bg-gray-900/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700 */}
                  <div
                    style={{
                      background: 'rgba(17, 24, 39, 0.3)', // bg-gray-900/30
                      backdropFilter: 'blur(24px)', // backdrop-blur-xl
                      borderRadius: 12, // rounded-xl = 12px
                      padding: 24, // p-6 = 24px
                      border: '1px solid rgba(55, 65, 81, 1)', // border-gray-700
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 24, // mb-6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* File icon with glow - blur-sm opacity-30 */}
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: selectedMode === 'anki'
                              ? 'linear-gradient(90deg, #a855f7, #ec4899)' // from-purple-500 to-pink-500
                              : 'linear-gradient(90deg, #3b82f6, #06b6d4)', // from-blue-500 to-cyan-500
                            borderRadius: 8,
                            filter: 'blur(4px)', // blur-sm
                            opacity: 0.3,
                          }}
                        />
                        <FileIcon color={selectedMode === 'anki' ? '#a855f7' : '#3b82f6'} />
                      </div>
                      <div>
                        {/* File name: text-lg opacity-90 */}
                        <p style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 300 }}>
                          {fileName}
                        </p>
                        {/* File size: text-base opacity-40 */}
                        <p style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.4)' }}>
                          {fileSize}
                        </p>
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: 24,
                        cursor: 'pointer',
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Generate Button - w-full rounded-full py-5 text-xl font-medium */}
                  <button
                    style={{
                      width: '100%',
                      padding: '20px 48px', // py-5 = 20px
                      borderRadius: 9999, // rounded-full
                      background: selectedMode === 'anki'
                        ? 'linear-gradient(90deg, #a855f7, #ec4899)' // from-purple-600 to-pink-600
                        : 'linear-gradient(90deg, #3b82f6, #06b6d4)', // from-blue-600 to-cyan-600
                      border: 'none',
                      color: '#fff',
                      fontSize: 20, // text-xl = 20px
                      fontWeight: 500, // font-medium
                      cursor: 'pointer',
                      boxShadow: selectedMode === 'anki'
                        ? '0 10px 30px rgba(168, 85, 247, 0.25)' // shadow-lg hover:shadow-purple-500/25
                        : '0 10px 30px rgba(59, 130, 246, 0.25)',
                    }}
                  >
                    {selectedMode === 'anki' ? '🚀 Generate Flashcards' : '🎯 Generate Practice Exam'}
                  </button>
                </div>
              ) : (
                /* Drop Zone - border-2 border-dashed rounded-xl p-10 md:p-12 */
                <div
                  style={{
                    border: `2px dashed ${dropZoneHighlight ? '#a855f7' : 'rgba(55, 65, 81, 1)'}`, // border-gray-700, purple on hover
                    borderRadius: 12, // rounded-xl = 12px
                    padding: 48, // p-12 = 48px
                    textAlign: 'center',
                    background: dropZoneHighlight ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                    transition: 'all 300ms',
                  }}
                >
                  {/* File icon - w-16 h-16 text-gray-600 */}
                  <div style={{ marginBottom: 24 }}>
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={dropZoneHighlight ? '#a855f7' : 'rgba(75, 85, 99, 1)'} // text-gray-600
                      strokeWidth="2"
                      style={{ margin: '0 auto', transition: 'stroke 300ms' }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                  </div>

                  {/* Text - text-2xl font-light */}
                  <h3 style={{ fontSize: 24, color: '#fff', fontWeight: 300, marginBottom: 8 }}>
                    {dropZoneHighlight ? 'Drop your PDF here' : 'Drag and drop your PDF'}
                  </h3>

                  <p style={{ fontSize: 16, color: 'rgba(107, 114, 128, 1)', marginBottom: 24 }}>
                    or
                  </p>

                  {/* Button - rounded-full px-10 py-4 text-lg font-light */}
                  <button
                    style={{
                      padding: '16px 40px', // py-4 px-10
                      borderRadius: 9999, // rounded-full
                      background: 'linear-gradient(90deg, #a855f7, #ec4899)', // from-purple-600 to-pink-600
                      border: 'none',
                      color: '#fff',
                      fontSize: 18, // text-lg = 18px
                      fontWeight: 300, // font-light
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <UploadIcon size={24} color="#fff" />
                    Choose PDF
                  </button>

                  <p style={{ fontSize: 16, color: 'rgba(75, 85, 99, 1)', marginTop: 24 }}>
                    Maximum file size: 25MB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PDF Drag Animation Overlay */}
      {showPDFDrag && pdfDragProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            left: pdfX - 60, // center the PDF
            top: pdfY - 75,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <PDFFile
            scale={pdfScale}
            rotation={pdfRotation}
            shadowOpacity={pdfShadow}
          />
          {/* Cursor indicator */}
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: 100,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(0, 0, 0, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
