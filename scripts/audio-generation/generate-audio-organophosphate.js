require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `OH FOR CRYING OUT LOUD, this farmer just got DRENCHED in pesticide and he's got more DROOL coming out of him than a SAINT BERNARD in July! Pupils? PINPOINT. Sweating like he ran a marathon in a SAUNA. Breathing like he's UNDERWATER, wheezing so bad I can hear it from the PARKING LOT. Heart rate's in the FORTIES, blood pressure CRASHING, and his pants are... well, let's just say he LOST CONTROL of the plumbing. This is TEXTBOOK cholinergic crisis, people! SLUDGE syndrome - Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis! So what're you gonna do, hotshot? A) Activated charcoal. B) Atropine. C) Epinephrine. D) Naloxone. E) Physostigmine. Clock's tickin', this man's DROWNING in his own secretions! Well I'll be DAMNED, it's B, ATROPINE! And LOOK AT THAT, half you absolute MORONS picked physostigmine - you wanna ACCELERATE his death? That ADDS more acetylcholine, you GENIUSES! Now SHUT UP and I'll learn you why atropine saves lives while physostigmine ENDS them. Organophosphates IRREVERSIBLY bind to acetylcholinesterase, the enzyme that's supposed to BREAK DOWN acetylcholine. So acetylcholine just PILES UP at every receptor, DROWNING the nervous system. Muscarinic receptors go HAYWIRE - that's your SLUDGE symptoms, the drooling, the diarrhea, the pinpoint pupils. Nicotinic receptors go CRAZY - muscle fasciculations, then PARALYSIS, including the diaphragm. Atropine BLOCKS the muscarinic receptors, stops the SLUDGE, stops the bronchorrhea so he can BREATHE. But here's the PEARL - you ALSO need pralidoxime within the first 24 to 48 hours BEFORE the enzyme ages and becomes permanently destroyed. Pralidoxime actually UNBINDS the organophosphate and REACTIVATES the enzyme! Atropine for symptoms, pralidoxime for the CURE. Start atropine immediately, two milligrams IV push, repeat every 5 minutes until secretions DRY UP. Then pralidoxime one to two grams IV over 30 minutes. This is STEP 1 material, and half of you just picked a drug that would've KILLED your patient FASTER. Now get OUT and go review your TOXICOLOGY before you murder a farmer!`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Organophosphate Poisoning...');
  console.log(`📝 Script length: ${script.length} characters, ~${script.split(' ').length} words`);

  try {
    const response = await client.textToSpeech.convertWithTimestamps('NOpBlnGInO9m6vDvFkFC', {
      text: script,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.35,          // Grumpy hillbilly doctor
        similarity_boost: 0.80,   // Keep it sounding like Grandpa
        style: 0.85,              // Strong character expression
        use_speaker_boost: true
      }
    });

    const outputDir = 'public/assets/audio';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const audioPath = path.join(outputDir, 'organophosphate-poisoning-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'organophosphate-poisoning-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps for Organophosphate Poisoning
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase().includes(searchWord.toUpperCase()));
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    console.log(`   PINPOINT: ${findTimestamp('PINPOINT')}`);
    console.log(`   FORTIES (heart rate): ${findTimestamp('FORTIES')}`);
    console.log(`   SLUDGE: ${findTimestamp('SLUDGE')}`);
    console.log(`   A): ${findTimestamp('A)')}`);
    console.log(`   B): ${findTimestamp('B)')}`);
    console.log(`   C): ${findTimestamp('C)')}`);
    console.log(`   D): ${findTimestamp('D)')}`);
    console.log(`   E): ${findTimestamp('E)')}`);
    console.log(`   ATROPINE (answer): ${findTimestamp('ATROPINE!')}`);
    console.log(`   SHUT UP (teaching start): ${findTimestamp('SHUT')}`);
    console.log(`   Organophosphates: ${findTimestamp('Organophosphates')}`);
    console.log(`   pralidoxime: ${findTimestamp('pralidoxime')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Organophosphate Poisoning video.'))
  .catch((err) => console.error(err));
