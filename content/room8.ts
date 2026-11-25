/**
 * Room8's screens, exported at 3× (1125×2436) from Samuel's Figma file ROOM8, page
 * "Built screens (code)" (2508:2). The film, the case study and the prototype all read from here.
 * To update one, export its 375×812 "Screen" frame over the same filename.
 */
const screen = (file: string, alt: string) => ({ src: `/work/room8/${file}.webp`, alt });

export const room8 = {
  splash: screen("splash", "Splash screen: the white Room8 house logo on green."),
  onboarding1: screen("welcome-1", "Onboarding: Find your perfect roommate. Start your journey to finding the perfect room."),
  onboarding2: screen("welcome-2", "Onboarding: Discover your perfect match, a roommate that matches your personality."),
  onboarding3: screen("welcome-3", "Onboarding: Move in with confidence. Verified roommates, secure payments and honest reviews."),
  getStarted: screen("get-started", "How do you want to use Room8? Find a roommate, or rent a room or apartment."),
  questions: screen("questions", "Matching question 1 of 7: Where do you want to live? Areas of Lagos as chips, with Yaba selected."),
  preferences: screen("preferences", "Roommate preferences: gender, age range, marital status, interests, budget and property ratings."),
  home: screen("home", "Home: search by location, a featured stay, browse by type, and this week's picks marked as a great match."),
  explore: screen("explore", "Explore roommates: a list of people with a short description, job, age, area, monthly budget and availability."),
  exploreMap: screen("explore-map", "Explore on a map of Lagos, with a card for Steph Campbell in Agege."),
  filters: screen("filters", "Filter sheet: budget, property type, bedrooms, bathrooms, gender, marital status and amenities."),
  saved: screen("saved", "Favourites with no saved rooms yet, and buttons to browse rooms or open the map."),
  room: screen("room", "Room details: a private room in Ibeju-Lekki at ₦250,000 a month, with a 3D tour button."),
  roomRoommates: screen("room-roommates", "Room details, roommates: who lives there now, the open spot, the host, house rules and the location."),
  bookVisit: screen("book-visit", "Book a tour in person: pick a day and a time."),
  bookVideo: screen("book-video", "Book a live video tour: the host is online now and walks you through every room."),
  roommate: screen("roommate", "Roommate profile: Alex Hunter, rent, availability, 95% compatibility, biography and lifestyle."),
  chats: screen("chats", "Chats inbox with hosts and roommates."),
  conversation: screen("conversation", "Conversation with a roommate, with payments confirmed inside the chat."),
  chatMenu: screen("chat-menu", "Conversation with its menu open: video call, view contact, mute notifications, search and make payments."),
  payMethod: screen("pay-method", "Choose how to pay: card, bank or PayPal."),
  payCard: screen("pay-card", "Card details with the full cost: rent, agreement and commission. Payments are held in escrow until move-in."),
  payDone: screen("pay-done", "Payment successful: ₦130,000 paid for rent."),
  vrLoader: screen("tour-loader", "3D tour loading: Get ready to step inside."),
  vrWalk: screen("tour-walk", "3D tour, walk mode: standing in the living room, with a floor plan and a joystick."),
  vrDollhouse: screen("tour-dollhouse", "3D tour, dollhouse mode: the whole apartment from above."),
  vrCinematic: screen("tour-cinematic", "3D tour, cinematic mode: a guided walk with captions."),
  vrRoom: screen("vr-room", "The living room in the 3D tour."),
  callRinging: screen("call-ringing", "Live video tour: calling the host, Marcus Brown."),
  callLive: screen("call-live", "Live video tour: the host walks through the living room with live captions."),
  callEnded: screen("call-ended", "Call ended: rate the tour, make a payment, message or call again."),
} as const;

export type Room8Screen = keyof typeof room8;
