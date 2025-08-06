import { ref, Ref } from 'vue';

export interface TablePagination {
  sortBy?: string;
  descending?: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}

export interface SortableColumn {
  name: string;
  field: string | ((row: any) => any);
  sortable?: boolean;
}

export function useTableSorting(
  initialPagination: Partial<TablePagination> = {}
) {
  const pagination = ref<TablePagination>({
    sortBy: undefined,
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    ...initialPagination,
  });

  const onTableRequest = (props: any) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    
    // Update pagination state - this triggers reactivity
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
    
    // Keep existing rowsNumber if not provided
    if (props.pagination.rowsNumber !== undefined) {
      pagination.value.rowsNumber = props.pagination.rowsNumber;
    }
  };

  const sortData = <T>(
    data: T[], 
    sortBy?: string, 
    descending?: boolean,
    customSorter?: (a: T, b: T, sortBy: string, descending: boolean) => number
  ): T[] => {
    if (!sortBy || !data.length) return data;

    return [...data].sort((a: any, b: any) => {
      // Use custom sorter if provided
      if (customSorter) {
        return customSorter(a, b, sortBy, descending);
      }

      // Get values using field accessor (support for nested fields and functions)
      let aVal = getFieldValue(a, sortBy);
      let bVal = getFieldValue(b, sortBy);

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return descending ? 1 : -1;
      if (bVal == null) return descending ? -1 : 1;

      // Handle dates
      if (isDate(aVal) && isDate(bVal)) {
        const aTime = new Date(aVal).getTime();
        const bTime = new Date(bVal).getTime();
        return descending ? bTime - aTime : aTime - bTime;
      }

      // Handle numbers (including numeric strings)
      if (isNumeric(aVal) && isNumeric(bVal)) {
        const aNum = parseFloat(String(aVal));
        const bNum = parseFloat(String(bVal));
        return descending ? bNum - aNum : aNum - bNum;
      }

      // Handle booleans
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        if (aVal === bVal) return 0;
        // true should come before false when ascending, after when descending
        const result = aVal ? -1 : 1;
        return descending ? -result : result;
      }

      // Handle strings (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return descending ? -result : result;
      }

      // Fallback: convert to string and compare
      const result = String(aVal).localeCompare(String(bVal));
      return descending ? -result : result;
    });
  };

  // Helper function to get field value (supports nested fields and functions)
  const getFieldValue = (obj: any, field: string): any => {
    if (typeof field === 'function') {
      return field(obj);
    }
    
    // Support nested field access (e.g., 'product.name')
    return field.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Helper function to check if value is a date
  const isDate = (value: any): boolean => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && 
           (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) ||
           value instanceof Date;
  };

  // Helper function to check if value is numeric
  const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  return {
    pagination,
    onTableRequest,
    sortData,
    getFieldValue,
  };
}