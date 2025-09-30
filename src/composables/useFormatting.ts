import { useI18n } from 'vue-i18n';
import { date } from 'quasar';

/**
 * Currency formatting composable
 */
export function useCurrency() {
  const { locale } = useI18n();

  const formatCurrency = (
    amount: number | null | undefined,
    currency = 'EUR',
    options?: Intl.NumberFormatOptions
  ): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }

    return new Intl.NumberFormat(locale.value || 'nl-NL', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  };

  const formatPrice = (
    price: number | null | undefined,
    currency = 'EUR'
  ): string => {
    return formatCurrency(price, currency);
  };

  const formatValue = (
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    return new Intl.NumberFormat(locale.value || 'nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  };

  return {
    formatCurrency,
    formatPrice,
    formatValue,
  };
}

/**
 * Date formatting composable
 */
export function useDate() {
  const formatDate = (
    dateString: string | Date | null | undefined,
    format = 'DD/MM/YYYY'
  ): string => {
    if (!dateString) {
      return '-';
    }

    try {
      const dateObj =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(dateObj.getTime())) {
        return '-';
      }

      return date.formatDate(dateObj, format);
    } catch {
      return '-';
    }
  };

  const formatDateTime = (
    dateString: string | Date | null | undefined,
    format = 'DD/MM/YYYY HH:mm'
  ): string => {
    return formatDate(dateString, format);
  };

  const formatRelativeTime = (
    dateString: string | Date | null | undefined
  ): string => {
    if (!dateString) {
      return '-';
    }

    try {
      const dateObj =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays} dag${diffDays === 1 ? '' : 'en'} geleden`;
      } else if (diffHours > 0) {
        return `${diffHours} uur geleden`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minuten geleden`;
      } else {
        return 'Zojuist';
      }
    } catch {
      return '-';
    }
  };

  return {
    formatDate,
    formatDateTime,
    formatRelativeTime,
  };
}

/**
 * Number formatting composable
 */
export function useNumber() {
  const { locale } = useI18n();

  const formatQuantity = (
    quantity: number | null | undefined,
    unit?: string,
    decimals = 0
  ): string => {
    if (quantity === null || quantity === undefined) {
      return '0';
    }

    const formatted = new Intl.NumberFormat(locale.value || 'nl-NL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 3,
    }).format(quantity);

    return unit ? `${formatted} ${unit}` : formatted;
  };

  const formatPercentage = (
    value: number | null | undefined,
    decimals = 1
  ): string => {
    if (value === null || value === undefined) {
      return '0%';
    }

    return new Intl.NumberFormat(locale.value || 'nl-NL', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  };

  const formatCompactNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '0';
    }

    return new Intl.NumberFormat(locale.value || 'nl-NL', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  return {
    formatQuantity,
    formatPercentage,
    formatCompactNumber,
  };
}

/**
 * Combined formatting composable - includes all formatters
 */
export function useFormatting() {
  const currency = useCurrency();
  const dateTime = useDate();
  const number = useNumber();

  return {
    ...currency,
    ...dateTime,
    ...number,
  };
}
