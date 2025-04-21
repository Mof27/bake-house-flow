
// AI time estimator function
export const estimateBakeTime = (): number => {
  // Base time (in minutes) + complexity factor
  const baseTime = 20;
  const complexityFactor = 3 * 5;
  return baseTime + complexityFactor;
};

export const updateOrdersArray = (
  orders: ManualBakerOrder[], 
  orderId: string, 
  updateFn: (order: ManualBakerOrder) => ManualBakerOrder
): ManualBakerOrder[] => {
  return orders.map(order => 
    order.id === orderId ? updateFn(order) : order
  );
};

import { ManualBakerOrder } from '@/types/orders';
