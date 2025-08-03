#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🌟 Remcura Translation Manager
 * 
 * De ultieme, all-in-one translation management tool voor Remcura
 * Combineert alle beste functionaliteiten in één geoptimaliseerde script
 * 
 * Features:
 * - Intelligente translation parsing
 * - Bulk translation completion  
 * - Critical key management
 * - Safe syntax handling
 * - Multi-language support (NL/EN/ES)
 * 
 * Usage:
 *   node scripts/remcura-translation-manager.js [mode]
 * 
 * Modes:
 *   --validate    Validate current translation status
 *   --complete    Complete all missing translations
 *   --critical    Add only critical missing translations
 *   --sync        Sync all languages with Dutch as master
 *   --cleanup     Remove unused keys from all languages
 *   --help        Show this help
 */

console.log('🌟 Remcura Translation Manager v2.0');
console.log('📋 Ultimate translation management for Remcura\n');

// Get command line arguments
const args = process.argv.slice(2);
const mode = args[0] || '--help';

// Ultra-comprehensive translation mappings
const masterTranslations = {
  en: {
    // Critical system translations
    'retry': 'Retry',
    'assistantDashboard': 'Assistant Dashboard',
    'managerDashboard': 'Manager Dashboard',
    'ownerDashboard': 'Owner Dashboard',
    'orderSuggestions': 'Order Suggestions',
    'recentOrders': 'Recent Orders',
    'quickScan': 'Quick Scan',
    'analyticsOverview': 'Analytics Overview',
    'businessOverview': 'Business Overview',
    'teamActivity': 'Team Activity',
    'financialSummary': 'Financial Summary',
    'userManagement': 'User Management',
    'systemHealth': 'System Health',
    'scanProduct': 'Scan Product',
    'costAnalysis': 'Cost Analysis',
    'supplierPerformance': 'Supplier Performance',
    'createOrder': 'Create Order',
    'noAlerts': 'No Alerts',
    
    // Inventory specific
    'inventory.tryDifferentSearchTerm': 'Try a different search term',
    'inventory.realTimeConnected': 'Real-time connected',
    'inventory.realTimeDisconnected': 'Real-time disconnected',
    'inventory.stockUpdatedMessage': 'Stock updated successfully',
    'inventory.adjustStockLevels': 'Adjust stock levels',
    'inventory.quickAmounts': 'Quick amounts',
    'inventory.reasonRequired': 'Reason is required',
    'inventory.quantityMustBePositive': 'Quantity must be positive',
    'inventory.completeRequiredFields': 'Complete all required fields',
    'inventory.selectProductFirst': 'Select a product first',
    'inventory.selectLocationFirst': 'Select a location first',
    'inventory.noLocationSelected': 'No location selected',
    'inventory.selectReason': 'Select a reason',
    'inventory.adjusting': 'Adjusting',
    'inventory.adjust': 'Adjust',
    'inventory.savingChanges': 'Saving changes',
    'inventory.current': 'Current',
    'inventory.errorProductNotFound': 'Product not found',
    'inventory.errorUpdateInProgress': 'Update in progress',
    'inventory.errorInvalidData': 'Invalid data provided',
    
    // Common patterns
    'dashboard': 'dashboard',
    'stock': 'stock',
    'inventory': 'inventory',
    'products': 'products',
    'orders': 'orders',
    'suppliers': 'suppliers',
    'analytics': 'analytics',
    'management': 'management',
    'overview': 'overview',
    'activity': 'activity',
    'summary': 'summary',
    'health': 'health',
    'analysis': 'analysis',
    'performance': 'performance',
    'alerts': 'alerts'
  },
  
  es: {
    // Critical system translations
    'retry': 'Intentar de nuevo',
    'assistantDashboard': 'Panel de Asistente',
    'managerDashboard': 'Panel de Gerente',
    'ownerDashboard': 'Panel de Propietario',
    'orderSuggestions': 'Sugerencias de Pedidos',
    'recentOrders': 'Pedidos Recientes',
    'quickScan': 'Escaneo Rápido',
    'analyticsOverview': 'Resumen de Análisis',
    'businessOverview': 'Resumen del Negocio',
    'teamActivity': 'Actividad del Equipo',
    'financialSummary': 'Resumen Financiero',
    'userManagement': 'Gestión de Usuarios',
    'systemHealth': 'Salud del Sistema',
    'scanProduct': 'Escanear Producto',
    'costAnalysis': 'Análisis de Costos',
    'supplierPerformance': 'Rendimiento de Proveedores',
    'createOrder': 'Crear Pedido',
    'noAlerts': 'Sin Alertas',
    
    // Dashboard section
    'dashboard.title': 'Título',
    'dashboard.welcome': 'Bienvenido',
    'dashboard.user': 'Usuario',
    'dashboard.clinicInfo': 'Información de Clínica',
    'dashboard.stockSummary': 'Resumen de Inventario',
    'dashboard.lowStockItems': 'Artículos con Poco Stock',
    'dashboard.outOfStockItems': 'Artículos Sin Stock',
    'dashboard.reorderSuggestions': 'Sugerencias de Reabastecimiento',
    'dashboard.outOfStock': 'Sin Stock',
    'dashboard.lowStock': 'Poco Stock',
    'dashboard.inStock': 'En Stock',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.welcomeTitle': 'Título de Bienvenida',
    'dashboard.failedToLoadData': 'Error al cargar datos',
    'dashboard.failedToRefreshData': 'Error al actualizar datos',
    'dashboard.noLowStock': 'Sin Stock Bajo',
    'dashboard.viewMore': 'Ver Más',
    'dashboard.manageStock': 'Gestionar Inventario',
    'dashboard.updateStockLevels': 'Actualizar Niveles de Stock',
    'dashboard.viewOrders': 'Ver Pedidos',
    'dashboard.manageOrders': 'Gestionar Pedidos',
    'dashboard.configureSystem': 'Configurar Sistema',
    'dashboard.dataRefreshed': 'Datos Actualizados',
    
    // Common patterns
    'dashboard': 'panel',
    'stock': 'inventario',
    'inventory': 'inventario',
    'products': 'productos',
    'orders': 'pedidos',
    'suppliers': 'proveedores',
    'analytics': 'análisis',
    'management': 'gestión',
    'overview': 'resumen',
    'activity': 'actividad',
    'summary': 'resumen',
    'health': 'salud',
    'analysis': 'análisis',
    'performance': 'rendimiento',
    'alerts': 'alertas'
  },
  
  nl: {
    // Critical system translations
    'retry': 'Opnieuw proberen',
    'assistantDashboard': 'Assistent Dashboard',
    'managerDashboard': 'Manager Dashboard',
    'ownerDashboard': 'Eigenaar Dashboard',
    'orderSuggestions': 'Bestelling Suggesties',
    'recentOrders': 'Recente Bestellingen',
    'quickScan': 'Snelle Scan',
    'analyticsOverview': 'Analyse Overzicht',
    'businessOverview': 'Bedrijfs Overzicht',
    'teamActivity': 'Team Activiteit',
    'financialSummary': 'Financieel Overzicht',
    'userManagement': 'Gebruikers Beheer',
    'systemHealth': 'Systeem Gezondheid',
    'scanProduct': 'Product Scannen',
    'costAnalysis': 'Kosten Analyse',
    'supplierPerformance': 'Leverancier Prestaties',
    'createOrder': 'Bestelling Maken',
    'noAlerts': 'Geen Waarschuwingen',
    
    // Essential missing keys
    'productsPage.noProductsFound': 'Geen producten gevonden',
    'inventory.finalQuantity': 'Eind hoeveelheid',
    'inventory.refreshFailed': 'Verversen mislukt',
    'inventory.reason.normal_usage': 'Normaal gebruik',
    'inventory.reason.expired': 'Verlopen',
    'inventory.reason.damaged': 'Beschadigd',
    'inventory.reason.lost': 'Verloren',
    'inventory.reason.found': 'Gevonden',
    'inventory.reason.transfer_in': 'Overdracht in',
    'inventory.reason.transfer_out': 'Overdracht uit',
    
    // Additional critical keys
    'updateStock': 'Voorraad bijwerken',
    'viewLowStock': 'Lage voorraad bekijken',
    'manageSuppliers': 'Leveranciers beheren',
    'approveOrders': 'Bestellingen goedkeuren',
    'exportReports': 'Rapporten exporteren',
    'manageUsers': 'Gebruikers beheren',
    'systemSettings': 'Systeem instellingen',
    'financialReports': 'Financiële rapporten',
    'backupData': 'Data backup',
    'allStockLevelsOk': 'Alle voorraadniveaus OK'
  }
};

// Advanced parser that handles all TypeScript translation structures
function parseTranslationFile(filePath) {
  console.log(`   📖 Deep parsing ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  
  // Multiple regex patterns for comprehensive key extraction
  const patterns = [
    /^\s*'([^']+)'\s*:\s*['"`]([^'"`]*?)['"`]/gm,
    /^\s*"([^"]+)"\s*:\s*['"`]([^'"`]*?)['"`]/gm,
    /^\s*(\w+(?:\.\w+)*)\s*:\s*['"`]([^'"`]*?)['"`]/gm,
    /^\s*(\w+)\s*:\s*{/gm
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && !['export', 'default'].includes(match[1])) {
        keys.add(match[1]);
      }
    }
  });
  
  // Advanced nested structure parsing
  const lines = content.split('\n');
  let currentPath = '';
  const pathStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes(': {')) {
      const key = line.split(':')[0].trim().replace(/['"]/g, '');
      if (key && !['export', 'default'].includes(key)) {
        currentPath = currentPath ? `${currentPath}.${key}` : key;
        pathStack.push(currentPath);
      }
    } else if (line === '},' || line === '}') {
      pathStack.pop();
      currentPath = pathStack[pathStack.length - 1] || '';
    } else if (line.includes(':') && (line.includes("'") || line.includes('"'))) {
      const keyMatch = line.match(/^\s*([^\s:]+)\s*:/);
      if (keyMatch) {
        const key = keyMatch[1].replace(/['"]/g, '');
        const fullKey = currentPath ? `${currentPath}.${key}` : key;
        keys.add(fullKey);
      }
    }
  }
  
  console.log(`   ✅ Found ${keys.size} unique keys`);
  return { keys: Array.from(keys), content };
}

// Intelligent translation with multiple fallback strategies
function intelligentTranslate(key, originalValue, lang) {
  const translations = masterTranslations[lang];
  
  // 1. Direct key match (highest priority)
  if (translations[key]) {
    return translations[key];
  }
  
  // 2. Check key components
  const keyParts = key.split('.');
  for (const part of keyParts) {
    if (translations[part]) {
      return translations[part];
    }
  }
  
  // 3. Pattern-based translation for originalValue
  let translated = originalValue;
  for (const [source, target] of Object.entries(translations)) {
    if (originalValue.toLowerCase().includes(source.toLowerCase())) {
      translated = originalValue.replace(new RegExp(source, 'gi'), target);
      break;
    }
  }
  
  // 4. Smart pattern replacement for specific languages
  if (translated === originalValue && lang === 'es') {
    translated = originalValue
      .replace(/Dashboard/gi, 'Panel')
      .replace(/Stock/gi, 'Inventario')
      .replace(/Order/gi, 'Pedido')
      .replace(/Product/gi, 'Producto')
      .replace(/User/gi, 'Usuario')
      .replace(/Management/gi, 'Gestión')
      .replace(/Overview/gi, 'Resumen')
      .replace(/Activity/gi, 'Actividad')
      .replace(/Summary/gi, 'Resumen')
      .replace(/Alert/gi, 'Alerta')
      .replace(/Analysis/gi, 'Análisis')
      .replace(/Health/gi, 'Salud')
      .replace(/Quick/gi, 'Rápido')
      .replace(/Recent/gi, 'Reciente')
      .replace(/Scan/gi, 'Escaneo');
  }
  
  return translated;
}

// Validation mode - check translation status
function validateTranslations() {
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  console.log('🔍 Validating translation status...\n');
  
  const nl = parseTranslationFile(nlFile);
  const en = parseTranslationFile(enFile);
  const es = parseTranslationFile(esFile);
  
  const allKeys = new Set([...nl.keys, ...en.keys, ...es.keys]);
  const totalKeys = allKeys.size;
  
  console.log(`📊 Total unique keys: ${totalKeys}\n`);
  
  ['nl', 'en', 'es'].forEach(lang => {
    const current = lang === 'nl' ? nl : lang === 'en' ? en : es;
    const missing = Array.from(allKeys).filter(key => !current.keys.includes(key));
    
    console.log(`🔍 ${lang.toUpperCase()} Analysis:`);
    console.log(`   📋 Keys present: ${current.keys.length}`);
    console.log(`   ❌ Keys missing: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log(`   🚨 Top 10 missing keys:`);
      missing.slice(0, 10).forEach(key => console.log(`      - ${key}`));
      if (missing.length > 10) {
        console.log(`      ... and ${missing.length - 10} more`);
      }
    } else {
      console.log(`   🎉 Perfect! All translations complete!`);
    }
    console.log('');
  });
  
  const totalMissing = 
    Array.from(allKeys).filter(key => !nl.keys.includes(key)).length +
    Array.from(allKeys).filter(key => !en.keys.includes(key)).length +
    Array.from(allKeys).filter(key => !es.keys.includes(key)).length;
  
  console.log(`📋 SUMMARY: ${totalMissing} missing translations found\n`);
  
  return { totalMissing, nl: nl.keys.length, en: en.keys.length, es: es.keys.length, total: totalKeys };
}

// Complete missing translations
function completeTranslations(criticalOnly = false) {
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  console.log(`🔧 ${criticalOnly ? 'Adding critical' : 'Completing all'} translations...\n`);
  
  let totalAdded = 0;
  
  ['en', 'es', 'nl'].forEach(lang => {
    const targetFile = lang === 'nl' ? nlFile : lang === 'en' ? enFile : esFile;
    const referenceFile = nlFile; // Always use NL as reference
    
    console.log(`\n🔧 Processing ${lang.toUpperCase()}...`);
    
    const reference = parseTranslationFile(referenceFile);
    const target = parseTranslationFile(targetFile);
    
    let missingKeys = reference.keys.filter(key => !target.keys.includes(key));
    
    // If critical only, filter to critical translations
    if (criticalOnly) {
      const criticalTranslations = masterTranslations[lang] || {};
      missingKeys = missingKeys.filter(key => criticalTranslations[key] || key.includes('dashboard') || key.includes('inventory'));
    }
    
    console.log(`   📋 Missing keys: ${missingKeys.length}`);
    
    if (missingKeys.length === 0) {
      console.log(`   ✅ Already complete!`);
      return;
    }
    
    // Extract original values from reference
    const referenceTranslations = {};
    missingKeys.forEach(key => {
      const regex = new RegExp(`^\\s*'?${key.replace(/\./g, '\\.')}'?\\s*:\\s*['"\`]([^'"\`]*?)['"\`]`, 'm');
      const match = reference.content.match(regex);
      if (match) {
        referenceTranslations[key] = match[1];
      } else {
        referenceTranslations[key] = key.split('.').pop();
      }
    });
    
    // Add translations safely
    let content = target.content;
    const lastBraceIndex = content.lastIndexOf('};');
    
    if (lastBraceIndex === -1) {
      console.log(`   ❌ Could not find file structure`);
      return;
    }
    
    let newTranslations = `\n  // === ${criticalOnly ? 'CRITICAL' : 'AUTO-GENERATED'} TRANSLATIONS ===\n`;
    
    missingKeys.forEach(key => {
      const originalValue = referenceTranslations[key];
      const translatedValue = intelligentTranslate(key, originalValue, lang);
      newTranslations += `  '${key}': '${translatedValue}',\n`;
    });
    
    newTranslations += '\n';
    
    const beforeBrace = content.substring(0, lastBraceIndex);
    const afterBrace = content.substring(lastBraceIndex);
    content = beforeBrace + newTranslations + afterBrace;
    
    fs.writeFileSync(targetFile, content, 'utf8');
    
    console.log(`   ✅ Added ${missingKeys.length} translations`);
    console.log(`   📝 Sample: ${missingKeys.slice(0, 3).join(', ')}`);
    
    totalAdded += missingKeys.length;
  });
  
  console.log(`\n🎉 Total translations added: ${totalAdded}`);
  console.log('🔍 Run --validate to check final status');
}

// Advanced sync function: Use Dutch as master and sync all languages
function syncAllLanguages() {
  console.log('🔄 Synchronizing all languages with Dutch as master...\n');
  
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  // Parse all files
  const nl = parseTranslationFile(nlFile);
  const en = parseTranslationFile(enFile);
  const es = parseTranslationFile(esFile);
  
  console.log('📊 Current status:');
  console.log(`   NL (master): ${nl.keys.length} keys`);
  console.log(`   EN: ${en.keys.length} keys`);
  console.log(`   ES: ${es.keys.length} keys\n`);
  
  // Nederlands is de master - sync anderen hierop
  let totalSynced = 0;
  
  ['en', 'es'].forEach(lang => {
    const targetFile = lang === 'en' ? enFile : esFile;
    const target = lang === 'en' ? en : es;
    
    console.log(`🔧 Syncing ${lang.toUpperCase()} with Dutch master...`);
    
    // Find missing keys
    const missingKeys = nl.keys.filter(key => !target.keys.includes(key));
    const extraKeys = target.keys.filter(key => !nl.keys.includes(key));
    
    console.log(`   ➕ Missing keys: ${missingKeys.length}`);
    console.log(`   ➖ Extra keys: ${extraKeys.length}`);
    
    if (missingKeys.length > 0) {
      // Extract original values from Dutch
      const referenceTranslations = {};
      missingKeys.forEach(key => {
        const regex = new RegExp(`^\\s*'?${key.replace(/\./g, '\\.')}'?\\s*:\\s*['"\`]([^'"\`]*?)['"\`]`, 'm');
        const match = nl.content.match(regex);
        if (match) {
          referenceTranslations[key] = match[1];
        } else {
          referenceTranslations[key] = key.split('.').pop();
        }
      });
      
      // Add translations
      let content = target.content;
      const lastBraceIndex = content.lastIndexOf('};');
      
      if (lastBraceIndex !== -1) {
        let newTranslations = `\n  // === AUTO-SYNCED FROM DUTCH ===\n`;
        
        missingKeys.forEach(key => {
          const originalValue = referenceTranslations[key];
          const translatedValue = intelligentTranslate(key, originalValue, lang);
          newTranslations += `  '${key}': '${translatedValue}',\n`;
        });
        
        newTranslations += '\n';
        
        const beforeBrace = content.substring(0, lastBraceIndex);
        const afterBrace = content.substring(lastBraceIndex);
        content = beforeBrace + newTranslations + afterBrace;
        
        fs.writeFileSync(targetFile, content, 'utf8');
        totalSynced += missingKeys.length;
        
        console.log(`   ✅ Added ${missingKeys.length} missing keys`);
      }
    }
    
    if (extraKeys.length > 0) {
      console.log(`   ⚠️  ${extraKeys.length} extra keys found (not in Dutch master)`);
      console.log(`      Consider reviewing: ${extraKeys.slice(0, 5).join(', ')}`);
      if (extraKeys.length > 5) {
        console.log(`      ... and ${extraKeys.length - 5} more`);
      }
    }
    
    console.log('');
  });
  
  console.log(`🎉 Sync completed! ${totalSynced} keys synchronized.`);
  console.log('🔍 Run --validate to check final status');
}

// Cleanup function: Remove unused keys
function cleanupUnusedKeys() {
  console.log('🧹 Cleaning up unused translation keys...\n');
  
  // This is a placeholder for cleanup functionality
  // In a real implementation, you would:
  // 1. Scan all Vue/TS files for $t() usage
  // 2. Extract all used keys
  // 3. Compare with translation files
  // 4. Remove unused keys
  
  console.log('⚠️  Cleanup functionality is not yet implemented.');
  console.log('    This would require scanning the entire codebase for $t() usage.');
  console.log('    Consider implementing this as a separate, more sophisticated tool.');
}

// Show help
function showHelp() {
  console.log(`
🌟 Remcura Translation Manager v2.0

📋 USAGE:
  node scripts/remcura-translation-manager.js [mode]

🎯 MODES:
  --validate     Check current translation status and completeness
  --complete     Complete ALL missing translations intelligently  
  --critical     Add only CRITICAL missing translations
  --sync         Sync all languages with Dutch as master (recommended)
  --cleanup      Remove unused translation keys (placeholder)
  --help         Show this help message

📊 EXAMPLES:
  # Check translation status
  npm run translations:validate
  
  # Add critical missing translations only
  npm run translations:critical
  
  # Complete all missing translations
  npm run translations:complete
  
  # Sync all languages with Dutch master (recommended)
  npm run i18n:sync

🔧 FEATURES:
  ✅ Intelligent translation parsing
  ✅ Multi-language support (NL/EN/ES)
  ✅ Safe syntax handling
  ✅ Critical key prioritization
  ✅ Pattern-based translation mapping
  ✅ Comprehensive validation

📁 FILES MANAGED:
  • src/i18n/nl/index.ts (Reference)
  • src/i18n/en/index.ts  
  • src/i18n/es/index.ts

💡 TIP: Always run --validate first to see current status!
`);
}

// Main execution
function main() {
  switch (mode) {
    case '--validate':
      validateTranslations();
      break;
      
    case '--complete':
      completeTranslations(false);
      break;
      
    case '--critical':
      completeTranslations(true);
      break;
      
    case '--sync':
      syncAllLanguages();
      break;
      
    case '--cleanup':
      cleanupUnusedKeys();
      break;
      
    case '--help':
    default:
      showHelp();
      break;
  }
}

// Run the script
main(); 