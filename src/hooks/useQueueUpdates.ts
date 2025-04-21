
import { useState, useEffect } from 'react';
import { MockData, PendingOrder, OvenReadyBatch, CompletedBatch, ActiveMixing } from '@/types/queue';
import { useOrders } from '@/contexts/OrderContext';

/**
 * This hook now transforms "orders" from the OrderContext (Supabase-backed)
 * into the correct MockData structure for queue visualization.
 */
const defaultMock: MockData = {
  dailyCompleted: 0,
  dailyTarget: 20,
  pendingOrders: [],
  activeMixing: [],
  ovenReady: [],
  ovens: [
    { number: 1, isActive: false, batches: [] },
    { number: 2, isActive: false, batches: [] },
  ],
  completedBatches: [],
};

export const useQueueUpdates = (initialData: Partial<MockData> = {}) => {
  const [mockData, setMockData] = useState<MockData>({...defaultMock, ...initialData});
  const { orders } = useOrders();

  useEffect(() => {
    console.log("Orders changed, updating queue data:", orders);
    
    if (!orders || orders.length === 0) {
      return;
    }
    
    // Classify orders into correct Tab groups
    const pendingOrders: PendingOrder[] = [];
    const activeMixing: ActiveMixing[] = [];
    const ovenReady: OvenReadyBatch[] = [];
    const completedBatches: CompletedBatch[] = [];
    let dailyCompleted = 0;

    orders.forEach((order) => {
      const base = {
        id: order.id,
        flavor: order.flavor,
        shape: order.shape,
        size: order.size,
        batchLabel: order.batchLabel,
        requestedAt: order.createdAt,
        isPriority: order.isPriority,
        requestedQuantity: order.requestedQuantity,
        producedQuantity: order.producedQuantity ?? order.requestedQuantity,
        notes: order.notes,
      };

      if (order.status === 'queued') {
        pendingOrders.push(base as PendingOrder);
      } else if (order.status === 'mixing') {
        activeMixing.push({
          ...base,
          startTime: order.startedAt || order.createdAt
        } as ActiveMixing);
      } else if (order.status === 'baking') {
        // For this mock we treat baking as oven-ready
        ovenReady.push(base as OvenReadyBatch);
      } else if (order.status === 'done') {
        completedBatches.push({
          ...base,
          completedAt: order.completedAt || new Date(),
        } as CompletedBatch);
        dailyCompleted += 1;
      }
    });

    setMockData(prevData => ({
      dailyCompleted,
      dailyTarget: prevData.dailyTarget || 20, // preserve existing target or use default
      pendingOrders,
      activeMixing,
      ovenReady,
      ovens: [
        { number: 1, isActive: false, batches: [] },
        { number: 2, isActive: false, batches: [] },
      ],
      completedBatches,
    }));
  }, [orders]);

  return { mockData, setMockData };
};
