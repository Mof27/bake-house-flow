
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

export const generateBatchLabel = (flavor: string, size: number, shape: string): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase().substring(0, 3);
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const flavorCode = flavor === 'vanilla' ? 'VC' : 'DC';
  const shapeCode = shape.charAt(0).toUpperCase();
  
  return `${size}cm-${shapeCode}${flavorCode}-${day}${month}-${time}`;
};

import { ManualBakerOrder } from '@/types/orders';
