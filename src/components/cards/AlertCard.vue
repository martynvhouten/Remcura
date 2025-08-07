<template>
  <div
    :class="cardClasses"
    :role="role"
    :aria-labelledby="titleId"
    v-bind="$attrs"
  >
    <!-- Alert indicator line -->
    <div class="alert-indicator" />

    <!-- Card Header -->
    <div v-if="hasHeader" class="card-header" :class="headerClass">
      <div class="card-header-content">
        <div class="card-title-section">
          <!-- Status Icon -->
          <div
            v-if="showStatusIcon"
            class="status-icon"
            :class="`status-icon--${severity}`"
          >
            <q-icon :name="statusIcon" class="icon-size-base" />
          </div>

          <!-- Custom Icon -->
          <div
            v-else-if="icon"
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

        <!-- Dismiss button -->
        <div v-if="dismissible" class="dismiss-button">
          <q-btn
            flat
            round
            dense
            icon="close"
            size="sm"
            @click="handleDismiss"
            :aria-label="$t ? $t('common.dismiss') : 'Dismiss'"
          />
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

    // Alert props
    severity?: 'info' | 'success' | 'warning' | 'error';
    showStatusIcon?: boolean;
    dismissible?: boolean;

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
    role: 'alert',
    severity: 'info',
    showStatusIcon: true,
  });

  const emit = defineEmits<{
    dismiss: [];
  }>();

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
        props.showStatusIcon ||
        slots['header-content'] ||
        slots['header-actions']
      )
  );

  const hasContent = computed(() => !!slots.default);
  const hasActions = computed(() => !!slots.actions);
  const hasHeaderActions = computed(() => !!slots['header-actions']);

  // Status icon based on severity
  const statusIcon = computed(() => {
    switch (props.severity) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  });

  // Card classes
  const cardClasses = computed(() => {
    const classes = ['alert-card', `alert-card--${props.severity}`];

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

  // Event handlers
  const handleDismiss = () => {
    emit('dismiss');
  };
</script>

<style scoped lang="scss">
  .alert-card {
    border-radius: 12px;
    background: var(--card-background, #ffffff);
    border: 1px solid var(--alert-border);
    box-shadow: var(
      --card-shadow,
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.06)
    );
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;

    // Dark mode support
    .body--dark & {
      --card-background: #1e1e1e;
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    // Alert indicator line
    .alert-indicator {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--alert-color);
      z-index: 1;
    }

    // Severity variants
    &--info {
      --alert-color: #3b82f6;
      --alert-border: rgba(59, 130, 246, 0.2);
      --alert-background: rgba(59, 130, 246, 0.05);

      .body--dark & {
        --alert-border: rgba(59, 130, 246, 0.3);
        --alert-background: rgba(59, 130, 246, 0.1);
      }
    }

    &--success {
      --alert-color: #22c55e;
      --alert-border: rgba(34, 197, 94, 0.2);
      --alert-background: rgba(34, 197, 94, 0.05);

      .body--dark & {
        --alert-border: rgba(34, 197, 94, 0.3);
        --alert-background: rgba(34, 197, 94, 0.1);
      }
    }

    &--warning {
      --alert-color: #f59e0b;
      --alert-border: rgba(245, 158, 11, 0.2);
      --alert-background: rgba(245, 158, 11, 0.05);

      .body--dark & {
        --alert-border: rgba(245, 158, 11, 0.3);
        --alert-background: rgba(245, 158, 11, 0.1);
      }
    }

    &--error {
      --alert-color: #ef4444;
      --alert-border: rgba(239, 68, 68, 0.2);
      --alert-background: rgba(239, 68, 68, 0.05);

      .body--dark & {
        --alert-border: rgba(239, 68, 68, 0.3);
        --alert-background: rgba(239, 68, 68, 0.1);
      }
    }

    // Subtle background tint
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--alert-background);
      z-index: 0;
    }

    // Ensure content is above background
    > * {
      position: relative;
      z-index: 1;
    }
  }

  // Card header
  .card-header {
    background: transparent;
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

  // Status icon
  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;

    &--info {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }

    &--success {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    &--warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    &--error {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
  }

  // Dismiss button
  .dismiss-button {
    display: flex;
    align-items: center;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }

  // Card icon (same as other cards)
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
    background: transparent;
  }

  // Card actions
  .card-actions {
    padding: 12px 20px;
    background: transparent;
    border-top: 1px solid var(--alert-border);

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

    .status-icon,
    .card-icon {
      width: 28px;
      height: 28px;
    }
  }
</style>
