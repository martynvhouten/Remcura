<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('inventory.title')"
        :subtitle="$t('inventory.overview')"
        icon="inventory_2"
      >
        <template #actions>
          <div class="header-actions">
            <!-- Location Filter -->
            <q-select
              v-model="selectedLocationId"
              :options="locationOptions"
              :label="$t('inventory.currentLocation')"
              emit-value
              map-options
              outlined
              dense
              options-dense
              class="location-selector"
              :loading="clinicStore.loading"
            >
              <template v-slot:prepend>
                <q-icon name="place" />
              </template>
            </q-select>

            <!-- Refresh Button -->
            <q-btn
              color="primary"
              icon="refresh"
              :label="$t('common.refresh')"
              @click="refreshData"
              :loading="refreshing"
              unelevated
            />

            <!-- Export Button -->
            <q-btn
              color="secondary"
              icon="file_download"
              :label="$t('inventory.exportData')"
              @click="exportInventoryData"
              unelevated
            />
          </div>
        </template>
      </PageTitle>
    </template>

    <!-- Main Content -->
    <div class="inventory-content">
      <!-- Loading State -->
      <div v-if="inventoryStore.loading" class="loading-container">
        <q-spinner-dots size="xl" color="primary" />
        <p class="loading-text">{{ $t("inventory.loadingData") }}</p>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Overview Cards Grid -->
        <div class="overview-grid">
          <!-- Total Products Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.totalProducts')"
            :subtitle="selectedLocationName"
            icon="inventory"
            header-color="primary"
          >
            <div class="kpi-content">
              <div class="kpi-value">
                {{ formatNumber(inventoryKPIs.total_sku_count) }}
              </div>
              <div class="kpi-subtitle">{{ $t("inventory.units") }}</div>
            </div>
          </BaseCard>

          <!-- Total Value Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.totalValue')"
            :subtitle="$t('common.currentMin')"
            icon="euro"
            header-color="positive"
          >
            <div class="kpi-content">
              <div class="kpi-value">
                {{ formatCurrency(inventoryStore.totalStockValue) }}
              </div>
              <div class="kpi-subtitle">{{ selectedLocationName }}</div>
            </div>
          </BaseCard>

          <!-- Low Stock Items Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.lowStockItems')"
            :subtitle="$t('inventory.urgentAttention')"
            icon="warning"
            header-color="warning"
          >
            <div class="kpi-content">
              <div class="kpi-value">
                {{ inventoryStore.lowStockItems.length }}
              </div>
              <div class="kpi-subtitle">{{ $t("inventory.units") }}</div>
            </div>
            <template #actions>
              <q-btn
                v-if="inventoryStore.lowStockItems.length > 0"
                flat
                color="warning"
                :label="$t('common.viewMore')"
                @click="showLowStockDetails"
              />
            </template>
          </BaseCard>

          <!-- Out of Stock Items Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.outOfStockItems')"
            :subtitle="$t('inventory.criticalAlerts')"
            icon="error_outline"
            header-color="negative"
          >
            <div class="kpi-content">
              <div class="kpi-value">
                {{ inventoryStore.outOfStockItems.length }}
              </div>
              <div class="kpi-subtitle">{{ $t("inventory.units") }}</div>
            </div>
            <template #actions>
              <q-btn
                v-if="inventoryStore.outOfStockItems.length > 0"
                flat
                color="negative"
                :label="$t('common.viewMore')"
                @click="showOutOfStockDetails"
              />
            </template>
          </BaseCard>

          <!-- Stock Accuracy Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.stockAccuracy')"
            :subtitle="$t('inventory.lastFullCount')"
            icon="verified"
            header-color="info"
          >
            <div class="kpi-content">
              <div class="kpi-value">
                {{ formatPercentage(inventoryKPIs.stock_accuracy_percentage) }}
              </div>
              <div class="kpi-subtitle">
                {{
                  inventoryKPIs.last_full_count_date
                    ? formatDate(inventoryKPIs.last_full_count_date)
                    : $t("inventory.neverCounted")
                }}
              </div>
            </div>
          </BaseCard>

          <!-- Counting Status Card -->
          <BaseCard
            variant="modern"
            :title="$t('inventory.countingStatus')"
            :subtitle="
              activeCountingSession
                ? $t('inventory.activeSession')
                : $t('inventory.noActiveSession')
            "
            icon="checklist"
            header-color="secondary"
          >
            <div class="kpi-content">
              <div v-if="activeCountingSession" class="counting-active">
                <div class="session-name">{{ activeCountingSession.name }}</div>
                <div class="session-progress">
                  {{ activeCountingSession.products_counted }}/{{
                    activeCountingSession.total_products_to_count
                  }}
                </div>
              </div>
              <div v-else class="no-session">
                <q-icon name="check_circle" size="md" color="positive" />
                <span>{{ $t("inventory.noActiveSession") }}</span>
              </div>
            </div>
            <template #actions>
              <q-btn
                v-if="!activeCountingSession"
                flat
                color="secondary"
                :label="$t('inventory.startCounting')"
                @click="showCountingDialog"
              />
              <q-btn
                v-else
                flat
                color="primary"
                :label="$t('common.open')"
                @click="goToCountingSession"
              />
            </template>
          </BaseCard>
        </div>

        <!-- Quick Actions Section -->
        <BaseCard
          variant="outlined"
          :title="$t('dashboard.quickActions')"
          icon="flash_on"
          header-color="primary"
        >
          <div class="quick-actions-grid">
            <q-btn
              color="primary"
              icon="add_circle"
              :label="$t('inventory.startCountingSession')"
              @click="showCountingDialog"
              unelevated
              class="action-btn"
            />
            <q-btn
              color="secondary"
              icon="edit"
              :label="$t('inventory.quickAdjustment')"
              @click="showQuickAdjustmentDialog"
              unelevated
              class="action-btn"
            />
            <q-btn
              color="info"
              icon="swap_horiz"
              :label="$t('inventory.transferStock')"
              @click="showTransferDialog"
              unelevated
              class="action-btn"
            />
            <q-btn
              color="warning"
              icon="timeline"
              :label="$t('inventory.viewMovements')"
              @click="$router.push('/inventory/movements')"
              unelevated
              class="action-btn"
            />
          </div>
        </BaseCard>

        <!-- Stock Alerts Section -->
        <BaseCard
          v-if="inventoryStore.criticalAlerts.length > 0"
          variant="modern"
          :title="$t('inventory.stockAlerts')"
          :subtitle="`${inventoryStore.criticalAlerts.length} ${$t(
            'inventory.criticalAlerts'
          )}`"
          icon="notification_important"
          header-color="warning"
        >
          <div class="alerts-list">
            <div
              v-for="alert in displayedAlerts"
              :key="`${alert.product_id}-${alert.location_id}`"
              class="alert-item"
              :class="alertVariantClass(alert.urgency)"
            >
              <div class="alert-icon">
                <q-icon
                  :name="alertIcon(alert.type)"
                  :color="alertColor(alert.urgency)"
                  size="sm"
                />
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.product_name }}</div>
                <div class="alert-subtitle">
                  {{ alert.location_name }} • {{ alert.message }}
                </div>
                <div class="alert-action">{{ alert.suggested_action }}</div>
              </div>
              <div class="alert-badge">
                <q-badge
                  :color="alertColor(alert.urgency)"
                  :label="$t(`inventory.${alert.urgency}Stock`)"
                />
              </div>
            </div>
          </div>
          <template #actions>
            <q-btn
              v-if="inventoryStore.criticalAlerts.length > displayedAlertsCount"
              flat
              color="warning"
              :label="
                $t('common.viewMore', {
                  count:
                    inventoryStore.criticalAlerts.length - displayedAlertsCount,
                })
              "
              @click="showAllAlerts"
            />
          </template>
        </BaseCard>

        <!-- Recent Activity Section -->
        <BaseCard
          variant="outlined"
          :title="$t('inventory.recentActivity')"
          :subtitle="$t('inventory.recentMovements')"
          icon="history"
          header-color="info"
        >
          <template #header-actions>
            <q-btn
              flat
              icon="sync"
              :label="$t('inventory.syncNow')"
              @click="syncRecentData"
              :loading="syncing"
              dense
            />
          </template>

          <div
            v-if="inventoryStore.stockMovements.length === 0"
            class="no-activity"
          >
            <q-icon name="history_toggle_off" size="xl" color="grey-4" />
            <p class="no-activity-text">
              {{ $t("inventory.noRecentActivity") }}
            </p>
          </div>

          <div v-else class="movements-list">
            <div
              v-for="movement in displayedMovements"
              :key="movement.id"
              class="movement-item"
            >
              <div class="movement-icon">
                <q-icon
                  :name="movementIcon(movement.movement_type)"
                  :color="movementColor(movement.movement_type)"
                  size="sm"
                />
              </div>
              <div class="movement-content">
                <div class="movement-title">
                  {{ movement.product?.name || $t("common.unknownProduct") }}
                </div>
                <div class="movement-details">
                  {{ movement.location?.name || $t("common.unknownLocation") }}
                  • {{ formatMovementType(movement.movement_type) }} •
                  {{ formatQuantityChange(movement.quantity_change) }}
                </div>
                <div class="movement-time">
                  {{ formatRelativeTime(movement.created_at) }}
                </div>
              </div>
              <div class="movement-quantity">
                <span
                  :class="
                    movement.quantity_change > 0
                      ? 'quantity-positive'
                      : 'quantity-negative'
                  "
                >
                  {{ movement.quantity_change > 0 ? "+" : ""
                  }}{{ movement.quantity_change }}
                </span>
              </div>
            </div>
          </div>

          <template #actions>
            <q-btn
              flat
              color="info"
              :label="$t('common.viewMore')"
              @click="$router.push('/inventory/movements')"
            />
          </template>
        </BaseCard>
      </template>
    </div>

    <!-- Dialogs -->
    <CountingSessionDialog
      v-model="showCountingDialogFlag"
      :locations="availableLocations"
      @session-created="onSessionCreated"
    />

    <QuickAdjustmentDialog
      v-model="showQuickAdjustmentFlag"
      :locations="availableLocations"
      @adjustment-made="onAdjustmentMade"
    />

    <StockTransferDialog
      v-model="showTransferFlag"
      :locations="availableLocations"
      @transfer-completed="onTransferCompleted"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { useInventoryStore } from "src/stores/inventory";
import { useClinicStore } from "src/stores/clinic";
import { useCountingStore } from "src/stores/counting";
import type {
  CountingSession,
  StockAlert,
  MovementWithRelations,
  PracticeLocation,
} from "src/types/inventory";
import PageLayout from "src/components/PageLayout.vue";
import PageTitle from "src/components/PageTitle.vue";
import BaseCard from "src/components/base/BaseCard.vue";

// Lazy loaded dialogs
const CountingSessionDialog = defineAsyncComponent(
  () => import("src/components/inventory/CountingSessionDialog.vue")
);
const QuickAdjustmentDialog = defineAsyncComponent(
  () => import("src/components/inventory/QuickAdjustmentDialog.vue")
);
const StockTransferDialog = defineAsyncComponent(
  () => import("src/components/inventory/StockTransferDialog.vue")
);

// Composables
const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const inventoryStore = useInventoryStore();
const clinicStore = useClinicStore();
const countingStore = useCountingStore();

// Reactive state
const selectedLocationId = ref<string>("all");
const refreshing = ref(false);
const syncing = ref(false);
const showCountingDialogFlag = ref(false);
const showQuickAdjustmentFlag = ref(false);
const showTransferFlag = ref(false);
const displayedAlertsCount = ref(5);
const displayedMovementsCount = ref(10);

// Computed properties
const practiceId = computed(() => authStore.userProfile?.clinic_id || "");

const availableLocations = computed<PracticeLocation[]>(() => {
  return clinicStore.activeLocations;
});

const locationOptions = computed(() => [
  { label: t("inventory.allLocations"), value: "all" },
  ...availableLocations.value.map((location) => ({
    label: location.name,
    value: location.id,
  })),
]);

const selectedLocationName = computed(() => {
  if (selectedLocationId.value === "all") {
    return t("inventory.allLocations");
  }
  const location = availableLocations.value.find(
    (l) => l.id === selectedLocationId.value
  );
  return location?.name || t("inventory.allLocations");
});

const inventoryKPIs = computed(() =>
  inventoryStore.stockLevels.length > 0
    ? {
        total_sku_count: inventoryStore.stockLevels.length,
        total_stock_value: inventoryStore.totalStockValue,
        low_stock_items: inventoryStore.lowStockItems.length,
        out_of_stock_items: inventoryStore.outOfStockItems.length,
        stock_accuracy_percentage: 98.5, // Would come from actual calculation
        last_full_count_date: null,
      }
    : {
        total_sku_count: 0,
        total_stock_value: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        stock_accuracy_percentage: 0,
        last_full_count_date: null,
      }
);

const activeCountingSession = computed(() => {
  // This would come from counting store
  return null as CountingSession | null;
});

const displayedAlerts = computed(() =>
  inventoryStore.criticalAlerts.slice(0, displayedAlertsCount.value)
);

const displayedMovements = computed(() =>
  inventoryStore.stockMovements.slice(0, displayedMovementsCount.value)
);

// Methods
const refreshData = async () => {
  if (!practiceId.value) return;

  refreshing.value = true;
  try {
    await Promise.all([
      inventoryStore.fetchStockLevels(practiceId.value),
      inventoryStore.fetchStockMovements(practiceId.value),
      inventoryStore.refreshData(practiceId.value),
    ]);
    inventoryStore.generateStockAlerts();

    $q.notify({
      type: "positive",
      message: t("inventory.dataRefreshed"),
      position: "top",
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    $q.notify({
      type: "negative",
      message: t("inventory.refreshFailed"),
      position: "top",
    });
  } finally {
    refreshing.value = false;
  }
};

const syncRecentData = async () => {
  syncing.value = true;
  try {
    await inventoryStore.fetchStockMovements(practiceId.value, 20);
  } finally {
    syncing.value = false;
  }
};

const exportInventoryData = () => {
  // Implementation for exporting inventory data
  $q.notify({
    type: "info",
    message: t("common.comingSoon"),
    position: "top",
  });
};

const showCountingDialog = () => {
  showCountingDialogFlag.value = true;
};

const showQuickAdjustmentDialog = () => {
  showQuickAdjustmentFlag.value = true;
};

const showTransferDialog = () => {
  showTransferFlag.value = true;
};

const showLowStockDetails = () => {
  // Navigate to filtered inventory view
  router.push("/inventory/levels?filter=low-stock");
};

const showOutOfStockDetails = () => {
  // Navigate to filtered inventory view
  router.push("/inventory/levels?filter=out-of-stock");
};

const showAllAlerts = () => {
  displayedAlertsCount.value = inventoryStore.criticalAlerts.length;
};

const goToCountingSession = () => {
  if (activeCountingSession.value) {
    router.push(`/inventory/counting/${activeCountingSession.value.id}`);
  }
};

// Event handlers
const onSessionCreated = (sessionId: string) => {
  router.push(`/inventory/counting/${sessionId}`);
};

const onAdjustmentMade = () => {
  refreshData();
};

const onTransferCompleted = () => {
  refreshData();
};

// Formatting helpers
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("nl-NL").format(value);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return t("inventory.today");
  } else if (diffInHours < 24) {
    return t("inventory.today");
  } else if (diffInHours < 48) {
    return t("inventory.yesterday");
  } else {
    return formatDate(dateString);
  }
};

const formatMovementType = (type: string): string => {
  return t(`inventory.movement.${type}`, type);
};

const formatQuantityChange = (change: number): string => {
  return `${change > 0 ? "+" : ""}${change} ${t("inventory.units")}`;
};

// UI helper methods
const alertVariantClass = (urgency: string): string => {
  switch (urgency) {
    case "critical":
      return "alert-critical";
    case "high":
      return "alert-high";
    case "medium":
      return "alert-medium";
    default:
      return "alert-low";
  }
};

const alertIcon = (type: string): string => {
  switch (type) {
    case "out_of_stock":
      return "error";
    case "low_stock":
      return "warning";
    case "overstock":
      return "info";
    default:
      return "notification_important";
  }
};

const alertColor = (urgency: string): string => {
  switch (urgency) {
    case "critical":
      return "negative";
    case "high":
      return "orange";
    case "medium":
      return "warning";
    default:
      return "info";
  }
};

const movementIcon = (type: string): string => {
  switch (type) {
    case "receipt":
      return "add_circle";
    case "usage":
      return "remove_circle";
    case "transfer":
      return "swap_horiz";
    case "adjustment":
      return "edit";
    case "count":
      return "checklist";
    default:
      return "timeline";
  }
};

const movementColor = (type: string): string => {
  switch (type) {
    case "receipt":
      return "positive";
    case "usage":
      return "negative";
    case "transfer":
      return "info";
    case "adjustment":
      return "warning";
    case "count":
      return "secondary";
    default:
      return "primary";
  }
};

// Watchers
watch(
  () => selectedLocationId.value,
  (newLocationId) => {
    if (newLocationId && practiceId.value) {
      // Filter data by location if needed
      // This would be implemented based on the actual location filtering requirements
    }
  }
);

// Lifecycle
onMounted(async () => {
  if (practiceId.value) {
    // Fetch locations first, then inventory data
    await clinicStore.fetchLocations(practiceId.value);
    await refreshData();
  }
});
</script>

<style lang="scss" scoped>
.inventory-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);

  .location-selector {
    min-width: 200px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-3);

    .location-selector {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

.kpi-content {
  padding: var(--space-6);
  text-align: center;

  .kpi-value {
    font-size: var(--text-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    line-height: 1.2;
  }

  .kpi-subtitle {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-top: var(--space-2);
  }
}

.counting-active {
  text-align: center;

  .session-name {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .session-progress {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
}

.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--text-muted);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  padding: var(--space-6);

  .action-btn {
    min-height: 64px;
    flex-direction: column;
    gap: var(--space-2);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  background: var(--neutral-50);

  &.alert-critical {
    border-left-color: var(--negative);
    background: rgba(var(--negative-rgb), 0.05);
  }

  &.alert-high {
    border-left-color: var(--orange);
    background: rgba(var(--orange-rgb), 0.05);
  }

  &.alert-medium {
    border-left-color: var(--warning);
    background: rgba(var(--warning-rgb), 0.05);
  }

  &.alert-low {
    border-left-color: var(--info);
    background: rgba(var(--info-rgb), 0.05);
  }

  .alert-content {
    flex: 1;

    .alert-title {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .alert-subtitle {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .alert-action {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      font-style: italic;
    }
  }
}

.movements-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}

.movement-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--neutral-50);
  transition: background-color var(--transition-base);

  &:hover {
    background: var(--neutral-100);
  }

  .movement-content {
    flex: 1;

    .movement-title {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .movement-details {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .movement-time {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--space-1);
    }
  }

  .movement-quantity {
    font-weight: var(--font-weight-medium);
    font-size: var(--text-sm);

    .quantity-positive {
      color: var(--positive);
    }

    .quantity-negative {
      color: var(--negative);
    }
  }
}

.no-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  gap: var(--space-4);

  .no-activity-text {
    color: var(--text-muted);
    font-size: var(--text-base);
    margin: 0;
  }
}

// Dark mode
body.body--dark {
  .alert-item {
    background: var(--neutral-200);

    &.alert-critical {
      background: rgba(var(--negative-rgb), 0.1);
    }

    &.alert-high {
      background: rgba(var(--orange-rgb), 0.1);
    }

    &.alert-medium {
      background: rgba(var(--warning-rgb), 0.1);
    }

    &.alert-low {
      background: rgba(var(--info-rgb), 0.1);
    }
  }

  .movement-item {
    background: var(--neutral-200);

    &:hover {
      background: var(--neutral-300);
    }
  }
}
</style>
