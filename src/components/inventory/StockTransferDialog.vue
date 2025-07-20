<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="$t('inventory.transferStock')"
    icon="swap_horiz"
    max-width="500px"
    @hide="onHide"
  >
    <q-form @submit="onSubmit" class="transfer-form">
      <!-- From Location -->
      <q-select
        v-model="form.fromLocationId"
        :options="fromLocationOptions"
        :label="$t('inventory.fromLocation')"
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

      <!-- To Location -->
      <q-select
        v-model="form.toLocationId"
        :options="toLocationOptions"
        :label="$t('inventory.toLocation')"
        emit-value
        map-options
        outlined
        required
        :rules="[
          (val) => !!val || $t('validation.required'),
          (val) =>
            val !== form.fromLocationId ||
            $t('inventory.locationsMustBeDifferent'),
        ]"
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

      <!-- Transfer Quantity -->
      <q-input
        v-model.number="form.quantity"
        type="number"
        :label="$t('inventory.transferQuantity')"
        :placeholder="$t('inventory.enterQuantity')"
        outlined
        required
        min="1"
        :rules="[(val) => val > 0 || $t('validation.positiveNumber')]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="edit" />
        </template>
      </q-input>

      <!-- Notes -->
      <q-input
        v-model="form.notes"
        :label="$t('common.notes')"
        :placeholder="$t('inventory.transferNotesPlaceholder')"
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
        :label="$t('inventory.transferStock')"
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
import type { PracticeLocation } from 'src/types/inventory';
import BaseDialog from 'src/components/base/BaseDialog.vue';

interface Props {
  modelValue: boolean;
  locations: PracticeLocation[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'transfer-completed'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();

// State
const loading = ref(false);
const productSearch = ref('');
const form = ref({
  fromLocationId: '',
  toLocationId: '',
  quantity: null as number | null,
  notes: '',
});

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const fromLocationOptions = computed(() =>
  props.locations.map((location) => ({
    label: location.name,
    value: location.id,
  }))
);

const toLocationOptions = computed(() =>
  props.locations
    .filter((location) => location.id !== form.value.fromLocationId)
    .map((location) => ({
      label: location.name,
      value: location.id,
    }))
);

// Methods
const resetForm = () => {
  form.value = {
    fromLocationId: props.locations[0]?.id || '',
    toLocationId: '',
    quantity: null,
    notes: '',
  };
  productSearch.value = '';
};

const onSubmit = async () => {
  loading.value = true;
  try {
    // Simulate transfer
    await new Promise((resolve) => setTimeout(resolve, 1000));

    $q.notify({
      type: 'positive',
      message: t('inventory.stockTransferred'),
      position: 'top',
    });

    emit('transfer-completed');
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('inventory.transferFailed'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const onCancel = () => {
  dialogVisible.value = false;
};

const onHide = () => {
  resetForm();
};
</script>

<style lang="scss" scoped>
.transfer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.form-field {
  width: 100%;
}
</style>
