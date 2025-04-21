
import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Timer, X } from 'lucide-react';

interface CountdownButtonProps extends ButtonProps {
  onAction: () => void;
  countdownSeconds?: number;
  countdownText?: string;
  cancelText?: string;
  showCancelText?: boolean;
}

const CountdownButton = React.forwardRef<HTMLButtonElement, CountdownButtonProps>(
  ({
    onAction,
    countdownSeconds = 3,
    countdownText,
    cancelText = "Cancel",
    showCancelText = true,
    children,
    className,
    variant = "ghost",
    size = "icon",
    ...props
  }, ref) => {
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(countdownSeconds);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Clear the interval on unmount
    useEffect(() => {
      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }, []);

    const handleClick = () => {
      // If already counting down, cancel the countdown
      if (isCountingDown) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setIsCountingDown(false);
        setCountdown(countdownSeconds);
        return;
      }

      // Start countdown
      setIsCountingDown(true);
      setCountdown(countdownSeconds);
      
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // When countdown reaches zero
            clearInterval(countdownRef.current as NodeJS.Timeout);
            setIsCountingDown(false);
            onAction();
            return countdownSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative",
          className,
          isCountingDown && "animate-pulse"
        )}
        variant={isCountingDown ? "destructive" : variant}
        size={size}
        onClick={handleClick}
        {...props}
      >
        {isCountingDown ? (
          <div className="flex items-center">
            <span className="font-bold mr-1">{countdown}</span>
            {showCancelText && (
              <>
                <X className="h-4 w-4 mx-1" />
                <span className="text-xs">{cancelText}</span>
              </>
            )}
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

CountdownButton.displayName = "CountdownButton";

export { CountdownButton };
