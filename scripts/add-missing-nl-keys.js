#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const NL_FILE = path.join(__dirname, '../src/i18n/nl/index.ts');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      cur[p] = value;
    } else {
      if (!cur[p] || typeof cur[p] !== 'object' || Array.isArray(cur[p])) {
        cur[p] = {};
      }
      cur = cur[p];
    }
  }
}

function formatObject(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padNext = '  '.repeat(indent + 1);
  const keys = Object.keys(obj);
  let lines = [];
  keys.forEach((k, idx) => {
    const v = obj[k];
    const last = idx === keys.length - 1;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      lines.push(`${padNext}${k}: ${formatObject(v, indent + 1).trim()}${last ? '' : ','}`);
    } else {
      const sv = String(v).replace(/'/g, "\\'");
      lines.push(`${padNext}${k}: '${sv}'${last ? '' : ','}`);
    }
  });
  return `{
${lines.join('\n')}
${pad}}`;
}

function loadNl() {
  const content = readFile(NL_FILE);
  const match = content.match(/export default\s*({[\s\S]*});?\s*$/);
  if (!match) throw new Error('export default object not found');
  // eslint-disable-next-line no-eval
  const obj = eval(`(${match[1]})`);
  return { content, match, obj };
}

function writeNl(originalContent, match, obj) {
  const before = originalContent.substring(0, match.index);
  const after = originalContent.substring(match.index + match[0].length);
  const formatted = formatObject(obj, 0);
  const final = `${before}export default ${formatted};${after}`;
  fs.writeFileSync(NL_FILE, final, 'utf8');
}

function main() {
  const mapping = {
    'settings.shadowsSection': 'Schaduwen',
    'settings.iconsSection': 'Iconen',
    'orderLists.emptyFiltered': 'Geen lijsten voor deze filters',
    'orderLists.empty': 'Nog geen bestellijsten',
    'orderLists.tryOtherFilters': 'Probeer andere filters',
    'orderLists.createFirstList': 'Maak je eerste bestellijst',
    'orderLists.newList': 'Nieuwe lijst',
    'orderLists.globalAdvice': 'Algemeen besteladvies',
    'orderLists.orderAll': 'Alles bestellen',
    'orderLists.deleteConfirmText': 'Weet je zeker dat je deze bestellijst wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
    'common.duplicate': 'Dupliceren',
    'orderLists.addProductSubtitle': 'Zoek en voeg producten toe aan de lijst',
    'products.search': 'Producten zoeken',
    'orderLists.recommendedQty': 'Aanbevolen hoeveelheid',
    'orderLists.confirmPlaceAllTitle': 'Alle bestellingen plaatsen?',
    'orderLists.confirmPlaceAllBody': 'Weet je zeker dat je alle items in deze lijst wilt bestellen?',
    'orderLists.ordersCreated': 'Bestellingen aangemaakt',
    'notificationsPage.markReadError': 'Melding als gelezen markeren mislukt',
    'notificationsPage.markUnreadError': 'Melding als ongelezen markeren mislukt',
    'notificationsPage.markAllReadError': 'Alle meldingen als gelezen markeren mislukt',
    'notificationsPage.deleteNotificationError': 'Verwijderen van melding mislukt',
    'notificationsPage.clearAllError': 'Alle meldingen wissen mislukt',
    'platform.errors.loadFailed': 'Laden mislukt',
    'platform.messages.refreshed': 'Gegevens ververst',
    'platform.messages.configureWidget': 'Configureer deze widget',
    'inventory.movements.loadError': 'Laden van mutaties mislukt',
    'counting.entriesLoadFailed': 'Tellingsitems laden mislukt',
    'common.undo': 'Ongedaan maken',
    'common.changesReverted': 'Wijzigingen ongedaan gemaakt',
    'common.actionFailed': 'Actie mislukt',
    'demo.clinicName': 'Demopraktijk',
    'batch.expiryDatePastError': 'Vervaldatum mag niet in het verleden liggen',
    'common.unknown': 'Onbekend',
    'platform.metrics.compliance': 'Compliance',
    'platform.metrics.health': 'Gezondheid',
    'platform.metrics.progress': 'Voortgang',
    'inventory.transferCompletedDetails': 'Voorraadoverdracht voltooid',
    'counting.overageDetected': 'Overschot gedetecteerd',
    'counting.shortageDetected': 'Tekort gedetecteerd',
    'counting.entryStatus.pending': 'In afwachting',
    'counting.entrySaved': 'Telling opgeslagen',
    'counting.saveFailed': 'Opslaan mislukt',
    'priority.critical': 'Kritiek',
    'priority.high': 'Hoog',
    'priority.medium': 'Middel',
    'priority.low': 'Laag',
    'orderStatus.delivered': 'Geleverd',
    'orderStatus.shipped': 'Verzonden',
    'orderStatus.confirmed': 'Bevestigd',
    'orderStatus.submitted': 'Ingediend',
    'orderStatus.draft': 'Concept',
    'orderStatus.cancelled': 'Geannuleerd',
    'common.typeToConfirm': 'Typ om te bevestigen',
    'device.thisDevice': 'Dit apparaat',
    'device.unknown': 'Onbekend apparaat',
    'upgrade.previewCode': 'Voorbeeldcode',
    'platform.widgets.systemHealth': 'Systeemstatus',
    'platform.widgets.versionInfo': 'Versie-informatie',
    'platform.widgets.auditLogs': 'Auditlogboeken',
    'platform.widgets.customerManagement': 'Klantbeheer',
    'platform.widgets.apiIntegrationStatus': 'API-integratiestatus',
    'platform.widgets.performanceMetrics': 'Prestatiemetrics',
    'platform.widgets.databaseStatus': 'Databasestatus',
    'platform.quickActions.createPractice': 'Praktijk aanmaken',
    'platform.quickActions.systemLogs': 'Systeemlogboeken',
    'platform.quickActions.databaseAdmin': 'Databasebeheer',
    'platform.quickActions.apiDocumentation': 'API-documentatie',
    'platform.quickActions.monitoring': 'Monitoring',
    'platform.quickActions.backupRestore': 'Back-up en herstel',
    'validation.minValue': 'Waarde is te laag',
    'validation.maxValue': 'Waarde is te hoog',
    'validation.arrayMinLength': 'Te weinig items geselecteerd',
    'validation.oneOf': 'Waarde moet een geldige optie zijn',
  };

  const { content, match, obj } = loadNl();

  Object.entries(mapping).forEach(([k, v]) => setNested(obj, k, v));

  writeNl(content, match, obj);
  console.log(`Added/updated ${Object.keys(mapping).length} keys in nl/index.ts`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Failed:', e.message);
    process.exit(1);
  }
}


