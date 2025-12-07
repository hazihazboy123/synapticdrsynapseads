# VIRAL OPTIMIZATION SYSTEM - COMPREHENSIVE DOCUMENTATION

## Overview
This document details every viral optimization feature added to the Synaptic Recall medical education ads. The goal is to maximize engagement, trigger dopamine responses, and create TikTok/social media-optimized content through strategic micro-interactions and animations.

**Project:** Synaptic Recall Ads (Remotion-based video generation)
**Reference Implementation:** PyrazinamideAd.jsx
**Framework:** Remotion (React-based video composition)

---

## TABLE OF CONTENTS
1. [Audio-Synced Vignette Highlights](#1-audio-synced-vignette-highlights)
2. [Staggered Option Reveals](#2-staggered-option-reveals)
3. [Screen Shake on Critical Values](#3-screen-shake-on-critical-values)
4. [Lab Value Pulsing Animation](#4-lab-value-pulsing-animation)
5. [Thinking Cursor Simulation](#5-thinking-cursor-simulation)
6. [Brain Mascot Emotional Reactions](#6-brain-mascot-emotional-reactions)
7. [Enhanced Countdown Timer](#7-enhanced-countdown-timer)
8. [Caption Word Emphasis](#8-caption-word-emphasis)
9. [Sound Effects System](#9-sound-effects-system)
10. [Visual Feedback on Answer Reveal](#10-visual-feedback-on-answer-reveal)

---

## 1. AUDIO-SYNCED VIGNETTE HIGHLIGHTS

### Purpose
Highlight specific words/phrases in the medical vignette exactly when they're spoken in the narration, creating perfect audio-visual synchronization.

### Where It's Implemented
- **Component:** `MedicalQuestionCard.jsx`
- **Data Source:** `vignetteHighlights` array passed as prop from parent ad component

### How It Works

**Step 1: Define Highlights in Ad Component**
```javascript
// In PyrazinamideAd.jsx
const vignetteHighlights = [
  { phrase: "RIPE therapy", timestamp: 5.62 },        // When narrator says "RIPE"
  { phrase: "jaundice", timestamp: 8.03 },            // When narrator says "YELLOW"
  { phrase: "850 U/L", timestamp: 15.00 },            // When narrator says "850"
  { phrase: "720 U/L", timestamp: 16.50 },            // When narrator says "720"
  { phrase: "9.2 mg/dL", timestamp: 18.62 },          // When narrator says "9.2"
];
```

**Timestamp Format:**
- Raw audio seconds (not adjusted for playback rate)
- Conversion happens in MedicalQuestionCard component

**Step 2: Pass to MedicalQuestionCard**
```javascript
<MedicalQuestionCard
  questionData={questionData}
  vignetteHighlights={vignetteHighlights}
  playbackRate={PLAYBACK_RATE}
  // ... other props
/>
```

**Step 3: Highlighting Logic in MedicalQuestionCard.jsx**

Located around lines 150-180:
```javascript
// Convert timestamp to frames
const highlightFrame = Math.floor((highlight.timestamp / playbackRate) * fps);
const highlightDuration = 45; // frames (~1.5 seconds at 30fps)

// Check if current frame is within highlight window
const isHighlighted = frame >= highlightFrame &&
                      frame < highlightFrame + highlightDuration;

// Apply to vignette text rendering
{isHighlighted && (
  <span style={{
    backgroundColor: 'rgba(251, 191, 36, 0.3)', // Gold highlight
    padding: '2px 6px',
    borderRadius: '4px',
    boxShadow: '0 0 12px rgba(251, 191, 36, 0.6)', // Glow effect
  }}>
    {phrase}
  </span>
)}
```

**Visual Effect:**
- Gold background box appears around phrase
- Soft glow effect
- Lasts ~1.5 seconds
- Perfectly synced with narrator's voice

### Sound Effects
Each highlight triggers a pop sound (see Sound Effects System section).

---

## 2. STAGGERED OPTION REVEALS

### Purpose
Make answer options appear one-by-one in sequence rather than all at once, creating anticipation and visual interest.

### Where It's Implemented
- **Component:** `MedicalQuestionCard.jsx`
- **Data Source:** `optionTimestamps` object passed from ad component

### How It Works

**Step 1: Define Option Timestamps**
```javascript
// In PyrazinamideAd.jsx
const optionTimestamps = {
  A: 30.523,  // When narrator says "A?"
  B: 31.196,  // When narrator says "B?"
  C: 32.055,  // When narrator says "C?"
  D: 32.903,  // When narrator says "D?"
  E: 34.273,  // When narrator says "E?"
};
```

**Step 2: Fly-In Animation Logic (MedicalQuestionCard.jsx, lines 380-420)**
```javascript
// Determine if option should be visible yet
const optionRevealTime = optionTimestamps?.[option.letter];
let isOptionVisible = true;
let flyInScale = 1;
let flyInOpacity = 1;

if (optionRevealTime && !isRevealed) {
  const optionRevealFrame = Math.floor((optionRevealTime / playbackRate) * fps) + frameOffset;
  const framesSinceReveal = frame - optionRevealFrame;

  if (frame < optionRevealFrame) {
    // Not visible yet
    isOptionVisible = false;
  } else if (framesSinceReveal < 12) {
    // Fly-in animation (12 frames = 0.4s)
    flyInScale = interpolate(
      framesSinceReveal,
      [0, 12],
      [0.8, 1],
      {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.5)) // Elastic bounce
      }
    );
    flyInOpacity = interpolate(framesSinceReveal, [0, 8], [0, 1], {
      extrapolateRight: 'clamp'
    });
  }
}

if (!isOptionVisible) return null; // Don't render yet
```

**Animation Details:**
- **Timing:** 12 frames (0.4 seconds)
- **Scale:** 0.8 → 1.0 (slight zoom in)
- **Opacity:** 0 → 1 (fade in)
- **Easing:** `Easing.out(Easing.back(1.5))` - elastic bounce effect
- **Effect:** Each option "pops" into view when narrator reads it

---

## 3. SCREEN SHAKE ON CRITICAL VALUES

### Purpose
Create visceral impact when critical/dangerous lab values are revealed, making them feel DANGEROUS and important.

### Where It's Implemented
- **Component:** `PyrazinamideAd.jsx`
- **Function:** `getScreenShake()`
- **Applied To:** Root `<AbsoluteFill>` container

### How It Works

**Step 1: Define Shake Function (lines 146-189)**
```javascript
const getScreenShake = () => {
  let shakeX = 0;
  let shakeY = 0;

  // Shake 1: "850 U/L" (ALT) critical value appears (15.00s)
  const shake1Frame = Math.floor((15.00 / PLAYBACK_RATE) * fps);
  const shake1Duration = 8; // 8 frames = ~0.27s
  if (frame >= shake1Frame && frame < shake1Frame + shake1Duration) {
    const framesIntoShake = frame - shake1Frame;
    const intensity = interpolate(framesIntoShake, [0, 3, shake1Duration], [0, 6, 0], {
      extrapolateRight: 'clamp'
    });
    shakeX += Math.sin(frame * 2) * intensity;
    shakeY += Math.cos(frame * 1.5) * intensity;
  }

  // Shake 2: "720 U/L" (AST) critical value appears (16.50s)
  const shake2Frame = Math.floor((16.50 / PLAYBACK_RATE) * fps);
  const shake2Duration = 8;
  if (frame >= shake2Frame && frame < shake2Frame + shake2Duration) {
    const framesIntoShake = frame - shake2Frame;
    const intensity = interpolate(framesIntoShake, [0, 3, shake2Duration], [0, 6, 0], {
      extrapolateRight: 'clamp'
    });
    shakeX += Math.sin(frame * 2) * intensity;
    shakeY += Math.cos(frame * 1.5) * intensity;
  }

  // Shake 3: "9.2 mg/dL" (Uric acid) elevated value appears (18.62s)
  const shake3Frame = Math.floor((18.62 / PLAYBACK_RATE) * fps);
  const shake3Duration = 8;
  if (frame >= shake3Frame && frame < shake3Frame + shake3Duration) {
    const framesIntoShake = frame - shake3Frame;
    const intensity = interpolate(framesIntoShake, [0, 3, shake3Duration], [0, 6, 0], {
      extrapolateRight: 'clamp'
    });
    shakeX += Math.sin(frame * 2) * intensity;
    shakeY += Math.cos(frame * 1.5) * intensity;
  }

  return { x: shakeX, y: shakeY };
};
```

**Step 2: Apply to Root Container**
```javascript
const shake = getScreenShake();

return (
  <AbsoluteFill style={{
    backgroundColor: '#0a0a0a',
    transform: `translate(${shake.x}px, ${shake.y}px)`
  }}>
    {/* All content */}
  </AbsoluteFill>
);
```

**Animation Details:**
- **Duration:** 8 frames (~0.27 seconds)
- **Intensity Curve:** 0 → 6px → 0 (ramps up then down)
- **Pattern:** Sine/cosine waves for natural shake (not just left-right)
- **Frequency:** Fast oscillation (`frame * 2` for X, `frame * 1.5` for Y)

**When to Use:**
- ONLY on critical/elevated lab values with gold highlight boxes
- Selective application - too many shakes = overwhelming
- Typically 2-3 shakes per video maximum

**Implementation Pattern for New Ads:**
1. Identify critical lab values that should shock the viewer
2. Note exact timestamp when narrator says the value
3. Add shake trigger at that timestamp
4. Ensure corresponding vignette highlight exists (gold box)

---

## 4. LAB VALUE PULSING ANIMATION

### Purpose
Make critical/elevated lab values subtly pulse to draw eye attention without being overwhelming.

### Where It's Implemented
- **Component:** `MedicalQuestionCard.jsx`
- **Applied To:** Individual value text within lab value display boxes
- **Location:** Lines 220-260 (within lab values rendering)

### How It Works

**Step 1: Determine if Lab Should Pulse**
```javascript
// Check if this lab value is currently highlighted (from vignetteHighlights)
const labHighlight = vignetteHighlights.find(h => h.phrase === lab.value);
const isHighlighted = labHighlight && (() => {
  const highlightFrame = Math.floor((labHighlight.timestamp / playbackRate) * fps) + frameOffset;
  return frame >= highlightFrame && frame < highlightFrame + 45;
})();
```

**Step 2: Calculate Pulse Intensity**
```javascript
const isCritical = lab.status === 'critical';
const isElevated = lab.status === 'elevated';
let valuePulseScale = 1;
let valueGlowIntensity = 0;

if (isCritical && isHighlighted) {
  // Critical values: more prominent pulse
  valuePulseScale = 1 + Math.sin(frame * 0.2) * 0.015; // 1.0 → 1.03
  valueGlowIntensity = 4 + Math.sin(frame * 0.2) * 2; // 2-6px glow
} else if (isElevated && isHighlighted) {
  // Elevated values: subtle pulse
  valuePulseScale = 1 + Math.sin(frame * 0.2) * 0.01; // 1.0 → 1.01
  valueGlowIntensity = 2 + Math.sin(frame * 0.2) * 1; // 1-3px glow
}
```

**Step 3: Apply to Value Text Only (NOT the box)**
```javascript
<span style={{
  color: lab.color,
  fontWeight: 600,
  transform: `scale(${valuePulseScale})`,
  display: 'inline-block',
  textShadow: (isCritical || isElevated) && isHighlighted && valueGlowIntensity > 0
    ? `0 0 ${valueGlowIntensity}px rgba(239, 68, 68, ${isCritical ? 0.6 : 0.4})`
    : 'none',
  transition: 'none', // Instant updates
  transformOrigin: 'center center',
}}>
  {lab.value}
</span>
```

**Animation Details:**
- **Critical Status:**
  - Scale: 1.0 → 1.03 (3% size increase)
  - Glow: 2-6px red shadow
  - Opacity: 60%
- **Elevated Status:**
  - Scale: 1.0 → 1.01 (1% size increase)
  - Glow: 1-3px red shadow
  - Opacity: 40%
- **Frequency:** `Math.sin(frame * 0.2)` = slow, gentle pulse
- **Duration:** While vignette highlight is active (~1.5 seconds)

**Key Design Decision:**
- Pulse ONLY the numeric value text, NOT the entire box
- Prevents visual overwhelm
- Maintains readability while adding subtle motion

---

## 5. THINKING CURSOR SIMULATION

### Purpose
Simulate a real user considering options with their mouse, creating relatability and anticipation before clicking the correct answer.

### Where It's Implemented
- **Component:** `ThinkingCursor.jsx` (new component)
- **Rendered In:** `PyrazinamideAd.jsx`
- **Active Period:** From question start to answer reveal

### How It Works

**Step 1: Define Cursor in Ad Component**
```javascript
// In PyrazinamideAd.jsx (lines 33-61)
const getCursorHoverOption = () => {
  const thinkingDuration = answerRevealFrame - questionStartFrame;
  const frameIntoThinking = frame - questionStartFrame;

  if (frameIntoThinking < 0 || frameIntoThinking >= thinkingDuration) {
    return null;
  }

  const progress = frameIntoThinking / thinkingDuration;

  // Match the movement sequence from ThinkingCursor
  const movementSequence = [
    { option: 'A', startProgress: 0.0, endProgress: 0.18 },
    { option: 'B', startProgress: 0.2, endProgress: 0.38 },
    { option: 'C', startProgress: 0.4, endProgress: 0.58 },
    { option: 'D', startProgress: 0.6, endProgress: 0.78 },
    { option: 'E', startProgress: 0.8, endProgress: 0.95 },
  ];

  for (const phase of movementSequence) {
    if (progress >= phase.startProgress && progress <= phase.endProgress) {
      return phase.option;
    }
  }

  return null;
};
```

**Step 2: Render ThinkingCursor Component**
```javascript
<ThinkingCursor
  questionStartFrame={questionStartFrame}
  answerRevealFrame={answerRevealFrame}
  optionPositions={{
    A: { x: 320, y: 1150 },  // Approximate pixel positions
    B: { x: 320, y: 1210 },
    C: { x: 320, y: 1270 },
    D: { x: 320, y: 1330 },  // CORRECT answer
    E: { x: 320, y: 1390 },
  }}
  correctAnswer="D"
  playbackRate={PLAYBACK_RATE}
/>
```

**Step 3: ThinkingCursor.jsx Implementation**

**Movement Pattern:** A → B → C → D → E → back to D (click)

**Bezier Curve Animation:**
```javascript
// For smooth curved paths between options
const movementSequence = [
  { pos: 'A', progress: 0.0 },
  { pos: 'A', progress: 0.15 },  // Pause on A
  { pos: 'B', progress: 0.2 },   // Move to B
  { pos: 'B', progress: 0.35 },  // Pause on B
  { pos: 'C', progress: 0.4 },   // Move to C
  { pos: 'C', progress: 0.55 },  // Pause on C
  { pos: 'D', progress: 0.6 },   // Move to D
  { pos: 'D', progress: 0.75 },  // Pause on D
  { pos: 'E', progress: 0.8 },   // Move to E
  { pos: 'E', progress: 0.93 },  // Pause on E
  { pos: 'D', progress: 1.0 },   // Return to D (correct)
];

// Quadratic Bezier curve for curved path
const midX = (startPos.x + endPos.x) / 2 + (Math.random() > 0.5 ? 15 : -15);
const midY = (startPos.y + endPos.y) / 2;

const t = interpolate(segmentProgress, [0, 1], [0, 1], {
  easing: Easing.inOut(Easing.ease), // Smooth acceleration/deceleration
});

// Bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
cursorX = Math.pow(1 - t, 2) * startPos.x +
          2 * (1 - t) * t * midX +
          Math.pow(t, 2) * endPos.x;

cursorY = Math.pow(1 - t, 2) * startPos.y +
          2 * (1 - t) * t * midY +
          Math.pow(t, 2) * endPos.y;

// Add human wobble (1-2px random movement)
cursorX += Math.sin(frameIntoThinking * 0.5) * 2 * t * (1 - t);
cursorY += Math.cos(frameIntoThinking * 0.7) * 1.5 * t * (1 - t);
```

**Click Animation:**
```javascript
const isClicking = progress >= 0.97 && progress < 1;
const clickScale = isClicking ? 0.85 : 1; // Cursor shrinks when clicking

{isClicking && (
  // Ripple effect on click
  <div style={{
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(147, 51, 234, 0.6)',
    animation: 'ripple 0.6s ease-out',
    opacity: 0,
  }} />
)}
```

**Step 4: Hover Highlighting in MedicalQuestionCard**
```javascript
// Receive cursorHoverOption prop
const isCursorHovering = cursorHoverOption === option.letter;

// Apply hover styles
<div style={{
  background: isRevealed && isCorrect
    ? 'rgba(34, 197, 94, 0.15)'
    : isCursorHovering && !isRevealed
      ? 'rgba(147, 51, 234, 0.2)' // Purple highlight when cursor hovers
      : 'rgba(147, 51, 234, 0.05)',
  borderLeft: isCursorHovering && !isRevealed
    ? '3px solid #9333ea' // Purple border
    : '3px solid transparent',
  boxShadow: isCursorHovering && !isRevealed
    ? '0 4px 16px rgba(147, 51, 234, 0.3)' // Purple glow
    : 'none',
  transform: `scale(${isCursorHovering && !isRevealed ? flyInScale * 1.02 : flyInScale})`,
}}>
```

**Visual Effects:**
- **Cursor:** White arrow cursor graphic
- **Movement:** Smooth Bezier curves, not straight lines
- **Wobble:** 1-2px random movement for human feel
- **Hover:** Option highlights purple with glow when cursor over it
- **Click:** Cursor shrinks + ripple effect
- **Timing:** Moves through ALL options before settling on correct answer

**Why It Works:**
- Creates FOMO - viewer wants to know if cursor will pick right answer
- Simulates real test-taking experience
- Builds tension during countdown

---

## 6. BRAIN MASCOT EMOTIONAL REACTIONS

### Purpose
Make the brain character react naturally to key moments in the video, creating personality and emotional engagement.

### Where It's Implemented
- **Component:** `BrainMascot.jsx` (modified)
- **Props Added:** `shockMoment`, `thinkingPeriod`, `celebrationMoment`
- **Called From:** Ad component with specific timing

### How It Works

**Step 1: Add Reaction Props to BrainMascot.jsx**
```javascript
export const BrainMascot = ({
  audioPath,
  position = 'top-center',
  size = 350,
  timestampsSource = 'sarcoidosis',
  playbackRate = 1.75,
  // NEW: Emotional reactions
  shockMoment = null,           // Frame when brain should react with shock
  thinkingPeriod = null,        // { start: frame, end: frame } for thinking
  celebrationMoment = null,     // Frame when brain should celebrate
}) => {
```

**Step 2: Define Reaction Animations (lines 101-144)**

**REACTION 1: SHOCK (Head Shake)**
```javascript
let reactionRotate = 0;
let reactionScale = 1;

if (shockMoment !== null && frame >= shockMoment && frame < shockMoment + 9) {
  const shockFrame = frame - shockMoment;

  // Quick head shake: left → right → center over 9 frames
  reactionRotate = interpolate(
    shockFrame,
    [0, 3, 6, 9],
    [0, -8, 8, 0], // Rotate -8° left, +8° right, back to 0°
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );

  // Scale up slightly during shake
  reactionScale = interpolate(
    shockFrame,
    [0, 3, 9],
    [1, 1.1, 1], // Grow to 1.1x then back to 1.0x
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) }
  );
}
```

**REACTION 2: THINKING (Sway)**
```javascript
let reactionTranslateX = 0;
let reactionTranslateY = 0;

if (thinkingPeriod && frame >= thinkingPeriod.start && frame < thinkingPeriod.end) {
  // BIG side-to-side sway + up/down bob
  reactionTranslateX = Math.sin((frame - thinkingPeriod.start) * 0.18) * 18; // ±18px horizontal
  reactionTranslateY = Math.cos((frame - thinkingPeriod.start) * 0.18) * 8;  // ±8px vertical
}
```

**REACTION 3: CELEBRATION (Bounce)**
```javascript
if (celebrationMoment !== null && frame >= celebrationMoment && frame < celebrationMoment + 20) {
  const celebFrame = frame - celebrationMoment;

  // HUGE bouncy jump with elastic return
  reactionTranslateY = -Math.abs(Math.sin(celebFrame * 0.35)) *
    interpolate(celebFrame, [0, 20], [50, 0], { // Jump 50px up
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.5)) // Elastic bounce-back
    });

  // Scale up at peak of jump
  reactionScale = 1 + Math.abs(Math.sin(celebFrame * 0.35)) * 0.22; // Up to 1.22x
}
```

**Step 3: Combine All Animations**
```javascript
// Existing animations: breathing + word-sync speech pulse
const finalScale = frame < 40
  ? entranceScale
  : breathingScale * speechScale * reactionScale; // Multiply all scales

// Apply to image
<Img
  src={staticFile('assets/character/brain-mascot.png')}
  style={{
    transform: `
      translate(${reactionTranslateX}px, ${reactionTranslateY}px)
      scale(${finalScale})
      rotate(${reactionRotate}deg)
    `,
    transformOrigin: 'center center', // Pivot from center
  }}
/>
```

**Step 4: Call from Ad Component**
```javascript
<BrainMascot
  audioPath={audioPath}
  position="top-center"
  size={350}
  timestampsSource="pyrazinamide"
  playbackRate={PLAYBACK_RATE}
  shockMoment={Math.floor((15.00 / PLAYBACK_RATE) * fps)} // Shock at "850 U/L"
  thinkingPeriod={{
    start: questionStartFrame,   // Start thinking when question appears
    end: answerRevealFrame        // Stop when answer revealed
  }}
  celebrationMoment={answerRevealFrame} // Celebrate at answer reveal
/>
```

**Animation Details:**

| Reaction | Duration | Movement | When to Use |
|----------|----------|----------|-------------|
| **Shock** | 9 frames (~0.3s) | Rotate ±8°, scale 1.1x | Critical lab values, shocking information |
| **Thinking** | Variable (countdown period) | Sway ±18px X, ±8px Y | During question countdown |
| **Celebration** | 20 frames (~0.67s) | Jump 50px up, scale 1.22x | Answer reveal, success moments |

**Design Philosophy:**
- Reactions must feel NATURAL, not robotic
- Timing is critical - must match emotional beats
- Combine with existing animations (breathing, word-sync)
- Use easing functions for organic movement

---

## 7. ENHANCED COUNTDOWN TIMER

### Purpose
Create tension and urgency during the question period with visual feedback that intensifies as time runs out.

### Where It's Implemented
- **Component:** `PyrazinamideAd.jsx`
- **Rendered:** Lines 307-414 (inline component)
- **Active:** From questionStartFrame to answerRevealFrame

### How It Works

**Step 1: Calculate Timer State**
```javascript
{frame >= questionStartFrame && frame < answerRevealFrame && (() => {
  const framesIntoTimer = frame - questionStartFrame;
  const progress = framesIntoTimer / timerDuration;
  const secondsRemaining = Math.max(1, Math.ceil((timerDuration - framesIntoTimer) / fps));

  // Color changes based on progress
  let borderColor = '#10b981'; // green (start)
  if (progress > 0.8) {
    borderColor = '#ef4444'; // red (critical)
  } else if (progress > 0.5) {
    borderColor = '#f97316'; // orange
  } else if (progress > 0.3) {
    borderColor = '#fbbf24'; // yellow
  }
```

**Step 2: Pulse Animation in Final 2 Seconds**
```javascript
  // ENHANCED: Pulse grow in final 2 seconds
  let timerScale = 1.0;
  if (secondsRemaining <= 2) {
    // Pulse between 1.0 and 1.15
    timerScale = 1.0 + Math.sin(frame * 0.4) * 0.075;
  }
```

**Step 3: Red Vignette in Final Second**
```javascript
  return (
    <>
      {/* Red screen vignette in final second */}
      {secondsRemaining === 1 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, transparent 30%, rgba(239, 68, 68, 0.35) 100%)',
          pointerEvents: 'none',
          zIndex: 35,
          opacity: interpolate(
            Math.sin(frame * 0.3),
            [-1, 1],
            [0.5, 1], // Pulsing opacity
            { extrapolateRight: 'clamp' }
          ),
        }} />
      )}
```

**Step 4: Ring Ripple at Each Second Tick**
```javascript
      // Detect second tick
      const currentSecond = Math.floor((timerDuration - framesIntoTimer) / fps);
      const previousSecond = Math.floor((timerDuration - (framesIntoTimer - 1)) / fps);
      const justTicked = currentSecond !== previousSecond && framesIntoTimer > 0;

      {justTicked && secondsRemaining > 0 && (
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '8%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: `3px solid ${borderColor}`,
          animation: 'ripple 0.6s ease-out', // CSS animation
          opacity: 0,
        }} />
      )}
```

**Step 5: Main Timer Display**
```javascript
      {/* Main timer */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: '140px',
        height: '140px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: '50%',
        border: '6px solid',
        borderColor: borderColor,
        boxShadow: secondsRemaining <= 2
          ? `0 8px 32px rgba(239, 68, 68, 0.6), 0 0 ${20 + Math.sin(frame * 0.4) * 10}px ${borderColor}`
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 40,
        transform: `scale(${timerScale})`,
      }}>
        <div style={{
          fontSize: '56px',
          fontWeight: 'bold',
          color: 'white',
        }}>
          {secondsRemaining}
        </div>
      </div>
    </>
  );
})()}
```

**Visual Progression:**

| Time Remaining | Border Color | Effects |
|----------------|--------------|---------|
| 5-3 seconds | Green (#10b981) | None |
| 3-2 seconds | Yellow (#fbbf24) | None |
| 2-1 seconds | Orange (#f97316) | **Pulse scale 1.0-1.15**, glow |
| Final second | Red (#ef4444) | **Pulse + red vignette**, intense glow |
| Each tick | Current color | **Ring ripple** animation |

**Design Principles:**
- Progressive intensity - calm at start, panic at end
- Multiple feedback channels - color, scale, vignette, glow
- Ticking ripple = heartbeat effect
- Red vignette = "danger zone" feeling

---

## 8. CAPTION WORD EMPHASIS

### Purpose
Make the currently spoken word "pop" visually in the captions, creating perfect audio-visual synchronization.

### Where It's Implemented
- **Component:** `TikTokCaptions.jsx`
- **Lines:** 116-148 (word rendering loop)

### How It Works

**Step 1: Determine Current Word**
```javascript
// Line 118
const isHighlighted = currentTime >= wordData.start && currentTime < wordData.end;
```

**Step 2: Apply Enhanced Styles to Current Word**
```javascript
<span style={{
  fontSize: 44,
  fontWeight: 'bold',
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: isHighlighted ? '#FFD700' : '#FFFFFF', // Gold vs White
  textTransform: 'uppercase',
  letterSpacing: '0.02em',

  // ENHANCED: Stronger shadow when highlighted
  textShadow: isHighlighted
    ? '0 0 20px rgba(255, 215, 0, 0.6), 0 5px 12px rgba(0, 0, 0, 1)'
    : '0 3px 8px rgba(0, 0, 0, 1)',

  // NEW: Scale up current word
  transform: isHighlighted ? 'scale(1.12)' : 'scale(1)',
  transformOrigin: 'center center',

  transition: 'none', // NO transition - instant, clean cuts
  display: 'inline-block',
  whiteSpace: 'nowrap',
  marginRight: '8px',
}}>
  {wordData.cleanedWord.replace(/—/g, ' ').replace(/-/g, ' ')}
</span>
```

**Visual Changes:**

| State | Color | Scale | Shadow |
|-------|-------|-------|--------|
| **Not highlighted** | White (#FFFFFF) | 1.0 | `0 3px 8px rgba(0,0,0,1)` |
| **Highlighted** | Gold (#FFD700) | **1.12** | `0 0 20px rgba(255,215,0,0.6), 0 5px 12px rgba(0,0,0,1)` |

**Caption Positioning:**
```javascript
// In PyrazinamideAd.jsx
<TikTokCaptions
  words={timestampsData.words}
  playbackRate={PLAYBACK_RATE}
  frameOffset={0}
  bottomOffset={320} // 320px from bottom (moved down from default 350)
/>
```

**Design Decisions:**
- **No transitions:** Instant cuts for fast-paced energy
- **Scale 1.12x:** Noticeable but not overwhelming
- **Dual shadows:** Glow + depth for visibility on any background
- **Gold color:** High contrast, attention-grabbing
- **Position:** Low enough to not cover main content, high enough to be readable

---

## 9. SOUND EFFECTS SYSTEM

### Purpose
Layer strategic sound effects to enhance key moments and create audio richness.

### Where It's Implemented
- **Component:** `PyrazinamideAd.jsx`
- **Using:** Remotion `<Audio>` and `<Sequence>` components

### Sound Effect Catalog

**1. Whoosh (Entrance)**
```javascript
<Sequence from={0} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
</Sequence>
```
- **When:** Frames 0-30 (video start)
- **Purpose:** Dynamic entrance, signals video starting
- **Volume:** 0.4 (subtle)

**2. Highlight Pop (Vignette Highlights)**
```javascript
{vignetteHighlights.map((highlight, idx) => {
  const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
  return (
    <Sequence key={`pop-${idx}`} from={highlightFrame} durationInFrames={10}>
      <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
    </Sequence>
  );
})}
```
- **When:** Each vignette highlight moment
- **Purpose:** Audio feedback for visual highlights
- **Volume:** 2.0 (prominent - needs to punch through)
- **Instances:** 5 pops (RIPE, jaundice, ALT, AST, uric acid)

**3. Screen Shake Sound (Critical Values)**
```javascript
<Sequence from={Math.floor((15.00 / PLAYBACK_RATE) * fps)} durationInFrames={10}>
  <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
</Sequence>
<Sequence from={Math.floor((16.50 / PLAYBACK_RATE) * fps)} durationInFrames={10}>
  <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
</Sequence>
```
- **When:** ALT (15.00s) and AST (16.50s) critical values
- **Purpose:** Audio accompaniment to screen shake
- **Volume:** 2.0

**4. Timer Ticking (Countdown)**
```javascript
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
</Sequence>
```
- **When:** During entire question countdown
- **Purpose:** Create tension, "time running out" feeling
- **Volume:** 0.3 (background ambiance)

**5. Heartbeat (Countdown - LOUD)**
```javascript
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.5} />
</Sequence>
```
- **When:** During entire question countdown
- **Purpose:** Anxiety, stress, "exam pressure" feeling
- **Volume:** 1.2 (LOUD - intentionally overwhelming)
- **Playback Rate:** 1.5x (faster heartbeat = more panic)

**6. Correct Answer Chime**
```javascript
<Sequence from={answerRevealFrame}>
  <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
</Sequence>
```
- **When:** Answer reveal moment
- **Purpose:** Satisfying "ding" for dopamine hit
- **Volume:** 0.6

**Audio Layering Strategy:**
- **Base Layer:** Narration at 1.85x playback rate
- **Accent Layer:** Pops and whooshes (high volume, short duration)
- **Ambient Layer:** Ticking, heartbeat (low-medium volume, sustained)
- **Reward Layer:** Correct answer chime (satisfying resolution)

**Volume Philosophy:**
- Narration must remain intelligible (most important)
- Sound effects should ENHANCE, not overpower
- Intentional loudness on heartbeat = emotional manipulation (good for engagement)
- Pops at 2.0 volume = need to cut through layered audio

---

## 10. VISUAL FEEDBACK ON ANSWER REVEAL

### Purpose
Create satisfying visual payoff when correct answer is revealed.

### Where It's Implemented
- **Component:** `PyrazinamideAd.jsx` (lines 417-431)
- **Also:** `MedicalQuestionCard.jsx` (checkmarks, X marks, strikethrough)

### How It Works

**Part 1: Green Flash (PyrazinamideAd.jsx)**
```javascript
<Sequence from={answerRevealFrame} durationInFrames={Math.floor(0.3 * fps)}>
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.25)', // Green overlay
    opacity: interpolate(
      frame - answerRevealFrame,
      [0, 3, Math.floor(0.3 * fps)],
      [0, 1, 0], // Fade in then out
      { extrapolateRight: 'clamp' }
    ),
    pointerEvents: 'none',
    zIndex: 50,
  }} />
</Sequence>
```
- **Duration:** 0.3 seconds (~9 frames)
- **Color:** Green (success color)
- **Opacity Curve:** 0 → 1 → 0 (quick flash)
- **Effect:** Entire screen flashes green briefly

**Part 2: Checkmark/X Display (MedicalQuestionCard.jsx)**
```javascript
{isRevealed && (
  <div style={{
    fontSize: '28px',
    fontWeight: 'bold',
    color: isCorrect ? '#22c55e' : '#ef4444',
    marginLeft: 'auto',
    paddingLeft: '12px',
  }}>
    {isCorrect ? '✓' : '✗'}
  </div>
)}
```
- **Correct Answer:** Green checkmark (✓)
- **Wrong Answers:** Red X (✗)
- **Position:** Right side of option
- **Timing:** Instant appearance at answerRevealFrame

**Part 3: Wrong Answer Strikethrough**
```javascript
{isRevealed && !isCorrect && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '8px',
    right: '8px',
    height: '2px',
    backgroundColor: '#ef4444', // Red line
    opacity: 0.7,
    transform: 'translateY(-50%)',
  }} />
)}
```
- **Applied To:** All wrong answers
- **Visual:** Red horizontal line through text
- **Effect:** Clearly shows "this is wrong"

**Part 4: Correct Answer Background Highlight**
```javascript
<div style={{
  background: isRevealed && isCorrect
    ? 'rgba(34, 197, 94, 0.15)' // Green background
    : isCursorHovering && !isRevealed
      ? 'rgba(147, 51, 234, 0.2)' // Purple (hover)
      : 'rgba(147, 51, 234, 0.05)', // Default
}}>
```
- **Correct Answer:** Subtle green background
- **Creates:** Clear visual hierarchy

**Combined Effect Timeline:**
1. **Frame answerRevealFrame:**
   - Green flash starts
   - Checkmark/X appear on all options
   - Strikethrough appears on wrong answers
   - Correct answer gets green background
   - Correct answer chime sound plays
   - Brain mascot celebrates (bounces)

**Multi-Sensory Feedback:**
- **Visual:** Flash, checkmarks, colors, strikethrough
- **Audio:** Chime sound
- **Motion:** Brain celebration bounce
- **Result:** Satisfying dopamine hit

---

## IMPLEMENTATION CHECKLIST FOR NEW ADS

When creating a new medical education ad with full viral optimization, follow this checklist:

### 1. Ad Component Setup (e.g., NewDiseaseAd.jsx)

**Define Constants:**
```javascript
const PLAYBACK_RATE = 1.85; // Standard speed
const questionStartTimeRaw = XX.XX; // "Think" timestamp
const answerRevealTimeRaw = XX.XX; // Answer reveal timestamp
```

**Define Timestamps Arrays:**
```javascript
const vignetteHighlights = [
  { phrase: "keyword1", timestamp: X.XX },
  { phrase: "keyword2", timestamp: X.XX },
  { phrase: "critical_value", timestamp: X.XX }, // Include critical labs
  // ... 5-7 highlights typically
];

const optionTimestamps = {
  A: XX.XX,
  B: XX.XX,
  C: XX.XX,
  D: XX.XX,
  E: XX.XX,
};
```

**Calculate Frames:**
```javascript
const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);
```

### 2. Screen Shake System

**Implement getScreenShake():**
```javascript
const getScreenShake = () => {
  let shakeX = 0;
  let shakeY = 0;

  // Add shake for each critical lab value (2-3 maximum)
  // Pattern:
  const shakeNFrame = Math.floor((TIMESTAMP / PLAYBACK_RATE) * fps);
  const shakeNDuration = 8;
  if (frame >= shakeNFrame && frame < shakeNFrame + shakeNDuration) {
    const framesIntoShake = frame - shakeNFrame;
    const intensity = interpolate(framesIntoShake, [0, 3, shakeNDuration], [0, 6, 0], {
      extrapolateRight: 'clamp'
    });
    shakeX += Math.sin(frame * 2) * intensity;
    shakeY += Math.cos(frame * 1.5) * intensity;
  }

  return { x: shakeX, y: shakeY };
};
```

**Apply to Root:**
```javascript
const shake = getScreenShake();
return (
  <AbsoluteFill style={{
    backgroundColor: '#0a0a0a',
    transform: `translate(${shake.x}px, ${shake.y}px)`
  }}>
```

### 3. Cursor Hover Tracking

**Implement getCursorHoverOption():**
```javascript
const getCursorHoverOption = () => {
  const thinkingDuration = answerRevealFrame - questionStartFrame;
  const frameIntoThinking = frame - questionStartFrame;
  if (frameIntoThinking < 0 || frameIntoThinking >= thinkingDuration) return null;

  const progress = frameIntoThinking / thinkingDuration;
  const movementSequence = [
    { option: 'A', startProgress: 0.0, endProgress: 0.18 },
    { option: 'B', startProgress: 0.2, endProgress: 0.38 },
    { option: 'C', startProgress: 0.4, endProgress: 0.58 },
    { option: 'D', startProgress: 0.6, endProgress: 0.78 },
    { option: 'E', startProgress: 0.8, endProgress: 0.95 },
  ];

  for (const phase of movementSequence) {
    if (progress >= phase.startProgress && progress <= phase.endProgress) {
      return phase.option;
    }
  }
  return null;
};
```

### 4. Component Rendering

**Brain Mascot with Reactions:**
```javascript
<BrainMascot
  audioPath={audioPath}
  position="top-center"
  size={350}
  timestampsSource="new-disease" // Must match timestamps file name
  playbackRate={PLAYBACK_RATE}
  shockMoment={Math.floor((CRITICAL_VALUE_TIMESTAMP / PLAYBACK_RATE) * fps)}
  thinkingPeriod={{ start: questionStartFrame, end: answerRevealFrame }}
  celebrationMoment={answerRevealFrame}
/>
```

**Question Card:**
```javascript
<MedicalQuestionCard
  questionData={questionData}
  answerRevealTime={answerRevealTimeRaw}
  playbackRate={PLAYBACK_RATE}
  frameOffset={0}
  vignetteHighlights={vignetteHighlights}
  optionTimestamps={optionTimestamps}
  zoomMode={true}
  cursorHoverOption={getCursorHoverOption()}
/>
```

**Captions:**
```javascript
<TikTokCaptions
  words={timestampsData.words}
  playbackRate={PLAYBACK_RATE}
  frameOffset={0}
  bottomOffset={320}
/>
```

**Thinking Cursor:**
```javascript
<ThinkingCursor
  questionStartFrame={questionStartFrame}
  answerRevealFrame={answerRevealFrame}
  optionPositions={{
    A: { x: 320, y: 1150 },
    B: { x: 320, y: 1210 },
    C: { x: 320, y: 1270 },
    D: { x: 320, y: 1330 },
    E: { x: 320, y: 1390 },
  }}
  correctAnswer="D" // Change to actual correct answer
  playbackRate={PLAYBACK_RATE}
/>
```

### 5. Sound Effects

**Required Audio Sequences:**
```javascript
// Whoosh entrance
<Sequence from={0} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
</Sequence>

// Vignette highlight pops
{vignetteHighlights.map((highlight, idx) => {
  const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
  return (
    <Sequence key={`pop-${idx}`} from={highlightFrame} durationInFrames={10}>
      <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
    </Sequence>
  );
})}

// Screen shake sounds (for each critical value shake)
<Sequence from={Math.floor((CRITICAL_TIMESTAMP / PLAYBACK_RATE) * fps)} durationInFrames={10}>
  <Audio src={staticFile('assets/sfx/highlight-pop.mp3')} volume={2.0} />
</Sequence>

// Timer ticking
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
</Sequence>

// Heartbeat (LOUD)
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.5} />
</Sequence>

// Correct answer chime
<Sequence from={answerRevealFrame}>
  <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
</Sequence>
```

### 6. Enhanced Timer (Copy-Paste)

Use the complete timer implementation from PyrazinamideAd.jsx lines 307-414. No modifications needed unless changing position.

### 7. Green Flash on Answer Reveal

```javascript
<Sequence from={answerRevealFrame} durationInFrames={Math.floor(0.3 * fps)}>
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 255, 0, 0.25)',
    opacity: interpolate(
      frame - answerRevealFrame,
      [0, 3, Math.floor(0.3 * fps)],
      [0, 1, 0],
      { extrapolateRight: 'clamp' }
    ),
    pointerEvents: 'none',
    zIndex: 50,
  }} />
</Sequence>
```

---

## TIMESTAMP GENERATION WORKFLOW

### Step 1: Create Narration Script
Write the medical vignette, question, and options.

### Step 2: Generate Audio
Use ElevenLabs or similar TTS service with word-level timestamps enabled.

### Step 3: Extract Key Timestamps

**From Audio Analysis, Note:**
- Each vignette keyword mention time (5-7 keywords)
- Each option letter callout time ("A?", "B?", etc.)
- "Think" moment (question start)
- Answer reveal moment (when narrator says the answer)
- Critical lab value mention times (for shakes)

### Step 4: Create Timestamps File
```json
{
  "words": [
    { "word": "32-year-old", "start": 0.5, "end": 1.2 },
    // ... all words with start/end times
  ]
}
```
Save as: `/public/assets/audio/new-disease-timestamps.json`

### Step 5: Add to BrainMascot.jsx Imports
```javascript
import newDiseaseTimestamps from '../../../public/assets/audio/new-disease-timestamps.json';
```

Add to conditional:
```javascript
const timestampsData =
  timestampsSource === 'new-disease'
    ? newDiseaseTimestamps
    : // ... existing conditions
```

---

## DESIGN PRINCIPLES SUMMARY

### 1. Selective Enhancement
- **Don't add every feature everywhere** - be strategic
- Screen shakes: 2-3 per video maximum (critical moments only)
- Vignette highlights: 5-7 key phrases
- Brain reactions: 3 types (shock, thinking, celebration)

### 2. Natural Motion
- Use easing functions (Easing.out, Easing.inOut, Easing.back)
- Bezier curves for paths (not straight lines)
- Add wobble/randomness for human feel
- Combine multiple animations (breathing + reactions)

### 3. Progressive Intensity
- Start calm, build to climax
- Timer: green → yellow → orange → red
- Final second: multiple effects compound (vignette + pulse + glow)
- Answer reveal: multi-sensory payoff

### 4. Audio-Visual Synchronization
- Every visual highlight must match audio timestamp
- Sound effects enhance, don't overpower
- Layered audio: narration + accents + ambiance + rewards

### 5. Dopamine Triggers
- **Anticipation:** Cursor movement, countdown timer
- **Surprise:** Screen shakes, flashes
- **Reward:** Checkmark, chime, green flash, brain celebration
- **Pattern:** Build tension → Release satisfaction

### 6. Mobile-First Design
- Captions at 320px from bottom (readable on phones)
- Timer top-right (thumb-friendly zone)
- High contrast (gold on black for captions)
- Bold, large fonts (44px captions, 56px timer)

---

## TROUBLESHOOTING COMMON ISSUES

### Issue 1: Timing Feels Off
**Cause:** Playback rate not accounted for in timestamp conversion
**Fix:** Always divide raw timestamp by playbackRate:
```javascript
const frame = Math.floor((rawTimestamp / PLAYBACK_RATE) * fps);
```

### Issue 2: Animations Too Aggressive
**Cause:** Multiple effects stacking
**Solution:** Reduce scale/intensity:
- Lab pulse: 1.03x max (not 1.08x)
- Shake: 6px max (not 10px)
- Check that animations aren't applied to parent AND child elements

### Issue 3: Cursor Not Hovering Options Correctly
**Cause:** Option positions don't match actual card layout
**Fix:**
1. Inspect option positions in browser devtools
2. Update optionPositions object with actual pixel coordinates
3. Account for card centering and margins

### Issue 4: Sound Effects Too Quiet/Loud
**Reference Volumes:**
- Narration: 1.0 (baseline)
- Whoosh: 0.4
- Timer ticking: 0.3
- Pops: 2.0 (needs to punch through)
- Heartbeat: 1.2 (intentionally loud)
- Correct chime: 0.6

**Adjustment Strategy:**
- Test with full audio mix (all layers playing)
- Pops should be audible but not jarring
- Heartbeat should create anxiety (loud is good)

### Issue 5: Brain Reactions Not Visible
**Cause:** Reaction scale/movement too subtle
**Current Values (tested):**
- Thinking sway: ±18px horizontal, ±8px vertical
- Celebration jump: 50px up, 1.22x scale
- Shock rotate: ±8 degrees

**If still not visible:** Increase by 20-30% increments

---

## FILE STRUCTURE REFERENCE

```
/src/components/
  PyrazinamideAd.jsx          # Reference implementation (all features)
  MedicalQuestionCard.jsx     # Question card (highlights, pulsing, hover)
  TikTokCaptions.jsx          # Captions (word emphasis)
  ThinkingCursor.jsx          # Cursor simulation
  Character/
    BrainMascot.jsx           # Brain character (reactions)
  StaticMemeOverlay.jsx       # Static image memes
  VideoMemeOverlay.jsx        # Video memes

/public/assets/
  audio/
    pyrazinamide-narration.mp3
    pyrazinamide-timestamps.json
  sfx/
    whoosh.mp3
    highlight-pop.mp3
    timer-ticking.mp3
    heartbeat.mp3
    correct-answer.mp3
  character/
    brain-mascot.png
  memes/
    success-kid.jpg
    videos/
      this-is-fine.mp4
```

---

## PERFORMANCE NOTES

### Optimization Tips
1. **Use `transition: 'none'`** on frequently updating styles (prevents CSS transition overhead)
2. **Limit transform properties** - combine in single transform string
3. **Use `will-change: 'transform'`** on brain mascot for GPU acceleration
4. **Pre-calculate frame numbers** outside render (not in style calculations)
5. **Avoid nested interpolations** - calculate once, store in variable

### Render Performance
- Each ad renders at ~30fps (720p default)
- High-quality renders: `--scale=2 --crf=15`
- Typical render time: 2-3 minutes for 60-second video

---

## VERSION HISTORY

**Version 1.0 - PyrazinamideAd Implementation**
- All viral optimization features implemented
- Reference implementation complete
- Tested and refined based on user feedback

**Key Iterations:**
1. Initial screen shake (3 moments) → Refined to 2-3 critical only
2. Lab pulsing whole box → Changed to value text only
3. Cursor jumping → Changed to smooth Bezier curves
4. Brain movement subtle → Progressively increased to ±18px sway, 50px jump
5. Captions at 350px → Moved to 320px (lower)

---

## QUICK REFERENCE: COPY-PASTE TEMPLATE

```javascript
// NEW AD TEMPLATE
export const NewDiseaseAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PLAYBACK_RATE = 1.85;

  // TIMESTAMPS - UPDATE THESE
  const questionStartTimeRaw = XX.XX;
  const answerRevealTimeRaw = XX.XX;

  const vignetteHighlights = [
    { phrase: "keyword1", timestamp: X.XX },
    { phrase: "keyword2", timestamp: X.XX },
    // Add 5-7 highlights
  ];

  const optionTimestamps = {
    A: XX.XX, B: XX.XX, C: XX.XX, D: XX.XX, E: XX.XX,
  };

  // FRAME CALCULATIONS
  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps);
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps);
  const timerDuration = Math.max(1, answerRevealFrame - questionStartFrame);

  // SCREEN SHAKE - Add for each critical value
  const getScreenShake = () => {
    let shakeX = 0, shakeY = 0;
    // Copy pattern from PyrazinamideAd
    return { x: shakeX, y: shakeY };
  };

  // CURSOR HOVER - Copy from PyrazinamideAd
  const getCursorHoverOption = () => {
    // Copy implementation
  };

  const shake = getScreenShake();

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a0a',
      transform: `translate(${shake.x}px, ${shake.y}px)`
    }}>
      {/* Audio */}
      <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />

      {/* Sound effects - copy from PyrazinamideAd */}

      {/* Brain mascot */}
      <BrainMascot {...props} />

      {/* Question card */}
      <MedicalQuestionCard {...props} />

      {/* Captions */}
      <TikTokCaptions {...props} bottomOffset={320} />

      {/* Cursor */}
      <ThinkingCursor {...props} />

      {/* Timer - copy from PyrazinamideAd */}

      {/* Green flash - copy from PyrazinamideAd */}
    </AbsoluteFill>
  );
};
```

---

## END OF DOCUMENTATION

This system creates medical education content optimized for maximum viral potential on TikTok and social media platforms. Every feature is designed to trigger engagement, create emotional investment, and maximize watch time.

**Core Philosophy:** More micro-interactions = more dopamine = more engagement = more viral potential

**Implementation Time:** ~2-3 hours per new ad (once system is understood)

**Expected Result:** Premium, fast-paced educational content that feels like high-end TikTok productions
