<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('inventory.movements.title')"
        :subtitle="$t('inventory.movements.subtitle')"
        icon="timeline"
      >
        <template #actions>
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="refreshData"
            :loading="movementsLoading"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>

          <q-btn
            icon="file_download"
            :label="$t('common.export')"
            @click="exportMovements"
            unelevated
            no-caps
            class="app-btn-secondary"
          />
        </template>
      </PageTitle>
    </template>

    <!-- FilterPanel component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="movementsFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="movementsLoading"
        collapsible
        class="movements-filter-panel"
      />
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
          <q-btn flat dense color="white" :label="$t('common.retry')" @click="errorState.retry?.()" />
        </div>
      </div>
    </q-banner>

    <!-- Main Content -->
    <div class="movements-content">
      <!-- Loading State -->
      <div v-if="movementsLoading" class="loading-container">
        <q-spinner-dots size="xl" color="primary" />
        <p class="loading-text">{{ $t('inventory.movements.loading') }}</p>
      </div>

      <!-- Movements Table -->
      <div v-else class="medical-table">
        <q-table
          :rows="filteredMovements"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :rows-number="inventoryStore.stockMovementsTotal || 0"
          :loading="movementsLoading"
          :no-data-label="$t('inventory.movements.noData')"
          class="movements-table"
          flat
          bordered
          separator="cell"
        >
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>
          <!-- Movement Type Column -->
          <template v-slot:body-cell-movement_type="props">
            <q-td :props="props">
              <q-chip
                :icon="movementIcon(props.value)"
                :color="movementColor(props.value)"
                text-color="white"
                :label="formatMovementType(props.value)"
                size="sm"
              />
            </q-td>
          </template>

          <!-- Product Column -->
          <template v-slot:body-cell-product="props">
            <q-td :props="props">
              <div class="product-info">
                <div class="product-name">
                  {{ props.row.product?.name || $t('common.unknownProduct') }}
                </div>
                <div class="product-sku">
                  {{ props.row.product?.sku || '-' }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- Quantity Change Column -->
          <template v-slot:body-cell-quantity_change="props">
            <q-td :props="props">
              <span
                :class="{
                  'quantity-positive': props.value > 0,
                  'quantity-negative': props.value < 0,
                  'quantity-neutral': props.value === 0,
                }"
                class="quantity-change"
              >
                {{ props.value > 0 ? '+' : '' }}{{ props.value }}
              </span>
            </q-td>
          </template>

          <!-- Location Column -->
          <template v-slot:body-cell-location="props">
            <q-td :props="props">
              {{ props.row.location?.name || $t('common.unknownLocation') }}
            </q-td>
          </template>

          <!-- Date Column -->
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              <div class="date-info">
                <div class="date">{{ formatDate(props.value) }}</div>
                <div class="time">{{ formatTime(props.value) }}</div>
              </div>
            </q-td>
          </template>

          <!-- Notes Column -->
          <template v-slot:body-cell-notes="props">
            <q-td :props="props">
              <span v-if="props.value" class="notes">
                {{ props.value }}
              </span>
              <span v-else class="no-notes">-</span>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                icon="visibility"
                size="sm"
                @click="viewMovementDetails(props.row)"
                :title="$t('common.view')"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Movement Details Dialog -->
    <BaseDialog
      v-model="showMovementDetails"
      :title="$t('inventory.movementDetails')"
      icon="swap_horiz"
      size="md"
      @close="showMovementDetails = false"
    >
      <div v-if="selectedMovement" class="movement-details">
        <div class="detail-row">
          <span class="label">{{ $t('inventory.movementType') }}:</span>
          <q-chip
            :icon="movementIcon(selectedMovement.movement_type as MovementType)"
            :color="movementColor(selectedMovement.movement_type as MovementType)"
            text-color="white"
            :label="formatMovementType(selectedMovement.movement_type as MovementType)"
            size="sm"
          />
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('inventory.product') }}:</span>
          <span class="value">
            {{ selectedMovement.product?.name || $t('common.unknownProduct') }}
            <span class="sku"
              >({{ selectedMovement.product?.sku || $t('common.noSku') }})</span
            >
          </span>
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('inventory.location') }}:</span>
          <span class="value">{{
            selectedMovement.location?.name || $t('common.unknownLocation')
          }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('inventory.quantityChange') }}:</span>
          <span
            :class="{
              'quantity-positive': selectedMovement.quantity_change > 0,
              'quantity-negative': selectedMovement.quantity_change < 0,
            }"
            class="quantity-change value"
          >
            {{ selectedMovement.quantity_change > 0 ? '+' : ''
            }}{{ selectedMovement.quantity_change }}
          </span>
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('inventory.quantityBefore') }}:</span>
          <span class="value">{{ selectedMovement.quantity_before }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('inventory.quantityAfter') }}:</span>
          <span class="value">{{ selectedMovement.quantity_after }}</span>
        </div>

        <div v-if="(selectedMovement as any).reason_code" class="detail-row">
          <span class="label">{{ $t('inventory.reasonCode') }}:</span>
          <span class="value">{{
            formatReasonCode((selectedMovement as any).reason_code)
          }}</span>
        </div>

        <div v-if="selectedMovement.notes" class="detail-row">
          <span class="label">{{ $t('common.notes') }}:</span>
          <span class="value">{{ selectedMovement.notes }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ $t('common.date') }}:</span>
          <span class="value">{{
            formatDateTime(selectedMovement.created_at ?? '')
          }}</span>
        </div>
      </div>

      <template #actions>
        <q-btn
          flat
          :label="$t('common.close')"
          color="primary"
          @click="showMovementDetails = false"
        />
      </template>
    </BaseDialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from 'src/stores/auth';
  import { useInventoryStore } from 'src/stores/inventory';
  import { useClinicStore } from 'src/stores/clinic';
  import type {
    MovementWithRelations,
    MovementType,
    ReasonCode,
  } from 'src/types/inventory';
  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from 'src/types/filters';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';
  import BaseDialog from 'src/components/base/BaseDialog.vue';
  import FilterPanel from 'src/components/filters/FilterPanel.vue';
  import { movementsFilterPreset } from 'src/presets/filters/movements';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();
  const inventoryStore = useInventoryStore();
  const clinicStore = useClinicStore();

  // Reactive state
  const movementsLoading = ref(false);
  const showMovementDetails = ref(false);
  const selectedMovement = ref<MovementWithRelations | null>(null);
  const isUnmounted = ref(false);
  const errorState = ref<{ visible: boolean; message: string; retry?: () => void }>({ visible: false, message: '' });
  const demoMovements = ref<MovementWithRelations[]>([]);

  // Filter system styles
  const filterValues = ref<FilterValues>({});

  // Pagination
  const pagination = ref({
    sortBy: 'created_at',
    descending: true,
    page: 1,
    rowsPerPage: 25,
  });

  // Computed properties
  const practiceId = computed(() => authStore.userProfile?.clinic_id || '');

  const filteredMovements = computed(() => (practiceId.value ? inventoryStore.stockMovements : demoMovements.value));

  const columns = computed(() => [
    {
      name: 'movement_type',
      label: t('inventory.movementType'),
      field: 'movement_type',
      align: 'left',
      sortable: true,
    },
    {
      name: 'product',
      label: t('inventory.product'),
      field: 'product',
      align: 'left',
      sortable: false,
    },
    {
      name: 'quantity_change',
      label: t('inventory.quantityChange'),
      field: 'quantity_change',
      align: 'center',
      sortable: true,
    },
    {
      name: 'location',
      label: t('inventory.location'),
      field: 'location',
      align: 'left',
      sortable: false,
    },
    {
      name: 'created_at',
      label: t('common.date'),
      field: 'created_at',
      align: 'left',
      sortable: true,
    },
    {
      name: 'notes',
      label: t('common.notes'),
      field: 'notes',
      align: 'left',
      sortable: false,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      field: 'actions',
      align: 'center',
      sortable: false,
    },
  ]);

  // Methods
  const refreshData = async () => {
    if (!practiceId.value) {
      // Demo fallback
      demoMovements.value = generateDemoMovements();
      errorState.value = { visible: false, message: '' };
      return;
    }
    try {
      await inventoryStore.fetchStockMovements(practiceId.value, {
        page: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        filters: {
          dateRange: filterValues.value.date_range as { start?: string; end?: string } | undefined,
          location_id: (filterValues.value.location_id as string) || undefined,
          movement_type: (filterValues.value.movement_type as any) || undefined,
          product_search: (filterValues.value.product_search as string) || undefined,
        },
      });
      errorState.value = { visible: false, message: '' };
      $q.notify({ type: 'positive', message: t('common.dataRefreshed'), position: 'top' });
    } catch (error) {
      console.error('Error refreshing movements:', error);
      errorState.value = {
        visible: true,
        message: t('inventory.movements.loadError'),
        retry: async () => {
          await refreshData();
        },
      };
    }
  };

  // Demo data
  const generateDemoMovements = (): MovementWithRelations[] => {
    const now = new Date();
    const iso = (d: Date) => d.toISOString();
    return [
      {
        id: 'demo-mv-1',
        practice_id: 'demo',
        location_id: 'loc-1',
        product_id: 'prod-1',
        movement_type: 'receipt',
        quantity_change: 20,
        quantity_before: 10,
        quantity_after: 30,
        created_at: iso(new Date(now.getTime() - 3600 * 1000)),
        notes: 'Demo ontvangst',
        product: { id: 'prod-1', name: 'Handschoenen M', sku: 'GLV-M' },
        location: { id: 'loc-1', name: 'Demo Magazijn', code: 'WH1', location_type: 'warehouse' } as any,
      },
      {
        id: 'demo-mv-2',
        practice_id: 'demo',
        location_id: 'loc-1',
        product_id: 'prod-2',
        movement_type: 'usage',
        quantity_change: -3,
        quantity_before: 12,
        quantity_after: 9,
        created_at: iso(new Date(now.getTime() - 2 * 3600 * 1000)),
        notes: 'Verbruik behandelkamer',
        product: { id: 'prod-2', name: 'Desinfectiemiddel 500ml', sku: 'DSF-500' },
        location: { id: 'loc-1', name: 'Demo Magazijn', code: 'WH1', location_type: 'warehouse' } as any,
      },
      {
        id: 'demo-mv-3',
        practice_id: 'demo',
        location_id: 'loc-2',
        product_id: 'prod-3',
        movement_type: 'adjustment',
        quantity_change: 5,
        quantity_before: 0,
        quantity_after: 5,
        created_at: iso(new Date(now.getTime() - 3 * 3600 * 1000)),
        notes: 'Aanvulling',
        product: { id: 'prod-3', name: 'Pleisters set', sku: 'PLS-SET' },
        location: { id: 'loc-2', name: 'Behandelkamer 1', code: 'TR1', location_type: 'treatment' } as any,
      },
      {
        id: 'demo-mv-4',
        practice_id: 'demo',
        location_id: 'loc-2',
        product_id: 'prod-1',
        movement_type: 'transfer',
        quantity_change: 4,
        quantity_before: 2,
        quantity_after: 6,
        created_at: iso(new Date(now.getTime() - 4 * 3600 * 1000)),
        notes: 'Van magazijn naar behandelkamer',
        product: { id: 'prod-1', name: 'Handschoenen M', sku: 'GLV-M' },
        location: { id: 'loc-2', name: 'Behandelkamer 1', code: 'TR1', location_type: 'treatment' } as any,
      },
    ] as MovementWithRelations[];
  };

  const exportMovements = () => {
    const rows = inventoryStore.stockMovements as MovementWithRelations[];
    const header = ['type', 'sku', 'product_name', 'delta', 'location', 'created_at', 'note'];
    const csvRows = [header.join(',')];
    for (const r of rows) {
      const type = r.movement_type;
      const sku = r.product?.sku ?? '';
      const name = r.product?.name ?? '';
      const delta = String(r.quantity_change ?? 0);
      const loc = r.location?.name ?? '';
      const created = new Date(r.created_at).toISOString();
      const note = (r.notes ?? '').replace(/"/g, '""');
      const line = [type, sku, name, delta, loc, created, `"${note}` + '"'].join(',');
      csvRows.push(line);
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movements_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewMovementDetails = (movement: MovementWithRelations) => {
    selectedMovement.value = movement;
    showMovementDetails.value = true;
  };

  // Filter event handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // Handle individual filter changes if needed
    // Could add specific logic here for real-time filtering
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    // Handle filter reset - refresh data to show all movements
    refreshData();
  };

  const handleFilterClear = () => {
    // Handle all filters cleared - refresh data to show all movements
    refreshData();
  };

  // Formatting helpers
  const formatMovementType = (type: MovementType): string => {
    return t(`inventory.movement.${type}`, type);
  };

  const formatReasonCode = (code: ReasonCode): string => {
    return t(`inventory.reason.${code}`, code);
  };

  const movementIcon = (type: MovementType): string => {
    switch (type) {
      case 'receipt':
        return 'add_circle';
      case 'usage':
        return 'remove_circle';
      case 'transfer':
        return 'swap_horiz';
      case 'adjustment':
        return 'edit';
      case 'count':
        return 'checklist';
      case 'waste':
        return 'delete';
      default:
        return 'timeline';
    }
  };

  const movementColor = (type: MovementType): string => {
    switch (type) {
      case 'receipt':
        return 'positive';
      case 'usage':
        return 'negative';
      case 'transfer':
        return 'info';
      case 'adjustment':
        return 'warning';
      case 'count':
        return 'secondary';
      case 'waste':
        return 'negative';
      default:
        return 'primary';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (dateString: string): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Lifecycle
  onMounted(async () => {
    if (practiceId.value) {
      await clinicStore.fetchLocations(practiceId.value);
      await refreshData();
    }
  });

  onBeforeUnmount(() => {
    isUnmounted.value = true;
  });

  // React to filter and pagination changes for server-side fetch
  watch(
    () => ({ ...pagination.value, ...filterValues.value, practice: practiceId.value }),
    async () => {
      if (practiceId.value) {
        await refreshData();
      }
    },
    { deep: true }
  );
</script>

<style lang="scss" scoped>
  .movements-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--space-3);
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    gap: var(--space-4);

    .loading-text {
      color: var(--text-muted);
      font-size: var(--text-base);
      margin: 0;
    }
  }

  .movements-table-card {
    overflow: visible;
  }

  .product-info {
    .product-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .product-sku {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }

  .quantity-change {
    font-weight: var(--font-weight-medium);

    &.quantity-positive {
      color: var(--positive);
    }

    &.quantity-negative {
      color: var(--negative);
    }

    &.quantity-neutral {
      color: var(--text-muted);
    }
  }

  .date-info {
    .date {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .time {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }

  .notes {
    font-style: italic;
    color: var(--text-secondary);
  }

  .no-notes {
    color: var(--text-muted);
  }

  .movement-details {
    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-4);

      .label {
        font-weight: var(--font-weight-medium);
        color: var(--text-secondary);
        min-width: 140px;
      }

      .value {
        color: var(--text-primary);

        .sku {
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
      }
    }
  }
</style>
