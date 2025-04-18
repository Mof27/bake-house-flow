
import React, { useEffect, useState } from 'react';
import { Clock, XCircle, TimerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CakeFlavor, CakeShape } from '@/types/queue';
import { formatDateTime, formatTime } from '@/lib/date-utils';

interface ActiveMixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  onCancel: () => void;
  onComplete: () => void;
  startTime: Date;
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  onCancel,
  onComplete,
  startTime
}) => {
  const MIXING_TIME = 120;
  const WARNING_TIME = 30;

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return Math.max(0, MIXING_TIME - elapsedSeconds);
  });
  const [isTimerExpired, setIsTimerExpired] = useState<boolean>(() => timeLeft <= 0);
  
  const bgColor = flavor === 'vanilla' ? 'bg-amber-50 text-amber-950' : 'bg-amber-900 text-amber-50';
  const progressPercentage = (timeLeft / MIXING_TIME) * 100;
  
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            setIsTimerExpired(true);
          }
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [timeLeft]);
  
  return (
    <Card className={`
      relative w-[200px] h-[200px] flex-shrink-0
      ${bgColor}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      ${isTimerExpired ? 'animate-pulse' : ''}
    `}>
      <CardContent className="p-2 h-full flex flex-col">
        <div className="text-base font-bold leading-tight mb-1">{batchLabel}</div>
        <div className="text-xs opacity-70 mb-2">{formatDateTime(requestedAt)}</div>
        
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="flex items-center justify-center text-lg font-bold">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-1 mt-auto">
          <Button 
            variant="destructive"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={onCancel}
          >
            <XCircle className="h-3 w-3 mr-1" /> Cancel
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={onComplete}
          >
            <TimerOff className="h-3 w-3 mr-1" /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveMixingCard;
