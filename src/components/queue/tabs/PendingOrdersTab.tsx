
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { PendingOrder } from '@/types/queue';
import PendingCard from '@/components/queue/PendingCard';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';
import { usePendingOrdersFilter } from '@/hooks/usePendingOrdersFilter';

interface PendingOrdersTabProps {
  pendingOrders: PendingOrder[];
  onStartMixing: (orderId: string, mixerId: number) => void;
}

const PendingOrdersTab: React.FC<PendingOrdersTabProps> = ({
  pendingOrders,
  onStartMixing,
}) => {
  const location = useLocation();
  const [forceRender, setForceRender] = useState(0);
  const { 
    filters, 
    filteredOrders, 
    handleFlavorChange, 
    handlePriorityChange, 
    handleSortOrderChange,
    resetFilters
  } = usePendingOrdersFilter(pendingOrders);

  // When the query parameter is present, enforce a re-render to help with scrolling
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    if (showNewest === 'true') {
      // Force a re-render and reset filters to ensure newest orders are visible
      setForceRender(prev => prev + 1);
      resetFilters();
    }
  }, [location.search, pendingOrders.length, resetFilters]);
  
  // Force recheck of filtered orders when pending orders change
  useEffect(() => {
    // This will ensure filtered orders are recalculated when pendingOrders change
    setForceRender(prev => prev + 1);
  }, [pendingOrders.length]);

  return (
    <TabsContent value="pending" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-2" key={forceRender}>
        {pendingOrders.length > 0 ? (
          <ScrollableCardSection 
            title="Pending Orders"
            selectedFlavor={filters.selectedFlavor}
            onFlavorChange={(flavor) => handleFlavorChange(flavor as any)}
            showFilters={true}
            showPriorityFilter={true}
            isPriorityOnly={filters.isPriorityOnly}
            onPriorityChange={handlePriorityChange}
            sortOrder={filters.sortOrder as any}
            onSortOrderChange={(order) => handleSortOrderChange(order as any)}
          >
            {filteredOrders.map(order => (
              <PendingCard 
                key={order.id}
                flavor={order.flavor}
                shape={order.shape}
                size={order.size}
                batchLabel={order.batchLabel}
                requestedAt={order.requestedAt}
                isPriority={order.isPriority}
                notes={order.notes}
                requestedQuantity={order.requestedQuantity}
                onAction={(mixerId) => onStartMixing(order.id, mixerId)}
              />
            ))}
          </ScrollableCardSection>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No batches in the pending queue</p>
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default PendingOrdersTab;
