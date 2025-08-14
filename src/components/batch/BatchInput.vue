<template>
  <div class="batch-input-container">
    <div class="batch-input-wrapper">
      <!-- Product Selection -->
      <BaseSelect
        v-model="selectedProduct"
        :options="productOptions"
        option-value="id"
        option-label="display_name"
        :label="$t('product.product')"
        :placeholder="$t('product.selectProduct')"
        filterable
        clearable
        required
        @update:model-value="onProductChange"
        :loading="productsLoading"
      >
        <template #option="{ option, selected, focused }">
          <q-item v-bind="{ selected, focused }" clickable>
            <q-item-section>
              <q-item-label>{{ option.name }}</q-item-label>
              <q-item-label caption
                >{{ option.sku }} • {{ option.category }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </template>
      </BaseSelect>

      <!-- Batch Number Input -->
      <q-input
        v-model="batchNumber"
        :label="$t('batch.batchNumber')"
        :placeholder="$t('batch.enterBatchNumber')"
        outlined
        dense
        :rules="[validateRequired]"
        @blur="onBatchNumberChange"
      >
        <template #append>
          <q-btn
            flat
            round
            dense
            icon="qr_code_scanner"
            @click="openBarcodeScanner"
            :title="$t('batch.scanBatch')"
          />
        </template>
      </q-input>

      <!-- Expiry Date -->
      <q-input
        v-model="expiryDate"
        :label="$t('batch.expiryDate')"
        type="date"
        outlined
        dense
        :rules="[validateRequired, validateExpiryDate]"
      />

      <!-- Quantity Input -->
      <q-input
        v-model.number="quantity"
        :label="$t('product.quantity')"
        type="number"
        min="0"
        step="1"
        outlined
        dense
        :rules="[validateRequired, validateQuantity]"
      >
        <template #append>
          <span class="text-caption">{{ selectedProduct?.unit || '' }}</span>
        </template>
      </q-input>

      <!-- Existing Batch Selection (if found) -->
      <div v-if="existingBatches.length > 0" class="existing-batches">
        <div class="text-subtitle2 q-mb-md">
          {{ $t('batch.existingBatches') }}
        </div>
        <q-card
          v-for="batch in existingBatches"
          :key="batch.id"
          flat
          bordered
          class="batch-card"
        >
          <q-card-section class="q-pa-sm">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-weight-medium">{{ batch.batch_number }}</div>
                <div class="text-caption text-grey-6">
                  {{ $t('batch.expires') }}:
                  {{ formatDate(batch.expiry_date) }} •
                  {{ $t('product.quantity') }}: {{ batch.current_quantity }}
                </div>
              </div>
              <q-btn
                flat
                dense
                color="primary"
                :label="$t('batch.useBatch')"
                @click="selectExistingBatch(batch)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- View Mode -->
      <div v-if="viewMode === 'lite'" class="batch-summary">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('batch.batchSummary') }}
            </div>
            <div class="summary-row">
              <span>{{ $t('product.product') }}:</span>
              <span>{{ selectedProduct?.name || '-' }}</span>
            </div>
            <div class="summary-row">
              <span>{{ $t('batch.batchNumber') }}:</span>
              <span>{{ batchNumber || '-' }}</span>
            </div>
            <div class="summary-row">
              <span>{{ $t('batch.expiryDate') }}:</span>
              <span>{{ expiryDate ? formatDate(expiryDate) : '-' }}</span>
            </div>
            <div class="summary-row">
              <span>{{ $t('product.quantity') }}:</span>
              <span>{{ quantity || 0 }} {{ selectedProduct?.unit || '' }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Barcode Scanner Dialog -->
    <q-dialog v-model="showScanner" max-width="500px">
      <BarcodeScanner v-model="showScanner" @scan="onBarcodeScanned" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useBatchStore } from 'src/stores/batch';
  import { useProductStore } from 'src/stores/product';
  import { useAuthStore } from 'src/stores/auth';
  import BaseSelect from 'src/components/base/BaseSelect.vue';
  import type { Product, ProductBatchWithDetails } from 'src/types/inventory';
  import { useFormatting } from 'src/composables/useFormatting';

  // Lazy load barcode scanner
  const BarcodeScanner = defineAsyncComponent(
    () => import('src/components/BarcodeScanner.vue')
  );

  interface Props {
    modelValue?: {
      productId?: string;
      batchNumber?: string;
      expiryDate?: string;
      quantity?: number;
      batchId?: string;
    };
    viewMode?: 'lite' | 'full';
    required?: boolean;
    locationId?: string;
  }

  interface Emits {
    (
      e: 'update:modelValue',
      value: {
        productId?: string;
        batchNumber?: string;
        expiryDate?: string;
        quantity?: number;
        batchId?: string;
        isExistingBatch?: boolean;
      }
    ): void;
    (e: 'batch-selected', batch: ProductBatchWithDetails): void;
    (e: 'validation-changed', isValid: boolean): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    viewMode: 'full',
    required: true,
  });

  const emit = defineEmits<Emits>();

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();
  const productStore = useProductStore();
  const authStore = useAuthStore();
  const { formatDate } = useFormatting();

  // Reactive state
  const selectedProduct = ref<Product | null>(null);
  const batchNumber = ref('');
  const expiryDate = ref('');
  const quantity = ref<number | null>(null);
  const existingBatches = ref<ProductBatchWithDetails[]>([]);
  const showScanner = ref(false);
  const productsLoading = ref(false);

  // Computed
  const productOptions = computed(() => {
    return productStore.activeProducts.map(product => ({
      ...product,
      display_name: `${product.name} (${product.sku})`,
    }));
  });

  const isValid = computed(() => {
    if (!props.required) {
      return true;
    }
    return !!(
      selectedProduct.value &&
      batchNumber.value &&
      expiryDate.value &&
      quantity.value
    );
  });

  // Validation rules
  const validateRequired = (val: string | number) =>
    (!!val && val !== '') || t('validation.required');

  const validateExpiryDate = (val: string) => {
    if (!val) {
      return props.required ? t('validation.required') : true;
    }
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today || t('batch.expiryDatePastError');
  };

  const validateQuantity = (val: number) => {
    if (!val && props.required) {
      return t('validation.required');
    }
    return val > 0 || t('validation.positiveNumber');
  };

  // Methods
  const onProductChange = async (product: Product | null) => {
    selectedProduct.value = product;
    existingBatches.value = [];

    if (product && batchNumber.value) {
      await searchExistingBatches();
    }

    emitValue();
  };

  const onBatchNumberChange = async () => {
    if (selectedProduct.value && batchNumber.value) {
      await searchExistingBatches();
    }
    emitValue();
  };

  const searchExistingBatches = async () => {
    if (!selectedProduct.value || !batchNumber.value) {
      return;
    }

    try {
      const practiceId = authStore.clinicId;
      if (!practiceId) {
        return;
      }

      // Search for existing batches with the same product and batch number
      const batches = batchStore
        .batchesByProduct(selectedProduct.value.id)
        .filter(batch =>
          batch.batch_number
            .toLowerCase()
            .includes(batchNumber.value.toLowerCase())
        );

      existingBatches.value = batches;
    } catch (error) {
      console.error('Error searching existing batches:', error);
    }
  };

  const selectExistingBatch = (batch: ProductBatchWithDetails) => {
    batchNumber.value = batch.batch_number;
    expiryDate.value = batch.expiry_date;
    quantity.value = batch.current_quantity;

    const value = {
      productId: selectedProduct.value?.id,
      batchNumber: batch.batch_number,
      expiryDate: batch.expiry_date,
      quantity: quantity.value,
      batchId: batch.id,
      isExistingBatch: true,
    };

    emit('update:modelValue', value);
    emit('batch-selected', batch);
  };

  const openBarcodeScanner = () => {
    showScanner.value = true;
  };

  const onBarcodeScanned = async (scannedCode: string) => {
    showScanner.value = false;
    batchNumber.value = scannedCode;

    // Try to find existing batch
    if (selectedProduct.value) {
      await searchExistingBatches();

      // If exact match found, auto-select it
      const exactMatch = existingBatches.value.find(
        batch => batch.batch_number === scannedCode
      );

      if (exactMatch) {
        selectExistingBatch(exactMatch);
      }
    }

    emitValue();
  };

  const emitValue = () => {
    const value = {
      productId: selectedProduct.value?.id,
      batchNumber: batchNumber.value,
      expiryDate: expiryDate.value,
      quantity: quantity.value || undefined,
      batchId: undefined,
      isExistingBatch: false,
    };

    emit('update:modelValue', value);
  };

  // Watch for validation changes
  watch(isValid, valid => {
    emit('validation-changed', valid);
  });

  // Watch for prop changes
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        if (newValue.productId) {
          const product = productStore.activeProducts.find(
            p => p.id === newValue.productId
          );
          selectedProduct.value = product || null;
        }
        batchNumber.value = newValue.batchNumber || '';
        expiryDate.value = newValue.expiryDate || '';
        quantity.value = newValue.quantity || null;
      }
    },
    { immediate: true }
  );

  // Load products on mount
  const loadProducts = async () => {
    try {
      productsLoading.value = true;
      const practiceId = authStore.clinicId;
      if (practiceId) {
        await productStore.fetchProducts({ practiceId });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      productsLoading.value = false;
    }
  };

  // Initialize
  loadProducts();
</script>

<style scoped>
  .batch-input-container {
    width: 100%;
  }

  .batch-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .existing-batches {
    margin-top: 16px;
  }

  .batch-card {
    margin-bottom: 8px;
  }

  .batch-summary {
    margin-top: 16px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .summary-row:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    .batch-input-wrapper {
      gap: 12px;
    }
  }
</style>
