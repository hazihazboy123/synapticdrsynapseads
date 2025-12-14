const fs = require('fs');
const fetch = require('node-fetch');

const TOPIC = 'epidural-hematoma';
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Spuds Oxley

const input = JSON.parse(fs.readFileSync('input-epidural-hematoma.json', 'utf8'));
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
            stability: 0.18,       // LOWERED for more energy and variation (was 0.35)
            similarity_boost: 0.80,
            style: 0.92,           // INCREASED for more personality (was 0.85)
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
    // Calculate duration from last word's end time (will be set after parsing words)
    let duration = 0;

    console.log('✓ API response received');
    console.log(`✓ Duration: ${duration}s`);

    // Parse timestamps - current API format with separate arrays
    let words = [];

    if (data.alignment && data.alignment.character_start_times_seconds && data.alignment.character_end_times_seconds) {
      const { characters, character_start_times_seconds, character_end_times_seconds } = data.alignment;

      let currentWord = '';
      let wordStart = null;

      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const startTime = character_start_times_seconds[i];
        const endTime = character_end_times_seconds[i];

        if (char === ' ' || char === '\n' || i === characters.length - 1) {
          if (currentWord) {
            words.push({
              word: currentWord + (i === characters.length - 1 && char !== ' ' && char !== '\n' ? char : ''),
              start: wordStart,
              end: endTime
            });
          }
          currentWord = '';
          wordStart = null;
        } else {
          if (!currentWord) wordStart = startTime;
          currentWord += char;
        }
      }
    } else {
      throw new Error('Unknown alignment format in API response');
    }

    // Calculate duration from last word
    if (words.length > 0) {
      duration = words[words.length - 1].end;
    }

    console.log(`✓ Parsed ${words.length} words`);
    console.log(`✓ Duration: ${duration.toFixed(2)}s (calculated from timestamps)`);

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
        duration: duration,
        words: words
      }, null, 2)
    );
    console.log(`✓ Timestamps saved: ${timestampsPath}`);

    // Don't clean up debug file - keep for inspection
    // fs.unlinkSync(`debug-${TOPIC}-elevenlabs-response.json`);

    console.log('\n✅ AUDIO GENERATION COMPLETE');
    console.log('   Ready for Agent 3 (Timestamp Detective)');

  } catch (error) {
    console.error('❌ Audio generation failed:', error.message);
    process.exit(1);
  }
}

generateAudio();
