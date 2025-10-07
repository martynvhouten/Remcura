#!/usr/bin/env node

/**
 * Translation Validation Script voor Remcura
 * Controleert consistentie tussen alle taalbestanden
 */

const fs = require('fs');
const path = require('path');

// Taal configuratie (voor nu alleen Nederlands)
const LANGUAGES = ['nl'];
const I18N_DIR = path.join(__dirname, '../src/i18n');

/**
 * Haalt alle keys uit een object recursief
 */
function extractKeys(obj, prefix = '') {
  const keys = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys.push(...extractKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys;
}

/**
 * Laadt vertaalbestand
 */
function loadTranslationFile(lang) {
  const filePath = path.join(I18N_DIR, lang, 'index.ts');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Bestand niet gevonden: ${filePath}`);
    return null;
  }

  try {
    // Load filters first if they exist
    let filters = {};
    const filtersPath = path.join(I18N_DIR, lang, 'filters.ts');
    if (fs.existsSync(filtersPath)) {
      try {
        const filtersContent = fs.readFileSync(filtersPath, 'utf8');
        const filtersMatch = filtersContent.match(
          /export default\s*({[\s\S]*});?\s*$/
        );
        if (filtersMatch) {
          filters = eval(`(${filtersMatch[1]})`);
        }
      } catch (filtersError) {
        console.warn(
          `⚠️ Kon filters niet laden voor ${lang}:`,
          filtersError.message
        );
      }
    }

    // Dynamically import en eval de TS export
    const content = fs.readFileSync(filePath, 'utf8');
    const exportMatch = content.match(/export default\s*({[\s\S]*});?\s*$/);

    if (!exportMatch) {
      console.error(`❌ Kan export niet vinden in ${filePath}`);
      return null;
    }

    // Eval is not ideal but for this script it works
    // Make filters available in eval context
    const translations = eval(`(${exportMatch[1]})`);
    return translations;
  } catch (error) {
    console.error(`❌ Fout bij laden van ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Valideert vertalingen
 */
function validateTranslations() {
  console.log('🔍 Remcura Vertaling Validator\n');

  const languageData = {};
  const allKeys = new Set();

  // Laad alle taalbestanden
  for (const lang of LANGUAGES) {
    console.log(`📂 Laden ${lang.toUpperCase()}...`);
    const translations = loadTranslationFile(lang);

    if (translations) {
      languageData[lang] = translations;
      const keys = extractKeys(translations);
      keys.forEach(key => allKeys.add(key));
      console.log(`   ✅ ${keys.length} keys gevonden`);
    } else {
      console.log(`   ❌ Laden mislukt`);
    }
  }

  console.log(`\n📊 Totaal unieke keys: ${allKeys.size}\n`);

  // Controleer missende keys per taal
  const missingKeys = {};

  for (const lang of LANGUAGES) {
    if (!languageData[lang]) continue;

    const langKeys = new Set(extractKeys(languageData[lang]));
    const missing = Array.from(allKeys).filter(key => !langKeys.has(key));

    missingKeys[lang] = missing;

    console.log(`🔍 ${lang.toUpperCase()} Analyse:`);
    console.log(`   📋 Keys aanwezig: ${langKeys.size}`);
    console.log(`   ❌ Keys ontbrekend: ${missing.length}`);

    if (missing.length > 0) {
      console.log(`   🚨 Eerste 10 ontbrekende keys:`);
      missing.slice(0, 10).forEach(key => {
        console.log(`      - ${key}`);
      });
      if (missing.length > 10) {
        console.log(`      ... en ${missing.length - 10} meer`);
      }
    }
    console.log('');
  }

  // Zoek naar duplicaten binnen bestanden
  console.log('🔄 Controleren op duplicaten...\n');

  for (const lang of LANGUAGES) {
    if (!languageData[lang]) continue;

    const filePath = path.join(I18N_DIR, lang, 'index.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    // Vind propertynames die meerdere keren voorkomen
    const propertyMatches = content.match(/^\s*(\w+):\s/gm);
    if (propertyMatches) {
      const properties = propertyMatches.map(match => match.match(/(\w+):/)[1]);
      const counts = {};

      properties.forEach(prop => {
        counts[prop] = (counts[prop] || 0) + 1;
      });

      const duplicates = Object.entries(counts).filter(
        ([_, count]) => count > 1
      );

      if (duplicates.length > 0) {
        console.log(`⚠️ ${lang.toUpperCase()} heeft duplicaten:`);
        duplicates.forEach(([prop, count]) => {
          console.log(`   - "${prop}" komt ${count} keer voor`);
        });
      } else {
        console.log(`✅ ${lang.toUpperCase()} heeft geen duplicaten`);
      }
    }
  }

  // Genereer rapport
  console.log('\n📋 SAMENVATTING:');
  console.log('================');

  const totalMissing = Object.values(missingKeys).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  if (totalMissing === 0) {
    console.log('🎉 Alle vertalingen zijn compleet!');
  } else {
    console.log(`❌ ${totalMissing} missende vertalingen gevonden`);
    console.log('\n🛠️ AANBEVELINGEN:');

    for (const [lang, missing] of Object.entries(missingKeys)) {
      if (missing.length > 0) {
        console.log(`\n${lang.toUpperCase()}:`);
        console.log(`- Voeg ${missing.length} ontbrekende keys toe`);
        console.log(`- Meest kritieke: ${missing.slice(0, 3).join(', ')}`);
      }
    }
  }

  return {
    allKeys: Array.from(allKeys),
    missingKeys,
    languageData,
    isValid: totalMissing === 0,
  };
}

// Run validatie
if (require.main === module) {
  validateTranslations();
}

module.exports = { validateTranslations };
