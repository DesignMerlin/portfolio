import { ViewTransition } from "react";

const directional = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

/**
 * Wrap each page (not the layout: layouts persist, so they never enter or exit).
 * Forward navigation slides content left, back slides it right. Untyped
 * transitions (browser back, refresh) don't slide; shared morphs still run.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={directional} exit={directional} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
