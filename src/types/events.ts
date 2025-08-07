// Event bus and store events types
export type EventCallback<T = any> = (data: T) => void | Promise<void>;
export type EventUnsubscribe = () => void;

export interface StoreEvent {
  name: string;
  payload?: any;
  timestamp: Date;
}

export interface EventBusOptions {
  maxListeners?: number;
  captureRejections?: boolean;
}

export type StoreEventType =
  | 'user:logged_in'
  | 'user:logged_out'
  | 'products:loaded'
  | 'practice:changed';

export interface UserLoggedInPayload {
  user_id: string;
  practice_id?: string;
  role?: string;
}

export interface UserLoggedOutPayload {
  user_id: string;
}

export interface ProductsLoadedPayload {
  count: number;
  practice_id: string;
}
