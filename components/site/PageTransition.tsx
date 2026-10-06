import { ViewTransition, type ReactNode } from "react";

// Directional page change. Links tagged "nav-forward" (going deeper, e.g.
// opening a case study) slide the page left; "nav-back" slides it right.
// Untagged changes (browser back/forward, refresh) don't animate the page.
// Must wrap each page, not the layout: layouts persist, so they never enter or exit.
export function PageTransition({ children }: { children: ReactNode }) {
  const types = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };
  return (
    <ViewTransition enter={types} exit={types} default="none">
      {children}
    </ViewTransition>
  );
}
