
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { format } from 'date-fns';

interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  onAction: (mixerId: number) => void;
  notes?: string;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  onAction,
  notes
}) => {
  const [isNew, setIsNew] = useState(false);
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  
  useEffect(() => {
    const timeDiff = (new Date().getTime() - new Date(requestedAt).getTime()) / 1000 / 60;
    setIsNew(timeDiff <= 5);
  }, [requestedAt]);
  
  const orderNumber = batchLabel.match(/\d+/)?.[0] || '001';
  const uniqueCode = `#A${orderNumber.padStart(3, '0')}`;
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[200px] h-[200px] flex-shrink-0
    `}>      
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start text-[10px] opacity-70">
          <div>{format(new Date(requestedAt), 'dd MMM at HH:mm')}</div>
          <div className="font-mono">{uniqueCode}</div>
        </div>

        {/* Main Content */}
        <div className="mt-1 space-y-0.5">
          <div className="text-xl font-bold leading-tight">
            {`${shape.toUpperCase()} ${size}CM`}
          </div>
          <div className="text-base font-bold leading-tight">
            {flavor.toUpperCase()}
          </div>
        </div>
        
        {/* Notes if any */}
        {notes && (
          <div className="text-xs bg-black/10 p-1 rounded-sm mt-1 line-clamp-2">
            {notes}
          </div>
        )}
        
        {/* Tags */}
        <div className="flex gap-1 mt-1">
          {isPriority && (
            <Badge 
              variant="destructive" 
              className="text-[10px] px-1 py-0 animate-flash-priority"
            >
              PRIORITY
            </Badge>
          )}
          {isNew && (
            <Badge 
              variant="secondary" 
              className="text-[10px] px-1 py-0 bg-bakery-primary/10 text-bakery-primary animate-flash-priority"
            >
              NEW
            </Badge>
          )}
        </div>
        
        {/* Mixer Buttons - Always at bottom */}
        <div className="mt-auto flex gap-1">
          <Button 
            variant="default"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onAction(1)}
          >
            Mixer #1
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onAction(2)}
          >
            Mixer #2
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MixingCard;
