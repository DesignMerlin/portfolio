import type { Metadata } from "next";
import { WallAdmin } from "@/components/about/wall-admin";

export const metadata: Metadata = {
  title: "Wall",
  robots: { index: false, follow: false },
};

/** Samuel's page for the shared doodle wall: every doodle, and a way to take any of them down */
export default function WallAdminPage() {
  return (
    <main id="main" className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8">
      <h1 className="font-display text-h2 font-semibold">The doodle wall</h1>
      <p className="mt-2 max-w-[60ch] text-ink-2">Every doodle on the About page, newest first. Delete takes it off the wall for everyone.</p>
      <WallAdmin />
    </main>
  );
}
