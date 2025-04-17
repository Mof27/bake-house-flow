
import React, { useEffect, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime } from '@/lib/date-utils';

interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  requestedAt: Date;
  isPriority?: boolean;
  isNew?: boolean;
  notes?: string;
  onStartMixing: () => void;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedQuantity,
  requestedAt,
  isPriority = false,
  isNew = false,
  notes,
  onStartMixing
}) => {
  const [shouldShowNew, setShouldShowNew] = useState(isNew);
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';

  // Check if order is within 5 minutes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setShouldShowNew(false);
      }, 5 * 60 * 1000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Format the shape and size for display
  const formattedShapeSize = `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${size}CM`;
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'animate-pulse-attention' : ''}
      hover:shadow-md w-[240px] h-[300px] flex-shrink-0
    `}>
      <CardContent className="p-3 h-full flex flex-col rounded-2xl bg-inherit">
        {/* Shape and size */}
        <div className="text-xl font-bold leading-tight mb-1 italic">{formattedShapeSize}</div>
        
        {/* Flavor */}
        <div className="text-2xl font-bold leading-tight mb-2">
          {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
        </div>
        
        {/* Date */}
        <div className="text-xs opacity-70 mb-2">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="text-base font-medium mb-2">Asked Qty: {requestedQuantity}</div>
        
        {/* Notes and Tags section */}
        <div className="space-y-2 mt-auto">
          {notes && (
            <div className="text-xs bg-muted/50 p-1 rounded">
              {notes}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {isPriority && (
              <Badge variant="destructive" className="text-xs">
                Priority
              </Badge>
            )}
            {shouldShowNew && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 animate-pulse"
              >
                New
              </Badge>
            )}
          </div>
        </div>
        
        <Button 
          onClick={onStartMixing} 
          className="w-full py-1 h-10 mt-2 text-zinc-50 bg-bakery-primary"
        >
          <PlayCircle className="mr-1 h-4 w-4" /> Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

export default MixingCard;
