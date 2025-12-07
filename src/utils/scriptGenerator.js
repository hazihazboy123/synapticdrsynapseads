/**
 * Script Generator for Synaptic Recall Medical Videos
 * Converts practice questions into fast-paced, engaging TikTok scripts
 */

function generateScript(question) {
  const {
    scenario,          // Patient presentation
    findings,          // Key clinical findings
    diagnosis,         // Final diagnosis
    mechanism,         // Underlying mechanism
    keyTakeaway       // Board exam tip
  } = question;

  // Fast-paced, punchy script format
  const script = `${scenario}

${findings.map(f => `${f}?`).join(' ')}

Here's the key: ${mechanism}

${diagnosis}. ${keyTakeaway}`;

  return script;
}

// Example usage
const exampleQuestion = {
  scenario: "African-American woman. Three months of getting more and more breathless",
  findings: [
    "Chest X-ray shows bilateral hilar lymphadenopathy",
    "Labs show sky-high ACE levels and elevated calcium"
  ],
  diagnosis: "Classic sarcoidosis",
  mechanism: "her alveolar macrophages are cranking out 1-alpha hydroxylase. That's converting vitamin D like crazy, jacking up her calcium",
  keyTakeaway: "The lymph nodes, the breathlessness, the labs - it all fits. This is the pattern you need to recognize on your boards"
};

if (require.main === module) {
  console.log('📝 Generated Script:\n');
  console.log(generateScript(exampleQuestion));
}

module.exports = { generateScript };
