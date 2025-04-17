import React, { useState, useEffect } from 'react';
import { Clock, XCircle, TimerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
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
  const MIXING_TIME = 120; // 2 minutes in seconds
  const WARNING_TIME = 30; // 30 seconds

  const calculateInitialTimeLeft = () => {
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return Math.max(0, MIXING_TIME - elapsedSeconds);
  };
  
  const [timeLeft, setTimeLeft] = useState<number>(calculateInitialTimeLeft());
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerExpired, setIsTimerExpired] = useState<boolean>(calculateInitialTimeLeft() <= 0);
  
  let baseTextColor = flavor === 'vanilla' ? 'text-amber-950' : 'text-amber-50';
  let baseBgColor = flavor === 'vanilla' ? 'bg-amber-50' : 'bg-amber-900';
  
  let warningBgColor = flavor === 'vanilla' ? 'bg-red-200' : 'bg-red-700';
  let warningTextColor = 'text-white';
  
  let expiredBgColor = 'bg-red-500';
  let expiredTextColor = 'text-white';
  
  let bgColorClass = baseBgColor;
  let textColorClass = baseTextColor;
  let animationClass = '';
  
  // Split batch label into parts (assuming format like "ROUND VANILLA 16CM")
  const parts = batchLabel.split(' ');

  if (isTimerExpired) {
    bgColorClass = expiredBgColor;
    textColorClass = expiredTextColor;
    animationClass = 'animate-pulse';
  } else if (timeLeft <= WARNING_TIME) {
    bgColorClass = warningBgColor;
    textColorClass = warningTextColor;
    animationClass = 'animate-pulse';
  }
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === WARNING_TIME) {
            toast.warning("30 seconds left on mixing timer!", {
              description: `${batchLabel} mixing will be done soon!`,
              duration: 5000,
            });
            try {
              const audio = new Audio('/beep.mp3');
              audio.play();
            } catch (error) {
              console.log('Audio notification failed:', error);
            }
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isTimerExpired) {
      setIsTimerExpired(true);
      toast.success("Mixing complete!", {
        description: `${batchLabel} is ready to be moved to oven queue`,
      });
      
      if (interval) {
        clearInterval(interval);
      }
      
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, batchLabel, isTimerExpired]);
  
  const progressPercentage = (timeLeft / MIXING_TIME) * 100;
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColorClass} ${textColorClass} ${animationClass}
      ${isPriority ? 'border-2 border-red-500' : 'border border-gray-200'}
      hover:shadow-md w-[240px] h-[240px] flex-shrink-0
    `}>      
      <CardContent className="p-3 h-full flex flex-col space-y-2">
        {/* Shape */}
        <div className="text-xl font-bold leading-tight">{parts[0] || ''}</div>
        
        {/* Flavor */}
        <div className="text-xl font-bold leading-tight">{parts[1] || ''}</div>
        
        {/* Date */}
        <div className="text-xs opacity-70">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="flex flex-col items-center mt-1 mb-1 flex-grow">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {!isTimerExpired ? (
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            ) : (
              <span className="text-xl font-bold">+{formatTime(elapsedTime)}</span>
            )}
          </div>
          
          {!isTimerExpired && (
            <Progress 
              value={progressPercentage} 
              className="w-full h-2 mt-2" 
            />
          )}
        </div>
        
        <div className="flex space-x-2 mt-auto">
          <Button 
            variant="cancel"
            size="sm"
            className="flex-1 text-xs py-1 h-8" 
            onClick={onCancel}
          >
            <XCircle className="mr-1 h-3 w-3" /> Cancel
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="flex-1 text-xs py-1 h-8"
            onClick={onComplete}
          >
            <TimerOff className="mr-1 h-3 w-3" /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveMixingCard;
