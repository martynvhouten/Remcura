import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

// Stock status types
export type StockStatus = 'out-of-stock' | 'low-stock' | 'in-stock' | 'high-stock'
export type StockColor = 'negative' | 'warning' | 'positive' | 'info'

// Stock threshold interface
export interface StockThresholds {
  minimum: number
  maximum?: number
  critical?: number // Optional critical threshold (below minimum)
}

// Stock info interface
export interface StockInfo {
  current: number
  minimum: number
  maximum?: number
  status: StockStatus
  color: StockColor
  label: string
  icon: string
  isLow: boolean
  isOut: boolean
  isCritical: boolean
  reorderSuggestion: number
}

/**
 * Composable for stock status logic
 * Centralizes all stock-related calculations and formatting
 */
export const useStockStatus = () => {
  const { t } = useI18n()

  /**
   * Determine stock status based on current and minimum levels
   */
  const getStockStatus = (currentStock: number, minimumStock: number, maximumStock?: number): StockStatus => {
    if (currentStock === 0) return 'out-of-stock'
    if (currentStock <= minimumStock) return 'low-stock'
    if (maximumStock && currentStock >= maximumStock) return 'high-stock'
    return 'in-stock'
  }

  /**
   * Get color based on stock status
   */
  const getStockColor = (status: StockStatus): StockColor => {
    const colorMap: Record<StockStatus, StockColor> = {
      'out-of-stock': 'negative',
      'low-stock': 'warning',
      'in-stock': 'positive',
      'high-stock': 'info'
    }
    return colorMap[status]
  }

  /**
   * Get icon based on stock status
   */
  const getStockIcon = (status: StockStatus): string => {
    const iconMap: Record<StockStatus, string> = {
      'out-of-stock': 'error',
      'low-stock': 'warning',
      'in-stock': 'check_circle',
      'high-stock': 'trending_up'
    }
    return iconMap[status]
  }

  /**
   * Get translated label for stock status
   */
  const getStockLabel = (status: StockStatus): string => {
    const labelMap: Record<StockStatus, string> = {
      'out-of-stock': t('products.outOfStock') || 'Out of Stock',
      'low-stock': t('products.lowStock') || 'Low Stock',
      'in-stock': t('products.inStock') || 'In Stock',
      'high-stock': t('products.highStock') || 'High Stock'
    }
    return labelMap[status]
  }

  /**
   * Calculate reorder suggestion
   */
  const getReorderSuggestion = (currentStock: number, minimumStock: number, maximumStock?: number): number => {
    if (currentStock > minimumStock) return 0
    
    const targetStock = maximumStock || minimumStock * 2
    return Math.max(0, targetStock - currentStock)
  }

  /**
   * Check if stock is critically low (at or below critical threshold)
   */
  const isCriticalStock = (currentStock: number, minimumStock: number, criticalThreshold?: number): boolean => {
    const threshold = criticalThreshold || Math.max(1, Math.floor(minimumStock * 0.5))
    return currentStock <= threshold
  }

  /**
   * Get comprehensive stock information
   */
  const getStockInfo = (
    currentStock: number,
    minimumStock: number,
    maximumStock?: number,
    criticalThreshold?: number
  ): StockInfo => {
    const status = getStockStatus(currentStock, minimumStock, maximumStock)
    const color = getStockColor(status)
    const label = getStockLabel(status)
    const icon = getStockIcon(status)
    const reorderSuggestion = getReorderSuggestion(currentStock, minimumStock, maximumStock)
    
    return {
      current: currentStock,
      minimum: minimumStock,
      maximum: maximumStock,
      status,
      color,
      label,
      icon,
      isLow: status === 'low-stock',
      isOut: status === 'out-of-stock',
      isCritical: isCriticalStock(currentStock, minimumStock, criticalThreshold),
      reorderSuggestion
    }
  }

  /**
   * Create reactive stock info
   */
  const createStockInfo = (
    currentStock: ComputedRef<number> | number,
    minimumStock: ComputedRef<number> | number,
    maximumStock?: ComputedRef<number | undefined> | number,
    criticalThreshold?: ComputedRef<number | undefined> | number
  ): ComputedRef<StockInfo> => {
    return computed(() => {
      const current = typeof currentStock === 'number' ? currentStock : currentStock.value
      const minimum = typeof minimumStock === 'number' ? minimumStock : minimumStock.value
      const maximum = typeof maximumStock === 'number' ? maximumStock : maximumStock?.value
      const critical = typeof criticalThreshold === 'number' ? criticalThreshold : criticalThreshold?.value
      
      return getStockInfo(current, minimum, maximum, critical)
    })
  }

  /**
   * Format stock numbers for display
   */
  const formatStockNumber = (stock: number): string => {
    if (stock >= 1000000) {
      return (stock / 1000000).toFixed(1) + 'M'
    } else if (stock >= 1000) {
      return (stock / 1000).toFixed(1) + 'K'
    }
    return stock.toLocaleString()
  }

  /**
   * Get stock percentage (current vs maximum)
   */
  const getStockPercentage = (currentStock: number, maximumStock: number): number => {
    if (maximumStock === 0) return 0
    return Math.min(100, Math.round((currentStock / maximumStock) * 100))
  }

  /**
   * Check if item needs reordering
   */
  const needsReorder = (currentStock: number, minimumStock: number): boolean => {
    return currentStock <= minimumStock
  }

  /**
   * Get urgency level (0-3, where 3 is most urgent)
   */
  const getUrgencyLevel = (currentStock: number, minimumStock: number): number => {
    if (currentStock === 0) return 3 // Critical - out of stock
    if (currentStock <= minimumStock * 0.25) return 2 // High urgency
    if (currentStock <= minimumStock * 0.5) return 1 // Medium urgency
    return 0 // No urgency
  }

  /**
   * Get stock trend based on historical data (placeholder for future implementation)
   */
  const getStockTrend = (currentStock: number, previousStock?: number): 'up' | 'down' | 'stable' => {
    if (!previousStock) return 'stable'
    if (currentStock > previousStock) return 'up'
    if (currentStock < previousStock) return 'down'
    return 'stable'
  }

  /**
   * Filter products by stock status
   */
  const filterByStockStatus = <T extends { current_stock?: number; minimum_stock?: number }>(
    items: T[],
    status: StockStatus | StockStatus[]
  ): T[] => {
    const statusArray = Array.isArray(status) ? status : [status]
    
    return items.filter(item => {
      if (!item.current_stock !== undefined || !item.minimum_stock !== undefined) return false
      
      const itemStatus = getStockStatus(
        item.current_stock || 0,
        item.minimum_stock || 0
      )
      
      return statusArray.includes(itemStatus)
    })
  }

  /**
   * Get stock summary for a collection of items
   */
  const getStockSummary = <T extends { current_stock?: number; minimum_stock?: number }>(
    items: T[]
  ) => {
    const total = items.length
    const outOfStock = items.filter(item => 
      getStockStatus(item.current_stock || 0, item.minimum_stock || 0) === 'out-of-stock'
    ).length
    const lowStock = items.filter(item => 
      getStockStatus(item.current_stock || 0, item.minimum_stock || 0) === 'low-stock'
    ).length
    const inStock = items.filter(item => 
      getStockStatus(item.current_stock || 0, item.minimum_stock || 0) === 'in-stock'
    ).length
    const highStock = items.filter(item => 
      getStockStatus(item.current_stock || 0, item.minimum_stock || 0) === 'high-stock'
    ).length

    return {
      total,
      outOfStock,
      lowStock,
      inStock,
      highStock,
      needsAttention: outOfStock + lowStock,
      percentageInStock: total > 0 ? Math.round((inStock / total) * 100) : 0
    }
  }

  return {
    // Core functions
    getStockStatus,
    getStockColor,
    getStockIcon,
    getStockLabel,
    getStockInfo,
    createStockInfo,
    
    // Calculations
    getReorderSuggestion,
    isCriticalStock,
    needsReorder,
    getUrgencyLevel,
    getStockPercentage,
    getStockTrend,
    
    // Formatting
    formatStockNumber,
    
    // Filtering and aggregation
    filterByStockStatus,
    getStockSummary
  }
}

// Export types for use in components
export type UseStockStatus = ReturnType<typeof useStockStatus> 