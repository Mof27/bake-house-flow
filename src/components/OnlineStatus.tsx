
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueueRefresh } from '@/hooks/useQueueRefresh';
import { useQueueState } from '@/hooks/useQueueState';
import { useOrders } from '@/contexts/OrderContext';

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { mockData, setMockData } = useQueueState();
  const { refresh: refreshOrders } = useOrders();
  const { fetchLatestData, isRefreshing } = useQueueRefresh(mockData, setMockData);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for real-time updates to update the "last refreshed" indicator
    const handleRealtimeUpdate = () => {
      setLastRefresh(Date.now());
    };
    
    window.addEventListener('supabase-order-update', handleRealtimeUpdate);
    window.addEventListener('queue-refresh-requested', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('supabase-order-update', handleRealtimeUpdate);
      window.removeEventListener('queue-refresh-requested', handleRealtimeUpdate);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      // First refresh order context
      if (refreshOrders) {
        await refreshOrders();
      }
      
      // Then refresh the queue state
      await fetchLatestData();
      
      // Additional broadcast of refresh event
      const refreshEvent = new CustomEvent('queue-refresh-requested');
      window.dispatchEvent(refreshEvent);
      
      setLastRefresh(Date.now());
      
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error in refresh:", error);
      toast.error("Failed to refresh data");
    }
  };

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${
        isOnline ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}>
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleRefresh}
        disabled={isRefreshing}
        title={`Last refreshed at: ${new Date(lastRefresh).toLocaleTimeString()}`}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default OnlineStatus;
