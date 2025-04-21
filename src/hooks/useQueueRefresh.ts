
import { toast } from 'sonner';
import { MockData } from '@/types/queue';
import { supabase } from '@/integrations/supabase/client';

export const useQueueRefresh = (mockData: MockData, setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
  const fetchLatestData = async () => {
    try {
      // Fetch latest orders from Supabase
      const { data: latestOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Refreshed data from Supabase:", latestOrders);
      
      // Trigger a data refetch in the parent components
      // This will call the useQueueState hook's fetchDailyStats and update the mockData
      
      toast.success("Data refreshed successfully", {
        description: "Latest queue data has been loaded",
        position: "top-right",
      });
      
      // Force re-fetch in parent hooks
      const event = new CustomEvent('queue-refresh-requested');
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  return { fetchLatestData };
};
