<template>
  <q-notification-group position="top-right">
    <transition-group name="notification-list" tag="div">
      <q-card
        v-for="notification in notifications"
        :key="notification.id"
        flat
        bordered
        class="stock-notification"
        :class="`notification-${notification.type}`"
      >
        <q-card-section horizontal>
          <q-avatar
            :color="getNotificationColor(notification.type)"
            text-color="white"
          >
            <q-icon :name="getNotificationIcon(notification.type)" />
          </q-avatar>

          <q-card-section class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              {{ formatTime(notification.timestamp) }}
            </div>
          </q-card-section>

          <q-card-actions vertical>
            <q-btn
              flat
              dense
              round
              icon="close"
              size="sm"
              @click="dismissNotification(notification.id)"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </transition-group>
  </q-notification-group>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useInventoryStore } from 'src/stores/inventory';

  interface StockNotification {
    id: string;
    type:
      | 'stock_update'
      | 'stock_low'
      | 'stock_out'
      | 'transfer'
      | 'adjustment';
    title: string;
    message: string;
    productId?: string;
    productName?: string;
    oldQuantity?: number;
    newQuantity?: number;
    timestamp: Date;
  }

  const { t } = useI18n();
  const inventoryStore = useInventoryStore();

  const notifications = ref<StockNotification[]>([]);

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'stock_update':
        return 'blue-6';
      case 'stock_low':
        return 'orange-6';
      case 'stock_out':
        return 'red-6';
      case 'transfer':
        return 'purple-6';
      case 'adjustment':
        return 'green-6';
      default:
        return 'grey-6';
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'stock_update':
        return 'inventory_2';
      case 'stock_low':
        return 'warning';
      case 'stock_out':
        return 'error';
      case 'transfer':
        return 'swap_horiz';
      case 'adjustment':
        return 'edit';
      default:
        return 'notifications';
    }
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const addNotification = (
    notification: Omit<StockNotification, 'id' | 'timestamp'>
  ) => {
    const newNotification: StockNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    notifications.value.unshift(newNotification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);

    // Keep max 5 notifications
    if (notifications.value.length > 5) {
      notifications.value = notifications.value.slice(0, 5);
    }
  };

  const dismissNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Listen for real-time inventory updates
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    // Mock subscription to demonstrate real-time notifications
    // In a real implementation, this would listen to the inventory store's real-time events
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance every 10 seconds for demo
        addNotification({
          type: 'stock_update',
          title: t('inventory.stockUpdated'),
          message: t('inventory.stockUpdatedMessage', {
            product: 'BD Spuit 10ml',
            quantity: 25,
          }),
          productName: 'BD Spuit 10ml',
          newQuantity: 25,
        });
      }
    }, 10000);

    unsubscribe = () => clearInterval(interval);
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Expose function for parent components
  defineExpose({
    addNotification,
  });
</script>

<style lang="scss" scoped>
  .stock-notification {
    margin-bottom: 8px;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .notification-content {
      flex: 1;
      padding: 12px;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 0.8rem;
      color: var(--q-grey-7);
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: 0.7rem;
      color: var(--q-grey-5);
    }
  }

  .notification-list-enter-active,
  .notification-list-leave-active {
    transition: all 0.3s ease;
  }

  .notification-list-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }

  .notification-list-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
