import type { Metadata } from "next";
import "./globals.css";

// Fonts (Delight, Clash Display) and theme tokens are wired in the
// token step of Phase 1. Until then the page uses the system font.

export const metadata: Metadata = {
  title: {
    default: "Samuel, product designer",
    template: "%s | Samuel",
  },
  description: "Product designer moving into design engineering, with an AI-native focus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
