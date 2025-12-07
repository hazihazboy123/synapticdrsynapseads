const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Download a meme/image from URL
 */
async function downloadMeme(url, filename) {
  const outputPath = path.join(__dirname, '../assets/memes', filename);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Downloaded: ${filename}`);
        resolve(outputPath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`❌ Failed to download ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Meme suggestions for medical concepts
 */
const MEDICAL_MEME_SUGGESTIONS = {
  breathless: [
    'Search: "out of breath meme gif"',
    'Spongebob gasping for air',
    'Person panting after running'
  ],
  shocked: [
    'Search: "shocked reaction meme"',
    'Surprised Pikachu',
    'Guy blinking in confusion'
  ],
  studying: [
    'Search: "studying hard meme"',
    'Homer Simpson disappearing into bushes',
    'Stressed student meme'
  ],
  'mind-blown': [
    'Search: "mind blown gif"',
    'Tim and Eric mind blown',
    'Brain exploding meme'
  ],
  elevated: [
    'Search: "stonks meme" or "going up meme"',
    'Stonks guy',
    'Rocket taking off'
  ],
  confused: [
    'Search: "confused math lady meme"',
    'Math lady calculating',
    'Confused Nick Young'
  ]
};

// Example usage
if (require.main === module) {
  console.log('💡 Meme Download Suggestions:\n');
  console.log('For your sarcoidosis video, search for these on Tenor/Giphy:\n');
  Object.entries(MEDICAL_MEME_SUGGESTIONS).forEach(([key, suggestions]) => {
    console.log(`\n${key.toUpperCase()}:`);
    suggestions.forEach(s => console.log(`  - ${s}`));
  });

  console.log('\n📝 Then download and save to: src/assets/memes/');
  console.log('\nExample:');
  console.log('  - breathless.gif');
  console.log('  - shocked.gif');
  console.log('  - mind-blown.gif');
}

module.exports = { downloadMeme, MEDICAL_MEME_SUGGESTIONS };
