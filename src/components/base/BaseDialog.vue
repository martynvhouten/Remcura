<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :persistent="persistent"
    :maximized="maximized"
    :position="position"
    :full-width="fullWidth"
    :transition-show="transitionShow"
    :transition-hide="transitionHide"
    :class="dialogClass"
    role="dialog"
    :aria-labelledby="titleId"
    aria-modal="true"
  >
    <div class="dialog-backdrop" @click="handleBackdropClick">
      <q-card :class="cardClasses" @click.stop>
        <!-- Loading Overlay -->
        <div v-if="loading" class="dialog-loading-overlay">
          <q-spinner-dots size="48px" color="primary" />
          <p class="loading-text">{{ loadingText || $t('common.loading') }}</p>
        </div>

        <!-- Dialog Header -->
        <q-card-section
          v-if="hasHeader"
          class="dialog-header"
          :class="[headerClass, headerVariantClass]"
        >
          <div class="header-content">
            <div v-if="icon" class="header-icon-container">
              <div class="header-icon" :class="iconVariantClass">
                <q-icon :name="icon" :size="iconInnerSize" />
              </div>
            </div>
            <div class="header-text">
              <h2 class="dialog-title" :id="titleId">{{ title }}</h2>
              <p v-if="subtitle" class="dialog-subtitle">{{ subtitle }}</p>
            </div>
            <q-btn
              v-if="closable"
              flat
              round
              dense
              icon="close"
              @click="close"
              class="close-btn"
              :size="closeButtonSize"
              :aria-label="$t('common.closeDialog') || 'Close dialog'"
            />
          </div>
        </q-card-section>

        <!-- Dialog Content -->
        <q-card-section class="dialog-content" :class="contentClass">
          <slot />
        </q-card-section>

        <!-- Dialog Actions -->
        <q-card-section
          v-if="hasActions"
          class="dialog-actions"
          :class="actionsClass"
        >
          <slot name="actions" />
        </q-card-section>
      </q-card>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';
  import { useI18n } from 'vue-i18n';

  interface Props {
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    iconSize?: string;
    persistent?: boolean;
    maximized?: boolean;
    position?: 'standard' | 'top' | 'right' | 'bottom' | 'left';
    fullWidth?: boolean;
    transitionShow?: string;
    transitionHide?: string;
    closable?: boolean;
    headerClass?: string | string[];
    contentClass?: string | string[];
    actionsClass?: string | string[];
    dialogClass?: string | string[];
    variant?: 'standard' | 'modern' | 'glass' | 'elegant' | 'minimal';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    headerVariant?: 'gradient' | 'solid' | 'minimal' | 'glass';
    loading?: boolean;
    loadingText?: string;
    backdropDismiss?: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'close'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    persistent: true,
    maximized: false,
    position: 'standard',
    fullWidth: false,
    transitionShow: 'jump-up',
    transitionHide: 'jump-down',
    closable: true,
    iconColor: 'primary',
    iconSize: '48px',
    variant: 'elegant',
    size: 'md',
    headerVariant: 'gradient',
    loading: false,
    backdropDismiss: false,
  });

  const emit = defineEmits<Emits>();
  const slots = useSlots();

  // Computed properties
  const titleId = computed(
    () => `dialog-title-${Math.random().toString(36).substr(2, 9)}`
  );

  const hasHeader = computed(
    () => !!(props.title || props.subtitle || props.icon || slots.header)
  );
  const hasActions = computed(() => !!slots.actions);

  const iconInnerSize = computed(() => {
    const size = parseInt(props.iconSize);
    return `${Math.round(size * 0.5)}px`;
  });

  const closeButtonSize = computed(() => {
    const size = parseInt(props.iconSize);
    return size > 40 ? 'md' : 'sm';
  });

  const cardClasses = computed(() => {
    const classes = ['base-dialog-card'];

    // Variant classes
    classes.push(`dialog-${props.variant}`);

    // Size classes
    classes.push(`dialog-${props.size}`);

    // Loading state
    if (props.loading) {
      classes.push('dialog-loading');
    }

    return classes;
  });

  const headerVariantClass = computed(() => {
    return `header-${props.headerVariant}`;
  });

  const iconVariantClass = computed(() => {
    return `icon-${props.headerVariant}`;
  });

  // Methods
  const close = () => {
    if (!props.loading) {
      emit('close');
      emit('update:modelValue', false);
    }
  };

  const handleBackdropClick = () => {
    if (props.backdropDismiss && !props.persistent && !props.loading) {
      close();
    }
  };
</script>

<style lang="scss" scoped>
// ===================================================================
// MODERN DIALOG SYSTEM - TOP-NOTCH DESIGN
// ===================================================================

.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 9999;
}

.base-dialog-card {
  position: relative;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;

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
      border-radius: 24px;

      .loading-text {
        font-size: var(--text-sm);
        color: var(--neutral-600);
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

  // Style variants
  &.dialog-elegant {
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  &.dialog-modern {
    background: white;
    box-shadow: 
      0 32px 64px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  &.dialog-glass {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &.dialog-minimal {
    background: white;
    border: none;
    box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.1);
  }

  &.dialog-standard {
    background: white;
    border: 1px solid var(--neutral-200);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

// ===================================================================
// HEADER STYLES - MULTIPLE VARIANTS
// ===================================================================

.dialog-header {
  position: relative;
  padding: 0;
  border: none;

  // Header variants
  &.header-gradient {
    background: linear-gradient(135deg, 
      var(--brand-primary) 0%, 
      var(--brand-primary-light) 50%,
      var(--brand-accent) 100%);
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }
  }

  &.header-solid {
    background: var(--brand-primary);
    color: white;
  }

  &.header-minimal {
    background: transparent;
    color: var(--neutral-900);
    border-bottom: 1px solid var(--neutral-100);
  }

  &.header-glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    color: var(--neutral-900);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-8);
    position: relative;
    z-index: 1;

    .header-icon-container {
      flex-shrink: 0;

      .header-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        transition: all 0.3s ease;

        &.icon-gradient {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        &.icon-solid {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        &.icon-minimal {
          background: var(--brand-primary);
          color: white;
        }

        &.icon-glass {
          background: rgba(255, 255, 255, 0.9);
          color: var(--brand-primary);
          backdrop-filter: blur(8px);
        }
      }
    }

    .header-text {
      flex: 1;
      min-width: 0;

      .dialog-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 var(--space-1) 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
        font-family: 'Poppins', sans-serif;
      }

      .dialog-subtitle {
        font-size: var(--text-base);
        margin: 0;
        opacity: 0.85;
        line-height: 1.4;
        font-weight: var(--font-weight-medium);
      }
    }

    .close-btn {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      transition: all 0.2s ease;
      margin: -8px -8px 0 0;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// ===================================================================
// CONTENT & ACTIONS STYLES
// ===================================================================

.dialog-content {
  padding: var(--space-8);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--neutral-700);

  &:empty {
    display: none;
  }

  // Better typography for content
  :deep(p) {
    margin: 0 0 var(--space-4) 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(h3) {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--neutral-900);
    margin: 0 0 var(--space-3) 0;
  }

  :deep(.q-field) {
    margin-bottom: var(--space-4);
  }
}

.dialog-actions {
  padding: var(--space-6) var(--space-8) var(--space-8);
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.02) 0%, 
    rgba(0, 0, 0, 0.04) 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  align-items: center;

  :deep(.q-btn) {
    min-width: 120px;
    height: 44px;
    border-radius: 12px;
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-sm);
    letter-spacing: 0.01em;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: var(--space-3);

    :deep(.q-btn) {
      width: 100%;
      min-width: auto;
    }
  }
}

// ===================================================================
// DARK MODE ADAPTATIONS
// ===================================================================

body.body--dark {
  .dialog-backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .base-dialog-card {
    background: var(--neutral-800);
    border: 1px solid var(--neutral-700);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05);

    &.dialog-elegant {
      background: linear-gradient(135deg, var(--neutral-800) 0%, var(--neutral-850) 100%);
    }

    &.dialog-glass {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    &.dialog-loading .dialog-loading-overlay {
      background: rgba(0, 0, 0, 0.9);
      
      .loading-text {
        color: var(--neutral-300);
      }
    }
  }

  .dialog-header {
    &.header-minimal {
      color: var(--neutral-100);
      border-bottom: 1px solid var(--neutral-700);
    }

    &.header-glass {
      background: rgba(0, 0, 0, 0.6);
      color: var(--neutral-100);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  .dialog-content {
    color: var(--neutral-300);

    :deep(h3) {
      color: var(--neutral-100);
    }
  }

  .dialog-actions {
    background: linear-gradient(to bottom, 
      rgba(255, 255, 255, 0.02) 0%, 
      rgba(255, 255, 255, 0.04) 100%);
    border-top: 1px solid var(--neutral-700);
  }
}

// ===================================================================
// RESPONSIVE DESIGN
// ===================================================================

@media (max-width: 768px) {
  .dialog-backdrop {
    padding: var(--space-2);
  }

  .base-dialog-card {
    &.dialog-sm,
    &.dialog-md,
    &.dialog-lg,
    &.dialog-xl {
      max-width: calc(100vw - var(--space-4));
      margin: 0;
    }

    &.dialog-full {
      width: 100vw;
      height: 100vh;
      max-width: none;
      max-height: none;
      border-radius: 0;
    }
  }

  .dialog-header .header-content {
    padding: var(--space-5) var(--space-6);
    gap: var(--space-3);

    .header-icon-container .header-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    .dialog-title {
      font-size: 24px;
    }

    .dialog-subtitle {
      font-size: var(--text-sm);
    }
  }

  .dialog-content {
    padding: var(--space-6);
  }

  .dialog-actions {
    padding: var(--space-5) var(--space-6) var(--space-6);
  }
}

// ===================================================================
// ADVANCED ANIMATIONS
// ===================================================================

.base-dialog-card {
  animation: dialogSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialogSlideUp {
  0% {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Focus states
.dialog-header .close-btn:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

// Scroll behavior
.base-dialog-card {
  scrollbar-width: thin;
  scrollbar-color: var(--neutral-300) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--neutral-300);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-400);
  }
}
</style>
