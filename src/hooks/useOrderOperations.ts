
import { useEffect, useState, useCallback } from 'react';
import { ManualBakerOrder, NewOrderInput, OrderStatus } from '@/types/orders';
import { User } from '@/contexts/AuthContext';
import { useOrderFetch } from './order-operations/useOrderFetch';
import { useOrderCreate } from './order-operations/useOrderCreate';
import { useOrderStatus } from './order-operations/useOrderStatus';
import { useOrderPrint } from './order-operations/useOrderPrint';
import { useOrderDelete } from './order-operations/useOrderDelete';
import { useOrderQuantity } from './order-operations/useOrderQuantity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Consolidates all order operations via sub-hooks.
 */
export const useOrderOperations = (user: User) => {
  const { orders, setOrders, isLoading, setIsLoading, fetchOrders } = useOrderFetch();

  // For local batch increment support (fallback)
  const [nextBatchNumber, setNextBatchNumber] = useState(1);

  const refresh = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
    // Listen to realtime changes for 'orders'
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const getOrderById = (id: string): ManualBakerOrder | undefined =>
    orders.find(order => order.id === id);

  // Split operations
  const { createOrder } = useOrderCreate(user, setNextBatchNumber, nextBatchNumber, setIsLoading);
  const { updateOrderStatus } = useOrderStatus(orders, setIsLoading, user);
  const { printLabel } = useOrderPrint(orders, setIsLoading);
  const { deleteOrder } = useOrderDelete(setIsLoading);
  const { updateOrderQuantity, updateOrderNotes } = useOrderQuantity(orders, setIsLoading);

  // Just a stub for not implemented
  const reorderQueue = () => {
    toast.info("Queue reordering from backend is not implemented yet.");
  };

  return {
    orders,
    isLoading,
    getOrderById,
    createOrder,
    updateOrderStatus,
    printLabel,
    deleteOrder,
    reorderQueue,
    updateOrderQuantity,
    updateOrderNotes,
    refresh,
  };
};
