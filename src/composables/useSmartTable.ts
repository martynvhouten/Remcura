import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { logger } from '@/utils/logger';

export interface TableRow {
  [key: string]: unknown;
}

export interface TableFilters {
  search?: string;
  [key: string]: unknown;
}

export interface TablePagination {
  sortBy?: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export interface SmartTableLoadResult<Row extends TableRow = TableRow> {
  data: Row[];
  totalCount: number;
}

export interface SmartTableConfig<Row extends TableRow = TableRow> {
  clientSideThreshold?: number;
  virtualizationThreshold?: number;
  serverSideLoader?: (
    pagination: TablePagination,
    filters: TableFilters
  ) => Promise<SmartTableLoadResult<Row>>;
  debounceMs?: number;
  itemHeight?: number;
}

export type TableStrategy = 'client-side' | 'server-side' | 'virtualized';

export function useSmartTable<Row extends TableRow = TableRow>(
  config: SmartTableConfig<Row> = {}
) {
  const $q = useQuasar();

  const {
    clientSideThreshold = 1000,
    virtualizationThreshold = 5000,
    serverSideLoader,
    debounceMs = 300,
    itemHeight = 50,
  } = config;

  const loading = ref(false);
  const totalCount = ref(0);
  const rawData = ref<Row[]>([]);
  const filteredData = ref<Row[]>([]);
  const visibleData = ref<Row[]>([]);

  const pagination = ref<TablePagination>({
    sortBy: undefined,
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
  });

  const filters = ref<TableFilters>({});

  const strategy = computed<TableStrategy>(() => {
    const count = totalCount.value || rawData.value.length;

    if (count >= virtualizationThreshold) {
      return 'virtualized';
    }

    if (count >= clientSideThreshold) {
      return 'server-side';
    }

    return 'client-side';
  });

  const applyClientSideOperations = (
    data: Row[],
    sortBy?: string,
    descending = false,
    filterObj: TableFilters = {}
  ) => {
    let result = [...data];

    Object.entries(filterObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'search' && typeof value === 'string') {
          const searchValue = value.toLowerCase();
          result = result.filter(item =>
            Object.values(item).some(val =>
              typeof val === 'string'
                ? val.toLowerCase().includes(searchValue)
                : String(val).toLowerCase().includes(searchValue)
            )
          );
        } else {
          result = result.filter(item => item[key] === value);
        }
      }
    });

    if (sortBy) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a, sortBy);
        const bVal = getNestedValue(b, sortBy);

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return descending ? 1 : -1;
        if (bVal === null || bVal === undefined) return descending ? -1 : 1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return descending ? bVal - aVal : aVal - bVal;
        }

        if (isDate(aVal) && isDate(bVal)) {
          const aTime = new Date(aVal).getTime();
          const bTime = new Date(bVal).getTime();
          return descending ? bTime - aTime : aTime - bTime;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return descending ? -comparison : comparison;
      });
    }

    return result;
  };

  const getNestedValue = (obj: Row, path: string): unknown => {
    return path.split('.').reduce<unknown>((current, key) => {
      if (
        current &&
        typeof current === 'object' &&
        !Array.isArray(current) &&
        key in current
      ) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  const isDate = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value);
  };

  let filterTimeout: ReturnType<typeof setTimeout> | undefined;
  const debouncedFilter = (newFilters: TableFilters) => {
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    filterTimeout = setTimeout(() => {
      filters.value = { ...newFilters };

      if (strategy.value === 'server-side') {
        void loadServerSideData();
      } else {
        applyClientSideFilters();
      }
    }, debounceMs);
  };

  const applyClientSideFilters = () => {
    filteredData.value = applyClientSideOperations(
      rawData.value as Row[],
      pagination.value.sortBy,
      pagination.value.descending,
      filters.value
    );

    pagination.value.rowsNumber = filteredData.value.length;

    if (strategy.value === 'client-side') {
      const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
      const end = start + pagination.value.rowsPerPage;
      visibleData.value = filteredData.value.slice(start, end);
    } else {
      visibleData.value = filteredData.value;
    }
  };

  const loadServerSideData = async () => {
    if (!serverSideLoader) {
      logger.warn(
        'Server-side strategy selected but no serverSideLoader provided',
        'SMART_TABLE'
      );
      return;
    }

    loading.value = true;

    try {
      const result = await serverSideLoader(pagination.value, filters.value);
      visibleData.value = result.data;
      totalCount.value = result.totalCount;
      pagination.value.rowsNumber = result.totalCount;
    } catch (error) {
      logger.error(
        'Failed to load server-side data',
        'SMART_TABLE',
        error instanceof Error ? error : undefined
      );
      $q.notify({
        type: 'negative',
        message: 'Failed to load data',
      });
    } finally {
      loading.value = false;
    }
  };

  const onTableRequest = async (props: { pagination: TablePagination }) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

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

  const setData = (data: Row[]) => {
    rawData.value = data;
    totalCount.value = data.length;
    applyClientSideFilters();
  };

  const loadData = async (loader?: () => Promise<Row[]>) => {
    if (!loader) return;

    loading.value = true;

    try {
      const data = await loader();
      setData(data);
    } catch (error) {
      logger.error(
        'Failed to load initial data',
        'SMART_TABLE',
        error instanceof Error ? error : undefined
      );
      $q.notify({
        type: 'negative',
        message: 'Failed to load data',
      });
    } finally {
      loading.value = false;
    }
  };

  watch(strategy, (newStrategy, oldStrategy) => {
    if (newStrategy === oldStrategy) return;

    logger.info(
      `Table strategy changed from ${oldStrategy} to ${newStrategy}`,
      'SMART_TABLE'
    );

    if (newStrategy === 'server-side') {
      void loadServerSideData();
    } else {
      applyClientSideFilters();
    }
  });

  return {
    loading,
    strategy,
    pagination,
    filters,
    visibleData,
    totalCount,
    setData,
    loadData,
    onTableRequest,
    setFilters: debouncedFilter,
    itemHeight,
    isServerSide: computed(() => strategy.value === 'server-side'),
    isVirtualized: computed(() => strategy.value === 'virtualized'),
    isClientSide: computed(() => strategy.value === 'client-side'),
  } as const;
}
