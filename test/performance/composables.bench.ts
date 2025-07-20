import { bench, describe } from 'vitest';
import { useFormValidation } from 'src/composables/useFormValidation';
import { useStockStatus } from 'src/composables/useStockStatus';

describe('Composables Performance Benchmarks', () => {
  describe('useFormValidation Performance', () => {
    bench('should validate email quickly', () => {
      const { rules } = useFormValidation();

      // Benchmark email validation
      const emails = [
        'test@example.com',
        'invalid-email',
        'user@domain.org',
        'bad@',
        '@example.com',
        'very.long.email.address.with.multiple.dots@very-long-domain-name.com',
      ];

      emails.forEach(email => {
        rules.email(email);
      });
    });

    bench('should validate required fields efficiently', () => {
      const { rules } = useFormValidation();

      const values = [
        'valid value',
        '',
        null,
        undefined,
        0,
        1,
        'another valid value',
        '   ',
        'test',
      ];

      values.forEach(value => {
        rules.required(value);
      });
    });
  });

  describe('useStockStatus Performance', () => {
    bench('should calculate stock status quickly', () => {
      const { getStockStatus } = useStockStatus();

      const stockScenarios = [
        { current: 10, min: 5, max: 50 },
        { current: 0, min: 5, max: 50 },
        { current: 3, min: 5, max: 50 },
        { current: 75, min: 5, max: 50 },
      ];

      stockScenarios.forEach(scenario => {
        getStockStatus(scenario.current, scenario.min, scenario.max);
      });
    });
  });
});
