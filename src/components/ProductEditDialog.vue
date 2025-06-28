<template>
  <q-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    class="product-dialog"
    role="dialog"
    :aria-labelledby="isEditing ? 'edit-product-title' : 'add-product-title'"
    aria-modal="true"
  >
    <q-card class="dialog-card card-modern">
      <!-- Dialog Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <q-avatar size="48px" color="primary" text-color="white">
              <q-icon :name="isEditing ? 'edit' : 'add'" size="24px" />
            </q-avatar>
          </div>
          <div class="header-text">
            <h2 class="dialog-title" :id="isEditing ? 'edit-product-title' : 'add-product-title'">
          {{ isEditing ? t('products.editProduct') : t('products.addProduct') }}
            </h2>
            <p class="dialog-subtitle">
              {{ isEditing ? 'Wijzig de productgegevens' : 'Voeg een nieuw product toe aan je voorraad' }}
            </p>
        </div>
        <q-btn 
          flat 
          round 
          dense 
            icon="close"
          @click="$emit('update:modelValue', false)" 
            class="close-btn"
            size="md"
            :aria-label="$t('common.close') || 'Close dialog'"
        />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Dialog Content -->
      <q-card-section class="dialog-content">
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
      </q-card-section>

      <q-separator />

      <!-- Dialog Actions -->
      <q-card-section class="dialog-actions">
        <div class="actions-content">
            <q-btn 
            flat
              :label="t('common.cancel')" 
              @click="$emit('update:modelValue', false)" 
            class="cancel-btn btn-modern"
            color="neutral"
            />
            <q-btn 
            :label="isEditing ? t('common.update') : t('common.save')" 
              type="submit" 
              color="primary" 
              :loading="loading"
            @click="handleSubmit"
            class="save-btn btn-modern"
            unelevated
            :icon="isEditing ? 'save' : 'add'"
            />
          </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const isEditing = computed(() => !!props.product)

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

// Watch for product changes to populate form
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
</script>

<style lang="scss" scoped>
.product-dialog {
  :deep(.q-dialog__inner) {
    padding: var(--space-4);
  }
}

.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
  overflow: hidden;
}

// Dialog header
.dialog-header {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-light));
  color: white;
  padding: var(--space-6);
  
  .header-content {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    
    .header-icon {
      flex-shrink: 0;
    }
    
    .header-text {
      flex: 1;
      
      .dialog-title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-1) 0;
        color: white;
      }
      
      .dialog-subtitle {
        font-size: var(--text-sm);
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        line-height: var(--leading-relaxed);
      }
    }
    
    .close-btn {
      color: white;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// Dialog content
.dialog-content {
  padding: var(--space-6);
  max-height: 70vh;
  overflow-y: auto;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    
    .form-label {
      font-size: var(--text-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }
  }
  
  .stock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }
  
  // Enhanced input styling
  .input-modern {
    :deep(.q-field__control) {
      border-radius: var(--radius-lg);
      min-height: 56px;
      transition: all var(--transition-base);
    }
    
    :deep(.q-field--outlined .q-field__control:before) {
      border-color: var(--neutral-300);
    }
    
    :deep(.q-field--focused .q-field__control:before) {
      border-color: var(--brand-primary);
      border-width: 2px;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    :deep(.q-field--error .q-field__control:before) {
      border-color: var(--brand-danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    :deep(.q-field__label) {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-600);
    }
    
    :deep(.q-field__prepend) {
      color: var(--neutral-500);
    }
    
    .input-unit {
      font-size: var(--text-xs);
      color: var(--neutral-500);
      font-weight: var(--font-weight-medium);
    }
  }
  
  // Status preview
  .status-preview {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    
    .preview-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .preview-label {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--neutral-700);
      }
      
      .preview-warning {
        font-size: var(--text-sm);
        color: var(--brand-info);
      }
    }
  }
}

// Dialog actions
.dialog-actions {
  padding: var(--space-6);
  background: var(--neutral-50);
  
  .actions-content {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    
    .cancel-btn {
      border: 1px solid var(--neutral-300);
      color: var(--neutral-600);
      
      &:hover {
        background-color: var(--neutral-100);
        border-color: var(--neutral-400);
      }
    }
    
    .save-btn {
      min-width: 120px;
      font-weight: var(--font-weight-semibold);
      box-shadow: var(--shadow-sm);
      
      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }
    }
  }
}

// Dark mode adjustments
body.body--dark {
  .dialog-header {
    background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark));
  }
  
  .input-modern {
    :deep(.q-field__control) {
      background: var(--neutral-200);
    }
    
    :deep(.q-field--outlined .q-field__control:before) {
      border-color: var(--neutral-600);
    }
    
    :deep(.q-field__label) {
      color: var(--neutral-400);
    }
    
    :deep(.q-field__prepend) {
      color: var(--neutral-400);
    }
    
    .input-unit {
      color: var(--neutral-400);
    }
  }
  
  .form-label {
    color: var(--neutral-900);
  }
  
  .dialog-actions {
    background: var(--neutral-200);
    
    .cancel-btn {
      border-color: var(--neutral-600);
      color: var(--neutral-300);
      
      &:hover {
        background-color: var(--neutral-300);
      }
    }
  }
  
  .status-preview {
    .preview-label {
      color: var(--neutral-300);
    }
    
    .preview-warning {
      color: var(--brand-info-light);
    }
  }
}

// Responsive design
@media (max-width: 599px) {
  .dialog-card {
    margin: var(--space-2);
    max-width: none;
    width: calc(100vw - 32px);
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding: var(--space-4);
  }
  
  .stock-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-content {
    flex-direction: column;
    
    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
}

// Accessibility enhancements
.dialog-card:focus-within {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

// Loading state
.save-btn:has(.q-spinner) {
  pointer-events: none;
  
  :deep(.q-btn__content) {
    opacity: 0.7;
  }
}

// Focus states for inputs
.input-modern:focus-within {
  :deep(.q-field__control) {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }
}

// Screen reader only content
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

// Button focus styles
.close-btn:focus,
.cancel-btn:focus,
.save-btn:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
</style> 