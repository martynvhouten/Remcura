#!/usr/bin/env node

/**
 * Hardcoded Text Detector & Auto-fixer voor Remcura
 * Vindt hardcoded teksten die vertalingen zouden moeten zijn
 * Kan automatisch keys genereren en $t() replacements uitvoeren
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuratie
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/*.test.*',
  '**/*.spec.*',
];

// Regexes voor verschillende hardcoded text patronen
const PATTERNS = {
  // HTML template strings
  htmlText: /"[A-Z][^"]*[a-z][^"]*"/g,
  
  // Template literals met tekst
  templateLiterals: /`[^`]*[A-Z][^`]*[a-z][^`]*`/g,
  
  // Console logs met tekst
  consoleLogs: /console\.(log|error|warn|info)\s*\(\s*["'`][^"'`]*[A-Z][^"'`]*[a-z][^"'`]*["'`]/g,
  
  // Alert/confirm messages
  alerts: /(alert|confirm|prompt)\s*\(\s*["'`][^"'`]*[A-Z][^"'`]*[a-z][^"'`]*["'`]/g,
  
  // Quasar notify messages zonder $t()
  notifyMessages: /\$q\.notify\s*\(\s*{[^}]*message:\s*["'`][^"'`]*[A-Z][^"'`]*[a-z][^"'`]*["'`]/g,
  
  // Error messages
  errorMessages: /(throw\s+new\s+Error|Error\s*\()\s*["'`][^"'`]*[A-Z][^"'`]*[a-z][^"'`]*["'`]/g,
  
  // Vue template tekst zonder $t()
  vueTemplate: />[\s]*[A-Z][^<]*[a-z][^<]*<\//g,
};

// Whitelisted patterns die we willen negeren
const WHITELIST = [
  /^"[A-Z]{2,}"$/, // All caps (bijv. "USD", "EUR")
  /^"[A-Z]{1}[A-Z0-9_-]*"$/, // Constants (bijv. "API_KEY")
  /^"[a-z]+:[^"]*"$/, // CSS/style properties
  /^"#[0-9a-fA-F]{3,6}"$/, // Hex colors
  /^"[0-9]+(\.[0-9]+)?(px|em|rem|vh|vw|%)"$/, // CSS units
  /^"[0-9-T:.]+(Z|[+-][0-9]{2}:[0-9]{2})"$/, // ISO dates
  /^"(GET|POST|PUT|DELETE|PATCH)"$/, // HTTP methods
  /^"(success|error|warning|info|positive|negative)"$/, // Quasar types
  /^"(primary|secondary|accent|dark|positive|negative|info|warning)"$/, // Quasar colors
  /^"(left|right|center|top|bottom)"$/, // Alignment
  /^"[a-z_]+\(\)"$/, // Function calls
  /^"[a-z_]+":\s/, // Object keys
];

/**
 * Controleert of een string genegeerd moet worden
 */
function shouldIgnore(text) {
  // Te kort of te lang
  if (text.length < 5 || text.length > 200) return true;
  
  // Alleen nummers/speciale tekens
  if (!/[a-zA-Z]/.test(text)) return true;
  
  // Whitelisted patterns
  return WHITELIST.some(pattern => pattern.test(text));
}

/**
 * Extraheert potentiele hardcoded teksten uit bestand
 */
function extractHardcodedText(filePath, content) {
  const results = [];
  
  for (const [patternName, pattern] of Object.entries(PATTERNS)) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const textMatch = fullMatch.match(/["'`]([^"'`]+)["'`]/);
      
      if (textMatch) {
        const text = textMatch[1];
        
        if (!shouldIgnore(text)) {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          const context = lines[lines.length - 1] + content.substring(match.index).split('\n')[0];
          
          results.push({
            file: filePath,
            line: lineNumber,
            pattern: patternName,
            text: text,
            fullMatch: fullMatch,
            context: context.trim(),
          });
        }
      }
    }
  }
  
  return results;
}

/**
 * Scant een bestand voor hardcoded text
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip als bestand al veel $t( bevat (waarschijnlijk al gelocaliseerd)
    const translationCount = (content.match(/\$t\(/g) || []).length;
    const totalLines = content.split('\n').length;
    
    if (translationCount > totalLines * 0.1) {
      return []; // Waarschijnlijk al goed gelocaliseerd
    }
    
    return extractHardcodedText(filePath, content);
  } catch (error) {
    console.error(`❌ Fout bij lezen ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Scant alle bestanden
 */
function scanAllFiles() {
  console.log('🔍 Remcura Hardcoded Text Detector\n');
  
  // Vind alle Vue, TS, en JS bestanden
  const filePatterns = [
    `${SRC_DIR}/**/*.vue`,
    `${SRC_DIR}/**/*.ts`,
    `${SRC_DIR}/**/*.js`,
  ];
  
  let allFiles = [];
  
  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      ignore: EXCLUDE_PATTERNS.map(p => path.join(SRC_DIR, p))
    });
    allFiles = allFiles.concat(files);
  });
  
  console.log(`📂 Scannen van ${allFiles.length} bestanden...\n`);
  
  const allResults = [];
  let scannedFiles = 0;
  
  allFiles.forEach(filePath => {
    const results = scanFile(filePath);
    allResults.push(...results);
    scannedFiles++;
    
    if (scannedFiles % 20 === 0) {
      console.log(`   📄 ${scannedFiles}/${allFiles.length} bestanden gescand...`);
    }
  });
  
  console.log(`✅ Scan voltooid: ${allResults.length} potentiele hardcoded teksten gevonden\n`);
  
  // Groepeer resultaten
  const byFile = {};
  const byPattern = {};
  
  allResults.forEach(result => {
    // Groepeer per bestand
    if (!byFile[result.file]) byFile[result.file] = [];
    byFile[result.file].push(result);
    
    // Groepeer per patroon
    if (!byPattern[result.pattern]) byPattern[result.pattern] = [];
    byPattern[result.pattern].push(result);
  });
  
  // Toon resultaten
  console.log('📊 RESULTATEN PER PATROON:');
  console.log('===========================');
  
  Object.entries(byPattern).forEach(([pattern, results]) => {
    console.log(`\n🔍 ${pattern}: ${results.length} gevonden`);
    
    // Toon eerste paar voorbeelden
    results.slice(0, 3).forEach(result => {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`   📄 ${relativePath}:${result.line}`);
      console.log(`      💬 "${result.text}"`);
      console.log(`      📝 ${result.context.substring(0, 80)}...`);
    });
    
    if (results.length > 3) {
      console.log(`      ... en ${results.length - 3} meer`);
    }
  });
  
  console.log('\n📊 TOP BESTANDEN MET HARDCODED TEXT:');
  console.log('====================================');
  
  const sortedFiles = Object.entries(byFile)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 10);
  
  sortedFiles.forEach(([file, results], index) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${relativePath} (${results.length} items)`);
  });
  
  // Prioriteiten
  console.log('\n🎯 PRIORITEITEN:');
  console.log('================');
  
  const highPriority = allResults.filter(r => 
    r.pattern === 'notifyMessages' || 
    r.pattern === 'errorMessages' || 
    r.pattern === 'vueTemplate'
  );
  
  console.log(`🔥 Hoge prioriteit: ${highPriority.length} items`);
  console.log('   - User-facing berichten die direct zichtbaar zijn');
  
  const mediumPriority = allResults.filter(r => 
    r.pattern === 'htmlText' || 
    r.pattern === 'alerts'
  );
  
  console.log(`⚠️ Gemiddelde prioriteit: ${mediumPriority.length} items`);
  console.log('   - Interface teksten en dialogen');
  
  const lowPriority = allResults.filter(r => 
    r.pattern === 'consoleLogs' || 
    r.pattern === 'templateLiterals'
  );
  
  console.log(`ℹ️ Lage prioriteit: ${lowPriority.length} items`);
  console.log('   - Debug berichten en interne teksten');
  
  return {
    total: allResults.length,
    byFile,
    byPattern,
    highPriority,
    mediumPriority,
    lowPriority,
  };
}

/**
 * Genereert een translation key van een tekst
 */
function generateKey(text, context = '') {
  // Maak een key gebaseerd op de tekst en context
  let key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Verwijder speciale tekens
    .replace(/\s+/g, ' ') // Normaliseer spaties
    .trim()
    .split(' ')
    .slice(0, 4) // Max 4 woorden
    .join('');
  
  // Voeg context toe als beschikbaar
  if (context) {
    const contextKey = context
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10);
    key = `${contextKey}.${key}`;
  }
  
  // Zorg dat key niet te lang is
  if (key.length > 40) {
    key = key.substring(0, 40);
  }
  
  return key;
}

/**
 * Helper to set a nested property in an object
 * @param {object} obj - The object to modify
 * @param {string} path - The dot-separated path to the property
 * @param {string} value - The value to set
 */
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      current[part] = value;
    } else {
      if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
        current[part] = {};
      }
      current = current[part];
    }
  }
}

/**
 * Helper to convert a JavaScript object to a formatted TypeScript string for translation files.
 * Handles nested objects and ensures proper indentation and quoting.
 * @param {object} obj - The object to convert.
 * @param {number} indentLevel - Current indentation level.
 * @returns {string} The formatted string.
 */
function formatObjectToTsString(obj, indentLevel = 0) {
  const currentIndent = '  '.repeat(indentLevel);
  const nextIndent = '  '.repeat(indentLevel + 1);
  let lines = [];
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];
    const isLast = (i === keys.length - 1);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object
      lines.push(`${nextIndent}${key}: ${formatObjectToTsString(value, indentLevel + 1).trim()}${isLast ? '' : ','}`);
    } else {
      // Primitive value
      lines.push(`${nextIndent}${key}: '${String(value).replace(/'/g, "\\'")}'${isLast ? '' : ','}`);
    }
  }
  return `{\n${lines.join('\n')}\n${currentIndent}}`;
}

/**
 * Voegt een key toe aan het Nederlandse vertaalbestand
 * @param {string} key - De dot-separated key (e.g., 'common.save', 'newFeature.title')
 * @param {string} text - De vertaalde tekst
 * @returns {boolean} True if added, false otherwise
 */
function addKeyToTranslations(key, text) {
  const nlFile = path.join(__dirname, '../src/i18n/nl/index.ts');
  
  try {
    let content = fs.readFileSync(nlFile, 'utf8');
    
    // Extract the current export default object content
    const exportMatch = content.match(/export default\s*({[\s\S]*?});?\s*$/);
    if (!exportMatch) {
      console.error(`❌ Kan 'export default {}' blok niet vinden in ${nlFile}`);
      return false;
    }
    
    const existingObjectString = exportMatch[1];
    const preExportContent = content.substring(0, exportMatch.index);
    const postExportContent = content.substring(exportMatch.index + exportMatch[0].length);

    // Use eval to parse the existing object. This is risky but necessary given the current script architecture.
    let currentTranslations;
    try {
      // Temporarily wrap in parentheses to make it a valid expression for eval
      currentTranslations = eval(`(${existingObjectString})`);
    } catch (evalError) {
      console.error(`❌ Fout bij evalueren van bestaande vertalingen in ${nlFile}:`, evalError.message);
      console.error(`   Controleer de syntax van het bestand: ${nlFile}`);
      return false;
    }

    // Check if key already exists to avoid duplicates
    // This requires a proper way to check nested keys, which extractKeys does
    const allExistingKeys = new Set(extractKeys(currentTranslations));
    if (allExistingKeys.has(key)) {
        // console.log(`   ⚠️ Key '${key}' bestaat al, overslaan.`); // Suppress this for cleaner output during autofix
        return false; // Key already exists
    }

    // Add the new key using the helper
    setNestedProperty(currentTranslations, key, text);

    // Format the updated object back to a string
    // Start with indentLevel 0 for the root object, then add 2 spaces for the 'export default ' part
    const newObjectString = formatObjectToTsString(currentTranslations, 0); 

    // Reconstruct the file content
    // The `export default ` part needs to be handled carefully to maintain original formatting
    const finalContent = `${preExportContent}export default ${newObjectString};${postExportContent}`;
    
    fs.writeFileSync(nlFile, finalContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Fout bij toevoegen van key '${key}' aan ${nlFile}:`, error.message);
    return false;
  }
}

/**
 * Vervangt hardcoded tekst met $t() call
 */
function replaceWithTranslation(filePath, match, key) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verschillende replacement patronen afhankelijk van context
    let replacement;
    
    if (match.fullMatch.includes('$q.notify')) {
      // Quasar notify replacement
      replacement = match.fullMatch.replace(
        /message:\s*["'`][^"'`]*["'`]/,
        `message: $t('${key}')`
      );
    } else if (match.context.includes('<template>') || match.context.includes('{{')) {
      // Vue template replacement
      replacement = `{{ $t('${key}') }}`;
    } else if (match.fullMatch.startsWith('"') || match.fullMatch.startsWith("'")) {
      // Simple string replacement
      replacement = `$t('${key}')`;
    } else {
      // Default replacement
      replacement = match.fullMatch.replace(
        /["'`][^"'`]*["'`]/,
        `$t('${key}')`
      );
    }
    
    content = content.replace(match.fullMatch, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`❌ Fout bij vervangen in ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Automatische mode: vindt hardcoded tekst en voegt automatisch keys toe
 */
function autoFixHardcodedText(dryRun = true) {
  console.log(`🔧 Auto-fix modus ${dryRun ? '(DRY RUN)' : '(LIVE)'}\n`);
  
  const results = scanAllFiles();
  
  if (results.highPriority.length === 0) {
    console.log('✅ Geen high-priority hardcoded tekst gevonden!');
    return;
  }
  
  console.log(`🎯 Verwerken van ${results.highPriority.length} high-priority items...\n`);
  
  let processed = 0;
  let successful = 0;
  
  results.highPriority.forEach(result => {
    processed++;
    
    // Genereer key
    const contextHint = path.basename(result.file, path.extname(result.file));
    const key = generateKey(result.text, contextHint);
    
    console.log(`📝 [${processed}/${results.highPriority.length}] ${result.file}:${result.line}`);
    console.log(`   💬 "${result.text}"`);
    console.log(`   🔑 Generated key: ${key}`);
    
    if (!dryRun) {
      // Voeg key toe aan vertalingen
      if (addKeyToTranslations(key, result.text)) {
        console.log(`   ✅ Key toegevoegd aan NL vertalingen`);
        
        // Vervang in bronbestand
        if (replaceWithTranslation(result.file, result, key)) {
          console.log(`   ✅ Vervangen met $t() call`);
          successful++;
        } else {
          console.log(`   ❌ Vervanging mislukt`);
        }
      } else {
        console.log(`   ❌ Key toevoegen mislukt`);
      }
    } else {
      console.log(`   💡 Would add key and replace (dry run)`);
    }
    
    console.log('');
  });
  
  if (dryRun) {
    console.log(`\n📊 DRY RUN SAMENVATTING:`);
    console.log(`   ${processed} items zouden verwerkt worden`);
    console.log(`\n💡 Run met '--fix' om daadwerkelijk aan te passen`);
  } else {
    console.log(`\n📊 SAMENVATTING:`);
    console.log(`   ${processed} items verwerkt`);
    console.log(`   ${successful} succesvol vervangen`);
    console.log(`\n🎉 Auto-fix voltooid! Run de validatie tools om resultaat te controleren.`);
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
const mode = args[0];

// Run scan
if (require.main === module) {
  // Check if glob is available
  try {
    require('glob');
  } catch (error) {
    console.error('❌ glob package is vereist. Installeer met: npm install glob');
    process.exit(1);
  }
  
  if (mode === '--fix') {
    autoFixHardcodedText(false);
  } else if (mode === '--dry-run') {
    autoFixHardcodedText(true);
  } else if (mode === '--help') {
    console.log(`
🔧 Remcura Hardcoded Text Detector & Auto-fixer

📋 GEBRUIK:
  node scripts/find-hardcoded-text.js [mode]

🎯 MODES:
  (geen)      Scan en rapporteer hardcoded tekst
  --dry-run   Toon wat er aangepast zou worden
  --fix       Voer automatische replacements uit
  --help      Toon deze help

⚠️  WAARSCHUWING:
  --fix mode wijzigt bestanden! Maak eerst een backup.
    `);
  } else {
    scanAllFiles();
  }
}

module.exports = { scanAllFiles, autoFixHardcodedText }; 