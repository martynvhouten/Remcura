<template>
  <div class="token-inspector">
    <div class="inspector-header">
      <h3>🎨 Token Inspector</h3>
      <div class="inspector-controls">
        <q-btn
          flat
          dense
          icon="refresh"
          :disable="!hasChanges"
          @click="resetTokens"
        >
          <q-tooltip>Reset to defaults</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          :icon="isPersistent ? 'save' : 'save_alt'"
          :color="isPersistent ? 'positive' : 'grey'"
          @click="togglePersistence"
        >
          <q-tooltip>{{
            isPersistent ? 'Auto-save enabled' : 'Enable auto-save'
          }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          :icon="isExpanded ? 'expand_less' : 'expand_more'"
          @click="isExpanded = !isExpanded"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="inspector-content">
      <!-- Brand Colors -->
      <div class="token-group">
        <h4>Brand Colors</h4>
        <div class="token-grid">
          <TokenColorPicker
            v-for="token in brandTokens"
            :key="token.name"
            :token="token"
            @update="updateToken"
          />
        </div>
      </div>

      <!-- Semantic Colors -->
      <div class="token-group">
        <h4>Semantic Colors</h4>
        <div class="token-grid">
          <TokenColorPicker
            v-for="token in semanticTokens"
            :key="token.name"
            :token="token"
            @update="updateToken"
          />
        </div>
      </div>

      <!-- Spacing -->
      <div class="token-group">
        <h4>Spacing</h4>
        <div class="token-grid">
          <TokenSlider
            v-for="token in spacingTokens"
            :key="token.name"
            :token="token"
            @update="updateToken"
          />
        </div>
      </div>

      <!-- Typography -->
      <div class="token-group">
        <h4>Typography</h4>
        <div class="token-grid">
          <TokenSlider
            v-for="token in typographyTokens"
            :key="token.name"
            :token="token"
            @update="updateToken"
          />
        </div>
      </div>

      <!-- Border Radius -->
      <div class="token-group">
        <h4>Border Radius</h4>
        <div class="token-grid">
          <TokenSlider
            v-for="token in radiusTokens"
            :key="token.name"
            :token="token"
            @update="updateToken"
          />
        </div>
      </div>

      <!-- Live Preview -->
      <div class="token-group">
        <h4>Live Preview</h4>
        <div class="preview-grid">
          <!-- Button Preview -->
          <div class="preview-item">
            <h5>Buttons</h5>
            <div class="preview-buttons">
              <q-btn color="primary" label="Primary" />
              <q-btn outline color="primary" label="Outline" />
              <q-btn flat color="primary" label="Flat" />
            </div>
          </div>

          <!-- Card Preview -->
          <div class="preview-item">
            <h5>Card</h5>
            <div class="preview-card">
              <div class="card-header">
                <h6>Sample Card</h6>
                <p>This card updates with your token changes</p>
              </div>
            </div>
          </div>

          <!-- Form Preview -->
          <div class="preview-item">
            <h5>Form Controls</h5>
            <div class="preview-form">
              <q-input
                v-model="sampleInputValue"
                outlined
                label="Sample Input"
                placeholder="Type here..."
                style="margin-bottom: 12px"
              />
              <q-select
                v-model="sampleSelectValue"
                outlined
                label="Sample Select"
                :options="['Option 1', 'Option 2']"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import TokenColorPicker from './TokenColorPicker.vue';
  import TokenSlider from './TokenSlider.vue';

  interface Token {
    name: string;
    cssVar: string;
    value: string;
    type: 'color' | 'size' | 'number';
    min?: number;
    max?: number;
    unit?: string;
    description?: string;
  }

  const isExpanded = ref(true);
  const isPersistent = ref(false);
  const hasChanges = ref(false);
  const originalValues = ref<Record<string, string>>({});
  const sampleInputValue = ref('');
  const sampleSelectValue = ref('');

  // Define token categories
  const brandTokens = ref<Token[]>([
    {
      name: 'Primary',
      cssVar: '--brand-primary',
      value: '#1e3a8a',
      type: 'color',
      description: 'Main brand color',
    },
    {
      name: 'Secondary',
      cssVar: '--brand-secondary',
      value: '#0f766e',
      type: 'color',
      description: 'Secondary brand color',
    },
    {
      name: 'Accent',
      cssVar: '--brand-accent',
      value: '#0d9488',
      type: 'color',
      description: 'Accent color',
    },
  ]);

  const semanticTokens = ref<Token[]>([
    {
      name: 'Success',
      cssVar: '--brand-success',
      value: '#065f46',
      type: 'color',
    },
    {
      name: 'Warning',
      cssVar: '--brand-warning',
      value: '#d97706',
      type: 'color',
    },
    {
      name: 'Danger',
      cssVar: '--brand-danger',
      value: '#b91c1c',
      type: 'color',
    },
    { name: 'Info', cssVar: '--brand-info', value: '#1e40af', type: 'color' },
  ]);

  const spacingTokens = ref<Token[]>([
    {
      name: 'Space 2',
      cssVar: '--space-2',
      value: '8',
      type: 'size',
      min: 2,
      max: 32,
      unit: 'px',
    },
    {
      name: 'Space 3',
      cssVar: '--space-3',
      value: '12',
      type: 'size',
      min: 4,
      max: 48,
      unit: 'px',
    },
    {
      name: 'Space 4',
      cssVar: '--space-4',
      value: '16',
      type: 'size',
      min: 8,
      max: 64,
      unit: 'px',
    },
    {
      name: 'Space 6',
      cssVar: '--space-6',
      value: '24',
      type: 'size',
      min: 12,
      max: 96,
      unit: 'px',
    },
  ]);

  const typographyTokens = ref<Token[]>([
    {
      name: 'Text Base',
      cssVar: '--text-base',
      value: '16',
      type: 'size',
      min: 12,
      max: 24,
      unit: 'px',
    },
    {
      name: 'Text SM',
      cssVar: '--text-sm',
      value: '14',
      type: 'size',
      min: 10,
      max: 20,
      unit: 'px',
    },
    {
      name: 'Text LG',
      cssVar: '--text-lg',
      value: '18',
      type: 'size',
      min: 14,
      max: 28,
      unit: 'px',
    },
    {
      name: 'Text XL',
      cssVar: '--text-xl',
      value: '20',
      type: 'size',
      min: 16,
      max: 32,
      unit: 'px',
    },
  ]);

  const radiusTokens = ref<Token[]>([
    {
      name: 'Radius SM',
      cssVar: '--radius-sm',
      value: '4',
      type: 'size',
      min: 0,
      max: 24,
      unit: 'px',
    },
    {
      name: 'Radius MD',
      cssVar: '--radius-md',
      value: '12',
      type: 'size',
      min: 0,
      max: 32,
      unit: 'px',
    },
    {
      name: 'Radius LG',
      cssVar: '--radius-lg',
      value: '12',
      type: 'size',
      min: 0,
      max: 32,
      unit: 'px',
    },
    {
      name: 'Radius XL',
      cssVar: '--radius-xl',
      value: '16',
      type: 'size',
      min: 0,
      max: 48,
      unit: 'px',
    },
  ]);

  // Get current CSS variable value
  function getCurrentValue(cssVar: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
  }

  // Update token value
  function updateToken(cssVar: string, value: string) {
    document.documentElement.style.setProperty(cssVar, value);
    hasChanges.value = true;

    if (isPersistent.value) {
      saveToLocalStorage();
    }
  }

  // Reset all tokens to original values
  function resetTokens() {
    Object.entries(originalValues.value).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(cssVar, value);
    });

    // Update token objects with original values
    [
      ...brandTokens.value,
      ...semanticTokens.value,
      ...spacingTokens.value,
      ...typographyTokens.value,
      ...radiusTokens.value,
    ].forEach(token => {
      token.value = originalValues.value[token.cssVar] || token.value;
    });

    hasChanges.value = false;

    if (isPersistent.value) {
      localStorage.removeItem('remcura-token-overrides');
    }
  }

  // Toggle persistence
  function togglePersistence() {
    isPersistent.value = !isPersistent.value;

    if (isPersistent.value) {
      saveToLocalStorage();
    } else {
      localStorage.removeItem('remcura-token-overrides');
    }
  }

  // Save current overrides to localStorage
  function saveToLocalStorage() {
    const overrides: Record<string, string> = {};

    [
      ...brandTokens.value,
      ...semanticTokens.value,
      ...spacingTokens.value,
      ...typographyTokens.value,
      ...radiusTokens.value,
    ].forEach(token => {
      const currentValue = getCurrentValue(token.cssVar);
      if (currentValue && currentValue !== originalValues.value[token.cssVar]) {
        overrides[token.cssVar] = currentValue;
      }
    });

    localStorage.setItem('remcura-token-overrides', JSON.stringify(overrides));
  }

  // Load overrides from localStorage
  function loadFromLocalStorage() {
    const stored = localStorage.getItem('remcura-token-overrides');
    if (stored) {
      try {
        const overrides = JSON.parse(stored);
        Object.entries(overrides).forEach(([cssVar, value]) => {
          document.documentElement.style.setProperty(cssVar, value as string);
        });
        isPersistent.value = true;
        hasChanges.value = Object.keys(overrides).length > 0;
      } catch (e) {
        console.warn('Failed to load token overrides from localStorage:', e);
      }
    }
  }

  // Initialize component
  onMounted(() => {
    // Store original values
    [
      ...brandTokens.value,
      ...semanticTokens.value,
      ...spacingTokens.value,
      ...typographyTokens.value,
      ...radiusTokens.value,
    ].forEach(token => {
      const currentValue = getCurrentValue(token.cssVar);
      originalValues.value[token.cssVar] = currentValue || token.value;

      // Update token value with current CSS value if different
      if (currentValue && currentValue !== token.value) {
        token.value = currentValue;
      }
    });

    // Load any saved overrides
    loadFromLocalStorage();
  });
  // Initialize component
  onMounted(() => {
    // Store original values
    [
      ...brandTokens.value,
      ...semanticTokens.value,
      ...spacingTokens.value,
      ...typographyTokens.value,
      ...radiusTokens.value,
    ].forEach(token => {
      const currentValue = getCurrentValue(token.cssVar);
      originalValues.value[token.cssVar] = currentValue || token.value;

      // Update token value with current CSS value if different
      if (currentValue && currentValue !== token.value) {
        token.value = currentValue;
      }
    });

    // Load any saved overrides
    loadFromLocalStorage();
  });
</script>

<style scoped lang="scss">
  .token-inspector {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .inspector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-primary);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }

    .inspector-controls {
      display: flex;
      gap: var(--space-2);
    }
  }

  .inspector-content {
    padding: var(--space-4);
    max-height: 600px;
    overflow-y: auto;
  }

  .token-group {
    margin-bottom: var(--space-6);

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      margin: 0 0 var(--space-3) 0;
      font-size: var(--text-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--space-2);
    }
  }

  .token-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

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

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
  }

  .preview-item {
    h5 {
      margin: 0 0 var(--space-3) 0;
      font-size: var(--text-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }
  }

  .preview-buttons {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .preview-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);

    .card-header {
      h6 {
        margin: 0 0 var(--space-2) 0;
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }

  .preview-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  // Dark mode adjustments
  html.dark {
    .token-inspector {
      .color-input,
      .color-text {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .token-grid {
      grid-template-columns: 1fr;
    }

    .preview-grid {
      grid-template-columns: 1fr;
    }

    .inspector-content {
      max-height: 400px;
    }
  }
</style>
