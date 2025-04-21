
import { useEffect, useState } from 'react';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';
import { initialMockData } from '@/data/mockQueueData';
import { supabase } from '@/integrations/supabase/client';

export const useQueueState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(20);
  const { mockData, setMockData } = useQueueUpdates({...initialMockData, dailyCompleted, dailyTarget});
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);

  // Fetch daily statistics when component mounts
  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        // Count completed orders for today
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

        if (count !== null) {
          setDailyCompleted(count);
          setMockData(prev => ({
            ...prev,
            dailyCompleted: count
          }));
        }
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();

    // Set up real-time subscription for order changes
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchDailyStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMockData]);

  return {
    mockData,
    setMockData,
    fetchLatestData,
    isLoading,
  };
};
