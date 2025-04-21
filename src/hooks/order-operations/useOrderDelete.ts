
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';
import { Order } from '@/types/orders';

export const useOrderDelete = (
  setIsLoading: (loading: boolean) => void
) => {
  const { logActivity } = useLogging();

  const deleteOrder = async (id: string, order?: Order): Promise<void> => {
    setIsLoading(true);
    
    try {
      // If order details are provided, log the deletion first
      if (order) {
        await logActivity({
          batch_id: order.batchLabel,
          action: "Order deleted",
          details: `Deleted order ${order.batchLabel} (${order.flavor}, ${order.shape})`,
          type: 'status',
          requested_quantity: order.requestedQuantity,
          produced_quantity: order.producedQuantity
        });
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      toast.success('Order deleted');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteOrder };
};
