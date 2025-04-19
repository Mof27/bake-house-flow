
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useMixingOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleStartMixing = (orderId: string) => {
    setMockData(prev => {
      const orderToMove = prev.pendingOrders.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      return {
        ...prev,
        pendingOrders: prev.pendingOrders.filter(order => order.id !== orderId),
        activeMixing: [...prev.activeMixing, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: orderToMove.batchLabel,
          requestedAt: orderToMove.requestedAt,
          isPriority: orderToMove.isPriority,
          startTime: new Date()
        }]
      };
    });
    
    toast.success("Started mixing process");
  };

  const handleCancelTimer = (orderId: string) => {
    setMockData(prev => {
      const orderToMove = prev.activeMixing.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        pendingOrders: [...prev.pendingOrders, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: orderToMove.batchLabel,
          requestedAt: orderToMove.requestedAt,
          isPriority: orderToMove.isPriority,
          requestedQuantity: 5,
          producedQuantity: 5
        }]
      };
    });
    
    toast("Mixing cancelled", { 
      description: "Order returned to pending queue" 
    });
  };

  const handleMixingComplete = (orderId: string) => {
    setMockData(prev => {
      const orderToMove = prev.activeMixing.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        ovenReady: [...prev.ovenReady, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: orderToMove.batchLabel,
          requestedAt: orderToMove.requestedAt,
          isPriority: orderToMove.isPriority,
          requestedQuantity: 5,
          producedQuantity: 5
        }]
      };
    });
    
    toast.success("Mixing complete! Order ready for oven.");
  };

  return {
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
  };
};
