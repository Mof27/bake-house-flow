
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/orders';
import { supabase } from '@/integrations/supabase/client';

// Normalization helper put in this file
export const normalizeOrders = (data: any[]): Order[] =>
  (data || []).map((o: any) => ({
    id: o.id,
    isPriority: o.is_priority,
    status: o.status as OrderStatus,
    flavor: o.flavor,
    shape: o.shape,
    size: o.size,
    batchLabel: o.batch_label,
    requestedQuantity: o.requested_quantity,
    producedQuantity: o.produced_quantity,
    estimatedTime: o.estimated_time,
    assignedTo: o.assigned_to,
    createdBy: o.created_by,
    createdAt: o.created_at ? new Date(o.created_at) : new Date(),
    startedAt: o.started_at ? new Date(o.started_at) : null,
    completedAt: o.completed_at ? new Date(o.completed_at) : null,
    printCount: o.print_count,
    notes: o.notes,
  }));

export const useOrderFetch = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setOrders(normalizeOrders(data));
    }
    setIsLoading(false);
  }, []);

  return { orders, setOrders, isLoading, setIsLoading, fetchOrders };
};
