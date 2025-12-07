const fs = require('fs');
const path = require('path');

const timestampsData = require('./public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json');

function findTimestamp(words, searchText, startAfter = 0) {
  const normalized = searchText.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < words.length; i++) {
    const word = words[i].text.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (word.includes(normalized) && words[i].start >= startAfter) {
      return words[i].start;
    }
  }

  console.warn(`⚠️  Could not find "${searchText}"`);
  return null;
}

console.log('🔍 Auto-detecting timestamps...\n');

// Question flow
const questionStartTimeRaw = findTimestamp(timestampsData.words, 'Think');
const answerRevealTimeRaw = findTimestamp(timestampsData.words, 'HORNSWOGGLED');

console.log('Question Flow:');
console.log('  questionStart:', questionStartTimeRaw, '("Think")');
console.log('  answerReveal:', answerRevealTimeRaw, '("HORNSWOGGLED")');

// Options (auto-detect)
const optionTimestamps = {
  A: findTimestamp(timestampsData.words, 'A?'),
  B: findTimestamp(timestampsData.words, 'B?'),
  C: findTimestamp(timestampsData.words, 'C?'),
  D: findTimestamp(timestampsData.words, 'D?'),
  E: findTimestamp(timestampsData.words, 'E?'),
};

console.log('\nOption Timestamps:');
Object.entries(optionTimestamps).forEach(([letter, time]) => {
  console.log(`  ${letter}:`, time);
});

// Vignette highlights
const vignetteHighlights = [
  { phrase: "Face puffed up", triggerWord: "BALLOON", isCritical: false },
  { phrase: "frothy", triggerWord: "FROTHY", isCritical: false },
  { phrase: "4+ g/day", triggerWord: "four", isCritical: true },
  { phrase: "1.8 g/dL", triggerWord: "one", isCritical: true },
].map(h => ({
  ...h,
  timestamp: findTimestamp(timestampsData.words, h.triggerWord)
}));

console.log('\nVignette Highlights:');
vignetteHighlights.forEach(h => {
  const critical = h.isCritical ? '🔴 CRITICAL' : '';
  console.log(`  "${h.phrase}" @ ${h.timestamp}s (${h.triggerWord}) ${critical}`);
});

// Meme
const memeTimestamp = findTimestamp(timestampsData.words, 'FROTHY');
console.log('\nMeme Trigger:');
console.log('  beer-foam @', memeTimestamp, 's ("FROTHY")');

// Teaching Phase 1
const phase1Start = findTimestamp(timestampsData.words, 'proteinuria');
console.log('\nTeaching Phase 1 (Pearl Card):');
console.log('  startTime:', phase1Start, '("proteinuria")');

// Teaching Phase 2
const phase2Start = findTimestamp(timestampsData.words, 'youngsters');
console.log('\nTeaching Phase 2 (Split View):');
console.log('  startTime:', phase2Start, '("youngsters")');

// Critical shake moment
const criticalMoment = vignetteHighlights.find(h => h.isCritical);
console.log('\nBrain Mascot Shock:');
console.log('  shockMoment:', criticalMoment.timestamp, 's');

console.log('\n✅ All timestamps detected!');
console.log('📊 Duration:', timestampsData.duration, 'seconds raw');
console.log('📊 At 1.8x:', (timestampsData.duration / 1.8).toFixed(2), 'seconds perceived');
