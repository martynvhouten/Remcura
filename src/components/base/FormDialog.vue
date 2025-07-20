<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :size="size"
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
  .form-dialog-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .error-summary {
    margin-top: var(--space-4);

    .error-summary-content {
      .error-summary-title {
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-2);
      }

      .error-list {
        margin: 0;
        padding-left: var(--space-4);

        li {
          margin-bottom: var(--space-1);
        }
      }
    }
  }

  .form-dialog-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--neutral-600);

      .loading-text {
        font-size: var(--text-sm);
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--space-3);
      margin-left: auto;

      @media (max-width: 640px) {
        flex-direction: column-reverse;
        width: 100%;
        margin-left: 0;

        .q-btn {
          width: 100%;
        }
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 640px) {
    .form-dialog-actions {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);

      .loading-indicator {
        justify-content: center;
        margin-bottom: var(--space-2);
      }
    }
  }
</style> 