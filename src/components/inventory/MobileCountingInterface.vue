<template>
  <div class="mobile-counting-interface">
    <!-- Counting Header with Progress -->
    <div class="counting-header">
      <div class="progress-section">
        <q-linear-progress
          :value="countingStats.progress_percentage / 100"
          color="primary"
          size="8px"
          class="progress-bar"
        />
        <div class="progress-text">
          {{ countingStats.counted_products }} /
          {{ countingStats.total_products }}
          {{ $t('counting.productsCompleted') }}
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <q-icon name="checklist" color="positive" />
          <span>{{ countingStats.counted_products }}</span>
        </div>
        <div class="stat-item" v-if="countingStats.discrepancies > 0">
          <q-icon name="warning" color="warning" />
          <span>{{ countingStats.discrepancies }}</span>
        </div>
        <div class="stat-item">
          <q-icon name="schedule" />
          <span>{{ formatSessionTime }}</span>
        </div>
      </div>
    </div>

    <!-- Current Product Card -->
    <div v-if="currentProduct" class="product-card">
      <div class="product-header">
        <div class="product-info">
          <h3 class="product-name">{{ currentProduct.name }}</h3>
          <p class="product-sku">
            {{ $t('products.sku') }}: {{ currentProduct.sku }}
          </p>
          <p v-if="currentProduct.category" class="product-category">
            {{ currentProduct.category }}
          </p>
        </div>

        <div class="product-image">
          <q-img
            v-if="currentProduct.image_url"
            :src="currentProduct.image_url"
            :alt="currentProduct.name"
            width="80px"
            height="80px"
            fit="cover"
            class="rounded-lg"
          />
          <div v-else class="placeholder-image">
            <q-icon name="inventory_2" size="40px" color="grey-5" />
          </div>
        </div>
      </div>

      <div class="location-info">
        <q-icon name="place" />
        <span>{{ currentProduct.location_name }}</span>
      </div>

      <div class="system-quantity">
        {{ $t('counting.systemQuantity') }}:
        <strong
          >{{ currentProduct.current_system_quantity }}
          {{ currentProduct.unit || '' }}</strong
        >
      </div>
    </div>

    <!-- Counting Input Section -->
    <div v-if="currentProduct" class="counting-input-section">
      <div class="quantity-input-container">
        <label class="input-label">{{ $t('counting.countedQuantity') }}</label>

        <!-- Large touch-friendly number input -->
        <div class="quantity-input-wrapper">
          <q-btn
            round
            color="negative"
            icon="remove"
            size="lg"
            @click="decrementQuantity"
            :disable="countedQuantity <= 0"
            class="quantity-btn"
          />

          <q-input
            v-model.number="countedQuantity"
            type="number"
            min="0"
            step="0.1"
            filled
            class="quantity-input"
            :suffix="currentProduct.unit || ''"
            input-class="text-center text-h5"
            @focus="onQuantityFocus"
          />

          <q-btn
            round
            color="positive"
            icon="add"
            size="lg"
            @click="incrementQuantity"
            class="quantity-btn"
          />
        </div>

        <!-- Quick quantity buttons -->
        <div class="quick-buttons">
          <q-btn
            v-for="qty in quickQuantities"
            :key="qty"
            :label="qty.toString()"
            outline
            color="primary"
            size="md"
            @click="setQuantity(qty)"
            class="quick-btn"
          />
          <q-btn
            :label="currentProduct.current_system_quantity.toString()"
            color="primary"
            size="md"
            @click="setQuantity(currentProduct.current_system_quantity)"
            class="quick-btn system-qty-btn"
          />
        </div>
      </div>

      <!-- Variance Indicator -->
      <div
        v-if="showVariance"
        class="variance-indicator"
        :class="varianceClass"
      >
        <q-icon :name="varianceIcon" />
        <span class="variance-text">
          {{ varianceText }}
        </span>
      </div>

      <!-- Additional Options -->
      <div class="additional-options">
        <q-expansion-item
          icon="more_horiz"
          :label="$t('counting.additionalOptions')"
          header-class="text-primary"
        >
          <div class="options-content">
            <q-input
              v-model="notes"
              type="textarea"
              :label="$t('common.notes')"
              outlined
              rows="2"
              class="notes-input"
            />

            <q-input
              v-model="batchNumber"
              :label="$t('counting.batchNumber')"
              outlined
              class="batch-input"
            />

            <q-input
              v-model="expiryDate"
              type="date"
              :label="$t('counting.expiryDate')"
              outlined
              class="expiry-input"
            />

            <q-select
              v-model="confidenceLevel"
              :options="confidenceLevelOptions"
              :label="$t('counting.confidenceLevel')"
              outlined
              map-options
              emit-value
            />
          </div>
        </q-expansion-item>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <q-btn
          :label="$t('counting.skipProduct')"
          outline
          color="grey-7"
          size="lg"
          @click="skipProduct"
          class="action-btn skip-btn"
        />

        <q-btn
          :label="$t('counting.confirmCount')"
          color="primary"
          size="lg"
          @click="confirmCount"
          :loading="submitting"
          :disable="!isValidCount"
          class="action-btn confirm-btn"
        />
      </div>
    </div>

    <!-- No More Products -->
    <div v-else-if="!loading" class="no-products">
      <q-icon name="check_circle" color="positive" size="80px" />
      <h3>{{ $t('counting.allProductsCounted') }}</h3>
      <p>{{ $t('counting.readyToComplete') }}</p>

      <q-btn
        :label="$t('counting.completeSession')"
        color="positive"
        size="lg"
        @click="completeSession"
        class="complete-btn"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <q-spinner size="40px" color="primary" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Floating Action Buttons -->
    <div class="floating-actions">
      <q-btn
        fab
        color="accent"
        icon="qr_code_scanner"
        @click="openBarcodeScanner"
        class="fab-btn scanner-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useCountingStore } from 'src/stores/counting';
  import type { CountingProduct } from 'src/types/inventory';

  // Props
  interface Props {
    productId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    productId: undefined,
  });

  // Composables
  const { t } = useI18n();
  const countingStore = useCountingStore();

  // State
  const countedQuantity = ref(0);
  const notes = ref('');
  const batchNumber = ref('');
  const expiryDate = ref('');
  const confidenceLevel = ref<'high' | 'medium' | 'low'>('high');
  const submitting = ref(false);
  const sessionStartTime = ref<Date>(new Date());

  // Computed
  const currentProduct = computed((): CountingProduct | null => {
    if (props.productId) {
      return (
        countingStore.availableProducts.find(p => p.id === props.productId) ||
        null
      );
    }
    return countingStore.nextProductToCount;
  });

  const countingStats = computed(() => countingStore.countingStats);
  const loading = computed(() => countingStore.loading);

  const quickQuantities = computed(() => {
    const systemQty = currentProduct.value?.current_system_quantity || 0;
    const baseQuantities = [0, 1, 5, 10, 25, 50];

    // Add system quantity if it's not already in the list
    if (systemQty > 0 && !baseQuantities.includes(systemQty)) {
      baseQuantities.push(systemQty);
    }

    return baseQuantities.sort((a, b) => a - b).slice(0, 6);
  });

  const showVariance = computed(() => {
    return (
      currentProduct.value &&
      countedQuantity.value !== currentProduct.value.current_system_quantity
    );
  });

  const variance = computed(() => {
    if (!currentProduct.value) return 0;
    return countedQuantity.value - currentProduct.value.current_system_quantity;
  });

  const varianceClass = computed(() => {
    const v = variance.value;
    if (v > 0) return 'variance-positive';
    if (v < 0) return 'variance-negative';
    return 'variance-neutral';
  });

  const varianceIcon = computed(() => {
    const v = variance.value;
    if (v > 0) return 'trending_up';
    if (v < 0) return 'trending_down';
    return 'check';
  });

  const varianceText = computed(() => {
    const v = variance.value;
    const absV = Math.abs(v);
    if (v > 0) {
      return t('counting.variancePositive', { amount: absV });
    } else if (v < 0) {
      return t('counting.varianceNegative', { amount: absV });
    }
    return t('counting.varianceMatch');
  });

  const isValidCount = computed(() => {
    return countedQuantity.value >= 0 && currentProduct.value;
  });

  const formatSessionTime = computed(() => {
    const elapsed = Date.now() - sessionStartTime.value.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  const confidenceLevelOptions = computed(() => [
    { label: t('counting.confidence.high'), value: 'high' },
    { label: t('counting.confidence.medium'), value: 'medium' },
    { label: t('counting.confidence.low'), value: 'low' },
  ]);

  // Methods
  const incrementQuantity = () => {
    countedQuantity.value += 1;
  };

  const decrementQuantity = () => {
    if (countedQuantity.value > 0) {
      countedQuantity.value -= 1;
    }
  };

  const setQuantity = (qty: number) => {
    countedQuantity.value = qty;
  };

  const onQuantityFocus = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.select();
  };

  const confirmCount = async () => {
    if (!currentProduct.value || !isValidCount.value) return;

    try {
      submitting.value = true;

      await countingStore.countProduct(
        currentProduct.value.id,
        currentProduct.value.location_id,
        countedQuantity.value,
        {
          countMethod: 'manual',
          confidenceLevel: confidenceLevel.value,
          batchNumber: batchNumber.value || undefined,
          expiryDate: expiryDate.value || undefined,
          notes: notes.value || undefined,
        }
      );

      // Reset form for next product
      resetForm();
    } catch (error) {
      console.error('Error confirming count:', error);
      // Handle error (show notification, etc.)
    } finally {
      submitting.value = false;
    }
  };

  const skipProduct = () => {
    resetForm();
    // Could implement skip logic here
  };

  const resetForm = () => {
    countedQuantity.value = 0;
    notes.value = '';
    batchNumber.value = '';
    expiryDate.value = '';
    confidenceLevel.value = 'high';
  };

  const completeSession = async () => {
    try {
      await countingStore.completeCountingSession();
      // Navigate away or show completion message
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const openBarcodeScanner = () => {
    // Implement barcode scanning functionality
    // Opening barcode scanner
  };

  // Initialize
  watch(
    currentProduct,
    newProduct => {
      if (newProduct) {
        // Set initial quantity to system quantity for easier counting
        countedQuantity.value = newProduct.current_system_quantity;
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    sessionStartTime.value = new Date();
  });
</script>

<style lang="scss" scoped>
  .mobile-counting-interface {
    min-height: 100vh;
    background: var(--q-color-grey-1);
    padding: var(--space-4);
    padding-bottom: 100px; // Space for floating actions
  }

  .counting-header {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    box-shadow: var(--shadow-sm);

    .progress-bar {
      margin-bottom: var(--space-2);
    }

    .progress-text {
      font-size: 0.9rem;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: var(--space-3);
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      gap: var(--space-3);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }

  .product-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    box-shadow: var(--shadow-sm);

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);

      .product-info {
        flex: 1;

        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 var(--space-1) 0;
          color: var(--text-primary);
        }

        .product-sku {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0 0 var(--space-1) 0;
        }

        .product-category {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
      }

      .product-image {
        width: 80px;
        height: 80px;

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: var(--q-color-grey-3);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .system-quantity {
      font-size: 1rem;
      color: var(--text-secondary);
    }
  }

  .counting-input-section {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    box-shadow: var(--shadow-sm);

    .input-label {
      display: block;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--text-primary);
    }

    .quantity-input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);

      .quantity-btn {
        flex-shrink: 0;
      }

      .quantity-input {
        flex: 1;

        :deep(.q-field__control) {
          min-height: 60px;
        }
      }
    }

    .quick-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
      margin-bottom: var(--space-4);

      .quick-btn {
        min-height: 44px;

        &.system-qty-btn {
          grid-column: span 3;
        }
      }
    }
  }

  .variance-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    font-weight: 500;

    &.variance-positive {
      background: var(--q-color-positive-1);
      color: var(--q-color-positive-8);
    }

    &.variance-negative {
      background: var(--q-color-negative-1);
      color: var(--q-color-negative-8);
    }

    &.variance-neutral {
      background: var(--q-color-positive-1);
      color: var(--q-color-positive-8);
    }
  }

  .additional-options {
    margin-bottom: var(--space-4);

    .options-content {
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-3);

    .action-btn {
      min-height: 50px;
      font-weight: 600;
    }
  }

  .no-products {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    text-align: center;
    box-shadow: var(--shadow-sm);

    h3 {
      margin: var(--space-4) 0 var(--space-2) 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-muted);
      margin-bottom: var(--space-4);
    }

    .complete-btn {
      min-height: 50px;
      min-width: 200px;
    }
  }

  .loading-state {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    text-align: center;
    box-shadow: var(--shadow-sm);

    p {
      margin-top: var(--space-3);
      color: var(--text-muted);
    }
  }

  .floating-actions {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: 1000;

    .fab-btn {
      box-shadow: var(--shadow-lg);
    }
  }

  // Dark mode
  body.body--dark {
    .mobile-counting-interface {
      background: var(--q-color-dark-page);
    }

    .counting-header,
    .product-card,
    .counting-input-section,
    .no-products,
    .loading-state {
      background: var(--q-color-dark-card);
    }
  }

  // Mobile optimizations
  @media (max-width: 768px) {
    .mobile-counting-interface {
      padding: var(--space-3);
    }

    .quantity-input-wrapper {
      gap: var(--space-2);

      .quantity-btn {
        min-width: 50px;
        min-height: 50px;
      }
    }

    .quick-buttons {
      grid-template-columns: repeat(2, 1fr);

      .system-qty-btn {
        grid-column: span 2;
      }
    }

    .action-buttons {
      grid-template-columns: 1fr;

      .skip-btn {
        order: 2;
      }

      .confirm-btn {
        order: 1;
      }
    }
  }
</style>
