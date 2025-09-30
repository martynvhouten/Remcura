import { logger } from './logger';
import type {
  EventCallback,
  EventUnsubscribe,
  EventBusOptions,
} from '@/types/events';

export interface BaseStoreEvent<T = unknown> {
  type: string;
  source?: string;
  data?: T;
  timestamp?: string;
}

interface InternalEvent<T = unknown> extends BaseStoreEvent<T> {
  timestamp: string;
}

type ListenerMap = Map<string, Set<EventCallback<unknown>>>;

class EventBus {
  private listeners: ListenerMap = new Map();

  private options: EventBusOptions;

  private eventHistory: InternalEvent<unknown>[] = [];

  private readonly maxHistorySize: number;

  constructor(options: EventBusOptions = {}) {
    const defaultMaxListeners = 10;
    const defaultHistorySize = 100;

    this.options = {
      enableLogging: Boolean(import.meta.env.DEV),
      maxListeners: defaultMaxListeners,
      ...options,
    };

    this.maxHistorySize = defaultHistorySize;
  }

  on<T = unknown>(
    eventType: string,
    callback: EventCallback<T>
  ): EventUnsubscribe {
    const listeners = this.getOrCreateListeners<T>(eventType);

    if (listeners.size >= (this.options.maxListeners ?? 10)) {
      logger.warn(
        `Max listeners (${this.options.maxListeners}) reached for event: ${eventType}`
      );
    }

    listeners.add(callback as EventCallback<unknown>);

    if (this.options.enableLogging) {
      logger.debug(`Subscribed to event: ${eventType}`, 'EventBus');
    }

    return () => {
      listeners.delete(callback as EventCallback<unknown>);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }

      if (this.options.enableLogging) {
        logger.debug(`Unsubscribed from event: ${eventType}`, 'EventBus');
      }
    };
  }

  once<T = unknown>(
    eventType: string,
    callback: EventCallback<T>
  ): EventUnsubscribe {
    const unsubscribe = this.on<T>(eventType, async data => {
      unsubscribe();
      await callback(data);
    });
    return unsubscribe;
  }

  async emit<T = unknown>(
    eventType: string,
    data?: T,
    source = 'unknown'
  ): Promise<void> {
    const event: InternalEvent<T> = {
      type: eventType,
      source,
      data: data as T,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    if (this.options.enableLogging) {
      logger.debug(`Emitting event: ${eventType}`, 'EventBus', {
        source,
        data,
      });
    }

    const listeners = this.listeners.get(eventType) as
      | Set<EventCallback<T>>
      | undefined;
    if (!listeners || listeners.size === 0) {
      if (this.options.enableLogging) {
        logger.debug(`No listeners for event: ${eventType}`, 'EventBus');
      }
      return;
    }

    const promises: Promise<void>[] = [];
    listeners.forEach(callback => {
      try {
        const result = callback(data as T);
        if (result instanceof Promise) {
          promises.push(result.then(() => undefined));
        }
      } catch (error) {
        logger.error(`Error in event listener for ${eventType}:`, 'EventBus', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        logger.error(
          `Error in async event listeners for ${eventType}:`,
          'EventBus',
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    }
  }

  off(eventType: string): void {
    this.listeners.delete(eventType);
    if (this.options.enableLogging) {
      logger.debug(`Removed all listeners for event: ${eventType}`, 'EventBus');
    }
  }

  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
    if (this.options.enableLogging) {
      logger.debug('Cleared all event listeners', 'EventBus');
    }
  }

  getEventHistory<T = unknown>(eventType?: string): InternalEvent<T>[] {
    const events = eventType
      ? this.eventHistory.filter(event => event.type === eventType)
      : this.eventHistory;

    return events.map(event => ({
      ...event,
      data: event.data as T,
    }));
  }

  getListenersCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size ?? 0;
    }

    let total = 0;
    this.listeners.forEach(listenerSet => {
      total += listenerSet.size;
    });
    return total;
  }

  hasListeners(eventType: string): boolean {
    return (this.listeners.get(eventType)?.size ?? 0) > 0;
  }

  private getOrCreateListeners<T>(eventType: string): Set<EventCallback<T>> {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    return this.listeners.get(eventType) as Set<EventCallback<T>>;
  }
}

export const eventBus = new EventBus();

export const StoreEvents = {
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  USER_PROFILE_UPDATED: 'user:profile_updated',
  DATA_REFRESH_REQUESTED: 'data:refresh_requested',
  DATA_REFRESH_COMPLETED: 'data:refresh_completed',
  INVENTORY_SYNC_REQUESTED: 'inventory:sync_requested',
  INVENTORY_SYNC_COMPLETED: 'inventory:sync_completed',
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  PRODUCTS_UPDATED: 'products:updated',
  SUPPLIERS_UPDATED: 'suppliers:updated',
  INVENTORY_LEVELS_UPDATED: 'inventory:levels_updated',
  INVENTORY_ALERT_TRIGGERED: 'inventory:alert_triggered',
  ORDERS_SENT_TO_SUPPLIERS: 'orders:sent_to_suppliers',
} as const;

export const StoreEventsOrderLists = {
  ORDERS_CREATED_FROM_ADVICE: 'orderlists:orders_created_from_advice',
} as const;

export type StoreEventKey = keyof typeof StoreEvents;

export const createEventEmitter = (context: string) => ({
  on: <T = unknown>(
    event: StoreEventKey | string,
    callback: EventCallback<T>
  ) => eventBus.on(event, data => callback(data as T)),
  once: <T = unknown>(
    event: StoreEventKey | string,
    callback: EventCallback<T>
  ) => eventBus.once(event, data => callback(data as T)),
  emit: <T = unknown>(event: StoreEventKey | string, data?: T) =>
    eventBus.emit(event, data, context),
  off: (event: StoreEventKey | string) => eventBus.off(event),
});
