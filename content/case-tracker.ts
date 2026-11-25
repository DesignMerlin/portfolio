/**
 * Immigify Case Tracker+ screens, exported at 3× (1125×2436) from Samuel's Figma file Immigify-App, page
 * "Mobile", section 2002:10800. The film, the case study and the prototype all read from here.
 * `home` carries the app's own tab bar at the bottom of the first screen; `book` brings the times and the
 * button up under the calendar (the design is 1007 tall). The attorney's profile is left out: it shows a
 * contact email address.
 */
const screen = (file: string, alt: string) => ({ src: `/work/case-tracker/${file}.webp`, alt });

export const caseTracker = {
  splash: screen("splash", "Splash screen: the Immigify logo on crimson."),
  welcome1: screen("welcome-1", "Onboarding: Track your USCIS cases with confidence."),
  welcome2: screen("welcome-2", "Onboarding: Get clarity with AI-powered insights."),
  welcome3: screen("welcome-3", "Onboarding: Connect with a community that understands."),
  status: screen("status", "What brings you here? Newcomer, resident or established, with Newcomer selected."),
  interests: screen("interests", "Choose your interests: up to four, with Sports and Socializing selected."),
  addCase: screen("add-case", "Add your USCIS case: paste a receipt number to start tracking."),
  fetching: screen("fetching", "Fetching your case: connecting to USCIS, validating the receipt number and fetching the official status."),
  home: screen("home", "Home: the case with its progress and status, Immigify AI, and upcoming events."),
  cases: screen("cases", "My cases: an adjustment of status at biometrics, and an approved work authorization."),
  community: screen("community", "Community feed for employment green cards, with posts and replies."),
  createPost: screen("create-post", "Create post: category, who can reply, images, hashtags and a visa timeline."),
  writePost: screen("write-post", "Writing a post, with the keyboard open and hashtags added."),
  timeline: screen("timeline", "Visa timeline settings: total days, the case, and its first update."),
  timelinePost: screen("timeline-post", "A post sharing a visa timeline: 45% through an I-485."),
  groups: screen("groups", "Groups by topic, such as H-1B, with the number of members."),
  group: screen("group", "A group: Immigify, Beyond Borders Community, before joining."),
  consultants: screen("consultants", "Verified consultants by specialty: green card, employment, asylum and student."),
  book: screen("book", "Book an appointment: pick a date and a time."),
  pay: screen("pay", "Confirm payment: notes for the consultant and card details."),
  confirmed: screen("confirmed", "Appointment confirmed, with a reminder added."),
} as const;

export type CaseTrackerScreen = keyof typeof caseTracker;
