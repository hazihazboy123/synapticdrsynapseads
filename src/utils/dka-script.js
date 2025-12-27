/**
 * DKA Potassium Management Script for Audio Generation
 *
 * Run with: node src/utils/dka-script.js
 * Requires ELEVENLABS_API_KEY in .env
 */

require('dotenv').config();
const { generateAudio } = require('./generateAudio');
const path = require('path');

const DKA_SCRIPT = `GOOD LORD have mercy, nineteen-year-old college kid found FACE DOWN in his dorm room smellin' like a NAIL SALON. Roommate thought he was hungover 'til he noticed the boy BREATHIN' like a freight train runnin' uphill. Deep, DESPERATE gasps, body tryin' to BLOW OFF all that acid.

Glucose is FIVE HUNDRED, pH is down to SEVEN POINT ONE, and his breath could STRIP PAINT off a barn door. Ketones POURIN' out of him like he's LEAKIN' jet fuel.

Now here comes Dr. Eager Beaver ready to SLAM insulin into this kid. Hold your horses there, partner.

What do you CHECK before givin' insulin? Is it A, Hemoglobin A1C? B, Serum potassium? C, Liver enzymes? D, Chest X-ray? Or E, Urine culture?

Well BUTTER MY BISCUIT, it's B, serum potassium. Half of you were fixin' to STOP this boy's HEART.

Now SIMMER DOWN and I'll learn you why this matters. See, this kid's got PLENTY of potassium floatin' OUTSIDE his cells right now, looks NORMAL on paper. But that's a DADGUM LIE. His total body potassium is BONE DRY 'cause he's been PISSIN' it out for days.

You slam insulin? SHOVES all that potassium BACK into cells. Serum drops like a STONE and his heart goes into ARREST.

Check it FIRST, replace if it's low, THEN give insulin. This ain't about treatin' sugar, it's about keepin' hearts BEATIN'.

Now get outta here before I assign you more readin'.`;

async function main() {
  const outputPath = path.join(__dirname, '../../public/assets/audio/dka-potassium-management-narration.mp3');

  console.log('🎙️  Generating DKA Potassium Management narration...');
  console.log('📝 Script length:', DKA_SCRIPT.length, 'characters');

  try {
    await generateAudio(DKA_SCRIPT, outputPath);
    console.log('🎉 Done! Audio ready for Remotion.');
    console.log('📁 Output:', outputPath);
  } catch (error) {
    console.error('❌ Failed to generate audio:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DKA_SCRIPT };
