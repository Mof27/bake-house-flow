
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ManualBakerOrder } from '@/types/orders';

export const useOrderPrint = (
  orders: ManualBakerOrder[],
  setIsLoading: (loading: boolean) => void
) => {
  const printLabel = async (id: string): Promise<void> => {
    setIsLoading(true);
    const curr = orders.find(order => order.id === id);
    if (!curr) {
      setIsLoading(false);
      toast.error("Order not found");
      throw new Error("Order not found");
    }

    const { error } = await supabase
      .from('orders')
      .update({ print_count: (curr.printCount ?? 0) + 1 })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update print count');
    } else {
      toast.success('Label printed successfully');
    }
    setIsLoading(false);
  };

  return { printLabel };
};
