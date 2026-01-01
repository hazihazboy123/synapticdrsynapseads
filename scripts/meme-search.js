#!/usr/bin/env node
/**
 * Meme & Image Search Script
 *
 * Searches multiple APIs to find the perfect meme or image for each context.
 * Prioritizes RECOGNIZABLE memes over random GIFs.
 *
 * APIs Used:
 * - Imgflip: Classic meme templates (most recognizable)
 * - Tenor: Animated GIFs
 * - Giphy: Animated GIFs (backup)
 * - Pexels: Stock photos (when memes don't fit)
 *
 * Usage:
 *   node scripts/meme-search.js --interactive
 *   node scripts/meme-search.js --context "patient dying" --emotion panic
 *   node scripts/meme-search.js --batch config.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================
// API KEYS (replace with your own or use env vars)
// ============================================
const TENOR_API_KEY = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // Public beta key
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''; // Get from pexels.com/api
const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME || '';
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD || '';

// ============================================
// CURATED RECOGNIZABLE MEMES (Imgflip IDs)
// These are the classics everyone knows
// ============================================
const RECOGNIZABLE_MEMES = {
  // === PANIC / ANXIETY ===
  'panic': [
    { id: '89655', name: 'Jordan Peele Sweating', keywords: ['sweating', 'nervous', 'panic', 'anxiety', 'stress'] },
    { id: '119139145', name: 'Blank Nut Button', keywords: ['smash', 'urgent', 'panic', 'stress'] },
    { id: '247375501', name: 'Buff Doge vs Cheems', keywords: ['comparison', 'weak', 'strong'] },
    { id: '97984', name: 'Disaster Girl', keywords: ['chaos', 'destruction', 'evil', 'fire'] },
    { id: '180190441', name: 'Panik Kalm Panik', keywords: ['panic', 'calm', 'anxiety', 'stages'] },
  ],

  // === IRONY / DENIAL ===
  'irony': [
    { id: '55311130', name: 'This Is Fine', keywords: ['fire', 'denial', 'calm', 'disaster', 'fine'] },
    { id: '61520', name: 'Futurama Fry', keywords: ['suspicious', 'not sure', 'skeptical'] },
    { id: '1509839', name: 'First Day On The Internet Kid', keywords: ['naive', 'innocent', 'newbie'] },
  ],

  // === DEATH / DANGER ===
  'death': [
    { id: '259237855', name: 'Coffin Dance', keywords: ['death', 'funeral', 'rip', 'gone'] },
    { id: '4087833', name: 'Waiting Skeleton', keywords: ['waiting', 'death', 'forever', 'long'] },
    { id: '21735', name: 'The Scroll Of Truth', keywords: ['truth', 'denial', 'reject'] },
  ],

  // === REALIZATION / AHA ===
  'realization': [
    { id: '91538330', name: 'Leonardo DiCaprio Pointing', keywords: ['pointing', 'recognize', 'aha', 'thats it'] },
    { id: '61532', name: 'The Most Interesting Man', keywords: ['interesting', 'wise', 'dont always'] },
    { id: '101470', name: 'Ancient Aliens', keywords: ['aliens', 'explanation', 'conspiracy'] },
  ],

  // === CONFUSION ===
  'confusion': [
    { id: '101288', name: 'Confused Math Lady', keywords: ['confused', 'math', 'thinking', 'calculating'] },
    { id: '252600902', name: 'Always Has Been', keywords: ['astronaut', 'realization', 'always'] },
    { id: '93895088', name: 'Expanding Brain', keywords: ['levels', 'smart', 'galaxy brain'] },
  ],

  // === CELEBRATION / SUCCESS ===
  'celebration': [
    { id: '91545132', name: 'Success Kid', keywords: ['success', 'win', 'yes', 'victory'] },
    { id: '188390779', name: 'Woman Yelling At Cat', keywords: ['argument', 'cat', 'salad'] },
    { id: '27813981', name: 'Hide the Pain Harold', keywords: ['pain', 'smile', 'fake happy'] },
  ],

  // === SADNESS ===
  'sadness': [
    { id: '259237855', name: 'Crying Cat Thumbs Up', keywords: ['sad', 'crying', 'thumbs up', 'ok'] },
    { id: '226297822', name: 'Sad Pablo Escobar', keywords: ['sad', 'alone', 'waiting', 'lonely'] },
    { id: '135256802', name: 'Epic Handshake', keywords: ['agree', 'same', 'both', 'unity'] },
  ],

  // === COMPARISON ===
  'comparison': [
    { id: '181913649', name: 'Drake Hotline Bling', keywords: ['no', 'yes', 'prefer', 'reject', 'approve'] },
    { id: '112126428', name: 'Distracted Boyfriend', keywords: ['distracted', 'girlfriend', 'looking'] },
    { id: '87743020', name: 'Two Buttons', keywords: ['choice', 'decision', 'buttons', 'hard'] },
  ],

  // === TEACHING / EXPLANATION ===
  'teaching': [
    { id: '129242436', name: 'Change My Mind', keywords: ['debate', 'opinion', 'change mind', 'prove'] },
    { id: '61579', name: 'One Does Not Simply', keywords: ['simply', 'walk', 'mordor', 'not easy'] },
    { id: '438680', name: 'Batman Slapping Robin', keywords: ['slap', 'shut up', 'wrong', 'correct'] },
  ],

  // === DANGER / WARNING ===
  'danger': [
    { id: '217743513', name: 'Uno Draw 25 Cards', keywords: ['uno', 'rather', 'draw', 'refuse'] },
    { id: '124822590', name: 'Left Exit 12 Off Ramp', keywords: ['exit', 'choice', 'swerve', 'wrong way'] },
    { id: '100777631', name: 'Is This A Pigeon', keywords: ['wrong', 'mistake', 'butterfly', 'confused'] },
  ],

  // === CHAOS ===
  'chaos': [
    { id: '131087935', name: 'Running Away Balloon', keywords: ['running', 'chase', 'escape', 'problems'] },
    { id: '196652226', name: 'Spongebob Ight Imma Head Out', keywords: ['leave', 'done', 'bye', 'exit'] },
    { id: '222403160', name: 'Bernie Sanders Once Again Asking', keywords: ['asking', 'financial', 'support'] },
  ],
};

// Flatten for easy lookup
const ALL_MEMES = Object.values(RECOGNIZABLE_MEMES).flat();

// ============================================
// EMOTION -> MEME MAPPING
// ============================================
const EMOTION_CATEGORIES = {
  'PANIC': ['panic', 'danger'],
  'DEATH': ['death', 'danger'],
  'IRONY': ['irony', 'comparison'],
  'DARK_HUMOR': ['irony', 'chaos', 'death'],
  'CELEBRATION': ['celebration', 'realization'],
  'ROAST': ['comparison', 'teaching'],
  'TEACHING': ['teaching', 'realization'],
  'CHAOS': ['chaos', 'panic'],
  'CONFUSION': ['confusion', 'realization'],
  'SADNESS': ['sadness', 'irony'],
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    const request = (downloadUrl) => {
      protocol.get(downloadUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return request(res.headers.location);
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

// ============================================
// API SEARCH FUNCTIONS
// ============================================

/**
 * Search Imgflip for popular meme templates
 */
async function searchImgflip() {
  try {
    const { data } = await httpGet('https://api.imgflip.com/get_memes');
    if (data.success && data.data?.memes) {
      return data.data.memes.map(m => ({
        source: 'imgflip',
        id: m.id,
        name: m.name,
        url: m.url,
        width: m.width,
        height: m.height,
        type: 'template', // Static template, needs text
      }));
    }
    return [];
  } catch (e) {
    console.error('Imgflip error:', e.message);
    return [];
  }
}

/**
 * Search Tenor for animated GIFs
 */
async function searchTenor(query, limit = 10) {
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif&contentfilter=medium`;
    const { data } = await httpGet(url);

    if (data.results) {
      return data.results.map(r => ({
        source: 'tenor',
        id: r.id,
        name: r.content_description || query,
        url: r.media_formats?.gif?.url || r.media_formats?.tinygif?.url,
        preview: r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url,
        width: r.media_formats?.gif?.dims?.[0],
        height: r.media_formats?.gif?.dims?.[1],
        type: 'gif',
        tags: r.tags || [],
      }));
    }
    return [];
  } catch (e) {
    console.error('Tenor error:', e.message);
    return [];
  }
}

/**
 * Search Giphy for animated GIFs
 */
async function searchGiphy(query, limit = 10) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`;
    const { data } = await httpGet(url);

    if (data.data) {
      return data.data.map(g => ({
        source: 'giphy',
        id: g.id,
        name: g.title || query,
        url: g.images?.original?.url,
        preview: g.images?.fixed_height_small?.url || g.images?.preview_gif?.url,
        width: parseInt(g.images?.original?.width),
        height: parseInt(g.images?.original?.height),
        type: 'gif',
      }));
    }
    return [];
  } catch (e) {
    console.error('Giphy error:', e.message);
    return [];
  }
}

/**
 * Search Pexels for stock photos
 */
async function searchPexels(query, limit = 10) {
  if (!PEXELS_API_KEY) {
    console.log('  ⚠️  Pexels API key not set. Set PEXELS_API_KEY env var.');
    return [];
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}`;
    const { data } = await httpGet(url, { Authorization: PEXELS_API_KEY });

    if (data.photos) {
      return data.photos.map(p => ({
        source: 'pexels',
        id: p.id,
        name: p.alt || query,
        url: p.src?.large || p.src?.original,
        preview: p.src?.small || p.src?.tiny,
        width: p.width,
        height: p.height,
        type: 'photo',
        photographer: p.photographer,
      }));
    }
    return [];
  } catch (e) {
    console.error('Pexels error:', e.message);
    return [];
  }
}

// ============================================
// INTELLIGENT MEME MATCHING
// ============================================

/**
 * Find the best matching recognizable meme for a context
 */
function findRecognizableMeme(context, emotion) {
  const contextLower = context.toLowerCase();
  const categories = EMOTION_CATEGORIES[emotion] || Object.keys(RECOGNIZABLE_MEMES);

  let bestMatches = [];

  for (const category of categories) {
    const memes = RECOGNIZABLE_MEMES[category] || [];
    for (const meme of memes) {
      const score = meme.keywords.reduce((acc, kw) => {
        return acc + (contextLower.includes(kw) ? 2 : 0);
      }, 0);

      if (score > 0) {
        bestMatches.push({ ...meme, score, category });
      }
    }
  }

  // Sort by score descending
  bestMatches.sort((a, b) => b.score - a.score);

  // If no keyword matches, return top memes from the emotion categories
  if (bestMatches.length === 0) {
    for (const category of categories) {
      const memes = RECOGNIZABLE_MEMES[category] || [];
      bestMatches.push(...memes.map(m => ({ ...m, score: 1, category })));
    }
  }

  return bestMatches.slice(0, 5);
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a search result
 */
function validateResult(result) {
  const issues = [];
  const warnings = [];

  // Check URL
  if (!result.url) {
    issues.push('Missing URL');
  }

  // Check dimensions
  if (result.width && result.height) {
    const aspectRatio = result.width / result.height;
    if (aspectRatio > 3 || aspectRatio < 0.3) {
      warnings.push(`Unusual aspect ratio: ${aspectRatio.toFixed(2)}`);
    }
    if (result.width < 200 || result.height < 200) {
      warnings.push('Low resolution');
    }
  }

  // Check file size (if available)
  if (result.size && result.size > 10 * 1024 * 1024) {
    warnings.push('Large file size (>10MB)');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    score: 100 - (issues.length * 50) - (warnings.length * 10),
  };
}

// ============================================
// SEARCH ORCHESTRATION
// ============================================

/**
 * Search all sources for the best meme/image
 */
async function searchAll(query, options = {}) {
  const { emotion, preferMeme = true, limit = 5 } = options;

  console.log(`\n🔍 Searching for: "${query}" (emotion: ${emotion || 'any'})`);
  console.log('─'.repeat(50));

  const results = {
    recognizable: [],
    tenor: [],
    giphy: [],
    pexels: [],
  };

  // 1. First, check our curated recognizable memes
  if (preferMeme) {
    console.log('  📚 Checking curated meme library...');
    results.recognizable = findRecognizableMeme(query, emotion);
    if (results.recognizable.length > 0) {
      console.log(`     Found ${results.recognizable.length} recognizable meme(s)`);
    }
  }

  // 2. Search Tenor for GIFs
  console.log('  🎬 Searching Tenor...');
  results.tenor = await searchTenor(query, limit);
  console.log(`     Found ${results.tenor.length} GIF(s)`);

  // 3. Search Giphy as backup
  console.log('  🎬 Searching Giphy...');
  results.giphy = await searchGiphy(query, limit);
  console.log(`     Found ${results.giphy.length} GIF(s)`);

  // 4. Search Pexels for stock photos
  if (!preferMeme || options.includePhotos) {
    console.log('  📷 Searching Pexels...');
    results.pexels = await searchPexels(query, limit);
    console.log(`     Found ${results.pexels.length} photo(s)`);
  }

  return results;
}

// ============================================
// INTERACTIVE CLI
// ============================================

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function displayResults(results, category) {
  const items = results[category] || [];
  if (items.length === 0) {
    console.log(`  No ${category} results found.`);
    return;
  }

  console.log(`\n  ${category.toUpperCase()} RESULTS:`);
  items.forEach((item, idx) => {
    const validation = validateResult(item);
    const statusIcon = validation.valid ? '✅' : '⚠️';
    console.log(`    ${idx + 1}. ${statusIcon} ${item.name}`);
    console.log(`       Source: ${item.source} | Type: ${item.type}`);
    if (item.width && item.height) {
      console.log(`       Size: ${item.width}x${item.height}`);
    }
    if (validation.warnings.length > 0) {
      console.log(`       ⚠️  ${validation.warnings.join(', ')}`);
    }
    if (item.preview) {
      console.log(`       Preview: ${item.preview}`);
    }
  });
}

async function interactiveMode() {
  const rl = createInterface();

  console.log('\n' + '═'.repeat(60));
  console.log('  🎭 MEME & IMAGE SEARCH TOOL');
  console.log('  Find the perfect meme or image for your video');
  console.log('═'.repeat(60));

  while (true) {
    console.log('\n');
    const context = await askQuestion(rl, '📝 Enter context/narration (or "quit"): ');

    if (context.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      break;
    }

    console.log('\nEmotion options: PANIC, DEATH, IRONY, DARK_HUMOR, CELEBRATION, ROAST, TEACHING, CHAOS, CONFUSION, SADNESS');
    const emotion = await askQuestion(rl, '😱 Enter emotion (or press Enter to skip): ');

    const includePhotos = await askQuestion(rl, '📷 Include stock photos? (y/n): ');

    const results = await searchAll(context, {
      emotion: emotion.toUpperCase() || undefined,
      preferMeme: true,
      includePhotos: includePhotos.toLowerCase() === 'y',
      limit: 5,
    });

    // Display results by category
    displayResults(results, 'recognizable');
    displayResults(results, 'tenor');
    displayResults(results, 'giphy');
    if (results.pexels.length > 0) {
      displayResults(results, 'pexels');
    }

    // Ask which to download
    const downloadChoice = await askQuestion(rl, '\n💾 Download? (e.g., "tenor 1" or "giphy 2" or "skip"): ');

    if (downloadChoice.toLowerCase() !== 'skip') {
      const [source, index] = downloadChoice.split(' ');
      const idx = parseInt(index) - 1;
      const sourceResults = results[source];

      if (sourceResults && sourceResults[idx]) {
        const item = sourceResults[idx];
        const filename = await askQuestion(rl, `📁 Filename (default: ${item.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.gif): `);
        const finalFilename = filename || `${item.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.gif`;
        const outputPath = path.join(process.cwd(), 'public/assets/memes', finalFilename);

        console.log(`\n⏬ Downloading to ${outputPath}...`);
        try {
          await downloadFile(item.url, outputPath);
          const stats = fs.statSync(outputPath);
          console.log(`✅ Downloaded! (${(stats.size / 1024).toFixed(1)} KB)`);
        } catch (e) {
          console.log(`❌ Download failed: ${e.message}`);
        }
      } else {
        console.log('❌ Invalid selection');
      }
    }
  }
}

// ============================================
// BATCH MODE
// ============================================

async function batchSearch(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const outputDir = config.outputDir || 'public/assets/memes';

  console.log(`\n🚀 Batch searching ${config.searches.length} items...`);

  for (const search of config.searches) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📍 ${search.name}: "${search.context}"`);

    const results = await searchAll(search.context, {
      emotion: search.emotion,
      preferMeme: search.preferMeme !== false,
      includePhotos: search.includePhotos,
      limit: 3,
    });

    // Auto-select best result
    let bestResult = null;

    // Prefer recognizable memes first
    if (results.recognizable.length > 0 && search.preferMeme !== false) {
      bestResult = results.recognizable[0];
      console.log(`  ✨ Best: ${bestResult.name} (Recognizable meme)`);
    } else if (results.tenor.length > 0) {
      bestResult = results.tenor[0];
      console.log(`  ✨ Best: ${bestResult.name} (Tenor GIF)`);
    } else if (results.giphy.length > 0) {
      bestResult = results.giphy[0];
      console.log(`  ✨ Best: ${bestResult.name} (Giphy GIF)`);
    } else if (results.pexels.length > 0) {
      bestResult = results.pexels[0];
      console.log(`  ✨ Best: ${bestResult.name} (Pexels photo)`);
    }

    // For recognizable memes, we need to get the actual image
    if (bestResult && bestResult.source === 'imgflip' && !bestResult.url) {
      // Search Tenor/Giphy for the meme by name
      console.log(`  🔄 Searching for "${bestResult.name}" GIF...`);
      const gifResults = await searchTenor(`${bestResult.name} meme`, 3);
      if (gifResults.length > 0) {
        bestResult = { ...bestResult, ...gifResults[0] };
      }
    }

    // Output result info
    if (bestResult) {
      const validation = validateResult(bestResult);
      console.log(`  📊 Validation: ${validation.valid ? '✅ PASS' : '⚠️ ISSUES'} (score: ${validation.score})`);

      if (search.download && bestResult.url) {
        const filename = `${search.name}.gif`;
        const outputPath = path.join(process.cwd(), outputDir, filename);

        console.log(`  ⏬ Downloading to ${filename}...`);
        try {
          await downloadFile(bestResult.url, outputPath);
          const stats = fs.statSync(outputPath);
          console.log(`  ✅ Downloaded! (${(stats.size / 1024).toFixed(1)} KB)`);
        } catch (e) {
          console.log(`  ❌ Download failed: ${e.message}`);
        }
      }
    } else {
      console.log('  ❌ No results found');
    }

    // Rate limiting delay
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('✅ Batch search complete!');
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Meme & Image Search Tool

Usage:
  node scripts/meme-search.js --interactive     Interactive mode
  node scripts/meme-search.js --batch <file>    Batch mode with config file
  node scripts/meme-search.js --list-memes      List all recognizable memes

Options:
  --help, -h      Show this help
  --interactive   Interactive search mode
  --batch <file>  Process batch config file
  --list-memes    List curated meme library

Environment Variables:
  TENOR_API_KEY   Tenor API key
  GIPHY_API_KEY   Giphy API key
  PEXELS_API_KEY  Pexels API key (required for stock photos)
    `);
    return;
  }

  if (args.includes('--list-memes')) {
    console.log('\n📚 CURATED RECOGNIZABLE MEMES\n');
    for (const [category, memes] of Object.entries(RECOGNIZABLE_MEMES)) {
      console.log(`\n${category.toUpperCase()}:`);
      for (const meme of memes) {
        console.log(`  • ${meme.name} (ID: ${meme.id})`);
        console.log(`    Keywords: ${meme.keywords.join(', ')}`);
      }
    }
    return;
  }

  if (args.includes('--batch')) {
    const configIndex = args.indexOf('--batch') + 1;
    const configPath = args[configIndex];
    if (!configPath || !fs.existsSync(configPath)) {
      console.error('Error: Please provide a valid config file path');
      process.exit(1);
    }
    await batchSearch(configPath);
    return;
  }

  // Default to interactive mode
  await interactiveMode();
}

main().catch(console.error);
