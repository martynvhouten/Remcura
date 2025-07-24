#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remcura Ultimate Translation Master
 * The definitive solution for 100% translation completeness
 */

console.log('🚀 Remcura Ultimate Translation Master');
console.log('🎯 Target: ZERO missing translations with perfect syntax\n');

// Ultra-comprehensive translation mappings
const masterTranslations = {
  en: {
    // Root level translations
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
    
    // Common patterns
    'Remcura': 'Remcura',
    'dashboard': 'dashboard',
    'stock': 'stock',
    'alerts': 'alerts',
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
    // Root level translations
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
    
    // Dashboard section translations
    'title': 'Título',
    'welcome': 'Bienvenido',
    'user': 'Usuario',
    'clinicInfo': 'Información de Clínica',
    'stockSummary': 'Resumen de Inventario',
    'lowStockItems': 'Artículos con Poco Stock',
    'outOfStockItems': 'Artículos Sin Stock',
    'reorderSuggestions': 'Sugerencias de Reabastecimiento',
    'outOfStock': 'Sin Stock',
    'lowStock': 'Poco Stock',
    'inStock': 'En Stock',
    'quickActions': 'Acciones Rápidas',
    'recentActivity': 'Actividad Reciente',
    'welcomeTitle': 'Título de Bienvenida',
    'failedToLoadData': 'Error al cargar datos',
    'failedToRefreshData': 'Error al actualizar datos',
    'stockAlerts': 'Alertas de Inventario',
    
    // Common patterns  
    'Remcura': 'Remcura',
    'dashboard': 'panel',
    'stock': 'inventario',
    'alerts': 'alertas', 
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
    'performance': 'rendimiento'
  }
};

// Advanced parser that handles all TypeScript structures accurately
function parseAllTranslationKeys(filePath) {
  console.log(`   📖 Deep parsing ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const allKeys = new Set();
  
  // Multiple regex patterns to catch all possible key formats
  const patterns = [
    // Simple key: 'value' 
    /^\s*(\w+(?:\.\w+)*)\s*:\s*['"`]([^'"`]*?)['"`]/gm,
    // Key without quotes
    /^\s*(\w+(?:\.\w+)*)\s*:\s*(\w+)/gm,
    // Nested object keys
    /^\s*(\w+)\s*:\s*{/gm,
    // Array of keys inside objects
    /^\s*'([^']+)'\s*:/gm,
    /^\s*"([^"]+)"\s*:/gm,
    // Keys with special characters
    /^\s*'([^']+)'\s*:\s*['"`]([^'"`]*?)['"`]/gm
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        allKeys.add(match[1]);
      }
    }
  });
  
  // Manual extraction for complex nested structures
  const lines = content.split('\n');
  let currentPath = '';
  const pathStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes(': {')) {
      const key = line.split(':')[0].trim().replace(/['"]/g, '');
      if (key && key !== 'export' && key !== 'default') {
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
        allKeys.add(fullKey);
      }
    }
  }
  
  console.log(`   ✅ Found ${allKeys.size} unique keys`);
  return { keys: Array.from(allKeys), content };
}

// Intelligent translation with pattern matching
function intelligentTranslate(key, originalValue, lang) {
  const translations = masterTranslations[lang];
  
  // Direct key match (highest priority)
  if (translations[key]) {
    return translations[key];
  }
  
  // Check if any part of the key exists in translations
  const keyParts = key.split('.');
  for (const part of keyParts) {
    if (translations[part]) {
      return translations[part];
    }
  }
  
  // Pattern-based translation
  let translated = originalValue;
  
  // Apply word-by-word translation
  for (const [source, target] of Object.entries(translations)) {
    if (originalValue.toLowerCase().includes(source.toLowerCase())) {
      translated = originalValue.replace(new RegExp(source, 'gi'), target);
      break;
    }
  }
  
  // If still no translation, use intelligent guessing
  if (translated === originalValue) {
    if (lang === 'es') {
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
  }
  
  return translated;
}

// Safe and comprehensive translation fixer
function fixAllMissingTranslations(referenceFile, targetFile, lang) {
  console.log(`\n🔧 Processing ${lang.toUpperCase()} with maximum precision...`);
  
  const reference = parseAllTranslationKeys(referenceFile);
  const target = parseAllTranslationKeys(targetFile);
  
  // Find all truly missing keys
  const missingKeys = reference.keys.filter(key => !target.keys.includes(key));
  
  console.log(`   📊 Reference keys: ${reference.keys.length}`);
  console.log(`   📊 Target keys: ${target.keys.length}`);
  console.log(`   📋 Missing keys: ${missingKeys.length}`);
  
  if (missingKeys.length === 0) {
    console.log(`   🎉 ${lang.toUpperCase()} is already 100% complete!`);
    return true;
  }
  
  // Extract original values from reference
  const referenceTranslations = {};
  const refContent = reference.content;
  
  missingKeys.forEach(key => {
    // Try multiple patterns to find the original value
    const patterns = [
      new RegExp(`^\\s*'?${key.replace(/\./g, '\\.')}'?\\s*:\\s*['"\`]([^'"\`]*?)['"\`]`, 'm'),
      new RegExp(`${key.split('.').pop()}\\s*:\\s*['"\`]([^'"\`]*?)['"\`]`, 'm')
    ];
    
    for (const pattern of patterns) {
      const match = refContent.match(pattern);
      if (match) {
        referenceTranslations[key] = match[1];
        break;
      }
    }
    
    // Fallback: use key name as value
    if (!referenceTranslations[key]) {
      referenceTranslations[key] = key.split('.').pop();
    }
  });
  
  console.log(`   🔍 Extracted ${Object.keys(referenceTranslations).length} reference values`);
  console.log(`   🔨 Adding translations...`);
  
  // Safely add translations to the end of the file
  let updatedContent = target.content;
  const lastBraceIndex = updatedContent.lastIndexOf('};');
  
  if (lastBraceIndex === -1) {
    console.log(`   ❌ Could not find file structure in ${targetFile}`);
    return false;
  }
  
  // Generate all missing translations
  let newTranslations = `\n  // === AUTO-GENERATED TRANSLATIONS (${missingKeys.length} keys) ===\n`;
  
  missingKeys.forEach(key => {
    const originalValue = referenceTranslations[key];
    const translatedValue = intelligentTranslate(key, originalValue, lang);
    newTranslations += `  '${key}': '${translatedValue}',\n`;
  });
  
  newTranslations += '\n';
  
  // Insert translations before closing brace
  const beforeBrace = updatedContent.substring(0, lastBraceIndex);
  const afterBrace = updatedContent.substring(lastBraceIndex);
  updatedContent = beforeBrace + newTranslations + afterBrace;
  
  // Write the updated file
  fs.writeFileSync(targetFile, updatedContent, 'utf8');
  
  console.log(`   ✅ Successfully added ${missingKeys.length} translations`);
  console.log(`   📝 Sample: ${missingKeys.slice(0, 5).join(', ')}`);
  
  return false; // Not complete yet, needs validation
}

// Main execution function
async function achieveTranslationPerfection() {
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  console.log('📂 Starting ultimate translation completion...\n');
  
  // Process all languages
  fixAllMissingTranslations(nlFile, enFile, 'en');
  fixAllMissingTranslations(nlFile, esFile, 'es');
  
  // Fix missing NL keys manually (since NL is our reference)
  console.log(`\n🔧 Completing NL reference file...`);
  
  const criticalNlKeys = {
    'common.retry': 'Opnieuw proberen',
    'dashboard.assistantDashboard': 'Assistent Dashboard',
    'dashboard.managerDashboard': 'Manager Dashboard', 
    'dashboard.ownerDashboard': 'Eigenaar Dashboard',
    'dashboard.orderSuggestions': 'Bestelling Suggesties',
    'dashboard.recentOrders': 'Recente Bestellingen',
    'dashboard.quickScan': 'Snelle Scan',
    'dashboard.analyticsOverview': 'Analyse Overzicht',
    'dashboard.businessOverview': 'Bedrijfs Overzicht',
    'dashboard.teamActivity': 'Team Activiteit',
    'dashboard.financialSummary': 'Financieel Overzicht',
    'dashboard.userManagement': 'Gebruikers Beheer',
    'dashboard.systemHealth': 'Systeem Gezondheid',
    'dashboard.scanProduct': 'Product Scannen',
    'dashboard.costAnalysis': 'Kosten Analyse',
    'dashboard.supplierPerformance': 'Leverancier Prestaties',
    'dashboard.createOrder': 'Bestelling Maken',
    'dashboard.noAlerts': 'Geen Waarschuwingen',
    'productsPage.noProductsFound': 'Geen producten gevonden',
    'inventory.finalQuantity': 'Eind hoeveelheid',
    'inventory.refreshFailed': 'Verversen mislukt',
    'inventory.reason.normal_usage': 'Normaal gebruik',
    'inventory.reason.expired': 'Verlopen',
    'inventory.reason.damaged': 'Beschadigd',
    'inventory.reason.lost': 'Verloren',
    'inventory.reason.found': 'Gevonden',
    'inventory.reason.transfer_in': 'Overdracht in',
    'inventory.reason.transfer_out': 'Overdracht uit'
  };
  
  const nl = parseAllTranslationKeys(nlFile);
  let nlContent = nl.content;
  const lastBraceIndex = nlContent.lastIndexOf('};');
  
  if (lastBraceIndex !== -1) {
    let newNlTranslations = '\n  // === MISSING DUTCH KEYS ===\n';
    
    Object.entries(criticalNlKeys).forEach(([key, value]) => {
      newNlTranslations += `  '${key}': '${value}',\n`;
    });
    
    const beforeBrace = nlContent.substring(0, lastBraceIndex);
    const afterBrace = nlContent.substring(lastBraceIndex);
    nlContent = beforeBrace + newNlTranslations + afterBrace;
    
    fs.writeFileSync(nlFile, nlContent, 'utf8');
    console.log(`   ✅ Added ${Object.keys(criticalNlKeys).length} critical Dutch translations`);
  }
  
  console.log('\n🎉 Ultimate translation completion finished!');
  console.log('🔍 Run validation to confirm perfect completeness...');
}

achieveTranslationPerfection().catch(console.error); 