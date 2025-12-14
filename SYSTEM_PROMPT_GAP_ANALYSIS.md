# System Prompt V11.0 - Gap Analysis Report
## Critical Issues That Required Manual Correction

**Analysis Date:** 2024-12-07
**Analyzed Version:** System Prompt V11.0 (Specialist Sub-Agent Architecture)
**Test Case:** Epidural Hematoma Video Generation

---

## Executive Summary

The system prompt V11.0 successfully implements ~85% of the video generation pipeline, but **5 critical gaps** caused failures that required manual intervention. These gaps fall into 3 categories:

1. **Missing Domain Knowledge** - Relationships between components not documented
2. **Incomplete Validation Rules** - Timestamps validated individually, not holistically
3. **Ambiguous Specifications** - Multiple valid interpretations of positioning requirements

**Impact:** First render was NOT perfect. Required 5 manual corrections before achieving production quality.

---

## GAP 1: Clinical Findings Box Logic (CRITICAL)

### What Went Wrong
**Observed:** Clinical findings boxes did not appear around lab values in the MedicalQuestionCard
**Root Cause:** vignetteHighlights did not match any lab_values

### System Prompt Claims
> **Section 10 - Sub-Agent 5C:**
> ```jsx
> // Generate FloatingHighlight for each vignette highlight
> {vignetteTimestamps.map((highlight, idx) => (
>   <FloatingHighlight ... />
> ))}
> ```

> **Section 4 - Input Schema:**
> ```json
> "vignetteHighlights": [
>   { "phrase": "104°F", "triggerWord": "ONE-OH-FOUR", ... }
> ]
> ```

### What's MISSING
The prompt **never explains** that:
1. **MedicalQuestionCard has SEPARATE logic** for lab value boxes
2. Lab value boxes appear when `lab.value.includes(highlight.phrase)` OR `highlight.phrase.includes(lab.value)`
3. FloatingHighlight overlays are SEPARATE from Clinical Findings boxes
4. You need vignetteHighlights that match BOTH:
   - Phrases in the vignette text (for FloatingHighlight)
   - Values in lab_values array (for Clinical Findings boxes)

### Example of Failure
```javascript
// What the prompt generated:
vignetteHighlights: [
  { phrase: "unconscious for approximately 30 seconds", timestamp: 10.159 },
  { phrase: "lethargic with slurred speech", timestamp: 29.304 }
]

// Lab values in questionData:
lab_values: [
  { label: "Heart rate", value: "52 bpm" },  // NO MATCH
  { label: "Left pupil", value: "6mm" }       // NO MATCH
]

// Result: FloatingHighlights appeared, but Clinical Findings boxes did NOT
```

### What Was Actually Needed
```javascript
vignetteHighlights: [
  { phrase: "unconscious for approximately 30 seconds", timestamp: 10.159 },
  { phrase: "lethargic with slurred speech", timestamp: 29.304 },
  // ADDED for Clinical Findings boxes:
  { phrase: "6mm", timestamp: 33.925 },        // Matches lab value
  { phrase: "52 bpm", timestamp: 38.848 },     // Matches lab value
  { phrase: "180/100", timestamp: 40.194 },    // Matches lab value
  { phrase: "Lens-shaped", timestamp: 45.709 } // Matches lab value
]
```

### Recommended Fix
**Add to Section 8 (Agent 3 - Timestamp Detective):**

```xml
<lab_value_matching>
  <requirement>CRITICAL - Clinical Findings boxes depend on this</requirement>

  <logic>
    MedicalQuestionCard draws animated boxes around lab values when:
    vignetteHighlights contains a phrase that matches the lab value

    Matching: lab.value.includes(highlight.phrase) || highlight.phrase.includes(lab.value)
  </logic>

  <detection_strategy>
    For each lab_value in questionData.lab_values:
      1. Extract key terms: "52 bpm" → ["52", "bpm"]
      2. Search for those terms in script around timestamp of related narrative
      3. If narrator says "heart's SLOW" but lab shows "52 bpm":
         - Find timestamp of "SLOW" (e.g., 38.848s)
         - Add vignetteHighlight: { phrase: "52 bpm", timestamp: 38.848 }
      4. Even if exact value not spoken, create highlight at narrative timestamp
  </detection_strategy>

  <validation>
    MUST validate: Each lab_value with status "critical" or "elevated"
    has at least one matching vignetteHighlight phrase

    WARNING if unmatched: "Lab value '{value}' has no matching highlight - box will not appear"
  </validation>
</lab_value_matching>
```

**Severity:** CRITICAL - Directly impacts educational value (students can't see which values are important)

---

## GAP 2: Teaching Phase Timestamp Validation (CRITICAL)

### What Went Wrong
**Observed:** In teaching phase "WHY THIS KILLS SO FAST", 3 bullets appeared simultaneously instead of sequentially
**Root Cause:** Bullet timestamps (48.217s, 53.418s) were BEFORE the phase even started (108.217s)

### System Prompt Claims
> **Section 8 - Agent 3:**
> ```xml
> <timestamp name="teachingBullets">
>   <pattern>Find triggerWord for each bullet within each phase</pattern>
>   <validation>All bullet triggers must exist</validation>
> </timestamp>
> ```

### What's MISSING
The validation only checks if trigger words **exist**, not if they're in the **correct temporal range**.

**No validation for:**
1. Bullets must have timestamps >= phase.startTime
2. Bullets must have timestamps < nextPhase.startTime (or end of video)
3. Bullets must be sequential within a phase
4. Bullet timestamps can't be from a previous phase's timeframe

### Example of Failure
```javascript
// Phase 2 generated:
{
  titleText: 'WHY THIS KILLS SO FAST',
  startTime: 108.217,  // Phase starts here
  elements: [
    { text: 'HIGH PRESSURE...', timestamp: 108.217 },  // ✓ Correct
    { text: 'Between skull...', timestamp: 48.217 },   // ❌ BEFORE phase starts!
    { text: 'Brain compressed...', timestamp: 53.418 }, // ❌ BEFORE phase starts!
    { text: 'Minutes from...', timestamp: 119.432 }     // ✓ Correct
  ]
}

// Result: When phase 2 appears at 108.217s, the code tries to render bullets
// with timestamps at 48s and 53s, which already passed → all appear at once
```

### What Was Actually Needed
```javascript
{
  titleText: 'WHY THIS KILLS SO FAST',
  startTime: 108.217,
  elements: [
    { text: 'HIGH PRESSURE...', timestamp: 109.03 },   // After start ✓
    { text: 'Lucid interval...', timestamp: 111.491 }, // Sequential ✓
    { text: 'Brain PANCAKED...', timestamp: 114.672 }, // Sequential ✓
    { text: 'MINUTES before...', timestamp: 119.432 }  // Sequential ✓
  ]
}
```

### Recommended Fix
**Add to Section 8 (Agent 3 - Timestamp Detective):**

```xml
<teaching_timestamp_validation>
  <sequential_validation>
    For each teaching phase:
      1. Collect all bullet timestamps
      2. VALIDATE: All timestamps >= phase.startTime
      3. VALIDATE: All timestamps < nextPhase.startTime (or video end)
      4. VALIDATE: Timestamps are monotonically increasing
      5. FAIL if any bullet timestamp is outside phase temporal bounds
  </sequential_validation>

  <error_reporting>
    If validation fails:
      ERROR: "Phase '{titleText}' has bullets outside temporal bounds:
        - Phase starts: {startTime}s
        - Next phase: {nextStartTime}s
        - Bullet '{text}' at {timestamp}s is INVALID

        Likely cause: Trigger word found in WRONG section of script.
        Solution: Search for trigger word AFTER {startTime}s"
  </error_reporting>

  <auto_correction>
    If trigger word appears multiple times:
      - Find occurrence AFTER phase.startTime
      - Find occurrence BEFORE next phase (if exists)
      - Use the one that's temporally closest to expected position
  </auto_correction>
</teaching_timestamp_validation>
```

**Add to Section 11 (Agent 6 - QA Validator):**

```markdown
## TEACHING TIMESTAMPS (NEW - 2 items)
□ All teaching bullets have timestamps AFTER their phase startTime
□ All teaching bullets are sequential within each phase (no time travel)
```

**Severity:** CRITICAL - Breaks the sequential reveal animation, confuses learners

---

## GAP 3: Timer Positioning Ambiguity (HIGH)

### What Went Wrong
**Observed:** Timer was initially placed on the LEFT side of the brain, user wanted RIGHT side
**Manual Fix:** Changed `left: 60` to `right: 60`

### System Prompt Claims
> **Section 10 - Sub-Agent 5A:**
> ```javascript
> // Timer positioning (next to brain, to the right)
> const TIMER_POSITION = {
>   top: BRAIN_POSITION.top + 140,
>   left: brainRightEdge + 30,  // 30px padding from brain
>   zIndex: 90
> };
> ```

### What's CONFUSING
The comment says "to the right" but the implementation uses `left: brainRightEdge + 30`.

**Interpretation ambiguity:**
- "to the right" could mean: `right: 60` (from right edge of screen)
- "to the right" could mean: `left: 745` (calculated position right of brain)

The first implementation generated `left: 60` which placed it on the LEFT side of the screen.

### What Was Actually Needed
```javascript
// Unambiguous specification:
const TIMER_POSITION = {
  top: 240,
  right: 60,  // 60px from RIGHT edge of screen (TikTok safe zone)
  zIndex: 90
};
```

### Recommended Fix
**Replace in Section 10 - Sub-Agent 5A:**

```xml
<positioning_constants>
```javascript
// TIMER POSITIONING - RIGHT SIDE FOR TIKTOK VISIBILITY
// TikTok mobile UI obscures top-right corner
// Timer must be:
//   - Below top safe zone (top >= 120px)
//   - On RIGHT side of screen (using 'right' property, NOT calculated 'left')
//   - Vertically aligned with brain mascot for visual balance

const BRAIN_VERTICAL_CENTER = BRAIN_POSITION.top + (BRAIN_POSITION.size / 2); // ~255px

const TIMER_POSITION = {
  top: 240,      // Just below brain center, within safe zone
  right: 60,     // UNAMBIGUOUS: 60px from right edge of screen
  zIndex: 90
};

// DO NOT USE: left: brainRightEdge + 30 (this caused left-side positioning bug)
```
</positioning_constants>
```

**Severity:** HIGH - Affects TikTok visibility, but doesn't break functionality

---

## GAP 4: BrandLogo Integration vs Standalone (MEDIUM)

### What Went Wrong
**Observed:** BrandLogo was initially rendered as standalone AbsoluteFill, not integrated into MedicalQuestionCard
**Manual Fix:** Removed standalone BrandLogo, added logo div inside MedicalQuestionCard header

### System Prompt Claims
> **Section 3 - Mandatory Features:**
> ```xml
> <feature name="BrandLogo">
>   SynapticRecall.ai in question card top-left, z-index 100
> </feature>
> ```

> **Section 10 - Sub-Agent 5A:**
> ```javascript
> const BRAND_LOGO_POSITION = {
>   top: 420,  // Inside question card safe zone
>   left: 40,  // Left padding within card
>   zIndex: 100
> };
> ```

### What's MISSING
The prompt says "in question card" but the template in Sub-Agent 5E shows:

```jsx
{/* ===== SYNAPTIC RECALL BRANDING ===== */}
<div style={{ position: 'absolute', top: {BRAND_LOGO_TOP}, ... }}>
  <BrandLogo size="medium" opacity={0.9} />
</div>
```

This renders BrandLogo as a **separate absolute element**, not **inside** the MedicalQuestionCard component.

**Two interpretations:**
1. Standalone BrandLogo positioned to visually appear over the card
2. Logo integrated into MedicalQuestionCard's DOM structure

### What Was Actually Needed
**Modify MedicalQuestionCard.jsx** to include logo in header:

```jsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  {/* Logo on left */}
  <div style={{ ... }}>SynapticRecall.ai</div>

  {/* Question title centered */}
  <h3>🩺 Practice Question #1</h3>

  {/* Spacer for balance */}
  <div style={{ width: 140 }}></div>
</div>
```

### Recommended Fix
**Add to Section 10 - Sub-Agent 5E:**

```xml
<brand_logo_integration>
  <requirement>
    BrandLogo must be INSIDE MedicalQuestionCard component, not a separate overlay.
    This ensures it moves with the card and respects card layout.
  </requirement>

  <implementation>
    1. DO NOT render standalone BrandLogo component in main {Topic}Ad.jsx
    2. INSTEAD: Modify MedicalQuestionCard header to include logo
    3. Pass showLogo={true} prop to MedicalQuestionCard
    4. MedicalQuestionCard renders logo in header flexbox layout:
       - Left: Logo text
       - Center: Practice Question title
       - Right: Spacer (for visual balance)
  </implementation>

  <code_example>
```jsx
// In {Topic}Ad.jsx - DO NOT include this:
// <BrandLogo ... /> ❌

// In MedicalQuestionCard.jsx header:
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 24
}}>
  <div style={{
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #9333ea, #db2777)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}>
    SynapticRecall.ai
  </div>

  <h3 style={{ flex: 1, textAlign: 'center', ... }}>
    🩺 Practice Question #{questionData.card_id}
  </h3>

  <div style={{ width: 140 }}></div>
</div>
```
  </code_example>
</brand_logo_integration>
```

**Severity:** MEDIUM - Functional but not optimal DOM structure

---

## GAP 5: TikTokCaptions Font Size Parameter (MEDIUM)

### What Went Wrong
**Observed:** Captions were too large and positioned too high
**Manual Fix:** Added `fontSize={36}` prop and changed `bottomOffset` from 200 to 140

### System Prompt Claims
> **Section 10 - Sub-Agent 5E - Component Template:**
> ```jsx
> <TikTokCaptions
>   words={timestampsData.words}
>   playbackRate={PLAYBACK_RATE}
>   frameOffset={0}
>   bottomOffset={320}
> />
> ```

### What's MISSING
1. **No fontSize prop** in the template (but TikTokCaptions component supports it)
2. **Conflicting bottomOffset values**: Template shows 320, but Gap Analysis example used 200
3. No guidance on when to adjust fontSize (screen density, caption length, etc.)

### What Was Actually Needed
```jsx
<TikTokCaptions
  words={timestampsData.words}
  playbackRate={PLAYBACK_RATE}
  frameOffset={0}
  bottomOffset={140}  // Moved down for TikTok UI
  fontSize={36}        // Smaller for better readability on mobile
/>
```

### Recommended Fix
**Update Section 10 - Sub-Agent 5E - Component Template:**

```xml
<captions_configuration>
  <mobile_optimization>
    TikTok/Instagram mobile UI requires caption adjustments:

    1. bottomOffset: 140px
       - Accounts for mobile bottom UI (home, like, share buttons)
       - Must be above bottom safe zone (180px) but not too high

    2. fontSize: 36px (default is 44px)
       - Mobile screens benefit from slightly smaller text
       - More words fit on screen without wrapping
       - Still readable at TikTok typical viewing distance

    3. If script has long medical terms (>15 chars), reduce to fontSize: 32
  </mobile_optimization>

  <template>
```jsx
{/* ===== CAPTIONS - MOBILE OPTIMIZED ===== */}
<TikTokCaptions
  words={timestampsData.words}
  playbackRate={PLAYBACK_RATE}
  frameOffset={0}
  bottomOffset={140}  // Mobile-safe position
  fontSize={36}       // Mobile-optimized size (reduce to 32 for long terms)
/>
```
  </template>
</captions_configuration>
```

**Severity:** MEDIUM - Affects readability but doesn't break video

---

## GAP 6: Playback Rate Rigidity (LOW - DESIGN DECISION)

### What Went Wrong
**Observed:** User requested video be made "a little bit faster"
**Manual Fix:** Changed PLAYBACK_RATE from 1.9 to 2.1

### System Prompt Claims
> **Section 1 - Non-Negotiables:**
> ```xml
> <non_negotiables>
>   - Playback rate: 1.9x (LOCKED, never changes)
> </non_negotiables>
> ```

> **Section 14 - Critical Reminders:**
> ```xml
> <reminder priority="CRITICAL">Playback rate: 1.9x (LOCKED, never changes)</reminder>
> ```

### Issue
The prompt treats playback rate as **immutable**, but real-world usage shows this should be **tunable per video**.

**Why 1.9x isn't always optimal:**
- Some topics are naturally denser (epidural hematoma: lots of pathophysiology)
- Some narrators speak faster/slower even with same voice settings
- User preference: "Make it snappier" vs "Give them time to read"

### Recommended Fix
**Replace in Section 1:**

```xml
<tunable_parameters>
  <playback_rate>
    <default>1.9</default>
    <range>1.7 - 2.3</range>
    <guidance>
      Adjust based on:
      - Script density: Complex pathophys → 1.8x, Simple diagnosis → 2.1x
      - Narrator pace: If audio sounds rushed → lower, too slow → increase
      - User feedback: "Too fast" → -0.2, "Too slow" → +0.2
    </guidance>
    <validation>
      - Must be > 1.5 (below this, viral pacing is lost)
      - Must be < 2.5 (above this, comprehension suffers)
    </validation>
  </playback_rate>
</tunable_parameters>
```

**Remove from non-negotiables**, add to **recommended defaults**

**Severity:** LOW - Design philosophy, not a bug

---

## Summary of Recommended Changes

### New Validation Rules (Agent 3 + Agent 6)
1. **Lab Value Matching**: Validate vignetteHighlights cover all critical/elevated lab_values
2. **Teaching Temporal Bounds**: Validate bullet timestamps are within phase time ranges
3. **Teaching Sequential**: Validate bullets are monotonically increasing within phase

### Clarified Specifications (Sub-Agent 5A + 5E)
1. **Timer Position**: Use `right: 60`, not calculated `left` value
2. **BrandLogo Integration**: Inside MedicalQuestionCard DOM, not standalone
3. **Caption Sizing**: Always include fontSize parameter in template

### Enhanced Error Reporting (Agent 3)
1. Report unmatched lab values
2. Report out-of-bounds teaching timestamps
3. Suggest timestamp corrections

### Documentation Improvements
1. Add MedicalQuestionCard behavior explanation
2. Add teaching phase temporal constraint explanation
3. Add mobile optimization guidelines

---

## Impact Assessment

### Before Analysis (V11.0)
- **First Render Success Rate:** ~40% (3/5 major features broken)
- **Manual Corrections Needed:** 5
- **Time to Production:** ~30 minutes (generation + fixes)

### After Implementing Fixes (Projected V11.1)
- **First Render Success Rate:** ~95% (only tuning adjustments)
- **Manual Corrections Needed:** 0-1 (cosmetic only)
- **Time to Production:** ~5 minutes (generation + preview)

---

## Priority Ranking

1. **CRITICAL** - GAP 1: Lab Value Matching (breaks educational value)
2. **CRITICAL** - GAP 2: Teaching Timestamp Validation (breaks sequential animation)
3. **HIGH** - GAP 3: Timer Positioning (TikTok visibility issue)
4. **MEDIUM** - GAP 4: BrandLogo Integration (structural cleanliness)
5. **MEDIUM** - GAP 5: Caption Font Size (readability optimization)
6. **LOW** - GAP 6: Playback Rate Flexibility (design philosophy)

---

## Conclusion

The Specialist Sub-Agent architecture in V11.0 is **fundamentally sound**, but suffers from:

1. **Incomplete domain knowledge** about component interactions
2. **Weak validation** that checks individual constraints but not holistic correctness
3. **Ambiguous specifications** that allow multiple valid interpretations

**Key Insight:** The agents are GOOD at executing instructions, but the instructions themselves have gaps in **inter-component relationships** and **temporal constraints**.

**Recommended Action:** Implement Gaps 1-3 immediately (CRITICAL/HIGH), consider 4-5 for next iteration (MEDIUM).
