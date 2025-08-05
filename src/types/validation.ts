// Form validation types
export interface ValidationRule {
  (value: any): boolean | string;
}

export interface FieldValidation {
  rules: ValidationRule[];
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