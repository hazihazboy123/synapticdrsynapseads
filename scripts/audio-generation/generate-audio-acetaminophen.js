require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function generateAudio() {
  const script = `This girl is gonna DIE in forty-eight hours and she doesn't even KNOW it yet. Took a whole BOTTLE of Tylenol eight hours ago, and now she's sittin' there tellin' me she feels FINE. FINE! That's the TRAP. That's how acetaminophen KILLS you - you feel NOTHING while your liver MELTS from the inside. And I GUARANTEE eighty percent of you are about to pick the WRONG answer and let her walk out of here to DIE at home. Labs just came back - AST? TWENTY-EIGHT FORTY-SEVEN. Normal is FORTY. Her liver enzymes are SEVENTY TIMES normal and she's askin' if she can go get CHIPOTLE. ALT? THIRTY-ONE FIFTY-SIX. INR 2.8 - her blood forgot how to CLOT. In forty-eight hours without treatment? Fulminant hepatic failure. Encephalopathy. DEATH. So what're you gonna do, hotshot? A) Activated charcoal. B) Fomepizole. C) N-Acetylcysteine. D) Hemodialysis. E) Supportive care only. Clock's tickin' and her liver's MELTING. Well HOT DAMN, it's C, N-Acetylcysteine! And I KNOW at least half you picked activated charcoal because that's what EVERY medical student picks and that's why EVERY medical student would've just KILLED this patient. Charcoal works if you give it within ONE TO TWO HOURS. She came in at EIGHT HOURS. The Tylenol's already ABSORBED and is MURDERING hepatocytes as we SPEAK. Charcoal at this point is like puttin' on a seatbelt AFTER the car crash. USELESS. Now SHUT UP and let me teach you why this is the SILENT KILLER hiding in everyone's medicine cabinet. Normally when you take Tylenol, your liver handles it like a CHAMP. Ninety-five percent gets glucuronidated - made water-soluble, peed out. Easy. But five percent goes through CYP450 and becomes this TOXIC metabolite called NAPQI. N-A-P-Q-I. Sounds scary because it IS scary. Now normally? No problem! Your liver's got GLUTATHIONE - think of it as your liver's BODYGUARD. Glutathione TACKLES that NAPQI before it can do damage. You're fine, go about your day. But when someone eats the WHOLE BOTTLE? The safe pathway gets OVERWHELMED. Can't keep up. More and more Tylenol gets shunted to CYP450. NAPQI starts PILING UP. And your glutathione? DEPLETED. EXHAUSTED. GONE. Now NAPQI has NOTHING stopping it. It latches onto hepatocytes and just DESTROYS them. Zone 3 necrosis - CENTRILOBULAR pattern - that's your buzzword for the boards. And HERE'S the terrifying part that makes this a KILLER - for the first TWENTY-FOUR HOURS? Patient feels FINE. Maybe mildly nauseous. Wants to go home. The liver is being DESTROYED and they feel NOTHING. By hour seventy-two? Fulminant hepatic failure. Yellow skin. Confused. Bleeding everywhere. DEAD without a transplant. Enter N-ACETYLCYSTEINE - NAC - the ANTIDOTE! NAC provides CYSTEINE - the building block your liver needs to REBUILD glutathione! Glutathione comes back ONLINE, starts NEUTRALIZING that NAPQI before it can kill more cells! The liver SURVIVES! TIMING is EVERYTHING! Within EIGHT HOURS? NAC is nearly ONE HUNDRED PERCENT effective. Don't even THINK, just GIVE IT. Eight to TWENTY-FOUR hours? Still helps significantly. GIVE IT. After twenty-four hours? Liver damage may be permanent but NAC STILL reduces mortality. GIVE IT ANYWAY. Use the RUMACK-MATTHEW NOMOGRAM - plot the acetaminophen level against time since ingestion. Above the treatment line? TREAT. Don't wait for symptoms - by the time symptoms show up you're already behind. Loading dose: one-fifty milligrams per kilogram over one hour. Then fifty per kilogram over four hours. Then one hundred per kilogram over sixteen hours. Twenty-one hour protocol. That's how you SAVE this patient. Tylenol - looks harmless, KILLS silently. NAC - the cure if you're SMART enough to give it in time. Now you know. Don't let YOUR patient be the one who walks out feelin' fine and comes back in a body bag. Get OUT of here and go study your ANTIDOTES.`;

  console.log('🎙️  Generating audio with Grandpa Spuds for Acetaminophen Overdose...');
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
    const audioPath = path.join(outputDir, 'acetaminophen-overdose-narration.mp3');
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
    const timestampsPath = path.join(outputDir, 'acetaminophen-overdose-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify({
      script: script,
      words: words,
    }, null, 2));

    console.log(`✅ Timestamps saved to ${timestampsPath}`);
    console.log(`📝 Generated ${words.length} word timestamps`);

    // Calculate duration
    const lastWord = words[words.length - 1];
    console.log(`⏱️  Audio duration: ${lastWord.end.toFixed(2)}s`);

    // Find key timestamps for Acetaminophen Overdose
    console.log('\n🔍 Key timestamps detected:');

    const findTimestamp = (searchWord) => {
      const found = words.find(w => w.word.toUpperCase().includes(searchWord.toUpperCase()));
      return found ? found.start.toFixed(3) : 'NOT FOUND';
    };

    console.log(`   DIE (hook): ${findTimestamp('DIE')}`);
    console.log(`   BOTTLE: ${findTimestamp('BOTTLE')}`);
    console.log(`   FINE: ${findTimestamp('FINE')}`);
    console.log(`   TWENTY-EIGHT (AST): ${findTimestamp('TWENTY-EIGHT')}`);
    console.log(`   THIRTY-ONE (ALT): ${findTimestamp('THIRTY-ONE')}`);
    console.log(`   A): ${findTimestamp('A)')}`);
    console.log(`   B): ${findTimestamp('B)')}`);
    console.log(`   C): ${findTimestamp('C)')}`);
    console.log(`   D): ${findTimestamp('D)')}`);
    console.log(`   E): ${findTimestamp('E)')}`);
    console.log(`   N-Acetylcysteine! (answer): ${findTimestamp('N-Acetylcysteine!')}`);
    console.log(`   SHUT UP (teaching start): ${findTimestamp('SHUT')}`);
    console.log(`   NAPQI: ${findTimestamp('NAPQI')}`);
    console.log(`   GLUTATHIONE: ${findTimestamp('GLUTATHIONE')}`);
    console.log(`   Zone 3: ${findTimestamp('Zone')}`);
    console.log(`   CENTRILOBULAR: ${findTimestamp('CENTRILOBULAR')}`);
    console.log(`   RUMACK-MATTHEW: ${findTimestamp('RUMACK-MATTHEW')}`);
    console.log(`   one-fifty milligrams: ${findTimestamp('one-fifty')}`);

    return audioPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    throw error;
  }
}

generateAudio()
  .then(() => console.log('\n🎉 Done! Audio ready for Acetaminophen Overdose video.'))
  .catch((err) => console.error(err));
