
import { useState } from 'react';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/orders';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';
import { useLogging } from '@/hooks/useLogging';

export const useOrderStatus = (
  orders: Order[],
  setIsLoading: (loading: boolean) => void,
  user?: User
) => {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { logActivity } = useLogging(user);

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    setIsLoading(true);
    setUpdateError(null);

    const order = orders.find(o => o.id === id);
    if (!order) {
      setIsLoading(false);
      setUpdateError(`Order ${id} not found`);
      toast.error(`Order ${id} not found`);
      return false;
    }

    // Set timestamps based on status
    let updates: Record<string, any> = { status };
    
    if (status === 'mixing' && !order.startedAt) {
      updates.started_at = new Date().toISOString();
    } else if (status === 'done' && !order.completedAt) {
      updates.completed_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Log the status change
      await logActivity({
        batch_id: order.batchLabel,
        action: `Status changed to ${status}`,
        details: `Order ${order.batchLabel} (${order.flavor}, ${order.shape}) status changed to ${status}`,
        type: 'status',
        requested_quantity: order.requestedQuantity,
        produced_quantity: order.producedQuantity
      });
      
      toast.success(`Order ${order.batchLabel} is now ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateError(`Failed to update status: ${error}`);
      toast.error(`Failed to update status`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrderStatus, updateError };
};
