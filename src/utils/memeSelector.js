import memeLibrary from '../assets/memes/library.json';

/**
 * Automatically selects the best meme based on trigger words in the script
 *
 * @param {string} text - The text to analyze (e.g., a sentence from the script)
 * @param {string} category - Optional category filter (e.g., "death", "chaos")
 * @returns {string|null} - The memeId to use, or null if no match
 */
export function selectMemeByTrigger(text, category = null) {
  const lowerText = text.toLowerCase();
  const memes = Object.entries(memeLibrary.memes);

  // Filter by category if provided
  const filteredMemes = category
    ? memes.filter(([_, data]) => data.category === category)
    : memes;

  // Find the first meme whose triggers match the text
  for (const [memeId, memeData] of filteredMemes) {
    const triggers = memeData.triggers || [];

    for (const trigger of triggers) {
      if (lowerText.includes(trigger.toLowerCase())) {
        return memeId;
      }
    }
  }

  return null;
}

/**
 * Get all memes in a specific category
 *
 * @param {string} category - The category name
 * @returns {Array} - Array of meme IDs
 */
export function getMemesByCategory(category) {
  return memeLibrary.categories[category] || [];
}

/**
 * Analyze a full script and suggest meme placements
 *
 * @param {Array} timestampedWords - Array of {word, start, end} objects from 11 Labs
 * @param {number} minSpacing - Minimum seconds between memes (default: 5)
 * @returns {Array} - Array of {memeId, timestamp, word} suggestions
 */
export function analyzeSc riptForMemes(timestampedWords, minSpacing = 5) {
  const suggestions = [];
  let lastMemeTime = -minSpacing;

  for (const wordData of timestampedWords) {
    const { word, start } = wordData;

    // Check if enough time has passed since last meme
    if (start - lastMemeTime < minSpacing) {
      continue;
    }

    // Try to find a matching meme
    const memeId = selectMemeByTrigger(word);

    if (memeId) {
      suggestions.push({
        memeId,
        timestamp: start,
        word: word,
        memeData: memeLibrary.memes[memeId]
      });
      lastMemeTime = start;
    }
  }

  return suggestions;
}

/**
 * Manual meme placement helper
 *
 * @param {string} memeId - The meme ID to use
 * @param {number} timestamp - When to trigger it
 * @param {number} playbackRate - Audio playback rate
 * @returns {Object} - Ready-to-use meme cutaway props
 */
export function createMemePlacement(memeId, timestamp, playbackRate = 1.0) {
  const memeData = memeLibrary.memes[memeId];

  if (!memeData) {
    console.error(`Meme "${memeId}" not found`);
    return null;
  }

  return {
    memeId,
    triggerTimestamp: timestamp / playbackRate,  // Adjust for playback rate
    playbackRate,
    duration: memeData.duration
  };
}

export default {
  selectMemeByTrigger,
  getMemesByCategory,
  analyzeScriptForMemes,
  createMemePlacement
};
