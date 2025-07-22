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
        <!-- Location Filter -->
        <q-select
          v-model="selectedLocation"
          :options="locationOptions"
          :label="$t('inventory.currentLocation')"
          outlined
          dense
          emit-value
          map-options
          style="min-width: 200px"
          @update:model-value="loadStockLevels"
        />

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
              {{ stockLevels.length }}
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
              {{ loading ? '...' : '✓' }}
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.status') }}</div>
          </div>
        </BaseCard>
      </div>

      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          variant="modern"
          :title="$t('inventory.lastUpdated')"
          :subtitle="$t('inventory.refreshData')"
          icon="refresh"
          header-color="secondary"
        >
          <div class="kpi-content">
            <div class="kpi-value">
              {{ new Date().getHours() }}:{{ String(new Date().getMinutes()).padStart(2, '0') }}
            </div>
            <div class="kpi-subtitle">{{ $t('inventory.time') }}</div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Filter Bar -->
    <BaseCard class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <!-- Search -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              :placeholder="$t('inventory.searchProducts')"
              outlined
              dense
              clearable
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Stock Status Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.stockStatus"
              :options="stockStatusOptions"
              :label="$t('inventory.stockStatus')"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <!-- Category Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.category"
              :options="categoryOptions"
              :label="$t('inventory.category')"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <!-- Clear Filters -->
          <div class="col-12 col-md-2">
            <q-btn
              :label="$t('common.clearFilters')"
              icon="clear"
              color="grey-7"
              flat
              @click="clearFilters"
            />
          </div>
        </div>
      </q-card-section>
    </BaseCard>

    <!-- Stock Levels Table -->
    <BaseCard>
      <q-table
        :rows="filteredStockLevels"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="{ rowsPerPage: 25 }"
        class="stock-levels-table"
      >
        <template v-slot:body-cell-product="props">
          <q-td :props="props">
            <div class="product-info">
              <div class="product-name">{{ props.row.product_name }}</div>
              <div class="product-sku text-caption text-grey-6">
                {{ props.row.product_sku }}
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-stock_status="props">
          <q-td :props="props">
            <q-chip
              :color="getStockStatusColor(props.row.stock_status)"
              text-color="white"
              size="sm"
              :icon="getStockStatusIcon(props.row.stock_status)"
            >
              {{ $t(`inventory.${props.row.stock_status}`) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-current_quantity="props">
          <q-td :props="props">
            <div class="stock-quantity">
              <span class="current-stock">{{
                props.row.current_quantity
              }}</span>
              <span class="stock-unit text-caption text-grey-6">{{
                props.row.unit || 'st'
              }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-levels="props">
          <q-td :props="props">
            <div class="stock-levels">
              <div class="level-item">
                <span class="level-label">Min:</span>
                <span class="level-value">{{ props.row.minimum_stock }}</span>
              </div>
              <div class="level-item">
                <span class="level-label">Max:</span>
                <span class="level-value">{{ props.row.maximum_stock }}</span>
              </div>
              <div class="level-item">
                <span class="level-label">Bestel:</span>
                <span class="level-value">{{ props.row.reorder_point }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn-group dense>
              <q-btn
                icon="edit"
                size="sm"
                flat
                color="primary"
                @click="editStockLevel(props.row)"
                :title="$t('inventory.adjustStock')"
              />
              <q-btn
                icon="history"
                size="sm"
                flat
                color="grey-6"
                @click="viewMovements(props.row)"
                :title="$t('inventory.viewMovements')"
              />
            </q-btn-group>
          </q-td>
        </template>
      </q-table>
    </BaseCard>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from 'src/stores/auth';
  import { useClinicStore } from 'src/stores/clinic';
  import { supabase } from 'src/boot/supabase';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import BaseCard from 'src/components/base/BaseCard.vue';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();
  const clinicStore = useClinicStore();

  // State
  const loading = ref(false);
  const stockLevels = ref<any[]>([]); // Properly typed to allow clinic_products data
  const selectedLocation = ref('all');
  const isUnmounted = ref(false);
  const filters = ref({
    search: '',
    stockStatus: '',
    category: '',
  });

  // Computed
  const locationOptions = computed(() => [
    { label: t('inventory.allLocations'), value: 'all' },
    ...clinicStore.locations.map(loc => ({
      label: loc.name,
      value: loc.id,
    })),
  ]);

  const selectedLocationName = computed(() => {
    if (selectedLocation.value === 'all') return t('inventory.allLocations');
    const location = clinicStore.locations.find(
      loc => loc.id === selectedLocation.value
    );
    return location?.name || t('inventory.allLocations');
  });

  const categoryOptions = computed(() => {
    const categories = new Set();
    stockLevels.value.forEach(item => {
      if (item.product_category) {
        categories.add(item.product_category);
      }
    });
    return Array.from(categories).map(cat => ({
      label: cat,
      value: cat,
    }));
  });

  const stockStatusOptions = computed(() => [
    { label: t('inventory.inStock'), value: 'in_stock' },
    { label: t('inventory.lowStock'), value: 'low_stock' },
    { label: t('inventory.outOfStock'), value: 'out_of_stock' },
  ]);

  const filteredStockLevels = computed(() => {
    let result = [...stockLevels.value];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(
        item =>
          item.product_name.toLowerCase().includes(searchTerm) ||
          item.product_sku.toLowerCase().includes(searchTerm)
      );
    }

    // Apply stock status filter
    if (filters.value.stockStatus) {
      result = result.filter(
        item => item.stock_status === filters.value.stockStatus
      );
    }

    // Apply category filter
    if (filters.value.category) {
      result = result.filter(
        item => item.product_category === filters.value.category
      );
    }

    return result;
  });

  const statsCards = computed(() => {
    const stats = {
      total: stockLevels.value.length,
      inStock: stockLevels.value.filter(
        item => item.stock_status === 'in_stock'
      ).length,
      lowStock: stockLevels.value.filter(
        item => item.stock_status === 'low_stock'
      ).length,
      outOfStock: stockLevels.value.filter(
        item => item.stock_status === 'out_of_stock'
      ).length,
    };

    return [
      {
        label: t('inventory.totalProducts'),
        value: stats.total,
        icon: 'inventory_2',
        iconColor: 'primary',
      },
      {
        label: t('inventory.inStock'),
        value: stats.inStock,
        icon: 'check_circle',
        iconColor: 'positive',
      },
      {
        label: t('inventory.lowStock'),
        value: stats.lowStock,
        icon: 'warning',
        iconColor: 'warning',
      },
      {
        label: t('inventory.outOfStock'),
        value: stats.outOfStock,
        icon: 'cancel',
        iconColor: 'negative',
      },
    ];
  });

  const columns = computed(() => [
    {
      name: 'product',
      label: t('inventory.product'),
      align: 'left' as const,
      field: 'product_name',
      sortable: true,
    },
    {
      name: 'current_quantity',
      label: t('inventory.currentStock'),
      align: 'center' as const,
      field: 'current_quantity',
      sortable: true,
    },
    {
      name: 'stock_status',
      label: t('inventory.status'),
      align: 'center' as const,
      field: 'stock_status',
      sortable: true,
    },
    {
      name: 'levels',
      label: t('inventory.stockLevels'),
      align: 'center' as const,
      field: 'levels',
      sortable: false,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      field: 'actions',
      sortable: false,
    },
  ]);

  // Functions
  const loadStockLevels = async () => {
    if (isUnmounted.value) return;
    
    loading.value = true;
    try {
      if (!authStore.clinicId) {
        stockLevels.value = [];
        return;
      }

      let query = supabase
        .from('clinic_products')
        .select(`
          *,
          product:products (
            id,
            name,
            sku,
            category,
            brand,
            unit
          )
        `)
        .eq('clinic_id', authStore.clinicId);

      if (selectedLocation.value !== 'all') {
        query = query.eq('location_id', selectedLocation.value);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (isUnmounted.value) return; // Check again after async operation

      stockLevels.value = data || [];
    } catch (error) {
      if (!isUnmounted.value) {
        console.error('Error loading stock levels:', error);
        $q.notify({
          type: 'negative',
          message: t('errors.failedToLoadData'),
        });
      }
    } finally {
      if (!isUnmounted.value) {
        loading.value = false;
      }
    }
  };

  const determineStockStatus = (current: number, minimum: number): string => {
    if (current <= 0) return 'out_of_stock';
    if (current <= minimum) return 'low_stock';
    return 'in_stock';
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

  const getStockStatusIcon = (status: string): string => {
    switch (status) {
      case 'in_stock':
        return 'check_circle';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'help';
    }
  };

  const refreshData = async () => {
    await Promise.all([
      clinicStore.fetchLocations(authStore.clinicId || ''),
      loadStockLevels(),
    ]);
    $q.notify({
      type: 'positive',
      message: t('inventory.dataRefreshed'),
    });
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      stockStatus: '',
      category: '',
    };
  };

  const editStockLevel = (_stockLevel: any) => {
    $q.notify({
      type: 'info',
      message: t('common.comingSoon'),
    });
  };

  const viewMovements = (_stockLevel: any) => {
    $q.notify({
      type: 'info',
      message: t('common.comingSoon'),
    });
  };

  // Lifecycle
  onMounted(async () => {
    if (authStore.clinicId && !isUnmounted.value) {
      await Promise.all([
        clinicStore.fetchLocations(authStore.clinicId),
        loadStockLevels(),
      ]);
    }
  });

  onBeforeUnmount(() => {
    isUnmounted.value = true;
    loading.value = false;
  });
</script>

<style lang="scss" scoped>
  .stock-levels-table {
    .product-info {
      .product-name {
        font-weight: 500;
        margin-bottom: 2px;
      }
    }

    .stock-quantity {
      display: flex;
      align-items: center;
      gap: 4px;

      .current-stock {
        font-weight: 600;
        font-size: 1.1em;
      }
    }

    .stock-levels {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .level-item {
        display: flex;
        justify-content: space-between;
        min-width: 80px;

        .level-label {
          font-size: 0.75rem;
          color: var(--q-grey-6);
        }

        .level-value {
          font-weight: 500;
          font-size: 0.8rem;
        }
      }
    }
  }

  // Stats cards styling
  .stats-cards-container {
    gap: 0;

    .stats-card-col {
      padding: 8px;

      @media (max-width: 640px) {
        padding: 6px;
      }
    }
  }
</style>
