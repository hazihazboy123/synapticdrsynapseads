const fs = require('fs');
const path = require('path');

// Directory containing SVG icons
const ICON_DIR = path.join(__dirname, 'public', 'assets', 'icon-lib-svg');
const OUTPUT_FILE = path.join(ICON_DIR, 'icon-catalog.json');

// Generic/non-descriptive ID patterns to filter out
const GENERIC_PATTERNS = [
  /^Vector(_\d+)?$/i,
  /^Group(_\d+)?$/i,
  /^Path(_\d+)?$/i,
  /^Rectangle(\s\d+)?$/i,
  /^Circle(_\d+)?$/i,
  /^Ellipse(_\d+)?$/i,
  /^Line(_\d+)?$/i,
  /^Polygon(_\d+)?$/i,
  /^BG$/i,
  /^FG$/i,
  /^Layer(_\d+)?$/i,
  /^Shape(_\d+)?$/i,
  /^Clip(_\d+)?$/i,
  /^Mask(_\d+)?$/i,
  /^LEFT[\s_]CORNER$/i,
  /^RIGHT[\s_]CORNER$/i,
  /^R-ICO-\d+$/i, // File ID itself
  /^paint\d+/i,  // Gradient IDs
  /^path-\d+/i,  // Generic path IDs
  /^g\d+$/i,     // Generic group IDs
  /^defs$/i,
  /^\d+$/,        // Just numbers
];

// Category classification based on keywords
const CATEGORY_KEYWORDS = {
  'cell-type': ['neuron', 'cell', 'lymphocyte', 'erythrocyte', 'leukocyte', 'platelet', 'macrophage', 'dendrite', 'axon', 'nucleus', 'cytoplasm', 'membrane'],
  'receptor': ['receptor', 'binding', 'ligand', 'adrenergic', 'cholinergic', 'dopamine', 'serotonin', 'gaba', 'glutamate', 'nicotinic', 'muscarinic'],
  'molecule': ['molecule', 'compound', 'chemical', 'substrate', 'product', 'metabolite', 'atp', 'adp', 'nad', 'fad', 'coenzyme'],
  'protein': ['protein', 'enzyme', 'kinase', 'phosphatase', 'ligase', 'peptide', 'antibody', 'immunoglobulin', 'collagen', 'actin', 'myosin'],
  'organ': ['heart', 'lung', 'liver', 'kidney', 'brain', 'spleen', 'pancreas', 'stomach', 'intestine', 'bladder', 'organ'],
  'anatomy': ['bone', 'muscle', 'tissue', 'artery', 'vein', 'vessel', 'nerve', 'gland', 'duct', 'valve', 'chamber', 'lobe'],
  'pathogen': ['virus', 'bacteria', 'pathogen', 'microbe', 'fungus', 'parasite', 'infection', 'viral', 'bacterial'],
  'signal': ['signal', 'cascade', 'pathway', 'transduction', 'activation', 'inhibition', 'modulation', 'regulation'],
  'ion-channel': ['channel', 'pump', 'transporter', 'exchanger', 'calcium', 'sodium', 'potassium', 'chloride', 'ion'],
  'structure': ['structure', 'complex', 'domain', 'motif', 'helix', 'sheet', 'loop', 'fold', 'tertiary', 'quaternary'],
  'chemical': ['carbohydrate', 'lipid', 'nucleotide', 'amino acid', 'fatty acid', 'glucose', 'glycogen', 'steroid', 'phosphate', 'phosphatidyl'],
  'immune': ['immune', 'antibody', 'antigen', 'complement', 'cytokine', 'interferon', 'interleukin', 'lymph', 'mhc', 'tcr', 'bcr'],
  'metabolic': ['metabolism', 'glycolysis', 'krebs', 'citric', 'oxidative', 'phosphorylation', 'catabolism', 'anabolism'],
  'generic': []  // Default category
};

// Use case classification
const USE_CASE_KEYWORDS = {
  'neurological': ['neuron', 'brain', 'nerve', 'neural', 'synapse', 'neurotransmitter', 'dopamine', 'serotonin', 'gaba'],
  'cardiovascular': ['heart', 'cardiac', 'vessel', 'artery', 'vein', 'blood', 'circulation', 'vascular'],
  'respiratory': ['lung', 'alveoli', 'bronchi', 'respiratory', 'breathing', 'oxygen', 'gas exchange'],
  'immunology': ['immune', 'antibody', 'antigen', 'lymphocyte', 'macrophage', 'cytokine', 'inflammation'],
  'endocrine': ['hormone', 'gland', 'insulin', 'glucagon', 'thyroid', 'adrenal', 'pituitary', 'endocrine'],
  'signal-transduction': ['signal', 'cascade', 'pathway', 'transduction', 'receptor', 'kinase', 'phosphorylation'],
  'metabolism': ['metabolism', 'glycolysis', 'atp', 'enzyme', 'substrate', 'catalysis', 'oxidation', 'reduction'],
  'molecular-biology': ['dna', 'rna', 'protein', 'gene', 'transcription', 'translation', 'replication'],
  'pharmacology': ['drug', 'receptor', 'agonist', 'antagonist', 'inhibitor', 'blocker', 'channel'],
  'anatomy': ['organ', 'tissue', 'bone', 'muscle', 'structure', 'anatomical'],
  'cellular': ['cell', 'membrane', 'organelle', 'nucleus', 'mitochondria', 'cytoplasm', 'transport'],
  'receptor-binding': ['receptor', 'binding', 'ligand', 'affinity', 'attachment'],
  'ion-transport': ['ion', 'channel', 'pump', 'transporter', 'calcium', 'sodium', 'potassium'],
};

/**
 * Extract all id attributes from SVG content
 */
function extractIdsFromSVG(svgContent) {
  const idPattern = /id="([^"]*)"/g;
  const ids = [];
  let match;

  while ((match = idPattern.exec(svgContent)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

/**
 * Check if an ID is generic/meaningless
 */
function isGenericId(id) {
  if (!id || id.trim() === '') return true;

  return GENERIC_PATTERNS.some(pattern => pattern.test(id));
}

/**
 * Clean and normalize a name
 */
function cleanName(name) {
  // Replace underscores and multiple spaces with single space
  let cleaned = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  // Convert to title case for better readability
  cleaned = cleaned.toLowerCase();

  return cleaned;
}

/**
 * Determine category based on name keywords
 */
function categorizeIcon(name) {
  const lowerName = name.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'generic') continue;

    for (const keyword of keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'generic';
}

/**
 * Determine use cases based on name keywords
 */
function determineUseCases(name) {
  const lowerName = name.toLowerCase();
  const useCases = [];

  for (const [useCase, keywords] of Object.entries(USE_CASE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        if (!useCases.includes(useCase)) {
          useCases.push(useCase);
        }
        break;
      }
    }
  }

  // If no use cases found, add a general one based on category
  if (useCases.length === 0) {
    useCases.push('medical-illustration');
  }

  return useCases;
}

/**
 * Process a single SVG file
 */
function processSVGFile(filename, svgContent) {
  const allIds = extractIdsFromSVG(svgContent);

  // Filter out generic IDs and keep meaningful ones
  const meaningfulIds = allIds.filter(id => !isGenericId(id));

  if (meaningfulIds.length === 0) {
    return null; // No meaningful names found
  }

  // Use the first meaningful ID as the primary name
  // (could be enhanced to pick the "best" one)
  const primaryName = cleanName(meaningfulIds[0]);
  const category = categorizeIcon(primaryName);
  const useCases = determineUseCases(primaryName);

  // Include all meaningful IDs as aliases
  const aliases = meaningfulIds.slice(1).map(cleanName);

  return {
    name: primaryName,
    category: category,
    useFor: useCases,
    aliases: aliases.length > 0 ? aliases : undefined,
    allLabels: meaningfulIds, // Keep original labels for reference
  };
}

/**
 * Main function to generate the catalog
 */
function generateCatalog() {
  console.log('Starting icon catalog generation...');
  console.log(`Scanning directory: ${ICON_DIR}`);

  const files = fs.readdirSync(ICON_DIR)
    .filter(f => f.endsWith('.svg'))
    .sort();

  console.log(`Found ${files.length} SVG files`);

  const catalog = {};
  let processedCount = 0;
  let skippedCount = 0;

  for (const filename of files) {
    const filePath = path.join(ICON_DIR, filename);
    const svgContent = fs.readFileSync(filePath, 'utf-8');

    const iconData = processSVGFile(filename, svgContent);

    if (iconData) {
      catalog[filename] = iconData;
      processedCount++;

      if (processedCount % 100 === 0) {
        console.log(`Processed ${processedCount} icons...`);
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\nCatalog generation complete!`);
  console.log(`- Total SVG files: ${files.length}`);
  console.log(`- Icons cataloged: ${processedCount}`);
  console.log(`- Icons skipped (no meaningful names): ${skippedCount}`);

  // Write catalog to file
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(catalog, null, 2),
    'utf-8'
  );

  console.log(`\nCatalog saved to: ${OUTPUT_FILE}`);

  // Generate statistics
  generateStatistics(catalog);

  return catalog;
}

/**
 * Generate statistics about the catalog
 */
function generateStatistics(catalog) {
  const stats = {
    totalIcons: Object.keys(catalog).length,
    categories: {},
    useCases: {},
  };

  for (const iconData of Object.values(catalog)) {
    // Count categories
    stats.categories[iconData.category] = (stats.categories[iconData.category] || 0) + 1;

    // Count use cases
    for (const useCase of iconData.useFor) {
      stats.useCases[useCase] = (stats.useCases[useCase] || 0) + 1;
    }
  }

  console.log('\n=== CATALOG STATISTICS ===');
  console.log(`\nTotal icons with meaningful names: ${stats.totalIcons}`);

  console.log('\nCategories:');
  Object.entries(stats.categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

  console.log('\nTop Use Cases:');
  Object.entries(stats.useCases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([useCase, count]) => {
      console.log(`  ${useCase}: ${count}`);
    });

  // Save stats to a separate file
  const statsFile = path.join(ICON_DIR, 'icon-catalog-stats.json');
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf-8');
  console.log(`\nStatistics saved to: ${statsFile}`);
}

// Run the script
try {
  generateCatalog();
} catch (error) {
  console.error('Error generating catalog:', error);
  process.exit(1);
}
