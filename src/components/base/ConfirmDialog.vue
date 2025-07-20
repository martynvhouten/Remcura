<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :icon="icon"
    :size="size"
    persistent
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
        <q-banner 
          :class="alertClasses"
          :icon="alertIcon"
        >
          <div v-if="warningText" class="alert-text">{{ warningText }}</div>
          <ul v-if="consequences && consequences.length > 0" class="consequences-list">
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
          @click="handleCancel"
          :disable="loading"
        />

        <!-- Confirm button -->
        <q-btn
          :label="confirmButtonText"
          :color="confirmButtonColor"
          :loading="loading"
          @click="handleConfirm"
          :disable="loading || !canConfirm"
          :icon="confirmButtonIcon"
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

  const computedCancelButtonText = computed(() => 
    props.cancelButtonText || t('common.cancel')
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

  const verificationPrompt = computed(() => 
    props.verificationPrompt || t('common.typeToConfirm', { text: props.verificationMatch })
  );

  const verificationPlaceholder = computed(() => 
    props.verificationPlaceholder || props.verificationMatch
  );

  const verificationErrorMessage = computed(() => 
    t('validation.textMustMatch', { text: props.verificationMatch })
  );

  const canConfirm = computed(() => {
    if (props.requiresTextConfirmation) {
      return verificationText.value === props.verificationMatch && !verificationError.value;
    }
    return true;
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
      verificationError.value = verificationText.value !== props.verificationMatch && verificationText.value.length > 0;
    }
  };

  // Reset verification when dialog opens/closes
  watch(() => props.modelValue, (newVal) => {
    if (newVal) {
      verificationText.value = '';
      verificationError.value = false;
    }
  });
</script>

<style lang="scss" scoped>
  .confirm-dialog-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    .message {
      font-size: var(--text-base);
      line-height: var(--leading-relaxed);
      color: var(--neutral-900);
    }

    .details {
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
      color: var(--neutral-600);
    }

    .alert-section {
      .alert-text {
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--space-2);
      }

      .consequences-list {
        margin: 0;
        padding-left: var(--space-4);

        li {
          margin-bottom: var(--space-1);
        }
      }
    }

    .verification-section {
      .verification-prompt {
        font-size: var(--text-sm);
        color: var(--neutral-700);
        margin-bottom: var(--space-2);
      }
    }
  }

  .confirm-dialog-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;

    @media (max-width: 640px) {
      flex-direction: column-reverse;

      .q-btn {
        width: 100%;
      }
    }
  }

  // Dark mode adjustments
  body.body--dark {
    .confirm-dialog-content {
      .message {
        color: var(--neutral-100);
      }

      .details {
        color: var(--neutral-400);
      }

      .verification-section {
        .verification-prompt {
          color: var(--neutral-300);
        }
      }
    }
  }
</style> 