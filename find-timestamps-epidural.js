const fs = require('fs');

const timestamps = JSON.parse(fs.readFileSync('public/assets/audio/epidural-hematoma-timestamps.json', 'utf8'));
const input = JSON.parse(fs.readFileSync('input-epidural-hematoma.json', 'utf8'));

console.log('🔍 AGENT 3: TIMESTAMP DETECTIVE\n');

// Find exact matches for options A) B) C) D) E)
const findWord = (word) => {
  const found = timestamps.words.find(w => w.word === word);
  return found ? found.start : null;
};

const optionTimestamps = {
  A: findWord('A?'),
  B: findWord('B?'),
  C: findWord('C?'),
  D: findWord('D?'),
  E: findWord('E?')
};

console.log('Option Timestamps:', optionTimestamps);

// Find answer reveal - "Middle MENINGEAL"
const answerReveal = findWord('MENINGEAL');
console.log('Answer Reveal:', answerReveal);

// Find contextual meme trigger
const contextualMeme = findWord('LENS');
console.log('Contextual Meme (LENS):', contextualMeme);

// Find all vignette triggers
const vignetteTimestamps = input.vignetteHighlights.map(h => ({
  ...h,
  timestamp: findWord(h.triggerWord)
}));
console.log('\nVignette Highlights:', vignetteTimestamps);

// Find all teaching triggers  
const teachingTimestamps = input.teachingPhases.map(phase => ({
  ...phase,
  phaseStartTime: findWord(phase.startTrigger),
  bullets: phase.bullets.map(b => ({
    ...b,
    timestamp: findWord(b.triggerWord)
  }))
}));

console.log('\n✅ AGENT 3 COMPLETE');

fs.writeFileSync('timestamps-detected-epidural-hematoma.json', JSON.stringify({
  optionTimestamps,
  questionStartTimeRaw: optionTimestamps.A,
  answerRevealTimeRaw: answerReveal,
  contextualMemeTimestamp: contextualMeme,
  vignetteTimestamps,
  teachingTimestamps
}, null, 2));
