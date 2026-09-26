// The Clemmer family tree: every person, relationship, source, notable event, place and
// map movement, plus the site's title, family lines and opening text. index.html draws
// it and holds no family data of its own. Edit here, then run `node tools/check.js`.

// ---------- The site ----------
// What the header says, and the opening card shown when nobody is selected.
// lede and intro may use <b> and <i>; nothing else.
const SITE = {
  title: "Clemmer",
  titleEm: "Family Tree",
  eyebrow: "A tree just begun",
  heading: "The Clemmer family",
  lede: "The first records are still being gathered. Every person here carries the sources behind what the card says, and links the records make likely but do not prove are marked as probable.",
  intro: [],
};

// ---------- Family lines ----------
// Each line gets a column in the tree (x, a fraction of the width; xDirect for its people
// on the direct line) and a colour for light and dark themes. "other" (people who married
// in) is built in and needs no entry. Keys become CSS class names: lowercase letters and
// digits only.
//
// Colours carried over from the Millet tree, for lines added later:
//   brown ["#9C6C2E","#D4A45A"]  blue ["#3E6D8B","#7FB2D0"]  olive ["#6E6A3C","#B8B26A"]
//   plum  ["#8A4A60","#D48CA6"]  teal ["#2E7A78","#7CC8C4"]
const LINES = {
  clem: { name: "Clemmer", label: "Clemmer line", color: ["#9C6C2E", "#D4A45A"], x: 0.50, xDirect: 0.44 },
};

// ---------- Sources ----------
// Keyed by a short name: [citation, link]. Define a source before the people who cite it.
const S = {
};

// ---------- People ----------
// { id, name, short?, b, d, gen, line, lineLabel?, direct?, probable?, place, role?,
//   lede, facts:{…}, sources:[S.key, …] }
// Living people: name and links only — no dates, places or map stops.
const P = [
];

// ---------- Relationships ----------
// [from, to, type, probable?]; types: parent (parent → child), spouse, sibling,
// grand (a generation is missing between)
const E = [
];

// ---------- Notable events ----------
// Only moments a stranger would recognise without knowing the family.
const EVENTS = {
};
const EVENT_YEAR = {};   // tag → year, for a tag with no year in it
const EVENT_PLACE = {};  // tag → [place keys] the map flies to

// ---------- Generations ----------
// 0 is the family today; parents 1, grandparents 2, and so on back. Provisional until the
// seed fixes who stands in generation zero; add bands as the tree deepens.
const GEN_LABELS = {
  "-1": ["Children", ""],
  0: ["The family today", ""],
  1: ["Parents", ""],
  2: ["Grandparents", ""],
  3: ["Great-grandparents", ""],
  4: ["2× great-grandparents", ""],
  5: ["3× great-grandparents", ""],
};

// ---------- Layout hints ----------
const LAYOUT_LINE = {};  // person id → line whose column they sit in (in-laws beside a spouse)
const LAYOUT_X = {};     // person id → fixed column, a fraction of the width

// ---------- Map ----------
// PLACES: key → { n, lat, lon }. GEO: person id → { b, bEst, d, dEst, stops:[{p, y, e}] };
// e:1 (and bEst/dEst) marks an estimated year, drawn as a dashed arc.
const PLACES = {
};
const GEO = {
};
// The map's opening frame, [[west, south], [east, north]] in degrees: eastern North
// America to central Europe until the records say otherwise.
const MAP_FRAME = [[-93, 36], [22, 61]];

if (typeof module !== "undefined") module.exports = {
  SITE, LINES, S, P, E, EVENTS, EVENT_YEAR, EVENT_PLACE, GEN_LABELS, LAYOUT_LINE, LAYOUT_X,
  PLACES, GEO, MAP_FRAME,
};
