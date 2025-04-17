import React from 'react';
import { PlusCircle, MinusCircle, PlayCircle, Zap } from 'lucide-react';
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
  onQuantityChange?: (delta: number) => void;
  onStartMixing: () => void;
}
const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedQuantity,
  requestedAt,
  isPriority = false,
  notes,
  onStartMixing
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';

  // Format the shape and size for display
  const formattedShapeSize = `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${size}CM`;
  return <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[240px] h-[300px] flex-shrink-0
    `}>
      {isPriority && <div className="absolute top-2 right-2">
          <Zap className="h-5 w-5 text-red-500" />
        </div>}
      
      <CardContent className="p-3 h-full flex flex-col rounded-2xl bg-inherit">
        {/* Shape and size */}
        <div className="text-2xl font-bold leading-tight mb-1 italic">{formattedShapeSize}</div>
        
        {/* Flavor */}
        <div className="text-2xl font-bold leading-tight mb-2">
          {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
        </div>
        
        {/* Date */}
        <div className="text-xs opacity-70 mb-2">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="text-base font-medium mb-2">Asked Qty: {requestedQuantity}</div>
        
        {/* Notes section - position fixed above start mixing button */}
        <div className="flex-1">
          {notes && <div className="text-xs bg-muted/50 p-1 rounded">
              {notes}
            </div>}
        </div>
        
        <Button onClick={onStartMixing} className="w-full py-1 h-10 mt-auto text-zinc-50 bg-bakery-primary">
          <PlayCircle className="mr-1 h-4 w-4" /> Start Mixing
        </Button>
      </CardContent>
    </Card>;
};
export default MixingCard;