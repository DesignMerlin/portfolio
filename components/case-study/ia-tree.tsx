"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronRight } from "@/components/ui/icons";

export type IANode = { label: string; note?: string; children?: IANode[] };

type Flat = { node: IANode; path: string; depth: number; parent: string | null };

function flatten(nodes: IANode[], open: Set<string>, depth = 0, parent: string | null = null, out: Flat[] = []) {
  nodes.forEach((node, i) => {
    const path = parent ? `${parent}/${i}` : String(i);
    out.push({ node, path, depth, parent });
    if (node.children && open.has(path)) flatten(node.children, open, depth + 1, path, out);
  });
  return out;
}

function allPaths(nodes: IANode[], parent: string | null = null, out: string[] = []) {
  nodes.forEach((n, i) => {
    const path = parent ? `${parent}/${i}` : String(i);
    if (n.children) {
      out.push(path);
      allPaths(n.children, path, out);
    }
  });
  return out;
}

/**
 * Information architecture as a living sitemap. Branches open and close in
 * place (WAI-ARIA tree: arrows move, Right opens, Left closes or goes to the
 * parent, Enter toggles), so readers explore the structure the way a user
 * would move through it instead of squinting at a static diagram.
 */
export function IATree({ tree }: { tree: IANode[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(tree.map((_, i) => String(i))));
  const [focus, setFocus] = useState("0");
  const refs = useRef(new Map<string, HTMLDivElement>());

  const visible = useMemo(() => flatten(tree, open), [tree, open]);
  const every = useMemo(() => allPaths(tree), [tree]);
  const total = useMemo(() => {
    const count = (ns: IANode[]): number => ns.reduce((n, x) => n + 1 + (x.children ? count(x.children) : 0), 0);
    return count(tree);
  }, [tree]);

  const toggle = (path: string, force?: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      const willOpen = force ?? !next.has(path);
      if (willOpen) next.add(path);
      else next.delete(path);
      return next;
    });

  const move = (path: string) => {
    setFocus(path);
    refs.current.get(path)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, item: Flat) => {
    const i = visible.findIndex((v) => v.path === item.path);
    const hasKids = !!item.node.children?.length;
    const isOpen = open.has(item.path);
    const keys: Record<string, () => void> = {
      ArrowDown: () => visible[i + 1] && move(visible[i + 1]!.path),
      ArrowUp: () => visible[i - 1] && move(visible[i - 1]!.path),
      ArrowRight: () => {
        if (hasKids && !isOpen) toggle(item.path, true);
        else if (hasKids) move(`${item.path}/0`);
      },
      ArrowLeft: () => {
        if (hasKids && isOpen) toggle(item.path, false);
        else if (item.parent) move(item.parent);
      },
      Enter: () => hasKids && toggle(item.path),
      " ": () => hasKids && toggle(item.path),
      Home: () => move(visible[0]!.path),
      End: () => move(visible[visible.length - 1]!.path),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  return (
    <div className="my-10 rounded-[var(--radius-l)] border border-line bg-surface lg:-mr-[12%]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <p className="text-small text-ink-2">
          {total} screens and sections, {visible.length} showing
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={() => setOpen(new Set(every))} className="rounded-full px-3 py-1 text-small text-ink-2 hover:bg-sunken hover:text-ink">
            Expand all
          </button>
          <button type="button" onClick={() => setOpen(new Set())} className="rounded-full px-3 py-1 text-small text-ink-2 hover:bg-sunken hover:text-ink">
            Collapse
          </button>
        </div>
      </div>
      <div role="tree" aria-label="Information architecture" className="p-3">
        {visible.map((item) => {
          const hasKids = !!item.node.children?.length;
          const isOpen = open.has(item.path);
          return (
            <div
              key={item.path}
              ref={(el) => {
                if (el) refs.current.set(item.path, el);
                else refs.current.delete(item.path);
              }}
              role="treeitem"
              aria-level={item.depth + 1}
              aria-expanded={hasKids ? isOpen : undefined}
              aria-selected={focus === item.path}
              tabIndex={focus === item.path ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, item)}
              onClick={() => {
                setFocus(item.path);
                if (hasKids) toggle(item.path);
              }}
              className={`ia-row flex cursor-default items-center gap-2 rounded-[8px] py-1.5 pr-2 outline-offset-[-2px] hover:bg-sunken ${hasKids ? "cursor-pointer" : ""}`}
              style={{ paddingLeft: `${item.depth * 22 + 8}px` }}
            >
              <span className="grid size-4 shrink-0 place-items-center text-ink-3">
                {hasKids ? (
                  <ChevronRight
                    className={`transition-transform duration-[180ms] ease-[var(--ease-enter)] ${isOpen ? "rotate-90" : ""}`}
                  />
                ) : (
                  <span className="size-1 rounded-full bg-ink-3" />
                )}
              </span>
              <span className={item.depth === 0 ? "font-medium text-ink" : "text-ink"}>{item.node.label}</span>
              {item.node.note ? <span className="truncate text-small text-ink-3">{item.node.note}</span> : null}
              {hasKids && !isOpen ? (
                <span className="ml-auto rounded-full bg-sunken px-2 text-micro text-ink-2 tabular">{item.node.children!.length}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
