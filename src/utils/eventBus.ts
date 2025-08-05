import { reactive } from 'vue';
import { logger } from './logger';
import type { EventCallback, EventUnsubscribe, StoreEvent, EventBusOptions } from '@/types/events';

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();
  private options: EventBusOptions;
  private eventHistory: StoreEvent[] = [];
  private maxHistorySize = 100;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableLogging: import.meta.env.DEV,
      maxListeners: 10,
      ...options,
    };
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(eventType: string, callback: EventCallback<T>): EventUnsubscribe {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const eventListeners = this.listeners.get(eventType)!;
    
    // Check max listeners limit
    if (eventListeners.size >= (this.options.maxListeners || 10)) {
      logger.warn(`Max listeners (${this.options.maxListeners}) reached for event: ${eventType}`);
    }

    eventListeners.add(callback);

    if (this.options.enableLogging) {
      logger.debug(`Subscribed to event: ${eventType}`, 'EventBus');
    }

    // Return unsubscribe function
    return () => {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
      
      if (this.options.enableLogging) {
        logger.debug(`Unsubscribed from event: ${eventType}`, 'EventBus');
      }
    };
  }

  /**
   * Subscribe to an event only once
   */
  once<T = any>(eventType: string, callback: EventCallback<T>): EventUnsubscribe {
    const unsubscribe = this.on(eventType, async (data: T) => {
      unsubscribe();
      await callback(data);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  async emit<T = any>(eventType: string, data?: T, source = 'unknown'): Promise<void> {
    const event: StoreEvent = {
      type: eventType,
      source,
      data,
      timestamp: new Date().toISOString(),
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    if (this.options.enableLogging) {
      logger.debug(`Emitting event: ${eventType}`, 'EventBus', { source, data });
    }

    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.size === 0) {
      if (this.options.enableLogging) {
        logger.debug(`No listeners for event: ${eventType}`, 'EventBus');
      }
      return;
    }

    // Execute all listeners
    const promises: Promise<void>[] = [];
    listeners.forEach(callback => {
      try {
        const result = callback(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        logger.error(`Error in event listener for ${eventType}:`, error);
      }
    });

    // Wait for all async listeners to complete
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        logger.error(`Error in async event listeners for ${eventType}:`, error);
      }
    }
  }

  /**
   * Remove all listeners for an event type
   */
  off(eventType: string): void {
    this.listeners.delete(eventType);
    if (this.options.enableLogging) {
      logger.debug(`Removed all listeners for event: ${eventType}`, 'EventBus');
    }
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
    if (this.options.enableLogging) {
      logger.debug('Cleared all event listeners', 'EventBus');
    }
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(eventType?: string): StoreEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Get active listeners count
   */
  getListenersCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }

  /**
   * Check if there are listeners for an event
   */
  hasListeners(eventType: string): boolean {
    return (this.listeners.get(eventType)?.size || 0) > 0;
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Common store events
export const StoreEvents = {
  // Authentication events
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  USER_PROFILE_UPDATED: 'user:profile_updated',
  
  // Data refresh events
  DATA_REFRESH_REQUESTED: 'data:refresh_requested',
  DATA_REFRESH_COMPLETED: 'data:refresh_completed',
  
  // Product events
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCTS_LOADED: 'products:loaded',
  
  // Inventory events
  STOCK_UPDATED: 'stock:updated',
  STOCK_TRANSFER: 'stock:transfer',
  LOW_STOCK_ALERT: 'stock:low_stock_alert',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Order List events (advanced min/max system)
  ORDER_LIST_CREATED: 'order_list:created',
  ORDER_LIST_UPDATED: 'order_list:updated',
  ORDER_LIST_DELETED: 'order_list:deleted',
  ORDER_SUGGESTIONS_UPDATED: 'order_list:suggestions_updated',
  ORDERS_CREATED_FROM_ADVICE: 'order_list:orders_created_from_advice',
  ORDER_SPLIT_COMPLETED: 'order_list:split_completed',
  ORDERS_SENT_TO_SUPPLIERS: 'order_list:sent_to_suppliers',
  STOCK_LEVEL_UPDATED: 'order_list:stock_level_updated',
  
  // Supplier events
  SUPPLIER_CREATED: 'supplier:created',
  SUPPLIER_UPDATED: 'supplier:updated',
  
  // System events
  PRACTICE_CHANGED: 'system:practice_changed',
  OFFLINE_MODE_CHANGED: 'system:offline_mode_changed',
  ERROR_OCCURRED: 'system:error_occurred',
} as const;

// Type for store event types
export type StoreEventType = typeof StoreEvents[keyof typeof StoreEvents];

// Type-safe event payload interfaces
export interface UserLoggedInPayload {
  user: { id: string; email?: string } | null;
  profile: { clinic_id?: string } | null;
  clinicId: string | null;
}

export interface UserLoggedOutPayload {
  timestamp: string;
}

export interface ProductsLoadedPayload {
  practiceId: string;
  productCount: number;
  timestamp: string;
}

// Helper function to create typed event emitters
export function createEventEmitter<T = any>(source: string) {
  return {
    emit: (eventType: string, data?: T) => eventBus.emit(eventType, data, source),
    on: <U = T>(eventType: string, callback: EventCallback<U>) => eventBus.on(eventType, callback),
    once: <U = T>(eventType: string, callback: EventCallback<U>) => eventBus.once(eventType, callback),
    off: (eventType: string) => eventBus.off(eventType),
  };
}

export default eventBus;