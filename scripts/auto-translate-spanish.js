#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remcura Spanish Translation Auto-Updater
 * Automatically fills in missing Spanish translations using Dutch as base
 */

console.log('🔧 Remcura Spanish Translation Auto-Updater\n');

// Load all translation files
const loadTranslations = (lang) => {
  const translationFile = path.join(__dirname, '..', 'src', 'i18n', lang, 'index.ts');
  
  if (!fs.existsSync(translationFile)) {
    console.error(`❌ Translation file not found: ${translationFile}`);
    return {};
  }

  const content = fs.readFileSync(translationFile, 'utf8');
  
  // Simple parser to extract translation keys
  const translations = {};
  
  // Extract all quoted keys and their values
  const lines = content.split('\n');
  let currentPath = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and imports
    if (trimmed.startsWith('//') || trimmed.startsWith('import') || trimmed.startsWith('export')) {
      continue;
    }
    
    // Handle object nesting
    if (trimmed.endsWith('{')) {
      const key = trimmed.replace(/[:{]/g, '').trim().replace(/'/g, '');
      if (key && key !== 'export default') {
        currentPath.push(key);
      }
    } else if (trimmed === '}' || trimmed === '},') {
      currentPath.pop();
    } else if (trimmed.includes(':')) {
      // Extract key-value pairs
      const match = trimmed.match(/['"]([^'"]+)['"]:\s*['"]([^'"]*)['"]/);
      if (match) {
        const key = match[1];
        const value = match[2];
        const fullKey = [...currentPath, key].join('.');
        translations[fullKey] = value;
      }
    }
  }
  
  return translations;
};

// Simple Dutch to Spanish translations for common terms
const commonTranslations = {
  // Common UI terms
  'terug': 'atrás',
  'volgende': 'siguiente',
  'vorige': 'anterior',
  'opslaan': 'guardar',
  'annuleren': 'cancelar',
  'verwijderen': 'eliminar',
  'bewerken': 'editar',
  'toevoegen': 'agregar',
  'zoeken': 'buscar',
  'filter': 'filtro',
  'alle': 'todos',
  'geen': 'ninguno',
  'selecteren': 'seleccionar',
  'datum': 'fecha',
  'tijd': 'tiempo',
  'vandaag': 'hoy',
  'gisteren': 'ayer',
  'morgen': 'mañana',
  'week': 'semana',
  'maand': 'mes',
  'jaar': 'año',
  'naam': 'nombre',
  'beschrijving': 'descripción',
  'status': 'estado',
  'actief': 'activo',
  'inactief': 'inactivo',
  'nieuw': 'nuevo',
  'oud': 'viejo',
  'totaal': 'total',
  'aantal': 'cantidad',
  'prijs': 'precio',
  'kosten': 'costo',
  'waarde': 'valor',
  
  // Medical/Pharmacy terms
  'voorraad': 'inventario',
  'medicijn': 'medicamento',
  'medicijnen': 'medicamentos',
  'apotheek': 'farmacia',
  'praktijk': 'práctica',
  'patiënt': 'paciente',
  'arts': 'médico',
  'verpleegkundige': 'enfermero',
  'behandeling': 'tratamiento',
  'diagnose': 'diagnóstico',
  'recepten': 'recetas',
  'bestelling': 'pedido',
  'bestellingen': 'pedidos',
  'leverancier': 'proveedor',
  'leveranciers': 'proveedores',
  'levering': 'entrega',
  'batch': 'lote',
  'vervaldatum': 'fecha de vencimiento',
  'verlopen': 'vencido',
  'beschadigd': 'dañado',
  'verloren': 'perdido',
  'gevonden': 'encontrado',
  'quarantaine': 'cuarentena',
  'kwaliteit': 'calidad',
  
  // Inventory terms
  'opslag': 'almacenamiento',
  'locatie': 'ubicación',
  'locaties': 'ubicaciones',
  'magazijn': 'almacén',
  'telling': 'recuento',
  'beweging': 'movimiento',
  'bewegingen': 'movimientos',
  'aanpassing': 'ajuste',
  'transfer': 'transferencia',
  'ontvangst': 'recepción',
  'gebruik': 'uso',
  'verspilling': 'desperdicio',
  'minimum': 'mínimo',
  'maximum': 'máximo',
  'herbestelpunt': 'punto de reorden',
  'tekort': 'escasez',
  'overschot': 'exceso',
  
  // Dashboard terms
  'dashboard': 'panel de control',
  'overzicht': 'resumen',
  'analyses': 'análisis',
  'rapporten': 'informes',
  'waarschuwingen': 'alertas',
  'meldingen': 'notificaciones',
  'instellingen': 'configuración',
  'profiel': 'perfil',
  'account': 'cuenta',
  'gebruiker': 'usuario',
  'gebruikers': 'usuarios',
  'rol': 'rol',
  'rechten': 'permisos',
  'toegang': 'acceso',
  
  // Actions
  'laden': 'cargar',
  'vernieuwen': 'actualizar',
  'synchroniseren': 'sincronizar',
  'exporteren': 'exportar',
  'importeren': 'importar',
  'downloaden': 'descargar',
  'uploaden': 'subir',
  'delen': 'compartir',
  'afdrukken': 'imprimir',
  'scannen': 'escanear',
  'barcode': 'código de barras',
  
  // Status/States
  'beschikbaar': 'disponible',
  'niet beschikbaar': 'no disponible',
  'op voorraad': 'en stock',
  'uitverkocht': 'agotado',
  'laag voorraad': 'stock bajo',
  'concept': 'borrador',
  'definitief': 'final',
  'goedgekeurd': 'aprobado',
  'geannuleerd': 'cancelado',
  'voltooid': 'completado',
  'in uitvoering': 'en progreso',
  'wachtend': 'esperando',
  
  // Common phrases
  'geen resultaten': 'sin resultados',
  'geen gegevens': 'sin datos',
  'laden...': 'cargando...',
  'opslaan...': 'guardando...',
  'verwijderen...': 'eliminando...',
  'bezig met laden': 'cargando',
  'succesvol opgeslagen': 'guardado exitosamente',
  'fout opgetreden': 'error ocurrido',
  'probeer opnieuw': 'intentar de nuevo',
  'weet je het zeker': '¿estás seguro?',
  'deze actie kan niet ongedaan worden gemaakt': 'esta acción no se puede deshacer',
  'selecteer een optie': 'seleccionar una opción',
  'vul dit veld in': 'completar este campo',
  'dit veld is verplicht': 'este campo es obligatorio',
  'ongeldige waarde': 'valor inválido',
};

// Translate Dutch text to Spanish using simple word replacement
const translateText = (dutchText) => {
  if (!dutchText || typeof dutchText !== 'string') return dutchText;
  
  let translated = dutchText.toLowerCase();
  
  // Replace common terms
  for (const [dutch, spanish] of Object.entries(commonTranslations)) {
    const regex = new RegExp(`\\b${dutch}\\b`, 'gi');
    translated = translated.replace(regex, spanish);
  }
  
  // Capitalize first letter if original was capitalized
  if (dutchText[0] && dutchText[0] === dutchText[0].toUpperCase()) {
    translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  
  return translated;
};

// Main function
const updateSpanishTranslations = () => {
  console.log('📂 Loading translations...');
  
  const nlTranslations = loadTranslations('nl');
  const esTranslations = loadTranslations('es');
  const enTranslations = loadTranslations('en');
  
  console.log(`✅ Dutch: ${Object.keys(nlTranslations).length} keys`);
  console.log(`✅ Spanish: ${Object.keys(esTranslations).length} keys`);
  console.log(`✅ English: ${Object.keys(enTranslations).length} keys`);
  
  // Find missing keys in Spanish
  const allKeys = new Set([
    ...Object.keys(nlTranslations),
    ...Object.keys(enTranslations),
    ...Object.keys(esTranslations)
  ]);
  
  const missingInSpanish = [];
  for (const key of allKeys) {
    if (!esTranslations[key]) {
      missingInSpanish.push(key);
    }
  }
  
  console.log(`\n🔍 Found ${missingInSpanish.length} missing Spanish translations`);
  
  if (missingInSpanish.length === 0) {
    console.log('✅ All Spanish translations are up to date!');
    return;
  }
  
  // Generate new Spanish translations
  const newTranslations = {};
  let translated = 0;
  
  for (const key of missingInSpanish) {
    const dutchValue = nlTranslations[key];
    const englishValue = enTranslations[key];
    
    if (dutchValue) {
      newTranslations[key] = translateText(dutchValue);
      translated++;
    } else if (englishValue) {
      // If no Dutch, use English as fallback
      newTranslations[key] = englishValue;
    } else {
      // Last resort: use the key itself
      newTranslations[key] = key.split('.').pop();
    }
  }
  
  console.log(`🔄 Generated ${translated} automatic translations`);
  console.log(`📝 Using fallbacks for ${missingInSpanish.length - translated} keys`);
  
  // Update Spanish translation file
  const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');
  let esContent = fs.readFileSync(esFile, 'utf8');
  
  // Build new translations section
  const translationLines = [];
  const sortedKeys = Object.keys(newTranslations).sort();
  
  for (const key of sortedKeys) {
    const value = newTranslations[key];
    translationLines.push(`  // Auto-generated translation`);
    translationLines.push(`  '${key}': '${value.replace(/'/g, "\\'")}',`);
  }
  
  // Insert new translations before the closing brace
  const insertPoint = esContent.lastIndexOf('};');
  if (insertPoint !== -1) {
    const beforeClose = esContent.substring(0, insertPoint);
    const afterClose = esContent.substring(insertPoint);
    
    const newContent = beforeClose + 
      '\n  // === AUTO-GENERATED TRANSLATIONS ===\n' +
      translationLines.join('\n') + '\n' +
      afterClose;
    
    fs.writeFileSync(esFile, newContent, 'utf8');
    
    console.log(`\n✅ Updated ${esFile}`);
    console.log(`📊 Added ${sortedKeys.length} new Spanish translations`);
    
    // Show first few examples
    console.log(`\n📋 Examples of new translations:`);
    for (let i = 0; i < Math.min(5, sortedKeys.length); i++) {
      const key = sortedKeys[i];
      const dutch = nlTranslations[key] || enTranslations[key] || '';
      const spanish = newTranslations[key];
      console.log(`   ${key}: "${dutch}" → "${spanish}"`);
    }
    
  } else {
    console.error('❌ Could not find insertion point in Spanish translation file');
  }
};

// Run the updater
updateSpanishTranslations();

console.log('\n🎉 Spanish translation update completed!');
console.log('💡 Tip: Review the translations and adjust any that need improvement'); 