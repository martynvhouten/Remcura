<template>
  <BaseDialog
    :model-value="modelValue"
    :title="title"
    :icon="icon"
    :size="size"
    :variant="dialogVariant"
    :header-variant="headerVariant"
    :loading="loading"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleCancel"
  >
    <!-- Message Content -->
    <div class="confirm-dialog-content">
      <!-- Main message -->
      <div class="message">{{ message }}</div>

      <!-- Additional details -->
      <div v-if="details" class="details">{{ details }}</div>

      <!-- Warning/Info content -->
      <div v-if="type !== 'default'" class="alert-section">
        <q-banner :class="alertClasses" :icon="alertIcon">
          <div v-if="warningText" class="alert-text">{{ warningText }}</div>
          <ul
            v-if="consequences && consequences.length > 0"
            class="consequences-list"
          >
            <li v-for="consequence in consequences" :key="consequence">
              {{ consequence }}
            </li>
          </ul>
        </q-banner>
      </div>

      <!-- Input field for verification -->
      <div v-if="requiresTextConfirmation" class="verification-section">
        <p class="verification-prompt">{{ verificationPrompt }}</p>
        <q-input
          v-model="verificationText"
          :placeholder="verificationPlaceholder"
          outlined
          dense
          :error="verificationError"
          :error-message="verificationErrorMessage"
          @input="handleVerificationInput"
        />
      </div>
    </div>

    <!-- Dialog Actions -->
    <template #actions>
      <div class="confirm-dialog-actions">
        <!-- Cancel button -->
        <q-btn
          :label="cancelButtonText"
          color="grey-7"
          flat
          :disable="loading"
          @click="handleCancel"
        />

        <!-- Confirm button -->
        <q-btn
          :label="confirmButtonText"
          :color="confirmButtonColor"
          :loading="loading"
          :disable="loading || !canConfirm"
          :icon="confirmButtonIcon"
          @click="handleConfirm"
        />
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseDialog from './BaseDialog.vue';

  interface Props {
    modelValue: boolean;
    title: string;
    message: string;
    details?: string;
    type?: 'default' | 'warning' | 'danger' | 'info';
    warningText?: string;
    consequences?: string[];
    loading?: boolean;
    cancelButtonText?: string;
    confirmButtonText?: string;
    confirmButtonColor?: string;
    confirmButtonIcon?: string;
    size?: 'sm' | 'md' | 'lg';
    requiresTextConfirmation?: boolean;
    verificationPrompt?: string;
    verificationPlaceholder?: string;
    verificationMatch?: string;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm'): void;
    (e: 'cancel'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    loading: false,
    cancelButtonText: '',
    confirmButtonText: '',
    confirmButtonColor: 'primary',
    size: 'sm',
    requiresTextConfirmation: false,
    verificationPrompt: '',
    verificationPlaceholder: '',
    verificationMatch: '',
  });

  const emit = defineEmits<Emits>();
  const { t } = useI18n();

  // Internal state
  const verificationText = ref('');
  const verificationError = ref(false);

  // Computed properties
  const icon = computed(() => {
    if (props.type === 'warning') return 'warning';
    if (props.type === 'danger') return 'error';
    if (props.type === 'info') return 'info';
    return 'help';
  });

  const alertIcon = computed(() => {
    if (props.type === 'warning') return 'warning';
    if (props.type === 'danger') return 'dangerous';
    if (props.type === 'info') return 'info';
    return 'help';
  });

  const alertClasses = computed(() => {
    const classes = ['text-white'];
    if (props.type === 'warning') classes.push('bg-warning');
    if (props.type === 'danger') classes.push('bg-negative');
    if (props.type === 'info') classes.push('bg-info');
    return classes;
  });

  const computedCancelButtonText = computed(
    () => props.cancelButtonText || t('common.cancel')
  );

  const computedConfirmButtonText = computed(() => {
    if (props.confirmButtonText) return props.confirmButtonText;
    if (props.type === 'danger') return t('common.delete');
    return t('common.confirm');
  });

  const computedConfirmButtonColor = computed(() => {
    if (props.confirmButtonColor !== 'primary') return props.confirmButtonColor;
    if (props.type === 'danger') return 'negative';
    if (props.type === 'warning') return 'warning';
    return 'primary';
  });

  const verificationPrompt = computed(
    () =>
      props.verificationPrompt ||
      t('common.typeToConfirm', { text: props.verificationMatch })
  );

  const verificationPlaceholder = computed(
    () => props.verificationPlaceholder || props.verificationMatch
  );

  const verificationErrorMessage = computed(() =>
    t('validation.textMustMatch', { text: props.verificationMatch })
  );

  const canConfirm = computed(() => {
    if (props.requiresTextConfirmation) {
      return (
        verificationText.value === props.verificationMatch &&
        !verificationError.value
      );
    }
    return true;
  });

  const dialogVariant = computed(() => {
    if (props.type === 'danger') return 'elegant';
    if (props.type === 'warning') return 'modern';
    return 'elegant';
  });

  const headerVariant = computed(() => {
    if (props.type === 'danger') return 'gradient';
    if (props.type === 'warning') return 'solid';
    return 'gradient';
  });

  // Methods
  const handleConfirm = () => {
    if (canConfirm.value && !props.loading) {
      emit('confirm');
    }
  };

  const handleCancel = () => {
    emit('cancel');
    emit('update:modelValue', false);
  };

  const handleVerificationInput = () => {
    if (props.requiresTextConfirmation && props.verificationMatch) {
      verificationError.value =
        verificationText.value !== props.verificationMatch &&
        verificationText.value.length > 0;
    }
  };

  // Reset verification when dialog opens/closes
  watch(
    () => props.modelValue,
    newVal => {
      if (newVal) {
        verificationText.value = '';
        verificationError.value = false;
      }
    }
  );
</script>

<style lang="scss" scoped>
  // ===================================================================
  // Confirm dialog styles
  // ===================================================================

  .confirm-dialog-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .message {
      font-size: 18px;
      line-height: 1.6;
      color: var(--neutral-800);
      font-weight: var(--font-weight-medium);
      letter-spacing: -0.01em;
    }

    .details {
      font-size: var(--text-base);
      line-height: 1.5;
      color: var(--neutral-600);
      background: var(--neutral-50);
      padding: var(--space-4);
      border-radius: 12px;
      border-left: 4px solid var(--brand-primary);
    }

    .alert-section {
      :deep(.q-banner) {
        border-radius: 16px;
        padding: var(--space-5);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: none;

        &.bg-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        &.bg-negative {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }

        &.bg-info {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        }
      }

      .alert-text {
        font-weight: var(--font-weight-semibold);
        font-size: var(--text-base);
        margin-bottom: var(--space-3);
        line-height: 1.5;
      }

      .consequences-list {
        margin: 0;
        padding-left: var(--space-5);

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

    .verification-section {
      background: var(--neutral-50);
      padding: var(--space-5);
      border-radius: 16px;
      border: 2px solid var(--neutral-200);

      .verification-prompt {
        font-size: var(--text-base);
        color: var(--neutral-700);
        margin-bottom: var(--space-4);
        font-weight: var(--font-weight-medium);
        line-height: 1.5;
      }

      // Field styling handled by global field system
    }
  }

  .confirm-dialog-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-end;
    margin-top: var(--space-2);

    :deep(.q-btn) {
      min-width: 140px;
      height: var(--control-height-md);
      border-radius: 14px;
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-base);
      letter-spacing: 0.01em;
      text-transform: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      &:active {
        transform: translateY(0);
      }

      // Cancel button styling
      &[color='grey-7'] {
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
        background: linear-gradient(
          135deg,
          var(--brand-primary) 0%,
          var(--brand-primary-light) 100%
        );
        box-shadow: var(--shadow-md);
      }

      // Danger button enhancements
      &.q-btn--unelevated.q-btn--rectangle.bg-negative {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        box-shadow: var(--shadow-md);
      }

      // Warning button enhancements
      &.q-btn--unelevated.q-btn--rectangle.bg-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: var(--shadow-md);
      }
    }

    @media (max-width: 640px) {
      flex-direction: column-reverse;
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
    .confirm-dialog-content {
      .message {
        color: var(--neutral-100);
      }

      .details {
        color: var(--neutral-300);
        background: var(--neutral-800);
        border-left-color: var(--brand-primary-light);
      }

      .verification-section {
        background: var(--neutral-800);
        border-color: var(--neutral-700);

        .verification-prompt {
          color: var(--neutral-200);
        }

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
        }
      }
    }

    .confirm-dialog-actions {
      :deep(.q-btn) {
        // Cancel button dark mode
        &[color='grey-7'] {
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

  // ===================================================================
  // ACCESSIBILITY ENHANCEMENTS
  // ===================================================================

  .confirm-dialog-content {
    .verification-section {
      :deep(.q-field) {
        .q-field__control {
          &:focus-within {
            outline: 2px solid var(--brand-primary);
            outline-offset: 2px;
          }
        }
      }
    }
  }
</style>
