
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

// The timer can be in one of these states
type TimerStatus = "idle" | "countdown" | "done" | "countup";

interface MixerTimerProps {
  onReady: (isReady: boolean) => void;
}

const COUNTDOWN_SECONDS = 60; // 1 minute countdown

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

  // Notify parent when countdown is done (ready = true)
  useEffect(() => {
    onReady(status === "done" || status === "countup");
  }, [status, onReady]);

  const handleStart = () => {
    if (status === "idle") {
      setSeconds(COUNTDOWN_SECONDS);
      setStatus("countdown");
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start countdown
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            // Clear the countdown interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setStatus("done");
            // Set timer to switch to countup mode after a brief pause
            setTimeout(() => setStatus("countup"), 800);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle countup timer separately
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (status === "countup") {
      setSeconds(0);
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
    if (status === "idle") return "Start Mixing Timer";
    if (status === "countup") {
      return "+" + String(seconds).padStart(2, "0") + "s";
    }
    return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + 
           String(seconds % 60).padStart(2, "0");
  };

  // Determine button variant based on timer status
  const getButtonVariant = () => {
    if (status === "idle") return "secondary";
    if (status === "countdown") return "default"; // Blue color when counting down
    return "destructive"; // Red color when done or counting up
  };

  return (
    <Button
      size="sm"
      variant={getButtonVariant()}
      disabled={status !== "idle"}
      onClick={handleStart}
      className={`flex items-center ${status === "countup" || status === "done" ? "animate-pulse" : ""}`}
    >
      <Timer className="mr-2 h-4 w-4" />
      {formatTime()}
    </Button>
  );
};

export default MixerTimer;
