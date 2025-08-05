import type {
  Bestellijst,
  BestellijstItem,
  Product,
  ShoppingCart,
  ShoppingCartItem,
} from '@/types/supabase';

// Offline data synchronization types
export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retry_count: number;
  practice_id: string;
  user_id: string;
}

export interface OfflineData {
  bestellijsten: Bestellijst[];
  bestellijst_items: BestellijstItem[];
  products: Product[];
  shopping_carts: ShoppingCart[];
  shopping_cart_items: ShoppingCartItem[];
  last_sync: Date | null;
}

export interface SyncProgress {
  phase: 'downloading' | 'uploading' | 'complete' | 'error';
  table?: string;
  current: number;
  total: number;
  message?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export interface OfflineServiceConfig {
  syncInterval: number; // milliseconds
  maxRetries: number;
  enablePeriodicSync?: boolean;
}

export interface ActionSyncResult {
  success: boolean;
  action: OfflineAction;
  error?: string;
}

export interface ActionExecutor {
  execute(action: OfflineAction): Promise<ActionSyncResult>;
}