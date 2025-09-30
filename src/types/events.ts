// Event bus and store events types
export interface StoreEvent<T = unknown> {
  type: string;
  payload?: T;
  timestamp: string;
}

export type EventCallback<T = unknown> = (payload: T) => void | Promise<void>;

export type EventUnsubscribe = () => void;

export interface EventBusOptions {
  enableLogging?: boolean;
  maxListeners?: number;
}

export type StoreEventType =
  | 'user:logged_in'
  | 'user:logged_out'
  | 'products:loaded'
  | 'practice:changed'
  | string;

export interface UserLoggedInPayload {
  user_id: string;
  clinicId?: string;
  role?: string;
}

export interface UserLoggedOutPayload {
  user_id: string;
}

export interface ProductsLoadedPayload {
  practiceId: string;
  productCount: number;
  timestamp: string;
}
