import { ref } from 'vue';

export type NetworkStatus = 'online' | 'offline';

export interface NetworkEventListener {
  (status: NetworkStatus): void;
}

export class NetworkMonitor {
  private status = ref<NetworkStatus>(navigator.onLine ? 'online' : 'offline');
  private listeners: Set<NetworkEventListener> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Get current network status
   */
  get isOnline(): boolean {
    return this.status.value === 'online';
  }

  /**
   * Get reactive network status
   */
  get networkStatus() {
    return this.status;
  }

  /**
   * Add listener for network status changes
   */
  addListener(listener: NetworkEventListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Setup native event listeners
   */
  private setupEventListeners(): void {
    const handleOnline = () => {
      this.status.value = 'online';
      this.notifyListeners('online');
    };

    const handleOffline = () => {
      this.status.value = 'offline';
      this.notifyListeners('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function (can be called manually if needed)
    this.cleanup = () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Cleanup event listeners
   */
  public cleanup = () => {
    // Will be overwritten in setupEventListeners
  };

  /**
   * Check actual network connectivity (beyond navigator.onLine)
   */
  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('/ping', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      // If custom ping endpoint fails, try a well-known endpoint
      try {
        await fetch('https://httpbin.org/status/200', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        return true;
      } catch {
        return false;
      }
    }
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
