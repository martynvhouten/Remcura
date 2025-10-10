<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('inventory.stockLevels')"
        :subtitle="$t('inventory.overview')"
        icon="inventory_2"
      >
        <template #actions>
          <q-btn
            icon="refresh"
            :loading="loading"
            round
            flat
            size="md"
            class="app-btn-refresh"
            @click="refreshData"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
        </template>
      </PageTitle>
    </template>

    <!-- Quick Stats Overview -->
    <div class="row q-mb-lg stats-cards-container">
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('inventory.totalProducts')"
          :subtitle="selectedLocationName"
          icon="inventory_2"
          icon-color="primary"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              <q-skeleton v-if="loading" type="text" width="48px" />
              <template v-else>{{ filteredStockLevels.length }}</template>
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.products') }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('inventory.stockLocations')"
          :subtitle="$t('inventory.activeLocations')"
          icon="location_on"
          icon-color="info"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              <q-skeleton v-if="loading" type="text" width="48px" />
              <template v-else>{{ clinicStore.locations.length }}</template>
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.locations') }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('inventory.dataLoaded')"
          :subtitle="$t('inventory.upToDate')"
          icon="check_circle"
          icon-color="positive"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              <q-skeleton v-if="loading" type="text" width="24px" />
              <template v-else>
                {{ inventoryStore.realtimeConnected ? '🔄' : '✓' }}
              </template>
            </div>
            <div class="kpi-subtitle">
              {{
                inventoryStore.realtimeConnected
                  ? $t('inventory.realTimeConnected')
                  : $t('inventory.status')
              }}
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('inventory.lastUpdated')"
          :subtitle="$t('inventory.refreshData')"
          icon="refresh"
          icon-color="warning"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              <q-skeleton v-if="loading" type="text" width="48px" />
              <template v-else>{{
                lastUpdated ? formatTime(lastUpdated) : '-'
              }}</template>
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.lastSync') }}</div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Error Banner -->
    <q-banner
      v-if="errorState.visible"
      dense
      class="q-mb-md bg-negative text-white"
      rounded
    >
      <div class="row items-center">
        <q-icon name="error_outline" class="q-mr-sm" />
        <div class="col">{{ errorState.message }}</div>
        <div class="col-auto">
          <q-btn
            flat
            dense
            color="white"
            :label="$t('common.retry')"
            @click="onRetry"
          />
        </div>
      </div>
    </q-banner>

    <!-- Modern FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        v-model="filterValues"
        :preset="inventoryFilterPreset"
        :loading="loading"
        collapsible
        class="inventory-filter-panel"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
      />
    </div>

    <!-- Stock Levels Table -->
    <div class="medical-table">
      <q-table
        :rows="filteredStockLevels"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="{ rowsPerPage: 25 }"
        flat
        bordered
        separator="cell"
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
              {{ props.row.current_quantity }}
              {{ props.row.product_unit || 'pcs' }}
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
              <q-icon
                name="location_on"
                size="xs"
                color="info"
                class="q-mr-xs"
              />
              {{ props.row.location_name }}
            </div>
          </q-td>
        </template>

        <template #body-cell-last_counted_at="props">
          <q-td :props="props">
            {{
              props.row.last_counted_at
                ? formatDate(props.row.last_counted_at)
                : '-'
            }}
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
    </div>

    <!-- Stock Adjustment Dialog -->
    <FormDialog
      v-model="showAdjustDialog"
      :title="$t('inventory.adjustStock')"
      icon="tune"
      size="md"
      :loading="adjusting"
      :submit-button-text="$t('inventory.adjust')"
      @submit="performAdjustment"
      @cancel="closeAdjustDialog"
    >
      <div v-if="selectedStockLevel" class="adjustment-product-info">
        <div class="product-name">{{ selectedStockLevel.product_name }}</div>
        <div class="current-stock">
          {{ $t('inventory.currentStock') }}:
          {{ selectedStockLevel.current_quantity }}
          {{ selectedStockLevel.product_unit || 'pcs' }}
        </div>
      </div>

      <div class="q-gutter-md">
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
          :rules="[
            val => (val !== null && val > 0) || $t('validation.required'),
          ]"
        />

        <q-input
          v-model="adjustmentReason"
          :label="$t('inventory.reason')"
          type="textarea"
          outlined
          rows="3"
        />
      </div>
    </FormDialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar, date } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import PageTitle from 'src/components/PageTitle.vue';
  import PageLayout from 'src/components/PageLayout.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';
  import FormDialog from 'src/components/base/FormDialog.vue';
  import FilterPanel from 'src/components/filters/FilterPanel.vue';
  import { inventoryFilterPreset } from 'src/presets/filters/inventory';
  import { supabase } from 'src/boot/supabase';
  import { useAuthStore } from 'src/stores/auth';
  import { useClinicStore } from 'src/stores/clinic';
  import { useInventoryStore } from 'src/stores/inventory';
  import { ServiceErrorHandler } from 'src/utils/service-error-handler';
  import type { StockUpdateRequest } from 'src/types/inventory';
  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from 'src/types/filters';

  const $q = useQuasar();
  const { t } = useI18n();
  const authStore = useAuthStore();
  const clinicStore = useClinicStore();
  const inventoryStore = useInventoryStore();

  // Refs
  const loading = ref(false);
  const adjusting = ref(false);
  const showAdjustDialog = ref(false);
  interface StockLevelRow {
    id: string;
    product_id: string;
    location_id: string;
    current_quantity: number;
    minimum_quantity: number;
    last_counted_at?: string | null;
    product_name: string;
    product_sku: string | null;
    product_category: string | null;
    product_unit: string;
    location_name: string;
    stock_status: string;
  }

  const selectedStockLevel = ref<StockLevelRow | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const errorState = ref<{
    visible: boolean;
    message: string;
    retry?: () => void;
  }>({ visible: false, message: '' });

  // New filter state for FilterPanel
  const filterValues = ref<FilterValues>({});

  // Adjustment state
  const adjustmentType = ref('add');
  const adjustmentQuantity = ref<number | null>(null);
  const adjustmentReason = ref('');

  // Data
  const stockLevels = ref<StockLevelRow[]>([]);
  const isDemoMode = computed(() => !authStore.clinicId);

  // Filter event handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // Filter logic is handled by computed property
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    // boundary: preset filters have more specific shape than FilterValues
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
    if (
      quantityRange &&
      typeof quantityRange === 'object' &&
      'min' in quantityRange
    ) {
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
  const getQuantityColor = (stockLevel: StockLevelRow): string => {
    const quantity = stockLevel.current_quantity || 0;
    const minimum = stockLevel.minimum_quantity || 0;

    if (quantity === 0) return 'negative';
    if (quantity <= minimum) return 'warning';
    return 'positive';
  };

  const getQuantityTextColor = (stockLevel: StockLevelRow): string => {
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
      // Demo fallback: no practice selected
      if (!authStore.clinicId) {
        stockLevels.value = generateDemoStockLevels();
        await updateLastSync();
        errorState.value = { visible: false, message: '' };
        return;
      }
      const { data, error } = await supabase
        .from('stock_levels')
        .select(
          `
        *,
        product:products(name, sku, category, unit),
        location:practice_locations(name)
      `
        )
        .eq('practice_id', authStore.clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // boundary: Supabase query results may have extra JOIN fields beyond StockLevelRow
      stockLevels.value = (data || []).map((level: any) => ({
        id: level.id,
        product_id: level.product_id,
        location_id: level.location_id,
        current_quantity: level.current_quantity || 0,
        minimum_quantity: level.minimum_stock || 0,
        last_counted_at: level.last_counted_at,
        product_name: level.product?.name || `Product ${level.product_id}`,
        product_sku: level.product?.sku || null,
        product_category: level.product?.category || null,
        product_unit: level.product?.unit || 'pcs',
        location_name: level.location?.name || `Location ${level.location_id}`,
        stock_status: determineStockStatus(
          level.current_quantity,
          level.minimum_stock || 0
        ),
      }));
      await updateLastSync();
      errorState.value = { visible: false, message: '' };
    } catch (error: any) {
      // boundary: external error types vary
      ServiceErrorHandler.handle(
        error,
        {
          service: 'InventoryLevels',
          operation: 'loadStockLevels',
          metadata: { practiceId: authStore.clinicId },
        },
        { rethrow: false }
      );
      errorState.value = {
        visible: true,
        message: t('inventory.loadError'),
        retry: async () => {
          await loadStockLevels();
        },
      };
    } finally {
      loading.value = false;
    }
  };

  const updateLastSync = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('created_at')
        .eq('practice_id', authStore.clinicId ?? '')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0 && data[0]?.created_at) {
        lastUpdated.value = new Date(data[0].created_at);
      } else {
        lastUpdated.value = new Date();
      }
    } catch {
      lastUpdated.value = new Date();
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

  const adjustStock = (stockLevel: StockLevelRow) => {
    selectedStockLevel.value = stockLevel;
    adjustmentType.value = 'add';
    adjustmentQuantity.value = null;
    adjustmentReason.value = '';
    showAdjustDialog.value = true;
  };

  const viewHistory = (stockLevel: StockLevelRow) => {
    $q.notify({
      type: 'info',
      message: t('inventory.historyNotImplemented'),
    });
  };

  const countStock = (stockLevel: StockLevelRow) => {
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
    if (!selectedStockLevel.value || !adjustmentQuantity.value) return;

    // Store reference to avoid non-null assertions
    const stockLevel = selectedStockLevel.value;
    const practiceId = authStore.clinicId;

    try {
      adjusting.value = true;

      const currentQty = stockLevel.current_quantity;
      let targetQty = currentQty;
      switch (adjustmentType.value) {
        case 'add':
          targetQty = currentQty + adjustmentQuantity.value;
          break;
        case 'remove':
          targetQty = Math.max(0, currentQty - adjustmentQuantity.value);
          break;
        case 'set':
          targetQty = adjustmentQuantity.value;
          break;
      }
      const delta = targetQty - currentQty;
      if (delta === 0) {
        closeAdjustDialog();
        return;
      }

      // Demo fallback: update local state only, no persistence
      if (!practiceId) {
        // Update local list to reflect change
        const idx = stockLevels.value.findIndex(s => s.id === stockLevel.id);
        if (idx !== -1 && stockLevels.value[idx]) {
          const updated = {
            ...stockLevels.value[idx],
            current_quantity: Math.max(0, targetQty),
            stock_status: determineStockStatus(
              Math.max(0, targetQty),
              stockLevels.value[idx]?.minimum_quantity || 0
            ),
          } as StockLevelRow;
          stockLevels.value.splice(idx, 1, updated);
        }
        $q.notify({ type: 'positive', message: t('inventory.stockAdjusted') });
        closeAdjustDialog();
        await updateLastSync();
        return;
      }

      // Prefer RPC if available, fallback to store update
      const tryRpc = async () => {
        return await supabase.rpc('update_stock_level', {
          p_practice_id: practiceId,
          p_location_id: stockLevel.location_id,
          p_product_id: stockLevel.product_id,
          p_quantity_change: delta,
          p_movement_type: 'adjustment',
          p_performed_by: authStore.user?.id ?? '',
          p_reference_type: 'manual_adjustment',
          p_reference_id: stockLevel.id,
          p_reason_code: 'manual_adjustment',
          p_notes: adjustmentReason.value ?? '',
        });
      };

      let rpcOk = false;
      try {
        const { error: rpcError } = await tryRpc();
        if (!rpcError) rpcOk = true;
      } catch {
        rpcOk = false;
      }

      if (!rpcOk) {
        const request: StockUpdateRequest = {
          practice_id: practiceId,
          location_id: stockLevel.location_id,
          product_id: stockLevel.product_id,
          quantity_change: delta,
          movement_type: 'adjustment',
          // boundary: RPC procedure expects specific enum type for reason_code
          reason_code: 'manual_adjustment' as any,
          notes: adjustmentReason.value || '',
        };
        await inventoryStore.updateStockLevel(request);
      }

      $q.notify({ type: 'positive', message: t('inventory.stockAdjusted') });
      closeAdjustDialog();
      await loadStockLevels();
    } catch (error: any) {
      // boundary: external error types vary
      ServiceErrorHandler.handle(
        error,
        {
          service: 'InventoryLevels',
          operation: 'performAdjustment',
          metadata: {
            practiceId: authStore.clinicId,
            productId: selectedStockLevel.value?.product_id,
            locationId: selectedStockLevel.value?.location_id,
          },
        },
        { rethrow: false }
      );
      errorState.value = {
        visible: true,
        message: t('inventory.adjustError'),
        retry: async () => {
          await performAdjustment();
        },
      };
    } finally {
      adjusting.value = false;
    }
  };

  const onRetry = async () => {
    const retry = errorState.value.retry;
    errorState.value = { visible: false, message: '' };
    if (retry) await retry();
    else await loadStockLevels();
  };

  // Demo data generator
  const generateDemoStockLevels = (): StockLevelRow[] => {
    const demo: StockLevelRow[] = [
      {
        id: 'demo-1',
        product_id: 'prod-1',
        location_id: 'loc-1',
        current_quantity: 24,
        minimum_quantity: 10,
        last_counted_at: null,
        product_name: 'Handschoenen Maat M',
        product_sku: 'GLV-M',
        product_category: 'Verbruik',
        product_unit: 'pcs',
        location_name: 'Demo Magazijn',
        stock_status: determineStockStatus(24, 10),
      },
      {
        id: 'demo-2',
        product_id: 'prod-2',
        location_id: 'loc-1',
        current_quantity: 5,
        minimum_quantity: 8,
        last_counted_at: null,
        product_name: 'Desinfectiemiddel 500ml',
        product_sku: 'DSF-500',
        product_category: 'Hygiëne',
        product_unit: 'btl',
        location_name: 'Demo Magazijn',
        stock_status: determineStockStatus(5, 8),
      },
      {
        id: 'demo-3',
        product_id: 'prod-3',
        location_id: 'loc-2',
        current_quantity: 0,
        minimum_quantity: 2,
        last_counted_at: null,
        product_name: 'Pleisters set',
        product_sku: 'PLS-SET',
        product_category: 'EHBO',
        product_unit: 'set',
        location_name: 'Behandelkamer 1',
        stock_status: determineStockStatus(0, 2),
      },
    ];
    return demo;
  };

  // Lifecycle
  onMounted(async () => {
    await loadStockLevels();

    // Initialize filter values with defaults
    if (inventoryFilterPreset.defaultFilters) {
      // boundary: preset filters have more specific shape than FilterValues
      filterValues.value = inventoryFilterPreset.defaultFilters as any;
    }
  });
</script>

<style lang="scss" scoped>
  // ===================================================================
  // Inventory levels page styles
  // ===================================================================

  .stats-cards-container {
    .stats-card-col {
      padding: var(--space-2);

      .kpi-content {
        text-align: center;
        padding: var(--space-4);

        .kpi-value {
          font-family: var(--font-family);
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--leading-tight);
          color: var(--brand-primary);
          margin-bottom: var(--space-2);
          font-variant-numeric: tabular-nums;
        }

        .kpi-subtitle {
          font-family: var(--font-family);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: var(--leading-normal);
        }
      }
    }
  }

  .filters-section {
    margin-bottom: var(--space-6);

    .inventory-filter-panel {
      // FilterPanel defines its own styling
      // No additional customization needed
    }
  }

  .product-info {
    .product-name {
      font-family: var(--font-family);
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-base);
      color: var(--text-primary);
      line-height: var(--leading-tight);
    }

    .product-sku {
      font-family: var(--font-family-mono);
      font-size: var(--text-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-tertiary);
      margin-top: var(--space-1);
      background: var(--bg-tertiary);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      display: inline-block;
    }
  }

  .location-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);

    .location-name {
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .location-type {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }

  // ===================================================================
  // DARK MODE SUPPORT
  // ===================================================================

  // Adjustment dialog styles
  .adjustment-product-info {
    padding: var(--space-4);
    background: var(--neutral-50);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);

    .product-name {
      font-size: var(--text-base);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .current-stock {
      font-size: var(--text-sm);
      color: var(--neutral-600);
    }
  }

  // Dark mode adjustments - merged duplicate selectors
  body.body--dark {
    .stats-cards-container {
      .kpi-content {
        .kpi-value {
          color: var(--brand-primary-light);
        }

        .kpi-subtitle {
          color: var(--text-secondary);
        }
      }
    }

    .product-info {
      .product-name {
        color: var(--text-primary);
      }

      .product-sku {
        color: var(--text-tertiary);
        background: var(--bg-tertiary);
      }
    }

    .location-info {
      .location-name {
        color: var(--text-primary);
      }

      .location-type {
        color: var(--text-secondary);
      }
    }

    .adjustment-product-info {
      background: var(--neutral-800);

      .product-name {
        color: var(--neutral-100);
      }

      .current-stock {
        color: var(--neutral-400);
      }
    }
  }
</style>
