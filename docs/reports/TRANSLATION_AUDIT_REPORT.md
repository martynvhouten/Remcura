# 🔍 **COMPLETE TRANSLATION AUDIT REPORT**

## 📊 **HUIDIGE SITUATIE ANALYSE**

### ✅ **WAT GOED IS:**
1. **Structuur is eigenlijk PRIMA:**
   - `filters.ts` apart houden is slim (modulair)
   - Nederlandse structuur is logisch: `brand`, `clinic`, `common`, etc.
   - Components gebruiken juiste namespacing: `$t('common.cancel')`, `$t('batch.usage.expired')`

2. **Scripts die GOED zijn:**
   - `find-hardcoded-text.js` ✅ - Identificeert missing keys perfect
   - `validate-translations.js` ✅ - Simpel en nuttig voor overzicht
   - `remcura-translation-manager.js` ✅ - Complex maar functioneel

### 🚨 **ECHTE PROBLEMEN:**

#### **KERN PROBLEEM: 469 HARDCODED TEKSTEN**
```
🔥 Hoge prioriteit: 1 items (user-facing)
⚠️ Gemiddelde prioriteit: 93 items (interface)  
ℹ️ Lage prioriteit: 375 items (debug/internal)
```

**Dit verklaart waarom er nog keys zichtbaar zijn in de app!**

#### **KRITIEKE MISSING KEYS:**
- `quickAdjustment.noProduct` (zichtbaar in UI)
- `auth.fullName`, `auth.email` (settings page)
- `settings.role` (settings page)
- Veel `batch.usage.*` keys (UseBatchDialog)
- Alert/confirmation dialogs
- Form validation berichten

### 📋 **TOP PRIORITEIT BESTANDEN:**
1. `QuickAdjustmentDialog.vue` - 1 hardcoded key (DIRECT user-facing)
2. `SettingsPage.vue` - Gebruikt `auth.*`, `settings.*` keys die niet bestaan
3. `UseBatchDialog.vue` - `batch.usage.*`, `batch.confirmUsage` keys
4. `ConfirmDialog.vue` - Standaard confirmation teksten
5. `FormDialog.vue` - Form buttons en validatie

## 🎯 **MASTER PLAN**

### **FASE 1: NEDERLANDS COMPLEET MAKEN**
1. **Analyseer alle 94 user-facing hardcoded teksten**
2. **Voeg missing namespaces toe:**
   - `auth: { fullName, email, ... }`
   - `settings: { role, ... }`  
   - `batch: { usage: {}, confirmUsage, ... }`
   - `quickAdjustment: { noProduct, ... }`
3. **Vul filters.ts verder aan** (die is al goed gestructureerd)

### **FASE 2: STRUCTUUR OPTIMALISEREN**
1. **Behoud huidige structuur** (is goed!)
2. **filters.ts blijft apart** (modulair)
3. **Scripts cleanup:**
   - Behoud: find-hardcoded-text.js, validate-translations.js, remcura-translation-manager.js
   - Verwijder: tijdelijke/oude scripts

### **FASE 3: WORKFLOW OPTIMALISEREN**
1. **Master workflow:** Nederlands → andere talen
2. **Automatische sync** via remcura-translation-manager.js
3. **Regelmatige hardcoded text scans**

### **FASE 4: ANDERE TALEN**
1. **Engels**: Sync + quality check
2. **Spaans**: Sync + quality check

## 🛠️ **ACTIESTAPPEN**

### **STAP 1: Missing Keys Identificeren**
```bash
# Alle user-facing hardcoded teksten analyseren
node scripts/find-hardcoded-text.js
```

### **STAP 2: Nederlandse Keys Toevoegen**
- `auth.*` namespace aanmaken
- `settings.*` namespace aanmaken  
- `batch.usage.*` namespace uitbreiden
- `quickAdjustment.*` namespace aanmaken
- Validation messages toevoegen

### **STAP 3: Scripts Cleanup**
- Alleen translation-gerelateerde scripts behouden
- Workflow documenteren

### **STAP 4: Quality Assurance**
```bash
# Valideren dat alles werkt
node scripts/validate-translations.js
node scripts/find-hardcoded-text.js # Moet 0 user-facing items zijn
```

## 💡 **INZICHTEN**

1. **Het probleem was NIET de structuur** - die is prima
2. **Het probleem was NIET de scripts** - die werken goed  
3. **Het echte probleem:** Nederlandse basis is **incomplete**
4. **Components zijn al goed opgezet** voor namespaced keys
5. **filters.ts modulair houden is slim**

## ✅ **VERWACHT RESULTAAT**

Na deze aanpak:
- ✅ **0 hardcoded user-facing teksten**
- ✅ **Complete Nederlandse basis** (alle namespaces)
- ✅ **Efficiënte workflow** voor toekomst
- ✅ **Automatische sync** naar andere talen
- ✅ **Modulaire, onderhoudbare structuur**

**DIT IS DE JUISTE AANPAK!** 🎯