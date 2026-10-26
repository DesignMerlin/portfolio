"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { ArrowUpRight, CheckIcon } from "@/components/ui/icons";
import { spring, tween } from "@/lib/motion";

type Path = "hiring" | "project";

const paths: { id: Path; label: string }[] = [
  { id: "hiring", label: "I'm hiring" },
  { id: "project", label: "I have a project" },
];

const fields: Record<Path, { name: string; label: string; placeholder: string; type?: string }[]> = {
  hiring: [
    { name: "role", label: "Role", placeholder: "Senior product designer" },
    { name: "company", label: "Company", placeholder: "Where you're hiring for" },
    { name: "location", label: "Remote or location", placeholder: "Remote, Berlin, Lagos…" },
    { name: "link", label: "Link to the job post", placeholder: "https://", type: "url" },
  ],
  project: [
    { name: "what", label: "What you're building", placeholder: "A short line is plenty" },
    { name: "timeline", label: "Timeline", placeholder: "When you'd like to start" },
  ],
};

const budgets = ["Under $5k", "$5k–15k", "$15k+", "Not sure yet"];

/**
 * Contact that branches on who's writing. The form changes shape with the
 * path (crossfade + height via layout animation), then composes an email in
 * the visitor's own app. No backend, nothing stored.
 */
export function ContactComposer({ email }: { email: string }) {
  const [path, setPath] = useState<Path>("hiring");
  const [budget, setBudget] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines = fields[path]
      .map((f) => [f.label, String(data.get(f.name) ?? "").trim()] as const)
      .filter(([, v]) => v);
    if (path === "project" && budget) lines.push(["Budget", budget]);
    const note = String(data.get("note") ?? "").trim();
    const subject = path === "hiring" ? `Role: ${data.get("role") || "Product designer"}` : "Project enquiry";
    const body = [...lines.map(([k, v]) => `${k}: ${v}`), "", note].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, filter: "blur(4px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(4px)", transition: tween("quick", "exit") },
      };

  return (
    <motion.form
      layout={!reduce}
      transition={spring.gentle}
      onSubmit={submit}
      className="rounded-[var(--radius-l)] border border-line bg-surface p-5 shadow-[var(--shadow-raised)] sm:p-7"
    >
      <motion.div layout="position" role="radiogroup" aria-label="Who's writing" className="inline-flex rounded-full bg-sunken p-1">
        {paths.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={path === p.id}
            onClick={() => {
              setPath(p.id);
              setSent(false);
            }}
            className={`relative rounded-full px-4 py-2 text-small transition-colors duration-150 ${path === p.id ? "text-ink" : "text-ink-2 hover:text-ink"}`}
          >
            {path === p.id ? (
              <motion.span
                layoutId={`${id}-pill`}
                transition={reduce ? { duration: 0 } : spring.snappy}
                className="absolute inset-0 rounded-full bg-surface shadow-[var(--shadow-raised)]"
              />
            ) : null}
            <span className="relative">{p.label}</span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={path} {...swap} transition={tween("base")} className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields[path].map((f) => (
            <label key={f.name} className="grid gap-1.5 text-small">
              <span className="text-ink-2">{f.label}</span>
              <input
                name={f.name}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                className="h-11 rounded-[10px] border border-line bg-paper px-3 text-ink transition-[border-color] duration-150 outline-none placeholder:text-ink-3 hover:border-line-strong focus:border-accent"
              />
            </label>
          ))}
          {path === "project" ? (
            <fieldset className="grid gap-2 sm:col-span-2">
              <legend className="mb-1.5 text-small text-ink-2">Budget range</legend>
              <div className="flex flex-wrap gap-2">
                {budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={budget === b}
                    onClick={() => setBudget(budget === b ? null : b)}
                    className={`pressable rounded-full border px-3.5 py-1.5 text-small transition-colors duration-150 ${
                      budget === b ? "border-accent bg-accent-soft text-ink" : "border-line text-ink-2 hover:border-line-strong"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          <label className="grid gap-1.5 text-small sm:col-span-2">
            <span className="text-ink-2">Anything else</span>
            <textarea
              name="note"
              rows={3}
              placeholder="Optional"
              className="resize-none rounded-[10px] border border-line bg-paper px-3 py-2.5 text-ink outline-none transition-[border-color] duration-150 placeholder:text-ink-3 hover:border-line-strong focus:border-accent"
            />
          </label>
        </motion.div>
      </AnimatePresence>

      <motion.div layout="position" className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
        <button
          type="submit"
          className="pressable inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-small font-medium text-paper"
        >
          Write the email
          <ArrowUpRight />
        </button>
        <AnimatePresence>
          {sent ? (
            <motion.p
              role="status"
              {...swap}
              transition={tween("base")}
              className="flex items-center gap-2 text-small text-ink-2"
            >
              <CheckIcon className="text-signal" />
              Your email app should open with this filled in.
            </motion.p>
          ) : (
            <motion.p {...swap} transition={tween("base")} className="text-small text-ink-3">
              Opens a draft in your own email app. Nothing is stored here.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.form>
  );
}
