import { CopyEmail } from "@/components/ui/copy-email";
import { LocalTime } from "@/components/ui/local-time";
import { FooterShortcut } from "@/components/site/footer-shortcut";
import type { Profile } from "@/lib/content";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-3">
          <p className="max-w-[34ch] text-lead leading-snug text-ink">
            Designed and built by Samuel in Lagos, with Claude Code as a pair.
          </p>
          <LocalTime withRelative />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CopyEmail email={profile.email} />
          {profile.linkedin ? (
            <a
              href={profile.linkedin}
              className="rounded-full px-3 py-2 text-small text-ink-2 transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
          ) : null}
          <FooterShortcut />
        </div>
      </div>
    </footer>
  );
}
