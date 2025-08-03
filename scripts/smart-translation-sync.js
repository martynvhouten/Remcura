#!/usr/bin/env node

/**
 * 🧠 SMART TRANSLATION SYNCHRONIZER
 * 
 * Strategy: Instead of adding random keys, focus on STRUCTURAL completeness
 * 1. Add only missing NAMESPACES (not individual keys)
 * 2. Use English structure as reference
 * 3. Avoid duplicates by checking existing structure
 */

const fs = require('fs');

console.log('🧠 SMART TRANSLATION SYNCHRONIZER');
console.log('==================================');

// Critical missing namespaces that exist in EN but not in NL
const missingNamespaces = {
  // Based on EN structure vs NL analysis
  locations: {
    title: 'Locaties',
    manage: 'Beheer locaties',
    allLocations: 'Alle locaties', 
    mainLocations: 'Hoofdlocaties',
    add: 'Locatie toevoegen',
    noLocations: 'Geen locaties gevonden'
  }
};

// Add missing namespaces to Dutch (SAFE approach)
function addMissingNamespaces() {
  console.log('📝 Adding only missing namespaces to Dutch...');
  
  const nlFile = 'src/i18n/nl/index.ts';
  let content = fs.readFileSync(nlFile, 'utf8');
  
  // Check if locations namespace already exists
  if (content.includes('locations:')) {
    console.log('⚠️  locations namespace already exists, skipping...');
    return;
  }
  
  // Find the end of the export object
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    throw new Error('Could not find end of export object');
  }
  
  // Generate locations namespace
  const locationsNamespace = `
  // === 🏢 LOCATIONS NAMESPACE ===
  locations: {
    title: 'Locaties',
    manage: 'Beheer locaties',
    allLocations: 'Alle locaties', 
    mainLocations: 'Hoofdlocaties',
    add: 'Locatie toevoegen',
    noLocations: 'Geen locaties gevonden'
  }`;
  
  // Insert before closing
  const before = content.substring(0, lastBraceIndex);
  const after = content.substring(lastBraceIndex);
  
  const newContent = before + locationsNamespace + '\n\n' + after;
  
  // Write back
  fs.writeFileSync(nlFile, newContent, 'utf8');
  
  console.log('✅ Added locations namespace to Dutch');
}

// Check what namespaces exist in EN but not in NL
function analyzeNamespaceGaps() {
  console.log('🔍 Analyzing namespace gaps...');
  
  const enFile = 'src/i18n/en/index.ts';
  const nlFile = 'src/i18n/nl/index.ts';
  
  const enContent = fs.readFileSync(enFile, 'utf8');
  const nlContent = fs.readFileSync(nlFile, 'utf8');
  
  // Extract top-level namespaces using regex
  const namespaceRegex = /^\s*([a-zA-Z][a-zA-Z0-9]*)\s*:\s*{/gm;
  
  const enNamespaces = new Set();
  const nlNamespaces = new Set();
  
  let match;
  while ((match = namespaceRegex.exec(enContent)) !== null) {
    enNamespaces.add(match[1]);
  }
  
  while ((match = namespaceRegex.exec(nlContent)) !== null) {
    nlNamespaces.add(match[1]);
  }
  
  const missing = [...enNamespaces].filter(ns => !nlNamespaces.has(ns));
  
  console.log(`📊 EN namespaces: ${enNamespaces.size}`);
  console.log(`📊 NL namespaces: ${nlNamespaces.size}`);
  console.log(`🚨 Missing in NL: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('📝 Missing namespaces:', missing.slice(0, 10));
  }
  
  return { enNamespaces, nlNamespaces, missing };
}

// Run analysis and sync
async function run() {
  try {
    const analysis = analyzeNamespaceGaps();
    
    if (analysis.missing.length > 0) {
      addMissingNamespaces();
    } else {
      console.log('✅ All critical namespaces present');
    }
    
    console.log('🎉 Smart sync complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

run();