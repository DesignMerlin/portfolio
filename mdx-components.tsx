import type { MDXComponents } from "mdx/types";
import { Decision, Figure, InProgress } from "@/components/case-study/blocks";
import { A, H2, H3, P, Strong, UL } from "@/components/case-study/prose";

// Required by @next/mdx in the App Router. Everything here is available in
// every MDX file without an import.
const components: MDXComponents = {
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  a: A,
  strong: Strong,
  Decision,
  Figure,
  InProgress,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
