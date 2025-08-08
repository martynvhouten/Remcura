import { Notify } from 'quasar';
import type { AppError } from '@/types/logging';

export class ErrorHandler {
  static handle(error: Error | AppError, context?: string): void {
    const appError = this.normalizeError(error, context);

    // Log error for debugging
    console.error(`[${appError.context}]`, appError.originalError || appError);

    // Show user-friendly notification
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
    // Check if this is already an AppError (has message and optionally code/context)
    if (
      'message' in error &&
      typeof error.message === 'string' &&
      !('stack' in error)
    ) {
      const appError = error as AppError;
      return {
        ...appError,
        context:
          context !== undefined ? context : appError.context || 'Unknown',
      };
    }

    return {
      message: this.getErrorMessage(error as Error),
      context: context || 'Unknown',
      originalError: error as Error,
    };
  }

  static getErrorMessage(error: Error): string {
    // Handle common Supabase errors
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

// Composable for use in components
export function useErrorHandler() {
  return {
    handleError: (error: Error | AppError, context?: string) =>
      ErrorHandler.handle(error, context),
    getErrorMessage: (error: Error) => ErrorHandler.getErrorMessage(error),
  };
}
