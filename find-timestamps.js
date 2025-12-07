const fs = require('fs');

const TOPIC = 'streptococcus-pneumoniae-lobar-pneumonia';
const input = JSON.parse(fs.readFileSync('strep-pneumo-input.json', 'utf8'));
const timestampsData = JSON.parse(fs.readFileSync(`public/assets/audio/${TOPIC}-timestamps.json`, 'utf8'));

console.log('🔍 AGENT 3: TIMESTAMP DETECTIVE (EXACT MATCHING)\n');

// ===== EXACT MATCH FUNCTION (CRITICAL FIX) =====
function findTimestamp(words, searchText, startAfter = 0) {
  const search = searchText.toLowerCase().trim();

  // CRITICAL: For option letters (A), B), C), D), E)), EXACT match ONLY
  if (/^[a-e]\)$/i.test(searchText)) {
    for (let i = 0; i < words.length; i++) {
      const word = words[i].word.toLowerCase().trim();

      // Remove punctuation for comparison
      const cleanWord = word.replace(/[.,!?;:]/g, '');

      if (cleanWord === search && words[i].start >= startAfter) {
        console.log(`  ✓ EXACT match "${searchText}" at ${words[i].start}s`);
        return words[i].start;
      }
    }
    return null;
  }

  // For other words: match whole words only
  const normalized = searchText.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < words.length; i++) {
    const word = words[i].word.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (word === normalized && words[i].start >= startAfter) {
      return words[i].start;
    }
  }

  return null;
}

// ===== 1. AUTO-DETECT OPTIONS WITH EXACT MATCHING =====
console.log('📋 Finding Options (EXACT MATCH ONLY):');
const optionTimestamps = {
  A: findTimestamp(timestampsData.words, "A)"),
  B: findTimestamp(timestampsData.words, "B)"),
  C: findTimestamp(timestampsData.words, "C)"),
  D: findTimestamp(timestampsData.words, "D)"),
  E: findTimestamp(timestampsData.words, "E)"),
};

// CRITICAL: Timer starts at FIRST OPTION
const questionStartTimeRaw = optionTimestamps.A;
console.log(`\n✓ Question start (timer): ${questionStartTimeRaw}s\n`);

// ===== 2. ANSWER REVEAL =====
console.log('🎯 Finding Answer Reveal:');
// Find SECOND occurrence of answer (after option E, when he reveals it)
const answerRevealTimeRaw = findTimestamp(
  timestampsData.words,
  input.criticalMoments.answerReveal.split(' ')[0], // "Streptococcus"
  optionTimestamps.E + 2 // Start search AFTER option E
);
console.log(`  ✓ "${input.criticalMoments.answerReveal}" at ${answerRevealTimeRaw}s (after options)\n`);

// ===== 3. VIGNETTE HIGHLIGHTS =====
console.log('💊 Finding Vignette Highlights:');
const vignetteHighlightsWithTimestamps = input.vignetteHighlights.map((h, idx) => {
  const timestamp = findTimestamp(timestampsData.words, h.triggerWord);
  console.log(`  ${idx + 1}. "${h.phrase}" → trigger "${h.triggerWord}" at ${timestamp}s ${h.shouldShake ? '(SHAKE)' : ''}`);
  return {
    phrase: h.phrase,
    timestamp: timestamp,
    isCritical: h.shouldShake
  };
});
console.log('');

// ===== 4. TEACHING PHASES =====
console.log('📚 Finding Teaching Phases:');
const teachingPhasesWithTimestamps = input.teachingPhases.map((phase, phaseIdx) => {
  const startTime = findTimestamp(timestampsData.words, phase.startTrigger);
  console.log(`  Phase ${phaseIdx + 1}: "${phase.title}" starts at ${startTime}s`);

  if (phase.layout === 'pearl-card') {
    return {
      titleText: phase.title,
      startTime: startTime,
      layout: 'pearl-card',
      elements: phase.formula.map((item, idx) => {
        // Search AFTER phase start for formula items (to avoid earlier occurrences)
        const searchAfter = idx === 0 ? 0 : startTime;
        const ts = findTimestamp(timestampsData.words, item.triggerWord, searchAfter);
        console.log(`    - "${item.text}" at ${ts}s`);
        return {
          type: 'text',
          text: item.text,
          timestamp: ts,
          fontSize: item.text.length > 15 ? 32 : 38,
          isEquals: item.text === '=' || item.text === phase.formula[phase.formula.length - 1].text
        };
      })
    };
  } else {
    return {
      titleText: phase.title,
      startTime: startTime,
      layout: phase.layout,
      elements: phase.bullets.map(bullet => {
        const ts = findTimestamp(timestampsData.words, bullet.triggerWord);
        console.log(`    - "${bullet.text}" at ${ts}s`);
        return {
          type: 'bullet',
          text: bullet.text,
          timestamp: ts
        };
      })
    };
  }
});
console.log('');

// ===== 5. CONTEXTUAL MEME =====
const memeTimestamp = input.memes.contextual
  ? findTimestamp(timestampsData.words, input.memes.contextual.triggerWord)
  : null;

if (memeTimestamp) {
  console.log(`🎭 Contextual Meme: trigger "${input.memes.contextual.triggerWord}" at ${memeTimestamp}s\n`);
}

// ===== VALIDATION =====
console.log('=' .repeat(60));
console.log('VALIDATION CHECKS:\n');

const errors = [];
const warnings = [];

// Check all options found
Object.entries(optionTimestamps).forEach(([letter, timestamp]) => {
  if (!timestamp) {
    errors.push(`Option ${letter}) not found`);
  }
});

// Check answer reveal
if (!answerRevealTimeRaw) {
  errors.push(`Answer reveal "${input.criticalMoments.answerReveal}" not found`);
}

// Check options are sequential
const optionLetters = ['A', 'B', 'C', 'D', 'E'];
for (let i = 0; i < optionLetters.length - 1; i++) {
  const current = optionTimestamps[optionLetters[i]];
  const next = optionTimestamps[optionLetters[i+1]];

  if (current && next && current >= next) {
    errors.push(`Option ${optionLetters[i]}) at ${current}s comes AFTER ${optionLetters[i+1]}) at ${next}s`);
  }
}

// Check no highlights in first 3 seconds
vignetteHighlightsWithTimestamps.forEach((h, idx) => {
  if (h.timestamp && h.timestamp < 3.0) {
    warnings.push(`Vignette highlight #${idx+1} at ${h.timestamp}s is very early (first 3 seconds)`);
  }
});

// Check timer starts after vignettes
const latestVignetteTime = Math.max(...vignetteHighlightsWithTimestamps.map(h => h.timestamp || 0));
if (questionStartTimeRaw <= latestVignetteTime) {
  errors.push(`Timer starts at ${questionStartTimeRaw}s but latest vignette is at ${latestVignetteTime}s`);
}

// Check timer duration
const timerDuration = answerRevealTimeRaw - questionStartTimeRaw;
if (timerDuration < 8) {
  warnings.push(`Timer duration ${timerDuration}s is short (expected 8-20s)`);
} else if (timerDuration > 25) {
  warnings.push(`Timer duration ${timerDuration}s is long (expected 8-20s)`);
}

// Report
if (errors.length > 0) {
  console.log('❌ VALIDATION FAILED:\n');
  errors.forEach(err => console.log(`  ❌ ${err}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
  console.log('');
}

console.log('✅ TIMESTAMP DETECTION COMPLETE');
console.log(`   - ${Object.values(optionTimestamps).filter(Boolean).length}/5 options found`);
console.log(`   - ${vignetteHighlightsWithTimestamps.filter(h => h.timestamp).length}/${vignetteHighlightsWithTimestamps.length} vignette highlights found`);
console.log(`   - ${teachingPhasesWithTimestamps.length} teaching phases mapped`);
console.log(`   - Timer: ${timerDuration.toFixed(1)}s`);
console.log('\n   Ready for Agent 4 (Icon Selector)');

// Save output
const output = {
  questionStartTimeRaw,
  answerRevealTimeRaw,
  optionTimestamps,
  vignetteHighlights: vignetteHighlightsWithTimestamps,
  teachingPhases: teachingPhasesWithTimestamps,
  memeTimestamp,
  rawDuration: timestampsData.duration
};

fs.writeFileSync('timestamp-detection-output.json', JSON.stringify(output, null, 2));
console.log('\n📄 Saved: timestamp-detection-output.json');
