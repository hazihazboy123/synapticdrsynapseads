const fs = require('fs');
const path = require('path');

const topic = 'bph-5-alpha-reductase';
const timestampsDetected = require('./timestamps-detected-bph-5-alpha-reductase.json');

console.log('🎨 AGENT 4: ICON SELECTOR - Context-Based Assignment\n');

// ===== ICON SELECTION LOGIC =====
function selectIcon(bulletText) {
  const text = bulletText.toLowerCase();

  // MEDICATION/TREATMENT
  if (text.includes('treat') || text.includes('steroid') || text.includes('therapy') ||
      text.includes('medication') || text.includes('drug') || text.includes('beta-lactam') ||
      text.includes('aminoglycoside') || text.includes('antibiotic') ||
      text.includes('inhibitor') || text.includes('finasteride') || text.includes('dutasteride')) {
    return { iconName: 'pill', iconColor: '#6366f1' };
  }

  // POSITIVE OUTCOMES
  if (text.includes('excellent') || text.includes('good prognosis') ||
      text.includes('recovers') || text.includes('responds') ||
      text.includes('prevent') || text.includes('better')) {
    return { iconName: 'check', iconColor: '#22c55e' };
  }

  // NEGATIVE/DANGEROUS
  if (text.includes('death') || text.includes('fatal') || text.includes('severe') ||
      text.includes('contraindicated') || text.includes('avoid') || text.includes('necrosis') ||
      text.includes('dysfunction') || text.includes('limp')) {
    return { iconName: 'warning', iconColor: '#ef4444' };
  }

  // STOP/DON'T
  if (text.includes('stop') || text.includes('discontinue') || text.includes('never')) {
    return { iconName: 'stop', iconColor: '#ef4444' };
  }

  // PATHOGENS/DISEASE
  if (text.includes('bacteria') || text.includes('virus') || text.includes('infection') ||
      text.includes('pathogen') || text.includes('pseudomonas') || text.includes('septicemia')) {
    return { iconName: 'virus', iconColor: '#9333ea' };
  }

  // MECHANISM/BIOLOGY
  if (text.includes('mechanism') || text.includes('causes') || text.includes('pathway') ||
      text.includes('receptor') || text.includes('binds') || text.includes('invasion') ||
      text.includes('vessel') || text.includes('tissue') || text.includes('blocks') ||
      text.includes('stops') || text.includes('conversion') || text.includes('enzyme')) {
    return { iconName: 'microscope', iconColor: '#9333ea' };
  }

  // DATA/NUMBERS (elevated/high)
  if (text.includes('elevated') || text.includes('increased') || text.includes('high') ||
      text.includes('shrink') || text.includes('20-30%') || /\d+/.test(text)) {
    return { iconName: 'chart', iconColor: '#ef4444' };
  }

  // DATA/NUMBERS (reduction/decrease - positive)
  if (text.includes('reduces') || text.includes('decrease') || text.includes('drops')) {
    return { iconName: 'chart', iconColor: '#10b981' };
  }

  // DATA/NUMBERS (normal/common)
  if (text.includes('most common') || text.includes('typical') || text.includes('normal') ||
      text.includes('pathognomonic') || text.includes('signature')) {
    return { iconName: 'chart', iconColor: '#10b981' };
  }

  // ACTION/RAPID EFFECT
  if (text.includes('rapid') || text.includes('sudden') || text.includes('disrupts') ||
      text.includes('destroys') || text.includes('kills') || text.includes('eating')) {
    return { iconName: 'bolt', iconColor: '#fbbf24' };
  }

  // KEY PEARL/INSIGHT
  if (text.includes('remember') || text.includes('key') || text.includes('pearl') ||
      text.includes('important') || text.includes('pathognomonic') ||
      text.includes('contrast') || text.includes('vs') || text.includes('difference')) {
    return { iconName: 'lightbulb', iconColor: '#FFD700' };
  }

  // ALERT/CAUTION (default for symptoms)
  if (text.includes('edema') || text.includes('symptom') || text.includes('sign') ||
      text.includes('lesion') || text.includes('necrotic')) {
    return { iconName: 'alert', iconColor: '#fbbf24' };
  }

  // DEFAULT: lightbulb (general teaching point)
  return { iconName: 'lightbulb', iconColor: '#FFD700' };
}

// ===== ASSIGN ICONS TO TEACHING BULLETS =====
timestampsDetected.teachingPhases.forEach((phase, phaseIdx) => {
  if (phase.layout !== 'pearl-card') {
    console.log(`Phase ${phaseIdx + 1}: "${phase.titleText}"`);
    phase.elements.forEach((bullet, bulletIdx) => {
      const icon = selectIcon(bullet.text);
      bullet.iconName = icon.iconName;
      bullet.iconColor = icon.iconColor;
      console.log(`  [${bulletIdx + 1}] ${icon.iconName.padEnd(12)} (${icon.iconColor}) - "${bullet.text}"`);
    });
    console.log();
  } else {
    console.log(`Phase ${phaseIdx + 1}: "${phase.titleText}" (pearl-card, no icons)\n`);
  }
});

// ===== SAVE OUTPUT =====
const outputPath = path.join(__dirname, `timestamps-with-icons-${topic}.json`);
fs.writeFileSync(outputPath, JSON.stringify(timestampsDetected, null, 2));

console.log(`💾 Saved with icons: ${outputPath}`);
console.log('\n✅ AGENT 4 COMPLETE - Icons assigned to all teaching bullets');
