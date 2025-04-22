
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchOrdersByStatus, 
  fetchTodayCompletedCount, 
  updateOrderStatus,
  updateOrderQuantity 
} from '@/services/queueService';
import { OrderStatus, ManualBakerOrder } from '@/types/orders';

// Query keys
export const queueKeys = {
  all: ['orders'] as const,
  lists: () => [...queueKeys.all, 'list'] as const,
  list: (status?: OrderStatus | OrderStatus[]) => 
    [...queueKeys.lists(), { status }] as const,
  dailyCompleted: () => [...queueKeys.all, 'dailyCompleted'] as const,
};

// Hook for fetching orders by status
export const useOrdersByStatus = (status?: OrderStatus | OrderStatus[]) => {
  return useQuery({
    queryKey: queueKeys.list(status),
    queryFn: () => fetchOrdersByStatus(status),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Hook for fetching all queue orders (pending, mixing, baking)
export const useQueueOrders = () => {
  return useQuery({
    queryKey: queueKeys.list(['queued', 'mixing', 'baking']),
    queryFn: () => fetchOrdersByStatus(['queued', 'mixing', 'baking']),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Hook for fetching completed orders
export const useCompletedOrders = () => {
  return useQuery({
    queryKey: queueKeys.list('done'),
    queryFn: () => fetchOrdersByStatus('done'),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Hook for fetching daily completed count
export const useDailyCompletedCount = () => {
  return useQuery({
    queryKey: queueKeys.dailyCompleted(),
    queryFn: fetchTodayCompletedCount,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      additionalFields = {} 
    }: { 
      id: string; 
      status: OrderStatus; 
      additionalFields?: Record<string, any>; 
    }) => {
      return updateOrderStatus(id, status, additionalFields);
    },
    onMutate: async ({ id, status, additionalFields }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queueKeys.lists() });
      
      // Get a snapshot of the current data
      const previousOrders = queryClient.getQueryData<ManualBakerOrder[]>(
        queueKeys.list(['queued', 'mixing', 'baking'])
      );
      
      // Optimistically update the cache
      queryClient.setQueryData<ManualBakerOrder[]>(
        queueKeys.list(['queued', 'mixing', 'baking']), 
        (old = []) => {
          return old.map(order => 
            order.id === id 
              ? { 
                  ...order, 
                  status, 
                  ...additionalFields,
                  ...(status === 'mixing' && !order.startedAt ? { startedAt: new Date() } : {}),
                  ...(status === 'done' && !order.completedAt ? { completedAt: new Date() } : {})
                } 
              : order
          );
        }
      );
      
      // If changing to 'done', update the completed orders list too
      if (status === 'done') {
        const orderToMove = previousOrders?.find(order => order.id === id);
        
        if (orderToMove) {
          queryClient.setQueryData<ManualBakerOrder[]>(
            queueKeys.list('done'),
            (old = []) => {
              const updatedOrder = { 
                ...orderToMove, 
                status: 'done', 
                completedAt: new Date(),
                ...additionalFields 
              };
              return [updatedOrder, ...old];
            }
          );
          
          // Update the daily completed count
          queryClient.setQueryData<number>(
            queueKeys.dailyCompleted(),
            (old = 0) => old + 1
          );
        }
      }
      
      return { previousOrders };
    },
    onError: (err, { id, status }, context) => {
      // Rollback to the previous state if there was an error
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queueKeys.list(['queued', 'mixing', 'baking']), 
          context.previousOrders
        );
      }
      toast.error(`Failed to update order status: ${err}`);
    },
    onSettled: () => {
      // Refetch to ensure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queueKeys.dailyCompleted() });
    },
  });
};

// Hook for updating order quantity
export const useUpdateOrderQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => {
      return updateOrderQuantity(id, quantity);
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queueKeys.lists() });
      
      const previousOrders = queryClient.getQueryData<ManualBakerOrder[]>(
        queueKeys.list(['queued', 'mixing', 'baking'])
      );
      
      queryClient.setQueryData<ManualBakerOrder[]>(
        queueKeys.list(['queued', 'mixing', 'baking']), 
        (old = []) => {
          return old.map(order => 
            order.id === id 
              ? { ...order, producedQuantity: quantity } 
              : order
          );
        }
      );
      
      // Also update in completed orders if it exists there
      queryClient.setQueryData<ManualBakerOrder[]>(
        queueKeys.list('done'), 
        (old = []) => {
          return old.map(order => 
            order.id === id 
              ? { ...order, producedQuantity: quantity } 
              : order
          );
        }
      );
      
      return { previousOrders };
    },
    onError: (err, { id }, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queueKeys.list(['queued', 'mixing', 'baking']), 
          context.previousOrders
        );
      }
      toast.error(`Failed to update quantity: ${err}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
    },
  });
};

// Hook to refresh all queue data
export const useQueueRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: queueKeys.lists() });
      await queryClient.refetchQueries({ queryKey: queueKeys.dailyCompleted() });
      toast.success("Refresh successful");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return { refresh, isRefreshing };
};
