
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

  return (
    <div className={`p-1 ${bgColor} rounded-md text-xs w-full h-full flex flex-col justify-center`}>
      <h4 className="font-bold text-xs truncate">{batchLabel}</h4>
      <div className="text-xs">
        Qty: <span className="font-bold">{producedQuantity}</span>
      </div>
    </div>
  );
};

export default OvenItem;
