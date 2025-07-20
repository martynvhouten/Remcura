<template>
  <PageLayout>
    <template #header>
      <PageTitle :title="$t('orders.title')" icon="assignment">
        <template #actions>
          <q-btn-group>
            <q-btn
              v-bind="exportBtn"
              :loading="exporting"
              @click="showExportDialog = true"
            />
            <q-btn v-bind="analyticsBtn" @click="showAnalytics = true" />
            <q-btn v-bind="createOrderBtn" @click="createNewOrder" />
          </q-btn-group>
        </template>
      </PageTitle>
    </template>

    <!-- Filters -->
    <BaseCard
      variant="outlined"
      :title="$t('orders.filters.title')"
      icon="filter_list"
      header-color="info"
      size="sm"
    >
      <div class="row q-gutter-md">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          :label="$t('orders.filters.status')"
          clearable
          emit-value
          map-options
          style="min-width: 150px"
          outlined
          dense
        />
        <q-select
          v-model="filters.supplier"
          :options="supplierOptions"
          :label="$t('orders.filters.supplier')"
          clearable
          emit-value
          map-options
          style="min-width: 200px"
          outlined
          dense
        />
        <q-input
          v-model="filters.dateFrom"
          :label="$t('orders.filters.dateFrom')"
          type="date"
          outlined
          dense
          style="min-width: 150px"
        />
        <q-input
          v-model="filters.dateTo"
          :label="$t('orders.filters.dateTo')"
          type="date"
          outlined
          dense
          style="min-width: 150px"
        />
      </div>

      <template #actions>
        <q-btn v-bind="filterBtn" @click="applyFilters" />
        <q-btn v-bind="resetBtn" @click="resetFilters" />
      </template>
    </BaseCard>

    <!-- Orders Table -->
    <q-table
      :rows="orders"
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
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.value)"
            text-color="white"
            size="sm"
          >
            {{ $t(`orders.status.${props.value}`) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-total="props">
        <q-td :props="props"> €{{ (props.value || 0).toFixed(2) }} </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group dense>
            <q-btn icon="visibility" dense flat @click="viewOrder(props.row)" />
            <q-btn icon="edit" dense flat @click="editOrder(props.row)" />
            <q-btn-dropdown icon="more_vert" size="sm" flat auto-close>
              <q-list>
                <q-item clickable @click="downloadOrderPDF(props.row)">
                  <q-item-section avatar>
                    <q-icon name="picture_as_pdf" />
                  </q-item-section>
                  <q-item-section>{{
                    $t('orders.downloadPDF')
                  }}</q-item-section>
                </q-item>
                <q-item clickable @click="downloadOrderCSV(props.row)">
                  <q-item-section avatar>
                    <q-icon name="table_chart" />
                  </q-item-section>
                  <q-item-section>{{
                    $t('orders.downloadCSV')
                  }}</q-item-section>
                </q-item>
                <q-item clickable @click="emailOrder(props.row)">
                  <q-item-section avatar>
                    <q-icon name="email" />
                  </q-item-section>
                  <q-item-section>{{ $t('orders.sendEmail') }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="submitToMagento(props.row)">
                  <q-item-section avatar>
                    <q-icon name="cloud_upload" />
                  </q-item-section>
                  <q-item-section>{{
                    $t('orders.submitToMagento')
                  }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="duplicateOrder(props.row)">
                  <q-item-section avatar>
                    <q-icon name="content_copy" />
                  </q-item-section>
                  <q-item-section>{{ $t('orders.duplicate') }}</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="cancelOrder(props.row)"
                  v-if="props.row.status !== 'cancelled'"
                >
                  <q-item-section avatar>
                    <q-icon name="cancel" color="negative" />
                  </q-item-section>
                  <q-item-section>{{ $t('orders.cancel') }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Export Dialog -->
    <q-dialog v-model="showExportDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('orders.export') }}</div>
        </q-card-section>

        <q-card-section>
          <q-option-group
            v-model="exportFormat"
            :options="exportFormatOptions"
            color="primary"
          />

          <q-separator class="q-my-md" />

          <q-option-group
            v-model="exportScope"
            :options="exportScopeOptions"
            color="primary"
          />

          <div v-if="exportScope === 'filtered'" class="q-mt-md text-caption">
            {{ $t('orders.exportFilteredNote', { count: orders.length }) }}
          </div>

          <div v-if="exportScope === 'selected'" class="q-mt-md text-caption">
            {{ $t('orders.exportSelectedNote', { count: selected.length }) }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="$t('orders.export')"
            :loading="exporting"
            @click="performExport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Analytics Dialog -->
    <q-dialog v-model="showAnalytics" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('orders.analytics') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <!-- Analytics Summary Cards -->
            <div class="col-12 col-md-6 col-lg-3">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h4 text-primary">
                    {{ analyticsData.totalOrders }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('orders.analytics.totalOrders') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h4 text-positive">
                    €{{ (analyticsData.totalValue || 0).toFixed(2) }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('orders.analytics.totalValue') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h4 text-info">
                    {{ analyticsData.averageOrderSize }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('orders.analytics.avgOrderSize') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h4 text-warning">
                    {{ analyticsData.orderFrequency }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('orders.analytics.orderFrequency') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Charts would go here -->
          <div class="q-mt-lg">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">
                  {{ $t('orders.analytics.orderTrends') }}
                </div>
                <div class="q-pa-md text-center text-grey-6">
                  {{ $t('orders.analytics.chartsComingSoon') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Email Dialog -->
    <q-dialog v-model="showEmailDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('orders.sendEmail') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="emailData.recipient"
            :label="$t('orders.email.recipient')"
            type="email"
            outlined
            :rules="[val => !!val || $t('orders.emailRequired')]"
          />

          <q-input
            v-model="emailData.subject"
            :label="$t('orders.email.subject')"
            outlined
            class="q-mt-md"
          />

          <q-input
            v-model="emailData.message"
            :label="$t('orders.email.message')"
            type="textarea"
            outlined
            rows="4"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            color="primary"
            :label="$t('orders.email.send')"
            :loading="emailSending"
            @click="sendEmail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useButtons } from 'src/composables/useButtons';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import BaseCard from 'src/components/base/BaseCard.vue';
  import { orderProcessingService } from '@/services/orderProcessing';
  import { analyticsService } from '@/services/analytics';
  import { notificationService } from '@/services/notifications';
  import type { OrderWithItems, OrderStatus } from '@/types/supabase';

  // Composables
  const router = useRouter();
  const { t } = useI18n();
  const $q = useQuasar();
  const { quickActions, getThemeConfig } = useButtons();

  // Button configurations
  const exportBtn = computed(() =>
    getThemeConfig('secondary', {
      icon: 'file_download',
      label: t('orders.export'),
      variant: 'outline',
    })
  );

  const analyticsBtn = computed(() =>
    getThemeConfig('info', {
      icon: 'insights',
      label: t('orders.analytics'),
    })
  );

  const createOrderBtn = computed(() =>
    getThemeConfig('primary', {
      icon: 'shopping_cart_checkout',
      label: t('orders.createOrder'),
    })
  );

  const filterBtn = computed(() =>
    getThemeConfig('primary', {
      icon: 'filter_list',
      label: t('common.filter'),
    })
  );

  const resetBtn = computed(() =>
    getThemeConfig('secondary', {
      icon: 'clear',
      label: t('common.reset'),
      variant: 'flat',
    })
  );

  // State
  const orders = ref<OrderWithItems[]>([]);
  const loading = ref(false);
  const exporting = ref(false);
  const emailSending = ref(false);
  const selected = ref<OrderWithItems[]>([]);
  const showExportDialog = ref(false);
  const showAnalytics = ref(false);
  const showEmailDialog = ref(false);

  // Filters
  const filters = reactive({
    status: '',
    supplier: '',
    dateFrom: '',
    dateTo: '',
  });

  // Export options
  const exportFormat = ref<'csv' | 'pdf'>('csv');
  const exportScope = ref<'all' | 'filtered' | 'selected'>('filtered');

  // Email data
  const emailData = reactive({
    recipient: '',
    subject: '',
    message: '',
    orderId: '',
  });

  // Analytics data
  const analyticsData = reactive({
    totalOrders: 0,
    totalValue: 0,
    averageOrderSize: 0,
    orderFrequency: 0,
  });

  // Pagination
  const pagination = ref({
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
  });

  // Options
  const statusOptions = computed(() => [
    { label: t('orders.status.draft'), value: 'draft' },
    { label: t('orders.status.submitted'), value: 'submitted' },
    { label: t('orders.status.confirmed'), value: 'confirmed' },
    { label: t('orders.status.shipped'), value: 'shipped' },
    { label: t('orders.status.delivered'), value: 'delivered' },
    { label: t('orders.status.cancelled'), value: 'cancelled' },
  ]);

  const supplierOptions = computed(() => [
    // These would be loaded from the suppliers table
    { label: t('orders.filters.allSuppliers'), value: '' },
  ]);

  const exportFormatOptions = computed(() => [
    { label: t('orders.exportFormat.csv'), value: 'csv' },
    { label: t('orders.exportFormat.pdf'), value: 'pdf' },
  ]);

  const exportScopeOptions = computed(() => [
    { label: t('orders.exportScope.all'), value: 'all' },
    { label: t('orders.exportScope.filtered'), value: 'filtered' },
    {
      label: t('orders.exportScope.selected'),
      value: 'selected',
      disable: selected.value.length === 0,
    },
  ]);

  // Table columns
  const columns = computed(() => [
    {
      name: 'id',
      label: t('orders.table.orderNumber'),
      field: 'id',
      sortable: true,
      align: 'left' as const,
      style: 'width: 120px',
    },
    {
      name: 'supplier',
      label: t('orders.table.supplier'),
      field: (row: any) => row.supplier?.name || t('common.unknownSupplier'),
      align: 'left' as const,
      sortable: true,
      style: 'width: 200px',
    },
    {
      name: 'status',
      label: t('orders.table.status'),
      field: 'status',
      sortable: true,
      align: 'left' as const,
      style: 'width: 120px',
    },
    {
      name: 'total',
      label: t('orders.table.total'),
      field: 'total_amount',
      align: 'left' as const,
      sortable: true,
      style: 'width: 120px',
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center',
    },
  ]);

  // Methods
  const loadOrders = async () => {
    try {
      loading.value = true;

      const filterOptions = {
        status: filters.status ? filters.status : undefined,
        supplier_id: filters.supplier ? filters.supplier : undefined,
        date_from: filters.dateFrom ? filters.dateFrom : undefined,
        date_to: filters.dateTo ? filters.dateTo : undefined,
      };

      orders.value = await orderProcessingService.getOrders(filterOptions);
      pagination.value.rowsNumber = orders.value.length;

      // Track analytics
      analyticsService.trackEvent('orders_viewed', {
        count: orders.value.length,
        filters: filterOptions,
      });
    } catch (error: any) {
      console.error('Failed to load orders:', error);

      // Show user-friendly message for "No practice selected" error
      if (error.message === t('orders.noPracticeSelected')) {
        $q.notify({
          type: 'warning',
          message: t('orders.errors.noPracticeSelected'),
          position: 'top',
          timeout: 5000,
          actions: [
            {
              label: t('common.dismiss'),
              color: 'white',
            },
          ],
        });
      } else {
        $q.notify({
          type: 'negative',
          message: t('orders.errors.loadFailed'),
        });
      }
    } finally {
      loading.value = false;
    }
  };

  const loadAnalytics = async () => {
    try {
      const patterns = await analyticsService.getOrderPatterns();

      analyticsData.totalOrders = patterns.totalOrders;
      analyticsData.totalValue = orders.value.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      analyticsData.averageOrderSize = Math.round(patterns.averageOrderSize);
      analyticsData.orderFrequency =
        Math.round(patterns.orderFrequency * 10) / 10;
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const applyFilters = () => {
    loadOrders();
  };

  const resetFilters = () => {
    Object.assign(filters, {
      status: '',
      supplier: '',
      dateFrom: '',
      dateTo: '',
    });
    loadOrders();
  };

  const onPaginationChange = (newPagination: any) => {
    pagination.value = newPagination;
  };

  const onRequest = (props: any) => {
    // Handle server-side pagination if needed
    pagination.value = props.pagination;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      draft: 'grey',
      submitted: 'blue',
      confirmed: 'orange',
      shipped: 'purple',
      delivered: 'positive',
      cancelled: 'negative',
    };
    return colors[status] || 'grey';
  };

  const createNewOrder = () => {
    router.push('/bestellijsten');
  };

  const viewOrder = (order: OrderWithItems) => {
    // Navigate to order detail view
    $q.notify({
      type: 'info',
      message: `Viewing order ${order.order_number}`,
    });
  };

  const editOrder = (order: OrderWithItems) => {
    // Navigate to order edit view
    $q.notify({
      type: 'info',
      message: `Editing order ${order.order_number}`,
    });
  };

  const downloadOrderPDF = async (order: OrderWithItems) => {
    try {
      const blob = await orderProcessingService.generateOrderPDF(order.id);
      orderProcessingService.downloadFile(
        blob,
        `order-${order.order_number}.html`
      );

      analyticsService.trackExportEvent('order_pdf', 'pdf', {
        order_id: order.id,
      });

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.pdfDownloaded'),
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.pdfFailed'),
      });
    }
  };

  const downloadOrderCSV = async (order: OrderWithItems) => {
    try {
      const blob = await orderProcessingService.exportOrderToCSV(order.id);
      orderProcessingService.downloadFile(
        blob,
        `order-${order.order_number}.csv`
      );

      analyticsService.trackExportEvent('order_csv', 'csv', {
        order_id: order.id,
      });

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.csvDownloaded'),
      });
    } catch (error) {
      console.error('Failed to download CSV:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.csvFailed'),
      });
    }
  };

  const emailOrder = (order: OrderWithItems) => {
    emailData.orderId = order.id;
    emailData.subject = `Order ${order.order_number} - MedStock Pro`;
    emailData.message = `Please find attached the details for order ${order.order_number}.`;
    showEmailDialog.value = true;
  };

  const sendEmail = async () => {
    if (!emailData.recipient || !emailData.orderId) return;

    try {
      emailSending.value = true;

      await orderProcessingService.sendOrderByEmail(
        emailData.orderId,
        emailData.recipient,
        emailData.subject
      );

      showEmailDialog.value = false;

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.emailSent'),
      });

      // Reset email data
      Object.assign(emailData, {
        recipient: '',
        subject: '',
        message: '',
        orderId: '',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.emailFailed'),
      });
    } finally {
      emailSending.value = false;
    }
  };

  const submitToMagento = async (order: OrderWithItems) => {
    try {
      const result = await orderProcessingService.submitOrderToMagento(
        order.id
      );

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.magentoSubmitted', {
          orderNumber: result.increment_id,
        }),
      });

      // Reload orders to show updated status
      loadOrders();
    } catch (error) {
      console.error('Failed to submit to Magento:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.magentoFailed'),
      });
    }
  };

  const duplicateOrder = (order: OrderWithItems) => {
    $q.notify({
      type: 'info',
      message: `Duplicating order ${order.order_number}`,
    });
  };

  const cancelOrder = async (order: OrderWithItems) => {
    try {
      await orderProcessingService.updateOrderStatus(order.id, 'cancelled');

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.orderCancelled'),
      });

      loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.cancelFailed'),
      });
    }
  };

  const performExport = async () => {
    try {
      exporting.value = true;

      let ordersToExport: OrderWithItems[] = [];

      switch (exportScope.value) {
        case 'all':
          ordersToExport = await orderProcessingService.getOrders();
          break;
        case 'filtered':
          ordersToExport = orders.value;
          break;
        case 'selected':
          ordersToExport = selected.value;
          break;
      }

      if (ordersToExport.length === 0) {
        $q.notify({
          type: 'warning',
          message: t('orders.errors.noOrdersToExport'),
        });
        return;
      }

      const orderIds = ordersToExport.map(order => order.id);

      if (exportFormat.value === 'csv') {
        const blob = await orderProcessingService.exportOrdersToCSV(orderIds);
        const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        orderProcessingService.downloadFile(blob, filename);
      } else {
        // For PDF, we'd need to implement bulk PDF generation
        $q.notify({
          type: 'info',
          message: t('orders.notifications.pdfBulkNotSupported'),
        });
        return;
      }

      analyticsService.trackExportEvent('orders_bulk', exportFormat.value, {
        count: ordersToExport.length,
        scope: exportScope.value,
      });

      showExportDialog.value = false;

      $q.notify({
        type: 'positive',
        message: t('orders.notifications.exportCompleted', {
          count: ordersToExport.length,
        }),
      });
    } catch (error) {
      console.error('Failed to export orders:', error);
      $q.notify({
        type: 'negative',
        message: t('orders.errors.exportFailed'),
      });
    } finally {
      exporting.value = false;
    }
  };

  const bulkExport = () => {
    exportScope.value = 'selected';
    showExportDialog.value = true;
  };

  const bulkEmail = () => {
    $q.notify({
      type: 'info',
      message: t('orders.notifications.bulkEmailComingSoon'),
    });
  };

  // Lifecycle
  onMounted(() => {
    loadOrders();
    loadAnalytics();
  });
</script>

<style scoped>
  .q-table {
    background: white;
  }

  .orders-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
</style>
