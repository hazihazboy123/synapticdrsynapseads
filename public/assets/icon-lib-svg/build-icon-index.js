const fs = require("fs");
const path = require("path");

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith(".svg"));
const index = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf8");
  const matches = content.matchAll(/id="([^"]+)"/g);
  const labels = [];

  for (const m of matches) {
    const id = m[1];
    // Skip technical IDs
    const skip = [
      "Vector", "paint", "clip", "R-ICO", "mask", "path-",
      "Group", "BG", "MASK", "CORNER", "Ch", "centre"
    ];

    const shouldSkip = skip.some(s => id.startsWith(s)) ||
                       /^(Group|BG|MASK|CORNER|Ch|centre)(_\d+)?$/.test(id);

    if (!shouldSkip) {
      labels.push(id);
    }
  }

  if (labels.length > 0) {
    index[file] = [...new Set(labels)];
  }
}

// Write the index
fs.writeFileSync(path.join(dir, "icon-index.json"), JSON.stringify(index, null, 2));
console.log(`Created icon-index.json with ${Object.keys(index).length} indexed files`);

// Create a reverse index (label -> files) for easier searching
const reverseIndex = {};
for (const [file, labels] of Object.entries(index)) {
  for (const label of labels) {
    const normalizedLabel = label.toLowerCase();
    if (!reverseIndex[normalizedLabel]) {
      reverseIndex[normalizedLabel] = [];
    }
    reverseIndex[normalizedLabel].push({ file, originalLabel: label });
  }
}

fs.writeFileSync(path.join(dir, "icon-search-index.json"), JSON.stringify(reverseIndex, null, 2));
console.log(`Created icon-search-index.json with ${Object.keys(reverseIndex).length} unique labels`);
