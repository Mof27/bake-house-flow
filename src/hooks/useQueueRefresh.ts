
import { useState } from 'react';
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useQueueRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manual refresh requested but functionality is temporarily disabled");
      // Functionality removed for now
      toast.info("Refresh functionality temporarily disabled");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return { fetchLatestData, isRefreshing };
};
