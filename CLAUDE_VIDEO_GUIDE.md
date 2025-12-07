# SynapticRecall Video Generation Guide for Claude

## Overview
This guide explains how to create a complete medical education TikTok-style video with:
- Word-synced captions
- Vignette keyword highlighting with sound effects
- Meme cutaways (full screen, pauses audio)
- Static meme overlays (on top of content, audio continues)
- Answer reveal with checkmarks/X marks
- Countdown timer

---

## CRITICAL CONFIGURATION

```javascript
const PLAYBACK_RATE = 1.85;  // Audio plays at 1.85x speed
const FPS = 30;
const RESOLUTION = { width: 1080, height: 1920 }; // Vertical TikTok format
```

### ElevenLabs Voice Settings
```javascript
{
  voice_id: 'NOpBlnGInO9m6vDvFkFC',
  model_id: 'eleven_turbo_v2_5',
  voice_settings: {
    stability: 0.58,
    similarity_boost: 0.82,
    style: 0.68,
    use_speaker_boost: true
  }
}
```

---

## FILE STRUCTURE

```
public/
├── assets/
│   ├── audio/
│   │   ├── [topic]-narration.mp3        # Generated audio
│   │   └── [topic]-timestamps.json      # Word timestamps from ElevenLabs
│   ├── memes/
│   │   ├── videos/                      # Meme cutaway videos
│   │   │   └── drunk-man-falling.mp4
│   │   ├── [meme-name].jpg              # Static meme images
│   │   ├── library.json                 # Meme metadata
│   │   └── [topic]-meme-placements.json # Meme timing config
│   └── sfx/
│       ├── whoosh.mp3
│       ├── correct-answer.mp3
│       ├── timer-ticking.mp3
│       ├── highlight-swipe.mp3          # For vignette highlights
│       └── memes/                       # Meme-specific sounds
│           └── Wait a minute....mp3

src/
├── components/
│   ├── [Topic]Ad.jsx                    # Main ad component
│   ├── MedicalQuestionCard.jsx          # Question card with checkmarks
│   ├── HighlightedVignette.jsx          # Vignette with keyword highlights
│   ├── TikTokCaptions.jsx               # Word-synced captions
│   ├── MemeCutaway.jsx                  # Full-screen meme (pauses audio)
│   ├── StaticMemeOverlay.jsx            # Overlay meme (audio continues)
│   ├── Character/
│   │   └── BrainMascot.jsx              # Animated brain character
│   └── ...
├── Root.jsx                             # Register compositions here
└── utils/
    └── generateAudio[Topic].js          # Audio generation script
```

---

## TIMESTAMPS JSON FORMAT

**IMPORTANT:** The timestamps JSON from ElevenLabs has this structure:
```json
{
  "topic": "aspiration-pneumonia",
  "audio_file": "aspiration-pneumonia-narration.mp3",
  "script": "Full script text...",
  "words": [
    { "word": "Lord", "start": 0, "end": 0.302 },
    { "word": "have", "start": 0.348, "end": 0.499 },
    ...
  ]
}
```

When passing to components:
- `TikTokCaptions` expects the `words` array directly: `words={timestampsData.words}`
- `BrainMascot` handles both formats internally

---

## COMPONENT: MedicalQuestionCard

### Features
1. **Vignette with keyword highlighting** - Gold background pills appear when words are spoken
2. **Answer reveal with checkmarks/X** - Sleek SVG icons, not emojis
3. **Green highlight on correct answer**

### Props
```jsx
<MedicalQuestionCard
  questionData={questionData}
  answerRevealTime={52.23}           // Raw audio timestamp (seconds)
  playbackRate={1.85}
  frameOffset={memeDurationFrames}    // Offset if meme cutaway happened before
  vignetteHighlights={[               // Keywords to highlight
    { phrase: "chronic alcoholism", timestamp: 10.112 },
    { phrase: "fever", timestamp: 16.73 },
  ]}
/>
```

### questionData Structure
```javascript
const questionData = {
  card_id: 1,
  topic: "aspiration-pneumonia",
  vignette: "55-year-old man with chronic alcoholism presents...",
  lab_values: [
    {
      label: "WBC:",
      value: "18,000/μL",
      status: "elevated",  // "elevated", "critical", or "normal"
      color: "#ef4444",    // Red for elevated/critical, green for normal
      note: "(elevated)"
    }
  ],
  question_text: "What is the most likely diagnosis?",
  options: [
    { letter: "A", text: "Community-acquired pneumonia", is_correct: false },
    { letter: "B", text: "Tuberculosis", is_correct: false },
    { letter: "C", text: "Aspiration pneumonia", is_correct: true },
    { letter: "D", text: "Pulmonary embolism", is_correct: false },
    { letter: "E", text: "Hospital-acquired pneumonia", is_correct: false }
  ],
  correct_answer: "C"
};
```

---

## COMPONENT: HighlightedVignette

Highlights keywords in the vignette text with:
- Gold background pill animation
- Swipe sound effect (`highlight-swipe.mp3`)
- Stays highlighted after appearing

### How to Define Highlights
Map narration timestamps to vignette phrases:

```javascript
const vignetteHighlights = [
  // When narrator says "PUTRID", highlight "foul-smelling sputum" in vignette
  { phrase: "foul-smelling sputum", timestamp: 3.1 },
  // When narrator says "Chronic drunk", highlight "chronic alcoholism"
  { phrase: "chronic alcoholism", timestamp: 10.112 },
  // When narrator says "fever", highlight "fever"
  { phrase: "fever", timestamp: 16.73 },
];
```

**Finding timestamps:** Look in `[topic]-timestamps.json` for when key words are spoken.

---

## MEME SYSTEMS

### 1. MemeCutaway (Full Screen, Pauses Audio)
- Takes over entire screen
- Main audio PAUSES during cutaway
- Audio RESUMES after cutaway ends

```jsx
<MemeCutaway
  memeId="drunk-man-falling"
  triggerTimestamp={memeTimestamp / PLAYBACK_RATE}
  playbackRate={1.0}
  customDuration={memeDurationFrames / fps}
/>
```

### 2. StaticMemeOverlay (Overlay, Audio Continues)
- Image appears ON TOP of content
- Main audio continues playing
- Optional sound effect

```jsx
<StaticMemeOverlay
  imagePath="assets/memes/confused-nick-young.jpg"
  timestamp={78.87}              // Raw audio timestamp
  durationInFrames={50}
  position="center"              // "center", "top-right", etc.
  scale={0.6}
  playbackRate={PLAYBACK_RATE}
  soundEffect="Wait a minute....mp3"  // In public/assets/sfx/memes/
  soundVolume={0.5}
  frameOffset={memeDurationFrames}    // Offset if meme cutaway happened
/>
```

---

## AUDIO SPLITTING FOR MEME CUTAWAYS

When a meme cutaway happens, audio must PAUSE (not just mute). This requires splitting audio into Sequences:

```jsx
// AUDIO PART 1: Start to meme trigger
<Sequence from={0} durationInFrames={memeStartFrame}>
  <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />
</Sequence>

// MEME PLAYS HERE (no main audio)

// AUDIO PART 2: After meme, resume from where we left off
<Sequence from={memeEndFrame}>
  <Audio
    src={audioPath}
    playbackRate={PLAYBACK_RATE}
    startFrom={Math.floor(audioSplitTime * fps)}  // Resume point in FRAMES
    volume={1}
  />
</Sequence>
```

**CRITICAL:** `startFrom` takes FRAMES, not seconds!
```javascript
startFrom={Math.floor(rawTimestampSeconds * fps)}
```

---

## FRAME OFFSET CALCULATIONS

After a meme cutaway, all subsequent timestamps need offset:

```javascript
// Meme timing
const memeTimestamp = 11.099;  // Raw audio time when meme triggers
const memeStartFrame = Math.floor((memeTimestamp / PLAYBACK_RATE) * fps);
const memeDurationFrames = 72;  // 2.4 seconds at 30fps
const memeEndFrame = memeStartFrame + memeDurationFrames;

// Timestamps AFTER meme need offset
const answerRevealTimeRaw = 52.23;  // Raw audio timestamp
const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;

// Pass offset to components
frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
```

---

## HIDING CONTENT DURING CUTAWAY

Main content should disappear during meme cutaway:

```jsx
const isInMemeCutaway = frame >= memeStartFrame && frame < memeEndFrame;

return (
  <AbsoluteFill>
    {/* Audio sequences... */}

    {!isInMemeCutaway && (
      <>
        <BrainMascot ... />
        <MedicalQuestionCard ... />
        <TikTokCaptions ... />
      </>
    )}

    {/* Meme cutaway always renders (uses Sequence internally) */}
    <MemeCutaway ... />

    {/* Static overlays can render always */}
    <StaticMemeOverlay ... />
  </AbsoluteFill>
);
```

---

## REGISTERING NEW TOPICS

### 1. Root.jsx
```jsx
import { AspirationPneumoniaAd } from './components/AspirationPneumoniaAd';

// Add composition
<Composition
  id="AspirationPneumoniaAd"
  component={AspirationPneumoniaAd}
  durationInFrames={1893}  // Calculate from audio duration
  fps={30}
  width={1080}
  height={1920}
/>
```

### 2. BrainMascot.jsx
```jsx
// Add import
import aspirationPneumoniaTimestamps from '../../../public/assets/audio/aspiration-pneumonia-timestamps.json';

// Add to timestampsData selection
const timestampsData =
  timestampsSource === 'aspiration-pneumonia'
    ? aspirationPneumoniaTimestamps
    : timestampsSource === 'wernicke'
      ? wernickeTimestamps
      // ... other topics
```

---

## DURATION CALCULATION

```javascript
// Get raw audio duration
const rawDuration = 112.27;  // From ffprobe

// Perceived duration at playback rate
const perceivedDuration = rawDuration / PLAYBACK_RATE;  // ~60.7 seconds

// Add meme cutaway duration
const totalDuration = perceivedDuration + (memeDurationFrames / fps);

// Convert to frames
const durationInFrames = Math.ceil(totalDuration * fps);
```

---

## COMPLETE AD COMPONENT TEMPLATE

```jsx
import React from 'react';
import {
  AbsoluteFill, Audio, useCurrentFrame, useVideoConfig,
  Sequence, staticFile, interpolate
} from 'remotion';
import { BrainMascot } from './Character/BrainMascot';
import { TikTokCaptions } from './TikTokCaptions';
import { MedicalQuestionCard } from './MedicalQuestionCard';
import MemeCutaway from './MemeCutaway';
import StaticMemeOverlay from './StaticMemeOverlay';

const timestampsData = require('../../public/assets/audio/[topic]-timestamps.json');

export const [Topic]Ad = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PLAYBACK_RATE = 1.85;

  // === MEME CUTAWAY TIMING ===
  const memeTimestamp = XX.XX;  // Find trigger word timestamp
  const memeStartFrame = Math.floor((memeTimestamp / PLAYBACK_RATE) * fps);
  const memeDurationFrames = 72;
  const memeEndFrame = memeStartFrame + memeDurationFrames;
  const audioSplitTime = memeTimestamp;

  // === KEY TIMESTAMPS ===
  const questionStartTimeRaw = XX.XX;   // "Think" timestamp
  const answerRevealTimeRaw = XX.XX;    // Answer reveal timestamp
  const questionStartFrame = Math.floor((questionStartTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const answerRevealFrame = Math.floor((answerRevealTimeRaw / PLAYBACK_RATE) * fps) + memeDurationFrames;
  const timerDuration = answerRevealFrame - questionStartFrame;

  // === VIGNETTE HIGHLIGHTS ===
  const vignetteHighlights = [
    { phrase: "key phrase in vignette", timestamp: XX.XX },
    // Add more...
  ];

  // === QUESTION DATA ===
  const questionData = {
    card_id: 1,
    vignette: "...",
    lab_values: [...],
    question_text: "...",
    options: [...],
    correct_answer: "X"
  };

  const audioPath = staticFile('assets/audio/[topic]-narration.mp3');
  const isInMemeCutaway = frame >= memeStartFrame && frame < memeEndFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* AUDIO PART 1 */}
      <Sequence from={0} durationInFrames={memeStartFrame}>
        <Audio src={audioPath} playbackRate={PLAYBACK_RATE} volume={1} />
      </Sequence>

      {/* AUDIO PART 2 */}
      <Sequence from={memeEndFrame}>
        <Audio
          src={audioPath}
          playbackRate={PLAYBACK_RATE}
          startFrom={Math.floor(audioSplitTime * fps)}
          volume={1}
        />
      </Sequence>

      {/* SYSTEM SOUNDS */}
      {!isInMemeCutaway && (
        <>
          <Sequence from={0} durationInFrames={30}>
            <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
          </Sequence>
          <Sequence from={questionStartFrame} durationInFrames={timerDuration}>
            <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
          </Sequence>
          <Sequence from={answerRevealFrame}>
            <Audio src={staticFile('assets/sfx/correct-answer.mp3')} volume={0.6} />
          </Sequence>
        </>
      )}

      {/* MAIN CONTENT */}
      {!isInMemeCutaway && (
        <>
          <BrainMascot
            audioPath={audioPath}
            position="top-center"
            size={350}
            timestampsSource="[topic]"
            playbackRate={PLAYBACK_RATE}
          />
          <MedicalQuestionCard
            questionData={questionData}
            answerRevealTime={answerRevealTimeRaw}
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
            vignetteHighlights={vignetteHighlights}
          />
          <TikTokCaptions
            words={timestampsData.words}  // NOTE: .words not timestampsData
            playbackRate={PLAYBACK_RATE}
            frameOffset={frame >= memeEndFrame ? memeDurationFrames : 0}
          />
        </>
      )}

      {/* MEME CUTAWAY */}
      <MemeCutaway
        memeId="meme-id"
        triggerTimestamp={memeTimestamp / PLAYBACK_RATE}
        playbackRate={1.0}
        customDuration={memeDurationFrames / fps}
      />

      {/* STATIC OVERLAYS */}
      <StaticMemeOverlay
        imagePath="assets/memes/meme.jpg"
        timestamp={XX.XX}
        durationInFrames={50}
        position="center"
        scale={0.55}
        playbackRate={PLAYBACK_RATE}
        soundEffect={null}  // or "sound.mp3"
        soundVolume={0.5}
        frameOffset={memeDurationFrames}
      />

      {/* COUNTDOWN TIMER */}
      {!isInMemeCutaway && frame >= questionStartFrame && frame < answerRevealFrame && (
        <div style={{/* timer styles */}}>
          {Math.ceil((timerDuration - (frame - questionStartFrame)) / fps)}
        </div>
      )}

      {/* GREEN FLASH ON REVEAL */}
      {!isInMemeCutaway && (
        <Sequence from={answerRevealFrame} durationInFrames={9}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 255, 0, 0.25)',
            opacity: interpolate(frame - answerRevealFrame, [0, 3, 9], [0, 1, 0]),
          }} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
```

---

## RENDER COMMANDS

```bash
# Test render (first 10 seconds)
npx remotion render src/index.js [Topic]Ad out/test.mp4 --frames=0-300

# Full quality render
npx remotion render src/index.js [Topic]Ad out/[topic]-FINAL.mp4 --scale=2 --crf=15
```

---

## AVAILABLE MEMES

### Cutaway Videos (public/assets/memes/videos/)
- `drunk-man-falling.mp4` - Alcohol-related conditions
- `coffin-dance.mp4` - Death/catastrophic failure
- `windows-error.mp4` - System failure
- `this-is-fine.mp4` - Chaos/denial

### Static Images (public/assets/memes/)
- `success-kid.jpg` - Correct answer
- `confused-nick-young.jpg` - Confusion/gotcha moment
- `hide-the-pain-harold.jpg` - Student suffering
- `surprised-pikachu.png` - Shock

### Sound Effects (public/assets/sfx/memes/)
- `Wait a minute....mp3` - For confusion moments
- `Sadness-3.mp3` - For suffering moments
- `BRUH.mp3` - For facepalm moments

---

## CHECKLIST FOR NEW TOPICS

1. [ ] Generate audio with ElevenLabs (creates .mp3 + timestamps.json)
2. [ ] Calculate key timestamps (questionStart, answerReveal, meme triggers)
3. [ ] Define vignetteHighlights array
4. [ ] Choose memes and their trigger timestamps
5. [ ] Create [Topic]Ad.jsx component
6. [ ] Register in Root.jsx (with correct durationInFrames)
7. [ ] Register in BrainMascot.jsx timestampsData
8. [ ] Test render first 300 frames
9. [ ] Full render with --scale=2 --crf=15
