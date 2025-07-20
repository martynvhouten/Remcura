# Demo Account Implementation - MedStock Pro

## 🎯 Overzicht

Het demo account systeem stelt gebruikers in staat om MedStock Pro te testen met realistische data
zonder impact op productiegegevens. Het demo account (`demo@medstock-pro.com`) heeft volledige
toegang tot een vooraf geconfigureerde praktijk met realistische medische voorraadgegevens.

## ✨ Kenmerken

### 1. Demo Account Gedrag

- **Email**: `demo@medstock-pro.com`
- **Practice**: Remka Demo Kliniek (ID: `550e8400-e29b-41d4-a716-446655440000`)
- **Rol**: Owner (volledige toegang)
- **Gedrag**: Identiek aan normale gebruiker, geen beperkingen in UI

### 2. Demo Data

- **39 stock level entries** verdeeld over 3 locaties
- **3 locaties**: Hoofdvoorraad, Spoedkast, Behandelkamer 1
- **13 realistische medische producten** (BD spuiten, Ansell handschoenen, etc.)
- **2 suppliers**: Remka B.V. (Magento) & Medishop Direct (Manual)
- **11 orders** met verschillende statussen (delivered, shipped, draft)
- **3+ low stock alerts** voor demonstratie

### 3. UI Indicatoren

- **Demo Banner**: Verschijnt bovenaan voor demo gebruikers
- **Demo Reset Card**: Alleen zichtbaar in Admin Dashboard voor demo user
- **Geen UI beperkingen**: Alle functies werken normaal

## 🔐 RLS Implementatie

### Toegangsbeleid

Het systeem gebruikt een hybride RLS (Row Level Security) benadering:

```sql
-- Voorbeeld: Stock levels policy
CREATE POLICY "stock_levels_select_policy" ON stock_levels
  FOR SELECT USING (
    practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid OR
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );
```

### Demo-specifieke toegang

- Demo practice ID heeft **open toegang** voor alle operaties
- Normale practices vereisen `practice_members` relatie
- Demo user heeft automatisch toegang tot alle demo data

## 🔄 Reset Functionaliteit

### 1. Database Function

```sql
-- Roep de reset functie aan
SELECT reset_demo_data();
```

Deze functie:

- Verwijdert alle demo data in juiste volgorde
- Handhaaft referential integrity
- Geeft status feedback terug

### 2. MCP Script

```bash
# Via npm script
npm run reset-demo
# of
npm run demo:reset

# Via node direct
node scripts/reset-demo-data.js
```

### 3. UI Reset (Admin Dashboard)

- Demo Reset Card alleen zichtbaar voor `demo@medstock-pro.com`
- Confirmation dialog voor veiligheid
- Automatische page refresh na reset

## 🛠️ Technische Details

### Database Schema

- **practice_id**: `550e8400-e29b-41d4-a716-446655440000`
- **demo_user_id**: `550e8400-e29b-41d4-a716-446655440001`
- Alle demo data gebruikt deze UUID's voor consistentie

### Componenten

- `DemoBanner.vue`: Demo indicator in hoofdlayout
- `DemoResetCard.vue`: Reset functionaliteit in admin
- `reset-demo-data.js`: MCP script voor data reset

### I18n Support

- **Nederlands** (hoofdtaal): Volledig vertaald
- **Engels**: Volledig vertaald
- **Spaans**: Volledig vertaald

## 📋 Gebruik

### Voor Demonstraties

1. **Inloggen**: `demo@medstock-pro.com` / `demo123`
2. **Demo banner**: Toont demo status
3. **Volledige functionaliteit**: Alle features beschikbaar
4. **Realistische data**: Authentieke medische voorraad scenario's

### Voor Testing

1. **Volledige CRUD**: Alle operaties mogelijk
2. **Data isolatie**: Demo data gescheiden van productie
3. **Reset mogelijkheid**: Terug naar standaard state
4. **Geen limitaties**: Authentieke user experience

### Voor Development

1. **Consistent data**: Voorspelbare test data
2. **Easy reset**: Snel terug naar baseline
3. **Realistic scenarios**: Echte business cases
4. **Multi-language**: Test alle talen

## 🚀 Deployment Checklist

### Database Setup

- [ ] Demo practice aangemaakt
- [ ] Demo data ingeladen (suppliers, stock, orders)
- [ ] RLS policies geüpdatet
- [ ] Reset function gedeployed

### Frontend Setup

- [ ] Demo banner component geïntegreerd
- [ ] Demo reset card in admin dashboard
- [ ] I18n translations toegevoegd
- [ ] Auth store demo user detection

### Scripts & Automation

- [ ] MCP reset script getest
- [ ] npm scripts toegevoegd
- [ ] Cron job overwogen (optioneel)

## 🔍 Troubleshooting

### Demo user kan niet inloggen

- Controleer of demo user bestaat in `auth.users`
- Verificeer email/password combinatie
- Check RLS policies

### Geen demo data zichtbaar

```sql
-- Verificatie query
SELECT count(*) FROM stock_levels
WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
```

### Reset werkt niet

- Controleer foreign key constraints
- Verifieer functie permissions
- Test handmatige SQL reset

## 📚 Gerelateerde Bestanden

### Frontend

- `src/components/layout/DemoBanner.vue`
- `src/components/admin/DemoResetCard.vue`
- `src/layouts/MainLayout.vue`
- `src/pages/AdminDashboard.vue`
- `src/i18n/*/index.ts`

### Backend/Scripts

- `scripts/reset-demo-data.js`
- Database functies: `reset_demo_data()`
- RLS policies in Supabase

### Configuration

- `package.json` (npm scripts)
- Environment variables (als van toepassing)

---

**Laatste update**: ${new Date().toLocaleDateString('nl-NL')} **Versie**: 1.0.0 **Status**: ✅
Production Ready
