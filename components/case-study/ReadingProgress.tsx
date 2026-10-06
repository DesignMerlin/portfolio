// Scroll-linked reading progress: a 2px ink rule along the top edge.
// Pure CSS scroll-driven animation (see globals.css): no JS, transform only.
// Browsers without scroll timelines simply don't show it.
export function ReadingProgress() {
  return (
    <div aria-hidden="true" className="reading-progress fixed inset-x-0 top-0 z-40 h-0.5 bg-ink" />
  );
}
