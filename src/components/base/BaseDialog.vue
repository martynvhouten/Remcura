<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :persistent="persistent"
    :maximized="isMobile && !preventMobileFullscreen"
    :position="position"
    :full-width="fullWidth"
    :transition-show="transitionShow"
    :transition-hide="transitionHide"
    :class="dialogClass"
    role="dialog"
    :aria-labelledby="titleId"
    :aria-describedby="subtitleId"
    aria-modal="true"
    @show="onShow"
    @hide="onHide"
    @escape-key="onEscapeKey"
  >
    <div :class="cardClasses" @keydown="onKeyDown">
      <!-- Loading Overlay -->
      <div v-if="loading" class="dialog-loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingText || $t('common.loading') }}</p>
      </div>

      <!-- Step Indicator (for multi-step dialogs) -->
      <div v-if="showSteps && steps && steps.length > 1" class="dialog-steps">
        <div class="steps-container">
          <div
            v-for="(step, index) in steps"
            :key="index"
            :class="[
              'step-item',
              {
                'step-active': index === currentStep,
                'step-completed': index < currentStep,
                'step-disabled': index > currentStep,
              },
            ]"
          >
            <div class="step-indicator">
              <q-icon
                v-if="index < currentStep"
                name="check"
                class="icon-size-sm"
              />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Dialog Header -->
      <header
        v-if="hasHeader"
        class="dialog-header"
        :class="[headerClass, headerVariantClass, statusColorClass]"
      >
        <div class="header-content">
          <div v-if="icon" class="header-icon-container">
            <div class="header-icon" :class="iconVariantClass">
              <q-icon :name="icon" :size="iconSize" />
            </div>
          </div>
          <div class="header-text">
            <h1 class="dialog-title" :id="titleId">{{ title }}</h1>
            <p v-if="subtitle" class="dialog-subtitle" :id="subtitleId">
              {{ subtitle }}
            </p>
          </div>
          <button
            v-if="closable"
            type="button"
            @click="onClose"
            class="close-btn"
            :aria-label="$t('common.closeDialog') || 'Close dialog'"
            :disabled="loading || actionsDisabled"
          >
            <q-icon name="close" class="icon-size-base" />
          </button>
        </div>
      </header>

      <!-- Dialog Content -->
      <main class="dialog-content" :class="contentClass">
        <slot />
      </main>

      <!-- Dialog Footer -->
      <footer
        v-if="hasActions || primaryAction || secondaryAction"
        class="dialog-footer"
        :class="footerClass"
      >
        <!-- Custom Actions Slot -->
        <div v-if="hasActions" class="custom-actions">
          <slot name="actions" :loading="loading" :disabled="actionsDisabled" />
        </div>

        <!-- Standard Actions -->
        <div v-else class="standard-actions">
          <!-- Secondary Action -->
          <button
            v-if="secondaryAction"
            type="button"
            @click="onSecondaryAction"
            :disabled="loading || actionsDisabled || secondaryAction.disabled"
            :class="['app-btn', secondaryAction.class || 'app-btn-secondary']"
          >
            <q-icon
              v-if="secondaryAction.icon"
              :name="secondaryAction.icon"
              class="icon-size-sm"
            />
            {{ secondaryAction.label }}
          </button>

          <!-- Primary Action -->
          <button
            v-if="primaryAction"
            type="button"
            @click="onPrimaryAction"
            :disabled="loading || actionsDisabled || primaryAction.disabled"
            :class="['app-btn', primaryAction.class || 'app-btn-primary']"
          >
            <div v-if="primaryActionLoading" class="btn-loading">
              <div class="btn-spinner"></div>
            </div>
            <template v-else>
              <q-icon
                v-if="primaryAction.icon"
                :name="primaryAction.icon"
                class="icon-size-sm"
              />
              {{ primaryAction.label }}
            </template>
          </button>
        </div>
      </footer>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
  import {
    computed,
    useSlots,
    ref,
    nextTick,
    onMounted,
    onUnmounted,
  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';

  /**
   * BaseDialog Component - Enterprise-grade dialog system
   *
   * Features:
   * - Responsive design (mobile fullscreen, desktop modal)
   * - Keyboard navigation (Enter/Escape)
   * - Loading states and async actions
   * - Multi-step wizard support
   * - Dirty state checking
   * - Focus management
   * - Status colors and variants
   * - Consistent with app design system
   */

  interface DialogStep {
    label: string;
    completed?: boolean;
  }

  interface DialogAction {
    label: string;
    icon?: string;
    class?: string;
    disabled?: boolean;
    loading?: boolean;
  }

  interface Props {
    /** Dialog visibility state */
    modelValue: boolean;

    /** Dialog title */
    title?: string;

    /** Dialog subtitle */
    subtitle?: string;

    /** Header icon */
    icon?: string;

    /** Icon size */
    iconSize?: string;

    /** Prevent closing on backdrop click */
    persistent?: boolean;

    /** Force maximized state */
    maximized?: boolean;

    /** Prevent mobile fullscreen behavior */
    preventMobileFullscreen?: boolean;

    /** Dialog position */
    position?: 'standard' | 'top' | 'right' | 'bottom' | 'left';

    /** Full width dialog */
    fullWidth?: boolean;

    /** Show transition */
    transitionShow?: string;

    /** Hide transition */
    transitionHide?: string;

    /** Show close button */
    closable?: boolean;

    /** Header CSS classes */
    headerClass?: string | string[];

    /** Content CSS classes */
    contentClass?: string | string[];

    /** Footer CSS classes */
    footerClass?: string | string[];

    /** Dialog CSS classes */
    dialogClass?: string | string[];

    /** Visual variant */
    variant?: 'standard' | 'modern' | 'glass' | 'elegant' | 'minimal';

    /** Dialog size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

    /** Header variant */
    headerVariant?: 'gradient' | 'solid' | 'minimal' | 'glass';

    /** Status color for header */
    statusColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';

    /** Loading state */
    loading?: boolean;

    /** Loading text */
    loadingText?: string;

    /** Disable all actions */
    actionsDisabled?: boolean;

    /** Primary action configuration */
    primaryAction?: DialogAction;

    /** Secondary action configuration */
    secondaryAction?: DialogAction;

    /** Primary action loading state */
    primaryActionLoading?: boolean;

    /** Steps for wizard dialogs */
    steps?: DialogStep[];

    /** Current step index */
    currentStep?: number;

    /** Show step indicator */
    showSteps?: boolean;

    /** Auto-focus first input */
    autoFocus?: boolean;

    /** Check for unsaved changes */
    isDirty?: boolean;

    /** Confirm close message */
    confirmCloseMessage?: string;

    /** Enable keyboard shortcuts */
    keyboardShortcuts?: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'close'): void;
    (e: 'primary-action'): void;
    (e: 'secondary-action'): void;
    (e: 'show'): void;
    (e: 'hide'): void;
    (e: 'escape'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    persistent: true,
    maximized: false,
    preventMobileFullscreen: false,
    position: 'standard',
    fullWidth: false,
    transitionShow: 'jump-up',
    transitionHide: 'jump-down',
    closable: true,
    iconSize: '24px',
    variant: 'elegant',
    size: 'md',
    headerVariant: 'solid',
    statusColor: 'primary',
    loading: false,
    actionsDisabled: false,
    primaryActionLoading: false,
    currentStep: 0,
    showSteps: false,
    autoFocus: true,
    isDirty: false,
    keyboardShortcuts: true,
  });

  const emit = defineEmits<Emits>();
  const slots = useSlots();
  const { t } = useI18n();
  const $q = useQuasar();

  // Reactive references
  const dialogRef = ref<HTMLElement>();

  // Computed properties
  const titleId = computed(
    () => `dialog-title-${Math.random().toString(36).substr(2, 9)}`
  );
  const subtitleId = computed(
    () => `dialog-subtitle-${Math.random().toString(36).substr(2, 9)}`
  );

  const isMobile = computed(() => $q.screen.lt.md);

  const hasHeader = computed(
    () => !!(props.title || props.subtitle || props.icon || slots.header)
  );
  const hasActions = computed(() => !!slots.actions);

  const cardClasses = computed(() => {
    const classes = ['app-dialog-card'];

    // Variant classes
    classes.push(`dialog-${props.variant}`);

    // Size classes
    classes.push(`dialog-${props.size}`);

    // Loading state
    if (props.loading) {
      classes.push('dialog-loading');
    }

    // Mobile fullscreen
    if (isMobile.value && !props.preventMobileFullscreen) {
      classes.push('dialog-mobile-fullscreen');
    }

    return classes;
  });

  const headerVariantClass = computed(() => `header-${props.headerVariant}`);
  const statusColorClass = computed(() => `header-${props.statusColor}`);

  // Methods
  const onShow = () => {
    emit('show');

    if (props.autoFocus) {
      nextTick(() => {
        focusFirstInput();
      });
    }
  };

  const onHide = () => {
    emit('hide');
  };

  const onClose = async () => {
    if (props.isDirty && props.confirmCloseMessage) {
      const confirmed = await showConfirmDialog(props.confirmCloseMessage);
      if (!confirmed) return;
    }

    emit('close');
    emit('update:modelValue', false);
  };

  const onPrimaryAction = () => {
    emit('primary-action');
  };

  const onSecondaryAction = () => {
    emit('secondary-action');
  };

  const onEscapeKey = () => {
    if (props.keyboardShortcuts) {
      emit('escape');
      onClose();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!props.keyboardShortcuts || props.loading) return;

    // Enter key - trigger primary action
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (props.primaryAction && !props.primaryAction.disabled) {
        onPrimaryAction();
      }
    }
  };

  const focusFirstInput = () => {
    const firstInput = dialogRef.value?.querySelector(
      'input, textarea, select, [tabindex="0"]'
    ) as HTMLElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  const showConfirmDialog = (message: string): Promise<boolean> => {
    return new Promise(resolve => {
      $q.dialog({
        title: t('common.confirmClose'),
        message,
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          resolve(true);
        })
        .onCancel(() => {
          resolve(false);
        });
    });
  };

  // Lifecycle
  onMounted(() => {
    // Add global keyboard listeners if needed
  });

  onUnmounted(() => {
    // Cleanup global listeners
  });
</script>

<style lang="scss" scoped>
  // ===================================================================
  // ENTERPRISE DIALOG SYSTEM - CONSISTENT WITH APP DESIGN SYSTEM
  // ===================================================================

  .app-dialog-card {
    position: relative;
    background: var(--bg-primary);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    box-shadow: var(--shadow-2xl);
    border: 1px solid var(--border-primary);
    transform: translateY(0);
    transition: var(--transition-base);
    max-height: 90vh;
    overflow-y: auto;
    font-family: var(--font-family-primary);

    // Loading state
    &.dialog-loading {
      pointer-events: none;

      .dialog-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(4px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-4);
        z-index: 10;
        border-radius: var(--radius-2xl);

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--neutral-200);
          border-top: 3px solid var(--brand-primary);
          border-radius: var(--radius-full);
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          margin: 0;
        }
      }
    }

    // Size variants
    &.dialog-sm {
      width: 100%;
      max-width: 420px;
    }

    &.dialog-md {
      width: 100%;
      max-width: 640px;
    }

    &.dialog-lg {
      width: 100%;
      max-width: 840px;
    }

    &.dialog-xl {
      width: 100%;
      max-width: 1080px;
    }

    &.dialog-full {
      width: 95vw;
      max-width: none;
      height: 90vh;
      max-height: none;
    }

    // Mobile fullscreen
    &.dialog-mobile-fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: none;
      max-height: none;
      border-radius: 0;
    }

    // Style variants
    &.dialog-elegant {
      background: linear-gradient(
        135deg,
        var(--bg-primary) 0%,
        var(--bg-secondary) 100%
      );
      border: 1px solid var(--border-primary);
    }

    &.dialog-modern {
      background: var(--bg-primary);
      box-shadow: var(--shadow-2xl);
    }

    &.dialog-glass {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-backdrop);
      -webkit-backdrop-filter: var(--glass-backdrop);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    &.dialog-minimal {
      background: var(--bg-primary);
      border: none;
      box-shadow: var(--shadow-lg);
    }

    &.dialog-standard {
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      box-shadow: var(--shadow-md);
    }
  }

  // ===================================================================
  // STEP INDICATOR
  // ===================================================================

  .dialog-steps {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    padding: var(--space-6) var(--space-8);

    .steps-container {
      display: flex;
      justify-content: center;
      gap: var(--space-8);
      max-width: 600px;
      margin: 0 auto;

      .step-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-tertiary);
        transition: var(--transition-base);

        &.step-active {
          color: var(--brand-primary);
        }

        &.step-completed {
          color: var(--brand-success);
        }

        .step-indicator {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: var(--font-weight-bold);
          background: var(--neutral-200);
          color: var(--text-secondary);
          transition: var(--transition-base);
        }

        &.step-active .step-indicator {
          background: var(--brand-primary);
          color: white;
        }

        &.step-completed .step-indicator {
          background: var(--brand-success);
          color: white;
        }
      }
    }

    @media (max-width: 640px) {
      .steps-container {
        gap: var(--space-4);

        .step-label {
          display: none;
        }
      }
    }
  }

  // ===================================================================
  // HEADER STYLES
  // ===================================================================

  .dialog-header {
    position: relative;
    border-bottom: 1px solid var(--border-primary);

    // Header variants
    &.header-gradient {
      background: linear-gradient(
        135deg,
        var(--brand-primary) 0%,
        var(--brand-primary-light) 100%
      );
      color: white;
      border-bottom: none;
    }

    &.header-solid {
      background: var(--brand-primary);
      color: white;
      border-bottom: none;
    }

    &.header-minimal {
      background: transparent;
      color: var(--text-primary);
    }

    &.header-glass {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      color: var(--text-primary);
    }

    // Status colors
    &.header-success {
      &.header-solid,
      &.header-gradient {
        background: var(--brand-success);
      }
    }

    &.header-warning {
      &.header-solid,
      &.header-gradient {
        background: var(--brand-warning);
      }
    }

    &.header-danger {
      &.header-solid,
      &.header-gradient {
        background: var(--brand-danger);
      }
    }

    &.header-info {
      &.header-solid,
      &.header-gradient {
        background: var(--brand-info);
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-6) var(--space-8);

      .header-icon-container {
        flex-shrink: 0;

        .header-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          color: currentColor;
          transition: var(--transition-base);
        }
      }

      .header-text {
        flex: 1;
        min-width: 0;

        .dialog-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          margin: 0 0 var(--space-1) 0;
          line-height: var(--leading-tight);
          color: currentColor;
        }

        .dialog-subtitle {
          font-size: var(--text-base);
          margin: 0;
          opacity: 0.85;
          line-height: var(--leading-normal);
          font-weight: var(--font-weight-medium);
          color: currentColor;
        }
      }

      .close-btn {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-lg);
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: currentColor;
        cursor: pointer;
        transition: var(--transition-base);
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  // ===================================================================
  // CONTENT STYLES
  // ===================================================================

  .dialog-content {
    padding: var(--space-8);
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
    color: var(--text-primary);
    min-height: 0;
    flex: 1;

    &:empty {
      display: none;
    }

    // Better typography
    :deep(p) {
      margin: 0 0 var(--space-4) 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(h1, h2, h3, h4, h5, h6) {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--space-3) 0;
    }

    :deep(h3) {
      font-size: var(--text-lg);
    }
  }

  // ===================================================================
  // FOOTER STYLES
  // ===================================================================

  .dialog-footer {
    padding: var(--space-6) var(--space-8) var(--space-8);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    align-items: center;

    .standard-actions,
    .custom-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    // Button styles using app design system
    .app-btn {
      min-width: 120px;
      height: 44px;
      border-radius: var(--radius-lg);
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-sm);
      font-family: var(--font-family-primary);
      letter-spacing: 0.01em;
      transition: var(--transition-base);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      text-transform: none;
      position: relative;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: var(--radius-full);
          animation: spin 1s linear infinite;
        }
      }
    }

    @media (max-width: 640px) {
      flex-direction: column-reverse;
      align-items: stretch;
      gap: var(--space-3);

      .standard-actions,
      .custom-actions {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .app-btn {
        width: 100%;
        min-width: auto;
      }
    }
  }

  // ===================================================================
  // DARK MODE ADAPTATIONS
  // ===================================================================

  body.body--dark {
    .app-dialog-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      box-shadow: var(--shadow-2xl);

      &.dialog-elegant {
        background: linear-gradient(
          135deg,
          var(--bg-primary) 0%,
          var(--bg-secondary) 100%
        );
      }

      &.dialog-glass {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
      }

      &.dialog-loading .dialog-loading-overlay {
        background: rgba(0, 0, 0, 0.9);

        .loading-text {
          color: var(--text-secondary);
        }
      }
    }

    .dialog-header {
      &.header-minimal {
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-primary);
      }

      &.header-glass {
        background: var(--glass-bg);
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-primary);
      }
    }

    .dialog-content {
      color: var(--text-primary);
    }

    .dialog-footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-primary);
    }

    .dialog-steps {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-primary);
    }
  }

  // ===================================================================
  // ANIMATIONS
  // ===================================================================

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  // Enhanced scroll behavior
  .app-dialog-card {
    scrollbar-width: thin;
    scrollbar-color: var(--neutral-300) transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: var(--radius-2xl);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--neutral-300);
      border-radius: var(--radius-2xl);
      border: 2px solid transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--neutral-400);
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }

  // Focus states
  .close-btn:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }

  body.body--dark .close-btn:focus-visible {
    outline-color: rgba(255, 255, 255, 0.2);
  }
</style>
