
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

// The timer can be in one of these states
type TimerStatus = "idle" | "countdown" | "done" | "countup";  // Added "countup" to the type definition

interface MixerTimerProps {
  onReady: (isReady: boolean) => void;
}

const COUNTDOWN_SECONDS = 60;

const MixerTimer: React.FC<MixerTimerProps> = ({ onReady }) => {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Notify parent when countdown is done (ready = true)
  useEffect(() => {
    onReady(status === "done" || status === "countup");
  }, [status, onReady]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); }
  }, []);

  const handleStart = () => {
    if (status === "idle") {
      setSeconds(COUNTDOWN_SECONDS);
      setStatus("countdown");
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setStatus("done");
            setTimeout(() => setStatus("countup"), 800); // Briefly show done/flash
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (status === "countup") {
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (status !== "countup" && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status]);

  return (
    <div className="flex items-center gap-2 mb-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={status !== "idle"}
        onClick={handleStart}
        className="flex items-center"
      >
        <Timer className="mr-2 h-4 w-4" />
        {status === "idle" ? "Start Mixing Timer" : "Running..."}
      </Button>
      <div
        className={
          "px-3 py-1 rounded text-sm font-mono font-bold ml-2 min-w-[48px] text-center" +
          (status === "done" ? " bg-red-600 text-white animate-pulse ring-2 ring-red-400" : "") +
          (status === "countup" ? " bg-red-200 text-red-800 animate-pulse" : "") +
          (status === "countdown" ? " bg-secondary/80" : "") +
          (status === "idle" ? " bg-gray-200" : "")
        }
      >
        {status === "idle" ? "--:--" :
          (status === "countup"
            ? "+" + String(seconds).padStart(2, "0") + "s"
            : String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0"))}
      </div>
    </div>
  );
};

export default MixerTimer;
