const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC';
const API_KEY = process.env.ELEVENLABS_API_KEY;

const script = `Alright FINE. Woman smokes for 25 years. Now she can't breathe. Shocking. CT scan shows her lungs look like frosted glass. Do a biopsy and the alveoli are absolutely PACKED with brown macrophages. Like someone stuffed ash into every air sac.
Back in 1965 some pathologist squints at this under a microscope and goes "Yep those are lung cells shedding off." Named it desquamative interstitial pneumonia. DIP. Desquamative means shedding.
Problem? He was WRONG. Those aren't shed cells. They're macrophages eating cigarette garbage. Been calling it the wrong name for 60 years. Nobody bothered to fix it.
So what's on this biopsy that'll get BETTER if she quits smoking? A through E. Think about it.
...They named a whole disease wrong and just left it that way.
It's A. OF COURSE. Pigmented macrophages filling the alveoli. Because here's the thing. DIP actually REVERSES. Tell her quit smoking, throw some steroids at it, those macrophages clear out. She lives. Pick B? Fibroblastic foci with temporal heterogeneity? That's IPF. Dead in three years. Lung transplant or coffin.
Why? Those macrophages are just janitors cleaning up tar. Stop making the mess, janitors leave. But IPF? That's scar tissue. Fibrosis. Permanent. You don't unscar a lung. So DIP means she walks out. IPF means she doesn't. Boards want you to know who lives and who dies. That's it. Now go.`;

async function generateAudio() {
  try {
    console.log('🎙️  Agent 1: Audio Generator for desquamative');
    console.log('----------------------------------------');

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

    // Save audio (base64 → binary)
    const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
    const audioPath = path.join(__dirname, '../assets/audio/desquamative-narration.mp3');
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

    // Save word timestamps
    const timestampsPath = path.join(__dirname, '../assets/audio/desquamative-aligned-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(words, null, 2));

    console.log('✅ Audio generated:', audioPath);
    console.log('✅ Timestamps saved:', timestampsPath);
    console.log(`📊 Duration: ${alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1].toFixed(2)}s`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateAudio();
