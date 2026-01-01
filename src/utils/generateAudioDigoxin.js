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

// DIGOXIN TOXICITY SCRIPT
const digoxinScript = `GOOD LORD, grandma doubled her heart pills 'cause she FORGOT she already took 'em, and now she's seein' YELLOW HALOS around the TV like she's on an ACID TRIP and her heart's beatin' THIRTY-EIGHT times a minute. BLESS HER HEART, she's one bad rhythm away from a CLOSED CASKET. Vomitin' EVERYWHERE, confused as HELL, potassium's TWO POINT NINE, and her EKG looks like modern ART. So what do you give her before she FLATLINES on the kitchen floor? A) Calcium gluconate. B) Atropine. C) Digoxin immune Fab. D) Lidocaine. E) Magnesium sulfate. TICK TOCK, grandma's DYIN'. And I KNOW half you MORONS reached for calcium. CONGRATULATIONS, you just MURDERED someone's GRANDMOTHER. Calcium makes dig tox WORSE, you ABSOLUTE WALNUT. It's C, DigiFab! Binds the digoxin, YANKS it out, grandma LIVES. Now SCRAM.`;

const outputPath = path.join(__dirname, '../../public/assets/audio/digoxin-narration.mp3');

generateAudio(digoxinScript, outputPath)
  .then(() => console.log('🎉 Done! Digoxin audio ready for Remotion.'))
  .catch((err) => console.error(err));
