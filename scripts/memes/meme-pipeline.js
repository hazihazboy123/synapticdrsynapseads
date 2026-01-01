#!/usr/bin/env node
/**
 * MEME PIPELINE - Full automation
 *
 * Takes a script → Analyzes with AI agent → Searches for memes → Opens preview
 *
 * Usage:
 *   node meme-pipeline.js --script scripts/hyperkalemia-script.json
 *   node meme-pipeline.js --script scripts/my-script.json --topic "Opioid Overdose"
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${command} ${args.join(' ')}\n`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🎬 MEME PIPELINE                                            ║
║  Script → Agent Analysis → Meme Search → Preview             ║
╚══════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);

  // Parse arguments
  let scriptPath = null;
  let topic = null;
  let skipAgent = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--script' && args[i + 1]) {
      scriptPath = args[i + 1];
      i++;
    } else if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    } else if (args[i] === '--skip-agent') {
      skipAgent = true;
    }
  }

  if (!scriptPath) {
    console.log(`
Usage:
  node meme-pipeline.js --script <path> [--topic <name>] [--skip-agent]

Arguments:
  --script      Path to your script file (JSON format)
  --topic       Topic name (used for output file naming)
  --skip-agent  Skip AI analysis, use existing config

Example:
  node meme-pipeline.js --script scripts/hyperkalemia-script.json --topic hyperkalemia

The pipeline will:
  1. Run the Meme Analyst Agent to analyze your script
  2. Generate optimized search queries for each section
  3. Search Tenor, Giphy, and Reddit for memes
  4. Open a preview page to pick your favorites
`);
    process.exit(1);
  }

  // Resolve paths
  const resolvedScript = path.resolve(scriptPath);

  // Try to extract topic from script if not provided
  if (!topic) {
    try {
      const scriptContent = JSON.parse(fs.readFileSync(resolvedScript, 'utf8'));
      topic = scriptContent.topic || path.basename(scriptPath, '.json');
    } catch (e) {
      topic = path.basename(scriptPath, '.json');
    }
  }

  const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const configPath = `configs/${safeTopic}-memes.json`;

  console.log(`📝 Script: ${resolvedScript}`);
  console.log(`📌 Topic: ${topic}`);
  console.log(`📂 Config will be: ${configPath}`);

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY && !skipAgent) {
    console.error(`
❌ Error: ANTHROPIC_API_KEY not set

Set your API key:
  export ANTHROPIC_API_KEY=your-key-here

Or skip the agent (use existing config):
  node meme-pipeline.js --script ${scriptPath} --skip-agent
`);
    process.exit(1);
  }

  try {
    // Step 1: Run Meme Analyst Agent
    if (!skipAgent) {
      console.log('\n' + '═'.repeat(60));
      console.log('  STEP 1: Running Meme Analyst Agent');
      console.log('═'.repeat(60));

      await runCommand('node', [
        'meme-analyst-agent.js',
        '--script', resolvedScript,
        '--topic', topic,
        '--output', configPath
      ]);
    } else {
      console.log('\n⏭️  Skipping agent analysis (--skip-agent flag)');

      if (!fs.existsSync(configPath)) {
        console.error(`❌ Config not found: ${configPath}`);
        console.log('Run without --skip-agent to generate it.');
        process.exit(1);
      }
    }

    // Step 2: Run Meme Validator
    console.log('\n' + '═'.repeat(60));
    console.log('  STEP 2: Searching for Memes');
    console.log('═'.repeat(60));

    await runCommand('node', [
      'meme-validator-v4.js',
      '--config', configPath
    ]);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ PIPELINE COMPLETE                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Preview opened in browser - pick your memes!                ║
║                                                              ║
║  Config saved: ${configPath.padEnd(43)}║
╚══════════════════════════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('\n❌ Pipeline error:', error.message);
    process.exit(1);
  }
}

main();
