
import { useEffect, useState, useCallback } from 'react';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';
import { initialMockData } from '@/data/mockQueueData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrders } from '@/contexts/OrderContext';

export const useQueueState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(20);
  const { mockData, setMockData } = useQueueUpdates({...initialMockData, dailyCompleted, dailyTarget});
  const { fetchLatestData, isRefreshing } = useQueueRefresh();
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const { refresh: refreshOrders } = useOrders();

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
      
      // Also ensure order context is refreshed
      if (refreshOrders) {
        await refreshOrders();
      }
      
      setLastUpdateTime(Date.now());
      toast.success("Queue data refreshed");
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [setMockData, refreshOrders]);

  // Simple refresh function that triggers the manual refresh event
  const refresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent('queue-refresh-requested'));
  }, []);

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

    // Listen for the custom refresh event from useQueueRefresh
    const handleManualRefresh = () => {
      console.log("Manual refresh from Supabase triggered");
      fetchDailyStats();
    };

    window.addEventListener('queue-refresh-requested', handleRefreshRequest);
    window.addEventListener('supabase-manual-refresh', handleManualRefresh);

    return () => {
      console.log('Cleaning up Supabase channel');
      supabase.removeChannel(channel);
      window.removeEventListener('queue-refresh-requested', handleRefreshRequest);
      window.removeEventListener('supabase-manual-refresh', handleManualRefresh);
    };
  }, [fetchDailyStats]);

  return {
    mockData,
    setMockData,
    fetchLatestData,
    isLoading,
    isRefreshing,
    refresh: fetchLatestData, // Use the fetchLatestData function directly
    lastUpdateTime
  };
};
