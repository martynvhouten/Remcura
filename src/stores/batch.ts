import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import {
  type ProductBatch,
  type ProductBatchWithDetails,
  type CreateBatchRequest,
  type UpdateBatchRequest,
  type ExpiringBatch,
  type FifoBatch,
  type BatchMovement,
} from 'src/types/inventory';
import { ServiceErrorHandler } from 'src/utils/service-error-handler';

// Using ServiceErrorHandler static methods

export const useBatchStore = defineStore('batch', () => {
  // State
  const batches = ref<ProductBatchWithDetails[]>([]);
  const expiringBatches = ref<ExpiringBatch[]>([]);
  const fifoBatches = ref<FifoBatch[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const batchesByProduct = computed(() => (productId: string) => {
    return batches.value.filter(batch => batch.product_id === productId);
  });

  const batchesByLocation = computed(() => (locationId: string) => {
    return batches.value.filter(batch => batch.location_id === locationId);
  });

  const expiredBatches = computed(() => {
    return batches.value.filter(batch => 
      new Date(batch.expiry_date) < new Date()
    );
  });

  const expiringBatchesCount = computed(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return batches.value.filter(batch => {
      const expiryDate = new Date(batch.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
  });

  const lowStockBatches = computed(() => {
    return batches.value.filter(batch => batch.current_quantity <= 10);
  });

  const totalValue = computed(() => {
    return batches.value.reduce((total, batch) => {
      const unitCost = batch.unit_cost || 0;
      return total + (batch.current_quantity * unitCost);
    }, 0);
  });

  // Actions
  const fetchBatches = async (filters?: {
    productId?: string;
    locationId?: string;
    includeExpired?: boolean;
  }) => {
    try {
      loading.value = true;
      error.value = null;

      // TODO: Replace with actual database call once product_batches table exists
      // For now, return mock data
      const mockBatches: ProductBatchWithDetails[] = [
        {
          id: '1',
          practice_id: 'current-practice',
          product_id: filters?.productId || 'prod-1',
          location_id: filters?.locationId || 'loc-1',
          batch_number: 'B001',
          supplier_batch_number: 'SUP-B001',
          expiry_date: '2024-12-31',
          received_date: '2024-01-01',
          initial_quantity: 100,
          current_quantity: 75,
          reserved_quantity: 0,
          available_quantity: 75,
          unit_cost: 10.50,
          total_cost: 1050,
          currency: 'EUR',
          status: 'active',
          quality_check_passed: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          product: {
            id: 'prod-1',
            name: 'Sample Product',
            sku: 'SKU-001',
            category: 'Medical',
            brand: 'Sample Brand',
            unit: 'pieces'
          },
          location: {
            id: 'loc-1',
            name: 'Main Warehouse',
            code: 'MW',
            location_type: 'warehouse'
          },
          supplier: {
            id: 'sup-1',
            name: 'Sample Supplier',
            code: 'SS'
          },
          days_until_expiry: 30,
          urgency_level: 'warning'
        }
      ];

      batches.value = mockBatches;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'fetchBatches'
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const fetchExpiringBatches = async (daysAhead: number = 30) => {
    try {
      loading.value = true;
      error.value = null;

      // TODO: Replace with actual RPC call once get_expiring_batches function exists
      const mockExpiringBatches: ExpiringBatch[] = [
        {
          batch_id: '1',
          product_id: 'prod-1',
          product_name: 'Sample Product',
          product_sku: 'SKU-001',
          location_id: 'loc-1',
          location_name: 'Main Warehouse',
          batch_number: 'B001',
          expiry_date: '2024-12-31',
          current_quantity: 75,
          days_until_expiry: 30,
          urgency_level: 'warning'
        }
      ];

      expiringBatches.value = mockExpiringBatches;
      return mockExpiringBatches;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'fetchExpiringBatches'
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const fetchFifoBatches = async (productId: string, quantity: number) => {
    try {
      loading.value = true;
      error.value = null;

      // TODO: Replace with actual RPC call once get_fifo_batches function exists
      const mockFifoBatches: FifoBatch[] = [
        {
          batch_id: '1',
          batch_number: 'B001',
          available_quantity: 75,
          expiry_date: '2024-12-31',
          use_quantity: Math.min(quantity, 75)
        }
      ];

      fifoBatches.value = mockFifoBatches;
      return mockFifoBatches;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'fetchFifoBatches'
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const createBatch = async (request: CreateBatchRequest) => {
    try {
      loading.value = true;
      error.value = null;

      // TODO: Replace with actual database insert once product_batches table exists
      const mockBatch: ProductBatch = {
        id: Date.now().toString(),
        practice_id: request.practice_id,
        product_id: request.product_id,
        location_id: request.location_id,
        batch_number: request.batch_number,
        supplier_batch_number: request.supplier_batch_number || undefined,
        expiry_date: request.expiry_date,
        received_date: request.received_date ? request.received_date : new Date().toISOString().split('T')[0],
        initial_quantity: request.initial_quantity,
        current_quantity: request.initial_quantity,
        reserved_quantity: 0,
        available_quantity: request.initial_quantity,
        unit_cost: request.unit_cost,
        total_cost: (request.unit_cost || 0) * request.initial_quantity,
        currency: request.currency || 'EUR',
        supplier_id: request.supplier_id,
        purchase_order_number: request.purchase_order_number,
        invoice_number: request.invoice_number,
        status: 'active',
        quality_check_passed: request.quality_check_passed || true,
        quality_notes: request.quality_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user' // Should come from auth
      };

      return mockBatch;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'createBatch'
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

      // TODO: Replace with actual database update once product_batches table exists
      const existingBatch = batches.value.find(b => b.id === id);
      if (!existingBatch) {
        throw new Error('Batch not found');
      }

      const updatedBatch = {
        ...existingBatch,
        ...updates,
        updated_at: new Date().toISOString()
      };

      const index = batches.value.findIndex(b => b.id === id);
      if (index !== -1) {
        batches.value[index] = updatedBatch;
      }

      return updatedBatch;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'updateBatch'
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

      // TODO: Replace with actual RPC call once process_batch_stock_movement function exists
      for (const movement of movements) {
        const batch = batches.value.find(b => b.id === movement.batch_id);
        if (batch) {
          batch.current_quantity -= movement.quantity_used;
          batch.available_quantity = Math.max(0, batch.current_quantity - batch.reserved_quantity);
          batch.updated_at = new Date().toISOString();
        }
      }

      return { success: true };
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'useBatch'
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const deleteBatch = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      // TODO: Replace with actual database delete once product_batches table exists
      const index = batches.value.findIndex(b => b.id === id);
      if (index !== -1) {
        batches.value.splice(index, 1);
      }

      return { success: true };
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'deleteBatch'
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

      // TODO: Replace with actual database query once product_batches table exists
      const batch = batches.value.find(b => b.id === id);
      if (!batch) {
        throw new Error('Batch not found');
      }

      return batch;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'BatchStore',
        operation: 'getBatch'
      });
      error.value = handledError.message;
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    batches,
    expiringBatches,
    fifoBatches,
    loading,
    error,

    // Getters
    batchesByProduct,
    batchesByLocation,
    expiredBatches,
    expiringBatchesCount,
    lowStockBatches,
    totalValue,

    // Actions
    fetchBatches,
    fetchExpiringBatches,
    fetchFifoBatches,
    createBatch,
    updateBatch,
    useBatch,
    deleteBatch,
    getBatch,
  };
});
