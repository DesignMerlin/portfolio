import Link from "next/link";
import { buttonClasses, ButtonContent } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col justify-center px-5 py-24 sm:px-10">
      <p className="font-mono text-meta text-faint">404</p>
      <h1 className="mt-3 max-w-[18ch] text-h2 font-medium text-balance">
        This page isn&rsquo;t on file. It may have moved.
      </h1>
      <p className="mt-4 max-w-[48ch] text-muted">
        Head back to the work, or press <kbd className="font-mono text-meta">Ctrl K</kbd> to jump
        anywhere.
      </p>
      <Link href="/" className={`${buttonClasses({ size: "md" })} mt-8 self-start`}>
        <ButtonContent>Back to the work</ButtonContent>
      </Link>
    </main>
  );
}
