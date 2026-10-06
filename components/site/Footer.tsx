import { contact, site } from "@/lib/site";
import { CopyEmail } from "./CopyEmail";
import { LocalTime } from "./LocalTime";

export function Footer() {
  return (
    <footer id="contact" className="mt-auto border-t border-line">
      <div className="mx-auto grid w-full max-w-[76rem] gap-10 px-5 pt-16 pb-10 sm:px-10 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-7">
          <h2 className="max-w-[24ch] text-h2 font-medium text-balance">{contact.headline}</h2>
          <p className="mt-4 max-w-[52ch] text-muted">
            {site.availability}. {site.availabilityDetail}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end lg:justify-end">
          <CopyEmail size="lg" />
          <a href={`mailto:${site.email}`} className="text-sm text-muted underline hover:text-fg">
            Or open your mail app
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-6 font-mono text-meta text-faint lg:col-span-12">
          <p>
            {site.city}, <LocalTime />
          </p>
          <p>Designed and built by {site.shortName}, with Claude Code.</p>
        </div>
      </div>
    </footer>
  );
}
