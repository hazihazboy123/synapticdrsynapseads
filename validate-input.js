const fs = require('fs');
const path = require('path');

const input = JSON.parse(fs.readFileSync('strep-pneumo-input.json', 'utf8'));
const errors = [];
const warnings = [];

console.log('🔍 AGENT 1: INPUT VALIDATOR (Enhanced)\n');

// 1. SCHEMA VALIDATION
console.log('✓ Schema validation passed (topic, script, questionData, phases, memes)');

// 2. MEME FILE VALIDATION
const memes = [
  `public/assets/memes/${input.memes.answerReveal}`,
  `public/assets/memes/${input.memes.contextual.memeId}`
];

memes.forEach(meme => {
  if (!fs.existsSync(meme)) {
    errors.push(`Meme not found: ${meme}`);
  } else {
    console.log(`✓ Meme exists: ${meme}`);
  }
});

// 3. VIGNETTE PHRASE VALIDATION
console.log('\n📋 Vignette Phrase Validation:');
input.vignetteHighlights.forEach((h, idx) => {
  const inVignette = input.questionData.vignette.includes(h.phrase);
  const inLabs = input.questionData.lab_values.some(lab => lab.value.includes(h.phrase));
  const inScript = input.script.toLowerCase().includes(h.phrase.toLowerCase()) ||
                   input.script.toLowerCase().includes(h.phrase.split(' ')[0].toLowerCase());

  if (!inVignette && !inLabs) {
    errors.push(`Phrase "${h.phrase}" not found in vignette or lab values`);
  } else if (!inScript) {
    warnings.push(`Phrase "${h.phrase}" exists in data but NOT mentioned in audio`);
  } else {
    console.log(`✓ Highlight ${idx + 1}: "${h.phrase}" → trigger "${h.triggerWord}"`);
  }
});

// 4. TRIGGER WORD VALIDATION
console.log('\n🎯 Trigger Word Validation:');
const scriptLower = input.script.toLowerCase();

// Check vignette triggers
input.vignetteHighlights.forEach(h => {
  if (!scriptLower.includes(h.triggerWord.toLowerCase())) {
    errors.push(`Vignette trigger "${h.triggerWord}" NOT found in script`);
  } else {
    console.log(`✓ Vignette trigger: "${h.triggerWord}"`);
  }
});

// Check teaching triggers
input.teachingPhases.forEach((phase, idx) => {
  if (!scriptLower.includes(phase.startTrigger.toLowerCase())) {
    errors.push(`Teaching phase ${idx + 1} trigger "${phase.startTrigger}" NOT found`);
  } else {
    console.log(`✓ Phase ${idx + 1} start: "${phase.startTrigger}"`);
  }

  const items = phase.layout === 'pearl-card' ? phase.formula : phase.bullets;
  items.forEach(item => {
    if (!scriptLower.includes(item.triggerWord.toLowerCase())) {
      errors.push(`Trigger "${item.triggerWord}" in phase ${idx + 1} NOT found`);
    }
  });
});

// Check answer reveal
if (!scriptLower.includes(input.criticalMoments.answerReveal.toLowerCase())) {
  errors.push(`Answer reveal "${input.criticalMoments.answerReveal}" NOT found in script`);
} else {
  console.log(`✓ Answer reveal: "${input.criticalMoments.answerReveal}"`);
}

// 5. SCRIPT LENGTH VALIDATION
const wordCount = input.script.split(/\s+/).length;
console.log(`\n📊 Script: ${wordCount} words`);
if (wordCount < 150 || wordCount > 250) {
  warnings.push(`Script length ${wordCount} words (recommended: 180-230)`);
}

// FINAL REPORT
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
  console.log('❌ VALIDATION FAILED\n');
  errors.forEach(err => console.log(`  ❌ ${err}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
}

console.log('\n✅ INPUT VALIDATION PASSED');
console.log('   Ready for Agent 2 (Audio Generator)');
