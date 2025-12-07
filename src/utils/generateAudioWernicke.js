require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const cleanScript = `What in tarnation. 54 year old guy. Drank a fifth of vodka every single day for 20 years. Now he's confused, stumbling around, eyes doing some weird dance. Mental status? TANKED.

ER doc's already reaching for the dextrose. I'm SURE that's a brilliant idea.

What do you give FIRST? A? B? C? D? E? Think about it... Give the wrong thing and his brain's a goner.

It's D. Course it is. Thiamine first. Always thiamine first. And I KNOW half of y'all just killed this man with sugar water.

Alright FINE. This is Wernicke encephalopathy. Classic triad. Confusion. Ataxia. Ophthalmoplegia. His brain is STARVING for thiamine. Here's the thing. Glucose needs thiamine to do its job. You slam dextrose first? You BURN through whatever thiamine he's got left. Brain CRASHES. Permanent damage. Korsakoff syndrome. He'll be confabulating stories til the day he dies.

Thiamine first. Then the sugar.

Now get outta here. And put down the bottle.`;

  const outputPath = 'public/assets/audio/wernicke-narration.mp3';

  console.log('🎙️ Generating audio with ElevenLabs...');

  const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
    text: cleanScript,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.58,
      similarity_boost: 0.82,
      style: 0.68,
      use_speaker_boost: true
    }
  });

  // Save audio
  const audioBuffer = Buffer.from(response.audioBase64, 'base64');
  fs.writeFileSync(outputPath, audioBuffer);
  console.log('✅ Audio saved:', outputPath);

  // Convert to word timestamps
  const wordTimestamps = convertToWordTimestamps(cleanScript, response.alignment);

  const timestampsPath = 'public/assets/audio/wernicke-timestamps.json';
  fs.writeFileSync(timestampsPath, JSON.stringify(wordTimestamps, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);

  // Log total duration
  const lastWord = wordTimestamps[wordTimestamps.length - 1];
  console.log(`\n📊 Audio duration: ${lastWord.end.toFixed(2)} seconds`);
  console.log(`📊 At 1.85x playback: ${(lastWord.end / 1.85).toFixed(2)} seconds`);
  console.log(`📊 Total frames at 30fps: ${Math.floor((lastWord.end / 1.85) * 30)} frames`);
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
      if (!currentWord) wordStartTime = startTime;
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

generateAudio().catch(console.error);
