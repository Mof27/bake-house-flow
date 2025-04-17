
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
    
  // Split batch label into parts (assuming format like "ROUND VANILLA 16CM")
  const parts = batchLabel.split(' ');
  
  return (
    <Card 
      className={`
        relative overflow-hidden transition-all
        ${bgColor} 
        ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
        hover:shadow-md cursor-move w-[240px] h-[240px] flex-shrink-0
      `}
      draggable="true"
      onDragStart={(e) => onDragStart(e, id)}
    >
      <CardContent className="p-3 h-full flex flex-col space-y-2">
        {/* Shape */}
        <div className="text-xl font-bold leading-tight">{parts[0] || ''}</div>
        
        {/* Flavor */}
        <div className="text-xl font-bold leading-tight">{parts[1] || ''}</div>
        
        {/* Date */}
        <div className="text-xs opacity-70">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="text-base font-medium mt-auto">
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
