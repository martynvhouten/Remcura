import { ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { logger } from '@/utils/logger';

interface StockLevelRecord {
  product_id: string;
  current_quantity: number;
  minimum_quantity: number;
  location_id: string;
  practice_locations: {
    name: string;
  };
}

interface SupplierProductRecord {
  product_id: string;
  supplier_id: string;
  supplier_sku: string;
  unit_price: number;
  minimum_order_quantity: number | null;
  lead_time_days: number | null;
  is_preferred: boolean;
  suppliers: {
    name: string;
    contact_email: string | null;
  };
}

interface ProductBatchRecord {
  product_id: string;
  batch_number: string;
  expiry_date: string;
  quantity_remaining: number;
  location_id: string;
  practice_locations: {
    name: string;
  };
}

interface RelatedDataFilters {
  [key: string]: string | number | boolean | null;
}

export function useBulkData() {
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const loadStockLevelsForProducts = async (
    productIds: string[],
    practiceId: string
  ): Promise<Record<string, StockLevelRecord[]>> => {
    if (!productIds.length) return {};

    loading.value = true;
    error.value = null;

    try {
      const { data, error: queryError } = await supabase
        .from('stock_levels')
        .select(
          `
          product_id,
          current_quantity,
          minimum_quantity,
          location_id,
          practice_locations!inner(name)
        `
        )
        .eq('practice_id', practiceId)
        .in('product_id', productIds);

      if (queryError) throw queryError;

      const stockByProduct: Record<string, StockLevelRecord[]> = {};
      (data as StockLevelRecord[] | null)?.forEach(stock => {
        if (!stockByProduct[stock.product_id]) {
          stockByProduct[stock.product_id] = [];
        }
        stockByProduct[stock.product_id]?.push(stock);
      });

      return stockByProduct;
    } catch (err) {
      error.value = err as Error;
      logger.error(
        'Bulk stock loading failed',
        'BULK_DATA',
        err instanceof Error ? err : undefined
      );
      return {};
    } finally {
      loading.value = false;
    }
  };

  const loadSupplierProductsForProducts = async (
    productIds: string[],
    _practiceId: string
  ): Promise<Record<string, SupplierProductRecord[]>> => {
    if (!productIds.length) return {};

    loading.value = true;
    error.value = null;

    try {
      const { data, error: queryError } = await supabase
        .from('supplier_products')
        .select(
          `
          id,
          product_id,
          supplier_id,
          supplier_sku,
          cost_price,
          list_price,
          minimum_order_quantity,
          lead_time_days,
          is_preferred,
          suppliers!inner(name, contact_email)
        `
        )
        .in('product_id', productIds)
        .eq('is_available', true);

      if (queryError) throw queryError;

      const suppliersByProduct: Record<string, SupplierProductRecord[]> = {};
      (data as unknown as SupplierProductRecord[] | null)?.forEach(sp => {
        if (!suppliersByProduct[sp.product_id]) {
          suppliersByProduct[sp.product_id] = [];
        }
        suppliersByProduct[sp.product_id]?.push(sp);
      });

      return suppliersByProduct;
    } catch (err) {
      error.value = err as Error;
      logger.error(
        'Bulk supplier products loading failed',
        'BULK_DATA',
        err instanceof Error ? err : undefined
      );
      return {};
    } finally {
      loading.value = false;
    }
  };

  const loadBatchesForProducts = async (
    productIds: string[],
    practiceId: string
  ): Promise<Record<string, ProductBatchRecord[]>> => {
    if (!productIds.length) return {};

    loading.value = true;
    error.value = null;

    try {
      const { data, error: queryError } = await supabase
        .from('product_batches')
        .select(
          `
          id,
          product_id,
          batch_number,
          expiry_date,
          current_quantity,
          available_quantity,
          location_id,
          practice_locations!inner(name)
        `
        )
        .eq('practice_id', practiceId)
        .in('product_id', productIds)
        .gt('current_quantity', 0)
        .order('expiry_date', { ascending: true });

      if (queryError) throw queryError;

      const batchesByProduct: Record<string, ProductBatchRecord[]> = {};
      (data as unknown as ProductBatchRecord[] | null)?.forEach(batch => {
        if (!batchesByProduct[batch.product_id]) {
          batchesByProduct[batch.product_id] = [];
        }
        batchesByProduct[batch.product_id]?.push(batch);
      });

      return batchesByProduct;
    } catch (err) {
      error.value = err as Error;
      logger.error(
        'Bulk batch loading failed',
        'BULK_DATA',
        err instanceof Error ? err : undefined
      );
      return {};
    } finally {
      loading.value = false;
    }
  };

  const loadRelatedData = async <T extends Record<string, unknown>>(
    table: string,
    foreignKey: string,
    entityIds: string[],
    selectFields = '*',
    additionalFilters: RelatedDataFilters = {}
  ): Promise<Record<string, T[]>> => {
    if (!entityIds.length) return {};

    loading.value = true;
    error.value = null;

    try {
      let query = (supabase as any)
        .from(table)
        .select(selectFields as any)
        .in(foreignKey as any, entityIds);

      Object.entries(additionalFilters).forEach(([key, value]) => {
        query = query.eq(key as any, value as any);
      });

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const groupedData: Record<string, T[]> = {};
      (data as unknown as T[] | null)?.forEach(item => {
        const key = String(item[foreignKey]);
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(item);
      });

      return groupedData;
    } catch (err) {
      error.value = err as Error;
      logger.error(
        `Bulk loading failed for ${table}`,
        'BULK_DATA',
        err instanceof Error ? err : undefined
      );
      return {};
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    loadStockLevelsForProducts,
    loadSupplierProductsForProducts,
    loadBatchesForProducts,
    loadRelatedData,
  };
}
