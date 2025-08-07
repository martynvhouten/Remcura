# 🛠️ Remcura Scripts

Professional utility scripts voor Remcura medical inventory management system.

## 📋 Overzicht

Deze folder bevat geoptimaliseerde, production-ready scripts voor het beheren van verschillende
aspecten van het Remcura systeem. Alle scripts zijn zorgvuldig getest en geoptimaliseerd voor
maximale efficiëntie en veiligheid.

## 🌟 Scripts

### 1. **Translation Manager** - `remcura-translation-manager.js`

**De ultieme all-in-one translation management tool**

- **Grootte**: 17KB, 507 regels
- **Functionaliteit**: Complete translation lifecycle management
- **Ondersteunt**: NL (reference), EN, ES

**Features:**

- ✅ Intelligente translation parsing
- ✅ Bulk translation completion
- ✅ Critical key management
- ✅ Safe syntax handling
- ✅ Pattern-based translation mapping
- ✅ Comprehensive validation

**Gebruik:**

```bash
# Status controleren
npm run translations:status

# Alleen kritieke vertalingen toevoegen
npm run translations:critical

# Alle ontbrekende vertalingen aanvullen
npm run translations:complete

# Help tonen
npm run translations:help
```

**Direct gebruik:**

```bash
node scripts/remcura-translation-manager.js --validate
node scripts/remcura-translation-manager.js --critical
node scripts/remcura-translation-manager.js --complete
```

---

### 2. **Translation Validator** - `validate-translations.js`

**Backup validation tool voor translation completeness**

- **Grootte**: 5.2KB, 185 regels
- **Functionaliteit**: Status monitoring en duplicate detection
- **Gebruik**: Backup validator en legacy support

**Gebruik:**

```bash
npm run i18n:validate
# of direct:
node scripts/validate-translations.js
```

---

### 3. **Demo Data Manager** - `reset-demo-data.js`

**Demo environment management tool**

- **Grootte**: 8.0KB, 207 regels
- **Functionaliteit**: Demo data reset en initialisatie
- **Gebruik**: Development en testing environments

**Gebruik:**

```bash
npm run reset-demo
npm run demo:reset
# of direct:
node scripts/reset-demo-data.js
```

---

### 4. **Hardcoded Text Finder** - `find-hardcoded-text.js`

**Development tool voor het vinden van hardcoded text**

- **Grootte**: 7.9KB, 273 regels
- **Functionaliteit**: Scan codebase voor hardcoded strings
- **Gebruik**: I18n quality assurance

**Gebruik:**

```bash
npm run i18n:find-hardcoded
# of direct:
node scripts/find-hardcoded-text.js
```

## 🚀 NPM Scripts

### Translation Management

```bash
npm run translations:status     # Check translation status
npm run translations:critical   # Add critical translations
npm run translations:complete   # Complete all translations
npm run translations:help       # Show help
```

### Legacy I18n Tools

```bash
npm run i18n:validate          # Backup validator
npm run i18n:find-hardcoded    # Find hardcoded text
npm run i18n:check             # Full i18n check
```

### Quality Assurance

```bash
npm run quality:i18n           # Complete translation QA
```

### Demo Management

```bash
npm run reset-demo             # Reset demo data
npm run demo:reset             # Alternative demo reset
```

## 📊 Translation Management Workflow

### 1. **Status Check** (Altijd eerst)

```bash
npm run translations:status
```

Toont complete overview van translation completeness per taal.

### 2. **Critical Updates** (Aanbevolen)

```bash
npm run translations:critical
```

Voegt alleen de meest kritieke user-facing vertalingen toe.

### 3. **Complete Update** (Indien nodig)

```bash
npm run translations:complete
```

Vult alle ontbrekende vertalingen aan met intelligente mapping.

### 4. **Quality Check** (Voor release)

```bash
npm run quality:i18n
```

Complete translation en hardcoded text check.

## 🔧 Technische Details

### Translation Parser

- **Advanced TypeScript parsing**: Detecteert nested object structures
- **Multiple regex patterns**: Comprehensive key extraction
- **Safe syntax handling**: Voorkomt syntax errors
- **Intelligent fallbacks**: Multiple translation strategies

### Supported Languages

- **NL** (Nederlands) - Reference language
- **EN** (English) - Primary international
- **ES** (Español) - Secondary international

### Files Managed

```
src/i18n/
├── nl/index.ts    # Reference (Dutch)
├── en/index.ts    # English translations
└── es/index.ts    # Spanish translations
```

## 📈 Performance

| Script              | Execution Time | Memory Usage | Lines Processed |
| ------------------- | -------------- | ------------ | --------------- |
| Translation Manager | ~2-5s          | ~50MB        | 3000+ keys      |
| Validator           | ~1-2s          | ~20MB        | 1500+ keys      |
| Demo Reset          | ~1s            | ~10MB        | 100+ records    |
| Hardcoded Finder    | ~3-8s          | ~30MB        | 5000+ files     |

## 🔒 Safety Features

- **Backup creation**: Automatische `.backup` files
- **Syntax validation**: Pre-write validation
- **Safe insertion**: Alleen aan einde van files
- **Error handling**: Graceful failure met rollback
- **Dry-run mode**: Test mode voor verificatie

## 🏗️ Architecture

### Cleanup History

**Van 9 scripts naar 4 geoptimaliseerde tools:**

**VERWIJDERD** (duplicates/problemen):

- ❌ `ultimate-translation-completer.js` - Syntax errors
- ❌ `complete-all-translations.js` - Duplicaat functionaliteit
- ❌ `auto-translate-spanish.js` - Geannuleerd door gebruiker
- ❌ `perfect-translation-fixer.js` - Geïntegreerd in master
- ❌ `final-translation-cleanup.js` - Geïntegreerd in master
- ❌ `ultimate-translation-master.js` - Vervangen door v2.0

**GEOPTIMALISEERD** (behouden):

- ✅ `remcura-translation-manager.js` - **Master tool v2.0**
- ✅ `validate-translations.js` - Backup validator
- ✅ `reset-demo-data.js` - Demo management
- ✅ `find-hardcoded-text.js` - Development tool

## 🎯 Best Practices

### Voor Developers

1. **Altijd eerst** `npm run translations:status`
2. **Test lokaal** voor critical updates
3. **Commit frequent** na translation updates
4. **Check quality** voor elke release

### Voor Releases

1. `npm run quality:i18n` - Full check
2. `npm run translations:critical` - Essentials
3. Commit en test volledig
4. Production deployment

### Voor Onderhoud

1. **Wekelijks**: Translation status check
2. **Maandelijks**: Complete translation audit
3. **Per release**: Quality assurance run
4. **Bij nieuwe features**: Critical translations eerst

## 📚 Gerelateerde Documentatie

- **[Translation Guidelines](../docs/i18n-guidelines.md)** - Best practices
- **[Development Setup](../docs/development.md)** - Environment setup
- **[Quality Assurance](../docs/quality.md)** - QA procedures

## 🔄 Versie Historie

### v2.0 (Huidige)

- ✅ Geoptimaliseerde master tool
- ✅ 6 duplicate scripts verwijderd
- ✅ NPM scripts georganiseerd
- ✅ Performance verbeteringen

### v1.x (Legacy)

- Multiple specialized scripts
- Manual coordination vereist
- Beperkte error handling

---

## 🆘 Support

Voor vragen of problemen met de scripts:

1. **Check eerst**: `npm run translations:help`
2. **Status check**: `npm run translations:status`
3. **Log issues**: Met output van bovenstaande commands
4. **Contact**: Development team voor complexe problemen

---

**🌟 Remcura Scripts v2.0** - _Production-ready translation management_
