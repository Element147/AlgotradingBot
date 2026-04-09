import type {
  ColumnFiltersState,
  ColumnSizingState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';

export interface InteractiveTablePersistedState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnSizing: ColumnSizingState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
}

export interface VirtualizedTableColumnPreference<TKey extends string> {
  key: TKey;
  width: number;
}

export interface VirtualizedTablePreferences<TKey extends string> {
  columnWidths: Record<TKey, number>;
  columnVisibility: Record<TKey, boolean>;
}

interface LoadVirtualizedTablePreferencesOptions<TKey extends string> {
  tableId: string;
  columns: readonly VirtualizedTableColumnPreference<TKey>[];
  minColumnWidth: number;
  legacyWidthsStorageKey?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonObject = (raw: string | null): Record<string, unknown> | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const interactiveTableStorageKey = (tableId: string) => `interactive-table:${tableId}`;

export const buildDefaultInteractiveTableState = (
  initialPageSize: number
): InteractiveTablePersistedState => ({
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  columnSizing: {},
  columnVisibility: {},
  pagination: {
    pageIndex: 0,
    pageSize: initialPageSize,
  },
});

export const coerceColumnSizingState = (value: unknown): ColumnSizingState => {
  if (!isRecord(value)) {
    return {};
  }

  const nextState: ColumnSizingState = {};
  Object.entries(value).forEach(([key, width]) => {
    if (typeof width === 'number' && Number.isFinite(width) && width > 0) {
      nextState[key] = width;
    }
  });
  return nextState;
};

export const coerceColumnVisibilityState = (value: unknown): VisibilityState => {
  if (!isRecord(value)) {
    return {};
  }

  const nextState: VisibilityState = {};
  Object.entries(value).forEach(([key, visible]) => {
    if (typeof visible === 'boolean') {
      nextState[key] = visible;
    }
  });
  return nextState;
};

export const loadInteractiveTableState = (
  tableId: string,
  initialPageSize: number
): InteractiveTablePersistedState => {
  if (typeof window === 'undefined') {
    return buildDefaultInteractiveTableState(initialPageSize);
  }

  const parsed = parseJsonObject(window.localStorage.getItem(interactiveTableStorageKey(tableId)));
  if (!parsed) {
    return buildDefaultInteractiveTableState(initialPageSize);
  }

  return {
    sorting: Array.isArray(parsed.sorting) ? (parsed.sorting as SortingState) : [],
    columnFilters: Array.isArray(parsed.columnFilters)
      ? (parsed.columnFilters as ColumnFiltersState)
      : [],
    globalFilter: typeof parsed.globalFilter === 'string' ? parsed.globalFilter : '',
    columnSizing: coerceColumnSizingState(parsed.columnSizing),
    columnVisibility: coerceColumnVisibilityState(parsed.columnVisibility),
    pagination: {
      pageIndex:
        typeof parsed.pagination === 'object' &&
        parsed.pagination !== null &&
        typeof (parsed.pagination as PaginationState).pageIndex === 'number' &&
        (parsed.pagination as PaginationState).pageIndex >= 0
          ? (parsed.pagination as PaginationState).pageIndex
          : 0,
      pageSize:
        typeof parsed.pagination === 'object' &&
        parsed.pagination !== null &&
        typeof (parsed.pagination as PaginationState).pageSize === 'number' &&
        (parsed.pagination as PaginationState).pageSize > 0
          ? (parsed.pagination as PaginationState).pageSize
          : initialPageSize,
    },
  };
};

export const persistInteractiveTablePreferences = (
  tableId: string,
  state: Partial<Pick<InteractiveTablePersistedState, 'columnSizing' | 'columnVisibility'>>
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const current = parseJsonObject(window.localStorage.getItem(interactiveTableStorageKey(tableId))) ?? {};
  const nextState = {
    ...current,
    ...(state.columnSizing ? { columnSizing: state.columnSizing } : {}),
    ...(state.columnVisibility ? { columnVisibility: state.columnVisibility } : {}),
  };
  window.localStorage.setItem(interactiveTableStorageKey(tableId), JSON.stringify(nextState));
};

export const loadVirtualizedTablePreferences = <TKey extends string>({
  tableId,
  columns,
  minColumnWidth,
  legacyWidthsStorageKey,
}: LoadVirtualizedTablePreferencesOptions<TKey>): VirtualizedTablePreferences<TKey> => {
  const defaultWidths = columns.reduce(
    (accumulator, column) => {
      accumulator[column.key] = column.width;
      return accumulator;
    },
    {} as Record<TKey, number>
  );
  const defaultVisibility = columns.reduce(
    (accumulator, column) => {
      accumulator[column.key] = true;
      return accumulator;
    },
    {} as Record<TKey, boolean>
  );

  if (typeof window === 'undefined') {
    return {
      columnWidths: defaultWidths,
      columnVisibility: defaultVisibility,
    };
  }

  const parsed = parseJsonObject(window.localStorage.getItem(interactiveTableStorageKey(tableId)));
  const persistedSizing = coerceColumnSizingState(parsed?.columnSizing);
  const persistedVisibility = coerceColumnVisibilityState(parsed?.columnVisibility);
  const legacyWidths =
    legacyWidthsStorageKey && Object.keys(persistedSizing).length === 0
      ? coerceColumnSizingState(parseJsonObject(window.localStorage.getItem(legacyWidthsStorageKey)))
      : {};

  return {
    columnWidths: columns.reduce(
      (accumulator, column) => {
        const persistedWidth = persistedSizing[column.key];
        const legacyWidth = legacyWidths[column.key];
        accumulator[column.key] =
          typeof persistedWidth === 'number' && persistedWidth >= minColumnWidth
            ? persistedWidth
            : typeof legacyWidth === 'number' && legacyWidth >= minColumnWidth
              ? legacyWidth
              : column.width;
        return accumulator;
      },
      {} as Record<TKey, number>
    ),
    columnVisibility: columns.reduce(
      (accumulator, column) => {
        accumulator[column.key] =
          typeof persistedVisibility[column.key] === 'boolean'
            ? persistedVisibility[column.key]
            : true;
        return accumulator;
      },
      {} as Record<TKey, boolean>
    ),
  };
};
