const fs = require('fs');
const path = require('path');

const script = "Lord have mercy, here comes a five-year-old youngun lookin' like the Michelin Man. Face puffed up like a BALLOON, ankles swollen somethin' FIERCE, belly distended like he swallowed a watermelon. Mother says his pee's been FROTHY as a root beer float for two weeks straight. Lab work comes back and JUMPIN' JEHOSHAPHAT, protein spillin' out like a busted fire hydrant - four grams a day. Albumin's TANKED at one point eight. Cholesterol through the ROOF at four hundred. So what's causin' this poor child to leak like a rusty bucket? A) Post-strep glomerulonephritis, B) Minimal change disease, C) IgA nephropathy, D) Hemolytic uremic syndrome, or E) Acute tubular necrosis? Think on it. Well I'll be HORNSWOGGLED, it's B. Minimal change disease. Most of you probably picked A thinkin' strep. BALDERDASH. Now pay attention. Nephrotic syndrome's got four things - massive proteinuria, hypoalbuminemia, EDEMA, and hyperlipidemia. In youngsters, it's minimal change. Give 'em steroids, they get better. Simple as that. Remember this - frothy urine plus puffy kid equals minimal change. Now skedaddle.";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_ce1a2a964a5089c83bf59b85c1dc347c545891b7887618af';
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC';

async function generateAudio() {
  console.log('🎙️  Generating audio with MAXIMUM GRUMPY Grandpa Oxley settings...');
  console.log('📝 Script length:', script.split(' ').length, 'words');
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.80,
            style: 0.85,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Audio generated successfully!');

    // Save audio file
    const audioPath = path.join(__dirname, 'public/assets/audio/nephrotic-syndrome-minimal-change-narration.mp3');
    fs.writeFileSync(audioPath, Buffer.from(data.audio_base64, 'base64'));
    console.log('💾 Audio saved:', audioPath);

    // Save full response for debugging
    const debugPath = path.join(__dirname, 'debug-response.json');
    fs.writeFileSync(debugPath, JSON.stringify({
      alignment_keys: Object.keys(data.alignment || {}),
      first_5_chars: (data.alignment?.characters || []).slice(0, 5),
      char_count: (data.alignment?.characters || []).length
    }, null, 2));
    console.log('🔍 Debug info saved');

    // Process timestamps
    const words = [];
    let duration = 50;
    
    // Try characters array
    const chars = data.alignment?.characters || [];
    
    if (chars.length === 0) {
      throw new Error('No character alignment data');
    }
    
    let currentWord = '';
    let wordStart = 0;
    
    chars.forEach((char, idx) => {
      if (char.character === ' ' || char.character === '\n' || idx === chars.length - 1) {
        if (currentWord) {
          if (idx === chars.length - 1 && char.character !== ' ' && char.character !== '\n') {
            currentWord += char.character;
          }
          
          const endTime = char.end_time_seconds !== undefined ? char.end_time_seconds : char.start_time_seconds;
          
          words.push({
            text: currentWord,
            start: wordStart,
            end: endTime
          });
          currentWord = '';
        }
      } else {
        if (!currentWord) {
          wordStart = char.start_time_seconds;
        }
        currentWord += char.character;
      }
    });

    const lastChar = chars[chars.length - 1];
    duration = lastChar.end_time_seconds !== undefined ? lastChar.end_time_seconds : lastChar.start_time_seconds;
    
    console.log('⏱️  Duration:', duration.toFixed(2), 'seconds');
    console.log('📊 Total words:', words.length);

    // Save timestamps
    const timestampsData = {
      topic: 'nephrotic-syndrome-minimal-change',
      duration: duration,
      words: words
    };

    const timestampsPath = path.join(__dirname, 'public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(timestampsData, null, 2));
    console.log('💾 Timestamps saved:', timestampsPath);
    
    console.log('\n✨ Audio generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateAudio();
