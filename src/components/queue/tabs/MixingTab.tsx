
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ActiveMixing } from '@/types/queue';
import { Card, CardContent } from '@/components/ui/card';
import ActiveMixingCard from '@/components/queue/ActiveMixingCard';

interface MixingTabProps {
  activeMixing: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
  onQuantityChange?: (orderId: string, delta: number) => void;
  onMoveToOven?: (orderId: string) => void;
}

const MixerSection: React.FC<{
  mixerNumber: number;
  items: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
  onQuantityChange?: (orderId: string, delta: number) => void;
  onMoveToOven?: (orderId: string) => void;
}> = ({ mixerNumber, items, onQuantityChange, onMoveToOven }) => {
  const emptySlots = 5 - items.length;
  
  return (
    <Card className="flex-1 h-full overflow-hidden">
      <CardContent className="p-4 h-full">
        <h2 className="text-xl font-bold mb-4">Mixer #{mixerNumber}</h2>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {items.map(item => (
            <ActiveMixingCard
              key={item.id}
              flavor={item.flavor}
              shape={item.shape}
              size={item.size}
              batchLabel={item.batchLabel}
              requestedAt={item.requestedAt}
              isPriority={item.isPriority}
              requestedQuantity={5}
              onQuantityChange={(delta) => onQuantityChange?.(item.id, delta)}
              onMoveToOven={() => onMoveToOven?.(item.id)}
            />
          ))}
          
          {emptySlots > 0 && (
            <div className="text-sm text-gray-500 mt-2">
              {emptySlots} empty {emptySlots === 1 ? 'slot' : 'slots'} available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MixingTab: React.FC<MixingTabProps> = ({
  activeMixing,
  onCancelTimer,
  onMixingComplete,
  onQuantityChange,
  onMoveToOven,
}) => {
  const mixer1Items = activeMixing.filter(item => item.batchLabel.includes('Mixer #1'));
  const mixer2Items = activeMixing.filter(item => item.batchLabel.includes('Mixer #2'));
  
  return (
    <TabsContent value="mixing" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="flex gap-4 h-full">
          <MixerSection 
            mixerNumber={1} 
            items={mixer1Items} 
            onCancelTimer={onCancelTimer} 
            onMixingComplete={onMixingComplete}
            onQuantityChange={onQuantityChange}
            onMoveToOven={onMoveToOven}
          />
          <MixerSection 
            mixerNumber={2} 
            items={mixer2Items} 
            onCancelTimer={onCancelTimer} 
            onMixingComplete={onMixingComplete}
            onQuantityChange={onQuantityChange}
            onMoveToOven={onMoveToOven}
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default MixingTab;
