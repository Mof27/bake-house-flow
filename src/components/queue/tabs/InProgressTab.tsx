
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActiveMixing, OvenReadyBatch, Oven } from '@/types/queue';
import ActiveMixingCard from '@/components/queue/ActiveMixingCard';
import OvenReadyCard from '@/components/queue/OvenReadyCard';
import OvenSlot from '@/components/queue/OvenSlot';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';

interface InProgressTabProps {
  activeMixing: ActiveMixing[];
  ovenReady: OvenReadyBatch[];
  ovens: Oven[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
  onQuantityChange: (orderId: string, delta: number) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onOvenDragOver: (e: React.DragEvent) => void;
  onOvenDrop: (ovenNumber: number) => (e: React.DragEvent) => void;
  onOvenComplete: (ovenNumber: number) => void;
}

const InProgressTab: React.FC<InProgressTabProps> = ({
  activeMixing,
  ovenReady,
  ovens,
  onCancelTimer,
  onMixingComplete,
  onQuantityChange,
  onDragStart,
  onOvenDragOver,
  onOvenDrop,
  onOvenComplete,
}) => {
  const anyInProgress = activeMixing.length > 0 || 
                       ovenReady.length > 0 || 
                       ovens.some(oven => oven.isActive);

  return (
    <TabsContent value="in-progress" className="mt-0 h-full">
      <ScrollArea className="h-full">
        <div className="space-y-4 pb-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              {activeMixing.length > 0 && (
                <ScrollableCardSection title="Currently Mixing">
                  {activeMixing.map(order => (
                    <ActiveMixingCard 
                      key={order.id}
                      flavor={order.flavor}
                      shape={order.shape}
                      size={order.size}
                      batchLabel={order.batchLabel}
                      requestedAt={order.requestedAt}
                      isPriority={order.isPriority}
                      startTime={order.startTime}
                      onCancel={() => onCancelTimer(order.id)}
                      onComplete={() => onMixingComplete(order.id)}
                    />
                  ))}
                </ScrollableCardSection>
              )}
              
              {ovenReady.length > 0 && (
                <ScrollableCardSection title="Oven Queue">
                  {ovenReady.map(order => (
                    <OvenReadyCard 
                      key={order.id}
                      id={order.id}
                      flavor={order.flavor}
                      shape={order.shape}
                      size={order.size}
                      batchLabel={order.batchLabel}
                      requestedAt={order.requestedAt}
                      requestedQuantity={order.requestedQuantity}
                      producedQuantity={order.producedQuantity}
                      isPriority={order.isPriority}
                      onDragStart={onDragStart}
                      onQuantityChange={(delta) => onQuantityChange(order.id, delta)}
                    />
                  ))}
                </ScrollableCardSection>
              )}
            </div>
            
            <div className="w-[180px] flex flex-col space-y-3">
              <h2 className="text-lg font-bold">Oven Slots</h2>
              {ovens.map(oven => (
                <OvenSlot 
                  key={oven.number}
                  ovenNumber={oven.number}
                  isActive={oven.isActive}
                  timeRemaining={oven.timeRemaining}
                  onDragOver={onOvenDragOver}
                  onDrop={onOvenDrop(oven.number)}
                  currentBatch={oven.currentBatch}
                  batches={oven.batches}
                  onComplete={() => onOvenComplete(oven.number)}
                />
              ))}
            </div>
          </div>
          
          {!anyInProgress && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No batches currently in progress</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default InProgressTab;
