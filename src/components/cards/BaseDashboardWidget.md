# BaseDashboardWidget

Een herbruikbare basiscomponent voor alle dashboard- en platform-widgets in het Remcura platform.

## Features

- ✅ **Flexibele wrapper**: Gebaseerd op `<q-card>` met consistente styling
- ✅ **Loading states**: Ingebouwde loading overlay met i18n support
- ✅ **Header management**: Optionele titel en acties sectie
- ✅ **Responsive design**: Mobile-first ontwerp met Tailwind utility classes
- ✅ **Dark mode support**: Automatische ondersteuning voor dark/light themes
- ✅ **Accessibility**: Reduced motion support en semantische HTML
- ✅ **TypeScript**: Volledige type safety en IntelliSense

## Props

| Prop         | Type      | Default     | Beschrijving           |
| ------------ | --------- | ----------- | ---------------------- |
| `title`      | `string`  | `undefined` | Optionele widget titel |
| `loading`    | `boolean` | `false`     | Toont loading overlay  |
| `hideHeader` | `boolean` | `false`     | Verbergt header sectie |
| `cardClass`  | `string`  | `''`        | Extra CSS classes      |

## Slots

| Slot      | Beschrijving                             |
| --------- | ---------------------------------------- |
| `default` | Hoofdinhoud van de widget                |
| `actions` | Acties in header (buttons, menu's, etc.) |

## Gebruik

### Basic gebruik

```vue
<template>
  <BaseDashboardWidget title="Recent Orders">
    <div class="p-4">
      <p>Widget content hier...</p>
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
import { BaseDashboardWidget } from '@/components/cards';
</script>
```

### Met acties

```vue
<template>
  <BaseDashboardWidget title="Stock Alerts">
    <template #actions>
      <q-btn flat round dense icon="refresh" @click="refresh" />
      <q-btn flat round dense icon="settings" @click="configure" />
    </template>

    <div class="p-4">
      <!-- Widget content -->
    </div>
  </BaseDashboardWidget>
</template>
```

### Loading state

```vue
<template>
  <BaseDashboardWidget title="Analytics" :loading="isLoading">
    <div class="p-4">
      <!-- Content wordt automatisch geblokkeerd tijdens loading -->
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(true);
</script>
```

### Zonder header

```vue
<template>
  <BaseDashboardWidget hide-header>
    <div class="text-center p-8">
      <h4 class="text-xl font-semibold mb-4">Clean Metric Widget</h4>
      <!-- Metric content -->
    </div>
  </BaseDashboardWidget>
</template>
```

## Styling

De component gebruikt:

- **Tailwind CSS**: Voor utility classes en responsive design
- **CSS Custom Properties**: Voor theming en dark mode
- **Quasar Components**: Voor consistent UI elementen

### CSS Variables

```css
:root {
  --widget-background: var(--surface, #ffffff);
  --widget-border: var(--border-color, rgba(0, 0, 0, 0.08));
  --widget-shadow: var(--shadow-md, ...);
  --widget-text-primary: var(--text-primary, #1f2937);
  --widget-text-muted: var(--text-muted, #6b7280);
}
```

## Migratie

### Van bestaande DashboardWidget

```vue
<!-- Voor -->
<DashboardWidget :widget="widgetData" :loading="loading">
  <!-- content -->
</DashboardWidget>

<!-- Na -->
<BaseDashboardWidget :title="widgetData.title" :loading="loading">
  <!-- content -->
</BaseDashboardWidget>
```

### Van bestaande PlatformWidget

```vue
<!-- Voor -->
<PlatformWidget :widget="widgetData">
  <!-- content -->
</PlatformWidget>

<!-- Na -->
<BaseDashboardWidget :title="widgetData.title" :loading="widgetData.loading">
  <template #actions>
    <q-btn flat round dense icon="refresh" />
  </template>
  <!-- content -->
</BaseDashboardWidget>
```

## TypeScript

```typescript
import type { BaseDashboardWidgetProps } from '@/components/cards';

// Props interface is automatisch beschikbaar
const props = defineProps<BaseDashboardWidgetProps>();
```

## Design Tokens

De component volgt de bestaande Remcura design tokens:

- **Border radius**: `12px` (rounded-xl)
- **Shadow**: Consistent met andere cards
- **Spacing**: Tailwind spacing scale
- **Colors**: CSS custom properties voor theming
- **Typography**: Tailwind typography scale

## Voorbeelden

Zie `BaseDashboardWidget.example.vue` voor uitgebreide voorbeelden van alle use cases.
