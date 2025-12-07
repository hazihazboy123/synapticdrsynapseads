/**
 * AGENT 6: MEME SELECTOR - IMPROVED VERSION
 * Uses the comprehensive meme library to select contextually perfect memes
 */

const fs = require('fs');
const path = require('path');
const { downloadMeme, searchMemes, getMemesByCategory, getMemesByTag } = require('./downloadMeme');

const TOPIC = 'desquamative';
const SCRIPT_TEXT = `Alright FINE. Woman smokes for 25 years. Now she can't breathe. Shocking. CT scan shows her lungs look like frosted glass. Do a biopsy and the alveoli are absolutely PACKED with brown macrophages. Like someone stuffed ash into every air sac.
Back in 1965 some pathologist squints at this under a microscope and goes "Yep those are lung cells shedding off." Named it desquamative interstitial pneumonia. DIP. Desquamative means shedding.
Problem? He was WRONG. Those aren't shed cells. They're macrophages eating cigarette garbage. Been calling it the wrong name for 60 years. Nobody bothered to fix it.
So what's on this biopsy that'll get BETTER if she quits smoking? A through E. Think about it.
...They named a whole disease wrong and just left it that way.
It's A. OF COURSE. Pigmented macrophages filling the alveoli. Because here's the thing. DIP actually REVERSES. Tell her quit smoking, throw some steroids at it, those macrophages clear out. She lives. Pick B? Fibroblastic foci with temporal heterogeneity? That's IPF. Dead in three years. Lung transplant or coffin.
Why? Those macrophages are just janitors cleaning up tar. Stop making the mess, janitors leave. But IPF? That's scar tissue. Fibrosis. Permanent. You don't unscar a lung. So DIP means she walks out. IPF means she doesn't. Boards want you to know who lives and who dies. That's it. Now go.`;

/**
 * SMART MEME SELECTION
 * Analyzes script content and selects the BEST 2 memes from our library of 50
 */

async function selectMemes() {
  try {
    console.log(`🎬 Agent 6: Meme Selector for ${TOPIC}`);
    console.log('🧠 Using smart selection from 50-meme library');
    console.log('----------------------------------------');

    // Load timestamps
    const timestampsPath = path.join(__dirname, `../assets/audio/${TOPIC}-aligned-timestamps.json`);

    if (!fs.existsSync(timestampsPath)) {
      throw new Error(`Timestamps not found: ${timestampsPath}`);
    }

    const timestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf8'));

    // ANALYZE SCRIPT FOR CONTEXT
    const scriptLower = SCRIPT_TEXT.toLowerCase();
    const hasSmoking = scriptLower.includes('smoke') || scriptLower.includes('cigarette');
    const hasDeath = scriptLower.includes('dead') || scriptLower.includes('dies') || scriptLower.includes('coffin');
    const hasPacked = scriptLower.includes('packed');
    const hasAnswerReveal = scriptLower.includes('of course') || scriptLower.includes('it\'s a');

    console.log(`\n📊 Script Analysis:`);
    console.log(`   Smoking-related: ${hasSmoking ? '✅' : '❌'}`);
    console.log(`   Death mentions: ${hasDeath ? '✅' : '❌'}`);
    console.log(`   Shocking moment (PACKED): ${hasPacked ? '✅' : '❌'}`);
    console.log(`   Answer reveal: ${hasAnswerReveal ? '✅' : '❌'}`);

    // SMART SELECTION
    const selectedMemes = [];

    // MEME 1: For "PACKED" - Shocking visual moment
    // Best options: Smoking/fire-related or shocked reactions
    console.log(`\n🎯 Selecting Meme 1 (PACKED moment):`);

    let meme1Options = [];
    if (hasSmoking) {
      // Prioritize smoking/fire related for smoking content
      meme1Options = [
        { id: 'elmo-fire', reason: 'Fire represents smoking damage' },
        { id: 'disaster-girl', reason: 'Fire/disaster from smoking' },
        { id: 'this-is-fine', reason: 'Denial of smoking damage' }
      ];
    } else {
      // Otherwise use shock reactions
      meme1Options = [
        { id: 'shocked-cat', reason: 'Shocked reaction to packed alveoli' },
        { id: 'surprised-pikachu', reason: 'Surprise at filling' },
        { id: 'scared-hamster', reason: 'Panic at packed lungs' }
      ];
    }

    const meme1 = meme1Options[0]; // Use first option
    console.log(`   Selected: ${meme1.id}`);
    console.log(`   Reason: ${meme1.reason}`);

    // MEME 2: For "OF COURSE" / "Dead in three years" - Answer reveal or death
    console.log(`\n🎯 Selecting Meme 2 (Answer/Death moment):`);

    let meme2Options = [];
    if (hasDeath) {
      // Use death memes
      meme2Options = [
        { id: 'coffin-dance', reason: 'Death from IPF' },
        { id: 'spongebob-head-out', reason: 'Organ giving up' },
        { id: 'press-f', reason: 'RIP patient' }
      ];
    } else {
      // Use answer reveal memes
      meme2Options = [
        { id: 'drake-hotline-bling', reason: 'Wrong vs right answer' },
        { id: 'well-yes-but-no', reason: 'Paradoxical answer' },
        { id: 'leonardo-dicaprio-cheers', reason: 'Success at correct answer' }
      ];
    }

    const meme2 = meme2Options[0]; // Use first option
    console.log(`   Selected: ${meme2.id}`);
    console.log(`   Reason: ${meme2.reason}`);

    // BUILD MEME PLACEMENTS
    const memePlacements = [];

    // MEME 1: "PACKED" at ~18s
    const trigger1 = 'PACKED';
    const timestamp1 = findWordTimestamp(trigger1, timestamps);

    if (timestamp1 !== null) {
      console.log(`\n🎭 Meme 1: ${meme1.id}`);
      console.log(`   Trigger: "${trigger1}" at ${timestamp1.toFixed(2)}s`);

      const memePath1 = await downloadMeme(meme1.id);
      console.log(`   File: ${memePath1}`);

      memePlacements.push({
        id: meme1.id,
        placement_trigger: 'word',
        trigger_word: trigger1,
        timestamp: timestamp1,
        duration_frames: 20,  // 0.67 seconds
        position: 'center',  // CENTER positioning
        scale: 0.6,  // BIGGER scale
        animation: 'fade-in-out',
        overlay_text: null,
        reasoning: meme1.reason
      });

      console.log(`   ✅ Placed at ${timestamp1.toFixed(2)}s (CENTER, scale 0.6)`);
    }

    // MEME 2: Find "Dead" or "COURSE"
    let trigger2 = hasDeath ? 'Dead' : 'COURSE';
    let timestamp2 = findWordTimestamp(trigger2, timestamps);

    if (timestamp2 === null && trigger2 === 'Dead') {
      // Try "coffin" instead
      trigger2 = 'coffin';
      timestamp2 = findWordTimestamp(trigger2, timestamps);
    }

    if (timestamp2 !== null) {
      console.log(`\n🎭 Meme 2: ${meme2.id}`);
      console.log(`   Trigger: "${trigger2}" at ${timestamp2.toFixed(2)}s`);

      const memePath2 = await downloadMeme(meme2.id);
      console.log(`   File: ${memePath2}`);

      memePlacements.push({
        id: meme2.id,
        placement_trigger: 'word',
        trigger_word: trigger2,
        timestamp: timestamp2,
        duration_frames: 25,  // 0.83 seconds
        position: 'center',  // CENTER positioning
        scale: 0.65,  // BIGGER scale
        animation: 'fade-in-out',
        overlay_text: null,
        reasoning: meme2.reason
      });

      console.log(`   ✅ Placed at ${timestamp2.toFixed(2)}s (CENTER, scale 0.65)`);
    }

    // Validate placements
    const validation = validatePlacements(memePlacements, timestamps);
    if (!validation.valid) {
      console.warn('\n⚠️  Placement warnings:');
      validation.warnings.forEach(w => console.warn(`   - ${w}`));
    }

    // Write output
    const outputPath = path.join(__dirname, `../assets/memes/${TOPIC}-meme-placements.json`);
    const outputData = {
      topic: TOPIC,
      memes: memePlacements,
      generated_at: new Date().toISOString(),
      validation: validation,
      selection_method: 'smart_context_analysis',
      library_version: '50_meme_collection'
    };

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log('\n✅ Meme placements saved:', outputPath);
    console.log(`📊 Total memes: ${memePlacements.length}`);
    console.log(`🎯 Position: CENTER`);
    console.log(`📏 Scale: 0.6-0.65 (BIGGER!)`);

  } catch (error) {
    console.error('\n❌ Error in meme selection:', error.message);
    process.exit(1);
  }
}

function findWordTimestamp(word, timestamps) {
  // Try exact match first
  let match = timestamps.find(entry =>
    entry.word.toLowerCase() === word.toLowerCase()
  );

  // Try partial match (for punctuation)
  if (!match) {
    match = timestamps.find(entry =>
      entry.word.toLowerCase().includes(word.toLowerCase())
    );
  }

  return match ? match.start : null;
}

function validatePlacements(placements, timestamps) {
  const warnings = [];
  let valid = true;

  if (placements.length > 2) {
    warnings.push('More than 2 memes (may oversaturate)');
    valid = false;
  }

  if (placements.length > 1) {
    const sorted = [...placements].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].timestamp - sorted[i-1].timestamp;
      if (gap < 8) {
        warnings.push(`Memes too close (${gap.toFixed(1)}s apart, min 8s)`);
      }
    }
  }

  const questionZoneMemes = placements.filter(p => p.timestamp < 13);
  if (questionZoneMemes.length > 0) {
    warnings.push('Meme during question display (may distract)');
  }

  if (timestamps.length > 0) {
    const audioDuration = timestamps[timestamps.length - 1].end;
    const outOfBounds = placements.filter(p => p.timestamp > audioDuration);
    if (outOfBounds.length > 0) {
      warnings.push('Meme exceeds audio duration');
      valid = false;
    }
  }

  return { valid, warnings };
}

selectMemes();
