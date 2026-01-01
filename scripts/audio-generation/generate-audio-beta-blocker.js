require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `GOOD LORD, this woman just CHUGGED a whole BOTTLE of propranolol trying to end it all, and I GUARANTEE half you MORONS are about to pick the WRONG drug and finish the job for her. Heart rate? THIRTY-TWO. Might as well be DEAD. Blood pressure? SEVENTY over FORTY. She's got one foot in the GRAVE and the other on a BANANA PEEL. Lethargic as HELL, glucose is SIXTY-TWO, and her ticker's about to QUIT entirely. So what're you gonna give her, hotshot? A) Atropine. B) Calcium gluconate. C) Glucagon. D) Epinephrine. E) Sodium bicarbonate. Better choose quick 'cause she ain't got TIME for you to google it. Well I'll be DAMNED, it's C, glucagon! And LOOK AT THAT, three-quarters of you absolute JACKASSES picked atropine like I KNEW you would. Gonna waltz into the ICU, give atropine, stand there scratchin' your head wonderin' why your patient's FLATLINING. BRILLIANT. Now SHUT UP and I'll learn you why you're WRONG before you kill somebody's daughter. Beta-blockers CHOKE OUT the heart by BLOCKIN' beta receptors. Now here's where you IDIOTS mess up - atropine works through muscarinic receptors, which is a COMPLETELY DIFFERENT SYSTEM that don't mean SQUAT when beta receptors are BLOCKED. Might as well be pissin' in the wind. But glucagon? That beautiful SON OF A GUN bypasses the WHOLE MESS. Activates its OWN receptor, cAMP ROCKETS up, calcium FLOODS into cardiac cells through a BACK DOOR that propranolol can't TOUCH. Heart rate climbs back from the DEAD, blood pressure follows, glucose gets a BOOST. It's PERFECT. Five to ten milligrams IV push, then start a DRIP. This is STEP 1 material, folks, and half you are gonna FAIL because you were too busy scrollin' TikTok to learn your ANTIDOTES. Now get OUT of here before you kill MY patients too.`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Beta-Blocker Overdose...');
  console.log(`📝 Script length: ${script.length} characters, ~${script.split(' ').length} words`);

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: script,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.40,          // Slightly more grumpy/varied
        similarity_boost: 0.80,   // Keep it sounding like Grandpa
        style: 0.75,              // Good character expression
        use_speaker_boost: true
      }
    });

    const outputDir = 'public/assets/audio';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const audioPath = path.join(outputDir, 'beta-blocker-overdose-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'beta-blocker-overdose-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase() === searchWord.toUpperCase());
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    console.log(`   THIRTY-TWO: ${findTimestamp('THIRTY-TWO')}`);
    console.log(`   SEVENTY: ${findTimestamp('SEVENTY')}`);
    console.log(`   SIXTY-TWO: ${findTimestamp('SIXTY-TWO')}`);
    console.log(`   A): ${findTimestamp('A)')}`);
    console.log(`   B): ${findTimestamp('B)')}`);
    console.log(`   C): ${findTimestamp('C)')}`);
    console.log(`   D): ${findTimestamp('D)')}`);
    console.log(`   E): ${findTimestamp('E)')}`);
    console.log(`   glucagon (answer): ${findTimestamp('glucagon!')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Beta-Blocker Overdose video.'))
  .catch((err) => console.error(err));
