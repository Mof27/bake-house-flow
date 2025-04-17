
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatTime } from '@/lib/date-utils';
import OvenItem from './OvenItem';

interface OvenSlotProps {
  ovenNumber: number;
  isActive?: boolean;
  timeRemaining?: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  currentBatch?: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    producedQuantity: number;
  };
  batches: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    producedQuantity: number;
  }[];
  onComplete: () => void;
}

const OvenSlot: React.FC<OvenSlotProps> = ({
  ovenNumber,
  isActive = false,
  timeRemaining,
  onDragOver,
  onDrop,
  currentBatch,
  batches,
  onComplete
}) => {
  const OVEN_TIME = 1680; // 28 minutes in seconds
  const WARNING_TIME = 120; // 2 minutes warning
  
  const showWarning = timeRemaining !== undefined && timeRemaining <= WARNING_TIME && timeRemaining > 0;
  const isTimerExpired = timeRemaining !== undefined && timeRemaining <= 0;
  
  const warningClass = showWarning ? 'animate-pulse' : '';
  
  const bgColorClass = isActive 
    ? (showWarning 
        ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
        : (isTimerExpired 
            ? 'bg-red-100 border-red-500 dark:bg-red-900/40'
            : 'bg-green-50 border-green-500 dark:bg-green-900/20'))
    : 'bg-gray-50 border-gray-300 dark:bg-gray-800/50';
  
  const borderClass = isActive ? 'border-2' : 'border-2 border-dashed';
  
  return (
    <Card 
      className={`
        ${borderClass} ${bgColorClass} ${warningClass}
        transition-all h-[200px] w-[160px] mb-2
      `}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="p-1 pb-0">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>OVEN {ovenNumber}</span>
          <Badge className={`text-xs ${isActive ? (showWarning ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-400'}`}>
            {isActive ? 'BAKING' : 'STANDBY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-1 pt-0 flex flex-col h-[calc(100%-28px)]">
        {isActive && timeRemaining !== undefined ? (
          <div className="flex flex-col h-full">
            <div className="text-center py-0.5">
              <div className="text-base font-bold">
                {timeRemaining > 0 
                  ? formatTime(timeRemaining) 
                  : `+${formatTime(Math.abs(timeRemaining))}`
                }
              </div>
              
              {timeRemaining > 0 && (
                <Progress 
                  value={(timeRemaining / OVEN_TIME) * 100} 
                  className="w-full h-1 my-0.5" 
                />
              )}
              
              <Button
                variant="default"
                size="sm"
                className="w-full my-0.5 text-xs py-0 h-5"
                onClick={onComplete}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> DONE
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden mt-0.5">
              {batches.length > 0 ? (
                <div className="grid grid-cols-1 gap-0.5 h-full">
                  {batches.map((batch, index) => (
                    <div key={batch.id} style={{ 
                      height: `${100 / batches.length}%`,
                      minHeight: '24px'
                    }}>
                      <OvenItem 
                        batchLabel={batch.batchLabel}
                        producedQuantity={batch.producedQuantity}
                        flavor={batch.flavor}
                        shape={batch.shape}
                        size={batch.size}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex-1 flex items-center justify-center text-xs">
            Drop batch here to start baking
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OvenSlot;
