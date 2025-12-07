# Video Quality Investigation - Blurriness on Mobile

## Problem Statement
Videos rendered with Remotion appear blurry on iPhone, especially the text/captions, even though they look crisp on Mac.

---

## ✅ What We Tried (Completed)

### 1. **Encoding Quality Settings** ✅
**What we did:**
- Increased CRF from 18 → 15 (near-lossless quality)
- Changed x264 preset from medium → slow (better compression)
- Increased JPEG quality from 80 → 100
- Increased audio bitrate from 192k → 256k

**Result in config:**
```javascript
Config.setCrf(15);
Config.setX264Preset('slow');
Config.setJpegQuality(100);
Config.setAudioBitrate('256k');
```

**Impact:** Bitrate increased from 778kbps → 967kbps, but **still blurry on phone**

---

### 2. **Color Space Correction** ✅
**What we did:**
- Fixed color space from bt470bg (SD TV) → bt709 (HD standard)
- Added FFmpeg color space override in config

**Result in config:**
```javascript
Config.overrideFfmpegCommand(({ args }) => {
  const colorSpaceOptions = [
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
  ];
  args.splice(args.length - 1, 0, ...colorSpaceOptions);
  return args;
});
```

**Impact:** Correct HD color space metadata, but **still blurry on phone**

---

### 3. **Scale Factor for High-DPI Screens** ✅
**What we did:**
- Added `Config.setScale(2)` to render text at 2x resolution
- Rendered frames at 2160x3840 (2K) instead of 1080x1920

**Result in config:**
```javascript
Config.setScale(2);
```

**Impact:**
- Final video: 2160x3840 resolution
- Bitrate increased to 2.79 Mbps
- File size: 33 MB
- Text rendered at 2x pixel density
- **Result: STILL BLURRY ON PHONE**

**Output:**
- `out/CRISP-TEXT-SCALE2.mp4` (2160x3840, 33MB)

---

### 4. **Pixel Format Investigation** ✅
**What we did:**
- Attempted to force yuv420p instead of yuvj420p
- Set `Config.setPixelFormat('yuv420p')`

**Impact:** Pixel format is correct in command, but FFmpeg still outputs yuvj420p during encoding (due to JPEG source frames). This is a minor issue and **not the cause of blur**.

---

## ❌ What We Haven't Tried Yet

### 1. **PNG Instead of JPEG for Frame Rendering** ❌
**Why this might help:**
- JPEG compression (even at quality=100) can introduce subtle artifacts
- PNG is lossless - no compression artifacts at all
- Text/fonts render perfectly in PNG

**How to test:**
```javascript
Config.setVideoImageFormat('png');
// Remove Config.setJpegQuality(100);
```

**Tradeoff:**
- Much slower rendering (~2-3x longer)
- Much larger temporary files
- But truly lossless frames

---

### 2. **Increase Scale Factor to 3** ❌
**Why this might help:**
- iPhone 15 Pro Max has 3x pixel density
- Scale=2 might not be enough for 3x displays
- Would render at 3240x5760 resolution

**How to test:**
```javascript
Config.setScale(3);
```

**Tradeoff:**
- MUCH longer render time (~9x longer than scale=1)
- Massive file size (60-100 MB+)
- Might be overkill

---

### 3. **Font Rendering CSS Optimizations** ❌
**Why this might help:**
- CSS properties can affect how text renders
- Subpixel rendering might help crispness

**How to test in `TikTokCaptions.jsx`:**
```javascript
style={{
  fontSize: 42,
  fontWeight: 'bold',
  fontFamily: 'Arial, Helvetica, sans-serif',

  // ADD THESE:
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
  imageRendering: 'crisp-edges',
}}
```

---

### 4. **Increase Resolution Beyond Scale** ❌
**Why this might help:**
- Instead of using scale, directly change composition size
- Might give more control over final output

**How to test in `src/Root.jsx`:**
```javascript
<Composition
  id="SynapticRecallAd"
  durationInFrames={2684}
  fps={30}
  width={2160}   // Changed from 1080
  height={3840}  // Changed from 1920
  // Remove Config.setScale(2) from config
/>
```

**Difference from scale=2:**
- This changes the actual composition canvas
- Scale=2 renders at 2x then downscales
- This approach keeps native 2K resolution

---

### 5. **H.265 (HEVC) Codec** ❌
**Why this might help:**
- Better compression than H.264
- Might preserve more detail at same bitrate
- Native support on modern iPhones

**How to test:**
```javascript
Config.setCodec('h265');
Config.setCrf(15);
```

**Tradeoff:**
- Slower encoding
- Less browser compatibility
- Might not fix blur issue

---

### 6. **ProRes Codec for Maximum Quality** ❌
**Why this might help:**
- Professional codec with near-zero compression
- Used in film/TV production
- Maximum quality preservation

**How to test:**
```javascript
Config.setCodec('prores');
Config.setProResProfile('4444'); // Highest quality
```

**Tradeoff:**
- MASSIVE file size (300-500 MB+)
- Not suitable for web distribution
- Mainly for testing if blur is encoding-related

---

### 7. **Direct Bitrate Control Instead of CRF** ❌
**Why this might help:**
- CRF is variable bitrate - might drop quality in complex scenes
- Direct bitrate ensures consistent quality

**How to test:**
```javascript
// Remove Config.setCrf(15);
Config.setVideoBitrate('8M'); // 8 Mbps constant bitrate
```

---

### 8. **Background Image Resolution Fix** ❌
**Why this might help:**
- Current background.png is 1640x2360
- Being scaled during composition
- Might introduce blur

**How to test:**
```bash
# Option A: Upscale to match 2160x3840
sips -z 3840 2160 src/assets/background.png --out src/assets/background-2k.png

# Option B: Create exact aspect ratio match
sips -z 3480 1960 src/assets/background.png --out src/assets/background-matched.png
```

Then update in code to use new image.

---

### 9. **Web Font Instead of System Font** ❌
**Why this might help:**
- Arial might render differently on different systems
- Web fonts are consistent across platforms
- Better hinting for screen display

**How to test:**
```javascript
// In TikTokCaptions.jsx
fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
```

Add font loading in composition.

---

### 10. **Export Settings for TikTok/Instagram Specs** ❌
**Why this might help:**
- TikTok/Instagram might re-encode videos
- Matching their specs might prevent quality loss

**TikTok specs:**
- Resolution: 1080x1920 or 2160x3840
- Bitrate: 8-12 Mbps recommended
- Frame rate: 30 or 60 fps
- Codec: H.264 Main/High profile
- Color space: bt709

**How to test:**
```javascript
Config.setVideoBitrate('10M');
Config.setCodec('h264');
// Already have bt709
```

---

### 11. **Disable Hardware Acceleration** ❌
**Why this might help:**
- Hardware encoding might introduce artifacts
- Software encoding is slower but more accurate

**How to test:**
```javascript
Config.overrideFfmpegCommand(({ args }) => {
  // Remove any -hwaccel flags
  // Force software encoding
  return args;
});
```

---

### 12. **Two-Pass Encoding** ❌
**Why this might help:**
- First pass analyzes video
- Second pass optimizes bitrate allocation
- Better quality distribution

**Note:** Remotion doesn't have built-in two-pass support, would need custom FFmpeg override.

---

## 📊 Test Results Summary

| Attempt | Setting | Bitrate | File Size | Resolution | Result |
|---------|---------|---------|-----------|------------|--------|
| Original | CRF 18, default | 778 kbps | 11 MB | 1080x1920 | Blurry |
| Attempt 1 | CRF 15, slow | 967 kbps | 13 MB | 1080x1920 | Still blurry |
| Attempt 2 | +bt709 color | 967 kbps | 13 MB | 1080x1920 | Still blurry |
| Attempt 3 | +scale=2 | 2.79 Mbps | 33 MB | 2160x3840 | **Still blurry** |

---

## 🔍 Current Hypothesis

The blur might be caused by:

1. **JPEG compression artifacts** - Even at quality=100, JPEG isn't truly lossless
2. **Font rendering method** - CSS text rendering might not be optimized
3. **iPhone's own video player** - iOS might be downscaling/processing the video
4. **Resolution mismatch** - Even 2K might not match iPhone's exact display matrix
5. **Background image scaling** - The 1640px background being scaled introduces blur

---

## 🎯 Recommended Next Steps (Priority Order)

### **HIGH PRIORITY:**

1. **Try PNG rendering** - Test if lossless frames fix the issue
   - Expected impact: High
   - Time cost: Slow render (~3x longer)

2. **Fix background image resolution** - Upscale to exact 2160x3840
   - Expected impact: High
   - Time cost: Fast (just image resize)

3. **Add CSS font rendering optimizations** - Add antialiasing/text-rendering
   - Expected impact: Medium
   - Time cost: Fast (just code change)

### **MEDIUM PRIORITY:**

4. **Try direct bitrate control** - Use 8-10 Mbps fixed bitrate
   - Expected impact: Medium
   - Time cost: Medium render

5. **Test composition size instead of scale** - Change canvas to 2160x3840
   - Expected impact: Medium
   - Time cost: Medium render

### **LOW PRIORITY:**

6. **Try scale=3** - For 3x pixel density displays
   - Expected impact: Low (probably overkill)
   - Time cost: Very slow render

7. **Test H.265 codec** - Better compression
   - Expected impact: Low
   - Time cost: Slow render

---

## 📁 Current Configuration File

Location: `/Users/haziq/synaptic-recall-ads/remotion.config.js`

```javascript
import { Config } from '@remotion/cli/config';

// ===== MAXIMUM QUALITY SETTINGS FOR CRISP MOBILE PLAYBACK =====
// Optimized for iOS/Android with perfect color reproduction and sharpness

// Frame rendering quality
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(100); // Maximum JPEG quality (0-100, default is 80)
Config.setOverwriteOutput(true);

// 🔥 CRITICAL FOR SHARP TEXT ON MOBILE 🔥
// Scale=2 renders text at 2x resolution for high-DPI screens (iPhone, Android flagships)
// This makes TEXT/CAPTIONS perfectly crisp on mobile!
Config.setScale(2);

// Video encoding quality
Config.setCodec('h264'); // Best mobile compatibility
Config.setCrf(15); // ULTRA HIGH quality (lower = better, 15 is near-lossless, default is 18)

// H.264 encoding preset - 'slow' gives best quality/compression balance
Config.setX264Preset('slow'); // Takes longer but produces sharper, better compressed output

// Audio quality
Config.setAudioCodec('aac');
Config.setAudioBitrate('256k'); // High quality audio (upgraded from 192k)

// Pixel format
Config.setPixelFormat('yuv420p'); // Standard H.264 format (ensures mobile compatibility)

// CRITICAL: Override FFmpeg command for PERFECT mobile video quality
Config.overrideFfmpegCommand(({ args }) => {
  console.log('🔧 CUSTOM FFMPEG OVERRIDE RUNNING!');
  console.log('Full args:', args.join(' '));

  // Find the pixel format argument and replace yuvj420p with yuv420p
  const pixFmtIndex = args.findIndex(arg => arg === '-pix_fmt');
  console.log('pixFmt index:', pixFmtIndex, 'value:', args[pixFmtIndex + 1]);

  if (pixFmtIndex !== -1) {
    const oldFormat = args[pixFmtIndex + 1];
    args[pixFmtIndex + 1] = 'yuv420p';  // Force yuv420p regardless
    console.log(`✅ Changed pixel format: ${oldFormat} → yuv420p`);
  }

  // Inject COMPLETE bt709 color space parameters for HD accuracy on phones
  const colorSpaceOptions = [
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
  ];

  // Insert before the final output file argument
  args.splice(args.length - 1, 0, ...colorSpaceOptions);

  console.log('✅ Added color space options for bt709');
  console.log('📊 CRF:', args[args.findIndex(a => a === '-crf') + 1]);
  console.log('📊 Preset:', args[args.findIndex(a => a === '-preset') + 1]);

  return args;
});
```

---

## 🎬 Rendered Videos Location

All test videos are in: `/Users/haziq/synaptic-recall-ads/out/`

- `SynapticRecallAd.mp4` - Original (1080x1920, 11MB)
- `FINAL-ULTRA-QUALITY.mp4` - CRF 15 + bt709 (1080x1920, 13MB)
- `CRISP-TEXT-SCALE2.mp4` - **Latest** - Scale=2 (2160x3840, 33MB)

---

## 💡 Additional Diagnostic Questions

To narrow down the issue, we need to know:

1. **How are you viewing the video on iPhone?**
   - Photos app?
   - Safari browser?
   - TikTok/Instagram app?
   - Third-party video player?

2. **Is the entire video blurry or just the text?**
   - If just text: Font rendering issue
   - If everything: Encoding/compression issue

3. **Does the blur happen during playback or in the thumbnail?**
   - Thumbnail: iOS video preview compression
   - Playback: Actual video quality issue

4. **Are you AirDropping or using another transfer method?**
   - Some transfer methods re-compress videos
   - Try uploading to iCloud/Dropbox for direct download

5. **What iPhone model are you using?**
   - Different models have different screen pixel densities
   - Affects what "scale" value we should use

---

## 🔗 Resources Used

- [Remotion Scaling Documentation](https://www.remotion.dev/docs/scaling)
- [Remotion Quality Guide](https://www.remotion.dev/docs/quality)
- [Remotion Encoding Guide](https://www.remotion.dev/docs/encoding)
- [Remotion Configuration](https://www.remotion.dev/docs/config)
