
import React, { useState, useMemo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { PendingOrder, CakeFlavor } from '@/types/queue';
import MixingCard from '@/components/queue/MixingCard';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';

interface PendingOrdersTabProps {
  pendingOrders: PendingOrder[];
  onStartMixing: (orderId: string) => void;
}

const PendingOrdersTab: React.FC<PendingOrdersTabProps> = ({
  pendingOrders,
  onStartMixing,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavor | 'all'>('all');

  const filteredOrders = useMemo(() => {
    if (selectedFlavor === 'all') return pendingOrders;
    return pendingOrders.filter(order => order.flavor === selectedFlavor);
  }, [pendingOrders, selectedFlavor]);

  return (
    <TabsContent value="pending" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-2">
        {pendingOrders.length > 0 ? (
          <ScrollableCardSection 
            title="Pending Orders"
            selectedFlavor={selectedFlavor}
            onFlavorChange={setSelectedFlavor}
            showFilters={true}
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
                actionLabel="Start Mixing"
                onAction={() => onStartMixing(order.id)}
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
