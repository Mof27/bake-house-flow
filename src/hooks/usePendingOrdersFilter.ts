
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PendingOrder } from '@/types/queue';

type SortOrder = 'newest' | 'oldest';

interface FilterState {
  selectedFlavor: string | null;
  isPriorityOnly: boolean;
  sortOrder: SortOrder;
}

export const usePendingOrdersFilter = (pendingOrders: PendingOrder[]) => {
  const [filters, setFilters] = useState<FilterState>({
    selectedFlavor: null,
    isPriorityOnly: false,
    sortOrder: 'newest',
  });

  // Reset filters function (needed for external resets)
  const resetFilters = useCallback(() => {
    setFilters({
      selectedFlavor: null,
      isPriorityOnly: false,
      sortOrder: 'newest',
    });
  }, []);

  const handleFlavorChange = (flavor: string | null) => {
    setFilters(prev => ({ ...prev, selectedFlavor: flavor }));
  };

  const handlePriorityChange = (isPriorityOnly: boolean) => {
    setFilters(prev => ({ ...prev, isPriorityOnly }));
  };

  const handleSortOrderChange = (sortOrder: SortOrder) => {
    setFilters(prev => ({ ...prev, sortOrder }));
  };

  // Apply filters to the pendingOrders
  const filteredOrders = useMemo(() => {
    let filtered = [...pendingOrders];

    if (filters.selectedFlavor) {
      filtered = filtered.filter(order => order.flavor === filters.selectedFlavor);
    }

    if (filters.isPriorityOnly) {
      filtered = filtered.filter(order => order.isPriority);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.requestedAt).getTime();
      const dateB = new Date(b.requestedAt).getTime();
      return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [pendingOrders, filters]);

  return {
    filters,
    filteredOrders,
    handleFlavorChange,
    handlePriorityChange,
    handleSortOrderChange,
    resetFilters
  };
};
