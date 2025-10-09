import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { MovementType, StockMovement } from '@/types/inventory';
import type { TablesInsert } from '@/types';
import { logger } from '@/utils/logger';

export interface CreateStockMovementRequest {
  practice_id: string;
  location_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type?: string | null;
  reference_id?: string | null;
  reason?: string | null;
  notes?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
}

const movementLabels: Record<MovementType, string> = {
  count: 'Voorraadtelling',
  receipt: 'Ontvangst',
  usage: 'Gebruik',
  transfer: 'Overplaatsing',
  adjustment: 'Aanpassing',
  waste: 'Afval',
  order_received: 'Bestelling ontvangen',
  consumption: 'Consumptie',
  expired: 'Vervallen',
  manual_adjustment: 'Handmatige aanpassing',
  correction: 'Correctie',
};

const movementIcons: Record<MovementType, string> = {
  count: 'mdi-counter',
  receipt: 'mdi-package-variant',
  usage: 'mdi-play-circle',
  transfer: 'mdi-swap-horizontal',
  adjustment: 'mdi-tune',
  waste: 'mdi-delete',
  order_received: 'mdi-truck-delivery',
  consumption: 'mdi-cart-arrow-down',
  expired: 'mdi-alert-octagon',
  manual_adjustment: 'mdi-hammer-wrench',
  correction: 'mdi-pencil-circle',
};

const movementColors: Record<MovementType, string> = {
  count: 'info',
  receipt: 'info',
  usage: 'primary',
  transfer: 'warning',
  adjustment: 'warning',
  waste: 'error',
  order_received: 'success',
  consumption: 'primary',
  expired: 'error',
  manual_adjustment: 'warning',
  correction: 'info',
};

const toInsertPayload = (
  request: CreateStockMovementRequest,
  createdBy: string | null
): TablesInsert<'stock_movements'> => ({
  practice_id: request.practice_id,
  location_id: request.location_id,
  product_id: request.product_id,
  movement_type: request.movement_type,
  quantity_change: request.quantity_change,
  quantity_before: request.quantity_before,
  quantity_after: request.quantity_after,
  reference_type: request.reference_type ?? null,
  reference_id: request.reference_id ?? undefined,
  reason: request.reason ?? undefined,
  notes: request.notes ?? undefined,
  batch_number: request.batch_number ?? undefined,
  expiry_date: request.expiry_date ?? undefined,
  created_by: createdBy,
  created_at: new Date().toISOString(),
});

export class StockMovementService {
  static labels = movementLabels;
  static icons = movementIcons;
  static colors = movementColors;

  /**
   * Log a stock movement
   */
  static async logMovement(
    request: CreateStockMovementRequest
  ): Promise<StockMovement | null> {
    const authStore = useAuthStore();
    const payload = toInsertPayload(request, authStore.user?.id ?? null);

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(payload)
        .select()
        .single();

      if (error) {
        logger.error(
          'Error logging stock movement',
          'STOCK_MOVEMENTS',
          error instanceof Error ? error : undefined
        );
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(
        'Error in logMovement',
        'STOCK_MOVEMENTS',
        error instanceof Error ? error : undefined
      );
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
      reference_id: sessionId ?? null,
      reason,
      batch_number: batchNumber ?? null,
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
      notes: notes ?? null,
      batch_number: batchNumber ?? null,
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
      reference_id: orderId ?? null,
      reason,
      batch_number: batchNumber ?? null,
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
      movement_type: 'receipt',
      quantity_change: receivedQuantity,
      quantity_before: currentQuantity,
      quantity_after: currentQuantity + receivedQuantity,
      reference_type: 'order',
      reference_id: orderId,
      reason: 'Stock received from supplier',
      batch_number: batchNumber ?? null,
      expiry_date: expiryDate ?? null,
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
    const referenceId = transferId ?? null;
    const batch = batchNumber ?? null;

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
        reference_id: referenceId,
        reason: `Transfer to location ${toLocationId}: ${reason}`,
        batch_number: batch,
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
        reference_id: referenceId,
        reason: `Transfer from location ${fromLocationId}: ${reason}`,
        batch_number: batch,
      });

      return { from: fromMovement, to: toMovement };
    } catch (error) {
      logger.error(
        'Error logging transfer movements',
        'STOCK_MOVEMENTS',
        error instanceof Error ? error : undefined
      );
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
      movement_type: 'waste',
      quantity_change: -expiredQuantity,
      quantity_before: currentQuantity,
      quantity_after: currentQuantity - expiredQuantity,
      reason,
      batch_number: batchNumber ?? null,
      expiry_date: expiryDate ?? null,
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
        .select(
          `
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `
        )
        .eq('practice_id', practiceId)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          'Error fetching product movements',
          'STOCK_MOVEMENTS',
          error instanceof Error ? error : undefined
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(
        'Error in getProductMovements',
        'STOCK_MOVEMENTS',
        error instanceof Error ? error : undefined
      );
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
        .select(
          `
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `
        )
        .eq('practice_id', practiceId)
        .eq('location_id', locationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error(
          'Error fetching location movements',
          'STOCK_MOVEMENTS',
          error instanceof Error ? error : undefined
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(
        'Error in getLocationMovements',
        'STOCK_MOVEMENTS',
        error instanceof Error ? error : undefined
      );
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
        .select(
          `
          *,
          products!inner(name, sku),
          practice_locations!inner(name)
        `
        )
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (movementTypes && movementTypes.length > 0) {
        query = query.in('movement_type', movementTypes);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(
          'Error fetching recent movements',
          'STOCK_MOVEMENTS',
          error instanceof Error ? error : undefined
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(
        'Error in getRecentMovements',
        'STOCK_MOVEMENTS',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }
}

// Helper functions for UI
export function getMovementTypeLabel(type: MovementType): string {
  const labels: Record<MovementType, string> = {
    count: 'Telling',
    receipt: 'Ontvangst',
    usage: 'Gebruik',
    transfer: 'Overplaatsing',
    adjustment: 'Correctie',
    waste: 'Afval',
    order_received: 'Ontvangst',
    consumption: 'Verbruik',
    expired: 'Vervallen',
    manual_adjustment: 'Handmatige correctie',
    correction: 'Correctie',
  };
  return labels[type] || type;
}

export function getMovementTypeIcon(type: MovementType): string {
  const icons: Record<MovementType, string> = {
    count: 'fact_check',
    receipt: 'inventory',
    usage: 'play_circle',
    transfer: 'swap_horiz',
    adjustment: 'tune',
    waste: 'delete',
    order_received: 'inventory',
    consumption: 'remove_circle_outline',
    expired: 'warning',
    manual_adjustment: 'edit',
    correction: 'build',
  };
  return icons[type] || 'help';
}

export function getMovementTypeColor(type: MovementType): string {
  const colors: Record<MovementType, string> = {
    count: 'blue',
    receipt: 'green',
    usage: 'primary',
    transfer: 'purple',
    adjustment: 'orange',
    waste: 'red-5',
    order_received: 'green',
    consumption: 'red',
    expired: 'red-6',
    manual_adjustment: 'yellow-8',
    correction: 'grey',
  };
  return colors[type] || 'grey';
}
