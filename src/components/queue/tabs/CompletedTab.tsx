
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompletedBatch } from '@/types/queue';
import CompletedBatchItem from '@/components/queue/CompletedBatchItem';

interface CompletedTabProps {
  completedBatches: CompletedBatch[];
}

const CompletedTab: React.FC<CompletedTabProps> = ({ completedBatches }) => {
  return (
    <TabsContent value="done" className="mt-0 h-full">
      <ScrollArea className="h-full">
        <div className="pb-4">
          <h2 className="text-lg font-bold mb-2">Completed Batches</h2>
          
          {(!completedBatches || completedBatches.length === 0) ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No completed batches yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {completedBatches.map(batch => (
                <CompletedBatchItem 
                  key={batch.id}
                  batchLabel={batch.batchLabel}
                  flavor={batch.flavor}
                  shape={batch.shape}
                  size={batch.size}
                  producedQuantity={batch.producedQuantity}
                  completedAt={batch.completedAt}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default CompletedTab;
