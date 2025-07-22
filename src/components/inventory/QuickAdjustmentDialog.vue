<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized-on-mobile
  >
    <q-card style="min-width: 600px; max-width: 800px;" class="modern-dialog">
      <!-- Modern Header -->
      <q-card-section class="dialog-header bg-primary text-white q-pa-lg">
        <div class="row items-center">
          <q-icon name="tune" size="28px" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-bold">{{ $t('inventory.quickAdjustment') }}</div>
            <div class="text-subtitle2 opacity-80">{{ $t('inventory.adjustStockLevels') }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round size="md" v-close-popup />
        </div>
      </q-card-section>

      <!-- Product Selection Step -->
      <q-card-section v-if="!selectedProduct" class="q-pa-lg">
        <div class="step-container">
          <div class="step-header">
            <q-icon name="search" size="20px" color="primary" />
            <span class="text-h6 q-ml-sm">{{ $t('inventory.selectProduct') }}</span>
          </div>
          
          <div class="row q-gutter-md q-mt-md">
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
                class="modern-select"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" />
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
                 :size="$q.screen.xs ? 'md' : 'lg'"
                 :label="$q.screen.xs ? '' : $t('inventory.scanBarcode')"
                 @click="showBarcodeScanner = true"
                 class="scan-button"
                 :title="$t('inventory.scanBarcode')"
               />
            </div>
          </div>
        </div>
      </q-card-section>

             <!-- Product Info Card -->
       <q-card-section v-if="selectedProduct" class="q-pa-lg">
         <q-card flat bordered class="product-card bg-grey-1">
           <q-card-section class="q-pa-md">
             <div class="row items-center q-gutter-md">
               <q-avatar size="56px" class="bg-primary text-white">
                 <q-icon name="inventory_2" size="28px" />
               </q-avatar>
               <div class="col">
                 <div class="text-h6 text-weight-bold text-grey-8">
                   {{ selectedProduct.product_name || selectedProduct.name }}
                 </div>
                 <div class="text-subtitle2 text-grey-6 q-mt-xs">
                   SKU: {{ selectedProduct.sku || selectedProduct.product_sku }}
                 </div>
                 <div class="row items-center q-gutter-md q-mt-sm">
                   <q-chip 
                     :color="getStockStatusColor(selectedProduct)" 
                     text-color="white" 
                     size="sm"
                     :icon="getStockStatusIcon(selectedProduct)"
                   >
                     {{ getCurrentStock() }} {{ selectedProduct.unit }}
                   </q-chip>
                   <div class="text-caption text-grey-6" v-if="selectedLocation">
                     📍 {{ selectedLocation.name }}
                   </div>
                   <q-chip v-else color="orange" text-color="white" size="sm" icon="warning">
                     {{ $t('inventory.noLocationSelected') }}
                   </q-chip>
                 </div>
               </div>
               <q-btn 
                 flat 
                 round 
                 icon="edit" 
                 @click="internalSelectedProduct = null; emit('update:modelValue', true)"
                 class="text-grey-6"
                 :title="$t('inventory.changeProduct')"
               />
             </div>
           </q-card-section>
         </q-card>
       </q-card-section>

       <!-- Location Selection (if no location provided) -->
       <q-card-section v-if="selectedProduct && !selectedLocation" class="q-pa-lg">
         <div class="step-container">
           <div class="step-header">
             <q-icon name="place" size="20px" color="orange" />
             <span class="text-h6 q-ml-sm">{{ $t('inventory.selectLocation') }}</span>
             <q-chip size="sm" color="orange" text-color="white" class="q-ml-sm">{{ $t('common.required') }}</q-chip>
           </div>
           
           <q-select
             v-model="internalSelectedLocation"
             :options="availableLocations"
             option-label="name"
             option-value="id"
             :label="$t('inventory.selectLocation')"
             outlined
             class="modern-select q-mt-md"
           >
             <template v-slot:prepend>
               <q-icon name="place" />
             </template>
           </q-select>
         </div>
       </q-card-section>

      <!-- Modern Adjustment Form -->
      <q-card-section v-if="selectedProduct" class="q-pa-lg adjustment-section">
        <div class="adjustment-container">
          
          <!-- Step 1: Adjustment Type -->
          <div class="adjustment-step">
            <div class="step-header">
              <q-icon name="tune" size="20px" color="primary" />
              <span class="text-h6 q-ml-sm">{{ $t('inventory.adjustmentType') }}</span>
            </div>
            <q-btn-toggle
              v-model="adjustmentType"
              toggle-color="primary"
              :options="adjustmentTypeOptions"
              class="modern-toggle q-mt-md"
              :size="$q.screen.xs ? 'md' : 'lg'"
              spread
            />
          </div>

          <!-- Step 2: Quantity Input -->
          <div class="adjustment-step">
            <div class="step-header">
              <q-icon name="pin" size="20px" color="primary" />
              <span class="text-h6 q-ml-sm">{{ getQuantityLabel() }}</span>
            </div>
            
            <div class="quantity-section q-mt-md">
              <div class="row q-gutter-md items-end">
                <div class="col">
                  <q-input
                    v-model.number="quantityInput"
                    type="number"
                    :label="getQuantityLabel()"
                    outlined
                    min="0"
                    class="quantity-input"
                    :error="quantityError"
                    :error-message="quantityErrorMessage"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="getQuantityIcon()" />
                    </template>
                    <template v-slot:append>
                      <span class="text-caption text-grey-6">{{ selectedProduct.unit }}</span>
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Quick Amount Buttons -->
              <div class="quick-amounts q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">{{ $t('inventory.quickAmounts') }}</div>
                <div class="row q-gutter-xs">
                                     <q-btn
                     v-for="amount in quickAmounts"
                     :key="amount"
                     :label="amount.toString()"
                     :size="$q.screen.xs ? 'xs' : 'sm'"
                     outline
                     color="primary"
                     @click="setQuickAmount(amount)"
                     class="quick-amount-btn"
                   />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Reason Selection -->
          <div class="adjustment-step">
            <div class="step-header">
              <q-icon name="psychology" size="20px" color="primary" />
              <span class="text-h6 q-ml-sm">{{ $t('inventory.reason') }}</span>
              <q-chip size="sm" color="orange" text-color="white" class="q-ml-sm">{{ $t('common.required') }}</q-chip>
            </div>
            <q-select
              v-model="selectedReason"
              :options="reasonOptions"
              :label="$t('inventory.selectReason')"
              outlined
              emit-value
              map-options
              class="modern-select q-mt-md"
              :error="reasonError"
              :error-message="reasonErrorMessage"
            >
              <template v-slot:prepend>
                <q-icon name="assignment" />
              </template>
            </q-select>
          </div>

          <!-- Step 4: Notes (Optional) -->
          <div class="adjustment-step">
            <div class="step-header">
              <q-icon name="note_add" size="20px" color="grey-6" />
              <span class="text-h6 q-ml-sm text-grey-7">{{ $t('inventory.notes') }}</span>
              <q-chip size="sm" color="grey-5" text-color="white" class="q-ml-sm">{{ $t('common.optional') }}</q-chip>
            </div>
            <q-input
              v-model="notes"
              :label="$t('inventory.notes')"
              type="textarea"
              rows="2"
              outlined
              :placeholder="$t('inventory.notesPlaceholder')"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="edit_note" />
              </template>
            </q-input>
          </div>

          <!-- Preview Card -->
          <q-card v-if="preview && isFormValid" flat bordered class="preview-card bg-blue-1 q-mt-lg">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="preview" size="24px" color="blue-7" />
                <span class="text-h6 q-ml-sm text-blue-8">{{ $t('inventory.preview') }}</span>
              </div>
              <div class="preview-content q-mt-md">
                <div class="row q-gutter-lg">
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ $t('inventory.current') }}</div>
                    <div class="text-h6 text-weight-bold">{{ preview.current }} {{ selectedProduct.unit }}</div>
                  </div>
                  <div class="col-auto flex items-center">
                    <q-icon 
                      :name="preview.change >= 0 ? 'arrow_forward' : 'arrow_back'" 
                      size="20px" 
                      :color="preview.change >= 0 ? 'positive' : 'negative'"
                    />
                    <span class="q-mx-sm text-subtitle1" :class="preview.change >= 0 ? 'text-positive' : 'text-negative'">
                      {{ preview.change >= 0 ? '+' : '' }}{{ preview.change }}
                    </span>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ $t('inventory.newQuantity') }}</div>
                    <div class="text-h6 text-weight-bold" :class="getStatusTextClass(preview.newStatus)">
                      {{ preview.newQuantity }} {{ selectedProduct.unit }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

        </div>
      </q-card-section>

      <!-- Modern Actions -->
      <q-card-actions class="modern-actions q-pa-lg bg-grey-1">
        <q-btn 
          :label="$q.screen.xs ? $t('common.cancel') : $t('common.cancel')" 
          flat 
          :size="$q.screen.xs ? 'md' : 'lg'"
          class="q-mr-md"
          @click="$emit('update:modelValue', false)"
        />
        <q-space />
        <q-btn
          :label="$q.screen.xs ? $t('inventory.adjust') : $t('inventory.adjustStock')"
          color="primary"
          :size="$q.screen.xs ? 'md' : 'lg'"
          unelevated
          :loading="saving"
          :disable="!isFormValid"
          @click="performAdjustment"
          class="save-button"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            {{ $q.screen.xs ? $t('inventory.adjusting') : $t('inventory.adjusting') }}
          </template>
        </q-btn>
      </q-card-actions>

             <!-- Validation Summary -->
       <q-banner v-if="!isFormValid && (quantityInput !== null || selectedReason)" 
                 rounded 
                 class="validation-banner q-ma-md"
                 :class="getValidationBannerClass()">
         <template v-slot:avatar>
           <q-icon name="info" />
         </template>
         <div class="text-subtitle2">{{ $t('inventory.completeRequiredFields') }}</div>
         <ul class="q-mt-sm">
           <li v-if="quantityError">{{ quantityErrorMessage }}</li>
           <li v-if="reasonError">{{ reasonErrorMessage }}</li>
           <li v-if="!selectedProduct">{{ $t('inventory.selectProductFirst') }}</li>
           <li v-if="!selectedLocation">{{ $t('inventory.selectLocationFirst') }}</li>
         </ul>
         <!-- Debug Info -->
         <div class="text-caption q-mt-sm" style="opacity: 0.7;">
           Debug: Quantity: {{ quantityInput }}, Reason: {{ selectedReason }}, Product: {{ !!selectedProduct }}, Location: {{ !!selectedLocation }}
         </div>
       </q-banner>
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
  
  // Location selection state
  const internalSelectedLocation = ref<any>(null);
  const availableLocations = ref<any[]>([
    { id: '1', name: 'Hoofdlocatie' },
    { id: '2', name: 'Opslag' },
    { id: '3', name: 'Behandelkamer' }
  ]);

  // Quick amount buttons
  const quickAmounts = [1, 5, 10, 25, 50, 100];

  // Computed
  const adjustmentTypeOptions = computed(() => [
    { 
      label: t('inventory.increase'), 
      value: 'increase', 
      icon: 'add_circle',
      color: 'positive'
    },
    { 
      label: t('inventory.decrease'), 
      value: 'decrease', 
      icon: 'remove_circle',
      color: 'negative'  
    },
    { 
      label: t('inventory.setTo'), 
      value: 'set', 
      icon: 'edit',
      color: 'primary'
    },
  ]);

  const reasonOptions = computed(() => [
    { label: t('inventory.reasons.adjustment'), value: 'adjustment' },
    { label: t('inventory.reasons.damage'), value: 'damage' },
    { label: t('inventory.reasons.expired'), value: 'expired' },
    { label: t('inventory.reasons.lost'), value: 'lost' },
    { label: t('inventory.reasons.found'), value: 'found' },
    { label: t('inventory.reasons.recount'), value: 'recount' },
    { label: t('inventory.reasons.correction'), value: 'correction' },
    { label: t('inventory.reasons.other'), value: 'other' },
  ]);

  const selectedProduct = computed(() => props.selectedProduct || internalSelectedProduct.value);
  const selectedLocation = computed(() => props.selectedLocation || internalSelectedLocation.value);

  const getCurrentStock = () => {
    return selectedProduct.value?.current_quantity || selectedProduct.value?.total_stock || 0;
  };

  const preview = computed(() => {
    if (!selectedProduct.value || quantityInput.value === null || quantityInput.value === undefined) {
      return null;
    }

    const current = getCurrentStock();
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

  // Validation
  const quantityError = computed(() => {
    return quantityInput.value !== null && (
      quantityInput.value === undefined ||
      isNaN(quantityInput.value) ||
      quantityInput.value < 0
    );
  });

  const quantityErrorMessage = computed(() => {
    if (quantityError.value) {
      return t('inventory.quantityMustBePositive');
    }
    return '';
  });

  const reasonError = computed(() => {
    return !selectedReason.value && quantityInput.value !== null;
  });

  const reasonErrorMessage = computed(() => {
    if (reasonError.value) {
      return t('inventory.reasonRequired');
    }
    return '';
  });

  const isFormValid = computed(() => {
    return (
      quantityInput.value !== null &&
      quantityInput.value !== undefined &&
      !isNaN(quantityInput.value) &&
      quantityInput.value > 0 &&
      selectedReason.value !== null &&
      selectedReason.value !== undefined &&
      selectedProduct.value &&
      selectedLocation.value
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

  const getQuantityIcon = () => {
    switch (adjustmentType.value) {
      case 'increase':
        return 'add_circle';
      case 'decrease':
        return 'remove_circle';
      case 'set':
        return 'edit';
      default:
        return 'pin';
    }
  };

  const setQuickAmount = (amount: number) => {
    quantityInput.value = amount;
  };

  const determineStockStatus = (quantity: number): string => {
    const minStock = selectedProduct.value?.minimum_quantity || 10;
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= minStock) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusColor = (product: any) => {
    const status = determineStockStatus(getCurrentStock());
    switch (status) {
      case 'out_of_stock': return 'negative';
      case 'low_stock': return 'warning';
      default: return 'positive';
    }
  };

  const getStockStatusIcon = (product: any) => {
    const status = determineStockStatus(getCurrentStock());
    switch (status) {
      case 'out_of_stock': return 'error';
      case 'low_stock': return 'warning';
      default: return 'check_circle';
    }
  };

  const getStatusTextClass = (status: string): string => {
    switch (status) {
      case 'out_of_stock': return 'text-negative';
      case 'low_stock': return 'text-warning';
      default: return 'text-positive';
    }
  };

  const getValidationBannerClass = () => {
    return 'bg-orange-1 text-orange-8';
  };

  const filterProducts = (val: string, update: any) => {
    // Mock product filtering for demo
    const mockProducts = [
      { id: '1', name: 'BD Discardit II Spuit 10ml', sku: 'BD-10ML', unit: 'stuks' },
      { id: '2', name: 'BD Microlance Naald 23G', sku: 'BD-23G', unit: 'stuks' },
      { id: '3', name: 'Ansell TouchNTuff Handschoenen', sku: 'ANS-L', unit: 'paar' },
    ];

    update(() => {
      if (val === '') {
        availableProducts.value = mockProducts;
      } else {
        const needle = val.toLowerCase();
        availableProducts.value = mockProducts.filter(
          product => product.name.toLowerCase().includes(needle)
        );
      }
    });
  };

  const onProductSelected = (product: any) => {
    if (product) {
      emit('product-selected', product);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    // Handle barcode scan logic
    $q.notify({
      type: 'info',
      message: t('inventory.barcodeScanned', { barcode }),
    });
  };

  const performAdjustment = async () => {
    if (!isFormValid.value || !preview.value) return;

    // 🚀 IMPROVED UX: Close dialog immediately for better user experience
    emit('update:modelValue', false);
    
    // Show optimistic loading notification
    const notif = $q.notify({
      type: 'ongoing',
      message: t('inventory.savingChanges'),
      icon: 'hourglass_empty',
      timeout: 0,
    });

    try {
      const movementType: MovementType = 'adjustment';
      
      const reasonCode = selectedReason.value;
      if (!reasonCode) {
        throw new Error('No reason selected');
      }

      const request: StockUpdateRequest = {
        practice_id: authStore.userProfile?.clinic_id || '',
        location_id: selectedLocation.value?.id || '',
        product_id: selectedProduct.value.id || selectedProduct.value.product_id,
        quantity_change: preview.value.change,
        movement_type: movementType,
        reason_code: reasonCode as ReasonCode,
        notes: notes.value || null,
      };

      await inventoryStore.updateStockLevel(request);

      // Update loading notification to success
      notif({
        type: 'positive',
        message: t('inventory.stockUpdated'),
        icon: 'check_circle',
        timeout: 3000,
      });

      emit('stock-updated', selectedProduct.value);

      // Reset form for next use
      quantityInput.value = null;
      selectedReason.value = null;
      notes.value = '';
      adjustmentType.value = 'increase';

    } catch (error) {
      console.error('Error updating stock:', error);
      
      // Update loading notification to error
      notif({
        type: 'negative',
        message: t('inventory.errorUpdatingStock'),
        icon: 'error',
        timeout: 5000,
      });
      
      // Reopen dialog on error so user can try again
      emit('update:modelValue', true);
    }
  };

  // Watch for product changes
  watch(() => props.selectedProduct, (newProduct) => {
    if (newProduct) {
      internalSelectedProduct.value = newProduct;
    }
  }, { immediate: true });
</script>

<style lang="scss" scoped>
.modern-dialog {
  .dialog-header {
    border-radius: 8px 8px 0 0;
  }

  .step-container, .adjustment-container {
    max-width: 100%;
  }

  .step-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--q-grey-4);
  }

  .adjustment-step {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .product-card {
    border: 2px solid var(--q-grey-4);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--q-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .modern-toggle {
    .q-btn {
      border-radius: 8px;
      min-height: 48px;
      
      @media (max-width: 600px) {
        min-height: 40px;
        font-size: 0.8rem;
        padding: 8px 12px;
      }
    }
  }

  .modern-select, .quantity-input {
    .q-field__control {
      border-radius: 8px;
    }
  }

     .quick-amounts {
     .quick-amount-btn {
       min-width: 48px;
       border-radius: 6px;
       
       @media (max-width: 600px) {
         min-width: 36px;
         font-size: 0.75rem;
         padding: 4px 8px;
       }
     }
   }

  .preview-card {
    border: 2px solid var(--q-blue-4);
    border-radius: 12px;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  }

  .preview-content {
    font-family: 'Roboto Mono', monospace;
  }

  .modern-actions {
    border-radius: 0 0 8px 8px;
    border-top: 1px solid var(--q-grey-4);

         .save-button {
       min-width: 140px;
       border-radius: 8px;
       font-weight: 600;
       
       @media (max-width: 600px) {
         min-width: 100px;
         font-size: 0.85rem;
         padding: 8px 16px;
       }
     }
  }

  .validation-banner {
    border-radius: 8px;
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin: 4px 0;
      }
    }
  }

     .scan-button {
     min-height: 56px;
     border-radius: 8px;
     font-weight: 600;
     
     @media (max-width: 600px) {
       min-height: 48px;
       min-width: 48px;
       padding: 8px;
     }
   }
}
</style>
