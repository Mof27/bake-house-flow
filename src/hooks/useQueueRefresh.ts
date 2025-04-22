
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queueKeys } from './react-query/useQueueQueries';

export const useQueueRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const fetchLatestData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Refresh all queue-related queries
      await queryClient.refetchQueries({ queryKey: queueKeys.all });
      
      // Dispatch event for backward compatibility
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
