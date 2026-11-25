"use client";

import { useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** Two different places in a list, as fractions so they suit any length */
const roll = () => [Math.random(), Math.random()] as const;

/**
 * Two of its items, picked afresh each time the page opens. The page itself
 * is static, so the server sends the first two and the browser picks; the
 * list is well below the fold, so the swap isn't seen.
 */
export function RandomTwo({ items, className }: { items: React.ReactNode[]; className?: string }) {
  const [[a, b]] = useState(roll);
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  const first = inBrowser ? Math.floor(a * items.length) : 0;
  // Counted from the one after the first, so it can't be the same one
  const second = (first + 1 + (inBrowser ? Math.floor(b * (items.length - 1)) : 0)) % items.length;
  return (
    <ul className={className}>
      {items[first]}
      {second !== first ? items[second] : null}
    </ul>
  );
}
