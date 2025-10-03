// Form validation types
import type { Ref, ComputedRef } from 'vue';

export interface ValidationRule {
  (value: any): boolean | string;
}

export interface FieldValidation<T = any> {
  value: Ref<T>;
  rules: ValidationRule[];
  error: Ref<string>;
  isValid: ComputedRef<boolean>;
  validate: () => boolean;
  clear: () => void;
  // Deprecated properties (kept for backward compatibility)
  message?: string;
  required?: boolean;
  immediate?: boolean;
}

export interface FormValidationState {
  valid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
