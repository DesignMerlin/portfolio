import type { Screen } from "@/content/details";

/**
 * Fysi's screens, from Samuel's Figma file Fysi (Hi-fi Wireframe page): the customer website and checkout,
 * the customer's account, vendor onboarding and dashboard, and the super admin. Desktop at 1440 points
 * wide, mobile at 375. The film and the project page both read from here. Names, prices and details on the
 * screens are the design's sample data.
 */
type Sized = Screen & { w: number; h: number };
const F = "/work/fysi";
const desk = (file: string, h: number, alt: string): Sized => ({ src: `${F}/${file}.webp`, w: 1440, h, alt });
const phone = (file: string, h: number, alt: string): Sized => ({ src: `${F}/${file}.webp`, w: 375, h, alt });

export const fysi = {
  home: desk("home", 5100, "The Fysi homepage: eco-products made for you, flash sales, shop by category, best sellers and new arrivals, all certified eco-friendly."),
  clothing: desk("clothing", 3696, "The clothing category: filters for delivery, brand and price on the left, and eco-friendly clothes with ratings and prices."),
  cart: desk("cart", 1610, "The cart: an item, its quantity and price, the order summary, and what you viewed recently."),
  checkout: desk("checkout", 1040, "Checkout: delivery information, pick-up or door delivery, payment method and the order summary."),
  pickup: desk("pickup", 1040, "Choosing a pick-up store by region and city, over the checkout."),
  signup: desk("signup", 1024, "Sign up to Fysi: go green with us, beside a shopper with a woven bag."),
  account: desk("account", 1619, "My account: profile and address, and recently viewed products."),
  orders: desk("orders", 1914, "Orders: every order with its status, delivered, cancelled or returned."),
  wallet: desk("wallet", 1808, "Wallet: balance, funding and transaction history."),
  vendorStart: desk("v-onboard-1", 1024, "Vendor onboarding: set up your shop, starting with your country."),
  vendorVerify: desk("v-onboard-2", 1024, "Vendor onboarding: verify your email with a code."),
  vendorDone: desk("v-onboard-3", 1024, "Vendor onboarding done: congratulations, your shop is ready, go to the dashboard."),
  vendorOverview: desk("v-overview", 1024, "The vendor dashboard: revenue, new clients, visits and orders, sales progress and summary, best sellers and website health."),
  vendorProducts: desk("v-products", 1282, "The vendor's products: each listing with its price, quantity and sales."),
  vendorOrders: desk("v-orders", 992, "The vendor's orders, filtered by status, with the customer, payment and delivery."),
  adminOverview: desk("a-overview", 1024, "The super admin's overview of the whole marketplace."),
  adminAnalytics: desk("a-analytics", 1089, "Admin analytics: overall sales by month, the sales report by category and the best sellers."),
  adminCustomers: desk("a-customers", 992, "Admin: every customer, with orders, balance and status."),
  // The frame runs to 2981 points but the page ends at about 1650; the rest is empty
  mHome: phone("m-home", 2981, "The Fysi homepage on a phone."),
  mVendor: phone("m-vendor", 812, "Vendor onboarding on a phone: set up your shop."),
} as const;

export type FysiScreen = keyof typeof fysi;
