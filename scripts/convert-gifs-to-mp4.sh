#!/bin/bash

# Convert all GIFs to MP4s for Remotion compatibility
# MP4s sync perfectly with useCurrentFrame() unlike GIFs

MEME_DIR="/Users/haziq/synaptic-recall-ads/public/assets/memes"
SRC_MEME_DIR="/Users/haziq/synaptic-recall-ads/src/assets/memes"

convert_gif() {
    local gif_file="$1"
    local mp4_file="${gif_file%.gif}.mp4"

    if [ -f "$mp4_file" ]; then
        echo "SKIP: $mp4_file already exists"
        return 0
    fi

    echo "Converting: $gif_file"

    # FFmpeg settings for optimal Remotion compatibility:
    # - yuv420p: Universal pixel format
    # - scale filter: Ensure even dimensions (required for H.264)
    # - movflags faststart: Web-optimized
    # - crf 18: High quality
    # - r 30: Match Remotion's 30fps
    ffmpeg -y -i "$gif_file" \
        -movflags faststart \
        -pix_fmt yuv420p \
        -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
        -c:v libx264 \
        -crf 18 \
        -preset medium \
        -r 30 \
        "$mp4_file" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "SUCCESS: $mp4_file"
    else
        echo "FAILED: $gif_file"
    fi
}

echo "========================================="
echo "GIF to MP4 Converter for Remotion"
echo "========================================="
echo ""

# Convert public/assets/memes
echo "Processing: $MEME_DIR"
echo "-----------------------------------------"
for gif in "$MEME_DIR"/*.gif; do
    [ -f "$gif" ] && convert_gif "$gif"
done

echo ""

# Convert src/assets/memes
echo "Processing: $SRC_MEME_DIR"
echo "-----------------------------------------"
for gif in "$SRC_MEME_DIR"/*.gif; do
    [ -f "$gif" ] && convert_gif "$gif"
done

echo ""
echo "========================================="
echo "Conversion complete!"
echo "========================================="

# Count results
public_mp4=$(ls -1 "$MEME_DIR"/*.mp4 2>/dev/null | wc -l)
src_mp4=$(ls -1 "$SRC_MEME_DIR"/*.mp4 2>/dev/null | wc -l)
echo "MP4s in public/assets/memes: $public_mp4"
echo "MP4s in src/assets/memes: $src_mp4"
