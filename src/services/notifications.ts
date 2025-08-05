import { supabase } from '@/services/supabase';
import type {
  NotificationSettings,
  NotificationSettingsInsert,
  PushToken,
  PushTokenInsert,
  NotificationChannel,
  NotificationType,
} from '@/types/supabase';
import { useAuthStore } from '@/stores/auth';
import { notificationLogger } from 'src/utils/logger';
import { ref, reactive } from 'vue';
import type { NotificationMessage } from '@/types/notifications';

export class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private inAppNotifications = ref<NotificationMessage[]>([]);
  private settings = reactive<Record<string, NotificationSettings>>({});

  constructor() {
    this.initializeServiceWorker();
    this.loadNotificationSettings();
  }

  /**
   * Initialize service worker for push notifications
   */
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        notificationLogger.info('Service Worker registered:', this.registration);
      } catch (error) {
        notificationLogger.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error($t('notificati.thisbrowserdoesnot'));
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      await this.subscribeToPushNotifications();
    }

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error($t('notificati.serviceworkernotregistered'));
    }

    try {
      // You would need to replace this with your actual VAPID public key
      const vapidPublicKey = 'your-vapid-public-key';

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Store subscription in database
      await this.storePushSubscription(subscription);

      return subscription;
    } catch (error) {
      notificationLogger.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Store push subscription in database
   */
  private async storePushSubscription(
    subscription: PushSubscription
  ): Promise<void> {
    const authStore = useAuthStore();
    const user = authStore.user;

    if (!user) { return; }

    const endpoint = subscription.endpoint;
    const keys = subscription.getKey
      ? {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')),
        }
      : null;

    const tokenData: PushTokenInsert = {
      user_id: user.id,
      token: JSON.stringify({ endpoint, keys }),
      platform: 'web',
      is_active: true,
    };

    // TODO: Implement push_tokens functionality when push notifications are activated
    notificationLogger.info('Push subscription stored (placeholder):', tokenData);
  }

  /**
   * Send in-app notification
   */
  showInAppNotification(notification: NotificationMessage): void {
    const id = crypto.randomUUID();
    const notificationWithId = { ...notification, id };

    this.inAppNotifications.value.unshift(notificationWithId);

    // Auto-remove after 5 seconds unless requireInteraction is true
    if (!notification.requireInteraction) {
      setTimeout(() => {
        this.removeInAppNotification(id);
      }, 5000);
    }
  }

  /**
   * Remove in-app notification
   */
  removeInAppNotification(id: string): void {
    const index = this.inAppNotifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      this.inAppNotifications.value.splice(index, 1);
    }
  }

  /**
   * Clear all in-app notifications
   */
  clearAllInAppNotifications(): void {
    this.inAppNotifications.value = [];
  }

  /**
   * Get in-app notifications
   */
  getInAppNotifications() {
    return this.inAppNotifications;
  }

  /**
   * Send browser notification
   */
  async showBrowserNotification(
    notification: NotificationMessage
  ): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/icon-192x192.png',
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      data: notification.data,
      actions: notification.actions,
    };

    new Notification(notification.title, options);
  }

  /**
   * Send push notification (server-side would call this)
   */
  async sendPushNotification(
    userId: string,
    notification: NotificationMessage
  ): Promise<void> {
    // In a real implementation, this would be called from your backend
    // Here we simulate it by showing a browser notification
    const authStore = useAuthStore();
    if (authStore.user?.id === userId) {
      await this.showBrowserNotification(notification);
    }
  }

  /**
   * Load notification settings for current user
   */
  async loadNotificationSettings(): Promise<void> {
    const authStore = useAuthStore();
    const user = authStore.user;
    const practiceId = authStore.selectedPractice?.id;

    if (!user || !practiceId) { return; }

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('practice_id', practiceId);

    if (error) {
      notificationLogger.error('Failed to load notification settings:', error);
      return;
    }

    data?.forEach(setting => {
      const key = `${setting.notification_type}_${setting.channel}`;
      this.settings[key] = setting;
    });
  }

  /**
   * Update notification settings
   */
  async updateNotificationSetting(
    notificationType: NotificationType,
    channel: NotificationChannel,
    isEnabled: boolean,
    settings?: any
  ): Promise<void> {
    const authStore = useAuthStore();
    const user = authStore.user;
    const practiceId = authStore.selectedPractice?.id;

    if (!user || !practiceId) { return; }

    const settingData: NotificationSettingsInsert = {
      user_id: user.id,
      practice_id: practiceId,
      notification_type: notificationType,
      channel,
      is_enabled: isEnabled,
      settings: settings || {},
    };

    const { error } = await supabase
      .from('notification_settings')
      .upsert(settingData, {
        onConflict: 'user_id,practice_id,notification_type,channel',
        ignoreDuplicates: false,
      });

    if (error) {
      notificationLogger.error('Failed to update notification setting:', error);
      return;
    }

    // Update local cache
    const key = `${notificationType}_${channel}`;
    this.settings[key] = {
      ...settingData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Check if notification is enabled
   */
  isNotificationEnabled(
    notificationType: NotificationType,
    channel: NotificationChannel
  ): boolean {
    const key = `${notificationType}_${channel}`;
    return this.settings[key]?.is_enabled ?? true; // Default to enabled
  }

  /**
   * Send stock alert notification
   */
  async sendStockAlert(
    productName: string,
    currentStock: number,
    minimumStock: number
  ): Promise<void> {
    const notification: NotificationMessage = {
      title: 'Voorraad Waarschuwing',
      body: `${productName} heeft lage voorraad (${currentStock}/${minimumStock})`,
      type: 'stock_alert',
      icon: '/icons/warning.png',
      tag: 'stock-alert',
      requireInteraction: true,
      data: { productName, currentStock, minimumStock },
    };

    if (this.isNotificationEnabled('stock_alert', 'in_app')) {
      this.showInAppNotification(notification);
    }

    if (this.isNotificationEnabled('stock_alert', 'push')) {
      await this.showBrowserNotification(notification);
    }
  }

  /**
   * Send order update notification
   */
  async sendOrderUpdate(
    orderNumber: string,
    status: string,
    message?: string
  ): Promise<void> {
    const notification: NotificationMessage = {
      title: 'Bestelling Update',
      body: message || `Bestelling ${orderNumber} is ${status}`,
      type: 'order_update',
      icon: '/icons/order.png',
      tag: `order-${orderNumber}`,
      data: { orderNumber, status },
    };

    if (this.isNotificationEnabled('order_update', 'in_app')) {
      this.showInAppNotification(notification);
    }

    if (this.isNotificationEnabled('order_update', 'push')) {
      await this.showBrowserNotification(notification);
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification: NotificationMessage = {
      title,
      body: message,
      type: 'system_notification',
      icon: '/icons/system.png',
      data,
    };

    if (this.isNotificationEnabled('system_notification', 'in_app')) {
      this.showInAppNotification(notification);
    }

    if (this.isNotificationEnabled('system_notification', 'push')) {
      await this.showBrowserNotification(notification);
    }
  }

  /**
   * Send reminder notification
   */
  async sendReminder(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification: NotificationMessage = {
      title,
      body: message,
      type: 'reminder',
      icon: '/icons/reminder.png',
      requireInteraction: true,
      data,
    };

    if (this.isNotificationEnabled('reminder', 'in_app')) {
      this.showInAppNotification(notification);
    }

    if (this.isNotificationEnabled('reminder', 'push')) {
      await this.showBrowserNotification(notification);
    }
  }

  /**
   * Schedule periodic stock checks
   */
  startStockMonitoring(): void {
    // Check stock levels every hour
    setInterval(async () => {
      await this.checkStockLevels();
    }, 60 * 60 * 1000);

    // Initial check
    this.checkStockLevels();
  }

  /**
   * Check stock levels and send alerts
   */
  private async checkStockLevels(): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) { return; }

    try {
      const { data: lowStockItems, error } = await supabase
        .from('product_list_items')
        .select(
          `
          *,
          products (name),
          product_lists!inner (practice_id)
        `
        )
        .eq('product_lists.practice_id', practiceId)
        .filter('current_stock', 'lt', supabase.raw('minimum_stock'));

      if (error) {
        notificationLogger.error('Failed to check stock levels:', error);
        return;
      }

      for (const item of lowStockItems || []) {
        await this.sendStockAlert(
          item.products?.name || 'Unknown Product',
          item.current_stock,
          item.minimum_stock
        );
      }
    } catch (error) {
      notificationLogger.error('Stock monitoring error:', error);
    }
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) { return ''; }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const notificationService = new NotificationService();
