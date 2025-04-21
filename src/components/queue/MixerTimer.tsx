
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RefreshCw } from "lucide-react";

const COUNTDOWN_SECONDS = 60; // 1 minute

type TimerStatus = "idle" | "countdown" | "countup";

interface MixerTimerProps {
  onReady?: (isReady: boolean) => void;
}

const MixerTimer: React.FC<MixerTimerProps> = ({ onReady }) => {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Notify parent component about timer status changes
  useEffect(() => {
    if (onReady) {
      // Timer is "ready" when in countup mode (overtime)
      onReady(status === "countup");
    }
  }, [status, onReady]);

  // Starts the timer or resumes it (if paused, but here just toggling start/stop)
  const handleToggle = () => {
    if (status === "idle" || status === "countup") {
      // Start/restart countdown from 1:00
      setSeconds(COUNTDOWN_SECONDS);
      setStatus("countdown");
    } else if (status === "countdown") {
      // Stop the timer and reset to idle (1:00)
      handleReset();
    }
  };

  // Manually reset timer to idle state (1:00)
  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("idle");
    setSeconds(COUNTDOWN_SECONDS);
  };

  // Countdown / countup logic
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
    // interval is always cleared on status change/unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  // Format timer for display
  const formatTime = () => {
    if (status === "countup") {
      return `+${String(seconds).padStart(2, "0")}s`;
    }
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;
  };

  // Visual styles
  const getButtonVariant = () => {
    if (status === "idle") return "secondary"; // gray
    if (status === "countdown") return "default"; // blue
    return "destructive"; // red for overtime
  };

  // The main timer toggle: play for idle/after stop, pause to stop (with reset on stop)
  const renderToggleIcon = () => {
    if (status === "idle" || status === "countup") {
      return <Play className="mr-2 h-4 w-4" />;
    }
    // In countdown: show pause (stops and resets)
    return <Pause className="mr-2 h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={getButtonVariant()}
        className={`flex items-center min-w-[160px] text-lg ${status === "countup" ? "animate-pulse" : ""}`}
        onClick={handleToggle}
        aria-label={
          status === "idle" || status === "countup"
            ? "Start Timer"
            : "Stop Timer"
        }
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
