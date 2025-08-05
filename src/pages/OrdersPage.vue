<template>
  <PageLayout>
    <template #header>
      <PageTitle :title="$t('orders.title')" icon="assignment">
        <template #actions>
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="refreshOrders"
            :loading="loading"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            icon="file_download"
            :label="$t('common.export')"
            @click="showExportDialog = true"
            :loading="exporting"
            unelevated
            no-caps
            class="app-btn-secondary"
          />
          <q-btn
            icon="analytics"
            :label="$t('orders.analytics')"
            @click="showAnalytics = true"
            unelevated
            no-caps
            class="app-btn-info"
          />
          <q-btn
            icon="add"
            :label="$t('orders.createOrder')"
            @click="createNewOrder"
            unelevated
            no-caps
            class="app-btn-primary"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Modern FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="ordersFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="loading"
        collapsible
        class="orders-filter-panel"
      />
    </div>

    <!-- Orders Table -->
    <q-table
      :rows="filteredOrders"
      :columns="columns"
      :loading="loading"
      v-model:selected="selected"
      selection="multiple"
      row-key="id"
      :pagination="pagination"
      @update:pagination="onPaginationChange"
      @request="onRequest"
    >
      <template v-slot:top-right>
        <div class="row q-gutter-sm">
          <q-btn
            v-if="selected.length > 0"
            :label="$t('orders.bulkExport')"
            icon="download"
            color="secondary"
            @click="bulkExport"
          />
          <q-btn
            v-if="selected.length > 0"
            :label="$t('orders.bulkEmail')"
            icon="email"
            color="info"
            @click="bulkEmail"
          />
        </div>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="getStatusColor(props.value)"
            :text-color="getStatusTextColor(props.value)"
            :label="$t(`orders.status.${props.value}`)"
            size="sm"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-order_date="props">
        <q-td :props="props">
          {{ formatDate(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-total_amount="props">
        <q-td :props="props" class="text-right">
          {{ formatCurrency(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-expected_delivery_date="props">
        <q-td :props="props">
          {{ formatDate(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            size="sm"
            @click="viewOrder(props.row)"
          >
            <q-tooltip>{{ $t('orders.viewOrder') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="edit"
            size="sm"
            @click="editOrder(props.row)"
          >
            <q-tooltip>{{ $t('orders.editOrder') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="download"
            size="sm"
            @click="downloadOrder(props.row)"
          >
            <q-tooltip>{{ $t('orders.downloadOrder') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Export Dialog -->
    <FormDialog
      v-model="showExportDialog"
      :title="$t('orders.export.title')"
      icon="download"
      size="sm"
      :loading="exporting"
      :submit-button-text="$t('orders.export.export')"
      @submit="performExport"
      @cancel="showExportDialog = false"
    >
      <div class="q-gutter-md">
        <q-select
          v-model="exportFormat"
          :options="exportFormatOptions"
          :label="$t('orders.export.format')"
          outlined
          emit-value
          map-options
        />
        
        <q-input
          v-model="exportDateFrom"
          :label="$t('orders.export.dateFrom')"
          type="date"
          outlined
        />
        
        <q-input
          v-model="exportDateTo"
          :label="$t('orders.export.dateTo')"
          type="date"
          outlined
        />
      </div>
    </FormDialog>

    <!-- Analytics Dialog -->
    <q-dialog v-model="showAnalytics" maximized>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('orders.analytics.title') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="text-center">
            <q-icon name="assessment" size="xl" color="grey-5" />
            <div class="text-h6 q-mt-md">{{ $t('orders.analytics.comingSoon') }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" @click="showAnalytics = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageTitle from 'src/components/PageTitle.vue';
import PageLayout from 'src/components/PageLayout.vue';
import FilterPanel from 'src/components/filters/FilterPanel.vue';
import FormDialog from 'src/components/base/FormDialog.vue';
import { ordersFilterPreset } from '@/presets/filters/orders';
import { supabase } from 'src/services/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { FilterValues, FilterChangeEvent, FilterResetEvent } from '@/types/filters';

const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();

// Refs
const loading = ref(false);
const exporting = ref(false);
const selected = ref([]);
const showExportDialog = ref(false);
const showAnalytics = ref(false);

// New filter state for FilterPanel
const filterValues = ref<FilterValues>({});

// Export state
const exportFormat = ref('xlsx');
const exportDateFrom = ref('');
const exportDateTo = ref('');

// Data
const orders = ref<any[]>([]);

const pagination = ref({
  sortBy: 'order_date',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

// Filter event handlers
const handleFilterChange = (event: FilterChangeEvent) => {
  // Filter logic is handled by computed property
};

const handleFilterReset = (event: FilterResetEvent) => {
  filterValues.value = { ...ordersFilterPreset.defaultFilters };
};

const handleFilterClear = () => {
  filterValues.value = {};
};

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Apply status filter
  const status = filterValues.value.status;
  if (status) {
    filtered = filtered.filter(order => order.status === status);
  }

  // Apply supplier filter
  const supplier = filterValues.value.supplier;
  if (supplier) {
    filtered = filtered.filter(order => order.supplier_id === supplier);
  }

  // Apply date range filter
  const orderDateRange = filterValues.value.order_date_range;
  if (orderDateRange && orderDateRange.from) {
    const fromDate = new Date(orderDateRange.from);
    const toDate = orderDateRange.to ? new Date(orderDateRange.to) : new Date();
    
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= fromDate && orderDate <= toDate;
    });
  }

  // Apply amount range filter
  const amountRange = filterValues.value.amount_range;
  if (amountRange && (amountRange.min !== undefined || amountRange.max !== undefined)) {
    filtered = filtered.filter(order => {
      const amount = order.total_amount || 0;
          if (amountRange.min !== undefined && amount < amountRange.min) { return false; }
    if (amountRange.max !== undefined && amount > amountRange.max) { return false; }
      return true;
    });
  }

  // Apply expected delivery date range filter
  const deliveryDateRange = filterValues.value.expected_delivery_date_range;
  if (deliveryDateRange && deliveryDateRange.from) {
    const fromDate = new Date(deliveryDateRange.from);
    const toDate = deliveryDateRange.to ? new Date(deliveryDateRange.to) : new Date();
    
    filtered = filtered.filter(order => {
      if (!order.expected_delivery_date) { return false; }
      const deliveryDate = new Date(order.expected_delivery_date);
      return deliveryDate >= fromDate && deliveryDate <= toDate;
    });
  }

  return filtered;
});

// Button definitions
const exportBtn = computed(() => ({
  icon: 'download',
  label: t('orders.export.button'),
  color: 'secondary',
  unelevated: true,
  'no-caps': true,
}));

const analyticsBtn = computed(() => ({
  icon: 'analytics',
  label: t('orders.analytics.button'),
  color: 'info',
  unelevated: true,
  'no-caps': true,
}));

const createOrderBtn = computed(() => ({
  icon: 'add',
  label: t('orders.createOrder'),
  color: 'primary',
  unelevated: true,
  'no-caps': true,
}));

// Table columns
const columns = computed(() => [
  {
    name: 'id',
    label: t('orders.orderNumber'),
    field: 'id',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'supplier_name',
    label: t('orders.supplier'),
    field: 'supplier_name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'order_date',
    label: t('orders.orderDate'),
    field: 'order_date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: t('orders.columns.status'),
    field: 'status',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'total_amount',
    label: t('orders.totalAmount'),
    field: 'total_amount',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'expected_delivery_date',
    label: t('orders.expectedDelivery'),
    field: 'expected_delivery_date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: t('orders.actions'),
    field: '',
    align: 'center' as const,
    sortable: false,
  },
]);

// Export format options
const exportFormatOptions = computed(() => [
  { label: t('exports.formats.excel'), value: 'xlsx' },
  { label: t('exports.formats.csv'), value: 'csv' },
  { label: t('exports.formats.pdf'), value: 'pdf' },
]);

// Helper functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'grey';
    case 'submitted':
      return 'info';
    case 'confirmed':
      return 'positive';
    case 'shipped':
      return 'purple';
    case 'delivered':
      return 'green';
    case 'cancelled':
      return 'negative';
    default:
      return 'grey';
  }
};

const getStatusTextColor = (status: string): string => {
  return 'white';
};

const formatDate = (dateString: string): string => {
      if (!dateString) { return '-'; }
  return date.formatDate(dateString, 'DD/MM/YYYY');
};

const formatCurrency = (amount: number): string => {
      if (!amount) { return '€0,00'; }
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Methods
const loadOrders = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        supplier:suppliers(name)
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;

    orders.value = (data || []).map(order => ({
      ...order,
      supplier_name: order.supplier?.name || 'Unknown',
    }));
  } catch (error: any) {
    console.error('Failed to load orders:', error);
    $q.notify({
      type: 'negative',
      message: t('orders.loadError'),
    });
  } finally {
    loading.value = false;
  }
};

const createNewOrder = () => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
  });
};

const viewOrder = (order: any) => {
  $q.notify({
    type: 'info',
    message: t('orders.viewOrderNotImplemented'),
  });
};

const editOrder = (order: any) => {
  $q.notify({
    type: 'info',
    message: t('orders.editOrderNotImplemented'),
  });
};

const downloadOrder = (order: any) => {
  $q.notify({
    type: 'info',
    message: t('orders.downloadOrderNotImplemented'),
  });
};

const bulkExport = () => {
  $q.notify({
    type: 'info',
    message: t('orders.bulkExportNotImplemented'),
  });
};

const bulkEmail = () => {
  $q.notify({
    type: 'info',
    message: t('orders.bulkEmailNotImplemented'),
  });
};

const performExport = async () => {
  try {
    exporting.value = true;
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    $q.notify({
      type: 'positive',
      message: t('orders.export.exportSuccess'),
    });
    
    showExportDialog.value = false;
  } catch (error: any) {
    console.error('Export failed:', error);
    $q.notify({
      type: 'negative',
      message: t('orders.export.exportError'),
    });
  } finally {
    exporting.value = false;
  }
};

const onPaginationChange = (newPagination: any) => {
  pagination.value = newPagination;
};

const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
};

// Lifecycle
onMounted(async () => {
  await loadOrders();
  
  // Initialize filter values with defaults
  if (ordersFilterPreset.defaultFilters) {
    filterValues.value = { ...ordersFilterPreset.defaultFilters };
  }
});
</script>

<style lang="scss" scoped>
.filters-section {
  .orders-filter-panel {
    // Custom styling for the FilterPanel in orders page
  }
}
</style>
