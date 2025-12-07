require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const cleanScript = `MISS THIS and your patient DIES. Sixty two year old man. WEAK. PATHETIC. Can barely walk to the mailbox.
Forty pack years of smoking. That's two packs a day for twenty years for you youngsters who can't do math. Coughing up BLOOD for three months. Chest x-ray shows a big CRUSTY white mass. Right in the MIDDLE of his lung. Central location. FLAKY like old paint.
But wait. Gets BETTER. Calcium is fifteen point eight. Should be eight to ten. Kidneys working fine. Parathyroid hormone is LOW. Now that's PECULIAR as all get out.
So let's see what you got. A? Adenocarcinoma with bone mets. B? Small cell with SIADH. C? Hyperparathyroidism. D? Squamous cell with PTHrP. E? Large cell carcinoma. Clock's ticking...
Well SLAP MY KNEE, it's D. Squamous cell carcinoma. I bet you BAMBOOZLED fools picked adenocarcinoma. WRONG. Dead wrong. Adenocarcinomas hide in the CORNERS. This beast is DEAD CENTER.
Here's what you missed. Squamous cells DUMP out this ORNERY protein called PTHrP. Parathyroid hormone related peptide. This WRETCHED thing HIJACKS your bone cells. RIPS calcium straight out. FLOODS the bloodstream like a burst pipe. Patient gets weak, confused, constipated as a brick.
Remember this. Central mass plus high calcium equals squamous cell. Might save a life one day if you pay attention.
Now get out of here before I lose my temper.`;

  const outputDir = path.join(__dirname, '../../public/assets/audio');
  const outputPath = path.join(outputDir, 'squamous-cell-lung-hypercalcemia-narration.mp3');

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

  const timestampsPath = path.join(outputDir, 'squamous-cell-lung-hypercalcemia-timestamps.json');
  fs.writeFileSync(timestampsPath, JSON.stringify({
    topic: 'squamous-cell-lung-hypercalcemia',
    audio_file: 'squamous-cell-lung-hypercalcemia-narration.mp3',
    script: cleanScript,
    words: wordTimestamps,
  }, null, 2));
  console.log('✅ Timestamps saved:', timestampsPath);

  // Print key trigger words for meme placement
  console.log('\n📍 Key trigger word timestamps:');
  const triggerWords = ['smoking', 'BLOOD', 'fifteen', 'point', 'eight', 'Think', 'DEAD', 'CENTER', 'PTHrP', 'CORNERS'];
  wordTimestamps.forEach(w => {
    if (triggerWords.some(t => w.word.includes(t) || w.word.toUpperCase().includes(t.toUpperCase()))) {
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
