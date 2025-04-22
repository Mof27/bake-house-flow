
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQueueRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Simple ping to verify connection to Supabase
      const { error } = await supabase.from('orders').select('id', { count: 'exact', head: true }).limit(1);
      if (error) throw error;
      
      // If connection successful, dispatch a custom event for components to react
      window.dispatchEvent(new CustomEvent('supabase-manual-refresh'));
      toast.success("Refresh successful");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return { fetchLatestData, isRefreshing };
};
