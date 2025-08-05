<template>
  <FormDialog
    v-model="dialogModel"
    :title="isEdit ? $t('products.editProduct') : $t('products.createProduct')"
    icon="inventory"
    size="lg"
    :loading="saving"
    @submit="onSubmit"
    @cancel="closeDialog"
  >
    <q-form @submit="onSubmit" class="product-form">
      <!-- Basic Information Section -->
      <div class="form-section">
        <h3 class="section-title">{{ $t('products.basicInfo') }}</h3>
        
        <!-- Product Name -->
        <q-input
          v-model="form.name"
          :label="$t('products.name') + ' *'"
          outlined
          :rules="[rules.required]"
          ref="nameInput"
        />

        <!-- SKU -->
        <q-input
          v-model="form.sku"
          :label="$t('products.sku')"
          outlined
          :hint="$t('products.skuHint')"
        />

        <!-- Description -->
        <q-input
          v-model="form.description"
          :label="$t('products.description')"
          type="textarea"
          outlined
          rows="3"
        />
      </div>

      <!-- Product Details Section -->
      <div class="form-section">
        <h3 class="section-title">{{ $t('products.details') }}</h3>
        
        <!-- Category and Brand Row -->
        <div class="form-row">
          <q-input
            v-model="form.category"
            :label="$t('products.category')"
            outlined
            class="form-field"
          />
          <q-input
            v-model="form.brand"
            :label="$t('products.brand')"
            outlined
            class="form-field"
          />
        </div>

        <!-- Unit and Price Row -->
        <div class="form-row">
          <q-select
            v-model="form.unit"
            :options="unitOptions"
            :label="$t('products.unit')"
            outlined
            emit-value
            map-options
            class="form-field"
          />
          <q-input
            v-model.number="form.price"
            :label="$t('products.price')"
            type="number"
            step="0.01"
            min="0"
            outlined
            :prefix="form.currency"
            class="form-field"
          />
        </div>
      </div>

      <!-- Additional Information Section -->
      <div class="form-section">
        <h3 class="section-title">{{ $t('products.additionalInfo') }}</h3>
        
        <!-- Barcode -->
        <q-input
          v-model="form.barcode"
          :label="$t('products.barcode')"
          outlined
          :hint="$t('products.barcodeHint')"
        >
          <template v-slot:append>
            <q-btn
              icon="qr_code_scanner"
              flat
              round
              @click="$emit('scan-barcode')"
            >
              <q-tooltip>{{ $t('products.scanBarcode') }}</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <!-- Options Row -->
        <div class="form-row">
          <q-checkbox
            v-model="form.requires_batch_tracking"
            :label="$t('products.requiresBatchTracking')"
            class="form-field"
          />
          <q-checkbox
            v-model="form.active"
            :label="$t('products.active')"
            class="form-field"
          />
        </div>
      </div>

      <!-- Advanced Fields Section -->
      <div class="form-section">
        <q-expansion-item
          icon="qr_code_2"
          :label="$t('products.gs1Information')"
          header-class="text-primary"
          class="advanced-expansion"
        >
          <div class="advanced-content">
            <!-- GTIN and GPC Row -->
            <div class="form-row">
              <q-input
                v-model="form.gtin"
                label="GTIN"
                outlined
                :hint="$t('products.gtinHint')"
                class="form-field"
              />
              <q-input
                v-model="form.gpc_brick_code"
                label="GPC Brick Code"
                outlined
                :hint="$t('products.gpcHint')"
                class="form-field"
              />
            </div>

            <!-- Country and Lifecycle Row -->
            <div class="form-row">
              <q-input
                v-model="form.country_of_origin"
                :label="$t('products.countryOfOrigin')"
                outlined
                class="form-field"
              />
              <q-select
                v-model="form.product_lifecycle_status"
                :options="lifecycleOptions"
                :label="$t('products.lifecycleStatus')"
                outlined
                emit-value
                map-options
                class="form-field"
              />
            </div>
          </div>
        </q-expansion-item>
      </div>
    </q-form>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { productService } from 'src/services/supabase';
import FormDialog from 'src/components/base/FormDialog.vue';
import type { Product } from 'src/types/inventory';

// Props
interface Props {
  modelValue: boolean;
  product?: Product | null;
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'saved': [product: Product];
  'scan-barcode': [];
}>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const authStore = useAuthStore();

// Refs
const nameInput = ref<any>(null);
const saving = ref(false);

// State
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isEdit = computed(() => !!props.product);

// Form data
const defaultForm = () => ({
  name: '',
  sku: '',
  description: '',
  category: '',
  brand: '',
  unit: 'stuk',
  price: 0,
  currency: 'EUR',
  barcode: '',
  active: true,
  requires_batch_tracking: false,
  gtin: '',
  gpc_brick_code: '',
  country_of_origin: '',
  product_lifecycle_status: 'active',
});

const form = ref(defaultForm());

// Options
const unitOptions = [
  { label: t('products.units.piece'), value: 'stuk' },
  { label: t('products.units.pack'), value: 'pak' },
  { label: t('products.units.box'), value: 'doos' },
  { label: t('products.units.bottle'), value: 'fles' },
  { label: t('products.units.tube'), value: 'tube' },
  { label: t('products.units.liter'), value: 'liter' },
  { label: t('products.units.kg'), value: 'kg' },
  { label: t('products.units.gram'), value: 'gram' },
];

const lifecycleOptions = [
  { label: t('products.lifecycle.active'), value: 'active' },
  { label: t('products.lifecycle.discontinued'), value: 'discontinued' },
  { label: t('products.lifecycle.new'), value: 'new' },
  { label: t('products.lifecycle.phaseOut'), value: 'phase_out' },
];

// Validation rules
const rules = {
  required: (val: string) => !!val || t('validation.required'),
};

// Methods
const populateForm = () => {
  if (props.product) {
    form.value = {
      name: props.product.name || '',
      sku: props.product.sku || '',
      description: props.product.description || '',
      category: props.product.category || '',
      brand: props.product.brand || '',
      unit: props.product.unit || 'stuk',
      price: props.product.price || 0,
      currency: props.product.currency || 'EUR',
      barcode: props.product.barcode || '',
      active: props.product.active !== false,
      requires_batch_tracking: props.product.requires_batch_tracking || false,
      gtin: (props.product as any).gtin || '',
      gpc_brick_code: (props.product as any).gpc_brick_code || '',
      country_of_origin: (props.product as any).country_of_origin || '',
      product_lifecycle_status: (props.product as any).product_lifecycle_status || 'active',
    };
  } else {
    form.value = defaultForm();
  }
};

const resetForm = () => {
  form.value = defaultForm();
};

const onSubmit = async () => {
  if (!authStore.clinicId) {
    $q.notify({
      type: 'negative',
      message: t('errors.noPracticeSelected'),
    });
    return;
  }

  saving.value = true;
  try {
    const productData = {
      practice_id: authStore.clinicId,
      name: form.value.name,
      sku: form.value.sku || null,
      description: form.value.description || null,
      category: form.value.category || null,
      brand: form.value.brand || null,
      unit: form.value.unit,
      price: form.value.price,
      currency: form.value.currency,
      barcode: form.value.barcode || null,
      active: form.value.active,
      requires_batch_tracking: form.value.requires_batch_tracking,
      gtin: form.value.gtin || null,
      gpc_brick_code: form.value.gpc_brick_code || null,
      country_of_origin: form.value.country_of_origin || null,
      product_lifecycle_status: form.value.product_lifecycle_status,
    };

    let result;
    if (isEdit.value && props.product) {
      result = await productService.update(props.product.id, productData);
    } else {
      result = await productService.create(productData);
    }

    if (result) {
      $q.notify({
        type: 'positive',
        message: isEdit.value ? t('products.updated') : t('products.created'),
      });
      emit('saved', result);
      closeDialog();
    }
  } catch (error) {
    console.error('Error saving product:', error);
    $q.notify({
      type: 'negative',
      message: isEdit.value ? t('products.updateError') : t('products.createError'),
    });
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  emit('update:modelValue', false);
};

const onDialogHide = () => {
  resetForm();
};

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      populateForm();
      nextTick(() => {
        nameInput.value?.focus();
      });
    }
  }
);
</script>

<style lang="scss" scoped>
// ===================================================================
// MODERN PRODUCT FORM STYLING
// ===================================================================

.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  .section-title {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--neutral-900);
    margin: 0 0 var(--space-2) 0;
    padding-bottom: var(--space-2);
    border-bottom: 2px solid var(--neutral-100);
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  align-items: stretch; // Better alignment for equal height fields
  width: 100%;

  // Ensure all child form fields have equal width
  > * {
    width: 100%;
    min-width: 0; // Prevent overflow
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}

.form-field {
  width: 100%;
  // Remove all custom field styling - use global field system to prevent double borders
  // This ensures consistent styling with the rest of the application
}

// Use global checkbox styling - remove custom overrides to prevent conflicts

// Clean expansion styling
.advanced-expansion {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;

  :deep(.q-expansion-item__container) {
    .q-expansion-item__header {
      background: var(--bg-primary);
      padding: var(--space-4);
      font-weight: var(--font-weight-medium);

      .q-expansion-item__icon {
        color: var(--brand-primary);
      }
    }

    .q-expansion-item__content {
      background: var(--bg-primary);
      padding: 0;
    }
  }
}

.advanced-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

// ===================================================================
// DARK MODE ADAPTATIONS - MINIMAL OVERRIDES
// ===================================================================

body.body--dark {
  .form-section {
    .section-title {
      color: var(--text-primary);
      border-bottom-color: var(--border-primary);
    }
  }

  .advanced-expansion {
    border-color: var(--border-primary);

    :deep(.q-expansion-item__container) {
      .q-expansion-item__header {
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      .q-expansion-item__content {
        background: var(--bg-primary);
      }
    }
  }
}

// ===================================================================
// RESPONSIVE DESIGN
// ===================================================================

@media (max-width: 768px) {
  .product-form {
    gap: var(--space-4);
  }

  .form-section {
    gap: var(--space-3);

    .section-title {
      font-size: var(--text-base);
    }
  }

  .advanced-content {
    padding: var(--space-3);
    gap: var(--space-3);
  }
}
</style> 