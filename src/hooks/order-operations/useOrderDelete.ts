
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useOrderDelete = (
  setIsLoading: (loading: boolean) => void
) => {
  const deleteOrder = async (id: string): Promise<void> => {
    setIsLoading(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete order');
    } else {
      toast.success('Order deleted');
    }
    setIsLoading(false);
  };

  return { deleteOrder };
};
