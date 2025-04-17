
import React from 'react';
import { PlusCircle, MinusCircle, PlayCircle, Flame } from 'lucide-react';
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
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md w-[180px] h-[180px] flex-shrink-0
    `}>
      {isPriority && (
        <div className="absolute top-0 right-0">
          <div className="w-0 h-0 
            border-t-[30px] border-t-yellow-500
            border-l-[30px] border-l-transparent">
          </div>
          <Flame className="absolute top-1 right-1 h-4 w-4 text-white" />
        </div>
      )}
      
      <CardContent className="p-2 h-full flex flex-col">
        <h3 className="font-bold text-sm truncate">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-1">
          {formatDateTime(requestedAt)}
        </div>
        
        {notes && (
          <div className="mb-1 text-xs bg-muted/50 p-1 rounded truncate">
            {notes}
          </div>
        )}
        
        <div className="flex flex-col space-y-1 mb-2 mt-auto">
          <div className="text-xs font-medium">Asked Qty: {requestedQuantity}</div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Produced: <span className="text-lg font-bold">{producedQuantity}</span></span>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => onQuantityChange(-1)}
                disabled={producedQuantity <= 1}
              >
                <MinusCircle className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => onQuantityChange(1)}
              >
                <PlusCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full text-xs py-1 h-8 mt-auto" 
          onClick={onStartMixing}
        >
          <PlayCircle className="mr-1 h-3 w-3" /> Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

export default MixingCard;
