"use client";

import { useState } from "react";
import type { PileThemeName } from "@/content/tag-pile";

export type Entrance = "random" | "sequence" | "together";

export type PileSettings = {
  gravity: number;
  bounce: number;
  friction: number;
  throwStrength: number;
  squash: boolean;
  theme: PileThemeName;
  entrance: Entrance;
  replayOnRevisit: boolean;
};

export const defaultPileSettings: PileSettings = {
  gravity: 1,
  bounce: 0.35,
  friction: 0.3,
  throwStrength: 1.2,
  squash: true,
  theme: "candy",
  entrance: "random",
  replayOnRevisit: true,
};

export function usePileSettings() {
  const [settings, setSettings] = useState<PileSettings>(defaultPileSettings);
  // Bumping this drops the pile again (Replay / Reset)
  const [dropKey, setDropKey] = useState(0);
  const update = (patch: Partial<PileSettings>) => setSettings((s) => ({ ...s, ...patch }));
  const replay = () => setDropKey((k) => k + 1);
  const reset = () => {
    setSettings(defaultPileSettings);
    setDropKey((k) => k + 1);
  };
  return { settings, update, dropKey, replay, reset };
}
