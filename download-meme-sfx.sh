#!/bin/bash

# Create directory for meme sound effects
mkdir -p src/assets/sfx/memes

cd src/assets/sfx/memes

echo "Downloading meme sound effects for medical videos..."

# These are common, professionally-appropriate sound effects for meme overlays
# All from free/royalty-free sources

# 1. Slide Whistle (for reactions/reveals)
echo "Downloading slide whistle..."
curl -L "https://cdn.freesound.org/previews/411/411749_5121236-lq.mp3" -o "slide-whistle.mp3"

# 2. Pop/Bloop (for meme appearance)
echo "Downloading pop sound..."
curl -L "https://cdn.freesound.org/previews/341/341345_5858296-lq.mp3" -o "pop.mp3"

# 3. Ding (subtle notification/correct answer)
echo "Downloading ding..."
curl -L "https://cdn.freesound.org/previews/411/411642_3248244-lq.mp3" -o "ding.mp3"

# 4. Record Scratch (interruption/surprise)
echo "Downloading record scratch..."
curl -L "https://cdn.freesound.org/previews/122/122255_824230-lq.mp3" -o "record-scratch.mp3"

# 5. Cartoon Boing (bouncy/playful)
echo "Downloading boing..."
curl -L "https://cdn.freesound.org/previews/415/415762_5828114-lq.mp3" -o "boing.mp3"

# 6. Swoosh (quick transition)
echo "Downloading swoosh..."
curl -L "https://cdn.freesound.org/previews/442/442827_4019029-lq.mp3" -o "swoosh.mp3"

# 7. Quick Whistle (attention grabber)
echo "Downloading whistle..."
curl -L "https://cdn.freesound.org/previews/415/415763_5828114-lq.mp3" -o "whistle.mp3"

# 8. Plop (simple appearance)
echo "Downloading plop..."
curl -L "https://cdn.freesound.org/previews/541/541541_11672319-lq.mp3" -o "plop.mp3"

echo "Download complete! Sound effects saved to src/assets/sfx/memes/"
ls -lh
