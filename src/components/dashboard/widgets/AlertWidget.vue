<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Empty State -->
    <div v-if="!items.length" class="empty-state">
      <q-icon name="check_circle" color="positive" size="3rem" />
      <p class="empty-message">{{ $t('dashboard.alerts.noWarnings') }}</p>
      <p class="empty-subtitle">
        {{ $t('dashboard.alerts.allStockLevelsOk') }}
      </p>
    </div>

    <!-- Alert Items -->
    <div v-else class="alert-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="alert-item"
        :class="getAlertClass(item)"
      >
        <div class="alert-icon">
          <q-icon
            :name="getAlertIcon(item)"
            :color="getAlertColor(item)"
            size="1.5rem"
          />
        </div>

        <div class="alert-content">
          <div class="alert-title">
            {{ getAlertTitle(item) }}
          </div>
          <div class="alert-description">
            {{ getAlertDescription(item) }}
          </div>
          <div class="alert-meta">
            <span class="location">{{ item.practice_locations?.name }}</span>
            <span class="separator">•</span>
            <span class="stock-info">
              {{ formatStock(item.current_quantity) }} /
              {{ formatStock(item.minimum_quantity) }}
            </span>
          </div>
        </div>

        <div class="alert-actions">
          <q-btn
            flat
            round
            dense
            icon="shopping_cart"
            size="sm"
            color="primary"
            @click="createOrder(item)"
          >
            <q-tooltip>Bestellen</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="edit"
            size="sm"
            color="primary"
            @click="updateStock(item)"
          >
            <q-tooltip>Voorraad bijwerken</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Action Footer -->
    <div v-if="items.length > 0" class="alert-footer">
      <q-btn
        flat
        no-caps
        color="primary"
        icon="visibility"
        label="Bekijk alle"
        @click="viewAllAlerts"
        class="full-width"
      />
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useFormatting } from '@/composables/useFormatting';
  import { BaseDashboardWidget } from '@/components/cards';

  interface AlertItem {
    id: string;
    current_quantity: number;
    minimum_quantity: number;
    products?: {
      name: string;
      sku: string;
      category: string;
    };
    practice_locations?: {
      name: string;
    };
  }

  interface AlertData {
    items: AlertItem[];
  }

  interface Props {
    data: AlertData;
  }

  const props = defineProps<Props>();
  const router = useRouter();
  const { formatQuantity } = useFormatting();

  const items = computed(() => props.data.items || []);

  function getAlertClass(item: AlertItem): string {
    const ratio = item.current_quantity / (item.minimum_quantity || 1);

    if (ratio <= 0) return 'alert-critical';
    if (ratio <= 0.5) return 'alert-high';
    if (ratio <= 1) return 'alert-medium';
    return 'alert-low';
  }

  function getAlertIcon(item: AlertItem): string {
    const ratio = item.current_quantity / (item.minimum_quantity || 1);

    if (ratio <= 0) return 'error';
    if (ratio <= 0.5) return 'warning';
    return 'info';
  }

  function getAlertColor(item: AlertItem): string {
    const ratio = item.current_quantity / (item.minimum_quantity || 1);

    if (ratio <= 0) return 'negative';
    if (ratio <= 0.5) return 'warning';
    return 'info';
  }

  function getAlertTitle(item: AlertItem): string {
    return item.products?.name || 'Onbekend product';
  }

  function getAlertDescription(item: AlertItem): string {
    const ratio = item.current_quantity / (item.minimum_quantity || 1);

    if (ratio <= 0) {
      return 'Voorraad uitverkocht';
    }
    if (ratio <= 0.5) {
      return 'Kritiek lage voorraad';
    }
    return 'Voorraad onder minimum';
  }

  function formatStock(quantity: number | null | undefined): string {
    return formatQuantity(quantity || 0);
  }

  function createOrder(item: AlertItem) {
    // Navigate to create order with pre-selected product
    router.push({
      path: '/orders/new',
      query: { product: item.products?.sku },
    });
  }

  function updateStock(item: AlertItem) {
    // Navigate to inventory levels with filter
    router.push({
      path: '/inventory/levels',
      query: { product: item.products?.sku },
    });
  }

  function viewAllAlerts() {
    router.push('/inventory/levels?filter=low-stock');
  }
</script>

<style lang="scss" scoped>
  // Alert widget content styling (wrapper now handled by BaseDashboardWidget)

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-6);

    .empty-message {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      margin: var(--space-4) 0 var(--space-2);
    }

    .empty-subtitle {
      color: var(--text-muted);
      margin: 0;
    }
  }

  .alert-list {
    flex: 1;
    overflow-y: auto;

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);
      border: 1px solid var(--neutral-200);
      background: var(--white);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: var(--shadow-sm);
        transform: translateY(-1px);
      }

      &:last-child {
        margin-bottom: 0;
      }

      // Alert severity styling
      &.alert-critical {
        border-left: 4px solid var(--negative);
        background: var(--negative-25);
      }

      &.alert-high {
        border-left: 4px solid var(--warning);
        background: var(--warning-25);
      }

      &.alert-medium {
        border-left: 4px solid var(--info);
        background: var(--info-25);
      }

      .alert-icon {
        margin-top: var(--space-1);
      }

      .alert-content {
        flex: 1;
        min-width: 0;

        .alert-title {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);

          // Truncate long names
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .alert-description {
          color: var(--text-muted);
          font-size: var(--text-sm);
          margin-bottom: var(--space-2);
        }

        .alert-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--text-muted);

          .separator {
            color: var(--neutral-400);
          }

          .stock-info {
            font-weight: var(--font-weight-medium);
            color: var(--text-primary);
          }
        }
      }

      .alert-actions {
        display: flex;
        gap: var(--space-1);
        margin-top: var(--space-1);
      }
    }
  }

  .alert-footer {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--neutral-200);
  }

  // Dark mode
  body.body--dark {
    .alert-list .alert-item {
      background: var(--neutral-800);
      border-color: var(--neutral-700);

      &.alert-critical {
        background: var(--negative-900);
      }

      &.alert-high {
        background: var(--warning-900);
      }

      &.alert-medium {
        background: var(--info-900);
      }

      .alert-content {
        .alert-title {
          color: var(--text-primary-dark);
        }

        .alert-meta .stock-info {
          color: var(--text-primary-dark);
        }
      }
    }

    .alert-footer {
      border-color: var(--neutral-700);
    }

    .empty-state .empty-message {
      color: var(--text-primary-dark);
    }
  }

  // Mobile optimizations
  @media (max-width: 768px) {
    .alert-list .alert-item {
      padding: var(--space-3);
      gap: var(--space-3);

      .alert-actions {
        flex-direction: column;
      }

      .alert-content .alert-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-1);

        .separator {
          display: none;
        }
      }
    }
  }
</style>
