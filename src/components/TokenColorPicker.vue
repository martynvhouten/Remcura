<template>
  <div class="token-color-picker">
    <label>{{ token.name }}</label>
    <div class="color-input-wrapper">
      <input
        type="color"
        :value="localValue"
        class="color-input"
        @input="updateValue(($event.target as HTMLInputElement)?.value ?? '')"
      />
      <input
        type="text"
        :value="localValue"
        class="color-text"
        :placeholder="token.cssVar"
        @input="updateValue(($event.target as HTMLInputElement)?.value ?? '')"
        @blur="validateColor"
      />
    </div>
    <div v-if="token.description" class="token-description">
      {{ token.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface Token {
    name: string;
    cssVar: string;
    value: string;
    type: 'color' | 'size' | 'number';
    description?: string;
  }

  interface Props {
    token: Token;
  }

  interface Emits {
    (e: 'update', cssVar: string, value: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const localValue = ref(props.token.value);

  // Watch for external changes to token.value
  watch(
    () => props.token.value,
    newValue => {
      localValue.value = newValue;
    }
  );

  function updateValue(value: string) {
    localValue.value = value;
    emit('update', props.token.cssVar, value);
  }

  function validateColor(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Basic hex color validation
    if (!/^#[0-9A-F]{6}$/i.test(value)) {
      // Reset to previous valid value if invalid
      (event.target as HTMLInputElement).value = localValue.value;
    }
  }
</script>

<style scoped lang="scss">
  .token-color-picker {
    .color-input-wrapper {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .color-input {
      width: 40px;
      height: 32px;
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .color-text {
      flex: 1;
      padding: var(--space-2);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: var(--text-sm);
    }

    label {
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .token-description {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
      margin-top: var(--space-1);
    }
  }
</style>
