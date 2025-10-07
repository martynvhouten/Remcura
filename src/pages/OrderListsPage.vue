<template>
  <PageLayout>
    <PageTitle
      title="Bestellijsten"
      subtitle="Beheer en automatiseer je bestellijsten met min/max levels"
      icon="list_alt"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Nieuwe lijst"
          class="app-btn-primary q-mr-sm"
          unelevated
          no-caps
          @click="showCreateDialog = true"
        />
        <q-btn
          color="secondary"
          icon="smartphone"
          label="Mobiel tellen"
          class="app-btn-secondary"
          outline
          no-caps
          @click="openMobileCountingInterface"
        />
      </template>
    </PageTitle>

    <!-- Global Reorder Advice Banner -->
    <div v-if="globalOrderAdvice && hasUrgentItems" class="q-mb-lg">
      <q-banner class="bg-warning text-dark rounded-borders">
        <template #avatar>
          <q-icon name="warning" size="32px" />
        </template>
        <div class="text-weight-medium">
          {{ criticalItemsCount }} kritieke items hebben voorraad nodig!
        </div>
        <div class="text-caption">
          Totaal geschatte kosten: €{{
            globalOrderAdvice.total_estimated_cost.toFixed(2)
          }}
        </div>
        <template #action>
          <q-btn
            flat
            label="Alles bestellen"
            :loading="processingGlobalOrder"
            class="app-btn-warning text-dark"
            no-caps
            @click="orderAllUrgentItems"
          />
          <q-btn
            flat
            label="Details"
            class="app-btn-secondary text-dark"
            no-caps
            @click="showGlobalAdviceDialog = true"
          />
        </template>
      </q-banner>
    </div>

    <!-- Dashboard Cards -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Total Lists Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Totaal lijsten" icon="list_alt" icon-color="primary">
          <div class="kpi-content">
            <div class="kpi-value text-primary">{{ totalLists }}</div>
            <div class="kpi-subtitle">Bestellijsten</div>
          </div>
        </BaseCard>
      </div>

      <!-- Items to Order Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          title="Te bestellen"
          icon="shopping_cart"
          :icon-color="itemsNeedingOrder > 0 ? 'warning' : 'positive'"
          :highlight="itemsNeedingOrder > 0"
        >
          <div class="kpi-content">
            <div
              class="kpi-value"
              :class="itemsNeedingOrder > 0 ? 'text-warning' : 'text-positive'"
            >
              {{ itemsNeedingOrder }}
            </div>
            <div class="kpi-subtitle">Items</div>
          </div>
        </BaseCard>
      </div>

      <!-- Auto-reorder Lists Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Automatisch" icon="schedule" icon-color="info">
          <div class="kpi-content">
            <div class="kpi-value text-info">{{ autoReorderLists }}</div>
            <div class="kpi-subtitle">Auto-lijsten</div>
          </div>
        </BaseCard>
      </div>

      <!-- Total Value Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Geschatte waarde" icon="euro" icon-color="positive">
          <div class="kpi-content">
            <div class="kpi-value text-positive">
              €{{ totalEstimatedValue.toFixed(0) }}
            </div>
            <div class="kpi-subtitle">Totale waarde</div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        v-model="filterValues"
        :preset="orderListsFilterPreset"
        :loading="loading"
        collapsible
        class="order-lists-filter-panel"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
      />
    </div>

    <!-- Order Lists Display -->
    <div v-if="viewMode === 'cards'" class="row order-lists-grid">
      <div
        v-for="orderList in filteredOrderLists"
        :key="orderList.id"
        class="col-12 col-sm-6 col-md-4 order-list-col"
      >
        <SimpleOrderListCard
          :order-list="orderList as any"
          :reorder-advice="getOrderAdviceForList(orderList.id)"
        />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="q-mb-lg medical-table">
      <q-table
        :rows="filteredOrderLists"
        :columns="tableColumns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="order-lists-table"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.name }}</div>
            <div class="text-caption text-grey-6">
              {{ props.row.description }}
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.row.status)"
              :label="getStatusLabel(props.row.status)"
            />
          </q-td>
        </template>

        <template #body-cell-urgency="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-chip
                v-if="getUrgencyStats(props.row.id).critical > 0"
                size="sm"
                color="negative"
                text-color="white"
                :label="getUrgencyStats(props.row.id).critical"
                icon="error"
              />
              <q-chip
                v-if="getUrgencyStats(props.row.id).high > 0"
                size="sm"
                color="warning"
                text-color="dark"
                :label="getUrgencyStats(props.row.id).high"
                icon="warning"
              />
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="open_in_new"
              class="q-mr-sm"
              @click="viewOrderList(props.row)"
            >
              <q-tooltip>Openen</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="more_vert">
              <q-menu>
                <q-list dense>
                  <q-item clickable @click="editOrderList(props.row)">
                    <q-item-section>Bewerken</q-item-section>
                  </q-item>
                  <q-item clickable @click="duplicateOrderList(props.row)">
                    <q-item-section>Dupliceren</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    class="text-negative"
                    @click="deleteOrderList(props.row)"
                  >
                    <q-item-section>Verwijderen</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredOrderLists.length === 0" class="text-center q-py-xl">
      <q-icon name="list_alt" size="64px" class="text-grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{
          hasActiveFilters
            ? $t('orderLists.emptyFiltered')
            : $t('orderLists.empty')
        }}
      </div>
      <div class="text-body2 q-mt-sm text-grey-5">
        {{
          hasActiveFilters
            ? $t('orderLists.tryOtherFilters')
            : $t('orderLists.createFirstList')
        }}
      </div>
      <q-btn
        v-if="!hasActiveFilters"
        color="primary"
        :label="$t('orderLists.newList')"
        class="q-mt-md"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Global Advice Dialog -->
    <BaseDialog
      v-model="showGlobalAdviceDialog"
      :title="$t('orderLists.globalAdvice')"
      icon="lightbulb"
      size="md"
    >
      <div v-if="globalOrderAdvice">
        <div class="row q-gutter-md q-mb-md">
          <div class="col text-center">
            <div class="text-h5 text-negative">
              {{ globalOrderAdvice.items_by_urgency.critical.length }}
            </div>
            <div class="text-caption">Kritiek</div>
          </div>
          <div class="col text-center">
            <div class="text-h5 text-warning">
              {{ globalOrderAdvice.items_by_urgency.high.length }}
            </div>
            <div class="text-caption">Hoog</div>
          </div>
          <div class="col text-center">
            <div class="text-h5 text-primary">
              {{ globalOrderAdvice.items_by_urgency.normal.length }}
            </div>
            <div class="text-caption">Normaal</div>
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">Leveranciers betrokken:</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="supplier in globalOrderAdvice.suppliers_involved"
              :key="supplier"
              color="primary"
              text-color="white"
              :label="supplier"
              size="sm"
            />
          </div>
        </div>

        <div class="q-mb-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle2">Totale kosten:</div>
              <div class="text-h5 text-primary">
                €{{ globalOrderAdvice.total_estimated_cost.toFixed(2) }}
              </div>
            </div>
            <div class="col-auto">
              <div class="text-subtitle2">Items:</div>
              <div class="text-subtitle1">
                {{ globalOrderAdvice.total_items_to_order }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <q-btn
          flat
          :label="$t('common.close')"
          @click="showGlobalAdviceDialog = false"
        />
        <q-btn
          :loading="processingGlobalOrder"
          color="primary"
          :label="$t('orderLists.orderAll')"
          @click="orderAllUrgentItems"
        />
      </template>
    </BaseDialog>

    <!-- Mobile Counting Interface Dialog -->
    <q-dialog
      v-model="showMobileCountingDialog"
      full-width
      full-height
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <MobileCountingInterface
        :practice-id="authStore.clinicId ?? undefined"
        @close="showMobileCountingDialog = false"
      />
    </q-dialog>

    <!-- Create Order List Dialog -->
    <OrderListDialog
      v-model="showCreateDialog"
      @created="handleOrderListCreated"
    />

    <!-- Loading State -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </PageLayout>
</template>

<script setup lang="ts">
  // Dialog baseline: this page uses BaseDialog for global advice modal
  import { ref, computed, onMounted, watch } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useOrderListsStore } from '@/stores/orderLists';
  import { useAuthStore } from '@/stores/auth';
  import { useSuppliersStore } from '@/stores/suppliers';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import { BaseCard } from '@/components/cards';
  import FilterPanel from '@/components/filters/FilterPanel.vue';
  import SimpleOrderListCard from '@/components/orderLists/SimpleOrderListCard.vue';
  import MobileCountingInterface from '@/components/inventory/MobileCountingInterface.vue';
  import OrderListDialog from '@/components/products/OrderListDialog.vue';
  import type { OrderListWithItems } from '@/types/stores';
  import type { OrderAdvice } from '@/stores/orderLists/orderLists-minmax';
  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from '@/types/filters';
  import { advancedOrderListsFilterPreset as orderListsFilterPreset } from '@/presets/filters/advancedOrderLists';

  const $q = useQuasar();
  const $t = useI18n().t;
  const router = useRouter();
  const orderListsStore = useOrderListsStore();
  const authStore = useAuthStore();
  const suppliersStore = useSuppliersStore();

  // State
  const loading = ref(false);
  const showCreateDialog = ref(false);
  const showGlobalAdviceDialog = ref(false);
  const showMobileCountingDialog = ref(false);
  const processingGlobalOrder = ref(false);

  // Filters
  const filterValues = ref<FilterValues>({});
  const viewMode = computed(() => filterValues.value.viewMode || 'cards');
  const hasActiveFilters = computed(() => {
    return Object.values(filterValues.value).some(value => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      if (typeof value === 'boolean' && value === false) {
        return false;
      }
      return true;
    });
  });

  // Update filter preset with dynamic supplier options
  watch(
    () => suppliersStore.activeSuppliers,
    suppliers => {
      const supplierFilter = orderListsFilterPreset.fields.find(
        f => f.id === 'supplier'
      );
      if (supplierFilter && supplierFilter.type === 'select') {
        // Break type inference to avoid deep instantiation
        const options: Array<any> = [];
        for (const supplier of suppliers as any[]) {
          options.push({
            label: supplier.name,
            value: supplier.id,
          });
        }
        (supplierFilter as any).options = options;
      }
    },
    { immediate: true }
  );

  // Table columns
  const tableColumns = [
    {
      name: 'name',
      required: true,
      label: 'Naam',
      align: 'left' as const,
      field: 'name',
      sortable: true,
    },
    {
      name: 'status',
      align: 'center' as const,
      label: 'Status',
      field: 'status',
      sortable: true,
    },
    {
      name: 'items',
      align: 'center' as const,
      label: 'Items',
      field: 'total_items',
      sortable: true,
    },
    {
      name: 'value',
      align: 'right' as const,
      label: 'Waarde',
      field: 'total_value',
      sortable: true,
      format: (val: number) => `€${val.toFixed(2)}`,
    },
    {
      name: 'urgency',
      align: 'center' as const,
      label: 'Urgentie',
      field: 'id',
    },
    {
      name: 'actions',
      align: 'center' as const,
      label: 'Acties',
      field: 'id',
    },
  ];

  // Computed properties
  const totalLists = computed(() => orderListsStore.orderLists.length);

  const itemsNeedingOrder = computed(() => {
    const suggestions = orderListsStore.orderSuggestions || [];
    return suggestions.filter(item => item.calculated_order_quantity > 0)
      .length;
  });

  const autoReorderLists = computed(() => {
    const lists = orderListsStore.orderLists || [];
    // Explicitly break type inference to avoid deep instantiation
    const filtered: Array<any> = lists.filter(
      list => (list as any).auto_reorder_enabled
    );
    return filtered.length;
  });

  const totalEstimatedValue = computed(() => {
    const suggestions = orderListsStore.orderSuggestions || [];
    return suggestions.reduce(
      (sum, item) =>
        sum + item.calculated_order_quantity * (item.preferred_unit_price || 0),
      0
    );
  });

  const globalOrderAdvice = computed(() => {
    const suggestions = orderListsStore.orderSuggestions || [];
    const itemsByUrgency = {
      critical: suggestions.filter(
        item => (item.urgency_level as string) === 'critical'
      ),
      high: suggestions.filter(
        item => (item.urgency_level as string) === 'high'
      ),
      normal: suggestions.filter(
        item => (item.urgency_level as string) === 'normal'
      ),
      low: suggestions.filter(item => (item.urgency_level as string) === 'low'),
    };

    return {
      total_items_to_order: suggestions.filter(
        item => item.calculated_order_quantity > 0
      ).length,
      total_estimated_cost: totalEstimatedValue.value,
      items_by_urgency: itemsByUrgency,
      suppliers_involved: [
        ...new Set(
          suggestions.map(item => item.preferred_supplier_name).filter(Boolean)
        ),
      ],
      estimated_delivery_dates: {},
    };
  });

  const hasUrgentItems = computed(() => {
    const suggestions = orderListsStore.orderSuggestions || [];
    return suggestions.some(
      item =>
        item.urgency_level === 'critical' ||
        (item.urgency_level === 'high' && item.calculated_order_quantity > 0)
    );
  });

  const criticalItemsCount = computed(() => {
    const suggestions = orderListsStore.orderSuggestions || [];
    return suggestions.filter(item => item.urgency_level === 'critical').length;
  });

  const filteredOrderLists = computed(() => {
    const lists = orderListsStore.orderLists || [];
    let result = [...lists];

    // Apply search filter
    if (filterValues.value.search) {
      const searchTerm = String(filterValues.value.search).toLowerCase();
      result = result.filter(
        list =>
          list.name.toLowerCase().includes(searchTerm) ||
          (list.description &&
            list.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (filterValues.value.status) {
      result = result.filter(list => list.status === filterValues.value.status);
    }

    // Apply supplier filter
    if (filterValues.value.supplier) {
      result = result.filter(
        list => list.supplier_id === filterValues.value.supplier
      );
    }

    // Apply urgency filter
    if (filterValues.value.urgency) {
      result = result.filter(list => {
        const urgencyStats = getUrgencyStats(list.id);
        return (
          urgencyStats[
            filterValues.value.urgency as keyof typeof urgencyStats
          ] > 0
        );
      });
    }

    return result;
  });

  // Filter handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // FilterChangeEvent contains field, value, oldValue, preset
    // The actual values are managed by the FilterPanel component
    console.log('Filter changed:', event);
  };

  const handleFilterReset = () => {
    filterValues.value = {};
  };

  const handleFilterClear = () => {
    filterValues.value = {};
  };

  // Methods
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ready: 'positive',
      draft: 'warning',
      submitted: 'info',
      confirmed: 'primary',
      delivered: 'positive',
      cancelled: 'negative',
    };
    return colors[status] || 'grey';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ready: 'Klaar',
      draft: 'Concept',
      submitted: 'Verzonden',
      confirmed: 'Bevestigd',
      delivered: 'Geleverd',
      cancelled: 'Geannuleerd',
    };
    return labels[status] || status;
  };

  const getOrderAdviceForList = (listId: string): OrderAdvice | undefined => {
    const suggestions = orderListsStore.orderSuggestions || [];
    const items = suggestions.filter(item => item.order_list_id === listId);

    if (items.length === 0) {
      return undefined;
    }

    const itemsByUrgency = {
      critical: items.filter(
        item => (item.urgency_level as string) === 'critical'
      ),
      high: items.filter(item => (item.urgency_level as string) === 'high'),
      normal: items.filter(item => (item.urgency_level as string) === 'normal'),
      low: items.filter(item => (item.urgency_level as string) === 'low'),
    };

    const totalCost = items.reduce(
      (sum, item) =>
        sum + item.calculated_order_quantity * (item.preferred_unit_price || 0),
      0
    );

    const suppliersInvolved = [
      ...new Set(
        items.map(item => item.preferred_supplier_name).filter(Boolean)
      ),
    ];

    return {
      total_items_to_order: items.filter(
        item => item.calculated_order_quantity > 0
      ).length,
      total_estimated_cost: totalCost,
      items_by_urgency: itemsByUrgency,
      suppliers_involved: suppliersInvolved,
      estimated_delivery_dates: {},
    };
  };

  const getUrgencyStats = (listId: string) => {
    const suggestions = orderListsStore.orderSuggestions || [];
    const items = suggestions.filter(item => item.order_list_id === listId);

    return {
      critical: items.filter(
        item => (item.urgency_level as string) === 'critical'
      ).length,
      high: items.filter(item => (item.urgency_level as string) === 'high')
        .length,
      normal: items.filter(item => (item.urgency_level as string) === 'normal')
        .length,
      low: items.filter(item => (item.urgency_level as string) === 'low')
        .length,
    };
  };

  const openMobileCountingInterface = () => {
    showMobileCountingDialog.value = true;
  };

  const orderAllUrgentItems = async () => {
    processingGlobalOrder.value = true;
    try {
      const urgentItems = [
        ...(globalOrderAdvice.value?.items_by_urgency?.critical || []),
        ...(globalOrderAdvice.value?.items_by_urgency?.high || []),
      ].filter(item => item.calculated_order_quantity > 0);

      if (urgentItems.length === 0) {
        $q.notify({
          type: 'info',
          message: $t('orderLists.noUrgentItems'),
          timeout: 2000,
        });
        return;
      }

      // Split orders by suppliers
      const splitResult =
        await orderListsStore.splitOrderBySuppliers(urgentItems);

      $q.notify({
        type: 'positive',
        message: $t('orderlists.positive'),
        caption: `${urgentItems.length} urgente items verwerkt`,
        timeout: 3000,
      });

      showGlobalAdviceDialog.value = false;

      // Optionally send orders to suppliers
      if (splitResult.supplier_orders.length > 0) {
        $q.dialog({
          title: 'Bestellingen verzenden?',
          message: $t('orderLists.sendConfirm', {
            count: splitResult.supplier_orders.length,
          }),
          ok: {
            label: 'Ja, verzenden',
            color: 'primary',
          },
          cancel: {
            label: 'Later',
            color: 'grey',
            flat: true,
          },
        }).onOk(async () => {
          try {
            const sendResults = await orderListsStore.sendOrdersToSuppliers(
              splitResult.supplier_orders
            );

            const successCount = sendResults.filter(
              r => r.status === 'success'
            ).length;
            const failedCount = sendResults.filter(
              r => r.status === 'failed'
            ).length;

            $q.notify({
              type: successCount > 0 ? 'positive' : 'negative',
              message: $t('orderLists.ordersSent', {
                successCount,
                failedCount,
              }),
              timeout: 3000,
            });
          } catch (error) {
            $q.notify({
              type: 'negative',
              message: $t('orderLists.sendError'),
              caption:
                error instanceof Error ? error.message : 'Onbekende fout',
            });
          }
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: $t('orderLists.processingError'),
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      processingGlobalOrder.value = false;
    }
  };

  const viewOrderList = (orderList: OrderListWithItems) => {
    router.push(`/order-lists/${orderList.id}`);
  };

  const editOrderList = (orderList: OrderListWithItems) => {
    // Implementation for editing order list
    $q.notify({
      type: 'info',
      message: $t('orderLists.editComing'),
      timeout: 2000,
    });
  };

  const duplicateOrderList = async (orderList: OrderListWithItems) => {
    try {
      const newName = `${orderList.name} (kopie)`;
      const newList = await orderListsStore.duplicateOrderList(
        orderList.id,
        newName
      );

      $q.notify({
        type: 'positive',
        message: $t('orderLists.duplicated'),
        caption: `Nieuwe lijst: ${newList.name}`,
        timeout: 3000,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: $t('orderLists.duplicateError'),
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    }
  };

  const deleteOrderList = async (orderList: OrderListWithItems) => {
    $q.dialog({
      title: 'Lijst verwijderen',
      message: $t('orderLists.deleteConfirmText', { name: orderList.name }),
      ok: {
        label: 'Verwijderen',
        color: 'negative',
      },
      cancel: {
        label: 'Annuleren',
        color: 'grey',
        flat: true,
      },
    }).onOk(async () => {
      try {
        await orderListsStore.deleteOrderList(orderList.id);

        $q.notify({
          type: 'positive',
          message: $t('orderLists.deleted'),
          timeout: 2000,
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: $t('orderLists.deleteError'),
          caption: error instanceof Error ? error.message : 'Onbekende fout',
        });
      }
    });
  };

  const handleOrderCreated = (orderList: OrderListWithItems) => {
    $q.notify({
      type: 'positive',
      message: $t('orderLists.orderCreated'),
      caption: `Vanuit lijst: ${orderList.name}`,
      timeout: 3000,
    });
  };

  const handleListUpdated = (orderList: OrderListWithItems) => {
    $q.notify({
      type: 'positive',
      message: $t('orderLists.updated'),
      timeout: 2000,
    });
  };

  const handleAnalyticsRequest = (orderList: OrderListWithItems) => {
    router.push(`/analytics?list=${orderList.id}`);
  };

  const handleOrderListCreated = () => {
    showCreateDialog.value = false;

    $q.notify({
      type: 'positive',
      message: $t('orderLists.created'),
      timeout: 2000,
    });
  };

  // Lifecycle
  onMounted(async () => {
    loading.value = true;
    try {
      const practiceId = authStore.clinicId;
      if (practiceId) {
        await Promise.all([
          orderListsStore.fetchOrderLists(practiceId),
          suppliersStore.fetchSuppliers(),
          orderListsStore.generateOrderSuggestions(practiceId),
        ]);
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: $t('orderLists.loadDataError'),
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      loading.value = false;
    }
  });

  // Watch for practice changes
  watch(
    () => authStore.clinicId,
    async newPracticeId => {
      if (newPracticeId) {
        loading.value = true;
        try {
          await Promise.all([
            orderListsStore.fetchOrderLists(newPracticeId),
            orderListsStore.generateOrderSuggestions(newPracticeId),
          ]);
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: $t('orderLists.loadDataError'),
            caption: error instanceof Error ? error.message : 'Onbekende fout',
          });
        } finally {
          loading.value = false;
        }
      }
    }
  );
</script>

<style scoped>
  /* Dashboard Statistics Cards */
  .stats-cards-container {
    .stats-card-col {
      padding: var(--space-2, 8px);

      .kpi-content {
        text-align: center;
        padding: var(--space-4, 16px);

        .kpi-value {
          font-family: var(--font-family);
          font-size: var(--text-4xl, 2.25rem);
          font-weight: var(--font-weight-bold, 700);
          line-height: var(--leading-tight, 1.25);
          margin-bottom: var(--space-2, 8px);
          font-variant-numeric: tabular-nums;
        }

        .kpi-subtitle {
          font-family: var(--font-family);
          font-size: var(--text-xs, 0.75rem);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: var(--leading-normal, 1.5);
        }
      }
    }
  }

  /* Order Lists Grid */
  .order-lists-grid {
    .order-list-col {
      padding: 8px;
    }
  }

  /* Filters Section */
  .filters-section {
    margin-bottom: var(--space-6, 24px);
  }
</style>
