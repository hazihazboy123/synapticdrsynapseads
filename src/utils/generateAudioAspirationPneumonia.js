require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const cleanScript = `Lord have mercy, this fella coughs up somethin' that smells so PUTRID it'd make a carrion crow KEEL OVER. 55 year old man. Chronic drunk. Passed out at home three sheets to the wind. Wakes up BEFUDDLED with fever and a cough that sounds like a gravel truck.

ER does a chest x ray. Right lower lobe infiltrate. Sputum culture shows mixed flora that's got everyone FLUMMOXED. Back in my day this pattern would VEXED nobody, but nowadays you youngsters are CONFOUNDED by the simplest clues.

So what's causin' all this RUCKUS? A? B? C? D? E? Think about it... Bet you a sawbuck you get BAMBOOZLED. It ain't like his lung is turnin' into a cesspool or nothin'.

Well I'll be HORNSWOGGLED if it ain't C. Aspiration pneumonia. And I reckon half you picked A and got yourselves HOODWINKED.

Alright, FINE. Here's the whole CATASTROPHE. Fella drinks himself ORNERY as a wet cat. Gag reflex? PLUMB GONE. He RETCHES while unconscious. Then CHOKES on his own vomit and SUCKS it straight down into his lungs. Now here's the PECULIAR part. Right main bronchus is more vertical than the left, so gravity DUMPS all that FETID mess into the right lower lobe. Oral anaerobes FEAST on it like hogs at a trough and make it REEK somethin' FIERCE. Boards love this cause y'all get DISCOMBOBULATED every time. Foul sputum plus aspiration risk equals right lower lobe infection. Pay attention.

Now skedaddle.`;

  const outputDir = path.join(__dirname, '../../public/assets/audio');
  const outputPath = path.join(outputDir, 'aspiration-pneumonia-narration.mp3');

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

  const timestampsPath = path.join(outputDir, 'aspiration-pneumonia-timestamps.json');
  fs.writeFileSync(timestampsPath, JSON.stringify({
    topic: 'aspiration-pneumonia',
    audio_file: 'aspiration-pneumonia-narration.mp3',
    script: cleanScript,
    words: wordTimestamps,
  }, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);

  // Print key trigger words for meme placement
  console.log('\n📍 Key trigger word timestamps:');
  const triggerWords = ['wind', 'PECULIAR', 'HORNSWOGGLED', 'DISCOMBOBULATED', 'Think'];
  wordTimestamps.forEach(w => {
    if (triggerWords.some(t => w.word.includes(t))) {
      console.log(`  "${w.word}": ${w.start.toFixed(2)}s`);
    }
  });
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
