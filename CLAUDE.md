# CLAUDE.md - Synaptic Recall Medical Education Videos

## Project Overview

Synaptic Recall creates viral medical education videos for TikTok/Reels/Shorts. Each video follows a proven format:

1. **Hook** (0-5 sec) - Emotional tension that stops the scroll
2. **Question** (5-25 sec) - USMLE-style case with options appearing one-by-one
3. **Answer Reveal** (25-30 sec) - Dramatic correct answer with celebration
4. **Mechanism Teaching** (30-55 sec) - Scene-based animated explanation
5. **Clinical Pearl** (55-60 sec) - Dosing/timing that saves the exam

**Target Audience:** Pre-med and medical students (MS1-MS4), Step 1/2 prep

**Format:** 1080x1920 (9:16 vertical), 30fps, **45-60 seconds total**

**CRITICAL:** Always use the `remotion-medical-animation` skill when building mechanism diagrams.

---

## Hook Psychology (THE MOST CRITICAL PART)

The hook determines if someone watches or scrolls. You have **3 seconds** to create emotional tension that MUST be resolved by watching.

### Who's Watching?

Medical students who are:
- **Anxious** about exams (Step 1/2, shelf exams)
- **Overwhelmed** by the amount of material
- **Insecure** about their clinical knowledge
- **Competitive** with their peers
- **Sleep-deprived** and need quick, memorable content

### Hook Triggers That Work

**1. FEAR - "You're about to kill your patient"**
```
"This patient has 45 SECONDS to live and I GUARANTEE you're about to pick the wrong answer"
"You give the wrong drug here? She's DEAD. Let's see if you know what to do"
"This is the question that FAILS students on Step 1. Let's see if you're one of them"
```

**2. SHAME - "Everyone knows this except you"**
```
"If you get this wrong, you have NO BUSINESS being in medicine"
"This is FIRST YEAR stuff and I STILL see residents mess it up"
"I'm gonna expose how many of you MORONS don't know basic pharmacology"
```

**3. URGENCY - "Clock is ticking"**
```
"You've got 10 seconds. Heart rate: 32. BP: 70/40. What do you do? GO!"
"The liver is DYING right now. Every second you hesitate, more cells die"
"This patient coded 30 seconds ago. What's your next move?"
```

**4. CURIOSITY GAP - "Wait, that doesn't make sense"**
```
"She feels FINE... but she'll be DEAD in 72 hours. Here's why"
"The obvious answer will KILL her. Here's the trap"
"Why does giving glucose to this patient cause BRAIN DAMAGE?"
```

**5. CHALLENGE - "Prove you're not an idiot"**
```
"Only 23% of medical students get this right. Let's see what you got"
"I'm about to HUMBLE every person watching this video"
"Think you're ready for boards? Prove it"
```

### Hook Formula Template

```
[EMOTIONAL TRIGGER] + [STAKES] + [IMPLICIT CHALLENGE]

Example:
"This woman just CHUGGED an entire bottle of propranolol" [situation]
"Her heart rate is THIRTY-TWO" [stakes - she's dying]
"And I GUARANTEE half of you are about to pick the WRONG answer" [challenge]
```

### What Makes Hooks FAIL

- Starting with "Alright, pop quiz..." (boring, no tension)
- Too much medical setup before the danger (get to stakes FAST)
- No emotional component (just facts = scroll)
- Being nice (viewers need to feel attacked/challenged)

---

## The Dopamine Ladder Framework

The Dopamine Ladder is a 6-level psychological framework for maximizing viewer retention. Each level releases increasing amounts of dopamine, and ascending through all 6 levels creates a **Pavlovian response** - viewers get dopamine just from seeing Dr. Synapse/the brain mascot before even watching.

### The 6 Levels

| Level | Name | Trigger | Dopamine Source |
|-------|------|---------|-----------------|
| 1 | **Stimulation** | First 1-2 seconds | Visual stun (colors, motion, brightness) |
| 2 | **Captivation** | 2-5 seconds | Curiosity loop (question pops in mind) |
| 3 | **Anticipation** | 5-25 seconds | Guessing game (what's the answer?) |
| 4 | **Validation** | 25-30 seconds | Loop closure (answer revealed) |
| 5 | **Affection** | Throughout | Liking the messenger (Dr. Synapse) |
| 6 | **Revelation** | Cumulative | Realizing consistent value source |

### Mapping to Synaptic Recall Structure

```
DOPAMINE LADDER          SYNAPTIC RECALL STRUCTURE
─────────────────────────────────────────────────────
Level 1: Stimulation  →  CHAOS OPENER (0-1 sec) [NEW]
Level 2: Captivation  →  Hook (0-5 sec)
Level 3: Anticipation →  Question + Options (5-25 sec)
Level 4: Validation   →  Answer Reveal (25-30 sec)
Level 5: Affection    →  Dr. Synapse personality (throughout)
Level 6: Revelation   →  Mechanism + Pearl (30-60 sec)
```

---

## Level 1: Stimulation - The Chaos Opener

**The Problem:** Our videos start with the brain mascot appearing, but there's no visual "stun gun" in the first 1-2 seconds to trigger subconscious attention.

**The Solution:** Add a **Chaos Opener** - a 0.5-1 second burst of contextual audio + visual that matches the medical emergency BEFORE Dr. Synapse speaks.

### How Stimulation Works

The brain processes visuals in two stages:
1. **Bottoms-up processing** (0-200ms) - Subconscious, catches colors/motion
2. **Top-down processing** (200ms+) - Conscious comprehension

The Chaos Opener targets **bottoms-up processing** - pure visual/audio stimulation that makes the viewer PAUSE before they even understand what they're seeing.

### Chaos Opener Components

Every video should have TWO elements in the first 15-30 frames:

1. **Contextual Emergency Sound** - Audio that matches the medical scenario
2. **Contextual Emergency Visual** - Animated element that screams DANGER

### Emergency-Specific Chaos Openers

| Emergency Type | Sound Effect | Visual Element |
|---------------|--------------|----------------|
| **Cardiac (MI, Arrhythmia)** | Flatline → beep recovery OR rapid irregular beeps | EKG line spiking/flatlining across screen |
| **Bradycardia/Heart Block** | Slow, ominous beeps (40 BPM) | Slow EKG with long pauses, red warning flash |
| **Tachycardia/SVT** | Rapid frantic beeping (180+ BPM) | Fast chaotic EKG, screen shake |
| **Respiratory (Pneumothorax, PE)** | Gasping/choking + ventilator alarm | Lungs collapsing animation, O2 sat dropping |
| **Overdose/Toxicology** | Pill bottle rattling OR vomiting | Pills scattering, toxic symbol pulsing |
| **Anaphylaxis** | EpiPen click + wheezing | Throat closing animation, hives spreading |
| **Seizure** | Electrical crackling | Brain with lightning, jerky screen movement |
| **Metabolic (DKA, Hyperkalemia)** | Lab machine printing + alarm | Numbers flying (K+ 7.2!), red lab values |
| **Liver Failure** | Flatline undertone | Yellowing screen tint, liver darkening |
| **Code Blue/Arrest** | "CODE BLUE" overhead announcement | Flatline, crash cart rushing in |

### Chaos Opener Sound Files (To Create)

```
public/assets/sfx/chaos/
├── cardiac-flatline.mp3        # Flatline beeeep (0.5 sec)
├── cardiac-irregular.mp3       # Chaotic arrhythmia beeps
├── cardiac-bradycardia.mp3     # Slow ominous beeps
├── cardiac-tachycardia.mp3     # Frantic rapid beeps
├── respiratory-gasp.mp3        # Gasping/choking sound
├── respiratory-ventilator.mp3  # Ventilator alarm
├── overdose-pills.mp3          # Pills rattling/spilling
├── overdose-vomit.mp3          # Retching sound
├── anaphylaxis-wheeze.mp3      # Wheezing/stridor
├── anaphylaxis-epipen.mp3      # EpiPen click
├── seizure-electrical.mp3      # Electrical crackling
├── metabolic-alarm.mp3         # Lab machine alarm
├── code-blue.mp3               # "CODE BLUE" announcement
└── generic-alarm.mp3           # Hospital alarm (fallback)
```

### Chaos Opener Implementation

```jsx
// ChaosOpener.jsx - Add to every Ad component
const ChaosOpener = ({ emergencyType, localFrame }) => {
  const opacity = localFrame < 20
    ? interpolate(localFrame, [0, 5], [1, 1])
    : interpolate(localFrame, [20, 35], [1, 0], { extrapolateRight: 'clamp' });

  const shake = localFrame < 25 ? {
    x: Math.sin(localFrame * 3) * 6 * (1 - localFrame/25),
    y: Math.cos(localFrame * 2.5) * 4 * (1 - localFrame/25),
  } : { x: 0, y: 0 };

  const renderVisual = () => {
    switch(emergencyType) {
      case 'cardiac':
        return <EKGFlatline frame={localFrame} />;
      case 'bradycardia':
        return <EKGSlow frame={localFrame} />;
      case 'tachycardia':
        return <EKGRapid frame={localFrame} />;
      case 'respiratory':
        return <LungsCollapsing frame={localFrame} />;
      case 'overdose':
        return <PillsScattering frame={localFrame} />;
      case 'metabolic':
        return <LabValuesFlying frame={localFrame} />;
      case 'seizure':
        return <BrainElectrical frame={localFrame} />;
      default:
        return <GenericAlarm frame={localFrame} />;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity,
      transform: `translate(${shake.x}px, ${shake.y}px)`,
      zIndex: 1000,
    }}>
      {/* Red danger flash */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at center, rgba(239,68,68,${0.4 * opacity}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      {/* Emergency-specific visual */}
      {renderVisual()}
    </div>
  );
};

// EKG Flatline Component
const EKGFlatline = ({ frame }) => {
  const lineProgress = interpolate(frame, [0, 20], [0, 100], { extrapolateRight: 'clamp' });
  const spikeFrame = 12;

  return (
    <svg style={{ position: 'absolute', top: '40%', left: 0, width: '100%', height: 200 }}>
      <defs>
        <filter id="ekgGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Flatline with spike */}
      <path
        d={frame < spikeFrame
          ? `M 0 100 L ${lineProgress * 10} 100`
          : `M 0 100 L 100 100 L 120 20 L 140 180 L 160 100 L ${lineProgress * 10} 100`
        }
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        filter="url(#ekgGlow)"
      />
    </svg>
  );
};

// Lab Values Flying Component (for metabolic emergencies)
const LabValuesFlying = ({ frame }) => {
  const values = [
    { label: 'K+', value: '7.2', color: '#ef4444', delay: 0 },
    { label: 'pH', value: '7.1', color: '#ef4444', delay: 5 },
    { label: 'HCO3', value: '8', color: '#ef4444', delay: 10 },
    { label: 'Glucose', value: '580', color: '#fbbf24', delay: 8 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {values.map((v, i) => {
        const progress = Math.max(0, (frame - v.delay) / 15);
        const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 0.8]);
        const scale = interpolate(progress, [0, 0.5], [0.5, 1.2], { extrapolateRight: 'clamp' });
        const y = interpolate(progress, [0, 1], [300 + i * 50, 600 + i * 80]);

        return (
          <div key={i} style={{
            position: 'absolute',
            left: 200 + i * 180,
            top: y,
            opacity,
            transform: `scale(${scale})`,
            fontSize: 48,
            fontWeight: 'bold',
            color: v.color,
            textShadow: `0 0 20px ${v.color}`,
          }}>
            {v.label}: {v.value}
          </div>
        );
      })}
    </div>
  );
};
```

### Chaos Opener Audio Integration

```jsx
// In your Ad component, add BEFORE the Dr. Synapse narration
<Sequence from={0} durationInFrames={25}>
  <Audio
    src={staticFile(`assets/sfx/chaos/${emergencyType}-sound.mp3`)}
    volume={0.7}
  />
</Sequence>

// The Chaos sound should OVERLAP with Dr. Synapse starting
// Dr. Synapse audio starts at frame 0, but the Chaos sound
// creates immediate stimulation while his voice fades in
```

### Per-Video Chaos Opener Catalog

| Video Topic | Emergency Type | Sound | Visual | Hook Transition |
|-------------|---------------|-------|--------|-----------------|
| Beta Blocker Overdose | bradycardia | Slow beeps (HR 32) | Slow EKG, red pulse | "Her heart rate is THIRTY-TWO" |
| Hyperkalemia | metabolic | Lab alarm | K+ 7.2 flying | "Potassium is SEVEN POINT TWO" |
| Opioid Overdose | respiratory | Slow breathing → silence | O2 sat dropping 60→40 | "She's not BREATHING" |
| Acetaminophen OD | overdose | Pill bottle spill | Pills scattering, liver icon | "Just CHUGGED a bottle of Tylenol" |
| Tension Pneumothorax | respiratory | Gasping + alarm | Lung collapsing, trachea shifting | "Can't BREATHE" |
| Malignant Hyperthermia | metabolic | Temp alarm beeping | Temp rising 102→106 | "Temperature is climbing FAST" |
| Digoxin Toxicity | cardiac | Irregular slow beeps | Chaotic EKG pattern | "Heart rhythm is ALL OVER the place" |
| Heart Attack (STEMI) | cardiac | Rapid beeps → flatline | ST elevation on EKG | "Having a HEART ATTACK right now" |
| Anaphylaxis | anaphylaxis | Wheezing + stridor | Throat closing, hives | "Throat is CLOSING" |
| Sickle Cell Crisis | metabolic | Pain grunt + alarm | Sickled cells flowing | "Pain score is TEN out of ten" |

---

## Level 2: Captivation - The Curiosity Loop

**Current State:** STRONG - Your hooks already do this well.

**The Psychology:** Captivation happens when a QUESTION pops in the viewer's mind that they feel compelled to answer. This question must be:
1. **Relevant** to the viewer (med students → passing boards)
2. **Non-obvious** (not something they already know)
3. **High stakes** (life/death, pass/fail)

### The Three Questions Your Hooks Should Trigger

Every hook should make the viewer ask themselves ONE of these:

1. **"Would I kill this patient?"** (fear-based)
2. **"Do I actually know this?"** (insecurity-based)
3. **"What's the trap?"** (curiosity-based)

### Captivation Formula

```
[CHAOS OPENER fades] → [STAKES immediately] → [CHALLENGE to viewer]

Example flow:
Frame 0-20: Flatline EKG + alarm sound
Frame 20-40: "Her heart rate is THIRTY-TWO" (stakes)
Frame 40-60: "And I GUARANTEE you're about to pick the WRONG answer" (challenge)

The question in the viewer's mind:
"What would I pick? Am I going to be wrong? What's the right answer?"
```

---

## Level 3: Anticipation - The Guessing Game

**Current State:** UNDERUTILIZED - This is the biggest opportunity for improvement.

**The Psychology:** Anticipation is the viewer actively GUESSING what the answer might be. Dopamine peaks JUST BEFORE the answer is revealed. The longer you can sustain this guessing state (without losing them), the bigger the payoff.

### The Anticipation Problem

Currently, options A-E appear relatively quickly. Viewers don't have time to:
1. Consider each option
2. Commit to a guess
3. Feel the tension of possibly being wrong

### Anticipation Tactics

**1. Slow the Option Reveals**
```
CURRENT: Options appear every 0.5 seconds
BETTER: Options appear every 1-1.5 seconds with a "consideration beat"

Frame timing:
- Option A appears → 1 sec pause (viewer thinks: "maybe...")
- Option B appears → 1 sec pause (viewer thinks: "could be...")
- Option C appears → Dr. Synapse: "I KNOW some of you are clicking this one..."
- Option D appears → 1 sec pause
- Option E appears → Timer intensifies
```

**2. Trap Callouts (Anticipation Reset)**

When viewers think they know the answer, CALL THEM OUT to reset the curiosity loop:

```javascript
// Trap callout examples - add to script at option C/D
const trapCallouts = [
  "I can SEE some of you reaching for this one already. Hold on.",
  "This is where most of you MORONS mess up. Watch.",
  "If you picked this, you need to keep watching.",
  "Ah ah ah, not so fast. Think about it.",
  "Classic trap. Let's see who falls for it.",
];
```

**3. Head Fakes (Misdirection)**

Yank the answer away just before revealing to reset anticipation:

```
STANDARD: "The answer is... D! Glucagon!"
WITH HEAD FAKE: "You're thinking atropine, right? WRONG. But it's not glucagon either...
                 *beat* ...it's glucagon. Wait, I just said that. The answer IS glucagon."
```

This confusion → clarity creates a dopamine spike.

**4. Visual Anticipation Cues**

```jsx
// Make the trap answer glow yellow (warning) during anticipation
const TrapGlow = ({ isTrapped, children }) => (
  <div style={{
    boxShadow: isTrapped ? '0 0 20px #fbbf24, inset 0 0 20px rgba(251,191,36,0.1)' : 'none',
    border: isTrapped ? '2px solid #fbbf24' : '2px solid transparent',
    transition: 'all 0.3s ease',
  }}>
    {children}
  </div>
);

// Add subtle "?" icon next to trap answer
const TrapIndicator = () => (
  <span style={{
    marginLeft: 8,
    color: '#fbbf24',
    fontSize: 18,
    animation: 'pulse 1s infinite',
  }}>
    ⚠️
  </span>
);
```

**5. Timer Acceleration**

The timer should feel like it's speeding up in the final 5 seconds:

```jsx
// Timer visual acceleration
const timerScale = localFrame > answerRevealFrame - 150
  ? 1 + Math.sin(localFrame * 0.5) * 0.1  // Pulsing in final 5 sec
  : 1;

const timerColor = localFrame > answerRevealFrame - 150
  ? '#ef4444'  // Red in final 5 sec
  : '#fbbf24'; // Yellow normally
```

---

## Level 4: Validation - Closing the Loop

**Current State:** GOOD but could be stronger.

**The Psychology:** Validation is the dopamine release from getting the answer. But the MAGNITUDE of the release depends on:
1. How non-obvious the answer was
2. Whether they were right or wrong
3. How the reveal is framed

### Validation Tactics

**1. Acknowledge the Wrong Answer**

Don't just reveal the right answer - explain why the WRONG answer would have killed the patient:

```
CURRENT: "The answer is D - Glucagon!" *celebration meme*

BETTER: "The answer is D - Glucagon!
         And if you picked C - Atropine - congratulations, you just KILLED her.
         Here's why you were wrong, you JACKASS..."
```

**2. The "You Either Got This Or You Didn't" Moment**

Create a clear binary outcome:

```
"Moment of truth. If you said Glucagon, you just saved her life.
 If you said ANYTHING else... she's dead. Let's find out why."
```

**3. Frame Teaching as REWARD, Not Lecture**

The mechanism teaching should feel like a GIFT:

```
CURRENT: "Now let me explain the mechanism..."
BETTER: "Now let me make sure you NEVER forget this. You're welcome."
         "I'm about to give you the one thing that saves this question forever."
         "Pay attention, because this is the part that makes you DANGEROUS on boards."
```

**4. Validation Sound Design**

```jsx
// Layer multiple sounds for maximum dopamine at reveal
<Sequence from={answerRevealFrame} durationInFrames={60}>
  {/* Click sound - immediate feedback */}
  <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />

  {/* Success fanfare - 200ms delay for anticipation */}
  <Sequence from={6}>
    <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
  </Sequence>

  {/* Crowd cheer/celebration - 400ms delay */}
  <Sequence from={12}>
    <Audio src={staticFile('assets/sfx/crowd-cheer.mp3')} volume={0.4} />
  </Sequence>
</Sequence>
```

---

## Level 5: Affection - Loving Dr. Synapse

**Current State:** STRONG foundation with room to cement.

**The Psychology:** Affection transfers from the MESSAGE to the MESSENGER. When viewers like Dr. Synapse, they give more leash to future videos and release dopamine just from seeing him.

### The 4 Likability Factors

1. **Attractiveness** - N/A (animated brain, but make it visually appealing)
2. **Vibe** - Consistent grumpy grandpa energy, distinct personality
3. **Joy/Passion** - He's not happy, but he's PASSIONATE about medicine
4. **Problem Solving** - THIS IS THE SUPERPOWER - he actually helps them pass

### Affection Tactics

**1. Consistent Character Beats**

Dr. Synapse should have recognizable catchphrases:

```javascript
const drSynapseCatchphrases = {
  opening: [
    "Alright, JACKASSES, listen up.",
    "Oh boy, here we go again.",
    "Let me guess - you think you know this one.",
  ],
  trapCallout: [
    "I can smell the wrong answers from here.",
    "Classic mistake. Classic.",
    "This is EXACTLY how you fail boards.",
  ],
  teaching: [
    "Now pay attention, because I'm only saying this once.",
    "Here's where it gets interesting.",
    "This is the part you're gonna remember at 3 AM.",
  ],
  closing: [
    "Now you won't kill YOUR patients. You're welcome.",
    "Dr. Synapse out. Don't be an idiot.",
    "Remember this, or don't. Your patients are counting on you.",
    "That's one more question you'll crush. You're welcome.",
  ],
};
```

**2. The Insult-Help Dynamic**

Dr. Synapse insults viewers but HELPS them. This creates a unique parasocial bond:

```
"You JACKASSES are gonna remember this forever now. You're welcome."
"I'm hard on you because I don't want you killing people. Now you won't."
"Yeah, I called you idiots. But now you're EDUCATED idiots. Big difference."
```

**3. Signature Outro**

Every video should end the same way for Pavlovian conditioning:

```
[Mechanism complete]
[Clinical pearl delivered]
"Now you won't kill YOUR patients. Dr. Synapse out."
[Brain mascot winks or does signature gesture]
[End card: "synapticrecall.ai"]
```

---

## Level 6: Revelation - The Pavlovian Response

**Current State:** Building toward this with each video.

**The Psychology:** Revelation is when the viewer realizes you're a CONSISTENT source of value. For education content, this happens when:
1. You solve a SPECIFIC problem they have (passing boards)
2. You do it REPEATEDLY with non-obvious value
3. They associate YOUR FACE/BRAND with that value

**The Ultimate Goal:** When a med student sees the animated brain mascot, they should IMMEDIATELY think: "This is gonna help me pass Step 1" - and get a dopamine hit before the video even starts.

### Revelation Tactics

**1. Exam-Specific Closers**

End every video with a boards reference:

```javascript
const examClosers = [
  "This shows up on Step 1 EVERY year. Now you'll never miss it.",
  "One more patient saved. One more question you'll crush.",
  "That's a guaranteed point on your shelf exam. You're welcome.",
  "If this is on your boards, you're gonna remember this moment.",
  "File that away. It's showing up on your test.",
];
```

**2. Series/Playlist Consistency**

Create predictable content buckets:

```
- "Toxicology Tuesdays" - All overdose/poison questions
- "Cardiac Catastrophes" - Heart emergencies
- "Pharm Fails" - Drug interaction disasters
- "You're Gonna Kill Somebody" - Most commonly missed questions
```

**3. Cross-Video Callbacks**

Reference previous videos to reward repeat viewers:

```
"Remember the beta blocker overdose? This is the OPPOSITE problem."
"Last week we talked about bradycardia. Today? The heart won't STOP."
"If you watched my digoxin video, you already know where this is going."
```

**4. The Revelation Moment Script**

For viewers who've watched 3+ videos, add a meta moment:

```
[At the end of clinical pearl]
"If you've been watching these videos, you're starting to see the pattern.
 Every question has a trap. Every trap has a mechanism.
 Learn the mechanism, never fall for the trap.
 That's how you pass boards. That's what we do here.
 Dr. Synapse out."
```

---

## Dopamine Ladder Checklist

Add to Pre-Flight Checklist:

- [ ] **Level 1 (Stimulation):** Chaos Opener matches emergency type
- [ ] **Level 1:** Contextual sound plays in first 0.5 seconds
- [ ] **Level 1:** Visual chaos (EKG, labs, etc.) fades by frame 30
- [ ] **Level 2 (Captivation):** Hook triggers fear/insecurity/curiosity question
- [ ] **Level 2:** Stakes established in first 5 seconds
- [ ] **Level 3 (Anticipation):** Options reveal with 1+ second gaps
- [ ] **Level 3:** Trap callout included ("I KNOW you're clicking...")
- [ ] **Level 3:** Timer accelerates in final 5 seconds
- [ ] **Level 4 (Validation):** Wrong answer consequences explained
- [ ] **Level 4:** Teaching framed as reward ("You're welcome")
- [ ] **Level 5 (Affection):** Dr. Synapse catchphrase included
- [ ] **Level 5:** Signature outro ("Dr. Synapse out")
- [ ] **Level 6 (Revelation):** Exam-specific closer included
- [ ] **Level 6:** Cross-video callback if applicable

---

## Dr. Synapse Voice Guide

Dr. Synapse is a grumpy, grandfatherly doctor with tough-love energy. Think: Southern doctor who's seen too many residents mess up, but genuinely wants you to learn.

### Voice Characteristics

**DO:**
- Sarcastic, slightly insulting: "you MORONS", "JACKASSES", "IDIOTS"
- Southern/folksy expressions: "I'll be damned", "hot damn", "son of a gun", "well butter my biscuit"
- Exasperated sighs: "Good LORD", "For cryin' out loud"
- Dramatic emphasis: "DEAD", "KILLER", "DISASTER"
- Rhetorical questions: "You know what happens next? You KILL her"
- Callbacks to stupidity: "THAT'S why we don't give atropine, JACKASSES"

**DON'T:**
- **NEVER use religious references** (no "Jesus", "God", "Lord" in religious context, "holy", "blessed")
- No actually offensive slurs
- No misinformation - medical content MUST be accurate
- No hedging - be confident and direct

### Script Emotional Arc

Every script follows: **FEAR → CONFUSION → UNDERSTANDING → CONFIDENCE**

```
FEAR (Hook):
"This woman's about to DIE and most of you are gonna pick the wrong answer"

CONFUSION (Why trap answer fails):
"Now I KNOW you're thinking atropine. That's because you don't understand the mechanism, you JACKASS"

UNDERSTANDING (Correct mechanism):
"Glucagon BYPASSES the blocked receptor entirely. It's the BACK DOOR into the cell"

CONFIDENCE (Resolution):
"Now you won't kill YOUR patients. You're welcome"
```

### Script Length Guidelines

**Total:** 45-60 seconds at 1x (90-120 seconds of audio at 2x playback)

| Section | Duration | Sentences |
|---------|----------|-----------|
| Hook | 5-8 sec | 2-3 punchy |
| Question setup | 10-15 sec | Vignette + labs |
| Options | 8-10 sec | A-E read fast |
| Answer reveal | 3-5 sec | Dramatic |
| Mechanism | 20-30 sec | THE MEAT |
| Clinical pearl | 5-10 sec | Dosing/timing |

---

## Technical Implementation

### Locked Constants (NEVER CHANGE)

```javascript
const PLAYBACK_RATE = 2.0;  // Audio plays at 2x speed
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

// BrainMascot position
const BRAIN = {
  position: "top-left",
  customTop: 250,
  customLeft: 120,
  size: 280,
  showSpeechBubble: true,
};

// Question card / Mechanism container
const CONTAINER = {
  top: 480,
  width: 820,
  borderRadius: 22,
  padding: '28px 32px',
  background: '#0a0a0a',
};

// Timer position
const TIMER = { top: 250, right: 145 };
```

### Frame Conversion (CRITICAL)

All audio timestamps must be converted to frames accounting for playback rate:

```javascript
const toFrame = (timestamp) => Math.floor((timestamp / PLAYBACK_RATE) * fps);

// Example: Audio says "NAPQI" at 131.728 seconds
// At 2x playback: 131.728 / 2.0 = 65.864 seconds
// At 30fps: 65.864 * 30 = 1975.92 → frame 1975
```

### Safe Zones (TikTok/Instagram UI)

```
TOP: 220px clear - profile pics, time
BOTTOM: 350px clear - captions, engagement buttons
LEFT: 60px clear
RIGHT: 120px clear - like, comment, share buttons
```

### Color Vocabulary

| Status | Color | Use |
|--------|-------|-----|
| Danger/Problem | `#ef4444` | Wrong answers, toxins, death |
| Warning | `#fbbf24` | Trap answers, time pressure |
| Success/Solution | `#22c55e` | Correct answer, antidotes |
| Recovery | `#ec4899` | Heart recovery, patient saved |
| Clinical Pearl | `#9333ea` | Dosing, protocols, pearls |

---

## Mechanism Diagram Design (CRITICAL)

### CRITICAL: Prevent Element Overlapping

**NEVER let elements overlap in mechanism diagrams.** This is a common failure mode that makes content unreadable.

**Rules to prevent overlaps:**
1. **NO BRANDING IN MECHANISM DIAGRAMS** - Never put "synapticrecall.ai" or any watermark inside mechanism container. It WILL overlap with titles.
2. **Use flexbox column with gaps** - Always use `gap` property for consistent spacing between all sections
3. **Test at all timestamps** - Elements animate in at different times; ensure no collision at any frame
4. **Fill the space** - Use large SVG diagrams (700-760px wide) to fill the container. Don't leave empty space.
5. **Position effects BELOW diagram** - Use `marginTop` after SVG, not `position: absolute` at bottom
6. **Single flow layout** - Title → Diagram → Badges → Warning box (top to bottom, no overlap)

**Size guidelines for mechanism phases:**
- SVG diagram: 700-760px wide, 500-600px tall (fills most of the space)
- Title: 38-42px font
- Effect badges: inline flex row with `gap: 15px`
- Warning box: below badges with `marginTop: 12px`
- Phase indicator: automatically positioned at bottom by container

### CRITICAL: Fill The Space - No Empty Containers

**NEVER have tiny content floating in a huge empty container.** This looks unprofessional and wastes valuable screen real estate.

**Anti-patterns to AVOID:**
- Small text boxes at the top with 80% empty space below
- Using the old `ChestCavitySVG` component (700x500) inside a smaller container that causes overlap
- Info boxes that are too small for the available width

**Correct approach:**
1. **For diagram phases**: Create dedicated inline SVG (760x520+) that fills the container width
2. **Put info INSIDE the SVG** using `<text>` and `<rect>` elements positioned at the bottom
3. **For text-heavy phases (Pearl)**: Use large fonts (26-42px), `gap: 20px` between sections, full-width cards
4. **Every phase should visually fill 85%+ of the container height**

**Pearl/Text phases pattern:**
```jsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
  <Title fontSize={42} />           {/* ~50px */}
  <CardRow flex gap={20} />         {/* ~150px */}
  <LargeInfoBox width="90%" />      {/* ~200px */}
  <ActionBox padding={30} />        {/* ~120px */}
  <ClosingText fontSize={34} />     {/* ~50px */}
</div>
```

### Scene-Based Architecture (NOT Everything on One Screen)

Each phase should be its **own scene** that transitions in and out. Don't cram everything into one static layout.

```javascript
const getPhase = () => {
  if (localFrame < t.phase2Start) return 'phase1';
  if (localFrame < t.phase3Start) return 'phase2';
  if (localFrame < t.phase4Start) return 'phase3';
  return 'phase4';
};

const phase = getPhase();

// Each phase is a SEPARATE render function
const renderPhase1 = () => {
  if (phase !== 'phase1') return null;

  // Fade out before next phase
  const opacity = getProgress(localFrame, 0, 20) *
    (localFrame > t.phase2Start - 20 ? 1 - getProgress(localFrame, t.phase2Start - 20, 15) : 1);

  return <div style={{ opacity }}>Phase 1 content - BIG and centered</div>;
};
```

### Element Entrance Rule (CRITICAL)

**NOTHING appears before it's spoken.** Every element fades/scales in when the narrator says it:

```javascript
// Each element tied to its audio timestamp
const napqiOpacity = getProgress(localFrame, t.napqi, 12);
const toxicOpacity = getProgress(localFrame, t.toxic, 12);

// NAPQI ball - only appears when "NAPQI" is spoken
<div style={{
  opacity: napqiOpacity,
  transform: `scale(${getSpring(localFrame, t.napqi, fps)})`,
}}>
  NAPQI molecule
</div>

// TOXIC label - appears when "toxic" is spoken (AFTER NAPQI)
<div style={{
  opacity: toxicOpacity,
  transform: `scale(${getSpring(localFrame, t.toxic, fps)})`,
}}>
  TOXIC Metabolite
</div>
```

### Animation Helpers (USE THESE)

```javascript
// Spring animation - for pop-in effects
const getSpring = (localFrame, triggerFrame, fps) => {
  if (localFrame < triggerFrame) return 0;
  return spring({
    frame: localFrame - triggerFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
  });
};

// Linear progress - for opacity fades
const getProgress = (localFrame, startFrame, duration = 20) => {
  return interpolate(localFrame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

// Continuous pulse - for emphasis on active elements
const getPulse = (localFrame, triggerFrame, speed = 0.15, intensity = 0.08) => {
  if (localFrame < triggerFrame) return 1;
  return 1 + Math.sin((localFrame - triggerFrame) * speed) * intensity;
};

// Shake effect - for impact/danger moments
const getShake = (localFrame, startFrame, duration = 25, intensity = 8) => {
  if (localFrame < startFrame || localFrame > startFrame + duration)
    return { x: 0, y: 0 };
  const decay = 1 - (localFrame - startFrame) / duration;
  return {
    x: Math.sin(localFrame * 2.5) * intensity * decay,
    y: Math.cos(localFrame * 2) * intensity * 0.5 * decay,
  };
};
```

### Particle Systems (Calcium, Toxins, Drugs)

```javascript
const FlowingParticle = ({ startX, endX, y, frame, delay, color, size = 14 }) => {
  if (frame < delay) return null;

  const cycleLength = 80;
  const progress = ((frame - delay) % cycleLength) / cycleLength;
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const wobble = Math.sin(progress * Math.PI * 4) * 8;

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + wobble,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 ${size}px ${color}`,
      opacity,
    }}/>
  );
};

// Only spawn particles AFTER the relevant timestamp
{localFrame > t.calciumFloods && Array.from({ length: 8 }).map((_, i) => (
  <FlowingParticle
    key={i}
    startX={200}
    endX={600}
    y={400 + (i % 3) * 30}
    frame={localFrame}
    delay={t.calciumFloods + i * 10}
    color="#06B6D4"
  />
))}
```

### SVG Glow Filters (Add to Every Diagram)

```jsx
<defs>
  <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feFlood floodColor="#ef4444" floodOpacity="0.8"/>
    <feComposite in2="blur" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feFlood floodColor="#22c55e" floodOpacity="0.8"/>
    <feComposite in2="blur" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <filter id="yellowGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feFlood floodColor="#fbbf24" floodOpacity="0.8"/>
    <feComposite in2="blur" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feFlood floodColor="#9333ea" floodOpacity="0.8"/>
    <feComposite in2="blur" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
```

### Phase Indicator Component

```jsx
<div style={{
  position: 'absolute',
  bottom: 25,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 14,
  fontSize: 14,
  background: 'rgba(0,0,0,0.75)',
  padding: '12px 24px',
  borderRadius: 24,
  border: '1.5px solid rgba(255,255,255,0.15)',
}}>
  {[
    { label: 'Problem', phase: 'problem', color: '#ef4444' },
    { label: 'Wrong', phase: 'wrong', color: '#fbbf24' },
    { label: 'Solution', phase: 'solution', color: '#22c55e' },
    { label: 'Pearl', phase: 'pearl', color: '#9333ea' },
  ].map((p, i) => (
    <span key={i} style={{
      color: currentPhase === p.phase ? p.color : 'rgba(255,255,255,0.3)',
      fontWeight: currentPhase === p.phase ? 'bold' : 'normal',
      textShadow: currentPhase === p.phase ? `0 0 15px ${p.color}` : 'none',
    }}>
      {currentPhase === p.phase ? '●' : '○'} {p.label}
    </span>
  ))}
</div>
```

### Container Styling (Must Match Question Card)

```jsx
<div style={{
  position: 'absolute',
  top: 480,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 820,
  height: 1080,
  opacity: containerOpacity,
  zIndex: 100,
}}>
  {/* Background */}
  <div style={{
    position: 'absolute',
    inset: 0,
    background: '#0a0a0a',
    borderRadius: 22,
    border: `2px solid ${phaseColor}40`,
    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 60px ${phaseColor}15`,
  }}/>

  {/* Gradient overlay */}
  <div style={{
    position: 'absolute',
    inset: 0,
    borderRadius: 22,
    background: 'radial-gradient(circle at top right, rgba(147,51,234,0.08), transparent 60%)',
  }}/>

  {/* Animated conic border */}
  <div style={{
    position: 'absolute',
    inset: -3,
    borderRadius: 25,
    background: `conic-gradient(from ${localFrame * 2}deg, ${phaseColor}35, transparent 20%)`,
    opacity: 0.5,
    zIndex: -1,
  }}/>

  {/* Content */}
  <div style={{ padding: '28px 32px' }}>
    {renderCurrentPhase()}
  </div>
</div>
```

---

## Meme Integration

### Meme Folders

```
public/assets/memes/
├── correct/     # Celebration memes (44 files)
├── wrong/       # Wrong answer reactions (65 files)
└── vlips/       # VLIPSY video clips - ALWAYS PREFER THESE (112 files)
```

**Always prefer VLIPSY clips** (`vlips/`) - they're high quality and work well.

### Meme Timing Rules

1. **Memes appear ON the trigger word** - not before
2. **Duration:** 1.5-2.5 seconds (45-75 frames)
3. **Position:** Center, scale 0.5-0.6
4. **Use MP4 over GIF** - better performance

### StaticMemeOverlay Usage

```jsx
<StaticMemeOverlay
  imagePath="assets/memes/vlips/borat-great-success.mp4"
  timestamp={answerRevealTimeRaw}
  durationInFrames={50}
  position="center"
  scale={0.55}
  playbackRate={PLAYBACK_RATE}
  soundEffect={null}
  frameOffset={0}
/>
```

### Good Meme Choices

**Answer Reveals:**
- `vlips/vlipsy-borat-great-success-*.mp4`
- `vlips/vlipsy-grand-theft-auto-mission-passed-*.mp4`
- `correct/penguinz0-woo-yeah-baby.mp4`

**Wrong Answer Moments:**
- `vlips/vlipsy-family-guy-oh-no-*.mp4`
- `vlips/vlipsy-arrow-you-have-failed-*.mp4`
- `wrong/` folder options

---

## Sound Effects Sequence

### Complete Audio Timeline

```jsx
{/* ═══════════════════════════════════════════════════════════════════════════
    LEVEL 1: STIMULATION - Chaos Opener (Frame 0-25)
    The contextual emergency sound that matches the medical scenario
    ═══════════════════════════════════════════════════════════════════════════ */}

{/* Chaos Opener Sound - MUST match emergency type */}
<Sequence from={0} durationInFrames={25}>
  <Audio
    src={staticFile(`assets/sfx/chaos/${emergencyType}.mp3`)}
    volume={0.7}
  />
</Sequence>

{/* Entrance whoosh - overlaps with chaos for transition */}
<Sequence from={10} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
</Sequence>

{/* ═══════════════════════════════════════════════════════════════════════════
    LEVEL 3: ANTICIPATION - Question Phase
    Timer + heartbeat create mounting tension
    ═══════════════════════════════════════════════════════════════════════════ */}

{/* Timer ticking - starts with question */}
<Sequence from={questionStartFrame} durationInFrames={timerDuration}>
  <Audio src={staticFile('assets/sfx/timer-ticking.mp3')} volume={0.6} />
</Sequence>

{/* Heartbeat - normal pace during question */}
<Sequence from={questionStartFrame} durationInFrames={timerDuration - 90}>
  <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={1.2} playbackRate={1.9} />
</Sequence>

{/* Heartbeat PANIC - final 3 seconds, faster + louder */}
<Sequence from={answerRevealFrame - 90} durationInFrames={90}>
  <Audio src={staticFile('assets/sfx/heartbeat.mp3')} volume={2.5} playbackRate={2.8} />
</Sequence>

{/* Option appear sounds - subtle click for each option */}
{optionTimestamps.map((timestamp, i) => (
  <Sequence key={i} from={toFrame(timestamp)} durationInFrames={15}>
    <Audio src={staticFile('assets/sfx/option-appear.mp3')} volume={0.3} />
  </Sequence>
))}

{/* ═══════════════════════════════════════════════════════════════════════════
    LEVEL 4: VALIDATION - Answer Reveal
    Layered sounds for maximum dopamine spike
    ═══════════════════════════════════════════════════════════════════════════ */}

{/* Answer click - immediate tactile feedback */}
<Sequence from={answerRevealFrame} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/mouse-click.mp3')} volume={0.9} />
</Sequence>

{/* Success fanfare - 200ms delay */}
<Sequence from={answerRevealFrame + 6} durationInFrames={60}>
  <Audio src={staticFile('assets/sfx/success-answer.mp3')} volume={0.9} />
</Sequence>

{/* Crowd cheer - 400ms delay for layered celebration */}
<Sequence from={answerRevealFrame + 12} durationInFrames={45}>
  <Audio src={staticFile('assets/sfx/crowd-cheer.mp3')} volume={0.4} />
</Sequence>

{/* ═══════════════════════════════════════════════════════════════════════════
    MECHANISM TEACHING - Transition + Phase Sounds
    ═══════════════════════════════════════════════════════════════════════════ */}

{/* Teaching transition whoosh */}
<Sequence from={teachingStartFrame} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/whoosh.mp3')} volume={0.4} />
</Sequence>

{/* Phase transition sounds (optional - for mechanism phase changes) */}
{phaseTransitionFrames.map((frame, i) => (
  <Sequence key={i} from={frame} durationInFrames={20}>
    <Audio src={staticFile('assets/sfx/phase-transition.mp3')} volume={0.3} />
  </Sequence>
))}

{/* Clinical pearl emphasis sound */}
<Sequence from={clinicalPearlFrame} durationInFrames={30}>
  <Audio src={staticFile('assets/sfx/pearl-chime.mp3')} volume={0.5} />
</Sequence>
```

### Chaos Opener Sound Catalog

Create/source these files for contextual emergency audio:

```
public/assets/sfx/chaos/
├── cardiac.mp3              # Flatline → beep (0.8 sec)
├── bradycardia.mp3          # Slow ominous beeps, 40 BPM (1 sec)
├── tachycardia.mp3          # Frantic rapid beeping (0.8 sec)
├── respiratory.mp3          # Gasping + ventilator alarm (1 sec)
├── overdose.mp3             # Pills rattling/spilling (0.8 sec)
├── metabolic.mp3            # Lab machine alarm beeping (0.8 sec)
├── anaphylaxis.mp3          # Wheezing/stridor sound (1 sec)
├── seizure.mp3              # Electrical crackling (0.8 sec)
├── code-blue.mp3            # "CODE BLUE" hospital announcement (1.5 sec)
├── liver.mp3                # Low ominous drone (1 sec)
└── generic.mp3              # Hospital alarm fallback (0.8 sec)
```

### Emergency Type Mapping

```javascript
// Map video topics to chaos opener types
const emergencyTypeMap = {
  // Cardiac
  'beta-blocker-overdose': 'bradycardia',
  'digoxin-toxicity': 'cardiac',
  'heart-attack': 'cardiac',
  'svt': 'tachycardia',

  // Respiratory
  'tension-pneumothorax': 'respiratory',
  'opioid-overdose': 'respiratory',
  'pulmonary-embolism': 'respiratory',

  // Metabolic
  'hyperkalemia': 'metabolic',
  'dka': 'metabolic',
  'malignant-hyperthermia': 'metabolic',
  'sickle-cell': 'metabolic',

  // Toxicology
  'acetaminophen-overdose': 'overdose',
  'organophosphate': 'overdose',

  // Other
  'anaphylaxis': 'anaphylaxis',
  'seizure': 'seizure',
  'liver-failure': 'liver',
};

// Usage in component
const emergencyType = emergencyTypeMap[videoTopic] || 'generic';
```

---

## File Structure

```
src/components/
├── [Topic]Ad.jsx              # Main composition
├── diagrams/
│   └── [Topic]Mechanism.jsx   # Scene-based mechanism
├── Character/
│   └── BrainMascot.jsx        # Dr. Synapse character
├── MedicalQuestionCard.jsx    # Question display
└── StaticMemeOverlay.jsx      # Meme component

public/assets/
├── audio/
│   ├── [topic]-narration.mp3
│   └── [topic]-timestamps.json
├── memes/
│   ├── correct/
│   ├── wrong/
│   └── vlips/
└── sfx/
```

---

## Reference Files

Study these working examples:

| Purpose | File |
|---------|------|
| Ad Structure | `src/components/BetaBlockerOverdoseAd.jsx` |
| Scene-Based Mechanism | `src/components/diagrams/AcetaminophenMechanismEnhanced.jsx` |
| Particle Animations | `src/components/diagrams/BetaBlockerMechanismV2.jsx` |
| Question Card | `src/components/MedicalQuestionCard.jsx` |

---

## ElevenLabs Audio

### Voice Configuration

```javascript
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC';  // Grandpa Spuds Oxley
const MODEL_ID = 'eleven_turbo_v2_5';

const voiceSettings = {
  stability: 0.35,
  similarity_boost: 0.80,
  style: 0.85,
  use_speaker_boost: true,
};
```

### Timestamp JSON Format

```json
{
  "script": "Full script...",
  "words": [
    { "word": "NAPQI", "start": 131.728, "end": 132.456 }
  ]
}
```

---

## Pre-Flight Checklist

### Core Requirements
- [ ] No religious references in script
- [ ] All timestamps converted with `PLAYBACK_RATE = 2.0`
- [ ] Every element has entrance animation tied to timestamp
- [ ] **Nothing appears before it's spoken**
- [ ] Phase colors match content
- [ ] Content within safe zones
- [ ] Mechanism uses **scene-based** rendering
- [ ] Duration: 45-60 seconds

### Dopamine Ladder Compliance

**Level 1 - Stimulation (Chaos Opener)**
- [ ] Emergency-specific sound in first 15 frames
- [ ] Visual chaos element (EKG/labs/etc.) present
- [ ] Chaos fades out by frame 30-35
- [ ] Screen shake or red flash included

**Level 2 - Captivation (Hook)**
- [ ] Hook creates emotional tension in first 5 seconds
- [ ] Stakes established IMMEDIATELY (death/failure)
- [ ] Challenge to viewer included ("I GUARANTEE you'll pick wrong")

**Level 3 - Anticipation (Question Phase)**
- [ ] Options reveal with 1+ second gaps between each
- [ ] Trap callout included ("I KNOW you're clicking this one...")
- [ ] Timer accelerates/pulses in final 5 seconds
- [ ] Yellow warning glow on trap answer (optional)

**Level 4 - Validation (Answer Reveal)**
- [ ] Memes timed to audio triggers
- [ ] Wrong answer consequences explained
- [ ] Teaching framed as reward ("You're welcome", "NEVER forget this")
- [ ] Layered sound design (click → fanfare → cheer)

**Level 5 - Affection (Dr. Synapse)**
- [ ] Character catchphrase included
- [ ] Insult-help dynamic present ("JACKASSES... you're welcome")
- [ ] Signature outro ("Dr. Synapse out")

**Level 6 - Revelation (Value Cementing)**
- [ ] Exam-specific closer ("Shows up on Step 1 EVERY year")
- [ ] Clinical pearl with specific dosing included
- [ ] Cross-video callback if applicable

---

## Commands

```bash
# Preview
npm start

# Render
npx remotion render [composition-id] out/video.mp4
```
