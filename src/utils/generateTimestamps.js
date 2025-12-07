const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function parseTimestamp(timeStr) {
  // Parse timestamp like "00:00:01.200" to seconds
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

async function generateWordTimestamps(audioFilePath) {
  try {
    console.log('🎵 Generating word-level timestamps from audio using local Whisper...');

    const modelPath = path.join(os.homedir(), '.whisper-models', 'ggml-base.bin');

    if (!fs.existsSync(modelPath)) {
      console.error('❌ Whisper model not found at:', modelPath);
      console.log('Download it with: curl -L -o ~/.whisper-models/ggml-base.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin');
      process.exit(1);
    }

    console.log('Processing audio with Whisper...');

    // Run whisper-cpp with word-level timestamps
    const cmd = `/opt/homebrew/bin/whisper-cli -m "${modelPath}" -f "${audioFilePath}" -ml 1`;

    const output = execSync(cmd, { encoding: 'utf-8' });

    console.log('✅ Transcription complete!');

    // Parse the output to extract word-level timestamps
    const lines = output.split('\n');
    const words = [];
    let fullText = '';

    for (const line of lines) {
      // Match lines like: [00:00:01.200 --> 00:00:01.500]  word
      const match = line.match(/\[(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})\]\s+(.+)/);
      if (match) {
        const startTime = parseTimestamp(match[1]);
        const endTime = parseTimestamp(match[2]);
        const word = match[3].trim();

        if (word && word.length > 0) {
          words.push({
            word: word,
            start: startTime,
            end: endTime,
          });
          fullText += word;
        }
      }
    }

    console.log('📝 Full text:', fullText);
    console.log(`\n⏱️  Found ${words.length} words`);

    // Save to timestamps.json
    const outputPath = path.join(__dirname, '../assets/audio/timestamps.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      text: fullText,
      words: words,
    }, null, 2));

    console.log(`\n💾 Timestamps saved to: ${outputPath}`);

    // Print first few words as sample
    if (words.length > 0) {
      console.log('\nSample timestamps:');
      words.slice(0, 10).forEach(w => {
        console.log(`  "${w.word}" - ${w.start.toFixed(2)}s to ${w.end.toFixed(2)}s`);
      });
    }

    return { text: fullText, words };
  } catch (error) {
    console.error('❌ Error generating timestamps:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const audioPath = path.join(__dirname, '../assets/audio/narration.mp3');

  if (!fs.existsSync(audioPath)) {
    console.error('❌ Audio file not found:', audioPath);
    process.exit(1);
  }

  generateWordTimestamps(audioPath)
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { generateWordTimestamps };
