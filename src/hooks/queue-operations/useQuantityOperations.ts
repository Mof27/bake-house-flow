
import { MockData, ActiveMixing } from '@/types/queue';
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

  const handleMixingQuantityChange = (orderId: string, delta: number) => {
    setMockData(prev => {
      // Find the active mixing item
      const mixingItem = prev.activeMixing.find(item => item.id === orderId);
      
      if (!mixingItem) {
        return prev;
      }

      // Update the producedQuantity for when it moves to the oven ready state
      return {
        ...prev,
        activeMixing: prev.activeMixing.map(item => 
          item.id === orderId
            ? { ...item, producedQuantity: Math.max(1, (item.producedQuantity || item.requestedQuantity || 5) + delta) }
            : item
        )
      };
    });

    toast.info(`Quantity ${delta > 0 ? 'increased' : 'decreased'} for batch`);
  };

  return { handleQuantityChange, handleMixingQuantityChange };
};
