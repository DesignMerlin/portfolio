import Link from "next/link";
import { getWorkSummaries } from "@/lib/content";
import { site } from "@/lib/site";
import { CommandMenu } from "./CommandMenu";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const work = await getWorkSummaries();

  return (
    <header className="mx-auto flex h-16 w-full max-w-[76rem] items-center justify-between gap-4 px-5 sm:h-20 sm:px-10">
      <Link
        href="/"
        transitionTypes={["nav-back"]}
        className="-ml-1 rounded-sm px-1 text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg"
      >
        <span className="sm:hidden">{site.shortName}</span>
        <span className="hidden sm:inline">{site.name}</span>
      </Link>

      <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
        <NavLinks />
        <span className="mx-1 h-5 w-px bg-line sm:mx-2" aria-hidden="true" />
        <CommandMenu work={work.map(({ title, slug, domain }) => ({ title, slug, domain }))} />
        <ThemeToggle />
      </nav>
    </header>
  );
}
