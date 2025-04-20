
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

const MAX_ITEMS_PER_MIXER = 5;

export const useMixingOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleStartMixing = (orderId: string, mixerNumber: number) => {
    setMockData(prev => {
      // Check if the selected mixer is full (has 5 items already)
      const currentMixerItems = prev.activeMixing.filter(item => 
        item.batchLabel.includes(`Mixer #${mixerNumber}`)
      );
      
      if (currentMixerItems.length >= MAX_ITEMS_PER_MIXER) {
        toast.error(`Mixer #${mixerNumber} is full! Maximum ${MAX_ITEMS_PER_MIXER} items allowed.`);
        return prev; // Return unchanged state
      }
      
      const orderToMove = prev.pendingOrders.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      // Add the mixer number to the batch label
      const updatedBatchLabel = `${orderToMove.batchLabel} (Mixer #${mixerNumber})`;
      
      return {
        ...prev,
        pendingOrders: prev.pendingOrders.filter(order => order.id !== orderId),
        activeMixing: [...prev.activeMixing, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: updatedBatchLabel,
          requestedAt: orderToMove.requestedAt,
          isPriority: orderToMove.isPriority,
          startTime: new Date()
        }]
      };
    });
    
    toast.success(`Started mixing process in Mixer #${mixerNumber}`);
  };

  const handleCancelTimer = (orderId: string) => {
    setMockData(prev => {
      const orderToMove = prev.activeMixing.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      // Remove the mixer number from batch label when returning to pending
      const originalBatchLabel = orderToMove.batchLabel.replace(/ \(Mixer #[1-2]\)/, '');
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        pendingOrders: [...prev.pendingOrders, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: originalBatchLabel,
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
      
      // Remove the mixer number from batch label when moving to oven ready
      const originalBatchLabel = orderToMove.batchLabel.replace(/ \(Mixer #[1-2]\)/, '');
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        ovenReady: [...prev.ovenReady, { 
          id: orderToMove.id,
          flavor: orderToMove.flavor,
          shape: orderToMove.shape,
          size: orderToMove.size,
          batchLabel: originalBatchLabel,
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
