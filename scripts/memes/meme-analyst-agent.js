#!/usr/bin/env node
/**
 * MEME ANALYST AGENT
 *
 * Takes a medical education script and analyzes each section to find
 * the PERFECT meme matches. Outputs a config for the meme validator.
 *
 * Usage:
 *   node meme-analyst-agent.js --script path/to/script.json --output configs/output.json
 *   node meme-analyst-agent.js --script path/to/script.json --topic "hyperkalemia"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================
// MEME ANALYST SYSTEM PROMPT
// ============================================
const MEME_ANALYST_SYSTEM_PROMPT = `You are the MEME ANALYST AGENT - an expert in viral meme culture, medical education content, and Gen-Z humor. Your job is to analyze medical education scripts and find the PERFECT meme for each moment.

## YOUR EXPERTISE

You have encyclopedic knowledge of:

### MEME FORMATS (2020-2025)
- **Reaction memes**: Mr. Incredible Uncanny/Canny, The Rock eyebrow raise, Pedro Pascal crying/laughing, Homelander stare, Patrick Bateman
- **Death/Doom memes**: Coffin Dance, "It's Joever", "We're so back", Grim Reaper knocking, Windows XP shutdown, Wasted GTA
- **Chaos memes**: Elmo fire, Cat vibing, Maxwell spinning cat, Among Us emergency, Vine boom
- **Brain rot**: Skibidi, "Erm what the sigma", Quandale Dingle, "Nah I'd win", Low taper fade
- **Classic formats**: This Is Fine dog, Surprised Pikachu, Confused Math Lady, Galaxy Brain, Drake format
- **Sigma/Based**: Gigachad, Patrick Bateman, Thomas Shelby, Zyzz, Ryan Gosling "literally me"
- **Roast memes**: Emotional Damage, Clown makeup stages, "Skill issue", L + Ratio
- **Celebration**: Let's Go, Victory Royale, Leonardo DiCaprio pointing, Success Kid

### MEDICAL HUMOR CONTEXT
You understand:
- How medical students/residents think and joke
- The stress of clinical scenarios
- Making complex concepts memorable through humor
- The "oh shit" moments in medicine (codes, bad labs, emergencies)

### MATCHING STRATEGY

For each line/section of a script, you analyze:

1. **LITERAL CONTENT**: What medical concept is being discussed?
2. **METAPHORS USED**: What analogies or visual comparisons are made?
3. **EMOTIONAL BEAT**: Is this panic, revelation, celebration, roast, teaching?
4. **VISUAL POTENTIAL**: What would LOOK funny paired with these words?
5. **TIMING**: Is this a quick hit or a building moment?

## OUTPUT FORMAT

For each section of the script, output:

{
  "sections": [
    {
      "name": "Section name",
      "timestamp": 1.5,
      "narrationText": "The exact line from script",
      "analysis": {
        "medicalConcept": "What's being taught",
        "metaphorUsed": "Any analogy in the text",
        "emotionalBeat": "PANIC|DEATH|CHAOS|SHOCK|CELEBRATION|ROAST|TEACHING|SIGMA",
        "whyThisMeme": "Brief explanation of the match"
      },
      "exactMemes": [
        "Specific meme name 1",
        "Specific meme name 2",
        "Specific meme name 3"
      ],
      "searchQueries": [
        "exact search query for tenor/giphy 1",
        "exact search query 2",
        "exact search query 3",
        "exact search query 4",
        "exact search query 5"
      ],
      "backupSearches": [
        "broader fallback search 1",
        "broader fallback search 2"
      ]
    }
  ]
}

## EXAMPLES OF GOOD MATCHING

**Script line**: "This patient's EKG looks like Mount Everest - peaked T-waves screaming hyperkalemia"
**Analysis**: Mountain metaphor + danger situation + medical emergency
**Exact memes**: ["Chuckles I'm in danger", "Mr Incredible becoming uncanny", "This is fine fire"]
**Search queries**: ["mount everest danger meme", "peaked mountain oh no", "chuckles im in danger ralph", "this is fine dog fire", "mr incredible uncanny"]

**Script line**: "Potassium comes back at 7.2 - the kidney said 'I quit'"
**Analysis**: Critical lab value + organ failure humor + doom
**Search queries**: ["its joever meme", "coffin dance", "i quit resignation meme", "windows xp shutdown", "we're cooked meme"]

**Script line**: "CALCIUM GLUCONATE saves the day - stabilizes that cardiac membrane"
**Analysis**: Treatment success + hero moment + celebration
**Search queries**: ["lets gooo meme", "we're so back", "gigachad saves", "leonardo dicaprio pointing", "the hero we needed"]

**Script line**: "Half of you reached for insulin first - wrong move"
**Analysis**: Common mistake + roast + teaching moment
**Search queries**: ["emotional damage steven he", "clown applying makeup", "skill issue meme", "wrong answer buzzer", "thats not how this works"]

## CRITICAL RULES

1. **BE SPECIFIC**: Don't just say "panic meme" - name the EXACT meme format
2. **MATCH THE WORDS**: If the script says "bodyguard", search for bodyguard memes
3. **MULTIPLE OPTIONS**: Always give 5+ search queries per section
4. **KNOW THE CULTURE**: Use current meme names, not outdated references
5. **VISUAL FIRST**: Think about what will LOOK good on screen with the audio

You are the bridge between medical education and meme culture. Find the perfect match.`;

// ============================================
// ANTHROPIC API CALL
// ============================================
async function callClaude(prompt, systemPrompt = MEME_ANALYST_SYSTEM_PROMPT) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.content[0].text);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ============================================
// SCRIPT PARSER
// ============================================
function parseScript(scriptPath) {
  const content = fs.readFileSync(scriptPath, 'utf8');

  // Try JSON first
  try {
    return JSON.parse(content);
  } catch (e) {
    // Parse as text with timestamps
    // Format: [0:00] Line of narration
    // Or: 1.5s - Line of narration
    const lines = content.split('\n').filter(l => l.trim());
    const sections = [];

    for (const line of lines) {
      // Match [0:00] format
      const bracketMatch = line.match(/\[(\d+):(\d+)\]\s*(.+)/);
      if (bracketMatch) {
        const minutes = parseInt(bracketMatch[1]);
        const seconds = parseInt(bracketMatch[2]);
        const timestamp = minutes * 60 + seconds;
        sections.push({
          timestamp,
          text: bracketMatch[3].trim()
        });
        continue;
      }

      // Match 1.5s format
      const secondsMatch = line.match(/^(\d+\.?\d*)s?\s*[-:]\s*(.+)/);
      if (secondsMatch) {
        sections.push({
          timestamp: parseFloat(secondsMatch[1]),
          text: secondsMatch[2].trim()
        });
        continue;
      }

      // Match "Section Name @ 1.5s: text" format
      const namedMatch = line.match(/^(.+?)\s*@\s*(\d+\.?\d*)s?\s*[-:]?\s*(.+)?/);
      if (namedMatch) {
        sections.push({
          name: namedMatch[1].trim(),
          timestamp: parseFloat(namedMatch[2]),
          text: namedMatch[3]?.trim() || namedMatch[1].trim()
        });
      }
    }

    return { sections };
  }
}

// ============================================
// BUILD PROMPT FOR AGENT
// ============================================
function buildAnalysisPrompt(script, topic) {
  let prompt = `# MEME ANALYSIS REQUEST

## Topic: ${topic || 'Medical Education Video'}

## Script to Analyze:

`;

  if (script.sections) {
    script.sections.forEach((section, idx) => {
      prompt += `### Section ${idx + 1}${section.name ? `: ${section.name}` : ''}
- Timestamp: ${section.timestamp}s
- Narration: "${section.text || section.context || section.narration}"
${section.notes ? `- Notes: ${section.notes}` : ''}

`;
    });
  } else if (script.narration) {
    // Full narration text
    prompt += `### Full Narration:
${script.narration}

Please break this into logical sections (hook, main points, conclusion) and analyze each.
`;
  }

  prompt += `
## Your Task:

Analyze each section and find the PERFECT memes. Consider:
1. What's literally being said (medical terms, metaphors)
2. The emotional beat of each moment
3. What visual meme would ENHANCE the words
4. Specific, searchable meme names

Output valid JSON with your analysis.`;

  return prompt;
}

// ============================================
// PROCESS RESPONSE
// ============================================
function processAgentResponse(response, originalScript, topic) {
  // Extract JSON from response
  let jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in agent response');
  }

  let analysis;
  try {
    analysis = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // Try to fix common JSON issues
    let fixed = jsonMatch[0]
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/'/g, '"');
    analysis = JSON.parse(fixed);
  }

  // Convert to validator config format
  const config = {
    videoName: topic || 'Medical Ad',
    generatedAt: new Date().toISOString(),
    agentVersion: '1.0',
    searches: []
  };

  for (const section of analysis.sections) {
    config.searches.push({
      name: section.name || `Section @ ${section.timestamp}s`,
      timestamp: section.timestamp,
      context: section.narrationText || section.text,
      emotion: section.analysis?.emotionalBeat || 'CHAOS',
      suggestedMemes: section.exactMemes || [],
      searchQueries: section.searchQueries || [],
      backupSearches: section.backupSearches || [],
      analysis: section.analysis
    });
  }

  return config;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧠 MEME ANALYST AGENT                                       ║
║  Script → Perfect Meme Matches                               ║
╚══════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);

  // Parse arguments
  let scriptPath = null;
  let outputPath = null;
  let topic = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--script' && args[i + 1]) {
      scriptPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    }
  }

  if (!scriptPath) {
    console.log(`
Usage:
  node meme-analyst-agent.js --script <path> [--output <path>] [--topic <name>]

Arguments:
  --script   Path to script file (JSON or text format)
  --output   Output config path (default: configs/<topic>-memes.json)
  --topic    Topic name (e.g., "hyperkalemia", "opioid-overdose")

Script Formats Supported:

  JSON:
  {
    "sections": [
      { "timestamp": 1.5, "text": "Narration line here" }
    ]
  }

  Text with timestamps:
  [0:01] First line of narration
  [0:05] Second line

  Or:
  1.5s - First line
  5.0s - Second line

Example:
  node meme-analyst-agent.js --script scripts/hyperkalemia.json --topic hyperkalemia
`);
    process.exit(1);
  }

  // Check API key
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable not set');
    console.log('\nSet it with: export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }

  // Load script
  console.log(`📂 Loading script: ${scriptPath}`);
  const script = parseScript(path.resolve(scriptPath));

  const sectionCount = script.sections?.length || 'unknown';
  console.log(`📝 Found ${sectionCount} sections to analyze`);

  // Build prompt
  const prompt = buildAnalysisPrompt(script, topic);

  // Call the agent
  console.log('\n🤖 Sending to Meme Analyst Agent...');
  console.log('   (This may take 30-60 seconds)\n');

  try {
    const response = await callClaude(prompt);

    console.log('✅ Agent response received\n');

    // Process response
    const config = processAgentResponse(response, script, topic);

    // Determine output path
    if (!outputPath) {
      const safeTopic = (topic || 'output').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      outputPath = `configs/${safeTopic}-memes.json`;
    }

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write config
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ ANALYSIS COMPLETE                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Sections analyzed: ${config.searches.length.toString().padEnd(39)}║
║  Output: ${outputPath.substring(0, 50).padEnd(50)}║
╚══════════════════════════════════════════════════════════════╝

Next step:
  node meme-validator-v4.js --config ${outputPath}
`);

    // Show preview of analysis
    console.log('📊 Analysis Preview:\n');
    config.searches.slice(0, 3).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} @ ${s.timestamp}s`);
      console.log(`     Emotion: ${s.emotion}`);
      console.log(`     Memes: ${s.suggestedMemes.slice(0, 3).join(', ')}`);
      console.log(`     Searches: ${s.searchQueries.slice(0, 3).join(', ')}`);
      console.log('');
    });

    if (config.searches.length > 3) {
      console.log(`  ... and ${config.searches.length - 3} more sections\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
