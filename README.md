# Synaptic Recall TikTok/Instagram Ads

Fast-paced medical education videos with Grandpa Spuds voice and memes.

## Setup

1. **Add your ElevenLabs API key:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

2. **Install dependencies (already done):**
   ```bash
   npm install
   ```

## Workflow

### 1. Generate Audio
```bash
npm run generate-audio
```
This will create audio using Grandpa Spuds voice with the test script.

### 2. Preview Video
```bash
npm run dev
```
Opens Remotion Studio where you can preview and edit your video.

### 3. Render Final Video
```bash
npm run render SynapticRecallAd out/video.mp4
```

## Project Structure

```
synaptic-recall-ads/
├── src/
│   ├── components/
│   │   └── MedicalVideoAd.jsx    # Main video component
│   ├── utils/
│   │   ├── generateAudio.js      # ElevenLabs integration
│   │   └── scriptGenerator.js    # Script formatter
│   ├── assets/
│   │   ├── audio/                # Generated narration
│   │   └── memes/                # Meme images/gifs
│   ├── Root.jsx                  # Remotion compositions
│   └── index.js                  # Entry point
└── package.json
```

## Customization

### Voice Settings (in generateAudio.js)
- **stability: 0.35** - Lower = more exaggerated/expressive
- **style: 0.60** - Higher = more character personality
- **similarity_boost: 0.75** - How much it sounds like the original voice

### Video Format
- **1080x1920** - TikTok/Instagram vertical
- **30 fps** - Standard frame rate
- **30 seconds** - Adjust `durationInFrames` in Root.jsx

## Adding Memes

1. Download memes/gifs to `src/assets/memes/`
2. Update `defaultProps.memes` in Root.jsx with:
   - `timestamp`: When meme appears (seconds)
   - `path`: File path
   - `duration`: How long it shows (seconds)

## Next Steps

1. Get your ElevenLabs API key from https://elevenlabs.io
2. Test audio generation
3. Add your practice questions
4. Download relevant memes
5. Start creating videos!
