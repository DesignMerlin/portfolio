import { icon, makeKit, makeSlice, to, withSent } from "./kit.mjs";

const dir = "room8";
const sl = makeSlice(dir);
const GREEN = "#04802e";

export const theme = {
  dir,
  fontUrl: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=block",
  font: "Geist, sans-serif",
  bg: "#f9fafc",
  corner: "#17191d",
  ink: "#121926",
  sub: "#667085",
  faint: "#98a2b3",
  line: "#eaecf0",
  brand: GREEN,
  tint: "#e7f6ec",
  status: ["saved", 54],
  over: '<span style="position:absolute;left:120px;bottom:8px;width:135px;height:5px;border-radius:3px;background:#000"></span>',
  headH: 48,
  headGap: 14,
  titleSize: 18,
  titleWeight: 700,
  backIcon: icon("arrowLeft", 18, "#344054", 1.8),
  hWeight: 600,
  rowWeight: 500,
  btnH: 46,
  btnR: 10,
  btnWeight: 700,
  ghostLine: GREEN,
  ghostInk: GREEN,
  inputH: 42,
  searchBg: "#f5f5f5",
  chipR: 8,
  chipOn: "background:#b5e3c4;border-color:#b5e3c4;color:#0f5a2a",
  tabInk: GREEN,
  footB: 26,
  meBg: "#e7f6ec",
  meInk: "#0f973d",
  composerB: 18,
  sendBg: GREEN,
  people: { marcus: ["chats", 16, 130, 48], alex: ["chats", 16, 202, 48], steph: ["chats", 16, 274, 48], adrej: ["chats", 16, 346, 48], jemmy: ["home", 17, 68, 32], jack: ["room-roommates", 48, 188, 60] },
  photos: {
    room: ["room", 0, 84, 375, 110],
    pick: ["home", 20, 582, 200, 130],
    pick2: ["home", 268, 582, 107, 130],
    homes: ["home", 21, 391, 58, 56],
    apartments: ["home", 101, 391, 58, 56],
    studios: ["home", 181, 391, 58, 56],
    lofts: ["home", 261, 391, 58, 56],
    marina: ["vr-room", 0, 330, 375, 250],
    art: ["roommate", 70, 60, 210, 140],
    vr: ["vr-room", 0, 200, 375, 420],
    map: ["room-roommates", 16, 622, 260, 110],
  },
  tabbar: (k, active) => {
    const x = { home: ["home", 48, [107, 173, 236, 289]], explore: ["explore", 48, [77, 163, 244, 297]], chats: ["chats", 48, [84, 136, 208, 291]], saved: ["saved", 48, [80, 132, 185, 265]] }[active];
    const ids = ["home", "explore", "chats", "saved"];
    return `<div style="position:absolute;left:0;bottom:0;width:375px;height:76px">${sl(x[0], 0, 736, 375, 76, { r: 0 })}${ids
      .map((id, i) => (id === active ? "" : `<span style="position:absolute;left:${x[2][i] - 24}px;top:8px;width:48px;height:48px" ${to(id, { home: "Home", explore: "Explore", chats: "Chats", saved: "Saved" }[id], "fade")}></span>`))
      .join("")}</div>`;
  },
};

const k = makeKit(theme);
const { page, header } = k;
const { btn, row, tile, group, h, p, chips, field, search, card, badge, sheet, foot, done, pair, avatar, photo, toggle, radio, tabs, say, composer, gap } = k;
const lead = (s) => `<div style="padding:0 16px">${s}</div>`;

// Matching questions, 2 to 7 -----------------------------------------------
const question = (n, title, sub, options, next, prev) =>
  page(
    `<div class="header" style="gap:24px"><span class="back" ${to(prev, "Back", "back")}>${theme.backIcon}</span><span style="display:flex;gap:5px">${Array.from({ length: 7 }, (_, i) => `<i style="width:33px;height:6px;border-radius:3px;background:${i < n ? "#099137" : "#eaecf0"}"></i>`).join("")}</span></div>
    ${lead(`<p style="color:#099137;font-size:12px;margin-top:8px">QUESTION ${n} OF 7</p><b style="display:block;font-size:24px;margin-top:8px;letter-spacing:-0.02em">${title}</b><p class="p" style="margin:6px 0 18px">${sub}</p>${chips(options.map(([s, on]) => [s, on]), { style: "gap:10px" })}`)}
    ${foot(btn("Continue", next))}`,
  );

// Rooms and people ----------------------------------------------------------
const ROOMS = [
  ["pick", "Sunlit Studio near UNILAG", "Yaba · 1 bed", "₦140,000", "4.7"],
  ["pick2", "Garden Apartment", "Surulere · 2 beds", "₦200,000", "4.5"],
  ["apartments", "The Marina Suite", "Lekki · 2 beds", "₦380,000", "4.8"],
  ["lofts", "Loft with a view", "Ikoyi · 1 bed", "₦320,000", "4.6"],
];
const roomCard = ([ph, name, where, price, rate], saved) =>
  `<div class="card" style="display:flex;gap:12px;padding:10px;margin-bottom:12px" ${to("room", `Open ${name}`)}>${photo(ph, 92, 92, 10)}<div style="flex:1;min-width:0;padding-top:4px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</b>${icon("heart", 18, saved ? "#e02424" : "#475467", 1.7, saved ? "#e02424" : "none")}</div><p style="font-size:12px;color:#667085;margin-top:5px;display:flex;gap:4px;align-items:center">${icon("pin", 13, GREEN)}${where}</p><div style="display:flex;justify-content:space-between;margin-top:18px"><b style="font-size:14px">${price}<span style="font-weight:400;color:#667085;font-size:12px">/mo</span></b><span style="font-size:12px;color:#667085">★ ${rate}</span></div></div></div>`;
const personCard = (who, name, meta, price, saved) =>
  `<div class="card" style="display:flex;gap:12px;padding:12px;margin-bottom:12px" ${to("roommate", `Open ${name}`)}>${avatar(who, 74, 10)}<div style="flex:1"><div style="display:flex;justify-content:space-between"><span style="font-size:14px">${name}</span>${icon("heart", 18, saved ? "#e02424" : "#475467", 1.7, saved ? "#e02424" : "none")}</div><p style="font-size:12px;color:#475467;margin-top:5px;line-height:1.35">Quiet, respectful, work most of the time.</p><p style="font-size:12px;color:#98a2b3;margin-top:4px">${meta}</p><b style="font-size:12px;display:block;margin-top:5px">${price}/mo</b></div></div>`;
const exploreTop = (active) =>
  `<div style="display:flex;gap:16px;padding:2px 16px 0">${`<div style="flex:1" >${search("search anything", null, "searchArea")}</div>`}<span style="width:36px;height:36px;border-radius:8px;background:#f5f5f5;display:flex;align-items:center;justify-content:center" ${to("filters", "Filters", "sheet")}>${icon("settings", 18, "#344054")}</span></div><div style="padding:8px 16px 0">${tabs([["Roommates", active === 0, active === 0 ? null : "explore"], ["Rooms for Rent", active === 1, active === 1 ? null : "roomsForRent"]])}</div>`;

// Chat ---------------------------------------------------------------------
const chatTop = (who, name, status, menu) =>
  `<div class="header" style="height:46px;gap:10px"><span class="back" ${to("chats", "Back", "back")}>${icon("arrowLeft", 20, "#121926")}</span>${avatar(who, 32)}<div class="title"><b style="font-size:14px;font-weight:500">${name}</b><i>${status}</i></div><span style="flex:1"></span><span class="ic" ${to("callRinging", "Call", "in")}>${icon("phone", 20, "#121926")}</span><span class="ic" ${to(menu, "More options", "fade")}>${icon("dots", 20, "#121926", 2.6)}</span></div>`;
const tour = (t) => `<div class="say me"><span style="display:flex;gap:10px;align-items:center">${icon("video", 18, "#0f973d")}Video tour · ${t}</span></div>`;

const over = (id, file) => ({ id, file });
const bookSteps = (n) => `<div style="display:flex;gap:6px;margin-bottom:22px">${["When", "Who", "Review"].map((s, i) => `<span style="flex:1"><i style="display:block;height:4px;border-radius:2px;background:${i < n ? GREEN : "#eaecf0"}"></i><em style="font-style:normal;font-size:10px;color:${i < n ? GREEN : "#98a2b3"};display:block;margin-top:6px">${s}</em></span>`).join("")}</div>`;
const sheetTitle = (s, close, right = "") => `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px"><b style="font-size:18px">${s}</b><span style="display:flex;gap:12px;align-items:center">${right}<span style="width:32px;height:32px;border-radius:50%;background:#f2f4f7;display:flex;align-items:center;justify-content:center" ${to(close, "Close", "drop")}>${icon("close", 16, "#344054", 2)}</span></span></div>`;

export const screens = {
  question2: { alt: "Matching question 2 of 7: What's your monthly budget?", html: question(2, "What’s your budget?", "Per month, for your share.", [["Under ₦100k"], ["₦100k – ₦250k", true], ["₦250k – ₦400k", true], ["₦400k – ₦700k"], ["Above ₦700k"]], "question3", "questions") },
  question3: { alt: "Matching question 3 of 7: When do you want to move in?", html: question(3, "When do you want to move in?", "We’ll show homes that are ready by then.", [["As soon as possible", true], ["Within a month"], ["In 1–3 months"], ["I’m flexible"]], "question4", "question2") },
  question4: { alt: "Matching question 4 of 7: What kind of place?", html: question(4, "What kind of place?", "Pick one or more.", [["Homes"], ["Apartments", true], ["Studios"], ["Lofts"], ["Townhouses"], ["Hostels"], ["Duplexes"]], "question5", "question3") },
  question5: { alt: "Matching question 5 of 7: Who would you live with?", html: question(5, "Who would you live with?", "You can change this any time.", [["Anyone", true], ["Women only"], ["Men only"], ["18–21yrs"], ["22–35yrs", true], ["36yrs and over"]], "question6", "question4") },
  question6: { alt: "Matching question 6 of 7: How do you spend your days?", html: question(6, "How do you spend your days?", "Pick everything that sounds like you.", [["Works from home", true], ["Goes to an office"], ["Student"], ["Works nights"], ["Non-smoker", true], ["Smoker"], ["Has pets"], ["Loves pets"], ["Often has guests"]], "question7", "question5") },
  question7: { alt: "Matching question 7 of 7: How tidy are you?", html: question(7, "How tidy are you?", "Be honest: it’s the thing roommates disagree on most.", [["Very tidy", true], ["Tidy most days"], ["Relaxed"], ["I try"]], "preferences", "question6") },
  getStartedRent: {
    alt: "How do you want to use Room8? Rent a room or apartment is selected.",
    html: page(`<div style="padding:6px 16px"><b style="font-size:18px">How do you want to use Room8</b><p class="p" style="margin-top:8px">Choose your preferred option</p></div><div style="position:absolute;left:24px;right:24px;top:232px;display:grid;grid-template-columns:1fr 1fr;gap:16px">${[["users", "Find a<br>roommate", false, "getStarted"], ["bed", "Rent a<br>room/apartment", true, null]].map(([ic, s, on, id]) => `<div style="height:208px;border-radius:24px;border:1px solid ${on ? GREEN : "#e4e7ec"};background:${on ? "#eefaf2" : "#f9fafc"};padding:16px" ${to(id, s.replace("<br>", " "), "fade")}>${radio(on)}<div style="margin-top:22px">${icon(ic, 32, GREEN)}</div><b style="display:block;font-size:15px;margin-top:18px;line-height:1.35">${s}</b></div>`).join("")}</div>${foot(btn("Continue", "question2"))}`),
  },
  notifications: {
    alt: "Notifications: a new match, a reply from a host, a tour reminder and a price drop.",
    html: page(`${header("Notifications", { back: "home", right: [{ text: "Mark all read", to: "notificationsRead", move: "fade" }] })}<div class="main list">${h("Today")}${row({ lead: avatar("steph", 44), title: "Steph Campbell is a 92% match", sub: "Looking in Yaba, ₦60,000 a month · 20 min ago", id: "roommate" })}${row({ lead: avatar("marcus", 44), title: "Marcus replied to you", sub: "The room is still available · 1 hr ago", id: "chatMarcus" })}${h("Earlier")}${row({ lead: tile("calendar"), title: "Your tour is tomorrow", sub: "Private room, Ibeju-Lekki · 9:00 AM", id: "bookConfirmed" })}${row({ lead: tile("trend"), title: "Price drop on a saved room", sub: "Garden Apartment is now ₦200,000 · Monday", id: "savedRooms" })}${row({ lead: tile("shield"), title: "Payment held in escrow", sub: "₦130,000 · released when you move in", id: "payReceipt" })}</div>`),
  },
  notificationsRead: {
    alt: "Notifications, all read.",
    html: page(`${header("Notifications", { back: "home" })}${k.empty("bell", "You’re all caught up", "New matches, replies and tour reminders will show up here.")}${foot(btn("Back to home", "home", { kind: "ghost", move: "back" }))}`),
  },
  searchArea: {
    alt: "Search: an area is typed, with recent searches and popular areas below.",
    html: page(`<div style="display:flex;align-items:center;gap:12px;padding:2px 16px 0"><span class="back" ${to("home", "Back", "back")}>${theme.backIcon}</span><div style="flex:1">${search("search by location", "Yaba")}</div></div><div class="main">${h("Recent")}<div class="list">${row({ lead: icon("clock", 18, "#98a2b3"), title: "Yaba, Lagos", id: "roomsForRent" })}${row({ lead: icon("clock", 18, "#98a2b3"), title: "Ibeju-Lekki, Lagos", id: "roomsForRent" })}${row({ lead: icon("clock", 18, "#98a2b3"), title: "Surulere, Lagos", id: "roomsForRent" })}</div>${h("Popular areas")}${chips([["Lekki", 0, "roomsForRent"], ["Ikeja", 0, "roomsForRent"], ["Victoria Island", 0, "roomsForRent"], ["Gbagada", 0, "roomsForRent"], ["Ajah", 0, "roomsForRent"]])}${h("Or look on the map")}<div ${to("exploreMap", "Open the map")}>${photo("map", 343, 130, 14)}</div></div>`),
  },
  roomsForRent: { alt: "Explore, rooms for rent: a list with photos, areas, prices and ratings.", html: page(`${exploreTop(1)}<div style="padding:16px 16px 0">${ROOMS.map((r, i) => roomCard(r, i === 1)).join("")}</div>`, { tab: "explore" }) },
  savedRoommates: {
    alt: "Favourites, roommates: Steph Campbell is saved.",
    html: page(`<div style="padding:4px 16px"><b style="font-size:22px">Favourites</b><p class="p" style="margin-top:8px">Rooms and roommates you’ve saved</p><div style="display:grid;grid-template-columns:1fr 1fr;background:#f2f2f2;border-radius:10px;padding:4px;margin:20px 0;font-size:14px;text-align:center"><span style="padding:9px" ${to("saved", "Rooms", "fade")}>Rooms <span style="color:#98a2b3">0</span></span><span style="padding:9px;background:#fff;border-radius:8px;font-weight:500">Roommates <span style="color:#98a2b3">1</span></span></div>${personCard("steph", "Steph Campbell", "Designer, 24yrs · Agege", "₦60,000", true)}</div>`, { tab: "saved" }),
  },
  savedRooms: {
    alt: "Favourites, rooms: two saved rooms.",
    html: page(`<div style="padding:4px 16px"><b style="font-size:22px">Favourites</b><p class="p" style="margin-top:8px">Rooms and roommates you’ve saved</p><div style="display:grid;grid-template-columns:1fr 1fr;background:#f2f2f2;border-radius:10px;padding:4px;margin:20px 0;font-size:14px;text-align:center"><span style="padding:9px;background:#fff;border-radius:8px;font-weight:500">Rooms <span style="color:#98a2b3">2</span></span><span style="padding:9px" ${to("savedRoommates", "Roommates", "fade")}>Roommates <span style="color:#98a2b3">1</span></span></div>${roomCard(ROOMS[1], true)}${roomCard(ROOMS[0], true)}</div>`, { tab: "saved" }),
  },
  gallery: {
    alt: "All four photos of the room, with a button to open the 3D tour.",
    html: page(`${header("Photos", { back: "room", right: [{ icon: "share", to: "shareRoom", label: "Share", move: "sheet" }] })}<div class="main" style="display:grid;gap:10px">${photo("room", 343, 180, 14)}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${photo("pick", 166, 130, 14)}${photo("art", 166, 130, 14)}</div>${photo("marina", 343, 150, 14)}</div>${foot(btn("Open the 3D tour", "vrLoader", { move: "in", iconName: "play" }))}`),
  },
  amenities: {
    alt: "All 10 amenities, in a sheet over the room.",
    html: sheet(over("roomRoommates", "room-roommates"), 190, `${sheetTitle("What this place offers", "roomRoommates")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[["wifi", "Wifi · 100 Mbps"], ["bolt", "24/7 power"], ["shield", "Gated · CCTV"], ["car", "Parking"], ["snow", "Air conditioning"], ["home", "Shared kitchen"], ["drop", "Water heater"], ["tv", "Smart TV"], ["lock", "Wardrobe"], ["pin", "Near bus stop"]].map(([ic, s]) => `<div class="card" style="display:flex;gap:10px;align-items:center;padding:14px;font-size:13px">${icon(ic, 18, GREEN)}${s}</div>`).join("")}</div><div class="foot">${btn("Done", "roomRoommates", { move: "drop" })}</div>`),
  },
  shareRoom: {
    alt: "Share the room: copy link, message or other apps.",
    html: sheet(over("room", "room"), 520, `${sheetTitle("Share this room", "room")}<div style="display:flex;justify-content:space-between;padding:0 8px;text-align:center;font-size:12px;color:#475467">${[["copy", "Copy link", "roomShared"], ["chat", "Room8 chat", "chats"], ["mail", "Email", "roomShared"], ["share", "More", "roomShared"]].map(([ic, s, id]) => `<span ${to(id, s, "fade")} style="display:grid;justify-items:center;gap:8px">${tile(ic, "#f2f4f7", "#121926", 52)}${s}</span>`).join("")}</div>`),
  },
  roomShared: { alt: "The room, with a message that the link was copied.", html: sheet(over("room", "room"), 660, `<div style="display:flex;gap:12px;align-items:center">${tile("check")}<div><b style="font-size:15px">Link copied</b><p class="p" style="font-size:13px">Anyone with the link can see this room.</p></div></div><div class="foot">${btn("Done", "room", { move: "drop" })}</div>`) },
  bookWho: {
    alt: "Book a tour, step 2: who's coming.",
    html: sheet(over("room", "room"), 92, `${sheetTitle("Book a tour", "room")}${bookSteps(2)}<b style="font-size:14px">Who’s coming?</b>${gap(10)}${group([row({ lead: avatar("jemmy", 40), title: "Just me", sub: "Jemmy", right: radio(true), chevron: false }), row({ lead: tile("users"), title: "Me and a friend", sub: "Two people", right: radio(false), chevron: false })])}${gap(20)}<b style="font-size:14px">Anything Marcus should know?</b>${gap(10)}${field({ ph: "Add a note (optional)", type: "Is the desk staying in the room?", area: true, name: "Note for Marcus" })}<div class="foot">${btn("Continue", "bookReview", { move: "fade" })}</div>`),
  },
  bookReview: {
    alt: "Book a tour, step 3: review the day, time, place and who's coming.",
    html: sheet(over("room", "room"), 92, `${sheetTitle("Book a tour", "room")}${bookSteps(3)}${photo("room", 343, 120, 14)}${gap(16)}${group([["home", "Private room", "3 Bedroom Apartment, Ibeju-Lekki"], ["calendar", "Monday, 23 November", "9:00 AM, in person"], ["user", "Just you", "Marcus will meet you there"]].map(([ic, a, b2]) => row({ lead: tile(ic), title: a, sub: b2 })))}${p("Free to cancel up to 2 hours before.", "font-size:12px;margin-top:14px;text-align:center")}<div class="foot">${btn("Confirm tour", "bookConfirmed", { move: "fade" })}${btn("Change the time", "bookVisit", { kind: "plain", move: "fade" })}</div>`),
  },
  bookConfirmed: { alt: "Tour booked: Monday 23 November at 9:00 AM with Marcus.", html: page(done({ title: "Your tour is booked", sub: "Monday, 23 November at 9:00 AM. Marcus will meet you at the house in Ibeju-Lekki.", actions: btn("Message Marcus", "chatMarcus") + btn("Back to home", "home", { kind: "ghost", move: "out" }) })) },
  host: {
    alt: "Marcus Brown, host: verified, replies within an hour, with his rooms.",
    html: page(`${header("Host", { back: "roomRoommates", right: [{ icon: "flag", to: "report", label: "Report" }] })}<div class="main" style="text-align:center"><div style="display:flex;justify-content:center">${avatar("marcus", 88)}</div><b style="display:block;font-size:20px;margin-top:12px">Marcus Brown</b><p class="p">Host since 2022 · usually replies within an hour</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0">${[["4.6", "Rating"], ["35", "Reviews"], ["4", "Rooms"]].map(([a, b2]) => card(`<b style="font-size:18px">${a}</b><p class="p" style="font-size:12px">${b2}</p>`, "padding:14px")).join("")}</div></div><div style="padding:0 16px">${h("His rooms")}${roomCard(ROOMS[0])}${roomCard(ROOMS[2])}</div>${foot(btn("Message Marcus", "chatMarcus"))}`),
  },
  roommateMore: {
    alt: "Alex Hunter's full profile: biography, room description, lifestyle and amenities.",
    html: page(`${header("Alex Hunter", { back: "roommate", right: [{ icon: "flag", to: "report", label: "Report" }] })}<div class="main"><div style="display:flex;gap:14px;align-items:center">${avatar("alex", 64)}<div><b style="font-size:16px">Student, 26 Years</b><p class="p" style="font-size:13px">₦70,000/month · available July 1</p></div></div>${h("Room description")}${p("Hi there! This is a 4 bedroom apartment that we’re looking to have a new room-mate moved into by July 1st. It is located in Ibeju-Lekki, close to bars and restaurants. The room has ample space, proper ventilation and is equipped with furniture and a huge wardrobe.")}${h("Lifestyle")}${chips([["Extrovert"], ["Loves hanging out with friends"], ["Loves pets, especially dogs"]])}${h("Amenities")}${chips([["Wifi"], ["Security"], ["24/7 Power"], ["Parking"]])}${h("Compatibility", { text: "95%" })}${k.bar(95, GREEN)}${p("You both like a tidy home, work in the day and don’t smoke.", "font-size:13px;margin-top:10px")}</div><div class="foot">${pair(btn("Contact", "conversation", { kind: "ghost", iconName: "phone" }), btn("Book a Tour", "bookVisit", { move: "sheet" }))}</div>`),
  },
  chatMarcus: { alt: "Conversation with Marcus Brown, the host, after a video tour.", html: page(`${chatTop("marcus", "Marcus Brown", "Online", "chatMenuHost")}<div class="main" style="padding-top:16px">${say("them", "Hi Jemmy! Thanks for your interest in the room in Ibeju-Lekki.", "12:31 PM")}${say("me", "Is it still available from January?", "12:33 PM")}${say("them", "It is. I can show you round on video now if you like.", "12:36 PM")}${tour("0:07")}${say("them", "Let me know if you have any questions about the house.", "12:49 PM")}</div>${composer({ type: "Can I move in on the 2nd?", send: "chatMarcusSent", attach: "attach" })}`) },
  chatMarcusSent: { alt: "Conversation with Marcus, with your message sent.", html: page(`${chatTop("marcus", "Marcus Brown", "Typing…", "chatMenuHost")}<div class="main" style="padding-top:16px">${say("me", "Is it still available from January?", "12:33 PM")}${say("them", "It is. I can show you round on video now if you like.", "12:36 PM")}${tour("0:07")}${say("them", "Let me know if you have any questions about the house.", "12:49 PM")}${say("me", "Can I move in on the 2nd?", "Just now")}<div class="say"><span style="width:56px;letter-spacing:3px">•••</span></div></div>${composer({ type: "Thank you!", send: "chatMarcus", attach: "attach" })}`) },
  chatSteph: { alt: "Conversation with Steph Campbell, a possible roommate.", html: page(`${chatTop("steph", "Steph Campbell", "Last seen 3:20 AM", "chatMenuHost")}<div class="main" style="padding-top:16px">${say("them", "Hey! We matched at 92%. Are you still looking in Yaba?", "03:02 AM")}${say("me", "Yes, from next month. Are you a morning person?", "03:05 AM")}${say("them", "Always up by 6. Shall we do a quick call?", "03:08 AM")}${tour("0:16")}</div>${composer({ type: "Great talking to you", send: "chatSteph", attach: "attach" })}`) },
  chatAdrej: { alt: "Conversation with Adrej Lisakov about a cancelled tour.", html: page(`${chatTop("adrej", "Adrej Lisakov", "Last seen yesterday", "chatMenuHost")}<div class="main" style="padding-top:16px">${say("them", "See you at 2 for the tour?", "01:40 AM")}${say("me", "Sorry, I need to cancel the tour. I’ll rebook for the weekend.", "02:08 AM")}${card(`<div style="display:flex;gap:12px;align-items:center">${tile("calendar")}<div style="flex:1"><b style="font-size:14px">Tour cancelled</b><p class="p" style="font-size:12px">Loft with a view, Ikoyi</p></div><span class="act" ${to("bookVisit", "Rebook the tour", "sheet")}>Rebook</span></div>`)}</div>${composer({ type: "Saturday at 10?", send: "chatAdrej", attach: "attach" })}`) },
  chatMenuHost: { alt: "Conversation options: video call, view host, mute, search, report.", html: sheet(over("chatMarcus", "b-chat-marcus"), 470, `${[["video", "Video call", "callRinging"], ["user", "View contact", "host"], ["bell", "Mute notifications", "chatMuted"], ["search", "Search", "chatSearch"], ["flag", "Report", "report"]].map(([ic, s, id]) => row({ lead: icon(ic, 20, "#344054"), title: s, id, move: "fade" })).join("")}`) },
  chatMuted: { alt: "Alex Hunter's conversation is muted.", html: sheet(over("conversation", "conversation"), 600, `<div style="display:flex;gap:12px;align-items:center">${tile("bell")}<div><b style="font-size:15px">Notifications muted</b><p class="p" style="font-size:13px">You won’t hear from this chat for 8 hours.</p></div></div><div class="foot">${btn("Done", "conversation", { move: "drop" })}${btn("Unmute", "conversation", { kind: "plain", move: "drop" })}</div>`) },
  chatSearch: { alt: "Search in the conversation: payments found.", html: page(`<div style="display:flex;align-items:center;gap:12px;padding:2px 16px 0"><span class="back" ${to("conversation", "Back", "back")}>${theme.backIcon}</span><div style="flex:1">${search("Search messages", "payment")}</div></div><div class="main list">${h("3 messages")}${["12:41 PM", "12:28 PM", "01:58 AM"].map((t2) => row({ lead: tile("receipt"), title: "Payment sent · ₦130,000", sub: t2, id: "payReceipt" })).join("")}</div>`) },
  attach: { alt: "Attach a photo, document or location to the conversation.", html: sheet(over("conversation", "conversation"), 560, `${sheetTitle("Share", "conversation")}<div style="display:flex;justify-content:space-between;padding:0 14px;text-align:center;font-size:12px;color:#475467">${[["image", "Photo"], ["camera", "Camera"], ["file", "Document"], ["pin", "Location"]].map(([ic, s]) => `<span ${to("conversationSent", s, "fade")} style="display:grid;justify-items:center;gap:8px">${tile(ic, "#e7f6ec", GREEN, 52)}${s}</span>`).join("")}</div>`) },
  conversationSent: { alt: "Conversation with Alex Hunter, with a photo sent.", html: page(`${chatTop("alex", "Alex Hunter", "Online", "chatMenu")}<div class="main" style="padding-top:12px">${say("them", "Received, thank you! I’ll send the tenancy agreement over shortly.", "12:28 PM")}<div class="say me"><span style="display:flex;gap:10px;align-items:center">${icon("check", 18, "#0f973d", 2.4)}Payment sent · ₦130,000</span><i>12:41 PM</i></div>${say("them", "Received, thank you! I’ll send the tenancy agreement over shortly.", "12:41 PM")}<div style="display:flex;justify-content:flex-end">${photo("room", 220, 150, 12)}</div><p style="font-size:10px;color:#667085;text-align:right;margin-top:4px">Just now</p></div>${composer({ type: "Here’s the desk I mentioned", send: "conversation", attach: "attach" })}`) },
  report: { alt: "Report someone: pick a reason.", html: page(`${header("Report", { back: "chats" })}<div class="main">${p("What’s wrong? We review every report within a day and never tell them who it was.")}${gap(14)}${group(["It’s a scam or fake listing", "Asking to pay outside Room8", "Rude or threatening", "Not who they say they are", "Something else"].map((s, i) => row({ title: s, right: radio(i === 1) })))}${gap(16)}${field({ ph: "Tell us more (optional)", type: "They asked me to send a deposit by transfer", area: true, name: "Tell us more" })}</div>${foot(btn("Send report", "reportDone", { move: "fade" }))}`) },
  reportDone: { alt: "Report sent.", html: page(done({ title: "Thank you", sub: "Your report is in. You won’t see this person again while we look into it.", iconName: "shield", actions: btn("Back to chats", "chats", { move: "out" }) })) },
  payBank: { alt: "Pay with bank: transfer ₦130,000 to the escrow account.", html: page(`${header("Pay with bank", { back: "payMethod" })}<div class="main">${card(`<p class="p" style="font-size:12px">Transfer exactly</p><b style="font-size:28px">₦130,000</b>${k.gap(12)}${[["Bank", "Room8 Escrow, Sample Bank"], ["Account number", "0123 456 789"], ["Reference", "R8-2041"]].map(([a, b2]) => `<div style="display:flex;justify-content:space-between;font-size:14px;padding:10px 0;border-top:1px solid #eaecf0"><span style="color:#667085">${a}</span><b style="font-weight:500">${b2}</b></div>`).join("")}`)}${gap(14)}${p("The money is held in escrow until you move in. This account expires in 29:58.", "font-size:13px")}</div>${foot(btn("I’ve sent it", "payDone", { move: "fade" }) + btn("Copy account number", "payBankCopied", { kind: "ghost", move: "fade" }))}`) },
  payBankCopied: { alt: "Account number copied.", html: sheet(over("payBank", "b-pay-bank"), 620, `<div style="display:flex;gap:12px;align-items:center">${tile("copy")}<div><b style="font-size:15px">Account number copied</b><p class="p" style="font-size:13px">Paste it in your bank app.</p></div></div><div class="foot">${btn("Got it", "payBank", { move: "drop" })}</div>`) },
  payPaypal: { alt: "Pay with PayPal: confirm ₦130,000.", html: page(`${header("Pay with PayPal", { back: "payMethod" })}<div class="main">${card(`<div style="display:flex;align-items:center;gap:12px">${sl("pay-method", 28, 310, 26, 32)}<div><b style="font-size:15px">PayPal</b><p class="p" style="font-size:13px">You’ll confirm in PayPal, then come back here.</p></div></div>`)}${gap(16)}${[["Rent", "₦70,000"], ["Agreement", "₦30,000"], ["Commission", "₦30,000"]].map(([a, b2]) => `<div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0"><span style="color:#475467">${a}</span><b>${b2}</b></div>`).join("")}<div style="display:flex;justify-content:space-between;padding-top:14px;border-top:1px solid #eaecf0;margin-top:8px"><span>TOTAL</span><b style="font-size:18px">₦130,000</b></div></div>${foot(btn("Continue to PayPal", "payDone", { move: "fade" }))}`) },
  payReceipt: { alt: "Receipt for ₦130,000, held in escrow.", html: page(`${header("Receipt", { back: "conversation", right: [{ icon: "download", to: "receiptSaved", label: "Download", move: "fade" }] })}<div class="main"><div style="text-align:center;padding:16px 0 22px"><b style="font-size:32px">₦130,000</b><p style="margin-top:8px">${badge("Held in escrow", "green")}</p></div>${card([["To", "Alex Hunter"], ["For", "Rent, agreement, commission"], ["Method", "Visa •••• 4242"], ["Date", "23 Nov 2026, 12:41 PM"], ["Reference", "R8-2041"]].map(([a, b2], i) => `<div style="display:flex;justify-content:space-between;font-size:14px;padding:12px 0;${i ? "border-top:1px solid #eaecf0" : ""}"><span style="color:#667085">${a}</span><b style="font-weight:500">${b2}</b></div>`).join(""), "padding:4px 16px")}${p("It’s released to Alex the day after you move in. If something’s wrong, tell us before then.", "font-size:13px;margin-top:14px")}</div>${foot(btn("Back to home", "home", { move: "out" }))}`) },
  receiptSaved: { alt: "Receipt saved to files.", html: sheet(over("payReceipt", "b-pay-receipt"), 640, `<div style="display:flex;gap:12px;align-items:center">${tile("download")}<div><b style="font-size:15px">Receipt saved</b><p class="p" style="font-size:13px">You’ll find it in your files.</p></div></div><div class="foot">${btn("Done", "payReceipt", { move: "drop" })}</div>`) },
  callRated: { alt: "Thank you for rating the tour five stars.", html: page(done({ title: "Thanks for the rating", sub: "Five stars for Marcus. Ready for the next step?", iconName: "star", actions: btn("Make payment", "payMethod") + btn("Back to room", "room", { kind: "ghost", move: "out" }) })) },
  vrHeadset: { alt: "3D tour in VR: connect a headset.", html: page(`<div style="position:absolute;inset:0;background:#05070b"></div><div style="position:relative;color:#fff;text-align:center;padding:60px 32px"><span style="position:absolute;left:12px;top:-4px;width:40px;height:40px;border-radius:50%;background:rgb(255 255 255/.14);display:flex;align-items:center;justify-content:center" ${to("vrWalk", "Back to walk mode", "out")}>${icon("close", 18, "#fff", 2)}</span><div style="display:flex;justify-content:center;margin-top:90px">${sl("tour-loader", 72, 262, 232, 118)}</div><b style="display:block;font-size:22px;margin-top:40px">Put on your headset</b><p style="font-size:14px;color:#98a2b3;line-height:1.5;margin-top:10px">Open Room8 on the headset and enter this code to walk through the apartment.</p><b style="display:block;font-size:34px;letter-spacing:10px;margin-top:26px;color:#4ade80">4 8 2 1</b></div>${foot(btn("Keep walking here", "vrWalk", { move: "out" }))}`, { bg: "#05070b" }) },
  settingsMore: {
    alt: "Settings, further down: notifications, account, help and log out.",
    html: page(`${header("Settings", { back: "settings" })}<div class="main"><p style="font-size:12px;font-weight:600;color:#667085;margin:6px 0 10px">NOTIFICATIONS</p>${group([row({ lead: tile("bell"), title: "New matches", sub: "When someone fits your preferences", right: toggle(true) }), row({ lead: tile("chat"), title: "Messages", sub: "Replies from hosts and roommates", right: toggle(true) }), row({ lead: tile("calendar"), title: "Tour reminders", sub: "The day before and an hour before", right: toggle(true) })])}<p style="font-size:12px;font-weight:600;color:#667085;margin:22px 0 10px">ACCOUNT</p>${group([row({ lead: tile("card"), title: "Payment methods", sub: "Visa •••• 4242", id: "payMethod" }), row({ lead: tile("receipt"), title: "Payments and receipts", id: "payReceipt" }), row({ lead: tile("lock"), title: "Change password", id: "reset" }), row({ lead: tile("help"), title: "Help centre", id: "helpCentre" }), row({ lead: tile("file"), title: "Terms of use", id: "terms" })])}</div>${foot(btn("Log out", "logout", { kind: "ghost", move: "sheet" }))}`),
  },
  editProfile: { alt: "Edit profile: photo, name, about and what you're looking for.", html: page(`${header("Edit profile", { back: "settings" })}<div class="main"><div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:18px">${avatar("jemmy", 88)}<span class="act" ${to("editPhoto", "Change photo", "sheet")}>Change photo</span></div>${field({ label: "Name", ph: "Your name", type: "Jemmy" })}${field({ label: "About you", ph: "A line or two roommates will see", type: "Early riser, works from home", area: true })}${field({ label: "Occupation", ph: "What you do", type: "Product manager" })}${field({ label: "Looking for", value: "A roommate in Yaba", right: "down", id: "preferences", move: "push" })}</div>${foot(btn("Save changes", "settings", { move: "back" }))}`) },
  editPhoto: { alt: "Change your photo: camera or gallery.", html: sheet(over("editProfile", "b-edit-profile"), 590, `${sheetTitle("Change photo", "editProfile")}${row({ lead: tile("camera"), title: "Take a photo", id: "editProfile", move: "drop" })}${row({ lead: tile("image"), title: "Choose from gallery", id: "editProfile", move: "drop" })}`) },
  helpCentre: { alt: "Help centre: common questions and a way to message support.", html: page(`${header("Help centre", { back: "settingsMore" })}<div class="main">${search("Search for help", "escrow")}${gap(16)}${group([["How is my payment protected?", "Held in escrow until the day after you move in."], ["How does matching work?", "Seven questions, then how you both live."], ["Can I cancel a tour?", "Yes, free up to 2 hours before."], ["How do I verify my profile?", "Upload an ID. It takes a few minutes."]].map(([a, b2]) => row({ title: a, sub: b2 })))}</div>${foot(btn("Message support", "chatMarcus"))}`) },
  logout: { alt: "Log out? Your saved rooms and chats will be here when you're back.", html: sheet(over("settings", "settings"), 560, `<b style="display:block;font-size:18px;text-align:center">Log out?</b><p class="p" style="text-align:center;margin-top:8px">Your saved rooms and chats will be here when you’re back.</p><div class="foot">${btn("Log out", "login", { kind: "danger", move: "out" })}${btn("Stay", "settings", { kind: "plain", move: "drop" })}</div>`) },
  resetDone: { alt: "Password changed.", html: page(done({ title: "Password changed", sub: "Use your new password the next time you log in.", actions: btn("Back to log in", "login", { move: "back" }) })) },
  resetSent: { alt: "Check your email for the reset link.", html: page(done({ title: "Check your email", sub: "If there’s an account for that address, a reset link is on its way.", iconName: "mail", actions: btn("I have the link", "reset") + btn("Back to log in", "login", { kind: "ghost", move: "back" }) })) },
  preferencesFilled: { alt: "Roommate preferences, filled in.", html: page(`${header("Help us find you the best roommate", { back: "preferences" })}<div class="main"><p style="font-size:14px;margin-bottom:8px">Marital Status</p>${chips([["Single", true], ["Married"], ["Doesn’t matter"]])}${gap(18)}<p style="font-size:14px;margin-bottom:8px">Budget</p>${pair(field({ label: "Min. Price", value: "₦100,000", right: "down" }), field({ label: "Max. Price", value: "₦400,000", right: "down" }))}<p style="font-size:14px;margin:4px 0 10px">Property Ratings</p>${group([5, 4, 3].map((n, i) => row({ title: `<span style="color:#f5a623;letter-spacing:3px">${"★".repeat(n)}<span style="color:#e4e7ec">${"★".repeat(5 - n)}</span></span>`, right: radio(i === 1) })))}${gap(14)}${p("You can change all of this later in Settings.", "font-size:13px")}</div>${foot(btn("See my matches", "home", { move: "in" }))}`) },
};

withSent(screens, say, {"chatSteph":"Great talking to you","chatAdrej":"Saturday at 10?"});
