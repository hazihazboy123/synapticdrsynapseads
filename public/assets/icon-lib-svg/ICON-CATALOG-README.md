# Icon Library Catalog

## Overview

This directory contains 2,550 SVG medical/biological icons with an automatically generated catalog that makes them searchable and categorizable.

## Files

- **icon-catalog.json** - Main catalog with detailed metadata for 2,216 icons
- **icon-catalog-stats.json** - Statistics about the catalog
- **icon-index.json** - Legacy index mapping filenames to ID labels
- **icon-search-index.json** - Legacy search index

## Catalog Structure

Each icon in `icon-catalog.json` has the following structure:

```json
{
  "R-ICO-XXXXX.svg": {
    "name": "descriptive-name",
    "category": "category-name",
    "useFor": ["use-case-1", "use-case-2"],
    "aliases": ["alternative-name-1", "alternative-name-2"],
    "allLabels": ["Original_ID_1", "Original_ID_2"]
  }
}
```

### Fields

- **name**: Primary descriptive name (cleaned and normalized from SVG id attributes)
- **category**: Icon category (see Categories section)
- **useFor**: Array of use cases where this icon is applicable
- **aliases**: Alternative names found in the SVG (optional)
- **allLabels**: All original ID values extracted from the SVG (for reference)

## Categories

The catalog includes the following categories:

1. **molecule** (269 icons) - Chemical compounds, substrates, metabolites
2. **protein** (73 icons) - Enzymes, antibodies, structural proteins
3. **cell-type** (68 icons) - Neurons, cells, organelles
4. **chemical** (21 icons) - Carbohydrates, lipids, nucleotides
5. **structure** (21 icons) - Molecular structures, complexes
6. **immune** (14 icons) - Immune system components
7. **receptor** (9 icons) - Cellular receptors, binding sites
8. **ion-channel** (8 icons) - Ion channels, pumps, transporters
9. **anatomy** (4 icons) - Anatomical structures
10. **pathogen** (2 icons) - Viruses, bacteria
11. **generic** (1,727 icons) - General or unclassified icons

## Use Cases

Top use cases identified:

1. **medical-illustration** (2,030 icons) - General medical/scientific illustrations
2. **molecular-biology** (90 icons) - DNA, RNA, proteins, genes
3. **cellular** (66 icons) - Cell components, membranes, organelles
4. **ion-transport** (19 icons) - Ion movement, channels, pumps
5. **receptor-binding** (10 icons) - Receptor-ligand interactions
6. **signal-transduction** (7 icons) - Cellular signaling pathways
7. **immunology** (5 icons) - Immune responses
8. **pharmacology** (4 icons) - Drug interactions
9. **metabolism** (3 icons) - Metabolic processes
10. **endocrine** (3 icons) - Hormonal systems

## Examples

### Receptor Icons

```json
{
  "R-ICO-013338.svg": {
    "name": "scavenger receptor class b",
    "category": "receptor",
    "useFor": ["signal-transduction", "pharmacology", "receptor-binding"],
    "allLabels": ["Scavenger receptor class B"]
  },
  "R-ICO-014163.svg": {
    "name": "olfactory receptor",
    "category": "receptor",
    "useFor": ["signal-transduction", "pharmacology", "receptor-binding"],
    "allLabels": ["Olfactory receptor"]
  }
}
```

### Cell-Type Icons

```json
{
  "R-ICO-013681.svg": {
    "name": "nucleus",
    "category": "cell-type",
    "useFor": ["cellular"],
    "aliases": ["myelin shealths"],
    "allLabels": ["Nucleus", "myelin shealths", ...]
  }
}
```

## How to Use

### Search by Name

```javascript
const catalog = require('./icon-catalog.json');

// Find all receptor icons
const receptorIcons = Object.entries(catalog)
  .filter(([_, data]) => data.category === 'receptor')
  .map(([filename, data]) => ({ filename, ...data }));
```

### Search by Use Case

```javascript
// Find all icons for signal transduction
const signalIcons = Object.entries(catalog)
  .filter(([_, data]) => data.useFor.includes('signal-transduction'))
  .map(([filename, data]) => ({ filename, ...data }));
```

### Text Search

```javascript
// Search by name or aliases
function searchIcons(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.entries(catalog)
    .filter(([_, data]) => {
      return data.name.includes(term) ||
             (data.aliases && data.aliases.some(alias => alias.includes(term)));
    })
    .map(([filename, data]) => ({ filename, ...data }));
}

const results = searchIcons('neuron');
```

## Statistics

- **Total SVG Files**: 2,550
- **Icons with Meaningful Names**: 2,216 (86.9%)
- **Icons Skipped**: 334 (13.1% - only generic IDs like "Vector", "Group")

## Generation

The catalog is generated from SVG file analysis using `generate-icon-catalog.js`:

```bash
node generate-icon-catalog.js
```

This script:
1. Scans all SVG files in the directory
2. Extracts `id` attributes from SVG elements
3. Filters out generic/meaningless IDs (Vector, Group, Path, etc.)
4. Categorizes icons based on keyword matching
5. Assigns use cases based on medical/biological domain knowledge
6. Outputs the structured JSON catalog

## Notes

- Some icons (334 files) only contain generic IDs and couldn't be automatically cataloged
- The categorization is based on keyword matching and may need manual refinement
- Icons may belong to multiple use cases
- The catalog can be regenerated as new icons are added or naming improves

## Version

Generated: December 14, 2024
