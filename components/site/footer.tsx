import { SayHello } from "@/components/site/say-hello";
import { LocalTime } from "@/components/ui/local-time";
import { FooterShortcut } from "@/components/site/footer-shortcut";
import type { Profile } from "@/lib/content";

const REPEAT = 6;
const NAME = "text-center font-display text-[10.6vw] tracking-[max(-2px,-0.03em)] leading-[0.86] font-semibold whitespace-nowrap";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer id="contact" className="mt-32 scroll-mt-24 overflow-hidden border-t border-line">
      <SayHello email={profile.email} x={profile.x} instagram={profile.instagram} behance={profile.behance} linkedin={profile.linkedin} />

      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
        <LocalTime withRelative />
        <FooterShortcut />
      </div>

      {/* The name, set huge as a hairline outline, sized to span the page. On hover a solid fill
          sweeps in from the left (a clipped copy on top), and sweeps back out when you leave.
          Decorative: the name is already in the header and hero. */}
      <div aria-hidden="true" className="group/name relative mt-12 px-[1vw] select-none">
        <p className={`footer-name ${NAME}`}>{profile.name}</p>
        <p className={`footer-name-fill absolute inset-0 px-[1vw] ${NAME}`}>{profile.name}</p>
      </div>

      {/* Endless call to action. One link for assistive tech; the repeated copies are hidden from it. */}
      <a href={`mailto:${profile.email}`} className="group/marquee relative mt-2 block overflow-hidden py-4 outline-offset-[-4px] sm:py-6">
        <span className="sr-only">Let&apos;s work together. Email me</span>
        <span aria-hidden="true" className="marquee-track flex w-max">
          {[0, 1].map((half) => (
            <span key={half} className="flex shrink-0">
              {Array.from({ length: REPEAT }, (_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-[0.5em] pr-[0.5em] font-display text-[clamp(2rem,4.6vw,4.25rem)] leading-none font-medium tracking-[max(-2px,-0.03em)] whitespace-nowrap text-ink-2 transition-colors duration-[280ms] group-hover/marquee:text-ink"
                >
                  <span className="text-[0.8em] text-accent">✱</span>
                  Let&apos;s work together
                </span>
              ))}
            </span>
          ))}
        </span>
      </a>
    </footer>
  );
}
