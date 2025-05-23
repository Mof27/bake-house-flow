
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { OvenReadyBatch } from '@/types/queue';
import OvenSection from "@/components/queue/OvenSection";

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
        <div className="grid grid-cols-1 gap-4 h-full">
          <OvenSection 
            ovenReadyBatches={ovenReadyBatches || []} 
            onStartBaking={onStartBaking}
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default OvenTab;
