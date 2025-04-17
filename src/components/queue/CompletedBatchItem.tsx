
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface CompletedBatchItemProps {
  batchLabel: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  producedQuantity: number;
  completedAt: Date;
  isPriority?: boolean;
  isNew?: boolean;
}

const CompletedBatchItem: React.FC<CompletedBatchItemProps> = ({
  batchLabel,
  flavor,
  shape,
  size,
  producedQuantity,
  completedAt,
  isPriority = false,
  isNew = false
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
  
  // Split batch label into parts
  const parts = batchLabel.split(' ');
    
  return (
    <div className={`flex flex-col p-2 ${bgColor} rounded-md mb-1`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-base">{parts[0] || ''}</div>
          <div className="font-bold text-base">{parts[1] || ''}</div>
          <div className="text-sm">Qty: {producedQuantity}</div>
          
          {/* Tags section */}
          <div className="flex space-x-2 mt-1">
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
        <div className="text-xs opacity-70">
          {formatDateTime(completedAt)}
        </div>
      </div>
    </div>
  );
};

export default CompletedBatchItem;
