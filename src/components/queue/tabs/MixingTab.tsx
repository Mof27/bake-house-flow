import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ActiveMixing } from '@/types/queue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Undo } from 'lucide-react';
import ConsolidatedMixingCard from '@/components/queue/ConsolidatedMixingCard';
import { consolidateMixingItems } from '@/utils/mixingUtils';
import { CountdownButton } from '@/components/ui/countdown-button';
import MixerTimer from '@/components/queue/MixerTimer';

interface MixingTabProps {
  activeMixing: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
  onQuantityChange?: (orderId: string, delta: number) => void;
  onPutBack?: (orderId: string) => void;
  onMoveToOven?: (orderId: string) => void;
}

const MixerSection: React.FC<{
  mixerNumber: number;
  items: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
  onQuantityChange?: (orderId: string, delta: number) => void;
  onPutBack?: (orderId: string) => void;
  onMoveToOven?: (orderId: string) => void;
}> = ({
  mixerNumber, items, onCancelTimer, onMixingComplete, onQuantityChange, onPutBack, onMoveToOven
}) => {
  const [timerReady, setTimerReady] = React.useState(false);

  const handleMoveAllToOven = () => {
    if (items.length > 0) {
      items.forEach(item => onMoveToOven?.(item.id));
    }
  };

  const handlePutAllBack = () => {
    items.forEach(item => onPutBack?.(item.id));
  };

  const consolidatedItems = consolidateMixingItems(items);

  const handleConsolidatedQuantityChange = (consolidatedItem: any, delta: number) => {
    consolidatedItem.ids.forEach((id: string) => {
      onQuantityChange?.(id, delta);
    });
  };

  const handleConsolidatedPutBack = (consolidatedItem: any) => {
    consolidatedItem.ids.forEach((id: string) => {
      onPutBack?.(id);
    });
  };

  return (
    <Card className="flex-1 h-full overflow-hidden">
      <CardContent className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mixer #{mixerNumber}</h2>
        </div>
        
        <div className="flex gap-2 mb-4 items-center">
          <CountdownButton
            variant="outline"
            size="sm"
            onAction={handlePutAllBack}
            countdownText="Cancel"
            className="flex items-center"
          >
            <Undo className="mr-2 h-4 w-4" />
            Put All Back
          </CountdownButton>
          
          {/* Timer placed next to Put All Back button */}
          <MixerTimer onReady={setTimerReady} />
          
          {/* "Move All to Oven" button always visible now */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMoveAllToOven}
            className="flex items-center ml-auto"
            disabled={items.length === 0}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Move All to Oven
          </Button>
        </div>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
          {consolidatedItems.map((item) => (
            <ConsolidatedMixingCard
              key={item.ids.join('-')}
              ids={item.ids}
              flavor={item.flavor}
              shape={item.shape}
              size={item.size}
              batchLabels={item.batchLabels}
              requestedAt={item.requestedAt}
              isPriority={item.isPriority}
              totalRequestedQuantity={item.totalRequestedQuantity}
              totalProducedQuantity={item.totalProducedQuantity}
              onQuantityChange={(delta) => handleConsolidatedQuantityChange(item, delta)}
              onPutBack={() => handleConsolidatedPutBack(item)}
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
  onPutBack,
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
            onPutBack={onPutBack}
            onMoveToOven={onMoveToOven}
          />
          <MixerSection 
            mixerNumber={2} 
            items={mixer2Items} 
            onCancelTimer={onCancelTimer} 
            onMixingComplete={onMixingComplete}
            onQuantityChange={onQuantityChange}
            onPutBack={onPutBack}
            onMoveToOven={onMoveToOven}
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default MixingTab;
