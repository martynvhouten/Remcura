import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import type {
  ProductBatch,
  ProductBatchWithDetails,
  ProductBatchWithDetailsView,
  CreateBatchRequest,
  UpdateBatchRequest,
  ExpiringBatch,
  BatchMovement,
} from '@/types/inventory';
import { mapProductBatchRowToDetails } from '@/types/inventory';
import type { Tables } from '@/types';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import {
  calculateBatchUrgency,
  sortBatchesFIFO,
  filterBatchesByUrgency,
  validateBatchData,
  areBatchNumbersSimilar,
} from '@/utils/batch-helpers';
import { toArray } from '@/utils/array';
import { t } from '@/utils/i18n-service';
import {
  mapProductBatchRow,
  ProductBatchDTO,
  mapStockLevelRow,
} from '@/domain/inventory/bridge';
import {
  toProductBatchInsert,
  toProductBatchUpdate,
} from '@/domain/inventory/payload';

interface ProductBatchFetchRow extends Tables<'product_batches'> {
  product: { id: string; name: string | null; sku: string | null } | null;
  location: { id: string; name: string | null } | null;
  supplier: { id: string; name: string | null } | null;
}

// Type for get_fifo_batches RPC function result
interface FifoBatchResult {
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  available_quantity: number;
  use_quantity: number;
  practice_id?: string;
  product_id?: string;
  location_id?: string;
  supplier_id?: string | null;
  received_date?: string;
  current_quantity?: number;
  reserved_quantity?: number;
  unit_cost?: number | null;
  total_cost?: number | null;
  currency?: string | null;
  status?: string | null;
}

export const useBatchStore = defineStore('batch', () => {
  const batches = ref<ProductBatchDTO[]>([]);
  const expiringBatches = ref<ExpiringBatch[]>([]);
  const fifoBatches = ref<ProductBatchDTO[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const batchesByProduct = computed(
    () => (productId: string) =>
      batches.value.filter(batch => batch.productId === productId)
  );
  const batchesByLocation = computed(
    () => (locationId: string) =>
      batches.value.filter(batch => batch.locationId === locationId)
  );

  const expiredBatches = computed(() =>
    batches.value.filter(batch => new Date(batch.expiryDate) < new Date())
  );

  const expiringBatchesCount = computed(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return batches.value.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
  });

  const lowStockBatches = computed(() =>
    batches.value.filter(batch => batch.currentQuantity <= 10)
  );

  const totalValue = computed(() =>
    batches.value.reduce((total, batch) => {
      const unitCost = batch.unitCost || 0;
      return total + batch.currentQuantity * unitCost;
    }, 0)
  );

  const batchesSortedByFIFO = computed(() =>
    sortBatchesFIFO(
      batches.value.map(batch => ({
        id: batch.id,
        expiry_date: batch.expiryDate,
        current_quantity: batch.currentQuantity,
        created_at: batch.createdAt,
      })) as any
    )
  );

  const criticalBatches = computed(() =>
    filterBatchesByUrgency(
      batches.value.map(batch => ({
        id: batch.id,
        expiry_date: batch.expiryDate,
        current_quantity: batch.currentQuantity,
      })) as any,
      ['critical', 'expired']
    )
  );

  const warningBatches = computed(() =>
    filterBatchesByUrgency(
      batches.value.map(batch => ({
        id: batch.id,
        expiry_date: batch.expiryDate,
        current_quantity: batch.currentQuantity,
      })) as any,
      ['warning', 'high']
    )
  );

  const batchesWithUrgency = computed(() =>
    batches.value.map(batch => ({
      ...batch,
      urgencyInfo: calculateBatchUrgency(batch.expiryDate),
    }))
  );

  const batchesByUrgencyLevel = computed(() => {
    const grouped: Record<string, ProductBatchDTO[]> = {
      expired: [],
      critical: [],
      high: [],
      warning: [],
      low: [],
      normal: [],
    };

    batches.value.forEach(batch => {
      const urgency = calculateBatchUrgency(batch.expiryDate);
      const level = urgency.level || 'normal';
      if (grouped[level]) {
        grouped[level].push(batch);
      }
    });

    return grouped;
  });

  const fetchBatches = async (filters?: {
    practiceId?: string;
    productId?: string;
    locationId?: string;
    includeExpired?: boolean;
  }) => {
    try {
      loading.value = true;
      error.value = null;

      let query = supabase.from('product_batches').select(
        `
          *,
          product:products!inner(id, name, sku),
          location:practice_locations!inner(id, name),
          supplier:suppliers(id, name)
        `
      );

      if (filters?.practiceId) {
        query = query.eq('practice_id', filters.practiceId);
      } else {
        query = query.is('practice_id', null);
      }

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters?.locationId) {
        query = query.eq('location_id', filters.locationId);
      }

      if (!filters?.includeExpired) {
        query = query.gte('expiry_date', new Date().toISOString());
      }

      query = query
        .eq('status', 'active')
        .order('expiry_date', { ascending: true });

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      batches.value = toArray(data).map(batchRow =>
        mapProductBatchRow(batchRow as ProductBatchFetchRow, {
          product: (batchRow as ProductBatchFetchRow).product as any,
          location: (batchRow as ProductBatchFetchRow).location as any,
          supplier: (batchRow as ProductBatchFetchRow).supplier as any,
        })
      );
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'fetchBatches',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const fetchExpiringBatches = async (practiceId: string, daysAhead = 30) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase.rpc(
        'get_expiring_batches',
        {
          p_practice_id: practiceId,
          p_days_ahead: daysAhead,
        }
      );

      if (fetchError) {
        const today = new Date();
        const until = new Date();
        until.setDate(today.getDate() + daysAhead);
        const { data: fallbackData, error: fbError } = await supabase
          .from('product_batches')
          .select(
            `
            *,
            product:products!inner(id, name, sku),
            location:practice_locations!inner(id, name),
            supplier:suppliers(id, name)
          `
          )
          .eq('practice_id', practiceId)
          .lte('expiry_date', until.toISOString())
          .gte('expiry_date', today.toISOString())
          .order('expiry_date', { ascending: true });

        if (fbError) throw fbError;

        expiringBatches.value = toArray(fallbackData).map(row => {
          const mapped = mapProductBatchRow(row as ProductBatchFetchRow, {
            product: (row as ProductBatchFetchRow).product as any,
            location: (row as ProductBatchFetchRow).location as any,
            supplier: (row as ProductBatchFetchRow).supplier as any,
          });
          const diffDays = Math.ceil(
            (new Date(mapped.expiryDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );
          let urgency: ExpiringBatch['urgency_level'] = 'normal';
          if (diffDays < 0) urgency = 'expired';
          else if (diffDays <= 7) urgency = 'critical';
          else if (diffDays <= 14) urgency = 'warning';

          return {
            batch_id: mapped.id,
            product_id: mapped.productId,
            product_name: mapped.productName ?? '',
            product_sku: mapped.productSku ?? '',
            location_id: mapped.locationId,
            location_name: mapped.locationName ?? '',
            batch_number: mapped.batchNumber,
            expiry_date: mapped.expiryDate,
            current_quantity: mapped.currentQuantity,
            days_until_expiry: diffDays,
            urgency_level: urgency,
          } satisfies ExpiringBatch;
        });
        return expiringBatches.value;
      }

      expiringBatches.value = (data ?? []).map(item => ({
        batch_id: item.batch_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        location_id: item.location_id,
        location_name: item.location_name,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        current_quantity: item.current_quantity,
        days_until_expiry: item.days_until_expiry,
        urgency_level: item.urgency_level,
      }));
      return expiringBatches.value;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'fetchExpiringBatches',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const fetchFifoBatches = async (
    productId: string,
    locationId: string,
    quantity: number
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase.rpc<FifoBatchResult>(
        'get_fifo_batches',
        {
          p_product_id: productId,
          p_location_id: locationId,
          p_quantity_needed: quantity,
        }
      );

      if (fetchError) {
        const { data: rows, error: fbError } = await supabase
          .from('product_batches')
          .select(
            '*, product:products(id, name, sku), location:practice_locations(id, name), supplier:suppliers(id, name)'
          )
          .eq('product_id', productId)
          .eq('location_id', locationId)
          .eq('status', 'active')
          .gt('current_quantity', 0)
          .order('expiry_date', { ascending: true });

        if (fbError) throw fbError;

        fifoBatches.value = toArray(rows).map(row =>
          mapProductBatchRow(row as ProductBatchFetchRow, {
            product: (row as ProductBatchFetchRow).product,
            location: (row as ProductBatchFetchRow).location,
            supplier: (row as ProductBatchFetchRow).supplier,
          })
        );
        return fifoBatches.value;
      }

      fifoBatches.value = (data || []).map(entry => ({
        id: entry.batch_id,
        practiceId: entry.practice_id,
        productId: entry.product_id,
        locationId: entry.location_id,
        supplierId: entry.supplier_id ?? null,
        batchNumber: entry.batch_number,
        expiryDate: entry.expiry_date,
        receivedDate: entry.received_date ?? entry.expiry_date,
        currentQuantity: entry.available_quantity ?? entry.current_quantity,
        reservedQuantity: entry.reserved_quantity ?? 0,
        availableQuantity: entry.available_quantity ?? entry.current_quantity,
        unitCost: entry.unit_cost ?? null,
        totalCost: entry.total_cost ?? null,
        currency: entry.currency ?? null,
        status: entry.status ?? null,
      }));
      return fifoBatches.value;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'fetchFifoBatches',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const createBatch = async (request: Tables<'product_batches'>) => {
    try {
      loading.value = true;
      error.value = null;

      const payload = toProductBatchInsert(mapProductBatchRow(request));
      const { data, error: insertError } = await supabase
        .from('product_batches')
        .insert(payload)
        .select('*')
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'createBatch',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const updateBatch = async (id: string, updates: UpdateBatchRequest) => {
    try {
      loading.value = true;
      error.value = null;

      const practiceId = updates.practice_id ?? undefined;
      const mappedUpdate = toProductBatchUpdate(
        mapProductBatchRow({
          ...updates,
          id,
          practice_id: updates.practice_id ?? '',
          product_id: updates.product_id ?? '',
          location_id: updates.location_id ?? '',
          supplier_id: updates.supplier_id ?? null,
          batch_number: updates.batch_number ?? '',
          supplier_batch_number: updates.supplier_batch_number ?? null,
          expiry_date: updates.expiry_date ?? '',
          received_date: updates.received_date ?? '',
          initial_quantity: updates.current_quantity ?? 0,
          current_quantity: updates.current_quantity ?? 0,
          reserved_quantity: updates.reserved_quantity ?? null,
          available_quantity: updates.available_quantity ?? null,
          unit_cost: updates.unit_cost ?? null,
          total_cost: updates.total_cost ?? null,
          currency: updates.currency ?? null,
          status: updates.status ?? null,
          purchase_order_number: updates.purchase_order_number ?? null,
          invoice_number: updates.invoice_number ?? null,
          quality_check_passed: updates.quality_check_passed ?? null,
          quality_notes: updates.quality_notes ?? null,
          quarantine_until: updates.quarantine_until ?? null,
          created_at: null,
          updated_at: null,
          supplier_id: updates.supplier_id ?? null,
          supplier_batch_number: updates.supplier_batch_number ?? null,
        } as ProductBatch)
      );

      const { data, error: updateError } = await supabase
        .from('product_batches')
        .update(mappedUpdate)
        .eq('id', id)
        .eq(practiceId ? 'practice_id' : 'id', practiceId ? practiceId : id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      const index = batches.value.findIndex(batch => batch.id === id);
      if (index !== -1) {
        batches.value[index] = mapProductBatchRow(
          data as ProductBatchFetchRow,
          {
            product: (data as ProductBatchFetchRow).product,
            location: (data as ProductBatchFetchRow).location,
            supplier: (data as ProductBatchFetchRow).supplier,
          }
        );
      }

      return data;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'updateBatch',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const deleteBatch = async (batchId: string) => {
    try {
      loading.value = true;
      error.value = null;

      const { error: deleteError } = await supabase
        .from('product_batches')
        .delete()
        .eq('id', batchId);

      if (deleteError) throw deleteError;

      batches.value = batches.value.filter(batch => batch.id !== batchId);
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'deleteBatch',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const useBatch = async (movements: BatchMovement[]) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: rpcError } = await supabase.rpc(
        'process_batch_stock_movement',
        {
          p_movements: JSON.stringify(movements),
        }
      );

      if (rpcError) throw rpcError;

      return data;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'useBatch',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const getBatch = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('product_batches')
        .select(
          `
          *,
          product:products!inner(id, name, sku, category, brand, unit),
          location:practice_locations!inner(id, name, code, location_type),
          supplier:suppliers(id, name, code)
        `
        )
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'getBatch',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  // New enhanced actions
  const searchBatches = async (searchTerm: string, practiceId: string) => {
    try {
      loading.value = true;
      error.value = null;

      let query = supabase
        .from('product_batches')
        .select(
          `
          *,
          product:products!inner(id, name, sku, category, brand, unit),
          location:practice_locations!inner(id, name, code, location_type),
          supplier:suppliers(id, name, code)
        `
        )
        .eq('practice_id', practiceId);

      // Search in batch number, product name, or SKU
      query = query.or(
        `batch_number.ilike.%${searchTerm}%,supplier_batch_number.ilike.%${searchTerm}%,product.name.ilike.%${searchTerm}%,product.sku.ilike.%${searchTerm}%`
      );

      const { data, error: searchError } = await query
        .eq('status', 'active')
        .order('expiry_date', { ascending: true })
        .limit(50);

      if (searchError) throw searchError;

      return data || [];
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'searchBatches',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const findSimilarBatches = (
    batchNumber: string,
    productId: string
  ): ProductBatchWithDetails[] => {
    return batches.value.filter(
      batch =>
        batch.product_id === productId &&
        areBatchNumbersSimilar(batch.batch_number, batchNumber)
    );
  };

  const validateNewBatch = (batchData: Tables<'product_batches'>) => {
    const validationResult = validateBatchData({
      batchNumber: batchData.batch_number,
      expiryDate: batchData.expiry_date,
      quantity: batchData.initial_quantity,
    });

    // Check for duplicate batch numbers
    const existingBatch = batches.value.find(
      batch =>
        batch.product_id === batchData.product_id &&
        batch.batch_number.toLowerCase() ===
          batchData.batch_number.toLowerCase()
    );

    if (existingBatch) {
      validationResult.errors.push('Batchnummer bestaat al voor dit product');
      validationResult.isValid = false;
    }

    // Check for similar batch numbers
    const similarBatches = findSimilarBatches(
      batchData.batch_number,
      batchData.product_id
    );
    if (similarBatches.length > 0) {
      validationResult.warnings.push(
        `Vergelijkbare batchnummers gevonden: ${similarBatches
          .map(b => b.batch_number)
          .join(', ')}`
      );
    }

    return validationResult;
  };

  const getFifoBatchSuggestion = (
    productId: string,
    locationId: string,
    quantityNeeded: number
  ) => {
    const productBatches = batches.value.filter(
      batch =>
        batch.product_id === productId &&
        batch.location_id === locationId &&
        batch.status === 'active' &&
        batch.current_quantity > 0
    );

    const sortedBatches = sortBatchesFIFO(productBatches);
    const suggestion = [];
    let remainingQuantity = quantityNeeded;

    for (const batch of sortedBatches) {
      if (remainingQuantity <= 0) break;

      const quantityFromBatch = Math.min(
        batch.current_quantity,
        remainingQuantity
      );
      suggestion.push({
        batch,
        quantity: quantityFromBatch,
        urgencyInfo: calculateBatchUrgency(batch.expiry_date),
      });

      remainingQuantity -= quantityFromBatch;
    }

    return {
      suggestion,
      canFulfill: remainingQuantity <= 0,
      shortfall: Math.max(0, remainingQuantity),
    };
  };

  const getBatchHistory = async (batchId: string) => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error } = await supabase
        .from('stock_movements')
        .select(
          `
          id,
          movement_type,
          quantity_change,
          reason,
          created_at,
          location:practice_locations(id, name),
          product:products(id, name, sku)
        `
        )
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'BatchStore',
        operation: 'getBatchHistory',
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  return {
    batches,
    expiringBatches,
    fifoBatches,
    loading,
    error,
    batchesByProduct,
    batchesByLocation,
    expiredBatches,
    expiringBatchesCount,
    lowStockBatches,
    totalValue,
    batchesSortedByFIFO,
    criticalBatches,
    warningBatches,
    batchesWithUrgency,
    batchesByUrgencyLevel,
    fetchBatches,
    fetchExpiringBatches,
    fetchFifoBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    useBatch,
    getBatch,
    searchBatches,
    findSimilarBatches,
    validateNewBatch,
    getFifoBatchSuggestion,
    getBatchHistory,
  };
});
