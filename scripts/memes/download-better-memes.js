const https = require('https');
const fs = require('fs');
const path = require('path');

const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const MEME_DIR = 'public/assets/memes';

// Creative meme searches - thinking like a TikTok creator
const memeSearches = [
  // JAZZ - chaotic heart rhythm = chaotic music
  { name: 'hyperkalemia-jazz-v2', query: 'drummer going crazy insane', emotion: 'CHAOS' },
  { name: 'hyperkalemia-jazz-v3', query: 'cat piano chaos', emotion: 'CHAOS' },
  { name: 'hyperkalemia-jazz-v4', query: 'jazz music stops meme', emotion: 'DARK_HUMOR' },

  // SIR - disbelief/frustration at dying patient asking about cruise
  { name: 'hyperkalemia-sir-v2', query: 'gru despicable me what face', emotion: 'DISBELIEF' },
  { name: 'hyperkalemia-sir-v3', query: 'are you serious right now meme', emotion: 'FRUSTRATION' },
  { name: 'hyperkalemia-sir-v4', query: 'blink twice if you need help', emotion: 'FRUSTRATION' },
  { name: 'hyperkalemia-sir-v5', query: 'willy wonka condescending', emotion: 'SARCASM' },
];

async function searchTenor(query) {
  return new Promise((resolve, reject) => {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=5&media_filter=gif&contentfilter=medium`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        https.get(redirectUrl, (redirectRes) => {
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('🎬 Downloading BETTER memes (thinking like a TikTok creator)...\n');

  for (const meme of memeSearches) {
    console.log(`🔍 "${meme.query}" → ${meme.name}`);

    try {
      const results = await searchTenor(meme.query);

      if (results.length > 0) {
        // Show top 3 results so we can pick
        console.log(`   Found ${results.length} results:`);
        results.slice(0, 3).forEach((r, i) => {
          console.log(`   ${i+1}. ${r.content_description || 'No description'}`);
        });

        const gifUrl = results[0].media_formats?.gif?.url || results[0].media_formats?.tinygif?.url;

        if (gifUrl) {
          const filepath = path.join(MEME_DIR, `${meme.name}.gif`);
          await downloadFile(gifUrl, filepath);

          const stats = fs.statSync(filepath);
          console.log(`   ✅ Downloaded: ${meme.name}.gif (${(stats.size / 1024).toFixed(1)} KB)\n`);
        }
      } else {
        console.log(`   ❌ No results\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n🎉 Done! Check the files and pick the best ones.');
}

main().catch(console.error);
