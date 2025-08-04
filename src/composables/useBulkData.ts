import { ref, Ref } from 'vue'
import { supabase } from '@/boot/supabase'

/**
 * Bulk data loading composable to prevent N+1 query patterns
 * Efficiently loads related data in batches instead of individual queries
 */
export function useBulkData() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Bulk load stock levels for multiple products
   * Prevents N+1 queries when showing product lists with stock info
   */
  const loadStockLevelsForProducts = async (
    productIds: string[],
    practiceId: string
  ): Promise<Record<string, any[]>> => {
    if (!productIds.length) return {}

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('stock_levels')
        .select(`
          product_id,
          current_quantity,
          minimum_quantity,
          location_id,
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId)
        .in('product_id', productIds)

      if (queryError) throw queryError

      // Group by product_id for easy lookup
      const stockByProduct: Record<string, any[]> = {}
      data?.forEach(stock => {
        if (!stockByProduct[stock.product_id]) {
          stockByProduct[stock.product_id] = []
        }
        stockByProduct[stock.product_id].push(stock)
      })

      return stockByProduct
    } catch (err) {
      error.value = err as Error
      console.error('Bulk stock loading failed:', err)
      return {}
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk load supplier products for multiple products
   * Prevents N+1 queries when showing product-supplier relationships
   */
  const loadSupplierProductsForProducts = async (
    productIds: string[],
    practiceId: string
  ): Promise<Record<string, any[]>> => {
    if (!productIds.length) return {}

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('supplier_products')
        .select(`
          product_id,
          supplier_id,
          supplier_sku,
          unit_price,
          minimum_order_quantity,
          lead_time_days,
          is_preferred,
          suppliers!inner(name, contact_email)
        `)
        .eq('practice_id', practiceId)
        .in('product_id', productIds)
        .eq('is_active', true)

      if (queryError) throw queryError

      // Group by product_id for easy lookup
      const suppliersByProduct: Record<string, any[]> = {}
      data?.forEach(sp => {
        if (!suppliersByProduct[sp.product_id]) {
          suppliersByProduct[sp.product_id] = []
        }
        suppliersByProduct[sp.product_id].push(sp)
      })

      return suppliersByProduct
    } catch (err) {
      error.value = err as Error
      console.error('Bulk supplier products loading failed:', err)
      return {}
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk load batch information for multiple products
   * Prevents N+1 queries when showing expiry dates and batch info
   */
  const loadBatchesForProducts = async (
    productIds: string[],
    practiceId: string
  ): Promise<Record<string, any[]>> => {
    if (!productIds.length) return {}

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('product_batches')
        .select(`
          product_id,
          batch_number,
          expiry_date,
          quantity_remaining,
          location_id,
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId)
        .in('product_id', productIds)
        .gt('quantity_remaining', 0)
        .order('expiry_date', { ascending: true })

      if (queryError) throw queryError

      // Group by product_id for easy lookup
      const batchesByProduct: Record<string, any[]> = {}
      data?.forEach(batch => {
        if (!batchesByProduct[batch.product_id]) {
          batchesByProduct[batch.product_id] = []
        }
        batchesByProduct[batch.product_id].push(batch)
      })

      return batchesByProduct
    } catch (err) {
      error.value = err as Error
      console.error('Bulk batch loading failed:', err)
      return {}
    } finally {
      loading.value = false
    }
  }

  /**
   * Generic bulk loader for any related data
   * Useful for custom relationships
   */
  const loadRelatedData = async <T = any>(
    table: string,
    foreignKey: string,
    entityIds: string[],
    selectFields: string = '*',
    additionalFilters: Record<string, any> = {}
  ): Promise<Record<string, T[]>> => {
    if (!entityIds.length) return {}

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from(table)
        .select(selectFields)
        .in(foreignKey, entityIds)

      // Apply additional filters
      Object.entries(additionalFilters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      // Group by foreign key for easy lookup
      const groupedData: Record<string, T[]> = {}
      data?.forEach((item: any) => {
        const key = item[foreignKey]
        if (!groupedData[key]) {
          groupedData[key] = []
        }
        groupedData[key].push(item)
      })

      return groupedData
    } catch (err) {
      error.value = err as Error
      console.error(`Bulk loading failed for ${table}:`, err)
      return {}
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    loadStockLevelsForProducts,
    loadSupplierProductsForProducts,
    loadBatchesForProducts,
    loadRelatedData
  }
}