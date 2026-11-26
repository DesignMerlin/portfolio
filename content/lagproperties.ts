/**
 * LAGProperties' screens, exported at 2× (750 wide) from Samuel's Figma file AHRP, Design page (tenant flow
 * and landlord/agent flow). Long screens have a `-top` copy (the first 812 points) for the film's phone.
 * The film and the project page both read from here. Names and details on the screens are the design's own
 * sample data.
 */
const F = "/work/lagproperties";
const screen = (file: string, alt: string, h?: number) => ({ src: `${F}/${file}.webp`, alt, ...(h ? { w: 375, h } : {}) });

export const lagproperties = {
  splash: screen("splash", "Splash screen: the LAGProperty mark on orange."),
  onboarding1: screen("onboarding-1", "Onboarding: Find your perfect home in Lagos, over a block of flats at dusk."),
  onboarding2: screen("onboarding-2", "Onboarding: Simplified property renting, over a red-brick house."),
  signUp: screen("sign-up", "Sign up: name, email, password, or Google, Facebook or Apple."),
  home: screen("home", "Two ways in: rent an apartment, or list your apartment."),
  explore: screen("explore", "Explore: search by city or address, and listings with photos, area and yearly rent."),
  property: screen("property", "A property: photos, availability, rent, the agent, and description, amenities and utility bills.", 1603),
  gallery: screen("gallery", "The property's gallery tab: fifteen photos of the rooms.", 1214),
  reviews: screen("reviews", "The property's reviews: ratings and what past tenants said.", 1062),
  schedule: screen("schedule", "Schedule an inspection: in person or by video chat, a date and time, and your details."),
  time: screen("time", "Picking the time for the inspection on a wheel."),
  paid: screen("paid", "Payment successful, with the receipt to download and the escrow dashboard to check."),
  bookings: screen("bookings", "Summary: the apartment, the rent period and a breakdown of rent, agreement and commission."),
  chat: screen("chat", "Chat with the agent about a listing: interested, it's available, schedule an inspection."),
  agreement: screen("agreement", "The rental agreement: parties, the property, dates, rent details and the house rules.", 957),
  signing: screen("signing", "Signing the contract in a box on the agreement.", 957),
  landlordDashboard: screen("l-dashboard", "Landlord dashboard: escrow balance, rent received and overdue, tenants with invoices due and upcoming inspections.", 1656),
  landlordListing: screen("l-listing", "Listing an apartment, step 2 of 3: the type of place, the city, address and location.", 1470),
  landlordProperties: screen("l-properties", "My properties: every listing, vacant or occupied."),
  landlordInspection: screen("l-inspection", "An inspection request: who, when, which apartment, the payment plan and the price, to accept or decline.", 1017),
  landlordAccepted: screen("l-accept", "Appointment confirmed, with a message or call to the tenant.", 1017),
  landlordTenant: screen("l-tenant", "A tenant's details: who they are, what they rent and reviews from previous landlords.", 1137),
} as const;

export type LagScreen = keyof typeof lagproperties;
/** The first 812 points of a long screen, for the film's phone */
export const lagTop = (s: LagScreen) => {
  const x = lagproperties[s];
  return "h" in x ? x.src.replace(".webp", "-top.webp") : x.src;
};
