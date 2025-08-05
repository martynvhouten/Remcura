# Dialog Standaardisatie Status

## ✅ Voltooid

### Gemigreerde Dialogs
1. **ProductsPage** - Delete confirmation → `ConfirmDialog`
2. **BatchOverview** - Batch details → `BaseDialog` 
3. **DashboardPage** - Customize dialog → `BaseDialog`
4. **InventoryLevelsPage** - Stock adjustment → `FormDialog`
5. **MovementsPage** - Movement details → `BaseDialog`
6. **OrdersPage** - Export dialog → `FormDialog`
7. **SuppliersPage** - Add/Edit supplier → `FormDialog`
8. **BatchManagementPage** - Batch detail dialog → `BaseDialog`
9. **OrderListDetailPage** - Add product dialog → `FormDialog`

### Bestaande Gestandaardiseerde Dialogs
- **ProductFormDialog** - Al gebaseerd op `BaseDialog`
- **ConfirmDialog** - Herbruikbare bevestigingsdialog
- **FormDialog** - Herbruikbare formulierdialog
- **BaseDialog** - Basis dialog component

## 🔄 Nog te Migreren

### Eenvoudige Dialogs (Prioriteit: Hoog)
- **BatchManagementPage** - Add batch dialog, Scanner dialog
- **OrderListsPage** - Global advice dialog  
- **MagicJoinPage** - QR scanner dialog, Welcome dialog
- **Admin/TeamOverview** - Code dialog
- **Admin/MagicInviteManager** - QR dialog

### Complexe Dialogs (Prioriteit: Medium)
- **OrderListsPage** - Mobile counting interface (full-screen)
- **OrdersPage** - Analytics dialog (maximized)
- **SuppliersPage** - Integration configuration dialog
- **AdvancedSearchDialog** - Zeer complexe zoekdialog
- **ProductDetailsDialog** - Product details weergave
- **ShoppingCartDialog** - Winkelwagen functionaliteit
- **OrderListDialog** - Bestellijst beheer

### Component Dialogs (Prioriteit: Laag)
- **BarcodeScanner** - Scanner interface
- **UpgradeToMemberDialog** - Account upgrade
- **QuickAdjustmentDialog** - Snelle voorraadaanpassing
- **StockTransferDialog** - Voorraad transfer
- **MobileStockCountingInterface** - Mobiele telling interface

## 🎯 Voordelen van Standaardisatie

### Consistentie
- Uniforme styling en spacing
- Consistente button plaatsing en kleuren
- Standaard iconografie en typografie

### Toegankelijkheid
- ARIA labels en focus management
- Keyboard navigatie ondersteuning
- Screen reader vriendelijk

### Onderhoudbaarheid
- Centraal beheer van dialog styling
- Herbruikbare componenten
- Minder duplicate code

### User Experience
- Responsive design voor alle apparaten
- Dark mode ondersteuning
- Smooth animaties en transities
- Loading states en error handling

## 📋 Volgende Stappen

1. **Migreer eenvoudige dialogs** - Begin met BatchManagementPage dialogs
2. **Test functionaliteit** - Zorg dat alle bestaande functionaliteiten blijven werken
3. **Verwijder duplicate CSS** - Clean up oude dialog styles
4. **Documenteer patterns** - Maak richtlijnen voor toekomstige dialogs
5. **Performance optimalisatie** - Lazy loading voor grote dialogs

## 🛠️ Technische Details

### Design System Variabelen
- `--space-*` voor consistente spacing
- `--radius-*` voor border radius
- `--neutral-*` en `--brand-*` voor kleuren
- `--text-*` voor font sizes
- `--font-weight-*` voor typography

### Component Props
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'standard' | 'modern' | 'glass'
- `icon`: Material Design icon naam
- `persistent`: Boolean voor modal gedrag
- `loading`: Boolean voor loading states

### Responsive Breakpoints
- Mobile: < 640px (stack buttons, full width)
- Tablet: 640px - 1024px (responsive sizing)
- Desktop: > 1024px (optimale dialog grootte)