
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useQuantityOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleQuantityChange = (orderId: string, delta: number) => {
    setMockData(prev => ({
      ...prev,
      ovenReady: prev.ovenReady.map(order => 
        order.id === orderId 
          ? { ...order, producedQuantity: Math.max(1, order.producedQuantity + delta) }
          : order
      )
    }));
  };

  return { handleQuantityChange };
};
