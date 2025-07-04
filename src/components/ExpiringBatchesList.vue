<template>
  <div class="expiring-batches-list">
    <q-table
      :rows="batches"
      :columns="columns"
      row-key="batchId"
      :no-data-label="$t('batch.noExpiringBatches')"
    >
      <template v-slot:body-cell-urgency="props">
        <q-td :props="props">
          <q-chip
            :color="getUrgencyColor(props.row.urgencyLevel)"
            text-color="white"
            size="sm"
          >
            {{ $t(`batch.urgency.${props.row.urgencyLevel}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="visibility"
            size="sm"
            flat
            round
            color="primary"
            @click="$emit('batch-selected', props.row)"
          >
            <q-tooltip>{{ $t("common.view") }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ExpiringBatch } from "src/types/inventory";

interface Props {
  batches: ExpiringBatch[];
}

defineProps<Props>();
defineEmits<{
  "batch-selected": [batch: ExpiringBatch];
}>();

const { t } = useI18n();

const columns = computed(() => [
  {
    name: "productName",
    label: t("product.product"),
    field: "productName",
    align: "left",
  },
  {
    name: "batchNumber",
    label: t("batch.batchNumber"),
    field: "batchNumber",
    align: "left",
  },
  {
    name: "locationName",
    label: t("location.location"),
    field: "locationName",
    align: "left",
  },
  {
    name: "currentQuantity",
    label: t("inventory.quantity"),
    field: "currentQuantity",
    align: "right",
  },
  {
    name: "daysUntilExpiry",
    label: t("batch.daysUntilExpiry"),
    field: "daysUntilExpiry",
    align: "center",
  },
  {
    name: "urgency",
    label: t("batch.urgencyLevel"),
    field: "urgencyLevel",
    align: "center",
  },
  {
    name: "actions",
    label: t("common.actions"),
    align: "center",
  },
]);

const getUrgencyColor = (urgency: string) => {
  const colors = {
    expired: "red",
    critical: "deep-orange",
    warning: "amber",
    normal: "green",
  };
  return colors[urgency] || "grey";
};
</script>

<style scoped>
.expiring-batches-list {
  padding: 16px;
}
</style>
