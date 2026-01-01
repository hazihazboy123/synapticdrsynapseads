require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `SWEET MOTHER OF MERCY, this man's lips are BLUER than a SMURF and he ain't breathed more than TWICE in the last minute. Found him slumped over in a gas station bathroom with a NEEDLE still danglin' from his arm. Pupils? PINPOINT. Respiratory rate? FOUR breaths a minute when he BOTHERS to try. His buddy's SCREAMIN' that he just wanted to take the edge off after his back surgery, and now he's watchin' his best friend DIE on a filthy bathroom floor. So what's gonna SNATCH this man back from the grave? A) Flumazenil. B) Naloxone. C) Activated charcoal. D) Physostigmine. E) Atropine. TICK TOCK, future doctors. Every second you DILLY-DALLY is another brain cell DYIN'. It's B, naloxone! And I BET half you GENIUSES reached for flumazenil like you can't tell the difference between an OPIOID and a BENZO. That man's respiratory drive is FLATLINED, not his GABA receptors! Now LISTEN UP, 'cause this is how you save a LIFE. Opioids LATCH onto mu receptors in the brainstem like a DRUNK passed out on your COUCH. These receptors control breathin', and when they're OCCUPIED, the brain FORGETS to tell the lungs to work. Respiratory rate TANKS, oxygen PLUMMETS, and without intervention, that man's gonna be ROOM TEMPERATURE in about four minutes. Here's where naloxone is a BEAUTIFUL thing - it's got HIGHER AFFINITY for them mu receptors than the opioid does. Doesn't just BLOCK the receptor, it straight up BOOTS the opioid molecule OFF like a bouncer throwin' out a TROUBLEMAKER. Opioid goes FLYIN', receptor CLEARS, and suddenly that man's brain REMEMBERS it needs to breathe. But here's the CATCH - naloxone only lasts thirty to ninety minutes, and some of these long-acting opioids hang around for HOURS. Patient wakes up, feels fine, you pat yourself on the back, then two hours later he's BLUE again 'cause the naloxone wore off but the fentanyl didn't. That's why you WATCH 'em. Nasal spray, 4 milligrams. IV or IM, 0.4 to 2 milligrams. Repeat every two to three minutes. This is NARCAN, folks - it's in VENDING MACHINES now because this crisis ain't goin' away. Learn it, carry it, SAVE A LIFE. Now get outta here.`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Opioid Overdose...');
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
    const audioPath = path.join(outputDir, 'opioid-overdose-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'opioid-overdose-timestamps.json');
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
    console.log('\n--- VIGNETTE TRIGGERS ---');
    console.log(`   "man's" (vignette start): ${findTimestamp("man's")}`);
    console.log(`   SMURF: ${findExact('SMURF')}`);
    console.log(`   PINPOINT: ${findExact('PINPOINT')}`);
    console.log(`   FOUR: ${findExact('FOUR')}`);

    // Option triggers
    console.log('\n--- OPTION TRIGGERS ---');
    console.log(`   A) Flumazenil: ${findExact('A)')}`);
    console.log(`   B) Naloxone: ${findExact('B)')}`);
    console.log(`   C) Activated: ${findExact('C)')}`);
    console.log(`   D) Physostigmine: ${findExact('D)')}`);
    console.log(`   E) Atropine: ${findExact('E)')}`);

    // Answer reveal
    console.log('\n--- ANSWER REVEAL ---');
    console.log(`   "naloxone!" (answer): ${findTimestamp('naloxone!')}`);

    // Teaching phase triggers
    console.log('\n--- TEACHING PHASE ---');
    console.log(`   "LISTEN" (teaching start): ${findExact('LISTEN')}`);
    console.log(`   LATCH: ${findExact('LATCH')}`);
    console.log(`   DRUNK: ${findExact('DRUNK')}`);
    console.log(`   COUCH: ${findExact('COUCH')}`);
    console.log(`   OCCUPIED: ${findExact('OCCUPIED')}`);
    console.log(`   FORGETS: ${findExact('FORGETS')}`);
    console.log(`   TANKS: ${findExact('TANKS')}`);
    console.log(`   PLUMMETS: ${findExact('PLUMMETS')}`);
    console.log(`   BEAUTIFUL: ${findExact('BEAUTIFUL')}`);
    console.log(`   AFFINITY: ${findExact('AFFINITY')}`);
    console.log(`   BOOTS: ${findExact('BOOTS')}`);
    console.log(`   bouncer: ${findExact('bouncer')}`);
    console.log(`   FLYIN': ${findTimestamp("FLYIN'")}`);
    console.log(`   CLEARS: ${findExact('CLEARS')}`);
    console.log(`   REMEMBERS: ${findExact('REMEMBERS')}`);
    console.log(`   CATCH: ${findExact('CATCH')}`);
    console.log(`   Nasal: ${findExact('Nasal')}`);
    console.log(`   milligrams: ${findTimestamp('milligrams')}`);
    console.log(`   NARCAN: ${findExact('NARCAN')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Opioid Overdose video.'))
  .catch((err) => console.error(err));
