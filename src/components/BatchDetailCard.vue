<template>
  <q-card class="batch-detail-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ $t("batch.batchDetails") }}</div>
      <q-space />
      <q-btn icon="close" flat round dense @click="$emit('close')" />
    </q-card-section>

    <q-card-section>
      <!-- Batch Header Info -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.batchInformation") }}
            </div>
            <div class="row q-gutter-sm">
              <div class="col-12">
                <q-chip
                  icon="qr_code"
                  color="primary"
                  text-color="white"
                  size="md"
                >
                  {{ batch.batchNumber }}
                </q-chip>
                <q-chip
                  v-if="batch.supplierBatchNumber"
                  icon="business"
                  color="grey"
                  text-color="white"
                  size="sm"
                  class="q-ml-sm"
                >
                  {{ batch.supplierBatchNumber }}
                </q-chip>
              </div>
              <div class="col-12">
                <div class="text-weight-medium">{{ batch.productName }}</div>
                <div class="text-caption text-grey">{{ batch.productSku }}</div>
              </div>
              <div class="col-12">
                <q-chip
                  :color="getLocationColor(batch.locationType)"
                  text-color="white"
                  icon="location_on"
                  size="sm"
                >
                  {{ batch.locationName }}
                </q-chip>
              </div>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.quantityStatus") }}
            </div>
            <div class="row q-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey">
                  {{ $t("batch.initialQuantity") }}
                </div>
                <div class="text-h6">
                  {{ formatQuantity(batch.initialQuantity) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">
                  {{ $t("batch.currentQuantity") }}
                </div>
                <div class="text-h6">
                  {{ formatQuantity(batch.currentQuantity) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">
                  {{ $t("batch.availableQuantity") }}
                </div>
                <div class="text-h6 text-green">
                  {{ formatQuantity(batch.availableQuantity) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">
                  {{ $t("batch.reservedQuantity") }}
                </div>
                <div class="text-h6 text-orange">
                  {{ formatQuantity(batch.reservedQuantity || 0) }}
                </div>
              </div>
              <div class="col-12">
                <q-linear-progress
                  :value="batch.currentQuantity / batch.initialQuantity"
                  size="8px"
                  :color="
                    getQuantityColor(
                      batch.currentQuantity / batch.initialQuantity
                    )
                  "
                  class="q-mt-sm"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Expiry and Status -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.expiryInformation") }}
            </div>
            <div class="row items-center q-gutter-sm">
              <q-icon
                :name="getExpiryIcon(batch.urgencyLevel)"
                :color="getExpiryColor(batch.urgencyLevel)"
                size="24px"
              />
              <div>
                <div class="text-weight-medium">
                  {{ formatDate(batch.expiryDate) }}
                </div>
                <div
                  class="text-caption"
                  :class="getExpiryTextClass(batch.urgencyLevel)"
                >
                  {{ getExpiryText(batch.daysUntilExpiry, batch.urgencyLevel) }}
                </div>
              </div>
            </div>
            <div class="q-mt-sm">
              <div class="text-caption text-grey">
                {{ $t("batch.receivedDate") }}
              </div>
              <div>{{ formatDate(batch.receivedDate) }}</div>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.statusInformation") }}
            </div>
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-chip
                :color="getStatusColor(batch.status)"
                text-color="white"
                size="md"
              >
                {{ $t(`batch.status.${batch.status}`) }}
              </q-chip>
              <q-chip
                v-if="batch.qualityCheckPassed"
                color="green"
                text-color="white"
                icon="verified"
                size="sm"
              >
                {{ $t("batch.qualityApproved") }}
              </q-chip>
            </div>
            <div v-if="batch.quarantineUntil" class="q-mt-sm">
              <div class="text-caption text-grey">
                {{ $t("batch.quarantineUntil") }}
              </div>
              <div class="text-orange">
                {{ formatDate(batch.quarantineUntil) }}
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Cost Information -->
      <div class="row q-gutter-md q-mb-lg" v-if="batch.unitCost">
        <div class="col-12">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.costInformation") }}
            </div>
            <div class="row q-gutter-md">
              <div class="col-4">
                <div class="text-caption text-grey">
                  {{ $t("batch.unitCost") }}
                </div>
                <div class="text-h6">
                  {{ formatCurrency(batch.unitCost, batch.currency) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey">
                  {{ $t("batch.totalCost") }}
                </div>
                <div class="text-h6">
                  {{ formatCurrency(batch.totalCost, batch.currency) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey">
                  {{ $t("batch.currentValue") }}
                </div>
                <div class="text-h6">
                  {{
                    formatCurrency(
                      batch.currentQuantity * batch.unitCost,
                      batch.currency
                    )
                  }}
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Purchase Information -->
      <div
        class="row q-gutter-md q-mb-lg"
        v-if="batch.purchaseOrderNumber || batch.invoiceNumber"
      >
        <div class="col-12">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.purchaseInformation") }}
            </div>
            <div class="row q-gutter-md">
              <div class="col-6" v-if="batch.purchaseOrderNumber">
                <div class="text-caption text-grey">
                  {{ $t("batch.purchaseOrderNumber") }}
                </div>
                <div>{{ batch.purchaseOrderNumber }}</div>
              </div>
              <div class="col-6" v-if="batch.invoiceNumber">
                <div class="text-caption text-grey">
                  {{ $t("batch.invoiceNumber") }}
                </div>
                <div>{{ batch.invoiceNumber }}</div>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Quality Notes -->
      <div class="row q-gutter-md q-mb-lg" v-if="batch.qualityNotes">
        <div class="col-12">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 text-grey q-mb-sm">
              {{ $t("batch.qualityNotes") }}
            </div>
            <div class="text-body2">{{ batch.qualityNotes }}</div>
          </q-card>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row q-gutter-sm">
        <q-btn
          v-if="batch.status === 'active' && batch.availableQuantity > 0"
          color="green"
          icon="move_down"
          :label="$t('batch.useBatch')"
          @click="$emit('use-batch', batch)"
        />

        <q-btn
          v-if="batch.status === 'active'"
          color="orange"
          icon="block"
          :label="$t('batch.quarantine')"
          @click="quarantineBatch"
        />

        <q-btn
          color="primary"
          icon="edit"
          :label="$t('common.edit')"
          @click="editMode = !editMode"
        />

        <q-space />

        <q-btn
          color="grey"
          flat
          :label="$t('common.close')"
          @click="$emit('close')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar, date } from "quasar";
import { useBatchStore } from "src/stores/batch";
import type { ProductBatchWithDetails } from "src/types/inventory";

// Props & Emits
interface Props {
  batch: ProductBatchWithDetails;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  updated: [];
  "use-batch": [batch: ProductBatchWithDetails];
}>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const batchStore = useBatchStore();

// State
const editMode = ref(false);

// Methods
const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, "DD/MM/YYYY");
};

const formatQuantity = (quantity: number) => {
  return quantity.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
};

const getLocationColor = (type: string) => {
  const colors = {
    storage: "blue",
    emergency: "red",
    treatment: "green",
    default: "grey",
  };
  return colors[type] || colors.default;
};

const getQuantityColor = (ratio: number) => {
  if (ratio > 0.5) return "green";
  if (ratio > 0.2) return "orange";
  return "red";
};

const getExpiryIcon = (urgency: string) => {
  const icons = {
    expired: "error",
    critical: "warning",
    warning: "schedule",
    normal: "check_circle",
  };
  return icons[urgency] || "check_circle";
};

const getExpiryColor = (urgency: string) => {
  const colors = {
    expired: "red",
    critical: "deep-orange",
    warning: "amber",
    normal: "green",
  };
  return colors[urgency] || "green";
};

const getExpiryTextClass = (urgency: string) => {
  const classes = {
    expired: "text-red",
    critical: "text-deep-orange",
    warning: "text-amber-8",
    normal: "text-green",
  };
  return classes[urgency] || "text-green";
};

const getExpiryText = (days: number, urgency: string) => {
  if (urgency === "expired") {
    return t("batch.expiredDaysAgo", { days: Math.abs(days) });
  } else if (days === 0) {
    return t("batch.expiresToday");
  } else if (days === 1) {
    return t("batch.expiresTomorrow");
  } else {
    return t("batch.expiresInDays", { days });
  }
};

const getStatusColor = (status: string) => {
  const colors = {
    active: "green",
    expired: "red",
    depleted: "grey",
    recalled: "deep-orange",
    quarantine: "amber",
  };
  return colors[status] || "grey";
};

const quarantineBatch = async () => {
  try {
    await batchStore.updateBatch(props.batch.id, { status: "quarantine" });
    $q.notify({
      type: "positive",
      message: t("batch.quarantineSuccess"),
    });
    emit("updated");
  } catch (error) {
    $q.notify({
      type: "negative",
      message: t("errors.failed"),
    });
  }
};
</script>

<style scoped>
.batch-detail-card {
  min-width: 600px;
  max-width: 800px;
}

@media (max-width: 768px) {
  .batch-detail-card {
    min-width: 100%;
  }
}
</style>
