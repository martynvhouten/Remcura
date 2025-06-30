<template>
  <BaseDialog
    v-model="dialogOpen"
    :title="isEditing ? t('products.editProduct') : t('products.addProduct')"
    :subtitle="isEditing ? 'Wijzig de productgegevens' : 'Voeg een nieuw product toe aan je voorraad'"
    :icon="isEditing ? 'edit' : 'add'"
            size="md"
    variant="modern"
    @close="handleClose"
  >
    <!-- Form Content -->
        <q-form @submit="handleSubmit" class="product-form" novalidate>
          <!-- Product Name -->
          <div class="form-group">
          <q-input
            v-model="form.product_name"
            :label="t('products.productName')"
            :rules="[val => !!val || t('validation.required')]"
            outlined
            clearable
              class="input-modern"
              :error="hasError('product_name')"
              :aria-describedby="hasError('product_name') ? 'product-name-error' : 'product-name-help'"
              required
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" aria-hidden="true" />
              </template>
            </q-input>
            <div v-if="hasError('product_name')" id="product-name-error" class="sr-only">{{ formErrors.product_name }}</div>
            <div id="product-name-help" class="sr-only">{{ $t('products.productNameHelp') || 'Enter the product name' }}</div>
          </div>

          <!-- Product SKU -->
          <div class="form-group">
          <q-input
            v-model="form.product_sku"
            :label="t('products.productSku')"
            outlined
            clearable
              class="input-modern"
              hint="Optioneel - wordt automatisch gegenereerd indien leeg"
              :aria-describedby="'product-sku-help'"
            >
              <template v-slot:prepend>
                <q-icon name="tag" aria-hidden="true" />
              </template>
            </q-input>
            <div id="product-sku-help" class="sr-only">{{ $t('products.skuHelp') || 'Optional - will be auto-generated if left empty' }}</div>
          </div>

          <!-- Stock Numbers Grid -->
          <div class="form-group">
            <div class="form-label" id="stock-group-label">Voorraad gegevens</div>
            <div class="stock-grid" role="group" aria-labelledby="stock-group-label">
            <q-input
              v-model.number="form.current_stock"
              :label="t('products.currentStock')"
              type="number"
              min="0"
              :rules="[val => val >= 0 || t('validation.positiveNumber')]"
              outlined
                class="input-modern"
                :error="hasError('current_stock')"
                :aria-describedby="hasError('current_stock') ? 'current-stock-error' : 'current-stock-help'"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory" aria-hidden="true" />
                </template>
                <template v-slot:append>
                  <span class="input-unit">stuks</span>
                </template>
              </q-input>
              <div v-if="hasError('current_stock')" id="current-stock-error" class="sr-only">{{ formErrors.current_stock }}</div>
              <div id="current-stock-help" class="sr-only">{{ $t('products.currentStockHelp') || 'Current number of items in stock' }}</div>

            <q-input
              v-model.number="form.minimum_stock"
              :label="t('products.minimumStock')"
              type="number"
              min="0"
              :rules="[val => val >= 0 || t('validation.positiveNumber')]"
              outlined
                class="input-modern"
                :error="hasError('minimum_stock')"
                hint="Waarschuwingsgrens"
                :aria-describedby="hasError('minimum_stock') ? 'minimum-stock-error' : 'minimum-stock-help'"
              >
                <template v-slot:prepend>
                  <q-icon name="warning" aria-hidden="true" />
                </template>
                <template v-slot:append>
                  <span class="input-unit">stuks</span>
                </template>
              </q-input>
              <div v-if="hasError('minimum_stock')" id="minimum-stock-error" class="sr-only">{{ formErrors.minimum_stock }}</div>
              <div id="minimum-stock-help" class="sr-only">{{ $t('products.minimumStockHelp') || 'Minimum stock level before warning alert' }}</div>

          <q-input
            v-model.number="form.maximum_stock"
            :label="t('products.maximumStock')"
            type="number"
            min="0"
            :rules="[val => val >= 0 || t('validation.positiveNumber')]"
            outlined
                class="input-modern"
                :error="hasError('maximum_stock')"
                :hint="$t('products.maxStockHint')"
                :aria-describedby="hasError('maximum_stock') ? 'maximum-stock-error' : 'maximum-stock-help'"
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" aria-hidden="true" />
                </template>
                <template v-slot:append>
                  <span class="input-unit">stuks</span>
                </template>
              </q-input>
              <div v-if="hasError('maximum_stock')" id="maximum-stock-error" class="sr-only">{{ formErrors.maximum_stock }}</div>
              <div id="maximum-stock-help" class="sr-only">{{ $t('products.maximumStockHelp') || 'Maximum recommended stock level' }}</div>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
          <q-input
            v-model="form.product_description"
            :label="t('products.description')"
            type="textarea"
            rows="3"
            outlined
            clearable
              class="input-modern"
              hint="Optionele beschrijving van het product"
              :aria-describedby="'product-description-help'"
            >
              <template v-slot:prepend>
                <q-icon name="description" aria-hidden="true" />
              </template>
            </q-input>
            <div id="product-description-help" class="sr-only">{{ $t('products.descriptionHelp') || 'Optional product description' }}</div>
          </div>

          <!-- Stock Status Preview -->
          <div class="form-group" v-if="form.current_stock !== null && form.minimum_stock !== null">
            <div class="form-label" id="preview-label">Voorraad status preview</div>
            <div class="status-preview glass-card" role="status" aria-labelledby="preview-label">
              <div class="preview-item">
                <span class="preview-label">Huidige status:</span>
                <q-chip 
                  :color="getPreviewStatusColor()"
                  text-color="white"
                  :icon="getPreviewStatusIcon()"
                  size="sm"
                  :aria-label="`Status: ${getPreviewStatusText()}`"
                >
                  {{ getPreviewStatusText() }}
                </q-chip>
              </div>
              <div class="preview-item" v-if="form.current_stock <= form.minimum_stock" role="alert">
                <q-icon name="info" color="info" size="16px" aria-hidden="true" />
                <span class="preview-warning">{{ $t('products.lowStockWarningPreview') }}</span>
              </div>
            </div>
          </div>
        </q-form>

      <!-- Dialog Actions -->
    <template #actions>
            <q-btn 
            flat
              :label="t('common.cancel')" 
        @click="handleClose"
            class="cancel-btn btn-modern"
            color="neutral"
            no-caps
            />
            <q-btn 
            :label="isEditing ? t('common.update') : t('common.save')" 
        @click="handleSubmit"
              color="primary" 
              :loading="loading"
            class="save-btn btn-modern"
            unelevated
            no-caps
            :icon="isEditing ? 'save' : 'add'"
            />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from './base/BaseDialog.vue'
import type { ClinicProduct } from 'src/types/supabase'

interface Props {
  modelValue: boolean
  product?: ClinicProduct | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const loading = ref(false)
const formErrors = ref<Record<string, string>>({})

const defaultForm = {
  product_name: '',
  product_sku: '',
  product_description: '',
  current_stock: 0,
  minimum_stock: 0,
  maximum_stock: 100
}

const form = ref({ ...defaultForm })

// Computed properties
const isEditing = computed(() => !!props.product)

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Helper functions
const hasError = (field: string) => !!formErrors.value[field]

const getPreviewStatusColor = () => {
  if (form.value.current_stock === 0) return 'negative'
  if (form.value.current_stock <= form.value.minimum_stock) return 'warning'
  return 'positive'
}

const getPreviewStatusIcon = () => {
  if (form.value.current_stock === 0) return 'error'
  if (form.value.current_stock <= form.value.minimum_stock) return 'warning'
  return 'check_circle'
}

const getPreviewStatusText = () => {
      if (form.value.current_stock === 0) return t('products.outOfStock')
      if (form.value.current_stock <= form.value.minimum_stock) return t('products.lowStock')
    return t('products.inStock')
}

// Watchers
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      product_name: newProduct.product_name,
      product_sku: newProduct.product_sku || '',
      product_description: newProduct.product_description || '',
      current_stock: newProduct.current_stock,
      minimum_stock: newProduct.minimum_stock,
      maximum_stock: newProduct.maximum_stock
    }
  } else {
    form.value = { ...defaultForm }
  }
  // Clear errors when product changes
  formErrors.value = {}
}, { immediate: true })

// Reset form when dialog closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen && !props.product) {
    form.value = { ...defaultForm }
    formErrors.value = {}
  }
})

// Methods
const validateForm = () => {
  formErrors.value = {}
  
  if (!form.value.product_name.trim()) {
    formErrors.value.product_name = t('validation.required')
  }
  
  if (form.value.current_stock < 0) {
    formErrors.value.current_stock = t('validation.positiveNumber')
  }
  
  if (form.value.minimum_stock < 0) {
    formErrors.value.minimum_stock = t('validation.positiveNumber')
  }
  
  if (form.value.maximum_stock < 0) {
    formErrors.value.maximum_stock = t('validation.positiveNumber')
  }
  
  if (form.value.maximum_stock < form.value.minimum_stock) {
    formErrors.value.maximum_stock = 'Maximum voorraad moet groter zijn dan minimum voorraad'
  }
  
  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  try {
    emit('save', { ...form.value })
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
// Form styling
.product-form {
  .form-group {
    margin-bottom: var(--space-6);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
    
    .form-label {
      font-size: var(--text-sm);
      font-weight: var(--font-weight-semibold);
    color: var(--neutral-700);
    margin-bottom: var(--space-3);
    display: block;
  }
  
  .stock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  
  .input-modern {
    :deep(.q-field__control) {
      border-radius: var(--radius-lg);
      
      &:hover {
      border-color: var(--brand-primary);
      }
    }
    
    :deep(.q-field__prepend) {
      color: var(--brand-primary);
    }
    }
    
    .input-unit {
    font-size: var(--text-sm);
      color: var(--neutral-500);
      font-weight: var(--font-weight-medium);
    }
  }
  
// Status preview styling
  .status-preview {
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
    padding: var(--space-4);
    
    .preview-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      
    &:not(:last-child) {
      margin-bottom: var(--space-3);
    }
      }
      
      .preview-label {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
    color: var(--neutral-600);
      }
      
      .preview-warning {
        font-size: var(--text-sm);
        color: var(--brand-info);
    font-style: italic;
  }
}

// Dark mode adjustments
body.body--dark {
  .form-label {
      color: var(--neutral-300);
  }
  
  .status-preview {
    background: var(--neutral-800);
    border-color: var(--neutral-700);
  }
  
    .preview-label {
    color: var(--neutral-400);
    }
    
    .preview-warning {
      color: var(--brand-info-light);
  }
}

// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style> 