# BaseDialog Component - Enterprise Optimization Guide

## 🎯 **OVERZICHT VAN WIJZIGINGEN**

Het BaseDialog component is volledig geoptimaliseerd voor maximale herbruikbaarheid, consistentie en
UX binnen ons bestaande app-CSS design system.

## ✨ **NIEUWE FEATURES**

### 1. **Verbeterde Props & Configuration**

```typescript
interface Props {
  // Core functionality
  modelValue: boolean;
  title?: string;
  subtitle?: string;
  icon?: string;

  // Advanced UX
  statusColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  primaryActionLoading?: boolean;

  // Multi-step support
  steps?: DialogStep[];
  currentStep?: number;
  showSteps?: boolean;

  // Smart behavior
  autoFocus?: boolean;
  isDirty?: boolean;
  confirmCloseMessage?: string;
  keyboardShortcuts?: boolean;
  preventMobileFullscreen?: boolean;

  // Loading & states
  loading?: boolean;
  actionsDisabled?: boolean;
}
```

### 2. **Smart Mobile Behavior**

- **Automatisch fullscreen op mobiel** (tenzij `preventMobileFullscreen: true`)
- **Modal op desktop** met responsive sizing
- **Touch-friendly** close buttons en actions

### 3. **Keyboard Navigation**

- **Enter (Ctrl/Cmd+Enter)**: Trigger primary action
- **Escape**: Close dialog (met dirty check)
- **Auto-focus** eerste input field bij openen

### 4. **Multi-Step Wizard Support**

```vue
<BaseDialog
  :steps="[
    { label: 'Upload File' },
    { label: 'Map Columns' },
    { label: 'Preview & Import' }
  ]"
  :current-step="currentStep"
  show-steps
>
```

### 5. **Async Action Support**

```vue
<BaseDialog
  :primary-action="{
    label: 'Save Product',
    icon: 'save',
    class: 'app-btn-primary',
    disabled: !formValid
  }"
  :primary-action-loading="saving"
  @primary-action="handleSave"
>
```

### 6. **Dirty State Checking**

```vue
<BaseDialog
  :is-dirty="hasUnsavedChanges"
  confirm-close-message="You have unsaved changes. Are you sure?"
>
```

## 🎨 **DESIGN SYSTEM INTEGRATION**

### **Consistent Styling**

- **CSS Custom Properties**: Volledig gebruik van `--brand-*`, `--neutral-*`, `--space-*` variabelen
- **App Button Classes**: Integratie met `app-btn-primary`, `app-btn-secondary`, etc.
- **Typography**: Consistent met `--font-family-primary`, `--text-*` sizes
- **Spacing**: 8pt grid systeem (`--space-*`)
- **Border Radius**: Consistent met `--radius-*` variabelen

### **Status Colors**

```scss
&.header-success {
  background: var(--brand-success);
}
&.header-warning {
  background: var(--brand-warning);
}
&.header-danger {
  background: var(--brand-danger);
}
&.header-info {
  background: var(--brand-info);
}
```

### **Dark Mode Support**

- Volledig compatible met `body.body--dark`
- Gebruikt CSS custom properties voor automatische theming
- Geen hardcoded kleuren

## 🔧 **TECHNISCHE VERBETERINGEN**

### 1. **Performance Optimizations**

- **Computed Properties**: Efficiënte reactivity
- **Event Delegation**: Minimale event listeners
- **CSS Containment**: Betere rendering performance

### 2. **Accessibility (A11Y)**

```vue
<q-dialog
  role="dialog"
  :aria-labelledby="titleId"
  :aria-describedby="subtitleId"
  aria-modal="true"
>
```

### 3. **Focus Management**

- Auto-focus eerste input bij openen
- Focus trap binnen dialog
- Restore focus na sluiten

### 4. **Loading States**

```vue
<!-- Global loading overlay -->
<div v-if="loading" class="dialog-loading-overlay">
  <div class="loading-spinner"></div>
  <p class="loading-text">{{ loadingText }}</p>
</div>

<!-- Button-specific loading -->
<button :disabled="primaryActionLoading">
  <div v-if="primaryActionLoading" class="btn-loading">
    <div class="btn-spinner"></div>
  </div>
</button>
```

## 📱 **RESPONSIVE DESIGN**

### **Mobile-First Approach**

```scss
// Mobile fullscreen
&.dialog-mobile-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

// Desktop modal
@media (min-width: 768px) {
  &.dialog-md {
    width: 100%;
    max-width: 640px;
  }
}
```

### **Adaptive Actions**

```scss
@media (max-width: 640px) {
  .dialog-footer {
    flex-direction: column-reverse;

    .app-btn {
      width: 100%;
    }
  }
}
```

## 🎯 **GEBRUIK VOORBEELDEN**

### **1. Form Dialog**

```vue
<BaseDialog
  v-model="showForm"
  title="Create Product"
  subtitle="Fill in the details"
  icon="add_box"
  size="lg"
  status-color="primary"
  :primary-action="{
    label: 'Save',
    icon: 'save',
    disabled: !formValid,
  }"
  :secondary-action="{
    label: 'Cancel',
  }"
  :is-dirty="formChanged"
  confirm-close-message="Unsaved changes will be lost"
  @primary-action="saveForm"
  @secondary-action="cancelForm"
>
  <q-form>
    <!-- Form fields -->
  </q-form>
</BaseDialog>
```

### **2. Confirmation Dialog**

```vue
<BaseDialog
  v-model="showConfirm"
  title="Delete Item"
  subtitle="This cannot be undone"
  icon="warning"
  size="sm"
  status-color="danger"
  :primary-action="{
    label: 'Delete',
    class: 'app-btn-danger',
  }"
  :secondary-action="{
    label: 'Cancel',
  }"
  @primary-action="confirmDelete"
>
  <p>Are you sure you want to delete this item?</p>
</BaseDialog>
```

### **3. Wizard Dialog**

```vue
<BaseDialog
  v-model="showWizard"
  title="Import Wizard"
  icon="upload"
  size="xl"
  :steps="wizardSteps"
  :current-step="currentStep"
  show-steps
  :primary-action="nextStepAction"
  :secondary-action="prevStepAction"
  @primary-action="nextStep"
  @secondary-action="prevStep"
>
  <div v-if="currentStep === 0">Step 1 content</div>
  <div v-if="currentStep === 1">Step 2 content</div>
  <div v-if="currentStep === 2">Step 3 content</div>
</BaseDialog>
```

## 🔄 **MIGRATIE GUIDE**

### **Van Oude BaseDialog**

```vue
<!-- VOOR -->
<BaseDialog v-model="show" title="Title">
  <div>Content</div>
  <template #actions>
    <q-btn @click="save">Save</q-btn>
    <q-btn @click="cancel">Cancel</q-btn>
  </template>
</BaseDialog>

<!-- NA -->
<BaseDialog
  v-model="show"
  title="Title"
  :primary-action="{ label: 'Save' }"
  :secondary-action="{ label: 'Cancel' }"
  @primary-action="save"
  @secondary-action="cancel"
>
  <div>Content</div>
</BaseDialog>
```

### **Voordelen van Nieuwe Versie**

1. **Minder boilerplate code**
2. **Consistente button styling**
3. **Automatische loading states**
4. **Keyboard shortcuts**
5. **Mobile optimization**
6. **Dirty state checking**

## 🎨 **CSS ARCHITECTURE**

### **Design Token Usage**

```scss
.app-dialog-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  font-family: var(--font-family-primary);
}

.dialog-header {
  padding: var(--space-6) var(--space-8);

  .dialog-title {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
}
```

### **Component Classes**

- `.app-dialog-card` - Main container
- `.dialog-header` - Header section
- `.dialog-content` - Content area
- `.dialog-footer` - Actions area
- `.dialog-steps` - Step indicator
- `.app-btn` - Consistent buttons

## 🚀 **PERFORMANCE BENEFITS**

1. **Reduced Bundle Size**: Geen duplicate CSS
2. **Better Caching**: Herbruikbare styles
3. **Faster Rendering**: CSS containment
4. **Memory Efficiency**: Event delegation
5. **Smooth Animations**: Hardware acceleration

## 🔍 **TESTING CHECKLIST**

- [ ] Mobile fullscreen behavior
- [ ] Desktop modal sizing
- [ ] Keyboard navigation (Enter/Escape)
- [ ] Focus management
- [ ] Loading states
- [ ] Dirty state checking
- [ ] Multi-step wizard
- [ ] Dark mode compatibility
- [ ] Accessibility compliance
- [ ] Button styling consistency

## 📋 **BREAKING CHANGES**

### **Props Renamed**

- `headerVariant` → Blijft hetzelfde, maar nieuwe opties
- `variant` → Nieuwe opties toegevoegd
- `size` → Nieuwe `full` optie

### **New Required Props**

Geen - alle nieuwe props zijn optioneel voor backward compatibility

### **CSS Classes Changed**

- `.base-dialog-card` → `.app-dialog-card`
- Nieuwe BEM-style naming convention

## 🎯 **VOLGENDE STAPPEN**

1. **Migreer bestaande dialogs** naar nieuwe BaseDialog
2. **Test alle use cases** met nieuwe features
3. **Update documentatie** voor development team
4. **Performance monitoring** na deployment
5. **User feedback** verzamelen voor verdere optimalisaties

---

## 📚 **RESOURCES**

- [Design System Documentation](./design-system.md)
- [Accessibility Guidelines](./a11y-guidelines.md)
- [Component Examples](./src/examples/BaseDialogExamples.vue)
- [Migration Guide](./migration-guide.md)
