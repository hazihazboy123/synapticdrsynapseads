#!/usr/bin/env node
/**
 * DKA (Diabetic Ketoacidosis) Audio Generation Script
 * Topic: dka-potassium-management
 *
 * ONE API call to ElevenLabs - never retry
 * Voice: Grandpa Spuds Oxley (grumpy, sarcastic, educational)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'NOpBlnGInO9m6vDvFkFC'; // Grandpa Spuds Oxley

const script = `GOOD LORD have mercy, nineteen-year-old college kid found FACE DOWN in his dorm room smellin' like a NAIL SALON. Roommate thought he was hungover 'til he noticed the boy BREATHIN' like a freight train runnin' uphill. Deep, DESPERATE gasps, body tryin' to BLOW OFF all that acid. Glucose is FIVE HUNDRED, pH is down to SEVEN POINT ONE, and his breath could STRIP PAINT off a barn door. Ketones POURIN' out of him like he's LEAKIN' jet fuel. Now here comes Dr. Eager Beaver ready to SLAM insulin into this kid. Hold your horses there, partner.
What do you CHECK before givin' insulin? Is it A, Hemoglobin A1C? B, Serum potassium? C, Liver enzymes? D, Chest X-ray? Or E, Urine culture?
Well BUTTER MY BISCUIT, it's B, serum potassium. Half of you were fixin' to STOP this boy's HEART.
Now SIMMER DOWN and I'll learn you why this matters. See, this kid's got PLENTY of potassium floatin' OUTSIDE his cells right now, looks NORMAL on paper. But that's a DADGUM LIE. His total body potassium is BONE DRY 'cause he's been PISSIN' it out for days. You slam insulin? SHOVES all that potassium BACK into cells. Serum drops like a STONE and his heart goes into ARREST. Check it FIRST, replace if it's low, THEN give insulin. This ain't about treatin' sugar, it's about keepin' hearts BEATIN'. Now get outta here before I assign you more readin'.`;

async function generateAudio() {
  console.log('🎙️  Generating DKA audio via ElevenLabs...');
  console.log('📝 Script length:', script.length, 'characters');

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.80,
          style: 0.85,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Audio generated successfully');

    // Save the raw response for debugging
    fs.writeFileSync(
      path.join(__dirname, 'debug-dka-elevenlabs-response.json'),
      JSON.stringify(data, null, 2)
    );
    console.log('📁 Debug response saved to debug-dka-elevenlabs-response.json');

    // Decode and save the audio
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    const audioPath = path.join(__dirname, 'public/assets/audio/dka-potassium-management-narration.mp3');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log('🎵 Audio saved to:', audioPath);

    // Convert timestamps to our schema format
    const { characters, character_start_times_seconds, character_end_times_seconds } = data.alignment;

    const words = [];
    let currentWord = '';
    let wordStart = null;
    let wordEnd = null;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const startTime = character_start_times_seconds[i];
      const endTime = character_end_times_seconds[i];

      if (char === ' ' || i === characters.length - 1) {
        // End of word
        if (currentWord) {
          // If it's the last character and not a space, include it
          if (i === characters.length - 1 && char !== ' ') {
            currentWord += char;
            wordEnd = endTime;
          }

          words.push({
            word: currentWord,
            start: wordStart,
            end: wordEnd || endTime,
          });
        }
        currentWord = '';
        wordStart = null;
        wordEnd = null;
      } else {
        // Building word
        if (!currentWord) {
          wordStart = startTime;
        }
        currentWord += char;
        wordEnd = endTime;
      }
    }

    const timestampsData = { words };
    const timestampsPath = path.join(__dirname, 'public/assets/audio/dka-potassium-management-timestamps.json');
    fs.writeFileSync(timestampsPath, JSON.stringify(timestampsData, null, 2));
    console.log('⏱️  Timestamps saved to:', timestampsPath);
    console.log('📊 Total words detected:', words.length);

    // Calculate audio duration
    if (words.length > 0) {
      const duration = words[words.length - 1].end;
      console.log('⏱️  Audio duration:', duration.toFixed(2), 'seconds');
      console.log('🎬 At 1.9x playback:', (duration / 1.9).toFixed(2), 'seconds perceived time');
    }

  } catch (error) {
    console.error('❌ Error generating audio:', error);
    process.exit(1);
  }
}

generateAudio();
