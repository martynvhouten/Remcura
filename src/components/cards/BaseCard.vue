<template>
  <div
    :class="cardClasses"
    :role="role"
    :aria-labelledby="titleId"
    v-bind="$attrs"
  >
    <!-- Card Header -->
    <div v-if="hasHeader" class="card-header" :class="headerClass">
      <div class="card-header-content">
        <div class="card-title-section">
          <!-- Icon -->
          <div
            v-if="icon"
            class="card-icon"
            :class="[
              `card-icon--${iconVariant}`,
              iconColor ? `card-icon--${iconColor}` : '',
            ]"
          >
            <q-icon :name="icon" class="icon-size-base" />
          </div>

          <!-- Title and Subtitle -->
          <div v-if="title || subtitle" class="card-text-content">
            <h3 v-if="title" class="card-title" :id="titleId">{{ title }}</h3>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>

          <!-- Custom header content -->
          <slot name="header-content" />
        </div>

        <!-- Header actions -->
        <div v-if="hasHeaderActions" class="card-header-actions">
          <slot name="header-actions" />
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div v-if="hasContent" class="card-content" :class="contentClass">
      <slot />
    </div>

    <!-- Card Actions -->
    <div v-if="hasActions" class="card-actions" :class="actionsClass">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, useSlots, useAttrs } from 'vue';

  interface Props {
    // Content props
    title?: string;
    subtitle?: string;
    icon?: string;
    iconColor?:
      | 'primary'
      | 'secondary'
      | 'positive'
      | 'negative'
      | 'warning'
      | 'info';
    iconVariant?: 'default' | 'outlined' | 'filled';

    // Layout props
    padding?: 'none' | 'sm' | 'md' | 'lg';

    // Custom classes
    cardClass?: string;
    headerClass?: string;
    contentClass?: string;
    actionsClass?: string;

    // Accessibility
    role?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    iconVariant: 'default',
    padding: 'md',
    role: 'article',
  });

  const slots = useSlots();
  const attrs = useAttrs();

  // Generate unique ID for title
  const titleId = computed(() => {
    if (attrs.id) return `${attrs.id}-title`;
    if (props.title)
      return `card-title-${props.title.replace(/\s+/g, '-').toLowerCase()}`;
    return `card-title-${Date.now()}`;
  });

  // Check for slot content
  const hasHeader = computed(
    () =>
      !!(
        props.title ||
        props.subtitle ||
        props.icon ||
        slots['header-content'] ||
        slots['header-actions']
      )
  );

  const hasContent = computed(() => !!slots.default);
  const hasActions = computed(() => !!slots.actions);
  const hasHeaderActions = computed(() => !!slots['header-actions']);

  // Card classes
  const cardClasses = computed(() => {
    const classes = ['base-card'];

    // Padding classes
    if (props.padding !== 'md') {
      classes.push(`card-padding-${props.padding}`);
    }

    // Custom class
    if (props.cardClass) {
      classes.push(props.cardClass);
    }

    return classes.join(' ');
  });
</script>

<style scoped lang="scss">
  .base-card {
    border-radius: 12px;
    background: var(--card-background, #ffffff);
    border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
    box-shadow: var(
      --card-shadow,
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.06)
    );
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    // Dark mode support
    .body--dark & {
      --card-background: #1e1e1e;
      --card-border: rgba(255, 255, 255, 0.1);
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    // Disable hover effects on form elements within cards
    .q-field,
    .q-input,
    .q-select,
    .q-btn-dropdown,
    .q-toggle,
    .q-checkbox,
    .q-radio,
    .q-slider {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }

  // Card header
  .card-header {
    background: var(--card-header-background, var(--card-background));
    border-bottom: 1px solid var(--card-border);
    padding: 16px 20px;

    .card-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .card-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .card-text-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.25;
      margin: 0;
      color: var(--text-primary);
    }

    .card-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  // Card icon
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;

    &--default {
      background: rgba(var(--q-primary-rgb), 0.1);
      color: var(--q-primary);
    }

    &--outlined {
      border: 1px solid rgba(var(--q-primary-rgb), 0.3);
      color: var(--q-primary);
    }

    &--filled {
      background: var(--q-primary);
      color: white;
    }

    // Color variants
    &--primary {
      --q-primary-rgb: 59, 130, 246;
      --q-primary: #3b82f6;
    }
    &--secondary {
      --q-primary-rgb: 100, 116, 139;
      --q-primary: #64748b;
    }
    &--positive {
      --q-primary-rgb: 34, 197, 94;
      --q-primary: #22c55e;
    }
    &--negative {
      --q-primary-rgb: 239, 68, 68;
      --q-primary: #ef4444;
    }
    &--warning {
      --q-primary-rgb: 245, 158, 11;
      --q-primary: #f59e0b;
    }
    &--info {
      --q-primary-rgb: 14, 165, 233;
      --q-primary: #0ea5e9;
    }
  }

  // Card content
  .card-content {
    padding: 20px;
    background: var(--card-background);
  }

  // Card actions
  .card-actions {
    padding: 12px 20px;
    background: var(--card-background);
    border-top: 1px solid var(--card-border);

    display: flex;
    justify-content: flex-end;
    gap: 12px;
    align-items: center;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
  }

  // Padding variants
  .card-padding-none {
    .card-content {
      padding: 0;
    }
  }

  .card-padding-sm {
    .card-header {
      padding: 12px 16px;
    }

    .card-content {
      padding: 16px;
    }

    .card-actions {
      padding: 8px 16px;
    }
  }

  .card-padding-lg {
    .card-header {
      padding: 20px 24px;
    }

    .card-content {
      padding: 24px;
    }

    .card-actions {
      padding: 16px 24px;
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .card-header {
      padding: 14px 16px;

      .card-title {
        font-size: 15px;
      }

      .card-subtitle {
        font-size: 13px;
      }
    }

    .card-content {
      padding: 16px;
    }

    .card-actions {
      padding: 10px 16px;
    }

    .card-icon {
      width: 28px;
      height: 28px;
    }
  }
</style>
