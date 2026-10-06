import type { ComponentProps, ReactNode } from "react";
import { slugify } from "@/lib/slugify";

// Typography for long-form case studies. Body measure stays under ~70ch.

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  return "";
}

export function H2({ children }: ComponentProps<"h2">) {
  const id = slugify(text(children));
  return (
    <h2
      id={id}
      tabIndex={-1}
      className="mt-16 mb-4 scroll-mt-24 text-h2 font-medium text-balance first:mt-0 focus:outline-none"
    >
      {children}
    </h2>
  );
}

export function H3(props: ComponentProps<"h3">) {
  return <h3 className="mt-10 mb-3 text-title font-medium" {...props} />;
}

export function P(props: ComponentProps<"p">) {
  return <p className="my-4 max-w-[68ch] text-pretty" {...props} />;
}

export function UL(props: ComponentProps<"ul">) {
  return (
    <ul
      className="my-4 max-w-[68ch] space-y-2 pl-5 [&>li]:relative [&>li]:before:absolute [&>li]:before:top-[0.8em] [&>li]:before:-left-5 [&>li]:before:h-px [&>li]:before:w-2.5 [&>li]:before:bg-ink"
      {...props}
    />
  );
}

export function A(props: ComponentProps<"a">) {
  return <a className="text-ink underline hover:text-ink-hover" {...props} />;
}

export function Strong(props: ComponentProps<"strong">) {
  return <strong className="font-semibold text-fg" {...props} />;
}
