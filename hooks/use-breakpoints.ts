import { useEffect, useState } from "react";

const breakpoints = {
  xs: 640,
  sm: 768,
  md: 900,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoints = keyof typeof breakpoints;

export function useBreakpoints(breakpoint: Breakpoints) {
  const [isReached, setIsReached] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsReached(window.innerWidth < breakpoints[breakpoint]);

    const onChange = () => setIsReached(window.innerWidth < breakpoints[breakpoint]);

    const mql = window.matchMedia(`(max-width: ${breakpoints[breakpoint] - 1}px)`);
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isReached;
}
