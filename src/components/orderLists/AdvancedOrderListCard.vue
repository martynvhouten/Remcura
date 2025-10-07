<template>
  <div class="modern-order-card">
    <!-- Card Header -->
    <div class="card-header">
      <div class="header-left">
        <div class="list-icon">
          <q-icon
            :name="getListIcon()"
            :color="getIconColor()"
            class="icon-size-lg"
          />
        </div>
        <div class="list-info">
          <h3 class="list-title">{{ orderList.name }}</h3>
          <p class="list-subtitle">
            {{ orderList.description || 'Geen beschrijving' }}
          </p>
        </div>
      </div>

      <div class="header-right">
        <q-badge
          :color="statusColor"
          :label="statusLabel"
          class="status-badge"
        />
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          class="menu-btn"
          @click="showActionsMenu = !showActionsMenu"
        />
      </div>
    </div>

    <!-- Tags Row -->
    <div
      v-if="(orderList as any).tags && (orderList as any).tags.length > 0"
      class="tags-section"
    >
      <q-chip
        v-for="tag in (orderList as any).tags"
        :key="tag"
        size="sm"
        outline
        :label="tag"
        class="tag-chip"
      />
    </div>

    <!-- Actions Menu -->
    <q-menu v-model="showActionsMenu" anchor="top right" self="top right">
      <q-list dense class="actions-menu">
        <q-item v-close-popup clickable @click="openOrderList">
          <q-item-section avatar>
            <q-icon name="open_in_new" />
          </q-item-section>
          <q-item-section>Openen</q-item-section>
        </q-item>

        <q-item v-close-popup clickable @click="duplicateList">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>Dupliceren</q-item-section>
        </q-item>

        <q-item v-close-popup clickable @click="exportList">
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>Exporteren</q-item-section>
        </q-item>

        <q-separator />

        <q-item
          v-close-popup
          clickable
          class="text-primary"
          @click="editSettings"
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Instellingen</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Critical Items Alert -->
      <div
        v-if="
          reorderAdvice && reorderAdvice.items_by_urgency.critical.length > 0
        "
        class="critical-alert"
      >
        <div class="alert-icon">
          <q-icon name="warning" color="negative" class="icon-size-base" />
        </div>
        <div class="alert-content">
          <span class="alert-text"
            >{{ reorderAdvice.items_by_urgency.critical.length }} kritieke
            items</span
          >
          <q-btn
            flat
            dense
            label="Bestel nu"
            :loading="creatingOrder"
            color="negative"
            size="sm"
            class="alert-btn"
            @click="orderCriticalItems"
          />
        </div>
      </div>

      <!-- Stock Overview Stats -->
      <div class="stats-grid">
        <div class="stat-item stat-critical">
          <div class="stat-value">{{ outOfStockCount }}</div>
          <div class="stat-label">Uitverkocht</div>
        </div>

        <div class="stat-item stat-warning">
          <div class="stat-value">{{ lowStockCount }}</div>
          <div class="stat-label">Laag</div>
        </div>

        <div class="stat-item stat-success">
          <div class="stat-value">{{ normalStockCount }}</div>
          <div class="stat-label">Normaal</div>
        </div>

        <div class="stat-item stat-info">
          <div class="stat-value">{{ overstockedCount }}</div>
          <div class="stat-label">Teveel</div>
        </div>
      </div>

      <!-- Quick Info -->
      <div class="quick-info">
        <div class="info-item">
          <q-icon name="inventory" class="info-icon icon-size-sm" />
          <span>{{ orderList.total_items || 0 }} items</span>
        </div>
        <div class="info-item">
          <q-icon name="euro" class="info-icon icon-size-sm" />
          <span>€{{ ((orderList as any).total_value || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Order recommendations -->
    <div v-if="showRecommendations" class="order-recommendations q-pt-none">
      <div class="text-subtitle2 q-mb-md">📋 Besteladvies</div>

      <!-- Supplier breakdown -->
      <div
        v-if="reorderAdvice && reorderAdvice.suppliers_involved.length > 0"
        class="suppliers-breakdown q-mb-md"
      >
        <div class="text-caption text-grey-6 q-mb-xs">
          Leveranciers betrokken:
        </div>
        <div class="row q-gutter-xs">
          <q-chip
            v-for="supplier in reorderAdvice.suppliers_involved"
            :key="supplier"
            size="sm"
            color="primary"
            text-color="white"
            :label="supplier"
            icon="business"
          />
        </div>
      </div>

      <!-- Top priority items preview -->
      <div v-if="topPriorityItems.length > 0" class="priority-items">
        <div class="text-caption text-grey-6 q-mb-xs">Prioriteit items:</div>
        <q-list dense class="rounded-borders">
          <q-item
            v-for="item in topPriorityItems.slice(0, 3)"
            :key="item.product_id"
            class="q-pa-xs"
          >
            <q-item-section avatar>
              <q-icon
                :name="getUrgencyIcon(item.urgency_level)"
                :color="getUrgencyColor(item.urgency_level)"
                size="sm"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                item.product_name
              }}</q-item-label>
              <q-item-label caption>
                Voorraad: {{ item.current_stock }} / Min:
                {{ item.minimum_stock }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-right">
                <div class="text-weight-bold text-primary">
                  {{ item.calculated_order_quantity }}
                </div>
                <div class="text-caption">bestellen</div>
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="topPriorityItems.length > 3" class="text-center">
            <q-item-section>
              <q-item-label class="text-grey-6">
                +{{ topPriorityItems.length - 3 }} meer...
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Cost estimation -->
      <div v-if="reorderAdvice" class="cost-estimation q-mt-md">
        <div class="row items-center">
          <div class="col">
            <div class="text-caption text-grey-6">Geschatte kosten:</div>
            <div class="text-h6 text-primary">
              €{{ reorderAdvice.total_estimated_cost.toFixed(2) }}
            </div>
          </div>
          <div class="col-auto">
            <div class="text-caption text-grey-6">Items:</div>
            <div class="text-subtitle1">
              {{ reorderAdvice.total_items_to_order }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="card-actions">
      <!-- Primary Actions -->
      <div class="primary-actions">
        <q-btn
          v-if="hasItemsToOrder"
          :loading="creatingOrder"
          icon="shopping_cart"
          :label="`Bestel (${itemsToOrderCount})`"
          color="primary"
          unelevated
          no-caps
          size="sm"
          class="action-btn action-btn--primary"
          @click="createQuickOrder"
        />

        <q-btn
          icon="open_in_new"
          label="Beheren"
          color="primary"
          outline
          no-caps
          size="sm"
          class="action-btn action-btn--secondary"
          @click="openOrderList"
        />
      </div>

      <!-- Secondary Actions -->
      <div class="secondary-actions">
        <q-btn
          flat
          round
          dense
          icon="inventory"
          color="grey-7"
          size="sm"
          class="icon-btn"
          @click="openStockManager"
        >
          <q-tooltip>Voorraad beheren</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="analytics"
          color="grey-7"
          size="sm"
          class="icon-btn"
          @click="viewAnalytics"
        >
          <q-tooltip>Analytics</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="settings"
          color="grey-7"
          size="sm"
          class="icon-btn"
          @click="editSettings"
        >
          <q-tooltip>Instellingen</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Mini progress bar for auto-reorder lists -->
    <div
      v-if="(orderList as any).auto_reorder_enabled"
      class="auto-reorder-progress"
    >
      <q-linear-progress
        :value="autoReorderProgress"
        :color="autoReorderProgress > 0.8 ? 'warning' : 'primary'"
        size="4px"
      />
      <div class="text-caption text-center q-pa-xs text-grey-6">
        Volgende automatische controle: {{ nextAutoCheck }}
      </div>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettingsDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Bestellijst instellingen</div>
          <div class="text-caption text-grey-6">{{ orderList.name }}</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <!-- Basic settings -->
            <q-input v-model="settingsForm.name" label="Naam" outlined dense />

            <q-input
              v-model="settingsForm.description"
              label="Beschrijving"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <!-- List type -->
            <q-select
              v-model="settingsForm.list_type"
              label="Type lijst"
              :options="listTypeOptions"
              outlined
              dense
              emit-value
              map-options
            />

            <!-- Auto-reorder settings -->
            <div class="q-gutter-sm">
              <q-toggle
                v-model="settingsForm.auto_reorder_enabled"
                label="Automatisch herbestellen"
                color="primary"
              />

              <q-input
                v-if="settingsForm.auto_reorder_enabled"
                v-model.number="settingsForm.reorder_frequency_days"
                label="Controle frequentie (dagen)"
                type="number"
                outlined
                dense
                min="1"
                max="365"
              />
            </div>

            <!-- Order timing -->
            <div class="row q-gutter-sm">
              <q-select
                v-model="settingsForm.preferred_order_day"
                label="Voorkeur besteldag"
                :options="dayOptions"
                outlined
                dense
                emit-value
                map-options
                class="col"
              />

              <q-input
                v-model="settingsForm.order_cutoff_time"
                label="Besteltijd"
                type="time"
                outlined
                dense
                class="col"
              />
            </div>

            <!-- Minimum order value -->
            <q-input
              v-model.number="settingsForm.min_order_value"
              label="Minimum bestelwaarde (€)"
              type="number"
              outlined
              dense
              min="0"
              step="0.01"
            />

            <!-- Tags -->
            <q-select
              v-model="settingsForm.tags"
              label="Tags"
              multiple
              outlined
              dense
              use-input
              use-chips
              input-debounce="0"
              new-value-mode="add-unique"
              hint="Voer tags in en druk op Enter"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annuleren" @click="showSettingsDialog = false" />
          <q-btn
            :loading="savingSettings"
            color="primary"
            label="Opslaan"
            @click="saveSettings"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import { useOrderListsStore } from '@/stores/orderLists';
  import { useAuthStore } from '@/stores/auth';
  import { BaseCard } from '@/components/cards';
  import type { OrderListWithItems } from '@/types/stores';
  import type {
    OrderAdvice,
    ReorderSuggestion,
  } from '@/stores/orderLists/orderLists-minmax';

  interface Props {
    orderList: OrderListWithItems;
    reorderAdvice?: OrderAdvice;
    showRecommendations?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showRecommendations: true,
  });

  const emit = defineEmits<{
    'order-created': [orderList: OrderListWithItems];
    'list-updated': [orderList: OrderListWithItems];
    'analytics-requested': [orderList: OrderListWithItems];
  }>();

  const $q = useQuasar();
  const router = useRouter();
  const orderListsStore = useOrderListsStore();

  // State
  const creatingOrder = ref(false);
  const showSettingsDialog = ref(false);
  const savingSettings = ref(false);
  const showActionsMenu = ref(false);

  // Settings form
  const settingsForm = ref({
    name: '',
    description: '',
    list_type: 'reorder_list',
    auto_reorder_enabled: false,
    reorder_frequency_days: 14,
    preferred_order_day: null,
    order_cutoff_time: '',
    min_order_value: 0,
    tags: [],
  });

  // Options
  const listTypeOptions = [
    { label: 'Herbestel lijst', value: 'reorder_list' },
    { label: 'Winkellijst', value: 'shopping_list' },
    { label: 'Noodlijst', value: 'emergency_list' },
    { label: 'Onderhoudslijst', value: 'maintenance_list' },
  ];

  const dayOptions = [
    { label: 'Zondag', value: 0 },
    { label: 'Maandag', value: 1 },
    { label: 'Dinsdag', value: 2 },
    { label: 'Woensdag', value: 3 },
    { label: 'Donderdag', value: 4 },
    { label: 'Vrijdag', value: 5 },
    { label: 'Zaterdag', value: 6 },
  ];

  // Computed properties
  const cardClasses = computed(() => ({
    'full-height': true,
  }));

  const statusColor = computed(() => {
    const status = props.orderList.status;
    if (status === 'active') return 'positive';
    if (status === 'draft') return 'warning';
    if (status === 'submitted') return 'info';
    if (status === 'completed') return 'primary';
    if (status === 'cancelled') return 'negative';
    return 'grey';
  });

  const statusLabel = computed(() =>
    getStatusLabel(props.orderList.status ?? 'draft')
  );

  const hasUrgentItems = computed(() => {
    return (
      (props.reorderAdvice?.items_by_urgency.critical?.length ?? 0) > 0 ||
      (props.reorderAdvice?.items_by_urgency.high?.length ?? 0) > 0
    );
  });

  const outOfStockCount = computed(() => {
    return (
      orderListsStore.orderSuggestions?.filter(
        item =>
          item.urgency_level === 'critical' &&
          item.order_list_id === props.orderList.id
      ).length || 0
    );
  });

  const lowStockCount = computed(() => {
    return (
      orderListsStore.orderSuggestions?.filter(
        item =>
          item.urgency_level === 'high' &&
          item.order_list_id === props.orderList.id
      ).length || 0
    );
  });

  const normalStockCount = computed(() => {
    return (
      orderListsStore.orderSuggestions?.filter(
        item =>
          (item.urgency_level as string) === 'medium' &&
          item.order_list_id === props.orderList.id
      ).length || 0
    );
  });

  const overstockedCount = computed(() => {
    return (
      orderListsStore.orderSuggestions?.filter(
        item =>
          (item.urgency_level as string) === 'low' &&
          item.order_list_id === props.orderList.id
      ).length || 0
    );
  });

  const topPriorityItems = computed(() => {
    if (!props.reorderAdvice) {
      return [];
    }

    return [
      ...(props.reorderAdvice.items_by_urgency.critical ?? []),
      ...(props.reorderAdvice.items_by_urgency.high ?? []),
      ...(props.reorderAdvice.items_by_urgency.normal ?? []),
    ].slice(0, 5);
  });

  const hasItemsToOrder = computed(() => {
    return (props.reorderAdvice?.total_items_to_order ?? 0) > 0;
  });

  const itemsToOrderCount = computed(() => {
    return props.reorderAdvice?.total_items_to_order || 0;
  });

  const autoReorderProgress = computed(() => {
    const autoReorderEnabled = (props.orderList as any).auto_reorder_enabled;
    const reorderFrequency = (props.orderList as any).reorder_frequency_days;
    if (!autoReorderEnabled || !reorderFrequency) {
      return 0;
    }

    const lastCheck = (props.orderList as any).last_auto_check
      ? new Date((props.orderList as any).last_auto_check)
      : new Date();
    const daysSinceLastCheck =
      (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);

    return Math.min(daysSinceLastCheck / reorderFrequency, 1);
  });

  const nextAutoCheck = computed(() => {
    const autoReorderEnabled = (props.orderList as any).auto_reorder_enabled;
    if (!autoReorderEnabled) {
      return 'Niet gepland';
    }

    const lastCheck = (props.orderList as any).last_auto_check
      ? new Date((props.orderList as any).last_auto_check)
      : new Date();
    const nextCheck = new Date(lastCheck);
    nextCheck.setDate(
      nextCheck.getDate() +
        ((props.orderList as any).reorder_frequency_days || 14)
    );

    return nextCheck.toLocaleDateString('nl-NL');
  });

  const getListIcon = () => {
    if ((props.orderList as any).auto_reorder_enabled) {
      return 'schedule';
    }
    if (hasUrgentItems.value) {
      return 'warning';
    }
    return 'list_alt';
  };

  const getIconColor = () => {
    if (hasUrgentItems.value) {
      return 'negative';
    }
    if ((props.orderList as any).auto_reorder_enabled) {
      return 'info';
    }
    return 'primary';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Klaar';
      case 'draft':
        return 'Concept';
      case 'submitted':
        return 'Verzonden';
      case 'confirmed':
        return 'Bevestigd';
      case 'delivered':
        return 'Geleverd';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return 'Onbekend';
    }
  };

  // Methods
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'low_priority';
      default:
        return 'help';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'negative';
      case 'high':
        return 'warning';
      case 'normal':
        return 'primary';
      case 'low':
        return 'grey';
      default:
        return 'grey';
    }
  };

  const openOrderList = () => {
    router.push(`/order-lists/${props.orderList.id}`);
  };

  const createQuickOrder = async () => {
    if (!props.reorderAdvice) {
      return;
    }

    creatingOrder.value = true;
    try {
      const itemsToOrder = [
        ...props.reorderAdvice.items_by_urgency.critical,
        ...props.reorderAdvice.items_by_urgency.high,
        ...props.reorderAdvice.items_by_urgency.normal,
      ].filter(item => item.calculated_order_quantity > 0);

      const orders = await orderListsStore.applyOrderSuggestions();

      $q.notify({
        type: 'positive',
        message: `${orders.length} bestelling(en) aangemaakt!`,
        caption: `${itemsToOrder.length} items geselecteerd`,
        timeout: 3000,
      });

      emit('order-created', props.orderList);
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fout bij aanmaken bestelling',
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      creatingOrder.value = false;
    }
  };

  const orderAllItems = async () => {
    creatingOrder.value = true;
    try {
      const allItems =
        orderListsStore.orderSuggestions?.filter(
          item => item.order_list_id === props.orderList.id
        ) || [];

      const orders = await orderListsStore.applyOrderSuggestions();

      $q.notify({
        type: 'positive',
        message: `${orders.length} bestelling(en) aangemaakt!`,
        caption: `Alle ${allItems.length} items geselecteerd`,
        timeout: 3000,
      });

      emit('order-created', props.orderList);
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fout bij aanmaken bestelling',
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      creatingOrder.value = false;
    }
  };

  const orderCriticalItems = async () => {
    if (!props.reorderAdvice?.items_by_urgency.critical.length) {
      return;
    }

    creatingOrder.value = true;
    try {
      const orders = await orderListsStore.applyOrderSuggestions();

      $q.notify({
        type: 'positive',
        message: 'Kritieke items besteld!',
        caption: `${props.reorderAdvice.items_by_urgency.critical.length} items`,
        timeout: 3000,
      });

      emit('order-created', props.orderList);
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fout bij bestellen kritieke items',
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      creatingOrder.value = false;
    }
  };

  const openStockManager = () => {
    // Ga naar voorraad levels pagina met filter op deze bestellijst
    router.push({
      name: 'inventory-levels',
      query: { orderListId: props.orderList.id },
    });
  };

  const viewAnalytics = () => {
    emit('analytics-requested', props.orderList);
  };

  const scheduleAutomation = () => {
    settingsForm.value.auto_reorder_enabled = true;
    showSettingsDialog.value = true;
  };

  const duplicateList = async () => {
    try {
      const newList = await orderListsStore.duplicateOrderList(
        props.orderList.id,
        `${props.orderList.name} (kopie)`
      );

      $q.notify({
        type: 'positive',
        message: 'Lijst gedupliceerd!',
        caption: `Nieuwe lijst: ${newList.name}`,
        timeout: 3000,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fout bij dupliceren lijst',
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    }
  };

  const exportList = () => {
    // Implementation for exporting list
    $q.notify({
      type: 'info',
      message: 'Export functie komt binnenkort',
      timeout: 2000,
    });
  };

  const editSettings = () => {
    // Populate form with current values
    const extendedOrderList = props.orderList as any;
    settingsForm.value = {
      name: props.orderList.name,
      description: props.orderList.description || '',
      list_type: extendedOrderList.list_type || 'reorder_list',
      auto_reorder_enabled: extendedOrderList.auto_reorder_enabled || false,
      reorder_frequency_days: extendedOrderList.reorder_frequency_days || 14,
      preferred_order_day: extendedOrderList.preferred_order_day || null,
      order_cutoff_time: extendedOrderList.order_cutoff_time || '',
      min_order_value: extendedOrderList.min_order_value || 0,
      tags: extendedOrderList.tags || [],
    };

    showSettingsDialog.value = true;
  };

  const saveSettings = async () => {
    savingSettings.value = true;
    try {
      await orderListsStore.updateOrderList({
        id: props.orderList.id,
        ...settingsForm.value,
      });

      $q.notify({
        type: 'positive',
        message: 'Instellingen opgeslagen!',
        timeout: 2000,
      });

      emit('list-updated', props.orderList);
      showSettingsDialog.value = false;
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fout bij opslaan instellingen',
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      savingSettings.value = false;
    }
  };

  // Lifecycle
  onMounted(async () => {
    // Load order suggestions for this list if not already loaded
    const authStore = useAuthStore();
    if (authStore.clinicId) {
      await orderListsStore.generateOrderSuggestions(authStore.clinicId);
    }
  });
</script>

<style scoped>
  /* Order list card styles */
  .modern-order-card {
    background: white;
    border-radius: 16px;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .modern-order-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  /* Card Header */
  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .list-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(25, 118, 210, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .list-info {
    flex: 1;
    min-width: 0;
  }

  .list-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    line-height: 1.3;
    word-break: break-word;
  }

  .list-subtitle {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .status-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .menu-btn {
    width: 32px;
    height: 32px;
    color: #666;
  }

  .menu-btn:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  /* Tags Section */
  .tags-section {
    padding: 0 20px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag-chip {
    font-size: 11px;
    border-color: rgba(0, 0, 0, 0.12);
    color: #666;
  }

  /* Card Content */
  .card-content {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Critical Alert */
  .critical-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(244, 67, 54, 0.08);
    border: 1px solid rgba(244, 67, 54, 0.2);
    border-radius: 8px;
  }

  .alert-icon {
    flex-shrink: 0;
  }

  .alert-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .alert-text {
    font-size: 13px;
    font-weight: 500;
    color: #d32f2f;
  }

  .alert-btn {
    font-size: 12px;
    min-height: 28px;
    padding: 0 12px;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-item {
    text-align: center;
    padding: 12px 8px;
    border-radius: 8px;
    border: 1px solid;
    transition: transform 0.2s ease;
  }

  .stat-item:hover {
    transform: scale(1.02);
  }

  .stat-critical {
    background: rgba(244, 67, 54, 0.08);
    border-color: rgba(244, 67, 54, 0.2);
  }

  .stat-warning {
    background: rgba(255, 152, 0, 0.08);
    border-color: rgba(255, 152, 0, 0.2);
  }

  .stat-success {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.2);
  }

  .stat-info {
    background: rgba(33, 150, 243, 0.08);
    border-color: rgba(33, 150, 243, 0.2);
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-critical .stat-value {
    color: #d32f2f;
  }
  .stat-warning .stat-value {
    color: #f57c00;
  }
  .stat-success .stat-value {
    color: #388e3c;
  }
  .stat-info .stat-value {
    color: #1976d2;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
  }

  /* Quick Info */
  .quick-info {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    margin-top: auto;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
  }

  .info-icon {
    color: #999;
  }

  /* Card Actions */
  .card-actions {
    padding: 16px 20px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .primary-actions {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  .action-btn {
    flex: 1;
    min-height: 36px;
    font-size: 13px;
    font-weight: 500;
  }

  .action-btn--primary {
    background: linear-gradient(135deg, #1976d2, #1565c0);
  }

  .action-btn--secondary {
    border-color: #1976d2;
    color: #1976d2;
  }

  .secondary-actions {
    display: flex;
    gap: 4px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  .icon-btn:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  /* Actions Menu */
  .actions-menu {
    min-width: 160px;
    border-radius: 8px;
    overflow: hidden;
  }

  /* Auto Reorder Progress */
  .auto-reorder-progress {
    margin-top: -1px;
    background: var(--q-surface);
  }

  /* Dark Mode Support */
  .body--dark .modern-order-card {
    background: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.12);
  }

  .body--dark .card-header {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .body--dark .list-title {
    color: #fff;
  }

  .body--dark .list-subtitle {
    color: #bbb;
  }

  .body--dark .quick-info {
    background: rgba(255, 255, 255, 0.08);
  }

  .body--dark .card-actions {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  /* Responsive Design */
  @media (max-width: 600px) {
    .card-header {
      padding: 16px;
    }

    .card-content {
      padding: 12px 16px;
    }

    .card-actions {
      padding: 12px 16px 16px;
      flex-direction: column;
      gap: 8px;
    }

    .primary-actions {
      width: 100%;
    }

    .secondary-actions {
      justify-content: center;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .stat-item {
      padding: 8px 6px;
    }

    .stat-value {
      font-size: 18px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .modern-order-card,
    .stat-item,
    .icon-btn,
    .menu-btn {
      transition: none;
    }

    .modern-order-card:hover {
      transform: none;
    }

    .stat-item:hover {
      transform: none;
    }
  }
</style>
