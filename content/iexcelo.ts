import type { Screen } from "@/content/details";

/**
 * iExcelo's screens, from Samuel's Figma file iExcelo Ed-Tech Web App: the website (desktop at 1.5×, mobile at
 * 2×) and the student dashboard. The film and the project page both read from here. Sizes are in points.
 */
type Sized = Screen & { w: number; h: number };
const F = "/work/iexcelo-web";
const desk = (file: string, h: number, alt: string): Sized => ({ src: `${F}/d-${file}.webp`, w: 1440, h, alt });
const phone = (file: string, h: number, alt: string): Sized => ({ src: `${F}/m-${file}.webp`, w: 375, h, alt });

export const iexcelo = {
  home: desk("home", 5985, "The iExcelo homepage, top to bottom: revise smarter, practise harder and excel in every exam, then benefits, the exams covered, three ways in, testimonials, FAQs and a call to join."),
  hero: { src: `${F}/s-hero.webp`, w: 1440, h: 1124, alt: "The homepage hero: Revise Smarter, Practice Harder and Excel in every Exam!, three students, and the student dashboard rising underneath." },
  features: { src: `${F}/s-features.webp`, w: 1440, h: 1024, alt: "Where success meets innovation: Master Every Question, Support Students and Earn as You Share, each with its own illustration." } as Sized,
  about: desk("about", 4533, "About iExcelo: the journey since 2022, 15K+ active users, the exam revision and giveback platforms, the team, the mission and values."),
  revision: desk("revision", 3688, "Exam Revision: your smart companion for exam success, everything you need in one place, and your pathway to excellence."),
  giveback: desk("giveback", 3261, "Giveback: learn, excel and make a difference. Why join, transparent reports, and turning support into success."),
  affiliate: desk("affiliate", 2367, "Affiliate program: earn while empowering education, with up to 15% commission on every student referred."),
  faq: desk("faq", 2700, "Frequently asked questions, grouped by general, exam revision, giveback and affiliate."),
  contact: desk("contact", 1860, "Get in touch: email, office address and phone."),
  dash: desk("dash", 1024, "The student dashboard: welcome back, ready to test your knowledge, exams, subjects and questions solved, scores by subject and the exams available."),
  exam: desk("exam", 1024, "Choosing an exam: revision, timed or mock mode, then topics to practise."),
  question: desk("question", 1016, "A question in revision mode, with the answer picked and the test navigator beside it."),
  submitted: desk("submitted", 1024, "Answers submitted: a summary of the attempt and a score of 33.3%."),
  mHome: phone("home", 8146, "The homepage on a phone."),
  mAbout: phone("about", 7761, "About iExcelo on a phone."),
  mRevision: phone("revision", 6871, "Exam Revision on a phone."),
  mGiveback: phone("giveback", 5972, "Giveback on a phone."),
  mAffiliate: phone("affiliate", 3607, "The affiliate program on a phone."),
  mFaq: phone("faq", 3830, "FAQs on a phone."),
  mContact: phone("contact", 2532, "Contact on a phone."),
} as const;

export type IxScreen = keyof typeof iexcelo;
