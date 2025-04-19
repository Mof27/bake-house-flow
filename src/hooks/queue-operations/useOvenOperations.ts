
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useOvenOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleOvenComplete = (ovenNumber: number) => {
    setMockData(prev => {
      const oven = prev.ovens.find(o => o.number === ovenNumber);
      if (!oven) return prev;
      
      const newDailyCompleted = Math.min(
        prev.dailyCompleted + oven.batches.length,
        prev.dailyTarget
      );
      
      const completedBatches = oven.batches.map(batch => ({
        ...batch,
        completedAt: new Date()
      }));
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${oven.batches.length} batches successfully baked.`
      });
      
      return {
        ...prev,
        dailyCompleted: newDailyCompleted,
        ovens: prev.ovens.map(o => 
          o.number === ovenNumber 
            ? {
                ...o,
                isActive: false,
                timeRemaining: undefined,
                currentBatch: undefined,
                batches: []
              }
            : o
        ),
        completedBatches: [...prev.completedBatches, ...completedBatches]
      };
    });
  };

  return { handleOvenComplete };
};
