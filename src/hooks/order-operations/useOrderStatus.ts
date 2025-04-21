
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus, Order } from '@/types/orders';

export const useOrderStatus = (
  orders: Order[],
  setIsLoading: (loading: boolean) => void,
  user: { id: string } | null | undefined
) => {
  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    setIsLoading(true);
    const curr = orders.find(order => order.id === id);
    if (!curr) {
      setIsLoading(false);
      toast.error("Order not found");
      throw new Error("Order not found");
    }

    let updates: any = { status };
    if (status === 'baking' && !curr.startedAt) {
      updates.started_at = new Date().toISOString();
      updates.assigned_to = user?.id || null;
    }
    if (status === 'done' && !curr.completedAt) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${status}`);
    }
    setIsLoading(false);
  };

  return { updateOrderStatus };
};
