import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Case study components
// (TLDR, Figure, CompareSlider, DecisionLog, Outcome) get registered here
// once they exist, so MDX files can use them without importing.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
