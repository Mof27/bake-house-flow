
// AI time estimator function
export const estimateBakeTime = (): number => {
  // Base time (in minutes) + complexity factor
  const baseTime = 20;
  const complexityFactor = 3 * 5;
  return baseTime + complexityFactor;
};

export const updateOrdersArray = (
  orders: Order[], 
  orderId: string, 
  updateFn: (order: Order) => Order
): Order[] => {
  return orders.map(order => 
    order.id === orderId ? updateFn(order) : order
  );
};

import { Order } from '@/types/orders';
