
import { useState, useMemo } from 'react';
import { PendingOrder, CakeFlavor } from '@/types/queue';

interface FilterState {
  selectedFlavor: CakeFlavor | 'all';
  isPriorityOnly: boolean;
  sortOrder: 'asc' | 'desc';
}

export function usePendingOrdersFilter(pendingOrders: PendingOrder[]) {
  const [filterState, setFilterState] = useState<FilterState>({
    selectedFlavor: 'all',
    isPriorityOnly: false,
    sortOrder: 'asc'
  });

  // Filtered and sorted orders based on current filter state
  const filteredOrders = useMemo(() => {
    return pendingOrders
      .filter(order => {
        const flavorMatch = filterState.selectedFlavor === 'all' || order.flavor === filterState.selectedFlavor;
        const priorityMatch = !filterState.isPriorityOnly || order.isPriority;
        return flavorMatch && priorityMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.requestedAt).getTime();
        const timeB = new Date(b.requestedAt).getTime();
        return filterState.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [pendingOrders, filterState.selectedFlavor, filterState.isPriorityOnly, filterState.sortOrder]);

  // Handler functions
  const handleFlavorChange = (flavor: CakeFlavor | 'all') => {
    setFilterState(prev => ({ ...prev, selectedFlavor: flavor }));
  };

  const handlePriorityChange = (isPriority: boolean) => {
    setFilterState(prev => ({ ...prev, isPriorityOnly: isPriority }));
  };

  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setFilterState(prev => ({ ...prev, sortOrder: order }));
  };

  return {
    filters: filterState,
    filteredOrders,
    handleFlavorChange,
    handlePriorityChange,
    handleSortOrderChange
  };
}
