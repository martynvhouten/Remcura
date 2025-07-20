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

    <!-- Statistics Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <BaseCard
        v-for="(stat, key) in statsCards"
        :key="key"
        class="col-12 col-sm-6 col-md-3"
        padding="none"
      >
        <q-card-section class="text-center">
          <div class="text-h4" :class="stat.color">{{ stat.value }}</div>
          <div class="text-caption text-grey-7">{{ stat.label }}</div>
        </q-card-section>
      </BaseCard>
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
                props.row.unit || "st"
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
import { ref, computed, onMounted } from 'vue';
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
const stockLevels = ref([]);
const selectedLocation = ref('all');
const filters = ref({
  search: '',
  stockStatus: '',
  category: '',
});

// Computed
const locationOptions = computed(() => [
  { label: t('inventory.allLocations'), value: 'all' },
  ...clinicStore.locations.map((loc) => ({
    label: loc.name,
    value: loc.id,
  })),
]);

const categoryOptions = computed(() => {
  const categories = new Set();
  stockLevels.value.forEach((item) => {
    if (item.product_category) {
      categories.add(item.product_category);
    }
  });
  return Array.from(categories).map((cat) => ({
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
      (item) =>
        item.product_name.toLowerCase().includes(searchTerm) ||
        item.product_sku.toLowerCase().includes(searchTerm)
    );
  }

  // Apply stock status filter
  if (filters.value.stockStatus) {
    result = result.filter(
      (item) => item.stock_status === filters.value.stockStatus
    );
  }

  // Apply category filter
  if (filters.value.category) {
    result = result.filter(
      (item) => item.product_category === filters.value.category
    );
  }

  return result;
});

const statsCards = computed(() => {
  const stats = {
    total: stockLevels.value.length,
    inStock: stockLevels.value.filter(
      (item) => item.stock_status === 'in_stock'
    ).length,
    lowStock: stockLevels.value.filter(
      (item) => item.stock_status === 'low_stock'
    ).length,
    outOfStock: stockLevels.value.filter(
      (item) => item.stock_status === 'out_of_stock'
    ).length,
  };

  return [
    {
      label: t('inventory.totalProducts'),
      value: stats.total,
      color: 'text-primary',
    },
    {
      label: t('inventory.inStock'),
      value: stats.inStock,
      color: 'text-positive',
    },
    {
      label: t('inventory.lowStock'),
      value: stats.lowStock,
      color: 'text-warning',
    },
    {
      label: t('inventory.outOfStock'),
      value: stats.outOfStock,
      color: 'text-negative',
    },
  ];
});

const columns = computed(() => [
  {
    name: 'product',
    label: t('inventory.product'),
    align: 'left',
    field: 'product_name',
    sortable: true,
  },
  {
    name: 'current_quantity',
    label: t('inventory.currentStock'),
    align: 'center',
    field: 'current_quantity',
    sortable: true,
  },
  {
    name: 'stock_status',
    label: t('inventory.status'),
    align: 'center',
    field: 'stock_status',
    sortable: true,
  },
  {
    name: 'levels',
    label: t('inventory.stockLevels'),
    align: 'center',
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center',
  },
]);

// Methods
const loadStockLevels = async () => {
  if (!authStore.clinicId) return;

  loading.value = true;
  try {
    let query = supabase
      .from('stock_levels')
      .select(
        `
        *,
        products (
          name,
          sku,
          category,
          unit
        ),
        locations (
          name
        )
      `
      )
      .eq('practice_id', authStore.clinicId);

    if (selectedLocation.value !== 'all') {
      query = query.eq('location_id', selectedLocation.value);
    }

    const { data, error } = await query.order('products(name)');

    if (error) throw error;

    stockLevels.value = data.map((item) => ({
      ...item,
      product_name: item.products?.name || t('common.unknownProduct'),
      product_sku: item.products?.sku || t('common.noSku'),
      product_category: item.products?.category || t('common.uncategorized'),
      unit: item.products?.unit || t('common.defaultUnit'),
      location_name: item.locations?.name || t('common.unknownLocation'),
      stock_status: determineStockStatus(
        item.current_quantity,
        item.minimum_stock
      ),
    }));
  } catch (error) {
    console.error('Error loading stock levels:', error);
    $q.notify({
      type: 'negative',
      message: t('inventory.loadingError'),
    });
  } finally {
    loading.value = false;
  }
};

const determineStockStatus = (current, minimum) => {
  if (current <= 0) return 'out_of_stock';
  if (current <= minimum) return 'low_stock';
  return 'in_stock';
};

const getStockStatusColor = (status) => {
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

const getStockStatusIcon = (status) => {
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
    clinicStore.fetchLocations(authStore.clinicId),
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

const editStockLevel = (_stockLevel) => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
  });
};

const viewMovements = (_stockLevel) => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
  });
};

// Lifecycle
onMounted(async () => {
  if (authStore.clinicId) {
    await Promise.all([
      clinicStore.fetchLocations(authStore.clinicId),
      loadStockLevels(),
    ]);
  }
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
</style>
