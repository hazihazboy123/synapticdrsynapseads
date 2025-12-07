const fs = require('fs');
const path = require('path');

// Read the existing response
const audioExists = fs.existsSync('./public/assets/audio/nephrotic-syndrome-minimal-change-narration.mp3');
if (!audioExists) {
  console.error('Audio file not found!');
  process.exit(1);
}

const script = "Lord have mercy, here comes a five-year-old youngun lookin' like the Michelin Man. Face puffed up like a BALLOON, ankles swollen somethin' FIERCE, belly distended like he swallowed a watermelon. Mother says his pee's been FROTHY as a root beer float for two weeks straight. Lab work comes back and JUMPIN' JEHOSHAPHAT, protein spillin' out like a busted fire hydrant - four grams a day. Albumin's TANKED at one point eight. Cholesterol through the ROOF at four hundred. So what's causin' this poor child to leak like a rusty bucket? A) Post-strep glomerulonephritis, B) Minimal change disease, C) IgA nephropathy, D) Hemolytic uremic syndrome, or E) Acute tubular necrosis? Think on it. Well I'll be HORNSWOGGLED, it's B. Minimal change disease. Most of you probably picked A thinkin' strep. BALDERDASH. Now pay attention. Nephrotic syndrome's got four things - massive proteinuria, hypoalbuminemia, EDEMA, and hyperlipidemia. In youngsters, it's minimal change. Give 'em steroids, they get better. Simple as that. Remember this - frothy urine plus puffy kid equals minimal change. Now skedaddle.";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_ce1a2a964a5089c83bf59b85c1dc347c545891b7887618af';
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC';

async function fixTimestamps() {
  console.log('🔧 Generating timestamps from existing audio...');
  
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // NEW STRUCTURE: separate arrays
    const chars = data.alignment.characters;
    const startTimes = data.alignment.character_start_times_seconds;
    const endTimes = data.alignment.character_end_times_seconds;
    
    console.log('📊 Characters:', chars.length);
    
    // Build words from character arrays
    const words = [];
    let currentWord = '';
    let wordStart = 0;
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const startTime = startTimes[i];
      const endTime = endTimes[i];
      
      if (char === ' ' || char === '\n' || i === chars.length - 1) {
        if (currentWord) {
          if (i === chars.length - 1 && char !== ' ' && char !== '\n') {
            currentWord += char;
          }
          
          words.push({
            text: currentWord,
            start: wordStart,
            end: endTime
          });
          currentWord = '';
        }
      } else {
        if (!currentWord) {
          wordStart = startTime;
        }
        currentWord += char;
      }
    }
    
    const duration = endTimes[endTimes.length - 1];
    
    console.log('⏱️  Duration:', duration.toFixed(2), 'seconds');
    console.log('📝 Total words:', words.length);
    
    // Save timestamps
    const timestampsData = {
      topic: 'nephrotic-syndrome-minimal-change',
      duration: duration,
      words: words
    };

    const timestampsPath = path.join(__dirname, 'public/assets/audio/nephrotic-syndrome-minimal-change-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(timestampsData, null, 2));
    console.log('✅ Timestamps saved!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTimestamps();
