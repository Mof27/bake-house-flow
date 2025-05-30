
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { estimateBakeTime, generateBatchLabel } from '@/utils/orderUtils';
import { supabase } from '@/integrations/supabase/client';
import { ManualBakerOrder, NewOrderInput, OrderStatus } from '@/types/orders';
import { Dispatch, SetStateAction } from 'react';

export const useOrderCreate = (
  user: { id: string } | null | undefined,
  setNextBatchNumber: Dispatch<SetStateAction<number>>,
  nextBatchNumber: number,
  setIsLoading: (loading: boolean) => void
) => {
  const createOrder = async (orderData: NewOrderInput): Promise<ManualBakerOrder> => {
    setIsLoading(true);
    try {
      const estimatedTime = estimateBakeTime();
      const batchNumber = nextBatchNumber.toString().padStart(3, '0');
      const batchLabel = `A${batchNumber}`;

      // Generate a better batch label using the utility function
      const detailedBatchLabel = generateBatchLabel(orderData.flavor, orderData.size, orderData.shape);
      
      const newOrder: ManualBakerOrder = {
        id: uuidv4(),
        isPriority: orderData.isPriority,
        status: 'queued' as OrderStatus,
        flavor: orderData.flavor,
        shape: orderData.shape,
        size: orderData.size,
        batchLabel: detailedBatchLabel,
        requestedQuantity: orderData.requestedQuantity,
        producedQuantity: 0,
        estimatedTime,
        assignedTo: null,
        createdBy: user?.id || '',
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        printCount: 1,
        notes: orderData.notes,
      };

      // Database shape
      const dbOrder = {
        id: newOrder.id,
        is_priority: newOrder.isPriority,
        status: newOrder.status,
        flavor: newOrder.flavor,
        shape: newOrder.shape,
        size: newOrder.size,
        batch_label: newOrder.batchLabel,
        requested_quantity: newOrder.requestedQuantity,
        produced_quantity: newOrder.producedQuantity,
        estimated_time: newOrder.estimatedTime,
        assigned_to: newOrder.assignedTo,
        created_by: newOrder.createdBy,
        created_at: newOrder.createdAt.toISOString(),
        started_at: null,
        completed_at: null,
        print_count: newOrder.printCount,
        notes: newOrder.notes,
      };

      console.log("Inserting order into Supabase:", dbOrder);
      const { data, error } = await supabase.from('orders').insert(dbOrder).select();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      console.log("Order created successfully:", data);
      
      // Trigger immediate refresh of the queue data
      setTimeout(() => {
        const event = new CustomEvent('queue-refresh-requested');
        window.dispatchEvent(event);
      }, 200);
      
      setNextBatchNumber(n => n + 1);
      toast.success("Order created successfully");
      return newOrder;
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error('Failed to create order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createOrder };
};
