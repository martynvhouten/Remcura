import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import type { OrderListWithItems } from '@/types/stores';
import type {
  OrderListInsert,
  OrderListItemDTO,
  OrderListItemInsert,
  OrderListItemRow,
  OrderListRow,
  ProductRow,
  StockLevelRow,
  SupplierProductRow,
} from '@/types/inventory';
import {
  mapOrderListItemRowToDTO,
  mapOrderListRowToDTO,
  mapStockLevelRowToView,
} from '@/types/inventory';

type SupplierProductWithSupplier = SupplierProductRow & {
  suppliers: { id: string; name: string } | null;
};

export type SupplierAgnosticOrderList = OrderListWithItems;

export interface OrderListAnalytics {
  total_items: number;
  suppliers_count: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_value: number;
  avg_lead_time: number;
  supplier_breakdown: Array<{
    supplier_id: string;
    supplier_name: string;
    item_count: number;
    total_value: number;
    avg_lead_time: number;
  }>;
}

export class MultiSupplierOrderListService {
  /**
   * Create a new supplier-agnostic order list
   */
  async createOrderList(data: {
    practice_id: string;
    name: string;
    description?: string;
    location_id: string;
    auto_reorder_enabled?: boolean;
  }): Promise<SupplierAgnosticOrderList> {
    try {
      orderLogger.info('Creating new supplier-agnostic order list:', data.name);

      const { data: orderList, error } = await supabase
        .from('order_lists')
        .insert<OrderListInsert>({
          practice_id: data.practice_id,
          name: data.name,
          description: data.description ?? null,
          location_id: data.location_id,
          auto_reorder_enabled: data.auto_reorder_enabled ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      orderLogger.info('✅ Order list created successfully:', orderList.id);

      return {
        ...mapOrderListRowToDTO(orderList as OrderListRow),
        items: [],
      } satisfies SupplierAgnosticOrderList;
    } catch (error: any) {
      orderLogger.error('❌ Failed to create order list:', error);
      throw new Error(`Failed to create order list: ${error.message}`);
    }
  }

  /**
   * Add a product to an order list with supplier selection
   */
  async addProductToOrderList(
    orderListId: string,
    data: {
      product_id: string;
      supplier_id: string;
      minimum_stock: number;
      maximum_stock: number;
      is_preferred_supplier?: boolean;
    }
  ): Promise<OrderListItemDTO> {
    try {
      orderLogger.info('Adding product to order list:', {
        orderListId,
        productId: data.product_id,
      });

      // Get product and supplier details
      const [productResult, supplierProductResult, stockResult] =
        await Promise.all([
          supabase
            .from('products')
            .select('id, name, sku')
            .eq('id', data.product_id)
            .single<ProductRow>(),
          supabase
            .from('supplier_products')
            .select(
              `
            supplier_sku,
            cost_price,
            currency,
            lead_time_days,
            supplier_id,
            suppliers (id, name)
          `
            )
            .eq('product_id', data.product_id)
            .eq('supplier_id', data.supplier_id)
            .single<SupplierProductWithSupplier>(),
          supabase
            .from('stock_levels')
            .select('current_quantity')
            .eq('product_id', data.product_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle<StockLevelRow>(),
        ]);

      if (productResult.error) throw productResult.error;
      if (supplierProductResult.error) throw supplierProductResult.error;

      const product = productResult.data;
      const supplierProduct = supplierProductResult.data;
      const currentStock = stockResult.data
        ? mapStockLevelRowToView(stockResult.data).currentQuantity
        : null;

      if (!product || !supplierProduct) {
        throw new Error('Product or supplier product could not be loaded');
      }

      // Insert order list item
      const { data: orderListItem, error } = await supabase
        .from('order_list_items')
        .insert<OrderListItemInsert>({
          order_list_id: orderListId,
          product_id: data.product_id,
          supplier_product_id: supplierProduct.id,
          preferred_supplier_id: data.supplier_id,
          minimum_stock: data.minimum_stock,
          maximum_stock: data.maximum_stock,
          current_stock: currentStock,
          unit_price: supplierProduct.cost_price,
          ordered_quantity: data.minimum_stock,
          suggested_quantity: data.minimum_stock,
          total_price:
            (supplierProduct.cost_price ?? 0) * Math.max(data.minimum_stock, 0),
        })
        .select(
          `
          *,
          product:products(id, name, sku),
          supplier_product:supplier_products(id, supplier_id, supplier_sku, cost_price, currency, lead_time_days),
          supplier:suppliers!order_list_items_preferred_supplier_id_fkey(id, name)
        `
        )
        .single<OrderListItemRow>();

      if (error) throw error;

      orderLogger.info('✅ Product added to order list successfully');

      const dto = mapOrderListItemRowToDTO(orderListItem);
      return {
        ...dto,
        product: {
          ...(dto.product ?? {}),
          id: product.id,
          name: product.name,
          sku: product.sku,
        } as OrderListItemDTO['product'],
        supplier_product: supplierProduct
          ? ({
              ...(dto.supplier_product ?? {}),
              id: supplierProduct.id,
              supplier_id: supplierProduct.supplier_id,
              supplier_sku: supplierProduct.supplier_sku ?? null,
              cost_price: supplierProduct.cost_price ?? null,
              currency: supplierProduct.currency ?? null,
              lead_time_days: supplierProduct.lead_time_days ?? null,
            } as OrderListItemDTO['supplier_product'])
          : dto.supplier_product,
      } satisfies OrderListItemDTO;
    } catch (error: any) {
      orderLogger.error('❌ Failed to add product to order list:', error);
      throw new Error(`Failed to add product to order list: ${error.message}`);
    }
  }

  /**
   * Update supplier for an existing order list item
   */
  async updateItemSupplier(
    itemId: string,
    newSupplierId: string
  ): Promise<OrderListItemDTO> {
    try {
      orderLogger.info('Updating supplier for order list item:', {
        itemId,
        newSupplierId,
      });

      // Get current item
      const { data: currentItem, error: currentError } = await supabase
        .from('order_list_items')
        .select('product_id, order_list_id')
        .eq('id', itemId)
        .single();

      if (currentError) throw currentError;

      // Get new supplier product details
      const { data: supplierProduct, error: supplierError } = await supabase
        .from('supplier_products')
        .select(
          `
          id,
          supplier_sku,
          cost_price,
          currency,
          lead_time_days,
          supplier_id,
          suppliers (id, name)
        `
        )
        .eq('product_id', currentItem.product_id)
        .eq('supplier_id', newSupplierId)
        .single();

      if (supplierError) throw supplierError;

      // Update the item
      const { data: updatedItem, error: updateError } = await supabase
        .from('order_list_items')
        .update({
          supplier_product_id: supplierProduct.id,
          preferred_supplier_id: newSupplierId,
          unit_price: supplierProduct.cost_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select(
          `
          *,
          product:products(id, name, sku),
          supplier_product:supplier_products(id, supplier_id, supplier_sku, cost_price, currency, lead_time_days),
          supplier:suppliers!order_list_items_preferred_supplier_id_fkey(id, name)
        `
        )
        .single<OrderListItemRow>();

      if (updateError) throw updateError;

      orderLogger.info('✅ Supplier updated successfully');

      const dto = mapOrderListItemRowToDTO(updatedItem);
      return {
        ...dto,
        supplier_product: {
          ...(dto.supplier_product ?? {}),
          id: supplierProduct.id,
          supplier_id: supplierProduct.supplier_id,
          supplier_sku: supplierProduct.supplier_sku ?? null,
          cost_price: supplierProduct.cost_price ?? null,
          currency: supplierProduct.currency ?? null,
          lead_time_days: supplierProduct.lead_time_days ?? null,
        } as OrderListItemDTO['supplier_product'],
      } satisfies OrderListItemDTO;
    } catch (error: any) {
      orderLogger.error('❌ Failed to update item supplier:', error);
      throw new Error(`Failed to update item supplier: ${error.message}`);
    }
  }

  /**
   * Get alternative suppliers for a product
   */
  async getAlternativeSuppliers(productId: string): Promise<
    Array<{
      supplier_id: string;
      supplier_name: string;
      supplier_sku?: string;
      cost_price: number;
      currency: string;
      lead_time_days: number;
      is_available: boolean;
      price_difference_percent: number;
    }>
  > {
    try {
      const { data: supplierProducts, error } = await supabase
        .from('supplier_products')
        .select(
          `
          supplier_id,
          supplier_sku,
          cost_price,
          currency,
          lead_time_days,
          is_available,
          suppliers (id, name)
        `
        )
        .eq('product_id', productId)
        .eq('is_available', true)
        .order('cost_price', { ascending: true });

      if (error) throw error;

      const lowestPrice = supplierProducts[0]?.cost_price ?? 0;

      return supplierProducts.map(sp => ({
        supplier_id: sp.supplier_id,
        supplier_name: sp.suppliers?.name ?? '',
        supplier_sku: sp.supplier_sku ?? undefined,
        cost_price: sp.cost_price ?? 0,
        currency: sp.currency || 'EUR',
        lead_time_days: sp.lead_time_days ?? 1,
        is_available: sp.is_available ?? false,
        price_difference_percent:
          lowestPrice > 0 && sp.cost_price !== null
            ? ((sp.cost_price - lowestPrice) / lowestPrice) * 100
            : 0,
      }));
    } catch (error: any) {
      orderLogger.error('❌ Failed to get alternative suppliers:', error);
      throw new Error(`Failed to get alternative suppliers: ${error.message}`);
    }
  }

  /**
   * Get analytics for an order list
   */
  async getOrderListAnalytics(
    orderListId: string
  ): Promise<OrderListAnalytics> {
    try {
      const { data: items, error } = await supabase
        .from('order_list_items')
        .select(
          `
          minimum_stock,
          maximum_stock,
          current_stock,
          unit_price,
          lead_time_days,
          suppliers (id, name)
        `
        )
        .eq('order_list_id', orderListId);

      if (error) throw error;

      const totalItems = items.length;
      const suppliersCount = new Set(
        items
          .map(item => item.suppliers?.id)
          .filter((id): id is string => Boolean(id))
      ).size;
      const lowStockItems = items.filter(item => {
        const current = item.current_stock ?? 0;
        const minimum = item.minimum_stock ?? 0;
        return current <= minimum;
      }).length;
      const outOfStockItems = items.filter(
        item => (item.current_stock ?? 0) === 0
      ).length;
      const totalValue = items.reduce(
        (sum, item) => sum + (item.unit_price ?? 0),
        0
      );
      const avgLeadTime =
        items.reduce(
          (sum, item) =>
            sum + ((item as any).supplier_product?.lead_time_days ?? 0),
          0
        ) / (totalItems || 1);

      // Supplier breakdown
      const supplierMap = new Map<
        string,
        {
          supplier_id: string;
          supplier_name: string;
          item_count: number;
          total_value: number;
          total_lead_time: number;
        }
      >();
      items.forEach(item => {
        const supplierId = item.suppliers?.id;
        if (!supplierId) {
          return;
        }
        if (!supplierMap.has(supplierId)) {
          supplierMap.set(supplierId, {
            supplier_id: supplierId,
            supplier_name: item.suppliers?.name ?? '',
            item_count: 0,
            total_value: 0,
            total_lead_time: 0,
          });
        }
        const supplier = supplierMap.get(supplierId);
        if (!supplier) return;
        supplier.item_count++;
        supplier.total_value += item.unit_price ?? 0;
        supplier.total_lead_time +=
          (item as any).supplier_product?.lead_time_days ?? 0;
      });

      const supplierBreakdown = Array.from(supplierMap.values()).map(
        supplier => ({
          ...supplier,
          avg_lead_time: supplier.total_lead_time / supplier.item_count,
        })
      );

      return {
        total_items: totalItems,
        suppliers_count: suppliersCount,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
        total_value: totalValue,
        avg_lead_time: avgLeadTime || 0,
        supplier_breakdown: supplierBreakdown,
      };
    } catch (error: any) {
      orderLogger.error('❌ Failed to get order list analytics:', error);
      throw new Error(`Failed to get order list analytics: ${error.message}`);
    }
  }

  /**
   * Optimize supplier selection for better pricing and lead times
   */
  async optimizeSupplierSelection(
    orderListId: string,
    criteria: {
      prioritize: 'price' | 'lead_time' | 'balanced';
      max_price_increase_percent?: number;
      max_lead_time_days?: number;
    }
  ): Promise<{
    recommendations: Array<{
      item_id: string;
      current_supplier: string;
      recommended_supplier: string;
      price_savings: number;
      lead_time_improvement: number;
      reason: string;
    }>;
    total_savings: number;
    avg_lead_time_improvement: number;
  }> {
    try {
      orderLogger.info(
        'Optimizing supplier selection for order list:',
        orderListId
      );

      // Get current order list items
      const { data: items, error: itemsError } = await supabase
        .from('order_list_items')
        .select(
          `
          id,
          product_id,
          supplier_product_id,
          preferred_supplier_id,
          unit_price,
          supplier_product:supplier_products(id, supplier_id, supplier_sku, cost_price, currency, lead_time_days),
          suppliers (id, name, lead_time_days)
        `
        )
        .eq('order_list_id', orderListId);

      if (itemsError) throw itemsError;

      const recommendations: Array<{
        item_id: string;
        current_supplier: string;
        recommended_supplier: string;
        price_savings: number;
        lead_time_improvement: number;
        reason: string;
      }> = [];
      let totalSavings = 0;
      let totalLeadTimeImprovement = 0;

      for (const item of items) {
        const alternatives = await this.getAlternativeSuppliers(
          item.product_id
        );

        if (alternatives.length <= 1) continue; // No alternatives

        const currentPrice = item.unit_price ?? 0;
        const currentLeadTime = item.supplier_product?.lead_time_days ?? 7;
        const currentSupplierId =
          item.preferred_supplier_id ??
          item.supplier_product?.supplier_id ??
          null;

        let bestAlternative;

        switch (criteria.prioritize) {
          case 'price':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== currentSupplierId)
              .filter(alt => alt.cost_price < currentPrice)
              .sort((a, b) => a.cost_price - b.cost_price)[0];
            break;

          case 'lead_time':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== currentSupplierId)
              .filter(alt => alt.lead_time_days < currentLeadTime)
              .sort((a, b) => a.lead_time_days - b.lead_time_days)[0];
            break;

          case 'balanced':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== currentSupplierId)
              .map(alt => ({
                ...alt,
                score:
                  (currentPrice > 0
                    ? ((currentPrice - alt.cost_price) / currentPrice) * 0.6
                    : 0) +
                  (currentLeadTime > 0
                    ? ((currentLeadTime - alt.lead_time_days) /
                        currentLeadTime) *
                      0.4
                    : 0),
              }))
              .filter(alt => alt.score > 0)
              .sort((a, b) => b.score - a.score)[0];
            break;
        }

        if (bestAlternative) {
          const priceSavings = currentPrice - bestAlternative.cost_price;
          const leadTimeImprovement =
            currentLeadTime - bestAlternative.lead_time_days;

          // Apply criteria filters
          if (
            criteria.max_price_increase_percent &&
            priceSavings < 0 &&
            Math.abs((priceSavings / currentPrice) * 100) >
              criteria.max_price_increase_percent
          ) {
            continue;
          }

          if (
            criteria.max_lead_time_days &&
            bestAlternative.lead_time_days > criteria.max_lead_time_days
          ) {
            continue;
          }

          recommendations.push({
            item_id: item.id,
            current_supplier: (item.suppliers as any)?.name ?? 'Unknown',
            recommended_supplier: bestAlternative.supplier_name,
            price_savings: priceSavings,
            lead_time_improvement: leadTimeImprovement,
            reason:
              priceSavings > 0
                ? `Save €${priceSavings.toFixed(2)} per unit`
                : `Improve lead time by ${leadTimeImprovement} days`,
          });

          totalSavings += priceSavings;
          totalLeadTimeImprovement += leadTimeImprovement;
        }
      }

      orderLogger.info('✅ Supplier optimization completed');

      return {
        recommendations,
        total_savings: totalSavings,
        avg_lead_time_improvement:
          recommendations.length > 0
            ? totalLeadTimeImprovement / recommendations.length
            : 0,
      };
    } catch (error: any) {
      orderLogger.error('❌ Failed to optimize supplier selection:', error);
      throw new Error(
        `Failed to optimize supplier selection: ${error.message}`
      );
    }
  }

  /**
   * Duplicate an order list to another department/location
   */
  async duplicateOrderList(
    orderListId: string,
    newData: {
      name: string;
      description?: string;
      location_id: string;
    }
  ): Promise<SupplierAgnosticOrderList> {
    try {
      orderLogger.info('Duplicating order list:', orderListId);

      // Get original order list
      const { data: originalList, error: listError } = await supabase
        .from('order_lists')
        .select(
          `
          practice_id,
          auto_reorder_enabled,
          order_list_items (
            product_id,
            preferred_supplier_id,
            minimum_stock,
            maximum_stock,
            is_preferred_supplier
          )
        `
        )
        .eq('id', orderListId)
        .single<
          OrderListRow & {
            order_list_items: Array<
              OrderListItemRow & {
                preferred_supplier_id?: string | null;
                supplier_id?: string | null;
              }
            >;
          }
        >();

      if (listError) throw listError;

      // Create new order list
      if (!newData.location_id) {
        throw new Error('Location is required to duplicate order list');
      }

      const newOrderList = await this.createOrderList({
        practice_id: originalList.practice_id,
        name: newData.name,
        description: newData.description,
        location_id: newData.location_id,
        auto_reorder_enabled: originalList.auto_reorder_enabled ?? false,
      });

      // Copy all items
      const itemPromises = originalList.order_list_items.map(item => {
        const supplierId =
          item.preferred_supplier_id ??
          (item as { supplier_id?: string | null }).supplier_id ??
          null;

        if (!supplierId) {
          return Promise.resolve(null);
        }

        return this.addProductToOrderList(newOrderList.id, {
          product_id: item.product_id,
          supplier_id: supplierId,
          minimum_stock: item.minimum_stock ?? 0,
          maximum_stock: item.maximum_stock ?? 0,
        });
      });

      const items = (await Promise.all(itemPromises)).filter(
        (item): item is OrderListItemDTO => item !== null
      );

      orderLogger.info('✅ Order list duplicated successfully');

      return {
        ...newOrderList,
        items,
      };
    } catch (error: any) {
      orderLogger.error('❌ Failed to duplicate order list:', error);
      throw new Error(`Failed to duplicate order list: ${error.message}`);
    }
  }
}

export const multiSupplierOrderListService =
  new MultiSupplierOrderListService();
