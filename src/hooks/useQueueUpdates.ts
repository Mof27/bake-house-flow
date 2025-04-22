
import { useState, useEffect } from 'react';
import { MockData, PendingOrder, OvenReadyBatch, CompletedBatch, ActiveMixing } from '@/types/queue';
import { useOrders } from '@/contexts/OrderContext';
import { isEqual } from 'lodash';

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
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);
  const { orders } = useOrders();

  useEffect(() => {
    console.log("Orders changed, updating queue data:", orders);
    
    if (!orders || orders.length === 0) {
      return;
    }
    
    // Check if the orders array has changed (shallow comparison)
    if (isEqual(orders, previousOrders)) {
      console.log("Orders unchanged, skipping update");
      return;
    }
    
    // Store current orders for future comparison
    setPreviousOrders(orders);
    
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

    setMockData(prevData => {
      // Preserve any client-side state that isn't stored in the DB
      return {
        // Preserve daily target from previous state
        dailyTarget: prevData.dailyTarget,
        // Use calculated daily completed or preserve if no completed items found
        dailyCompleted: dailyCompleted || prevData.dailyCompleted,
        pendingOrders,
        activeMixing,
        ovenReady,
        // Preserve oven state which might not be in the database
        ovens: prevData.ovens.map(oven => {
          // If an oven was active, try to maintain its state
          if (oven.isActive) {
            return oven;
          }
          return { 
            number: oven.number, 
            isActive: false, 
            batches: [] 
          };
        }),
        completedBatches,
      };
    });
  }, [orders]);

  return { mockData, setMockData };
};
