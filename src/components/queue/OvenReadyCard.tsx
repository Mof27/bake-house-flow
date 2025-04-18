
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle } from 'lucide-react';
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
  onQuantityChange: (delta: number) => void;
  id: string;
}

const OvenReadyCard: React.FC<OvenReadyCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  requestedQuantity,
  producedQuantity,
  isPriority = false,
  isNew = false,
  onQuantityChange
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  
  return (
    <Card 
      className={`
        relative w-[200px] h-[200px] flex-shrink-0
        ${bgColor} 
        ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
        hover:shadow-md
      `}
    >
      <CardContent className="p-2 h-full flex flex-col">
        <div className="text-base font-bold leading-tight mb-1">{batchLabel}</div>
        <div className="text-xs opacity-70 mb-1">{formatDateTime(requestedAt)}</div>
        
        <div className="space-y-1 mb-2">
          {isPriority && (
            <Badge variant="destructive" className="text-xs">Priority</Badge>
          )}
          {isNew && (
            <Badge variant="secondary" className="text-xs">New</Badge>
          )}
        </div>
        
        <div className="flex flex-col mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Asked: {requestedQuantity}</span>
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
          
          <div className="text-sm">Actual: {producedQuantity}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenReadyCard;
