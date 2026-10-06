import type { Metadata, Viewport } from "next";
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import { Footer } from "@/components/site/Footer";
import { headScript } from "@/components/site/head-script";
import { Header } from "@/components/site/Header";
import { Intro } from "@/components/site/Intro";
import { hero, site } from "@/lib/site";
import "./globals.css";

// Both are variable fonts, self-hosted by next/font at build time
// (no request to Google from the visitor's browser).
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${site.name}, product designer & design engineer`,
    template: `%s | ${site.name}`,
  },
  description: hero.statement + " " + hero.lead,
  openGraph: { type: "website", siteName: site.name, locale: "en_GB" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#101928" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme / data-intro are set by the head script before paint.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-raised px-4 py-2 text-sm text-fg shadow-(--shadow-float) focus:translate-y-0"
        >
          Skip to content
        </a>
        <Intro />
        <Header />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
