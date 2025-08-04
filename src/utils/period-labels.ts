// Period Labels Mapping for Better UX
// Maps short codes to readable labels via i18n

import { i18n } from '@/i18n';

const { t } = i18n.global;

export const periodLabels = {
  // Time periods
  '1d': () => t('periods.oneDay'),
  '7d': () => t('periods.sevenDays'), 
  '14d': () => t('periods.fourteenDays'),
  '30d': () => t('periods.thirtyDays'),
  '90d': () => t('periods.ninetyDays'),
  '1y': () => t('periods.oneYear'),
  
  // Short formats to readable
  'today': () => t('periods.today'),
  'yesterday': () => t('periods.yesterday'),
  'week': () => t('periods.thisWeek'),
  'month': () => t('periods.thisMonth'),
  'quarter': () => t('periods.thisQuarter'),
  'year': () => t('periods.thisYear'),
  
  // Date ranges
  'last7': () => t('periods.lastSevenDays'),
  'last30': () => t('periods.lastThirtyDays'),
  'last90': () => t('periods.lastNinetyDays'),
  'lastYear': () => t('periods.lastYear'),
  
  // Custom ranges
  'custom': () => t('periods.customRange'),
  'all': () => t('periods.allTime')
};

export function getPeriodLabel(key: string): string {
  const labelFn = periodLabels[key as keyof typeof periodLabels];
  return labelFn ? labelFn() : key;
}

export function createPeriodOptions() {
  return [
    { label: getPeriodLabel('today'), value: '1d' },
    { label: getPeriodLabel('7d'), value: '7d' },
    { label: getPeriodLabel('14d'), value: '14d' },
    { label: getPeriodLabel('30d'), value: '30d' },
    { label: getPeriodLabel('90d'), value: '90d' },
    { label: getPeriodLabel('1y'), value: '1y' },
    { label: getPeriodLabel('custom'), value: 'custom' }
  ];
}