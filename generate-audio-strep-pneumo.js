const fs = require('fs');
const fetch = require('node-fetch');

const TOPIC = 'streptococcus-pneumoniae-lobar-pneumonia';
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Spuds Oxley

const input = JSON.parse(fs.readFileSync('strep-pneumo-input.json', 'utf8'));
const script = input.script;

console.log('🎙️  AGENT 2: AUDIO GENERATOR\n');
console.log(`Script length: ${script.split(/\s+/).length} words`);
console.log(`Calling ElevenLabs API (ONE CALL ONLY)...\n`);

async function generateAudio() {
  const API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in environment');
    process.exit(1);
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.80,
            style: 0.85,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Save raw response for debugging
    fs.writeFileSync(
      `debug-${TOPIC}-elevenlabs-response.json`,
      JSON.stringify(data, null, 2)
    );
    console.log('✓ API response received');
    console.log(`✓ Duration: ${data.duration}s`);

    // Parse timestamps
    const characters = data.alignment.characters;
    const words = [];
    let currentWord = '';
    let wordStart = 0;

    characters.forEach((char, i) => {
      if (char.character === ' ' || char.character === '\n') {
        if (currentWord) {
          const endTime = char.end_time_seconds || char.start_time_seconds;
          words.push({
            word: currentWord,
            start: wordStart,
            end: endTime
          });
          currentWord = '';
        }
      } else {
        if (!currentWord) wordStart = char.start_time_seconds;
        currentWord += char.character;
      }
    });

    // Push final word
    if (currentWord) {
      const lastChar = characters[characters.length - 1];
      words.push({
        word: currentWord,
        start: wordStart,
        end: lastChar.end_time_seconds || lastChar.start_time_seconds
      });
    }

    console.log(`✓ Parsed ${words.length} words`);

    // Save audio file
    const audioPath = `public/assets/audio/${TOPIC}-narration.mp3`;
    fs.writeFileSync(
      audioPath,
      Buffer.from(data.audio_base64, 'base64')
    );
    console.log(`✓ Audio saved: ${audioPath}`);

    // Save timestamps
    const timestampsPath = `public/assets/audio/${TOPIC}-timestamps.json`;
    fs.writeFileSync(
      timestampsPath,
      JSON.stringify({
        topic: TOPIC,
        duration: data.duration,
        words: words
      }, null, 2)
    );
    console.log(`✓ Timestamps saved: ${timestampsPath}`);

    // Clean up debug file
    fs.unlinkSync(`debug-${TOPIC}-elevenlabs-response.json`);

    console.log('\n✅ AUDIO GENERATION COMPLETE');
    console.log('   Ready for Agent 3 (Timestamp Detective)');

  } catch (error) {
    console.error('❌ Audio generation failed:', error.message);
    process.exit(1);
  }
}

generateAudio();
