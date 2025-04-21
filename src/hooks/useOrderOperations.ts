
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Order, NewOrderInput, OrderStatus } from '@/types/orders';
import { estimateBakeTime, updateOrdersArray } from '@/utils/orderUtils';
import { User } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * useOrderOperations now syncs directly with Supabase.
 */

export const useOrderOperations = (user: User) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextBatchNumber, setNextBatchNumber] = useState(1); // Use only for local label fallback

  // Load all orders from Supabase
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error("Failed to fetch orders");
      setOrders([]);
    } else {
      // Convert timestamp fields to JS Date
      const normalized = (data || []).map((o: any) => ({
        ...o,
        createdAt: o.created_at ? new Date(o.created_at) : new Date(),
        startedAt: o.started_at ? new Date(o.started_at) : undefined,
        completedAt: o.completed_at ? new Date(o.completed_at) : undefined,
        // Map database fields to client model
        isPriority: o.is_priority,
        batchLabel: o.batch_label,
        requestedQuantity: o.requested_quantity,
        producedQuantity: o.produced_quantity,
        estimatedTime: o.estimated_time,
        assignedTo: o.assigned_to,
        createdBy: o.created_by,
        printCount: o.print_count,
        // Ensure status is a valid OrderStatus
        status: o.status as OrderStatus,
      }));
      setOrders(normalized);
    }
    setIsLoading(false);
  }, []);

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

  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const createOrder = async (orderData: NewOrderInput): Promise<Order> => {
    setIsLoading(true);

    try {
      const estimatedTime = estimateBakeTime();
      // Generate a unique batch label with incrementing number (local fallback)
      const batchNumber = nextBatchNumber.toString().padStart(3, '0');
      const batchLabel = `A${batchNumber}`;

      const newOrder: Order = {
        id: uuidv4(),
        isPriority: orderData.isPriority,
        status: 'queued' as OrderStatus,
        flavor: orderData.flavor,
        shape: orderData.shape,
        size: orderData.size,
        batchLabel,
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

      // Convert the client-side model to the database schema
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

      const { error } = await supabase.from('orders').insert(dbOrder);

      if (error) {
        throw error;
      }
      setNextBatchNumber(n => n + 1);
      toast.success("Order created successfully");
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    setIsLoading(true);

    // Find current order state to update time etc
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

  const reorderQueue = () => {
    toast.info("Queue reordering from backend is not implemented yet.");
  };

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
    updateOrderNotes
  };
};
