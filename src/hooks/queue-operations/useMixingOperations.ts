
import { MockData, PendingOrder, OvenReadyBatch } from '@/types/queue';
import { toast } from 'sonner';
import { consolidateMixingItems } from '@/utils/mixingUtils';
import { supabase } from '@/integrations/supabase/client';

const MAX_ITEMS_PER_MIXER = 5;

export const useMixingOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleStartMixing = async (orderId: string, mixerNumber: number) => {
    console.log(`Starting mixing process for order ${orderId} in Mixer #${mixerNumber}`);
    
    // First do an optimistic UI update
    let orderToMove: any = null;
    let originalState: MockData | null = null;
    
    setMockData(prev => {
      // Store original state for rollback if needed
      originalState = JSON.parse(JSON.stringify(prev));
      
      // Check if the selected mixer is full (has 5 items already)
      const currentMixerItems = prev.activeMixing.filter(item => 
        item.batchLabel.includes(`Mixer #${mixerNumber}`)
      );
      
      if (currentMixerItems.length >= MAX_ITEMS_PER_MIXER) {
        toast.error(`Mixer #${mixerNumber} is full! Maximum ${MAX_ITEMS_PER_MIXER} items allowed.`);
        return prev; // Return unchanged state
      }
      
      orderToMove = prev.pendingOrders.find(order => order.id === orderId);
      if (!orderToMove) {
        console.error(`Order with ID ${orderId} not found in pending orders`);
        return prev;
      }
      
      // Add the mixer number to the batch label
      const updatedBatchLabel = `${orderToMove.batchLabel} (Mixer #${mixerNumber})`;
      
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
      
      return newState;
    });
    
    // Then persist to Supabase
    if (orderToMove) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'mixing', 
            batch_label: `${orderToMove.batchLabel} (Mixer #${mixerNumber})`,
            started_at: new Date().toISOString()
          })
          .eq('id', orderId);
          
        if (error) throw error;
        toast.success(`Started mixing process in Mixer #${mixerNumber}`);
      } catch (error) {
        console.error("Failed to update order status in database:", error);
        toast.error("Failed to update order status");
        
        // Rollback UI on error
        if (originalState) {
          setMockData(originalState);
        }
      }
    }
  };

  const handleCancelTimer = async (orderId: string) => {
    let orderToMove: any = null;
    let originalState: MockData | null = null;
    
    // Optimistic UI update
    setMockData(prev => {
      originalState = JSON.parse(JSON.stringify(prev));
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
        producedQuantity: orderToMove.producedQuantity || 5,
        notes: orderToMove.notes
      };
      
      return {
        ...prev,
        activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
        pendingOrders: [...prev.pendingOrders, pendingOrder]
      };
    });
    
    // Persist to Supabase
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'queued', 
          batch_label: orderToMove?.batchLabel.replace(/ \(Mixer #[1-2]\)/, '') || '',
          started_at: null
        })
        .eq('id', orderId);
        
      if (error) throw error;
      toast("Mixing cancelled", { 
        description: "Order returned to pending queue" 
      });
    } catch (error) {
      console.error("Failed to update order status in database:", error);
      toast.error("Failed to return to pending queue");
      
      // Rollback UI on error
      if (originalState) {
        setMockData(originalState);
      }
    }
  };

  const handleMixingComplete = async (orderId: string) => {
    let orderToMove: any = null;
    let consolidatedItems: any[] = [];
    let originalState: MockData | null = null;
    let consolidatedBatch: OvenReadyBatch | null = null;
    
    // Optimistic UI update
    setMockData(prev => {
      originalState = JSON.parse(JSON.stringify(prev));
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
      
      // Store for database update
      consolidatedItems = [...similarItems];
      
      // Only process if there are items to move
      if (similarItems.length === 0) return prev;
      
      // Create a consolidated batch for the oven
      consolidatedBatch = {
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
    
    // Persist changes to Supabase
    try {
      // Update all the items in the batch to 'baking' status
      for (const item of consolidatedItems) {
        await supabase
          .from('orders')
          .update({ 
            status: 'baking',
            batch_label: item.batchLabel // Keep the existing batch label
          })
          .eq('id', item.id);
      }
      
      toast.success("Mixing complete! Order ready for oven.");
    } catch (error) {
      console.error("Failed to update order status in database:", error);
      toast.error("Failed to complete mixing process");
      
      // Rollback UI on error
      if (originalState) {
        setMockData(originalState);
      }
    }
  };

  return {
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
  };
};
