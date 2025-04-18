
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  actionLabel: string;
  onAction: () => void;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  actionLabel,
  onAction,
}) => {
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  
  // Split batch label into parts (assuming format like "ROUND VANILLA 16CM")
  const parts = batchLabel.split(' ');
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[200px] h-[200px] flex-shrink-0
    `}>      
      <CardContent className="p-3 h-full flex flex-col space-y-1.5">
        {/* Shape */}
        <div className="text-lg font-bold leading-tight">{parts[0] || ''}</div>
        
        {/* Flavor */}
        <div className="text-lg font-bold leading-tight">{parts[1] || ''}</div>
        
        {/* Size */}
        <div className="text-sm font-semibold">{parts[2] || ''}</div>
        
        {/* Date */}
        <div className="text-xs opacity-70">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="flex flex-col items-center mt-auto mb-auto">
          {isPriority && (
            <span className="text-red-500 font-bold text-sm">PRIORITY</span>
          )}
        </div>
        
        <Button 
          variant="default"
          size="sm"
          className="mt-auto w-full text-xs"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MixingCard;
