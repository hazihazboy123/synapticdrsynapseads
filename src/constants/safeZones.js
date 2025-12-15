/**
 * Safe Zone Constants for TikTok & Instagram Reels
 *
 * These constraints ensure content doesn't overlap with platform UI elements
 * like For You tabs, engagement buttons, captions, etc.
 *
 * Canvas: 1080x1920 (9:16 aspect ratio)
 */

export const SAFE_ZONES = {
  // Platform UI margins (most conservative - works for both TikTok & Instagram)
  TOP: 220,      // Clear top 220px (For You/Following tabs, audio info)
  BOTTOM: 350,   // Clear bottom 350px (captions, engagement buttons, description)
  LEFT: 60,      // Clear left 60px (profile info)
  RIGHT: 120,    // Clear right 120px (like, comment, share buttons)

  // Canvas dimensions
  WIDTH: 1080,
  HEIGHT: 1920,

  // Calculated safe area boundaries
  SAFE_WIDTH: 1080 - 60 - 120,      // 900px usable width
  SAFE_HEIGHT: 1920 - 220 - 350,    // 1350px usable height
  SAFE_LEFT: 60,                     // Left boundary
  SAFE_TOP: 220,                     // Top boundary
  SAFE_RIGHT: 960,                   // Right boundary (1080 - 120)
  SAFE_BOTTOM: 1570,                 // Bottom boundary (1920 - 350)
};

/**
 * Validation helper - checks if element is within safe zone
 */
export const isWithinSafeZone = (top, left, width, height) => {
  const bottom = top + height;
  const right = left + width;

  return {
    isValid: (
      top >= SAFE_ZONES.TOP &&
      left >= SAFE_ZONES.LEFT &&
      right <= SAFE_ZONES.SAFE_RIGHT &&
      bottom <= SAFE_ZONES.SAFE_BOTTOM
    ),
    violations: {
      top: top < SAFE_ZONES.TOP ? `${SAFE_ZONES.TOP - top}px too high` : null,
      left: left < SAFE_ZONES.LEFT ? `${SAFE_ZONES.LEFT - left}px too far left` : null,
      right: right > SAFE_ZONES.SAFE_RIGHT ? `${right - SAFE_ZONES.SAFE_RIGHT}px too far right` : null,
      bottom: bottom > SAFE_ZONES.SAFE_BOTTOM ? `${bottom - SAFE_ZONES.SAFE_BOTTOM}px too far down` : null,
    }
  };
};

export default SAFE_ZONES;
