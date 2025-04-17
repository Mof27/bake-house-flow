
import React from 'react';
import { PlusCircle, MinusCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  producedQuantity: number;
  requestedAt: Date;
  isPriority?: boolean;
  notes?: string;
  onQuantityChange: (delta: number) => void;
  onStartMixing: () => void;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedQuantity,
  producedQuantity,
  requestedAt,
  isPriority = false,
  notes,
  onQuantityChange,
  onStartMixing
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
  
  // Split batch label into parts (assuming format like "ROUND VANILLA 16CM")
  const parts = batchLabel.split(' ');
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[240px] h-[300px] flex-shrink-0
    `}>      
      <CardContent className="p-3 h-full flex flex-col space-y-2">
        {/* Shape */}
        <div className="text-xl font-bold leading-tight">{parts[0] || ''}</div>
        
        {/* Flavor */}
        <div className="text-xl font-bold leading-tight">{parts[1] || ''}</div>
        
        {/* Date */}
        <div className="text-xs opacity-70">
          {formatDateTime(requestedAt)}
        </div>
        
        {notes && (
          <div className="text-xs bg-muted/50 p-1 rounded">
            {notes}
          </div>
        )}
        
        <div className="flex flex-col space-y-2 mt-auto">
          <div className="text-base font-medium">Asked Qty: {requestedQuantity}</div>
          
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Actual Qty: <span className="text-lg font-bold">{producedQuantity}</span></span>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onQuantityChange(-1)}
                disabled={producedQuantity <= 1}
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onQuantityChange(1)}
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full py-1 h-10 mt-auto" 
          onClick={onStartMixing}
        >
          <PlayCircle className="mr-1 h-4 w-4" /> Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

export default MixingCard;
