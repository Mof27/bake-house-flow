
import { MockData } from '@/types/queue';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useOvenOperations = (
  setMockData: React.Dispatch<React.SetStateAction<MockData>>
) => {
  const handleOvenComplete = async (ovenNumber: number) => {
    let originalState: MockData | null = null;
    let batches: any[] = [];
    
    // Optimistic UI update
    setMockData(prev => {
      originalState = JSON.parse(JSON.stringify(prev));
      
      const oven = prev.ovens.find(o => o.number === ovenNumber);
      if (!oven) return prev;
      
      batches = [...oven.batches];
      
      const newDailyCompleted = Math.min(
        prev.dailyCompleted + oven.batches.length,
        prev.dailyTarget
      );
      
      const completedBatches = oven.batches.map(batch => ({
        ...batch,
        completedAt: new Date()
      }));
      
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
    
    // Persist to Supabase
    try {
      // Update all batch items to 'done' status
      for (const batch of batches) {
        // Handle composite ids (from consolidated batches)
        if (batch.id.includes('-')) {
          const batchIds = batch.id.split('-');
          for (const id of batchIds) {
            await supabase
              .from('orders')
              .update({ 
                status: 'done',
                completed_at: new Date().toISOString()
              })
              .eq('id', id);
          }
        } else {
          // Simple id case
          await supabase
            .from('orders')
            .update({ 
              status: 'done',
              completed_at: new Date().toISOString()
            })
            .eq('id', batch.id);
        }
      }
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${batches.length} batches successfully baked.`
      });
    } catch (error) {
      console.error("Failed to update order status in database:", error);
      toast.error("Failed to complete baking process");
      
      // Rollback UI on error
      if (originalState) {
        setMockData(originalState);
      }
    }
  };

  return { handleOvenComplete };
};
