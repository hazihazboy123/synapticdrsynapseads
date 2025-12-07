require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const cleanScript = `Oh for cryin' out loud. 42-year-old diabetic. Stops his insulin. GENIUS move. Now his FACE is rotting off. Black. Necrotic. Dead tissue. Just hangin' there on his nose.

Let me spell this out since apparently nobody teaches this anymore. Blurry vision. Facial pain. They biopsy it and what do they see? Broad non-septated hyphae. Right angles. That's your smoking gun right there.

His glucose? 480. Ketones? Sky high. pH? 7.1. But here's what you're MISSING—this fungus LOVES diabetic ketoacidosis. It's having a PARTY in there.

So what's eating his face? A? B? C? D? E? Think real hard. I'll wait. Ticktock. Your patient's losing more face by the second.

How is this even HARD?

It's D. Mucormycosis. It's ALWAYS Mucormycosis when you see black necrotic tissue in DKA. And I KNOW half of you picked Aspergillus. You did. 'Cause they're BOTH molds. But Aspergillus? Septated hyphae. 45-degree angles. Neat and tidy. Mucor? Broad. Non-septated. Right angles. UGLY. That's how you tell 'em apart.

Alright, listen. DKA CRASHES your white blood cells. Phagocytes just STOP working. Acidosis KICKS OUT all the iron from your transferrin—free buffet for Mucor. This fungus needs iron like you need oxygen. So it INVADES from sinuses to eyes to BRAIN. Unstoppable once it starts.

Look, I seen this kill people in 48 hours. Healthy-ish diabetic Tuesday, dead Thursday. So don't miss it.`;

  const outputPath = 'src/assets/audio/mucormycosis-narration.mp3';

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

  const timestampsPath = 'src/assets/audio/mucormycosis-aligned-timestamps.json';
  fs.writeFileSync(timestampsPath, JSON.stringify({
    script: cleanScript,
    words: wordTimestamps,
  }, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);
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
