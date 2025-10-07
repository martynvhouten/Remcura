import { Notify } from 'quasar';
import type { AppError } from '@/types/logging';

export class ErrorHandler {
  static handle(error: Error | AppError, context?: string): void {
    const appError = this.normalizeError(error, context);

    console.error(
      `[${appError.context ?? 'Unknown'}]`,
      appError.originalError ?? appError
    );

    Notify.create({
      type: 'negative',
      message: appError.message,
      position: 'top',
      timeout: 5000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {
            /* dismiss */
          },
        },
      ],
    });
  }

  static normalizeError(error: Error | AppError, context?: string): AppError {
    if (
      'message' in error &&
      typeof error.message === 'string' &&
      !('stack' in error)
    ) {
      const appError = error as AppError;
      return {
        ...appError,
        context: context ?? appError.context ?? 'Unknown',
      };
    }

    return {
      message: this.getErrorMessage(error as Error),
      context: context ?? 'Unknown',
      originalError: error as Error,
      timestamp: new Date(),
    };
  }

  static getErrorMessage(error: Error): string {
    if (error.message.includes('JWT')) {
      return 'Je sessie is verlopen. Log opnieuw in.';
    }

    if (error.message.includes('duplicate key')) {
      return 'Dit item bestaat al.';
    }

    if (error.message.includes('foreign key')) {
      return 'Dit item kan niet worden verwijderd omdat het in gebruik is.';
    }

    if (error.message.includes('not found')) {
      return 'Het opgevraagde item werd niet gevonden.';
    }

    return error.message || 'Er is een onbekende fout opgetreden.';
  }
}

export function useErrorHandler() {
  return {
    handleError: (error: Error | AppError, context?: string) =>
      ErrorHandler.handle(error, context),
    getErrorMessage: (error: Error) => ErrorHandler.getErrorMessage(error),
  };
}
