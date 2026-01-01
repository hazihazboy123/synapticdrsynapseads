#!/usr/bin/env node
/**
 * Meme Validator - Visual Preview Tool
 *
 * Generates an HTML page to preview and validate meme choices
 * Opens in browser for easy comparison and selection
 *
 * Usage:
 *   node scripts/meme-validator.js --config configs/hyperkalemia-memes.json
 *   node scripts/meme-validator.js --query "heart flatline dying" --emotion DEATH
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const TENOR_API_KEY = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC';

// ============================================
// CURATED MEME LIBRARY
// ============================================
const MEME_LIBRARY = {
  // Format: { name: string, imgflipId: string, searchTerms: string[], emotions: string[] }
  'Jordan Peele Sweating': { id: '89655', search: 'jordan peele sweating nervous', emotions: ['PANIC', 'ANXIETY'] },
  'This Is Fine': { id: '55311130', search: 'this is fine dog fire', emotions: ['IRONY', 'DENIAL'] },
  'Coffin Dance': { id: '259237855', search: 'coffin dance funeral meme', emotions: ['DEATH', 'DARK_HUMOR'] },
  'Leonardo DiCaprio Pointing': { id: '91538330', search: 'leonardo dicaprio pointing', emotions: ['CELEBRATION', 'REALIZATION'] },
  'Confused Math Lady': { id: '101288', search: 'confused math lady calculating', emotions: ['CONFUSION'] },
  'Drake Hotline Bling': { id: '181913649', search: 'drake hotline bling', emotions: ['COMPARISON'] },
  'Distracted Boyfriend': { id: '112126428', search: 'distracted boyfriend meme', emotions: ['COMPARISON', 'IRONY'] },
  'Expanding Brain': { id: '93895088', search: 'expanding brain galaxy', emotions: ['TEACHING', 'LEVELS'] },
  'Change My Mind': { id: '129242436', search: 'change my mind crowder', emotions: ['TEACHING', 'DEBATE'] },
  'Waiting Skeleton': { id: '4087833', search: 'waiting skeleton', emotions: ['DEATH', 'WAITING'] },
  'Panik Kalm Panik': { id: '180190441', search: 'panik kalm panik meme', emotions: ['PANIC', 'IRONY'] },
  'Disaster Girl': { id: '97984', search: 'disaster girl fire smiling', emotions: ['CHAOS', 'EVIL'] },
  'Sad Pablo Escobar': { id: '226297822', search: 'sad pablo escobar alone', emotions: ['SADNESS', 'LONELY'] },
  'Success Kid': { id: '91545132', search: 'success kid fist', emotions: ['CELEBRATION', 'WIN'] },
  'One Does Not Simply': { id: '61579', search: 'one does not simply walk mordor boromir', emotions: ['TEACHING', 'WARNING'] },
  'Batman Slapping Robin': { id: '438680', search: 'batman slapping robin', emotions: ['ROAST', 'CORRECTION'] },
  'Two Buttons': { id: '87743020', search: 'two buttons choice sweating', emotions: ['PANIC', 'DECISION'] },
  'Hide The Pain Harold': { id: '27813981', search: 'hide the pain harold', emotions: ['SADNESS', 'IRONY'] },
  'Ralph In Danger': { id: '', search: 'ralph wiggum im in danger', emotions: ['PANIC', 'DANGER'] },
  'Cat Vibing': { id: '', search: 'cat vibing drummer', emotions: ['CHAOS', 'MUSIC'] },
  'Crying Cat Thumbs Up': { id: '', search: 'crying cat thumbs up ok', emotions: ['SADNESS', 'IRONY'] },
  'Wide Putin': { id: '', search: 'wide putin walking', emotions: ['DARK_HUMOR'] },
  'Spongebob Imagination': { id: '', search: 'spongebob imagination rainbow', emotions: ['IRONY', 'DREAMING'] },
};

// ============================================
// HTTP HELPERS
// ============================================
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers }, (res) => {
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
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function searchTenor(query, limit = 8) {
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif&contentfilter=medium`;
    const { data } = await httpGet(url);
    return (data.results || []).map(r => ({
      source: 'tenor',
      id: r.id,
      title: r.content_description || query,
      gif: r.media_formats?.gif?.url,
      preview: r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url,
      width: r.media_formats?.gif?.dims?.[0],
      height: r.media_formats?.gif?.dims?.[1],
    }));
  } catch (e) {
    console.error('Tenor error:', e.message);
    return [];
  }
}

async function searchGiphy(query, limit = 8) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`;
    const { data } = await httpGet(url);
    return (data.data || []).map(g => ({
      source: 'giphy',
      id: g.id,
      title: g.title || query,
      gif: g.images?.original?.url,
      preview: g.images?.fixed_height_small?.url || g.images?.preview_gif?.url,
      width: parseInt(g.images?.original?.width),
      height: parseInt(g.images?.original?.height),
    }));
  } catch (e) {
    console.error('Giphy error:', e.message);
    return [];
  }
}

// ============================================
// HTML GENERATOR
// ============================================
function generateHTML(searchResults, title = 'Meme Validator') {
  const cards = searchResults.map((section, sectionIdx) => {
    const resultsHTML = section.results.map((r, idx) => `
      <div class="result-card" onclick="selectResult('${section.name}', ${idx}, this)">
        <div class="result-preview">
          <img src="${r.preview || r.gif}" alt="${r.title}" loading="lazy" />
        </div>
        <div class="result-info">
          <span class="source-badge ${r.source}">${r.source}</span>
          <span class="result-title">${r.title.substring(0, 40)}${r.title.length > 40 ? '...' : ''}</span>
          <span class="result-size">${r.width || '?'}x${r.height || '?'}</span>
        </div>
        <div class="result-actions">
          <button onclick="copyUrl('${r.gif}', event)" class="btn-copy">📋 Copy URL</button>
          <button onclick="downloadGif('${r.gif}', '${section.name}', event)" class="btn-download">⬇️ Download</button>
        </div>
        <input type="hidden" value="${r.gif}" class="gif-url" />
      </div>
    `).join('');

    return `
      <div class="search-section" id="section-${sectionIdx}">
        <div class="section-header">
          <h2>${section.name}</h2>
          <div class="section-meta">
            <span class="timestamp">⏱️ ${section.timestamp}s</span>
            <span class="emotion">🎭 ${section.emotion}</span>
            <span class="context">"${section.context}"</span>
          </div>
        </div>
        <div class="results-grid">
          ${resultsHTML}
        </div>
        <div class="section-selected" id="selected-${section.name}">
          <span>Selected: <strong>None</strong></span>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #fff;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2rem;
      background: linear-gradient(90deg, #9333ea, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .search-section {
      background: #1a1a1a;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
      border: 1px solid #333;
    }
    .section-header {
      margin-bottom: 20px;
    }
    .section-header h2 {
      font-size: 1.3rem;
      margin-bottom: 8px;
    }
    .section-meta {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: #888;
    }
    .section-meta span {
      background: #252525;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .emotion { color: #ec4899; }
    .timestamp { color: #22c55e; }
    .context { color: #60a5fa; font-style: italic; }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
    .result-card {
      background: #252525;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }
    .result-card:hover {
      transform: translateY(-4px);
      border-color: #9333ea;
    }
    .result-card.selected {
      border-color: #22c55e;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
    }
    .result-preview {
      height: 150px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }
    .result-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .result-info {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .source-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 10px;
      width: fit-content;
      font-weight: bold;
      text-transform: uppercase;
    }
    .source-badge.tenor { background: #1DA1F2; }
    .source-badge.giphy { background: #00FF99; color: #000; }
    .source-badge.imgflip { background: #FF6B6B; }
    .result-title {
      font-size: 0.85rem;
      color: #ccc;
    }
    .result-size {
      font-size: 0.75rem;
      color: #666;
    }
    .result-actions {
      padding: 10px;
      display: flex;
      gap: 8px;
    }
    .result-actions button {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .btn-copy {
      background: #374151;
      color: #fff;
    }
    .btn-copy:hover { background: #4b5563; }
    .btn-download {
      background: #9333ea;
      color: #fff;
    }
    .btn-download:hover { background: #7c3aed; }
    .section-selected {
      margin-top: 15px;
      padding: 10px;
      background: #1f1f1f;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .section-selected strong {
      color: #22c55e;
    }
    .export-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a1a1a;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #333;
      z-index: 100;
    }
    .export-panel button {
      background: linear-gradient(90deg, #9333ea, #ec4899);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
    }
    .export-panel button:hover {
      transform: scale(1.05);
    }
    .toast {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #22c55e;
      color: #000;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <h1>🎭 ${title}</h1>
  ${cards}
  <div class="export-panel">
    <button onclick="exportSelections()">📦 Export Selections</button>
  </div>
  <div class="toast" id="toast">Copied!</div>

  <script>
    const selections = {};

    function selectResult(sectionName, idx, element) {
      // Deselect others in this section
      const section = element.closest('.search-section');
      section.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));

      // Select this one
      element.classList.add('selected');

      // Store selection
      const gifUrl = element.querySelector('.gif-url').value;
      const title = element.querySelector('.result-title').textContent;
      selections[sectionName] = { url: gifUrl, title, idx };

      // Update display
      document.getElementById('selected-' + sectionName).innerHTML =
        'Selected: <strong>' + title + '</strong>';
    }

    function copyUrl(url, event) {
      event.stopPropagation();
      navigator.clipboard.writeText(url);
      showToast('URL Copied!');
    }

    function downloadGif(url, name, event) {
      event.stopPropagation();
      const a = document.createElement('a');
      a.href = url;
      a.download = name + '.gif';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading...');
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function exportSelections() {
      const output = Object.entries(selections).map(([name, data]) => ({
        name,
        url: data.url,
        title: data.title
      }));

      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme-selections.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported!');
    }
  </script>
</body>
</html>`;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

async function processConfig(configPath) {
  console.log(`📂 Loading config: ${configPath}`);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const searchResults = [];

  for (const item of config.searches) {
    console.log(`🔍 Searching: ${item.name} - "${item.context}"`);

    // Build search queries
    const queries = [];

    // Use suggested memes if available
    if (item.suggestedMemes) {
      for (const memeName of item.suggestedMemes) {
        const meme = MEME_LIBRARY[memeName];
        if (meme) {
          queries.push(meme.search);
        } else {
          queries.push(memeName + ' meme');
        }
      }
    }

    // Also search by context
    queries.push(item.context);

    // Search all queries
    let allResults = [];
    for (const query of queries.slice(0, 3)) { // Limit to 3 queries
      const [tenorResults, giphyResults] = await Promise.all([
        searchTenor(query, 4),
        searchGiphy(query, 4),
      ]);
      allResults.push(...tenorResults, ...giphyResults);
    }

    // Dedupe by URL
    const seen = new Set();
    const uniqueResults = allResults.filter(r => {
      if (!r.gif || seen.has(r.gif)) return false;
      seen.add(r.gif);
      return true;
    });

    searchResults.push({
      name: item.name,
      timestamp: item.timestamp,
      context: item.context,
      emotion: item.emotion,
      results: uniqueResults.slice(0, 12), // Max 12 results per section
    });

    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  return searchResults;
}

async function singleSearch(query, emotion) {
  console.log(`🔍 Searching: "${query}" (${emotion || 'any'})`);

  const [tenorResults, giphyResults] = await Promise.all([
    searchTenor(query, 10),
    searchGiphy(query, 10),
  ]);

  return [{
    name: 'search-result',
    timestamp: 0,
    context: query,
    emotion: emotion || 'ANY',
    results: [...tenorResults, ...giphyResults],
  }];
}

async function main() {
  const args = process.argv.slice(2);

  let searchResults;
  let title = 'Meme Validator';

  if (args.includes('--config')) {
    const configIdx = args.indexOf('--config') + 1;
    const configPath = path.resolve(args[configIdx]);
    searchResults = await processConfig(configPath);
    title = `Meme Validator - ${path.basename(configPath, '.json')}`;
  } else if (args.includes('--query')) {
    const queryIdx = args.indexOf('--query') + 1;
    const query = args[queryIdx];
    const emotionIdx = args.indexOf('--emotion');
    const emotion = emotionIdx > -1 ? args[emotionIdx + 1] : null;
    searchResults = await singleSearch(query, emotion);
    title = `Meme Search - "${query}"`;
  } else {
    console.log(`
Meme Validator - Visual Preview Tool

Usage:
  node scripts/meme-validator.js --config configs/hyperkalemia-memes.json
  node scripts/meme-validator.js --query "heart flatline dying" --emotion DEATH

Options:
  --config <file>   Process a batch config file
  --query <text>    Single search query
  --emotion <type>  Emotion filter (PANIC, DEATH, IRONY, etc.)
    `);
    return;
  }

  // Generate HTML
  const html = generateHTML(searchResults, title);
  const outputPath = path.join(process.cwd(), 'scripts', 'meme-validator-preview.html');
  fs.writeFileSync(outputPath, html);

  console.log(`\n✅ Preview generated: ${outputPath}`);
  console.log('📂 Opening in browser...');

  // Open in browser
  const cmd = process.platform === 'darwin' ? 'open' :
              process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${outputPath}"`);
}

main().catch(console.error);
