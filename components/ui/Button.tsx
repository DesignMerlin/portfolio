import type { ComponentProps, ReactNode } from "react";

// 3D button from Samuel's Figma (Rayna UI V2.0, node 7036:3142, type=3D),
// re-coloured to brand blue with contrast fixes:
//   - filled base is blue 500 (white text 5.2:1 under the sheen; Figma's 400 was 4.05:1)
//   - hover goes darker (blue 600), not lighter (Figma's blue 100 hover was 1.4:1)
//   - grey uses cool gray 600 (Figma's #757575 failed under the sheen)
// Press feedback is CSS (transform only), so it is interruptible and costs no JS.

type Size = "xs" | "sm" | "md" | "lg";
type Hierarchy = "filled" | "outline" | "link";
type Expression = "accent" | "grey";

export type ButtonStyleProps = {
  size?: Size;
  hierarchy?: Hierarchy;
  expression?: Expression;
};

const base =
  "group/button relative isolate inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap select-none " +
  "transition-[transform,background-color,box-shadow,color] duration-(--dur-quick) ease-standard " +
  "motion-safe:active:scale-[0.97] motion-safe:active:duration-(--dur-instant) " +
  "disabled:pointer-events-none aria-disabled:pointer-events-none " +
  "focus-visible:outline-offset-2";

const sizes: Record<Size, string> = {
  xs: "h-9 p-2 text-sm [--label-pad:0.25rem] [--icon:1.25rem]",
  sm: "h-10 px-3 py-2.5 text-sm [--label-pad:0.5rem] [--icon:1.25rem]",
  md: "h-12 p-3 text-base leading-[1.48] [--label-pad:0.5rem] [--icon:1.5rem]",
  lg: "h-14 p-4 text-base leading-[1.48] [--label-pad:0.5rem] [--icon:1.5rem]",
};

// The "3D" look: a top-lit sheen over the fill, a light inner rim, and a 1px outer ring.
const sheen = "bg-[linear-gradient(180deg,rgb(255_255_255/0.2)_0%,rgb(255_255_255/0)_100%)]";

const variants: Record<Hierarchy, Record<Expression, string>> = {
  filled: {
    accent:
      `${sheen} bg-(color:--blue-500) text-white border border-[rgb(198_221_247/0.45)] shadow-[0_0_0_1px_var(--blue-600)] ` +
      "hover:bg-(color:--blue-600) active:bg-(color:--blue-700) active:shadow-[0_0_0_1px_var(--blue-700)] " +
      "disabled:bg-(color:--disabled-bg) disabled:text-(color:--disabled-fg) disabled:shadow-[0_0_0_1px_var(--line-strong)] disabled:border-transparent disabled:bg-none",
    grey:
      `${sheen} bg-(color:--neutral) text-white border border-white/20 shadow-[0_0_0_1px_var(--neutral-pressed)] ` +
      "hover:bg-(color:--neutral-hover) active:bg-(color:--neutral-pressed) " +
      "disabled:bg-(color:--disabled-bg) disabled:text-(color:--disabled-fg) disabled:border-transparent disabled:bg-none",
  },
  outline: {
    accent:
      "bg-raised text-ink border border-white/60 dark:border-white/5 shadow-[0_0_0_1px_var(--ink)] " +
      "hover:bg-ink-soft active:bg-ink-soft active:shadow-[0_0_0_1px_var(--ink-pressed)] " +
      "disabled:bg-(color:--disabled-bg) disabled:text-(color:--disabled-fg) disabled:shadow-[0_0_0_1px_var(--line-strong)]",
    grey:
      "bg-raised text-fg border border-white/60 dark:border-white/5 shadow-[0_0_0_1px_var(--line-strong)] " +
      "hover:bg-paper active:bg-(color:--line) " +
      "disabled:bg-(color:--disabled-bg) disabled:text-(color:--disabled-fg)",
  },
  link: {
    accent:
      "h-auto! p-0! text-ink underline decoration-transparent hover:decoration-current active:text-ink-pressed disabled:text-(color:--disabled-fg)",
    grey: "h-auto! p-0! text-fg underline decoration-transparent hover:decoration-current disabled:text-(color:--disabled-fg)",
  },
};

export function buttonClasses({
  size = "md",
  hierarchy = "filled",
  expression = "accent",
}: ButtonStyleProps = {}): string {
  return `${base} ${sizes[size]} ${variants[hierarchy][expression]}`;
}

type ContentProps = {
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
};

/** Inner layout shared by <Button> and link-styled buttons. */
export function ButtonContent({ children, leadingIcon, trailingIcon, loading }: ContentProps) {
  return (
    <>
      {leadingIcon && <Icon hidden={loading}>{leadingIcon}</Icon>}
      <span
        className={`px-(--label-pad) transition-opacity duration-(--dur-quick) ${loading ? "opacity-0" : ""}`}
      >
        {children}
      </span>
      {trailingIcon && <Icon hidden={loading}>{trailingIcon}</Icon>}
      {loading && (
        // Width never changes while loading: the label stays in layout, invisible.
        <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none motion-reduce:border-r-current motion-reduce:opacity-60" />
        </span>
      )}
    </>
  );
}

function Icon({ children, hidden }: { children: ReactNode; hidden?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-(--icon) place-items-center [&>svg]:size-full ${hidden ? "opacity-0" : ""}`}
    >
      {children}
    </span>
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleProps & Omit<ContentProps, "children">;

export function Button({
  size,
  hierarchy,
  expression,
  leadingIcon,
  trailingIcon,
  loading = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      className={`${buttonClasses({ size, hierarchy, expression })} ${className}`}
      {...props}
    >
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
}
