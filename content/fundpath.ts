/**
 * FundPath's screens, exported at 3× (1125×2436) from Samuel's Figma file Uplift-Us, page "New design",
 * section "New Design" (3707:6455). The film, the case study and the prototype all read from here.
 * The email address on the sign-in screens, and the phone number on Contact us, are placeholders here.
 */
const screen = (file: string, alt: string) => ({ src: `/work/fundpath/${file}.webp`, alt });

export const fundpath = {
  heart: screen("heart", "Splash screen: the FundPath mark, two people forming a heart, on purple."),
  splash: screen("splash", "Splash screen: the FundPath logo on purple."),
  welcome1: screen("welcome-1", "Onboarding: Every big impact starts small. A donation box, with Log in and Sign up."),
  welcome2: screen("welcome-2", "Onboarding: Nurtured with care and hope. Volunteers carrying boxes."),
  welcome3: screen("welcome-3", "Onboarding: With FundPath, let's sow the seeds of change together. Hands holding coins."),
  home: screen("home", "Home: donation wallet with $250,000, causes such as Medical, Disasters and Education, and trending campaigns."),
  campaigns: screen("campaigns", "Campaigns: search, filter by cause, and a list showing donors, the amount raised and days left."),
  filter: screen("filter", "Filter: category, completion status, fundraising progress, donation amount and currency."),
  campaign: screen("campaign", "Campaign: Jane's kidney transplant bills, $1,500,000 raised, a transparency report link, the organiser, and Donate now."),
  amount: screen("amount", "Donation amount sheet: suggested amounts from $10 to $100, donate anonymously, and a refund guarantee."),
  share: screen("share", "Share sheet: copy link, Facebook, WhatsApp, X, Instagram and LinkedIn."),
  payMethod: screen("pay-method", "Payment method: card, bank transfer, USSD, PayPal or Stripe."),
  card: screen("card", "Card payment with the donation amount, transaction fee and total."),
  processing: screen("processing", "Processing donation: you'll be notified as soon as it's done."),
  success: screen("success", "Donation successful: thank you for your donation. Leave a comment, or go home."),
  start: screen("start", "Start a campaign: title, category, who it's for, the story, and photos or videos."),
  preview: screen("preview", "Preview of a school building campaign before publishing."),
  review: screen("review", "Review in progress: the campaign is being reviewed before it goes live."),
  live: screen("live", "Congratulations: your fundraising campaign is live."),
  donations: screen("donations", "Donations: total donated, campaigns supported, and a history by status."),
  receipt: screen("receipt", "Donation details: campaign, status, payment method and amount, with Download receipt and Donate again."),
  myCampaigns: screen("my-campaigns", "My campaigns: each with the amount raised, its status, and Update campaign."),
  fundUpdate: screen("fund-update", "Fund update for a campaign: donations in and payments out, such as the first disbursement for a blood test."),
  chat: screen("chat", "Chat between a donor and a campaign organiser."),
  chats: screen("chats", "Chats inbox."),
  report: screen("report", "Transparency report: donors by month, goal and amount raised, and recent transactions in and out."),
  profile: screen("profile", "Organiser profile: a verified foundation with its mission, goal, results and testimonials."),
  signIn: screen("sign-in", "Sign in with email and password, or Google."),
  signUp: screen("sign-up", "Sign up with name, email and password."),
  checkEmail: screen("check-email", "Check your email: a four-digit code."),
  emailVerified: screen("email-verified", "Email verified."),
  contact: screen("contact", "Contact us: social accounts, customer service and live chat."),
  faqs: screen("faqs", "FAQs: nine common questions."),
} as const;

export type FundpathScreen = keyof typeof fundpath;
