const fs = require('fs');
const path = require('path');

const topic = 'bph-5-alpha-reductase';
const input = require('./input-bph-5-alpha-reductase.json');
const timestampsData = require('./public/assets/audio/bph-5-alpha-reductase-timestamps.json');

console.log('🔍 AGENT 3: TIMESTAMP DETECTIVE - EXACT MATCHING');
console.log(`📊 Loaded ${timestampsData.words.length} words, duration: ${timestampsData.duration.toFixed(2)}s\n`);

// ===== EXACT MATCHING FUNCTION =====
function findTimestamp(words, searchText, startAfter = 0) {
  const search = searchText.toLowerCase().trim();

  // CRITICAL: For option letters (A?, B?, C?, D?, E?), EXACT match ONLY
  // This prevents "A?" from matching the "a" in "have a"
  if (/^[a-e]\?$/i.test(searchText)) {
    for (let i = 0; i < words.length; i++) {
      const word = words[i].word.toLowerCase().trim();

      // EXACT match required: "a?" must equal "a?" exactly
      if (word === search && words[i].start >= startAfter) {
        return words[i].start;
      }
    }
    return null;
  }

  // For other words: match whole words or compound words
  const normalized = searchText.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < words.length; i++) {
    const word = words[i].word.toLowerCase().replace(/[^a-z0-9]/g, '');

    // EXACT match or starts with (for compound words like "sixty-five" matching "sixty")
    if (word === normalized && words[i].start >= startAfter) {
      return words[i].start;
    }

    // Allow partial match for compound words (e.g., "SIXTY" matches "SIXTY-FIVE")
    if (word.startsWith(normalized) && word.length > normalized.length && words[i].start >= startAfter) {
      return words[i].start;
    }
  }

  return null;
}

// ===== 1. AUTO-DETECT OPTIONS WITH EXACT MATCHING =====
console.log('📍 Finding option timestamps (EXACT MATCH for "A?" format)...');
const optionTimestamps = {
  A: findTimestamp(timestampsData.words, "A?"),
  B: findTimestamp(timestampsData.words, "B?"),
  C: findTimestamp(timestampsData.words, "C?"),
  D: findTimestamp(timestampsData.words, "D?"),
  E: findTimestamp(timestampsData.words, "E?"),
};

console.log(`  A) at ${optionTimestamps.A?.toFixed(3) || 'NOT FOUND'}s`);
console.log(`  B) at ${optionTimestamps.B?.toFixed(3) || 'NOT FOUND'}s`);
console.log(`  C) at ${optionTimestamps.C?.toFixed(3) || 'NOT FOUND'}s`);
console.log(`  D) at ${optionTimestamps.D?.toFixed(3) || 'NOT FOUND'}s`);
console.log(`  E) at ${optionTimestamps.E?.toFixed(3) || 'NOT FOUND'}s\n`);

// CRITICAL: Timer starts at FIRST OPTION (not question phrase)
const questionStartTimeRaw = optionTimestamps.A;

// ===== 2. ANSWER REVEAL =====
console.log('📍 Finding answer reveal...');
const answerRevealTimeRaw = findTimestamp(
  timestampsData.words,
  input.criticalMoments.answerReveal.split(' ')[0]  // "Five-alpha-reductase" → "Five"
);
console.log(`  "${input.criticalMoments.answerReveal}" at ${answerRevealTimeRaw?.toFixed(3) || 'NOT FOUND'}s\n`);

// ===== 3. VIGNETTE HIGHLIGHTS =====
console.log('📍 Finding vignette highlights...');
const vignetteHighlightsWithTimestamps = input.vignetteHighlights.map((h, idx) => {
  // For vignette highlights, search AFTER the opening (after 5 seconds)
  // This avoids matching "seven" in "Seventy-year-old"
  const timestamp = findTimestamp(timestampsData.words, h.triggerWord, 5.0);
  console.log(`  [${idx+1}] "${h.phrase}" → trigger "${h.triggerWord}" at ${timestamp?.toFixed(3) || 'NOT FOUND'}s`);
  return {
    phrase: h.phrase,
    timestamp: timestamp,
    isCritical: h.shouldShake
  };
});
console.log();

// ===== 4. TEACHING PHASES =====
console.log('📍 Finding teaching phases...');
const teachingPhasesWithTimestamps = input.teachingPhases.map((phase, phaseIdx) => {
  // For teaching phases, search AFTER answer reveal (~50s for this video)
  const startTime = findTimestamp(timestampsData.words, phase.startTrigger, answerRevealTimeRaw || 50);
  console.log(`  Phase ${phaseIdx + 1}: "${phase.title}" starts at "${phase.startTrigger}" → ${startTime?.toFixed(3) || 'NOT FOUND'}s`);

  if (phase.layout === 'pearl-card') {
    return {
      titleText: phase.title,
      startTime: startTime,
      layout: 'pearl-card',
      elements: phase.formula.map((item, elemIdx) => {
        // For formula elements, search after the phase starts
        const timestamp = findTimestamp(timestampsData.words, item.triggerWord, startTime || 0);
        console.log(`    [${elemIdx+1}] "${item.text}" → "${item.triggerWord}" at ${timestamp?.toFixed(3) || 'NOT FOUND'}s`);
        return {
          type: 'text',
          text: item.text,
          timestamp: timestamp,
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
      elements: phase.bullets.map((bullet, elemIdx) => {
        // For bullets, search after the phase starts
        const timestamp = findTimestamp(timestampsData.words, bullet.triggerWord, startTime || 0);
        console.log(`    [${elemIdx+1}] "${bullet.text}" → "${bullet.triggerWord}" at ${timestamp?.toFixed(3) || 'NOT FOUND'}s`);
        return {
          type: 'bullet',
          text: bullet.text,
          timestamp: timestamp,
          // Icons will be assigned by Agent 4
        };
      })
    };
  }
});
console.log();

// ===== 5. CONTEXTUAL MEME =====
const memeTimestamp = input.memes.contextual
  ? findTimestamp(timestampsData.words, input.memes.contextual.triggerWord)
  : null;

if (memeTimestamp) {
  console.log(`📍 Contextual meme "${input.memes.contextual.memeId}" at "${input.memes.contextual.triggerWord}" → ${memeTimestamp.toFixed(3)}s\n`);
}

// ===== 6. VALIDATE ALL TIMESTAMPS FOUND =====
console.log('✅ VALIDATION CHECKS:\n');

const missingTimestamps = [];
if (!questionStartTimeRaw) missingTimestamps.push('Option A) (question start)');
if (!answerRevealTimeRaw) missingTimestamps.push(`Answer reveal: "${input.criticalMoments.answerReveal}"`);

Object.entries(optionTimestamps).forEach(([letter, timestamp]) => {
  if (!timestamp) missingTimestamps.push(`Option ${letter})`);
});

vignetteHighlightsWithTimestamps.forEach((h, idx) => {
  if (!h.timestamp) {
    missingTimestamps.push(`Vignette highlight #${idx+1}: trigger "${input.vignetteHighlights[idx].triggerWord}"`);
  }
});

teachingPhasesWithTimestamps.forEach((phase, idx) => {
  if (!phase.startTime) {
    missingTimestamps.push(`Teaching phase #${idx+1} start: trigger "${input.teachingPhases[idx].startTrigger}"`);
  }
  phase.elements.forEach((elem, elemIdx) => {
    if (!elem.timestamp) {
      const trigger = input.teachingPhases[idx].layout === 'pearl-card'
        ? input.teachingPhases[idx].formula[elemIdx].triggerWord
        : input.teachingPhases[idx].bullets[elemIdx].triggerWord;
      missingTimestamps.push(`Teaching phase #${idx+1}, element #${elemIdx+1}: trigger "${trigger}"`);
    }
  });
});

if (missingTimestamps.length > 0) {
  console.error('❌ MISSING TIMESTAMPS:');
  missingTimestamps.forEach(msg => console.error(`  - ${msg}`));
  console.error('\n🛑 STOPPING: Cannot proceed without all timestamps');
  process.exit(1);
}

console.log('✅ All timestamps found\n');

// ===== 7. SEQUENTIAL VALIDATION =====
console.log('✅ Validating sequential order...');
const optionLetters = ['A', 'B', 'C', 'D', 'E'];
for (let i = 0; i < optionLetters.length - 1; i++) {
  const current = optionTimestamps[optionLetters[i]];
  const next = optionTimestamps[optionLetters[i+1]];

  if (current >= next) {
    console.error(`❌ Option ${optionLetters[i]}) at ${current}s comes AFTER ${optionLetters[i+1]}) at ${next}s`);
    console.error('This indicates wrong timestamp detection');
    process.exit(1);
  }
}
console.log('✅ Options are sequential (A < B < C < D < E)\n');

// ===== 8. NO HIGHLIGHTS IN FIRST 3 SECONDS =====
console.log('✅ Checking for early highlights...');
const earlyHighlights = vignetteHighlightsWithTimestamps.filter(h => h.timestamp < 3.0);
if (earlyHighlights.length > 0) {
  console.warn('⚠️  WARNING: Highlights in first 3 seconds:');
  earlyHighlights.forEach(h => {
    console.warn(`  - "${h.phrase}" at ${h.timestamp.toFixed(3)}s (during opening)`);
  });
  console.warn('These may appear during "GOOD LORD ALMIGHTY"\n');
} else {
  console.log('✅ No highlights in first 3 seconds\n');
}

// ===== 9. TIMER STARTS AFTER VIGNETTES =====
console.log('✅ Validating timer timing...');
const latestVignetteTime = Math.max(...vignetteHighlightsWithTimestamps.map(h => h.timestamp));

if (questionStartTimeRaw <= latestVignetteTime) {
  console.error(`❌ Timer starts at ${questionStartTimeRaw}s but latest vignette is at ${latestVignetteTime}s`);
  console.error('Timer must start AFTER all vignettes');
  process.exit(1);
}
console.log(`✅ Timer (${questionStartTimeRaw.toFixed(2)}s) starts after vignettes (${latestVignetteTime.toFixed(2)}s)\n`);

// ===== 10. SAVE OUTPUT =====
const outputPath = path.join(__dirname, `timestamps-detected-${topic}.json`);
const output = {
  questionStartTimeRaw,
  answerRevealTimeRaw,
  optionTimestamps,
  vignetteHighlights: vignetteHighlightsWithTimestamps,
  teachingPhases: teachingPhasesWithTimestamps,
  memeTimestamp,
  rawDuration: timestampsData.duration,
  validation: {
    allFound: true,
    optionsSequential: true,
    timerAfterVignettes: true,
    earlyHighlightsCount: earlyHighlights.length
  }
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`💾 Saved timestamp map: ${outputPath}`);
console.log('\n✅ AGENT 3 COMPLETE - All timestamps detected and validated');
