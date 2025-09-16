#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const NL_FILE = path.join(__dirname, '../src/i18n/nl/index.ts');

const mappings = [
  ['settings.shadowsSection', 'Schaduwen'],
  ['settings.iconsSection', 'Iconen'],
  ['orderLists.emptyFiltered', 'Geen lijsten voor deze filters'],
  ['orderLists.empty', 'Nog geen bestellijsten'],
  ['orderLists.tryOtherFilters', 'Probeer andere filters'],
  ['orderLists.createFirstList', 'Maak je eerste bestellijst'],
  ['orderLists.newList', 'Nieuwe lijst'],
  ['orderLists.globalAdvice', 'Algemeen besteladvies'],
  ['orderLists.orderAll', 'Alles bestellen'],
  ['orderLists.deleteConfirmText', 'Weet je zeker dat je deze bestellijst wilt verwijderen? Dit kan niet ongedaan worden gemaakt.'],
  ['common.duplicate', 'Dupliceren'],
  ['orderLists.addProductSubtitle', 'Zoek en voeg producten toe aan de lijst'],
  ['products.search', 'Producten zoeken'],
  ['orderLists.recommendedQty', 'Aanbevolen hoeveelheid'],
  ['orderLists.confirmPlaceAllTitle', 'Alle bestellingen plaatsen?'],
  ['orderLists.confirmPlaceAllBody', 'Weet je zeker dat je alle items in deze lijst wilt bestellen?'],
  ['orderLists.ordersCreated', 'Bestellingen aangemaakt'],
  ['notificationsPage.markReadError', 'Melding als gelezen markeren mislukt'],
  ['notificationsPage.markUnreadError', 'Melding als ongelezen markeren mislukt'],
  ['notificationsPage.markAllReadError', 'Alle meldingen als gelezen markeren mislukt'],
  ['notificationsPage.deleteNotificationError', 'Verwijderen van melding mislukt'],
  ['notificationsPage.clearAllError', 'Alle meldingen wissen mislukt'],
  ['platform.errors.loadFailed', 'Laden mislukt'],
  ['platform.messages.refreshed', 'Gegevens ververst'],
  ['platform.messages.configureWidget', 'Configureer deze widget'],
  ['inventory.movements.loadError', 'Laden van mutaties mislukt'],
  ['counting.entriesLoadFailed', 'Tellingsitems laden mislukt'],
  ['common.undo', 'Ongedaan maken'],
  ['common.changesReverted', 'Wijzigingen ongedaan gemaakt'],
  ['common.actionFailed', 'Actie mislukt'],
  ['demo.clinicName', 'Demopraktijk'],
  ['batch.expiryDatePastError', 'Vervaldatum mag niet in het verleden liggen'],
  ['common.unknown', 'Onbekend'],
  ['platform.metrics.compliance', 'Compliance'],
  ['platform.metrics.health', 'Gezondheid'],
  ['platform.metrics.progress', 'Voortgang'],
  ['inventory.transferCompletedDetails', 'Voorraadoverdracht voltooid'],
  ['counting.overageDetected', 'Overschot gedetecteerd'],
  ['counting.shortageDetected', 'Tekort gedetecteerd'],
  ['counting.entryStatus.pending', 'In afwachting'],
  ['counting.entrySaved', 'Telling opgeslagen'],
  ['counting.saveFailed', 'Opslaan mislukt'],
  ['priority.critical', 'Kritiek'],
  ['priority.high', 'Hoog'],
  ['priority.medium', 'Middel'],
  ['priority.low', 'Laag'],
  ['orderStatus.delivered', 'Geleverd'],
  ['orderStatus.shipped', 'Verzonden'],
  ['orderStatus.confirmed', 'Bevestigd'],
  ['orderStatus.submitted', 'Ingediend'],
  ['orderStatus.draft', 'Concept'],
  ['orderStatus.cancelled', 'Geannuleerd'],
  ['common.typeToConfirm', 'Typ om te bevestigen'],
  ['device.thisDevice', 'Dit apparaat'],
  ['device.unknown', 'Onbekend apparaat'],
  ['upgrade.previewCode', 'Voorbeeldcode'],
  ['platform.widgets.systemHealth', 'Systeemstatus'],
  ['platform.widgets.versionInfo', 'Versie-informatie'],
  ['platform.widgets.auditLogs', 'Auditlogboeken'],
  ['platform.widgets.customerManagement', 'Klantbeheer'],
  ['platform.widgets.apiIntegrationStatus', 'API-integratiestatus'],
  ['platform.widgets.performanceMetrics', 'Prestatiemetrics'],
  ['platform.widgets.databaseStatus', 'Databasestatus'],
  ['platform.quickActions.createPractice', 'Praktijk aanmaken'],
  ['platform.quickActions.systemLogs', 'Systeemlogboeken'],
  ['platform.quickActions.databaseAdmin', 'Databasebeheer'],
  ['platform.quickActions.apiDocumentation', 'API-documentatie'],
  ['platform.quickActions.monitoring', 'Monitoring'],
  ['platform.quickActions.backupRestore', 'Back-up en herstel'],
  ['validation.minValue', 'Waarde is te laag'],
  ['validation.maxValue', 'Waarde is te hoog'],
  ['validation.arrayMinLength', 'Te weinig items geselecteerd'],
  ['validation.oneOf', 'Waarde moet een geldige optie zijn'],
];

function main() {
  let content = fs.readFileSync(NL_FILE, 'utf8');
  const missingPairs = mappings.filter(([k]) => !content.includes(`'${k}'`));
  if (missingPairs.length === 0) {
    console.log('No new keys to append.');
    return;
  }

  const insertBlock = missingPairs
    .map(([k, v]) => `  '${k}': '${String(v).replace(/'/g, "\\'")}',`)
    .join('\n');

  const lastClose = content.lastIndexOf('};');
  if (lastClose === -1) {
    throw new Error('Could not find export default closing in nl/index.ts');
  }

  // Insert before the last '};'
  content = `${content.slice(0, lastClose)}${insertBlock}\n${content.slice(
    lastClose
  )}`;

  fs.writeFileSync(NL_FILE, content, 'utf8');
  console.log(`Appended ${missingPairs.length} keys.`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Failed to append keys:', e.message);
    process.exit(1);
  }
}


