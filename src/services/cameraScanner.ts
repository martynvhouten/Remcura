import { ref, reactive } from "vue";
import { analyticsService } from "./analytics";

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
  facingMode?: "user" | "environment";
  deviceId?: string;
  width?: number;
  height?: number;
  focusMode?: "auto" | "manual";
  torch?: boolean;
}

export class CameraScannerService {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isScanning = ref(false);
  private lastScanTime = 0;
  private scanCooldown = 1000; // 1 second between scans
  private availableDevices = ref<CameraDevice[]>([]);
  private currentDevice = ref<CameraDevice | null>(null);
  private scanHistory = ref<ScanResult[]>([]);

  constructor() {
    this.loadScanHistory();
  }

  /**
   * Get available camera devices
   */
  async getAvailableDevices(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      this.availableDevices.value = cameras.map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.substr(0, 8)}`,
        kind: device.kind,
      }));

      return this.availableDevices.value;
    } catch (error) {
      console.error("Failed to get camera devices:", error);
      throw new Error("Unable to access camera devices");
    }
  }

  /**
   * Start camera scanning
   */
  async startScanning(
    videoElement: HTMLVideoElement,
    options: ScannerOptions = {}
  ): Promise<void> {
    this.videoElement = videoElement;

    try {
      // Request camera permission
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || "environment",
          width: options.width || { ideal: 1280 },
          height: options.height || { ideal: 720 },
          deviceId: options.deviceId ? { exact: options.deviceId } : undefined,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;

      await this.videoElement.play();
      this.isScanning.value = true;

      // Start the scanning loop
      this.scanLoop();

      console.log("Camera scanning started");
    } catch (error) {
      console.error("Failed to start camera:", error);
      throw new Error("Unable to start camera scanning");
    }
  }

  /**
   * Stop camera scanning
   */
  stopScanning(): void {
    this.isScanning.value = false;

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    console.log("Camera scanning stopped");
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId: string): Promise<void> {
    const device = this.availableDevices.value.find(
      (d) => d.deviceId === deviceId
    );
    if (!device) {
      throw new Error("Camera device not found");
    }

    this.currentDevice.value = device;

    if (this.isScanning.value && this.videoElement) {
      await this.stopScanning();
      await this.startScanning(this.videoElement, { deviceId });
    }
  }

  /**
   * Toggle camera torch/flashlight (if supported)
   */
  async toggleTorch(): Promise<boolean> {
    if (!this.stream) {
      throw new Error("Camera not started");
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if ("torch" in capabilities) {
        const settings = videoTrack.getSettings();
        const newTorchState = !settings.torch;

        await videoTrack.applyConstraints({
          advanced: [{ torch: newTorchState } as any],
        });

        return newTorchState;
      } else {
        throw new Error("Torch not supported on this device");
      }
    } catch (error) {
      console.error("Failed to toggle torch:", error);
      throw error;
    }
  }

  /**
   * Main scanning loop
   */
  private scanLoop(): void {
    if (!this.isScanning.value || !this.videoElement) {
      return;
    }

    // Check if enough time has passed since last scan
    const now = Date.now();
    if (now - this.lastScanTime < this.scanCooldown) {
      requestAnimationFrame(() => this.scanLoop());
      return;
    }

    try {
      // Capture frame from video
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        context.drawImage(this.videoElement, 0, 0);

        // In a real implementation, you would use a barcode detection library here
        // For now, we'll simulate barcode detection
        this.simulateBarcodeDetection(canvas, context);
      }
    } catch (error) {
      console.error("Scanning error:", error);
    }

    // Continue scanning
    requestAnimationFrame(() => this.scanLoop());
  }

  /**
   * Simulate barcode detection (replace with real library)
   */
  private simulateBarcodeDetection(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ): void {
    // This is a simulation - in reality you'd use:
    // - ZXing-js (https://github.com/zxing-js/library)
    // - QuaggaJS (https://github.com/serratus/quaggaJS)
    // - @capacitor-community/barcode-scanner for mobile

    // Simulate detecting a barcode every 10 seconds (for demo purposes)
    if (Math.random() < 0.001) {
      // Very low probability to simulate rare detection
      const simulatedResult: ScanResult = {
        code: this.generateSimulatedBarcode(),
        format: "EAN-13",
        timestamp: new Date(),
        confidence: 0.95,
      };

      this.handleScanResult(simulatedResult);
    }
  }

  /**
   * Handle successful scan result
   */
  private handleScanResult(result: ScanResult): void {
    this.lastScanTime = Date.now();

    // Add to scan history
    this.scanHistory.value.unshift(result);

    // Keep only last 100 scans
    if (this.scanHistory.value.length > 100) {
      this.scanHistory.value = this.scanHistory.value.slice(0, 100);
    }

    // Save to localStorage
    this.saveScanHistory();

    // Track analytics
    analyticsService.trackScanEvent("unknown", "barcode", {
      code: result.code,
      format: result.format,
      confidence: result.confidence,
    });

    // Emit scan event (you can use an event emitter or Vue's emit)
    this.onScanResult?.(result);

    console.log("Barcode detected:", result);
  }

  /**
   * Generate simulated barcode for demo
   */
  private generateSimulatedBarcode(): string {
    // Generate a realistic EAN-13 barcode
    const countryCode = "871"; // Netherlands
    const companyCode = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const productCode = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const checkDigit = Math.floor(Math.random() * 10);

    return countryCode + companyCode + productCode + checkDigit;
  }

  /**
   * Save scan history to localStorage
   */
  private saveScanHistory(): void {
    try {
      localStorage.setItem(
        "barcode_scan_history",
        JSON.stringify(this.scanHistory.value)
      );
    } catch (error) {
      console.error("Failed to save scan history:", error);
    }
  }

  /**
   * Load scan history from localStorage
   */
  private loadScanHistory(): void {
    try {
      const saved = localStorage.getItem("barcode_scan_history");
      if (saved) {
        const history = JSON.parse(saved);
        this.scanHistory.value = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load scan history:", error);
    }
  }

  /**
   * Get scan history
   */
  getScanHistory(): ScanResult[] {
    return this.scanHistory.value;
  }

  /**
   * Clear scan history
   */
  clearScanHistory(): void {
    this.scanHistory.value = [];
    this.saveScanHistory();
  }

  /**
   * Check if camera is supported
   */
  isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check if scanning is active
   */
  isActivelyScanninng(): boolean {
    return this.isScanning.value;
  }

  /**
   * Get current device
   */
  getCurrentDevice(): CameraDevice | null {
    return this.currentDevice.value;
  }

  /**
   * Callback for scan results (to be set by components)
   */
  onScanResult?: (result: ScanResult) => void;

  /**
   * Set scan result callback
   */
  setOnScanResult(callback: (result: ScanResult) => void): void {
    this.onScanResult = callback;
  }

  /**
   * Focus camera (if supported)
   */
  async focusCamera(): Promise<void> {
    if (!this.stream) {
      throw new Error("Camera not started");
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if ("focusMode" in capabilities) {
        await videoTrack.applyConstraints({
          advanced: [{ focusMode: "single-shot" } as any],
        });
      }
    } catch (error) {
      console.error("Failed to focus camera:", error);
    }
  }

  /**
   * Get camera capabilities
   */
  getCameraCapabilities(): MediaTrackCapabilities | null {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack.getCapabilities();
  }

  /**
   * Get camera settings
   */
  getCameraSettings(): MediaTrackSettings | null {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack.getSettings();
  }
}

export const cameraScannerService = new CameraScannerService();
