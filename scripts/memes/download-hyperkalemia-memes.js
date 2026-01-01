const https = require('https');
const fs = require('fs');
const path = require('path');

const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const MEME_DIR = 'public/assets/memes';

// Meme definitions for hyperkalemia video
const memeSearches = [
  { name: 'hyperkalemia-flatline', query: 'heart monitor flatline death', emotion: 'DEATH' },
  { name: 'hyperkalemia-cruise', query: 'cruise ship vacation wave', emotion: 'IRONY' },
  { name: 'hyperkalemia-sir', query: 'excuse me sir meme confused', emotion: 'FRUSTRATION' },
  { name: 'hyperkalemia-jazz', query: 'jazz hands meme excited', emotion: 'DARK_HUMOR' },
  { name: 'hyperkalemia-bahamas', query: 'beach paradise tropical', emotion: 'IRONY' },
  { name: 'hyperkalemia-seven', query: 'shocked scared panic face', emotion: 'PANIC' },
  { name: 'hyperkalemia-threat', query: 'skull danger warning death', emotion: 'DEATH' },
  { name: 'hyperkalemia-cheesecake', query: 'cheesecake factory menu thick', emotion: 'DARK_HUMOR' },
  { name: 'hyperkalemia-washing-machine', query: 'washing machine broken chaos', emotion: 'DARK_HUMOR' },
  { name: 'hyperkalemia-tick-tock', query: 'clock time running out panic', emotion: 'PANIC' },
  { name: 'hyperkalemia-45-seconds', query: 'sweating nervous stress jordan peele', emotion: 'PANIC' },
  { name: 'hyperkalemia-answer', query: 'pointing leonardo dicaprio meme', emotion: 'CELEBRATION' },
  { name: 'hyperkalemia-sweet-summer', query: 'game of thrones ned stark winter', emotion: 'ROAST' },
  { name: 'hyperkalemia-harlem-shake', query: 'harlem shake dance meme', emotion: 'DARK_HUMOR' },
  { name: 'hyperkalemia-bouncer', query: 'bouncer security guard door', emotion: 'TEACHING' },
  { name: 'hyperkalemia-losing-mind', query: 'losing my mind crazy brain meme', emotion: 'CHAOS' },
  { name: 'hyperkalemia-no-cruise', query: 'disappointed sad no denied', emotion: 'ROAST' },
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
      // Handle redirects
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
  console.log('Downloading memes for Hyperkalemia video...\n');

  if (!fs.existsSync(MEME_DIR)) {
    fs.mkdirSync(MEME_DIR, { recursive: true });
  }

  for (const meme of memeSearches) {
    console.log(`Searching for: ${meme.name} (${meme.query})`);

    try {
      const results = await searchTenor(meme.query);

      if (results.length > 0) {
        const gifUrl = results[0].media_formats?.gif?.url || results[0].media_formats?.tinygif?.url;

        if (gifUrl) {
          const filepath = path.join(MEME_DIR, `${meme.name}.gif`);
          await downloadFile(gifUrl, filepath);

          const stats = fs.statSync(filepath);
          console.log(`  Downloaded: ${meme.name}.gif (${(stats.size / 1024).toFixed(1)} KB)`);
        } else {
          console.log(`  No GIF URL found for ${meme.name}`);
        }
      } else {
        console.log(`  No results for ${meme.name}`);
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\nDone downloading memes!');
}

main().catch(console.error);
