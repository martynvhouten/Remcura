import { computed } from 'vue';
import type { Ref } from 'vue';
import type {
  ProductWithStock,
  StockAlert,
} from '@/types/inventory';

export function useProductsInventory(products: Ref<ProductWithStock[]>) {
  // Total stock value across all products
  const totalStockValue = computed(() => {
    return products.value.reduce((total, product) => {
      const productValue = product.stock_levels?.reduce((sum, level) => {
        return sum + (level.current_quantity * (product.unit_price || 0));
      }, 0) || 0;
      return total + productValue;
    }, 0);
  });

  // Products with low stock levels
  const lowStockProducts = computed(() => {
    return products.value.filter(product => {
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      return totalStock > 0 && totalStock <= product.minimum_stock;
    });
  });

  // Products that are completely out of stock
  const outOfStockProducts = computed(() => {
    return products.value.filter(product => {
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      return totalStock <= 0;
    });
  });

  // Stock status summary
  const stockStatusSummary = computed(() => {
    const summary = {
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      total_products: products.value.length,
      total_value: totalStockValue.value,
    };

    products.value.forEach(product => {
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      
      if (totalStock <= 0) {
        summary.out_of_stock++;
      } else if (totalStock <= product.minimum_stock) {
        summary.low_stock++;
      } else {
        summary.in_stock++;
      }
    });

    return summary;
  });

  // Critical stock alerts for dashboard
  const criticalStockAlerts = computed((): StockAlert[] => {
    const alerts: StockAlert[] = [];

    products.value.forEach(product => {
      product.stock_levels?.forEach(stockLevel => {
        const currentStock = stockLevel.current_quantity || 0;
        const minimumStock = stockLevel.minimum_stock || product.minimum_stock || 0;
        
        if (currentStock <= 0) {
          alerts.push({
            id: `${product.id}-${stockLevel.location_id}`,
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            location_id: stockLevel.location_id,
            location_name: stockLevel.location_name || 'Unknown Location',
            current_stock: currentStock,
            minimum_stock: minimumStock,
            alert_type: 'out_of_stock',
            severity: 'critical',
            message: `${product.name} is out of stock`,
            created_at: new Date().toISOString(),
          });
        } else if (currentStock <= minimumStock) {
          alerts.push({
            id: `${product.id}-${stockLevel.location_id}`,
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            location_id: stockLevel.location_id,
            location_name: stockLevel.location_name || 'Unknown Location',
            current_stock: currentStock,
            minimum_stock: minimumStock,
            alert_type: 'low_stock',
            severity: 'warning',
            message: `${product.name} is running low (${currentStock} remaining)`,
            created_at: new Date().toISOString(),
          });
        }
      });
    });

    // Sort by severity (critical first) and then by current stock (lowest first)
    return alerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      return a.current_stock - b.current_stock;
    });
  });

  // Products that need reordering
  const productsNeedingReorder = computed(() => {
    return products.value.filter(product => {
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      const reorderLevel = product.reorder_level || product.minimum_stock || 0;
      return totalStock <= reorderLevel;
    });
  });

  // Inventory turnover metrics
  const inventoryMetrics = computed(() => {
    const metrics = {
      totalProducts: products.value.length,
      totalStockValue: totalStockValue.value,
      averageStockValue: 0,
      stockDistribution: {
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
      },
      categoryBreakdown: new Map<string, number>(),
      supplierBreakdown: new Map<string, number>(),
    };

    metrics.averageStockValue = metrics.totalProducts > 0 
      ? metrics.totalStockValue / metrics.totalProducts 
      : 0;

    products.value.forEach(product => {
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      const productValue = totalStock * (product.unit_price || 0);
      
      // Stock status distribution
      if (totalStock <= 0) {
        metrics.stockDistribution.out_of_stock++;
      } else if (totalStock <= product.minimum_stock) {
        metrics.stockDistribution.low_stock++;
      } else {
        metrics.stockDistribution.in_stock++;
      }

      // Category breakdown
      if (product.category) {
        const currentCategoryValue = metrics.categoryBreakdown.get(product.category) || 0;
        metrics.categoryBreakdown.set(product.category, currentCategoryValue + productValue);
      }

      // Supplier breakdown
      if (product.supplier_name) {
        const currentSupplierValue = metrics.supplierBreakdown.get(product.supplier_name) || 0;
        metrics.supplierBreakdown.set(product.supplier_name, currentSupplierValue + productValue);
      }
    });

    return metrics;
  });

  // Top categories by value
  const topCategoriesByValue = computed(() => {
    const categoryMap = new Map<string, { name: string; value: number; count: number }>();

    products.value.forEach(product => {
      if (product.category) {
        const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
        const productValue = totalStock * (product.unit_price || 0);
        
        const existing = categoryMap.get(product.category) || { name: product.category, value: 0, count: 0 };
        existing.value += productValue;
        existing.count += 1;
        categoryMap.set(product.category, existing);
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  });

  // Top products by value
  const topProductsByValue = computed(() => {
    return products.value
      .map(product => {
        const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
        return {
          ...product,
          total_stock: totalStock,
          total_value: totalStock * (product.unit_price || 0),
        };
      })
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 20);
  });

  // Products approaching expiry (for products with batch tracking)
  const productsApproachingExpiry = computed(() => {
    const expiringProducts: Array<{
      product: ProductWithStock;
      batch_number?: string;
      expiry_date: string;
      days_until_expiry: number;
    }> = [];

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    products.value.forEach(product => {
      if (product.requires_batch_tracking) {
        // This would need to be connected to batch data
        // For now, we'll check if the product has an expiry date field
        if (product.expiry_date) {
          const expiryDate = new Date(product.expiry_date);
          if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
            expiringProducts.push({
              product,
              expiry_date: product.expiry_date,
              days_until_expiry: daysUntilExpiry,
            });
          }
        }
      }
    });

    return expiringProducts.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
  });

  return {
    // Core inventory metrics
    totalStockValue,
    lowStockProducts,
    outOfStockProducts,
    stockStatusSummary,
    criticalStockAlerts,
    productsNeedingReorder,

    // Advanced metrics
    inventoryMetrics,
    topCategoriesByValue,
    topProductsByValue,
    productsApproachingExpiry,
  };
}