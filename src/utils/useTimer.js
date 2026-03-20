import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(onTick, onComplete) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onTickRef.current = onTick;
    onCompleteRef.current = onComplete;
  }, [onTick, onComplete]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback((seconds) => {
    stop();
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (onTickRef.current) onTickRef.current(next);
        if (next <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          if (onCompleteRef.current) onCompleteRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stop]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeft > 0 && !isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          if (onTickRef.current) onTickRef.current(next);
          if (next <= 0) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);
            if (onCompleteRef.current) onCompleteRef.current();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  return { timeLeft, isRunning, totalTime, progress, start, pause, resume, stop };
}

// Stopwatch (counts up) for assessment max hangs
export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setElapsed(0);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    return elapsed;
  }, [elapsed]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { elapsed, isRunning, start, stop, reset };
}
