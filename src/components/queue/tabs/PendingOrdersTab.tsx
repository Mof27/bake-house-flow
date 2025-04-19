import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { PendingOrder, CakeFlavor } from '@/types/queue';
import PendingCard from '@/components/queue/PendingCard';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';

interface PendingOrdersTabProps {
  pendingOrders: PendingOrder[];
  onStartMixing: (orderId: string, mixerId: number) => void;
}

const PendingOrdersTab: React.FC<PendingOrdersTabProps> = ({
  pendingOrders,
  onStartMixing,
}) => {
  const location = useLocation();
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavor | 'all'>('all');
  const [isPriorityOnly, setIsPriorityOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [forceRender, setForceRender] = useState(0);

  // When the query parameter is present, enforce a re-render to help with scrolling
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    if (showNewest === 'true') {
      // Force a re-render to help with scroll position
      setForceRender(prev => prev + 1);
    }
  }, [location.search, pendingOrders.length]);

  const filteredOrders = useMemo(() => {
    return pendingOrders
      .filter(order => {
        const flavorMatch = selectedFlavor === 'all' || order.flavor === selectedFlavor;
        const priorityMatch = !isPriorityOnly || order.isPriority;
        return flavorMatch && priorityMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.requestedAt).getTime();
        const timeB = new Date(b.requestedAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [pendingOrders, selectedFlavor, isPriorityOnly, sortOrder]);

  const handleFlavorChange = (flavor: CakeFlavor | 'all') => {
    setSelectedFlavor(flavor);
  };

  const handlePriorityChange = (isPriority: boolean) => {
    setIsPriorityOnly(isPriority);
  };

  return (
    <TabsContent value="pending" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-2" key={forceRender}>
        {pendingOrders.length > 0 ? (
          <ScrollableCardSection 
            title="Pending Orders"
            selectedFlavor={selectedFlavor}
            onFlavorChange={handleFlavorChange}
            showFilters={true}
            showPriorityFilter={true}
            isPriorityOnly={isPriorityOnly}
            onPriorityChange={handlePriorityChange}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
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
