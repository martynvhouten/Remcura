import { computed, type Ref } from 'vue';
import type { ProductWithStock, StockAlert } from '@/types/inventory';

const calculateTotalStock = (product: ProductWithStock): number =>
  product.stockLevels?.reduce((sum, level) => sum + level.currentQuantity, 0) ??
  0;

const resolveMinimumStock = (product: ProductWithStock): number =>
  product.minimumStock ?? 0;

export function useProductsInventory(products: Ref<ProductWithStock[]>) {
  const totalStockValue = computed(() =>
    products.value.reduce((total, product) => {
      const productValue =
        product.stockLevels?.reduce((sum, level) => {
          return sum + level.currentQuantity * (product.unitPrice ?? 0);
        }, 0) ?? 0;
      return total + productValue;
    }, 0)
  );

  const lowStockProducts = computed(() =>
    products.value.filter(product => {
      const totalStock = calculateTotalStock(product);
      const minStock = resolveMinimumStock(product);
      return totalStock > 0 && totalStock <= minStock;
    })
  );

  const outOfStockProducts = computed(() =>
    products.value.filter(product => calculateTotalStock(product) <= 0)
  );

  const stockStatusSummary = computed(() => {
    const summary = {
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      total_products: products.value.length,
      total_value: totalStockValue.value,
    };

    products.value.forEach(product => {
      const totalStock = calculateTotalStock(product);
      const minStock = resolveMinimumStock(product);

      if (totalStock <= 0) {
        summary.out_of_stock += 1;
      } else if (totalStock <= minStock) {
        summary.low_stock += 1;
      } else {
        summary.in_stock += 1;
      }
    });

    return summary;
  });

  const criticalStockAlerts = computed((): StockAlert[] => {
    const alerts: StockAlert[] = [];

    products.value.forEach(product => {
      product.stockLevels?.forEach(stockLevel => {
        const currentStock = stockLevel.currentQuantity ?? 0;
        const minimumStock =
          stockLevel.minimumQuantity ?? product.minimumStock ?? 0;

        if (currentStock <= 0) {
          alerts.push({
            id: `${product.id}-${stockLevel.locationId}`,
            type: 'out_of_stock',
            severity: 'critical',
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            location_id: stockLevel.locationId,
            location_name: stockLevel.locationName ?? 'Unknown Location',
            current_stock: currentStock,
            minimum_stock: minimumStock,
            message: `${product.name} is out of stock`,
            created_at: new Date().toISOString(),
          });
        } else if (currentStock <= minimumStock) {
          alerts.push({
            id: `${product.id}-${stockLevel.locationId}`,
            type: 'low_stock',
            severity: 'warning',
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            location_id: stockLevel.locationId,
            location_name: stockLevel.locationName ?? 'Unknown Location',
            current_stock: currentStock,
            minimum_stock: minimumStock,
            message: `${product.name} is running low (${currentStock} remaining)`,
            created_at: new Date().toISOString(),
          });
        }
      });
    });

    return alerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      return a.current_stock - b.current_stock;
    });
  });

  const productsNeedingReorder = computed(() =>
    products.value.filter(product => {
      const totalStock = calculateTotalStock(product);
      const reorderLevel = product.reorderLevel ?? product.minimumStock ?? 0;
      return totalStock <= reorderLevel;
    })
  );

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

    metrics.averageStockValue =
      metrics.totalProducts > 0
        ? metrics.totalStockValue / metrics.totalProducts
        : 0;

    products.value.forEach(product => {
      const totalStock = calculateTotalStock(product);
      const productValue = totalStock * (product.unitPrice ?? 0);
      const minStock = resolveMinimumStock(product);

      if (totalStock <= 0) {
        metrics.stockDistribution.out_of_stock += 1;
      } else if (totalStock <= minStock) {
        metrics.stockDistribution.low_stock += 1;
      } else {
        metrics.stockDistribution.in_stock += 1;
      }

      if (product.category) {
        const currentCategoryValue =
          metrics.categoryBreakdown.get(product.category) ?? 0;
        metrics.categoryBreakdown.set(
          product.category,
          currentCategoryValue + productValue
        );
      }

      if (product.supplier?.name) {
        const currentSupplierValue =
          metrics.supplierBreakdown.get(product.supplier.name) ?? 0;
        metrics.supplierBreakdown.set(
          product.supplier.name,
          currentSupplierValue + productValue
        );
      }
    });

    return metrics;
  });

  const topCategoriesByValue = computed(() => {
    const categoryMap = new Map<
      string,
      { name: string; value: number; count: number }
    >();

    products.value.forEach(product => {
      if (product.category) {
        const totalStock = calculateTotalStock(product);
        const productValue = totalStock * (product.unitPrice ?? 0);

        const existing = categoryMap.get(product.category) ?? {
          name: product.category,
          value: 0,
          count: 0,
        };
        existing.value += productValue;
        existing.count += 1;
        categoryMap.set(product.category, existing);
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  });

  const topProductsByValue = computed(() =>
    products.value
      .map(product => {
        const totalStock = calculateTotalStock(product);
        const productValue = totalStock * (product.unitPrice ?? 0);

        return {
          id: product.id,
          name: product.name,
          value: productValue,
          sku: product.sku,
          category: product.category,
        };
      })
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 20)
  );

  const productsApproachingExpiry = computed(() => {
    const expiringProducts: Array<{
      product: ProductWithStock;
      batch_number?: string;
      expiry_date: string;
      days_until_expiry: number;
    }> = [];

    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    products.value.forEach(product => {
      if (!product.batches?.length && !product.expiry_date) {
        return;
      }

      product.batches?.forEach(batch => {
        const expiryDate = new Date(batch.expiry_date);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          expiringProducts.push({
            product,
            batch_number: batch.batch_number,
            expiry_date: batch.expiry_date,
            days_until_expiry: daysUntilExpiry,
          });
        }
      });

      if (product.expiry_date) {
        const directExpiry = new Date(product.expiry_date);
        if (directExpiry <= thirtyDaysFromNow && directExpiry >= today) {
          const daysUntilExpiry = Math.ceil(
            (directExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          expiringProducts.push({
            product,
            expiry_date: product.expiry_date,
            days_until_expiry: daysUntilExpiry,
          });
        }
      }
    });

    return expiringProducts.sort(
      (a, b) => a.days_until_expiry - b.days_until_expiry
    );
  });

  return {
    totalStockValue,
    lowStockProducts,
    outOfStockProducts,
    stockStatusSummary,
    criticalStockAlerts,
    productsNeedingReorder,
    inventoryMetrics,
    topCategoriesByValue,
    topProductsByValue,
    productsApproachingExpiry,
  };
}
