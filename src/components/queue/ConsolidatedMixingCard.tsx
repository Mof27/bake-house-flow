
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Undo } from 'lucide-react';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { format } from 'date-fns';
import { ConsolidatedMixingItem } from '@/utils/mixingUtils';
import { CountdownButton } from '@/components/ui/countdown-button';

interface ConsolidatedMixingCardProps {
  ids: string[];
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabels: string[];
  requestedAt: Date;
  isPriority?: boolean;
  totalRequestedQuantity: number;
  totalProducedQuantity: number;
  onQuantityChange?: (delta: number) => void;
  onPutBack?: () => void;
}

const ConsolidatedMixingCard: React.FC<ConsolidatedMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabels,
  requestedAt,
  isPriority = false,
  totalRequestedQuantity,
  totalProducedQuantity,
  onQuantityChange,
  onPutBack
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  
  // Clean up batch labels to remove mixer information
  const cleanBatchLabels = batchLabels.map(label => {
    // Extract only the batch code without the mixer part
    const codeMatch = label.match(/#A\d+/);
    return codeMatch ? codeMatch[0] : label.replace(/\s*\(Mixer #\d+\)/g, '');
  });
  
  const batchLabelsDisplay = cleanBatchLabels.join(', ');
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500 animate-flash-priority' : 'border border-gray-200'}
      hover:shadow-md w-full
      h-[113px]  /* reduced height */
      rounded-lg
    `}>      
      <CardContent className="p-2 h-full flex flex-col space-y-2">
        {/* Header with Batch Info and Put Back Button */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-center gap-1">
            <div className="font-mono text-[10px] opacity-70">{batchLabelsDisplay}</div>
            <div className="text-[10px] opacity-70">
              {format(new Date(requestedAt), 'dd MMM HH:mm')}
            </div>
            {isPriority && <Badge variant="destructive" className="text-[8px] px-1 py-0">
                PRIORITY
              </Badge>}
          </div>
          
          <CountdownButton 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onAction={onPutBack || (() => {})} 
            aria-label="Put back to pending"
            showCancelText={false}
          >
            <Undo className="h-4 w-4" />
          </CountdownButton>
        </div>

        {/* Flavor, Shape & Size */}
        <div className="text-base font-bold">
          {`${flavor.toUpperCase()} | ${shape.toUpperCase()} ${size}CM`}
        </div>

        {/* Quantities Section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs">Req: {totalRequestedQuantity}</span>
            <span className="mx-1">|</span>
            <span className="text-xs font-semibold">Actual: {totalProducedQuantity}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onQuantityChange?.(-1)} 
              disabled={totalProducedQuantity <= 1} 
              className="h-7 w-7 bg-inherit"
              aria-label="Decrease quantity"
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onQuantityChange?.(1)} 
              className="h-7 w-7 bg-inherit"
              aria-label="Increase quantity"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedMixingCard;
