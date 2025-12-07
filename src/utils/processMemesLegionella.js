/**
 * AGENT 6: MEME & SOUND PROCESSOR
 * Processes placements from Claude's output, finds timestamps, downloads missing assets
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOPIC = 'legionella';
const PLAYBACK_RATE = 1.85;

// ============================================
// MEME PLACEMENTS FROM CLAUDE'S OUTPUT
// ============================================

const MEME_PLACEMENTS = [
  {
    id: 'surprised-pikachu',
    trigger_word: 'TANKED',
    duration_frames: 45,
    position: 'center',
    scale: 0.55,
    sound_effect: 'cartoon-slip.mp3',
    sound_volume: 0.45,
    reasoning: 'Sodium crashing down = cartoon slip is contextually perfect'
  },
  {
    id: 'drake-hotline-bling',
    trigger_word: 'Course',
    duration_frames: 50,
    position: 'center',
    scale: 0.55,
    sound_effect: null, // Answer reveal ding plays
    sound_volume: null,
    reasoning: 'Answer reveal with overlay: ❌ Cold agglutinins / ✅ Urinary antigen',
    overlayText: {
      reject: 'Cold agglutinins',
      approve: 'Urinary antigen'
    }
  }
];

const STANDALONE_SOUNDS = [
  {
    trigger_word: 'Genius',
    sound_effect: 'RIMSHOT.mp3',
    sound_volume: 0.4,
    reasoning: 'Sarcastic punchline after "Genius immune system"'
  },
  {
    trigger_word: 'HIDES',
    sound_effect: 'meanwhile.mp3',
    sound_volume: 0.35,
    reasoning: 'Transition into teaching, bacteria lurking'
  }
];

// ============================================
// ASSET VERIFICATION & DOWNLOAD
// ============================================

const MEME_SOURCES = {
  'surprised-pikachu': {
    search: 'Surprised Pikachu meme',
    url: 'https://i.imgflip.com/2t8teh.png',
    fallback: null
  },
  'drake-hotline-bling': {
    search: 'Drake hotline bling meme template',
    url: 'https://i.imgflip.com/3wbph5.jpg',
    fallback: 'surprised-pikachu'
  }
};

async function downloadAsset(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function verifyAndDownloadAssets() {
  const memesDir = path.join(__dirname, '../assets/memes');
  const soundsDir = path.join(__dirname, '../assets/sfx/memes');

  const missingAssets = [];

  for (const meme of MEME_PLACEMENTS) {
    // Check meme file
    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    let memeExists = false;

    for (const ext of possibleExtensions) {
      if (fs.existsSync(path.join(memesDir, meme.id + ext))) {
        memeExists = true;
        meme.file_extension = ext;
        break;
      }
    }

    if (!memeExists) {
      console.log(`⚠️  Missing meme: ${meme.id}`);

      // Try to download
      if (MEME_SOURCES[meme.id]) {
        try {
          const ext = path.extname(MEME_SOURCES[meme.id].url) || '.jpg';
          const destPath = path.join(memesDir, meme.id + ext);
          console.log(`   Downloading from: ${MEME_SOURCES[meme.id].url}`);
          await downloadAsset(MEME_SOURCES[meme.id].url, destPath);
          console.log(`   ✅ Downloaded: ${meme.id}${ext}`);
          meme.file_extension = ext;
        } catch (err) {
          console.log(`   ❌ Download failed, using fallback: ${MEME_SOURCES[meme.id].fallback}`);
          meme.id = MEME_SOURCES[meme.id].fallback;
          meme.file_extension = '.png';
          missingAssets.push({ type: 'meme', id: meme.id, status: 'used_fallback' });
        }
      } else {
        console.log(`   ❌ No download source, using fallback`);
        missingAssets.push({ type: 'meme', id: meme.id, status: 'no_source' });
      }
    }

    // Check sound file
    if (meme.sound_effect) {
      const soundPath = path.join(soundsDir, meme.sound_effect);
      if (!fs.existsSync(soundPath)) {
        console.log(`⚠️  Missing sound: ${meme.sound_effect}`);
        missingAssets.push({ type: 'sound', id: meme.sound_effect, status: 'missing' });
        meme.sound_effect = null; // Remove sound if missing
      }
    }
  }

  // Check standalone sounds
  for (const sound of STANDALONE_SOUNDS) {
    const soundPath = path.join(soundsDir, sound.sound_effect);
    if (!fs.existsSync(soundPath)) {
      console.log(`⚠️  Missing standalone sound: ${sound.sound_effect}`);
      missingAssets.push({ type: 'sound', id: sound.sound_effect, status: 'missing' });
    }
  }

  return missingAssets;
}

// ============================================
// TIMESTAMP LOOKUP
// ============================================

function findWordTimestamp(word, timestamps) {
  const searchWord = word.toLowerCase().replace(/[^a-z]/g, '');

  // Exact match first
  let match = timestamps.find(entry =>
    entry.word.toLowerCase().replace(/[^a-z]/g, '') === searchWord
  );

  // Partial match
  if (!match) {
    match = timestamps.find(entry =>
      entry.word.toLowerCase().includes(searchWord) ||
      searchWord.includes(entry.word.toLowerCase().replace(/[^a-z]/g, ''))
    );
  }

  return match ? match.start : null;
}

// ============================================
// MAIN PROCESSING
// ============================================

async function processMemes() {
  console.log(`🎬 Agent 6: Meme & Sound Processor for ${TOPIC}`);
  console.log('================================================');

  // Load timestamps
  const timestampsPath = path.join(__dirname, `../assets/audio/${TOPIC}-aligned-timestamps.json`);

  if (!fs.existsSync(timestampsPath)) {
    throw new Error(`Timestamps not found: ${timestampsPath}\nRun Agent 1 first.`);
  }

  const timestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf8'));
  console.log(`📊 Loaded ${timestamps.length} word timestamps`);

  // Verify and download assets
  console.log('\n📦 Verifying assets...');
  const missingAssets = await verifyAndDownloadAssets();

  // Process meme placements
  console.log('\n🎭 Processing meme placements...');
  const processedMemes = [];

  for (const meme of MEME_PLACEMENTS) {
    const timestamp = findWordTimestamp(meme.trigger_word, timestamps);

    if (timestamp === null) {
      console.warn(`⚠️  Trigger word "${meme.trigger_word}" not found - skipping meme`);
      continue;
    }

    console.log(`   ✅ ${meme.id} @ "${meme.trigger_word}" = ${timestamp.toFixed(2)}s`);

    const processed = {
      id: meme.id,
      trigger_word: meme.trigger_word,
      timestamp: timestamp,
      duration_frames: meme.duration_frames,
      position: meme.position,
      scale: meme.scale,
      animation: 'fade-in-out',
      sound_effect: meme.sound_effect,
      sound_volume: meme.sound_volume,
      reasoning: meme.reasoning
    };

    if (meme.overlayText) {
      processed.overlayText = meme.overlayText;
    }

    processedMemes.push(processed);
  }

  // Process standalone sounds
  console.log('\n🔊 Processing standalone sounds...');
  const processedSounds = [];

  for (const sound of STANDALONE_SOUNDS) {
    const timestamp = findWordTimestamp(sound.trigger_word, timestamps);

    if (timestamp === null) {
      console.warn(`⚠️  Trigger word "${sound.trigger_word}" not found - skipping sound`);
      continue;
    }

    console.log(`   ✅ ${sound.sound_effect} @ "${sound.trigger_word}" = ${timestamp.toFixed(2)}s`);

    processedSounds.push({
      trigger_word: sound.trigger_word,
      timestamp: timestamp,
      sound_effect: sound.sound_effect,
      sound_volume: sound.sound_volume,
      reasoning: sound.reasoning
    });
  }

  // Write output
  const outputPath = path.join(__dirname, `../assets/memes/${TOPIC}-meme-placements.json`);
  const outputData = {
    topic: TOPIC,
    playback_rate: PLAYBACK_RATE,
    memes: processedMemes,
    standalone_sounds: processedSounds,
    missing_assets: missingAssets,
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log('\n✅ Placements saved:', outputPath);
  console.log(`📊 Total: ${processedMemes.length} memes, ${processedSounds.length} standalone sounds`);

  if (missingAssets.length > 0) {
    console.log(`⚠️  Missing assets: ${missingAssets.length} (check output for details)`);
  }
}

processMemes().catch(console.error);
