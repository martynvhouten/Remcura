import { ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/service-error-handler';
import type { 
  StockMovement, 
  StockUpdateRequest
} from '@/types/inventory';

// Movement with product data included
interface MovementWithRelations extends StockMovement {
  quantity_before?: number; // Add missing property
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export function useInventoryMovements(
  currentPracticeId: any,
  currentUserId: any,
  fetchStockLevels: (practiceId: string) => Promise<void>
) {
  // State
  const stockMovements = ref<MovementWithRelations[]>([]);

  // Actions - pure inventory operations only
  const updateStockLevel = async (request: StockUpdateRequest) => {
    try {
      // Validate required fields
      if (!request.practice_id || !request.location_id || !request.product_id) {
        throw new Error('Missing required fields: practice_id, location_id, or product_id');
      }

      if (request.quantity_change === 0) {
        throw new Error('Quantity change cannot be zero');
      }

      // Get current stock level with retry logic for race conditions
      let currentStock = 0;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data: stockLevel, error: stockError } = await supabase
            .from('stock_levels')
            .select('current_quantity')
            .eq('practice_id', request.practice_id)
            .eq('location_id', request.location_id)
            .eq('product_id', request.product_id)
            .maybeSingle();

          if (stockError && stockError.code !== 'PGRST116') {
            // PGRST116 = "no rows returned" - this is OK for new products
            throw stockError;
          }

          currentStock = (stockLevel as any)?.current_quantity || 0;
          break; // Success, exit retry loop

        } catch (error: any) {
          retryCount++;
          if (retryCount >= maxRetries) {
            inventoryLogger.error('Failed to get current stock after retries:', error);
            throw new Error(`Unable to get current stock level: ${error.message}`);
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }

      const newQuantity = currentStock + request.quantity_change;

      // Validate that new quantity is not negative if not allowed
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock. Current: ${currentStock}, Attempted change: ${request.quantity_change}`);
      }

      // Create stock movement record first (this serves as our audit trail)
      const movementData: any = {
        practice_id: request.practice_id,
        location_id: request.location_id,
        product_id: request.product_id,
        movement_type: request.movement_type,
        quantity_change: request.quantity_change,
        quantity_before: currentStock,
        quantity_after: newQuantity,
        reference_type: 'manual_adjustment',
        reason: request.reason_code,
        notes: request.notes || null,
        batch_id: null, // Required for database triggers
      };

      // Add created_by only if we have a valid user
      const userId = currentUserId.value;
      if (userId && userId !== '550e8400-e29b-41d4-a716-446655440001') {
        // Only add created_by for real users, not demo user
        movementData.created_by = userId;
      }

      const { data: insertedMovement, error: movementError } = await supabase
        .from('stock_movements')
        .insert(movementData)
        .select()
        .single();

      if (movementError) {
        inventoryLogger.error('Error creating stock movement:', movementError);
        
        // Provide more specific error messages
        if (movementError.code === '23503') {
          const detail = movementError.details || movementError.message;
          if (detail.includes('practice_id')) {
            throw new Error('Practice not found. Please refresh and try again.');
          } else if (detail.includes('location_id')) {
            throw new Error('Location not found. Please refresh and try again.');
          } else if (detail.includes('product_id')) {
            throw new Error('Product not found. Please refresh and try again.');
          } else if (detail.includes('created_by')) {
            throw new Error('User authentication failed. Please log in again.');
          } else {
            throw new Error('Invalid reference: practice, location, or product not found');
          }
        } else if (movementError.code === '23505') {
          throw new Error('Duplicate movement detected. Please try again.');
        } else if (movementError.code === '23514') {
          throw new Error('Invalid data: check constraints failed');
        } else {
          throw new Error(`Failed to record stock movement: ${movementError.message}`);
        }
      }

      // Stock level is automatically updated by database triggers
      // No need for manual upsert anymore
      
      // Refresh data to reflect changes
      await fetchStockMovements(request.practice_id);

      return insertedMovement;
    } catch (error: any) {
      const result = await ErrorHandler.handleError(error, {
        service: 'inventory',
        operation: 'updateStockLevel',
        practiceId: request.practice_id,
        userId: currentUserId.value || undefined,
        metadata: { 
          request,
          errorCode: error.code,
          errorDetails: error.details 
        }
      }, {
        showToUser: false, // Let the calling component handle UI feedback
        logLevel: 'error'
      });

      // Provide specific error messages for common cases
      if (error.message?.includes('Invalid reference')) {
        throw new Error('Product, location, or practice niet gevonden. Ververs de pagina en probeer opnieuw.');
      } else if (error.message?.includes('Insufficient stock')) {
        throw error; // This error message is already user-friendly
      } else if (error.code === '23505' || error.message?.includes('Duplicate')) {
        throw new Error('Een andere update is bezig. Wacht even en probeer opnieuw.');
      } else {
        // Use the centralized error handler's user message
        throw new Error(result.userMessage);
      }
    }
  };

  const fetchStockMovements = async (practiceId: string, limit = 50) => {
    try {
      // Use stock_movements table with simplified query
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform stock movements to internal format
      stockMovements.value = (data || []).map((movement: any) => ({
        id: movement.id,
        practice_id: movement.practice_id,
        location_id: movement.location_id,
        product_id: movement.product_id,
        movement_type: movement.movement_type,
        quantity_change: movement.quantity_change,
        quantity_before: movement.quantity_before || 0,
        quantity_after: movement.quantity_after,
        performed_by: movement.created_by || '',
        notes: movement.notes,
        created_at: movement.created_at,
        product: undefined, // Will be populated separately if needed
      })) as MovementWithRelations[];
    } catch (error) {
      inventoryLogger.error('Error fetching stock movements:', error);
      throw error;
    }
  };

  const transferStock = async (
    practiceId: string,
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => {
    try {
      // Get current stock at source location
      const fromStockQuery = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', practiceId)
        .eq('location_id', fromLocationId)
        .eq('product_id', productId)
        .maybeSingle();

      // Get current stock at destination location
      const toStockQuery = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', practiceId)
        .eq('location_id', toLocationId)
        .eq('product_id', productId)
        .maybeSingle();

      const fromCurrentStock = (fromStockQuery.data as any)?.current_quantity || 0;
      const toCurrentStock = (toStockQuery.data as any)?.current_quantity || 0;
      
      // Create transfer out movement
      await supabase.from('stock_movements').insert({
        practice_id: practiceId,
        location_id: fromLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: -quantity,
        quantity_before: fromCurrentStock,
        quantity_after: fromCurrentStock - quantity,
        reference_type: 'transfer',
        notes: notes || `Transfer to ${toLocationId}`,
        created_by: currentUserId.value || '',
      });

      // Create transfer in movement
      await supabase.from('stock_movements').insert({
        practice_id: practiceId,
        location_id: toLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: quantity,
        quantity_before: toCurrentStock,
        quantity_after: toCurrentStock + quantity,
        reference_type: 'transfer',
        notes: notes || `Transfer from ${fromLocationId}`,
        created_by: currentUserId.value || '',
      });

      // Update stock levels for both locations
      await supabase.from('stock_levels').upsert([
        {
          practice_id: practiceId,
          location_id: fromLocationId,
          product_id: productId,
          current_quantity: fromCurrentStock - quantity,
          updated_at: new Date().toISOString(),
        },
        {
          practice_id: practiceId,
          location_id: toLocationId,
          product_id: productId,
          current_quantity: toCurrentStock + quantity,
          updated_at: new Date().toISOString(),
        }
      ], {
        onConflict: 'practice_id,location_id,product_id'
      });

      // Refresh movements
      await fetchStockMovements(practiceId);
    } catch (error) {
      inventoryLogger.error('Error transferring stock:', error);
      throw error;
    }
  };

  const executeStockTransfer = async (transferData: any) => {
    const practiceId = currentPracticeId.value;
    
    if (!practiceId) {
      throw new Error('No practice selected');
    }

    try {
      // Use the existing transferStock method
      await transferStock(
        practiceId,
        transferData.product_id,
        transferData.from_location_id,
        transferData.to_location_id,
        transferData.quantity,
        transferData.notes
      );
    } catch (error) {
      inventoryLogger.error('Error executing stock transfer:', error);
      throw error;
    }
  };

  return {
    // State
    stockMovements,

    // Actions
    updateStockLevel,
    fetchStockMovements,
    transferStock,
    executeStockTransfer,
  };
}