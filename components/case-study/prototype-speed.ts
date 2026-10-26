"use client";

import { createContext, useContext, useMemo } from "react";
import type { Transition } from "motion/react";
import { slow } from "@/lib/motion";

/** 1 = real time, 0.25 = slow motion for inspecting the craft */
export const SpeedContext = createContext(1);

/** Returns helpers that slow any transition or timeout by the current demo speed (stable per speed) */
export function useSlow() {
  const speed = useContext(SpeedContext);
  return useMemo(
    () => ({ speed, t: (t: Transition) => slow(t, speed), ms: (ms: number) => ms / speed }),
    [speed],
  );
}
