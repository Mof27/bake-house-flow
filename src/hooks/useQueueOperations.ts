
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

  const handleStartMixing = (orderId: string, setActiveTab: (tab: string) => void) => {
    const orderToMove = mockData.pendingOrders.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
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
    }));
    
    toast.success("Started mixing process");
    setActiveTab('in-progress');
  };

  const handleCancelTimer = (orderId: string) => {
    const orderToMove = mockData.activeMixing.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
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
    }));
    
    toast("Mixing cancelled", { 
      description: "Order returned to pending queue" 
    });
  };

  const handleMixingComplete = (orderId: string) => {
    const orderToMove = mockData.activeMixing.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
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
    }));
    
    toast.success("Mixing complete! Order ready for oven.");
  };

  const handleOvenComplete = (ovenNumber: number, activeTab: string, setActiveTab: (tab: string) => void) => {
    setMockData(prev => {
      const oven = prev.ovens.find(o => o.number === ovenNumber);
      if (!oven) return prev;
      
      const newDailyCompleted = Math.min(
        prev.dailyCompleted + oven.batches.length,
        prev.dailyTarget
      );
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${oven.batches.length} batches successfully baked.`
      });
      
      const completedBatches = oven.batches.map(batch => ({
        ...batch,
        completedAt: new Date()
      }));
      
      const updatedOvens = prev.ovens.map(o => {
        if (o.number === ovenNumber) {
          return {
            ...o,
            isActive: false,
            timeRemaining: undefined,
            currentBatch: undefined,
            batches: []
          };
        }
        return o;
      });
      
      return {
        ...prev,
        dailyCompleted: newDailyCompleted,
        ovens: updatedOvens,
        completedBatches: [...prev.completedBatches, ...completedBatches]
      };
    });
    
    if (activeTab === 'in-progress') {
      const noActiveMixing = mockData.activeMixing.length === 0;
      const noOvenReady = mockData.ovenReady.length === 0;
      const noActiveOvens = mockData.ovens.every(oven => !oven.isActive);
      
      if (noActiveMixing && noOvenReady && noActiveOvens) {
        setActiveTab('done');
      }
    }
  };

  return {
    handleQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
    handleOvenComplete
  };
};
