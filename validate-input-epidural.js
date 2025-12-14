const fs = require('fs');

const TOPIC = 'epidural-hematoma';
console.log('🔍 AGENT 1: INPUT VALIDATOR\n');

// Load input
const input = JSON.parse(fs.readFileSync('input-epidural-hematoma.json', 'utf8'));

let passed = 0;
let failed = 0;

// Check 1: vignetteHighlights array
if (input.vignetteHighlights && input.vignetteHighlights.length >= 3 && input.vignetteHighlights.length <= 7) {
  console.log(`✅ vignetteHighlights: ${input.vignetteHighlights.length} items (valid range)`);
  passed++;
} else {
  console.log('❌ vignetteHighlights: invalid count');
  failed++;
}

// Check 2: All vignette phrases exist in script or vignette
const script = input.script.toLowerCase();
const vignette = input.questionData.vignette.toLowerCase();
input.vignetteHighlights.forEach((highlight, idx) => {
  const phrase = highlight.phrase.toLowerCase();
  if (script.includes(phrase) || vignette.includes(phrase)) {
    console.log(`✅ Highlight ${idx + 1}: "${highlight.phrase}" found`);
    passed++;
  } else {
    console.log(`❌ Highlight ${idx + 1}: "${highlight.phrase}" NOT found in script/vignette`);
    failed++;
  }
});

// Check 3: All trigger words are valid
input.vignetteHighlights.forEach((highlight, idx) => {
  if (highlight.triggerWord && highlight.triggerWord.length > 0) {
    console.log(`✅ Highlight ${idx + 1} trigger word: "${highlight.triggerWord}"`);
    passed++;
  } else {
    console.log(`❌ Highlight ${idx + 1}: missing trigger word`);
    failed++;
  }
});

// Check 4: teachingPhases
if (input.teachingPhases && input.teachingPhases.length >= 1 && input.teachingPhases.length <= 3) {
  console.log(`✅ Teaching phases: ${input.teachingPhases.length} phases`);
  passed++;
} else {
  console.log('❌ Teaching phases: invalid count');
  failed++;
}

// Check 5: All teaching bullets have trigger words
input.teachingPhases.forEach((phase, pIdx) => {
  phase.bullets.forEach((bullet, bIdx) => {
    if (bullet.triggerWord && bullet.triggerWord.length > 0) {
      console.log(`✅ Phase ${pIdx + 1}, Bullet ${bIdx + 1}: trigger "${bullet.triggerWord}"`);
      passed++;
    } else {
      console.log(`❌ Phase ${pIdx + 1}, Bullet ${bIdx + 1}: missing trigger word`);
      failed++;
    }
  });
});

// Check 6: Meme files exist
if (input.memes.answerReveal) {
  const memeFile = `public/assets/memes/${input.memes.answerReveal}.jpg`;
  if (fs.existsSync(memeFile)) {
    console.log(`✅ Answer reveal meme exists: ${memeFile}`);
    passed++;
  } else {
    console.log(`❌ Answer reveal meme missing: ${memeFile}`);
    failed++;
  }
}

// Check 7: Medical images
if (input.medicalImages && input.medicalImages.length > 0) {
  input.medicalImages.forEach((img, idx) => {
    const imgPath = `public/assets/memes/${img.filename}`;
    if (fs.existsSync(imgPath)) {
      console.log(`✅ Medical image ${idx + 1} exists: ${imgPath}`);
      passed++;
    } else {
      console.log(`❌ Medical image ${idx + 1} missing: ${imgPath}`);
      failed++;
    }
  });
}

// Final report
console.log('\n============================================');
console.log('AGENT 1: INPUT VALIDATION COMPLETE');
console.log('============================================');
console.log(`✅ PASSED: ${passed}`);
if (failed > 0) {
  console.log(`❌ FAILED: ${failed}`);
  console.log('\n❌ VALIDATION FAILED - Fix issues before proceeding');
  process.exit(1);
} else {
  console.log('\n✅ ALL CHECKS PASSED - Ready for Agent 2');
  process.exit(0);
}
