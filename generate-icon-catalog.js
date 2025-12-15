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
  /^BG(_\d+)?$/i,
  /^FG(_\d+)?$/i,
  /^Layer(_\d+)?$/i,
  /^Shape(_\d+)?$/i,
  /^Clip(_\d+)?$/i,
  /^Mask(_\d+)?$/i,
  /^LEFT[\s_]CORNER$/i,
  /^RIGHT[\s_]CORNER$/i,
  /^CORNER(_\d+)?$/i,
  /^R-ICO-\d+$/i, // File ID itself
  /^paint\d+/i,  // Gradient IDs
  /^path-\d+/i,  // Generic path IDs
  /^g\d+$/i,     // Generic group IDs
  /^defs$/i,
  /^mask\d+/i,   // Mask IDs
  /^clip\d+/i,   // Clip path IDs
  /^Union$/i,    // Generic union shapes
  /^centre$/i,   // Generic labels
  /^Chemical$/i, // Too generic alone
  /^Ch$/i,       // Too generic
  /^GRID$/i,
  /^TEXTURE$/i,
  /^OUTLINE$/i,
  /^LOGO(_\d+)?$/i,
  /^ICON$/i,
  /^\d+\]?$/,    // Just numbers or numbers with bracket
  /^PLATELET(_\d+)?$/i,
  /^STRIPES(_\d+)?$/i,
  /^SECTION\s+BG$/i,
  /^BG\s+OUTLINE$/i,
];

// Improved category classification with more specific patterns
// Order matters - more specific categories first!
const CATEGORY_KEYWORDS = {
  // Very specific categories first
  'receptor': [
    'receptor',
    'scavenger receptor',
    'olfactory receptor',
    'adrenergic receptor',
    'cholinergic receptor',
    'dopamine receptor',
    'serotonin receptor',
    'gaba receptor',
    'glutamate receptor',
    'nicotinic receptor',
    'muscarinic receptor',
    'g protein-coupled',
    'gpcr'
  ],

  'ion-channel': [
    'ion channel',
    'sodium channel',
    'potassium channel',
    'calcium channel',
    'chloride channel',
    'voltage-gated',
    'ligand-gated',
    'aquaporin',
    'ion pump',
    'na+/k+ atpase',
    'proton pump'
  ],

  'pathogen': [
    'virus',
    'virion',
    'viral',
    'bacteria',
    'bacterial',
    'pathogen',
    'microbe',
    'fungus',
    'parasite'
  ],

  'immune': [
    'antibody',
    'immunoglobulin',
    'antigen',
    'complement',
    'cytokine',
    'interferon',
    'interleukin',
    'lymphocyte',
    'macrophage',
    't cell',
    'b cell',
    'mhc',
    'tcr',
    'bcr',
    'immune'
  ],

  'anatomy': [
    'organ',
    'heart',
    'lung',
    'liver',
    'kidney',
    'brain',
    'spleen',
    'pancreas',
    'stomach',
    'intestine',
    'vessel section',
    'blood vessel',
    'artery',
    'vein',
    'duct',
    'tissue section',
    'skin section',
    'nail',
    'bone',
    'muscle tissue',
    'epidermis',
    'dermis'
  ],

  'cell-type': [
    'neuron',
    'nerve cell',
    'erythrocyte',
    'leukocyte',
    'platelet',
    'dendrite',
    'axon',
    'myelin',
    'astrocyte',
    'oligodendrocyte',
    'microglia',
    'stem cell',
    'progenitor cell'
  ],

  'organelle': [
    'nucleus',
    'mitochondria',
    'mitochondrion',
    'ribosome',
    'endoplasmic reticulum',
    'golgi',
    'lysosome',
    'peroxisome',
    'vacuole',
    'chloroplast',
    'cytoplasm',
    'membrane',
    'cell membrane',
    'nuclear membrane',
    'peroxisomal membrane'
  ],

  'protein': [
    'actin',
    'myosin',
    'tubulin',
    'collagen',
    'keratin',
    'fibrin',
    'histone',
    'kinase',
    'phosphatase',
    'ligase',
    'polymerase',
    'helicase',
    'peptidase',
    'protease',
    'enzyme complex',
    'protein complex',
    'binding protein'
  ],

  'structure': [
    'complex',
    'apc/c',
    'ccr4-not',
    'gins complex',
    'destruction complex',
    'coiled-coil',
    'protein structure',
    'quaternary structure',
    'tertiary structure',
    'domain',
    'motif'
  ],

  'signal': [
    'signal cascade',
    'signaling pathway',
    'signal transduction',
    'second messenger',
    'kinase cascade',
    'phosphorylation cascade'
  ],

  'chemical': [
    'phosphatidyl',
    'phosphatidylinositol',
    'inositol phosphate',
    'glycerol',
    'fatty acid',
    'lipid',
    'steroid',
    'cholesterol',
    'carbohydrate',
    'glucose',
    'glycogen',
    'starch'
  ],

  'molecule': [
    'nucleotide',
    'adenosine',
    'guanosine',
    'cytidine',
    'thymidine',
    'atp',
    'adp',
    'amp',
    'gtp',
    'gdp',
    'nad',
    'nadh',
    'nadp',
    'fad',
    'coenzyme',
    'acetyl',
    'ribose',
    'diphosphate',
    'triphosphate',
    'tetrahydrobiopterin',
    'cation',
    'substrate',
    'product',
    'metabolite',
    'compound'
  ],

  'generic': []  // Default category
};

// Use case classification
const USE_CASE_KEYWORDS = {
  'neurological': ['neuron', 'brain', 'nerve', 'neural', 'synapse', 'neurotransmitter', 'dopamine', 'serotonin', 'gaba', 'myelin', 'axon', 'dendrite'],
  'cardiovascular': ['heart', 'cardiac', 'vessel', 'artery', 'vein', 'blood', 'circulation', 'vascular'],
  'respiratory': ['lung', 'alveoli', 'bronchi', 'respiratory', 'breathing', 'oxygen', 'gas exchange'],
  'immunology': ['immune', 'antibody', 'antigen', 'lymphocyte', 'macrophage', 'cytokine', 'inflammation', 'interferon', 'complement'],
  'endocrine': ['hormone', 'gland', 'insulin', 'glucagon', 'thyroid', 'adrenal', 'pituitary', 'endocrine'],
  'signal-transduction': ['signal', 'cascade', 'pathway', 'transduction', 'kinase', 'phosphorylation', 'second messenger'],
  'metabolism': ['metabolism', 'glycolysis', 'atp', 'substrate', 'catalysis', 'oxidation', 'reduction', 'krebs', 'citric acid'],
  'molecular-biology': ['dna', 'rna', 'nucleotide', 'gene', 'transcription', 'translation', 'replication', 'polymerase'],
  'pharmacology': ['drug', 'agonist', 'antagonist', 'inhibitor', 'blocker'],
  'anatomy': ['organ', 'tissue', 'bone', 'muscle', 'structure', 'anatomical', 'section', 'duct', 'vessel'],
  'cellular': ['cell', 'membrane', 'organelle', 'nucleus', 'mitochondria', 'cytoplasm', 'ribosome', 'peroxisome'],
  'receptor-binding': ['receptor', 'ligand', 'binding', 'affinity'],
  'ion-transport': ['ion', 'channel', 'pump', 'transporter', 'calcium', 'sodium', 'potassium', 'chloride'],
  'protein-synthesis': ['ribosome', 'translation', 'amino acid', 'peptide', 'protein synthesis'],
  'lipid-metabolism': ['phosphatidyl', 'lipid', 'fatty acid', 'cholesterol', 'membrane lipid'],
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
  // Decode HTML entities
  name = name.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

  // Replace underscores and multiple spaces with single space
  let cleaned = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  // Convert to lowercase for consistency
  cleaned = cleaned.toLowerCase();

  return cleaned;
}

/**
 * Determine category based on name keywords (order-sensitive)
 */
function categorizeIcon(name) {
  const lowerName = name.toLowerCase();

  // Check each category in order (most specific first)
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
  const primaryName = cleanName(meaningfulIds[0]);
  const category = categorizeIcon(primaryName);
  const useCases = determineUseCases(primaryName);

  // Include all meaningful IDs as aliases
  const aliases = meaningfulIds.slice(1).map(cleanName).filter(alias => alias !== primaryName);

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
