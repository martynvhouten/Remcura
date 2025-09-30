// Notification system types
export interface NotificationMessage {
  id?: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
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
