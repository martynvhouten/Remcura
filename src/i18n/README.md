# MedStock Pro i18n System

## 📚 Overzicht

Dit document beschrijft het internationalisatie (i18n) systeem van MedStock Pro en hoe je het kunt gebruiken en onderhouden.

## 🌍 Ondersteunde Talen

- **Nederlands (nl)** - Primaire taal
- **Engels (en)** - Fallback taal  
- **Spaans (es)** - Aanvullende taal

## 📁 Structuur

```
src/i18n/
├── index.ts          # Hoofd configuratie
├── en/
│   └── index.ts      # Engelse vertalingen
├── nl/ 
│   └── index.ts      # Nederlandse vertalingen
├── es/
│   └── index.ts      # Spaanse vertalingen
└── README.md         # Deze documentatie
```

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

### Taal Wisselen
```typescript
import { setI18nLanguage } from '@/i18n';

// Wissel naar Nederlands
setI18nLanguage('nl');

// Wissel naar Engels  
setI18nLanguage('en');
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

## 🔧 Validatie Tools

### Automatische Controles
```bash
# Controleer consistentie tussen talen
npm run i18n:validate

# Vind hardcoded teksten die vertalingen zouden moeten zijn  
npm run i18n:find-hardcoded

# Voer beide controles uit
npm run i18n:check
```

### Validatie Script Output
```
🔍 MedStock Pro Vertaling Validator

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

## 🔄 Workflow voor Nieuwe Features

1. **Ontwikkel met Nederlandse teksten**
   ```vue
   <!-- Tijdelijk tijdens ontwikkeling -->
   <q-btn label="Nieuwe functie" />
   ```

2. **Extraheer naar vertalingen**
   ```vue
   <!-- Update naar vertalingen -->
   <q-btn :label="$t('feature.newFunction')" />
   ```

3. **Voeg toe aan alle talen**
   ```typescript
   // nl/index.ts
   feature: {
     newFunction: 'Nieuwe functie'
   }
   
   // en/index.ts  
   feature: {
     newFunction: 'New function'
   }
   
   // es/index.ts
   feature: {
     newFunction: 'Nueva función'
   }
   ```

4. **Valideer consistentie**
   ```bash
   npm run i18n:validate
   npm run i18n:find-hardcoded
   ```

## 🛡️ CI/CD Integratie

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run i18n:check
```

### GitHub Actions
```yaml
# .github/workflows/i18n-check.yml
name: i18n Validation
on: [push, pull_request]
jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run i18n:check
```

## 📊 Metrics & Monitoring

### Vertaling Completeness
- **Nederlandse vertalingen**: 100% (primair)
- **Engelse vertalingen**: 95% (fallback)  
- **Spaanse vertalingen**: 92% (aanvullend)

### Automatische Controles
- Dagelijkse validatie van vertaalconsistentie
- Pre-commit hooks voor hardcoded tekst detectie
- CI/CD pipeline validatie

---

*Voor vragen over het i18n systeem, raadpleeg dit document of run de validatie tools.* 