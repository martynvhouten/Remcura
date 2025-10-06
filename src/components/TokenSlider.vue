<template>
  <div class="token-slider">
    <label>{{ token.name }}</label>
    <div class="slider-wrapper">
      <q-slider
        :model-value="numericValue"
        @update:model-value="updateValue"
        :min="token.min || 0"
        :max="token.max || 100"
        :step="1"
        color="primary"
        class="token-range"
      />
      <div class="value-display">{{ token.value }}{{ token.unit || '' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Token {
    name: string;
    cssVar: string;
    value: string;
    type: 'color' | 'size' | 'number';
    min?: number;
    max?: number;
    unit?: string;
  }

  interface Props {
    token: Token;
  }

  interface Emits {
    (e: 'update', cssVar: string, value: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const numericValue = computed(() => {
    return parseInt(props.token.value) || 0;
  });

  function updateValue(value: number | null) {
    if (value === null) return;
    const newValue = value.toString();
    const cssValue = props.token.unit
      ? `${newValue}${props.token.unit}`
      : newValue;
    emit('update', props.token.cssVar, cssValue);
  }
</script>

<style scoped lang="scss">
  .token-slider {
    label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .slider-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .token-range {
      flex: 1;
    }

    .value-display {
      font-family: var(--font-family-mono);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      min-width: 60px;
      text-align: right;
    }
  }
</style>
