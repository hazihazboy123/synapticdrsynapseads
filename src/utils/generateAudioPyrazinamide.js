require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const cleanScript = `What in tarnation? 32 year old woman. Pulmonary TB. Started on RIPE therapy. Three weeks later she's YELLOW as a dandelion, VEXED by nausea, and so FATIGUED she can't get out of bed.

Labs come back. ALT 850. AST 720. Uric acid 9.2. Bilirubin through the roof. Somebody's liver is gettin' TORCHED and everyone's BEFUDDLED about which drug did it.

So which medication is most likely causin' this CATASTROPHE? A? B? C? D? E? Think on it... One of these drugs is downright ORNERY to the liver. I'll wait.

The answer? D. Pyrazinamide. And I RECKON half you got BAMBOOZLED by A rifampin. That's HOGWASH.

Alright, FINE. Here's how PZA WRECKS havoc. It's a prodrug. Needs an enzyme called pyrazinamidase to CONVERT it into pyrazinoic acid. That's the active form that DISRUPTS bacterial membrane transport and DROPS the pH inside the bug till it can't survive. Works PECULIAR well in acidic environments like abscesses.

But here's the PITIFUL part. PZA OBLITERATES hepatocytes. Dose dependent hepatotoxicity happens in 15 percent of folks. Also CRANKS UP uric acid by blockin' renal excretion. That's why she's got hyperuricemia.

If the liver enzymes go above three times normal, you YANK the drug. Don't be FLUMMOXED by this one on boards. Yellow patient plus hyperuricemia plus recent TB treatment equals PZA toxicity.

Now skedaddle.`;

  const outputDir = path.join(__dirname, '../../public/assets/audio');
  const outputPath = path.join(outputDir, 'pyrazinamide-narration.mp3');

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

  const timestampsPath = path.join(outputDir, 'pyrazinamide-timestamps.json');
  fs.writeFileSync(timestampsPath, JSON.stringify({
    topic: 'pyrazinamide',
    audio_file: 'pyrazinamide-narration.mp3',
    script: cleanScript,
    words: wordTimestamps,
  }, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);

  // Print key trigger words for meme placement
  console.log('\n📍 Key trigger word timestamps:');
  const triggerWords = ['TORCHED', 'Think', 'RECKON', 'RIPE', 'YELLOW', '850', '9.2'];
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
