import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Undo } from 'lucide-react';
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
  onPutBack?: () => void;
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
  onPutBack
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  const orderNumber = batchLabel.match(/\d+/)?.[0] || '001';
  const uniqueCode = `#A${orderNumber.padStart(3, '0')}`;
  return <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-full
    `}>      
      <CardContent className="p-3 h-full flex flex-col space-y-3">
        {/* Header with Batch Info and Put Back Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="font-mono text-[10px] opacity-70">{uniqueCode}</div>
            <div className="text-[10px] opacity-70">
              {format(new Date(requestedAt), 'dd MMM HH:mm')}
            </div>
            {isPriority && <Badge variant="destructive" className="text-[8px] px-1 py-0">
                PRIORITY
              </Badge>}
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPutBack}>
            <Undo className="h-5 w-5" />
          </Button>
        </div>

        {/* Flavor, Shape & Size */}
        <div className="text-lg font-bold">
          {`${flavor.toUpperCase()} | ${shape.toUpperCase()} ${size}CM`}
        </div>

        {/* Quantities Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm whitespace-nowrap">Requested: {requestedQuantity}</span>
            <span className="text-sm whitespace-nowrap">Actual: {actualQuantity}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onQuantityChange?.(-1)} disabled={actualQuantity <= 1} className="h-10 w-10 bg-inherit">
              <MinusCircle className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onQuantityChange?.(1)} className="h-10 w-10 bg-inherit">
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ActiveMixingCard;