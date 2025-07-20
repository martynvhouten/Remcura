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
    <q-card :class="cardClasses">
      <!-- Dialog Header -->
      <q-card-section
        v-if="hasHeader"
        class="dialog-header"
        :class="headerClass"
      >
        <div class="header-content">
          <div v-if="icon" class="header-icon">
            <q-avatar :size="iconSize" :color="iconColor" text-color="white">
              <q-icon :name="icon" :size="iconInnerSize" />
            </q-avatar>
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

      <q-separator v-if="hasHeader" />

      <!-- Dialog Content -->
      <q-card-section class="dialog-content" :class="contentClass">
        <slot />
      </q-card-section>

      <q-separator v-if="hasActions" />

      <!-- Dialog Actions -->
      <q-card-section
        v-if="hasActions"
        class="dialog-actions"
        :class="actionsClass"
      >
        <slot name="actions" />
      </q-card-section>
    </q-card>
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
  variant?: 'standard' | 'modern' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  transitionShow: 'scale',
  transitionHide: 'scale',
  closable: true,
  iconColor: 'primary',
  iconSize: '48px',
  variant: 'modern',
  size: 'md',
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

  return classes;
});

// Methods
const close = () => {
  emit('close');
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.base-dialog-card {
  border-radius: var(--radius-2xl);
  overflow: hidden;

  // Size variants
  &.dialog-sm {
    width: 100%;
    max-width: 400px;
  }

  &.dialog-md {
    width: 100%;
    max-width: 600px;
  }

  &.dialog-lg {
    width: 100%;
    max-width: 800px;
  }

  &.dialog-xl {
    width: 100%;
    max-width: 1000px;
  }

  // Style variants
  &.dialog-modern {
    box-shadow: var(--shadow-2xl);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &.dialog-glass {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &.dialog-standard {
    box-shadow: var(--shadow-lg);
  }
}

// Dialog header styles
.dialog-header {
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-primary-light)
  );
  color: white;
  padding: var(--space-6);

  .header-content {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);

    .header-icon {
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;
      min-width: 0;

      .dialog-title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-1) 0;
        color: white;
        line-height: var(--leading-tight);
      }

      .dialog-subtitle {
        font-size: var(--text-sm);
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        line-height: var(--leading-relaxed);
      }
    }

    .close-btn {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.9);
      margin-top: -4px;

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Dialog content styles
.dialog-content {
  padding: var(--space-6);

  &:empty {
    display: none;
  }
}

// Dialog actions styles
.dialog-actions {
  padding: var(--space-4) var(--space-6);
  background: var(--neutral-50);

  // Default flex layout for actions
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: var(--space-2);

    :deep(.q-btn) {
      width: 100%;
    }
  }
}

// Dark mode adjustments
body.body--dark {
  .dialog-header {
    background: linear-gradient(
      135deg,
      var(--brand-primary-dark),
      var(--brand-secondary-dark)
    );
  }

  .dialog-actions {
    background: var(--neutral-800);
    border-top: 1px solid var(--neutral-700);
  }

  .dialog-glass {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .base-dialog-card {
    margin: var(--space-4);

    &.dialog-sm,
    &.dialog-md,
    &.dialog-lg,
    &.dialog-xl {
      max-width: calc(100vw - var(--space-8));
    }
  }

  .dialog-header {
    padding: var(--space-4);

    .header-content {
      gap: var(--space-3);

      .dialog-title {
        font-size: var(--text-lg);
      }
    }
  }

  .dialog-content {
    padding: var(--space-4);
  }
}

// Animation enhancements
.base-dialog-card {
  animation: dialogEnter 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes dialogEnter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Focus management
.dialog-header .close-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>
