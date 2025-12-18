import { Config } from '@remotion/cli/config';

// ===== SOCIAL MEDIA OPTIMIZED SETTINGS =====
// Optimized for Instagram Reels & TikTok with sharp text on mobile

// Frame rendering - PNG = lossless intermediates (no compression during render)
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);

// Scale=2 renders at 2x resolution (2160x3840 from 1080x1920 composition)
// CRITICAL for sharp text on high-DPI mobile screens (iPhone, Android flagships)
Config.setScale(2);

// Video codec
Config.setCodec('h264');

// CRF 18 = high quality baseline (will be used with capped bitrate below)
// Note: CRF 15 is overkill - creates huge files with minimal visual difference
Config.setCrf(18);

// Slow preset = best quality/compression ratio (worth the extra render time)
Config.setX264Preset('slow');

// Audio: AAC 192kbps (above Instagram's 128k minimum, not wasteful)
Config.setAudioCodec('aac');
Config.setAudioBitrate('192k');

// Pixel format: yuv420p is required for universal compatibility
Config.setPixelFormat('yuv420p');

// FFmpeg override for social-media-specific optimizations
Config.overrideFfmpegCommand(({ args }) => {
  console.log('🎬 SOCIAL MEDIA OPTIMIZED ENCODING');

  // Fix pixel format (Remotion sometimes outputs yuvj420p)
  const pixFmtIndex = args.findIndex(arg => arg === '-pix_fmt');
  if (pixFmtIndex !== -1 && args[pixFmtIndex + 1] === 'yuvj420p') {
    args[pixFmtIndex + 1] = 'yuv420p';
  }

  // CAPPED CRF APPROACH:
  // - CRF controls quality (set above via Config.setCrf)
  // - maxrate/bufsize cap bitrate peaks so platforms don't crush it harder
  //
  // Why this works better than pure bitrate:
  // - CRF adapts to content complexity (static slides need fewer bits than animations)
  // - The cap prevents bitrate spikes that trigger aggressive platform re-encoding
  // - Result: consistent quality that survives Instagram/TikTok compression

  const socialMediaOptions = [
    // Capped bitrate (works WITH CRF, not instead of it)
    // 12 Mbps is the sweet spot - high enough for quality, low enough to avoid aggressive re-encode
    '-maxrate', '12M',
    '-bufsize', '24M',  // 2x maxrate = standard VBV buffer

    // H.264 High Profile Level 4.2 (all modern phones support this)
    '-profile:v', 'high',
    '-level', '4.2',

    // Keyframes every 2 seconds at 30fps (social media standard for seeking)
    '-g', '60',
    '-keyint_min', '30',  // Allow closer keyframes if scene changes

    // B-frames: KEEP THEM (bframes=3 is x264 default)
    // B-frames IMPROVE compression efficiency - TikTok handles them fine
    // Setting bf=0 was hurting your quality-per-bitrate
    // (Removed the -bf 0 that was here)

    // BT.709 color space (web/mobile standard)
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-color_range', 'tv',  // "tv" range (16-235) is standard for H.264

    // Fast start: moves moov atom to beginning for quick playback start
    '-movflags', '+faststart',
  ];

  // Insert options before the output filename (last argument)
  const outputIndex = args.length - 1;
  args.splice(outputIndex, 0, ...socialMediaOptions);

  console.log('✅ Capped CRF encoding (quality-targeted with bitrate ceiling)');
  console.log('📊 CRF: 18 | Max bitrate: 12 Mbps | Buffer: 24 Mbps');
  console.log('📊 Profile: High | Level: 4.2');
  console.log('📊 Scale: 2x (2160x3840 output for sharp text)');
  console.log('📊 Color: BT.709 | Pixel format: yuv420p');

  return args;
});
