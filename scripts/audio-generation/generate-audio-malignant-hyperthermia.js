require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio(text, outputPath) {
  console.log('🎙️  Generating audio with Grandpa Spuds...');

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.80,
        style: 0.85,
        use_speaker_boost: true
      }
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const audioBuffer = Buffer.from(response.audioBase64, 'base64');
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`✅ Audio saved to ${outputPath}`);

    // Save word timestamps
    const wordTimestamps = convertToWordTimestamps(text, response.alignment);
    const timestampsPath = outputPath.replace('.mp3', '-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: text,
      words: wordTimestamps,
    }, null, 2));
    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${wordTimestamps.length} word timestamps`);

    return outputPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

function convertToWordTimestamps(text, alignment) {
  const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = alignment;
  const words = [];
  let currentWord = '';
  let wordStartTime = null;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const startTime = characterStartTimesSeconds[i];

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
    } else {
      if (!currentWord) {
        wordStartTime = startTime;
      }
      currentWord += char;
    }
  }

  if (currentWord) {
    words.push({
      word: currentWord,
      start: wordStartTime,
      end: characterEndTimesSeconds[characterEndTimesSeconds.length - 1],
    });
  }

  return words;
}

// MALIGNANT HYPERTHERMIA SCRIPT - THE MASTERPIECE
// Topic: Routine surgery → temp 107°F → Dantrolene
// Wrong answer: Cooling blankets (LOL)
// Meme goldmine: "muscles cooking from the inside"

const malignantHyperthermiaScript = `Good LORD, this man walked in for a HERNIA repair. A HERNIA. Routine as a HAIRCUT. Now his temperature's ONE HUNDRED AND SEVEN and his muscles are HARDER than my ex-wife's HEART. Anesthesiologist gave him succinylcholine and this fella went RIGID as a FENCE POST. Temperature's CLIMBING faster than my blood pressure at a FAMILY REUNION, and the OR is in full PANIC mode. What do you SLAM into this man before he COOKS alive on the table? A) Tylenol. B) Cooling blankets. C) Dantrolene. D) Beta blockers. E) Epinephrine. Clock's TICKIN'. It's C, DANTROLENE! And PLEASE tell me none of you BUFFOONS picked cooling BLANKETS. His muscles are COOKING themselves from the INSIDE. A blanket? That's like fighting a HOUSE FIRE with a SQUIRT GUN. Dantrolene blocks the calcium channels, muscles RELAX, temperature DROPS. Two point five milligrams per kilo, IV push, and PRAY you caught it in time. Now GET OUT and read a CHART once in a while.`;

const outputPath = path.join(__dirname, 'public/assets/audio/malignant-hyperthermia-narration.mp3');

generateAudio(malignantHyperthermiaScript, outputPath)
  .then(() => console.log('🎉 Done! Malignant Hyperthermia audio ready for Remotion.'))
  .catch((err) => console.error(err));
