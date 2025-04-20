
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ActiveMixing, PendingOrder } from '@/types/queue';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface MixingTabProps {
  activeMixing: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
}

interface MixerChipProps {
  flavor: 'vanilla' | 'chocolate';
  shape: string;
  size: number;
  quantity: number;
  id: string;
  onCancel: () => void;
  onComplete: () => void;
}

const MAX_CHIPS_PER_MIXER = 5;

const MixerChip: React.FC<MixerChipProps> = ({ 
  flavor, 
  shape, 
  size, 
  quantity, 
  id, 
  onCancel, 
  onComplete 
}) => {
  const flavorCode = flavor === 'vanilla' ? 'VC' : 'DC';
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  
  return (
    <div className={`${bgColor} p-2 rounded-md flex justify-between items-center mb-2`}>
      <span className="font-bold">{flavorCode} | {shape.toUpperCase()}{size} x {quantity}</span>
      <div className="flex gap-1">
        <button 
          onClick={onCancel} 
          className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
        >
          Cancel
        </button>
        <button 
          onClick={onComplete} 
          className="px-2 py-1 bg-green-500 text-white text-xs rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const MixerSection: React.FC<{
  mixerNumber: number;
  chips: ActiveMixing[];
  onCancelTimer: (orderId: string) => void;
  onMixingComplete: (orderId: string) => void;
}> = ({ mixerNumber, chips, onCancelTimer, onMixingComplete }) => {
  const emptySlots = MAX_CHIPS_PER_MIXER - chips.length;
  
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Mixer #{mixerNumber}</h2>
        
        {chips.map(chip => (
          <MixerChip
            key={chip.id}
            id={chip.id}
            flavor={chip.flavor}
            shape={chip.shape}
            size={chip.size}
            quantity={5} // Default quantity
            onCancel={() => onCancelTimer(chip.id)}
            onComplete={() => onMixingComplete(chip.id)}
          />
        ))}
        
        {emptySlots > 0 && (
          <div className="text-sm text-gray-500">
            {emptySlots} empty {emptySlots === 1 ? 'slot' : 'slots'} available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MixingTab: React.FC<MixingTabProps> = ({
  activeMixing,
  onCancelTimer,
  onMixingComplete,
}) => {
  // Filter chips for each mixer (assuming mixer number is stored in the batch label or a property)
  const mixer1Chips = activeMixing.filter(item => item.batchLabel.includes('Mixer #1'));
  const mixer2Chips = activeMixing.filter(item => item.batchLabel.includes('Mixer #2'));
  
  return (
    <TabsContent value="mixing" className="mt-0 h-full overflow-hidden">
      <div className="h-full py-4 px-4">
        <div className="flex gap-4 h-full">
          <MixerSection 
            mixerNumber={1} 
            chips={mixer1Chips} 
            onCancelTimer={onCancelTimer} 
            onMixingComplete={onMixingComplete}
          />
          <MixerSection 
            mixerNumber={2} 
            chips={mixer2Chips} 
            onCancelTimer={onCancelTimer} 
            onMixingComplete={onMixingComplete}
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default MixingTab;
