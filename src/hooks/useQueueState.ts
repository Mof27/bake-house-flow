
import { initialMockData } from '@/data/mockQueueData';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';

export const useQueueState = () => {
  const { mockData, setMockData } = useQueueUpdates(initialMockData);
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);

  return {
    mockData,
    setMockData,
    fetchLatestData
  };
};
