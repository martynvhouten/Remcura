#!/usr/bin/env node

/**
 * Hardcoded Text Detector voor Remcura
 * Vindt hardcoded teksten die vertalingen zouden moeten zijn
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

// Run scan
if (require.main === module) {
  // Check if glob is available
  try {
    require('glob');
  } catch (error) {
    console.error('❌ glob package is vereist. Installeer met: npm install glob');
    process.exit(1);
  }
  
  scanAllFiles();
}

module.exports = { scanAllFiles }; 