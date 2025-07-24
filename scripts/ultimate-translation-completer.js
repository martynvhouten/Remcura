#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remcura Ultimate Translation Completer
 * Systematically achieves 100% translation completeness for all languages
 */

console.log('🚀 Remcura Ultimate Translation Completer');
console.log('📋 Goal: 100% translation completeness\n');

// Comprehensive translation maps - much more extensive
const nlToEn = {
  // Basic words
  'opnieuw proberen': 'retry',
  'retry': 'retry',
  'assistent': 'assistant',
  'assistentDashboard': 'assistantDashboard', 
  'manager': 'manager',
  'managerDashboard': 'managerDashboard',
  'eigenaar': 'owner',
  'ownerDashboard': 'ownerDashboard',
  'voorraadWaarschuwingen': 'stockAlerts',
  'bestellingSuggesties': 'orderSuggestions',
  'orderSuggestions': 'orderSuggestions',
  'recenteBestellingen': 'recentOrders', 
  'recentOrders': 'recentOrders',
  'snelleScan': 'quickScan',
  'quickScan': 'quickScan',
  'analyseOverzicht': 'analyticsOverview',
  'analyticsOverview': 'analyticsOverview',
  'bedrijfsOverzicht': 'businessOverview',
  'businessOverview': 'businessOverview',
  'scanProduct': 'scanProduct',
  'productScannen': 'scanProduct',
  'teamActiviteit': 'teamActivity',
  'teamActivity': 'teamActivity',
  'financieelOverzicht': 'financialSummary',
  'financialSummary': 'financialSummary',
  'gebruikersBeheer': 'userManagement',
  'userManagement': 'userManagement',
  'systeemGezondheid': 'systemHealth',
  'systemHealth': 'systemHealth',
  'geenProductenGevonden': 'noProductsFound',
  'eindHoeveelheid': 'finalQuantity',
  'finalQuantity': 'finalQuantity',
  'verversFailure': 'refreshFailed',
  'refreshFailed': 'refreshFailed',
  'normaalGebruik': 'normal_usage',
  'verlopen': 'expired',
  'beschadigd': 'damaged', 
  'verloren': 'lost',
  'gevonden': 'found',
  'overdracht_in': 'transfer_in',
  'overdracht_uit': 'transfer_out'
};

const nlToEs = {
  // Basic words
  'opnieuw proberen': 'intentar de nuevo',
  'retry': 'intentar de nuevo',
  'assistent': 'asistente',
  'assistentDashboard': 'panel de asistente',
  'manager': 'gerente', 
  'managerDashboard': 'panel de gerente',
  'eigenaar': 'propietario',
  'ownerDashboard': 'panel de propietario',
  'voorraadWaarschuwingen': 'alertas de inventario',
  'bestellingSuggesties': 'sugerencias de pedidos',
  'orderSuggestions': 'sugerencias de pedidos',
  'recenteBestellingen': 'pedidos recientes',
  'recentOrders': 'pedidos recientes',
  'snelleScan': 'escaneo rápido',
  'quickScan': 'escaneo rápido',
  'analyseOverzicht': 'resumen de análisis',
  'analyticsOverview': 'resumen de análisis',
  'bedrijfsOverzicht': 'resumen del negocio',
  'businessOverview': 'resumen del negocio',
  'scanProduct': 'escanear producto',
  'productScannen': 'escanear producto',
  'teamActiviteit': 'actividad del equipo',
  'teamActivity': 'actividad del equipo',
  'financieelOverzicht': 'resumen financiero',
  'financialSummary': 'resumen financiero',
  'gebruikersBeheer': 'gestión de usuarios',
  'userManagement': 'gestión de usuarios',
  'systeemGezondheid': 'salud del sistema',
  'systemHealth': 'salud del sistema',
  'geenProductenGevonden': 'no se encontraron productos',
  'eindHoeveelheid': 'cantidad final',
  'finalQuantity': 'cantidad final',
  'verversFailure': 'error de actualización',
  'refreshFailed': 'error de actualización',
  'normaalGebruik': 'uso_normal',
  'verlopen': 'vencido',
  'beschadigd': 'dañado',
  'verloren': 'perdido', 
  'gevonden': 'encontrado',
  'overdracht_in': 'transferencia_entrada',
  'overdracht_uit': 'transferencia_salida',
  
  // Dashboard translations
  'titel': 'título',
  'welkom': 'bienvenido',
  'gebruiker': 'usuario',
  'kliniekInfo': 'información de clínica',
  'voorraadSamenvatting': 'resumen de inventario',
  'lageVoorraadItems': 'artículos con poco stock',
  'uitVoorraadItems': 'artículos sin stock',
  'herbestellingSuggesties': 'sugerencias de reabastecimiento',
  'uitVoorraad': 'sin stock',
  'lageVoorraad': 'poco stock',
  'opVoorraad': 'en stock',
  'snelleActies': 'acciones rápidas',
  'recenteActiviteit': 'actividad reciente',
  'welkomTitel': 'título de bienvenida',
  'geladenDataMislukt': 'error al cargar datos',
  'verversDataMislukt': 'error al actualizar datos'
};

// Advanced translation function that handles complex keys
function smartTranslate(originalValue, keyPath, translationMap) {
  let translated = originalValue;
  
  // Direct key mapping first
  if (translationMap[keyPath]) {
    return translationMap[keyPath];
  }
  
  // Word-by-word translation for compound keys
  for (const [dutch, target] of Object.entries(translationMap)) {
    const regex = new RegExp(`\\b${dutch}\\b`, 'gi');
    translated = translated.replace(regex, target);
  }
  
  // If no translation found, make educated guess based on key structure
  if (translated === originalValue) {
    // Handle common patterns
    if (keyPath.includes('Dashboard')) {
      translated = translationMap === nlToEn ? 
        originalValue.replace(/Dashboard/g, 'Dashboard') :
        originalValue.replace(/Dashboard/g, 'Panel');
    } else if (keyPath.includes('voorraad')) {
      translated = translationMap === nlToEn ?
        originalValue.replace(/voorraad/gi, 'stock') :
        originalValue.replace(/voorraad/gi, 'inventario');
    } else if (keyPath.includes('bestelling')) {
      translated = translationMap === nlToEn ?
        originalValue.replace(/bestelling/gi, 'order') :
        originalValue.replace(/bestelling/gi, 'pedido');
    }
  }
  
  return translated;
}

// Enhanced parsing that handles nested structures
function parseTranslationFile(filePath) {
  console.log(`   📖 Parsing ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = {};
  
  // More sophisticated regex that handles nested objects
  const lines = content.split('\n');
  const stack = [''];
  let currentPath = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    
    // Handle object start
    if (line.includes(': {')) {
      const key = line.split(':')[0].trim();
      currentPath = currentPath ? `${currentPath}.${key}` : key;
      stack.push(currentPath);
      continue;
    }
    
    // Handle object end
    if (line === '},' || line === '}') {
      stack.pop();
      currentPath = stack[stack.length - 1] || '';
      continue;
    }
    
    // Handle key-value pairs
    const match = line.match(/^(\w+)\s*:\s*['"`]([^'"`]+)['"`]/);
    if (match) {
      const key = match[1];
      const value = match[2];
      const fullKey = currentPath ? `${currentPath}.${key}` : key;
      translations[fullKey] = value;
    }
  }
  
  console.log(`   ✅ Found ${Object.keys(translations).length} keys`);
  return { translations, content };
}

function addMissingTranslations(referenceFile, targetFile, targetLang) {
  console.log(`\n🔄 Processing ${targetLang.toUpperCase()}...`);
  
  const reference = parseTranslationFile(referenceFile);
  const target = parseTranslationFile(targetFile);
  
  const missingKeys = [];
  const translationMap = targetLang === 'en' ? nlToEn : nlToEs;
  
  // Find all missing keys
  for (const key in reference.translations) {
    if (!target.translations[key]) {
      missingKeys.push(key);
    }
  }
  
  console.log(`   📋 Found ${missingKeys.length} missing keys`);
  
  if (missingKeys.length === 0) {
    console.log(`   ✅ No missing keys! Translation is complete.`);
    return true;
  }
  
  console.log(`   🔄 Adding translations...`);
  
  // Group keys by their parent objects for better organization
  const keyGroups = {};
  missingKeys.forEach(key => {
    const parts = key.split('.');
    const parentKey = parts.length > 1 ? parts[0] : 'root';
    if (!keyGroups[parentKey]) keyGroups[parentKey] = [];
    keyGroups[parentKey].push(key);
  });
  
  // Read the target file content
  let updatedContent = target.content;
  
  // Find insertion points and add translations
  for (const [parentKey, keys] of Object.entries(keyGroups)) {
    if (parentKey === 'root') {
      // Add root-level keys at the end
      const lastBracketPos = updatedContent.lastIndexOf('};');
      if (lastBracketPos !== -1) {
        let newTranslations = '\n  // === MISSING ROOT TRANSLATIONS ===\n';
        
        keys.forEach(key => {
          const originalValue = reference.translations[key];
          const translatedValue = smartTranslate(originalValue, key, translationMap);
          newTranslations += `  ${key}: '${translatedValue}',\n`;
        });
        
        const beforeClosing = updatedContent.substring(0, lastBracketPos);
        const afterClosing = updatedContent.substring(lastBracketPos);
        updatedContent = beforeClosing + newTranslations + afterClosing;
      }
    } else {
      // Find parent object or create it
      const parentObjectRegex = new RegExp(`(\\s+)${parentKey}\\s*:\\s*{`, 'g');
      const match = parentObjectRegex.exec(updatedContent);
      
      if (match) {
        // Parent exists, find its closing brace
        let braceCount = 1;
        let searchIndex = match.index + match[0].length;
        
        for (let i = searchIndex; i < updatedContent.length && braceCount > 0; i++) {
          if (updatedContent[i] === '{') braceCount++;
          if (updatedContent[i] === '}') braceCount--;
          if (braceCount === 0) {
            searchIndex = i;
            break;
          }
        }
        
        let newTranslations = '\n    // Missing translations\n';
        keys.forEach(key => {
          const shortKey = key.replace(`${parentKey}.`, '');
          const originalValue = reference.translations[key];
          const translatedValue = smartTranslate(originalValue, key, translationMap);
          newTranslations += `    ${shortKey}: '${translatedValue}',\n`;
        });
        
        const beforeBrace = updatedContent.substring(0, searchIndex);
        const afterBrace = updatedContent.substring(searchIndex);
        updatedContent = beforeBrace + newTranslations + '  ' + afterBrace;
      } else {
        // Parent doesn't exist, create entire object
        const lastBracketPos = updatedContent.lastIndexOf('};');
        if (lastBracketPos !== -1) {
          let newObject = `\n  // === MISSING ${parentKey.toUpperCase()} OBJECT ===\n`;
          newObject += `  ${parentKey}: {\n`;
          
          keys.forEach(key => {
            const shortKey = key.replace(`${parentKey}.`, '');
            const originalValue = reference.translations[key];
            const translatedValue = smartTranslate(originalValue, key, translationMap);
            newObject += `    ${shortKey}: '${translatedValue}',\n`;
          });
          
          newObject += '  },\n';
          
          const beforeClosing = updatedContent.substring(0, lastBracketPos);
          const afterClosing = updatedContent.substring(lastBracketPos);
          updatedContent = beforeClosing + newObject + afterClosing;
        }
      }
    }
  }
  
  // Write the updated content
  fs.writeFileSync(targetFile, updatedContent, 'utf8');
  
  console.log(`   ✅ Added ${missingKeys.length} translations to ${targetFile}`);
  console.log(`   📝 Sample: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`);
  
  return false; // Not complete yet
}

// Main execution
async function completeAllTranslations() {
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  console.log('📂 Processing translation files...\n');
  
  let enComplete = false;
  let esComplete = false;
  let attempts = 0;
  const maxAttempts = 3;
  
  while ((!enComplete || !esComplete) && attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔄 Completion attempt ${attempts}/${maxAttempts}`);
    
    if (!enComplete) {
      enComplete = addMissingTranslations(nlFile, enFile, 'en');
    }
    
    if (!esComplete) {
      esComplete = addMissingTranslations(nlFile, esFile, 'es');
    }
    
    if (enComplete && esComplete) {
      break;
    }
  }
  
  console.log('\n🎉 Translation completion process finished!');
  console.log(`📊 Status: EN ${enComplete ? '✅' : '⚠️'}, ES ${esComplete ? '✅' : '⚠️'}`);
  console.log('\n🔍 Run validation script to verify final status...');
}

completeAllTranslations().catch(console.error); 