#!/usr/bin/env node
/**
 * Meme & Image Validator v2 - Multi-Source Selection System
 *
 * Searches EVERYTHING:
 * - Tenor: Animated meme GIFs
 * - Giphy: More animated GIFs
 * - Wikipedia: Medical images, drug photos, diagrams
 * - Unsplash: High quality stock photos (free, no API key needed)
 *
 * Usage:
 *   node scripts/meme-validator-v2.js --config configs/hyperkalemia-memes.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// API KEYS
// ============================================
const TENOR_API_KEY = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC';

// ============================================
// HTTP HELPERS
// ============================================
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers, timeout: 10000 }, (res) => {
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
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ============================================
// IMAGE SOURCES
// ============================================

/**
 * Search Tenor for animated GIFs
 */
async function searchTenor(query, limit = 8) {
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif&contentfilter=medium`;
    const { data } = await httpGet(url);
    return (data.results || []).map(r => ({
      source: 'tenor',
      category: 'meme',
      id: r.id,
      title: r.content_description || query,
      url: r.media_formats?.gif?.url,
      preview: r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url,
    })).filter(r => r.url);
  } catch (e) {
    return [];
  }
}

/**
 * Search Giphy for animated GIFs
 */
async function searchGiphy(query, limit = 6) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`;
    const { data } = await httpGet(url);
    return (data.data || []).map(g => ({
      source: 'giphy',
      category: 'meme',
      id: g.id,
      title: g.title || query,
      url: g.images?.original?.url,
      preview: g.images?.fixed_height_small?.url,
    })).filter(r => r.url);
  } catch (e) {
    return [];
  }
}

/**
 * Search Wikipedia for images (medical, drugs, concepts)
 */
async function searchWikipedia(query, limit = 4) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`;
    const { data: searchData } = await httpGet(searchUrl);

    const results = [];
    const pages = searchData?.query?.search || [];

    for (const page of pages.slice(0, 3)) {
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page.title)}&prop=pageimages&pithumbsize=500&format=json&origin=*`;
      const { data: imageData } = await httpGet(imageUrl);

      const pageId = Object.keys(imageData?.query?.pages || {})[0];
      const pageInfo = imageData?.query?.pages?.[pageId];

      if (pageInfo?.thumbnail?.source) {
        results.push({
          source: 'wikipedia',
          category: 'medical',
          id: `wiki-${pageId}`,
          title: pageInfo.title,
          url: pageInfo.thumbnail.source.replace(/\/\d+px-/, '/600px-'),
          preview: pageInfo.thumbnail.source,
        });
      }
    }

    return results.slice(0, limit);
  } catch (e) {
    return [];
  }
}

/**
 * Search Unsplash for stock photos (uses their public API)
 */
async function searchUnsplash(query, limit = 4) {
  try {
    // Unsplash Source API - free, no key needed
    const results = [];
    const searchTerms = query.split(' ').slice(0, 3).join(',');

    // Generate multiple image URLs with different seeds
    for (let i = 0; i < limit; i++) {
      results.push({
        source: 'unsplash',
        category: 'stock',
        id: `unsplash-${query}-${i}`,
        title: `${query} (stock photo ${i + 1})`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerms)}&sig=${Date.now() + i}`,
        preview: `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)}&sig=${Date.now() + i}`,
      });
    }

    return results;
  } catch (e) {
    return [];
  }
}

// ============================================
// SMART QUERY EXTRACTION
// ============================================

function extractSearchTerms(context, emotion) {
  const contextLower = context.toLowerCase();

  // Medical terms to search on Wikipedia
  const medicalPatterns = [
    /\b(calcium gluconate|insulin|kayexalate|albuterol|furosemide|digoxin|amiodarone|adenosine)\b/gi,
    /\b(potassium|sodium|magnesium|calcium|glucose|lactate)\b/gi,
    /\b(ekg|ecg|qrs|t-wave|p-wave|arrhythmia|asystole|bradycardia|tachycardia|fibrillation)\b/gi,
    /\b(dialysis|hemodialysis|kidney|renal|cardiac|heart|liver|lung)\b/gi,
    /\b(hyperkalemia|hypokalemia|hypercalcemia|acidosis|alkalosis|sepsis|shock)\b/gi,
    /\b(iv|injection|medication|drug|treatment|therapy)\b/gi,
  ];

  const medicalTerms = [];
  for (const pattern of medicalPatterns) {
    const matches = context.match(pattern);
    if (matches) medicalTerms.push(...matches);
  }

  // Emotion-based meme searches
  const emotionMemeQueries = {
    'PANIC': ['panic sweating meme', 'oh no meme', 'this is fine fire', 'nervous sweating', 'anxiety meme'],
    'DEATH': ['coffin dance', 'rip meme', 'death meme', 'skeleton waiting', 'funeral meme'],
    'IRONY': ['this is fine dog', 'sure jan', 'doubt meme', 'sarcastic meme', 'oh really meme'],
    'DARK_HUMOR': ['dark humor meme', 'cursed meme', 'oof meme', 'bruh moment', 'well that escalated'],
    'CELEBRATION': ['celebration meme', 'yes victory', 'leonardo pointing', 'success kid', 'lets go meme'],
    'ROAST': ['roast meme', 'burn meme', 'shame bell', 'oof size large', 'emotional damage'],
    'TEACHING': ['actually meme', 'well yes but no', 'the more you know', 'big brain', 'galaxy brain'],
    'CHAOS': ['chaos meme', 'everything fine meme', 'mental breakdown', 'confused screaming', 'panic meme'],
    'CONFUSION': ['confused meme', 'math lady', 'visible confusion', 'what meme', 'huh meme'],
    'SADNESS': ['sad meme', 'crying cat', 'disappointed meme', 'sad reaction', 'pain meme'],
  };

  const memeQueries = emotionMemeQueries[emotion] || ['funny meme', 'reaction gif'];

  // Stock photo queries (literal interpretation)
  const stockTerms = context.split(/\s+/).filter(w => w.length > 3).slice(0, 4).join(' ');

  return {
    medical: [...new Set(medicalTerms)],
    meme: memeQueries,
    stock: stockTerms,
    context: context.substring(0, 40),
  };
}

// ============================================
// MAIN SEARCH - ALL SOURCES
// ============================================

async function searchAllSources(item) {
  const { context, emotion, timestamp, name } = item;
  const terms = extractSearchTerms(context, emotion);

  console.log(`\n  🔍 ${name} @ ${timestamp}s`);
  console.log(`     "${context.substring(0, 50)}..."`);

  const allResults = [];

  // 1. MEMES from Tenor & Giphy
  console.log('     🎭 Memes...');
  for (const query of terms.meme.slice(0, 3)) {
    const [tenor, giphy] = await Promise.all([
      searchTenor(query, 4),
      searchGiphy(query, 3),
    ]);
    allResults.push(...tenor, ...giphy);
  }
  // Also search context as meme
  const contextMemes = await searchTenor(terms.context + ' meme', 3);
  allResults.push(...contextMemes);

  // 2. MEDICAL images from Wikipedia
  if (terms.medical.length > 0) {
    console.log(`     💊 Medical: ${terms.medical.slice(0, 3).join(', ')}...`);
    for (const term of terms.medical.slice(0, 3)) {
      const wikiResults = await searchWikipedia(term, 2);
      allResults.push(...wikiResults);
    }
  }

  // 3. STOCK photos from Unsplash
  console.log('     📷 Stock photos...');
  const stockResults = await searchUnsplash(terms.stock, 4);
  allResults.push(...stockResults);

  // 4. Additional Wikipedia for general context
  console.log('     📚 Reference...');
  const refResults = await searchWikipedia(terms.stock, 3);
  allResults.push(...refResults);

  // Dedupe by URL
  const seen = new Set();
  const uniqueResults = allResults.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(`     ✅ ${uniqueResults.length} total options`);

  return uniqueResults;
}

// ============================================
// HTML GENERATOR
// ============================================

function generateHTML(sections, title = 'Meme Validator v2') {
  const sectionsHTML = sections.map((section, sectionIdx) => {
    const sectionNum = sectionIdx + 1;

    // Group by category
    const memes = section.results.filter(r => r.category === 'meme');
    const medical = section.results.filter(r => r.category === 'medical');
    const stock = section.results.filter(r => r.category === 'stock');

    const renderCategory = (items, catName, emoji) => {
      if (items.length === 0) return '';

      const itemsHTML = items.map((item, idx) => {
        const itemNum = idx + 1;
        const fullId = `${sectionNum}-${catName.charAt(0)}${itemNum}`; // e.g., "1-M3" for meme 3 in section 1

        return `
          <div class="result-card" data-section="${sectionNum}" data-cat="${catName}" data-item="${itemNum}" data-url="${item.url}" onclick="selectResult(${sectionNum}, '${catName}', ${itemNum}, this)">
            <div class="result-number">${itemNum}</div>
            <div class="result-preview">
              <img src="${item.preview || item.url}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'error\\'>❌</div>'" />
            </div>
            <div class="result-info">
              <span class="source-badge ${item.source}">${item.source}</span>
              <span class="result-title">${item.title.substring(0, 25)}${item.title.length > 25 ? '...' : ''}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="category">
          <h4>${emoji} ${catName} <span class="cat-code">(${catName.charAt(0).toUpperCase()})</span></h4>
          <div class="results-row">${itemsHTML}</div>
        </div>
      `;
    };

    return `
      <div class="search-section" id="section-${sectionNum}">
        <div class="section-header">
          <div class="section-num">${sectionNum}</div>
          <div class="section-info">
            <h2>${section.name}</h2>
            <span class="timestamp">⏱️ ${section.timestamp}s</span>
            <span class="emotion">${section.emotion}</span>
            <p class="context">"${section.context}"</p>
          </div>
          <div class="selection-box" id="sel-${sectionNum}">
            <span class="sel-label">Selected:</span>
            <span class="sel-value">-</span>
          </div>
        </div>
        ${renderCategory(memes, 'Memes', '🎭')}
        ${renderCategory(medical, 'Medical', '💊')}
        ${renderCategory(stock, 'Stock', '📷')}
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
      background: #0a0a0a;
      color: #fff;
      padding: 20px;
      padding-bottom: 180px;
    }
    h1 { text-align: center; margin-bottom: 5px; background: linear-gradient(90deg, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { text-align: center; color: #666; margin-bottom: 25px; font-size: 0.9rem; }

    .search-section {
      background: #111;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 20px;
      border: 2px solid #222;
    }
    .search-section.done { border-color: #22c55e; }

    .section-header {
      display: flex;
      gap: 15px;
      align-items: flex-start;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .section-num {
      font-size: 2rem;
      font-weight: bold;
      color: #9333ea;
      min-width: 50px;
    }
    .section-info { flex: 1; min-width: 250px; }
    .section-info h2 { font-size: 1.1rem; margin-bottom: 5px; }
    .timestamp, .emotion {
      font-size: 0.8rem;
      padding: 3px 8px;
      border-radius: 12px;
      background: #1a1a1a;
      margin-right: 8px;
    }
    .timestamp { color: #22c55e; }
    .emotion { color: #ec4899; }
    .context {
      margin-top: 8px;
      font-style: italic;
      color: #888;
      font-size: 0.85rem;
      border-left: 3px solid #9333ea;
      padding-left: 10px;
    }

    .selection-box {
      background: #1a1a1a;
      padding: 10px 15px;
      border-radius: 10px;
      min-width: 180px;
      text-align: center;
    }
    .sel-label { display: block; font-size: 0.7rem; color: #666; }
    .sel-value { font-weight: bold; color: #666; }
    .sel-value.active { color: #22c55e; }

    .category { margin-bottom: 12px; }
    .category h4 {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .cat-code { font-size: 0.7rem; color: #555; }

    .results-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 5px 0;
    }

    .result-card {
      flex: 0 0 130px;
      background: #1a1a1a;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.15s;
      border: 2px solid transparent;
      position: relative;
    }
    .result-card:hover { transform: translateY(-2px); border-color: #9333ea; }
    .result-card.selected { border-color: #22c55e; box-shadow: 0 0 15px rgba(34, 197, 94, 0.3); }

    .result-number {
      position: absolute;
      top: 5px;
      left: 5px;
      background: rgba(0,0,0,0.85);
      color: #fff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
      border: 2px solid #9333ea;
      z-index: 5;
    }

    .result-preview {
      height: 85px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .result-preview img { width: 100%; height: 100%; object-fit: cover; }
    .error { color: #666; font-size: 1.5rem; }

    .result-info { padding: 6px; }
    .source-badge {
      font-size: 0.55rem;
      padding: 2px 5px;
      border-radius: 6px;
      font-weight: bold;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 3px;
    }
    .source-badge.tenor { background: #1DA1F2; }
    .source-badge.giphy { background: #00FF99; color: #000; }
    .source-badge.wikipedia { background: #fff; color: #000; }
    .source-badge.unsplash { background: #000; border: 1px solid #fff; }
    .result-title { font-size: 0.7rem; color: #888; display: block; }

    /* Bottom Panel */
    .bottom-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #111;
      border-top: 2px solid #333;
      padding: 15px 20px;
      z-index: 100;
    }
    .panel-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .dict-input {
      flex: 1;
      background: #1a1a1a;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-size: 1rem;
      font-family: monospace;
    }
    .dict-input:focus { outline: none; border-color: #9333ea; }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .btn-apply { background: #9333ea; color: #fff; }
    .btn-export { background: #22c55e; color: #000; }
    .btn-clear { background: #ef4444; color: #fff; }
    .help { font-size: 0.75rem; color: #555; margin-top: 8px; }
    .progress { display: flex; gap: 4px; margin-top: 8px; }
    .prog-dot { width: 20px; height: 5px; background: #333; border-radius: 3px; }
    .prog-dot.done { background: #22c55e; }

    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #22c55e;
      color: #000;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 200;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <h1>🎭 Meme & Image Validator</h1>
  <p class="subtitle">Format: section-category-number (e.g., 1-M-3 = Section 1, Meme #3) | Categories: M=Memes, D=Medical, S=Stock</p>

  ${sectionsHTML}

  <div class="bottom-panel">
    <div class="panel-row">
      <input type="text" class="dict-input" id="input" placeholder="Quick select: 1-M-3, 2-D-1, 3-S-2... (section-category-item)" />
      <button class="btn btn-apply" onclick="applyInput()">Apply</button>
      <button class="btn btn-clear" onclick="clearAll()">Clear</button>
      <button class="btn btn-export" onclick="exportAll()">📦 Export</button>
      <span id="count">0/${sections.length}</span>
    </div>
    <p class="help">M=Memes, D=Medical (💊), S=Stock (📷) | Example: "1-M-5, 2-M-2, 3-D-1" selects Meme#5 for section 1, Meme#2 for section 2, Medical#1 for section 3</p>
    <div class="progress" id="progress">
      ${sections.map((_, i) => `<div class="prog-dot" data-s="${i + 1}"></div>`).join('')}
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const selections = {};
    const total = ${sections.length};
    const data = ${JSON.stringify(sections.map(s => ({ name: s.name, timestamp: s.timestamp, context: s.context, results: s.results })))};

    const catMap = { 'M': 'Memes', 'D': 'Medical', 'S': 'Stock', 'MEMES': 'Memes', 'MEDICAL': 'Medical', 'STOCK': 'Stock' };

    function selectResult(section, cat, item, el) {
      // Deselect others in section
      document.querySelectorAll('#section-' + section + ' .result-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('section-' + section).classList.add('done');

      const url = el.dataset.url;
      const title = el.querySelector('.result-title').textContent;

      selections[section] = { cat, item, url, title, name: data[section-1].name, timestamp: data[section-1].timestamp };

      document.querySelector('#sel-' + section + ' .sel-value').textContent = cat.charAt(0) + '-' + item + ': ' + title.substring(0, 15);
      document.querySelector('#sel-' + section + ' .sel-value').classList.add('active');

      updateProgress();
      toast('Section ' + section + ': ' + cat.charAt(0) + '-' + item);
    }

    function applyInput() {
      const val = document.getElementById('input').value;
      const parts = val.split(',').map(s => s.trim()).filter(s => s);

      for (const part of parts) {
        const match = part.match(/(\\d+)-(\\w)-(\\d+)/i);
        if (match) {
          const [_, sec, catCode, num] = match;
          const section = parseInt(sec);
          const item = parseInt(num);
          const cat = catMap[catCode.toUpperCase()];

          if (cat) {
            const card = document.querySelector('.result-card[data-section="' + section + '"][data-cat="' + cat + '"][data-item="' + item + '"]');
            if (card) selectResult(section, cat, item, card);
          }
        }
      }
      toast('Applied ' + parts.length + ' selections');
    }

    function clearAll() {
      Object.keys(selections).forEach(k => delete selections[k]);
      document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.search-section').forEach(s => s.classList.remove('done'));
      document.querySelectorAll('.sel-value').forEach(el => { el.textContent = '-'; el.classList.remove('active'); });
      updateProgress();
      toast('Cleared');
    }

    function updateProgress() {
      const count = Object.keys(selections).length;
      document.getElementById('count').textContent = count + '/' + total;
      document.querySelectorAll('.prog-dot').forEach(d => {
        d.classList.toggle('done', !!selections[d.dataset.s]);
      });
    }

    function exportAll() {
      const out = Object.entries(selections).sort(([a],[b]) => a-b).map(([sec, d]) => ({
        section: parseInt(sec),
        name: d.name,
        timestamp: d.timestamp,
        category: d.cat,
        item: d.item,
        url: d.url,
        title: d.title
      }));

      const code = out.map(s =>
\`// \${s.section}. \${s.name} (\${s.timestamp}s) - \${s.category}
<StaticMemeOverlay
  src="\${s.url}"
  timestamp={\${s.timestamp}}
  durationInFrames={45}
  scale={0.7}
  playbackRate={PLAYBACK_RATE}
/>\`).join('\\n\\n');

      const blob = new Blob([JSON.stringify({ selections: out, code }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selections-' + Date.now() + '.json';
      a.click();
      toast('Exported ' + out.length + ' selections');
    }

    function toast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 1500);
    }

    document.getElementById('input').addEventListener('keydown', e => { if (e.key === 'Enter') applyInput(); });
  </script>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================

async function processConfig(configPath) {
  console.log('📂 Loading:', configPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const sections = [];
  for (const item of config.searches) {
    const results = await searchAllSources(item);
    sections.push({ ...item, results });
    await new Promise(r => setTimeout(r, 200));
  }

  return sections;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--config')) {
    const idx = args.indexOf('--config');
    const configPath = path.resolve(args[idx + 1]);

    console.log('\n🎭 MEME & IMAGE VALIDATOR v2\n');
    const sections = await processConfig(configPath);

    const html = generateHTML(sections);
    const outputPath = path.join(process.cwd(), 'scripts', 'meme-validator-preview.html');
    fs.writeFileSync(outputPath, html);

    console.log(`\n✅ Generated: ${outputPath}`);

    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} "${outputPath}"`);
  } else {
    console.log(`
Usage:
  node scripts/meme-validator-v2.js --config configs/hyperkalemia-memes.json

Sources searched:
  🎭 Tenor & Giphy - Meme GIFs
  💊 Wikipedia - Medical images, drugs, diagrams
  📷 Unsplash - Stock photos
    `);
  }
}

main().catch(console.error);
