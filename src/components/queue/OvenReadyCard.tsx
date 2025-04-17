
import React from 'react';
import { Flame, MoveHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  onDragStart: (e: React.DragEvent, id: string) => void;
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
  onDragStart
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  return (
    <Card 
      className={`
        relative overflow-hidden transition-all
        ${bgColor} 
        ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
        hover:shadow-md cursor-move w-[180px] h-[180px] flex-shrink-0
      `}
      draggable="true"
      onDragStart={(e) => onDragStart(e, id)}
    >
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
        
        <div className="text-xs font-medium mb-1 mt-auto">
          Qty: <span className="text-xl font-bold">{producedQuantity}</span>
        </div>
        
        <div className="flex justify-center items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <MoveHorizontal className="h-3 w-3 mr-1" /> Drag to an oven slot
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenReadyCard;
