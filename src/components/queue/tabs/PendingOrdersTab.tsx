
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PendingOrder } from '@/types/queue';
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
  return (
    <TabsContent value="pending" className="mt-0 h-full">
      <ScrollArea className="h-full">
        <div className="space-y-4 pb-4">
          {pendingOrders.length > 0 ? (
            <ScrollableCardSection title="Pending Orders">
              {pendingOrders.map(order => (
                <MixingCard 
                  key={order.id}
                  flavor={order.flavor}
                  shape={order.shape}
                  size={order.size}
                  batchLabel={order.batchLabel}
                  // Remove requestedQuantity as it's not in the ActiveMixingCardProps interface
                  requestedAt={order.requestedAt}
                  isPriority={order.isPriority}
                  isNew={order.isNew}
                  notes={order.notes}
                  onStartMixing={() => onStartMixing(order.id)}
                />
              ))}
            </ScrollableCardSection>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No batches in the pending queue</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default PendingOrdersTab;
