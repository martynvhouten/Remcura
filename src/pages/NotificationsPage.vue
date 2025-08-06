<template>
  <PageLayout>
    <PageTitle
      :title="$t('notificationsPage.title')"
      :subtitle="$t('notificationsPage.subtitle')"
      icon="campaign"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          @click="loadNotifications"
          :loading="loading"
          class="app-btn-refresh"
        >
          <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
        </q-btn>
      </template>
    </PageTitle>

    <div class="row q-gutter-md">
      <!-- Simple Filters -->
      <div class="col-12">
        <div class="notification-filters q-mb-md">
          <q-btn-group flat>
            <q-btn
              flat
              :color="filter === 'all' ? 'primary' : 'grey-6'"
              :label="`${$t('notificationsPage.all')} (${notifications.length})`"
              @click="filter = 'all'"
              size="sm"
            />
            <q-btn
              flat
              :color="filter === 'unread' ? 'primary' : 'grey-6'"
              :label="`${$t('notificationsPage.unread')} (${unreadCount})`"
              @click="filter = 'unread'"
              size="sm"
            />
          </q-btn-group>
          
          <div class="q-ml-auto">
            <q-btn
              flat
              icon="mark_email_read"
              :label="$t('notificationsPage.markAllRead')"
              @click="markAllAsRead"
              :disable="unreadCount === 0"
              size="sm"
              color="positive"
            />
            <q-btn
              flat
              icon="clear_all"
              :label="$t('notificationsPage.clearAllNotifications')"
              @click="confirmClearAll"
              size="sm"
              color="negative"
              class="q-ml-sm"
            />
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="col-12">
        <BaseCard
          icon="notifications"
          icon-color="info"
          :title="`${
            filter === 'all'
              ? $t('notificationsPage.all')
              : $t('notificationsPage.unread')
          } ${$t('notificationsPage.title')}`"
        >
          <template #header-actions>
            <q-select
              v-model="categoryFilter"
              :options="categoryOptions"
              :label="$t('notificationsPage.filterByCategory')"
              emit-value
              map-options
              clearable
              style="min-width: 200px"
              dense
              outlined
              dark
            />
          </template>

          <div
            v-if="filteredNotifications.length === 0"
            class="text-center q-py-xl"
          >
            <q-icon name="notifications_none" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">
              {{ $t('notificationsPage.noNotifications') }}
            </div>
            <div class="text-body2 text-grey-5">
              {{ $t('notificationsPage.allCaughtUp') }}
            </div>
          </div>

          <q-list v-else separator>
            <q-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              clickable
              v-ripple
              :class="{ 'bg-blue-1': !notification.is_read }"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getCategoryColor(notification.category)"
                  text-color="white"
                >
                  <q-icon :name="getCategoryIcon(notification.category)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  notification.title
                }}</q-item-label>
                <q-item-label caption lines="2">{{
                  notification.message
                }}</q-item-label>
                <q-item-label caption>
                  <q-chip
                    :color="getCategoryColor(notification.category)"
                    text-color="white"
                    size="sm"
                  >
                    {{ $t(`notificationsPage.types.${notification.category}`) }}
                  </q-chip>
                  <span class="q-ml-sm text-grey-6">
                    {{ formatDate(notification.created_at) }}
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    v-if="!notification.is_read"
                    flat
                    round
                    dense
                    icon="mark_email_read"
                    color="positive"
                    size="sm"
                    @click.stop="markAsRead(notification.id)"
                  >
                    <q-tooltip>Markeer als gelezen</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    flat
                    round
                    dense
                    icon="mark_email_unread"
                    color="primary"
                    size="sm"
                    @click.stop="markAsUnread(notification.id)"
                  >
                    <q-tooltip>Markeer als ongelezen</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click.stop="deleteNotification(notification.id)"
                  >
                    <q-tooltip>Verwijder melding</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </BaseCard>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from 'src/stores/auth';
  import { useNotificationStore } from 'src/stores/notifications';
  import { monitoringService } from 'src/services/monitoring';
  import { useButtons } from 'src/composables/useButtons';
  import { supabase } from 'src/boot/supabase';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';

  const $q = useQuasar();
  const { t } = useI18n();
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const { quickActions, getThemeConfig } = useButtons();

  // State
  const filter = ref<'all' | 'unread'>('all');
  const categoryFilter = ref<string | null>(null);
  
  // Use store data
  const loading = computed(() => notificationStore.loading);
  const notifications = computed(() => notificationStore.notifications);
  const error = computed(() => notificationStore.error);



  // Load notifications using store
  const loadNotifications = () => {
    notificationStore.loadNotifications();
  };



  // Computed properties
  const unreadCount = computed(() => notificationStore.unreadCount);

  const filteredNotifications = computed(() => {
    let filtered = notifications.value;

    if (filter.value === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    }

    if (categoryFilter.value) {
      filtered = filtered.filter(n => n.category === categoryFilter.value);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  const categoryOptions = computed(() => [
    {
      label: 'Voorraad waarschuwingen',
      value: 'stock_alert',
    },
    {
      label: 'Bestelling updates',
      value: 'order_update',
    },
    {
      label: 'Systeem meldingen',
      value: 'system_notification',
    },
    {
      label: 'Batch vervaldatums',
      value: 'batch_expiry',
    },
    {
      label: 'Gebruiker activiteit',
      value: 'user_activity',
    },
  ]);

  // Methods
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationStore.markAsRead(notificationId);
      
      await monitoringService.trackEvent('notification_marked_read', {
        notification_id: notificationId,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      $q.notify({
        type: 'negative',
        message: t('notificationsPage.markReadError'),
      });
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      await notificationStore.markAsUnread(notificationId);
      
      await monitoringService.trackEvent('notification_marked_unread', {
        notification_id: notificationId,
      });
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      $q.notify({
        type: 'negative',
        message: t('notificationsPage.markUnreadError'),
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadCount = notificationStore.unreadCount;
      if (unreadCount === 0) return;

      await notificationStore.markAllAsRead();

      $q.notify({
        type: 'positive',
        message: t('notificationsPage.allMarkedAsRead'),
      });

      await monitoringService.trackEvent('notifications_mark_all_read', {
        count: unreadCount,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      $q.notify({
        type: 'negative',
        message: t('notificationsPage.markAllReadError'),
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationStore.deleteNotification(notificationId);

      $q.notify({
        type: 'positive',
        message: t('notificationsPage.notificationDeleted'),
      });

      await monitoringService.trackEvent('notification_deleted', {
        notification_id: notificationId,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      $q.notify({
        type: 'negative',
        message: t('notificationsPage.deleteNotificationError'),
      });
    }
  };

  const confirmClearAll = () => {
    $q.dialog({
      title: t('notificationsPage.clearAllConfirm'),
      message: t('notificationsPage.clearAllConfirmMessage'),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await notificationStore.clearAllNotifications();

        $q.notify({
          type: 'positive',
          message: t('notificationsPage.allNotificationsCleared'),
        });

        await monitoringService.trackEvent('notifications_cleared_all');
      } catch (error) {
        console.error('Error clearing all notifications:', error);
        $q.notify({
          type: 'negative',
          message: t('notificationsPage.clearAllError'),
        });
      }
    });
  };



  const getCategoryIcon = (category: string) => {
    const icons = {
      stock_alert: 'warning',
      order_update: 'shopping_cart',
      system_notification: 'info',
      batch_expiry: 'schedule',
      user_activity: 'person',
    };
    return icons[category as keyof typeof icons] || 'notifications';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      stock_alert: 'warning',
      order_update: 'primary',
      system_notification: 'info',
      batch_expiry: 'orange',
      user_activity: 'purple',
    };
    return colors[category as keyof typeof colors] || 'grey';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dag${diffDays > 1 ? 'en' : ''} geleden`;
    } else if (diffHours > 0) {
      return `${diffHours} uur geleden`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minuten geleden`;
    }
  };

  // Lifecycle
  onMounted(() => {
    loadNotifications();
  });
</script>

<style scoped>
.notification-filters {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(var(--q-primary), 0.05);
  border-radius: 8px;
  border: 1px solid rgba(var(--q-primary), 0.1);
}
</style>
