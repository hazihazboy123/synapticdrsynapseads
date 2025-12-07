import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Spuds Oxley
const MODEL_ID = 'eleven_turbo_v2_5';

const script = `Oh for cryin' out loud. 58 year old guy. Smoked like a chimney for 30 years. Now he's coughing up blood. CT shows a big fat mass right in the center of his lung. And the middle? HOLLOWED out. Like his chances of seeing 60.

Calcium through the roof. PTH is suppressed. No bone mets. This tumor started its own endocrine business.

What do you see on biopsy? A? B? C? D? E? Think real hard... Pick wrong and he's a goner by Tuesday.

It's C. Course it is. Keratin pearls. Intercellular bridges. Squamous cell carcinoma. You picked adenocarcinoma didn't you? That's peripheral. This is central.

Alright FINE. Here's what happened. Smoking TORCHED his airways. Normal cells said forget this and turned squamous. Then dysplastic. Then cancerous. This tumor PARKED itself by the bronchus. CHOKED off the airway. Then it got greedy and EATS itself from the inside. Outgrows its blood supply. Center dies. That's your cavitation.

Now the calcium. This tumor's smart. SPITS out P T H related peptide. TRICKS the body into thinking it needs more calcium. Bones just DUMP it into the blood. No metastases required. Pure paraneoplastic evil.

Now go study. And for the love of God stop smoking.`;

async function generateAudio() {
  try {
    console.log('Generating audio with ElevenLabs...');

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
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.58,
            similarity_boost: 0.82,
            style: 0.68,
            use_speaker_boost: true,
          },
          output_format: 'mp3_44100_128',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Save audio file
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    const audioPath = path.resolve(__dirname, '../../public/assets/audio/squamous-cell-lung-carcinoma-narration.mp3');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log(`✓ Audio saved to: ${audioPath}`);

    // Save timestamps
    const timestampsPath = path.resolve(__dirname, '../../public/assets/audio/squamous-cell-lung-carcinoma-aligned-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(data.alignment, null, 2));
    console.log(`✓ Timestamps saved to: ${timestampsPath}`);

    console.log('\n=== Audio Generation Complete ===');
    console.log(`Duration: ${data.alignment.characters[data.alignment.characters.length - 1].end_time_seconds.toFixed(2)}s`);

  } catch (error) {
    console.error('Error generating audio:', error);
    process.exit(1);
  }
}

generateAudio();
