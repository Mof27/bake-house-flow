
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  requestedQuantity
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
      <CardContent className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center text-[10px] opacity-70">
          <div>{format(new Date(requestedAt), 'dd MMM HH:mm')}</div>
          <div className="font-mono">{uniqueCode}</div>
          
          {/* Tags moved inline with timestamp */}
          <div className="flex gap-1">
            {isPriority && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0">
                PRIORITY
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-1 space-y-0 leading-tight">
          <div className="text-2xl font-bold">
            {`${shape.toUpperCase()} ${size}CM`}
          </div>
          <div className="text-base font-bold">
            {flavor.toUpperCase()}
          </div>
          <div className="text-base">
            {`Qty: ${requestedQuantity}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveMixingCard;
