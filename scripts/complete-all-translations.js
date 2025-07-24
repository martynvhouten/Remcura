#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Remcura Complete Translation Fixer
 * Systematically fills ALL missing translations based on Dutch as reference
 */

console.log('🔧 Remcura Complete Translation Fixer\n');

// Simple but reliable translation maps
const nlToEn = {
  // Common words
  'titel': 'title',
  'welkom': 'welcome',
  'gebruiker': 'user',
  'dashboard': 'dashboard',
  'assistent': 'assistant',
  'manager': 'manager',
  'eigenaar': 'owner',
  'voorraad': 'stock',
  'waarschuwingen': 'alerts',
  'bestellingen': 'orders',
  'suggesties': 'suggestions',
  'recent': 'recent',
  'snelle': 'quick',
  'scan': 'scan',
  'analyse': 'analytics',
  'overzicht': 'overview',
  'bedrijf': 'business',
  'inventaris': 'inventory',
  'inloggen': 'login',
  'uitloggen': 'logout',
  'wachtwoord': 'password',
  'e-mail': 'email',
  'email': 'email',
  'producten': 'products',
  'product': 'product',
  'leveranciers': 'suppliers',
  'leverancier': 'supplier',
  'locaties': 'locations',
  'locatie': 'location',
  'bewegingen': 'movements',
  'beweging': 'movement',
  'telling': 'counting',
  'sessie': 'session',
  'aantal': 'quantity',
  'hoeveelheid': 'quantity',
  'prijs': 'price',
  'waarde': 'value',
  'status': 'status',
  'actief': 'active',
  'inactief': 'inactive',
  'beschrijving': 'description',
  'naam': 'name',
  'opslaan': 'save',
  'annuleren': 'cancel',
  'bewerken': 'edit',
  'verwijderen': 'delete',
  'toevoegen': 'add',
  'zoeken': 'search',
  'filters': 'filters',
  'alles': 'all',
  'geen': 'none',
  'selecteren': 'select',
  'bijwerken': 'update',
  'laatste': 'last',
  'vandaag': 'today',
  'gisteren': 'yesterday',
  'tijd': 'time',
  'datum': 'date',
  'verlopen': 'expired',
  'beschadigd': 'damaged',
  'verloren': 'lost',
  'gevonden': 'found',
  'overdracht': 'transfer',
  'aanpassing': 'adjustment',
  'gebruik': 'usage',
  'afval': 'waste',
  'quarantaine': 'quarantine',
  'rapporten': 'reports',
  'exporteren': 'export',
  'downloaden': 'download',
  'laden': 'loading',
  'opnieuw proberen': 'retry',
  'fout': 'error',
  'waarschuwing': 'warning',
  'succesvol': 'success',
  'details': 'details',
  'instellingen': 'settings',
  'profiel': 'profile',
  'admin': 'admin',
  'gebruikers': 'users',
  'meldingen': 'notifications',
  'Remcura': 'Remcura'
};

const nlToEs = {
  // Common words
  'titel': 'título',
  'welkom': 'bienvenido',
  'gebruiker': 'usuario',
  'dashboard': 'panel',
  'assistent': 'asistente',
  'manager': 'gerente',
  'eigenaar': 'propietario',
  'voorraad': 'inventario',
  'waarschuwingen': 'alertas',
  'bestellingen': 'pedidos',
  'suggesties': 'sugerencias',
  'recent': 'reciente',
  'recente': 'recientes',
  'snelle': 'rápido',
  'scan': 'escaneo',
  'analyse': 'análisis',
  'overzicht': 'resumen',
  'bedrijf': 'empresa',
  'inventaris': 'inventario',
  'inloggen': 'iniciar sesión',
  'uitloggen': 'cerrar sesión',
  'wachtwoord': 'contraseña',
  'e-mail': 'correo electrónico',
  'email': 'correo electrónico',
  'producten': 'productos',
  'product': 'producto',
  'leveranciers': 'proveedores',
  'leverancier': 'proveedor',
  'locaties': 'ubicaciones',
  'locatie': 'ubicación',
  'bewegingen': 'movimientos',
  'beweging': 'movimiento',
  'telling': 'conteo',
  'sessie': 'sesión',
  'aantal': 'cantidad',
  'hoeveelheid': 'cantidad',
  'prijs': 'precio',
  'waarde': 'valor',
  'status': 'estado',
  'actief': 'activo',
  'inactief': 'inactivo',
  'beschrijving': 'descripción',
  'naam': 'nombre',
  'opslaan': 'guardar',
  'annuleren': 'cancelar',
  'bewerken': 'editar',
  'verwijderen': 'eliminar',
  'toevoegen': 'agregar',
  'zoeken': 'buscar',
  'filters': 'filtros',
  'alles': 'todo',
  'geen': 'ninguno',
  'selecteren': 'seleccionar',
  'bijwerken': 'actualizar',
  'laatste': 'último',
  'vandaag': 'hoy',
  'gisteren': 'ayer',
  'tijd': 'tiempo',
  'datum': 'fecha',
  'verlopen': 'vencido',
  'beschadigd': 'dañado',
  'verloren': 'perdido',
  'gevonden': 'encontrado',
  'overdracht': 'transferencia',
  'aanpassing': 'ajuste',
  'gebruik': 'uso',
  'afval': 'residuo',
  'quarantaine': 'cuarentena',
  'rapporten': 'informes',
  'exporteren': 'exportar',
  'downloaden': 'descargar',
  'laden': 'cargando',
  'opnieuw proberen': 'intentar de nuevo',
  'fout': 'error',
  'waarschuwing': 'advertencia',
  'succesvol': 'exitoso',
  'details': 'detalles',
  'instellingen': 'configuración',
  'profiel': 'perfil',
  'admin': 'administrador',
  'gebruikers': 'usuarios',
  'meldingen': 'notificaciones',
  'Remcura': 'Remcura'
};

function parseTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = {};
  
  // Simple regex to extract key-value pairs
  const regex = /^(\s*)(\w+(?:\.\w+)*)\s*:\s*['"`]([^'"`]+)['"`]/gm;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const key = match[2];
    const value = match[3];
    translations[key] = {
      value: value,
      indent: match[1]
    };
  }
  
  return { translations, content };
}

function smartTranslate(text, translationMap) {
  let translated = text;
  
  // First try direct word matches
  for (const [dutch, target] of Object.entries(translationMap)) {
    // Case insensitive replacement of whole words
    const regex = new RegExp(`\\b${dutch}\\b`, 'gi');
    translated = translated.replace(regex, target);
  }
  
  return translated;
}

function addMissingTranslations(referenceFile, targetFile, targetLang) {
  console.log(`\n🔄 Processing ${targetLang.toUpperCase()}...`);
  
  const reference = parseTranslationFile(referenceFile);
  const target = parseTranslationFile(targetFile);
  
  const missingKeys = [];
  const translationMap = targetLang === 'en' ? nlToEn : nlToEs;
  
  // Find missing keys
  for (const key in reference.translations) {
    if (!target.translations[key]) {
      missingKeys.push(key);
    }
  }
  
  console.log(`   📋 Found ${missingKeys.length} missing keys`);
  
  if (missingKeys.length === 0) {
    console.log(`   ✅ No missing keys!`);
    return;
  }
  
  // Add missing translations before the closing bracket
  let updatedContent = target.content;
  
  // Find the position to insert (before the last closing bracket)
  const lastBracketPos = updatedContent.lastIndexOf('};');
  
  if (lastBracketPos === -1) {
    console.log(`   ❌ Could not find closing bracket in ${targetFile}`);
    return;
  }
  
  // Generate missing translations
  let newTranslations = '\n  // === AUTO-GENERATED MISSING TRANSLATIONS ===\n';
  
  missingKeys.forEach(key => {
    const originalValue = reference.translations[key].value;
    const translatedValue = smartTranslate(originalValue, translationMap);
    
    // Determine proper indentation based on key depth
    const keyParts = key.split('.');
    const indent = '  '.repeat(keyParts.length);
    
    newTranslations += `${indent}${key}: '${translatedValue}',\n`;
  });
  
  // Insert the new translations
  const beforeClosing = updatedContent.substring(0, lastBracketPos);
  const afterClosing = updatedContent.substring(lastBracketPos);
  
  updatedContent = beforeClosing + newTranslations + '\n' + afterClosing;
  
  // Write the updated content
  fs.writeFileSync(targetFile, updatedContent, 'utf8');
  
  console.log(`   ✅ Added ${missingKeys.length} translations to ${targetFile}`);
  console.log(`   📝 Sample keys: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`);
}

// File paths
const nlFile = path.join(__dirname, '..', 'src', 'i18n', 'nl', 'index.ts');
const enFile = path.join(__dirname, '..', 'src', 'i18n', 'en', 'index.ts');
const esFile = path.join(__dirname, '..', 'src', 'i18n', 'es', 'index.ts');

console.log('📂 Processing translation files...\n');

// Process EN file
addMissingTranslations(nlFile, enFile, 'en');

// Process ES file
addMissingTranslations(nlFile, esFile, 'es');

console.log('\n🎉 Translation completion finished!');
console.log('\n🔍 Run validation script to verify...'); 