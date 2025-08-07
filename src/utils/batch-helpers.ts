import type { ProductBatchWithDetails } from 'src/types/inventory';

/**
 * Batch validation and formatting utilities
 */

export interface BatchValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BatchUrgencyInfo {
  level: 'normal' | 'low' | 'warning' | 'high' | 'critical' | 'expired';
  daysUntilExpiry: number;
  color: string;
  icon: string;
  message: string;
}

/**
 * Validates batch number format
 */
export const validateBatchNumber = (batchNumber: string): BatchValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!batchNumber || batchNumber.trim().length === 0) {
    errors.push('Batchnummer is verplicht');
  } else {
    const trimmed = batchNumber.trim();
    
    // Check minimum length
    if (trimmed.length < 3) {
      errors.push('Batchnummer moet minimaal 3 karakters bevatten');
    }
    
    // Check maximum length
    if (trimmed.length > 50) {
      errors.push('Batchnummer mag maximaal 50 karakters bevatten');
    }
    
    // Check for invalid characters (allow alphanumeric, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validPattern.test(trimmed)) {
      errors.push('Batchnummer mag alleen letters, cijfers, streepjes en underscores bevatten');
    }
    
    // Check for common format patterns and warn if unusual
    const commonPatterns = [
      /^\d{4,}$/, // All numbers
      /^[A-Z]{2,}\d{2,}$/, // Letters followed by numbers
      /^\d{2,}[A-Z]{2,}$/, // Numbers followed by letters
      /^[A-Z]\d+-[A-Z]\d+$/, // Letter-number-dash-letter-number
    ];
    
    const matchesCommonPattern = commonPatterns.some(pattern => pattern.test(trimmed));
    if (!matchesCommonPattern) {
      warnings.push('Batchnummer heeft een ongebruikelijk formaat');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates expiry date
 */
export const validateExpiryDate = (expiryDate: string | Date): BatchValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!expiryDate) {
    errors.push('Vervaldatum is verplicht');
    return { isValid: false, errors, warnings };
  }

  const date = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    errors.push('Ongeldige vervaldatum');
    return { isValid: false, errors, warnings };
  }

  // Check if date is in the past
  if (date < today) {
    errors.push('Vervaldatum kan niet in het verleden liggen');
  }

  // Check if date is too far in the future (more than 10 years)
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  if (date > maxDate) {
    warnings.push('Vervaldatum is erg ver in de toekomst');
  }

  // Check if date is very soon (within 30 days)
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (date <= thirtyDaysFromNow && date >= today) {
    warnings.push('Vervaldatum is binnen 30 dagen');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates batch quantity
 */
export const validateBatchQuantity = (quantity: number, allowZero: boolean = false): BatchValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (quantity === null || quantity === undefined) {
    errors.push('Hoeveelheid is verplicht');
    return { isValid: false, errors, warnings };
  }

  if (isNaN(quantity)) {
    errors.push('Hoeveelheid moet een geldig getal zijn');
    return { isValid: false, errors, warnings };
  }

  if (!allowZero && quantity <= 0) {
    errors.push('Hoeveelheid moet groter zijn dan 0');
  } else if (allowZero && quantity < 0) {
    errors.push('Hoeveelheid mag niet negatief zijn');
  }

  // Check for very large quantities
  if (quantity > 999999) {
    warnings.push('Zeer grote hoeveelheid gedetecteerd');
  }

  // Check for decimal places in what should be whole numbers
  if (quantity % 1 !== 0 && quantity < 100) {
    warnings.push('Fractionele hoeveelheden kunnen ongewenst zijn voor dit product');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculates batch urgency information based on expiry date
 */
export const calculateBatchUrgency = (expiryDate: string | Date): BatchUrgencyInfo => {
  const date = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      level: 'expired',
      daysUntilExpiry,
      color: 'negative',
      icon: 'error',
      message: 'Verlopen'
    };
  }

  if (daysUntilExpiry === 0) {
    return {
      level: 'critical',
      daysUntilExpiry,
      color: 'negative',
      icon: 'warning',
      message: 'Verloopt vandaag'
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      level: 'critical',
      daysUntilExpiry,
      color: 'negative',
      icon: 'warning',
      message: `Verloopt over ${daysUntilExpiry} dag${daysUntilExpiry > 1 ? 'en' : ''}`
    };
  }

  if (daysUntilExpiry <= 14) {
    return {
      level: 'high',
      daysUntilExpiry,
      color: 'warning',
      icon: 'schedule',
      message: `Verloopt over ${daysUntilExpiry} dagen`
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      level: 'warning',
      daysUntilExpiry,
      color: 'orange',
      icon: 'schedule',
      message: `Verloopt over ${daysUntilExpiry} dagen`
    };
  }

  if (daysUntilExpiry <= 90) {
    return {
      level: 'low',
      daysUntilExpiry,
      color: 'info',
      icon: 'info',
      message: `Verloopt over ${daysUntilExpiry} dagen`
    };
  }

  return {
    level: 'normal',
    daysUntilExpiry,
    color: 'positive',
    icon: 'check_circle',
    message: `Verloopt over ${daysUntilExpiry} dagen`
  };
};

/**
 * Formats batch number for display
 */
export const formatBatchNumber = (batchNumber: string, maxLength?: number): string => {
  if (!batchNumber) return '-';
  
  const trimmed = batchNumber.trim().toUpperCase();
  
  if (maxLength && trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength - 3) + '...';
  }
  
  return trimmed;
};

/**
 * Formats batch quantity with unit
 */
export const formatBatchQuantity = (quantity: number, unit: string): string => {
  if (quantity === null || quantity === undefined) return '-';
  
  // Format with appropriate decimal places
  let formattedQuantity: string;
  if (quantity % 1 === 0) {
    formattedQuantity = quantity.toString();
  } else if (quantity < 10) {
    formattedQuantity = quantity.toFixed(2);
  } else {
    formattedQuantity = quantity.toFixed(1);
  }
  
  return `${formattedQuantity} ${unit || ''}`.trim();
};

/**
 * Generates a suggested batch number based on product info and date
 */
export const generateSuggestedBatchNumber = (productSku: string, date?: Date): string => {
  const now = date || new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Take first 3 characters of SKU if available
  const skuPrefix = productSku ? productSku.slice(0, 3).toUpperCase() : 'BAT';
  
  return `${skuPrefix}${year}${month}${day}`;
};

/**
 * Sorts batches by FIFO order (first to expire first)
 */
export const sortBatchesFIFO = (batches: ProductBatchWithDetails[]): ProductBatchWithDetails[] => {
  return [...batches].sort((a, b) => {
    // First by expiry date
    const dateComparison = new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // Then by received date (older first)
    const receivedA = new Date(a.received_date || a.created_at).getTime();
    const receivedB = new Date(b.received_date || b.created_at).getTime();
    return receivedA - receivedB;
  });
};

/**
 * Filters batches by urgency level
 */
export const filterBatchesByUrgency = (
  batches: ProductBatchWithDetails[], 
  urgencyLevels: BatchUrgencyInfo['level'][]
): ProductBatchWithDetails[] => {
  return batches.filter(batch => {
    const urgency = calculateBatchUrgency(batch.expiry_date);
    return urgencyLevels.includes(urgency.level);
  });
};

/**
 * Checks if two batch numbers are similar (for duplicate detection)
 */
export const areBatchNumbersSimilar = (batchNumber1: string, batchNumber2: string): boolean => {
  if (!batchNumber1 || !batchNumber2) return false;
  
  const clean1 = batchNumber1.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const clean2 = batchNumber2.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Exact match
  if (clean1 === clean2) return true;
  
  // Very similar (one character difference)
  if (Math.abs(clean1.length - clean2.length) <= 1) {
    let differences = 0;
    const maxLength = Math.max(clean1.length, clean2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (clean1[i] !== clean2[i]) {
        differences++;
        if (differences > 1) return false;
      }
    }
    
    return differences <= 1;
  }
  
  return false;
};

/**
 * Validates complete batch data
 */
export const validateBatchData = (batchData: {
  batchNumber: string;
  expiryDate: string | Date;
  quantity: number;
  allowZeroQuantity?: boolean;
}): BatchValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate batch number
  const batchNumberValidation = validateBatchNumber(batchData.batchNumber);
  errors.push(...batchNumberValidation.errors);
  warnings.push(...batchNumberValidation.warnings);

  // Validate expiry date
  const expiryValidation = validateExpiryDate(batchData.expiryDate);
  errors.push(...expiryValidation.errors);
  warnings.push(...expiryValidation.warnings);

  // Validate quantity
  const quantityValidation = validateBatchQuantity(batchData.quantity, batchData.allowZeroQuantity);
  errors.push(...quantityValidation.errors);
  warnings.push(...quantityValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
