import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useFormValidation } from 'src/composables/useFormValidation'
import { useI18n } from 'vue-i18n'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: vi.fn((key: string, params?: any) => {
      const translations: Record<string, string> = {
        'validation.required': 'Dit veld is verplicht',
        'validation.email': 'Voer een geldig e-mailadres in',
        'validation.minLength': `Minimaal ${params?.min} karakters vereist`,
        'validation.maxLength': `Maximaal ${params?.max} karakters toegestaan`,
        'validation.numeric': 'Alleen cijfers toegestaan',
        'validation.positive': 'Waarde moet positief zijn',
        'validation.integer': 'Alleen hele getallen toegestaan'
      }
      return translations[key] || key
    })
  }))
}))

describe('useFormValidation', () => {
  let wrapper: any
  let formValidation: ReturnType<typeof useFormValidation>

  beforeEach(() => {
    const TestComponent = defineComponent({
      setup() {
        formValidation = useFormValidation()
        return formValidation
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
  })

  describe('validation rules', () => {
    it('should validate required fields', () => {
      const { rules } = formValidation
      
      expect(rules.required('')).toBe('Dit veld is verplicht')
      expect(rules.required(null)).toBe('Dit veld is verplicht')
      expect(rules.required(undefined)).toBe('Dit veld is verplicht')
      expect(rules.required('test')).toBe(true)
      expect(rules.required(0)).toBe('Dit veld is verplicht')
      expect(rules.required(1)).toBe(true)
    })

    it('should validate email format', () => {
      const { rules } = formValidation
      
      expect(rules.email('test@example.com')).toBe(true)
      expect(rules.email('user@domain.org')).toBe(true)
      expect(rules.email('invalid-email')).toBe('Voer een geldig e-mailadres in')
      expect(rules.email('test@')).toBe('Voer een geldig e-mailadres in')
      expect(rules.email('@example.com')).toBe('Voer een geldig e-mailadres in')
      expect(rules.email('')).toBe('Voer een geldig e-mailadres in')
    })

    it('should validate minimum length', () => {
      const { rules } = formValidation
      const minLength5 = rules.minLength(5)
      
      expect(minLength5('hello')).toBe(true)
      expect(minLength5('hello world')).toBe(true)
      expect(minLength5('hi')).toBe('Minimaal 5 karakters vereist')
      expect(minLength5('')).toBe('Minimaal 5 karakters vereist')
    })

    it('should validate maximum length', () => {
      const { rules } = formValidation
      const maxLength10 = rules.maxLength(10)
      
      expect(maxLength10('hello')).toBe(true)
      expect(maxLength10('hello world')).toBe('Maximaal 10 karakters toegestaan')
      expect(maxLength10('')).toBe(true)
      expect(maxLength10(null)).toBe(true)
    })

    it('should validate numeric values', () => {
      const { rules } = formValidation
      
      expect(rules.numeric('123')).toBe(true)
      expect(rules.numeric('123.45')).toBe(true)
      expect(rules.numeric('-123')).toBe(true)
      expect(rules.numeric('abc')).toBe('Alleen cijfers toegestaan')
      expect(rules.numeric('')).toBe(true)
      expect(rules.numeric(null)).toBe(true)
    })

    it('should validate positive numbers', () => {
      const { rules } = formValidation
      
      expect(rules.positive(1)).toBe(true)
      expect(rules.positive(0.5)).toBe(true)
      expect(rules.positive(0)).toBe('Waarde moet positief zijn')
      expect(rules.positive(-1)).toBe('Waarde moet positief zijn')
      expect(rules.positive(null)).toBe(true)
    })

    it('should validate integers', () => {
      const { rules } = formValidation
      
      expect(rules.integer('123')).toBe(true)
      expect(rules.integer('-123')).toBe(true)
      expect(rules.integer('123.45')).toBe('Alleen hele getallen toegestaan')
      expect(rules.integer('abc')).toBe('Alleen hele getallen toegestaan')
      expect(rules.integer('')).toBe(true)
      expect(rules.integer(null)).toBe(true)
    })
  })

  describe('createField', () => {
    it('should create a field with initial value', () => {
      const { createField } = formValidation
      const field = createField('initial', [])
      
      expect(field.value.value).toBe('initial')
      expect(field.error.value).toBe('')
      expect(field.isValid.value).toBe(true)
    })

    it('should validate field and set error', () => {
      const { createField, rules } = formValidation
      const field = createField('', [rules.required])
      
      const isValid = field.validate()
      
      expect(isValid).toBe(false)
      expect(field.error.value).toBe('Dit veld is verplicht')
      expect(field.isValid.value).toBe(false)
    })

    it('should clear error on successful validation', () => {
      const { createField, rules } = formValidation
      const field = createField('', [rules.required])
      
      // First validation fails
      field.validate()
      expect(field.error.value).toBe('Dit veld is verplicht')
      
      // Set valid value and validate again
      field.value.value = 'valid value'
      const isValid = field.validate()
      
      expect(isValid).toBe(true)
      expect(field.error.value).toBe('')
      expect(field.isValid.value).toBe(true)
    })

    it('should clear error when clear() is called', () => {
      const { createField, rules } = formValidation
      const field = createField('', [rules.required])
      
      field.validate()
      expect(field.error.value).toBe('Dit veld is verplicht')
      
      field.clear()
      expect(field.error.value).toBe('')
    })
  })

  describe('validateForm', () => {
    it('should validate all fields and return overall validity', () => {
      const { createField, rules, validateForm } = formValidation
      
      const field1 = createField('valid', [rules.required])
      const field2 = createField('', [rules.required])
      const field3 = createField('test@example.com', [rules.required, rules.email])
      
      const isFormValid = validateForm([field1, field2, field3])
      
      expect(isFormValid).toBe(false)
      expect(field1.error.value).toBe('')
      expect(field2.error.value).toBe('Dit veld is verplicht')
      expect(field3.error.value).toBe('')
    })

    it('should return true for valid form', () => {
      const { createField, rules, validateForm } = formValidation
      
      const field1 = createField('valid', [rules.required])
      const field2 = createField('also valid', [rules.required])
      
      const isFormValid = validateForm([field1, field2])
      
      expect(isFormValid).toBe(true)
      expect(field1.error.value).toBe('')
      expect(field2.error.value).toBe('')
    })
  })
}) 