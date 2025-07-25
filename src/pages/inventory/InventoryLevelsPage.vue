<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('inventory.stockLevels')"
        :subtitle="$t('inventory.overview')"
        icon="inventory_2"
      />
    </template>

    <template #actions>
      <div class="row q-gutter-sm items-center">
        <!-- Refresh Button -->
        <q-btn
          icon="refresh"
          :loading="loading"
          round
          flat
          @click="refreshData"
          :title="$t('common.refresh')"
        />
      </div>
    </template>

    <!-- Quick Stats Overview -->
    <div class="row q-mb-lg stats-cards-container">
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          variant="modern"
          :title="$t('inventory.totalProducts')"
          :subtitle="selectedLocationName"
          icon="inventory_2"
          header-color="primary"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              {{ filteredStockLevels.length }}
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.products') }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          variant="modern"
          :title="$t('inventory.stockLocations')"
          :subtitle="$t('inventory.activeLocations')"
          icon="location_on"
          header-color="info"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              {{ clinicStore.locations.length }}
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.locations') }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          variant="modern"
          :title="$t('inventory.dataLoaded')"
          :subtitle="$t('inventory.upToDate')"
          icon="check_circle"
          header-color="positive"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              {{ loading ? '...' : inventoryStore.realtimeConnected ? '🔄' : '✓' }}
            </div>
            <div class="kpi-subtitle">{{ 
              inventoryStore.realtimeConnected 
                ? $t('inventory.realTimeConnected') 
                : $t('inventory.status') 
            }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          variant="modern"
          :title="$t('inventory.lastUpdated')"
          :subtitle="$t('inventory.refreshData')"
          icon="refresh"
          header-color="warning"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              {{ lastUpdated ? formatTime(lastUpdated) : '-' }}
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.lastSync') }}</div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- New FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="inventoryFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="loading"
        collapsible
        class="inventory-filter-panel"
      />
    </div>

    <!-- Stock Levels Table -->
    <BaseCard
      variant="outlined"
      :title="$t('inventory.stockLevels')"
      icon="table_chart"
      header-color="primary"
    >
      <q-table
        :rows="filteredStockLevels"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="{ rowsPerPage: 25 }"
        flat
        bordered
      >
        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ $t('inventory.noStockLevels') }}</span>
          </div>
        </template>

        <template #body-cell-product_name="props">
          <q-td :props="props">
            <div class="product-info">
              <div class="product-name">{{ props.row.product_name }}</div>
              <div v-if="props.row.product_sku" class="product-sku">
                SKU: {{ props.row.product_sku }}
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-current_quantity="props">
          <q-td :props="props" class="text-center">
            <q-chip
              :color="getQuantityColor(props.row)"
              :text-color="getQuantityTextColor(props.row)"
              size="sm"
              dense
            >
              {{ props.row.current_quantity }} {{ props.row.product_unit || 'pcs' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-stock_status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              :color="getStockStatusColor(props.row.stock_status)"
              :text-color="getStockStatusTextColor(props.row.stock_status)"
              size="sm"
              dense
            >
              {{ $t(`inventory.stockStatus.${props.row.stock_status}`) }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-location_name="props">
          <q-td :props="props">
            <div class="location-info">
              <q-icon name="location_on" size="xs" color="info" class="q-mr-xs" />
              {{ props.row.location_name }}
            </div>
          </q-td>
        </template>

        <template #body-cell-last_counted_at="props">
          <q-td :props="props">
            {{ props.row.last_counted_at ? formatDate(props.row.last_counted_at) : '-' }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              size="sm"
              @click="adjustStock(props.row)"
            >
              <q-tooltip>{{ $t('inventory.adjustStock') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="history"
              size="sm"
              @click="viewHistory(props.row)"
            >
              <q-tooltip>{{ $t('inventory.viewHistory') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="count"
              size="sm"
              @click="countStock(props.row)"
            >
              <q-tooltip>{{ $t('inventory.countStock') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </BaseCard>

    <!-- Stock Adjustment Dialog -->
    <q-dialog v-model="showAdjustDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('inventory.adjustStock') }}</div>
        </q-card-section>

        <q-card-section>
          <div v-if="selectedStockLevel" class="q-mb-md">
            <div class="text-subtitle2">{{ selectedStockLevel.product_name }}</div>
            <div class="text-caption text-grey-7">
              {{ $t('inventory.currentStock') }}: {{ selectedStockLevel.current_quantity }} {{ selectedStockLevel.product_unit || 'pcs' }}
            </div>
          </div>

          <q-form class="q-gutter-md">
            <q-select
              v-model="adjustmentType"
              :options="adjustmentTypeOptions"
              :label="$t('inventory.adjustmentType')"
              outlined
              emit-value
              map-options
            />

            <q-input
              v-model.number="adjustmentQuantity"
              :label="$t('inventory.quantity')"
              type="number"
              outlined
              :rules="[val => val !== null && val > 0 || $t('validation.required')]"
            />

            <q-input
              v-model="adjustmentReason"
              :label="$t('inventory.reason')"
              type="textarea"
              outlined
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="closeAdjustDialog" />
          <q-btn
            color="primary"
            :label="$t('inventory.adjust')"
            @click="performAdjustment"
            :loading="adjusting"
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
import BaseCard from 'src/components/base/BaseCard.vue';
import FilterPanel from 'src/components/filters/FilterPanel.vue';
import { inventoryFilterPreset } from '@/presets/filters/inventory';
import { supabase } from 'src/services/supabase';
import { useAuthStore } from 'src/stores/auth';
import { useClinicStore } from 'src/stores/clinic';
import { useInventoryStore } from 'src/stores/inventory';
import type { FilterValues, FilterChangeEvent, FilterResetEvent } from '@/types/filters';

const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();
const clinicStore = useClinicStore();
const inventoryStore = useInventoryStore();

// Refs
const loading = ref(false);
const adjusting = ref(false);
const showAdjustDialog = ref(false);
const selectedStockLevel = ref<any>(null);
const lastUpdated = ref<Date | null>(null);

// New filter state for FilterPanel
const filterValues = ref<FilterValues>({});

// Adjustment state
const adjustmentType = ref('add');
const adjustmentQuantity = ref<number | null>(null);
const adjustmentReason = ref('');

// Data
const stockLevels = ref<any[]>([]);

// Filter event handlers
const handleFilterChange = (event: FilterChangeEvent) => {
  // Filter logic is handled by computed property
};

const handleFilterReset = (event: FilterResetEvent) => {
  filterValues.value = (inventoryFilterPreset.defaultFilters || {}) as any;
};

const handleFilterClear = () => {
  filterValues.value = {};
};

// Computed
const selectedLocationName = computed(() => {
  const locationId = filterValues.value.location;
  if (!locationId) return t('inventory.allLocations');
  
  const location = clinicStore.locations.find(l => l.id === locationId);
  return location?.name || t('inventory.unknownLocation');
});

const filteredStockLevels = computed(() => {
  let filtered = stockLevels.value;

  // Apply search filter
  const search = filterValues.value.search;
  if (search) {
    const searchTerm = String(search).toLowerCase();
    filtered = filtered.filter(
      level =>
        level.product_name?.toLowerCase().includes(searchTerm) ||
        level.product_sku?.toLowerCase().includes(searchTerm) ||
        level.product_category?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply location filter
  const location = filterValues.value.location;
  if (location) {
    filtered = filtered.filter(level => level.location_id === location);
  }

  // Apply stock status filter
  const stockStatus = filterValues.value.stock_status;
  if (stockStatus) {
    filtered = filtered.filter(level => level.stock_status === stockStatus);
  }

  // Apply category filter
  const category = filterValues.value.category;
  if (category) {
    filtered = filtered.filter(level => level.product_category === category);
  }

  // Apply quantity range filter
  const quantityRange = filterValues.value.quantity_range;
  if (quantityRange && typeof quantityRange === 'object' && 'min' in quantityRange) {
    filtered = filtered.filter(level => {
      const quantity = level.current_quantity || 0;
      const range = quantityRange as { min?: number; max?: number };
      if (range.min !== undefined && quantity < range.min) return false;
      if (range.max !== undefined && quantity > range.max) return false;
      return true;
    });
  }

  // Apply low stock filter
  const lowStockOnly = filterValues.value.low_stock_only;
  if (lowStockOnly) {
    filtered = filtered.filter(level => level.stock_status === 'low_stock');
  }

  return filtered;
});

// Table columns
const columns = computed(() => [
  {
    name: 'product_name',
    label: t('inventory.product'),
    field: 'product_name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'location_name',
    label: t('inventory.location'),
    field: 'location_name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'current_quantity',
    label: t('inventory.currentStock'),
    field: 'current_quantity',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'minimum_quantity',
    label: t('inventory.minimumStock'),
    field: 'minimum_quantity',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'stock_status',
    label: t('inventory.status'),
    field: 'stock_status',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'last_counted_at',
    label: t('inventory.lastCounted'),
    field: 'last_counted_at',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: t('inventory.actions'),
    field: '',
    align: 'center' as const,
    sortable: false,
  },
]);

// Adjustment type options
const adjustmentTypeOptions = computed(() => [
  { label: t('inventory.addStock'), value: 'add' },
  { label: t('inventory.removeStock'), value: 'remove' },
  { label: t('inventory.setStock'), value: 'set' },
]);

// Helper functions
const getQuantityColor = (stockLevel: any): string => {
  const quantity = stockLevel.current_quantity || 0;
  const minimum = stockLevel.minimum_quantity || 0;
  
  if (quantity === 0) return 'negative';
  if (quantity <= minimum) return 'warning';
  return 'positive';
};

const getQuantityTextColor = (stockLevel: any): string => {
  const color = getQuantityColor(stockLevel);
  return color === 'warning' ? 'black' : 'white';
};

const getStockStatusColor = (status: string): string => {
  switch (status) {
    case 'in_stock':
      return 'positive';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'negative';
    default:
      return 'grey';
  }
};

const getStockStatusTextColor = (status: string): string => {
  switch (status) {
    case 'low_stock':
      return 'black';
    default:
      return 'white';
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return date.formatDate(dateString, 'DD/MM/YYYY');
};

const formatTime = (dateObj: Date): string => {
  return date.formatDate(dateObj, 'HH:mm');
};

// Methods
const loadStockLevels = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        product:products(name, sku, category, unit),
        location:practice_locations(name)
      `)
      .eq('practice_id', authStore.clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;

         stockLevels.value = (data || []).map((level: any) => ({
       id: level.id,
       product_id: level.product_id,
       location_id: level.location_id,
       current_quantity: level.current_quantity || 0,
       minimum_quantity: level.minimum_quantity || 0,
       last_counted_at: level.last_counted_at,
       product_name: level.product?.name || 'Unknown Product',
       product_sku: level.product?.sku,
       product_category: level.product?.category,
       product_unit: level.product?.unit,
       location_name: level.location?.name || 'Unknown Location',
       stock_status: determineStockStatus(level.current_quantity, level.minimum_quantity),
     }));

    lastUpdated.value = new Date();
  } catch (error: any) {
    console.error('Failed to load stock levels:', error);
    $q.notify({
      type: 'negative',
      message: t('inventory.loadError'),
    });
  } finally {
    loading.value = false;
  }
};

const determineStockStatus = (current: number, minimum: number): string => {
  if (current <= 0) return 'out_of_stock';
  if (current <= minimum) return 'low_stock';
  return 'in_stock';
};

const refreshData = async () => {
  await loadStockLevels();
  $q.notify({
    type: 'positive',
    message: t('inventory.dataRefreshed'),
  });
};

const adjustStock = (stockLevel: any) => {
  selectedStockLevel.value = stockLevel;
  adjustmentType.value = 'add';
  adjustmentQuantity.value = null;
  adjustmentReason.value = '';
  showAdjustDialog.value = true;
};

const viewHistory = (stockLevel: any) => {
  $q.notify({
    type: 'info',
    message: t('inventory.historyNotImplemented'),
  });
};

const countStock = (stockLevel: any) => {
  $q.notify({
    type: 'info',
    message: t('inventory.countingNotImplemented'),
  });
};

const closeAdjustDialog = () => {
  showAdjustDialog.value = false;
  selectedStockLevel.value = null;
};

const performAdjustment = async () => {
  if (!selectedStockLevel.value || !adjustmentQuantity.value) {
    return;
  }

  try {
    adjusting.value = true;

    let newQuantity = selectedStockLevel.value.current_quantity;
    
    switch (adjustmentType.value) {
      case 'add':
        newQuantity += adjustmentQuantity.value;
        break;
      case 'remove':
        newQuantity = Math.max(0, newQuantity - adjustmentQuantity.value);
        break;
      case 'set':
        newQuantity = adjustmentQuantity.value;
        break;
    }

    const { error } = await supabase
      .from('stock_levels')
      .update({
        current_quantity: newQuantity,
        available_quantity: newQuantity, // Assuming no reservations for simplicity
      })
      .eq('id', selectedStockLevel.value.id);

    if (error) throw error;

    // TODO: Record stock movement in stock_movements table
    
    $q.notify({
      type: 'positive',
      message: t('inventory.stockAdjusted'),
    });

    closeAdjustDialog();
    await loadStockLevels();
  } catch (error: any) {
    console.error('Failed to adjust stock:', error);
    $q.notify({
      type: 'negative',
      message: t('inventory.adjustError'),
    });
  } finally {
    adjusting.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadStockLevels();
  
  // Initialize filter values with defaults
  if (inventoryFilterPreset.defaultFilters) {
    filterValues.value = inventoryFilterPreset.defaultFilters as any;
  }
});
</script>

<style lang="scss" scoped>
.stats-cards-container {
  .stats-card-col {
    padding: 0.5rem;

    .kpi-content {
      text-align: center;
      padding: 1rem;

      .kpi-value {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
        color: var(--q-primary);
        margin-bottom: 0.5rem;
      }

      .kpi-subtitle {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
}

.filters-section {
  .inventory-filter-panel {
    // Custom styling for the FilterPanel in inventory page
  }
}

.product-info {
  .product-name {
    font-weight: 500;
    line-height: 1.2;
  }

  .product-sku {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 0.25rem;
    font-family: monospace;
  }
}

.location-info {
  display: flex;
  align-items: center;
}
</style>
