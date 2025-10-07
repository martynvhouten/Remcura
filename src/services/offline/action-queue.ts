import { ref } from 'vue';
import { ServiceErrorHandler } from 'src/utils/service-error-handler';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any; // Generic data holder for any table row
  timestamp: Date;
  retry_count: number;
  practice_id: string;
  user_id: string;
  priority?: number; // Lower numbers = higher priority
}

export interface ActionSyncResult {
  success: boolean;
  action: OfflineAction;
  error?: Error;
}

export interface ActionExecutor {
  (action: OfflineAction): Promise<void>;
}

export class ActionQueue {
  private actions = ref<OfflineAction[]>([]);
  private readonly maxRetries: number;
  private readonly storageKey = 'offline_actions';
  private executors: Map<string, ActionExecutor> = new Map();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
    this.loadFromStorage();
  }

  /**
   * Register an executor for a specific table
   */
  registerExecutor(table: string, executor: ActionExecutor): void {
    this.executors.set(table, executor);
  }

  /**
   * Add action to the queue
   */
  addAction(
    type: OfflineAction['type'],
    table: string,
    data: any, // Generic data holder for any table row
    practiceId: string,
    userId: string,
    priority = 5
  ): string {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: new Date(),
      retry_count: 0,
      practice_id: practiceId,
      user_id: userId,
      priority,
    };

    this.actions.value.push(action);
    this.sortActionsByPriority();
    this.saveToStorage();

    // Offline action added - debug logging removed
    return action.id;
  }

  /**
   * Get all actions
   */
  get allActions() {
    return this.actions.value;
  }

  /**
   * Get actions count
   */
  get count(): number {
    return this.actions.value.length;
  }

  /**
   * Get failed actions (those that have reached max retries)
   */
  get failedActions(): OfflineAction[] {
    return this.actions.value.filter(
      action => action.retry_count >= this.maxRetries
    );
  }

  /**
   * Get pending actions (those that haven't reached max retries)
   */
  get pendingActions(): OfflineAction[] {
    return this.actions.value.filter(
      action => action.retry_count < this.maxRetries
    );
  }

  /**
   * Execute all pending actions
   */
  async executeAll(): Promise<ActionSyncResult[]> {
    const results: ActionSyncResult[] = [];
    const actionsToProcess = [...this.pendingActions];

    for (const action of actionsToProcess) {
      const result = await this.executeAction(action);
      results.push(result);

      if (result.success) {
        this.removeAction(action.id);
      } else {
        this.incrementRetryCount(action.id);
      }
    }

    this.saveToStorage();
    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: OfflineAction
  ): Promise<ActionSyncResult> {
    const executor = this.executors.get(action.table);

    if (!executor) {
      const error = new Error(
        `No executor registered for action type: ${action.type}`
      );
      ServiceErrorHandler.handle(
        error,
        {
          service: 'ActionQueue',
          operation: 'executeAction',
          practiceId: action.practice_id,
          userId: action.user_id,
          metadata: { actionId: action.id, table: action.table },
        },
        { rethrow: false }
      );

      return {
        success: false,
        action,
        error,
      };
    }

    try {
      await executor(action);
      return {
        success: true,
        action,
      };
    } catch (error) {
      ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'ActionQueue',
          operation: 'executeAction',
          practiceId: action.practice_id,
          userId: action.user_id,
          metadata: {
            actionId: action.id,
            table: action.table,
            retryCount: action.retry_count,
          },
        },
        { rethrow: false }
      );

      return {
        success: false,
        action,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Remove action from queue
   */
  removeAction(actionId: string): boolean {
    const index = this.actions.value.findIndex(
      action => action.id === actionId
    );
    if (index !== -1) {
      this.actions.value.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Increment retry count for an action
   */
  private incrementRetryCount(actionId: string): void {
    const action = this.actions.value.find(a => a.id === actionId);
    if (action) {
      action.retry_count++;

      // If max retries reached, log it
      if (action.retry_count >= this.maxRetries) {
        console.error('Max retries reached for action:', action);
        ServiceErrorHandler.handle(
          new Error(`Action failed after ${this.maxRetries} retries`),
          {
            service: 'ActionQueue',
            operation: 'incrementRetryCount',
            practiceId: action.practice_id,
            userId: action.user_id,
            metadata: { actionId: action.id, table: action.table },
          },
          { rethrow: false, logLevel: 'warn' }
        );
      }
    }
  }

  /**
   * Clear all actions
   */
  clear(): void {
    this.actions.value = [];
    this.saveToStorage();
  }

  /**
   * Clear failed actions only
   */
  clearFailed(): void {
    this.actions.value = this.actions.value.filter(
      action => action.retry_count < this.maxRetries
    );
    this.saveToStorage();
  }

  /**
   * Retry a specific action
   */
  retryAction(actionId: string): void {
    const action = this.actions.value.find(a => a.id === actionId);
    if (action) {
      action.retry_count = 0;
      this.saveToStorage();
    }
  }

  /**
   * Sort actions by priority (lower number = higher priority)
   */
  private sortActionsByPriority(): void {
    this.actions.value.sort((a, b) => {
      const priorityA = a.priority || 5;
      const priorityB = b.priority || 5;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort by timestamp (older first)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  /**
   * Save actions to localStorage
   */
  private saveToStorage(): void {
    try {
      const serializedActions = this.actions.value.map(action => ({
        ...action,
        timestamp: action.timestamp.toISOString(),
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(serializedActions));
    } catch (error) {
      console.error('Failed to save actions to storage:', error);
    }
  }

  /**
   * Load actions from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        // boundary: external data from localStorage (JSON.parse)
        const parsedActions = JSON.parse(stored);
        this.actions.value = parsedActions.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
        this.sortActionsByPriority();
      }
    } catch (error) {
      console.error('Failed to load actions from storage:', error);
      this.actions.value = [];
    }
  }
}

// Export singleton instance
export const actionQueue = new ActionQueue();
