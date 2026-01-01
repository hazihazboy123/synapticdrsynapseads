require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `This patient's lung just became a ONE-WAY DEATH TRAP and I GUARANTEE most of you are about to order the ONE thing that KILLS him. Twenty-two year old male, motorcycle accident, intubated in the field. He was STABLE, then SUDDENLY his oxygen drops to EIGHTY-TWO percent, blood pressure TANKS to seventy over nothing, and you notice his trachea is shifted to the LEFT. Breath sounds? GONE on the right. Neck veins? BULGING like he's about to EXPLODE. What do you do FIRST? A) Chest X-ray to confirm diagnosis. B) Needle decompression. C) Emergent intubation. D) Pericardiocentesis. E) IV fluid bolus. Better choose quick because this man's got about SIXTY SECONDS before he's DEAD. If you said chest X-ray, CONGRATULATIONS, you just KILLED your patient waiting for a PICTURE. The answer is B, needle decompression. And if you don't understand WHY, listen up you JACKASSES. Here's what happened. That broken rib PUNCTURED the lung and created a ONE-WAY VALVE. Air goes IN with every breath, but it CAN'T get out. It's like a roach motel for air, checks in, NEVER checks out. Now that trapped air BUILDS and BUILDS. It CRUSHES the lung flat. Then it starts SHOVING the entire mediastinum to the opposite side. Heart gets KINKED. Vena cava gets PINCHED. Blood can't get back to the heart, that's your JVD. Heart can't pump out, that's your crashing blood pressure. This is called TENSION physiology and it will KILL your patient in MINUTES. Needle decompression POPS that pressure. You're converting a TENSION pneumo to a SIMPLE pneumo. Fourteen to sixteen gauge needle, SECOND intercostal space, midclavicular line, that's two finger-widths below the clavicle. You'll hear a HISS of air and watch that blood pressure CLIMB back from the dead. Now why do the other answers FAIL? Chest X-ray? Takes too LONG, this is a CLINICAL diagnosis. You see the triad, you ACT. Pericardiocentesis? That's for cardiac TAMPONADE, different triad, no breath sound changes. IV fluids? Can't fill a heart that's being CRUSHED. And intubation? He's ALREADY intubated, you MORON. Remember the TENSION TRIAD: tracheal deviation, JVD, absent breath sounds. Don't think. Don't image. DECOMPRESS. Second intercostal space midclavicular line, or fifth intercostal space anterior axillary line if they're muscular. Now you won't KILL your patients. You're welcome.`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Tension Pneumothorax...');
  console.log(`📝 Script length: ${script.length} characters, ~${script.split(' ').length} words`);

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: script,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.80,
        style: 0.85,
        use_speaker_boost: true
      }
    });

    const outputDir = 'public/assets/audio';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const audioPath = path.join(outputDir, 'tension-pneumothorax-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'tension-pneumothorax-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps for component building
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase().includes(searchWord.toUpperCase()));
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    const findExactTimestamp = (searchWord) => {
      const found = words.find(w => w.word === searchWord);
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    console.log('\n--- HOOK/VIGNETTE ---');
    console.log(`   DEATH TRAP: ${findTimestamp('DEATH')}`);
    console.log(`   Twenty-two: ${findTimestamp('Twenty-two')}`);
    console.log(`   EIGHTY-TWO: ${findTimestamp('EIGHTY-TWO')}`);
    console.log(`   seventy: ${findTimestamp('seventy')}`);
    console.log(`   LEFT (trachea): ${findTimestamp('LEFT')}`);
    console.log(`   GONE: ${findTimestamp('GONE')}`);
    console.log(`   BULGING: ${findTimestamp('BULGING')}`);

    console.log('\n--- OPTIONS ---');
    console.log(`   A): ${findExactTimestamp('A)')}`);
    console.log(`   B): ${findExactTimestamp('B)')}`);
    console.log(`   C): ${findExactTimestamp('C)')}`);
    console.log(`   D): ${findExactTimestamp('D)')}`);
    console.log(`   E): ${findExactTimestamp('E)')}`);

    console.log('\n--- ANSWER REVEAL ---');
    console.log(`   CONGRATULATIONS: ${findTimestamp('CONGRATULATIONS')}`);
    console.log(`   decompression (answer): ${findTimestamp('decompression')}`);

    console.log('\n--- MECHANISM TEACHING ---');
    console.log(`   JACKASSES: ${findTimestamp('JACKASSES')}`);
    console.log(`   PUNCTURED: ${findTimestamp('PUNCTURED')}`);
    console.log(`   ONE-WAY: ${findTimestamp('ONE-WAY')}`);
    console.log(`   VALVE: ${findTimestamp('VALVE')}`);
    console.log(`   BUILDS: ${findTimestamp('BUILDS')}`);
    console.log(`   CRUSHES: ${findTimestamp('CRUSHES')}`);
    console.log(`   SHOVING: ${findTimestamp('SHOVING')}`);
    console.log(`   mediastinum: ${findTimestamp('mediastinum')}`);
    console.log(`   KINKED: ${findTimestamp('KINKED')}`);
    console.log(`   PINCHED: ${findTimestamp('PINCHED')}`);
    console.log(`   JVD: ${findTimestamp('JVD')}`);
    console.log(`   TENSION: ${findTimestamp('TENSION')}`);
    console.log(`   POPS: ${findTimestamp('POPS')}`);
    console.log(`   Fourteen: ${findTimestamp('Fourteen')}`);
    console.log(`   SECOND: ${findTimestamp('SECOND')}`);
    console.log(`   HISS: ${findTimestamp('HISS')}`);
    console.log(`   CLIMB: ${findTimestamp('CLIMB')}`);

    console.log('\n--- CLINICAL PEARL ---');
    console.log(`   TRIAD: ${findTimestamp('TRIAD')}`);
    console.log(`   DECOMPRESS: ${findTimestamp('DECOMPRESS')}`);
    console.log(`   welcome: ${findTimestamp('welcome')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Tension Pneumothorax video.'))
  .catch((err) => console.error(err));
