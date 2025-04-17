
import React from 'react';
import { CakeFlavor, CakeShape } from '@/types/queue';

interface OvenItemProps {
  batchLabel: string;
  producedQuantity: number;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
}

const OvenItem: React.FC<OvenItemProps> = ({
  batchLabel,
  producedQuantity,
  flavor,
  shape,
  size
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';

  // Split batch label into parts
  const parts = batchLabel.split(' ');

  return (
    <div className={`p-2 ${bgColor} rounded-md text-xs w-full h-full flex flex-col justify-center space-y-1`}>
      <div className="font-bold text-xs">{parts[0] || ''}</div>
      <div className="font-bold text-xs">{parts[1] || ''}</div>
      <div className="text-xs">
        Qty: <span className="font-bold">{producedQuantity}</span>
      </div>
    </div>
  );
};

export default OvenItem;
