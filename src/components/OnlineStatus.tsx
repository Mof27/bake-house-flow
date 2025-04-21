
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueueRefresh } from '@/hooks/useQueueRefresh';
import { useQueueState } from '@/hooks/useQueueState';

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { mockData, setMockData } = useQueueState();
  const { fetchLatestData, isRefreshing } = useQueueRefresh(mockData, setMockData);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    fetchLatestData();
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
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default OnlineStatus;
