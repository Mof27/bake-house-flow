import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
      const { error } = await supabase.from('orders')
        .update({
          status: 'mixing',
          batch_label: `#A${orderId.substring(0, 4)} (Mixer #${mixerNumber})`,
          started_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success(`Started mixing process in Mixer #${mixerNumber}`);
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
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
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('batch_label')
        .eq('id', orderId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!data) {
        toast.error("Order not found");
        return false;
      }
      
      // Remove the mixer number from batch label when returning to pending
      const originalBatchLabel = data.batch_label.replace(/ \(Mixer #[1-2]\)/, '');
      
      const { error } = await supabase.from('orders')
        .update({
          status: 'queued',
          batch_label: originalBatchLabel,
          started_at: null
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast("Mixing cancelled", { 
        description: "Order returned to pending queue" 
      });
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
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
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'mixing');
      
      if (fetchError) throw fetchError;
      
      const order = orders?.find(o => o.id === orderId);
      
      if (!order) {
        toast.error("Order not found");
        return false;
      }
      
      // Find all items with the same flavor, shape, and size in the same mixer
      const itemsInSameMixer = orders?.filter(item => 
        item.batch_label.includes(`Mixer #${mixerNumber}`) &&
        item.flavor === order.flavor &&
        item.shape === order.shape &&
        item.size === order.size
      ) || [];
      
      // Update all the similar items to 'baking' status
      for (const item of itemsInSameMixer) {
        await supabase.from('orders')
          .update({
            status: 'baking',
            // Keep existing batch label
            batch_label: item.batch_label
          })
          .eq('id', item.id);
      }
      
      toast.success("Mixing complete! Order ready for oven.");
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
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
        const { error } = await supabase.from('orders')
          .update({
            status: 'baking',
            batch_label: `Oven #${ovenNumber} - ${id}`
          })
          .eq('id', id);
          
        if (error) throw error;
      }
      
      toast.success(`Started baking in Oven #${ovenNumber}`);
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
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
      const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'baking');
      
      if (fetchError) throw fetchError;
      
      const ovenBatches = orders?.filter(o => 
        o.batch_label.includes(`Oven #${ovenNumber}`)
      ) || [];
      
      if (ovenBatches.length === 0) {
        toast.error(`No batches found in Oven #${ovenNumber}`);
        return false;
      }
      
      // Update all batches to 'done' status
      for (const batch of ovenBatches) {
        const { error } = await supabase.from('orders')
          .update({
            status: 'done',
            completed_at: new Date().toISOString()
          })
          .eq('id', batch.id);
          
        if (error) throw error;
      }
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${ovenBatches.length} batches successfully baked.`
      });
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'mixing');
        
      if (error) throw error;
      
      return (data || []).filter(o => o.batch_label.includes(`Mixer #${mixerNumber}`)).length;
    } catch (error) {
      console.error("Error counting mixer items:", error);
      return 0;
    }
  },
  
  // Update quantity operation
  updateQuantity: async (orderId: string, delta: number) => {
    try {
      // Get current order details
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!data) {
        toast.error("Order not found");
        return false;
      }
      
      // Calculate new quantity (minimum of 1)
      const newQuantity = Math.max(1, data.produced_quantity + delta);
      
      // Update the quantity
      const { error } = await supabase.from('orders')
        .update({
          produced_quantity: newQuantity
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast.info(`Quantity ${delta > 0 ? 'increased' : 'decreased'} for batch`);
      
      // Trigger an event to refresh the data
      window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
      
      return true;
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
      return false;
    }
  }
}));
