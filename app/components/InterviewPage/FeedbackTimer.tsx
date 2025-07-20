"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface FeedbackTimerProps {
  endedAt: string;
  onTimerComplete: () => void;
}

export default function FeedbackTimer({
  endedAt,
  onTimerComplete,
}: FeedbackTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endTime = new Date(endedAt).getTime();
      const currentTime = new Date().getTime();
      const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds
      const targetTime = endTime + twoMinutesInMs;
      const remaining = targetTime - currentTime;

      if (remaining <= 0) {
        setTimeRemaining(0);
        onTimerComplete();
        return 0;
      }

      return Math.max(0, remaining);
    };

    // Initial calculation
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // If already complete, don't start timer
    if (initial === 0) {
      return;
    }

    // Set up interval to update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endedAt, onTimerComplete]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (timeRemaining === 0) {
    return null;
  }

  return (
    <div className="flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
      <Clock className="w-3 h-3 mr-1 animate-pulse" />
      <span className="whitespace-nowrap">
        Feedback in {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
