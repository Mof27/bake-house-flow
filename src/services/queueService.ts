
import { supabase } from '@/integrations/supabase/client';
import { ManualBakerOrder, OrderStatus } from '@/types/orders';
import { normalizeOrders } from '@/hooks/order-operations/useOrderFetch';

// Fetch orders by status
export const fetchOrdersByStatus = async (status?: OrderStatus | OrderStatus[]): Promise<ManualBakerOrder[]> => {
  try {
    let query = supabase.from('orders').select('*');
    
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return normalizeOrders(data || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Count completed orders for today
export const fetchTodayCompletedCount = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('completed_at', today.toISOString());
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching completed count:', error);
    throw error;
  }
};

// Update order status and related fields
export const updateOrderStatus = async (
  id: string, 
  status: OrderStatus, 
  additionalFields: Record<string, any> = {}
): Promise<void> => {
  try {
    // Set timestamps based on status
    const updates: Record<string, any> = { 
      status,
      ...additionalFields
    };
    
    if (status === 'mixing' && !additionalFields.started_at) {
      updates.started_at = new Date().toISOString();
    } else if (status === 'done' && !additionalFields.completed_at) {
      updates.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update order quantity
export const updateOrderQuantity = async (id: string, producedQuantity: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ produced_quantity: producedQuantity })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating order quantity:', error);
    throw error;
  }
};
