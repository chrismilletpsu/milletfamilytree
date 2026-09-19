#!/usr/bin/env node
// Check data.js for the mistakes that break the page or quietly lose data:
// duplicate ids, sources cited but never defined, edges and events that point at
// nobody, map stops at places that are not geocoded, and so on. Also syntax-checks
// the page's own script in index.html and that land.js (the basemap) loads.
//
//     node tools/check.js
//
// Exits 1 if anything is wrong; warnings (unused sources) do not fail.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

let D;
try {
  D = require(path.join(ROOT, "data.js"));
} catch (e) {
  console.error("data.js does not load: " + e.message);
  process.exit(1);
}
const { S, P, E, EVENTS, EVENT_YEAR, EVENT_PLACE, GEN_LABELS, LAYOUT_LINE, LAYOUT_X, PLACES, GEO } = D;

// People
const ids = new Map();
const LINES = new Set(["mick", "moy", "mill", "nick", "chr", "other"]);
P.forEach((p, i) => {
  const who = p.id || `P[${i}]`;
  if (!p.id || !/^[a-z0-9_]+$/i.test(p.id)) err(`${who}: missing or malformed id`);
  if (ids.has(p.id)) err(`${who}: duplicate id`);
  ids.set(p.id, p);
  if (!p.name) err(`${who}: no name`);
  if (!Number.isInteger(p.gen)) err(`${who}: gen is not an integer`);
  else if (!(p.gen in GEN_LABELS)) err(`${who}: gen ${p.gen} has no entry in GEN_LABELS`);
  if (!LINES.has(p.line)) err(`${who}: unknown line "${p.line}"`);
  // Card prose may carry <b> and <i> (rendered as emphasis); any other tag would show as
  // text, and an unclosed one would run on through the rest of the card.
  for (const [field, text] of [["lede", p.lede], ...Object.entries(p.facts || {}).map(([k, v]) => [`facts.${k}`, v])]) {
    if (!text) continue;
    const other = text.match(/<(?!\/?(b|i)>)[a-z\/][^>]*>/gi);
    if (other) err(`${who}: ${field} has tags other than <b>/<i>: ${other.join(" ")}`);
    const open = [];
    for (const m of text.matchAll(/<(\/?)(b|i)>/g)) {
      if (!m[1]) open.push(m[2]);
      else if (open.pop() !== m[2]) { err(`${who}: ${field} has a stray </${m[2]}>`); break; }
    }
    if (open.length) err(`${who}: ${field} leaves <${open.join(">, <")}> unclosed`);
  }
  (p.sources || []).forEach((s, j) => {
    if (!Array.isArray(s) || typeof s[0] !== "string" || typeof s[1] !== "string")
      err(`${who}: sources[${j}] is undefined (misspelled S key?)`);
  });
});

// Sources
const cited = new Set(P.flatMap(p => p.sources || []));
for (const [k, s] of Object.entries(S)) {
  if (!Array.isArray(s) || s.length !== 2 || !s[0] || typeof s[1] !== "string") err(`S.${k}: not [citation, link]`);
  else if (s[1] && !/^https?:\/\//.test(s[1]) && !fs.existsSync(path.join(ROOT, s[1]))) err(`S.${k}: link "${s[1]}" is neither a URL nor a file in the repo`);
  if (!cited.has(s)) warn(`S.${k} is not cited by anyone`);
}

// Edges
const TYPES = new Set(["parent", "spouse", "sibling", "grand"]);
const seen = new Set();
E.forEach((e, i) => {
  const [a, b, type] = e;
  if (!ids.has(a)) err(`E[${i}]: unknown id "${a}"`);
  if (!ids.has(b)) err(`E[${i}]: unknown id "${b}"`);
  if (!TYPES.has(type)) err(`E[${i}]: unknown type "${type}"`);
  if (a === b) err(`E[${i}]: ${a} linked to itself`);
  const key = type === "parent" || type === "grand" ? `${a}>${b}` : [a, b].sort().join("~");
  if (seen.has(key)) err(`E[${i}]: duplicate ${type} edge ${a}, ${b}`);
  seen.add(key);
});

// Events
const tags = new Set();
for (const [id, e] of Object.entries(EVENTS)) {
  if (!ids.has(id)) err(`EVENTS.${id}: no such person`);
  if (!e.tag || !e.text) err(`EVENTS.${id}: needs tag and text`);
  else if (/<(?!\/?(b|i)>)[a-z\/][^>]*>/i.test(e.text)) err(`EVENTS.${id}: text has tags other than <b>/<i>`);
  tags.add(e.tag);
  if (!EVENT_YEAR[e.tag] && !/\b1[5-9]\d\d\b/.test(e.tag)) err(`EVENTS.${id}: tag "${e.tag}" has no year and no EVENT_YEAR entry`);
}
for (const t of Object.keys(EVENT_YEAR)) if (!tags.has(t)) err(`EVENT_YEAR: "${t}" matches no event tag`);
for (const [t, places] of Object.entries(EVENT_PLACE)) {
  if (!tags.has(t)) err(`EVENT_PLACE: "${t}" matches no event tag`);
  for (const pl of places) if (!PLACES[pl]) err(`EVENT_PLACE: "${t}" names unknown place "${pl}"`);
}

// Layout
for (const [id, line] of Object.entries(LAYOUT_LINE)) {
  if (!ids.has(id)) err(`LAYOUT_LINE.${id}: no such person`);
  if (!LINES.has(line)) err(`LAYOUT_LINE.${id}: unknown line "${line}"`);
}
for (const [id, x] of Object.entries(LAYOUT_X)) {
  if (!ids.has(id)) err(`LAYOUT_X.${id}: no such person`);
  if (!(x > 0 && x < 1)) err(`LAYOUT_X.${id}: ${x} is not a fraction of the width`);
}

// Map
for (const [k, pl] of Object.entries(PLACES)) {
  if (!pl.n || !Number.isFinite(pl.lat) || !Number.isFinite(pl.lon)) err(`PLACES.${k}: needs n, lat, lon`);
}
for (const [id, g] of Object.entries(GEO)) {
  if (!ids.has(id)) err(`GEO.${id}: no such person`);
  if (!Array.isArray(g.stops) || !g.stops.length) { err(`GEO.${id}: no stops`); continue; }
  g.stops.forEach((s, i) => {
    if (!PLACES[s.p]) err(`GEO.${id}: stop ${i} at unknown place "${s.p}"`);
    if (!Number.isFinite(s.y)) err(`GEO.${id}: stop ${i} has no year`);
    if (i && s.y < g.stops[i - 1].y) err(`GEO.${id}: stop ${i} (${s.y}) is earlier than the one before it`);
  });
}
// the living carry no dates and are left off the map on purpose
const unmapped = P.filter(p => !GEO[p.id] && (p.b || p.d)).map(p => p.id);
if (unmapped.length) warn(`not on the map (no GEO entry): ${unmapped.join(", ")}`);

// The page's own script: a syntax check only, nothing runs
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
for (const f of ["data.js", "land.js"])
  if (!html.includes(`<script src="${f}"></script>`)) err(`index.html does not load ${f}`);
try {
  const { LAND, GEOLABELS } = require(path.join(ROOT, "land.js"));
  if (!Array.isArray(LAND.features) || !Array.isArray(GEOLABELS)) err("land.js: LAND or GEOLABELS malformed");
} catch (e) { err("land.js does not load: " + e.message); }
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!inline.length) err("index.html has no inline script");
inline.forEach((code, i) => {
  try { new Function(code); } catch (e) { err(`index.html script ${i + 1}: ${e.message}`); }
});

// Report
const unused = warnings.filter(w => w.endsWith("is not cited by anyone"));
const other = warnings.filter(w => !w.endsWith("is not cited by anyone"));
other.forEach(w => console.log("warning: " + w));
if (unused.length) console.log(`warning: ${unused.length} source(s) not cited by anyone: ` +
  unused.map(w => w.split(" ")[0]).join(", "));
errors.forEach(e => console.log("ERROR: " + e));
console.log(`${P.length} people, ${E.length} edges, ${Object.keys(S).length} sources, ` +
  `${Object.keys(EVENTS).length} events, ${Object.keys(PLACES).length} places, ${Object.keys(GEO).length} mapped: ` +
  (errors.length ? `${errors.length} error(s)` : "OK"));
process.exit(errors.length ? 1 : 0);
