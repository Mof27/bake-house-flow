
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OvenReadyBatch } from '@/types/queue';
import OvenReadyCard from '@/components/queue/OvenReadyCard';

interface OvenTabProps {
  ovenReadyBatches: OvenReadyBatch[];
  onStartBaking: (orderId: string, ovenNumber: number) => void;
}

const OvenTab: React.FC<OvenTabProps> = ({
  ovenReadyBatches,
  onStartBaking,
}) => {
  return (
    <TabsContent value="oven" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-4 h-full">
              <h2 className="text-xl font-bold mb-4">Ready for Oven</h2>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {ovenReadyBatches.map(batch => (
                  <OvenReadyCard
                    key={batch.id}
                    {...batch}
                    onStartBaking={(ovenNumber) => onStartBaking(batch.id, ovenNumber)}
                  />
                ))}
                
                {ovenReadyBatches.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No batches ready for baking
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default OvenTab;
