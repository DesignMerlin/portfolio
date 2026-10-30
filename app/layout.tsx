import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { Intro } from "@/components/site/intro";
import { CommandMenu } from "@/components/site/command-menu";
import { getAllWork, getProfile } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Headings and display type
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  // Static weights, not the variable file: WebKit renders the variable font's small sizes too heavy
  weight: ["400", "500", "600", "700"],
});

// Body text
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  weight: ["400", "500", "600"],
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
*/
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}d.dataset.intro='play'})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, work] = await Promise.all([getProfile(), getAllWork()]);

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-svh antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-small text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300]"
        >
          Skip to content
        </a>
        <Intro name={profile.name} />
        {children}
        <CommandMenu
          email={profile.email}
          work={work.map((w) => ({ slug: w.meta.slug, title: w.meta.title, summary: w.meta.summary }))}
        />
      </body>
    </html>
  );
}
