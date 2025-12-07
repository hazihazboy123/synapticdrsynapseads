const fs = require('fs');
const path = require('path');

// Convert character-level timestamps to word-level
function convertToWordTimestamps(text, alignment) {
  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = alignment;

  const words = [];
  let currentWord = '';
  let wordStartTime = null;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const startTime = characterStartTimesSeconds[i];
    const endTime = characterEndTimesSeconds[i];

    // If it's a space or newline, end the current word
    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      if (currentWord) {
        words.push({
          word: currentWord,
          start: wordStartTime,
          end: characterEndTimesSeconds[i - 1],
        });
        currentWord = '';
        wordStartTime = null;
      }
    }
    // Otherwise, add to current word
    else {
      if (!currentWord) {
        wordStartTime = startTime;
      }
      currentWord += char;
    }
  }

  // Add the last word if there is one
  if (currentWord) {
    words.push({
      word: currentWord,
      start: wordStartTime,
      end: characterEndTimesSeconds[characterEndTimesSeconds.length - 1],
    });
  }

  return words;
}

// Re-parse existing character data
const characterDataPath = path.join(__dirname, '../assets/audio/character-timestamps.json');
const outputPath = path.join(__dirname, '../assets/audio/aligned-timestamps.json');

if (!fs.existsSync(characterDataPath)) {
  console.error('❌ character-timestamps.json not found!');
  console.log('You need to run: npm run generate-audio first');
  process.exit(1);
}

console.log('📝 Re-parsing character timestamps into word timestamps...');

const data = JSON.parse(fs.readFileSync(characterDataPath, 'utf-8'));
const wordTimestamps = convertToWordTimestamps(data.script, data.alignment);

fs.writeFileSync(outputPath, JSON.stringify({
  script: data.script,
  words: wordTimestamps,
}, null, 2));

console.log(`✅ Re-parsed ${wordTimestamps.length} words`);
console.log(`💾 Saved to: ${outputPath}`);
console.log('\n📊 Sample words:');
wordTimestamps.slice(0, 10).forEach(w => {
  console.log(`  "${w.word}" - ${w.start.toFixed(3)}s to ${w.end.toFixed(3)}s`);
});
