<template>
  <q-card class="batch-registration-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ $t("batch.registerNewBatch") }}</div>
      <q-space />
      <q-btn
        v-if="!embedded"
        icon="close"
        flat
        round
        dense
        @click="$emit('close')"
      />
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Product Selection -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.productId"
              :options="productOptions"
              option-value="id"
              option-label="name"
              :label="$t('product.product')"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :loading="loadingProducts"
              @filter="filterProducts"
              :rules="[(val) => !!val || $t('validation.required')]"
              emit-value
              map-options
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.sku }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Location Selection -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.locationId"
              :options="locationOptions"
              option-value="id"
              option-label="name"
              :label="$t('location.location')"
              :rules="[(val) => !!val || $t('validation.required')]"
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Batch Information -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.batchNumber"
              :label="$t('batch.batchNumber')"
              :rules="[
                (val) => !!val || $t('validation.required'),
                (val) =>
                  val.length >= 3 || $t('validation.minLength', { min: 3 }),
              ]"
              counter
              maxlength="100"
            >
              <template v-slot:prepend>
                <q-icon name="qr_code_scanner" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.supplierBatchNumber"
              :label="$t('batch.supplierBatchNumber')"
              counter
              maxlength="100"
            >
              <template v-slot:prepend>
                <q-icon name="business" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Dates -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.expiryDate"
              :label="$t('batch.expiryDate')"
              type="date"
              :rules="[
                (val) => !!val || $t('validation.required'),
                (val) => validateExpiryDate(val),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="form.receivedDate"
              :label="$t('batch.receivedDate')"
              type="date"
              :rules="[(val) => !!val || $t('validation.required')]"
            >
              <template v-slot:prepend>
                <q-icon name="inbox" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Quantities -->
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model.number="form.initialQuantity"
              :label="$t('batch.initialQuantity')"
              type="number"
              step="0.001"
              min="0"
              :rules="[
                (val) =>
                  (val !== null && val !== undefined) ||
                  $t('validation.required'),
                (val) => val > 0 || $t('validation.mustBePositive'),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="inventory" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model.number="form.unitCost"
              :label="$t('batch.unitCost')"
              type="number"
              step="0.01"
              min="0"
              :suffix="form.currency"
            >
              <template v-slot:prepend>
                <q-icon name="euro" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.currency"
              :options="currencyOptions"
              :label="$t('batch.currency')"
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="row q-gutter-sm q-mt-lg">
          <q-btn
            :label="$t('common.cancel')"
            color="grey"
            flat
            @click="resetForm"
            :disable="loading"
          />
          <q-space />
          <q-btn
            :label="$t('batch.registerBatch')"
            color="primary"
            type="submit"
            :loading="loading"
            icon="add_circle"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useBatchStore } from "src/stores/batch";
import type { CreateBatchRequest } from "src/types/inventory";

// Props & Emits
interface Props {
  embedded?: boolean;
  prefilledProductId?: string;
  prefilledLocationId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
});

const emit = defineEmits<{
  close: [];
  success: [batch: any];
}>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const batchStore = useBatchStore();

// State
const loading = ref(false);
const loadingProducts = ref(false);
const productOptions = ref<any[]>([]);

// Form data
const form = ref<CreateBatchRequest>({
  productId: props.prefilledProductId || "",
  locationId: props.prefilledLocationId || "",
  batchNumber: "",
  supplierBatchNumber: "",
  expiryDate: "",
  receivedDate: new Date().toISOString().split("T")[0],
  initialQuantity: 0,
  unitCost: 0,
  currency: "EUR",
  purchaseOrderNumber: "",
  invoiceNumber: "",
  qualityCheckPassed: true,
  qualityNotes: "",
  quarantineUntil: "",
});

// Computed
const locationOptions = computed(() => [
  { id: "1", name: t("location.sampleData.mainWarehouse.name") },
  { id: "2", name: t("location.samples.emergencyStock") },
  { id: "3", name: t("location.sampleData.treatmentRoom.name") },
]);

const currencyOptions = computed(() => [
  { label: "EUR (€)", value: "EUR" },
  { label: "USD ($)", value: "USD" },
  { label: "GBP (£)", value: "GBP" },
]);

// Methods
const validateExpiryDate = (value: string) => {
  if (!value) return t("validation.required");

  const expiryDate = new Date(value);
  const today = new Date();

  if (expiryDate < today) {
    return t("batch.validation.expiryDateInPast");
  }

  return true;
};

const filterProducts = (val: string, update: Function) => {
  // Product filtering logic
  update(() => {
    productOptions.value = [];
  });
};

const resetForm = () => {
  form.value = {
    productId: props.prefilledProductId || "",
    locationId: props.prefilledLocationId || "",
    batchNumber: "",
    supplierBatchNumber: "",
    expiryDate: "",
    receivedDate: new Date().toISOString().split("T")[0],
    initialQuantity: 0,
    unitCost: 0,
    currency: "EUR",
    purchaseOrderNumber: "",
    invoiceNumber: "",
    qualityCheckPassed: true,
    qualityNotes: "",
    quarantineUntil: "",
  };
};

const onSubmit = async () => {
  try {
    loading.value = true;

    const batchData: CreateBatchRequest = {
      ...form.value,
      currentQuantity: form.value.initialQuantity,
    };

    const newBatch = await batchStore.createBatch(batchData);

    $q.notify({
      type: "positive",
      message: t("batch.batchRegisteredSuccessfully"),
    });

    emit("success", newBatch);

    if (!props.embedded) {
      emit("close");
    } else {
      resetForm();
    }
  } catch (error) {
    console.error(t("errors.failedToRegisterBatch"), error);
    $q.notify({
      type: "negative",
      message: t("errors.failedToRegisterBatch"),
    });
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // Load initial data
});
</script>

<style scoped>
.batch-registration-card {
  min-width: 600px;
  max-width: 900px;
}

@media (max-width: 768px) {
  .batch-registration-card {
    min-width: 100%;
  }
}
</style>
