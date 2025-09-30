import { ref, computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ValidationRule, FieldValidation } from '@/types/validation';

export function useFormValidation() {
  const { t } = useI18n();

  // Enhanced validation rules with common patterns from the codebase
  const rules = {
    // Basic validations
    required: (value: unknown): boolean | string => {
      if (Array.isArray(value)) {
        return value.length > 0 || t('validation.required');
      }
      return (
        (!!value && value !== '' && value !== null && value !== undefined) ||
        t('validation.required')
      );
    },

    // String validations
    email: (value: string): boolean | string => {
      if (!value) return true; // Optional unless combined with required
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value) || t('validation.email');
    },

    minLength:
      (min: number) =>
      (value: string): boolean | string => {
        if (!value) return true; // Optional unless combined with required
        return value.length >= min || t('validation.minLength', { min });
      },

    maxLength:
      (max: number) =>
      (value: string): boolean | string => {
        if (!value) return true;
        return value.length <= max || t('validation.maxLength', { max });
      },

    // Number validations
    numeric: (value: unknown): boolean | string => {
      if (value === '' || value === null || value === undefined) return true;
      return !Number.isNaN(Number(value)) || t('validation.numeric');
    },

    positive: (value: number | string): boolean | string => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return (!isNaN(num) && num > 0) || t('validation.mustBePositive');
    },

    positiveNumber: (value: number | string): boolean | string => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return (!isNaN(num) && num > 0) || t('validation.positiveNumber');
    },

    nonNegative: (value: number | string): boolean | string => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return (!isNaN(num) && num >= 0) || t('validation.nonNegative');
    },

    integer: (value: unknown): boolean | string => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return (
        (!Number.isNaN(num) && Number.isInteger(num)) || t('validation.integer')
      );
    },

    minValue:
      (min: number) =>
      (value: number | string): boolean | string => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        return (!isNaN(num) && num >= min) || t('validation.minValue', { min });
      },

    maxValue:
      (max: number) =>
      (value: number | string): boolean | string => {
        if (value === '' || value === null || value === undefined) return true;
        const num = Number(value);
        return (!isNaN(num) && num <= max) || t('validation.maxValue', { max });
      },

    // Date validations
    futureDate: (value: string): boolean | string => {
      if (!value) return true;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for comparison
      return date >= today || t('validation.futureDate');
    },

    pastDate: (value: string): boolean | string => {
      if (!value) return true;
      const date = new Date(value);
      const today = new Date();
      return date <= today || t('validation.pastDate');
    },

    // SKU/Code validations
    sku: (value: string): boolean | string => {
      if (!value) return true;
      const skuPattern = /^[A-Z0-9\-_]+$/i;
      return skuPattern.test(value) || t('validation.validSku');
    },

    // Phone number validation
    phone: (value: string): boolean | string => {
      if (!value) return true;
      const phonePattern = /^[+]?[\d\s\-()]+$/;
      return phonePattern.test(value) || t('validation.phone');
    },

    // URL validation
    url: (value: string): boolean | string => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return t('validation.url');
      }
    },

    // Array validations
    arrayNotEmpty: (value: unknown): boolean | string => {
      return (
        (Array.isArray(value) && value.length > 0) || t('validation.required')
      );
    },

    arrayMinLength:
      (min: number) =>
      (value: unknown): boolean | string => {
        if (!Array.isArray(value)) return t('validation.required');
        return value.length >= min || t('validation.arrayMinLength', { min });
      },

    // Custom validation helpers
    requiredIf:
      (condition: () => boolean) =>
      (value: unknown): boolean | string => {
        if (!condition()) return true;
        return rules.required(value);
      },

    oneOf:
      (options: readonly unknown[]) =>
      (value: unknown): boolean | string => {
        if (!value) return true;
        return (
          options.includes(value) ||
          t('validation.oneOf', { options: options.join(', ') })
        );
      },
  };

  // Enhanced field validation with better error handling
  function createField<T>(
    initialValue: T,
    validationRules: ValidationRule[] = []
  ): FieldValidation {
    const value = ref(initialValue) as Ref<T>;
    const error = ref('');
    const touched = ref(false);

    const isValid = computed(() => !error.value);

    const validate = (): boolean => {
      error.value = '';
      touched.value = true;

      for (const rule of validationRules) {
        const result = rule(value.value);
        if (typeof result === 'string') {
          error.value = result;
          return false;
        }
      }

      return true;
    };

    const clear = () => {
      error.value = '';
      touched.value = false;
    };

    return {
      value,
      rules: validationRules,
      error,
      isValid,
      validate,
      clear,
    };
  }

  // Enhanced form validation with better error reporting
  function validateForm(fields: FieldValidation[]): boolean {
    let isFormValid = true;
    const errors: string[] = [];

    fields.forEach((field, index) => {
      const fieldValid = field.validate();
      if (!fieldValid) {
        isFormValid = false;
        errors.push(`Field ${index + 1}: ${field.error.value}`);
      }
    });

    return isFormValid;
  }

  // Helper to create common validation patterns
  const patterns = {
    // Required text field
    requiredText: (minLength?: number, maxLength?: number) => {
      const validations = [rules.required];
      if (minLength) validations.push(rules.minLength(minLength));
      if (maxLength) validations.push(rules.maxLength(maxLength));
      return validations;
    },

    // Required email field
    requiredEmail: () => [rules.required, rules.email],

    // Required positive number
    requiredPositiveNumber: () => [
      rules.required,
      rules.numeric,
      rules.positive,
    ],

    // Required quantity field
    requiredQuantity: () => [rules.required, rules.numeric, rules.positive],

    // Optional positive number
    optionalPositiveNumber: () => [rules.numeric, rules.positive],

    // Required date
    requiredDate: (future = false) => {
      const validations = [rules.required];
      if (future) validations.push(rules.futureDate);
      return validations;
    },

    // Required selection from array
    requiredSelection: () => [rules.arrayNotEmpty],
  };

  return {
    rules,
    patterns,
    createField,
    validateForm,
  };
}
