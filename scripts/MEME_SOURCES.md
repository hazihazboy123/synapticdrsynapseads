# MEME DOWNLOAD QUICK REFERENCE

This guide contains ready-to-use commands for downloading all the essential memes.

## Setup (Run Once)

```bash
# Install tools (macOS)
brew install yt-dlp ffmpeg

# Update tools
brew upgrade yt-dlp ffmpeg

# Make scripts executable
cd /Users/haziq/synaptic-recall-ads
chmod +x scripts/download-meme.sh
```

## Known Meme Sources

Below are working YouTube URLs for popular memes. Copy and paste the commands directly.

### Death/Disaster

```bash
# Coffin Dance (Astronomia)
./scripts/download-meme.sh "https://www.youtube.com/watch?v=j9V78UbdzWI" coffin-dance 0:00 0:03

# Tactical Nuke
./scripts/download-meme.sh "https://www.youtube.com/watch?v=IXTJlH7g0tw" tactical-nuke 0:00 0:03
```

### Chaos

```bash
# Elmo Fire
./scripts/download-meme.sh "https://www.youtube.com/watch?v=0oBx7Jg4m-o" elmo-fire 0:00 0:02

# This Is Fine
./scripts/download-meme.sh "https://www.youtube.com/watch?v=aJphX1WtVSY" this-is-fine 0:00 0:02
```

### Shock/Surprise

```bash
# Surprised Pikachu
./scripts/download-meme.sh "https://www.youtube.com/watch?v=Wol70cBLNd8" surprised-pikachu 0:00 0:02

# Windows Error Sound
./scripts/download-meme.sh "https://www.youtube.com/watch?v=3sIYe74sczE" windows-error 0:00 0:02

# Unsettled Tom (may need manual sourcing)
# Search: "unsettled tom meme video"
```

### Confusion

```bash
# Confused Nick Young
./scripts/download-meme.sh "https://www.youtube.com/watch?v=WRWrmT0ovPE" confused-nick-young 0:00 0:02

# Confused Math Lady (Nazaré Tedesco)
./scripts/download-meme.sh "https://www.youtube.com/watch?v=sLlibrF5DRM" confused-math-lady 0:00 0:03
```

### Clever/Success

```bash
# Roll Safe (Thinking Guy)
./scripts/download-meme.sh "https://www.youtube.com/watch?v=pJ6L2e0n6HE" roll-safe 0:00 0:02

# Galaxy Brain
./scripts/download-meme.sh "https://www.youtube.com/watch?v=S02BHmWPZNs" galaxy-brain 0:00 0:02
```

### Sound Effects

```bash
# To Be Continued (JoJo)
./scripts/download-meme.sh "https://www.youtube.com/watch?v=rvrZJ5C_Nwg" to-be-continued 0:00 0:05

# MY LEG (SpongeBob)
./scripts/download-meme.sh "https://www.youtube.com/watch?v=Vhh_GeBPOhs" my-leg 0:00 0:02

# Bruh Sound Effect
./scripts/download-meme.sh "https://www.youtube.com/watch?v=2ZIpFytCSVc" bruh 0:00 0:01

# FBI Open Up
./scripts/download-meme.sh "https://www.youtube.com/watch?v=4wX2xBOuzRg" fbi-open-up 0:00 0:02

# Sad Violin
./scripts/download-meme.sh "https://www.youtube.com/watch?v=QuNhTLVgV2Y" sad-violin 0:00 0:03
```

## Manual Download (if URL doesn't work)

Some memes may need manual sourcing:

1. **Search on YouTube**: `"[meme name] green screen"` or `"[meme name] video"`
2. **Alternative sources**:
   - [Vlipsy](https://vlipsy.com/) - HD meme clips
   - [Green Screen Memes](https://greenscreenmemes.com/) - 5000+ meme videos
   - [Know Your Meme](https://knowyourmeme.com/) - Original sources
3. **Download manually** and place in `public/assets/memes/videos/`

## Troubleshooting

### yt-dlp fails with 403 error
```bash
yt-dlp -U  # Update yt-dlp
```

### Video won't download
```bash
# Try with cookies
yt-dlp --cookies-from-browser chrome "URL"

# Check available formats
yt-dlp -F "URL"
```

### Audio missing after trim
```bash
ffmpeg -i input.mp4 -ss 0:02 -to 0:05 -c:v libx264 -c:a aac -strict experimental output.mp4
```

### Get video metadata
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

## Next Steps

After downloading memes:
1. Check `public/assets/memes/videos/` for files
2. Verify durations match `library.json`
3. Test memes in Remotion preview

## Sources

- [Vlipsy](https://vlipsy.com/)
- [Green Screen Memes](https://greenscreenmemes.com/)
- [Tenor API Documentation](https://tenor.com/gifapi/documentation)
- [Giphy API Documentation](https://developers.giphy.com/docs/api/)
