import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler, type AppError } from 'src/utils/error-handler';
import { Notify } from 'quasar';

// Mock Quasar Notify
vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getErrorMessage', () => {
    it('should handle JWT errors', () => {
      const error = new Error('JWT token expired');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Je sessie is verlopen. Log opnieuw in.');
    });

    it('should handle duplicate key errors', () => {
      const error = new Error('duplicate key value violates unique constraint');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Dit item bestaat al.');
    });

    it('should handle foreign key errors', () => {
      const error = new Error('foreign key constraint fails');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe(
        'Dit item kan niet worden verwijderd omdat het in gebruik is.'
      );
    });

    it('should handle not found errors', () => {
      const error = new Error('Resource not found');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Het opgevraagde item werd niet gevonden.');
    });

    it('should return original message for unknown errors', () => {
      const error = new Error('Some custom error message');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Some custom error message');
    });

    it('should handle errors without message', () => {
      const error = new Error('');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('Er is een onbekende fout opgetreden.');
    });
  });

  describe('normalizeError', () => {
    it('should normalize regular Error to AppError', () => {
      const error = new Error('Test error');
      const normalized = ErrorHandler.normalizeError(error, 'Test Context');

      expect(normalized).toEqual({
        message: 'Test error',
        context: 'Test Context',
        originalError: error,
      });
    });

    it('should handle AppError with existing context', () => {
      const appError: AppError = {
        message: 'App error',
        code: 'TEST_ERROR',
        context: 'Original Context',
      };

      const normalized = ErrorHandler.normalizeError(appError, 'New Context');

      expect(normalized).toEqual({
        message: 'App error',
        code: 'TEST_ERROR',
        context: 'New Context',
      });
    });

    it('should use default context when none provided', () => {
      const error = new Error('Test error');
      const normalized = ErrorHandler.normalizeError(error);

      expect(normalized.context).toBe('Unknown');
    });

    it('should preserve existing context in AppError when no new context provided', () => {
      const appError: AppError = {
        message: 'App error',
        context: 'Existing Context',
      };

      const normalized = ErrorHandler.normalizeError(appError);

      expect(normalized.context).toBe('Existing Context');
    });
  });

  describe('handle', () => {
    it('should log error and show notification', () => {
      const error = new Error('Test error');
      const context = 'Test Context';

      ErrorHandler.handle(error, context);

      // Check that console.error was called
      expect(console.error).toHaveBeenCalledWith('[Test Context]', error);

      // Check that Notify.create was called with correct parameters
      expect(Notify.create).toHaveBeenCalledWith({
        type: 'negative',
        message: 'Test error',
        position: 'top',
        timeout: 5000,
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: expect.any(Function),
          },
        ],
      });
    });

    it('should handle AppError', () => {
      const appError: AppError = {
        message: 'Custom app error',
        code: 'CUSTOM_ERROR',
        context: 'App Context',
      };

      ErrorHandler.handle(appError);

      expect(Notify.create).toHaveBeenCalledWith({
        type: 'negative',
        message: 'Custom app error',
        position: 'top',
        timeout: 5000,
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: expect.any(Function),
          },
        ],
      });
    });

    it('should use translated error messages', () => {
      const jwtError = new Error('JWT token is invalid');

      ErrorHandler.handle(jwtError, 'Auth');

      expect(Notify.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Je sessie is verlopen. Log opnieuw in.',
        })
      );
    });
  });
});
