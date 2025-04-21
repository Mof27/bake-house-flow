
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ManualBakerOrder } from '@/types/orders';

export const useOrderQuantity = (
  orders: ManualBakerOrder[],
  setIsLoading: (loading: boolean) => void
) => {
  const updateOrderQuantity = async (id: string, delta: number): Promise<void> => {
    setIsLoading(true);
    const curr = orders.find(order => order.id === id);
    if (!curr) {
      setIsLoading(false);
      toast.error("Order not found");
      return;
    }
    const updatedProducedQuantity = Math.max(0, (curr.producedQuantity ?? 0) + delta);
    const { error } = await supabase
      .from('orders')
      .update({ produced_quantity: updatedProducedQuantity })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order quantity');
    } else {
      toast.success(`Order quantity updated`);
    }
    setIsLoading(false);
  };

  const updateOrderNotes = async (id: string, notes: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ notes })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order notes');
    } else {
      toast.success('Order notes updated');
    }
    setIsLoading(false);
  };

  return { updateOrderQuantity, updateOrderNotes };
};
