
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ActiveMixing } from '@/types/queue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Undo, X } from 'lucide-react';
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
}> = ({ mixerNumber, items, onCancelTimer, onMixingComplete, onQuantityChange, onMoveToOven }) => {
  const handleMoveAllToOven = () => {
    items.forEach(item => onMoveToOven?.(item.id));
  };

  return (
    <Card className="flex-1 h-full overflow-hidden">
      <CardContent className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mixer #{mixerNumber}</h2>
          {items.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => items.forEach(item => onCancelTimer(item.id))}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => items.forEach(item => onMixingComplete(item.id))}
              >
                <Undo className="mr-2 h-4 w-4" />
                Put All Back
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMoveAllToOven}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Move All to Oven
              </Button>
            </div>
          )}
        </div>
        
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
              onPutBack={() => onMixingComplete(item.id)}
            />
          ))}
          
          {items.length === 0 && (
            <div className="text-sm text-gray-500">
              No items in mixer #{mixerNumber}
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
