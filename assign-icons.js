const fs = require('fs');

console.log('🎨 AGENT 4: ICON SELECTOR (Context-Based)\n');

const timestampOutput = JSON.parse(fs.readFileSync('timestamp-detection-output.json', 'utf8'));

// ===== ICON SELECTION LOGIC =====
function selectIcon(bulletText) {
  const text = bulletText.toLowerCase();

  // MEDICATION/TREATMENT
  if (text.includes('treat') || text.includes('beta-lactam') || text.includes('therapy') ||
      text.includes('medication') || text.includes('drug') || text.includes('antibiotic') ||
      text.includes('amoxicillin') || text.includes('ceftriaxone')) {
    return { iconName: 'pill', iconColor: '#6366f1' };
  }

  // POSITIVE OUTCOMES
  if (text.includes('excellent') || text.includes('good prognosis') ||
      text.includes('recovers') || text.includes('responds') || text.includes('saves lives')) {
    return { iconName: 'check', iconColor: '#22c55e' };
  }

  // NEGATIVE/DANGEROUS
  if (text.includes('death') || text.includes('fatal') || text.includes('severe') ||
      text.includes('contraindicated') || text.includes('avoid') || text.includes('necrosis')) {
    return { iconName: 'warning', iconColor: '#ef4444' };
  }

  // PATHOGENS/DISEASE
  if (text.includes('bacteria') || text.includes('virus') || text.includes('infection') ||
      text.includes('pathogen') || text.includes('strep') || text.includes('pneumo')) {
    return { iconName: 'virus', iconColor: '#9333ea' };
  }

  // MECHANISM/BIOLOGY
  if (text.includes('mechanism') || text.includes('causes') || text.includes('pathway') ||
      text.includes('receptor') || text.includes('binds') || text.includes('invasion') ||
      text.includes('vessel') || text.includes('tissue') || text.includes('cells') ||
      text.includes('alveoli') || text.includes('hemoglobin') || text.includes('breaks down') ||
      text.includes('rbcs') || text.includes('chewed') || text.includes('fills') ||
      text.includes('lobe') || text.includes('inflammatory')) {
    return { iconName: 'microscope', iconColor: '#9333ea' };
  }

  // DATA/NUMBERS (common/signature)
  if (text.includes('most common') || text.includes('typical') || text.includes('normal') ||
      text.includes('pathognomonic') || text.includes('signature') || text.includes('number one') ||
      text.includes('#1') || text.includes('cause of cap')) {
    return { iconName: 'chart', iconColor: '#10b981' };
  }

  // ACTION/RAPID EFFECT
  if (text.includes('rapid') || text.includes('sudden') || text.includes('disrupts') ||
      text.includes('destroys') || text.includes('solid') || text.includes('rock')) {
    return { iconName: 'bolt', iconColor: '#fbbf24' };
  }

  // KEY PEARL/INSIGHT
  if (text.includes('remember') || text.includes('key') || text.includes('pearl') ||
      text.includes('important') || text.includes('delay') || text.includes('don\'t')) {
    return { iconName: 'lightbulb', iconColor: '#FFD700' };
  }

  // DEFAULT: lightbulb (general teaching point)
  return { iconName: 'lightbulb', iconColor: '#FFD700' };
}

// ===== ASSIGN ICONS TO ALL BULLETS =====
console.log('Assigning icons to teaching bullets:\n');

timestampOutput.teachingPhases.forEach((phase, phaseIdx) => {
  console.log(`Phase ${phaseIdx + 1}: ${phase.titleText}`);

  if (phase.layout !== 'pearl-card') {
    phase.elements.forEach((bullet, idx) => {
      const icon = selectIcon(bullet.text);
      bullet.iconName = icon.iconName;
      bullet.iconColor = icon.iconColor;
      console.log(`  ${idx + 1}. ${icon.iconName} (${icon.iconColor}) - "${bullet.text}"`);
    });
  } else {
    console.log(`  (Pearl card - no icons needed)`);
  }
  console.log('');
});

// Save updated output
fs.writeFileSync('icon-assignment-output.json', JSON.stringify(timestampOutput, null, 2));

console.log('✅ ICON ASSIGNMENT COMPLETE');
console.log('   Ready for Agent 5 (Component Builder)\n');
console.log('📄 Saved: icon-assignment-output.json');
