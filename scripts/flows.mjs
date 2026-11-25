/**
 * Checks every prototype: each screen can be reached from the start, can be left, and only points at screens that
 * exist; tap targets are on the screen and uniquely named; images are there. Run: node scripts/flows.mjs
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
/** Anything that isn't ours (react, motion, next) does nothing here */
const stub = new Proxy(function () {}, { get: (_, k) => (k === "__esModule" ? true : k === Symbol.toPrimitive ? () => "" : stub), apply: () => stub, construct: () => ({}) });
const jsx = (type, props) => ({ type, props });

function load(id) {
  if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
  if (!id.startsWith("@/")) return stub;
  const base = path.join(root, id.slice(2));
  if (id.endsWith(".json")) return JSON.parse(fs.readFileSync(base, "utf8"));
  const file = [".ts", ".tsx"].map((e) => base + e).find((f) => fs.existsSync(f));
  // Only the flows, their player and their content matter
  if (!file || (!file.includes("prototypes") && !file.includes(`${path.sep}content${path.sep}`))) return stub;
  if (cache.has(file)) return cache.get(file);
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const exports = {};
  cache.set(file, exports);
  new Function("require", "exports", js)(load, exports);
  return exports;
}

let bad = 0;
const fail = (app, s) => {
  bad++;
  console.log(`  ${app}: ${s}`);
};

for (const app of ["room8", "fundpath", "case-tracker", "yoyo"]) {
  const { props } = load(`@/components/case-study/prototypes/${app}-flow`).default();
  const { screens, flow, start } = props;
  const ids = Object.keys(flow);
  let spots = 0;
  for (const id of ids) {
    const n = flow[id];
    if (!screens[id]) {
      fail(app, `${id} has no screen`);
      continue;
    }
    if (!fs.existsSync(path.join(root, "public", screens[id].src))) fail(app, `${id}: missing ${screens[id].src}`);
    if (!screens[id].alt) fail(app, `${id} has no description`);
    const exits = [...n.spots.map((s) => s.to), ...(n.auto ? [n.auto.to] : [])];
    if (!exits.some((to) => to !== id)) fail(app, `${id} can't be left`);
    for (const to of exits) if (!flow[to]) fail(app, `${id} → ${to}, which isn't in the prototype`);
    if (n.sheet && !screens[n.sheet.over]) fail(app, `${id} is a sheet over ${n.sheet.over}, which doesn't exist`);
    const labels = [...n.spots.map((s) => s.label), ...(n.fields ?? []).map((f) => `${f.label}, type into it`)];
    for (const l of new Set(labels.filter((l, i) => labels.indexOf(l) !== i))) fail(app, `${id}: "${l}" twice`);
    for (const s of n.spots) {
      spots++;
      const [x, y] = s.at;
      if (x < 0 || x > 375 || y < 0 || y > 812) fail(app, `${id}: "${s.label}" is off the screen`);
      if (s.to === id) fail(app, `${id}: "${s.label}" goes nowhere`);
    }
  }
  const seen = new Set([start]);
  for (const queue = [start]; queue.length; ) {
    const n = flow[queue.pop()];
    for (const to of [...n.spots.map((s) => s.to), ...(n.auto ? [n.auto.to] : [])])
      if (flow[to] && !seen.has(to)) {
        seen.add(to);
        queue.push(to);
      }
  }
  for (const id of ids) if (!seen.has(id)) fail(app, `${id} can't be reached`);
  // (Room8's vrRoom is a clean plate for its film, not a screen)
  for (const id of Object.keys(screens)) if (!flow[id] && id !== "vrRoom") fail(app, `${id} is exported but not in the prototype`);
  console.log(`${app}: ${ids.length} screens, ${spots} tap targets, ${seen.size} reachable`);
}
console.log(bad ? `${bad} problems` : "every screen can be reached and left");
process.exitCode = bad ? 1 : 0;
