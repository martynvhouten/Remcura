<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('batch.batchManagement')"
        :subtitle="$t('batch.manageBatchesSubtitle')"
        icon="qr_code_scanner"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="add"
            :label="$t('batch.addBatch')"
            @click="showAddBatchDialog = true"
          />
        </template>
      </PageTitle>
    </template>

    <div class="batch-management-page">
      <!-- Dashboard Cards -->
      <div class="row q-mb-lg stats-cards-container">
        <!-- Total Batches Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            variant="stats"
            :value="totalBatches"
            :label="$t('batch.totalBatches')"
            icon="inventory"
            icon-color="primary"
          />
        </div>

        <!-- Expiring Soon Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            variant="stats"
            :value="expiringBatches"
            :label="$t('batch.expiringSoon')"
            icon="warning"
            :icon-color="expiringBatches > 0 ? 'warning' : 'info'"
          />
        </div>

        <!-- Active Batches Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            variant="stats"
            :value="activeBatches"
            :label="$t('batch.activeBatches')"
            icon="check_circle"
            icon-color="positive"
          />
        </div>

        <!-- Total Value Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            variant="stats"
            :value="formatCurrency(totalValue, 'EUR')"
            :label="$t('batch.totalValue')"
            icon="euro"
            icon-color="primary"
          />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="q-mb-lg">
        <div class="text-h6 q-mb-md text-grey-8">
          <q-icon name="flash_on" class="q-mr-sm" />
          {{ $t('batch.quickActions') }}
        </div>
        
        <div class="row q-gutter-md">
          <!-- Scan Batch Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <BaseCard
              variant="quick-action"
              title="Scan Batch"
              action-description="Scan barcode om batch te vinden"
              action-icon="qr_code_scanner"
              gradient-direction="blue"
              :action-progress="0"
              @click="openBarcodeScanner"
              class="cursor-pointer"
            />
          </div>

          <!-- View Expiring Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <BaseCard
              variant="quick-action"
              title="View Expiring"
              :action-description="`${expiringBatches} batches verlopen binnenkort`"
              action-icon="warning"
              gradient-direction="orange"
              :action-badge="expiringBatches > 0 ? expiringBatches : undefined"
              :action-progress="Math.round((expiringBatches / Math.max(totalBatches, 1)) * 100)"
              @click="filterExpiring"
              class="cursor-pointer"
              :class="showExpiringOnly ? 'expiring-active' : ''"
            />
          </div>

          <!-- Export Batches Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <BaseCard
              variant="quick-action"
              title="Export Batches"
              action-description="Download batch gegevens"
              action-icon="download"
              gradient-direction="green"
              :action-progress="0"
              @click="exportBatches"
              class="cursor-pointer"
            />
          </div>


        </div>
      </div>

      <!-- Expiry Alerts -->
      <div v-if="criticalBatches.length > 0" class="q-mb-lg">
        <q-banner class="bg-red text-white" rounded dense>
          <template v-slot:avatar>
            <q-icon name="error" size="sm" />
          </template>
          <div class="text-subtitle2">{{ $t('batch.criticalAlert') }}</div>
          <div class="text-body2">
            {{
              $t('batch.criticalBatchesFound', {
                count: criticalBatches.length,
              })
            }}
          </div>
          <template v-slot:action>
            <q-btn
              flat
              color="white"
              :label="$t('batch.viewCritical')"
              @click="filterCritical"
              size="sm"
            />
          </template>
        </q-banner>
      </div>

      <!-- Main Content Tabs -->
      <BaseCard>
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="overview" :label="$t('batch.overview')" icon="list" />
          <q-tab
            name="expiring"
            :label="$t('batch.expiring')"
            icon="schedule"
          />
          <q-tab
            name="fifo"
            :label="$t('batch.fifoManagement')"
            icon="trending_up"
          />
          <q-tab name="reports" :label="$t('batch.reports')" icon="analytics" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Overview Tab -->
          <q-tab-panel name="overview" class="q-pa-none">
            <BatchOverview
              ref="batchOverviewRef"
              @batch-selected="onBatchSelected"
              @batch-used="onBatchUsed"
            />
          </q-tab-panel>

          <!-- Expiring Tab -->
          <q-tab-panel name="expiring" class="q-pa-md">
            <div class="text-h6 q-mb-md">{{ $t('batch.expiringBatches') }}</div>
            <ExpiringBatchesList
              :batches="batchStore.expiringBatches"
              @batch-selected="onBatchSelected"
            />
          </q-tab-panel>

          <!-- FIFO Management Tab -->
          <q-tab-panel name="fifo" class="q-pa-md">
            <div class="text-h6 q-mb-md">{{ $t('batch.fifoManagement') }}</div>
            <FifoBatchManager @suggestion-generated="onFifoSuggestion" />
          </q-tab-panel>

          <!-- Reports Tab -->
          <q-tab-panel name="reports" class="q-pa-md">
            <div class="text-h6 q-mb-md">{{ $t('batch.batchReports') }}</div>
            <BatchReports />
          </q-tab-panel>
        </q-tab-panels>
      </BaseCard>
    </div>

    <!-- Add Batch Dialog -->
    <q-dialog v-model="showAddBatchDialog" max-width="900px">
      <BatchRegistrationForm
        @close="showAddBatchDialog = false"
        @success="onBatchAdded"
      />
    </q-dialog>

    <!-- Batch Detail Dialog -->
    <q-dialog v-model="showBatchDetailDialog" max-width="800px">
      <BatchDetailCard
        v-if="selectedBatch"
        :batch="selectedBatch"
        @close="showBatchDetailDialog = false"
        @updated="onBatchUpdated"
        @use-batch="onUseBatch"
      />
    </q-dialog>

    <!-- Barcode Scanner Dialog -->
    <q-dialog v-model="showScannerDialog" max-width="500px">
      <BarcodeScanner v-model="showScannerDialog" @scan="onBarcodeScanned" />
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, getCurrentInstance } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useBatchStore } from 'src/stores/batch';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useAuthStore } from 'src/stores/auth';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import BaseCard from 'src/components/base/BaseCard.vue';
  import BatchOverview from 'src/components/BatchOverview.vue';
  import BatchRegistrationForm from 'src/components/BatchRegistrationForm.vue';
  import BatchDetailCard from 'src/components/BatchDetailCard.vue';
  import BarcodeScanner from 'src/components/BarcodeScanner.vue';
  import ExpiringBatchesList from 'src/components/ExpiringBatchesList.vue';
  import FifoBatchManager from 'src/components/FifoBatchManager.vue';
  import BatchReports from 'src/components/BatchReports.vue';
  import type { ProductBatchWithDetails } from 'src/types/inventory';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();
  const inventoryStore = useInventoryStore();
  const authStore = useAuthStore();

  // State
  const activeTab = ref('overview');
  const showAddBatchDialog = ref(false);
  const showBatchDetailDialog = ref(false);
  const showScannerDialog = ref(false);
  const showExpiringOnly = ref(false);
  const selectedBatch = ref<ProductBatchWithDetails | null>(null);
  const refreshing = ref(false);
  const batchOverviewRef = ref();

  // Computed
  const totalBatches = computed(() => batchStore.batches.length);

  const activeBatches = computed(
    () => batchStore.batches.filter(batch => batch.status === 'active').length
  );

  const expiringBatches = computed(
    () =>
      batchStore.expiringBatches.filter(
        batch =>
          batch.urgency_level === 'critical' ||
          batch.urgency_level === 'warning'
      ).length
  );

  const criticalBatches = computed(() =>
    batchStore.expiringBatches.filter(
      batch =>
        batch.urgency_level === 'expired' || batch.urgency_level === 'critical'
    )
  );

  const totalValue = computed(() =>
    batchStore.batches.reduce(
      (sum, batch) =>
        sum + (batch.current_quantity || 0) * (batch.unit_cost || 0),
      0
    )
  );

  // Methods
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const refreshData = async () => {
    try {
      refreshing.value = true;
      const practiceId = authStore.clinicId;
      if (!practiceId) { return; }

      await Promise.all([
        batchStore.fetchBatches(practiceId),
        batchStore.fetchExpiringBatches(practiceId),
      ]);

      $q.notify({
        type: 'positive',
        message: t('common.dataRefreshed'),
        timeout: 1000,
      });
    } catch (error) {
      console.error(t('errors.failedToRefreshData'), error);
      $q.notify({
        type: 'negative',
        message: t('errors.failedToRefreshData'),
      });
    } finally {
      refreshing.value = false;
    }
  };

  const openBarcodeScanner = () => {
    showScannerDialog.value = true;
  };

  const filterExpiring = () => {
    showExpiringOnly.value = !showExpiringOnly.value;
    activeTab.value = 'expiring';
  };

  const filterCritical = () => {
    activeTab.value = 'expiring';
    // Apply critical filter in the expiring tab
  };

  const exportBatches = () => {
    // Export batch data as CSV
    const csvData = batchStore.batches.map(batch => ({
      [t('batch.batchNumber')]: batch.batch_number,
      [t('product.product')]: batch.product.name,
      [t('location.location')]: batch.location.name,
      [t('batch.currentQuantity')]: batch.current_quantity,
      [t('batch.expiryDate')]: batch.expiry_date,
      [t('common.status')]: batch.status,
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, 'batch-overview.csv');

    $q.notify({
      type: 'positive',
      message: t('batch.exportSuccess'),
    });
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) { return ''; }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onBatchSelected = (batch: ProductBatchWithDetails) => {
    selectedBatch.value = batch;
    showBatchDetailDialog.value = true;
  };

  const onBatchAdded = () => {
    showAddBatchDialog.value = false;
    refreshData();
  };

  const onBatchUpdated = () => {
    showBatchDetailDialog.value = false;
    refreshData();
  };

  const onBatchUsed = () => {
    refreshData();
  };

  const onUseBatch = (batch: ProductBatchWithDetails) => {
    // Handle batch usage
    showBatchDetailDialog.value = false;
    // Open usage dialog or process directly
  };

  const onBarcodeScanned = (barcodeData: string) => {
    showScannerDialog.value = false;

    // Try to find batch by batch number
    const foundBatch = batchStore.batches.find(
      batch =>
        batch.batch_number === barcodeData ||
        batch.supplier_batch_number === barcodeData
    );

    if (foundBatch) {
      selectedBatch.value = foundBatch;
      showBatchDetailDialog.value = true;
    } else {
      $q.notify({
        type: 'warning',
        message: t('batch.batchNotFound', { batchNumber: barcodeData }),
      });
    }
  };

  const onFifoSuggestion = (suggestion: any) => {
    // Handle FIFO batch suggestion
    // FIFO suggestion generated successfully
  };

  // Lifecycle
  onMounted(() => {
    const practiceId = authStore.clinicId;
    if (practiceId) {
      refreshData();
    }
  });
</script>

<style scoped>
  .batch-management-page {
    padding: 16px;
  }

  .dashboard-card {
    height: 100px;
    transition: all 0.3s ease;
  }

  .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .dashboard-card .q-card-section {
    height: 100%;
  }

  @media (max-width: 768px) {
    .batch-management-page {
      padding: 8px;
    }

    .dashboard-card {
      height: 80px;
    }
  }

  .stats-cards-container {
    gap: 0;

    .stats-card-col {
      padding: 8px;

      @media (max-width: 640px) {
        padding: 6px;
      }
    }
  }

  /* Active state for expiring filter */
  .expiring-active {
    border-color: #ff9800 !important;
    background: linear-gradient(135deg, #fff3e0 0%, #ffebcc 100%) !important;

    .body--dark & {
      background: linear-gradient(135deg, #2d1b0e 0%, #3d2914 100%) !important;
      border-color: #ff9800 !important;
    }
  }
</style>
