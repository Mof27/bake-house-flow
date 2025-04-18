
import { toast } from 'sonner';
import { MockData } from '@/types/queue';

export const useQueueOperations = (mockData: MockData, setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
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

  const handleOvenComplete = (ovenNumber: number) => {
    setMockData(prev => {
      const oven = prev.ovens.find(o => o.number === ovenNumber);
      if (!oven) return prev;
      
      const newDailyCompleted = Math.min(
        prev.dailyCompleted + oven.batches.length,
        prev.dailyTarget
      );
      
      const completedBatches = oven.batches.map(batch => ({
        ...batch,
        completedAt: new Date()
      }));
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${oven.batches.length} batches successfully baked.`
      });
      
      return {
        ...prev,
        dailyCompleted: newDailyCompleted,
        ovens: prev.ovens.map(o => 
          o.number === ovenNumber 
            ? {
                ...o,
                isActive: false,
                timeRemaining: undefined,
                currentBatch: undefined,
                batches: []
              }
            : o
        ),
        completedBatches: [...prev.completedBatches, ...completedBatches]
      };
    });
  };

  return {
    handleQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
    handleOvenComplete
  };
};
