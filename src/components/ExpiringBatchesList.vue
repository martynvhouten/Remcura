<template>
  <div class="expiring-batches-list">
    <div class="medical-table">
      <q-table
        :rows="batches"
        :columns="columns as any"
        row-key="batchId"
        :no-data-label="$t('batch.noExpiringBatches')"
        flat
        bordered
        separator="cell"
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
              <q-tooltip>{{ $t('common.view') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { ExpiringBatch } from 'src/types/inventory';

  interface Props {
    batches: ExpiringBatch[];
  }

  defineProps<Props>();
  defineEmits<{
    'batch-selected': [batch: ExpiringBatch];
  }>();

  const { t } = useI18n();

  const columns = computed(() => [
    {
      name: 'productName',
      label: t('product.product'),
      field: 'productName',
      align: 'left' as const,
    },
    {
      name: 'batchNumber',
      label: t('batch.batchNumber'),
      field: 'batchNumber',
      align: 'left' as const,
    },
    {
      name: 'locationName',
      label: t('location.location'),
      field: 'locationName',
      align: 'left' as const,
    },
    {
      name: 'currentQuantity',
      label: t('inventory.quantity'),
      field: 'currentQuantity',
      align: 'right' as const,
    },
    {
      name: 'daysUntilExpiry',
      label: t('batch.daysUntilExpiry'),
      field: 'daysUntilExpiry',
      align: 'center' as const,
    },
    {
      name: 'urgency',
      label: t('batch.urgencyLevel'),
      field: 'urgencyLevel',
      align: 'center' as const,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
    },
  ]);

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      expired: 'red',
      critical: 'deep-orange',
      warning: 'amber',
      normal: 'green',
    };
    return colors[urgency] || 'grey';
  };
</script>

<style scoped>
  .expiring-batches-list {
    padding: 16px;
  }
</style>
