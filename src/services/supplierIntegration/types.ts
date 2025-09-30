export type SupplierOrderDispatchResponse = {
  success: boolean;
  error?: string;
  response?: {
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  trackingInfo?: Record<string, unknown>;
};
