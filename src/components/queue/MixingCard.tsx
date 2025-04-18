
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
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[200px] h-[200px] flex-shrink-0
    `}>      
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] opacity-70">
            {formatDateTime(requestedAt)}
          </div>
          <div className="text-[10px] font-mono">
            #{batchLabel.replace(/[^0-9]/g, '')}
          </div>
        </div>

        {/* Shape and Size */}
        <div className="text-lg font-bold leading-tight mb-1">
          {`${shape.toUpperCase()} ${size}CM`}
        </div>
        
        {/* Flavor */}
        <div className="text-lg font-bold leading-tight mb-2">
          {flavor.toUpperCase()}
        </div>
        
        {/* Notes if any */}
        {notes && (
          <div className="text-xs bg-black/10 p-2 rounded-sm mb-2 line-clamp-2">
            {notes}
          </div>
        )}
        
        {/* Tags */}
        <div className="flex gap-1 mb-2">
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
