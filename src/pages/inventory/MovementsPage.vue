<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('inventory.stockMovements')"
        :subtitle="$t('inventory.movementHistory')"
        icon="timeline"
      >
        <template #actions>
          <div class="header-actions">
            <!-- Filters -->
            <q-select
              v-model="selectedMovementType"
              :options="movementTypeOptions"
              :label="$t('inventory.movementType')"
              emit-value
              map-options
              outlined
              dense
              clearable
              class="filter-select"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>

            <q-select
              v-model="selectedLocationId"
              :options="locationOptions"
              :label="$t('inventory.location')"
              emit-value
              map-options
              outlined
              dense
              clearable
              class="filter-select"
            >
              <template v-slot:prepend>
                <q-icon name="place" />
              </template>
            </q-select>

            <!-- Date Range -->
            <q-input
              v-model="dateRange"
              :label="$t('common.dateRange')"
              outlined
              dense
              readonly
              class="date-input"
            >
              <template v-slot:prepend>
                <q-icon name="date_range" />
              </template>
              <template v-slot:append>
                <q-icon name="arrow_drop_down" />
              </template>
              <q-popup-proxy>
                <q-date v-model="dateRange" range :options="dateOptions" />
              </q-popup-proxy>
            </q-input>

            <!-- Refresh Button -->
            <q-btn
              color="primary"
              icon="refresh"
              :label="$t('common.refresh')"
              @click="refreshData"
              :loading="inventoryStore.loading"
              unelevated
            />

            <!-- Export Button -->
            <q-btn
              color="secondary"
              icon="file_download"
              :label="$t('common.export')"
              @click="exportMovements"
              unelevated
            />
          </div>
        </template>
      </PageTitle>
    </template>

    <!-- Main Content -->
    <div class="movements-content">
      <!-- Loading State -->
      <div v-if="inventoryStore.loading" class="loading-container">
        <q-spinner-dots size="xl" color="primary" />
        <p class="loading-text">{{ $t("inventory.loadingMovements") }}</p>
      </div>

      <!-- Movements Table -->
      <BaseCard v-else variant="modern" class="movements-table-card">
        <q-table
          :rows="filteredMovements"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          :loading="inventoryStore.loading"
          :no-data-label="$t('inventory.noMovementsFound')"
          class="movements-table"
          flat
        >
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
                  {{ props.row.product?.name || $t("common.unknownProduct") }}
                </div>
                <div class="product-sku">
                  {{ props.row.product?.sku || "-" }}
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
                {{ props.value > 0 ? "+" : "" }}{{ props.value }}
              </span>
            </q-td>
          </template>

          <!-- Location Column -->
          <template v-slot:body-cell-location="props">
            <q-td :props="props">
              {{ props.row.location?.name || $t("common.unknownLocation") }}
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
      </BaseCard>
    </div>

    <!-- Movement Details Dialog -->
    <q-dialog v-model="showMovementDetails" max-width="600px">
      <q-card v-if="selectedMovement">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t("inventory.movementDetails") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="movement-details">
          <div class="detail-row">
            <span class="label">{{ $t("inventory.movementType") }}:</span>
            <q-chip
              :icon="movementIcon(selectedMovement.movement_type)"
              :color="movementColor(selectedMovement.movement_type)"
              text-color="white"
              :label="formatMovementType(selectedMovement.movement_type)"
              size="sm"
            />
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("inventory.product") }}:</span>
            <span class="value">
              {{ selectedMovement.product?.name || $t('common.unknownProduct') }}
              <span class="sku"
                >({{ selectedMovement.product?.sku || $t('common.noSku') }})</span
              >
            </span>
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("inventory.location") }}:</span>
            <span class="value">{{
              selectedMovement.location?.name || $t('common.unknownLocation')
            }}</span>
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("inventory.quantityChange") }}:</span>
            <span
              :class="{
                'quantity-positive': selectedMovement.quantity_change > 0,
                'quantity-negative': selectedMovement.quantity_change < 0,
              }"
              class="quantity-change value"
            >
              {{ selectedMovement.quantity_change > 0 ? "+" : ""
              }}{{ selectedMovement.quantity_change }}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("inventory.quantityBefore") }}:</span>
            <span class="value">{{ selectedMovement.quantity_before }}</span>
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("inventory.quantityAfter") }}:</span>
            <span class="value">{{ selectedMovement.quantity_after }}</span>
          </div>

          <div v-if="selectedMovement.reason_code" class="detail-row">
            <span class="label">{{ $t("inventory.reasonCode") }}:</span>
            <span class="value">{{
              formatReasonCode(selectedMovement.reason_code)
            }}</span>
          </div>

          <div v-if="selectedMovement.notes" class="detail-row">
            <span class="label">{{ $t("common.notes") }}:</span>
            <span class="value">{{ selectedMovement.notes }}</span>
          </div>

          <div class="detail-row">
            <span class="label">{{ $t("common.date") }}:</span>
            <span class="value">{{
              formatDateTime(selectedMovement.created_at)
            }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
import PageLayout from 'src/components/PageLayout.vue';
import PageTitle from 'src/components/PageTitle.vue';
import BaseCard from 'src/components/base/BaseCard.vue';

// Composables
const { t } = useI18n();
const $q = useQuasar();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();
const clinicStore = useClinicStore();

// Reactive state
const selectedMovementType = ref<MovementType | null>(null);
const selectedLocationId = ref<string | null>(null);
const dateRange = ref<string>('');
const showMovementDetails = ref(false);
const selectedMovement = ref<MovementWithRelations | null>(null);

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 25,
});

// Computed properties
const practiceId = computed(() => authStore.userProfile?.clinic_id || '');

const movementTypeOptions = computed(() => [
  { label: t('inventory.movement.receipt'), value: 'receipt' },
  { label: t('inventory.movement.usage'), value: 'usage' },
  { label: t('inventory.movement.transfer'), value: 'transfer' },
  { label: t('inventory.movement.adjustment'), value: 'adjustment' },
  { label: t('inventory.movement.count'), value: 'count' },
  { label: t('inventory.movement.waste'), value: 'waste' },
]);

const locationOptions = computed(() =>
  clinicStore.activeLocations.map((location) => ({
    label: location.name,
    value: location.id,
  }))
);

const filteredMovements = computed(() => {
  let movements = [...inventoryStore.stockMovements];

  // Filter by movement type
  if (selectedMovementType.value) {
    movements = movements.filter(
      (m) => m.movement_type === selectedMovementType.value
    );
  }

  // Filter by location
  if (selectedLocationId.value) {
    movements = movements.filter(
      (m) => m.location_id === selectedLocationId.value
    );
  }

  // Filter by date range
  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value.split(' - ');
    if (startDate && endDate) {
      movements = movements.filter((m) => {
        const movementDate = new Date(m.created_at);
        return (
          movementDate >= new Date(startDate) &&
          movementDate <= new Date(endDate)
        );
      });
    }
  }

  return movements;
});

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
  if (!practiceId.value) return;

  try {
    await inventoryStore.fetchStockMovements(practiceId.value, 200);
    $q.notify({
      type: 'positive',
      message: t('common.dataRefreshed'),
      position: 'top',
    });
  } catch (error) {
    console.error('Error refreshing movements:', error);
    $q.notify({
      type: 'negative',
      message: t('common.refreshFailed'),
      position: 'top',
    });
  }
};

const exportMovements = () => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
    position: 'top',
  });
};

const viewMovementDetails = (movement: MovementWithRelations) => {
  selectedMovement.value = movement;
  showMovementDetails.value = true;
};

const dateOptions = (date: string) => {
  return new Date(date) <= new Date();
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

  .filter-select {
    min-width: 150px;
  }

  .date-input {
    min-width: 200px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-3);

    .filter-select,
    .date-input {
      min-width: 100%;
    }
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
  overflow: hidden;
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
