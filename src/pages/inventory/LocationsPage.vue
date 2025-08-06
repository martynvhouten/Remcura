<template>
  <PageLayout>
    <PageTitle
      :title="$t('locations.title')"
      :subtitle="$t('locations.manage')"
      icon="place"
    />

    <!-- Summary Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ locations.length }}</div>
                <div class="text-caption text-grey">
                  {{ $t('locations.allLocations') }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="place" size="24px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ mainLocationsCount }}</div>
                <div class="text-caption text-grey">
                  {{ $t('locations.mainLocations') }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="star" size="24px" color="warning" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Coming Soon Banner -->
    <q-banner rounded class="bg-info text-white q-mb-lg">
      <template v-slot:avatar>
        <q-icon name="info" color="white" />
      </template>
      <div class="text-subtitle1">{{ $t('locations.title') }}</div>
      <div class="text-body2 q-mt-xs">
        {{ $t('locations.comingSoonDescription') }}
      </div>
    </q-banner>

    <!-- Modern FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="locationsFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="loading"
        collapsible
        class="locations-filter-panel"
      />
    </div>

    <!-- Actions -->
    <div class="row q-gutter-md items-center q-mb-lg">
      <div class="col-auto">
        <q-btn
          :label="$t('locations.add')"
          icon="add"
          unelevated
          no-caps
          class="app-btn-success"
          @click="showComingSoon"
        />
      </div>
    </div>

    <!-- Locations Table -->
    <div class="medical-table">
      <q-table
        :rows="sortedLocations"
        :columns="enhancedColumns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        flat
        bordered
        separator="cell"
        :rows-per-page-options="[10, 25, 50]"
        :no-data-label="$t('locations.noLocations')"
        @request="onTableRequest"
      >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" size="sm" flat dense @click="showComingSoon" />
          <q-btn
            icon="delete"
            size="sm"
            flat
            dense
            color="negative"
            @click="showComingSoon"
          />
        </q-td>
      </template>
    </q-table>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import PageTitle from '@/components/PageTitle.vue';
  import PageLayout from '@/components/PageLayout.vue';
  import FilterPanel from 'src/components/filters/FilterPanel.vue';
  import { useAuthStore } from 'src/stores/auth';
  import { useTableSorting } from 'src/composables/useTableSorting';
  import { locationsFilterPreset } from 'src/presets/filters/locations';
  import type { FilterValues, FilterChangeEvent, FilterResetEvent } from 'src/types/filters';

  const { t } = useI18n();
  const $q = useQuasar();

  // Table sorting
  const { pagination, onTableRequest, sortData } = useTableSorting({
    rowsPerPage: 25
  });

  // State
  const authStore = useAuthStore();
  const isUnmounted = ref(false);

  // Data
  const loading = ref(false);

  // Modern Filter System
  const filterValues = ref<FilterValues>({});

  // Sample data for demonstration - using computed to ensure reactivity with translations
  const locations = computed(() => [
    {
      id: 1,
      name: t('locations.sampleData.mainWarehouse.name'),
      type: t('locations.sampleData.mainWarehouse.type'),
      description: t('locations.sampleData.mainWarehouse.description'),
      capacity: t('locations.capacityItems', { count: 1000 }),
      isMain: true,
    },
    {
      id: 2,
      name: t('locations.sampleData.pharmacy.name'),
      type: t('locations.sampleData.pharmacy.type'),
      description: t('locations.sampleData.pharmacy.description'),
      capacity: t('locations.capacityItems', { count: 500 }),
      isMain: false,
    },
    {
      id: 3,
      name: t('locations.sampleData.treatmentRoom.name'),
      type: t('locations.sampleData.treatmentRoom.type'),
      description: t('locations.sampleData.treatmentRoom.description'),
      capacity: t('locations.capacityItems', { count: 50 }),
      isMain: false,
    },
  ]);

  // Computed
  const filteredLocations = computed(() => {
    let filtered = [...locations.value];

    // Apply search filter
    if (filterValues.value.search) {
      const searchTerm = String(filterValues.value.search).toLowerCase();
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchTerm) ||
        location.type.toLowerCase().includes(searchTerm) ||
        location.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply type filter
    if (filterValues.value.type) {
      filtered = filtered.filter(location => 
        location.type.toLowerCase() === String(filterValues.value.type).toLowerCase()
      );
    }

    // Apply main location filter
    if (filterValues.value.is_main === true) {
      filtered = filtered.filter(location => location.isMain === true);
    }

    return filtered;
  });

  // Apply sorting to filtered locations
  const sortedLocations = computed(() => {
    return sortData(filteredLocations.value, pagination.value.sortBy, pagination.value.descending);
  });

  const mainLocationsCount = computed(() => {
    return locations.value.filter(loc => loc.isMain).length;
  });

  const enhancedColumns = computed(() => [
    {
      name: 'name',
      label: t('locations.name'),
      field: 'name',
      align: 'left' as const,
      sortable: true,
      classes: 'col-name',
      headerClasses: 'col-name',
    },
    {
      name: 'type',
      label: t('locations.type'),
      field: 'type',
      align: 'left' as const,
      sortable: true,
      classes: 'col-status',
      headerClasses: 'col-status',
    },
    {
      name: 'description',
      label: t('locations.description'),
      field: 'description',
      align: 'left' as const,
      sortable: false,
    },
    {
      name: 'capacity',
      label: t('locations.capacity'),
      field: 'capacity',
      align: 'left' as const,
      sortable: false,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      field: 'actions',
      align: 'center' as const,
      sortable: false,
      classes: 'col-actions',
      headerClasses: 'col-actions',
    },
  ]);

  // Filter event handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // Handle individual filter changes if needed
    // Filters are applied automatically via computed properties
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    // Handle filter reset - filters automatically reset via v-model
  };

  const handleFilterClear = () => {
    // Handle all filters cleared - filters automatically cleared via v-model
  };

  // Methods
  const showComingSoon = () => {
    $q.notify({
      type: 'info',
      message: t('locations.comingSoonDescription'),
      position: 'top',
    });
  };

  // Lifecycle
  onMounted(() => {
    // Future: Load actual locations from API
  });

  onBeforeUnmount(() => {
    isUnmounted.value = true;
  });
</script>

<style scoped>
  .locations-content {
    padding: 24px;
  }

  .coming-soon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
  }
</style>
