
import { useEffect, useState, useCallback } from 'react';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';
import { initialMockData } from '@/data/mockQueueData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQueueState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(20);
  const { mockData, setMockData } = useQueueUpdates({...initialMockData, dailyCompleted, dailyTarget});
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Fetch daily statistics and all orders data
  const fetchDailyStats = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching daily stats and all orders...");
      
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
      
      // Also fetch all orders to ensure we have the latest data
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) {
        throw ordersError;
      }
      
      console.log("Received updated orders from Supabase:", allOrders);
      setLastUpdateTime(Date.now());
      
      // The useQueueUpdates hook will react to this change and update mockData
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [setMockData]);

  useEffect(() => {
    // Initial fetch on mount
    fetchDailyStats();

    // Set up real-time subscription for order changes - with improved error handling
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log("Supabase real-time update received:", payload);
          // React immediately to the change
          fetchDailyStats();
          
          // Also broadcast an event for other components to react
          const event = new CustomEvent('supabase-order-update', { 
            detail: { payload, timestamp: Date.now() } 
          });
          window.dispatchEvent(event);
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to real-time updates');
          toast.error('Real-time updates unavailable');
        }
      });

    // Listen for manual refresh requests from buttons
    const handleRefreshRequest = () => {
      console.log("Manual refresh requested");
      fetchDailyStats();
    };

    window.addEventListener('queue-refresh-requested', handleRefreshRequest);

    return () => {
      console.log('Cleaning up Supabase channel');
      supabase.removeChannel(channel);
      window.removeEventListener('queue-refresh-requested', handleRefreshRequest);
    };
  }, [fetchDailyStats]);

  return {
    mockData,
    setMockData,
    fetchLatestData,
    isLoading,
    refresh: fetchDailyStats,
    lastUpdateTime
  };
};
