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
        :rules="[val => !!val || $t('validation.required')]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="place" />
        </template>
      </q-select>

      <!-- Product Search -->
      <q-input
        v-model="productSearch"
        :label="$t('inventory.searchProduct')"
        :placeholder="$t('inventory.searchProductPlaceholder')"
        outlined
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Quantity Change -->
      <q-input
        v-model.number="form.quantityChange"
        type="number"
        :label="$t('inventory.quantityChange')"
        :placeholder="$t('inventory.quantityChangePlaceholder')"
        outlined
        required
        :rules="[
          val => val !== null && val !== undefined || $t('validation.required'),
          val => val !== 0 || $t('inventory.quantityMustNotBeZero')
        ]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="edit" />
        </template>
        <template v-slot:hint>
          {{ $t('inventory.quantityChangeHint') }}
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
      <q-btn
        flat
        :label="$t('common.cancel')"
        @click="onCancel"
      />
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type { PracticeLocation } from 'src/types/inventory'
import BaseDialog from 'src/components/base/BaseDialog.vue'

interface Props {
  modelValue: boolean
  locations: PracticeLocation[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'adjustment-made'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const $q = useQuasar()

// State
const loading = ref(false)
const productSearch = ref('')
const form = ref({
  locationId: '',
  quantityChange: null as number | null,
  notes: ''
})

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const locationOptions = computed(() => 
  props.locations.map(location => ({
    label: location.name,
    value: location.id
  }))
)

// Methods
const resetForm = () => {
  form.value = {
    locationId: props.locations[0]?.id || '',
    quantityChange: null,
    notes: ''
  }
  productSearch.value = ''
}

const onSubmit = async () => {
  loading.value = true
  try {
    // Simulate adjustment
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    $q.notify({
      type: 'positive',
      message: t('inventory.stockAdjusted'),
      position: 'top'
    })

    emit('adjustment-made')
    dialogVisible.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('inventory.adjustmentFailed'),
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  dialogVisible.value = false
}

const onHide = () => {
  resetForm()
}
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