const fs = require('fs');
const path = require('path');

// Load the comprehensive meme library
const MEME_LIBRARY_PATH = path.join(__dirname, '../assets/memes/meme-library.json');
const MEME_LIBRARY = JSON.parse(fs.readFileSync(MEME_LIBRARY_PATH, 'utf8'));

/**
 * Get a meme from the local collection (no downloading needed - already local!)
 * @param {string} memeId - The meme identifier (e.g., 'surprised-pikachu')
 * @returns {string} - Local path to the meme file
 */
function downloadMeme(memeId) {
  const meme = MEME_LIBRARY[memeId];

  if (!meme) {
    console.error(`   ❌ Unknown meme ID: ${memeId}`);
    console.error(`   Available memes: ${Object.keys(MEME_LIBRARY).slice(0, 10).join(', ')}...`);
    throw new Error(`Unknown meme ID: ${memeId}`);
  }

  if (!meme.downloaded) {
    console.error(`   ❌ Meme not downloaded: ${memeId}`);
    throw new Error(`Meme not available: ${memeId}`);
  }

  const localPath = path.join(__dirname, '..', 'assets', meme.local_path);

  if (!fs.existsSync(localPath)) {
    console.error(`   ❌ Meme file not found: ${localPath}`);
    throw new Error(`Meme file not found: ${memeId}`);
  }

  console.log(`   ✅ Found: ${meme.name} (${meme.category})`);
  return localPath;
}

/**
 * Get memes by category
 * @param {string} category - Category name (e.g., 'disaster_shock', 'leaving_quitting')
 * @returns {Array} - Array of meme objects in that category
 */
function getMemesByCategory(category) {
  return Object.entries(MEME_LIBRARY)
    .filter(([id, meme]) => meme.category === category)
    .map(([id, meme]) => ({ id, ...meme }));
}

/**
 * Get memes by tag
 * @param {string} tag - Tag to search for
 * @returns {Array} - Array of meme objects with that tag
 */
function getMemesByTag(tag) {
  return Object.entries(MEME_LIBRARY)
    .filter(([id, meme]) => meme.tags.includes(tag))
    .map(([id, meme]) => ({ id, ...meme }));
}

/**
 * Search memes by keywords in name, tags, or use_case
 * @param {string} keyword - Keyword to search for
 * @returns {Array} - Array of matching meme objects
 */
function searchMemes(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.entries(MEME_LIBRARY)
    .filter(([id, meme]) => {
      return meme.name.toLowerCase().includes(lowerKeyword) ||
             meme.tags.some(tag => tag.includes(lowerKeyword)) ||
             meme.use_case.toLowerCase().includes(lowerKeyword);
    })
    .map(([id, meme]) => ({ id, ...meme }));
}

/**
 * Get all available meme IDs
 * @returns {Array} - Array of all meme IDs
 */
function getAllMemeIds() {
  return Object.keys(MEME_LIBRARY);
}

/**
 * Get meme info
 * @param {string} memeId - The meme identifier
 * @returns {Object} - Meme metadata
 */
function getMemeInfo(memeId) {
  return MEME_LIBRARY[memeId];
}

module.exports = {
  downloadMeme,
  getMemesByCategory,
  getMemesByTag,
  searchMemes,
  getAllMemeIds,
  getMemeInfo,
  MEME_LIBRARY
};
