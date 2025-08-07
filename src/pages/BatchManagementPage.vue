<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('batch.batchManagement')"
        :subtitle="$t('batch.manageBatchesSubtitle')"
        icon="qr_code_scanner"
      >
        <template #actions>
          <!-- View Mode Toggle -->
          <q-btn-toggle
            v-model="viewMode"
            :options="viewModeOptions"
            outline
            toggle-color="primary"
            color="grey-6"
            size="sm"
            class="view-mode-toggle"
          />
          
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="refreshData"
            :loading="refreshing"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="viewMode === 'full'"
            icon="add"
            :label="$t('batch.addBatch')"
            @click="showAddBatchDialog = true"
            unelevated
            no-caps
            class="app-btn-success"
          />
        </template>
      </PageTitle>
    </template>

    <div class="batch-management-page">
      <!-- Dashboard Cards - Full View -->
      <div v-if="viewMode === 'full'" class="row q-mb-lg stats-cards-container">
        <!-- Total Batches Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            :title="$t('batch.totalBatches')"
            icon="inventory"
            icon-color="primary"
          >
            <div class="stat-display">
              <div class="stat-value">{{ totalBatches }}</div>
            </div>
          </BaseCard>
        </div>

        <!-- Expiring Soon Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            :title="$t('batch.expiringSoon')"
            icon="warning"
            :icon-color="expiringBatches > 0 ? 'warning' : 'info'"
          >
            <div class="stat-display">
              <div class="stat-value">{{ expiringBatches }}</div>
            </div>
          </BaseCard>
        </div>

        <!-- Active Batches Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            :title="$t('batch.activeBatches')"
            icon="check_circle"
            icon-color="positive"
          >
            <div class="stat-display">
              <div class="stat-value">{{ activeBatches }}</div>
            </div>
          </BaseCard>
        </div>

        <!-- Total Value Card -->
        <div class="col-12 col-sm-6 col-md-3 stats-card-col">
          <BaseCard
            :title="$t('batch.totalValue')"
            icon="euro"
            icon-color="primary"
          >
            <div class="stat-display">
              <div class="stat-value">{{ formatCurrency(totalValue, 'EUR') }}</div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Dashboard Cards - Lite View -->
      <div v-else class="row q-mb-lg stats-cards-container-lite">
        <!-- Essential Info Only -->
        <div class="col-12 col-sm-6 stats-card-col">
          <BaseCard
            :title="$t('batch.totalBatches')"
            icon="inventory"
            icon-color="primary"
          >
            <div class="stat-display">
              <div class="stat-value">{{ totalBatches }}</div>
            </div>
          </BaseCard>
        </div>

        <!-- Expiring Soon Card -->
        <div class="col-12 col-sm-6 stats-card-col">
          <BaseCard
            :title="$t('batch.expiringSoon')"
            icon="warning"
            :icon-color="expiringBatches > 0 ? 'warning' : 'info'"
          >
            <div class="stat-display">
              <div class="stat-value">{{ expiringBatches }}</div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="viewMode === 'full'" class="q-mb-lg">
        <div class="text-h6 q-mb-md text-grey-8">
          <q-icon name="flash_on" class="q-mr-sm" />
          {{ $t('batch.quickActions') }}
        </div>
        
        <div class="row q-gutter-md">
          <!-- Scan Batch Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <InteractiveCard
              :title="$t('batch.scanBatch')"
              :subtitle="$t('batch.scanBatchSubtitle')"
              icon="qr_code_scanner"
              icon-color="primary"
              @click="openBarcodeScanner"

            />
          </div>

          <!-- View Expiring Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <InteractiveCard
              :title="$t('batch.viewExpiring')"
              :subtitle="`${expiringBatches} ${$t('batch.viewExpiringSubtitle')}`"
              icon="warning"
              icon-color="warning"
              @click="filterExpiring"
              :class="showExpiringOnly ? 'expiring-active' : ''"
            />
          </div>

          <!-- Export Batches Action -->
          <div class="col-12 col-sm-6 col-md-3">
            <InteractiveCard
              :title="$t('batch.exportBatches')"
              :subtitle="$t('batch.exportBatchesSubtitle')"
              icon="download"
              icon-color="positive"
              @click="exportBatches"

            />
          </div>


        </div>
      </div>

      <!-- Quick Actions - Lite View -->
      <div v-else class="q-mb-lg lite-actions">
        <div class="row q-gutter-sm">
          <q-btn
            icon="qr_code_scanner"
            :label="$t('batch.scanBatch')"
            @click="openBarcodeScanner"
            unelevated
            color="primary"
            class="lite-action-btn"
          />
          <q-btn
            icon="warning"
            :label="$t('batch.viewExpiring')"
            @click="filterExpiring"
            unelevated
            :color="showExpiringOnly ? 'warning' : 'grey-6'"
            class="lite-action-btn"
          />
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

      <!-- Main Content Tabs - Full View -->
      <BaseCard v-if="viewMode === 'full'">
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
              :view-mode="viewMode"
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

      <!-- Simplified Content - Lite View -->
      <BaseCard v-else class="lite-content">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="overview" :label="$t('batch.overview')" icon="list" />
          <q-tab
            name="expiring"
            :label="$t('batch.expiring')"
            icon="schedule"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Overview Tab - Lite -->
          <q-tab-panel name="overview" class="q-pa-none">
            <BatchOverview
              ref="batchOverviewRef"
              :view-mode="viewMode"
              @batch-selected="onBatchSelected"
              @batch-used="onBatchUsed"
            />
          </q-tab-panel>

          <!-- Expiring Tab - Lite -->
          <q-tab-panel name="expiring" class="q-pa-md">
            <div class="text-subtitle1 q-mb-md">{{ $t('batch.expiringBatches') }}</div>
            <ExpiringBatchesList
              :batches="batchStore.expiringBatches"
              :view-mode="viewMode"
              @batch-selected="onBatchSelected"
            />
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
    <BaseDialog
      v-model="showBatchDetailDialog"
      :title="`Batch: ${selectedBatch?.batchNumber || ''}`"
      :subtitle="selectedBatch?.productName || ''"
      icon="inventory"
      size="md"
      @close="showBatchDetailDialog = false"
    >
      <div v-if="selectedBatch" class="batch-details">
        <div class="detail-row">
          <span class="label">{{ $t('batch.expiryDate') }}:</span>
          <span class="value">{{ formatDate(selectedBatch.expiryDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ $t('batch.currentQuantity') }}:</span>
          <span class="value">{{ selectedBatch.currentQuantity }}</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ $t('batch.status') }}:</span>
          <q-chip 
            :color="getStatusColor(selectedBatch.status)"
            text-color="white"
            size="sm"
          >
            {{ $t(`batch.status.${selectedBatch.status}`) }}
          </q-chip>
        </div>
      </div>
      
      <template #actions>
        <q-btn 
          flat 
          :label="$t('common.close')" 
          color="primary"
          @click="showBatchDetailDialog = false" 
        />
      </template>
    </BaseDialog>

    <!-- Barcode Scanner Dialog -->
    <q-dialog v-model="showScannerDialog" max-width="500px">
      <BarcodeScanner v-model="showScannerDialog" @scan="onBarcodeScanned" />
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, getCurrentInstance, defineAsyncComponent, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useBatchStore } from 'src/stores/batch';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useAuthStore } from 'src/stores/auth';
  import { useClinicStore } from 'src/stores/clinic';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard } from 'src/components/cards';
  import BaseDialog from 'src/components/base/BaseDialog.vue';
  // ✅ PERFORMANCE OPTIMIZATION: Dynamic imports for heavy components
  
  import BatchOverview from 'src/components/BatchOverview.vue';
  const BatchRegistrationForm = defineAsyncComponent(() => import('src/components/BatchRegistrationForm.vue'));
  const BarcodeScanner = defineAsyncComponent(() => import('src/components/BarcodeScanner.vue'));
  const ExpiringBatchesList = defineAsyncComponent(() => import('src/components/ExpiringBatchesList.vue'));
  const FifoBatchManager = defineAsyncComponent(() => import('src/components/FifoBatchManager.vue'));
  const BatchReports = defineAsyncComponent(() => import('src/components/BatchReports.vue'));
  import type { ProductBatchWithDetails } from 'src/types/inventory';
  import { useFormatting } from 'src/composables/useFormatting';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();
  const inventoryStore = useInventoryStore();
  const authStore = useAuthStore();
  const clinicStore = useClinicStore();
  const { formatDate } = useFormatting();

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'positive',
      expired: 'negative',
      depleted: 'grey',
      recalled: 'deep-orange',
      quarantine: 'warning',
    };
    return colors[status] || 'grey';
  };

  // State
  const activeTab = ref('overview');
  const showAddBatchDialog = ref(false);
  const showBatchDetailDialog = ref(false);
  const showScannerDialog = ref(false);
  const showExpiringOnly = ref(false);
  const selectedBatch = ref<ProductBatchWithDetails | null>(null);
  const refreshing = ref(false);
  const batchOverviewRef = ref();
  
  // View mode state
  const viewMode = ref<'lite' | 'full'>('full');
  const viewModeOptions = computed(() => [
    { label: t('batch.viewMode.lite'), value: 'lite', icon: 'view_compact' },
    { label: t('batch.viewMode.full'), value: 'full', icon: 'view_module' }
  ]);

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

  const initializeViewMode = () => {
    // Check for saved preference first
    const savedViewMode = localStorage.getItem('remcura_batch_view_mode');
    if (savedViewMode && ['lite', 'full'].includes(savedViewMode)) {
      viewMode.value = savedViewMode as 'lite' | 'full';
      return;
    }

    // Default based on user role or practice settings
    // For now, default to 'full' - can be enhanced with role-based logic
    viewMode.value = 'full';
    
    // Save the initial preference
    localStorage.setItem('remcura_batch_view_mode', viewMode.value);
  };

  const onViewModeChange = () => {
    // Save preference when changed
    localStorage.setItem('remcura_batch_view_mode', viewMode.value);
    
    // Reset active tab for lite view if on advanced tabs
    if (viewMode.value === 'lite' && ['fifo', 'reports'].includes(activeTab.value)) {
      activeTab.value = 'overview';
    }
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

  // Watchers
  watch(viewMode, onViewModeChange);

  // Lifecycle
  onMounted(() => {
    initializeViewMode();
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

  .stats-cards-container-lite {
    gap: 0;

    .stats-card-col {
      padding: 8px;

      @media (max-width: 640px) {
        padding: 6px;
      }
    }
  }

  .lite-actions {
    .lite-action-btn {
      min-width: 140px;
      
      @media (max-width: 640px) {
        min-width: 120px;
        font-size: 0.875rem;
      }
    }
  }

  .lite-content {
    .q-tab-panels {
      .q-tab-panel {
        padding: 12px;
      }
    }
  }

  .view-mode-toggle {
    margin-right: 8px;
    
    @media (max-width: 768px) {
      margin-right: 0;
      margin-bottom: 8px;
    }
  }

  /* Active state for expiring filter */
  .expiring-active {
    border-color: #ff9800;
    background: linear-gradient(135deg, #fff3e0 0%, #ffebcc 100%);

    .body--dark & {
          background: linear-gradient(135deg, #2d1b0e 0%, #3d2914 100%);
    border-color: #ff9800;
    }
  }

  /* New stat display styles for replaced stats cards */
  .stat-display {
  text-align: center;
  padding: var(--space-4);
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    margin-bottom: 4px;
  }
}

.batch-details {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}
</style>
