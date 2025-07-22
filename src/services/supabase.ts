import { createClient } from '@supabase/supabase-js';
import type { Database } from 'src/types/supabase';
import { handleSupabaseError } from 'src/utils/service-error-handler';

// Create and configure Supabase client centrally
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Export supabase client for use in other services
import type {
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

// User profile operations
export const userProfileService = {
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
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

  async create(profile: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
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
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
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
      .select('id, name, sku, category, brand, unit, price, image_url')
      .eq('practice_id', practiceId)
      .eq('active', true)
      .order('name');

    if (error) {
      handleSupabaseError(error, {
        service: 'productService',
        operation: 'getAll',
        practiceId,
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
        practiceId: product.practice_id,
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
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return true;
  },

  async getLowStock(practiceId: string): Promise<any[]> {
    // Get products with low stock using the get_order_advice function
    const { data, error } = await supabase.rpc('get_order_advice', {
      practice_uuid: practiceId,
    });

    if (error) {
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
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

    return (data || []).filter((item: any) => item.current_stock === 0);
  },
};

// Real-time subscriptions
export const realtimeService = {
  subscribeToProducts(practiceId: string, callback: (payload: any) => void) {
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

  subscribeToUserProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // 🔄 NEW: Real-time inventory subscriptions
  subscribeToInventory(practiceId: string, callback: (payload: any) => void) {
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
  subscribeToStockMovements(practiceId: string, callback: (payload: any) => void) {
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
  subscribeToCountingSessions(practiceId: string, callback: (payload: any) => void) {
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
  unsubscribeFromChannel(channel: any) {
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

// Legacy exports for backward compatibility
export const clinicService = practiceService;
export const clinicProductService = productService;
