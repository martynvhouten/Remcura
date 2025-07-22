<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized-on-mobile
  >
    <q-card style="min-width: 500px; max-width: 700px;">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="tune" class="q-mr-sm" />
          {{ $t('inventory.quickAdjustment') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Product Selector (when no product selected) -->
      <q-card-section v-if="!selectedProduct" class="q-pt-none">
        <div class="text-subtitle2 q-mb-md">{{ $t('inventory.selectProduct') }}</div>
        <div class="row q-gutter-md">
          <div class="col">
            <q-select
              v-model="internalSelectedProduct"
              :options="availableProducts"
              option-label="name"
              option-value="id"
              :label="$t('inventory.searchProduct')"
              outlined
              clearable
              use-input
              @filter="filterProducts"
              @update:model-value="onProductSelected"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ $t('inventory.noProductsFound') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-auto">
            <q-btn
              icon="qr_code_scanner"
              color="primary"
              outline
              :label="$t('inventory.scanBarcode')"
              @click="showBarcodeScanner = true"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Product Info -->
      <q-card-section v-if="selectedProduct" class="q-pt-none">
        <div class="product-preview">
          <div class="row items-center q-gutter-md">
            <q-avatar size="48px" class="bg-grey-3">
              <q-icon name="inventory" size="24px" color="grey-7" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle1 text-weight-bold">
                {{ selectedProduct.product_name || selectedProduct.name }}
              </div>
              <div class="text-caption text-grey-7">
                {{ $t('inventory.currentStock') }}: 
                <span class="text-weight-bold" :class="getStockStatusClass(selectedProduct)">
                  {{ selectedProduct.current_quantity || selectedProduct.total_stock || 0 }}
                  {{ selectedProduct.unit }}
                </span>
              </div>
              <div class="text-caption text-grey-7" v-if="selectedLocation">
                {{ $t('inventory.location') }}: {{ selectedLocation.name }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Adjustment Form -->
      <q-card-section>
        <div class="column q-gutter-md">
          <!-- Adjustment Type -->
          <div>
            <div class="text-subtitle2 q-mb-sm">{{ $t('inventory.adjustmentType') }}</div>
            <q-btn-toggle
              v-model="adjustmentType"
              toggle-color="primary"
              :options="adjustmentTypeOptions"
              class="full-width"
            />
          </div>

          <!-- Quantity Input -->
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model.number="quantityInput"
                type="number"
                :label="getQuantityLabel()"
                outlined
                :rules="[val => val !== null && val !== undefined && !isNaN(val) || $t('validation.required')]"
                @update:model-value="calculatePreview"
              >
                <template v-slot:append>
                  <span class="text-grey-7">{{ selectedProduct?.unit || 'st' }}</span>
                </template>
              </q-input>
            </div>
            <div class="col-auto" v-if="adjustmentType !== 'set'">
              <div class="quantity-buttons">
                <q-btn
                  v-for="quickAmount in quickAmounts"
                  :key="quickAmount"
                  :label="`${adjustmentType === 'increase' ? '+' : '-'}${quickAmount}`"
                  size="sm"
                  outline
                  color="primary"
                  @click="setQuickAmount(quickAmount)"
                  class="q-ma-xs"
                />
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="preview" class="preview-section">
            <q-card flat bordered class="bg-blue-1">
              <q-card-section class="q-pa-md">
                <div class="text-subtitle2 text-primary q-mb-sm">
                  <q-icon name="preview" class="q-mr-xs" />
                  {{ $t('inventory.preview') }}
                </div>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-body2">
                      {{ preview.current }} {{ selectedProduct?.unit }} 
                      <q-icon :name="preview.change > 0 ? 'arrow_forward' : 'arrow_forward'" class="q-mx-sm" />
                      <span :class="preview.change > 0 ? 'text-positive' : preview.change < 0 ? 'text-negative' : ''">
                        {{ preview.newQuantity }} {{ selectedProduct?.unit }}
                      </span>
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ $t('inventory.change') }}: 
                      <span :class="preview.change > 0 ? 'text-positive' : preview.change < 0 ? 'text-negative' : ''">
                        {{ preview.change > 0 ? '+' : '' }}{{ preview.change }} {{ selectedProduct?.unit }}
                      </span>
                    </div>
                  </div>
                  <q-chip 
                    :color="getStatusColor(preview.newStatus)" 
                    text-color="white"
                    :label="$t(`inventory.${preview.newStatus}`)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Reason Selection -->
          <div>
            <q-select
              v-model="selectedReason"
              :options="reasonOptions"
              :label="$t('inventory.reason')"
              emit-value
              map-options
              outlined
              :rules="[val => !!val || $t('validation.required')]"
            />
          </div>

          <!-- Notes -->
          <div>
            <q-input
              v-model="notes"
              :label="$t('inventory.notes')"
              type="textarea"
              rows="2"
              outlined
              :placeholder="$t('inventory.notesPlaceholder')"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          :label="$t('common.cancel')" 
          flat 
          @click="$emit('update:modelValue', false)"
        />
        <q-btn
          :label="$t('inventory.adjustStock')"
          color="primary"
          :loading="saving"
          :disable="!isFormValid"
          @click="performAdjustment"
        />
      </q-card-actions>
    </q-card>

    <!-- Barcode Scanner -->
    <BarcodeScanner
      v-model="showBarcodeScanner"
      @scan="handleBarcodeScan"
    />
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useAuthStore } from 'src/stores/auth';
  import BarcodeScanner from 'src/components/BarcodeScanner.vue';
  import type { 
    StockUpdateRequest, 
    MovementType, 
    ReasonCode,
    PracticeLocation 
  } from 'src/types/inventory';

  // Props & Emits
  interface Props {
    modelValue: boolean;
    selectedProduct?: any;
    selectedLocation?: PracticeLocation;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'stock-updated': [product: any];
    'product-selected': [product: any];
  }>();

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const inventoryStore = useInventoryStore();
  const authStore = useAuthStore();

  // State
  const adjustmentType = ref<'increase' | 'decrease' | 'set'>('increase');
  const quantityInput = ref<number | null>(null);
  const selectedReason = ref<ReasonCode | null>(null);
  const notes = ref('');
  const saving = ref(false);
  
  // Product selection state
  const internalSelectedProduct = ref<any>(null);
  const availableProducts = ref<any[]>([]);
  const showBarcodeScanner = ref(false);

  // Quick amount buttons
  const quickAmounts = [1, 5, 10, 25, 50];

  // Computed
  const adjustmentTypeOptions = computed(() => [
    { label: t('inventory.increase'), value: 'increase', icon: 'add' },
    { label: t('inventory.decrease'), value: 'decrease', icon: 'remove' },
    { label: t('inventory.setTo'), value: 'set', icon: 'edit' },
  ]);

  const reasonOptions = computed(() => [
    { label: t('inventory.reasons.adjustment'), value: 'adjustment' },
    { label: t('inventory.reasons.found'), value: 'found' },
    { label: t('inventory.reasons.lost'), value: 'lost' },
    { label: t('inventory.reasons.damaged'), value: 'damaged' },
    { label: t('inventory.reasons.expired'), value: 'expired' },
    { label: t('inventory.reasons.countCorrection'), value: 'count_correction' },
  ]);

  const currentQuantity = computed(() => {
    if (!props.selectedProduct) return 0;
    return props.selectedProduct.current_quantity || props.selectedProduct.total_stock || 0;
  });

  const preview = computed(() => {
    if (!quantityInput.value && quantityInput.value !== 0) return null;
    if (!props.selectedProduct) return null;

    const current = currentQuantity.value;
    let newQuantity: number;
    let change: number;

    switch (adjustmentType.value) {
      case 'increase':
        newQuantity = current + quantityInput.value;
        change = quantityInput.value;
        break;
      case 'decrease':
        newQuantity = Math.max(0, current - quantityInput.value);
        change = -(quantityInput.value);
        break;
      case 'set':
        newQuantity = quantityInput.value;
        change = quantityInput.value - current;
        break;
      default:
        return null;
    }

    const newStatus = determineStockStatus(newQuantity);

    return {
      current,
      newQuantity,
      change,
      newStatus,
    };
  });

  const isFormValid = computed(() => {
    return (
      quantityInput.value !== null &&
      quantityInput.value !== undefined &&
      !isNaN(quantityInput.value) &&
      quantityInput.value >= 0 &&
      selectedReason.value &&
      props.selectedProduct &&
      props.selectedLocation
    );
  });

  // Methods
  const getQuantityLabel = () => {
    switch (adjustmentType.value) {
      case 'increase':
        return t('inventory.quantityToAdd');
      case 'decrease':
        return t('inventory.quantityToRemove');
      case 'set':
        return t('inventory.newQuantity');
      default:
        return t('inventory.quantity');
    }
  };

  const setQuickAmount = (amount: number) => {
    quantityInput.value = amount;
    calculatePreview();
  };

  const calculatePreview = () => {
    // Force reactivity update for preview
  };

  const determineStockStatus = (quantity: number): string => {
    const minStock = props.selectedProduct?.minimum_quantity || 10;
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= minStock) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusClass = (product: any) => {
    const status = determineStockStatus(product.current_quantity || product.total_stock || 0);
    switch (status) {
      case 'out_of_stock': return 'text-negative';
      case 'low_stock': return 'text-warning';
      default: return 'text-positive';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'out_of_stock': return 'negative';
      case 'low_stock': return 'warning';
      default: return 'positive';
    }
  };

  const performAdjustment = async () => {
    if (!isFormValid.value || !preview.value) return;

    saving.value = true;
    try {
      const movementType: MovementType = 'adjustment';
      
      const request: StockUpdateRequest = {
        practice_id: authStore.clinicId || '',
        location_id: props.selectedLocation?.id || '',
        product_id: props.selectedProduct.id || props.selectedProduct.product_id,
        quantity_change: preview.value.change,
        movement_type: movementType,
        reason_code: selectedReason.value!,
        notes: notes.value.trim() || '',
      };

      await inventoryStore.updateStockLevel(request);

      $q.notify({
        type: 'positive',
        message: t('inventory.stockUpdated'),
        caption: `${props.selectedProduct.product_name || props.selectedProduct.name}: ${preview.value.change > 0 ? '+' : ''}${preview.value.change} ${props.selectedProduct.unit}`,
      });

      // Emit success event
      emit('stock-updated', props.selectedProduct);
      
      // Close dialog
      emit('update:modelValue', false);
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error updating stock:', error);
      $q.notify({
        type: 'negative',
        message: t('inventory.errorUpdatingStock'),
        caption: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      saving.value = false;
    }
  };

  const resetForm = () => {
    adjustmentType.value = 'increase';
    quantityInput.value = null;
    selectedReason.value = null;
    notes.value = '';
    internalSelectedProduct.value = null;
  };

  // Product selection functions
  const filterProducts = (val: string, update: Function) => {
    update(() => {
      if (val === '') {
        availableProducts.value = [];
      } else {
        // In a real implementation, this would fetch from inventory store
        // For now, we'll use a simple filter approach
        availableProducts.value = [];
      }
    });
  };

  const onProductSelected = (product: any) => {
    if (product) {
      // Emit to parent that we want to switch products
      emit('product-selected', product);
    }
  };

  // Barcode scanning
  const handleBarcodeScan = async (barcode: string) => {
    try {
      // This would search for products by barcode
      // For now, show notification
      $q.notify({
        type: 'info',
        message: t('inventory.barcodeScanned', { barcode }),
        icon: 'qr_code_scanner'
      });
    } catch (error) {
      console.error('Error processing barcode:', error);
      $q.notify({
        type: 'negative',
        message: t('errors.processingError'),
      });
    }
  };

  // Watch for dialog open/close to reset form
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      resetForm();
    }
  });
</script>

<style lang="scss" scoped>
  .product-preview {
    padding: 16px;
    border-radius: 8px;
    background-color: var(--q-color-grey-1);
    border: 1px solid var(--q-color-grey-4);
  }

  .quantity-buttons {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preview-section {
    margin-top: 8px;
  }

  .body--dark {
    .product-preview {
      background-color: var(--q-color-grey-9);
      border-color: var(--q-color-grey-7);
    }
  }
</style>
