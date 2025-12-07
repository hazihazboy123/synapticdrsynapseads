require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio(text, outputPath = 'src/assets/audio/narration.mp3') {
  console.log('🎙️  Generating audio with Grandpa Spuds...');

  try {
    // Use convertWithTimestamps to get character-level alignment
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: text,
      model_id: 'eleven_turbo_v2_5',  // Fastest, most responsive model
      voice_settings: {
        stability: 0.45,          // Balanced for grumpy but not too erratic
        similarity_boost: 0.78,   // Keep it sounding like Grandpa
        style: 0.50,              // Good character without overdoing it
        use_speaker_boost: true
      }
    });

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Decode and write audio file (SDK uses camelCase)
    const audioBuffer = Buffer.from(response.audioBase64, 'base64');
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`✅ Audio saved to ${outputPath}`);

    // Save RAW character-level data from ElevenLabs (for re-parsing later)
    const characterDataPath = path.join(dir, 'character-timestamps.json');
    fs.writeFileSync(characterDataPath, JSON.stringify({
      script: text,
      alignment: response.alignment,
    }, null, 2));
    console.log(`✅ Character data saved to ${characterDataPath}`);

    // Convert character-level timestamps to word-level
    const wordTimestamps = convertToWordTimestamps(text, response.alignment);

    // Save timestamps to aligned-timestamps.json
    const timestampsPath = path.join(dir, 'aligned-timestamps.json');
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

// If run directly
if (require.main === module) {
  // FINAL SCRIPT - Sarcoidosis Hypercalcemia
  const finalScript = `Alright, ALRIGHT. I'm up.

Thirty-eight-year-old woman. Can't breathe. Vision's blurry. Calcium? Eleven point two. That's HIGH. What's causin' this mess?

Look at this disaster. Ankle pain. Red bumps on her shins—erythema nodosum. Eye inflammation. Chest X-ray? Bilateral hilar lymphadenopathy. Biopsy shows noncaseating granulomas.

Oh, and her calcium's at 11.2. Normal's 8.5 to 10. So her LUNGS are failin' but her CALCIUM'S climbin'. Completely backwards. Makes no sense, right?

Which mechanism explains it? A, B, C, D, or E?

Go ahead. Guess.

...Still waitin'. Ticktock.

You're overthinking it.

It's C. Of COURSE it's C. Nobody ever picks C.

Alright, LISTEN UP. Here's the actual mechanism.

Sarcoidosis creates granulomas everywhere—includin' the lungs. Now here's the part students always miss: those granulomas? They're not just sittin' there doin' nothin'. They're actively producin' an enzyme called 1-alpha-hydroxylase.

That enzyme takes inactive vitamin D—the stuff floatin' around in your blood—and activates it. Active vitamin D is like a calcium magnet. It tells your intestines, "Hey! Absorb MORE calcium from food!" It tells your kidneys, "Keep that calcium, don't pee it out!" And it tells your bones, "Release some calcium!"

So now you got all these rogue granulomas makin' active vitamin D with zero regulation. Your body can't shut it off. Normally, your kidneys control vitamin D activation based on how much calcium you got. But granulomas? They don't care. They just keep pumpin' out that enzyme.

Result? Her lungs are gettin' destroyed by inflammation, but her blood calcium keeps RISING because her gut's absorbin' everything and her kidneys are holdin' onto it. It's completely counterintuitive. That's why boards LOVE testin' this.

Look, I know this stuff's confusing. That's exactly why they put it on exams. If you want more questions like this—full breakdowns, practice vignettes—check out SynapticRecall. It'll save you hours.

Now go study. I got a crossword puzzle to finish.`;

  generateAudio(finalScript)
    .then(() => console.log('🎉 Done! Audio ready for Remotion.'))
    .catch((err) => console.error(err));
}

module.exports = { generateAudio };
