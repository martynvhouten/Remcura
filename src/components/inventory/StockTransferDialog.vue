<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized-on-mobile
  >
    <q-card style="min-width: 600px; max-width: 800px">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="swap_horiz" class="q-mr-sm" />
          {{ $t('inventory.stockTransfer') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Product Selector (when no product selected) -->
      <q-card-section v-if="!selectedProduct" class="q-pt-none">
        <div class="text-subtitle2 q-mb-md">
          {{ $t('inventory.selectProduct') }}
        </div>
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

      <!-- Product Preview (when product selected) -->
      <q-card-section v-if="selectedProduct" class="q-pt-none">
        <div class="product-preview">
          <div class="row items-center q-gutter-md">
            <q-avatar size="48px" color="grey-3">
              <q-img
                v-if="selectedProduct.image_url"
                :src="selectedProduct.image_url"
                :alt="selectedProduct.name"
              />
              <q-icon
                v-else
                name="inventory"
                class="icon-size-lg"
                color="grey-6"
              />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ selectedProduct.name }}
              </div>
              <div class="text-caption text-grey-6">
                {{ selectedProduct.sku }} • {{ selectedProduct.brand }}
              </div>
              <div class="text-caption text-primary">
                <q-btn
                  icon="edit"
                  flat
                  dense
                  size="sm"
                  :label="$t('inventory.changeProduct')"
                  @click="clearSelectedProduct"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Transfer Form -->
      <q-card-section>
        <div class="q-gutter-md">
          <!-- From Location -->
          <div>
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.fromLocation') }}
            </label>
            <q-select
              v-model="fromLocation"
              :options="availableFromLocations"
              option-label="name"
              option-value="id"
              outlined
              dense
              :disable="!selectedProduct"
              @update:model-value="onFromLocationChange"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ $t('inventory.availableStock') }}:
                      {{ getLocationStock(scope.opt.id) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- To Location -->
          <div>
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.toLocation') }}
            </label>
            <q-select
              v-model="toLocation"
              :options="availableToLocations"
              option-label="name"
              option-value="id"
              outlined
              dense
              :disable="!fromLocation"
            />
          </div>

          <!-- Batch Selection (if product requires batch tracking) -->
          <div
            v-if="
              selectedProduct?.requires_batch_tracking &&
              availableBatches.length > 0
            "
          >
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.selectBatch') }}
            </label>
            <q-select
              v-model="selectedBatch"
              :options="availableBatches"
              option-label="batchDisplay"
              option-value="id"
              outlined
              dense
              :disable="!fromLocation"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.batch_number }}</q-item-label>
                    <q-item-label caption>
                      {{ $t('inventory.expiryDate') }}:
                      {{ formatDate(scope.opt.expiry_date) }} •
                      {{ $t('inventory.available') }}:
                      {{ scope.opt.available_quantity }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip
                      :color="getBatchStatusColor(scope.opt)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getBatchStatusText(scope.opt) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Quantity -->
          <div>
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.quantityToTransfer') }}
            </label>
            <div class="row q-gutter-sm">
              <div class="col">
                <q-input
                  v-model.number="transferQuantity"
                  type="number"
                  outlined
                  dense
                  min="1"
                  :max="maxTransferQuantity"
                  :disable="!fromLocation || !toLocation"
                  :suffix="selectedProduct?.unit || ''"
                />
              </div>
              <div class="col-auto">
                <q-btn-group outline>
                  <q-btn
                    v-for="amount in quickAmounts"
                    :key="amount"
                    :label="amount"
                    size="sm"
                    @click="setQuickAmount(amount)"
                    :disable="amount > maxTransferQuantity"
                  />
                  <q-btn
                    :label="$t('common.all')"
                    size="sm"
                    @click="setQuickAmount(maxTransferQuantity)"
                    :disable="maxTransferQuantity <= 0"
                  />
                </q-btn-group>
              </div>
            </div>
            <div
              v-if="maxTransferQuantity > 0"
              class="text-caption text-grey-6 q-mt-xs"
            >
              {{ $t('inventory.maxAvailable') }}: {{ maxTransferQuantity }}
              {{ selectedProduct?.unit }}
            </div>
          </div>

          <!-- Reason -->
          <div>
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.transferReason') }}
            </label>
            <q-select
              v-model="transferReason"
              :options="reasonOptions"
              outlined
              dense
              :disable="!fromLocation || !toLocation"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="text-subtitle2 q-mb-sm block">
              {{ $t('inventory.notes') }} ({{ $t('common.optional') }})
            </label>
            <q-input
              v-model="notes"
              type="textarea"
              outlined
              dense
              rows="2"
              :placeholder="$t('inventory.transferNotesPlaceholder')"
            />
          </div>

          <!-- Transfer Preview -->
          <div v-if="isValidTransfer" class="transfer-preview">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">
              {{ $t('inventory.transferPreview') }}
            </div>
            <div class="preview-card">
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center q-gutter-sm">
                    <div class="col text-center">
                      <div class="text-body2 text-weight-medium">
                        {{ fromLocation?.name }}
                      </div>
                      <div class="text-h6 text-negative">
                        -{{ transferQuantity }}
                      </div>
                      <div class="text-caption">
                        {{ getCurrentStock() - transferQuantity }}
                        {{ $t('inventory.remaining') }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-icon name="arrow_forward" size="md" color="primary" />
                    </div>
                    <div class="col text-center">
                      <div class="text-body2 text-weight-medium">
                        {{ toLocation?.name }}
                      </div>
                      <div class="text-h6 text-positive">
                        +{{ transferQuantity }}
                      </div>
                      <div class="text-caption">
                        {{ getToLocationCurrentStock() + transferQuantity }}
                        {{ $t('inventory.newTotal') }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="$emit('update:modelValue', false)"
        />
        <q-btn
          color="primary"
          :label="$t('inventory.executeTransfer')"
          :loading="transferLoading"
          :disable="!isValidTransfer"
          @click="executeTransfer"
        />
      </q-card-actions>
    </q-card>

    <!-- Barcode Scanner -->
    <BarcodeScanner v-model="showBarcodeScanner" @scan="handleBarcodeScan" />
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useClinicStore } from 'src/stores/clinic';
  import { formatDate } from 'src/utils/date';
  import BarcodeScanner from 'src/components/BarcodeScanner.vue';

  // Props & Emits
  interface Props {
    modelValue: boolean;
    selectedProduct: any;
    currentLocation?: any;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'transfer-completed': [transfer: any];
    'product-selected': [product: any];
  }>();

  // Composition
  const { t } = useI18n();
  const $q = useQuasar();
  const inventoryStore = useInventoryStore();
  const clinicStore = useClinicStore();

  // State
  const fromLocation = ref<any>(null);
  const toLocation = ref<any>(null);
  const selectedBatch = ref<any>(null);
  const transferQuantity = ref<number>(1);
  const transferReason = ref('location_rebalance');
  const notes = ref('');
  const transferLoading = ref(false);

  // Product selection state
  const internalSelectedProduct = ref<any>(null);
  const availableProducts = ref<any[]>([]);
  const showBarcodeScanner = ref(false);

  // Quick amount buttons
  const quickAmounts = [1, 5, 10, 25, 50];

  // Reason options
  const reasonOptions = computed(() => [
    { label: t('inventory.locationRebalance'), value: 'location_rebalance' },
    { label: t('inventory.stockReplenishment'), value: 'stock_replenishment' },
    { label: t('inventory.emergencyTransfer'), value: 'emergency_transfer' },
    { label: t('inventory.expiryManagement'), value: 'expiry_management' },
    {
      label: t('inventory.maintenanceRelocation'),
      value: 'maintenance_relocation',
    },
  ]);

  // Available locations
  const availableFromLocations = computed(() => {
    if (!props.selectedProduct) return [];

    return clinicStore.locations.filter(location => {
      const stock = getLocationStock(location.id);
      return stock > 0;
    });
  });

  const availableToLocations = computed(() => {
    if (!fromLocation.value) return [];

    return clinicStore.locations.filter(
      location => location.id !== fromLocation.value?.id
    );
  });

  // Available batches for the selected product and location
  const availableBatches = computed(() => {
    if (
      !props.selectedProduct?.requires_batch_tracking ||
      !fromLocation.value
    ) {
      return [];
    }

    // Get batches for this product at the from location
    return inventoryStore
      .getProductBatches(props.selectedProduct.id, fromLocation.value.id)
      .filter((batch: any) => batch.available_quantity > 0)
      .map((batch: any) => ({
        ...batch,
        batchDisplay: `${batch.batch_number} (${formatDate(
          batch.expiry_date
        )})`,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
  });

  // Max transfer quantity
  const maxTransferQuantity = computed(() => {
    if (!fromLocation.value || !props.selectedProduct) return 0;

    if (props.selectedProduct.requires_batch_tracking && selectedBatch.value) {
      return selectedBatch.value.available_quantity;
    }

    return getLocationStock(fromLocation.value.id);
  });

  // Validation
  const isValidTransfer = computed(() => {
    return (
      fromLocation.value &&
      toLocation.value &&
      transferQuantity.value > 0 &&
      transferQuantity.value <= maxTransferQuantity.value &&
      transferReason.value &&
      (!props.selectedProduct?.requires_batch_tracking || selectedBatch.value)
    );
  });

  // Methods
  const getLocationStock = (locationId: string): number => {
    if (!props.selectedProduct) return 0;
    return inventoryStore.getProductStockAtLocation(
      props.selectedProduct.id,
      locationId
    );
  };

  const getCurrentStock = (): number => {
    return fromLocation.value ? getLocationStock(fromLocation.value.id) : 0;
  };

  const getToLocationCurrentStock = (): number => {
    return toLocation.value ? getLocationStock(toLocation.value.id) : 0;
  };

  const onFromLocationChange = () => {
    selectedBatch.value = null;
    transferQuantity.value = 1;
  };

  const setQuickAmount = (amount: number) => {
    transferQuantity.value = Math.min(amount, maxTransferQuantity.value);
  };

  const getBatchStatusColor = (batch: any): string => {
    const daysToExpiry = Math.ceil(
      (new Date(batch.expiry_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysToExpiry < 0) return 'negative';
    if (daysToExpiry <= 7) return 'warning';
    if (daysToExpiry <= 30) return 'orange';
    return 'positive';
  };

  const getBatchStatusText = (batch: any): string => {
    const daysToExpiry = Math.ceil(
      (new Date(batch.expiry_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysToExpiry < 0) return t('inventory.expired');
    if (daysToExpiry <= 7) return t('inventory.expiresSoon');
    if (daysToExpiry <= 30) return t('inventory.expiresThisMonth');
    return t('inventory.fresh');
  };

  const executeTransfer = async () => {
    if (!isValidTransfer.value) return;

    transferLoading.value = true;

    try {
      const transferData = {
        product_id: props.selectedProduct.id,
        from_location_id: fromLocation.value.id,
        to_location_id: toLocation.value.id,
        quantity: transferQuantity.value,
        reason: transferReason.value,
        notes: notes.value,
        batch_id: selectedBatch.value?.id || null,
      };

      await inventoryStore.executeStockTransfer(transferData);

      $q.notify({
        type: 'positive',
        message: t('inventory.transferCompleted'),
        caption: t('inventory.transferCompletedDetails', {
          quantity: transferQuantity.value,
          product: props.selectedProduct.name,
          from: fromLocation.value.name,
          to: toLocation.value.name,
        }),
      });

      emit('transfer-completed', transferData);
      emit('update:modelValue', false);

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Transfer failed:', error);
      $q.notify({
        type: 'negative',
        message: t('inventory.transferFailed'),
        caption:
          (error as Error).message || t('inventory.transferFailedDetails'),
      });
    } finally {
      transferLoading.value = false;
    }
  };

  const resetForm = () => {
    fromLocation.value = null;
    toLocation.value = null;
    selectedBatch.value = null;
    transferQuantity.value = 1;
    transferReason.value = 'location_rebalance';
    notes.value = '';
    internalSelectedProduct.value = null;
  };

  // Product selection functions
  const filterProducts = (val: string, update: Function) => {
    update(() => {
      if (val === '') {
        availableProducts.value = [];
      } else {
        // In a real implementation, this would search inventory
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

  const clearSelectedProduct = () => {
    emit('product-selected', null);
  };

  // Barcode scanning
  const handleBarcodeScan = async (barcode: string) => {
    try {
      // This would search for products by barcode
      $q.notify({
        type: 'info',
        message: t('inventory.barcodeScanned', { barcode }),
        icon: 'qr_code_scanner',
      });
    } catch (error) {
      console.error('Error processing barcode:', error);
      $q.notify({
        type: 'negative',
        message: t('errors.processingError'),
      });
    }
  };

  // Initialize with current location if provided
  watch(
    () => props.currentLocation,
    newLocation => {
      if (newLocation && !fromLocation.value) {
        fromLocation.value = newLocation;
      }
    },
    { immediate: true }
  );

  // Reset form when dialog closes
  watch(
    () => props.modelValue,
    isOpen => {
      if (!isOpen) {
        resetForm();
      }
    }
  );
</script>

<style scoped>
  .product-preview {
    background: var(--q-grey-1);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .transfer-preview {
    margin-top: 16px;
  }

  .preview-card {
    background: linear-gradient(135deg, var(--q-primary-1), var(--q-accent-1));
    border-radius: 8px;
    padding: 4px;
  }

  .preview-card .q-card {
    border-radius: 6px;
  }
</style>
