const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = 'sk_ce1a2a964a5089c83bf59b85c1dc347c545891b7887618af';
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Oxley voice

const script = `GOOD GRAVY, this kid came in with a SORE THROAT and now his throat's SWELLING SHUT. Gave him penicillin for strep and within FIVE MINUTES he's PURPLE as a PLUM and can't breathe worth a LICK. Blood pressure FIFTY over NOTHING, skin's breaking out in HIVES like he rolled in POISON IVY, and his mama's SCREAMING because her baby boy's about to DIE from the medicine that was supposed to HELP him. What do you give him FIRST, genius? A) Diphenhydramine. B) Methylprednisolone. C) Albuterol. D) Epinephrine. E) Normal saline. Clock's TICKIN' and that airway's CLOSING. It's D, epinephrine! And I KNOW half you knuckleheads reached for benadryl like this is a case of the SNIFFLES. That boy is in ANAPHYLACTIC SHOCK, not itchy from a mosquito bite! Now LISTEN UP. Penicillin hitched a ride on IgE antibodies sittin' on his mast cells like BOMBS waiting to BLOW. Second dose? BOOM - those mast cells EXPLODE, dumping histamine into his bloodstream like a BUSTED DAM. Histamine WRECKS everything - airways SLAM shut, blood vessels LEAK like sieves, pressure TANKS. Epinephrine's the ONLY thing that can slam on the brakes FAST enough. It CONSTRICTS those leaky vessels, OPENS the airways, and kicks the heart back into gear. Benadryl and steroids? They're backup singers, NOT the lead. Epi FIRST, 0.3 to 0.5 milligrams IM in the THIGH, repeat every five minutes if he ain't improving. Get this wrong on the wards, and you'll be explaining to that mama why her son's DEAD. Now scram.`;

async function generateAudio() {
  try {
    console.log('🎙️  Generating audio with ElevenLabs...');

    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: script,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      responseType: 'arraybuffer',
    });

    const outputPath = path.join(__dirname, 'public/assets/audio/penicillin-anaphylaxis-narration.mp3');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, response.data);

    console.log('✅ Audio saved to:', outputPath);

    // Get file size
    const stats = fs.statSync(outputPath);
    console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error generating audio:', error.response?.data || error.message);
    process.exit(1);
  }
}

generateAudio();
