const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC';
const API_KEY = process.env.ELEVENLABS_API_KEY;

const script = `Oh for cryin' out loud. 62 year old guy. Back from some hotel convention. Now he's got fever, cough, diarrhea, AND he's confused. Sodium? TANKED to 126. Genius immune system you got there.

Chest x ray shows patchy infiltrates. Liver enzymes elevated. GI symptoms with pneumonia? That's weird. Back in my day we actually learned this pattern.

So what's the most specific diagnostic finding? A? B? C? D? E? Think about it... I'll wait. It's not like he's dyin' or nothin'.

It's A. Course it is. Urinary antigen detection. And I bet half you picked B. Cold agglutinins? That's mycoplasma. You did pick B, didn't you?

Alright, FINE. Since nobody teaches microbio anymore. This is Legionella. Legionnaire's disease. It HIDES in water sources. AC units. Cooling towers. Hotel convention? There's your clue. It WRECKS the lungs, the gut, AND the brain. Hyponatremia is the giveaway. Boards love this because y'all miss it every time. So pay attention.

Now get outta here. I got a nap to take.`;

async function generateAudio() {
  try {
    console.log('🎙️  Generating audio for Legionella...');

    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      headers: {
        'Accept': 'application/json',
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: script,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.58,
          similarity_boost: 0.82,
          style: 0.68,
          use_speaker_boost: true
        }
      },
      responseType: 'json'
    });

    // Save audio
    const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
    const audioPath = path.join(__dirname, '../assets/audio/legionella-narration.mp3');
    fs.writeFileSync(audioPath, audioBuffer);

    // Convert character timestamps to word timestamps
    const alignment = response.data.alignment;
    const words = [];
    let currentWord = '';
    let wordStart = null;

    alignment.characters.forEach((char, i) => {
      if (char === ' ' || i === alignment.characters.length - 1) {
        if (i === alignment.characters.length - 1 && char !== ' ') {
          currentWord += char;
        }
        if (currentWord.trim()) {
          words.push({
            word: currentWord.trim(),
            start: wordStart,
            end: alignment.character_end_times_seconds[i]
          });
        }
        currentWord = '';
        wordStart = null;
      } else {
        if (wordStart === null) {
          wordStart = alignment.character_start_times_seconds[i];
        }
        currentWord += char;
      }
    });

    const timestampsPath = path.join(__dirname, '../assets/audio/legionella-aligned-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(words, null, 2));

    console.log('✅ Audio generated:', audioPath);
    console.log('✅ Timestamps saved:', timestampsPath);
    console.log(`📊 Duration: ${alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1].toFixed(2)}s`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateAudio();
