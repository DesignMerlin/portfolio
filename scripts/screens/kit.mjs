/**
 * A small design system for the app screens that weren't drawn in Figma: each app's own type, colours, headers,
 * rows, fields, sheets and tab bars, as HTML at 375×812. build.mjs renders them at 3× and reads the tap targets
 * off the page, so what you see and what you can press can't drift apart.
 *
 * data-to="screen" data-move="push" data-label="…" makes something tappable.
 * Photos, avatars, status bars and tab bars are exact pieces of the real screens (slice).
 */
export const ICONS = {
  back: "M15 18l-6-6 6-6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  right: "M9 18l6-6-6-6",
  down: "M6 9l6 6 6-6",
  up: "M18 15l-6-6-6 6",
  plus: "M12 5v14M5 12h14",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  users: "M17 21a5 5 0 0 0-10 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20a4 4 0 0 0-4-4M2 20a4 4 0 0 1 4-4M18 12a3 3 0 1 0-1-5.8M6 12a3 3 0 1 1 1-5.8",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  heart: "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z",
  home: "M3 11l9-8 9 8v10h-6v-6H9v6H3z",
  pin: "M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  calendar: "M3 5h18v16H3zM3 10h18M8 2v5M16 2v5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  phone: "M22 17v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3l2 5-2 2a14 14 0 0 0 8 8l2-2z",
  video: "M2 6h13v12H2zM15 10l7-4v12l-7-4z",
  mic: "M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v4",
  micOff: "M2 2l20 20M15 10V5a3 3 0 0 0-6-.5M9 9v3a3 3 0 0 0 4.5 2.6M19 11a7 7 0 0 1-1 3.6M5 11a7 7 0 0 0 10 6.3M12 18v4",
  chat: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  image: "M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  camera: "M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  file: "M14 2H5v20h14V7zM14 2v5h5M8 13h8M8 17h8",
  share: "M18 8a3 3 0 1 0-3-3M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.700 1.700M14 11a5 5 0 0 0-7.500-.5l-3 3a5 5 0 0 0 7 7l1.700-1.700",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.400 15a1.700 1.700 0 0 0 .3 1.900l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-2.900 1.200V21a2 2 0 0 1-4 0v-.1a1.700 1.700 0 0 0-2.900-1.200l-.1.1a2 2 0 1 1-2.800-2.800l.1-.1A1.700 1.700 0 0 0 3.100 14H3a2 2 0 0 1 0-4h.1a1.700 1.700 0 0 0 1.200-2.900l-.1-.1a2 2 0 1 1 2.800-2.800l.1.1A1.700 1.700 0 0 0 10 3.100V3a2 2 0 0 1 4 0v.1a1.700 1.700 0 0 0 2.900 1.200l.1-.1a2 2 0 1 1 2.800 2.800l-.1.1A1.700 1.700 0 0 0 20.900 10H21a2 2 0 0 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.100 9a3 3 0 0 1 5.800 1c0 2-3 3-3 3M12 17h.01",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  logout: "M9 21H4V3h5M16 17l5-5-5-5M21 12H9",
  edit: "M12 20h9M16.500 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z",
  trash: "M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 11v6M14 11v6",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  upload: "M12 15V3M7 8l5-5 5 5M4 21h16",
  card: "M2 5h20v14H2zM2 10h20",
  bank: "M3 10l9-6 9 6zM4 21h16M6 10v8M10 10v8M14 10v8M18 10v8",
  hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  wallet: "M3 6h16a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2zM3 6l12-3v3M17 13h.01",
  wifi: "M5 12.500a10 10 0 0 1 14 0M1.500 9a15 15 0 0 1 21 0M8.500 16a5 5 0 0 1 7 0M12 20h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bolt: "M13 2L3 14h9l-1 8 10-12h-9z",
  moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  flag: "M4 22V4M4 4h13l-2 5 2 5H4",
  bookmark: "M19 21l-7-5-7 5V3h14z",
  trend: "M23 6l-9.500 9.500-5-5L1 18M17 6h6v6",
  gift: "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H7.500a2.500 2.500 0 1 1 0-5C11 3 12 8 12 8zM12 8h4.500a2.500 2.500 0 1 0 0-5C13 3 12 8 12 8z",
  dots: "M12 5.500h.01M12 12h.01M12 18.500h.01",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  sparkle: "M12 3l1.900 5.800L20 11l-6.100 2.200L12 19l-1.900-5.800L4 11l6.100-2.200z",
  copy: "M9 9h12v12H9zM5 15H3V3h12v2",
  bed: "M2 18v-6h20v6M4 12V6h16v6M2 21v-3M22 21v-3",
  car: "M5 17h14M3 17v-5l2-6h14l2 6v5M7 17v2M17 17v2M3 12h18",
  snow: "M12 2v20M4 7l16 10M20 7L4 17",
  tv: "M2 5h20v13H2zM8 22h8",
  drop: "M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z",
  receipt: "M5 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2zM9 7h6M9 12h6",
  pie: "M21 15.900A10 10 0 1 1 8 2.800M22 12A10 10 0 0 0 12 2v10z",
  play: "M6 3l14 9-14 9z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.500 9a9 9 0 0 1 14.900-3.400L23 10M1 14l4.600 4.400A9 9 0 0 0 20.500 15",
};

export const icon = (n, s = 20, c = "currentColor", w = 1.6, fill = "none") =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block"><path d="${ICONS[n] ?? ""}"/></svg>`;

const attr = (s) => String(s).replace(/"/g, "&quot;");
/** Attributes that make something tappable */
export const to = (id, label, move = "push") => (id ? `data-to="${id}" data-move="${move}" data-label="${attr(label)}"` : "");

/** An exact piece of a real screen */
export const makeSlice = (app) => (screen, x, y, w, h, o = {}) => {
  const k = o.w ? o.w / w : 1;
  return `<span style="display:block;flex:none;overflow:hidden;position:relative;width:${w * k}px;height:${h * k}px;border-radius:${o.r ?? 0}px;${o.style ?? ""}"><img src="${app}/${screen}.webp" style="position:absolute;left:${-x * k}px;top:${-y * k}px;width:${375 * k}px;height:${812 * k}px;max-width:none"></span>`;
};

export function makeKit(t) {
  const slice = makeSlice(t.dir);
  const k = { slice, icon, to };

  k.status = (dark = false) => (t.statusHtml ? t.statusHtml(dark) : slice(t.status[0], 0, 0, 375, t.status[1]));
  k.avatar = (a, s = 48, r = "50%") => {
    const [scr, x, y, w] = t.people[a];
    return `<span style="display:block;flex:none;width:${s}px;height:${s}px;border-radius:${typeof r === "number" ? r + "px" : r};overflow:hidden">${slice(scr, x, y, w, w, { w: s })}</span>`;
  };
  k.photo = (p, w, h, r = 12) => {
    const [scr, x, y, pw, ph] = t.photos[p];
    const s = Math.max(w / pw, h / ph);
    const dx = (pw * s - w) / 2;
    const dy = (ph * s - h) / 2;
    return `<span style="display:block;flex:none;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;position:relative"><img src="${t.dir}/${scr}.webp" style="position:absolute;max-width:none;left:${-x * s - dx}px;top:${-y * s - dy}px;width:${375 * s}px;height:${812 * s}px"></span>`;
  };

  k.header = (title, { back, backMove = "back", right = [], sub } = {}) => {
    const rights = right
      .map((r) =>
        r.text
          ? `<span class="act" ${to(r.to, r.label ?? r.text, r.move)}>${r.text}</span>`
          : `<span class="ic" ${to(r.to, r.label, r.move)}>${icon(r.icon, r.size ?? 22, r.color ?? t.ink, r.w ?? 1.7, r.fill)}</span>`,
      )
      .join("");
    const b = back ? `<span class="back" ${to(back, "Back", backMove)}>${t.backIcon}</span>` : "";
    return `<div class="header">${b}<div class="title"><b>${title}</b>${sub ? `<i>${sub}</i>` : ""}</div><span style="flex:1"></span>${rights}</div>`;
  };

  k.btn = (label, id, { kind = "primary", move = "push", iconName, style = "" } = {}) =>
    `<div class="btn ${kind}" style="${style}" ${kind === "off" && !id ? "" : to(id, label, move)}>${iconName ? icon(iconName, 18, "currentColor", 1.8) : ""}<span>${label}</span></div>`;
  k.pair = (a, b) => `<div class="pair">${a}${b}</div>`;
  k.h = (s, right) => `<div class="h"><b>${s}</b>${right ? `<span class="act" ${to(right.to, right.label ?? right.text, right.move ?? "fade")}>${right.text}</span>` : ""}</div>`;
  k.p = (s, style = "") => `<p class="p" style="${style}">${s}</p>`;
  k.card = (s, style = "", act = "") => `<div class="card" style="${style}" ${act}>${s}</div>`;
  k.group = (rows) => `<div class="group">${rows.join("")}</div>`;
  k.gap = (n) => `<div style="height:${n}px"></div>`;

  /** A line in a list */
  k.row = ({ lead = "", title, sub = "", right = "", id, label, move, chevron = !!id, style = "" }) =>
    `<div class="row" style="${style}" ${id ? to(id, label ?? title.replace(/<[^>]+>/g, ""), move) : ""}>${lead}<div class="txt"><b>${title}</b>${sub ? `<i>${sub}</i>` : ""}</div>${right}${chevron ? icon("right", 18, t.faint, 1.8) : ""}</div>`;
  k.tile = (n, bg = t.tint, c = t.brand, s = 40) => `<span class="tile" style="width:${s}px;height:${s}px;background:${bg}">${icon(n, Math.round(s * 0.5), c, 1.7)}</span>`;
  k.toggle = (on = true, act = "") => `<span class="toggle ${on ? "on" : ""}" ${act}><i></i></span>`;
  k.radio = (on) => `<span class="radio ${on ? "on" : ""}"></span>`;
  k.box = (on) => `<span class="box ${on ? "on" : ""}">${on ? icon("check", 12, "#fff", 3) : ""}</span>`;
  k.badge = (s, kind = "") => `<span class="badge ${kind}">${s}</span>`;
  k.bar = (pct, color = t.brand, bg = t.line) => `<span class="bar" style="background:${bg}"><i style="width:${pct}%;background:${color}"></i></span>`;

  /** Chips: [label, on?, to?] */
  k.chips = (list, { style = "", move = "fade" } = {}) => `<div class="chips" style="${style}">${list.map(([s, on, id]) => `<span class="chip ${on ? "on" : ""}" ${to(id, s, move)}>${s}</span>`).join("")}</div>`;
  /** Tabs under a line: [label, on?, to?] */
  k.tabs = (list) => `<div class="tabs">${list.map(([s, on, id]) => `<span class="${on ? "on" : ""}" ${to(id, s.replace(/<[^>]+>/g, ""), "fade")}>${s}</span>`).join("")}</div>`;

  /** A field. `type`: what it types when tapped (over `ph`). `value`: already filled in */
  k.field = ({ label, ph = "", type, value, iconName, right, area, id, move = "sheet", name }) => {
    const inner = type
      ? `<span class="ph">${ph}</span><span class="ink">${type}</span>`
      : value
        ? `<span class="val">${value}</span>`
        : `<span class="ph">${ph}</span>`;
    return `<div class="field">${label ? `<label>${label}</label>` : ""}<div class="input ${area ? "area" : ""}" ${type ? `data-field="${attr(name ?? label ?? ph)}"` : ""} ${id ? to(id, name ?? label, move) : ""}>${iconName ? icon(iconName, 20, t.faint, 1.6) : ""}<span class="inner">${inner}</span>${right ? icon(right, 20, t.sub, 1.6) : ""}</div></div>`;
  };
  k.search = (ph, type, id) => `<div class="searchbox" ${type ? `data-field="${attr(ph)}"` : to(id, ph, "fade")}>${icon("search", 20, t.sub, 1.6)}<span class="inner"><span class="ph">${ph}</span>${type ? `<span class="ink">${type}</span>` : ""}</span></div>`;

  /** A chat bubble */
  k.say = (who, s, time) => `<div class="say ${who}"><span>${s}</span>${time ? `<i>${time}</i>` : ""}</div>`;
  k.composer = ({ type, send, attach, voice, ph = "Type here....." }) =>
    `<div class="composer"><div class="cbox"><span class="inner" style="height:100%;border-radius:8px" ${type ? `data-field="Message"` : ""}><span class="ph">${ph}</span>${type ? `<span class="ink">${type}</span>` : ""}</span>${attach ? `<span ${to(attach, "Attach", "sheet")} style="padding:6px">${icon("image", 20, t.sub)}</span>` : ""}</div><span class="csend" ${to(send ?? voice, send ? "Send" : "Voice message", "fade")}>${icon(send ? "send" : "mic", 20, "#fff", 1.8)}</span></div>`;

  /** A finished moment: a tick in a circle, what happened, and what's next */
  k.done = ({ title, sub, actions, iconName = "check", color = t.brand }) =>
    `<div class="done"><span class="disc" style="background:${color}">${icon(iconName, 44, "#fff", 2.6)}</span><b>${title}</b><p>${sub}</p></div><div class="foot">${actions}</div>`;
  k.empty = (n, title, sub) => `<div class="done" style="padding-top:150px"><span class="disc" style="background:${t.tint};width:96px;height:96px">${icon(n, 40, t.brand, 1.5)}</span><b>${title}</b><p>${sub}</p></div>`;

  k.foot = (s) => `<div class="foot">${s}</div>`;
  k.tabbar = (active) => t.tabbar(k, active);

  /** A whole screen */
  k.page = (inner, { bg = t.bg, tab, scroll = "" } = {}) => `<div class="screen" style="background:${bg};${scroll}">${k.status()}${inner}${tab ? k.tabbar(tab) : ""}${t.over ?? ""}</div>`;
  /** A bottom sheet over another screen */
  k.sheet = (over, top, inner) =>
    `<div class="screen" data-sheet="${top}" data-over="${over.id}"><img src="${t.dir}/${over.file}.webp" style="position:absolute;inset:0;width:375px;height:812px"><div style="position:absolute;inset:0;background:rgb(52 64 84 / 0.6)" ></div><div style="position:absolute;left:0;top:0;right:0;height:${top}px" ${to(over.id, "Close the sheet", "drop")}></div><div class="sheet" style="top:${top}px"><span class="grab"></span>${inner}</div>${t.over ?? ""}</div>`;
  k.toast = (s, style = "") => `<div class="toast" style="${style}">${icon("check", 18, "#fff", 2.4)}<span>${s}</span></div>`;
  return k;
}

/** The same chat, a message later. The two pass back and forth, so sending always does something */
export function withSent(screens, say, chats) {
  for (const [id, text] of Object.entries(chats)) {
    const s = screens[id];
    const send = (to) => `data-to="${to}" data-move="fade" data-label="Send"`;
    const html = s.html;
    screens[id] = { ...s, html: html.replace(send(id), send(id + "Sent")) };
    screens[id + "Sent"] = { alt: s.alt.replace(/\.$/, ", with your message sent."), html: html.replace('</div><div class="composer">', say("me", text, "Just now") + '</div><div class="composer">') };
  }
}

export const css = (t) => `
*{box-sizing:border-box;margin:0;padding:0;font-style:normal}
body{width:375px;height:812px;overflow:hidden;background:${t.corner ?? t.bg}}
.screen{position:relative;width:375px;height:812px;overflow:hidden;font-family:${t.font};color:${t.ink};letter-spacing:${t.track ?? "0"};-webkit-font-smoothing:antialiased;${t.corner ? "border-radius:46px;" : ""}}
i{font-style:normal}
.header{display:flex;align-items:center;gap:${t.headGap ?? 12}px;padding:0 16px;height:${t.headH ?? 48}px;${t.headStyle ?? ""}}
.header .title b{display:block;font-size:${t.titleSize ?? 16}px;font-weight:${t.titleWeight ?? 500}}
.header .title i{display:block;font-size:11px;color:${t.sub};margin-top:2px}
.header .ic{padding:8px;margin:-8px -4px}.header .act,.act{color:${t.link ?? t.brand};font-size:14px;font-weight:${t.actWeight ?? 500}}
.back{display:flex;align-items:center;justify-content:center;${t.backStyle ?? "width:24px;height:24px"}}
.main{padding:8px 16px 0}
.h{display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px}.h b{font-size:${t.hSize ?? 16}px;font-weight:${t.hWeight ?? 600}}
.p{font-size:14px;line-height:1.5;color:${t.sub}}
.btn{height:${t.btnH ?? 44}px;border-radius:${t.btnR ?? 8}px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:${t.btnSize ?? 15}px;font-weight:${t.btnWeight ?? 600};background:${t.brandBtn ?? t.brand};color:#fff}
.btn.ghost{background:${t.ghostBg ?? "transparent"};color:${t.ghostInk ?? t.brand};border:1px solid ${t.ghostLine ?? t.brand}}
.btn.plain{background:transparent;color:${t.ink}}.btn.soft{background:${t.tint};color:${t.brand}}
.btn.off{background:${t.off ?? "#d0d5dd"};color:#fff}.btn.danger{background:${t.danger ?? "#d92d20"}}.btn.white{background:#fff;color:${t.ink};border:1px solid ${t.line}}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card{background:${t.card ?? "#fff"};border:1px solid ${t.line};border-radius:${t.cardR ?? 12}px;padding:16px}
.group{background:${t.card ?? "#fff"};border:1px solid ${t.line};border-radius:${t.cardR ?? 12}px;overflow:hidden}
.group .row{padding:14px 16px;border-top:1px solid ${t.line}}.group .row:first-child{border-top:0}
.row{display:flex;align-items:center;gap:12px;padding:12px 0}.row .txt{flex:1;min-width:0}
.row .txt b{display:block;font-size:${t.rowSize ?? 14}px;font-weight:${t.rowWeight ?? 500};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .txt i{display:block;font-size:12px;color:${t.sub};margin-top:3px;line-height:1.4}
.list .row{border-bottom:1px solid ${t.line}}
.tile{display:flex;align-items:center;justify-content:center;border-radius:${t.tileR ?? 10}px;flex:none}
.toggle{width:38px;height:22px;border-radius:11px;background:${t.off ?? "#d0d5dd"};position:relative;flex:none}.toggle i{position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:#fff}.toggle.on{background:${t.brand}}.toggle.on i{left:18px}
.radio{display:block;width:20px;height:20px;border-radius:50%;border:1.5px solid ${t.faint};flex:none}.radio.on{border:6px solid ${t.brand}}
.box{width:18px;height:18px;border-radius:5px;border:1.5px solid ${t.faint};flex:none;display:flex;align-items:center;justify-content:center}.box.on{background:${t.brand};border-color:${t.brand}}
.badge{font-size:11px;font-weight:500;padding:3px 10px;border-radius:99px;background:${t.tint};color:${t.brand};white-space:nowrap}
.badge.green{background:#e7f6ec;color:#0f973d}.badge.red{background:#fdecec;color:#c4242b}.badge.amber{background:#fff5e0;color:#b76e00}.badge.grey{background:#f0f2f5;color:#667085}.badge.blue{background:#e6f0fd;color:#1671d9}
.bar{display:block;height:6px;border-radius:3px;overflow:hidden}.bar i{display:block;height:100%;border-radius:3px}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{font-size:13px;font-weight:500;padding:8px 14px;border-radius:${t.chipR ?? 99}px;border:1px solid ${t.chipLine ?? t.line};background:${t.chipBg ?? "#fff"};color:${t.chipInk ?? t.ink}}
.chip.on{${t.chipOn ?? `background:${t.brand};color:#fff;border-color:${t.brand}`}}
.tabs{display:flex;border-bottom:1px solid ${t.line}}.tabs span{flex:1;text-align:center;font-size:14px;color:${t.faintInk ?? t.sub};padding:12px 0;font-weight:${t.tabWeight ?? 500}}.tabs .on{color:${t.tabInk ?? t.brand};box-shadow:inset 0 -2px ${t.brand}}
.field{margin-bottom:16px}.field label{display:block;font-size:14px;margin-bottom:${t.labelGap ?? 6}px;color:${t.labelInk ?? t.ink};font-weight:${t.labelWeight ?? 400}}
.input{min-height:${t.inputH ?? 44}px;border-radius:${t.inputR ?? 8}px;border:1px solid ${t.inputLine ?? t.line};background:${t.inputBg ?? "#fff"};display:flex;align-items:center;gap:10px;padding:0 14px;font-size:14px}
.input.area{align-items:flex-start;padding:12px 14px;min-height:110px}.inner{flex:1;display:grid;align-items:center}.inner>*{grid-area:1/1;justify-self:start;white-space:nowrap}
.ph{color:${t.phInk ?? t.faint}}.val,.ink{color:${t.ink}}.ink{visibility:hidden}
.typed .ink{visibility:visible}.typed .ph{visibility:hidden}
.searchbox{height:${t.searchH ?? 40}px;border-radius:${t.searchR ?? 8}px;background:${t.searchBg ?? "#f2f4f7"};${t.searchLine ? `border:1px solid ${t.searchLine};` : ""}display:flex;align-items:center;gap:10px;padding:0 14px;font-size:14px}
.say{max-width:78%;margin:0 0 14px}.say span{display:block;padding:12px 14px;border-radius:${t.sayR ?? 8}px;font-size:14px;line-height:1.45;background:${t.sayBg ?? "#dde1e6"};color:${t.sayInk ?? t.ink}}.say i{display:block;font-size:10px;color:${t.sub};margin-top:4px}
.say.me{margin-left:auto}.say.me span{background:${t.meBg ?? t.brand};color:${t.meInk ?? "#fff"}}.say.me i{text-align:right}
.composer{position:absolute;left:16px;right:16px;bottom:${t.composerB ?? 22}px;display:flex;gap:8px}.cbox{flex:1;height:${t.composerH ?? 44}px;border-radius:${t.composerR ?? 10}px;background:${t.composerBg ?? "#f0f2f5"};display:flex;align-items:center;padding:0 8px 0 14px;font-size:14px}.csend{width:${t.composerH ?? 44}px;height:${t.composerH ?? 44}px;border-radius:${t.composerR ?? 10}px;background:${t.sendBg ?? t.brand};display:flex;align-items:center;justify-content:center}
.done{text-align:center;padding:170px 36px 0;display:flex;flex-direction:column;align-items:center}.done .disc{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:26px}.done>b{font-size:20px;font-weight:600}.done p{font-size:14px;line-height:1.5;color:${t.sub};margin-top:10px}
.foot{position:absolute;left:16px;right:16px;bottom:${t.footB ?? 36}px;display:grid;gap:12px}
.sheet{position:absolute;left:0;right:0;bottom:0;background:${t.sheetBg ?? "#fff"};border-radius:${t.sheetR ?? 24}px ${t.sheetR ?? 24}px 0 0;padding:34px 16px 0}.grab{position:absolute;top:12px;left:50%;width:${t.grabW ?? 56}px;height:4px;margin-left:-${(t.grabW ?? 56) / 2}px;border-radius:2px;background:${t.grab ?? "#98a2b3"}}
.toast{position:absolute;left:16px;right:16px;bottom:110px;height:48px;border-radius:12px;background:#101828;color:#fff;display:flex;align-items:center;gap:10px;padding:0 16px;font-size:14px}
${t.css ?? ""}
`;
