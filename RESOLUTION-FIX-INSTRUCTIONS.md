# If PNG Rendering Doesn't Fix Blur - Try This

## Option: Match Background Image Resolution

Your background is 1640x2360, but video is 1080x1920 (or 2160x3840 with scale).
This causes downscaling during render.

### Steps:

1. Edit `src/Root.jsx`:

```javascript
<Composition
  id="SynapticRecallAd"
  component={MedicalVideoAd}
  durationInFrames={2684}
  fps={30}
  width={1640}   // Changed from 1080
  height={2960}  // Changed from 1920 (maintaining 9:16 aspect ratio)
  // ... rest stays same
/>
```

2. **IMPORTANT**: Remove `Config.setScale(2)` from `remotion.config.js` if using this approach

3. This gives you native resolution matching your assets

### Alternative: Keep 2160x3840 and upscale background

```bash
sips -z 3840 2160 src/assets/background.png --out src/assets/background-4k.png
```

Then update your code to use `background-4k.png` instead.
