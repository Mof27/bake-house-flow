
import { toast } from 'sonner';
import { useState } from 'react';
import { MockData } from '@/types/queue';
import { supabase } from '@/integrations/supabase/client';

export const useQueueRefresh = (mockData: MockData, setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manually refreshing data...");
      
      // Fetch latest orders from Supabase
      const { data: latestOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // If no data returned, don't show an error, just warn
      if (!latestOrders || latestOrders.length === 0) {
        console.log("No orders found in database");
        toast.info("No orders found");
        return;
      }
      
      console.log("Refreshed data from Supabase:", latestOrders);
      
      // Force re-fetch in parent hooks by triggering a custom event
      const event = new CustomEvent('queue-refresh-requested', {
        detail: { timestamp: Date.now(), source: 'manual-refresh' }
      });
      window.dispatchEvent(event);
      
      // Also trigger a specific Supabase update event
      const supabaseEvent = new CustomEvent('supabase-order-update', {
        detail: { orders: latestOrders, timestamp: Date.now() }
      });
      window.dispatchEvent(supabaseEvent);
      
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return { fetchLatestData, isRefreshing };
};
