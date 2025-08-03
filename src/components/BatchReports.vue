<template>
  <div class="batch-reports">
    <div class="row q-gutter-md">
      <!-- Report Selection -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('batch.selectReport') }}</div>

            <q-list>
              <q-item
                v-for="report in reportTypes"
                :key="report.type"
                clickable
                :active="selectedReport === report.type"
                @click="selectedReport = report.type"
                class="report-item"
              >
                <q-item-section avatar>
                  <q-icon :name="report.icon" :color="report.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ report.title }}</q-item-label>
                  <q-item-label caption>{{ report.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Report Configuration -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ getReportTitle() }}</div>

            <!-- Date Range Selection -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col-6">
                <q-input
                  v-model="dateRange.from"
                  :label="$t('common.fromDate')"
                  type="date"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="dateRange.to"
                  :label="$t('common.toDate')"
                  type="date"
                />
              </div>
            </div>

            <!-- Additional Filters -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col-6">
                <q-select
                  v-model="filters.location"
                  :options="locationOptions"
                  :label="$t('location.location')"
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  :label="$t('common.status')"
                  clearable
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- Generate Report Button -->
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="assessment"
                :label="$t('batch.generateReport')"
                @click="generateReport"
                :loading="generating"
              />

              <q-btn
                v-if="reportData.length"
                color="green"
                icon="download"
                :label="$t('batch.exportReport')"
                @click="exportReport"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Report Results -->
    <div v-if="reportData.length" class="q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('batch.reportResults') }}</div>

          <!-- Summary Cards -->
          <div class="row q-gutter-md q-mb-lg">
            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-primary">
                    {{ summary.totalBatches }}
                  </div>
                  <div class="text-caption">{{ $t('batch.totalBatches') }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-red">
                    {{ summary.expiredBatches }}
                  </div>
                  <div class="text-caption">
                    {{ $t('batch.expiredBatches') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-orange">
                    {{ summary.expiringSoon }}
                  </div>
                  <div class="text-caption">{{ $t('batch.expiringSoon') }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-green">
                    {{ formatCurrency(summary.totalValue) }}
                  </div>
                  <div class="text-caption">{{ $t('batch.totalValue') }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Report Table -->
          <q-table
            :rows="reportData"
            :columns="reportColumns"
            :pagination="{ rowsPerPage: 25 }"
            row-key="id"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useBatchStore } from 'src/stores/batch';

  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();

  // State
  const selectedReport = ref('expiry-analysis');
  const generating = ref(false);
  const reportData = ref<any[]>([]);

  const dateRange = ref({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const filters = ref({
    location: null,
    status: null,
  });

  // Computed
  const reportTypes = computed(() => [
    {
      type: 'expiry-analysis',
      title: t('batch.expiryAnalysis'),
      description: t('batch.expiryAnalysisDesc'),
      icon: 'schedule',
      color: 'orange',
    },
    {
      type: 'batch-usage',
      title: t('batch.batchUsage'),
      description: t('batch.batchUsageDesc'),
      icon: 'trending_down',
      color: 'blue',
    },
    {
      type: 'fifo-compliance',
      title: t('batch.fifoCompliance'),
      description: t('batch.fifoComplianceDesc'),
      icon: 'trending_up',
      color: 'green',
    },
    {
      type: 'batch-costs',
      title: t('batch.batchCosts'),
      description: t('batch.batchCostsDesc'),
      icon: 'euro',
      color: 'purple',
    },
  ]);

  const locationOptions = computed(() => [
    { label: t('common.allLocations'), value: null },
    { label: t('location.sampleData.mainWarehouse.name'), value: 'storage' },
    { label: t('location.samples.emergencyStock'), value: 'emergency' },
  ]);

  const statusOptions = computed(() => [
    { label: t('common.allStatuses'), value: null },
    { label: t('batch.status.active'), value: 'active' },
    { label: t('batch.status.expired'), value: 'expired' },
    { label: t('batch.status.depleted'), value: 'depleted' },
  ]);

  const reportColumns = computed(() => {
    const baseColumns = [
      {
        name: 'batchNumber',
        label: t('batch.batchNumber'),
        field: 'batchNumber',
        align: 'left',
      },
      {
        name: 'productName',
        label: t('product.product'),
        field: 'productName',
        align: 'left',
      },
      {
        name: 'locationName',
        label: t('location.location'),
        field: 'locationName',
        align: 'left',
      },
    ];

    // Add specific columns based on report type
    if (selectedReport.value === 'expiry-analysis') {
      baseColumns.push(
        {
          name: 'expiryDate',
          label: t('batch.expiryDate'),
          field: 'expiryDate',
          align: 'left',
        },
        {
          name: 'daysUntilExpiry',
          label: t('batch.daysUntilExpiry'),
          field: 'daysUntilExpiry',
          align: 'center',
        }
      );
    }

    return baseColumns;
  });

  const summary = computed(() => {
    if (!reportData.value.length) {
      return {
        totalBatches: 0,
        expiredBatches: 0,
        expiringSoon: 0,
        totalValue: 0,
      };
    }

    return {
      totalBatches: reportData.value.length,
      expiredBatches: reportData.value.filter(b => b.daysUntilExpiry < 0)
        .length,
      expiringSoon: reportData.value.filter(
        b => b.daysUntilExpiry >= 0 && b.daysUntilExpiry <= 30
      ).length,
      totalValue: reportData.value.reduce(
        (sum, b) => sum + (b.currentQuantity * b.unitCost || 0),
        0
      ),
    };
  });

  // Methods
  const getReportTitle = () => {
    const report = reportTypes.value.find(r => r.type === selectedReport.value);
    return report?.title || t('batch.reportConfiguration');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const generateReport = async () => {
    try {
      generating.value = true;

      // Mock report data generation
      // In a real implementation, this would call the backend
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        batchNumber: `BATCH-${String(i + 1).padStart(3, '0')}`,
        productName: `Product ${i + 1}`,
        locationName:
          i % 2 === 0
            ? t('location.sampleData.mainWarehouse.name')
            : t('location.samples.emergencyStock'),
        expiryDate: new Date(Date.now() + (i - 5) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        daysUntilExpiry: i - 5,
        currentQuantity: Math.floor(Math.random() * 100) + 10,
        unitCost: Math.random() * 50 + 5,
      }));

      reportData.value = mockData;

      $q.notify({
        type: 'positive',
        message: t('batch.reportGenerated'),
      });
    } catch (error) {
      console.error(t('errors.failedToGenerateReport'), error);
      $q.notify({
        type: 'negative',
        message: t('errors.failedToGenerateReport'),
      });
    } finally {
      generating.value = false;
    }
  };

  const exportReport = () => {
    // Export report as CSV
    const csvData = reportData.value.map(row => ({
      [t('batch.batchNumber')]: row.batchNumber,
      [t('product.product')]: row.productName,
      [t('location.location')]: row.locationName,
      [t('batch.expiryDate')]: row.expiryDate,
      [t('batch.daysUntilExpiry')]: row.daysUntilExpiry,
      [t('batch.currentQuantity')]: row.currentQuantity,
      [t('batch.unitCost')]: row.unitCost,
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `batch-report-${selectedReport.value}.csv`);

    $q.notify({
      type: 'positive',
      message: t('batch.reportExported'),
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
</script>

<style scoped>
  .batch-reports {
    padding: 16px;
  }

  .report-item {
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .report-item.q-item--active {
    background-color: var(--q-primary);
    color: white;
  }
</style>
