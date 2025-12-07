import { Config } from '@remotion/cli/config';

// ===== MAXIMUM QUALITY SETTINGS FOR CRISP MOBILE PLAYBACK =====
// Optimized for iOS/Android with perfect color reproduction and sharpness

// Frame rendering quality
Config.setVideoImageFormat('png'); // LOSSLESS - No compression artifacts!
// Config.setJpegQuality(100); // Not needed with PNG
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

// Audio quality (Instagram/TikTok spec: 128kbps AAC)
Config.setAudioCodec('aac');
Config.setAudioBitrate('192k'); // Sweet spot: higher than their 128k, not overkill

// Pixel format
Config.setPixelFormat('yuv420p'); // Standard H.264 format (ensures mobile compatibility)

// CRITICAL: Override FFmpeg command for INSTAGRAM/TIKTOK OPTIMIZED QUALITY
Config.overrideFfmpegCommand(({ args }) => {
  console.log('🔧 INSTAGRAM/TIKTOK OPTIMIZED ENCODING!');
  console.log('Full args:', args.join(' '));

  // Find the pixel format argument and replace yuvj420p with yuv420p
  const pixFmtIndex = args.findIndex(arg => arg === '-pix_fmt');
  if (pixFmtIndex !== -1) {
    args[pixFmtIndex + 1] = 'yuv420p';
    console.log(`✅ Pixel format: yuv420p`);
  }

  // Remove CRF (we'll use bitrate instead for more predictable quality)
  const crfIndex = args.findIndex(arg => arg === '-crf');
  if (crfIndex !== -1) {
    args.splice(crfIndex, 2); // Remove -crf and its value
    console.log('✅ Removed CRF (using bitrate instead)');
  }

  // INSTAGRAM/TIKTOK OPTIMIZED SETTINGS
  // High bitrate survives their re-encoding better
  const socialMediaOptions = [
    // Video bitrate: 12 Mbps (higher than their 8-10 Mbps = quality buffer)
    '-b:v', '12M',
    '-maxrate', '15M',
    '-bufsize', '20M',

    // H.264 High Profile (better compression, supported by all phones)
    '-profile:v', 'high',
    '-level', '4.2',

    // Keyframe every 2 seconds (Instagram/TikTok standard)
    '-g', '60', // 60 frames = 2 seconds at 30fps
    '-keyint_min', '60',

    // No B-frames (better for streaming, TikTok compatible)
    '-bf', '0',

    // Color space (critical for accurate colors after re-encode)
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-color_range', 'tv',

    // Encoding flags for quality
    '-movflags', '+faststart', // Optimize for streaming
    '-pix_fmt', 'yuv420p',
  ];

  // Insert before the final output file argument
  args.splice(args.length - 1, 0, ...socialMediaOptions);

  console.log('✅ Instagram/TikTok optimized settings applied');
  console.log('📊 Video bitrate: 12 Mbps');
  console.log('📊 Maxrate: 15 Mbps');
  console.log('📊 Profile: High, Level 4.2');

  return args;
});
