import type { Mockup } from "@/components/ui/device-mockup";

/**
 * Motion-ad thumbnails for the case studies on the home page, by slug. These take the place of the
 * cover image on the sticker. Phone screens are captures of the coded prototypes in each case study.
 */
export const workMockups: Record<string, Mockup> = {
  room8: {
    phones: ["/work/room8-list.webp", "/work/room8-detail.webp", "/work/room8-nearby.webp"],
    wash: ["#b9e6c8", "#e6f6ea"],
  },
  fundpath: {
    phones: ["/work/fundpath-campaign.webp", "/work/fundpath-ledger.webp", "/work/fundpath-donate.webp"],
    wash: ["#d6c8ff", "#f3ecff"],
  },
};
