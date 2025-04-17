
import { useEffect } from 'react';
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useQueueTimer = (setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData(prev => {
        const anyActiveOvens = prev.ovens.some(oven => oven.isActive && oven.timeRemaining !== undefined);
        if (!anyActiveOvens) return prev;

        return {
          ...prev,
          ovens: prev.ovens.map(oven => {
            if (oven.isActive && oven.timeRemaining !== undefined) {
              const newTimeRemaining = oven.timeRemaining - 1;

              if (newTimeRemaining === 120) {
                toast("2 minutes left on oven timer!", {
                  description: `Oven ${oven.number} will be done soon!`,
                  duration: 5000,
                });
              }

              if (newTimeRemaining === 0) {
                toast.success(`Oven ${oven.number} baking complete!`, {
                  description: `Ready to be removed from oven`,
                  duration: 8000,
                });
              }

              return {
                ...oven,
                timeRemaining: newTimeRemaining
              };
            }
            return oven;
          })
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
};
