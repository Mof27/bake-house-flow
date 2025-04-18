import React from 'react';
import { MoveHorizontal, PlusCircle, MinusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface OvenReadyCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  requestedQuantity: number;
  producedQuantity: number;
  isPriority?: boolean;
  isNew?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onQuantityChange: (delta: number) => void;
  id: string;
}

const OvenReadyCard: React.FC<OvenReadyCardProps> = ({
  id,
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  requestedQuantity,
  producedQuantity,
  isPriority = false,
  isNew = false,
  onDragStart,
  onQuantityChange
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  const formattedShapeSize = `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${size}CM`;
  
  return (
    <Card 
      className={`
        relative overflow-hidden transition-all
        ${bgColor} 
        ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
        hover:shadow-md cursor-move w-[200px] h-[200px] flex-shrink-0
      `}
      draggable="true"
      onDragStart={(e) => onDragStart(e, id)}
    >
      <CardContent className="p-2 h-full flex flex-col">
        <div className="text-lg font-bold leading-tight italic">{formattedShapeSize}</div>
        
        <div className="text-xl font-bold leading-tight mb-1">
          {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
        </div>
        
        <div className="text-xs opacity-70 mb-1">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="space-y-1 mb-1">
          <div className="flex space-x-1">
            {isPriority && (
              <Badge variant="destructive" className="text-xs">
                Priority
              </Badge>
            )}
            {isNew && (
              <Badge variant="secondary" className="text-xs bg-bakery-primary/10 text-bakery-primary">
                New
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-medium">Asked Qty: {requestedQuantity}</span>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onQuantityChange(-1)}
              disabled={producedQuantity <= 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => onQuantityChange(1)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <span className="text-sm font-medium">Actual Qty: {producedQuantity}</span>
        
        <div className="flex justify-center items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
          <MoveHorizontal className="h-3 w-3 mr-1" /> Drag to an oven slot
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenReadyCard;
