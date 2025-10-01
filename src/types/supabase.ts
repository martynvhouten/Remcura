import type { Database } from './supabase.generated';

export type { Database } from './supabase.generated';

export type SupabaseTable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type SupabaseInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type SupabaseUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type SupabaseEnum<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
export type SupabaseComposite<
  T extends keyof Database['public']['CompositeTypes'],
> = Database['public']['CompositeTypes'][T];

export type ActivityLog = SupabaseTable<'activity_log'>;
export type CountingEntry = SupabaseTable<'counting_entries'>;
export type Order = SupabaseTable<'orders'>;
export type OrderInsert = SupabaseInsert<'orders'>;
export type OrderUpdate = SupabaseUpdate<'orders'>;
export type OrderItem = SupabaseTable<'order_items'>;
export type OrderItemInsert = SupabaseInsert<'order_items'>;
export type OrderItemUpdate = SupabaseUpdate<'order_items'>;
export type OrderList = SupabaseTable<'order_lists'>;
export type OrderListInsert = SupabaseInsert<'order_lists'>;
export type OrderListUpdate = SupabaseUpdate<'order_lists'>;
export type ShoppingCart = SupabaseTable<'shopping_carts'>;
export type ShoppingCartInsert = SupabaseInsert<'shopping_carts'>;
export type ShoppingCartUpdate = SupabaseUpdate<'shopping_carts'>;
export type ShoppingCartItem = SupabaseTable<'shopping_cart_items'>;
export type ShoppingCartItemInsert = SupabaseInsert<'shopping_cart_items'>;
export type ShoppingCartItemUpdate = SupabaseUpdate<'shopping_cart_items'>;
export type Product = SupabaseTable<'products'>;
export type ProductInsert = SupabaseInsert<'products'>;
export type ProductUpdate = SupabaseUpdate<'products'>;
export type Supplier = SupabaseTable<'suppliers'>;
export type SupplierInsert = SupabaseInsert<'suppliers'>;
export type SupplierUpdate = SupabaseUpdate<'suppliers'>;
export type PermanentUser = SupabaseTable<'permanent_users'>;
export type PermanentUserInsert = SupabaseInsert<'permanent_users'>;
export type PermanentUserUpdate = SupabaseUpdate<'permanent_users'>;
export type UsageAnalytics = SupabaseTable<'usage_analytics'>;
export type MagicInvite = SupabaseTable<'magic_invites'>;
export type MagicInviteInsert = SupabaseInsert<'magic_invites'>;
export type MagicInviteUpdate = SupabaseUpdate<'magic_invites'>;
export type GuestSession = SupabaseTable<'guest_sessions'>;
export type NotificationSettings = SupabaseTable<'notification_settings'>;
export type NotificationSettingsInsert =
  SupabaseInsert<'notification_settings'>;
export type NotificationSettingsUpdate =
  SupabaseUpdate<'notification_settings'>;
export type Notification = SupabaseTable<'notifications'>;
export type NotificationInsert = SupabaseInsert<'notifications'>;
export type NotificationUpdate = SupabaseUpdate<'notifications'>;
export type NotificationChannel =
  Database['public']['Tables']['notification_settings']['Row']['channel'];
export type NotificationType =
  Database['public']['Tables']['notification_settings']['Row']['notification_type'];

export type OrderItemWithProduct = OrderItem & { products: Product | null };
export type OrderWithItems = Order & {
  order_items: OrderItemWithProduct[] | null;
  suppliers: Supplier | null;
};

export type ShoppingCartWithItems = ShoppingCart & {
  shopping_cart_items: Array<
    ShoppingCartItem & { products: Product | null }
  > | null;
};

export type PermanentUserWithPractice = PermanentUser & {
  practices: SupabaseTable<'practices'> | null;
};

// Additional type exports for admin service
export type Location = SupabaseTable<'practice_locations'>;
export type LocationInsert = SupabaseInsert<'practice_locations'>;
export type LocationUpdate = SupabaseUpdate<'practice_locations'>;
export type UserPermission = SupabaseTable<'user_permissions'>;
export type UserPermissionInsert = SupabaseInsert<'user_permissions'>;
export type UserPermissionUpdate = SupabaseUpdate<'user_permissions'>;
