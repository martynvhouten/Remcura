// Camera and barcode scanner types
export interface ScanResult {
  code: string;
  format: string;
  timestamp: Date;
  confidence?: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface ScannerOptions {
  preferredCamera?: 'environment' | 'user';
  enableTorch?: boolean;
  scanInterval?: number;
  formats?: string[];
}
