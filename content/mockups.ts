import type { Mockup } from "@/components/ui/device-mockup";

/**
 * Motion-ad thumbnails for the case studies on the home page, by slug. These take the place of the
 * cover image on the sticker. Films are told with the app's own screens, from Figma.
 */
export const workMockups: Record<string, Mockup> = {
  room8: {
    film: "room8",
    wash: ["#b9e6c8", "#e6f6ea"],
  },
  fundpath: {
    film: "fundpath",
    wash: ["#2a1a55", "#0c0719"],
  },
  "immigify-case-tracker": {
    film: "caseTracker",
    wash: ["#b61f2a", "#640c16"],
  },
  yoyo: {
    film: "yoyo",
    wash: ["#dcebff", "#dcebff"],
  },
};
