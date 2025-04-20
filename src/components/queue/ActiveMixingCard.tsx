
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, ArrowRight, Undo, X } from 'lucide-react';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { format } from 'date-fns';

interface ActiveMixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  requestedQuantity: number;
  actualQuantity?: number;
  onQuantityChange?: (delta: number) => void;
  onMoveToOven?: () => void;
  onPutBack?: () => void;
  onCancel?: () => void;
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  requestedQuantity,
  actualQuantity = requestedQuantity,
  onQuantityChange,
  onMoveToOven,
  onPutBack,
  onCancel
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  const orderNumber = batchLabel.match(/\d+/)?.[0] || '001';
  const uniqueCode = `#A${orderNumber.padStart(3, '0')}`;

  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-full
    `}>      
      <CardContent className="p-3 h-full flex flex-col space-y-3">
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] opacity-70">
            <div className="font-mono">{uniqueCode}</div>
            <div>{format(new Date(requestedAt), 'dd MMM HH:mm')}</div>
          </div>
          
          <div className="flex items-center gap-2">
            {isPriority && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0">
                PRIORITY
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={onPutBack}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-600"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Flavor, Shape & Size */}
        <div className="text-lg font-bold">
          {`${flavor.toUpperCase()} | ${shape.toUpperCase()} ${size}CM`}
        </div>

        {/* Quantities Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            Requested: {requestedQuantity}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Actual:</span>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onQuantityChange?.(-1)}
              disabled={actualQuantity <= 1}
            >
              <MinusCircle className="h-5 w-5" />
            </Button>
            <span className="w-8 text-center text-lg font-semibold">{actualQuantity}</span>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onQuantityChange?.(1)}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Move to Oven Button */}
        <Button 
          variant="secondary"
          size="sm"
          className="w-full mt-auto"
          onClick={onMoveToOven}
        >
          Move to Oven
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActiveMixingCard;
