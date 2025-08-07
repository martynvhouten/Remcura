import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';

export interface SmartTableConfig {
  // Thresholds for switching strategies
  clientSideThreshold?: number;      // Default: 1000 - Switch to server-side
  virtualizationThreshold?: number;  // Default: 5000 - Switch to virtualization
  
  // Server-side config
  serverSideLoader?: (pagination: any, filters: any) => Promise<{ data: any[], totalCount: number }>;
  
  // Performance config
  debounceMs?: number;               // Default: 300ms for search
  itemHeight?: number;               // Default: 50px for virtualization
}

export interface TablePagination {
  sortBy?: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export type TableStrategy = 'client-side' | 'server-side' | 'virtualized';

export function useSmartTable(config: SmartTableConfig = {}) {
  const $q = useQuasar();
  
  // Configuration with defaults
  const {
    clientSideThreshold = 1000,
    virtualizationThreshold = 5000,
    serverSideLoader,
    debounceMs = 300,
    itemHeight = 50
  } = config;
  
  // State
  const loading = ref(false);
  const totalCount = ref(0);
  const rawData = ref<any[]>([]);
  const filteredData = ref<any[]>([]);
  const visibleData = ref<any[]>([]);
  
  // Pagination state
  const pagination = ref<TablePagination>({
    sortBy: undefined,
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0
  });
  
  // Filters
  const filters = ref<Record<string, any>>({});
  
  // Determine the best strategy based on data size
  const strategy = computed<TableStrategy>(() => {
    const count = totalCount.value || rawData.value.length;
    
    if (count >= virtualizationThreshold) {
      return 'virtualized';
    } else if (count >= clientSideThreshold) {
      return 'server-side';
    } else {
      return 'client-side';
    }
  });
  
  // Client-side filtering and sorting
  const applyClientSideOperations = (data: any[], sortBy?: string, descending = false, filterObj = {}) => {
    let result = [...data];
    
    // Apply filters
    Object.entries(filterObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'search' && typeof value === 'string') {
          // Global search across all string fields
          result = result.filter(item =>
            Object.values(item).some(val =>
              String(val).toLowerCase().includes(value.toLowerCase())
            )
          );
        } else {
          // Exact match filter
          result = result.filter(item => item[key] === value);
        }
      }
    });
    
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a, sortBy);
        const bVal = getNestedValue(b, sortBy);
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return descending ? 1 : -1;
        if (bVal === null || bVal === undefined) return descending ? -1 : 1;
        
        // Smart type detection
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return descending ? bVal - aVal : aVal - bVal;
        }
        
        if (isDate(aVal) && isDate(bVal)) {
          const aTime = new Date(aVal).getTime();
          const bTime = new Date(bVal).getTime();
          return descending ? bTime - aTime : aTime - bTime;
        }
        
        // String comparison
        const result = String(aVal).localeCompare(String(bVal));
        return descending ? -result : result;
      });
    }
    
    return result;
  };
  
  // Helper functions
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  const isDate = (value: any): boolean => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
  };
  
  // Debounced filter function
  let filterTimeout: NodeJS.Timeout;
  const debouncedFilter = (newFilters: Record<string, any>) => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      filters.value = { ...newFilters };
      if (strategy.value === 'server-side') {
        loadServerSideData();
      } else {
        applyClientSideFilters();
      }
    }, debounceMs);
  };
  
  // Client-side operations
  const applyClientSideFilters = () => {
    filteredData.value = applyClientSideOperations(
      rawData.value,
      pagination.value.sortBy,
      pagination.value.descending,
      filters.value
    );
    
    pagination.value.rowsNumber = filteredData.value.length;
    
    if (strategy.value === 'client-side') {
      // For client-side, show paginated results
      const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
      const end = start + pagination.value.rowsPerPage;
      visibleData.value = filteredData.value.slice(start, end);
    } else {
      // For virtualized, show all filtered data
      visibleData.value = filteredData.value;
    }
  };
  
  // Server-side loading
  const loadServerSideData = async () => {
    if (!serverSideLoader) {
      console.warn('Server-side strategy selected but no serverSideLoader provided');
      return;
    }
    
    loading.value = true;
    try {
      const result = await serverSideLoader(pagination.value, filters.value);
      visibleData.value = result.data;
      totalCount.value = result.totalCount;
      pagination.value.rowsNumber = result.totalCount;
    } catch (error) {
      console.error('Failed to load server-side data:', error);
      $q.notify({
        type: 'negative',
        message: 'Failed to load data',
      });
    } finally {
      loading.value = false;
    }
  };
  
  // Table request handler (for q-table)
  const onTableRequest = async (props: any) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;
    
    // Update pagination
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
    
    if (strategy.value === 'server-side') {
      await loadServerSideData();
    } else {
      applyClientSideFilters();
    }
  };
  
  // Initialize data
  const setData = (data: any[]) => {
    rawData.value = data;
    totalCount.value = data.length;
    applyClientSideFilters();
  };
  
  // Load initial data
  const loadData = async (loader?: () => Promise<any[]>) => {
    if (loader) {
      loading.value = true;
      try {
        const data = await loader();
        setData(data);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to load data',
        });
      } finally {
        loading.value = false;
      }
    }
  };
  
  // Watch strategy changes
  watch(strategy, (newStrategy, oldStrategy) => {
    if (newStrategy !== oldStrategy) {
      console.log(`Table strategy changed from ${oldStrategy} to ${newStrategy}`);
      
      // Reload data with new strategy
      if (newStrategy === 'server-side') {
        loadServerSideData();
      } else {
        applyClientSideFilters();
      }
    }
  });
  
  return {
    // State
    loading,
    strategy,
    pagination,
    filters,
    visibleData,
    totalCount,
    
    // Methods
    setData,
    loadData,
    onTableRequest,
    setFilters: debouncedFilter,
    
    // Config for components
    itemHeight,
    isServerSide: computed(() => strategy.value === 'server-side'),
    isVirtualized: computed(() => strategy.value === 'virtualized'),
    isClientSide: computed(() => strategy.value === 'client-side'),
  };
}