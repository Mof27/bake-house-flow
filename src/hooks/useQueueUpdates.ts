
import { useState, useEffect } from 'react';
import { MockData, PendingOrder } from '@/types/queue';
import { toast } from 'sonner';
import { useOrders } from '@/contexts/OrderContext';

export const useQueueUpdates = (initialData: MockData) => {
  const [mockData, setMockData] = useState<MockData>(initialData);
  const { orders } = useOrders();

  useEffect(() => {
    if (orders.length > 0) {
      const newPendingOrders: PendingOrder[] = orders
        .filter(order => order.status === 'queued')
        .map(order => ({
          id: order.id,
          flavor: order.flavor,
          shape: order.shape,
          size: order.size,
          batchLabel: order.batchLabel,
          requestedQuantity: order.requestedQuantity,
          producedQuantity: order.producedQuantity,
          requestedAt: order.createdAt,
          isPriority: order.isPriority,
          notes: order.notes,
          isNew: true
        }));

      if (newPendingOrders.length > 0) {
        setMockData(prevMockData => ({
          ...prevMockData,
          pendingOrders: [...newPendingOrders, ...prevMockData.pendingOrders.filter(
            existingOrder => !newPendingOrders.some(newOrder => newOrder.id === existingOrder.id)
          )]
        }));

        toast.success("Queue updated with new orders", {
          description: `${newPendingOrders.length} new orders added to the queue`,
        });
      }
    }
  }, [orders]);

  return { mockData, setMockData };
};
