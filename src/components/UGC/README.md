# Synaptic Recall UGC B-Roll Components

These components recreate the Synaptic Recall website UI programmatically for use in UGC/TikTok ads.

## Available Compositions

### 1. `synaptic-ugc-ad` (Main Ad)
The full 30-second UGC ad with all scenes synced together.

```bash
# Preview in studio
npm run dev
# Then open http://localhost:3000 and select "synaptic-ugc-ad"

# Render to MP4
npx remotion render synaptic-ugc-ad out/synaptic-ugc-ad.mp4
```

### 2. Individual Preview Compositions
Use these to test/preview individual UI screens:

- `ugc-upload-preview` - Upload screen mockup
- `ugc-processing-preview` - Flashcard generation screen
- `ugc-download-preview` - Download complete screen

## Components

### StarsBackground
Animated starfield background matching the website.

```jsx
import { StarsBackground } from './UGC';

<StarsBackground starCount={100} twinkle={true} />
```

### BrainIcon
The Synaptic Recall brain logo with animations.

```jsx
import { BrainIcon } from './UGC';

<BrainIcon size={80} animate={true} showOnFrame={0} />
```

### MockUploadScreen
Full upload screen mockup with mode selection and file picker.

```jsx
import { MockUploadScreen } from './UGC';

<MockUploadScreen
  showOnFrame={0}
  selectedMode="anki" // or "practice"
  showFileSelected={true}
  fileName="Cardiology_Lecture_15.pdf"
  fileSize="8.2 MB"
  userName="Future Doctor"
  showModeCards={true}
  showUploadZone={true}
/>
```

### MockProcessingScreen
Flashcard generation screen with animated cards appearing.

```jsx
import { MockProcessingScreen } from './UGC';

<MockProcessingScreen
  showOnFrame={0}
  fileName="Cardiology_Lecture_15.pdf"
  cardCount={6}       // Cards currently shown
  totalCards={25}     // Total expected cards
  showCards={true}
  showProgress={true}
  flipCardIndex={-1}  // Which card to flip (-1 = none)
/>
```

### MockDownloadScreen
Download complete screen with confetti and success message.

```jsx
import { MockDownloadScreen } from './UGC';

<MockDownloadScreen
  showOnFrame={0}
  cardCount={25}
  showConfetti={true}
  showDownloadButton={true}
  downloadProgress={0}  // 0-100 for download progress bar
/>
```

## Scene Timing Configuration

Edit `SynapticRecallUGC.jsx` to adjust scene timings:

```javascript
const SCENE_CONFIG = {
  fps: 30,
  hook: { start: 0, duration: 90 },        // 0-3s
  painPoint: { start: 90, duration: 150 }, // 3-8s
  productReveal: { start: 240, duration: 60 }, // 8-10s
  uploadDemo: { start: 300, duration: 120 },   // 10-14s
  processing: { start: 420, duration: 120 },   // 14-18s
  features: { start: 540, duration: 180 },     // 18-24s
  results: { start: 720, duration: 90 },       // 24-27s
  cta: { start: 810, duration: 90 },           // 27-30s
};
```

## Adding Voiceover Audio

1. Place your audio file in `/public/` folder
2. Pass the audio source to the composition:

```jsx
<SynapticRecallUGC audioSrc="voiceover.mp3" />
```

## Customizing for Your Ad

1. **Adjust timings** - Modify `SCENE_CONFIG` to match your voiceover
2. **Change text** - Edit scene components in `SynapticRecallUGC.jsx`
3. **Add/remove scenes** - Use Remotion's `<Sequence>` component
4. **Customize colors** - Update the gradient values in components

## Color Palette

The components use the Synaptic Recall brand colors:

- Primary Purple: `#a855f7`
- Primary Pink: `#ec4899`
- Blue (Anki mode): `#3b82f6`
- Red (Practice mode): `#ef4444`
- Success Green: `#22c55e`
- Background: `#000`
