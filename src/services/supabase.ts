import { supabase } from 'src/boot/supabase'
import { monitoringService } from './monitoring'

// Export supabase client for use in other services
export { supabase }
import { apiLogger } from 'src/utils/logger'
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
  ProductWithItems
} from 'src/types/supabase'

// Practice operations
export const practiceService = {
  async getById(id: string): Promise<Practice | null> {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      const enhancedError = new Error(`Failed to fetch practice: ${error.message}`)
      apiLogger.error('Failed to fetch practice', enhancedError)
      monitoringService.captureError(enhancedError, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
      throw enhancedError
    }

    return data
  },

  async create(practice: PracticeInsert): Promise<Practice | null> {
    const { data, error } = await supabase
      .from('practices')
      .insert([practice])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create practice: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: PracticeUpdate): Promise<Practice | null> {
    const { data, error } = await supabase
      .from('practices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update practice: ${error.message}`)
    }

    return data
  }
}

// User profile operations
export const userProfileService = {
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`)
    }

    return data
  },

  async create(profile: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }
}

// Products operations
export const productService = {
  async getByPracticeId(practiceId: string): Promise<ProductWithItems[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_list_items!inner(
          id,
          product_list_id,
          minimum_stock,
          maximum_stock,
          current_stock,
          reorder_point,
          preferred_supplier,
          notes,
          product_lists!inner(
            practice_id,
            name
          )
        )
      `)
      .eq('product_list_items.product_lists.practice_id', practiceId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return (data || []) as ProductWithItems[]
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return data
  },

  async create(product: ProductInsert): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: ProductUpdate): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`)
    }

    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`)
    }

    return true
  },

  async getLowStock(practiceId: string): Promise<any[]> {
    // Get products with low stock using the get_order_advice function
    const { data, error } = await supabase
      .rpc('get_order_advice', { practice_uuid: practiceId })

    if (error) {
      throw new Error(`Failed to fetch low stock products: ${error.message}`)
    }

    return data || []
  },

  async getOutOfStock(practiceId: string): Promise<any[]> {
    // Get out of stock products from the order advice
    const { data, error } = await supabase
      .rpc('get_order_advice', { practice_uuid: practiceId })

    if (error) {
      throw new Error(`Failed to fetch out of stock products: ${error.message}`)
    }

    return (data || []).filter((item: any) => item.current_stock === 0)
  }
}

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
          table: 'products'
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_list_items'
        },
        callback
      )
      .subscribe()
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
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// Utility functions
export const utils = {
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString()
  },

  generateId(): string {
    return crypto.randomUUID()
  }
}

// Legacy exports for backward compatibility
export const clinicService = practiceService
export const clinicProductService = productService 