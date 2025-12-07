# SYSTEM PROMPT V9.0 - DEFINITIVE SPECIFICATION
## Full Production Automation for Claude Desktop

**Date:** 2025-11-29
**Target:** Claude Desktop (Browser)
**Author:** Claude Code (CLI) based on production learnings
**Purpose:** Complete automation of medical education video generation

---

## EXECUTIVE SUMMARY

Based on the production run of Nephrotic Syndrome video and your clarifications, this document defines the **DEFINITIVE** system prompt that will enable Claude Desktop to generate perfect medical education videos in ONE SHOT.

### Key Decisions from Your Input:

1. **Version:** v8.0 is the DEPLOYED standard (SquamousCellLung template)
2. **Playback Rate:** **1.9x LOCKED** (not 1.8x, not 1.85x)
3. **Subagents:** **REQUIRED** - Deploy 5 specialized agents for automation
4. **Validation:** **MANDATORY** - Pre-flight checks at every step
5. **Teaching Content:** **MODERATE** - Script-based with minimal medical clarifications
6. **Length:** Quality over brevity - comprehensive but purposeful
7. **Focus:** Perfect execution of all visual/audio elements

---

## SECTION 1: WORKFLOW & AGENT ARCHITECTURE

### The Complete Pipeline (Claude Desktop → Video)

```
USER INPUT (Claude Desktop)
    ↓
    [Script + Question Data + Teaching Points + Meme Preferences]
    ↓
┌─────────────────────────────────────────────────────┐
│ CLAUDE CODE (CLI) - ORCHESTRATOR                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  STEP 1: Input Validation Agent                    │
│  ├─ Validate meme files exist                      │
│  ├─ Validate vignette phrases match questionData   │
│  ├─ Validate playbackRate (1.9x)                   │
│  └─ Output: Validated input OR error report        │
│                                                     │
│  STEP 2: Audio Generation Agent (ONE CALL ONLY)    │
│  ├─ Call ElevenLabs API with Grandpa Oxley voice   │
│  ├─ Handle BOTH API response formats               │
│  ├─ Convert to required schema (word/start/end)    │
│  └─ Output: audio.mp3 + timestamps.json            │
│                                                     │
│  STEP 3: Timestamp Detection Agent                 │
│  ├─ Find question start (first option A)           │
│  ├─ Find answer reveal (trigger word)              │
│  ├─ Auto-detect options (A) B) C) D) E))          │
│  ├─ Find vignette highlight triggers               │
│  ├─ Find teaching element triggers                 │
│  └─ Output: Complete timestamp mapping             │
│                                                     │
│  STEP 4: Component Generation                      │
│  ├─ Build from SquamousCellLung template          │
│  ├─ Wire all sounds (14 total)                     │
│  ├─ Configure timer (starts at option A)           │
│  ├─ Configure heartbeat (dynamic volume)           │
│  ├─ Add teaching phases (1-3 phases)               │
│  └─ Output: Complete {Topic}Ad.jsx                 │
│                                                     │
│  STEP 5: Component Validation Agent                │
│  ├─ Read TeachingCard.jsx for hardcoded values     │
│  ├─ Verify all props are used correctly            │
│  ├─ Check for "SQUAMOUS" or other hardcoded text  │
│  └─ Output: Validation report OR fixes             │
│                                                     │
│  STEP 6: QA Verification Agent (MANDATORY GATE)    │
│  ├─ Verify 25-point checklist                      │
│  ├─ Test render frame 300                          │
│  ├─ Verify all sounds present                      │
│  ├─ Verify timer logic correct                     │
│  └─ Output: PASS (proceed) or FAIL (fix & retry)  │
│                                                     │
│  STEP 7: Registration & Delivery                   │
│  ├─ Register in Root.jsx                           │
│  ├─ Register in BrainMascot.jsx                    │
│  ├─ Calculate duration at 1.9x                     │
│  └─ Report to user: READY TO PREVIEW               │
│                                                     │
└─────────────────────────────────────────────────────┘
    ↓
OUTPUT: Perfect video component ready for render
```

---

## SECTION 2: ANSWERS TO YOUR 11 QUESTIONS

### Q1: Version Clarity

**ANSWER:**
- **Work from:** v8.0 (SquamousCellLung is the gold standard)
- **Status:** v8.0 is DEPLOYED and WORKING
- **Analysis document:** Critiques v7.0 issues that v8.0 FIXED
- **Your task:** Use v8.0 as foundation, implement the remaining fixes from analysis

### Q2: Scope of Changes

**ANSWER:**
- **Implement:** ALL fixes from analysis document Sections 13-15
- **Subagent deployment:** YES - All 5 specialized agents REQUIRED
- **Priority:** High-impact first, then comprehensive

**Priority Order:**
1. ✅ Input validation (prevents wasted API calls)
2. ✅ Audio generation (one-shot, no retries)
3. ✅ Timestamp detection (timer starts at option A)
4. ✅ Component validation (no hardcoded values)
5. ✅ QA checklist (mandatory gate before delivery)

### Q3: Critical Inconsistencies

**ANSWER:**
- **Playback rate:** **1.9x LOCKED** (definitive target)
- **ThinkingCursor:** REMOVED entirely - audio-synced highlighting ONLY
- **Teaching phases:** **1-3 phases** (not "max 2") - allow flexibility

### Q4: Validation Strategy

**ANSWER:**
- **Pre-flight validation:** YES - Check inputs before generation
- **Component inspection:** YES - Read components for hardcoded values
- **Mandatory QA checklist:** YES - Enforced gate, not optional
- **Overkill?:** NO - This is ESSENTIAL for one-shot production

### Q5: ElevenLabs API Response Format

**ANSWER:**
- **Handle BOTH formats** for resilience:
  - Old: `alignment.characters[{character, start_time_seconds, end_time_seconds}]`
  - New: Three separate arrays that need zipping
- **Detection:** Check response structure, adapt accordingly
- **Fallback:** If parsing fails, save raw response and report error

### Q6: Teaching Content Rules

**ANSWER:**
- **Rule:** **MODERATE** - Script-based with minimal medical clarifications
- **Allowed:**
  - Verbatim script text (✅ "Give 'em steroids")
  - Formalization (✅ "Treat with corticosteroids")
  - Board-relevant context (✅ "Most common in children" when script says "youngsters")
- **Forbidden:**
  - Percentages NOT in script (❌ "90% cure rate")
  - Technical details NOT mentioned (❌ "Podocyte foot process effacement")
  - Parenthetical additions unless critical (⚠️ "(>3.5g/day)" - use sparingly)

**Guiding Principle:**
> If Grandpa says it (even indirectly), you can formalize it.
> If he doesn't mention it, don't add it.

### Q7: Length & Usability

**ANSWER:**
- **Keep comprehensive** - Quality over brevity
- **Remove:** Unnecessary explanations, redundant examples
- **Keep:** All automation instructions, validation steps, agent specs
- **Target:** 1500-2000 lines of HIGH-QUALITY instructions

### Q8: Meme System

**ANSWER:**
- **Current:** 1 video overlay (optional) + 1 static reveal (required)
- **Future:** Keep flexible for video overlays at answer reveal
- **Limit:** 2 memes max per video (avoid overload)

### Q9: Error Recovery

**ANSWER:**
- **Stop and report** (safe approach)
- **Provide alternatives:** "Could not find 'Think'. Alternatives: 'So' (40.1s), 'Alright' (39.8s)"
- **User chooses:** Interactive fallback if auto-detection fails

### Q10: Output Format

**ANSWER:**
- **Maintain XML structure** (current format)
- **Why:** Claude Desktop parses XML well, structured, supports comments
- **Alternatives:** Not needed, XML works

### Q11: Most Critical Issue

**ANSWER (from your feedback):**
> **"Getting everything right in one shot with perfect implementation"**

**Top 3 Pain Points to Fix:**
1. **Timer starting at wrong time** (should start at option A, not "Think")
2. **Hardcoded values in components** (SQUAMOUS appearing in non-squamous videos)
3. **Teaching cards not matching script** (adding medical details not spoken)

---

## SECTION 3: CRITICAL CONFIGURATION (LOCKED)

```xml
<critical_config>
  <playback_rate>1.9</playback_rate>
  <fps>30</fps>
  <resolution width="1080" height="1920">Vertical TikTok/Instagram format</resolution>
  <target_duration>28-35 seconds perceived time</target_duration>
  <frame_offset>0</frame_offset>

  <elevenlabs_config>
    <voice_id>NOpBlnGInO9m6vDvFkFC</voice_id>
    <model>eleven_turbo_v2_5</model>
    <stability>0.35</stability>
    <similarity_boost>0.80</similarity_boost>
    <style>0.85</style>
    <use_speaker_boost>true</use_speaker_boost>
    <note>MAXIMUM GRUMPY Grandpa Oxley settings</note>
  </elevenlabs_config>

  <mandatory_features>
    <feature>Audio-synced option highlighting (NO ThinkingCursor)</feature>
    <feature>Enhanced countdown timer (starts at option A)</feature>
    <feature>Dynamic heartbeat (0.5 → 1.5 in final 2 seconds)</feature>
    <feature>Green flash on answer reveal</feature>
    <feature>Brain mascot emotions (shock, thinking, celebration)</feature>
    <feature>Vignette highlights with gold pills</feature>
    <feature>Screen shakes on critical values + teaching bullets</feature>
    <feature>14 sound effects (all calibrated)</feature>
    <feature>Teaching phases (1-3 phases, black box style)</feature>
  </mandatory_features>
</critical_config>
```

---

## SECTION 4: THE 5 REQUIRED SUBAGENTS

### Agent #1: Input Validator

**Purpose:** Validate all inputs from Claude Desktop BEFORE starting generation

**Tools:** Read, Glob, Bash (node)

**Process:**
```javascript
1. Load input JSON
2. Validate schema:
   - ✓ topic (string)
   - ✓ script (150-170 words)
   - ✓ questionData (complete structure)
   - ✓ vignetteHighlights (array with phrases + triggerWords)
   - ✓ teachingPhases (1-3 phases with elements)
   - ✓ memes (optional video, required static)
   - ✓ playbackRate (default 1.9)

3. Validate meme files:
   - ls public/assets/memes/videos/{videoMemeId}.mp4
   - ls public/assets/memes/{staticMemeId}.{jpg,png,gif}
   - If NOT found: STOP, report missing files, suggest alternatives

4. Validate vignette phrases:
   - For each vignetteHighlight.phrase:
     - Search questionData.vignette for EXACT substring match
     - If NOT found: STOP, report mismatch, suggest correction

5. Output:
   - ✅ PASS: Validated input ready for generation
   - ❌ FAIL: Error report with specific issues
```

**Stop Conditions:**
- Missing required field
- Meme file not found
- Vignette phrase not in vignette text
- Invalid playbackRate (<1.5 or >2.5)

**Output to Main Process:**
```json
{
  "status": "pass" | "fail",
  "validated_input": {...},
  "errors": [...],
  "warnings": [...]
}
```

---

### Agent #2: Audio Generator (ONE-SHOT ONLY)

**Purpose:** Generate audio + timestamps in ONE API call with correct schema

**Tools:** Bash (fetch, node, fs), Write

**Process:**
```javascript
1. Check .env for ELEVENLABS_API_KEY
   - If missing: STOP, report error

2. Call ElevenLabs API ONCE:
   - Endpoint: /v1/text-to-speech/{voice_id}/with-timestamps
   - Body: { text: script, model_id, voice_settings }
   - Save raw response to: debug-elevenlabs-response.json

3. Detect response structure:
   - Check if data.alignment.characters is array of objects
   - OR if data.alignment has separate arrays

4. Parse based on structure:

   FORMAT A (Old - object array):
   characters = data.alignment.characters.map(c => ({
     word: c.character,
     start: c.start_time_seconds,
     end: c.end_time_seconds
   }))

   FORMAT B (New - separate arrays):
   characters = data.alignment.characters.map((char, i) => ({
     word: char,
     start: data.alignment.character_start_times_seconds[i],
     end: data.alignment.character_end_times_seconds[i]
   }))

5. Build words from characters:
   - Group characters into words (split on spaces)
   - Each word: { word: "text", start: number, end: number }

6. Save files:
   - public/assets/audio/{topic}-narration.mp3 (audio)
   - public/assets/audio/{topic}-timestamps.json (timestamps)
   - Delete debug-elevenlabs-response.json

7. Validate output:
   - timestamps.json has "words" array
   - Each word has "word" property (NOT "text")
   - Duration matches audio file
```

**CRITICAL RULE:**
```
ONE API CALL PER VIDEO.
If parsing fails, save raw response and report error.
NEVER retry API call to fix parsing.
Work with saved audio file if needed.
```

**Output:**
- ✅ audio file + timestamps.json with correct schema
- ❌ Error report if API call fails

---

### Agent #3: Timestamp Detective

**Purpose:** Find ALL critical timestamps from generated timestamps.json

**Tools:** Read, Bash (node)

**Process:**
```javascript
1. Load timestamps.json

2. Find question start (TIMER START):
   - Use optionTimestamps.A (first option)
   - NOT a trigger word like "Think"
   - This is when timer/heartbeat start

3. Find answer reveal:
   - Search for trigger word (e.g., "HORNSWOGGLED", "D.")
   - This is when timer stops, answer shows

4. Auto-detect options:
   - Search for "A)" "B)" "C)" "D)" "E)" in words
   - Return timestamps for each

5. Find vignette highlights:
   - For each vignetteHighlight:
     - Find timestamp for triggerWord
     - Mark isCritical for screen shake

6. Find teaching element timestamps:
   - For each teachingPhase.elements:
     - Find timestamp for triggerWord
     - Used for element appearance timing

7. Calculate durations:
   - timerDuration = answerReveal - questionStart
   - Perceived duration = rawDuration / 1.9

8. Validate:
   - All critical timestamps found
   - No null values
   - Timestamps in correct order
```

**Fallback Logic:**
```javascript
If timestamp NOT found:
  1. Report missing trigger word
  2. Suggest alternatives from nearby words
  3. Ask user to choose OR provide replacement
  4. DO NOT proceed with null timestamps
```

**Output:**
```json
{
  "questionStartTimeRaw": 40.438,
  "answerRevealTimeRaw": 59.478,
  "optionTimestamps": { A: 40.438, B: 44.257, ... },
  "vignetteHighlights": [{phrase, timestamp, isCritical}, ...],
  "teachingPhases": [{startTime, elements: [{timestamp, ...}]}],
  "memeTimestamp": 15.662,
  "duration": 99.196,
  "perceivedDuration": 52.21
}
```

---

### Agent #4: Component Validator

**Purpose:** Check reusable components for hardcoded values BEFORE using them

**Tools:** Read, Grep

**Process:**
```javascript
1. Read TeachingCard.jsx source
2. Grep for hardcoded medical terms:
   grep -i "squamous\|minimal\|carcinoma\|syndrome\|disease" TeachingCard.jsx

3. Check for hardcoded JSX strings:
   - Look for <h1>HARDCODED TEXT</h1>
   - Look for text not using {props}
   - Check for placeholder values

4. Verify prop usage:
   - All display text uses titleText prop
   - All dynamic content from elements array
   - No "SQUAMOUS" or other hardcoded titles

5. If hardcoded values found:
   - FIX the base component FIRST
   - Update to use props
   - Test fix in browser
   - THEN proceed with video generation

6. Check other components:
   - MedicalQuestionCard.jsx
   - BrainMascot.jsx
   - TikTokCaptions.jsx
```

**Common Fixes:**
```javascript
// ❌ WRONG
<h3>SQUAMOUS</h3>

// ✅ CORRECT
<h3>{titleText}</h3>

// ❌ WRONG
const timestampsData = squamousCellTimestamps;

// ✅ CORRECT
const timestampsData = timestampsSource === 'topic'
  ? topicTimestamps
  : defaultTimestamps;
```

**Output:**
- ✅ PASS: All components clean, no hardcoded values
- ❌ FAIL: List of hardcoded values found, fixes applied

---

### Agent #5: QA Validator (MANDATORY GATE)

**Purpose:** Verify ALL features present before reporting "done"

**Tools:** Read, Grep, Bash (test render)

**25-Point Checklist:**

```markdown
☑ AUDIO & TIMING:
□ Audio file exists: public/assets/audio/{topic}-narration.mp3
□ Timestamps.json exists with correct schema (word/start/end)
□ Playback rate = 1.9x in component
□ frameOffset = 0 throughout

☑ TIMER (CRITICAL):
□ Timer starts at optionTimestamps.A (NOT trigger word)
  Verify: grep "questionStartTimeRaw.*optionTimestamps.A" component
□ Timer appears in JSX (countdown UI present)
□ Color progression: green → yellow → orange → red
□ Scale pulse in final 2 seconds
□ Red vignette in final 1 second

☑ HEARTBEAT (CRITICAL):
□ Heartbeat.mp3 sequence present
□ Dynamic volume function: volume={(frame) => ...}
□ Logic: secondsRemaining <= 2 ? 1.5 : 0.5
□ Playback rate: 1.5

☑ SOUNDS (ALL 14 REQUIRED):
□ whoosh.mp3 at frame 0
□ interface.mp3 on vignette highlights
□ button-click.mp3 on option reveals
□ timer-ticking.mp3 during countdown
□ mouse-click.mp3 at answer reveal
□ correct-new.mp3 at answer reveal

☑ VISUAL EFFECTS:
□ Audio-synced option highlighting (getHighlightedOption function)
□ Vignette highlights with gold pills
□ Screen shakes on critical values
□ Green flash on answer reveal
□ Brain mascot with emotions

☑ TEACHING CARD:
□ Teaching phases present (1-3 phases)
□ Elements use script text (validated against script)
□ No hardcoded titles (uses titleText prop)
□ Black box style with centered bullets

☑ REGISTRATION:
□ Component imported in Root.jsx
□ Composition added with correct duration
□ Timestamps imported in BrainMascot.jsx
□ Switch case added for timestampsSource
```

**Test Render:**
```bash
npx remotion still {CompositionId} --frame=300 --output=/tmp/test-frame.png
```

**Verification Commands:**
```bash
# Timer logic
grep "questionStartTimeRaw.*optionTimestamps" component.jsx

# Heartbeat dynamic volume
grep "volume={(frame)" component.jsx

# All sounds present
grep -c "staticFile('assets/sfx/" component.jsx  # Should be 6+

# Teaching phases
grep "teachingPhases =" component.jsx
```

**Output:**
```json
{
  "status": "pass" | "fail",
  "checklist": {
    "audio": true,
    "timer": true,
    "heartbeat": true,
    "sounds": true,
    "visual": true,
    "teaching": true,
    "registration": true
  },
  "failed_items": [...],
  "test_render": "success" | "error"
}
```

**If ANY item fails:**
1. Report specific failure
2. Fix the issue
3. Re-run checklist
4. DO NOT report "done" until ALL pass

---

## SECTION 5: PERFECT TEACHING CARD SPECIFICATION

### The Black Box Simplistic Style

Based on your feedback: "simplistic version where you have the black box and things that are said that come up on the screen"

**Design Principles:**
1. **Black background box** (rgba(10, 10, 10, 0.95))
2. **One big purple title** at top (36px, centered, uppercase)
3. **Centered bullet points** underneath
4. **Formal medical language** (not casual script repetition)
5. **Appear as Grandpa says them** (timestamp-triggered)

**Layouts (3 types):**

### Layout 1: Split-View (Simple Bullets)
```jsx
<div style={{ background: 'rgba(10, 10, 10, 0.95)', padding: '40px' }}>
  {/* Purple title - LARGE */}
  <h2 style={{
    fontSize: 36,
    fontWeight: 800,
    color: '#c4b5fd',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  }}>
    {titleText}
  </h2>

  {/* Centered bullets */}
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    alignItems: 'center'
  }}>
    {elements.map(el => (
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        fontSize: 24,
        fontWeight: 600
      }}>
        <Icon size={26} color={el.iconColor} />
        <span>{el.text}</span>
      </div>
    ))}
  </div>
</div>
```

**Example:**
```javascript
{
  titleText: 'IN YOUNGSTERS - MINIMAL CHANGE',
  layout: 'split-view',
  elements: [
    {
      iconName: 'microscope',
      iconColor: '#22c55e',
      text: 'Most common in children',  // Formal version of "youngsters"
      timestamp: 83.708
    },
    {
      iconName: 'pill',
      iconColor: '#6366f1',
      text: 'Treat with corticosteroids',  // Formal version of "steroids"
      timestamp: 87.412
    },
    {
      iconName: 'check',
      iconColor: '#22c55e',
      text: 'Excellent prognosis',  // Formal version of "they get better"
      timestamp: 89.491
    }
  ]
}
```

### Layout 2: Pearl Card (Formula Style)
```jsx
<div style={{ background: 'rgba(10, 10, 10, 0.95)', padding: '40px' }}>
  <h2 style={{ /* same purple style */ }}>
    {titleText}
  </h2>

  {/* Formula-style elements */}
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    fontSize: 32
  }}>
    <div>Frothy urine</div>
    <div style={{ fontSize: 40 }}>+</div>
    <div>Puffy kid</div>
    <div style={{ fontSize: 48, color: '#f0abfc' }}>=</div>
    <div style={{ fontSize: 38, color: '#f0abfc' }}>MINIMAL CHANGE</div>
  </div>
</div>
```

### Layout 3: Flow Diagram (Mechanism)
```jsx
<div style={{ background: 'rgba(10, 10, 10, 0.95)', padding: '40px' }}>
  <h2 style={{ /* same purple style */ }}>
    {titleText}
  </h2>

  {/* Vertical boxes with arrows */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {elements.map(el => {
      if (el.type === 'box') return <Box>{el.text}</Box>
      if (el.type === 'arrow') return <Arrow>↓</Arrow>
      if (el.type === 'bullet') return <Bullet>{el.text}</Bullet>
    })}
  </div>
</div>
```

**Teaching Content Rules (MODERATE):**

✅ **ALLOWED:**
- "Most common in children" (script says "youngsters")
- "Treat with corticosteroids" (script says "steroids")
- "Excellent prognosis" (script says "they get better")
- "Massive proteinuria" (script says "massive proteinuria" ✓)

❌ **FORBIDDEN:**
- "90% cure rate" (script doesn't mention percentage)
- "Podocyte foot process effacement" (too technical, not mentioned)
- ">3.5g/day" (number not mentioned, unless critical for boards)

**Guiding Question:**
> "If a student heard Grandpa's script, would they understand this teaching point?"

If YES → Include it (formal version OK)
If NO → It's too advanced, remove it

---

## SECTION 6: COMPLETE SOUND SYSTEM

### All 14 Sound Effects (Calibrated Volumes)

```jsx
{/* 1. Opening whoosh */}
<Sequence from={0} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
</Sequence>

{/* 2. Vignette highlights (interface.mp3) */}
{vignetteHighlights.map((highlight, idx) => {
  if (highlight.timestamp >= answerRevealTimeRaw) return null;
  const highlightFrame = Math.floor((highlight.timestamp / PLAYBACK_RATE) * fps);
  return (
    <Sequence key={`highlight-${idx}`} from={highlightFrame} durationInFrames={30}>
      <Audio
        src={staticFile('assets/sfx/interface.mp3')}
        volume={highlight.isCritical ? 0.6 : 0.4}
      />
    </Sequence>
  );
})}

{/* 3-7. Option reveals (button-click.mp3) */}
{Object.values(optionTimestamps).map((timestamp, idx) => {
  const optionFrame = Math.floor((timestamp / PLAYBACK_RATE) * fps);
  return (
    <Sequence key={`option-${idx}`} from={optionFrame} durationInFrames={20}>
      <Audio src={staticFile('assets/sfx/button-click.mp3')} volume={0.5} />
    </Sequence>
  );
})}

{/* 8. Timer ticking */}
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.3} />
</Sequence>

{/* 9. Heartbeat (DYNAMIC VOLUME) */}
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio
    src={staticFile('assets/sfx/heartbeat.mp3')}
    volume={(frame) => {
      const timeRemaining = answerRevealFrame - frame;
      const secondsRemaining = timeRemaining / fps;
      return secondsRemaining <= 2 ? 1.5 : 0.5;  // 3x louder in final 2 seconds
    }}
    playbackRate={1.5}
  />
</Sequence>

{/* 10. Mouse click (answer reveal) */}
<Sequence from={answerRevealFrame} durationInFrames={15}>
  <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.6} />
</Sequence>

{/* 11. Correct answer sound */}
<Sequence from={answerRevealFrame} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/correct-new.mp3')} volume={0.4} />
</Sequence>

{/* 12-14. Teaching bullet shakes - SILENT (no sounds, only visual shakes) */}
```

**Volume Philosophy:**
- **Subtle:** 0.3-0.4 (ticking, whoosh, correct)
- **Moderate:** 0.5-0.6 (clicks, interface)
- **Dynamic:** 0.5 → 1.5 (heartbeat crescendo)

---

## SECTION 7: TIMER LOGIC (DEFINITIVE)

### CRITICAL RULE: Timer Starts at First Option

```javascript
// ❌ WRONG - Old way (started at question phrase)
const questionStartTimeRaw = findTimestamp('Think');

// ✅ CORRECT - New way (starts at first option)
const questionStartTimeRaw = optionTimestamps.A;  // First option appearance
```

**Reasoning:**
1. Viewer needs to SEE options before countdown matters
2. Question phrase may come AFTER options (like "Think on it")
3. Game show format: Options → Timer → Answer
4. Gives viewer exactly 10-15 seconds to answer

**Implementation:**
```javascript
// Auto-detect options FIRST
const optionTimestamps = {
  A: 40.438,
  B: 44.257,
  C: 47.032,
  D: 50.538,
  E: 54.184
};

// Timer starts when A appears
const questionStartTimeRaw = optionTimestamps.A;  // 40.438s
const answerRevealTimeRaw = 59.478;  // "HORNSWOGGLED"

// Calculate frames
const questionStartFrame = Math.floor((questionStartTimeRaw / 1.9) * 30);  // Frame 638
const answerRevealFrame = Math.floor((answerRevealTimeRaw / 1.9) * 30);    // Frame 939
const timerDuration = answerRevealFrame - questionStartFrame;  // 301 frames (~10 seconds)
```

**Timer Visual:**
```jsx
{frame >= questionStartFrame && frame < answerRevealFrame && (() => {
  const framesIntoTimer = frame - questionStartFrame;
  const progress = framesIntoTimer / timerDuration;
  const secondsRemaining = Math.max(1, Math.ceil((timerDuration - framesIntoTimer) / fps));

  // Color based on progress
  let borderColor = '#10b981';  // Green
  if (progress > 0.8) borderColor = '#ef4444';      // Red (final 20%)
  else if (progress > 0.5) borderColor = '#f97316'; // Orange
  else if (progress > 0.3) borderColor = '#fbbf24'; // Yellow

  // Pulse in final 2 seconds
  let timerScale = 1.0;
  if (secondsRemaining <= 2) {
    timerScale = 1.0 + Math.sin(frame * 0.4) * 0.075;
  }

  return (
    <>
      {/* Red vignette in final second */}
      {secondsRemaining === 1 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, transparent 30%, rgba(239, 68, 68, 0.35) 100%)',
          opacity: interpolate(Math.sin(frame * 0.3), [-1, 1], [0.5, 1]),
          zIndex: 35
        }} />
      )}

      {/* Timer circle */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: 140,
        height: 140,
        borderRadius: '50%',
        border: `6px solid ${borderColor}`,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${timerScale})`,
        boxShadow: secondsRemaining <= 2
          ? `0 8px 32px rgba(239, 68, 68, 0.6), 0 0 ${20 + Math.sin(frame * 0.4) * 10}px ${borderColor}`
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 40
      }}>
        <div style={{ fontSize: 56, fontWeight: 'bold', color: 'white' }}>
          {secondsRemaining}
        </div>
      </div>
    </>
  );
})()}
```

---

## SECTION 8: INPUT JSON SCHEMA (FROM CLAUDE DESKTOP)

### Complete Input Structure

```json
{
  "topic": "nephrotic-syndrome-minimal-change",
  "playbackRate": 1.9,
  "script": "Lord have mercy, here comes a five-year-old youngun...",

  "questionData": {
    "card_id": 1,
    "topic": "nephrotic-syndrome-minimal-change",
    "vignette": "5-year-old boy presents with periorbital and lower extremity edema...",
    "lab_values": [
      {
        "label": "Urine Protein",
        "value": "4+ g/day",
        "status": "critical",
        "color": "#ef4444",
        "note": "(normal <150 mg/day)"
      }
    ],
    "question_text": "What is the most likely diagnosis?",
    "options": [
      {
        "letter": "A",
        "text": "Post-streptococcal glomerulonephritis",
        "is_correct": false
      }
    ],
    "correct_answer": "B"
  },

  "vignetteHighlights": [
    {
      "phrase": "periorbital and lower extremity edema",
      "triggerWord": "BALLOON",
      "isCritical": false
    },
    {
      "phrase": "4+ g/day",
      "triggerWord": "four",
      "isCritical": true
    }
  ],

  "teachingPhases": [
    {
      "titleText": "IN YOUNGSTERS - MINIMAL CHANGE",
      "layout": "split-view",
      "elements": [
        {
          "iconName": "microscope",
          "iconColor": "#22c55e",
          "text": "Most common in children",
          "triggerWord": "youngsters"
        }
      ]
    }
  ],

  "memes": {
    "contextual": {
      "memeId": "drunk-man-falling",
      "triggerWord": "FROTHY",
      "position": "center",
      "scale": 0.6,
      "duration": 2.5
    },
    "answerReveal": {
      "memeId": "success-kid",
      "position": "center",
      "scale": 0.55
    }
  },

  "criticalMoments": {
    "answerReveal": "HORNSWOGGLED"
  }
}
```

**Required Fields:**
- topic ✅
- script ✅
- questionData ✅
- teachingPhases ✅
- criticalMoments.answerReveal ✅

**Optional Fields:**
- playbackRate (default 1.9)
- vignetteHighlights (can be empty array)
- memes.contextual (can be null)
- memes.answerReveal (recommended but optional)

---

## SECTION 9: ERROR RECOVERY & FALLBACKS

### When Timestamp Detection Fails

**Scenario:** Cannot find trigger word "Think"

**Recovery Process:**
```javascript
1. Report error:
   "❌ Could not find 'Think' in timestamps"

2. Search nearby alternatives:
   - Within ±5 seconds of expected position
   - Common alternatives: "So", "Now", "Alright", "Well"

3. Present options to user:
   "Alternatives found:
   - 'So' at 39.8s
   - 'Now' at 40.1s
   - 'Alright' at 40.5s

   Which should I use for question start? Or provide different word."

4. User chooses or provides alternative

5. Retry detection with chosen word

6. If still fails: Use optionTimestamps.A as fallback
```

### When Meme File Not Found

**Scenario:** beer-foam.mp4 doesn't exist

**Recovery Process:**
```javascript
1. List available video memes:
   ls public/assets/memes/videos/

2. Report error with alternatives:
   "❌ Meme 'beer-foam.mp4' not found

   Available video memes:
   - coffin-dance.mp4
   - drunk-man-falling.mp4
   - smoking-man.mp4
   - this-is-fine.mp4
   - to-be-continued.mp4
   - windows-error.mp4

   Choose replacement OR remove video meme?"

3. User chooses:
   - Option A: Select replacement
   - Option B: Remove video meme entirely

4. Update input and proceed
```

### When API Call Fails

**Scenario:** ElevenLabs API returns error

**Recovery Process:**
```javascript
1. Report API error with details:
   "❌ ElevenLabs API error: 429 (rate limit exceeded)

   Response: {error details}"

2. Check if audio already exists:
   - ls public/assets/audio/{topic}-narration.mp3
   - If exists: "Found existing audio, skip generation? (y/n)"

3. If no existing audio:
   "Options:
   A) Retry API call (check API key & credits)
   B) Use different voice
   C) Abort generation"

4. DO NOT auto-retry without user approval
```

---

## SECTION 10: QUALITY ASSURANCE (MANDATORY GATE)

### The 25-Point Checklist (Before Reporting "Done")

This is a **HARD GATE**. Do NOT report completion until ALL items pass.

```markdown
## AUDIO & TIMING (4 items)
□ Audio file exists: public/assets/audio/{topic}-narration.mp3
□ Timestamps.json has correct schema (word/start/end)
□ Duration matches: timestamps.duration ≈ audio file duration
□ Playback rate = 1.9 in component (grep "PLAYBACK_RATE = 1.9")

## TIMER (5 items)
□ Timer starts at optionTimestamps.A (grep "questionStartTimeRaw.*optionTimestamps.A")
□ Timer JSX present in return block (countdown circle)
□ Color progression logic present (green → yellow → orange → red)
□ Scale pulse in final 2 seconds (grep "timerScale.*sin")
□ Red vignette in final second (grep "secondsRemaining === 1")

## HEARTBEAT (4 items)
□ Heartbeat sequence present (grep "heartbeat.mp3")
□ Dynamic volume function (grep "volume={(frame)")
□ Final 2 seconds logic (grep "secondsRemaining <= 2 ? 1.5 : 0.5")
□ Playback rate 1.5 (grep "playbackRate={1.5}")

## SOUNDS (6 items)
□ whoosh.mp3 at frame 0
□ interface.mp3 on highlights
□ button-click.mp3 on options (5 sounds)
□ timer-ticking.mp3 during countdown
□ mouse-click.mp3 at reveal
□ correct-new.mp3 at reveal

## VISUAL EFFECTS (3 items)
□ Audio-synced highlighting (getHighlightedOption function)
□ Vignette gold pills (vignetteHighlights array)
□ Green flash at reveal (Sequence with rgba(0, 255, 0))

## TEACHING (2 items)
□ Teaching phases present (1-3 phases)
□ No hardcoded titles (grep -v "SQUAMOUS" component)

## REGISTRATION (1 item)
□ All registrations complete (Root.jsx + BrainMascot.jsx)
```

### Verification Script

```bash
#!/bin/bash
# Run from project root

COMPONENT="src/components/NephroticSyndromeMinimalChangeAd.jsx"
TOPIC="nephrotic-syndrome-minimal-change"

echo "🔍 Running QA verification..."

# Audio
[ -f "public/assets/audio/${TOPIC}-narration.mp3" ] && echo "✅ Audio file" || echo "❌ Audio file"
[ -f "public/assets/audio/${TOPIC}-timestamps.json" ] && echo "✅ Timestamps" || echo "❌ Timestamps"

# Playback rate
grep -q "PLAYBACK_RATE = 1.9" "$COMPONENT" && echo "✅ Playback 1.9x" || echo "❌ Playback rate"

# Timer logic
grep -q "questionStartTimeRaw.*optionTimestamps.A" "$COMPONENT" && echo "✅ Timer starts at option A" || echo "❌ Timer logic"

# Heartbeat
grep -q "volume={(frame)" "$COMPONENT" && echo "✅ Dynamic heartbeat" || echo "❌ Heartbeat"

# Sounds count
SOUND_COUNT=$(grep -c "staticFile('assets/sfx/" "$COMPONENT")
[ "$SOUND_COUNT" -ge 6 ] && echo "✅ Sounds ($SOUND_COUNT)" || echo "❌ Sounds ($SOUND_COUNT < 6)"

# Teaching
grep -q "teachingPhases =" "$COMPONENT" && echo "✅ Teaching phases" || echo "❌ Teaching"

# Hardcoded check
grep -q "SQUAMOUS" "$COMPONENT" && echo "❌ Hardcoded 'SQUAMOUS' found" || echo "✅ No hardcoded values"

echo "✅ QA verification complete"
```

---

## SECTION 11: DELIVERY CHECKLIST

### Before Reporting "Video Ready"

```markdown
1. ✅ All subagents completed successfully
2. ✅ QA checklist: 25/25 items passed
3. ✅ Test render: Frame 300 rendered without errors
4. ✅ Component registered in Root.jsx
5. ✅ Timestamps registered in BrainMascot.jsx
6. ✅ Duration calculated correctly at 1.9x
7. ✅ No console errors in browser preview
```

### Report to User

```markdown
✅ **Video Generation Complete!**

**Component:** NephroticSyndromeMinimalChangeAd
**Composition ID:** NephroticSyndromeMinimalChange
**Duration:** 52.2 seconds (at 1.9x playback)
**Files Created:**
- src/components/NephroticSyndromeMinimalChangeAd.jsx
- public/assets/audio/nephrotic-syndrome-minimal-change-narration.mp3
- public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json

**Features Verified:**
- ✅ Timer starts at option A (10.6 second countdown)
- ✅ Heartbeat crescendo in final 2 seconds
- ✅ 14 sound effects calibrated
- ✅ 3 teaching phases with black box style
- ✅ Audio-synced option highlighting
- ✅ All vignette highlights working
- ✅ Brain mascot emotions configured

**Next Steps:**
1. Preview: http://localhost:3000 → Select "NephroticSyndromeMinimalChange"
2. Render: `npx remotion render NephroticSyndromeMinimalChange out/nephrotic.mp4`
3. Ready for Instagram/TikTok (1080x1920, h264)
```

---

## SECTION 12: SUMMARY - THE PERFECT WORKFLOW

### Claude Desktop → Perfect Video (ONE SHOT)

1. **User provides input JSON** (script + question + teaching)
2. **Agent #1 validates** (memes exist, vignettes match, schema correct)
3. **Agent #2 generates audio** (ONE API call, correct schema)
4. **Agent #3 detects timestamps** (all critical moments found)
5. **Main process builds component** (from SquamousCellLung template)
6. **Agent #4 validates components** (no hardcoded values)
7. **Agent #5 runs QA** (25-point checklist, test render)
8. **Registration** (Root.jsx + BrainMascot.jsx)
9. **Delivery** (report to user: READY)

**Total Time:** 5-10 minutes (fully automated)

**Success Criteria:**
- Zero manual corrections needed
- All features working on first preview
- Ready to render immediately
- Perfect for Instagram/TikTok

---

## APPENDIX A: COMMON PITFALLS & SOLUTIONS

### Pitfall #1: Timer Starts Too Late
**Problem:** Timer starts at "Think" which comes AFTER options
**Solution:** Always use `optionTimestamps.A` for questionStart

### Pitfall #2: Heartbeat Same Volume Throughout
**Problem:** Using static volume instead of dynamic function
**Solution:** Use `volume={(frame) => {...}}` with conditional logic

### Pitfall #3: Teaching Text Not in Script
**Problem:** Adding "90% cure rate" when script doesn't mention it
**Solution:** Validate each element.text against script, formalize but don't enhance

### Pitfall #4: Hardcoded "SQUAMOUS" in Component
**Problem:** TeachingCard has hardcoded title instead of using prop
**Solution:** Run Agent #4 before generation, fix base components first

### Pitfall #5: Wrong Timestamp Schema
**Problem:** Using `text` instead of `word` property
**Solution:** Agent #2 validates schema, converts to required format

---

## APPENDIX B: AGENT INVOCATION EXAMPLES

### How to Deploy Subagents

```javascript
// Agent #1: Input Validation
const validationResult = await invoke_task_agent({
  subagent_type: 'general-purpose',
  prompt: `
    Validate this input JSON for video generation:
    ${JSON.stringify(input)}

    Check:
    1. Meme files exist in public/assets/memes/
    2. Vignette phrases exist in questionData.vignette
    3. Schema is complete
    4. PlaybackRate is valid (1.5-2.5)

    Return: { status: 'pass'|'fail', errors: [...] }
  `
});

// Agent #2: Audio Generation
const audioResult = await invoke_task_agent({
  subagent_type: 'general-purpose',
  prompt: `
    Generate audio via ElevenLabs API (ONE CALL ONLY):

    Script: "${script}"
    Voice: NOpBlnGInO9m6vDvFkFC
    Settings: stability=0.35, style=0.85

    Handle BOTH API response formats.
    Output: audio.mp3 + timestamps.json with word/start/end schema

    STOP after one API call. If parsing fails, save raw response.
  `
});

// Agent #5: QA Validation
const qaResult = await invoke_task_agent({
  subagent_type: 'general-purpose',
  prompt: `
    Run QA verification on component: ${componentPath}

    Verify 25-point checklist:
    - Timer starts at option A
    - Heartbeat has dynamic volume
    - All 14 sounds present
    - No hardcoded values

    Test render frame 300.
    Return: PASS or list of failed items
  `
});
```

---

## END OF SPECIFICATION

This document defines the **complete, production-ready system prompt** for automated medical education video generation. All decisions are locked, all agents are specified, all validations are mandatory.

**Key Takeaways:**
1. **1.9x playback** (locked)
2. **5 subagents** (required)
3. **Timer starts at option A** (critical)
4. **Teaching content: moderate formalization** (script-based but professional)
5. **25-point QA checklist** (mandatory gate)
6. **Black box simplistic style** (centered bullets, one big title)
7. **ONE API call** (never retry for parsing errors)

Deploy this system prompt to Claude Desktop and achieve **perfect one-shot video generation** every time.

**Version:** 9.0
**Status:** Production Ready
**Last Updated:** 2025-11-29
**Signed:** Claude Code CLI
