
import { MockData, PendingOrder, OvenReadyBatch } from '@/types/queue';
import { toast } from 'sonner';
import { consolidateMixingItems } from '@/utils/mixingUtils';

const MAX_ITEMS_PER_MIXER = 5;

export const useMixingOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleStartMixing = (orderId: string, mixerNumber: number) => {
    console.log(`Starting mixing process for order ${orderId} in Mixer #${mixerNumber}`);
    
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
      if (!orderToMove) {
        console.error(`Order with ID ${orderId} not found in pending orders`);
        return prev;
      }
      
      // Add the mixer number to the batch label
      const updatedBatchLabel = `${orderToMove.batchLabel} (Mixer #${mixerNumber})`;
      
      // Log the state changes for debugging
      console.log("Moving order from pending to active mixing:", orderToMove);
      console.log("Updated batch label:", updatedBatchLabel);
      
      // Create the new state
      const newState = {
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
          startTime: new Date(),
          requestedQuantity: orderToMove.requestedQuantity,
          producedQuantity: orderToMove.producedQuantity,
          notes: orderToMove.notes
        }]
      };
      
      console.log("New state after moving to mixing:", newState);
      
      return newState;
    });
    
    toast.success(`Started mixing process in Mixer #${mixerNumber}`);
  };

  const handleCancelTimer = (orderId: string) => {
    setMockData(prev => {
      const orderToMove = prev.activeMixing.find(order => order.id === orderId);
      if (!orderToMove) return prev;
      
      // Remove the mixer number from batch label when returning to pending
      const originalBatchLabel = orderToMove.batchLabel.replace(/ \(Mixer #[1-2]\)/, '');
      
      const pendingOrder: PendingOrder = { 
        id: orderToMove.id,
        flavor: orderToMove.flavor,
        shape: orderToMove.shape,
        size: orderToMove.size,
        batchLabel: originalBatchLabel,
        requestedAt: orderToMove.requestedAt,
        isPriority: orderToMove.isPriority,
        requestedQuantity: orderToMove.requestedQuantity || 5,
        producedQuantity: orderToMove.producedQuantity || 5
      };
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        pendingOrders: [...prev.pendingOrders, pendingOrder]
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
      
      // Find all items with the same flavor, shape, and size in the same mixer
      const mixerMatch = orderToMove.batchLabel.match(/Mixer #(\d+)/);
      const mixerNumber = mixerMatch ? parseInt(mixerMatch[1]) : 1;
      
      // Get all items from the same mixer
      const itemsInSameMixer = prev.activeMixing.filter(item => 
        item.batchLabel.includes(`Mixer #${mixerNumber}`)
      );
      
      // Find items with same properties (flavor, shape, size)
      const similarItems = itemsInSameMixer.filter(item => 
        item.flavor === orderToMove.flavor &&
        item.shape === orderToMove.shape &&
        item.size === orderToMove.size
      );
      
      // Only process if there are items to move
      if (similarItems.length === 0) return prev;
      
      // Create a consolidated batch for the oven
      const consolidatedBatch: OvenReadyBatch = {
        id: similarItems.map(item => item.id).join('-'), // Combined ID
        flavor: orderToMove.flavor,
        shape: orderToMove.shape,
        size: orderToMove.size,
        batchLabel: similarItems.map(item => {
          // Extract only the #AXXX part, removing the mixer part
          const codeMatch = item.batchLabel.match(/#A(\d+)/);
          return codeMatch ? `#A${codeMatch[1]}` : '';
        }).filter(Boolean).join(', '),
        requestedAt: new Date(Math.min(...similarItems.map(item => new Date(item.requestedAt).getTime()))),
        isPriority: similarItems.some(item => item.isPriority),
        requestedQuantity: similarItems.reduce((sum, item) => sum + (item.requestedQuantity || 5), 0),
        producedQuantity: similarItems.reduce((sum, item) => sum + (item.producedQuantity || item.requestedQuantity || 5), 0)
      };
      
      return {
        ...prev,
        // Remove all similar items from activeMixing
        activeMixing: prev.activeMixing.filter(item => !similarItems.includes(item)),
        // Add the consolidated batch to ovenReady
        ovenReady: [...prev.ovenReady, consolidatedBatch]
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
