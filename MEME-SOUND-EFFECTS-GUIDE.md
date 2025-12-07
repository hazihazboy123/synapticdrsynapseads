# Meme Sound Effects Guide for Medical Videos

## Overview
This guide shows which sound effects pair best with specific memes for medical educational content. All sound effects are located in `src/assets/sfx/memes/`.

## Sound Effect Categories

### Subtle & Professional (Best for Medical Content)

#### **DING.mp3** (46KB)
- **Use With**: Success/correct answer moments
- **Best Memes**:
  - success-kid.jpg
  - leonardo-dicaprio-cheers.jpg
  - drake-hotline-bling.jpg (approval panel)
- **Timing**: On meme appearance
- **Volume**: 0.4-0.6

#### **pop.mp3** (73KB)
- **Use With**: Quick revelations, sudden appearances
- **Best Memes**:
  - surprised-pikachu.png
  - monkey-puppet.jpg
  - blinking-white-guy.gif
- **Timing**: Exactly on meme entry
- **Volume**: 0.3-0.5

#### **slide-whistle.mp3** (140KB)
- **Use With**: Escalating situations, transitions
- **Best Memes**:
  - expanding-brain.png
  - disaster-girl.jpg
  - this-is-fine.jpg
- **Timing**: Start as meme appears
- **Volume**: 0.3-0.4

#### **RIMSHOT.mp3** (34KB)
- **Use With**: Punchlines, clever wordplay
- **Best Memes**:
  - roll-safe.jpg
  - evil-kermit.jpg
  - tuxedo-winnie-pooh.jpg
- **Timing**: After text/punchline lands
- **Volume**: 0.4-0.5

### Moderate Emphasis

#### **HUH.mp3** (29KB)
- **Use With**: Confusion, questions
- **Best Memes**:
  - confused-math-lady.jpg
  - confused-nick-young.jpg
  - futurama-fry.jpg
  - is-this-a-pigeon.jpg
- **Timing**: On meme appearance
- **Volume**: 0.4-0.6

#### **WOW.mp3** (67KB)
- **Use With**: Impressive facts, surprising information
- **Best Memes**:
  - mind-blown.gif (if working)
  - interstellar-51-years.jpg
  - shocked-cat.jpg
- **Timing**: Peak moment of reveal
- **Volume**: 0.3-0.5

#### **boing.mp3** (73KB)
- **Use With**: Bouncy transitions, playful moments
- **Best Memes**:
  - doge.jpg
  - patrick-push-it.jpg
  - spongebob-head-out.jpg
- **Timing**: On meme entry
- **Volume**: 0.3-0.4

#### **cartoon-slip.mp3** (243KB)
- **Use With**: Mistakes, failures, awkward moments
- **Best Memes**:
  - homer-bushes.gif
  - unsettled-tom.jpg
  - woman-yelling-at-cat.jpg
- **Timing**: Start at meme appearance
- **Volume**: 0.3-0.4

### Stronger Emphasis (Use Sparingly)

#### **BRUH.mp3** (31KB)
- **Use With**: Facepalm moments, obvious mistakes
- **Best Memes**:
  - arthurs-fist.jpg
  - hide-the-pain-harold.jpg
  - michael-jordan-crying.jpg
- **Timing**: On meme appearance
- **Volume**: 0.4-0.5

#### **Metal Boom.mp3** (30KB)
- **Use With**: Impact moments, dramatic reveals
- **Best Memes**:
  - dramatic-chipmunk.gif (prairie dog)
  - distracted-boyfriend.jpg
  - scared-hamster.jpg
- **Timing**: Peak of dramatic moment
- **Volume**: 0.4-0.6

## Recommended Pairings for Common Medical Scenarios

### When Explaining a Complex Mechanism
1. **Confusion Phase**: confused-math-lady.jpg + HUH.mp3
2. **Understanding Phase**: expanding-brain.png + slide-whistle.mp3

### When Revealing an Answer
1. **Question**: futurama-fry.jpg + (no sound, or very subtle)
2. **Correct Answer**: success-kid.jpg + DING.mp3

### When Showing a Common Mistake
1. **The Mistake**: hide-the-pain-harold.jpg + cartoon-slip.mp3
2. **The Realization**: surprised-pikachu.png + pop.mp3

### When Contrasting Two Options
1. **Bad Option**: drake-hotline-bling.jpg (disapproval) + cartoon-slip.mp3
2. **Good Option**: drake-hotline-bling.jpg (approval) + DING.mp3

## Integration with Remotion

### Example Code Pattern

```javascript
// In your MedicalVideoAd.jsx or similar component

// Import at top
import { Sequence, Audio, staticFile } from 'remotion';

// In your meme mapping
{memes && memes.map((meme, index) => {
  const startFrame = meme.timestamp * fps;
  const durationFrames = meme.duration * fps;

  return (
    <React.Fragment key={index}>
      {/* Meme image */}
      <Sequence from={startFrame} durationInFrames={durationFrames}>
        <Img src={staticFile(meme.path)} />
      </Sequence>

      {/* Meme sound effect */}
      {meme.soundEffect && (
        <Sequence from={startFrame}>
          <Audio
            src={staticFile(`assets/sfx/memes/${meme.soundEffect}`)}
            volume={meme.volume || 0.4}
          />
        </Sequence>
      )}
    </React.Fragment>
  );
})}
```

### Example Meme Configuration

```json
{
  "memes": [
    {
      "name": "confused-math-lady",
      "path": "/assets/memes/confused-math-lady.jpg",
      "timestamp": 5.2,
      "duration": 3,
      "position": "bottom-right",
      "size": "medium",
      "soundEffect": "HUH.mp3",
      "volume": 0.4
    },
    {
      "name": "expanding-brain",
      "path": "/assets/memes/expanding-brain.png",
      "timestamp": 12.5,
      "duration": 4,
      "position": "bottom-left",
      "size": "large",
      "soundEffect": "slide-whistle.mp3",
      "volume": 0.35
    }
  ]
}
```

## Volume Guidelines for Medical Content

- **Background narration**: 1.0 (reference level)
- **Subtle SFX**: 0.3-0.4 (slide-whistle, pop, boing)
- **Standard SFX**: 0.4-0.5 (DING, HUH, BRUH, RIMSHOT)
- **Emphasis SFX**: 0.5-0.6 (WOW, Metal Boom)

## Best Practices

1. **Limit to 2 memes per video** - As specified for medical content
2. **Match sound to meme tone** - Use the pairings guide above
3. **Keep volume professional** - Never above 0.6 for medical context
4. **Time precisely** - Sound should hit exactly when meme appears
5. **Test with narration** - Ensure SFX doesn't overpower voiceover
6. **Consider pacing** - Space memes at least 5-7 seconds apart

## Available Sound Effects Summary

**Total**: 34 sound effects (31 from meme pack + 4 cartoon effects)

**Categories**:
- Subtle: DING, pop, slide-whistle, RIMSHOT, boing (5)
- Moderate: HUH, WOW, cartoon-slip (3)
- Strong: BRUH, Metal Boom (2)
- Additional: 24 other meme sounds for variety

## File Locations

```
src/assets/sfx/memes/
├── DING.mp3
├── pop.mp3
├── slide-whistle.mp3
├── RIMSHOT.mp3
├── HUH.mp3
├── WOW.mp3
├── BRUH.mp3
├── Metal Boom.mp3
├── boing.mp3
├── cartoon-slip.mp3
└── [24 additional sound effects]
```

## Notes

- All sound effects are royalty-free
- Source: [GitHub - Lexz-08/YouTube-Memes](https://github.com/Lexz-08/YouTube-Memes)
- Additional sources: Quick Sounds (for cartoon effects)
- No attribution required for video use
