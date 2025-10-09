import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from './auth';
import type { Database } from '@/types';
import { notificationLogger } from '@/utils/logger';

export const useNotificationStore = defineStore('notifications', () => {
  type NotificationRecord =
    Database['public']['Tables']['notifications']['Row'];

  // State
  const notifications = ref<NotificationRecord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const unreadCount = computed(
    () => notifications.value.filter(n => !n.is_read).length
  );

  const hasUnreadNotifications = computed(() => unreadCount.value > 0);

  // Actions
  const loadNotifications = async () => {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId || authStore.selectedPractice?.id;

    if (!practiceId) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      notifications.value = data ?? [];
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load notifications';
      error.value = message;
      notificationLogger.error(
        'Error loading notifications',
        err instanceof Error ? err : undefined
      );
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const notification = notifications.value.find(
        n => n.id === notificationId
      );
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      }
    } catch (error) {
      notificationLogger.error(
        'Error marking notification as read',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: false,
          read_at: null,
        })
        .eq('id', notificationId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const notification = notifications.value.find(
        n => n.id === notificationId
      );
      if (notification) {
        notification.is_read = false;
        notification.read_at = null;
      }
    } catch (error) {
      notificationLogger.error(
        'Error marking notification as unread',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };

  const markAllAsRead = async () => {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId || authStore.selectedPractice?.id;

    if (!practiceId) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('practice_id', practiceId)
        .eq('is_read', false);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      notifications.value.forEach(n => {
        if (!n.is_read) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        }
      });
    } catch (error) {
      notificationLogger.error(
        'Error marking all as read',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      notifications.value = notifications.value.filter(
        n => n.id !== notificationId
      );
    } catch (error) {
      notificationLogger.error(
        'Error deleting notification',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };

  const clearAllNotifications = async () => {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId || authStore.selectedPractice?.id;

    if (!practiceId) return;

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('practice_id', practiceId);

      if (deleteError) {
        throw deleteError;
      }

      // Clear local state
      notifications.value = [];
    } catch (error) {
      notificationLogger.error(
        'Error clearing all notifications',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };

  return {
    // State
    notifications,
    loading,
    error,

    // Getters
    unreadCount,
    hasUnreadNotifications,

    // Actions
    loadNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
});
