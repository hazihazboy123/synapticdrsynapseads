#!/bin/bash

# =============================================================================
# SYNAPTIC RECALL MEME DOWNLOADER
# =============================================================================
# Usage: ./download-meme.sh <url> <meme-name> [start_time] [end_time]
#
# Examples:
#   ./download-meme.sh "https://youtube.com/watch?v=xxx" coffin-dance
#   ./download-meme.sh "https://youtube.com/watch?v=xxx" coffin-dance 0:02 0:05
#   ./download-meme.sh "https://tiktok.com/@user/video/xxx" elmo-fire 0:00 0:02
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MEME_DIR="$PROJECT_DIR/public/assets/memes/videos"
TEMP_DIR="$PROJECT_DIR/temp"

# Arguments
URL="$1"
MEME_NAME="$2"
START_TIME="$3"
END_TIME="$4"

# Validate arguments
if [ -z "$URL" ] || [ -z "$MEME_NAME" ]; then
    echo -e "${RED}Usage: ./download-meme.sh <url> <meme-name> [start_time] [end_time]${NC}"
    echo ""
    echo "Examples:"
    echo "  ./download-meme.sh \"https://youtube.com/watch?v=xxx\" coffin-dance"
    echo "  ./download-meme.sh \"https://youtube.com/watch?v=xxx\" coffin-dance 0:02 0:05"
    exit 1
fi

# Check for required tools
if ! command -v yt-dlp &> /dev/null; then
    echo -e "${RED}Error: yt-dlp not found${NC}"
    echo "Install with: brew install yt-dlp"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg not found${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Create directories
mkdir -p "$MEME_DIR"
mkdir -p "$TEMP_DIR"

# Output paths
RAW_FILE="$TEMP_DIR/${MEME_NAME}-raw.mp4"
FINAL_FILE="$MEME_DIR/${MEME_NAME}.mp4"

echo -e "${BLUE}=== SYNAPTIC RECALL MEME DOWNLOADER ===${NC}"
echo ""

# Step 1: Download
echo -e "${YELLOW}[1/4] Downloading from: $URL${NC}"
yt-dlp \
    -S "res:1080,ext:mp4:m4a" \
    --recode mp4 \
    -o "$RAW_FILE" \
    "$URL"

if [ ! -f "$RAW_FILE" ]; then
    echo -e "${RED}Error: Download failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Downloaded successfully${NC}"
echo ""

# Step 2: Trim (if start/end times provided)
if [ -n "$START_TIME" ] && [ -n "$END_TIME" ]; then
    echo -e "${YELLOW}[2/4] Trimming: $START_TIME to $END_TIME${NC}"
    ffmpeg -y -i "$RAW_FILE" \
        -ss "$START_TIME" \
        -to "$END_TIME" \
        -c:v libx264 \
        -preset fast \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        "$FINAL_FILE"

    rm "$RAW_FILE"
    echo -e "${GREEN}✓ Trimmed successfully${NC}"
else
    echo -e "${YELLOW}[2/4] No trim specified, using full video${NC}"
    mv "$RAW_FILE" "$FINAL_FILE"
    echo -e "${GREEN}✓ Moved to final location${NC}"
fi
echo ""

# Step 3: Extract metadata
echo -e "${YELLOW}[3/4] Extracting metadata...${NC}"

DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$FINAL_FILE")
DURATION_ROUNDED=$(printf "%.1f" "$DURATION")

RESOLUTION=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$FINAL_FILE")
WIDTH=$(echo "$RESOLUTION" | cut -d',' -f1)
HEIGHT=$(echo "$RESOLUTION" | cut -d',' -f2)

HAS_AUDIO=$(ffprobe -v quiet -select_streams a -show_entries stream=codec_type -of csv=p=0 "$FINAL_FILE")
if [ -n "$HAS_AUDIO" ]; then
    HAS_AUDIO_BOOL="true"
else
    HAS_AUDIO_BOOL="false"
fi

FILE_SIZE=$(du -m "$FINAL_FILE" | cut -f1)

echo -e "${GREEN}✓ Metadata extracted${NC}"
echo ""

# Step 4: Display summary
echo -e "${YELLOW}[4/4] Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "  File:       ${GREEN}$FINAL_FILE${NC}"
echo -e "  Duration:   ${GREEN}${DURATION_ROUNDED}s${NC}"
echo -e "  Resolution: ${GREEN}${WIDTH}x${HEIGHT}${NC}"
echo -e "  Has Audio:  ${GREEN}${HAS_AUDIO_BOOL}${NC}"
echo -e "  Size:       ${GREEN}${FILE_SIZE}MB${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Generate JSON snippet
echo -e "${YELLOW}Add this to public/assets/memes/library.json:${NC}"
echo ""
cat << EOF
"${MEME_NAME}": {
  "video": "assets/memes/videos/${MEME_NAME}.mp4",
  "duration": ${DURATION_ROUNDED},
  "hasAudio": ${HAS_AUDIO_BOOL},
  "audioDescription": "TODO",
  "volume": 0.7,
  "optimalCutDuration": ${DURATION_ROUNDED},
  "category": "TODO",
  "triggers": ["TODO"],
  "useCase": "TODO"
}
EOF

echo ""
echo -e "${GREEN}=== DONE ===${NC}"
