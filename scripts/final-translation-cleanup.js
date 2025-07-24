#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remcura Final Translation Cleanup
 * Ultra-conservative script to safely add the last missing translations
 */

console.log('🏁 Remcura Final Translation Cleanup');
console.log('🎯 Goal: Complete the last missing translations safely\n');

// Critical missing translations that we know are needed
const criticalTranslations = {
  en: {
    // Top missing keys for EN
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
    'inventory.tryDifferentSearchTerm': 'Try a different search term',
    'inventory.realTimeConnected': 'Real-time connected',
    'inventory.realTimeDisconnected': 'Real-time disconnected',
    'inventory.stockUpdatedMessage': 'Stock updated successfully',
    'inventory.adjustStockLevels': 'Adjust stock levels',
    'inventory.quickAmounts': 'Quick amounts',
    'inventory.reasonRequired': 'Reason is required',
    'inventory.quantityMustBePositive': 'Quantity must be positive',
    'inventory.completeRequiredFields': 'Complete all required fields',
    'inventory.selectProductFirst': 'Select a product first'
  },
  
  es: {
    // Critical ES translations
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
    'dashboard.inStock': 'En Stock'
  },
  
  nl: {
    // Critical NL translations
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
  }
};

// Ultra-safe translation adder
function addCriticalTranslations(filePath, lang) {
  console.log(`\n🔧 Adding critical ${lang.toUpperCase()} translations...`);
  
  const translations = criticalTranslations[lang];
  if (!translations) {
    console.log(`   ⚠️ No critical translations defined for ${lang}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last }; in the file  
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    console.log(`   ❌ Could not find file structure in ${filePath}`);
    return;
  }
  
  // Check which translations are actually missing
  const missingTranslations = {};
  Object.entries(translations).forEach(([key, value]) => {
    // Simple check if key exists in file
    if (!content.includes(`'${key}'`) && !content.includes(`"${key}"`)) {
      missingTranslations[key] = value;
    }
  });
  
  const missingCount = Object.keys(missingTranslations).length;
  console.log(`   📋 Found ${missingCount} missing critical translations`);
  
  if (missingCount === 0) {
    console.log(`   ✅ All critical translations already present`);
    return;
  }
  
  // Generate the new translations
  let newTranslations = `\n  // === CRITICAL MISSING TRANSLATIONS ===\n`;
  
  Object.entries(missingTranslations).forEach(([key, value]) => {
    newTranslations += `  '${key}': '${value}',\n`;
  });
  
  newTranslations += '\n';
  
  // Insert before the closing brace
  const beforeBrace = content.substring(0, lastBraceIndex);
  const afterBrace = content.substring(lastBraceIndex);
  const updatedContent = beforeBrace + newTranslations + afterBrace;
  
  // Write the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log(`   ✅ Added ${missingCount} critical translations`);
  console.log(`   📝 Sample: ${Object.keys(missingTranslations).slice(0, 3).join(', ')}`);
}

// Main execution
async function finalCleanup() {
  const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
  const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts'); 
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  
  console.log('📂 Starting final translation cleanup...\n');
  
  // Add critical translations to each language
  addCriticalTranslations(nlFile, 'nl');
  addCriticalTranslations(enFile, 'en');
  addCriticalTranslations(esFile, 'es');
  
  console.log('\n🎉 Final cleanup completed!');
  console.log('🔍 Run validation to check final status...');
}

finalCleanup().catch(console.error); 