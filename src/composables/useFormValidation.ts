import { ref, computed, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ValidationRule {
  (value: any): boolean | string
}

export interface FieldValidation {
  value: Ref<any>
  rules: ValidationRule[]
  error: Ref<string>
  isValid: Ref<boolean>
  validate: () => boolean
  clear: () => void
}

export function useFormValidation() {
  const { t } = useI18n()

  // Common validation rules
  const rules = {
    required: (value: any): boolean | string => {
      return !!value || t('validation.required')
    },

    email: (value: string): boolean | string => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(value) || t('validation.email')
    },

    minLength: (min: number) => (value: string): boolean | string => {
      return (value && value.length >= min) || t('validation.minLength', { min })
    },

    maxLength: (max: number) => (value: string): boolean | string => {
      return (!value || value.length <= max) || t('validation.maxLength', { max })
    },

    numeric: (value: any): boolean | string => {
      return (!value || !isNaN(Number(value))) || t('validation.numeric')
    },

    positive: (value: number): boolean | string => {
      return (!value || value > 0) || t('validation.positive')
    },

    integer: (value: any): boolean | string => {
      return (!value || Number.isInteger(Number(value))) || t('validation.integer')
    }
  }

  // Create a field validation
  function createField<T>(initialValue: T, validationRules: ValidationRule[] = []): FieldValidation {
    const value = ref(initialValue) as Ref<T>
    const error = ref('')

    const isValid = computed(() => !error.value)

    const validate = (): boolean => {
      error.value = ''
      
      for (const rule of validationRules) {
        const result = rule(value.value)
        if (typeof result === 'string') {
          error.value = result
          return false
        }
      }
      
      return true
    }

    const clear = () => {
      error.value = ''
    }

    // Auto-clear error when value changes
    const originalValue = value.value
    const stopWatcher = computed(() => {
      if (value.value !== originalValue && error.value) {
        error.value = ''
      }
      return value.value
    })

    return {
      value,
      rules: validationRules,
      error,
      isValid,
      validate,
      clear
    }
  }

  // Validate entire form
  function validateForm(fields: FieldValidation[]): boolean {
    let isFormValid = true
    
    fields.forEach(field => {
      const fieldValid = field.validate()
      if (!fieldValid) {
        isFormValid = false
      }
    })
    
    return isFormValid
  }

  return {
    rules,
    createField,
    validateForm
  }
} 