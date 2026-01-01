# Remotion GIF Jitter/Shaking Issue - Root Cause & Fix

## The Problem
Some GIF meme overlays were shaking/jittering during **render** but looked fine in **preview**.

## Root Cause
**Spring oscillation + interpolated rotation = jitter**

The `spring()` function in Remotion oscillates slightly around its target value:
```
Frame 1: 0.998
Frame 2: 1.002
Frame 3: 0.999
Frame 4: 1.001
```

When rotation is **interpolated** based on this spring value:
```javascript
// BAD - causes jitter
rotate: interpolate(progress, [0, 1], [15, 0])
```

These micro-oscillations (0.998 → 1.002) cause tiny rotation changes that appear as visible shaking during frame-by-frame rendering.

## Why Preview Works But Render Doesn't
- **Preview**: Runs in real-time, small oscillations are smoothed by continuous playback
- **Render**: Captures frame-by-frame independently, each micro-rotation is captured as a distinct frame

## The Fix
Use **static values** instead of interpolated values for rotation in animations:

```javascript
// GOOD - no jitter
case 'slideRight':
  return {
    scale: 1,
    x: interpolate(progress, [0, 1], [800, 0]),
    y: 0,
    rotate: rotation,  // Static value, not interpolated
  };

// BAD - causes jitter
case 'slideRight':
  return {
    scale: 1,
    x: interpolate(progress, [0, 1], [800, 0]),
    y: 0,
    rotate: interpolate(progress, [0, 1], [15, rotation]),  // Interpolated = jitter
  };
```

## Animations That Were Fixed
- `slideLeft` - removed rotation interpolation
- `slideRight` - removed rotation interpolation

## Safe Animations (no spring-based rotation)
- `slideDown` - only Y movement
- `slideUp` - only Y movement
- `slam` - only scale
- `bounce` - only scale
- `zoom` - only scale
- `fall` (exit) - uses linear interpolation, not spring

## Risky Animations (may need review)
- `spin` - uses interpolated rotation (intentional, but could jitter)
- `glitch` - uses Math.sin for rotation (intentional shake effect)
- `shrink` (exit) - adds rotation during exit

## General Rule
**Never interpolate rotation based on a spring value** unless intentional shake is desired.

If you need animated rotation, use `interpolate()` with frame numbers directly:
```javascript
// Safer - based on frame count, not spring
rotate: interpolate(localFrame, [0, entranceDuration], [15, 0], { extrapolateRight: 'clamp' })
```

## Debugging Future Jitter Issues
1. Check if the animation uses `spring()`
2. Check if rotation/scale/position is interpolated from spring output
3. Replace spring-based interpolation with frame-based or static values
4. Test with `npx remotion render` (not just preview)

---
*Discovered: December 2024*
*Fixed in: AnimatedMemeOverlay.jsx*
