
import React from 'react';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface CompletedBatchItemProps {
  batchLabel: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  producedQuantity: number;
  completedAt: Date;
}

const CompletedBatchItem: React.FC<CompletedBatchItemProps> = ({
  batchLabel,
  flavor,
  shape,
  size,
  producedQuantity,
  completedAt
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
        </div>
        <div className="text-xs opacity-70">
          {formatDateTime(completedAt)}
        </div>
      </div>
    </div>
  );
};

export default CompletedBatchItem;
