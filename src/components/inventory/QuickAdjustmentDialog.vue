<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="$t('inventory.quickAdjustment')"
    icon="edit"
    max-width="500px"
    @hide="onHide"
  >
    <q-form @submit="onSubmit" class="adjustment-form">
      <!-- Location Selection -->
      <q-select
        v-model="form.locationId"
        :options="locationOptions"
        :label="$t('inventory.selectLocation')"
        emit-value
        map-options
        outlined
        required
        :rules="[(val) => !!val || $t('validation.required')]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="place" />
        </template>
      </q-select>

      <!-- Product Search -->
      <q-select
        v-model="selectedProduct"
        :options="filteredProducts"
        :label="$t('inventory.selectProduct')"
        option-label="name"
        option-value="id"
        use-input
        input-debounce="300"
        @filter="(val, update) => { productSearch.value = val; update(); }"
        outlined
        required
        :rules="[(val) => !!val || $t('validation.required')]"
        class="form-field"
        @update:model-value="form.productId = $event?.id || ''"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        
        <template v-slot:option="{ itemProps, opt }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label>{{ opt.name }}</q-item-label>
              <q-item-label caption>{{ opt.sku }} | {{ opt.category || 'No category' }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip 
                v-if="opt.requires_batch_tracking" 
                size="sm" 
                color="warning" 
                text-color="black"
                :label="$t('inventory.batchTracked')"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Batch Tracking Warning -->
      <q-banner
        v-if="batchTrackingWarning"
        class="text-white bg-warning q-mt-md"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        {{ batchTrackingWarning }}
        <template v-slot:action>
          <q-btn
            flat
            color="white"
            :label="$t('inventory.manageBatches')"
            @click="navigateToBatchManagement"
          />
        </template>
      </q-banner>

      <!-- Quantity Change -->
      <q-input
        v-model.number="form.quantityChange"
        type="number"
        :label="$t('inventory.quantityChange')"
        :placeholder="$t('inventory.quantityChangePlaceholder')"
        outlined
        required
        :rules="[
          (val) =>
            (val !== null && val !== undefined) || $t('validation.required'),
          (val) => val !== 0 || $t('inventory.quantityMustNotBeZero'),
        ]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="edit" />
        </template>
        <template v-slot:hint>
          {{ $t("inventory.quantityChangeHint") }}
        </template>
      </q-input>

      <!-- Notes -->
      <q-input
        v-model="form.notes"
        :label="$t('common.notes')"
        :placeholder="$t('inventory.adjustmentNotesPlaceholder')"
        type="textarea"
        rows="2"
        outlined
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="notes" />
        </template>
      </q-input>
    </q-form>

    <template #actions>
      <q-btn flat :label="$t('common.cancel')" @click="onCancel" />
      <q-btn
        color="primary"
        :label="$t('inventory.adjustStock')"
        @click="onSubmit"
        :loading="loading"
        unelevated
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useProductsStore } from 'src/stores/products';
import { useInventoryStore } from 'src/stores/inventory';
import type { PracticeLocation, ProductWithStock } from 'src/types/inventory';
import BaseDialog from 'src/components/base/BaseDialog.vue';

interface Props {
  modelValue: boolean;
  locations: PracticeLocation[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'adjustment-made'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const productsStore = useProductsStore();
const inventoryStore = useInventoryStore();

// State
const loading = ref(false);
const productSearch = ref('');
const selectedProduct = ref<ProductWithStock | null>(null);
const form = ref({
  locationId: '',
  productId: '',
  quantityChange: null as number | null,
  notes: '',
});

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const locationOptions = computed(() =>
  props.locations.map((location) => ({
    label: location.name,
    value: location.id,
  }))
);

const filteredProducts = computed(() => {
  if (!productSearch.value) return [];
  const search = productSearch.value.toLowerCase();
  return productsStore.products.filter(product => 
    product.name.toLowerCase().includes(search) ||
    product.sku.toLowerCase().includes(search)
  ).slice(0, 10); // Limit to 10 results
});

const canAdjustStock = computed(() => {
  if (!selectedProduct.value) return true;
  return !selectedProduct.value.requires_batch_tracking;
});

const batchTrackingWarning = computed(() => {
  if (!selectedProduct.value?.requires_batch_tracking) return null;
  return t('inventory.batchTrackingWarning');
});

// Methods
const resetForm = () => {
  form.value = {
    locationId: props.locations[0]?.id || '',
    productId: '',
    quantityChange: null,
    notes: '',
  };
  productSearch.value = '';
  selectedProduct.value = null;
};

const onSubmit = async () => {
  if (!canAdjustStock.value) {
    $q.notify({
      type: 'warning',
      message: t('inventory.cannotAdjustBatchTrackedProduct'),
      position: 'top',
    });
    return;
  }

  loading.value = true;
  try {
    // Use inventory store to validate and update stock
    if (!inventoryStore.canManuallyAdjustStock(form.value.productId)) {
      throw new Error('Manual stock adjustments are not allowed for batch-tracked products');
    }

    // Simulate adjustment - in real implementation this would call the store
    await new Promise((resolve) => setTimeout(resolve, 1000));

    $q.notify({
      type: 'positive',
      message: t('inventory.stockAdjusted'),
      position: 'top',
    });

    emit('adjustment-made');
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('inventory.adjustmentFailed'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const navigateToBatchManagement = () => {
  // Close dialog and navigate to batch management
  dialogVisible.value = false;
  // Navigation would be implemented here
  $q.notify({
    type: 'info',
    message: t('inventory.redirectingToBatchManagement'),
    position: 'top',
  });
};

const onCancel = () => {
  dialogVisible.value = false;
};

const onHide = () => {
  resetForm();
};
</script>

<style lang="scss" scoped>
.adjustment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.form-field {
  width: 100%;
}
</style>
