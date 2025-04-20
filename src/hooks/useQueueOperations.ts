
import { MockData } from '@/types/queue';
import { useQuantityOperations } from './queue-operations/useQuantityOperations';
import { useMixingOperations } from './queue-operations/useMixingOperations';
import { useOvenOperations } from './queue-operations/useOvenOperations';

export const useQueueOperations = (
  mockData: MockData, 
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const { handleQuantityChange, handleMixingQuantityChange } = useQuantityOperations(setMockData);
  const { handleStartMixing, handleCancelTimer, handleMixingComplete } = useMixingOperations(setMockData);
  const { handleOvenComplete } = useOvenOperations(setMockData);

  return {
    handleQuantityChange,
    handleMixingQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
    handleOvenComplete
  };
};
