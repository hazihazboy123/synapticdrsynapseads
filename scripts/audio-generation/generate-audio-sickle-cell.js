require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `GOOD LORD, this girl's been dealing with sickle cell her WHOLE life, but TODAY her own blood's fixin' to KILL HER. Mama thought it was just the FLU - fever, chest pain, little cough. Now she's GASPING like a fish outta water, oxygen's TANKING, and her lungs are DROWNING in her own BENT-UP blood cells. Nineteen years old and about to DIE because her hemoglobin decided to fold up like a BUSTED LAWN CHAIR. X-ray shows a new INFILTRATE, O2 sat's SEVENTY-EIGHT on room air, and her reticulocyte count's through the ROOF 'cause her body's DESPERATE to make new blood. What do you do, hotshot? A) Simple blood transfusion. B) Exchange transfusion. C) High-flow oxygen only. D) IV antibiotics and observation. E) Hydroxyurea. This girl ain't got time for you to DILLY-DALLY. It's B, exchange transfusion! And I KNOW some of you knuckleheads picked simple transfusion thinking "she's anemic, give her blood!" You just KILLED your patient, congratulations. Now SHUT YOUR TRAP and listen. Her hemoglobin S is POLYMERIZING when oxygen gets low - folding up into RIGID RODS that WARP the red cells into little SICKLES. These BENT-UP cells don't flow through capillaries - they JAM UP like LOGS in a river, creating a MASSIVE LOGJAM in her lungs. Oxygen can't get through, tissue starts DYING, and here's the NASTY part - hypoxia makes MORE cells sickle. It's a DEATH SPIRAL. Simple transfusion? You're just ADDING more fluid to an already CLOGGED system - viscosity goes UP, logjam gets WORSE. Exchange transfusion REMOVES the sickled cells while REPLACING 'em with normal blood. You're UNCLOGGING that river, breaking the death spiral, and buying her lungs time to HEAL. Target that HbS below THIRTY percent. This is STEP 1 material and the difference between a LIVING patient and a BODY BAG. Now get OUT of here before you jam up MY ICU.`;

  console.log('🩸 Generating audio with Grandpa Spuds for Sickle Cell Acute Chest Syndrome...');
  console.log(`📝 Script length: ${script.length} characters, ~${script.split(' ').length} words`);

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: script,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.35,          // Grumpy/varied - LOCKED
        similarity_boost: 0.80,   // Keep it sounding like Grandpa - LOCKED
        style: 0.85,              // Strong character expression - LOCKED
        use_speaker_boost: true   // LOCKED
      }
    });

    const outputDir = 'public/assets/audio';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const audioPath = path.join(outputDir, 'sickle-cell-acute-chest-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'sickle-cell-acute-chest-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps for development
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w =>
        w.word.toUpperCase().includes(searchWord.toUpperCase()) ||
        w.word.toUpperCase() === searchWord.toUpperCase()
      );
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    const findExactTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase() === searchWord.toUpperCase());
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    // Vignette triggers
    console.log('\n📋 VIGNETTE TIMESTAMPS:');
    console.log(`   FLU: ${findTimestamp('FLU')}`);
    console.log(`   GASPING: ${findTimestamp('GASPING')}`);
    console.log(`   TANKING: ${findTimestamp('TANKING')}`);
    console.log(`   INFILTRATE: ${findTimestamp('INFILTRATE')}`);
    console.log(`   SEVENTY-EIGHT: ${findTimestamp('SEVENTY-EIGHT')}`);
    console.log(`   ROOF: ${findTimestamp('ROOF')}`);

    // Options
    console.log('\n🔤 OPTION TIMESTAMPS:');
    console.log(`   A): ${findExactTimestamp('A)')}`);
    console.log(`   B): ${findExactTimestamp('B)')}`);
    console.log(`   C): ${findExactTimestamp('C)')}`);
    console.log(`   D): ${findExactTimestamp('D)')}`);
    console.log(`   E): ${findExactTimestamp('E)')}`);

    // Answer reveal
    console.log('\n✅ ANSWER REVEAL:');
    console.log(`   exchange (answer): ${findTimestamp('exchange')}`);
    console.log(`   transfusion!: ${findTimestamp('transfusion!')}`);

    // Teaching triggers
    console.log('\n📚 TEACHING TIMESTAMPS:');
    console.log(`   SHUT: ${findTimestamp('SHUT')}`);
    console.log(`   TRAP: ${findTimestamp('TRAP')}`);
    console.log(`   POLYMERIZING: ${findTimestamp('POLYMERIZING')}`);
    console.log(`   RIGID: ${findTimestamp('RIGID')}`);
    console.log(`   SICKLES: ${findTimestamp('SICKLES')}`);
    console.log(`   JAM: ${findTimestamp('JAM')}`);
    console.log(`   LOGJAM: ${findTimestamp('LOGJAM')}`);
    console.log(`   DEATH: ${findTimestamp('DEATH')}`);
    console.log(`   SPIRAL: ${findTimestamp('SPIRAL')}`);
    console.log(`   REMOVES: ${findTimestamp('REMOVES')}`);
    console.log(`   REPLACING: ${findTimestamp('REPLACING')}`);
    console.log(`   UNCLOGGING: ${findTimestamp('UNCLOGGING')}`);
    console.log(`   THIRTY: ${findTimestamp('THIRTY')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Sickle Cell Acute Chest Syndrome video.'))
  .catch((err) => console.error(err));
