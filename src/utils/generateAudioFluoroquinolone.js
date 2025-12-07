require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudioFluoroquinolone() {
  console.log('🎙️  Generating audio for Fluoroquinolone case with Grandpa Spuds...');

  // CLEAN TEXT SCRIPT - No SSML tags for perfect timestamps!
  const cleanScript = `Oh for cryin' out loud. Sixty-five-year-old guy. Kidney transplant patient.

Gets cipro for a UTI. Day 4, he's walkin' around and—POP. Ankle's done. Can't move his foot.

What happened?

Let's see here. Thompson test? Positive. That means squeeze the calf, foot don't move.

Oh, and he's on tacrolimus, prednisone, AND ciprofloxacin. What could POSSIBLY go wrong?

His labs? Fine. WBC normal. Creatinine's fine. This ain't about the labs—it's about what that DRUG did.

So which mechanism explains it? A? B? C? D? E?

Think about it. I'll wait.

...Still waitin'. Ticktock.

You're overthinkin' this.

It's A. Of COURSE it's A. Fluoroquinolone-induced collagen degradation.

Alright, LISTEN. Fluoroquinolones—cipro, levofloxacin, all of 'em—they MESS UP collagen in your tendons. Achilles tendon ruptures. Black-box warning.

Risk goes UP if you're old, on steroids, or a transplant patient like this guy.

Boards test this EVERY year 'cause students miss it.

Now go study. I got a nap to take.`;

  const outputPath = 'src/assets/audio/fluoroquinolone-narration.mp3';

  try {
    // Use convertWithTimestamps to get character-level alignment
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: cleanScript,  // Using clean text now!
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.45,          // Same as sarcoidosis
        similarity_boost: 0.78,   // Same as sarcoidosis
        style: 0.50,              // Same as sarcoidosis
        use_speaker_boost: true
      }
    });

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Decode and write audio file
    const audioBuffer = Buffer.from(response.audioBase64, 'base64');
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`✅ Audio saved to ${outputPath}`);

    // Save RAW character-level data
    const characterDataPath = path.join(dir, 'fluoroquinolone-character-timestamps.json');
    fs.writeFileSync(characterDataPath, JSON.stringify({
      script: cleanScript,
      alignment: response.alignment,
    }, null, 2));
    console.log(`✅ Character data saved to ${characterDataPath}`);

    // Convert character-level timestamps to word-level
    const wordTimestamps = convertToWordTimestamps(cleanScript, response.alignment);

    // Save timestamps
    const timestampsPath = path.join(dir, 'fluoroquinolone-aligned-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: cleanScript,
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
  generateAudioFluoroquinolone()
    .then(() => console.log('🎉 Done! Audio ready for Remotion.'))
    .catch((err) => console.error(err));
}

module.exports = { generateAudioFluoroquinolone };
