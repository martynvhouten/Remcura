import type { NotificationType } from '@/types/supabase';

// Notification system types
export interface NotificationMessage {
  id?: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}
