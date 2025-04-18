
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  isNew?: boolean;
  actionLabel: string;
  onAction: () => void;
  notes?: string;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  isNew = false,
  actionLabel,
  onAction,
  notes
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
      <CardContent className="p-3 h-full flex flex-col space-y-2">
        {/* Shape and Size in one line */}
        <div className="text-lg font-bold leading-tight">
          {`${shape.toUpperCase()} ${size} CM`}
        </div>
        
        {/* Flavor */}
        <div className="text-lg font-bold leading-tight">{parts[1] || ''}</div>
        
        {/* Date */}
        <div className="text-xs opacity-70">
          {formatDateTime(requestedAt)}
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          {isPriority && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0">
              PRIORITY
            </Badge>
          )}
          {isNew && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-bakery-primary/10 text-bakery-primary">
              NEW
            </Badge>
          )}
        </div>
        
        {/* Notes */}
        {notes && (
          <div className="text-xs bg-black/10 p-2 rounded-sm line-clamp-2 overflow-hidden">
            {notes}
          </div>
        )}
        
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
