import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { MovementType, StockMovement } from '@/types/inventory';

export interface CreateStockMovementRequest {
  practice_id: string;
  location_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type?: string;
  reference_id?: string;
  reason?: string;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
}

export class StockMovementService {
  /**
   * Log a stock movement
   */
  static async logMovement(request: CreateStockMovementRequest): Promise<StockMovement | null> {
    const authStore = useAuthStore();
    
    try {
      const movementData = {
        ...request,
        created_by: authStore.user?.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('stock_movements')
        .insert([movementData])
        .select()
        .single();

      if (error) {
        console.error('Error logging stock movement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in logMovement:', error);
      throw error;
    }
  }

  /**
   * Log an inventory count adjustment
   */
  static async logCountAdjustment(
    practiceId: string,
    locationId: string,
    productId: string,
    oldQuantity: number,
    newQuantity: number,
    reason: string,
    sessionId?: string,
    batchNumber?: string
  ): Promise<StockMovement | null> {
    return this.logMovement({
      practice_id: practiceId,
      location_id: locationId,
      product_id: productId,
      movement_type: 'count',
      quantity_change: newQuantity - oldQuantity,
      quantity_before: oldQuantity,
      quantity_after: newQuantity,
      reference_type: sessionId ? 'counting_session' : 'manual_count',
      reference_id: sessionId,
      reason,
      batch_number,
    });
  }

  /**
   * Log a manual stock adjustment
   */
  static async logManualAdjustment(
    practiceId: string,
    locationId: string,
    productId: string,
    oldQuantity: number,
    newQuantity: number,
    reason: string,
    notes?: string,
    batchNumber?: string
  ): Promise<StockMovement | null> {
    return this.logMovement({
      practice_id: practiceId,
      location_id: locationId,
      product_id: productId,
      movement_type: 'manual_adjustment',
      quantity_change: newQuantity - oldQuantity,
      quantity_before: oldQuantity,
      quantity_after: newQuantity,
      reference_type: 'manual_adjustment',
      reason,
      notes,
      batch_number,
    });
  }

  /**
   * Log product consumption/usage
   */
  static async logConsumption(
    practiceId: string,
    locationId: string,
    productId: string,
    currentQuantity: number,
    consumedQuantity: number,
    reason: string,
    orderId?: string,
    batchNumber?: string
  ): Promise<StockMovement | null> {
    return this.logMovement({
      practice_id: practiceId,
      location_id: locationId,
      product_id: productId,
      movement_type: 'consumption',
      quantity_change: -consumedQuantity,
      quantity_before: currentQuantity,
      quantity_after: currentQuantity - consumedQuantity,
      reference_type: orderId ? 'order' : 'manual_consumption',
      reference_id: orderId,
      reason,
      batch_number,
    });
  }

  /**
   * Log stock receipt from order
   */
  static async logOrderReceipt(
    practiceId: string,
    locationId: string,
    productId: string,
    currentQuantity: number,
    receivedQuantity: number,
    orderId: string,
    batchNumber?: string,
    expiryDate?: string
  ): Promise<StockMovement | null> {
    return this.logMovement({
      practice_id: practiceId,
      location_id: locationId,
      product_id: productId,
      movement_type: 'order_received',
      quantity_change: receivedQuantity,
      quantity_before: currentQuantity,
      quantity_after: currentQuantity + receivedQuantity,
      reference_type: 'order',
      reference_id: orderId,
      reason: 'Stock received from supplier',
      batch_number: batchNumber,
      expiry_date: expiryDate,
    });
  }

  /**
   * Log stock transfer between locations
   */
  static async logTransfer(
    practiceId: string,
    fromLocationId: string,
    toLocationId: string,
    productId: string,
    fromQuantity: number,
    toQuantity: number,
    transferQuantity: number,
    reason: string,
    transferId?: string,
    batchNumber?: string
  ): Promise<{ from: StockMovement | null; to: StockMovement | null }> {
    try {
      // Log outgoing movement from source location
      const fromMovement = await this.logMovement({
        practice_id: practiceId,
        location_id: fromLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: -transferQuantity,
        quantity_before: fromQuantity,
        quantity_after: fromQuantity - transferQuantity,
        reference_type: 'transfer',
        reference_id: transferId,
        reason: `Transfer to location ${toLocationId}: ${reason}`,
        batch_number: batchNumber,
      });

      // Log incoming movement to destination location
      const toMovement = await this.logMovement({
        practice_id: practiceId,
        location_id: toLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: transferQuantity,
        quantity_before: toQuantity,
        quantity_after: toQuantity + transferQuantity,
        reference_type: 'transfer',
        reference_id: transferId,
        reason: `Transfer from location ${fromLocationId}: ${reason}`,
        batch_number: batchNumber,
      });

      return { from: fromMovement, to: toMovement };
    } catch (error) {
      console.error('Error logging transfer movements:', error);
      throw error;
    }
  }

  /**
   * Log expired/waste stock removal
   */
  static async logExpiredStock(
    practiceId: string,
    locationId: string,
    productId: string,
    currentQuantity: number,
    expiredQuantity: number,
    reason: string,
    batchNumber?: string,
    expiryDate?: string
  ): Promise<StockMovement | null> {
    return this.logMovement({
      practice_id: practiceId,
      location_id: locationId,
      product_id: productId,
      movement_type: 'expired',
      quantity_change: -expiredQuantity,
      quantity_before: currentQuantity,
      quantity_after: currentQuantity - expiredQuantity,
      reason,
      batch_number: batchNumber,
      expiry_date: expiryDate,
    });
  }

  /**
   * Get stock movements for a product
   */
  static async getProductMovements(
    practiceId: string,
    productId: string,
    limit: number = 50
  ): Promise<StockMovement[]> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching product movements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductMovements:', error);
      throw error;
    }
  }

  /**
   * Get stock movements for a location
   */
  static async getLocationMovements(
    practiceId: string,
    locationId: string,
    limit: number = 50
  ): Promise<StockMovement[]> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId)
        .eq('location_id', locationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching location movements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLocationMovements:', error);
      throw error;
    }
  }

  /**
   * Get recent stock movements for practice
   */
  static async getRecentMovements(
    practiceId: string,
    limit: number = 100,
    movementTypes?: MovementType[]
  ): Promise<StockMovement[]> {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (movementTypes && movementTypes.length > 0) {
        query = query.in('movement_type', movementTypes);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recent movements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentMovements:', error);
      throw error;
    }
  }
}

// Helper functions for UI
export function getMovementTypeLabel(type: MovementType): string {
  const labels: Record<MovementType, string> = {
    count: 'Telling',
    adjustment: 'Correctie',
    order_received: 'Ontvangst',
    consumption: 'Verbruik',
    transfer: 'Overplaatsing',
    expired: 'Vervallen',
    manual_adjustment: 'Handmatige correctie',
    correction: 'Correctie',
  };
  return labels[type] || type;
}

export function getMovementTypeIcon(type: MovementType): string {
  const icons: Record<MovementType, string> = {
    count: 'fact_check',
    adjustment: 'tune',
    order_received: 'inventory',
    consumption: 'remove_circle_outline',
    transfer: 'swap_horiz',
    expired: 'warning',
    manual_adjustment: 'edit',
    correction: 'build',
  };
  return icons[type] || 'help';
}

export function getMovementTypeColor(type: MovementType): string {
  const colors: Record<MovementType, string> = {
    count: 'blue',
    adjustment: 'orange',
    order_received: 'green',
    consumption: 'red',
    transfer: 'purple',
    expired: 'red-6',
    manual_adjustment: 'yellow-8',
    correction: 'grey',
  };
  return colors[type] || 'grey';
} 