import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center px-4">
      <div className="max-w-[40ch] text-center">
        <p className="font-mono text-micro text-ink-3">404</p>
        <h1 className="mt-3 text-h2 font-semibold">This page doesn&apos;t exist, or it moved.</h1>
        <p className="mt-3 text-ink-2">The work is all still here.</p>
        <Link href="/" className="pressable mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-small font-medium text-paper">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
