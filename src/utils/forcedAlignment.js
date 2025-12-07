const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// The exact script we want to align
const SCRIPT = `38-year-old woman. Can't breathe. Calcium: 11.2. That's high, by the way. What's causing this disaster? Look at this. She's got ankle pain. These red bumps on her shins. Erythema nodosum. Fancy name for nothing. Her eyes are inflamed. Chest x-ray shows bilateral hilar lymphadenopathy. Oh, and they did a biopsy. Noncaseating granulomas. How lovely. And get this. Calcium's at 11.2. Normal's 8.5 to 10. So her calcium's going up. On her lungs are going down. Don't make sense. Does it? So which mechanism explains it? A, B, C, D, E? Go ahead. Take a guess. I got all day. Still waiting. Tiktok. You're overthinking it. It's C. Of course it's C. Increased one alpha-hydroxylase activity. Nobody ever picks C. All right, listen. Sarcoidosis makes granulomas. Those granulomas activate vitamin D with one alpha-hydroxylase. More active vitamin D means the gut grabs more calcium so her lungs are amassed. But calcium goes up. Backwards, right? Look, this stuff's confusing. That's why they test it. If you want more breakdowns like this, check out synaptic recall. Makes it easier. Now go study. I got a crossword to finish.`;

// Read the Whisper-generated timestamps
function performForcedAlignment(audioPath, timestampsPath) {
  const whisperTimestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf-8'));

  // Split script into expected words (ONLY words, no punctuation)
  const scriptWords = SCRIPT
    .split(/\s+/)
    .filter(w => w.trim().length > 0 && /[a-zA-Z0-9]/.test(w));

  // Match Whisper words to script words using fuzzy matching
  const alignedWords = [];
  let scriptIndex = 0;

  for (const whisperWord of whisperTimestamps.words) {
    const cleanWhisper = whisperWord.word.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Skip if it's just punctuation
    if (!cleanWhisper || cleanWhisper.length === 0) {
      continue;
    }

    // Find best matching script word
    while (scriptIndex < scriptWords.length) {
      const scriptWord = scriptWords[scriptIndex];
      const cleanScript = scriptWord.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (cleanWhisper === cleanScript ||
          cleanWhisper.includes(cleanScript) ||
          cleanScript.includes(cleanWhisper)) {

        alignedWords.push({
          word: scriptWord, // Use the script word (with proper capitalization/punctuation)
          start: whisperWord.start,
          end: whisperWord.end,
        });
        scriptIndex++;
        break;
      }
      scriptIndex++;
    }
  }

  // Save aligned timestamps
  const outputPath = path.join(__dirname, '../assets/audio/aligned-timestamps.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    script: SCRIPT,
    words: alignedWords,
  }, null, 2));

  console.log(`✅ Forced alignment complete!`);
  console.log(`📝 Aligned ${alignedWords.length} words from script`);
  console.log(`💾 Saved to: ${outputPath}`);

  return { script: SCRIPT, words: alignedWords };
}

// Run if called directly
if (require.main === module) {
  const timestampsPath = path.join(__dirname, '../assets/audio/timestamps.json');
  const audioPath = path.join(__dirname, '../assets/audio/narration.mp3');

  if (!fs.existsSync(timestampsPath)) {
    console.error('❌ timestamps.json not found. Run generate-timestamps first.');
    process.exit(1);
  }

  performForcedAlignment(audioPath, timestampsPath);
}

module.exports = { performForcedAlignment };
