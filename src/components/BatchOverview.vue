<template>
  <div class="batch-overview">
    <!-- Header with actions -->
    <div class="row items-center q-mb-md">
      <div class="text-h6">{{ $t('batch.batchOverview') }}</div>
      <q-space />

      <!-- Filter controls -->
      <div class="row q-gutter-sm">
        <q-select
          v-model="filters.location"
          :options="locationOptions"
          :label="$t('location.location')"
          clearable
          dense
          outlined
          style="min-width: 150px"
          @update:model-value="applyFilters"
        />

        <q-select
          v-model="filters.urgency"
          :options="urgencyOptions"
          :label="$t('batch.urgencyLevel')"
          clearable
          dense
          outlined
          style="min-width: 120px"
          @update:model-value="applyFilters"
        />

        <q-btn
          icon="add"
          color="primary"
          :label="$t('batch.addBatch')"
          @click="showAddBatchDialog = true"
        />
      </div>
    </div>

    <!-- Expiry alerts banner -->
    <q-banner
      v-if="expiryAlerts.length > 0"
      class="bg-orange text-white q-mb-md"
      rounded
    >
      <template v-slot:avatar>
        <q-icon name="warning" />
      </template>
      <div class="text-weight-medium">{{ $t('batch.expiryAlert') }}</div>
      <div class="text-caption">
        {{ $t('batch.batchesExpiringSoon', { count: expiryAlerts.length }) }}
      </div>
      <template v-slot:action>
        <q-btn
          flat
          color="white"
          :label="$t('batch.viewExpiring')"
          @click="showExpiringOnly = !showExpiringOnly"
        />
      </template>
    </q-banner>

    <!-- Main table -->
    <q-table
      :rows="filteredBatches"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 50 }"
      row-key="id"
      class="batch-table"
      :no-data-label="$t('batch.noBatchesFound')"
    >
      <!-- Product column with grouping -->
      <template v-slot:body-cell-product="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="32px" class="q-mr-sm">
              <q-icon name="medical_services" color="primary" />
            </q-avatar>
            <div>
              <div class="text-weight-medium">{{ props.row.productName }}</div>
              <div class="text-caption text-grey">
                {{ props.row.productSku }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Batch number column with scanner icon -->
      <template v-slot:body-cell-batchNumber="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon name="qr_code" class="q-mr-xs text-grey" size="16px" />
            <span class="text-weight-medium">{{ props.row.batchNumber }}</span>
          </div>
          <div
            v-if="props.row.supplierBatchNumber"
            class="text-caption text-grey"
          >
            {{ $t('batch.supplierBatch') }}: {{ props.row.supplierBatchNumber }}
          </div>
        </q-td>
      </template>

      <!-- Location column -->
      <template v-slot:body-cell-location="props">
        <q-td :props="props">
          <q-chip
            :color="getLocationColor(props.row.locationType)"
            text-color="white"
            size="sm"
          >
            {{ props.row.locationName }}
          </q-chip>
        </q-td>
      </template>

      <!-- Quantity column with progress bar -->
      <template v-slot:body-cell-quantity="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ formatQuantity(props.row.currentQuantity) }}
            <span class="text-grey"
              >/ {{ formatQuantity(props.row.initialQuantity) }}</span
            >
          </div>
          <q-linear-progress
            :value="props.row.currentQuantity / props.row.initialQuantity"
            size="4px"
            :color="
              getQuantityColor(
                props.row.currentQuantity / props.row.initialQuantity
              )
            "
            class="q-mt-xs"
          />
          <div class="text-caption text-grey">
            {{ $t('batch.available') }}:
            {{ formatQuantity(props.row.availableQuantity) }}
          </div>
        </q-td>
      </template>

      <!-- Expiry date column with urgency indicators -->
      <template v-slot:body-cell-expiry="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-icon
              :name="getExpiryIcon(props.row.urgencyLevel)"
              :color="getExpiryColor(props.row.urgencyLevel)"
              size="16px"
              class="q-mr-xs"
            />
            <div>
              <div class="text-weight-medium">
                {{ formatDate(props.row.expiryDate) }}
              </div>
              <div
                class="text-caption"
                :class="getExpiryTextClass(props.row.urgencyLevel)"
              >
                {{
                  getExpiryText(
                    props.row.daysUntilExpiry,
                    props.row.urgencyLevel
                  )
                }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Status column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="getStatusColor(props.row.status)"
            text-color="white"
            size="sm"
          >
            {{ $t(`batch.status.${props.row.status}`) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Actions column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              icon="edit"
              size="sm"
              flat
              round
              color="primary"
              @click="editBatch(props.row)"
            >
              <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
            </q-btn>

            <q-btn
              icon="move_down"
              size="sm"
              flat
              round
              color="green"
              @click="useBatch(props.row)"
              :disable="props.row.availableQuantity <= 0"
            >
              <q-tooltip>{{ $t('batch.useBatch') }}</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.status === 'active'"
              icon="block"
              size="sm"
              flat
              round
              color="orange"
              @click="quarantineBatch(props.row)"
            >
              <q-tooltip>{{ $t('batch.quarantine') }}</q-tooltip>
            </q-btn>

            <q-btn
              icon="more_vert"
              size="sm"
              flat
              round
              @click="showBatchDetails(props.row)"
            >
              <q-tooltip>{{ $t('common.moreActions') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Add Batch Dialog -->
    <q-dialog v-model="showAddBatchDialog" max-width="900px">
      <BatchRegistrationForm
        @close="showAddBatchDialog = false"
        @success="onBatchAdded"
      />
    </q-dialog>

    <!-- Batch Details Dialog -->
    <q-dialog v-model="showDetailsDialog" max-width="600px">
      <q-card v-if="selectedBatch">
        <q-card-section>
          <div class="text-h6">{{ selectedBatch.batchNumber }}</div>
          <div class="text-subtitle2">{{ selectedBatch.productName }}</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-sm">
            <div class="col">
              <div class="text-caption">Quantity</div>
              <div class="text-body1">{{ selectedBatch.currentQuantity }}</div>
            </div>
            <div class="col">
              <div class="text-caption">Expiry</div>
              <div class="text-body1">{{ formatDate(selectedBatch.expiryDate) }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showDetailsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Use Batch Dialog -->
    <q-dialog v-model="showUseBatchDialog" max-width="500px">
      <UseBatchDialog
        v-if="selectedBatch"
        :batch="selectedBatch"
        @close="showUseBatchDialog = false"
        @used="onBatchUsed"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar, date } from 'quasar';
  import { useBatchStore } from '@/stores/batch';
  import { useClinicStore } from '@/stores/clinic';
  import { useAuthStore } from '@/stores/auth';
  import BatchRegistrationForm from './BatchRegistrationForm.vue';

  import UseBatchDialog from './UseBatchDialog.vue';
  import type { ProductBatchWithDetails } from '@/types/inventory';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();
  const clinicStore = useClinicStore();
  const authStore = useAuthStore();

  // State
  const loading = ref(false);
  const showAddBatchDialog = ref(false);
  const showDetailsDialog = ref(false);
  const showUseBatchDialog = ref(false);
  const showExpiringOnly = ref(false);
  const selectedBatch = ref<ProductBatchWithDetails | null>(null);

  // Filters
  const filters = ref({
    location: null as string | null,
    urgency: null as string | null,
    search: '',
  });

  // Computed
  const columns = computed(() => [
    {
      name: 'product',
      label: t('product.product'),
      align: 'left',
      sortable: true,
      field: 'productName',
    },
    {
      name: 'batchNumber',
      label: t('batch.batchNumber'),
      align: 'left',
      sortable: true,
      field: 'batchNumber',
    },
    {
      name: 'location',
      label: t('location.location'),
      align: 'left',
      sortable: true,
      field: 'locationName',
    },
    {
      name: 'quantity',
      label: t('inventory.quantity'),
      align: 'right',
      sortable: true,
      field: 'currentQuantity',
    },
    {
      name: 'expiry',
      label: t('batch.expiryDate'),
      align: 'left',
      sortable: true,
      field: 'expiryDate',
    },
    {
      name: 'status',
      label: t('common.status'),
      align: 'center',
      sortable: true,
      field: 'status',
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center',
    },
  ]);

  const locationOptions = computed(() => [
    { label: t('common.all'), value: null },
    ...clinicStore.locations.map(location => ({
      label: location.name,
      value: location.id,
    })),
  ]);

  const urgencyOptions = computed(() => [
    { label: t('common.all'), value: null },
    { label: t('batch.urgency.expired'), value: 'expired' },
    { label: t('batch.urgency.critical'), value: 'critical' },
    { label: t('batch.urgency.warning'), value: 'warning' },
    { label: t('batch.urgency.normal'), value: 'normal' },
  ]);

  const expiryAlerts = computed(() => {
    return batchStore.expiringBatches.filter(
      batch =>
        batch.urgency_level === 'critical' || batch.urgency_level === 'expired'
    );
  });

  const filteredBatches = computed(() => {
    let batches = [...batchStore.batches];

    // Apply expiry filter
    if (showExpiringOnly.value) {
      batches = batches.filter(batch =>
        ['expired', 'critical', 'warning'].includes(
          batch.urgencyLevel || 'normal'
        )
      );
    }

    // Apply location filter
    if (filters.value.location) {
      batches = batches.filter(
        batch => batch.location_id === filters.value.location
      );
    }

    // Apply urgency filter
    if (filters.value.urgency) {
      batches = batches.filter(
        batch => batch.urgency_level === filters.value.urgency
      );
    }

    // Sort by expiry date (FIFO)
    batches.sort((a, b) => {
      const dateA = new Date(a.expiry_date).getTime();
      const dateB = new Date(b.expiry_date).getTime();
      return dateA - dateB;
    });

    return batches;
  });

  // Methods
  const formatDate = (dateStr: string) => {
    return date.formatDate(dateStr, 'DD/MM/YYYY');
  };

  const formatQuantity = (quantity: number | null | undefined) => {
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
      return '0';
    }
    return quantity.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  const getLocationColor = (type: string) => {
    const colors = {
      storage: 'blue',
      emergency: 'red',
      treatment: 'green',
      default: 'grey',
    };
    return colors[type] || colors.default;
  };

  const getQuantityColor = (ratio: number) => {
    if (ratio > 0.5) { return 'green'; }
    if (ratio > 0.2) { return 'orange'; }
    return 'red';
  };

  const getExpiryIcon = (urgency: string) => {
    const icons = {
      expired: 'error',
      critical: 'warning',
      warning: 'schedule',
      normal: 'check_circle',
    };
    return icons[urgency] || 'check_circle';
  };

  const getExpiryColor = (urgency: string) => {
    const colors = {
      expired: 'red',
      critical: 'deep-orange',
      warning: 'amber',
      normal: 'green',
    };
    return colors[urgency] || 'green';
  };

  const getExpiryTextClass = (urgency: string) => {
    const classes = {
      expired: 'text-red',
      critical: 'text-deep-orange',
      warning: 'text-amber-8',
      normal: 'text-green',
    };
    return classes[urgency] || 'text-green';
  };

  const getExpiryText = (days: number, urgency: string) => {
    if (urgency === 'expired') {
      return t('batch.expiredDaysAgo', { days: Math.abs(days) });
    } else if (days === 0) {
      return t('batch.expiresToday');
    } else if (days === 1) {
      return t('batch.expiresTomorrow');
    } else {
      return t('batch.expiresInDays', { days });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      expired: 'red',
      depleted: 'grey',
      recalled: 'deep-orange',
      quarantine: 'amber',
    };
    return colors[status] || 'grey';
  };

  const applyFilters = () => {
    // Filters are reactive, so this just triggers recomputation
  };

  const editBatch = (batch: ProductBatchWithDetails) => {
    selectedBatch.value = batch;
    showDetailsDialog.value = true;
  };

  const useBatch = (batch: ProductBatchWithDetails) => {
    selectedBatch.value = batch;
    showUseBatchDialog.value = true;
  };

  const quarantineBatch = async (batch: ProductBatchWithDetails) => {
    try {
      const clinicId = authStore.clinicId;
      if (!clinicId) {
        throw new Error($t('batchoverv.noclinicidavailable'));
      }
      await batchStore.updateBatch({
        id: batch.id,
        practice_id: clinicId,
        status: 'quarantine',
      });
      $q.notify({
        type: 'positive',
        message: t('batch.quarantineSuccess'),
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('errors.failed'),
      });
    }
  };

  const showBatchDetails = (batch: ProductBatchWithDetails) => {
    selectedBatch.value = batch;
    showDetailsDialog.value = true;
  };

  const onBatchAdded = (batch: any) => {
    showAddBatchDialog.value = false;
    loadBatches();
  };

  const onBatchUpdated = () => {
    showDetailsDialog.value = false;
    loadBatches();
  };

  const onBatchUsed = () => {
    showUseBatchDialog.value = false;
    loadBatches();
  };

  const loadBatches = async () => {
    try {
      loading.value = true;
      const clinicId = authStore.clinicId;
      if (!clinicId) {
        throw new Error($t('batchoverv.noclinicidavailable'));
      }
      await Promise.all([
        batchStore.fetchBatches(clinicId),
        batchStore.fetchExpiringBatches(clinicId),
      ]);
    } catch (error) {
      console.error(t('errors.failedToLoadData'), error);
      $q.notify({
        type: 'negative',
        message: t('errors.failedToLoadData'),
      });
    } finally {
      loading.value = false;
    }
  };

  // Lifecycle
  onMounted(async () => {
    await Promise.all([loadBatches(), clinicStore.fetchLocations()]);
  });
</script>

<style scoped>
  .batch-overview {
    padding: 16px;
  }

  .batch-table :deep(.q-table__top) {
    padding: 12px 0;
  }

  .batch-table :deep(.q-table tbody td) {
    padding: 12px 8px;
  }

  .batch-table :deep(.q-table th) {
    font-weight: 600;
  }
</style>
