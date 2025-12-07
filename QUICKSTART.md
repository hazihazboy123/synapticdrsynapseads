# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add Your ElevenLabs API Key

1. Go to https://elevenlabs.io and sign up
2. Get your API key from Profile → API Settings
3. Edit `.env` file and replace `your_api_key_here` with your actual key

### Step 2: Generate Audio

```bash
npm run generate-audio
```

This generates audio with **Grandpa Spuds voice** using the test script.
The audio will be saved to `src/assets/audio/narration.mp3`

**Voice is configured for maximum exaggeration:**
- Low stability (35%) = more character
- High style (60%) = full Grandpa personality
- Fast-paced delivery

### Step 3: Preview Your Video

```bash
npm run dev
```

Opens Remotion Studio in your browser where you can:
- See the video play in real-time
- Adjust timing and animations
- Preview before rendering

## 🎬 Creating Your First Video

### The Workflow:

1. **Write/Edit Your Script** (in `generateAudio.js` or create new file)
2. **Generate Audio** with Grandpa Spuds voice
3. **Add Memes** (optional but recommended for retention)
4. **Preview** in Remotion Studio
5. **Render** final video

## 🖼️ Adding Memes

Memes = retention. Here's how:

### Find Memes:
- Go to Tenor.com or Giphy.com
- Search for reactions matching your script moments
- Download as GIF or MP4

### Save Memes:
Put them in `src/assets/memes/`

Example names:
- `breathless.gif` (for dyspnea)
- `shocked.gif` (for surprising lab results)
- `mind-blown.gif` (for the diagnosis reveal)

### Add to Video:
Edit `src/Root.jsx` → `defaultProps.memes`:

```javascript
memes: [
  { timestamp: 3, path: '/assets/memes/breathless.gif', duration: 2 },
  { timestamp: 10, path: '/assets/memes/shocked.gif', duration: 2 },
]
```

## 📱 Video Format

- **1080x1920** (TikTok/Instagram vertical)
- **30 fps**
- **~30-60 seconds** (optimal for engagement)

## 🎯 Pro Tips

1. **Keep it punchy** - Short sentences, fast pace
2. **Lots of cuts** - Change text/visuals every 3-5 seconds
3. **Memes at key moments** - Diagnosis reveal, shocking findings
4. **Hook in first 3 seconds** - Start with the interesting part
5. **CTA at end** - "Follow for more" or "Link in bio"

## 🐛 Troubleshooting

**Audio not generating?**
- Check your API key in `.env`
- Make sure you have credits on ElevenLabs
- Check the voice name is exactly "Grandpa Spuds Oxley"

**Video not playing?**
- Make sure audio file exists at `src/assets/audio/narration.mp3`
- Run `npm run dev` from inside the project folder

**Need help?**
Check the full README.md or the code comments.

## 🎉 Ready to Ship

When your video looks good:

```bash
npm run render SynapticRecallAd out/sarcoidosis-video.mp4
```

Then upload to TikTok/Instagram! 🚀
