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

    <!-- FilterPanel component -->
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
    <div class="medical-table no-top-content">
      <q-table
        :rows="filteredOrders"
        :columns="columns"
        :loading="loading"
        v-model:selected="selected"
        selection="multiple"
        row-key="id"
        :pagination="{ rowsPerPage: 25 }"
        flat
        bordered
        separator="cell"
      >
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
    </div>

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
            <div class="text-h6 q-mt-md">
              {{ $t('orders.analytics.comingSoon') }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.close')"
            @click="showAnalytics = false"
          />
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

  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from '@/types/filters';

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

  // Filter event handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // Filter logic is handled by computed property
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    filterValues.value = {
      ...(ordersFilterPreset.defaultFilters as FilterValues),
    };
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
    if (
      orderDateRange &&
      typeof orderDateRange === 'object' &&
      'from' in orderDateRange
    ) {
      const fromDate = new Date(
        (orderDateRange as { from?: Date; to?: Date }).from ?? new Date()
      );
      const toDate = (orderDateRange as { from?: Date; to?: Date }).to
        ? new Date((orderDateRange as { from?: Date; to?: Date }).to!)
        : new Date();

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    // Apply amount range filter
    const amountRange = filterValues.value.amount_range;
    if (
      amountRange &&
      typeof amountRange === 'object' &&
      ('min' in amountRange || 'max' in amountRange)
    ) {
      filtered = filtered.filter(order => {
        const amount = order.total_amount || 0;
        const range = amountRange as { min?: number; max?: number };
        if (range.min !== undefined && amount < range.min) {
          return false;
        }
        if (range.max !== undefined && amount > range.max) {
          return false;
        }
        return true;
      });
    }

    // Apply expected delivery date range filter
    const deliveryDateRange = filterValues.value.expected_delivery_date_range;
    if (
      deliveryDateRange &&
      typeof deliveryDateRange === 'object' &&
      'from' in deliveryDateRange
    ) {
      const fromDate = new Date(
        (deliveryDateRange as { from?: Date; to?: Date }).from ?? new Date()
      );
      const toDate = (deliveryDateRange as { from?: Date; to?: Date }).to
        ? new Date((deliveryDateRange as { from?: Date; to?: Date }).to!)
        : new Date();

      filtered = filtered.filter(order => {
        if (!order.expected_delivery_date) {
          return false;
        }
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

  // Table columns with enhanced configuration
  const columns = computed(() => [
    {
      name: 'order_number',
      label: t('orders.orderNumber'),
      field: 'order_number',
      align: 'left' as const,
      sortable: true,
    },
    {
      name: 'supplier_name',
      label: t('orders.supplier'),
      field: 'supplier_name',
      align: 'left' as const,
      sortable: true,
      classes: 'col-name',
      headerClasses: 'col-name',
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
      classes: 'col-status',
      headerClasses: 'col-status',
    },
    {
      name: 'total_amount',
      label: t('orders.totalAmount'),
      field: 'total_amount',
      align: 'right' as const,
      sortable: true,
      classes: 'col-numeric',
      headerClasses: 'col-numeric',
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
      classes: 'col-actions',
      headerClasses: 'col-actions',
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
    if (!dateString) {
      return '-';
    }
    return date.formatDate(dateString, 'DD/MM/YYYY');
  };

  const formatCurrency = (amount: number): string => {
    if (!amount) {
      return '€0,00';
    }
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Methods
  const refreshOrders = async () => {
    await loadOrders();
  };

  const loadOrders = async () => {
    try {
      loading.value = true;
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
        *,
        supplier:suppliers(name)
      `
        )
        .order('order_date', { ascending: false });

      if (error) throw error;

      orders.value = (data || []).map((order, index) => ({
        ...order,
        supplier_name: order.supplier?.name || 'Unknown',
        order_number:
          order.order_number || `ORD-${String(index + 1).padStart(4, '0')}`,
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

  // onTableRequest is now provided by useTableSorting composable

  // Lifecycle
  onMounted(async () => {
    await loadOrders();

    // Initialize filter values with defaults
    if (ordersFilterPreset.defaultFilters) {
      filterValues.value = { ...ordersFilterPreset.defaultFilters } as FilterValues;
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
