import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Intro } from "@/components/site/intro";
import { CommandMenu } from "@/components/site/command-menu";
import { MotionPrefs } from "@/components/site/motion-toggle";
import { getProfile } from "@/lib/content";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Everything: headings, body, buttons
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  // Static weights, not the variable file: WebKit renders the variable font's small sizes too heavy
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Samuel Ekwenze, product designer and design engineer",
    template: "%s | Samuel Ekwenze",
  },
  description:
    "Lagos-based product designer moving into design engineering. AI products, immigration, legal, edtech and health tech, designed with care and shipped in code.",
  openGraph: { type: "website", siteName: "Samuel Ekwenze", locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0f1115",
};

/*
  Runs before first paint:
  1. Theme: the visitor's saved choice, else dark (the site's home look). No flash of the wrong theme.
  2. Intro: plays on every full page load (client-side navigation never remounts it).
  3. Motion: data-motion="reduce" from the site's motion toggle if used, else the OS setting.
*/
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}d.dataset.intro='play';var m=null;try{m=localStorage.getItem('motion')}catch(e){}if(m==='reduce'||(m!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){d.dataset.motion='reduce'}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);

  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.intro{display:none!important}@media (prefers-reduced-motion: reduce){*,::before,::after{animation:none!important;transition:none!important}}`}</style>
        </noscript>
      </head>
      <body className="min-h-svh antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-small text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300]"
        >
          Skip to content
        </a>
        <MotionPrefs>
          <Intro name={profile.name} />
          {children}
          <CommandMenu
            email={profile.email}
            work={projects.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary }))}
          />
        </MotionPrefs>
      </body>
    </html>
  );
}
