#!/usr/bin/env node
/**
 * Meme & Image Validator v3 - Context-Aware Multi-Source Selection
 *
 * UPGRADES FROM V2:
 * - Smarter context-aware query generation (not just keywords)
 * - More meme sources (KnowYourMeme, Imgflip templates, Reddit trending)
 * - Better "brain rot" content (viral memes, cat videos, chaos content)
 * - Interactive UI with animation picker
 * - Exports ready-to-paste <AnimatedMemeOverlay> components
 *
 * Usage:
 *   npm run meme:v3 -- --config scripts/configs/hyperkalemia-memes.json
 *   node scripts/meme-validator-v3.js --config scripts/configs/hyperkalemia-memes.json
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
// ENTRANCE/EXIT ANIMATIONS (from your AnimatedMemeOverlay)
// ============================================
const ANIMATIONS = {
  entrances: ['slideDown', 'slideUp', 'slideLeft', 'slideRight', 'slam', 'spin', 'bounce', 'zoom', 'fade'],
  exits: ['fall', 'slideOut', 'shrink', 'spin', 'fade', 'zoom']
};

// ============================================
// BRAIN ROT MEME DATABASE - Viral classics
// ============================================
const BRAIN_ROT_MEMES = {
  // Panic/Stress
  PANIC: [
    { name: 'Jordan Peele Sweating', query: 'jordan peele sweating', tags: ['panic', 'nervous', 'stress'] },
    { name: 'Panik Kalm Panik', query: 'panik kalm panik', tags: ['panic', 'stress', 'cycle'] },
    { name: 'Chuckles Im In Danger', query: 'chuckles im in danger ralph', tags: ['danger', 'nervous'] },
    { name: 'This Is Fine Dog', query: 'this is fine dog fire', tags: ['panic', 'denial', 'fire'] },
    { name: 'Sweating Towel Guy', query: 'sweating towel guy', tags: ['nervous', 'stress'] },
    { name: 'Internal Screaming', query: 'internal screaming', tags: ['panic', 'stress', 'hidden'] },
    { name: 'Anxiety Cat', query: 'anxiety cat wide eyes', tags: ['panic', 'cat', 'stress'] },
  ],

  // Death/Danger
  DEATH: [
    { name: 'Coffin Dance', query: 'coffin dance astronomia', tags: ['death', 'funeral', 'dance'] },
    { name: 'Skeleton Waiting', query: 'skeleton waiting', tags: ['death', 'waiting', 'patience'] },
    { name: 'Grim Reaper Knocking', query: 'grim reaper door knock', tags: ['death', 'danger'] },
    { name: 'To Be Continued', query: 'to be continued jojo roundabout', tags: ['cliffhanger', 'danger'] },
    { name: 'Ight Imma Head Out', query: 'ight imma head out spongebob', tags: ['death', 'leaving', 'done'] },
    { name: 'Were All Gonna Die', query: 'were all gonna die doom', tags: ['death', 'panic'] },
  ],

  // Irony/Sarcasm
  IRONY: [
    { name: 'This Is Fine', query: 'this is fine dog fire', tags: ['irony', 'denial', 'fire'] },
    { name: 'Sure Jan', query: 'sure jan brady', tags: ['sarcasm', 'doubt'] },
    { name: 'Press X to Doubt', query: 'press x to doubt', tags: ['doubt', 'sarcasm'] },
    { name: 'Willy Wonka Condescending', query: 'willy wonka condescending', tags: ['sarcasm', 'condescending'] },
    { name: 'Oh Really Owl', query: 'oh really owl', tags: ['sarcasm', 'doubt'] },
    { name: 'SpongeBob Imagination', query: 'spongebob imagination rainbow', tags: ['irony', 'imagination'] },
  ],

  // Chaos/Crazy
  CHAOS: [
    { name: 'Cat Vibing', query: 'cat vibing music ievan polkka', tags: ['chaos', 'cat', 'music'] },
    { name: 'Confused Screaming', query: 'confused screaming', tags: ['chaos', 'panic'] },
    { name: 'Cat Drummer', query: 'cat drumming drums', tags: ['chaos', 'cat', 'music'] },
    { name: 'Everything Is Fine Fire', query: 'elmo fire chaos', tags: ['chaos', 'fire'] },
    { name: 'Spinning Hamster', query: 'hamster spinning wheel', tags: ['chaos', 'spinning'] },
    { name: 'Mario Washing Machine', query: 'mario laundry washing machine', tags: ['chaos', 'spinning'] },
    { name: 'Dog Going Crazy', query: 'dog zoomies crazy running', tags: ['chaos', 'energy'] },
  ],

  // Dark Humor
  DARK_HUMOR: [
    { name: 'Disaster Girl', query: 'disaster girl smiling fire', tags: ['dark', 'fire', 'sinister'] },
    { name: 'Oof Size Large', query: 'oof size large', tags: ['dark', 'damage'] },
    { name: 'Emotional Damage', query: 'emotional damage steven he', tags: ['dark', 'damage'] },
    { name: 'Well That Escalated', query: 'well that escalated quickly', tags: ['dark', 'sudden'] },
    { name: 'Wide Putin', query: 'wide putin walking', tags: ['dark', 'wide', 'menacing'] },
    { name: 'Bruh Moment', query: 'bruh moment sound effect', tags: ['dark', 'reaction'] },
  ],

  // Celebration/Victory
  CELEBRATION: [
    { name: 'Leonardo Pointing', query: 'leonardo dicaprio pointing', tags: ['pointing', 'recognition'] },
    { name: 'Success Kid', query: 'success kid fist', tags: ['victory', 'success'] },
    { name: 'Lets Go', query: 'lets gooo lets go', tags: ['celebration', 'hype'] },
    { name: 'Victory Dance', query: 'victory celebration dance', tags: ['celebration', 'dance'] },
    { name: 'Thats It Yes', query: 'thats it yes perfect', tags: ['correct', 'victory'] },
    { name: 'Air Horn MLG', query: 'air horn mlg celebration', tags: ['celebration', 'hype'] },
  ],

  // Roast/Burn
  ROAST: [
    { name: 'Batman Slapping Robin', query: 'batman slapping robin', tags: ['roast', 'slap'] },
    { name: 'Shame Bell', query: 'shame bell game of thrones', tags: ['roast', 'shame'] },
    { name: 'Oof', query: 'oof roblox', tags: ['roast', 'damage'] },
    { name: 'Apply Cold Water', query: 'apply cold water burn', tags: ['roast', 'burn'] },
    { name: 'Get Rekt', query: 'get rekt mlg', tags: ['roast', 'owned'] },
    { name: 'Flex Tape', query: 'flex tape thats a lot of damage', tags: ['roast', 'damage'] },
  ],

  // Teaching/Explaining
  TEACHING: [
    { name: 'Galaxy Brain', query: 'galaxy brain expanding', tags: ['teaching', 'smart'] },
    { name: 'Change My Mind', query: 'change my mind crowder', tags: ['teaching', 'debate'] },
    { name: 'One Does Not Simply', query: 'one does not simply boromir', tags: ['teaching', 'warning'] },
    { name: 'Actually Nerd', query: 'actually pushing glasses nerd', tags: ['teaching', 'correction'] },
    { name: 'The More You Know', query: 'the more you know nbc', tags: ['teaching', 'learning'] },
    { name: 'Big Brain Time', query: 'big brain time yeah', tags: ['teaching', 'smart'] },
  ],

  // Confusion
  CONFUSION: [
    { name: 'Confused Math Lady', query: 'confused math lady calculating', tags: ['confusion', 'math'] },
    { name: 'Visible Confusion', query: 'visible confusion', tags: ['confusion'] },
    { name: 'Nick Young Question Marks', query: 'nick young question marks confused', tags: ['confusion'] },
    { name: 'What Cat', query: 'what cat confused', tags: ['confusion', 'cat'] },
    { name: 'John Travolta Confused', query: 'john travolta looking around confused pulp fiction', tags: ['confusion', 'lost'] },
  ],

  // Sadness
  SADNESS: [
    { name: 'Crying Cat Thumbs Up', query: 'crying cat thumbs up ok', tags: ['sad', 'cat', 'cope'] },
    { name: 'Sad Pablo Escobar', query: 'sad pablo escobar waiting', tags: ['sad', 'lonely'] },
    { name: 'Crying Jordan', query: 'crying jordan face', tags: ['sad', 'sports'] },
    { name: 'Why Are You Crying', query: 'why are you crying so loud', tags: ['sad', 'dramatic'] },
    { name: 'Sad Cat', query: 'sad cat crying tears', tags: ['sad', 'cat'] },
  ],

  // TikTok Brain Rot Specials
  BRAIN_ROT: [
    { name: 'Cat Meme', query: 'cat meme talking', tags: ['cat', 'viral', 'tiktok'] },
    { name: 'Skibidi', query: 'skibidi toilet', tags: ['brainrot', 'viral'] },
    { name: 'Orange Justice', query: 'orange justice dance fortnite', tags: ['dance', 'viral'] },
    { name: 'Rizz', query: 'rizz face', tags: ['brainrot', 'viral'] },
    { name: 'Griddy', query: 'griddy dance celebration', tags: ['dance', 'celebration'] },
    { name: 'Ambatukam', query: 'ambatukam dreamybull', tags: ['brainrot', 'viral'] },
    { name: 'Goofy Ahh', query: 'goofy ahh sound effect', tags: ['brainrot', 'funny'] },
  ],
};

// ============================================
// CONTEXT-TO-QUERY MAPPING
// ============================================
const CONTEXT_PATTERNS = {
  // Medical concepts -> search queries
  medical: {
    'flatline|asystole|cardiac arrest|heart stop': ['flatline ekg', 'heart monitor beep', 'code blue'],
    'potassium|hyperkalemia|K\\+|electrolyte': ['chemistry science', 'periodic table potassium', 'dangerous chemical'],
    'dialysis|kidney|renal': ['dialysis machine', 'kidney organ', 'hospital dialysis'],
    'ekg|ecg|qrs|t-wave|rhythm': ['heartbeat rhythm', 'ekg monitor', 'heart rhythm'],
    'calcium gluconate|iv push|medication': ['iv drip hospital', 'injection syringe', 'emergency medicine'],
    'insulin|glucose|blood sugar': ['insulin injection', 'diabetes', 'blood sugar'],
    'death|dying|critical|fatal': ['danger warning', 'skull danger', 'emergency red'],
  },

  // Emotional contexts -> meme categories
  emotional: {
    'panic|nervous|anxious|stress|worried': 'PANIC',
    'death|dying|fatal|flatline|rip': 'DEATH',
    'irony|sarcastic|meanwhile|but wait': 'IRONY',
    'chaos|crazy|wild|insane|spinning': 'CHAOS',
    'dark humor|morbid|twisted|oof': 'DARK_HUMOR',
    'celebration|victory|correct|yes|win': 'CELEBRATION',
    'roast|burn|shame|wrong|fail': 'ROAST',
    'teaching|explain|actually|learn': 'TEACHING',
    'confused|what|huh|lost': 'CONFUSION',
    'sad|cry|disappointed|unfortunate': 'SADNESS',
  },

  // Specific phrases -> specific memes
  phrases: {
    'this is fine': 'this is fine dog fire',
    'sweet summer child': 'game of thrones sweet summer child',
    'jazz|improvising': 'jazz hands music crazy',
    'bouncer|security|protect': 'bouncer security guard nightclub',
    'tick tock|time running out|countdown': 'clock countdown timer',
    'washing machine|spin cycle': 'washing machine spinning laundry',
    'bahamas|vacation|paradise|beach': 'spongebob imagination rainbow vacation',
    'cheesecake factory|menu|wide': 'wide putin cheesecake factory',
    'harlem shake': 'harlem shake viral dance',
    'cruise|boat|ship': 'cruise ship vacation titanic',
  }
};

// ============================================
// HTTP HELPERS
// ============================================
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers, timeout: 15000 }, (res) => {
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

async function searchTenor(query, limit = 10) {
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
      query: query,
    })).filter(r => r.url);
  } catch (e) {
    return [];
  }
}

async function searchGiphy(query, limit = 8) {
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
      query: query,
    })).filter(r => r.url);
  } catch (e) {
    return [];
  }
}

async function searchWikipedia(query, limit = 3) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`;
    const { data: searchData } = await httpGet(searchUrl);

    const results = [];
    const pages = searchData?.query?.search || [];

    for (const page of pages.slice(0, 3)) {
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page.title)}&prop=pageimages&pithumbsize=600&format=json&origin=*`;
      const { data: imageData } = await httpGet(imageUrl);

      const pageId = Object.keys(imageData?.query?.pages || {})[0];
      const pageInfo = imageData?.query?.pages?.[pageId];

      if (pageInfo?.thumbnail?.source) {
        results.push({
          source: 'wikipedia',
          category: 'medical',
          id: `wiki-${pageId}`,
          title: pageInfo.title,
          url: pageInfo.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
          preview: pageInfo.thumbnail.source,
          query: query,
        });
      }
    }

    return results.slice(0, limit);
  } catch (e) {
    return [];
  }
}

// Imgflip popular meme templates
async function searchImgflip(query, limit = 5) {
  try {
    // Get popular meme templates
    const { data } = await httpGet('https://api.imgflip.com/get_memes');
    const memes = data?.data?.memes || [];

    // Filter by query relevance
    const queryLower = query.toLowerCase();
    const relevant = memes.filter(m =>
      m.name.toLowerCase().includes(queryLower) ||
      queryLower.split(' ').some(word => m.name.toLowerCase().includes(word))
    );

    return relevant.slice(0, limit).map(m => ({
      source: 'imgflip',
      category: 'template',
      id: m.id,
      title: m.name,
      url: m.url,
      preview: m.url,
      query: query,
    }));
  } catch (e) {
    return [];
  }
}

// ============================================
// SMART QUERY GENERATOR
// ============================================

function generateSmartQueries(item) {
  const { context, emotion, suggestedMemes = [], name } = item;
  const contextLower = context.toLowerCase();
  const queries = new Set();

  // 1. Use suggested memes directly
  suggestedMemes.forEach(meme => queries.add(meme.toLowerCase()));

  // 2. Emotion-based memes from brain rot database
  if (emotion && BRAIN_ROT_MEMES[emotion]) {
    BRAIN_ROT_MEMES[emotion].forEach(meme => queries.add(meme.query));
  }

  // 3. Add some brain rot specials
  BRAIN_ROT_MEMES.BRAIN_ROT.slice(0, 2).forEach(meme => queries.add(meme.query));

  // 4. Context pattern matching
  for (const [pattern, searchQueries] of Object.entries(CONTEXT_PATTERNS.medical)) {
    if (new RegExp(pattern, 'i').test(contextLower)) {
      searchQueries.forEach(q => queries.add(q));
    }
  }

  // 5. Phrase matching
  for (const [phrase, searchQuery] of Object.entries(CONTEXT_PATTERNS.phrases)) {
    if (new RegExp(phrase, 'i').test(contextLower)) {
      queries.add(searchQuery);
    }
  }

  // 6. Extract key nouns/concepts from context
  const keyWords = context
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['this', 'that', 'with', 'from', 'about', 'what', 'when', 'where', 'while'].includes(w.toLowerCase()));

  // Create contextual meme searches
  if (keyWords.length > 0) {
    queries.add(keyWords.slice(0, 3).join(' ') + ' meme');
    queries.add(keyWords.slice(0, 2).join(' ') + ' reaction gif');
  }

  return [...queries].slice(0, 12); // Limit to 12 unique queries
}

// ============================================
// MAIN SEARCH ORCHESTRATOR
// ============================================

async function searchAllSources(item) {
  const { context, emotion, timestamp, name } = item;
  const queries = generateSmartQueries(item);

  console.log(`\n  🔍 ${name} @ ${timestamp}s [${emotion}]`);
  console.log(`     "${context.substring(0, 60)}${context.length > 60 ? '...' : ''}"`);
  console.log(`     Queries: ${queries.slice(0, 5).join(', ')}...`);

  const allResults = [];

  // Search Tenor & Giphy in parallel for each query
  console.log('     🎭 Searching memes...');
  for (const query of queries.slice(0, 8)) {
    const [tenorResults, giphyResults] = await Promise.all([
      searchTenor(query, 5),
      searchGiphy(query, 4),
    ]);
    allResults.push(...tenorResults, ...giphyResults);
    await new Promise(r => setTimeout(r, 100)); // Rate limiting
  }

  // Search Imgflip templates
  console.log('     📝 Searching templates...');
  for (const query of queries.slice(0, 3)) {
    const imgflipResults = await searchImgflip(query, 3);
    allResults.push(...imgflipResults);
  }

  // Medical images from Wikipedia
  const medicalTerms = context.match(/\b(potassium|calcium|insulin|dialysis|ekg|ecg|kidney|heart|cardiac)\b/gi) || [];
  if (medicalTerms.length > 0) {
    console.log('     💊 Searching medical images...');
    for (const term of [...new Set(medicalTerms)].slice(0, 3)) {
      const wikiResults = await searchWikipedia(term, 2);
      allResults.push(...wikiResults);
    }
  }

  // Dedupe by URL
  const seen = new Set();
  const uniqueResults = allResults.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(`     ✅ Found ${uniqueResults.length} unique options`);

  return uniqueResults;
}

// ============================================
// HTML GENERATOR - BRAIN ROT EDITION
// ============================================

function generateHTML(sections, config = {}) {
  const title = config.videoName || 'Meme Validator v3';

  const sectionsHTML = sections.map((section, sectionIdx) => {
    const sectionNum = sectionIdx + 1;

    // Group by source
    const memes = section.results.filter(r => ['tenor', 'giphy'].includes(r.source));
    const templates = section.results.filter(r => r.source === 'imgflip');
    const medical = section.results.filter(r => r.source === 'wikipedia');

    const renderCategory = (items, catName, emoji, catCode) => {
      if (items.length === 0) return '';

      const itemsHTML = items.map((item, idx) => {
        const itemNum = idx + 1;
        return `
          <div class="result-card"
               data-section="${sectionNum}"
               data-cat="${catCode}"
               data-item="${itemNum}"
               data-url="${item.url}"
               data-title="${item.title.replace(/"/g, '&quot;')}"
               data-source="${item.source}"
               onclick="selectResult(${sectionNum}, '${catCode}', ${itemNum}, this)">
            <div class="result-number">${itemNum}</div>
            <div class="result-preview">
              <img src="${item.preview || item.url}"
                   alt="${item.title}"
                   loading="lazy"
                   onerror="this.parentElement.innerHTML='<div class=\\'error\\'>❌</div>'" />
            </div>
            <div class="result-info">
              <span class="source-badge ${item.source}">${item.source}</span>
              <span class="result-title" title="${item.title}">${item.title.substring(0, 20)}${item.title.length > 20 ? '...' : ''}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="category">
          <h4>${emoji} ${catName} <span class="cat-code">(${catCode})</span> <span class="cat-count">${items.length}</span></h4>
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
            <div class="meta-row">
              <span class="timestamp">⏱️ ${section.timestamp}s</span>
              <span class="emotion emotion-${section.emotion.toLowerCase()}">${section.emotion}</span>
            </div>
            <p class="context">"${section.context}"</p>
          </div>
          <div class="selection-panel" id="panel-${sectionNum}">
            <div class="sel-preview" id="preview-${sectionNum}">
              <div class="empty-preview">Click to select</div>
            </div>
            <div class="sel-controls">
              <select class="anim-select" id="entrance-${sectionNum}" title="Entrance Animation">
                ${ANIMATIONS.entrances.map(a => `<option value="${a}">${a}</option>`).join('')}
              </select>
              <select class="anim-select" id="exit-${sectionNum}" title="Exit Animation">
                ${ANIMATIONS.exits.map(a => `<option value="${a}">${a}</option>`).join('')}
              </select>
              <input type="number" class="duration-input" id="duration-${sectionNum}" value="45" min="20" max="120" title="Duration (frames)" />
            </div>
          </div>
        </div>
        ${renderCategory(memes, 'Memes & GIFs', '🎭', 'M')}
        ${renderCategory(templates, 'Templates', '📝', 'T')}
        ${renderCategory(medical, 'Medical', '💊', 'D')}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Meme Validator v3</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #050508;
      --bg-card: #0d0d12;
      --bg-hover: #15151d;
      --purple: #8b5cf6;
      --pink: #ec4899;
      --green: #10b981;
      --red: #ef4444;
      --yellow: #f59e0b;
      --cyan: #06b6d4;
      --text: #e5e5e5;
      --text-muted: #6b7280;
      --border: #1f1f2e;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
      padding-bottom: 220px;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
      border-radius: 16px;
      border: 1px solid var(--border);
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--purple), var(--pink), var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text-muted);
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
    }

    /* Sections */
    .search-section {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 2px solid var(--border);
      transition: all 0.3s ease;
    }

    .search-section.selected {
      border-color: var(--green);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }

    .section-header {
      display: grid;
      grid-template-columns: 60px 1fr 280px;
      gap: 20px;
      align-items: start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    @media (max-width: 900px) {
      .section-header {
        grid-template-columns: 50px 1fr;
      }
      .selection-panel {
        grid-column: span 2;
      }
    }

    .section-num {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--purple);
      font-family: 'Space Mono', monospace;
      text-align: center;
    }

    .section-info h2 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #fff;
    }

    .meta-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .timestamp, .emotion {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
    }

    .timestamp {
      background: rgba(16, 185, 129, 0.15);
      color: var(--green);
    }

    .emotion {
      background: rgba(236, 72, 153, 0.15);
      color: var(--pink);
    }

    .emotion-panic { background: rgba(239, 68, 68, 0.2); color: var(--red); }
    .emotion-death { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    .emotion-chaos { background: rgba(245, 158, 11, 0.2); color: var(--yellow); }
    .emotion-celebration { background: rgba(16, 185, 129, 0.2); color: var(--green); }

    .context {
      font-style: italic;
      color: var(--text-muted);
      font-size: 0.9rem;
      border-left: 3px solid var(--purple);
      padding-left: 12px;
    }

    /* Selection Panel */
    .selection-panel {
      background: var(--bg-dark);
      border-radius: 12px;
      padding: 12px;
      border: 1px solid var(--border);
    }

    .sel-preview {
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 10px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sel-preview img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .empty-preview {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .sel-controls {
      display: flex;
      gap: 6px;
    }

    .anim-select, .duration-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: 'Space Mono', monospace;
    }

    .duration-input {
      max-width: 60px;
      text-align: center;
    }

    /* Categories */
    .category {
      margin-bottom: 16px;
    }

    .category h4 {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-code {
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      color: var(--purple);
    }

    .cat-count {
      background: var(--bg-dark);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
    }

    .results-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 8px 4px;
      scrollbar-width: thin;
      scrollbar-color: var(--purple) var(--bg-dark);
    }

    .results-row::-webkit-scrollbar {
      height: 6px;
    }

    .results-row::-webkit-scrollbar-track {
      background: var(--bg-dark);
      border-radius: 3px;
    }

    .results-row::-webkit-scrollbar-thumb {
      background: var(--purple);
      border-radius: 3px;
    }

    /* Result Cards */
    .result-card {
      flex: 0 0 140px;
      background: var(--bg-dark);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      position: relative;
    }

    .result-card:hover {
      transform: translateY(-4px);
      border-color: var(--purple);
      box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
    }

    .result-card.selected {
      border-color: var(--green);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
    }

    .result-card.selected .result-number {
      background: var(--green);
      border-color: var(--green);
    }

    .result-number {
      position: absolute;
      top: 6px;
      left: 6px;
      background: var(--bg-dark);
      color: #fff;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      border: 2px solid var(--purple);
      z-index: 5;
      font-family: 'Space Mono', monospace;
    }

    .result-preview {
      height: 95px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .result-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .result-card:hover .result-preview img {
      transform: scale(1.1);
    }

    .error { color: var(--text-muted); font-size: 1.5rem; }

    .result-info {
      padding: 8px;
    }

    .source-badge {
      font-size: 0.55rem;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 4px;
      font-family: 'Space Mono', monospace;
    }

    .source-badge.tenor { background: #1DA1F2; color: #fff; }
    .source-badge.giphy { background: #00FF99; color: #000; }
    .source-badge.wikipedia { background: #fff; color: #000; }
    .source-badge.imgflip { background: var(--yellow); color: #000; }

    .result-title {
      font-size: 0.7rem;
      color: var(--text-muted);
      display: block;
      line-height: 1.3;
    }

    /* Bottom Panel */
    .bottom-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, var(--bg-dark) 80%, transparent);
      padding: 30px 20px 20px;
      z-index: 100;
    }

    .panel-inner {
      max-width: 1400px;
      margin: 0 auto;
      background: var(--bg-card);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border);
    }

    .panel-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .quick-input {
      flex: 1;
      min-width: 300px;
      background: var(--bg-dark);
      border: 2px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-size: 1rem;
      font-family: 'Space Mono', monospace;
    }

    .quick-input:focus {
      outline: none;
      border-color: var(--purple);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      font-family: 'Outfit', sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:hover { transform: translateY(-2px); }

    .btn-apply { background: var(--purple); color: #fff; }
    .btn-copy { background: var(--cyan); color: #000; }
    .btn-export { background: var(--green); color: #000; }
    .btn-clear { background: var(--red); color: #fff; }

    .progress-bar {
      display: flex;
      gap: 4px;
      margin-top: 12px;
      align-items: center;
    }

    .progress-dot {
      width: 24px;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .progress-dot.done { background: var(--green); }

    .progress-count {
      margin-left: 10px;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 10px;
      font-family: 'Space Mono', monospace;
    }

    /* Toast */
    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: var(--green);
      color: #000;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      transition: transform 0.3s ease;
      z-index: 200;
    }

    .toast.show { transform: translateX(-50%) translateY(0); }
    .toast.error { background: var(--red); color: #fff; }

    /* Copy Modal */
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 300;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal.show { display: flex; }

    .modal-content {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 24px;
      max-width: 900px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .modal-header h2 {
      font-size: 1.3rem;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
    }

    .code-output {
      flex: 1;
      background: var(--bg-dark);
      border-radius: 10px;
      padding: 16px;
      overflow: auto;
      font-family: 'Space Mono', monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      color: var(--cyan);
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 Meme Validator v3</h1>
    <p class="subtitle">Context-aware • Multi-source • Brain rot ready • ${title}</p>
  </div>

  ${sectionsHTML}

  <div class="bottom-panel">
    <div class="panel-inner">
      <div class="panel-row">
        <input type="text" class="quick-input" id="quickInput" placeholder="Quick select: 1-M-3, 2-M-1, 3-T-2 (section-category-item)" />
        <button class="btn btn-apply" onclick="applyQuickInput()">⚡ Apply</button>
        <button class="btn btn-clear" onclick="clearAll()">🗑️ Clear</button>
        <button class="btn btn-copy" onclick="showExportModal()">📋 Copy Code</button>
        <button class="btn btn-export" onclick="exportJSON()">💾 Export</button>
      </div>
      <div class="progress-bar" id="progressBar">
        ${sections.map((_, i) => `<div class="progress-dot" data-section="${i + 1}"></div>`).join('')}
        <span class="progress-count" id="progressCount">0/${sections.length}</span>
      </div>
      <p class="help-text">Categories: M=Memes, T=Templates, D=Medical • Example: "1-M-5, 2-M-2" selects Meme #5 for section 1, Meme #2 for section 2</p>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <div class="modal" id="exportModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>📦 Remotion Code</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <pre class="code-output" id="codeOutput"></pre>
      <div class="modal-actions">
        <button class="btn btn-copy" onclick="copyCode()">📋 Copy to Clipboard</button>
        <button class="btn btn-clear" onclick="closeModal()">Close</button>
      </div>
    </div>
  </div>

  <script>
    const selections = {};
    const total = ${sections.length};
    const PLAYBACK_RATE = 2.0; // Default, adjust as needed

    const sectionData = ${JSON.stringify(sections.map(s => ({
      name: s.name,
      timestamp: s.timestamp,
      context: s.context,
      emotion: s.emotion,
      results: s.results
    })))};

    const catMap = {
      'M': 'M', 'MEME': 'M', 'MEMES': 'M',
      'T': 'T', 'TEMPLATE': 'T', 'TEMPLATES': 'T',
      'D': 'D', 'MEDICAL': 'D'
    };

    function selectResult(section, cat, item, el) {
      // Deselect previous in this section
      document.querySelectorAll('#section-' + section + ' .result-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('section-' + section).classList.add('selected');

      const url = el.dataset.url;
      const title = el.dataset.title;
      const source = el.dataset.source;

      // Update preview
      const preview = document.getElementById('preview-' + section);
      preview.innerHTML = '<img src="' + url + '" alt="' + title + '">';

      // Get animation selections
      const entrance = document.getElementById('entrance-' + section).value;
      const exit = document.getElementById('exit-' + section).value;
      const duration = parseInt(document.getElementById('duration-' + section).value) || 45;

      selections[section] = {
        cat, item, url, title, source,
        name: sectionData[section - 1].name,
        timestamp: sectionData[section - 1].timestamp,
        emotion: sectionData[section - 1].emotion,
        entrance, exit, duration
      };

      updateProgress();
      toast('Section ' + section + ': ' + cat + '-' + item + ' ✓');
    }

    function applyQuickInput() {
      const val = document.getElementById('quickInput').value;
      const parts = val.split(',').map(s => s.trim()).filter(s => s);
      let applied = 0;

      for (const part of parts) {
        const match = part.match(/(\\d+)-(\\w+)-(\\d+)/i);
        if (match) {
          const [_, sec, catCode, num] = match;
          const section = parseInt(sec);
          const item = parseInt(num);
          const cat = catMap[catCode.toUpperCase()];

          if (cat) {
            const card = document.querySelector(
              '.result-card[data-section="' + section + '"][data-cat="' + cat + '"][data-item="' + item + '"]'
            );
            if (card) {
              selectResult(section, cat, item, card);
              applied++;
            }
          }
        }
      }

      toast('Applied ' + applied + ' selections');
    }

    function clearAll() {
      Object.keys(selections).forEach(k => delete selections[k]);
      document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.search-section').forEach(s => s.classList.remove('selected'));
      document.querySelectorAll('.sel-preview').forEach(el => {
        el.innerHTML = '<div class="empty-preview">Click to select</div>';
      });
      updateProgress();
      toast('Cleared all');
    }

    function updateProgress() {
      const count = Object.keys(selections).length;
      document.getElementById('progressCount').textContent = count + '/' + total;
      document.querySelectorAll('.progress-dot').forEach(d => {
        d.classList.toggle('done', !!selections[d.dataset.section]);
      });
    }

    function generateRemotionCode() {
      const sorted = Object.entries(selections).sort(([a], [b]) => parseInt(a) - parseInt(b));

      return sorted.map(([sec, s]) => {
        // Update with current animation values
        s.entrance = document.getElementById('entrance-' + sec).value;
        s.exit = document.getElementById('exit-' + sec).value;
        s.duration = parseInt(document.getElementById('duration-' + sec).value) || 45;

        return \`{/* \${sec}. \${s.name} (\${s.timestamp}s) - \${s.emotion} */}
<AnimatedMemeOverlay
  src="\${s.url}"
  timestamp={\${s.timestamp}}
  durationInFrames={\${s.duration}}
  position="center"
  scale={0.7}
  playbackRate={PLAYBACK_RATE}
  entrance="\${s.entrance}"
  exit="\${s.exit}"
/>\`;
      }).join('\\n\\n');
    }

    function showExportModal() {
      const count = Object.keys(selections).length;
      if (count === 0) {
        toast('No selections to export', true);
        return;
      }

      const code = generateRemotionCode();
      document.getElementById('codeOutput').textContent = code;
      document.getElementById('exportModal').classList.add('show');
    }

    function closeModal() {
      document.getElementById('exportModal').classList.remove('show');
    }

    async function copyCode() {
      const code = generateRemotionCode();
      try {
        await navigator.clipboard.writeText(code);
        toast('Copied to clipboard!');
        closeModal();
      } catch (e) {
        toast('Failed to copy', true);
      }
    }

    function exportJSON() {
      const count = Object.keys(selections).length;
      if (count === 0) {
        toast('No selections to export', true);
        return;
      }

      const sorted = Object.entries(selections)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([sec, s]) => ({
          section: parseInt(sec),
          name: s.name,
          timestamp: s.timestamp,
          emotion: s.emotion,
          url: s.url,
          title: s.title,
          source: s.source,
          entrance: document.getElementById('entrance-' + sec).value,
          exit: document.getElementById('exit-' + sec).value,
          duration: parseInt(document.getElementById('duration-' + sec).value) || 45
        }));

      const output = {
        videoName: '${title}',
        playbackRate: PLAYBACK_RATE,
        selections: sorted,
        remotionCode: generateRemotionCode()
      };

      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${title}-memes-' + Date.now() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Exported ' + sorted.length + ' selections');
    }

    function toast(msg, isError = false) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => t.classList.remove('show'), 2000);
    }

    // Keyboard shortcuts
    document.getElementById('quickInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') applyQuickInput();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.getElementById('exportModal').classList.contains('show')) {
        copyCode();
      }
    });

    // Click outside modal to close
    document.getElementById('exportModal').addEventListener('click', e => {
      if (e.target.id === 'exportModal') closeModal();
    });
  </script>
</body>
</html>`;
}

// ============================================
// MAIN
// ============================================

async function processConfig(configPath) {
  console.log('📂 Loading config:', configPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const sections = [];
  const total = config.searches.length;

  for (let i = 0; i < total; i++) {
    const item = config.searches[i];
    console.log(`\n[${i + 1}/${total}]`);
    const results = await searchAllSources(item);
    sections.push({ ...item, results });
    await new Promise(r => setTimeout(r, 300)); // Rate limiting between sections
  }

  return { sections, config };
}

async function main() {
  const args = process.argv.slice(2);

  console.log(`
╔══════════════════════════════════════════════════╗
║  🎭 MEME & IMAGE VALIDATOR v3                    ║
║  Context-Aware • Multi-Source • Brain Rot Ready  ║
╚══════════════════════════════════════════════════╝
`);

  if (args.includes('--config')) {
    const idx = args.indexOf('--config');
    const configPath = path.resolve(args[idx + 1]);

    const { sections, config } = await processConfig(configPath);

    const html = generateHTML(sections, config);
    const outputPath = path.join(process.cwd(), 'meme-validator-preview.html');
    fs.writeFileSync(outputPath, html);

    console.log(`
╔══════════════════════════════════════════════════╗
║  ✅ DONE!                                        ║
╠══════════════════════════════════════════════════╣
║  Output: ${outputPath.padEnd(39)}║
║  Sections: ${sections.length.toString().padEnd(37)}║
║  Total options: ${sections.reduce((a, s) => a + s.results.length, 0).toString().padEnd(32)}║
╚══════════════════════════════════════════════════╝
`);

    // Open in browser
    const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCmd} "${outputPath}"`);

  } else {
    console.log(`
Usage:
  npm run meme:v3 -- --config scripts/configs/hyperkalemia-memes.json
  node scripts/meme-validator-v3.js --config path/to/config.json

Features:
  🧠 Context-aware query generation
  🎭 Tenor & Giphy meme GIFs
  📝 Imgflip meme templates
  💊 Wikipedia medical images
  🎬 Ready-to-paste Remotion components
  ⚡ Animation picker (entrance/exit)
  📦 JSON export with timestamps
    `);
  }
}

main().catch(console.error);
