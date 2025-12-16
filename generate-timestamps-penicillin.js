const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generateTimestamps() {
  const audioPath = path.join(__dirname, 'public/assets/audio/penicillin-anaphylaxis-narration.mp3');
  const outputPath = path.join(__dirname, 'public/assets/audio/penicillin-anaphylaxis-timestamps.json');

  console.log('🎯 Generating timestamps with Whisper...');

  try {
    // Use whisper.cpp or Python whisper to get word-level timestamps
    const { stdout } = await execAsync(
      `whisper "${audioPath}" --model base --output_format json --word_timestamps True --output_dir /tmp/`
    );

    console.log('✅ Whisper processing complete');

    // Read the generated JSON
    const whisperOutputPath = '/tmp/penicillin-anaphylaxis-narration.json';

    if (fs.existsSync(whisperOutputPath)) {
      const whisperData = JSON.parse(fs.readFileSync(whisperOutputPath, 'utf8'));

      // Extract word-level timestamps
      const words = [];
      if (whisperData.segments) {
        for (const segment of whisperData.segments) {
          if (segment.words) {
            for (const word of segment.words) {
              words.push({
                word: word.word.trim(),
                start: word.start,
                end: word.end
              });
            }
          }
        }
      }

      const outputData = {
        words: words,
        text: whisperData.text,
      };

      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log('✅ Timestamps saved to:', outputPath);
      console.log(`📊 Total words: ${words.length}`);

      // Clean up temp file
      fs.unlinkSync(whisperOutputPath);
    } else {
      console.error('❌ Whisper output file not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error generating timestamps:', error.message);
    console.log('⚠️  Trying alternative approach with ffmpeg + whisper...');

    // Alternative: Use Python whisper directly
    try {
      const { stdout } = await execAsync(
        `python3 -c "import whisper; import json; model = whisper.load_model('base'); result = model.transcribe('${audioPath}', word_timestamps=True); print(json.dumps({'words': [{'word': w['word'], 'start': w['start'], 'end': w['end']} for seg in result['segments'] for w in seg.get('words', [])], 'text': result['text']}))" > "${outputPath}"`
      );
      console.log('✅ Timestamps generated using Python whisper');
    } catch (pythonError) {
      console.error('❌ Python whisper also failed:', pythonError.message);
      process.exit(1);
    }
  }
}

generateTimestamps();
