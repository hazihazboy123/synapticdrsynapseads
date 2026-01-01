const https = require('https');
const fs = require('fs');
const path = require('path');

const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';
const MEME_DIR = 'public/assets/memes';

// CONTEXTUALLY ACCURATE memes - thinking like a TikTok creator
const memeSearches = [
  // 1. FLATLINE - "heart about to FLATLINE" - death/dramatic
  { name: 'hk-flatline', query: 'coffin dance meme', note: 'Classic death meme' },

  // 2. CRUISE - patient asking about vacation while dying - ironic
  { name: 'hk-cruise', query: 'this is fine dog fire', note: 'Denial while everything burns' },

  // 3. SIR - already have Willy Wonka, skip

  // 4. JAZZ - already have crazy drummer, skip

  // 5. BAHAMAS - irony of vacation dreams
  { name: 'hk-bahamas', query: 'spongebob imagination rainbow', note: 'Dreaming of paradise' },

  // 6. SEVEN POINT EIGHT - K+ level = PANIC
  { name: 'hk-panic', query: 'jordan peele sweating key', note: 'THE panic meme' },

  // 7. THREAT - "that's not a number, that's a THREAT"
  { name: 'hk-threat', query: 'why do i hear boss music', note: 'Danger approaching' },

  // 8. CHEESECAKE FACTORY MENU - QRS wider than menu (it's HUGE)
  { name: 'hk-wide', query: 'wide putin walking meme', note: 'WIDE energy' },

  // 9. WASHING MACHINE - broken rhythm
  { name: 'hk-chaos', query: 'cat vibing head bob', note: 'Chaotic rhythm' },

  // 10. TICK TOCK - time pressure
  { name: 'hk-clock', query: 'bomb timer countdown panic', note: 'Time running out' },

  // 11. 45 SECONDS - maximum panic
  { name: 'hk-45sec', query: 'chuckles im in danger ralph', note: 'Death imminent' },

  // 12. ANSWER - calcium gluconate! CELEBRATION
  { name: 'hk-answer', query: 'leonardo dicaprio pointing', note: 'THE answer reveal meme' },

  // 13. SWEET SUMMER CHILDREN - roasting wrong answers
  { name: 'hk-roast', query: 'oh you sweet summer child got', note: 'Condescending roast' },

  // 14. HARLEM SHAKE - heart doing harlem shake into asystole
  { name: 'hk-harlem', query: 'coffin dance carry meme', note: 'Dancing to death' },

  // 15. BOUNCER - calcium is a bouncer
  { name: 'hk-bouncer', query: 'bouncer no entry denied', note: 'Security energy' },

  // 16. LOSING MIND - heart going crazy
  { name: 'hk-mind', query: 'math lady confused meme', note: 'Confusion/chaos' },

  // 17. NO CRUISE - sad ending
  { name: 'hk-sad', query: 'crying cat thumbs up sad', note: 'Sad but accepting' },
];

async function searchTenor(query) {
  return new Promise((resolve, reject) => {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=5&media_filter=gif&contentfilter=medium`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).results || []);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (r) => {
          r.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('🎬 Downloading CONTEXTUALLY ACCURATE memes...\n');

  for (const meme of memeSearches) {
    console.log(`🔍 ${meme.name}: "${meme.query}"`);
    console.log(`   💡 ${meme.note}`);

    try {
      const results = await searchTenor(meme.query);
      if (results.length > 0) {
        const gifUrl = results[0].media_formats?.gif?.url || results[0].media_formats?.tinygif?.url;
        if (gifUrl) {
          const filepath = path.join(MEME_DIR, `${meme.name}.gif`);
          await downloadFile(gifUrl, filepath);
          const stats = fs.statSync(filepath);
          console.log(`   ✅ ${(stats.size / 1024).toFixed(0)} KB\n`);
        }
      } else {
        console.log(`   ❌ No results\n`);
      }
    } catch (error) {
      console.log(`   ❌ ${error.message}\n`);
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log('🎉 Done!');
}

main();
