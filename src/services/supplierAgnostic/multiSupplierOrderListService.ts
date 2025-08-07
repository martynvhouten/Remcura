import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import type { OrderListWithItems } from '@/types/stores';
import type { SupplierOrder } from '@/stores/orderLists/orderLists-supplier-splitting';

export interface MultiSupplierOrderListItem {
  id: string;
  order_list_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  supplier_id: string;
  supplier_name: string;
  supplier_sku?: string;
  minimum_stock: number;
  maximum_stock: number;
  current_stock: number;
  unit_price: number;
  currency: string;
  pack_size: number;
  order_multiple: number;
  lead_time_days: number;
  is_preferred_supplier: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierAgnosticOrderList {
  id: string;
  practice_id: string;
  name: string;
  description?: string;
  department?: string;
  location?: string;
  is_active: boolean;
  auto_reorder: boolean;
  items: MultiSupplierOrderListItem[];
  created_at: string;
  updated_at: string;
}

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
    department?: string;
    location?: string;
    auto_reorder?: boolean;
  }): Promise<SupplierAgnosticOrderList> {
    try {
      orderLogger.info('Creating new supplier-agnostic order list:', data.name);

      const { data: orderList, error } = await supabase
        .from('order_lists')
        .insert({
          practice_id: data.practice_id,
          name: data.name,
          description: data.description,
          department: data.department,
          location: data.location,
          auto_reorder: data.auto_reorder || false,
          is_active: true,
          supplier_agnostic: true, // New field to mark as multi-supplier
        })
        .select()
        .single();

      if (error) throw error;

      orderLogger.info('✅ Order list created successfully:', orderList.id);

      return {
        ...orderList,
        items: [],
      };
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
  ): Promise<MultiSupplierOrderListItem> {
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
            .select('name, sku')
            .eq('id', data.product_id)
            .single(),
          supabase
            .from('supplier_products')
            .select(
              `
            supplier_sku,
            cost_price,
            currency,
            pack_size,
            order_multiple,
            lead_time_days,
            suppliers (id, name)
          `
            )
            .eq('product_id', data.product_id)
            .eq('supplier_id', data.supplier_id)
            .single(),
          supabase
            .from('stock_levels')
            .select('current_quantity')
            .eq('product_id', data.product_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (productResult.error) throw productResult.error;
      if (supplierProductResult.error) throw supplierProductResult.error;

      const product = productResult.data;
      const supplierProduct = supplierProductResult.data;
      const currentStock = stockResult.data?.current_quantity || 0;

      // Insert order list item
      const { data: orderListItem, error } = await supabase
        .from('order_list_items')
        .insert({
          order_list_id: orderListId,
          product_id: data.product_id,
          supplier_id: data.supplier_id,
          minimum_stock: data.minimum_stock,
          maximum_stock: data.maximum_stock,
          current_stock: currentStock,
          unit_price: supplierProduct.cost_price,
          is_preferred_supplier: data.is_preferred_supplier || false,
        })
        .select()
        .single();

      if (error) throw error;

      orderLogger.info('✅ Product added to order list successfully');

      return {
        ...orderListItem,
        product_name: product.name,
        sku: product.sku,
        supplier_name: supplierProduct.suppliers.name,
        supplier_sku: supplierProduct.supplier_sku,
        currency: supplierProduct.currency || 'EUR',
        pack_size: supplierProduct.pack_size || 1,
        order_multiple: supplierProduct.order_multiple || 1,
        lead_time_days: supplierProduct.lead_time_days || 1,
      };
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
  ): Promise<MultiSupplierOrderListItem> {
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
          supplier_sku,
          cost_price,
          currency,
          pack_size,
          order_multiple,
          lead_time_days,
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
          supplier_id: newSupplierId,
          unit_price: supplierProduct.cost_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select(
          `
          *,
          products (name, sku)
        `
        )
        .single();

      if (updateError) throw updateError;

      orderLogger.info('✅ Supplier updated successfully');

      return {
        ...updatedItem,
        product_name: updatedItem.products.name,
        sku: updatedItem.products.sku,
        supplier_name: supplierProduct.suppliers.name,
        supplier_sku: supplierProduct.supplier_sku,
        currency: supplierProduct.currency || 'EUR',
        pack_size: supplierProduct.pack_size || 1,
        order_multiple: supplierProduct.order_multiple || 1,
        lead_time_days: supplierProduct.lead_time_days || 1,
      };
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

      const lowestPrice = supplierProducts[0]?.cost_price || 0;

      return supplierProducts.map(sp => ({
        supplier_id: sp.supplier_id,
        supplier_name: sp.suppliers.name,
        supplier_sku: sp.supplier_sku,
        cost_price: sp.cost_price,
        currency: sp.currency || 'EUR',
        lead_time_days: sp.lead_time_days || 1,
        is_available: sp.is_available,
        price_difference_percent:
          lowestPrice > 0
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
      const suppliersCount = new Set(items.map(item => item.suppliers.id)).size;
      const lowStockItems = items.filter(
        item => item.current_stock <= item.minimum_stock
      ).length;
      const outOfStockItems = items.filter(
        item => item.current_stock === 0
      ).length;
      const totalValue = items.reduce((sum, item) => sum + item.unit_price, 0);
      const avgLeadTime =
        items.reduce((sum, item) => sum + item.lead_time_days, 0) / totalItems;

      // Supplier breakdown
      const supplierMap = new Map();
      items.forEach(item => {
        const supplierId = item.suppliers.id;
        if (!supplierMap.has(supplierId)) {
          supplierMap.set(supplierId, {
            supplier_id: supplierId,
            supplier_name: item.suppliers.name,
            item_count: 0,
            total_value: 0,
            total_lead_time: 0,
          });
        }
        const supplier = supplierMap.get(supplierId);
        supplier.item_count++;
        supplier.total_value += item.unit_price;
        supplier.total_lead_time += item.lead_time_days;
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
          supplier_id,
          unit_price,
          suppliers (name, lead_time_days)
        `
        )
        .eq('order_list_id', orderListId);

      if (itemsError) throw itemsError;

      const recommendations = [];
      let totalSavings = 0;
      let totalLeadTimeImprovement = 0;

      for (const item of items) {
        const alternatives = await this.getAlternativeSuppliers(
          item.product_id
        );

        if (alternatives.length <= 1) continue; // No alternatives

        const currentPrice = item.unit_price;
        const currentLeadTime = item.suppliers?.lead_time_days || 7;

        let bestAlternative;

        switch (criteria.prioritize) {
          case 'price':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== item.supplier_id)
              .filter(alt => alt.cost_price < currentPrice)
              .sort((a, b) => a.cost_price - b.cost_price)[0];
            break;

          case 'lead_time':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== item.supplier_id)
              .filter(alt => alt.lead_time_days < currentLeadTime)
              .sort((a, b) => a.lead_time_days - b.lead_time_days)[0];
            break;

          case 'balanced':
            bestAlternative = alternatives
              .filter(alt => alt.supplier_id !== item.supplier_id)
              .map(alt => ({
                ...alt,
                // 40% weight on lead time
                score:
                  ((currentPrice - alt.cost_price) / currentPrice) * 0.6 + // 60% weight on price
                  ((currentLeadTime - alt.lead_time_days) / currentLeadTime) *
                    0.4,
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
            current_supplier: item.suppliers?.name || 'Unknown',
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
      department?: string;
      location?: string;
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
          auto_reorder,
          order_list_items (
            product_id,
            supplier_id,
            minimum_stock,
            maximum_stock,
            is_preferred_supplier
          )
        `
        )
        .eq('id', orderListId)
        .single();

      if (listError) throw listError;

      // Create new order list
      const newOrderList = await this.createOrderList({
        practice_id: originalList.practice_id,
        name: newData.name,
        description: newData.description,
        department: newData.department,
        location: newData.location,
        auto_reorder: originalList.auto_reorder,
      });

      // Copy all items
      const itemPromises = originalList.order_list_items.map(item =>
        this.addProductToOrderList(newOrderList.id, {
          product_id: item.product_id,
          supplier_id: item.supplier_id,
          minimum_stock: item.minimum_stock,
          maximum_stock: item.maximum_stock,
          is_preferred_supplier: item.is_preferred_supplier,
        })
      );

      const items = await Promise.all(itemPromises);

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
