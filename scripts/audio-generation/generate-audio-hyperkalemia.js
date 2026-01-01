require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `This man's heart is about to FLATLINE and he just asked me if he'll make his CRUISE on Thursday. Sir. SIR. Your heart is playing JAZZ right now. Improvising. Skipped dialysis THREE WEEKS for a trip to the BAHAMAS and now his potassium is SEVEN POINT EIGHT. That's not a number, that's a THREAT. EKG looks like my signature after twelve hours on call. QRS wider than a CHEESECAKE FACTORY MENU. I've seen better rhythms from a BROKEN WASHING MACHINE. What do you slam into this man first? A) Insulin. B) Calcium gluconate. C) Kayexalate. D) Albuterol. E) Furosemide. TICK TOCK. His heart ain't got ALL DAY. Actually it's got about FORTY FIVE SECONDS. It's B, calcium gluconate! And I KNOW half you picked insulin because you wanted to fix the number. Oh you sweet summer children. The NUMBER don't matter if his heart's doing the HARLEM SHAKE into asystole. Calcium's a BOUNCER. Stands at the door, keeps the heart from LOSING ITS MIND while you actually fix the problem. Now get out there. And somebody tell this man he ain't making that cruise.`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Hyperkalemia...');
  console.log(`📝 Script length: ${script.length} characters, ~${script.split(' ').length} words`);

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: script,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.35,          // More grumpy variation
        similarity_boost: 0.80,   // Keep it sounding like Grandpa
        style: 0.85,              // Maximum character expression
        use_speaker_boost: true
      }
    });

    const outputDir = 'public/assets/audio';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const audioPath = path.join(outputDir, 'hyperkalemia-narration.mp3');
    const audioBuffer = Buffer.from(response.audioBase64, 'base64');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log(`✅ Audio saved to ${audioPath}`);

    // Convert character-level timestamps to word-level
    const { characters, characterStartTimesSeconds, characterEndTimesSeconds } = response.alignment;

    const words = [];
    let currentWord = '';
    let wordStartTime = null;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const startTime = characterStartTimesSeconds[i];
      const endTime = characterEndTimesSeconds[i];

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
      } else {
        if (!currentWord) {
          wordStartTime = startTime;
        }
        currentWord += char;
      }
    }

    // Add last word
    if (currentWord) {
      words.push({
        word: currentWord,
        start: wordStartTime,
        end: characterEndTimesSeconds[characterEndTimesSeconds.length - 1],
      });
    }

    // Save timestamps
    const timestampsPath = path.join(outputDir, 'hyperkalemia-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps for this script
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase().includes(searchWord.toUpperCase()));
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    const findExact = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase() === searchWord.toUpperCase());
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    // Vignette triggers
    console.log('\n--- HOOK TRIGGERS ---');
    console.log(`   FLATLINE: ${findExact('FLATLINE')}`);
    console.log(`   CRUISE: ${findExact('CRUISE')}`);
    console.log(`   JAZZ: ${findExact('JAZZ')}`);
    console.log(`   BAHAMAS: ${findExact('BAHAMAS')}`);
    console.log(`   SEVEN: ${findExact('SEVEN')}`);
    console.log(`   THREAT: ${findExact('THREAT')}`);
    console.log(`   CHEESECAKE: ${findExact('CHEESECAKE')}`);
    console.log(`   WASHING: ${findExact('WASHING')}`);
    console.log(`   MACHINE: ${findExact('MACHINE')}`);

    // Option triggers
    console.log('\n--- OPTION TRIGGERS ---');
    console.log(`   A) Insulin: ${findExact('A)')}`);
    console.log(`   B) Calcium: ${findExact('B)')}`);
    console.log(`   C) Kayexalate: ${findExact('C)')}`);
    console.log(`   D) Albuterol: ${findExact('D)')}`);
    console.log(`   E) Furosemide: ${findExact('E)')}`);

    // Timer/pressure
    console.log('\n--- TIMER PRESSURE ---');
    console.log(`   TICK: ${findExact('TICK')}`);
    console.log(`   TOCK: ${findExact('TOCK')}`);
    console.log(`   FORTY: ${findExact('FORTY')}`);
    console.log(`   SECONDS: ${findExact('SECONDS')}`);

    // Answer reveal
    console.log('\n--- ANSWER REVEAL ---');
    console.log(`   "gluconate!" (answer): ${findTimestamp('gluconate!')}`);
    console.log(`   "calcium" (first mention): ${findTimestamp('calcium')}`);

    // Teaching phase triggers
    console.log('\n--- TEACHING PHASE ---');
    console.log(`   insulin: ${findTimestamp('insulin')}`);
    console.log(`   number: ${findTimestamp('number')}`);
    console.log(`   sweet: ${findExact('sweet')}`);
    console.log(`   children: ${findExact('children')}`);
    console.log(`   HARLEM: ${findExact('HARLEM')}`);
    console.log(`   SHAKE: ${findExact('SHAKE')}`);
    console.log(`   asystole: ${findExact('asystole')}`);
    console.log(`   BOUNCER: ${findExact('BOUNCER')}`);
    console.log(`   door: ${findExact('door')}`);
    console.log(`   MIND: ${findExact('MIND')}`);
    console.log(`   cruise (ending): ${findTimestamp('cruise.')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Hyperkalemia video.'))
  .catch((err) => console.error(err));
