<template>
  <div class="product-counting-card">
    <!-- Product Header -->
    <div class="product-header">
      <div class="product-image">
        <img
          v-if="product?.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="product-img"
        />
        <div v-else class="product-placeholder">
          <q-icon name="inventory_2" />
        </div>
      </div>

      <div class="product-info">
        <h2 class="product-name">{{ product?.name || 'Onbekend product' }}</h2>
        <div class="product-meta">
          <span class="product-sku">
            <q-icon name="qr_code" />
            {{ product?.sku || '' }}
          </span>
          <span v-if="currentStock !== undefined" class="current-stock">
            {{
              $t('counting.productFlow.currentStock', { amount: currentStock })
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Count Input Section -->
    <div class="count-input-section">
      <div class="input-header">
        <h3>{{ $t('counting.enterAmount') }}</h3>
      </div>

      <!-- Large Number Display -->
      <div class="count-display">
        <input
          v-model.number="countValue"
          type="number"
          min="0"
          step="1"
          :placeholder="$t('counting.productFlow.countPlaceholder')"
          class="count-input"
          @focus="onInputFocus"
          @blur="onInputBlur"
          ref="countInput"
          readonly
          inputmode="none"
        />
        <div class="count-unit">stuks</div>
      </div>

      <!-- Mobile Numpad -->
      <div class="numpad">
        <div class="numpad-row">
          <button @click="appendDigit(1)" class="numpad-btn">1</button>
          <button @click="appendDigit(2)" class="numpad-btn">2</button>
          <button @click="appendDigit(3)" class="numpad-btn">3</button>
        </div>
        <div class="numpad-row">
          <button @click="appendDigit(4)" class="numpad-btn">4</button>
          <button @click="appendDigit(5)" class="numpad-btn">5</button>
          <button @click="appendDigit(6)" class="numpad-btn">6</button>
        </div>
        <div class="numpad-row">
          <button @click="appendDigit(7)" class="numpad-btn">7</button>
          <button @click="appendDigit(8)" class="numpad-btn">8</button>
          <button @click="appendDigit(9)" class="numpad-btn">9</button>
        </div>
        <div class="numpad-row">
          <button
            v-if="currentStock !== undefined"
            @click="setCount(currentStock)"
            class="numpad-btn action-btn"
            :class="{ active: countValue === currentStock }"
          >
            <div class="btn-content">
              <span class="btn-icon">📦</span>
              <span class="btn-label">{{ currentStock }}</span>
            </div>
          </button>
          <button @click="appendDigit(0)" class="numpad-btn">0</button>
          <button @click="clearInput" class="numpad-btn action-btn">
            <q-icon name="backspace" size="24px" />
          </button>
        </div>
      </div>

      <!-- Validation Message -->
      <Transition name="fade">
        <div v-if="validationMessage" class="validation-message">
          <q-icon name="warning" />
          <span>{{ validationMessage }}</span>
        </div>
      </Transition>

      <!-- Variance Indicator - Fixed Position -->
      <div class="variance-container">
        <Transition name="fade">
          <div
            v-if="showVariance"
            class="variance-indicator"
            :class="varianceClass"
          >
            <div class="variance-icon">
              <q-icon :name="varianceIcon" />
            </div>
            <div class="variance-content">
              <span class="variance-label">Verschil</span>
              <span class="variance-value">{{ varianceText }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <q-btn
        v-if="method === 'scan'"
        @click="$emit('cancel')"
        outline
        color="white"
        no-caps
        class="flex-1"
      >
        <q-icon name="arrow_back" class="q-mr-sm" />
        {{ $t('common.back') }}
      </q-btn>
      <q-btn
        v-else
        @click="$emit('skip')"
        outline
        color="white"
        no-caps
        class="flex-1"
      >
        <q-icon name="skip_next" class="q-mr-sm" />
        {{ $t('counting.productFlow.skip') }}
      </q-btn>

      <q-btn
        @click="confirmCount"
        color="primary"
        :disable="!isValidCount || isLoading"
        :loading="isLoading"
        no-caps
        class="flex-1"
      >
        <q-icon name="check" class="q-mr-sm" />
        {{ $t('counting.productFlow.confirm') }}
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  // Types
  interface Product {
    id: string;
    name: string;
    sku: string;
    current_stock?: number;
    minimum_stock?: number;
    maximum_stock?: number;
    image_url?: string;
  }

  type CountingMethod = 'scan' | 'manual';

  // Props
  const props = defineProps<{
    product: Product | null;
    method: CountingMethod;
    currentStock?: number;
    isLoading?: boolean;
  }>();

  // Emits
  const emit = defineEmits<{
    confirm: [count: number];
    skip: [];
    cancel: [];
  }>();

  // Composables
  const { t } = useI18n();

  // State
  const countValue = ref(0);
  const countInput = ref<HTMLInputElement | null>(null);
  const validationMessage = ref('');

  // Computed

  const showVariance = computed(() => {
    return (
      props.currentStock !== undefined &&
      countValue.value !== props.currentStock
    );
  });

  const variance = computed(() => {
    if (props.currentStock === undefined) return 0;
    return countValue.value - props.currentStock;
  });

  const varianceClass = computed(() => {
    const v = variance.value;
    if (v > 0) return 'positive';
    if (v < 0) return 'negative';
    return 'neutral';
  });

  const varianceIcon = computed(() => {
    const v = variance.value;
    if (v > 0) return 'trending_up';
    if (v < 0) return 'trending_down';
    return 'remove';
  });

  const varianceText = computed(() => {
    const v = variance.value;
    if (v === 0) return 'Geen verschil';
    return v > 0 ? `+${v}` : `${v}`;
  });

  const isValidCount = computed(() => {
    return countValue.value >= 0 && !validationMessage.value;
  });

  // Methods
  const appendDigit = (digit: number) => {
    const currentStr = countValue.value.toString();
    const newStr =
      currentStr === '0' ? digit.toString() : currentStr + digit.toString();
    const newValue = parseInt(newStr);

    // Prevent extremely large numbers
    if (newValue <= 99999) {
      countValue.value = newValue;
      validateCount();
    }
  };

  const clearInput = () => {
    const currentStr = countValue.value.toString();
    if (currentStr.length > 1) {
      const newStr = currentStr.slice(0, -1);
      countValue.value = parseInt(newStr) || 0;
    } else {
      countValue.value = 0;
    }
    validateCount();
  };

  const setCount = (count: number) => {
    countValue.value = count;
    validateCount();
  };

  const validateCount = () => {
    validationMessage.value = '';

    if (countValue.value < 0) {
      validationMessage.value = t('counting.productFlow.mustBePositive');
    } else if (isNaN(countValue.value)) {
      validationMessage.value = t('counting.productFlow.invalidAmount');
    }
  };

  const confirmCount = () => {
    if (!isValidCount.value) return;

    if (countValue.value === undefined || countValue.value === null) {
      validationMessage.value = t('counting.productFlow.amountRequired');
      return;
    }

    emit('confirm', countValue.value);
  };

  const onInputFocus = () => {
    // Select all text when focused for easy editing
    if (countInput.value) {
      countInput.value.select();
    }
  };

  const onInputBlur = () => {
    validateCount();
  };

  // Lifecycle
  onMounted(() => {
    // Set initial value to current stock for easier counting
    if (props.currentStock !== undefined) {
      countValue.value = props.currentStock;
    }
  });

  // Watch for product changes
  watch(
    () => props.product,
    newProduct => {
      if (newProduct && props.currentStock !== undefined) {
        countValue.value = props.currentStock;
      }
      validationMessage.value = '';
    },
    { immediate: true }
  );

  // Watch count value for validation
  watch(countValue, validateCount);
</script>

<style lang="scss" scoped>
  .product-counting-card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 0.75rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-primary);
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 10rem);
    overflow: hidden;
    will-change: transform;
  }

  // Product Header
  .product-header {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    flex-shrink: 0;

    .product-image {
      width: 60px;
      height: 60px;
      flex-shrink: 0;

      .product-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
      }

      .product-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-size: 32px;
      }
    }

    .product-info {
      flex: 1;
      min-width: 0; // Allow text truncation

      .product-name {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        line-height: 1.2;
        word-wrap: break-word;
      }

      .product-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .product-sku,
        .current-stock {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .current-stock {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  // Count Input Section
  .count-input-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;

    .input-header {
      text-align: center;
      margin-bottom: 0.75rem;
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
      }
    }

    .count-display {
      text-align: center;
      margin-bottom: 1rem;
      position: relative;
      flex-shrink: 0;

      input.count-input {
        width: 100%;
        max-width: 180px;
        font-size: 2.2rem;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        text-align: center;
        border: 2px solid var(--border-primary);
        border-radius: var(--radius-base);
        padding: 0.5rem 0.75rem;
        background: var(--bg-primary);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        cursor: default;
        font-family: var(--font-family-mono);

        &:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px var(--brand-primary-alpha-20);
        }

        &::placeholder {
          color: #cbd5e0;
          font-weight: 400;
        }

        &[readonly] {
          background: #ffffff;
          cursor: default;
          user-select: none;
        }

        // Remove number input arrows
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        &[type='number'] {
          appearance: textfield;
          -moz-appearance: textfield;
        }
      }

      .count-unit {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        margin-top: 0.25rem;
      }
    }

    .numpad {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-bottom: 1rem;

      .numpad-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        justify-content: center;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .numpad-btn {
        width: 70px;
        height: 70px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.95);
        color: #1c1917;
        cursor: pointer;
        font-size: 1.3rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        &:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        &.action-btn {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.9)
          );
          color: #1c1917;
          font-size: 1.1rem;

          &:hover {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 255, 255, 1)
            );
            color: #1e40af;
          }

          &.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;

            .btn-icon {
              font-size: 1.2rem;
            }

            .btn-label {
              font-size: 0.8rem;
              font-weight: 600;
              line-height: 1;
            }
          }
        }

        // Enhanced touch feedback for mobile
        @media (hover: none) and (pointer: coarse) {
          &:active {
            background: #e2e8f0;
            transform: scale(0.95);
          }

          &.action-btn:active {
            background: linear-gradient(135deg, #cbd5e0, #94a3b8);
          }
        }
      }
    }

    .validation-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .variance-container {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      flex-shrink: 0;
    }

    .variance-indicator {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      width: 100%;
      max-width: 280px;

      &.positive {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        color: #166534;
      }

      &.negative {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #991b1b;
      }

      &.neutral {
        background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        color: #0c4a6e;
      }

      .variance-icon {
        font-size: 24px;
      }

      .variance-content {
        display: flex;
        flex-direction: column;

        .variance-label {
          font-size: 0.8rem;
          opacity: 0.8;
          font-weight: 500;
        }

        .variance-value {
          font-size: 1.1rem;
          font-weight: 700;
        }
      }
    }
  }

  // Action Buttons
  .action-buttons {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  // Animations
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  // Responsive Design
  @media (max-width: 768px) {
    .product-counting-card {
      padding: 0.5rem;
      margin: 0.25rem;
      height: calc(100vh - 8rem);
    }

    .product-header {
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;

      .product-image {
        width: 50px;
        height: 50px;
      }

      .product-info .product-name {
        font-size: 1rem;
        line-height: 1.2;
      }
    }

    .count-input-section {
      margin-bottom: 0.5rem;

      .input-header {
        margin-bottom: 0.5rem;
      }

      .count-display {
        margin-bottom: 0.75rem;

        .count-input {
          font-size: 1.8rem;
          max-width: 160px;
          padding: 0.4rem 0.6rem;
        }
      }

      .numpad {
        margin-bottom: 0.5rem;

        .numpad-row {
          gap: 0.4rem;
          margin-bottom: 0.4rem;
        }

        .numpad-btn {
          width: 60px;
          height: 60px;
          font-size: 1.2rem;

          &.action-btn {
            font-size: 0.9rem;

            .btn-content {
              .btn-icon {
                font-size: 0.9rem;
              }

              .btn-label {
                font-size: 0.65rem;
              }
            }
          }
        }
      }
    }

    .action-buttons {
      .action-btn {
        min-height: 44px;
        padding: 0.6rem;
        font-size: 0.9rem;
      }
    }
  }

  // Extra small screens
  @media (max-width: 480px) and (max-height: 800px) {
    .product-counting-card {
      padding: 0.4rem;
      height: calc(100vh - 6rem);
    }

    .product-header {
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;

      .product-image {
        width: 50px;
        height: 50px;
      }

      .product-info .product-name {
        font-size: 1rem;
      }
    }

    .count-input-section {
      .count-display {
        margin-bottom: 0.75rem;

        .count-input {
          font-size: 1.8rem;
          max-width: 160px;
        }
      }

      .numpad {
        .numpad-row {
          gap: 0.4rem;
          margin-bottom: 0.4rem;
        }

        .numpad-btn {
          width: 60px;
          height: 60px;
          font-size: 1.2rem;

          &.action-btn {
            font-size: 0.9rem;

            .btn-content {
              .btn-icon {
                font-size: 0.9rem;
              }

              .btn-label {
                font-size: 0.6rem;
              }
            }
          }
        }
      }
    }

    .action-buttons {
      .action-btn {
        min-height: 48px;
        font-size: 0.9rem;
      }
    }
  }

  // Dark mode support
  @media (prefers-color-scheme: dark) {
    .product-counting-card {
      background: rgba(45, 55, 72, 0.95);

      .product-header {
        border-color: rgba(255, 255, 255, 0.1);
      }

      .count-display .count-input {
        background: rgba(45, 55, 72, 0.8);
        border-color: rgba(255, 255, 255, 0.2);
        color: #f7fafc;
      }

      .count-btn,
      .preset-btn {
        background: rgba(45, 55, 72, 0.8);
        border-color: rgba(255, 255, 255, 0.2);
        color: #f7fafc;
      }
    }
  }
</style>
