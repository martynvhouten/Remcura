// Network monitoring types
export type NetworkStatus = 'online' | 'offline';

export interface NetworkEventListener {
  (status: NetworkStatus): void;
}