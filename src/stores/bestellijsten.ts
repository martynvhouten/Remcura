import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from './auth'
import { useStockStatus } from 'src/composables/useStockStatus'
import type { 
  Bestellijst, 
  BestellijstWithItems, 
  BestellijstItem,
  BestellijstInsert,
  BestellijstUpdate,
  BestellijstItemInsert,
  BestellijstItemUpdate,
  Product,
  ShoppingCart,
  ShoppingCartWithItems,
  ShoppingCartItem,
  ShoppingCartInsert,
  ShoppingCartItemInsert
} from 'src/types/supabase'

export const useBestellijstenStore = defineStore('bestellijsten', () => {
  // State
  const bestellijsten = ref<BestellijstWithItems[]>([])
  const currentBestellijst = ref<BestellijstWithItems | null>(null)
  const shoppingCarts = ref<ShoppingCartWithItems[]>([])
  const currentShoppingCart = ref<ShoppingCartWithItems | null>(null)
  const loading = ref(false)
  const scanMode = ref(false)

  // Use stock status composable
  const { getStockStatus, getReorderSuggestion, filterByStockStatus } = useStockStatus()

  // Enhanced getters using the composable
  const lowStockItems = computed(() => {
    if (!currentBestellijst.value?.product_list_items) return []
    return currentBestellijst.value.product_list_items.filter(item => {
      const status = getStockStatus(item.current_stock, item.minimum_stock, item.maximum_stock)
      return status === 'low-stock'
    })
  })

  const outOfStockItems = computed(() => {
    if (!currentBestellijst.value?.product_list_items) return []
    return currentBestellijst.value.product_list_items.filter(item => {
      const status = getStockStatus(item.current_stock, item.minimum_stock, item.maximum_stock)
      return status === 'out-of-stock'
    })
  })

  const itemsWithSuggestions = computed(() => {
    if (!currentBestellijst.value?.product_list_items) return []
    return currentBestellijst.value.product_list_items.filter(item => {
      const suggestion = getReorderSuggestion(item.current_stock, item.minimum_stock, item.maximum_stock)
      return suggestion > 0
    })
  })

  // Helper functions (keeping legacy versions for backwards compatibility)
  const getReorderSuggestionLegacy = (item: BestellijstItem): number | null => {
    const suggestion = getReorderSuggestion(item.current_stock, item.minimum_stock, item.maximum_stock)
    return suggestion > 0 ? suggestion : null
  }

  const getStockStatusLegacy = (item: BestellijstItem): 'ok' | 'low' | 'out' => {
    const status = getStockStatus(item.current_stock, item.minimum_stock, item.maximum_stock)
    const legacyMap = {
      'out-of-stock': 'out' as const,
      'low-stock': 'low' as const,
      'in-stock': 'ok' as const,
      'high-stock': 'ok' as const
    }
    return legacyMap[status]
  }

  // Actions
  const fetchBestellijsten = async () => {
    const authStore = useAuthStore()
    const practiceId = authStore.clinicId
    
    if (!practiceId) {
      console.warn('No practice ID available')
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('product_lists')
        .select(`
          *,
          product_list_items(
            *,
            products(*)
          )
        `)
        .eq('practice_id', practiceId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      bestellijsten.value = (data || []) as BestellijstWithItems[]
    } catch (error) {
      console.error('Error fetching bestellijsten:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchBestellijst = async (id: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('product_lists')
        .select(`
          *,
          product_list_items(
            *,
            products(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      currentBestellijst.value = data as BestellijstWithItems
      return data
    } catch (error) {
      console.error('Error fetching bestellijst:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createBestellijst = async (bestellijst: BestellijstInsert) => {
    try {
      const { data, error } = await supabase
        .from('product_lists')
        .insert([bestellijst])
        .select()
        .single()

      if (error) throw error

      if (data) {
        const newBestellijst = data as BestellijstWithItems
        bestellijsten.value.unshift(newBestellijst)
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create bestellijst'
      }
    }
  }

  const updateBestellijst = async (id: string, updates: BestellijstUpdate) => {
    try {
      const { data, error } = await supabase
        .from('product_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        const index = bestellijsten.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bestellijsten.value[index] = { ...bestellijsten.value[index], ...data }
        }
        
        if (currentBestellijst.value?.id === id) {
          currentBestellijst.value = { ...currentBestellijst.value, ...data }
        }
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to update bestellijst'
      }
    }
  }

  const deleteBestellijst = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_lists')
        .delete()
        .eq('id', id)

      if (error) throw error

      bestellijsten.value = bestellijsten.value.filter(b => b.id !== id)

      if (currentBestellijst.value?.id === id) {
        currentBestellijst.value = null
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to delete bestellijst'
      }
    }
  }

  // Bestellijst Items Management
  const addProductToBestellijst = async (bestellijstId: string, productId: string, initialData?: Partial<BestellijstItemInsert>) => {
    try {
      const itemData: BestellijstItemInsert = {
        product_list_id: bestellijstId,
        product_id: productId,
        current_stock: 0,
        minimum_stock: 10,
        maximum_stock: 100,
        ...initialData
      }

      const { data, error } = await supabase
        .from('product_list_items')
        .insert([itemData])
        .select(`
          *,
          products(*)
        `)
        .single()

      if (error) throw error

      // Update current bestellijst if it's the one being modified
      if (currentBestellijst.value?.id === bestellijstId) {
        if (!currentBestellijst.value.product_list_items) {
          currentBestellijst.value.product_list_items = []
        }
        currentBestellijst.value.product_list_items.push(data)
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to add product to bestellijst'
      }
    }
  }

  const updateBestellijstItem = async (itemId: string, updates: BestellijstItemUpdate) => {
    try {
      const { data, error } = await supabase
        .from('product_list_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select(`
          *,
          products(*)
        `)
        .single()

      if (error) throw error

      // Update current bestellijst if the item belongs to it
      if (currentBestellijst.value?.product_list_items) {
        const index = currentBestellijst.value.product_list_items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          currentBestellijst.value.product_list_items[index] = data
        }
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to update bestellijst item'
      }
    }
  }

  const updateStockCount = async (itemId: string, newStock: number, countedBy: 'manual' | 'scan' = 'manual') => {
    try {
      const updates: BestellijstItemUpdate = {
        current_stock: newStock,
        last_counted: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return await updateBestellijstItem(itemId, updates)
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to update stock count'
      }
    }
  }

  const removeFromBestellijst = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('product_list_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Update current bestellijst if the item belongs to it
      if (currentBestellijst.value?.product_list_items) {
        currentBestellijst.value.product_list_items = 
          currentBestellijst.value.product_list_items.filter(item => item.id !== itemId)
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to remove item from bestellijst'
      }
    }
  }

  // Shopping Cart Management
  const fetchShoppingCarts = async () => {
    const authStore = useAuthStore()
    const practiceId = authStore.clinicId
    
    if (!practiceId) return

    try {
      const { data, error } = await supabase
        .from('shopping_carts')
        .select(`
          *,
          shopping_cart_items(
            *,
            products(*)
          )
        `)
        .eq('practice_id', practiceId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      shoppingCarts.value = (data || []) as ShoppingCartWithItems[]
    } catch (error) {
      console.error('Error fetching shopping carts:', error)
      throw error
    }
  }

  const createShoppingCart = async (name?: string) => {
    const authStore = useAuthStore()
    const practiceId = authStore.clinicId
    
    if (!practiceId) {
      throw new Error('No practice ID available')
    }

    try {
      const cartData: ShoppingCartInsert = {
        practice_id: practiceId,
        name: name || 'Nieuwe bestelling',
        status: 'draft',
        created_by: authStore.user?.id || null
      }

      const { data, error } = await supabase
        .from('shopping_carts')
        .insert([cartData])
        .select()
        .single()

      if (error) throw error

      const newCart = data as ShoppingCartWithItems
      newCart.shopping_cart_items = []
      shoppingCarts.value.unshift(newCart)
      currentShoppingCart.value = newCart

      return { success: true, data: newCart }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create shopping cart'
      }
    }
  }

  const addToShoppingCart = async (cartId: string, productId: string, quantity: number = 1, suggestedBy: 'manual' | 'automatic' | 'scan' = 'manual') => {
    try {
      // Check if product is already in cart
      const existingItem = currentShoppingCart.value?.shopping_cart_items?.find(item => 
        item.product_id === productId
      )

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity
        return await updateCartItemQuantity(existingItem.id, newQuantity)
      } else {
        // Add new item
        const itemData: ShoppingCartItemInsert = {
          cart_id: cartId,
          product_id: productId,
          quantity,
          suggested_by: suggestedBy
        }

        const { data, error } = await supabase
          .from('shopping_cart_items')
          .insert([itemData])
          .select(`
            *,
            products(*)
          `)
          .single()

        if (error) throw error

        // Update current cart
        if (currentShoppingCart.value?.id === cartId) {
          if (!currentShoppingCart.value.shopping_cart_items) {
            currentShoppingCart.value.shopping_cart_items = []
          }
          currentShoppingCart.value.shopping_cart_items.push(data)
        }

        return { success: true, data }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to add item to shopping cart'
      }
    }
  }

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('shopping_cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select(`
          *,
          products(*)
        `)
        .single()

      if (error) throw error

      // Update current cart
      if (currentShoppingCart.value?.shopping_cart_items) {
        const index = currentShoppingCart.value.shopping_cart_items.findIndex(item => item.id === itemId)
        if (index !== -1) {
          currentShoppingCart.value.shopping_cart_items[index] = data
        }
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to update cart item quantity'
      }
    }
  }

  const removeFromShoppingCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Update current cart
      if (currentShoppingCart.value?.shopping_cart_items) {
        currentShoppingCart.value.shopping_cart_items = 
          currentShoppingCart.value.shopping_cart_items.filter(item => item.id !== itemId)
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to remove item from shopping cart'
      }
    }
  }

  const addAllSuggestionsToCart = async (cartId: string) => {
    if (!currentBestellijst.value?.product_list_items) return { success: false, error: 'No bestellijst loaded' }

    const itemsToAdd = itemsWithSuggestions.value
    const results = []

    for (const item of itemsToAdd) {
      const suggestion = getReorderSuggestion(item.current_stock, item.minimum_stock, item.maximum_stock)
      if (suggestion > 0) {
        const result = await addToShoppingCart(cartId, item.product_id, suggestion, 'automatic')
        results.push(result)
      }
    }

    const successful = results.filter(r => r.success).length
    return { 
      success: successful > 0, 
      data: { added: successful, total: itemsToAdd.length } 
    }
  }

  // Search products (for adding to bestellijst)
  const searchProducts = async (query: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .eq('active', true)
        .limit(limit)

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  const toggleScanMode = () => {
    scanMode.value = !scanMode.value
  }

  const processBarcodeScan = async (barcode: string) => {
    if (!currentBestellijst.value) return { success: false, error: 'No bestellijst selected' }

    try {
      // Find product by SKU (assuming barcode matches SKU)
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', barcode)
        .eq('active', true)
        .limit(1)

      if (error) throw error

      if (!products || products.length === 0) {
        return { success: false, error: 'Product not found' }
      }

      const product = products[0]
      
      if (!product) {
        return { success: false, error: 'Product not found' }
      }
      
      // Check if product is already in the bestellijst
      const existingItem = currentBestellijst.value.product_list_items?.find(item => 
        item.product_id === product.id
      )

      if (existingItem) {
        // Auto-increment stock count by 1 for scanning
        const newStock = existingItem.current_stock + 1
        return await updateStockCount(existingItem.id, newStock, 'scan')
      } else {
        // Add product to bestellijst with stock count of 1
        return await addProductToBestellijst(currentBestellijst.value.id, product.id, {
          current_stock: 1,
          minimum_stock: 10,
          maximum_stock: 100
        })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to process barcode scan'
      }
    }
  }

  return {
    // State
    bestellijsten,
    currentBestellijst,
    shoppingCarts,
    currentShoppingCart,
    loading,
    scanMode,

    // Getters
    lowStockItems,
    outOfStockItems,
    itemsWithSuggestions,

    // Helper functions (legacy compatibility)
    getReorderSuggestion: getReorderSuggestionLegacy,
    getStockStatus: getStockStatusLegacy,

    // Actions
    fetchBestellijsten,
    fetchBestellijst,
    createBestellijst,
    updateBestellijst,
    deleteBestellijst,
    addProductToBestellijst,
    updateBestellijstItem,
    updateStockCount,
    removeFromBestellijst,
    fetchShoppingCarts,
    createShoppingCart,
    addToShoppingCart,
    updateCartItemQuantity,
    removeFromShoppingCart,
    addAllSuggestionsToCart,
    searchProducts,
    toggleScanMode,
    processBarcodeScan
  }
}) 