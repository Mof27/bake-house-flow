import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COUNTDOWN_SECONDS = 60; // 1 minute

type TimerStatus = "idle" | "countdown" | "countup";

interface MixerTimerProps {
  onReady?: (isReady: boolean) => void;
}

const MixerTimer: React.FC<MixerTimerProps> = ({ onReady }) => {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (onReady) onReady(status === "countup");
  }, [status, onReady]);

  const handleToggle = () => {
    if (status === "idle" || status === "countup") {
      setSeconds(COUNTDOWN_SECONDS);
      setStatus("countdown");
    } else if (status === "countdown") {
      handleReset();
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("idle");
    setSeconds(COUNTDOWN_SECONDS);
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status === "countdown") {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setStatus("countup");
            toast({
              title: "Mixing completed",
              description: "Time is up! Please move products to the oven.",
              variant: "destructive"
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (status === "countup") {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const formatTime = () => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;
  };

  const getButtonStyle = () => {
    if (status === "countdown") {
      return "bg-blue-500 text-white hover:bg-blue-600 border-blue-700 shadow font-semibold";
    }
    if (status === "countup") {
      return "bg-red-600 text-white border-red-700 shadow font-extrabold animate-pulse";
    }
    return "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300";
  };

  const renderToggleIcon = () => {
    if (status === "idle" || status === "countup") {
      return <Play className="mr-2 h-4 w-4" />;
    }
    return <Pause className="mr-2 h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        className={`flex items-center min-w-[160px] text-lg transition-all duration-500 ${getButtonStyle()}`}
        onClick={handleToggle}
        aria-label={
          status === "idle" || status === "countup"
            ? "Start Timer"
            : "Stop Timer"
        }
        data-status={status}
      >
        <Timer className="mr-2 h-4 w-4" />
        {renderToggleIcon()}
        {formatTime()}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleReset}
        aria-label="Reset Timer"
        className="ml-1"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MixerTimer;
