import React, { useState, useMemo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { PendingOrder, CakeFlavor } from '@/types/queue';
import MixingCard from '@/components/queue/MixingCard';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';

interface PendingOrdersTabProps {
  pendingOrders: PendingOrder[];
  onStartMixing: (orderId: string, mixerId: number) => void;
}

const PendingOrdersTab: React.FC<PendingOrdersTabProps> = ({
  pendingOrders,
  onStartMixing,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavor | 'all'>('all');
  const [isPriorityOnly, setIsPriorityOnly] = useState(false);

  const filteredOrders = useMemo(() => {
    return pendingOrders.filter(order => {
      const flavorMatch = selectedFlavor === 'all' || order.flavor === selectedFlavor;
      const priorityMatch = !isPriorityOnly || order.isPriority;
      return flavorMatch && priorityMatch;
    });
  }, [pendingOrders, selectedFlavor, isPriorityOnly]);

  return (
    <TabsContent value="pending" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-2">
        {pendingOrders.length > 0 ? (
          <ScrollableCardSection 
            title="Pending Orders"
            selectedFlavor={selectedFlavor}
            onFlavorChange={setSelectedFlavor}
            showFilters={true}
            showPriorityFilter={true}
            isPriorityOnly={isPriorityOnly}
            onPriorityChange={setIsPriorityOnly}
          >
            {filteredOrders.map(order => (
              <MixingCard 
                key={order.id}
                flavor={order.flavor}
                shape={order.shape}
                size={order.size}
                batchLabel={order.batchLabel}
                requestedAt={order.requestedAt}
                isPriority={order.isPriority}
                notes={order.notes}
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
