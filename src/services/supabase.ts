import { createClient } from '@supabase/supabase-js';
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types';
import type {
  StockLevelView,
  PracticeRow,
  ProductRow,
  OrderAdviceResult,
  PracticeInsert,
  PracticeUpdate,
  PracticeMemberRow,
  PracticeMemberInsert,
  PracticeMemberUpdate,
  OrderListRow,
  ProductBatchWithDetails,
  OrderListItemInsert,
} from '@/types/inventory';
import { handleSupabaseError } from '@/utils/service-error-handler';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

// Create and configure Supabase client centrally
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Practice operations
export const practiceService = {
  async getById(id: string): Promise<PracticeRow | null> {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'practiceService',
        operation: 'getById',
        metadata: { practiceId: id },
      });
    }

    return data;
  },

  async create(practice: PracticeInsert): Promise<PracticeRow | null> {
    const { data, error } = await supabase
      .from('practices')
      .insert(practice)
      .select()
      .single<PracticeRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'practiceService',
          operation: 'create',
        },
        'Failed to create practice'
      );
    }

    return data;
  },

  async update(
    id: string,
    updates: PracticeUpdate
  ): Promise<PracticeRow | null> {
    const { data, error } = await supabase
      .from('practices')
      .update(updates)
      .eq('id', id)
      .select()
      .single<PracticeRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'practiceService',
          operation: 'update',
          metadata: { practiceId: id },
        },
        'Failed to update practice'
      );
    }

    return data;
  },
};

// User profile operations - now using auth.users and practice_members
export const userProfileService = {
  async getById(id: string): Promise<PracticeMemberRow | null> {
    const { data, error } = await supabase
      .from('practice_members')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'userProfileService',
          operation: 'getById',
          metadata: { userId: id },
        },
        'Failed to fetch user profile'
      );
    }

    return data;
  },

  async getByIdWithUserData(
    id: string
  ): Promise<
    PracticeMemberRow & {
      email?: string | null;
      user_metadata?: Record<string, unknown> | null;
    }
  > {
    const { data: memberData, error: memberError } = await supabase
      .from('practice_members')
      .select('*')
      .eq('user_id', id)
      .single();

    if (memberError) {
      handleSupabaseError(
        memberError,
        {
          service: 'userProfileService',
          operation: 'getByIdWithUserData',
          metadata: { userId: id },
        },
        'Failed to fetch user profile'
      );
      throw memberError;
    }

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(id);

    if (userError) {
      handleSupabaseError(
        userError,
        {
          service: 'userProfileService',
          operation: 'getByIdWithUserData',
          metadata: { userId: id },
        },
        'Failed to fetch user auth data'
      );
      throw userError;
    }

    return {
      ...memberData,
      email: userData.user?.email ?? null,
      user_metadata: userData.user?.user_metadata ?? null,
    };
  },

  async create(
    profile: PracticeMemberInsert & { id: string }
  ): Promise<PracticeMemberRow | null> {
    const { data, error } = await supabase
      .from('practice_members')
      .insert({
        user_id: profile.id,
        practice_id: profile.practice_id,
        role: profile.role ?? 'guest',
        joined_at: new Date().toISOString(),
      } satisfies TablesInsert<'practice_members'>)
      .select()
      .single<PracticeMemberRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'userProfileService',
          operation: 'create',
        },
        'Failed to create user profile'
      );
    }

    return data;
  },

  async update(
    id: string,
    updates: PracticeMemberUpdate
  ): Promise<PracticeMemberRow | null> {
    const payload: TablesUpdate<'practice_members'> = {
      role: updates.role ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('practice_members')
      .update(payload)
      .eq('user_id', id)
      .select()
      .single<PracticeMemberRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'userProfileService',
          operation: 'update',
          metadata: { userId: id },
        },
        'Failed to update user profile'
      );
    }

    return data;
  },
};

// Products operations
export const productService = {
  async getAll(
    practiceId: string
  ): Promise<
    Array<
      Pick<
        ProductRow,
        | 'id'
        | 'name'
        | 'sku'
        | 'category'
        | 'brand'
        | 'unit'
        | 'price'
        | 'image_url'
      >
    >
  > {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        id, name, sku, category, brand, unit, price, image_url,
        stock_levels!inner(practice_id)
      `
      )
      .eq('stock_levels.practice_id', practiceId)
      .eq('active', true)
      .order('name');

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'productService',
          operation: 'getAll',
          metadata: { practiceId },
        },
        'Failed to fetch products'
      );
    }

    return (data ?? []) as Array<
      Pick<
        ProductRow,
        | 'id'
        | 'name'
        | 'sku'
        | 'category'
        | 'brand'
        | 'unit'
        | 'price'
        | 'image_url'
      >
    >;
  },

  async getById(id: string): Promise<ProductRow | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single<ProductRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'productService',
          operation: 'getById',
          metadata: { productId: id },
        },
        'Failed to fetch product'
      );
    }

    return data;
  },

  async create(product: TablesInsert<'products'>): Promise<ProductRow | null> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single<ProductRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'productService',
          operation: 'create',
          metadata: { productSku: product.sku ?? 'unknown' },
        },
        'Failed to create product'
      );
    }

    return data;
  },

  async update(
    id: string,
    updates: TablesUpdate<'products'>
  ): Promise<ProductRow | null> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single<ProductRow>();

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'productService',
          operation: 'update',
          metadata: { productId: id },
        },
        'Failed to update product'
      );
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'delete',
        metadata: { productId: id },
      });
      return false;
    }

    return true;
  },

  async getLowStock(practiceId: string): Promise<OrderAdviceResult> {
    const { data, error } = await supabase.rpc('get_order_advice', {
      practice_uuid: practiceId,
    });

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'getLowStock',
        metadata: { practiceId },
      });
      return [];
    }

    return (data as OrderAdviceResult) ?? [];
  },

  async getOutOfStock(practiceId: string): Promise<OrderAdviceResult> {
    const { data, error } = await supabase.rpc('get_order_advice', {
      practice_uuid: practiceId,
    });

    if (error) {
      handleSupabaseError(
        error,
        {
          service: 'productService',
          operation: 'getOutOfStock',
          metadata: { practiceId },
        },
        'Failed to fetch out of stock products'
      );
      return [];
    }

    const rows = (data as OrderAdviceResult) ?? [];
    return rows.filter(item => (item.current_stock ?? 0) === 0);
  },
};

// Real-time subscriptions
type OrderListPayload = RealtimePostgresChangesPayload<Tables<'order_lists'>>;
type OrderListItemPayload = RealtimePostgresChangesPayload<
  Tables<'order_list_items'>
>;
type StockLevelPayload = RealtimePostgresChangesPayload<Tables<'stock_levels'>>;
type SupplierOrderPayload = RealtimePostgresChangesPayload<
  Tables<'supplier_orders'>
>;

export const realtimeService = {
  subscribeToOrderLists(
    practiceId: string,
    callback: (payload: OrderListPayload) => void
  ): RealtimeChannel {
    return supabase
      .channel(`order_lists:${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_lists',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToOrderListItems(
    callback: (payload: OrderListItemPayload) => void
  ): RealtimeChannel {
    return supabase
      .channel('order_list_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_list_items',
        },
        callback
      )
      .subscribe();
  },

  subscribeToStockLevels(
    practiceId: string,
    callback: (payload: StockLevelPayload) => void
  ): RealtimeChannel {
    return supabase
      .channel(`stock_levels:${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_levels',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToSupplierOrders(
    callback: (payload: SupplierOrderPayload) => void
  ): RealtimeChannel {
    return supabase
      .channel('supplier_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_orders',
        },
        callback
      )
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel | null) {
    if (!channel) {
      return Promise.resolve();
    }
    return supabase.removeChannel(channel);
  },
};

// Utility functions
export const utils = {
  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  },

  generateId(): string {
    return crypto.randomUUID();
  },
};
