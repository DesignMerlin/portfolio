import type { Screen } from "@/content/details";

/**
 * Revival Stream's screens, from Samuel's Figma file REVIVAL STREAM, section 324:24549: desktop at 2×
 * (1440 wide) and mobile at 3× (375 wide). The film and the case study both read from here.
 * Email addresses are placeholders. The now-playing bar is drawn above the sidebar, which covers its title in the file.
 */
const desktop = (file: string, h: number, alt: string): Screen & { w: number; h: number } => ({ src: `/work/revival/d-${file}.webp`, w: 1440, h, alt });
const mobile = (file: string, h: number, alt: string): Screen & { w: number; h: number } => ({ src: `/work/revival/m-${file}.webp`, w: 375, h, alt });

export const revival = {
  signup0: desktop("signup0", 1024, "Sign up on desktop, empty: username, email and password, or Google, Facebook and Apple."),
  signup: desktop("signup", 1024, "Sign up on desktop, filled in, with Create account ready to press."),
  code0: desktop("code0", 1024, "Check your email on desktop: four empty boxes for the code."),
  code: desktop("code", 1024, "Check your email on desktop: the code 3066, with Verify email ready to press."),
  verified: desktop("verified", 1024, "E-mail verified successfully, with a green tick."),
  login0: desktop("login0", 1024, "Log in on desktop, empty."),
  login: desktop("login", 1024, "Log in on desktop, filled in."),
  loginLoading: desktop("login-loading", 1024, "Log in on desktop, with a spinner on the button."),
  home: desktop("home", 1436, "Home on desktop: where every godly mood finds its perfect stream, trending radio channels and ministers' sermons."),
  homePlaying: desktop("home-playing", 1027, "Home on desktop with Soaking Worship on air in the now-playing bar."),
  channels: desktop("channels", 1407, "Channels on desktop: a grid of live radio channels."),
  channelPlaying: desktop("channel-playing", 1024, "Channels on desktop with Revival Missles FM playing and its volume slider open."),
  player: desktop("player", 1024, "The player on desktop: Soaking Worship FM, live, with a waveform, what's playing and what's up next."),
  about: desktop("about", 1024, "About this channel, over the player: what soaking worship is."),
  share: desktop("share", 1024, "Share a channel, over the player: Facebook, WhatsApp, X, Instagram or copy its URL."),
  chat: desktop("chat", 1024, "Live chat beside the player: listeners' comments and a field to add one."),
  like: desktop("like", 1024, "Mercy Chinwo FM with its heart filled and an alert: Stream added to my favourites."),
  minister: desktop("minister", 1024, "A minister's channel: Past. W. F. Kumuyi FM, live."),
  minstrel: desktop("minstrel", 1024, "A minstrel's channel: Mercy Chinwo FM, live."),
  ministers: desktop("ministers", 1400, "Ministers' sermons on desktop: a grid of ministers."),
  minstrels: desktop("minstrels", 1024, "Minstrels on desktop: a grid of gospel artists."),
  testimonies: desktop("testimonies", 1500, "Testimony channels on desktop."),
  favourites: desktop("favourites", 1024, "My Favourites on desktop, empty: a calendar, and Browse Channels."),
  request: desktop("request", 1024, "Request a channel on desktop: title, reason, media type and who it's by."),
  notifications: desktop("notifications", 1271, "Notifications on desktop, recent and earlier."),
  account: desktop("account", 1417, "Settings on desktop: personal information and a photo."),
  password: desktop("password", 1353, "Settings on desktop: password and connected accounts."),
  disconnect: desktop("disconnect", 1353, "Disconnect an account, confirmed with a password."),
  prefs: desktop("prefs", 1024, "Settings on desktop: which notifications arrive by email or SMS."),

  mSignup0: mobile("signup0", 812, "Sign up on mobile, empty."),
  mSignup: mobile("signup", 812, "Sign up on mobile, filled in."),
  mCode: mobile("code", 812, "Check your email on mobile: the code 3066."),
  mVerified: mobile("verified", 812, "E-mail verified successfully, on mobile."),
  mLogin0: mobile("login0", 812, "Log in on mobile, empty."),
  mLogin: mobile("login", 812, "Log in on mobile, filled in."),
  mHome: mobile("home", 2089, "Home on mobile: channels, ministers, minstrels and testimonies, each in a row to swipe."),
  mHomePlaying: mobile("home-playing", 2097, "Home on mobile with Soaking Worship in a small player at the bottom."),
  mChannels: mobile("channels", 2240, "Channels on mobile: one large card each."),
  mMinisters: mobile("ministers", 1740, "Ministers' sermons on mobile, two to a row."),
  mMinstrels: mobile("minstrels", 1710, "Minstrels on mobile, two to a row."),
  mTestimonies: mobile("testimonies", 2200, "Testimony channels on mobile."),
  mFavourites: mobile("favourites", 1024, "My Favourites on mobile, empty."),
  mRequest: mobile("request", 1655, "Request a channel on mobile."),
  mSettings: mobile("settings", 1089, "Settings on mobile: personal information, password and notifications."),
  mAccount: mobile("account", 1650, "Personal information on mobile."),
  mPassword: mobile("password", 1841, "Password and connected accounts on mobile."),
  mDisconnect: mobile("disconnect", 1841, "Disconnect an account on mobile."),
  mPrefs: mobile("prefs", 1353, "Notification settings on mobile."),
  mNotifications: mobile("notifications", 1710, "Notifications on mobile."),
  mMenu: mobile("menu", 812, "The menu on mobile, signed out."),
  mMenuIn: mobile("menu-in", 812, "The menu on mobile, signed in."),
  mPlayer: mobile("player", 1833, "The player on mobile: Soaking Worship FM, live, with a waveform."),
  mAbout: mobile("about", 1264, "About this channel, on mobile."),
  mShare: mobile("share", 1264, "Share a channel, on mobile."),
  mChat: mobile("chat", 812, "Live chat on mobile, on a sheet under the cover."),
} as const;

export type RevivalScreen = keyof typeof revival;
