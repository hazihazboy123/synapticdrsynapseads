#!/bin/bash
cd /Users/haziq/synaptic-recall-ads

# Meme 2: elmo-fire
echo "=== Downloading elmo-fire ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/elmo-fire-raw.mp4" "https://www.youtube.com/watch?v=0oBx7Jg4m-o"
ffmpeg -y -i "public/assets/memes/temp/elmo-fire-raw.mp4" -ss 0:00 -to 0:01.5 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/elmo-fire.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/elmo-fire-raw.mp4"
echo "✓ elmo-fire: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/elmo-fire.mp4)s"

# Meme 3: surprised-pikachu
echo "=== Downloading surprised-pikachu ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/surprised-pikachu-raw.mp4" "https://www.youtube.com/watch?v=CYxy8Bmhs-g"
ffmpeg -y -i "public/assets/memes/temp/surprised-pikachu-raw.mp4" -ss 0:00 -to 0:01.5 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/surprised-pikachu.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/surprised-pikachu-raw.mp4"
echo "✓ surprised-pikachu: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/surprised-pikachu.mp4)s"

# Meme 4: roll-safe
echo "=== Downloading roll-safe ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/roll-safe-raw.mp4" "https://www.youtube.com/watch?v=Vi8zeaxtB-w"
ffmpeg -y -i "public/assets/memes/temp/roll-safe-raw.mp4" -ss 0:00 -to 0:01.5 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/roll-safe.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/roll-safe-raw.mp4"
echo "✓ roll-safe: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/roll-safe.mp4)s"

# Meme 5: windows-error
echo "=== Downloading windows-error ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/windows-error-raw.mp4" "https://www.youtube.com/watch?v=3sIYe74sczE"
ffmpeg -y -i "public/assets/memes/temp/windows-error-raw.mp4" -ss 0:00 -to 0:01.5 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/windows-error.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/windows-error-raw.mp4"
echo "✓ windows-error: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/windows-error.mp4)s"

# Meme 6: to-be-continued
echo "=== Downloading to-be-continued ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/to-be-continued-raw.mp4" "https://www.youtube.com/watch?v=uwY84Fg4NsM"
ffmpeg -y -i "public/assets/memes/temp/to-be-continued-raw.mp4" -ss 0:00 -to 0:03 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/to-be-continued.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/to-be-continued-raw.mp4"
echo "✓ to-be-continued: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/to-be-continued.mp4)s"

# Meme 7: emotional-damage
echo "=== Downloading emotional-damage ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/emotional-damage-raw.mp4" "https://www.youtube.com/watch?v=njO8mmr2MoQ"
ffmpeg -y -i "public/assets/memes/temp/emotional-damage-raw.mp4" -ss 0:00 -to 0:02 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/emotional-damage.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/emotional-damage-raw.mp4"
echo "✓ emotional-damage: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/emotional-damage.mp4)s"

# Meme 8: my-leg
echo "=== Downloading my-leg ==="
yt-dlp -S "res:1080,ext:mp4:m4a" --recode mp4 -o "public/assets/memes/temp/my-leg-raw.mp4" "https://www.youtube.com/watch?v=Vhh_GeBPOhs"
ffmpeg -y -i "public/assets/memes/temp/my-leg-raw.mp4" -ss 0:00 -to 0:01.5 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "public/assets/memes/videos/my-leg.mp4" 2>&1 | tail -3
rm "public/assets/memes/temp/my-leg-raw.mp4"
echo "✓ my-leg: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 public/assets/memes/videos/my-leg.mp4)s"

echo ""
echo "=== ALL DOWNLOADS COMPLETE ==="
