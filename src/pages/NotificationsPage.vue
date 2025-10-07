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
          :loading="loading"
          class="modern-action-btn"
          @click="loadNotifications"
        >
          <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
        </q-btn>
      </template>
    </PageTitle>

    <div class="notifications-container">
      <!-- Modern Filter Section -->
      <div class="notifications-filters">
        <div class="filter-tabs">
          <q-btn
            :flat="filter !== 'all'"
            :unelevated="filter === 'all'"
            :color="filter === 'all' ? 'primary' : undefined"
            :text-color="filter === 'all' ? 'white' : 'grey-7'"
            :label="`${$t('notificationsPage.all')} (${notifications.length})`"
            class="filter-tab"
            no-caps
            @click="filter = 'all'"
          />
          <q-btn
            :flat="filter !== 'unread'"
            :unelevated="filter === 'unread'"
            :color="filter === 'unread' ? 'primary' : undefined"
            :text-color="filter === 'unread' ? 'white' : 'grey-7'"
            :label="`${$t('notificationsPage.unread')} (${unreadCount})`"
            class="filter-tab"
            no-caps
            @click="filter = 'unread'"
          />
        </div>

        <div class="filter-actions">
          <q-select
            v-model="categoryFilter"
            :options="categoryOptions"
            :label="$t('notificationsPage.filterByCategory')"
            emit-value
            map-options
            clearable
            outlined
            dense
            class="category-filter"
          />
          <q-btn
            flat
            icon="mark_email_read"
            :label="$t('notificationsPage.markAllRead')"
            :disable="unreadCount === 0"
            color="positive"
            class="action-btn"
            no-caps
            @click="markAllAsRead"
          />
          <q-btn
            flat
            icon="clear_all"
            :label="$t('notificationsPage.clearAllNotifications')"
            color="negative"
            class="action-btn"
            no-caps
            @click="confirmClearAll"
          />
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-content">
        <!-- Empty State -->
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <q-icon name="notifications_none" />
          </div>
          <div class="empty-state-title">
            {{ $t('notificationsPage.noNotifications') }}
          </div>
          <div class="empty-state-subtitle">
            {{ $t('notificationsPage.allCaughtUp') }}
          </div>
        </div>

        <!-- Notifications List -->
        <div v-else class="notifications-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !notification.is_read }"
          >
            <div class="notification-avatar">
              <q-avatar
                :color="getCategoryColor(notification.category)"
                text-color="white"
                size="40px"
              >
                <q-icon :name="getCategoryIcon(notification.category)" />
              </q-avatar>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <div class="notification-meta">
                  <q-chip
                    :color="getCategoryColor(notification.category)"
                    text-color="white"
                    size="sm"
                    class="category-chip"
                  >
                    {{ $t(`notificationsPage.types.${notification.category}`) }}
                  </q-chip>
                  <span class="notification-time">
                    {{ formatDate(notification.created_at ?? '') }}
                  </span>
                </div>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
            </div>

            <div class="notification-actions">
              <q-btn
                v-if="!notification.is_read"
                flat
                round
                dense
                icon="mark_email_read"
                color="positive"
                size="sm"
                class="notification-action-btn"
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
                class="notification-action-btn"
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
                class="notification-action-btn"
                @click.stop="deleteNotification(notification.id)"
              >
                <q-tooltip>Verwijder melding</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
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
        new Date(b.created_at ?? '').getTime() -
        new Date(a.created_at ?? '').getTime()
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

<style scoped lang="scss">
  .notifications-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 100%;
  }

  // Modern Filter Section
  .notifications-filters {
    background: var(--surface);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    transition: var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-base);
    }

    .filter-tabs {
      display: flex;
      gap: var(--space-2);
      background: var(--bg-tertiary);
      padding: var(--space-1);
      border-radius: var(--radius-base);
    }

    .filter-tab {
      border-radius: var(--radius-sm);
      font-weight: var(--font-weight-medium);
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-4);
      transition: var(--transition-fast);
      min-height: 36px;

      &.q-btn--unelevated {
        box-shadow: var(--shadow-xs);
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .category-filter {
      min-width: 200px;

      :deep(.q-field__control) {
        border-radius: var(--radius-base);
      }
    }

    .action-btn {
      font-weight: var(--font-weight-medium);
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-base);
      transition: var(--transition-fast);

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
    }
  }

  // Notifications Content
  .notifications-content {
    background: var(--surface);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-base);
    }
  }

  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-6);
    text-align: center;

    .empty-state-icon {
      margin-bottom: var(--space-6);

      .q-icon {
        font-size: 4rem;
        color: var(--text-tertiary);
        opacity: 0.6;
      }
    }

    .empty-state-title {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      line-height: var(--leading-tight);
    }

    .empty-state-subtitle {
      font-size: var(--text-base);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }
  }

  // Notifications List
  .notifications-list {
    display: flex;
    flex-direction: column;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-5);
    border-bottom: 1px solid var(--border-primary);
    transition: var(--transition-fast);
    position: relative;
    background: var(--surface);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--bg-tertiary);
    }

    &--unread {
      background: rgba(var(--q-primary-rgb, 30, 58, 138), 0.02);
      border-left: 3px solid var(--q-primary);

      .notification-title {
        font-weight: var(--font-weight-semibold);
      }

      &::before {
        content: '';
        position: absolute;
        top: var(--space-5);
        right: var(--space-5);
        width: 8px;
        height: 8px;
        background: var(--q-primary);
        border-radius: var(--radius-full);
      }
    }

    .notification-avatar {
      flex-shrink: 0;
      margin-top: var(--space-1);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }

    .notification-title {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .category-chip {
      font-size: var(--text-xs);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-sm);
    }

    .notification-time {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
      font-weight: var(--font-weight-normal);
      white-space: nowrap;
    }

    .notification-message {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-normal);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex-shrink: 0;
      margin-top: var(--space-1);
    }

    .notification-action-btn {
      transition: var(--transition-fast);
      border-radius: var(--radius-base);

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-xs);
      }
    }
  }

  // Modern Action Button
  .modern-action-btn {
    transition: var(--transition-fast);
    border-radius: var(--radius-base);

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }

  // Responsive Design
  @media (max-width: 768px) {
    .notifications-filters {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-4);

      .filter-actions {
        justify-content: space-between;
        gap: var(--space-2);
      }

      .category-filter {
        min-width: auto;
        flex: 1;
      }
    }

    .notification-item {
      padding: var(--space-4);

      .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .notification-meta {
        align-self: stretch;
        justify-content: space-between;
      }

      .notification-actions {
        margin-top: var(--space-3);
        justify-content: center;
      }
    }
  }

  @media (max-width: 480px) {
    .notifications-container {
      gap: var(--space-4);
    }

    .notifications-filters {
      padding: var(--space-4);

      .filter-tabs {
        width: 100%;
        justify-content: center;
      }

      .filter-actions {
        flex-direction: column;
        width: 100%;
        gap: var(--space-3);
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }

    .notification-item {
      padding: var(--space-3);
      gap: var(--space-3);

      &--unread::before {
        top: var(--space-3);
        right: var(--space-3);
      }
    }
  }

  // Dark Mode Enhancements
  :deep(.body--dark) {
    .notifications-filters,
    .notifications-content {
      border-color: var(--border-primary);
    }

    .notification-item {
      &--unread {
        background: rgba(var(--q-primary-rgb, 59, 130, 246), 0.08);
      }

      &:hover {
        background: var(--bg-tertiary);
      }
    }

    .filter-tabs {
      background: var(--bg-primary);
    }
  }
</style>
