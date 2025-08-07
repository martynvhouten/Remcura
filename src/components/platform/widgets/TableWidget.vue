<template>
  <BaseDashboardWidget :hide-header="true">
    <q-table
      :rows="data.rows || []"
      :columns="columns"
      row-key="index"
      flat
      :pagination="pagination"
      :loading="loading"
      class="platform-table"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-gutter-sm">
          <q-icon size="2em" name="info" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
    </q-table>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BaseDashboardWidget } from '@/components/cards';

  const { t } = useI18n();

  // Props
  interface Props {
    data: {
      headers?: string[];
      rows?: any[][];
      columns?: any[];
    };
  }

  const props = defineProps<Props>();

  // Reactive state
  const loading = ref(false);

  // Computed
  const columns = computed(() => {
    if (props.data.columns) {
      return props.data.columns;
    }

    if (props.data.headers) {
      return props.data.headers.map((header, index) => ({
        name: `col_${index}`,
        label: header,
        field: (row: any[]) => row[index],
        align: 'left' as const,
        sortable: true,
      }));
    }

    return [];
  });

  const pagination = ref({
    rowsPerPage: 10,
  });
</script>

<style lang="scss" scoped>
  // Platform table widget content styling (wrapper now handled by BaseDashboardWidget)

  .platform-table {
    /* Table styling now handled by global medical-table class */
  }
</style>
