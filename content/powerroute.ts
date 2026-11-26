/**
 * PowerRoute's screens, exported at 2× (750×1624) from Samuel's Figma file EV CHARGING LOCATOR APP, DESIGN page,
 * section 1714:2682. The onboarding screens were changed in Figma (2026-11-26, at Samuel's request) to use the
 * file's own EV photos instead of illustrations. The film and the project page both read from here.
 */
const screen = (file: string, alt: string, h?: number) => ({ src: `/work/powerroute/${file}.webp`, alt, ...(h ? { w: 375, h } : {}) });

export const powerroute = {
  splash: screen("splash", "Splash screen: the PowerRoute mark, a car with a plug for a tail, on pale green."),
  onboarding1: screen("onboarding-1", "Onboarding: Power Up Your Journey, find charging stations near you, over a solar-canopy charging station."),
  onboarding2: screen("onboarding-2", "Onboarding: Charging Simplified, over a charging plug in a white car."),
  onboarding3: screen("onboarding-3", "Onboarding: Drive Electric, Drive Smart, over a crossover charging at the kerb."),
  home: screen("home", "Home: welcome, recently viewed stations as photo cards, and a list of charging stations nearby."),
  map: screen("map", "Map: charging stations as pins across Lagos, green for free and red for in use."),
  stations: screen("stations", "Stations: each station with a photo, rating, plugs, whether it's available, distance and time."),
  stationMap: screen("station-map", "A station picked on the map: JKK Park Garage, its rating, distance, plug types, and View or Book."),
  station: screen("station", "Station details: photos, directions, opening hours, cost, charger plugs and recent check-ins.", 1325),
  addVehicle: screen("add-vehicle", "Add vehicle: make, model, battery type and capacity, and the charger plug it takes."),
  booking: screen("booking", "Booking: a calendar to choose the date, then arrival time and how long to charge."),
  payment: screen("payment", "Choose a payment option: bank card, PayPal or bank transfer, with the card details and the total."),
  review: screen("review", "Review: the vehicle, the station, the plug, the time and the amount before confirming."),
  booked: screen("booked", "Booking successful: a green tick over the review."),
  charging: screen("charging", "Charging: the car, a battery filling bar by bar, 70% complete, charging time, energy and battery."),
  charged: screen("charged", "Charging 100% complete, with what was charged to the bank account."),
  bookings: screen("bookings", "My bookings: upcoming, completed and cancelled, each with the station, power, duration and amount."),
  account: screen("account", "Account: profile, vehicle, payment method, security, language, region and help."),
  wallet: screen("wallet", "Wallet: balance on a green card and recent transactions, paid and topped up."),
} as const;

export type PowerRouteScreen = keyof typeof powerroute;
