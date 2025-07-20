import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import type {
  ProductBatchWithDetails,
  ExpiringBatch,
  FifoBatch,
  CreateBatchRequest,
  UpdateBatchRequest,
  BatchStockMovementRequest,
  StockAlert,
  ExpiryUrgencyLevel,
} from 'src/types/inventory';

export const useBatchStore = defineStore('batches', () => {
  // State
  const batches = ref<ProductBatchWithDetails[]>([]);
  const expiringBatches = ref<ExpiringBatch[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Auth store
  const authStore = useAuthStore();

  // Getters
  const activeBatches = computed(() => {
    return batches.value.filter(
      (batch) => batch.status === 'active' && batch.current_quantity > 0
    );
  });

  const expiredBatches = computed(() => {
    return batches.value.filter((batch) => {
      const expiryDate = new Date(batch.expiry_date);
      const today = new Date();
      return expiryDate <= today && batch.current_quantity > 0;
    });
  });

  const criticallyExpiringBatches = computed(() => {
    return expiringBatches.value.filter(
      (batch) =>
        batch.urgency_level === 'critical' || batch.urgency_level === 'expired'
    );
  });

  const batchesByProduct = computed(() => {
    return batches.value.reduce((acc, batch) => {
      const productId = batch.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          batches: [],
        };
      }
      acc[productId].batches.push(batch);
      return acc;
    }, {} as Record<string, { product: any; batches: ProductBatchWithDetails[] }>);
  });

  const totalBatchValue = computed(() => {
    return batches.value.reduce((total, batch) => {
      return total + (batch.unit_cost || 0) * batch.current_quantity;
    }, 0);
  });

  const batchAlerts = computed(() => {
    const alerts: StockAlert[] = [];
    const now = new Date().toISOString();

    // Expiry alerts
    expiredBatches.value.forEach((batch) => {
      alerts.push({
        type: 'expired',
        urgency: 'critical',
        product_id: batch.product_id,
        product_name: batch.product.name,
        product_sku: batch.product.sku,
        location_id: batch.location_id,
        location_name: batch.location.name,
        current_quantity: batch.current_quantity,
        batch_number: batch.batch_number,
        expiry_date: batch.expiry_date,
        days_until_expiry: batch.days_until_expiry,
        message: `Batch ${batch.batch_number} has expired`,
        suggested_action: 'Remove expired batch from inventory',
        created_at: now,
      });
    });

    // Near expiry alerts
    criticallyExpiringBatches.value.forEach((batch) => {
      if (batch.urgency_level !== 'expired') {
        alerts.push({
          type: 'expiring_soon',
          urgency: batch.urgency_level === 'critical' ? 'critical' : 'high',
          product_id: batch.product_id,
          product_name: batch.product_name,
          product_sku: batch.product_sku,
          location_id: batch.location_id,
          location_name: batch.location_name,
          current_quantity: batch.current_quantity,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          days_until_expiry: batch.days_until_expiry,
          message: `Batch ${batch.batch_number} expires in ${batch.days_until_expiry} days`,
          suggested_action: 'Use batch soon or mark for disposal',
          created_at: now,
        });
      }
    });

    return alerts;
  });

  // Actions
  const fetchBatches = async (
    practiceId: string,
    locationId?: string,
    productId?: string
  ) => {
    loading.value = true;
    try {
      let query = supabase
        .from('product_batches')
        .select(
          `
          *,
          product:products(id, name, sku, category, brand, unit),
          location:practice_locations(id, name, code, location_type),
          supplier:suppliers(id, name, code)
        `
        )
        .eq('practice_id', practiceId)
        .order('expiry_date', { ascending: true });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data and calculate expiry information
      batches.value = (data || []).map((batch: any) => ({
        ...batch,
        days_until_expiry: calculateDaysUntilExpiry(batch.expiry_date),
        urgency_level: calculateUrgencyLevel(batch.expiry_date),
      }));

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchExpiringBatches = async (practiceId: string, daysAhead = 30) => {
    try {
      const { data, error } = await supabase.rpc('get_expiring_batches', {
        p_practice_id: practiceId,
        p_days_ahead: daysAhead,
      });

      if (error) throw error;

      expiringBatches.value = data || [];
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      throw error;
    }
  };

  const createBatch = async (request: CreateBatchRequest) => {
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .insert([
          {
            ...request,
            created_by: authStore.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh batches to include the new one
      await fetchBatches(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  };

  const updateBatch = async (request: UpdateBatchRequest) => {
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .update({
          ...request,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id)
        .eq('practice_id', request.practice_id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const batchIndex = batches.value.findIndex((b) => b.id === request.id);
      if (batchIndex !== -1) {
        batches.value[batchIndex] = { ...batches.value[batchIndex], ...data };
      }

      return data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  };

  const deleteBatch = async (batchId: string, practiceId: string) => {
    try {
      const { error } = await supabase
        .from('product_batches')
        .delete()
        .eq('id', batchId)
        .eq('practice_id', practiceId);

      if (error) throw error;

      // Remove from local state
      batches.value = batches.value.filter((b) => b.id !== batchId);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  };

  const getFifoBatches = async (
    practiceId: string,
    locationId: string,
    productId: string,
    requestedQuantity: number
  ): Promise<FifoBatch[]> => {
    try {
      const { data, error } = await supabase.rpc('get_fifo_batches', {
        p_practice_id: practiceId,
        p_location_id: locationId,
        p_product_id: productId,
        p_requested_quantity: requestedQuantity,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting FIFO batches:', error);
      throw error;
    }
  };

  const processBatchMovement = async (request: BatchStockMovementRequest) => {
    try {
      // Create stock movements for each batch
      const movementPromises = request.batch_movements.map((batchMovement) =>
        supabase.from('stock_movements').insert([
          {
            practice_id: request.practice_id,
            location_id: request.location_id,
            product_id: request.product_id,
            movement_type: request.movement_type,
            quantity_change: -batchMovement.quantity_used, // Negative for usage
            quantity_before: 0, // Will be updated by trigger
            quantity_after: 0, // Will be updated by trigger
            batch_number: batchMovement.batch_number,
            expiry_date: batchMovement.expiry_date,
            reason_code: request.reason_code,
            notes: request.notes,
            created_by: authStore.user?.id,
          },
        ])
      );

      await Promise.all(movementPromises);

      // Refresh batches to reflect new quantities
      await fetchBatches(request.practice_id);
    } catch (error) {
      console.error('Error processing batch movement:', error);
      throw error;
    }
  };

  const markBatchesAsExpired = async (practiceId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('product_batches')
        .update({ status: 'expired' })
        .eq('practice_id', practiceId)
        .eq('status', 'active')
        .lte('expiry_date', today);

      if (error) throw error;

      // Refresh batches
      await fetchBatches(practiceId);
    } catch (error) {
      console.error('Error marking batches as expired:', error);
      throw error;
    }
  };

  const searchBatches = async (practiceId: string, searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .select(
          `
          *,
          product:products(id, name, sku, category, brand, unit),
          location:practice_locations(id, name, code, location_type),
          supplier:suppliers(id, name, code)
        `
        )
        .eq('practice_id', practiceId)
        .or(
          `batch_number.ilike.%${searchTerm}%, supplier_batch_number.ilike.%${searchTerm}%`
        )
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((batch: any) => ({
        ...batch,
        days_until_expiry: calculateDaysUntilExpiry(batch.expiry_date),
        urgency_level: calculateUrgencyLevel(batch.expiry_date),
      }));
    } catch (error) {
      console.error('Error searching batches:', error);
      throw error;
    }
  };

  // Helper functions
  const calculateDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateUrgencyLevel = (expiryDate: string): ExpiryUrgencyLevel => {
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);

    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'critical';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'normal';
  };

  return {
    // State
    batches,
    expiringBatches,
    loading,
    lastSyncAt,

    // Getters
    activeBatches,
    expiredBatches,
    criticallyExpiringBatches,
    batchesByProduct,
    totalBatchValue,
    batchAlerts,

    // Actions
    fetchBatches,
    fetchExpiringBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    getFifoBatches,
    processBatchMovement,
    markBatchesAsExpired,
    searchBatches,

    // Helpers
    calculateDaysUntilExpiry,
    calculateUrgencyLevel,
  };
});
