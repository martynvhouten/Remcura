<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :size="size"
    :variant="dialogVariant"
    :header-variant="headerVariant"
    :loading="loading"
    :loading-text="loadingText"
    :persistent="persistent || loading"
    :closable="!loading"
    @close="handleClose"
  >
    <!-- Form Content -->
    <q-form @submit="handleSubmit" @reset="handleReset" class="form-dialog-content">
      <slot />
      
      <!-- Form validation errors summary -->
      <div v-if="showErrorSummary && formErrors.length > 0" class="error-summary">
        <q-banner inline-actions class="text-negative">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          <div class="error-summary-content">
            <div class="error-summary-title">{{ $t('validation.formErrors') }}</div>
            <ul class="error-list">
              <li v-for="error in formErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </q-banner>
      </div>
    </q-form>

    <!-- Dialog Actions -->
    <template #actions>
      <div class="form-dialog-actions">
        <!-- Loading indicator -->
        <div v-if="loading" class="loading-indicator">
          <q-spinner-dots size="md" />
          <span class="loading-text">{{ loadingText }}</span>
        </div>

        <!-- Action buttons -->
        <div v-else class="action-buttons">
          <!-- Reset button -->
          <q-btn
            v-if="showResetButton"
            :label="resetButtonText"
            color="grey-7"
            flat
            @click="handleReset"
            :disable="loading"
          />

          <!-- Cancel button -->
          <q-btn
            :label="cancelButtonText"
            color="grey-7"
            flat
            @click="handleCancel"
            :disable="loading"
          />

          <!-- Submit button -->
          <q-btn
            :label="submitButtonText"
            :color="submitButtonColor"
            :loading="loading"
            @click="handleSubmit"
            :disable="loading || !canSubmit"
            :icon="submitButtonIcon"
          />
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseDialog from './BaseDialog.vue';

  interface Props {
    modelValue: boolean;
    title: string;
    subtitle?: string;
    icon?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    persistent?: boolean;
    loading?: boolean;
    loadingText?: string;
    showResetButton?: boolean;
    resetButtonText?: string;
    cancelButtonText?: string;
    submitButtonText?: string;
    submitButtonColor?: string;
    submitButtonIcon?: string;
    canSubmit?: boolean;
    formErrors?: string[];
    showErrorSummary?: boolean;
    confirmBeforeClose?: boolean;
    confirmCloseMessage?: string;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'submit'): void;
    (e: 'cancel'): void;
    (e: 'reset'): void;
    (e: 'close'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    persistent: false,
    loading: false,
    loadingText: 'Processing...',
    showResetButton: false,
    resetButtonText: '',
    cancelButtonText: '',
    submitButtonText: '',
    submitButtonColor: 'primary',
    canSubmit: true,
    formErrors: () => [],
    showErrorSummary: true,
    confirmBeforeClose: false,
    confirmCloseMessage: '',
  });

  const emit = defineEmits<Emits>();
  const { t } = useI18n();

  // Internal state
  const hasUnsavedChanges = ref(false);

  // Computed properties
  const computedResetButtonText = computed(() => 
    props.resetButtonText || t('common.reset')
  );

  const computedCancelButtonText = computed(() => 
    props.cancelButtonText || t('common.cancel')
  );

  const computedSubmitButtonText = computed(() => 
    props.submitButtonText || t('common.save')
  );

  const computedConfirmCloseMessage = computed(() => 
    props.confirmCloseMessage || t('common.confirmClose')
  );

  const dialogVariant = computed(() => 'elegant');
  const headerVariant = computed(() => 'solid');

  // Methods
  const handleSubmit = () => {
    if (!props.loading && props.canSubmit) {
      emit('submit');
    }
  };

  const handleCancel = () => {
    if (props.confirmBeforeClose && hasUnsavedChanges.value) {
      confirmClose(() => {
        emit('cancel');
        emit('update:modelValue', false);
      });
    } else {
      emit('cancel');
      emit('update:modelValue', false);
    }
  };

  const handleReset = () => {
    emit('reset');
    hasUnsavedChanges.value = false;
  };

  const handleClose = () => {
    if (props.confirmBeforeClose && hasUnsavedChanges.value) {
      confirmClose(() => {
        emit('close');
        emit('update:modelValue', false);
      });
    } else {
      emit('close');
      emit('update:modelValue', false);
    }
  };

  const confirmClose = (onConfirm: () => void) => {
    // TODO: Use Quasar's Dialog plugin for confirmation
    // For now, use browser confirm
    if (confirm(computedConfirmCloseMessage.value)) {
      onConfirm();
    }
  };

  // Track changes
  const markAsChanged = () => {
    hasUnsavedChanges.value = true;
  };

  // Expose methods for parent components
  defineExpose({
    markAsChanged,
  });
</script>

<style lang="scss" scoped>
// ===================================================================
// MODERN FORM DIALOG STYLING
// ===================================================================

.form-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);

  // Use global field system - no custom overrides

  // All form field styling handled by global field system
}

.error-summary {
  margin-top: var(--space-6);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);

  :deep(.q-banner) {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border: none;
    padding: var(--space-5);

    .q-banner__avatar {
      .q-icon {
        font-size: 24px;
      }
    }
  }

  .error-summary-content {
    .error-summary-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--text-base);
      margin-bottom: var(--space-3);
      color: white;
    }

    .error-list {
      margin: 0;
      padding-left: var(--space-5);
      color: rgba(255, 255, 255, 0.95);

      li {
        margin-bottom: var(--space-2);
        font-size: var(--text-sm);
        line-height: 1.4;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.form-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: var(--space-2);

  .loading-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    color: var(--neutral-600);
    background: var(--neutral-50);
    padding: var(--space-4) var(--space-6);
    border-radius: 16px;
    border: 2px solid var(--neutral-200);

    .loading-text {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
    }

    :deep(.q-spinner-dots) {
      font-size: 32px;
    }
  }

  .action-buttons {
    display: flex;
    gap: var(--space-4);
    margin-left: auto;

    :deep(.q-btn) {
      min-width: 140px;
      height: 48px;
      border-radius: 14px;
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-base);
      letter-spacing: 0.01em;
      text-transform: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0);
      }

      // Reset button styling
      &[color="grey-7"] {
        background: var(--neutral-100);
        color: var(--neutral-700);
        border: 2px solid var(--neutral-200);

        &:hover {
          background: var(--neutral-200);
          border-color: var(--neutral-300);
        }
      }

      // Primary button enhancements
      &.q-btn--unelevated.q-btn--rectangle.bg-primary {
        background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-light) 100%);
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
      }
    }

    @media (max-width: 640px) {
      flex-direction: column-reverse;
      width: 100%;
      margin-left: 0;
      gap: var(--space-3);

      :deep(.q-btn) {
        width: 100%;
        min-width: auto;
      }
    }
  }
}

// ===================================================================
// DARK MODE ADAPTATIONS
// ===================================================================

body.body--dark {
  .form-dialog-content {
    :deep(.q-field) {
      .q-field__control {
        background: var(--neutral-900);
        border-color: var(--neutral-600);
        color: var(--neutral-100);

        &:hover {
          border-color: var(--brand-primary-light);
        }
      }

      &.q-field--focused .q-field__control {
        border-color: var(--brand-primary-light);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      &.q-field--error .q-field__control {
        background: rgba(220, 38, 38, 0.1);
      }

      .q-field__label {
        color: var(--neutral-300);
      }
    }

    :deep(.q-checkbox),
    :deep(.q-radio) {
      .q-checkbox__inner,
      .q-radio__inner {
        border-color: var(--neutral-500);
        background: var(--neutral-800);

        &:hover {
          border-color: var(--brand-primary-light);
        }
      }

      &.q-checkbox--checked .q-checkbox__inner,
      &.q-radio--checked .q-radio__inner {
        background: var(--brand-primary-light);
        border-color: var(--brand-primary-light);
      }
    }
  }

  .form-dialog-actions {
    .loading-indicator {
      background: var(--neutral-800);
      border-color: var(--neutral-700);
      color: var(--neutral-300);
    }

    .action-buttons {
      :deep(.q-btn) {
        // Reset button dark mode
        &[color="grey-7"] {
          background: var(--neutral-700);
          color: var(--neutral-200);
          border-color: var(--neutral-600);

          &:hover {
            background: var(--neutral-600);
            border-color: var(--neutral-500);
          }
        }
      }
    }
  }
}

// ===================================================================
// RESPONSIVE DESIGN
// ===================================================================

@media (max-width: 640px) {
  .form-dialog-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);

    .loading-indicator {
      justify-content: center;
      margin-bottom: 0;
    }
  }
}

// ===================================================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================================================

.form-dialog-content {
  :deep(.q-field) {
    .q-field__control {
      &:focus-within {
        outline: 2px solid var(--brand-primary);
        outline-offset: 2px;
      }
    }
  }
}
</style> 