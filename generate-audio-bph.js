const fs = require('fs');
const path = require('path');

const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Spuds Oxley
const API_KEY = process.env.ELEVENLABS_API_KEY;
const topic = 'bph-5-alpha-reductase';

const script = `Good gravy, here we go again. Seventy-year-old man's been pissin' like a CLOGGED garden hose for months. Wife's ready to BOOT him to the couch 'cause he's up five times a night makin' MORE RACKET than a freight train. Doc feels his prostate and LORD ALMIGHTY it's the size of a BASEBALL. Thing's SIXTY-FIVE grams, SWOLE UP like a TICK on a hound dog. Just sittin' there CHOKIN' his pipes. PSA's seven point two. Now think REAL careful here. What medication CLASS is gonna actually SHRINK this BLOATED gland so he don't end up with a ROTO-ROOTER up his business? A? B? C? D? E? Choose wrong and this man's marriage AND his plumbin' are BOTH goin' down the crapper... It's C, you BAMBOOZLED youngsters. Five-alpha-reductase inhibitor. That's finasteride or dutasteride. Half you picked B like a bunch of GREENHORNS. Now pipe down and I'll learn you somethin'. Five-alpha-reductase inhibitors STARVE that prostate by BLOCKIN' the enzyme that makes DHT. Without DHT, that ORNERY gland DEFLATES like a punctured tire. SHRINKS twenty to thirty percent in six months. PLUMB miraculous. Sure, some fellas can't get their ENGINE started if you catch my drift, but better LIMP than CARVED UP like a Thanksgivin' turkey. Alpha blockers just LOOSEN things up, don't shrink SQUAT. Now SKEDADDLE.`;

async function generateAudio() {
  if (!API_KEY) {
    console.error('❌ ERROR: ELEVENLABS_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('🎙️  Calling ElevenLabs API (ONE CALL ONLY)...');
  console.log(`📝 Script length: ${script.split(/\s+/).length} words`);
  console.log(`🔊 Voice: Grandpa Spuds Oxley (${VOICE_ID})`);
  console.log('⚙️  Settings: stability=0.45, similarity=0.78, style=0.50 (Sarcoidosis settings)');

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
            stability: 0.45,           // OLDER SETTINGS (Sarcoidosis)
            similarity_boost: 0.78,    // "Keep it sounding like Grandpa"
            style: 0.50,               // "Good character without overdoing it"
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      process.exit(1);
    }

    const data = await response.json();

    // Save raw response for debugging
    const debugPath = `debug-${topic}-elevenlabs-response.json`;
    fs.writeFileSync(debugPath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved debug response: ${debugPath}`);

    // Parse alignment data
    console.log('🔍 Parsing alignment data...');

    let characters;
    if (Array.isArray(data.alignment.characters)) {
      // Format 1: Array of character objects
      characters = data.alignment.characters.map((char, i) => ({
        character: char.character || char,
        start: data.alignment.character_start_times_seconds[i],
        end: data.alignment.character_end_times_seconds[i],
      }));
    } else {
      // Format 2: Separate arrays
      const chars = data.alignment.characters;
      const starts = data.alignment.character_start_times_seconds;
      const ends = data.alignment.character_end_times_seconds;

      characters = chars.map((char, i) => ({
        character: char,
        start: starts[i],
        end: ends[i],
      }));
    }

    // Calculate duration from last character end time
    const duration = characters[characters.length - 1].end || characters[characters.length - 1].start || 0;

    // Build words array
    const words = [];
    let currentWord = '';
    let wordStart = 0;

    characters.forEach((char, i) => {
      if (char.character === ' ' || char.character === '\n') {
        if (currentWord) {
          words.push({
            word: currentWord,
            start: wordStart,
            end: char.end || char.start,
          });
          currentWord = '';
        }
      } else {
        if (!currentWord) {
          wordStart = char.start;
        }
        currentWord += char.character;
      }
    });

    // Push final word
    if (currentWord) {
      words.push({
        word: currentWord,
        start: wordStart,
        end: characters[characters.length - 1].end,
      });
    }

    console.log(`✅ Parsed ${words.length} words`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);

    // Save audio file
    const audioDir = path.join(__dirname, 'public/assets/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioPath = path.join(audioDir, `${topic}-narration.mp3`);
    fs.writeFileSync(audioPath, Buffer.from(data.audio_base64, 'base64'));
    console.log(`🎵 Saved audio: ${audioPath}`);

    // Save timestamps with CORRECT schema
    const timestampsPath = path.join(audioDir, `${topic}-timestamps.json`);
    const timestampsData = {
      topic: topic,
      duration: duration,
      words: words,  // ← MUST be "words" array with "word" property
    };

    fs.writeFileSync(timestampsPath, JSON.stringify(timestampsData, null, 2));
    console.log(`📊 Saved timestamps: ${timestampsPath}`);

    // Validate output
    const audioExists = fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0;
    const timestampsExists = fs.existsSync(timestampsPath);

    if (audioExists && timestampsExists) {
      console.log('\n✅ AGENT 2 COMPLETE - Audio generation successful');
      console.log(`   Audio: ${(fs.statSync(audioPath).size / 1024).toFixed(0)}KB`);
      console.log(`   Words: ${words.length}`);
      console.log(`   Duration: ${duration.toFixed(2)}s`);

      // Delete debug file after successful generation
      fs.unlinkSync(debugPath);
      console.log('🗑️  Deleted debug file (success)');
    } else {
      console.error('❌ Validation failed - output files missing or empty');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAudio();
