#!/usr/bin/env node
/**
 * SynapticRecall Video Generator v5.0
 * Meme-First Architecture with KLIPY Integration
 *
 * Usage:
 *   node video-generator.js search <topic>     - Search KLIPY for meme beats
 *   node video-generator.js assemble <topic> <selections.json> - Build video from selections
 *
 * Example:
 *   node video-generator.js search "opioid-overdose"
 *   # Select memes in browser, export JSON
 *   node video-generator.js assemble "opioid-overdose" ./opioid-overdose-meme-selections.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// KLIPY CONFIGURATION
// ============================================

const KLIPY_CONFIG = {
  API_KEY: 'VvbrqsfGAxtlPz05Nr1O9zBvZGKbvH6UipWM9yP0LZdQPkLovd7UnpnrKR1hZeXk',
  BASE_URL: 'https://api.klipy.com/api/v1',

  // ⚠️ CALL LIMITS - Be conservative!
  MAX_CALLS_PER_VIDEO: 20,  // Increased for better coverage
  RESULTS_PER_CALL: 25,
};

// Track API calls
let apiCallCount = 0;

function resetCallCount() {
  apiCallCount = 0;
}

function checkCallBudget() {
  if (apiCallCount >= KLIPY_CONFIG.MAX_CALLS_PER_VIDEO) {
    console.warn('  ⚠️ API call budget exhausted!');
    return false;
  }
  return true;
}

// ============================================
// HTTP HELPERS
// ============================================

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout: 30000 }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buffer.toString()) });
          } catch (e) {
            resolve({ status: res.statusCode, data: buffer.toString(), raw: buffer });
          }
        } else {
          resolve({ status: res.statusCode, data: buffer, raw: buffer });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// ============================================
// KLIPY API FUNCTIONS
// ============================================

/**
 * Search KLIPY API - ONE call with smart combined query
 */
async function searchKlipy(contentType, query, limit = 20) {
  if (!checkCallBudget()) {
    return [];
  }

  const url = `${KLIPY_CONFIG.BASE_URL}/${KLIPY_CONFIG.API_KEY}/${contentType}/search?q=${encodeURIComponent(query)}&per_page=${limit}`;

  console.log(`  🔎 [${++apiCallCount}/${KLIPY_CONFIG.MAX_CALLS_PER_VIDEO}] ${contentType}: "${query}"`);

  try {
    const { data } = await httpGet(url);

    // Debug: Log first result structure
    if (data && data.result && data.data && data.data.data && data.data.data.length > 0) {
      console.log(`     ✓ Found ${data.data.data.length} results`);
      // Log sample structure for debugging
      const sample = data.data.data[0];
      if (apiCallCount === 1) {
        console.log(`     📋 Sample result structure:`);
        console.log(`        - files keys: ${sample.files ? Object.keys(sample.files).join(', ') : 'none'}`);
        if (sample.files?.gif) console.log(`        - gif.url: ${sample.files.gif.url?.substring(0, 60)}...`);
        if (sample.files?.mp4) console.log(`        - mp4.url: ${sample.files.mp4.url?.substring(0, 60)}...`);
      }
      return data.data.data;
    }

    // Try alternative response structures
    if (data && Array.isArray(data.data)) {
      console.log(`     ✓ Found ${data.data.length} results (alt format)`);
      return data.data;
    }

    if (data && Array.isArray(data)) {
      console.log(`     ✓ Found ${data.length} results (array format)`);
      return data;
    }

    console.log(`     ⚠️ No results`);
    return [];
  } catch (err) {
    console.error(`     ❌ Error: ${err.message}`);
    return [];
  }
}

/**
 * Search for a single meme beat - ONE API CALL ONLY
 */
async function searchForBeat(beat) {
  // Build smart combined query (max 3 keywords)
  const query = beat.searchQueries.slice(0, 3).join(' ');

  // Try clips first (they have sound!) - ONE CALL ONLY
  let results = await searchKlipy('clips', query, 25);

  // Only fallback to memes if clips returned ZERO and budget allows
  // This keeps us at 1 call per beat in most cases
  if (results.length === 0 && checkCallBudget()) {
    console.log(`     ↪ No clips, trying memes...`);
    results = await searchKlipy('memes', query, 20);
  }

  return results;
}

/**
 * Search all beats with budget management
 */
async function searchKlipyForBeats(beats) {
  const results = {};

  for (const beat of beats) {
    console.log(`\n  Beat ${beat.id}: "${beat.triggerPhrase}"`);

    if (!checkCallBudget()) {
      console.log(`  ⚠️ Skipping - budget exhausted`);
      results[beat.id] = [];
      continue;
    }

    results[beat.id] = await searchForBeat(beat);
  }

  return results;
}

/**
 * Download a meme MP4
 */
async function downloadMeme(url, outputPath) {
  console.log(`  ⬇️ ${path.basename(outputPath)}`);

  try {
    const { raw } = await httpGet(url);
    fs.writeFileSync(outputPath, raw);
    return true;
  } catch (err) {
    console.error(`     ❌ Failed: ${err.message}`);
    return false;
  }
}

// ============================================
// HTML PICKER GENERATOR
// ============================================

function generateHtmlPicker(topic, beats, searchResults) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic} - Meme Picker</title>
  <style>
    :root {
      --bg-dark: #050508;
      --bg-card: #0d0d12;
      --purple: #8b5cf6;
      --pink: #ec4899;
      --green: #10b981;
      --cyan: #06b6d4;
      --text: #e5e5e5;
      --text-muted: #6b7280;
      --border: #1f1f2e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 150px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--purple), var(--pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .api-stats {
      margin-top: 10px;
      padding: 8px 16px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      display: inline-block;
      font-size: 0.85rem;
      color: var(--green);
    }
    .beat-section {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 16px;
      border: 2px solid var(--border);
    }
    .beat-section.selected { border-color: var(--green); }
    .beat-header {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .beat-number {
      font-size: 1.3rem;
      font-weight: 900;
      color: var(--purple);
      min-width: 30px;
    }
    .beat-info h3 { font-size: 0.9rem; margin-bottom: 3px; }
    .beat-meta { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag {
      font-size: 0.7rem;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
    .tag-phase { background: rgba(139, 92, 246, 0.2); color: var(--purple); }
    .tag-category { background: rgba(236, 72, 153, 0.2); color: var(--pink); }
    .tag-mode { background: rgba(6, 182, 212, 0.2); color: var(--cyan); }
    .beat-context {
      display: none;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 5px;
    }
    .result-card {
      background: var(--bg-dark);
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.1s;
      border: 2px solid transparent;
    }
    .result-card:hover {
      border-color: var(--purple);
      opacity: 0.9;
    }
    .result-card.selected {
      border-color: var(--green);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
    }
    .result-preview {
      aspect-ratio: 1/1;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .result-preview img, .result-preview video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .has-sound-badge {
      position: absolute;
      top: 5px;
      right: 5px;
      background: var(--green);
      color: #000;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .result-info { display: none; }
    .result-title { display: none; }
    .result-meta { display: none; }
    .no-results {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-card);
      padding: 15px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--green); color: #000; }
    .btn-secondary { background: var(--purple); color: #fff; margin-right: 10px; }
    .progress { display: flex; gap: 5px; align-items: center; }
    .progress-dot {
      width: 20px;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
    }
    .progress-dot.done { background: var(--green); }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎬 ${topic} - Meme Picker</h1>
    <p style="color: var(--text-muted); margin-top: 10px;">Hover to preview, click to select</p>
    <div class="api-stats">🔑 KLIPY API Calls: ${apiCallCount}/${KLIPY_CONFIG.MAX_CALLS_PER_VIDEO}</div>
  </div>

  <div id="beats-container"></div>

  <div class="bottom-bar">
    <div class="progress" id="progress">
      <span id="progress-text">0/${beats.length} selected</span>
    </div>
    <div>
      <button class="btn btn-secondary" onclick="clearAll()">Clear All</button>
      <button class="btn btn-primary" onclick="exportSelections()">Export Selections</button>
    </div>
  </div>

  <script>
    const beats = ${JSON.stringify(beats, null, 2)};
    const searchResults = ${JSON.stringify(searchResults, null, 2)};
    const selections = {};

    function renderBeats() {
      const container = document.getElementById('beats-container');
      container.innerHTML = beats.map((beat) => {
        const results = searchResults[beat.id] || [];
        return \`
          <div class="beat-section" id="beat-\${beat.id}" data-beat-id="\${beat.id}">
            <div class="beat-header">
              <div class="beat-number">\${beat.id}</div>
              <div class="beat-info">
                <h3>"\${beat.triggerPhrase}"</h3>
                <div class="beat-meta">
                  <span class="tag tag-phase">\${beat.phase}</span>
                  <span class="tag tag-category">\${beat.category}</span>
                  <span class="tag tag-mode">\${beat.displayMode}</span>
                </div>
                <p class="beat-context">\${beat.context}</p>
              </div>
            </div>
            \${results.length > 0 ? \`
              <div class="results-grid">
                \${results.map((result, rIdx) => {
                  // KLIPY uses "file" (singular) with direct URLs
                  // Use blur_preview (base64) first as it works without CORS
                  const previewUrl = result.blur_preview
                    || result.file?.gif
                    || result.file?.webp
                    || result.file?.mp4
                    || '';
                  const gifUrl = result.file?.gif || result.file?.webp || '';
                  const mp4Url = result.file?.mp4 || '';
                  const hasSound = result.type === 'clip';

                  return \`
                    <div class="result-card"
                         data-beat-id="\${beat.id}"
                         data-result-idx="\${rIdx}"
                         data-preview="\${previewUrl}"
                         data-mp4="\${mp4Url}"
                         onclick="selectResult(\${beat.id}, \${rIdx}, this)"
                         onmouseenter="previewVideo(this, '\${mp4Url}')"
                         onmouseleave="stopPreview(this)">
                      <div class="result-preview">
                        \${hasSound ? '<span class="has-sound-badge">🔊 SOUND</span>' : ''}
                        <img src="\${previewUrl}" alt="\${result.title || 'Meme'}" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML+='<div style=\\\\"color:#666;font-size:12px;padding:20px;\\\\">Preview unavailable</div>'" />
                      </div>
                      <div class="result-info">
                        <div class="result-title">\${result.title || 'Untitled'}</div>
                        <div class="result-meta">\${result.duration ? result.duration.toFixed(1) + 's' : 'GIF'}</div>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            \` : \`
              <div class="no-results">
                <p>😔 No results found</p>
              </div>
            \`}
          </div>
        \`;
      }).join('');
    }

    function previewVideo(element, url) {
      if (!url || !url.includes('.mp4')) return;
      const img = element.querySelector('img');
      const existing = element.querySelector('video');
      if (existing) return;

      const video = document.createElement('video');
      video.src = url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      img.style.display = 'none';
      img.parentNode.appendChild(video);
    }

    function stopPreview(element) {
      const video = element.querySelector('video');
      const img = element.querySelector('img');
      if (video) {
        video.remove();
        img.style.display = 'block';
      }
    }

    function selectResult(beatId, resultIdx, element) {
      document.querySelectorAll(\`[data-beat-id="\${beatId}"].result-card\`).forEach(el => {
        el.classList.remove('selected');
      });

      element.classList.add('selected');
      document.getElementById(\`beat-\${beatId}\`).classList.add('selected');

      const beat = beats.find(b => b.id === beatId);
      const result = searchResults[beatId][resultIdx];

      selections[beatId] = {
        beatId: beatId,
        timestamp: beat.timestamp,
        triggerWord: beat.triggerWord,
        displayMode: beat.displayMode,
        durationFrames: beat.durationFrames,
        klipySlug: result.slug || '',
        mp4Url: result.file?.mp4 || '',
        gifUrl: result.file?.gif || '',
        title: result.title || 'Untitled',
        type: result.type || 'clip',
        hasBuiltInSound: result.type === 'clip'
      };

      updateProgress();
    }

    function updateProgress() {
      const count = Object.keys(selections).length;
      document.getElementById('progress-text').textContent = \`\${count}/\${beats.length} selected\`;
    }

    function clearAll() {
      Object.keys(selections).forEach(k => delete selections[k]);
      document.querySelectorAll('.result-card').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.beat-section').forEach(el => el.classList.remove('selected'));
      updateProgress();
    }

    function exportSelections() {
      if (Object.keys(selections).length === 0) {
        alert('Please select at least one meme!');
        return;
      }

      const output = {
        videoName: '${topic}',
        playbackRate: 2.0,
        generatedAt: new Date().toISOString(),
        source: 'KLIPY',
        selections: Object.values(selections).sort((a, b) => a.beatId - b.beatId)
      };

      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${topic}-meme-selections.json';
      a.click();
      URL.revokeObjectURL(url);

      alert(\`✅ Exported \${Object.keys(selections).length} selections!\\n\\nNext step:\\nnode video-generator.js assemble ${topic} ./\${a.download}\`);
    }

    renderBeats();
  </script>
</body>
</html>`;

  const outputPath = path.join(process.cwd(), `${topic}-meme-picker.html`);
  fs.writeFileSync(outputPath, html);
  return outputPath;
}

// ============================================
// MEME BEAT LIBRARY - Generic reaction memes that work for ANY medical topic
// ============================================

const MEME_BEATS_LIBRARY = {
  // HOOK phase - attention grabbers
  SHOCK: ["shocked", "surprised pikachu", "what", "omg", "no way"],
  DRAMATIC: ["dramatic", "intense", "suspense", "tension"],
  DANGER: ["danger", "warning", "alert", "emergency", "uh oh"],

  // VIGNETTE phase - storytelling reactions
  WORRIED: ["worried", "nervous", "scared", "panic", "anxious"],
  SERIOUS: ["serious", "concerned", "thinking", "hmm"],
  BAD_NEWS: ["bad news", "oh no", "disaster", "terrible", "awful"],
  CRINGE: ["cringe", "yikes", "ouch", "painful", "awkward"],

  // QUESTION phase - tension builders
  THINKING: ["thinking", "hmm", "pondering", "confused", "wait"],
  PRESSURE: ["stress", "pressure", "sweating", "nervous", "tense"],
  DRAMATIC_PAUSE: ["dramatic", "suspense", "waiting", "anticipation"],

  // ANSWER phase - reveals
  CELEBRATION: ["celebration", "yes", "winner", "lets go", "victory"],
  CORRECT: ["correct", "right", "smart", "genius", "big brain"],
  WRONG: ["wrong", "fail", "mistake", "bruh", "really"],
  ROAST: ["roast", "burn", "destroyed", "rekt", "savage"],
  FACEPALM: ["facepalm", "disappointed", "smh", "really", "bruh moment"],

  // EXPLANATION phase - teaching moments
  MIND_BLOWN: ["mind blown", "wow", "amazing", "incredible", "whoa"],
  LEARNING: ["interesting", "fascinating", "cool", "neat"],
  ANALOGY: ["exactly", "perfect", "like that", "same energy"],

  // EXIT phase - closers
  BYE: ["bye", "peace", "later", "goodbye", "see ya"],
  MIC_DROP: ["mic drop", "done", "finished", "boom", "drop"],
  COOL: ["cool", "smooth", "chill", "relax", "peace out"]
};

function getExampleBeats(topic) {
  // Generic beats that work for any medical topic
  // Uses popular meme search terms that KLIPY will have results for
  return [
    {
      id: 1,
      phase: "HOOK",
      triggerWord: "ATTENTION",
      triggerPhrase: "Opening hook",
      timestamp: null,
      category: "SHOCK",
      displayMode: "OVERLAY",
      searchQueries: ["shocked", "surprised", "omg"],
      context: "Grab attention at the start",
      durationFrames: 45
    },
    {
      id: 2,
      phase: "VIGNETTE",
      triggerWord: "DANGER",
      triggerPhrase: "Patient in danger",
      timestamp: null,
      category: "WORRIED",
      displayMode: "FULL_CUT",
      searchQueries: ["worried", "nervous", "oh no"],
      context: "Show the severity",
      durationFrames: 40
    },
    {
      id: 3,
      phase: "VIGNETTE",
      triggerWord: "SYMPTOMS",
      triggerPhrase: "Classic symptoms",
      timestamp: null,
      category: "SERIOUS",
      displayMode: "OVERLAY",
      searchQueries: ["look", "stare", "eyes"],
      context: "Key clinical findings",
      durationFrames: 35
    },
    {
      id: 4,
      phase: "VIGNETTE",
      triggerWord: "CRITICAL",
      triggerPhrase: "Critical situation",
      timestamp: null,
      category: "BAD_NEWS",
      displayMode: "FULL_CUT",
      searchQueries: ["disaster", "terrible", "bad"],
      context: "Urgency of the situation",
      durationFrames: 50
    },
    {
      id: 5,
      phase: "QUESTION",
      triggerWord: "THINK",
      triggerPhrase: "What do you do?",
      timestamp: null,
      category: "THINKING",
      displayMode: "OVERLAY",
      searchQueries: ["thinking", "hmm", "confused"],
      context: "Challenge the viewer",
      durationFrames: 40
    },
    {
      id: 6,
      phase: "ANSWER",
      triggerWord: "CORRECT",
      triggerPhrase: "The answer is...",
      timestamp: null,
      category: "CELEBRATION",
      displayMode: "FULL_CUT",
      searchQueries: ["celebration", "winner", "yes"],
      context: "Reveal correct answer",
      durationFrames: 50
    },
    {
      id: 7,
      phase: "ANSWER",
      triggerWord: "WRONG",
      triggerPhrase: "If you picked wrong...",
      timestamp: null,
      category: "FACEPALM",
      displayMode: "OVERLAY",
      searchQueries: ["really", "disappointed", "smh"],
      context: "Roast wrong answers",
      durationFrames: 45
    },
    {
      id: 8,
      phase: "EXPLANATION",
      triggerWord: "MECHANISM",
      triggerPhrase: "Here's why it works",
      timestamp: null,
      category: "MIND_BLOWN",
      displayMode: "OVERLAY",
      searchQueries: ["mind blown", "wow", "amazing"],
      context: "Explain the mechanism",
      durationFrames: 45
    },
    {
      id: 9,
      phase: "EXIT",
      triggerWord: "BYE",
      triggerPhrase: "Now get outta here",
      timestamp: null,
      category: "BYE",
      displayMode: "OVERLAY",
      searchQueries: ["bye", "peace", "later"],
      context: "Classic exit",
      durationFrames: 35
    }
  ];
}

// ============================================
// MAIN COMMANDS
// ============================================

async function searchCommand(topic) {
  console.log(`\n🎬 SynapticRecall Video Generator`);
  console.log(`   Topic: ${topic}`);
  console.log(`   API Budget: ${KLIPY_CONFIG.MAX_CALLS_PER_VIDEO} calls\n`);

  resetCallCount();

  // Get meme beats (in production, this would be generated or loaded)
  const beats = getExampleBeats(topic);
  console.log(`📝 Loaded ${beats.length} meme beats\n`);

  // Search KLIPY for each beat
  console.log(`🔍 Searching KLIPY...`);
  const searchResults = await searchKlipyForBeats(beats);

  // Generate HTML picker
  console.log(`\n🖼️ Generating meme picker...`);
  const htmlPath = generateHtmlPicker(topic, beats, searchResults);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Done! API calls used: ${apiCallCount}/${KLIPY_CONFIG.MAX_CALLS_PER_VIDEO}`);
  console.log(`\n📄 Open in browser: ${htmlPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open the HTML file in your browser`);
  console.log(`  2. Click to select a meme for each beat`);
  console.log(`  3. Click "Export Selections" to download JSON`);
  console.log(`  4. Run: node video-generator.js assemble ${topic} ./${topic}-meme-selections.json`);
  console.log(`${'='.repeat(50)}\n`);

  // Try to open in browser
  const openCmd = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${openCmd} "${htmlPath}"`, (err) => {
    if (err) console.log(`(Couldn't auto-open browser - please open manually)`);
  });
}

async function assembleCommand(topic, selectionsPath) {
  console.log(`\n🔧 Assembling video: ${topic}\n`);

  // Load selections
  if (!fs.existsSync(selectionsPath)) {
    console.error(`❌ File not found: ${selectionsPath}`);
    process.exit(1);
  }

  const selections = JSON.parse(fs.readFileSync(selectionsPath, 'utf8'));
  console.log(`📦 Loaded ${selections.selections.length} meme selections\n`);

  // Create memes directory
  const memeDir = path.join(process.cwd(), 'public', 'assets', 'memes');
  if (!fs.existsSync(memeDir)) {
    fs.mkdirSync(memeDir, { recursive: true });
  }

  // Download each meme
  console.log(`⬇️ Downloading memes from KLIPY...`);
  for (let i = 0; i < selections.selections.length; i++) {
    const sel = selections.selections[i];
    const filename = `${topic}-${String(i + 1).padStart(2, '0')}.mp4`;
    const outputPath = path.join(memeDir, filename);

    if (sel.mp4Url) {
      await downloadMeme(sel.mp4Url, outputPath);
      sel.localPath = `assets/memes/${filename}`;
    }
  }

  // Save updated selections with local paths
  const updatedPath = path.join(process.cwd(), `${topic}-selections-with-paths.json`);
  fs.writeFileSync(updatedPath, JSON.stringify(selections, null, 2));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Done! Memes downloaded to: ${memeDir}`);
  console.log(`📄 Updated selections saved to: ${updatedPath}`);
  console.log(`\nNext: Use these in your Remotion component!`);
  console.log(`${'='.repeat(50)}\n`);
}

// ============================================
// CLI ENTRY POINT
// ============================================

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
SynapticRecall Video Generator v5.0
====================================

Usage:
  node video-generator.js search <topic>
  node video-generator.js assemble <topic> <selections.json>

Examples:
  node video-generator.js search opioid-overdose
  node video-generator.js assemble opioid-overdose ./opioid-overdose-meme-selections.json
`);
  process.exit(0);
}

if (command === 'search') {
  const topic = args[1] || 'test-video';
  searchCommand(topic);
} else if (command === 'assemble') {
  const topic = args[1];
  const selectionsPath = args[2];

  if (!topic || !selectionsPath) {
    console.error('Usage: node video-generator.js assemble <topic> <selections.json>');
    process.exit(1);
  }

  assembleCommand(topic, selectionsPath);
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Use "search" or "assemble"');
  process.exit(1);
}
