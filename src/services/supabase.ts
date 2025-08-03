import { createClient } from '@supabase/supabase-js';
import type { 
  Database,
  Practice,
  UserProfile,
  Product,
  ProductListItem,
  PracticeInsert,
  UserProfileInsert,
  ProductInsert,
  PracticeUpdate,
  UserProfileUpdate,
  ProductUpdate,
  ProductWithItems,
} from 'src/types/supabase';
import { handleSupabaseError } from 'src/utils/service-error-handler';

// Create and configure Supabase client centrally
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error($t('supabase.missingsupabaseenvironmentvaria'));
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
  async getById(id: string): Promise<Practice | null> {
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

  async create(practice: PracticeInsert): Promise<Practice | null> {
    const { data, error } = await supabase
      .from('practices')
      .insert([practice])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'practiceService',
        operation: 'create',
      }, 'Failed to create practice');
    }

    return data;
  },

  async update(id: string, updates: PracticeUpdate): Promise<Practice | null> {
    const { data, error } = await supabase
      .from('practices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'practiceService',
        operation: 'update',
        metadata: { practiceId: id },
      }, 'Failed to update practice');
    }

    return data;
  },
};

// User profile operations - now using auth.users and practice_members
export const userProfileService = {
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('practice_members')
      .select(`
        *,
        practices:practice_id (
          id,
          name,
          settings
        )
      `)
      .eq('user_id', id)
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'userProfileService',
        operation: 'getById',
        metadata: { userId: id },
      }, 'Failed to fetch user profile');
    }

    return data;
  },

  async getByIdWithUserData(id: string): Promise<UserProfile | null> {
    // Get practice member data with user auth data
    const { data: memberData, error: memberError } = await supabase
      .from('practice_members')
      .select(`
        *,
        practices:practice_id (
          id,
          name,
          settings
        )
      `)
      .eq('user_id', id)
      .single();

    if (memberError) {
      handleSupabaseError(memberError, {
        service: 'userProfileService',
        operation: 'getByIdWithUserData',
        metadata: { userId: id },
      }, 'Failed to fetch user profile');
      return null;
    }

    // Get user auth data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id);
    
    if (userError) {
      handleSupabaseError(userError, {
        service: 'userProfileService',
        operation: 'getByIdWithUserData',
        metadata: { userId: id },
      }, 'Failed to fetch user auth data');
      return null;
    }

    // Combine the data
    return {
      ...memberData,
      email: userData.user?.email,
      user_metadata: userData.user?.user_metadata,
    } as UserProfile;
  },

  async create(profile: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('practice_members')
      .insert([{
        user_id: profile.id,
        practice_id: profile.practice_id,
        role: profile.role || 'guest',
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'userProfileService',
        operation: 'create',
      }, 'Failed to create user profile');
    }

    return data;
  },

  async update(
    id: string,
    updates: UserProfileUpdate
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('practice_members')
      .update({
        role: updates.role,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'userProfileService',
        operation: 'update',
        metadata: { userId: id },
      }, 'Failed to update user profile');
    }

    return data;
  },
};

// Products operations
export const productService = {
  async getAll(practiceId: string): Promise<ProductListItem[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, sku, category, brand, unit, price, image_url,
        stock_levels!inner(practice_id)
      `)
      .eq('stock_levels.practice_id', practiceId)
      .eq('active', true)
      .order('name');

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'getAll',
        metadata: { practiceId },
      }, 'Failed to fetch products');
    }

    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'getById',
        metadata: { productId: id },
      }, 'Failed to fetch product');
    }

    return data;
  },

  async create(product: ProductInsert): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'create',
        metadata: { productSku: product.sku },
      }, 'Failed to create product');
    }

    return data;
  },

  async update(id: string, updates: ProductUpdate): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'update',
        metadata: { productId: id },
      }, 'Failed to update product');
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new Error($t('supabase.failedtodeleteproduct'));
    }

    return true;
  },

  async getLowStock(practiceId: string): Promise<any[]> {
    // Get products with low stock using the get_order_advice function
    const { data, error } = await supabase.rpc('get_order_advice', {
      practice_uuid: practiceId,
    });

    if (error) {
      throw new Error($t('supabase.failedtofetchlow'));
    }

    return data || [];
  },

  async getOutOfStock(practiceId: string): Promise<any[]> {
    // Get out of stock products from the order advice
    const { data, error } = await supabase.rpc('get_order_advice', {
      practice_uuid: practiceId,
    });

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'getOutOfStock',
        practiceId,
      }, 'Failed to fetch out of stock products');
    }

    return (data || []).filter((item: StockLevel) => item.current_stock === 0);
  },
};

// Real-time subscriptions
export const realtimeService = {
  subscribeToProducts(practiceId: string, callback: (payload: RealtimePayload) => void) {
    return supabase
      .channel(`products:${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_list_items',
        },
        callback
      )
      .subscribe();
  },

  subscribeToUserProfile(userId: string, callback: (payload: RealtimePayload) => void) {
    return supabase
      .channel(`user_profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'practice_members',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // 🔄 NEW: Real-time inventory subscriptions
  subscribeToInventory(practiceId: string, callback: (payload: RealtimePayload) => void) {
    return supabase
      .channel(`inventory:${practiceId}`)
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_entries',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .subscribe();
  },

  // 🔄 NEW: Real-time stock movements subscription
  subscribeToStockMovements(practiceId: string, callback: (payload: RealtimePayload) => void) {
    return supabase
      .channel(`stock_movements:${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_entries',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .subscribe();
  },

  // 🔄 NEW: Real-time counting sessions subscription
  subscribeToCountingSessions(practiceId: string, callback: (payload: RealtimePayload) => void) {
    return supabase
      .channel(`counting:${practiceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counting_sessions',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counting_entries',
          filter: `practice_id=eq.${practiceId}`,
        },
        callback
      )
      .subscribe();
  },

  // 🔄 NEW: Utility method to unsubscribe from channels
  unsubscribeFromChannel(channel: RealtimeChannel) {
    if (channel) {
      return supabase.removeChannel(channel);
    }
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
