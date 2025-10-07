<template>
  <q-dialog
    :model-value="modelValue"
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
    @update:model-value="$emit('update:modelValue', $event)"
    aria-modal="true"
    @show="onShow"
    @hide="onHide"
    @escape-key="onEscapeKey"
  >
    <div ref="dialogRef" :class="cardClasses" @keydown="onKeyDown">
      <!-- Loading Overlay -->
      <div v-if="loading" class="dlg__loading-overlay">
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
        class="dlg__header"
        :class="[headerClass, headerVariantClass, statusColorClass]"
      >
        <template v-if="slots.header">
          <slot name="header" />
        </template>
        <div v-else class="header-content">
          <div v-if="icon" class="header-icon-container">
            <div class="header-icon">
              <q-icon :name="icon" :size="iconSize" />
            </div>
          </div>
          <div class="header-text">
            <h1 :id="titleId" class="dlg__title">{{ title }}</h1>
            <p v-if="subtitle" :id="subtitleId" class="dlg__subtitle">
              {{ subtitle }}
            </p>
          </div>
          <q-btn
            v-if="closable"
            flat
            round
            dense
            icon="close"
            class="close-btn"
            :aria-label="$t('common.closeDialog') || 'Close dialog'"
            :disable="isCloseDisabled"
            @click="onClose"
          />
        </div>
      </header>

      <!-- Dialog Content -->
      <main class="dlg__body" :class="contentClass">
        <slot />
      </main>

      <!-- Dialog Footer -->
      <footer
        v-if="hasActions || primaryAction || secondaryAction"
        class="dlg__footer"
        :class="footerClass"
      >
        <!-- Custom Actions Slot -->
        <div v-if="hasActions" class="custom-actions">
          <slot name="actions" :loading="loading" :disabled="actionsDisabled" />
        </div>

        <!-- Standard Actions -->
        <div v-else class="standard-actions">
          <!-- Secondary Action -->
          <q-btn
            v-if="secondaryAction"
            :label="secondaryAction.label"
            :icon="secondaryAction.icon"
            :disable="isSecondaryDisabled"
            flat
            @click="onSecondaryAction"
          />

          <!-- Primary Action -->
          <q-btn
            v-if="primaryAction"
            :label="primaryAction.label"
            :icon="primaryAction.icon"
            :loading="primaryActionLoading"
            :disable="isPrimaryDisabled"
            unelevated
            color="primary"
            @click="onPrimaryAction"
          />
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
    title: undefined,
    subtitle: undefined,
    icon: undefined,
    persistent: false,
    maximized: false,
    preventMobileFullscreen: false,
    position: 'standard',
    fullWidth: false,
    transitionShow: 'jump-up',
    transitionHide: 'jump-down',
    closable: true,
    headerClass: undefined,
    contentClass: undefined,
    footerClass: undefined,
    dialogClass: undefined,
    iconSize: '24px',
    variant: 'elegant',
    size: 'md',
    headerVariant: 'solid',
    statusColor: 'primary',
    loading: false,
    loadingText: undefined,
    actionsDisabled: false,
    primaryAction: undefined,
    secondaryAction: undefined,
    primaryActionLoading: false,
    steps: undefined,
    currentStep: 0,
    showSteps: false,
    autoFocus: true,
    isDirty: false,
    confirmCloseMessage: undefined,
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
    const classes = ['dlg'];

    // Size classes using new unified system
    classes.push(`dlg--${props.size}`);

    // Loading state
    if (props.loading) {
      classes.push('dlg--loading');
    }

    // Mobile fullscreen handled by CSS media queries
    // No need for JavaScript-based mobile detection

    return classes;
  });

  const headerVariantClass = computed(() => `header-${props.headerVariant}`);
  const statusColorClass = computed(() => `header-${props.statusColor}`);
  const iconVariantClass = computed(() => `icon-${props.headerVariant}`);

  // Normalized disabled states for native buttons (boolean, not undefined)
  const isCloseDisabled = computed(() =>
    Boolean(props.loading || props.actionsDisabled)
  );
  const isPrimaryDisabled = computed(() =>
    Boolean(
      props.loading || props.actionsDisabled || props.primaryAction?.disabled
    )
  );
  const isSecondaryDisabled = computed(() =>
    Boolean(
      props.loading || props.actionsDisabled || props.secondaryAction?.disabled
    )
  );

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
    if (props.keyboardShortcuts && !props.persistent) {
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
  // BASEDIALOG - USES UNIFIED DIALOG SYSTEM
  // Component-specific styles only, shared styles in _dialogs.scss
  // ===================================================================

  // Step indicator for wizard dialogs
  .dialog-steps {
    background: var(--surface);
    border-bottom: var(--dlg-border);
    padding: var(--dlg-pad);

    .steps-container {
      display: flex;
      justify-content: center;
      gap: var(--dlg-gap);
      max-width: 600px;
      margin: 0 auto;

      .step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-muted);
        font-family: var(--font-family);

        &.step-active {
          color: var(--brand-primary);
        }

        &.step-completed {
          color: var(--brand-success);
        }

        .step-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          background: var(--neutral-200);
          color: var(--text-muted);
          font-family: var(--font-family);
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
        gap: 8px;

        .step-label {
          display: none;
        }
      }
    }
  }

  // Header variant styles (colors only, layout handled by unified system)
  .dlg__header {
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
      color: var(--text);
    }

    &.header-glass {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      color: var(--text);
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
      .header-icon-container {
        .header-icon {
          background: rgba(255, 255, 255, 0.2);
          color: currentColor;
        }
      }
    }
  }

  // Dark mode adaptations for component-specific styles
  body.body--dark {
    .dialog-steps {
      background: var(--surface);
      border-bottom: var(--dlg-border);
    }

    .dlg__header {
      &.header-minimal {
        color: var(--text);
      }

      &.header-glass {
        background: rgba(0, 0, 0, 0.8);
        color: var(--text);
      }
    }
  }
</style>
