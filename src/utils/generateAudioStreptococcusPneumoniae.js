require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const TOPIC = 'streptococcus-pneumoniae-lobar-pneumonia';

async function generateAudio() {
  const cleanScript = `GOOD LORD ALMIGHTY, this man's COUGHING UP RUST! Sixty-two-year-old fella, fever of ONE-OH-FOUR, shaking like a dog passing razor blades. Been hacking up GUNK that looks like he swallowed a handful of RUSTY NAILS. Right lung's WHITE as a GHOST on chest X-ray, solid as a BRICK of concrete. Got a productive cough spewing RUST-COLORED sputum, temperature COOKING him at one-hundred-four Fahrenheit, and his right lower lobe's completely CONSOLIDATED. Looks like someone poured CEMENT into his lung. Sputum gram stain shows gram-positive LANCET-SHAPED diplococci, lined up like little TORPEDOES ready to WRECK more tissue. Now here's your question: What pathogen's TURNING this man's lung to STONE? A) Klebsiella pneumoniae. B) Mycoplasma pneumoniae. C) Streptococcus pneumoniae. D) Haemophilus influenzae. E) Legionella pneumophila. Well SLAP MY KNEE, it's C, Streptococcus pneumoniae. That RUSTY sputum's your dead giveaway. Most you BAMBOOZLED youngsters went with A? HOGWASH. Now pipe down and I'll learn you somethin'. That RUST you're seeing? That's red blood cells getting CHEWED UP in the alveoli and SPIT OUT as degraded hemoglobin. Strep pneumo LOVES to cause LOBAR pneumonia, fills ONE WHOLE LOBE with inflammatory GUNK until it's solid as a ROCK. This bug's the NUMBER ONE cause of community-acquired pneumonia, and that rusty sputum's PATHOGNOMONIC. Treat with a beta-lactam like ceftriaxone or amoxicillin, and for Pete's sake, don't DILLY-DALLY. Man's lung's already turned to CONCRETE.`;

  const outputPath = `public/assets/audio/${TOPIC}-narration.mp3`;

  console.log('🎙️ AGENT 2: AUDIO GENERATOR');
  console.log(`Script: ${cleanScript.split(/\s+/).length} words\n`);
  console.log('Calling ElevenLabs API (ONE CALL ONLY)...\n');

  const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
    text: cleanScript,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.35,
      similarity_boost: 0.80,
      style: 0.85,
      use_speaker_boost: true
    }
  });

  // Save audio
  const audioBuffer = Buffer.from(response.audioBase64, 'base64');
  fs.writeFileSync(outputPath, audioBuffer);
  console.log('✅ Audio saved:', outputPath);

  // Convert to word timestamps
  const wordTimestamps = convertToWordTimestamps(cleanScript, response.alignment);

  const timestampsPath = `public/assets/audio/${TOPIC}-timestamps.json`;
  fs.writeFileSync(timestampsPath, JSON.stringify({
    topic: TOPIC,
    duration: response.alignment.characterEndTimesSeconds[response.alignment.characterEndTimesSeconds.length - 1],
    words: wordTimestamps,
  }, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);
  console.log(`✅ Duration: ${response.alignment.characterEndTimesSeconds[response.alignment.characterEndTimesSeconds.length - 1]}s`);
  console.log(`✅ Parsed: ${wordTimestamps.length} words\n`);
  console.log('✅ AUDIO GENERATION COMPLETE');
  console.log('   Ready for Agent 3 (Timestamp Detective)');
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

  // Add the last word
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
