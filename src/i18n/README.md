# Remcura i18n System v2.0

## 📚 Overzicht

Dit document beschrijft het geoptimaliseerde internationalisatie (i18n) systeem van Remcura v2.0 met geavanceerde features voor ontwikkelaars en automatische workflows.

## 🌍 Ondersteunde Talen

- **Nederlands (nl)** - Primaire/Master taal ⭐
- **Engels (en)** - Fallback taal 
- **Spaans (es)** - Aanvullende taal

## 📁 Verbeterde Structuur

```
src/i18n/
├── index.ts          # Hoofd configuratie + lazy loading
├── en/
│   ├── index.ts      # Engelse vertalingen
│   └── filters.ts    # Engelse filter vertalingen
├── nl/ 
│   ├── index.ts      # Nederlandse vertalingen (master)
│   └── filters.ts    # Nederlandse filter vertalingen
├── es/
│   ├── index.ts      # Spaanse vertalingen  
│   └── filters.ts    # Spaanse filter vertalingen
└── README.md         # Deze documentatie
```

## ✨ Nieuwe Features v2.0

### 🔧 Runtime Detectie
- **Development warnings**: Zichtbare `[MISSING: key]` placeholders
- **Console logging**: Automatische warnings voor ontbrekende vertalingen
- **Environment aware**: Alleen actief in development modus

### 🚀 Performance Optimalisaties
- **Lazy loading**: Vertalingen worden asynchroon geladen in production
- **Smart caching**: Eenmaal geladen talen blijven in geheugen
- **Development mode**: Alle talen vooraf geladen voor betere DX

### 🤖 Geautomatiseerde Workflows
- **Pre-commit hooks**: Automatische validatie bij git commits
- **Hardcoded text detection**: Vindt en kan automatisch vervangen
- **Language synchronization**: Nederlands als master voor andere talen

## 🛠️ Configuratie

### i18n Setup
```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
  locale: getSavedLocale(),     // Opgeslagen of standaard 'nl'
  fallbackLocale: 'en',        // Engels als fallback
  messages,                    // Alle vertalingen
  legacy: true,                // Voor Quasar compatibiliteit
  globalInjection: true,       // $t beschikbaar in alle componenten
});
```

### Taal Wisselen (v2.0)
```typescript
import { setI18nLanguage, loadLanguageAsync } from '@/i18n';

// Async taal wisselen (ondersteunt lazy loading)
await setI18nLanguage('nl');

// Handmatig een taal preloaden
await loadLanguageAsync('es');

// Alle talen preloaden voor offline gebruik
import { preloadAllLanguages } from '@/i18n';
await preloadAllLanguages();
```

## 💻 Gebruik in Code

### Vue Templates
```vue
<template>
  <!-- Simpele vertalingen -->
  <h1>{{ $t('nav.dashboard') }}</h1>
  
  <!-- Met parameters -->
  <p>{{ $t('common.welcome', { name: userName }) }}</p>
  
  <!-- In attributen -->
  <input :placeholder="$t('common.search')" />
  
  <!-- Met interpolatie -->
  <span>{{ $t('batch.expiresInDays', { days: 5 }) }}</span>
</template>
```

### Script Setup
```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Gebruik in JavaScript  
const message = t('common.success');

// Met parameters
const greeting = t('common.welcome', { name: 'John' });

// Conditionele vertalingen
const buttonText = isEditing.value 
  ? t('common.update') 
  : t('common.create');
```

### Quasar Notificaties
```typescript
$q.notify({
  type: 'positive',
  message: t('batch.batchRegistered'),
  position: 'top',
});
```

## 📋 Vertaalstructuur

### Algemene Conventies
- Gebruik **camelCase** voor keys
- Groepeer gerelateerde vertalingen in objecten
- Houd keys beschrijvend maar beknopt
- Gebruik consistente terminologie

### Hoofdcategorieën
```typescript
{
  // Algemene UI elementen
  common: {
    ok: 'OK',
    cancel: 'Annuleren',
    // ...
  },
  
  // Navigatie
  nav: {
    dashboard: 'Dashboard',
    orders: 'Bestellingen',
    // ...
  },
  
  // Authenticatie
  auth: {
    login: 'Inloggen',
    logout: 'Uitloggen',
    // ...
  },
  
  // Feature-specifieke vertalingen
  batch: {
    batchManagement: 'Batch beheer',
    registerBatch: 'Batch registreren',
    // ...
  },
  
  // Validatie berichten
  validation: {
    required: 'Dit veld is verplicht',
    email: 'Voer een geldig e-mailadres in',
    // ...
  },
  
  // Error berichten
  errors: {
    generic: 'Er is een fout opgetreden',
    network: 'Netwerkfout',
    // ...
  }
}
```

## 🔧 Validatie & Automatisering Tools

### ⚡ Nieuwe Automated Workflows
```bash
# 🔍 VALIDATIE & CONTROLE
npm run i18n:validate           # Controleer consistentie tussen talen
npm run i18n:find-hardcoded     # Vind hardcoded teksten
npm run i18n:check              # Voer volledige controle uit

# 🤖 AUTOMATISCHE FIXES  
npm run i18n:fix-hardcoded-dry  # Preview van hardcoded text fixes
npm run i18n:fix-hardcoded      # Voer automatische fixes uit
npm run i18n:sync               # Sync alle talen met Nederlandse master

# 📊 LEGACY TRANSLATION MANAGER
npm run translations:status     # Status van alle vertalingen  
npm run translations:critical   # Voeg alleen kritieke vertalingen toe
npm run translations:complete   # Vul alle ontbrekende vertalingen aan
```

### 🔄 Git Workflow Integration
Het systeem heeft nu **automatische pre-commit hooks** die bij elke commit:
- i18n validatie uitvoeren
- Hardcoded teksten detecteren in gewijzigde bestanden  
- Voorkomen dat inconsistenties in production komen

```bash
# Setup (eenmalig na clone)
npm install  # Husky hooks worden automatisch geïnstalleerd

# Normale workflow - hooks draaien automatisch
git add .
git commit -m "feat: nieuwe feature"  # ← Validatie draait automatisch
```

### Validatie Script Output
```
🔍 Remcura Vertaling Validator

📂 Laden EN...
   ✅ 847 keys gevonden
📂 Laden NL...  
   ✅ 891 keys gevonden
📂 Laden ES...
   ✅ 823 keys gevonden

📊 Totaal unieke keys: 891

🔍 ES Analyse:
   📋 Keys aanwezig: 823
   ❌ Keys ontbrekend: 68
   🚨 Eerste 10 ontbrekende keys:
      - common.unknownSupplier
      - common.uncategorized
      - product.product
      - location.location
      ...
```

## 🚨 Veelvoorkomende Problemen

### 1. Ontbrekende Vertalingen
**Probleem**: `$t('some.key')` toont de key in plaats van tekst
**Oplossing**: 
- Controleer of de key bestaat in alle taalbestanden
- Run `npm run i18n:validate` om missende keys te vinden
- Voeg ontbrekende vertalingen toe

### 2. Hardcoded Teksten
**Probleem**: Tekst verschijnt niet in andere talen
**Oplossing**:
- Run `npm run i18n:find-hardcoded` om hardcoded teksten te vinden
- Vervang hardcoded strings door `$t()` calls
- Voeg vertalingen toe aan alle taalbestanden

### 3. TypeScript Errors
**Probleem**: Linter errors over duplicate properties
**Oplossing**:
- Controleer op dubbele keys in vertaalbestanden
- Gebruik de validatie tool om duplicaten te detecteren
- Verwijder of hernoem duplicaten

### 4. Fallback Werkt Niet
**Probleem**: Lege tekst in plaats van Engels fallback
**Oplossing**:
- Zorg dat de key bestaat in het Engels bestand
- Controleer fallbackLocale configuratie
- Test met `t.te('key.name')` of key bestaat

## ✅ Best Practices

### 1. Nieuwe Vertalingen Toevoegen
```typescript
// ❌ FOUT: Hardcoded tekst
<q-btn label="Nieuwe batch toevoegen" />

// ✅ GOED: Met vertaling  
<q-btn :label="$t('batch.addNewBatch')" />
```

### 2. Parameters Gebruiken
```typescript
// ❌ FOUT: String concatenatie
const message = 'Er zijn ' + count + ' items gevonden';

// ✅ GOED: Met parameters
const message = t('search.itemsFound', { count });

// In vertaalbestand:
// search: {
//   itemsFound: 'Er zijn {count} items gevonden'
// }
```

### 3. Consistente Terminologie
```typescript
// ✅ GOED: Gebruik dezelfde termen
common: {
  save: 'Opslaan',      // Overal 'Opslaan'
  cancel: 'Annuleren',  // Overal 'Annuleren'  
  edit: 'Bewerken',     // Overal 'Bewerken'
}

// ❌ FOUT: Verschillende termen voor hetzelfde
// 'Opslaan', 'Bewaren', 'Sla op'
```

### 4. Toegankelijkheid
```vue
<!-- ✅ GOED: Vertaal aria-labels -->
<button 
  :aria-label="$t('common.accessibility.closeDialog')"
  @click="closeDialog"
>
  <q-icon name="close" />
</button>
```

## 🔄 Geoptimaliseerde Workflow v2.0

### 🚀 Voor Nieuwe Features
1. **Ontwikkel met Nederlandse teksten**
   ```vue
   <!-- Tijdelijk tijdens ontwikkeling -->
   <q-btn label="Nieuwe functie" />
   ```

2. **Automatische detectie & fix**
   ```bash
   # Stap 1: Detecteer hardcoded teksten
   npm run i18n:fix-hardcoded-dry
   
   # Stap 2: Automatisch vervangen (indien gewenst)
   npm run i18n:fix-hardcoded
   ```

3. **Sync alle talen vanuit Nederlands**
   ```bash
   # Nederlands is master - andere talen worden automatisch gesynchroniseerd
   npm run i18n:sync
   ```

4. **Automatische validatie**
   ```bash
   # Pre-commit hooks valideren automatisch, maar je kunt ook handmatig:
   npm run i18n:check
   ```

### 🔧 Voor Onderhoudswerk
```bash
# 📊 Huidige status bekijken
npm run i18n:validate

# 🔍 Hardcoded tekst zoeken  
npm run i18n:find-hardcoded

# 🤖 Automatisch repareren
npm run i18n:fix-hardcoded-dry  # Preview eerst
npm run i18n:fix-hardcoded      # Daadwerkelijk uitvoeren

# 🔄 Alles synchroniseren
npm run i18n:sync               # Nederlands → Engels/Spaans
```

## 🛡️ CI/CD Integratie v2.0

### ✅ Geïnstalleerde Pre-commit Hooks
Het systeem is nu voorzien van automatische **Husky pre-commit hooks**:

**.husky/pre-commit** (automatisch geïnstalleerd):
- ✅ `lint-staged` voor gewijzigde bestanden
- ✅ i18n validatie bij i18n wijzigingen  
- ✅ Hardcoded text detectie in staged bestanden
- ✅ Cross-platform compatibiliteit (Windows/Mac/Linux)

### Aanbevolen GitHub Actions
```yaml
# .github/workflows/i18n-validation.yml
name: i18n Quality Check
on: [push, pull_request]
jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run i18n:check
      - run: npm run i18n:fix-hardcoded-dry  # Preview mode alleen
```

## 📊 Metrics & Monitoring

### Vertaling Management v2.0
- **Nederlandse vertalingen**: 100% (master taal) ⭐
- **Automatische synchronisatie**: Engels & Spaans volgen Nederlands
- **Lazy loading**: ~67% bundle size reductie in production
- **Performance**: < 100ms taal switching met caching

### Geautomatiseerde Kwaliteitscontroles
- ✅ **Pre-commit hooks**: Husky + lint-staged geïnstalleerd
- ✅ **Runtime detectie**: Development warnings voor missing keys  
- ✅ **Hardcoded text scanning**: Automatische detectie + fixes
- ✅ **Master-slave sync**: Nederlands → andere talen
- ✅ **Cross-platform**: Windows/Mac/Linux support

## 🎯 Samenvatting v2.0 Verbeteringen

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Runtime detectie** | ❌ Geen feedback | ✅ Visuele placeholders + console warnings |
| **Performance** | ❌ Alle talen vooraf geladen | ✅ Lazy loading in production |
| **Workflow** | ❌ Handmatige sync | ✅ Automatische pre-commit validation |
| **Hardcoded text** | ❌ Handmatig zoeken | ✅ Automatische detectie + replacement |
| **Taalsync** | ❌ Elk bestand apart | ✅ Nederlands master → auto sync |
| **Bestandsstructuur** | ❌ Dubbele directories | ✅ Gecleande structure |
| **Developer Experience** | ⚠️ Basis | ✅ Uitgebreide tooling + automation |

### 🚀 Quick Start voor Developers
```bash
# 1. Clone project & install
npm install  # Pre-commit hooks worden automatisch geïnstalleerd

# 2. Ontwikkel met Nederlandse teksten (hardcoded oké tijdens development)
# ...schrijf je feature...

# 3. Voor commit: automatische cleanup
npm run i18n:fix-hardcoded-dry    # Preview wat er vervangen wordt
npm run i18n:fix-hardcoded        # Vervang hardcoded tekst automatisch  
npm run i18n:sync                 # Sync alle talen

# 4. Commit - validatie draait automatisch!
git add .
git commit -m "feat: nieuwe feature"
```

---

*🎉 **i18n System v2.0**: Volledig geautomatiseerd, lazy loading, development-vriendelijk, en productie-klaar!* 