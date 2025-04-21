
import { useEffect, useState } from 'react';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';
import { initialMockData } from '@/data/mockQueueData';

export const useQueueState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { mockData, setMockData } = useQueueUpdates(initialMockData);
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    mockData,
    setMockData,
    fetchLatestData,
    isLoading,
  };
};
