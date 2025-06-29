import { supabase } from '@/services/supabase'
import type { UsageAnalytics, UsageAnalyticsInsert, AnalyticsEvent } from '@/types/supabase'
import { useAuthStore } from '@/stores/auth'

export class AnalyticsService {
  private sessionId: string = crypto.randomUUID()
  private eventQueue: AnalyticsEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor() {
    // Auto-flush events every 30 seconds
    this.startAutoFlush()
  }

  /**
   * Track user event
   */
  async trackEvent(eventType: string, eventData?: any, location_id?: string): Promise<void> {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id
    const userId = authStore.user?.id

    if (!practiceId) return

    const event: AnalyticsEvent = {
      type: eventType,
      data: eventData || {},
      timestamp: new Date().toISOString(),
      user_id: userId,
      practice_id: practiceId,
      location_id
    }

    // Add to queue for batch processing
    this.eventQueue.push(event)

    // If queue is full, flush immediately
    if (this.eventQueue.length >= 10) {
      await this.flushEvents()
    }
  }

  /**
   * Flush queued events to database
   */
  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      const analyticsData: UsageAnalyticsInsert[] = events.map(event => ({
        practice_id: event.practice_id,
        user_id: event.user_id,
        location_id: event.location_id,
        event_type: event.type,
        event_data: event.data,
        session_id: this.sessionId,
        ip_address: null, // Would be set by server
        user_agent: navigator.userAgent
      }))

      const { error } = await supabase
        .from('usage_analytics')
        .insert(analyticsData)

      if (error) {
        console.error('Failed to flush analytics events:', error)
        // Re-add failed events to queue for retry
        this.eventQueue.unshift(...events)
      }
    } catch (error) {
      console.error('Analytics flush error:', error)
      // Re-add failed events to queue for retry
      this.eventQueue.unshift(...events)
    }
  }

  /**
   * Get usage statistics for practice
   */
  async getUsageStats(filters?: {
    date_from?: string
    date_to?: string
    event_type?: string
    user_id?: string
    location_id?: string
  }) {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id

    if (!practiceId) {
      throw new Error('No practice selected')
    }

    let query = supabase
      .from('usage_analytics')
      .select('*')
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type)
    }
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters?.location_id) {
      query = query.eq('location_id', filters.location_id)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get usage stats: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get event summary statistics
   */
  async getEventSummary(dateRange?: { from: string; to: string }) {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id

    if (!practiceId) {
      throw new Error('No practice selected')
    }

    // Get aggregated statistics
    const filters = {
      date_from: dateRange?.from,
      date_to: dateRange?.to
    }
    
    const events = await this.getUsageStats(filters)

    // Group by event type
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by user
    const userActivity = events.reduce((acc, event) => {
      if (event.user_id) {
        acc[event.user_id] = (acc[event.user_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Group by day
    const dailyActivity = events.reduce((acc, event) => {
      const date = new Date(event.created_at).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalEvents: events.length,
      eventTypes: eventCounts,
      userActivity,
      dailyActivity,
      topEvents: Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    }
  }

  /**
   * Get product usage patterns
   */
  async getProductUsagePatterns(productId?: string) {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id

    if (!practiceId) {
      throw new Error('No practice selected')
    }

    const events = await this.getUsageStats({
      event_type: 'product_updated'
    })

    const productUpdates = events.filter(event => 
      !productId || event.event_data?.product_id === productId
    )

    // Analyze patterns
    const patterns = {
      totalUpdates: productUpdates.length,
      updateFrequency: this.calculateUpdateFrequency(productUpdates),
      peakUpdateTimes: this.calculatePeakTimes(productUpdates),
      averageStockLevels: this.calculateAverageStockLevels(productUpdates)
    }

    return patterns
  }

  /**
   * Get order patterns analysis
   */
  async getOrderPatterns() {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id

    if (!practiceId) {
      throw new Error('No practice selected')
    }

    const orderEvents = await this.getUsageStats({
      event_type: 'order_created'
    })

    const patterns = {
      totalOrders: orderEvents.length,
      orderFrequency: this.calculateOrderFrequency(orderEvents),
      averageOrderSize: this.calculateAverageOrderSize(orderEvents),
      seasonalTrends: this.calculateSeasonalTrends(orderEvents)
    }

    return patterns
  }

  /**
   * Get user activity metrics
   */
  async getUserActivityMetrics(userId?: string) {
    const authStore = useAuthStore()
    const practiceId = authStore.selectedPractice?.id

    if (!practiceId) {
      throw new Error('No practice selected')
    }

    const events = await this.getUsageStats({ user_id: userId })

    const metrics = {
      totalActivities: events.length,
      activityTypes: this.groupByEventType(events),
      lastActivity: events[0]?.created_at,
      averageSessionDuration: this.calculateAverageSessionDuration(events),
      peakActivityHours: this.calculatePeakActivityHours(events)
    }

    return metrics
  }

  /**
   * Track specific bestellijst events
   */
  async trackBestellijstEvent(action: string, bestellijstId: string, data?: any) {
    await this.trackEvent('bestellijst_action', {
      action,
      bestellijst_id: bestellijstId,
      ...data
    })
  }

  /**
   * Track product scanning events
   */
  async trackScanEvent(productId: string, scanType: 'barcode' | 'manual', data?: any) {
    await this.trackEvent('product_scanned', {
      product_id: productId,
      scan_type: scanType,
      ...data
    })
  }

  /**
   * Track export events
   */
  async trackExportEvent(exportType: string, format: string, data?: any) {
    await this.trackEvent('export_generated', {
      export_type: exportType,
      format,
      ...data
    })
  }

  // Helper methods for calculations
  private calculateUpdateFrequency(events: UsageAnalytics[]) {
    if (events.length === 0) return 0
    
    const firstEvent = new Date(events[events.length - 1].created_at)
    const lastEvent = new Date(events[0].created_at)
    const daysDiff = Math.max(1, (lastEvent.getTime() - firstEvent.getTime()) / (1000 * 60 * 60 * 24))
    
    return events.length / daysDiff
  }

  private calculatePeakTimes(events: UsageAnalytics[]) {
    const hourCounts = events.reduce((acc, event) => {
      const hour = new Date(event.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }

  private calculateAverageStockLevels(events: UsageAnalytics[]) {
    const stockLevels = events
      .map(event => event.event_data?.new_stock || 0)
      .filter(level => level > 0)

    if (stockLevels.length === 0) return 0
    
    return stockLevels.reduce((sum, level) => sum + level, 0) / stockLevels.length
  }

  private calculateOrderFrequency(events: UsageAnalytics[]) {
    return this.calculateUpdateFrequency(events)
  }

  private calculateAverageOrderSize(events: UsageAnalytics[]) {
    const orderSizes = events
      .map(event => event.event_data?.total_items || 0)
      .filter(size => size > 0)

    if (orderSizes.length === 0) return 0
    
    return orderSizes.reduce((sum, size) => sum + size, 0) / orderSizes.length
  }

  private calculateSeasonalTrends(events: UsageAnalytics[]) {
    const monthCounts = events.reduce((acc, event) => {
      const month = new Date(event.created_at).getMonth()
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month: parseInt(month), count }))
      .sort((a, b) => a.month - b.month)
  }

  private groupByEventType(events: UsageAnalytics[]) {
    return events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private calculateAverageSessionDuration(events: UsageAnalytics[]) {
    const sessions = events.reduce((acc, event) => {
      if (event.session_id) {
        if (!acc[event.session_id]) {
          acc[event.session_id] = { start: event.created_at, end: event.created_at }
        } else {
          if (event.created_at > acc[event.session_id].end) {
            acc[event.session_id].end = event.created_at
          }
          if (event.created_at < acc[event.session_id].start) {
            acc[event.session_id].start = event.created_at
          }
        }
      }
      return acc
    }, {} as Record<string, { start: string; end: string }>)

    const durations = Object.values(sessions).map(session => 
      new Date(session.end).getTime() - new Date(session.start).getTime()
    )

    if (durations.length === 0) return 0
    
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000 / 60 // minutes
  }

  private calculatePeakActivityHours(events: UsageAnalytics[]) {
    return this.calculatePeakTimes(events)
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flushEvents()
    }, 30000) // 30 seconds
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flushEvents() // Final flush
  }
}

export const analyticsService = new AnalyticsService() 