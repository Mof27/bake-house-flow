import { create } from 'zustand';
import { toast } from 'sonner';
import { fetchOrdersByStatus, updateOrderStatus } from '@/services/queueService';
import { OrderStatus } from '@/types/orders';

// Constants
const MAX_ITEMS_PER_MIXER = 5;

interface QueueState {
  dailyTarget: number;
  setDailyTarget: (target: number) => void;
  
  // Queue operations
  startMixing: (orderId: string, mixerNumber: number) => Promise<boolean>;
  cancelMixing: (orderId: string) => Promise<boolean>;
  completeMixing: (orderId: string, mixerNumber: number) => Promise<boolean>;
  startBaking: (batchId: string, ovenNumber: number) => Promise<boolean>;
  completeBaking: (ovenNumber: number) => Promise<boolean>;
  
  // Helper function to check mixer capacity
  getMixerItemCount: (mixerNumber: number) => Promise<number>;
  
  // Quantity operations
  updateQuantity: (orderId: string, delta: number) => Promise<boolean>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  dailyTarget: 20,
  
  setDailyTarget: (target: number) => set({ dailyTarget: target }),
  
  // Start mixing operation
  startMixing: async (orderId: string, mixerNumber: number) => {
    try {
      // Check if mixer is already at capacity
      const currentCount = await get().getMixerItemCount(mixerNumber);
      if (currentCount >= MAX_ITEMS_PER_MIXER) {
        toast.error(`Mixer #${mixerNumber} is full! Maximum ${MAX_ITEMS_PER_MIXER} items allowed.`);
        return false;
      }
      
      // Update the order status and batch label
      await updateOrderStatus(orderId, 'mixing', {
        batch_label: `#A${orderId.substring(0, 4)} (Mixer #${mixerNumber})`,
        started_at: new Date().toISOString()
      });
      
      toast.success(`Started mixing process in Mixer #${mixerNumber}`);
      return true;
    } catch (error) {
      console.error("Failed to start mixing:", error);
      toast.error("Failed to start mixing process");
      return false;
    }
  },
  
  // Cancel mixing operation
  cancelMixing: async (orderId: string) => {
    try {
      // Get the current batch label to extract the original part
      const orders = await fetchOrdersByStatus('mixing');
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        toast.error("Order not found");
        return false;
      }
      
      // Remove the mixer number from batch label when returning to pending
      const originalBatchLabel = order.batchLabel.replace(/ \(Mixer #[1-2]\)/, '');
      
      await updateOrderStatus(orderId, 'queued', {
        batch_label: originalBatchLabel,
        started_at: null
      });
      
      toast("Mixing cancelled", { 
        description: "Order returned to pending queue" 
      });
      return true;
    } catch (error) {
      console.error("Failed to cancel mixing:", error);
      toast.error("Failed to return to pending queue");
      return false;
    }
  },
  
  // Complete mixing operation
  completeMixing: async (orderId: string, mixerNumber: number) => {
    try {
      // Get all orders with the same mixer number
      const orders = await fetchOrdersByStatus('mixing');
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        toast.error("Order not found");
        return false;
      }
      
      // Find all items with the same flavor, shape, and size in the same mixer
      const itemsInSameMixer = orders.filter(item => 
        item.batchLabel.includes(`Mixer #${mixerNumber}`) &&
        item.flavor === order.flavor &&
        item.shape === order.shape &&
        item.size === order.size
      );
      
      // Update all the similar items to 'baking' status
      for (const item of itemsInSameMixer) {
        await updateOrderStatus(item.id, 'baking', {
          // Keep existing batch label
          batch_label: item.batchLabel
        });
      }
      
      toast.success("Mixing complete! Order ready for oven.");
      return true;
    } catch (error) {
      console.error("Failed to complete mixing:", error);
      toast.error("Failed to complete mixing process");
      return false;
    }
  },
  
  // Start baking operation
  startBaking: async (batchId: string, ovenNumber: number) => {
    try {
      // If batchId contains multiple IDs (consolidated batch), split and process each one
      const batchIds = batchId.includes('-') ? batchId.split('-') : [batchId];
      
      for (const id of batchIds) {
        await updateOrderStatus(id, 'baking', {
          batch_label: `Oven #${ovenNumber} - ${id}`
        });
      }
      
      toast.success(`Started baking in Oven #${ovenNumber}`);
      return true;
    } catch (error) {
      console.error("Failed to start baking:", error);
      toast.error("Failed to start baking process");
      return false;
    }
  },
  
  // Complete baking operation
  completeBaking: async (ovenNumber: number) => {
    try {
      // Get all orders in baking status
      const orders = await fetchOrdersByStatus('baking');
      const ovenBatches = orders.filter(o => 
        o.batchLabel.includes(`Oven #${ovenNumber}`)
      );
      
      if (ovenBatches.length === 0) {
        toast.error(`No batches found in Oven #${ovenNumber}`);
        return false;
      }
      
      // Update all batches to 'done' status
      for (const batch of ovenBatches) {
        await updateOrderStatus(batch.id, 'done', {
          completed_at: new Date().toISOString()
        });
      }
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${ovenBatches.length} batches successfully baked.`
      });
      return true;
    } catch (error) {
      console.error("Failed to complete baking:", error);
      toast.error("Failed to complete baking process");
      return false;
    }
  },
  
  // Helper to count items in a mixer
  getMixerItemCount: async (mixerNumber: number) => {
    try {
      const orders = await fetchOrdersByStatus('mixing');
      return orders.filter(o => o.batchLabel.includes(`Mixer #${mixerNumber}`)).length;
    } catch (error) {
      console.error("Error counting mixer items:", error);
      return 0;
    }
  },
  
  // Update quantity operation
  updateQuantity: async (orderId: string, delta: number) => {
    try {
      // Get current quantity
      const orders = await fetchOrdersByStatus();
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        toast.error("Order not found");
        return false;
      }
      
      // Calculate new quantity (minimum of 1)
      const newQuantity = Math.max(1, order.producedQuantity + delta);
      
      // Update the quantity
      await updateOrderStatus(orderId, order.status, {
        produced_quantity: newQuantity
      });
      
      toast.info(`Quantity ${delta > 0 ? 'increased' : 'decreased'} for batch`);
      return true;
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
      return false;
    }
  }
}));
