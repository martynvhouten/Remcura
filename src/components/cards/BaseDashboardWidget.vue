<template>
  <q-card
    class="base-dashboard-widget bg-white shadow-md rounded-xl p-4 lg:p-6 min-h-[200px]"
    :class="cardClasses"
  >
    <!-- Widget Header -->
    <q-card-section
      v-if="!hideHeader && (title || $slots.actions)"
      class="widget-header flex items-center justify-between p-0 pb-4"
    >
      <!-- Title Section -->
      <div v-if="title" class="widget-title">
        <h4
          class="text-sm font-medium text-gray-700 m-0 uppercase tracking-wide"
        >
          {{ title }}
        </h4>
      </div>

      <!-- Actions Section -->
      <div v-if="$slots.actions" class="widget-actions">
        <slot name="actions" />
      </div>
    </q-card-section>

    <!-- Widget Content -->
    <q-card-section class="widget-content p-0 flex-1 flex flex-col">
      <slot />
    </q-card-section>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading" class="rounded-xl">
      <q-spinner-dots size="40px" color="primary" />
      <div class="text-sm text-gray-600 mt-2">
        {{ $t('dashboard.loading') }}
      </div>
    </q-inner-loading>
  </q-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  // Types
  export interface BaseDashboardWidgetProps {
    /** Optional widget title displayed in header */
    title?: string;
    /** Show loading overlay when true */
    loading?: boolean;
    /** Hide the header section completely */
    hideHeader?: boolean;
    /** Additional CSS classes for the card */
    cardClass?: string;
  }

  // Props
  const props = withDefaults(defineProps<BaseDashboardWidgetProps>(), {
    title: undefined,
    loading: false,
    hideHeader: false,
    cardClass: '',
  });

  // Composables
  const { t } = useI18n();

  // Computed
  const cardClasses = computed(() => {
    const classes = ['base-dashboard-widget'];

    if (props.cardClass) {
      classes.push(props.cardClass);
    }

    if (props.loading) {
      classes.push('widget-loading');
    }

    return classes.join(' ');
  });

  // Define slots for better TypeScript support
  defineSlots<{
    /** Main widget content */
    default(): any;
    /** Actions section in the header (buttons, menus, etc.) */
    actions(): any;
  }>();
</script>

<style lang="scss" scoped>
  .base-dashboard-widget {
    // CSS Variables for theming
    --widget-background: var(--surface, #ffffff);
    --widget-border: var(--border-color, rgba(0, 0, 0, 0.08));
    --widget-shadow: var(
      --shadow-md,
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06)
    );
    --widget-text-primary: var(--text-primary, #1f2937);
    --widget-text-muted: var(--text-muted, #6b7280);

    // Base styling
    background: var(--widget-background);
    border: 1px solid var(--widget-border);
    box-shadow: var(--widget-shadow);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // Interactive states
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    // Loading state
    &.widget-loading {
      opacity: 0.7;
      pointer-events: none;
    }

    // Header styling
    .widget-header {
      border-bottom: 1px solid var(--widget-border);

      .widget-title h3 {
        color: var(--widget-text-primary);
        font-weight: 600;
        line-height: 1.25;
      }

      .widget-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    // Content styling
    .widget-content {
      min-height: 120px;
      color: var(--widget-text-primary);
    }

    // Dark mode support
    .body--dark & {
      --widget-background: var(--surface-dark, #1f2937);
      --widget-border: var(--border-color-dark, rgba(255, 255, 255, 0.1));
      --widget-text-primary: var(--text-primary-dark, #f9fafb);
      --widget-text-muted: var(--text-muted-dark, #d1d5db);

      &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
          0 4px 6px -2px rgba(0, 0, 0, 0.2);
      }
    }
  }

  // Mobile responsive adjustments
  @media (max-width: 768px) {
    .base-dashboard-widget {
      // Disable hover effects on mobile
      &:hover {
        transform: none;
        box-shadow: var(--widget-shadow);
      }

      .widget-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;

        .widget-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }

  // Accessibility improvements
  @media (prefers-reduced-motion: reduce) {
    .base-dashboard-widget {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }
</style>
