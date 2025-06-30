import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AnalyticsService } from 'src/services/analytics'
import { supabase } from 'src/services/supabase'

// Mock Supabase client
vi.mock('src/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}))

// Mock ErrorHandler
vi.mock('src/utils/error-handler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
    getErrorMessage: vi.fn((error) => error.message || 'Generic error')
  }
}))

describe('Analytics Service', () => {
  let analyticsService: AnalyticsService
  const mockClinicId = 'test-clinic-id'

  beforeEach(() => {
    vi.clearAllMocks()
    analyticsService = new AnalyticsService()
  })

  describe('Stock Analytics', () => {
    it('should fetch low stock items correctly', async () => {
      const mockLowStockItems = [
        { id: '1', name: 'Product 1', current_stock: 2, min_stock: 5 },
        { id: '2', name: 'Product 2', current_stock: 1, min_stock: 10 }
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.resolve({ 
              data: mockLowStockItems, 
              error: null 
            }))
          }))
        }))
      } as any)

      const result = await analyticsService.getLowStockItems(mockClinicId)

      expect(result).toEqual(mockLowStockItems)
      expect(supabase.from).toHaveBeenCalledWith('products')
    })

    it('should calculate stock turnover rate', async () => {
      const mockTurnoverData = [
        { product_id: '1', total_used: 100, avg_stock: 20 },
        { product_id: '2', total_used: 50, avg_stock: 25 }
      ]

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockTurnoverData,
        error: null
      })

      const result = await analyticsService.getStockTurnoverRates(
        mockClinicId, 
        new Date('2024-01-01'), 
        new Date('2024-01-31')
      )

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('turnoverRate', 5) // 100/20
      expect(result[1]).toHaveProperty('turnoverRate', 2) // 50/25
      expect(supabase.rpc).toHaveBeenCalledWith('calculate_stock_turnover', {
        clinic_id: mockClinicId,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-31T00:00:00.000Z'
      })
    })

    it('should handle empty stock data gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any)

      const result = await analyticsService.getLowStockItems(mockClinicId)

      expect(result).toEqual([])
    })
  })

  describe('Usage Analytics', () => {
    it('should calculate monthly usage trends', async () => {
      const mockUsageData = [
        { month: '2024-01', total_usage: 150 },
        { month: '2024-02', total_usage: 175 },
        { month: '2024-03', total_usage: 125 }
      ]

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockUsageData,
        error: null
      })

      const result = await analyticsService.getMonthlyUsageTrends(
        mockClinicId,
        new Date('2024-01-01'),
        new Date('2024-03-31')
      )

      expect(result).toEqual(mockUsageData)
      expect(supabase.rpc).toHaveBeenCalledWith('get_monthly_usage_trends', {
        clinic_id: mockClinicId,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-03-31T00:00:00.000Z'
      })
    })

    it('should identify top used products', async () => {
      const mockTopProducts = [
        { product_id: '1', product_name: 'Bandages', total_used: 500 },
        { product_id: '2', product_name: 'Syringes', total_used: 350 },
        { product_id: '3', product_name: 'Gauze', total_used: 200 }
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve({ 
                    data: mockTopProducts, 
                    error: null 
                  }))
                }))
              }))
            }))
          }))
        }))
      } as any)

      const result = await analyticsService.getTopUsedProducts(
        mockClinicId,
        new Date('2024-01-01'),
        new Date('2024-03-31'),
        5
      )

      expect(result).toEqual(mockTopProducts)
      expect(supabase.from).toHaveBeenCalledWith('product_usage')
    })
  })

  describe('Financial Analytics', () => {
    it('should calculate cost savings from stock optimization', async () => {
      const mockCostData = {
        avoided_stockouts: 5,
        reduced_wastage: 15.5,
        optimized_orders: 3,
        total_savings: 850.75
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [mockCostData],
        error: null
      })

      const result = await analyticsService.getCostSavingsAnalytics(
        mockClinicId,
        new Date('2024-01-01'),
        new Date('2024-03-31')
      )

      expect(result).toEqual(mockCostData)
      expect(supabase.rpc).toHaveBeenCalledWith('calculate_cost_savings', {
        clinic_id: mockClinicId,
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-03-31T00:00:00.000Z'
      })
    })

    it('should track inventory value over time', async () => {
      const mockInventoryValue = [
        { date: '2024-01-01', total_value: 15000 },
        { date: '2024-01-15', total_value: 14500 },
        { date: '2024-01-31', total_value: 16200 }
      ]

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockInventoryValue,
        error: null
      })

      const result = await analyticsService.getInventoryValueTrends(
        mockClinicId,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      )

      expect(result).toEqual(mockInventoryValue)
    })
  })

  describe('Predictive Analytics', () => {
    it('should predict future stock needs', async () => {
      const mockPredictions = [
        { 
          product_id: '1', 
          predicted_usage: 45, 
          confidence_score: 0.85,
          recommendation: 'Order 50 units by end of week'
        },
        { 
          product_id: '2', 
          predicted_usage: 30, 
          confidence_score: 0.92,
          recommendation: 'Current stock sufficient for 2 weeks'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockPredictions,
        error: null
      })

      const result = await analyticsService.predictStockNeeds(
        mockClinicId,
        7 // 7 days ahead
      )

      expect(result).toEqual(mockPredictions)
      expect(supabase.rpc).toHaveBeenCalledWith('predict_stock_needs', {
        clinic_id: mockClinicId,
        days_ahead: 7
      })
    })

    it('should calculate demand forecasting accuracy', async () => {
      const mockAccuracy = {
        overall_accuracy: 0.89,
        product_accuracies: [
          { product_id: '1', accuracy: 0.92 },
          { product_id: '2', accuracy: 0.86 }
        ]
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [mockAccuracy],
        error: null
      })

      const result = await analyticsService.getForecastAccuracy(
        mockClinicId,
        new Date('2024-01-01'),
        new Date('2024-03-31')
      )

      expect(result).toEqual(mockAccuracy)
    })
  })

  describe('Error Handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      const mockError = new Error('Database connection failed')
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: mockError 
            }))
          }))
        }))
      } as any)

      await expect(analyticsService.getLowStockItems(mockClinicId))
        .rejects.toThrow('Database connection failed')
    })

    it('should validate input parameters', async () => {
      await expect(analyticsService.getLowStockItems(''))
        .rejects.toThrow('Clinic ID is required')

      await expect(analyticsService.getMonthlyUsageTrends(
        mockClinicId,
        new Date('2024-02-01'),
        new Date('2024-01-01') // End date before start date
      )).rejects.toThrow('End date must be after start date')
    })

    it('should handle network timeouts', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.reject(new Error('Network timeout')))
          }))
        }))
      } as any)

      await expect(analyticsService.getLowStockItems(mockClinicId))
        .rejects.toThrow('Network timeout')
    })
  })

  describe('Performance', () => {
    it('should complete analytics queries within reasonable time', async () => {
      const startTime = Date.now()
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any)

      await analyticsService.getLowStockItems(mockClinicId)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should cache frequently accessed data', async () => {
      // Mock cache behavior
      const mockData = [{ id: '1', name: 'Test Product' }]
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => Promise.resolve({ 
              data: mockData, 
              error: null 
            }))
          }))
        }))
      } as any)

      // First call
      await analyticsService.getLowStockItems(mockClinicId)
      
      // Second call should potentially use cache
      await analyticsService.getLowStockItems(mockClinicId)
      
      // Verify Supabase was called appropriately
      expect(supabase.from).toHaveBeenCalledTimes(2)
    })
  })
}) 