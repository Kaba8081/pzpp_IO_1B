import { useEffect, useRef, useState } from "react";

export function useAnimatedMount(isOpen: boolean, duration = 120) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      clearTimeout(timerRef.current);
      setIsMounted(true);
      setIsExiting(false);
    } else if (isMounted) {
      setIsExiting(true);
      timerRef.current = setTimeout(() => {
        setIsMounted(false);
        setIsExiting(false);
      }, duration);
    }
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { isMounted, isExiting };
}
