<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized-on-mobile
  >
    <q-card style="min-width: 600px; max-width: 800px" class="modern-dialog">
      <!-- Modern Header -->
      <q-card-section class="dialog-header bg-primary text-white q-pa-lg">
        <div class="row items-center">
          <q-icon name="tune" size="28px" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-bold">
              {{ $t('inventory.quickAdjustment') }}
            </div>
            <div class="text-subtitle2 opacity-80">
              {{ $t('inventory.adjustStockLevels') }}
            </div>
          </div>
          <q-space />
          <!-- Realtime Indicator -->
          <q-chip
            v-if="realtimeConnected"
            size="sm"
            icon="wifi"
            color="positive"
            text-color="white"
            class="q-mr-sm"
          >
            {{ $t('common.live') }}
          </q-chip>
          <q-btn icon="close" flat round size="md" v-close-popup />
        </div>
      </q-card-section>

      <!-- Product Selection Step -->
      <q-card-section v-if="!selectedProduct" class="q-pa-lg">
        <div class="step-container">
          <div class="step-header">
            <q-icon name="search" size="20px" color="primary" />
            <span class="text-h6 q-ml-sm">{{
              $t('inventory.selectProduct')
            }}</span>
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
                :loading="productSearchLoading"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-avatar size="40px" class="bg-grey-3">
                        <q-img
                          v-if="scope.opt.image_url"
                          :src="scope.opt.image_url"
                          spinner-color="primary"
                          style="height: 40px; width: 40px"
                        />
                        <q-icon v-else name="inventory_2" color="grey-6" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>
                        SKU: {{ scope.opt.sku }} • {{ scope.opt.brand }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip
                        size="sm"
                        :color="getStockStatusColor(scope.opt)"
                        text-color="white"
                      >
                        {{ scope.opt.total_stock || 0 }} {{ scope.opt.unit }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      <div class="text-center q-pa-md">
                        <q-icon
                          name="search_off"
                          size="2rem"
                          color="grey-5"
                          class="q-mb-sm"
                        />
                        <div class="text-subtitle1">
                          {{ $t('inventory.noProductsFound') }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ $t('inventory.tryDifferentSearchTerm') }}
                        </div>
                      </div>
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

      <!-- Enhanced Product Info Card -->
      <q-card-section v-if="selectedProduct" class="q-pa-lg">
        <q-card
          flat
          bordered
          class="product-card bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-gutter-lg">
              <!-- Product Image/Icon -->
              <q-avatar size="80px" class="product-avatar">
                <q-img
                  v-if="selectedProduct.image_url"
                  :src="selectedProduct.image_url"
                  spinner-color="primary"
                  style="height: 80px; width: 80px"
                  class="rounded-borders"
                />
                <div
                  v-else
                  class="bg-primary text-white flex flex-center"
                  style="height: 80px; width: 80px"
                >
                  <q-icon name="inventory_2" size="40px" />
                </div>
              </q-avatar>

              <!-- Product Details -->
              <div class="col">
                <div class="text-h5 text-weight-bold text-grey-8 q-mb-xs">
                  {{ selectedProduct.name }}
                </div>
                <div class="text-subtitle1 text-grey-6 q-mb-sm">
                  SKU: {{ selectedProduct.sku }} •
                  {{ selectedProduct.brand || $t('quickAdjustment.noProduct') }}
                </div>
                <div
                  class="text-body2 text-grey-7 q-mb-md"
                  v-if="selectedProduct.description"
                >
                  {{ selectedProduct.description }}
                </div>

                <!-- Stock Status Row -->
                <div class="row items-center q-gutter-md">
                  <q-chip
                    :color="getStockStatusColor(selectedProduct)"
                    text-color="white"
                    size="md"
                    :icon="getStockStatusIcon(selectedProduct)"
                  >
                    <span class="text-weight-bold"
                      >{{ getCurrentStock() }} {{ selectedProduct.unit }}</span
                    >
                  </q-chip>

                  <div class="text-caption text-grey-6" v-if="selectedLocation">
                    📍 {{ selectedLocation.name }}
                  </div>
                  <q-chip
                    v-else
                    color="orange"
                    text-color="white"
                    size="sm"
                    icon="warning"
                  >
                    {{ $t('inventory.noLocationSelected') }}
                  </q-chip>

                  <div
                    v-if="selectedProduct.price"
                    class="text-caption text-grey-6"
                  >
                    💰 €{{ Number(selectedProduct.price).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  icon="edit"
                  @click="internalSelectedProduct = null"
                  class="text-grey-6"
                  :title="$t('inventory.changeProduct')"
                  size="lg"
                />
              </div>
            </div>

            <!-- Additional Product Info -->
            <div
              v-if="selectedProduct.barcode || selectedProduct.category"
              class="q-mt-md q-pt-md border-top"
            >
              <div class="row q-gutter-md">
                <div v-if="selectedProduct.category" class="col-auto">
                  <q-chip size="sm" outline color="blue-grey">
                    <q-icon name="category" size="xs" class="q-mr-xs" />
                    {{ selectedProduct.category }}
                  </q-chip>
                </div>
                <div v-if="selectedProduct.barcode" class="col-auto">
                  <q-chip size="sm" outline color="blue-grey">
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    {{ selectedProduct.barcode }}
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <!-- Location Selection (if no location provided) -->
      <q-card-section
        v-if="selectedProduct && !selectedLocation"
        class="q-pa-lg"
      >
        <div class="step-container">
          <div class="step-header">
            <q-icon name="place" size="20px" color="orange" />
            <span class="text-h6 q-ml-sm">{{
              $t('inventory.selectLocation')
            }}</span>
            <q-chip
              size="sm"
              color="orange"
              text-color="white"
              class="q-ml-sm"
              >{{ $t('common.required') }}</q-chip
            >
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
              <span class="text-h6 q-ml-sm">{{
                $t('inventory.adjustmentType')
              }}</span>
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
                      <span class="text-caption text-grey-6">{{
                        selectedProduct.unit
                      }}</span>
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Quick Amount Buttons -->
              <div class="quick-amounts q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">
                  {{ $t('inventory.quickAmounts') }}
                </div>
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
              <q-chip
                size="sm"
                color="orange"
                text-color="white"
                class="q-ml-sm"
                >{{ $t('common.required') }}</q-chip
              >
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
              <span class="text-h6 q-ml-sm text-grey-7">{{
                $t('inventory.notes')
              }}</span>
              <q-chip
                size="sm"
                color="grey-5"
                text-color="white"
                class="q-ml-sm"
                >{{ $t('common.optional') }}</q-chip
              >
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

          <!-- Enhanced Preview Card -->
          <q-card
            v-if="preview && isFormValid"
            flat
            bordered
            class="preview-card bg-gradient-to-r from-blue-50 to-green-50 q-mt-lg"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="preview" size="24px" color="blue-7" />
                <span class="text-h6 q-ml-sm text-blue-8">{{
                  $t('inventory.preview')
                }}</span>
                <q-space />
                <q-chip size="sm" color="blue" text-color="white">
                  {{
                    adjustmentType === 'increase'
                      ? 'Verhogen'
                      : adjustmentType === 'decrease'
                      ? 'Verlagen'
                      : 'Instellen'
                  }}
                </q-chip>
              </div>
              <div class="preview-content">
                <div class="row q-gutter-lg items-center">
                  <div class="col text-center">
                    <div class="text-caption text-grey-6">
                      {{ $t('inventory.current') }}
                    </div>
                    <div class="text-h5 text-weight-bold">
                      {{ preview.current }}
                    </div>
                    <div class="text-caption">{{ selectedProduct.unit }}</div>
                  </div>
                  <div class="col-auto flex items-center">
                    <q-icon
                      :name="
                        preview.change >= 0 ? 'arrow_forward' : 'arrow_back'
                      "
                      size="24px"
                      :color="preview.change >= 0 ? 'positive' : 'negative'"
                    />
                    <span
                      class="q-mx-sm text-h6 text-weight-bold"
                      :class="
                        preview.change >= 0 ? 'text-positive' : 'text-negative'
                      "
                    >
                      {{ preview.change >= 0 ? '+' : '' }}{{ preview.change }}
                    </span>
                  </div>
                  <div class="col text-center">
                    <div class="text-caption text-grey-6">
                      {{ $t('inventory.newQuantity') }}
                    </div>
                    <div
                      class="text-h5 text-weight-bold"
                      :class="getStatusTextClass(preview.newStatus)"
                    >
                      {{ preview.newQuantity }}
                    </div>
                    <div class="text-caption">{{ selectedProduct.unit }}</div>
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
          :label="
            $q.screen.xs ? $t('inventory.adjust') : $t('inventory.adjustStock')
          "
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
            {{
              $q.screen.xs
                ? $t('inventory.adjusting')
                : $t('inventory.adjusting')
            }}
          </template>
        </q-btn>
      </q-card-actions>

      <!-- Validation Summary -->
      <q-banner
        v-if="!isFormValid && (quantityInput !== null || selectedReason)"
        rounded
        class="validation-banner q-ma-md"
        :class="getValidationBannerClass()"
      >
        <template v-slot:avatar>
          <q-icon name="info" />
        </template>
        <div class="text-subtitle2">
          {{ $t('inventory.completeRequiredFields') }}
        </div>
        <ul class="q-mt-sm">
          <li v-if="quantityError">{{ quantityErrorMessage }}</li>
          <li v-if="reasonError">{{ reasonErrorMessage }}</li>
          <li v-if="!selectedProduct">
            {{ $t('inventory.selectProductFirst') }}
          </li>
          <li v-if="!selectedLocation">
            {{ $t('inventory.selectLocationFirst') }}
          </li>
        </ul>
      </q-banner>
    </q-card>

    <!-- Barcode Scanner -->
    <BarcodeScanner v-model="showBarcodeScanner" @scan="handleBarcodeScan" />
  </q-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useAuthStore } from 'src/stores/auth';
  import { useProductsStore } from 'src/stores/products';
  import { useClinicStore } from 'src/stores/clinic';
  import { realtimeService } from 'src/services/supabase';
  import BarcodeScanner from 'src/components/BarcodeScanner.vue';
  import type {
    StockUpdateRequest,
    MovementType,
    ReasonCode,
    PracticeLocation,
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
  const productsStore = useProductsStore();
  const clinicStore = useClinicStore();

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
  const productSearchLoading = ref(false);

  // Location selection state
  const internalSelectedLocation = ref<any>(null);

  // Realtime state
  const realtimeConnected = ref(false);
  const inventoryChannel = ref<any>(null);

  // Quick amount buttons
  const quickAmounts = [1, 5, 10, 25, 50, 100];

  // Computed
  const adjustmentTypeOptions = computed(() => [
    {
      label: t('inventory.increase'),
      value: 'increase',
      icon: 'add_circle',
      color: 'positive',
    },
    {
      label: t('inventory.decrease'),
      value: 'decrease',
      icon: 'remove_circle',
      color: 'negative',
    },
    {
      label: t('inventory.setTo'),
      value: 'set',
      icon: 'edit',
      color: 'primary',
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

  const selectedProduct = computed(
    () => props.selectedProduct || internalSelectedProduct.value
  );
  const selectedLocation = computed(
    () => props.selectedLocation || internalSelectedLocation.value
  );

  // Available locations from clinic store
  const availableLocations = computed(() => {
    return (
      clinicStore.locations || [
        { id: '880e8400-e29b-41d4-a716-446655440001', name: 'Hoofdvoorraad' },
        { id: '880e8400-e29b-41d4-a716-446655440002', name: 'Spoedkast' },
        { id: '880e8400-e29b-41d4-a716-446655440003', name: 'Behandelkamer 1' },
      ]
    );
  });

  const getCurrentStock = () => {
    if (!selectedProduct.value) return 0;
    const product = selectedProduct.value as any;
    return (
      product?.current_quantity ||
      product?.total_stock ||
      product?.available_stock ||
      0
    );
  };

  const preview = computed(() => {
    if (
      !selectedProduct.value ||
      quantityInput.value === null ||
      quantityInput.value === undefined
    ) {
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
        change = -quantityInput.value;
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
    return (
      quantityInput.value !== null &&
      (quantityInput.value === undefined ||
        isNaN(quantityInput.value) ||
        quantityInput.value < 0)
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
    if (!selectedProduct.value) return 'in_stock';
    const product = selectedProduct.value as any;
    const minStock = product?.minimum_quantity || product?.minimum_stock || 10;
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= minStock) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusColor = (product: any) => {
    const stock =
      (product as any)?.current_quantity || (product as any)?.total_stock || 0;
    const status = determineStockStatus(stock);
    switch (status) {
      case 'out_of_stock':
        return 'negative';
      case 'low_stock':
        return 'warning';
      default:
        return 'positive';
    }
  };

  const getStockStatusIcon = (product: any) => {
    const stock =
      (product as any)?.current_quantity || (product as any)?.total_stock || 0;
    const status = determineStockStatus(stock);
    switch (status) {
      case 'out_of_stock':
        return 'error';
      case 'low_stock':
        return 'warning';
      default:
        return 'check_circle';
    }
  };

  const getStatusTextClass = (status: string): string => {
    switch (status) {
      case 'out_of_stock':
        return 'text-negative';
      case 'low_stock':
        return 'text-warning';
      default:
        return 'text-positive';
    }
  };

  const getValidationBannerClass = () => {
    return 'bg-orange-1 text-orange-8';
  };

  const filterProducts = async (val: string, update: any) => {
    if (val.length < 2) {
      update(() => {
        availableProducts.value = [];
      });
      return;
    }

    productSearchLoading.value = true;

    try {
      // Load products from store if not loaded
      if (!productsStore.products.length) {
        const practiceId = authStore.userProfile?.clinic_id;
        if (practiceId) {
          await productsStore.fetchProducts(practiceId);
        }
      }

      update(() => {
        const needle = val.toLowerCase();
        availableProducts.value = productsStore.products
          .filter(
            product =>
              product.name.toLowerCase().includes(needle) ||
              product.sku.toLowerCase().includes(needle) ||
              (product.barcode &&
                product.barcode.toLowerCase().includes(needle))
          )
          .slice(0, 10) // Limit to 10 results for performance
          .map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.unit || 'stuk',
            brand: product.brand,
            image_url: product.image_url,
            total_stock: product.total_stock,
            current_quantity: product.current_quantity,
            minimum_quantity: product.minimum_quantity,
            price: product.price,
            description: product.description,
            barcode: product.barcode,
            category: product.category,
          }));
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      update(() => {
        availableProducts.value = [];
      });
    } finally {
      productSearchLoading.value = false;
    }
  };

  const onProductSelected = (product: any) => {
    if (product) {
      emit('product-selected', product);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      // Search for products matching the barcode
      const practiceId = authStore.userProfile?.clinic_id;
      if (practiceId && !productsStore.products.length) {
        await productsStore.fetchProducts(practiceId);
      }

      const matchingProduct = productsStore.products.find(
        product =>
          product.barcode === barcode ||
          product.sku === barcode ||
          product.name.toLowerCase().includes(barcode.toLowerCase())
      );

      if (matchingProduct) {
        // Set the product as selected
        internalSelectedProduct.value = {
          id: matchingProduct.id,
          name: matchingProduct.name,
          sku: matchingProduct.sku,
          unit: matchingProduct.unit || 'stuk',
          brand: matchingProduct.brand,
          image_url: matchingProduct.image_url,
          total_stock: matchingProduct.total_stock,
          current_quantity: matchingProduct.current_quantity,
          minimum_quantity: matchingProduct.minimum_quantity,
          price: matchingProduct.price,
          description: matchingProduct.description,
          barcode: matchingProduct.barcode,
          category: matchingProduct.category,
        };

        emit('product-selected', internalSelectedProduct.value);

        $q.notify({
          type: 'positive',
          message: t('inventory.barcodeFound', {
            product: matchingProduct.name,
          }),
          icon: 'qr_code_scanner',
        });
      } else {
        $q.notify({
          type: 'warning',
          message: t('inventory.barcodeNotFound', { barcode }),
          icon: 'search_off',
        });
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      $q.notify({
        type: 'negative',
        message: t('errors.processingError'),
        icon: 'error',
      });
    }
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
        throw new Error($t('quickadjus.noreasonselected'));
      }

      const practiceId = authStore.userProfile?.clinic_id;
      if (!practiceId) {
        throw new Error($t('quickadjus.usernotauthenticatedor'));
      }

      const locationId = selectedLocation.value?.id;
      if (!locationId) {
        throw new Error($t('quickadjus.nolocationselected'));
      }

      const productId =
        selectedProduct.value?.id || selectedProduct.value?.product_id;
      if (!productId) {
        throw new Error($t('quickadjus.noproductselected'));
      }

      const request: StockUpdateRequest = {
        practice_id: practiceId,
        location_id: locationId,
        product_id: productId,
        quantity_change: preview.value.change,
        movement_type: movementType,
        reason_code: reasonCode as ReasonCode,
        notes: notes.value || '',
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
    } catch (error: any) {
      console.error('Error updating stock:', error);

      // Determine user-friendly error message
      let errorMessage = t('inventory.errorUpdatingStock');
      let canRetry = true;

      if (error.message) {
        if (error.message.includes('Insufficient stock')) {
          errorMessage = error.message;
          canRetry = false; // No point retrying if there's insufficient stock
        } else if (error.message.includes('not found')) {
          errorMessage = t('inventory.errorProductNotFound');
          canRetry = false;
        } else if (error.message.includes('Another update is in progress')) {
          errorMessage = t('inventory.errorUpdateInProgress');
          canRetry = true;
        } else if (error.message.includes('Invalid reference')) {
          errorMessage = t('inventory.errorInvalidData');
          canRetry = false;
        } else if (error.message.includes('negative stock not allowed')) {
          errorMessage = t('inventory.errorNegativeStock');
          canRetry = false;
        } else if (error.message.startsWith('Failed to update stock:')) {
          errorMessage = error.message;
        }
      }

      // Update loading notification to error
      const notificationOptions: any = {
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        timeout: canRetry ? 5000 : 8000,
      };

      if (canRetry) {
        notificationOptions.actions = [
          {
            label: t('common.retry'),
            color: 'white',
            handler: () => {
              emit('update:modelValue', true);
            },
          },
        ];
      }

      notif(notificationOptions);

      // Only reopen dialog on error if it's worth retrying
      if (canRetry) {
        emit('update:modelValue', true);
      }
    }
  };

  // Initialize data on mount
  onMounted(async () => {
    try {
      const practiceId = authStore.userProfile?.clinic_id;
      if (!practiceId) return;

      // Load products and locations if not already loaded
      if (!productsStore.products.length) {
        await productsStore.fetchProducts(practiceId);
      }

      if (!clinicStore.locations.length) {
        await clinicStore.fetchLocations(practiceId);
      }

      // Initialize realtime service
      if (practiceId) {
        inventoryChannel.value = realtimeService.subscribeToInventory(
          practiceId,
          (payload: any) => {
            // Realtime inventory update received

            if (payload.new && payload.eventType === 'UPDATE') {
              // Find the product in availableProducts and update its total_stock
              const productIndex = availableProducts.value.findIndex(
                p => p.id === payload.new.product_id
              );
              if (productIndex !== -1) {
                availableProducts.value[productIndex].total_stock =
                  payload.new.current_quantity;
                availableProducts.value[productIndex].current_quantity =
                  payload.new.current_quantity;
              }

              // If this is the currently selected product, show a notification
              if (
                selectedProduct.value &&
                selectedProduct.value.id === payload.new.product_id
              ) {
                $q.notify({
                  type: 'info',
                  message: `Stock bijgewerkt: ${selectedProduct.value.name} nu ${payload.new.current_quantity} ${selectedProduct.value.unit}`,
                  icon: 'update',
                  timeout: 3000,
                });
              }
            }
          }
        );
        realtimeConnected.value = true;
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  });

  onUnmounted(() => {
    if (inventoryChannel.value) {
      realtimeService.unsubscribeFromChannel(inventoryChannel.value);
      inventoryChannel.value = null;
      realtimeConnected.value = false;
    }
  });

  // Watch for product changes
  watch(
    () => props.selectedProduct,
    newProduct => {
      if (newProduct) {
        internalSelectedProduct.value = newProduct;
      }
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  .modern-dialog {
    .dialog-header {
      border-radius: 8px 8px 0 0;
      background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%);
    }

    .step-container,
    .adjustment-container {
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
      border-radius: 16px;
      transition: all 0.3s ease;
      overflow: hidden;

      &:hover {
        border-color: var(--q-primary);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }
    }

    .product-avatar {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .modern-toggle {
      .q-btn {
        border-radius: 8px;
        min-height: 48px;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 600px) {
          min-height: 40px;
          font-size: 0.8rem;
          padding: 8px 12px;
        }
      }
    }

    .modern-select,
    .quantity-input {
      .q-field__control {
        border-radius: 8px;
      }
    }

    .quick-amounts {
      .quick-amount-btn {
        min-width: 48px;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }

        @media (max-width: 600px) {
          min-width: 36px;
          font-size: 0.75rem;
          padding: 4px 8px;
        }
      }
    }

    .preview-card {
      border: 2px solid var(--q-blue-4);
      border-radius: 16px;
      background: linear-gradient(135deg, #f0f8ff 0%, #e8f5e8 100%);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .preview-content {
      font-family: 'Roboto Mono', monospace;
    }

    .modern-actions {
      border-radius: 0 0 8px 8px;
      border-top: 1px solid var(--q-grey-4);
      background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);

      .save-button {
        min-width: 140px;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 600px) {
          min-width: 100px;
          font-size: 0.85rem;
          padding: 8px 16px;
        }
      }
    }

    .validation-banner {
      border-radius: 12px;

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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 600px) {
        min-height: 48px;
        min-width: 48px;
        padding: 8px;
      }
    }
  }

  // Gradient utilities for better visual appeal
  .bg-gradient-to-r {
    &.from-blue-50.to-indigo-50 {
      background: linear-gradient(90deg, #eff6ff 0%, #eef2ff 100%);
    }

    &.from-blue-50.to-green-50 {
      background: linear-gradient(90deg, #eff6ff 0%, #f0fdf4 100%);
    }
  }

  // Animation for realtime indicator
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .q-chip[color='positive'] {
    animation: pulse 2s infinite;
  }

  // Enhanced mobile responsiveness
  @media (max-width: 600px) {
    .modern-dialog {
      .product-card {
        .q-card-section {
          padding: 1rem;
        }

        .row {
          .q-gutter-lg > * {
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
        }
      }

      .adjustment-step {
        margin-bottom: 24px;
      }

      .preview-card {
        .row.q-gutter-lg {
          gap: 0.5rem;
        }
      }
    }
  }

  // Border utilities
  .border-top {
    border-top: 1px solid var(--q-grey-4);
  }
</style>
