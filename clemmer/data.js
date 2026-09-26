// The Clemmer family tree: every person, relationship, source, notable event, place and
// map movement, plus the site's title, family lines and opening text. index.html draws
// it and holds no family data of its own. Edit here, then run `node tools/check.js`.

// ---------- The site ----------
// What the header says, and the opening card shown when nobody is selected.
// lede and intro may use <b> and <i>; nothing else.
const SITE = {
  title: "Clemmer",
  titleEm: "Family Tree",
  eyebrow: "Two lines, one family",
  heading: "From Point Marion and Smithfield",
  lede: "The Clemmers and the Dunhams lived a few miles apart in the southwest corner of Fayette County, Pennsylvania, along the West Virginia line. William Bryan Clemmer of Point Marion married Margaret Belle Dunham of Smithfield at Morgantown in 1938.",
  intro: [
    "The Clemmers were in Springhill Township by 1880, when Lebbeus Bigelow Clemmer, a brick molder, was raising six children there. His son Amadee clerked in a grocery store and died of tuberculosis in 1921, when his own son William was twelve. Margaret's parents, Martin Dunham and Emma Miller, raised a large family in Georges Township.",
    "The tree is just begun. Every person carries the records behind what the card says, and links the records make likely but do not prove are marked as probable.",
  ],
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
  clem: { name: "Clemmer", label: "Clemmer line", color: ["#9C6C2E", "#D4A45A"], x: 0.30, xDirect: 0.38 },
  dun: { name: "Dunham", label: "Dunham line", color: ["#3E6D8B", "#7FB2D0"], x: 0.72, xDirect: 0.62 },
};

// ---------- Sources ----------
// Keyed by a short name: [citation, link]. Define a source before the people who cite it.
const FS = "https://www.familysearch.org/ark:/61903/1:1:";
const S = {
  family: ["Family knowledge: April Millet (née Clemmer), 2026", ""],
  cen1910: ["1910 census, Springhill Twp., Fayette Co., Pa., sheet 6A: A. H. Clemmer, 30, with wife Eliza, 26, son Wm, 2, and daughter Grace", FS + "MG3H-Y2D"],
  cen1920: ["1920 census, Fayette Co., Pa., ED 93, sheet 19B: Amadee G. Clemmer, 39, wife Elizabeth, and children Irene V., William B. (11), Grace E. and Bruce S.", FS + "MFRT-JGS"],
  cen1930dun: ["1930 census, Georges Twp., Fayette Co., Pa.: Martin Dunham, 66, wife Emma, 49, daughter Margaret B., and eight other children", FS + "XHS1-TWF"],
  cen1940: ["1940 census, Springhill Twp. outside Point Marion, Fayette Co., Pa., ED 26-109, sheet 7A: William Clemmer, 32, wife Margaret, 24, son Thomas, 6; same house in 1935", FS + "KQQT-ZF2"],
  draft1940: ["WWII draft registration, Point Marion, 16 Oct 1940: William Bryon Clemmer, born 27 June 1908 in Fayette Co., employed by the WPA; contact Margaret Belle Clemmer", FS + "Q2SN-99XF"],
  cen1950: ["1950 census, Springhill Twp., Fayette Co., Pa., ED 26-200, p. 11: William Clemmer, 41, coal-mine operator, wife Bell, 34, children Phyllis, Jacqueline, Bernard and William Jr. (1), and Neil T. Dunham, 14", FS + "6XBG-KX7S"],
  cen1950jr: ["1950 census, Springhill Twp., Fayette Co., Pa.: William Clemmer Jr., 1, son of William and Bell Clemmer", FS + "6XBG-KX77"],
  marr1938: ["Monongalia Co., W.Va., marriage license, pp. 432–433: William Bryan Clemmer, 29, born Point Marion, son of Amadee Clemmer and Elizabeth Wilkins, and Margaret Belle Dunham, 21, born 22 Mar 1916 at Smithfield, Pa., daughter of Martin Dunham and Emma Miller; applied 29 Sep, married at Morgantown 14 Oct 1938 by Bernard Gibbs, M.E. minister", "https://archive.wvculture.org/vrr/va_mcdetail.aspx?Id=11349379"],
  ssdiWm: ["Social Security Death Index: William Clemmer, born 27 June 1908, died May 1982, last residence Point Marion", FS + "J2SJ-MP8"],
  fagWm: ["Find a Grave memorial 144874872: William Bryan Clemmer Sr., born 27 June 1908 at Springhill, died May 1982 at Point Marion, buried Evergreen Memorial Park, Point Marion; headstone “William Clemmer, Sr., 1908–1982”; links his half-son Thomas Neil Dunham (1935–2021)", "https://www.findagrave.com/memorial/144874872/william-bryan-clemmer"],
  fagElizabeth: ["Find a Grave memorial 39473359: Elizabeth Wilkins Clemmer, 1884–1931", "https://www.findagrave.com/memorial/39473359/elizabeth-clemmer"],
  cen1880: ["1880 census, Springhill Twp., Fayette Co., Pa., ED 56: Lebous Clemmer, 49, wife Caroline, 39, and children Jasper (17), Elle M. (14), Oney A. (10), Joseph (7), Oliver S. (3) and Amada (3 months)", FS + "MWF8-YP5"],
  dcLebbeus: ["Pennsylvania death certificate 15443 (1909): Libbens [Lebbeus] Bigelow Clemmer, born 15 Jan 1832 in Pennsylvania, died 23 Feb 1909 at Springhill Twp., aged 77, married, a brick molder, of chronic Bright's disease; father Andrew Clemmer (born Pa.), mother Moriah Halphin (born W.Va.); informant Frank Clemmer, Cheat Haven, Pa.; buried Mt. Moriah Cemetery 25 Feb 1909", "https://www.ancestry.com/search/collections/5164/records/2560967"],
  fagMargaret: ["Find a Grave index: Margaret Belle Dunham Clemmer, 21 Mar 1916 – 11 Apr 1979, Evergreen Memorial Park, Point Marion", FS + "QK15-38KB"],
  numident: ["Social Security application index (NUMIDENT): names William B. Clemmer and Margaret B. Dunham as a child's parents", FS + "6K9G-CK4S"],
  obitNeil: ["Obituary of T. Neil Dunham (1935–2021), Oakland, Md.: names his mother, Margaret Belle Dunham Clemmer, her husband William Clemmer, and his brothers and sisters Bernard, William, Phyllis and Jacqueline", FS + "XMWD-Z9XF"],
  dcAmadee: ["Pennsylvania death certificate 49787 (1921): Amadee H. Clemmer, born 13 Feb 1880, died 4 May 1921 at Springhill Twp., clerk in a grocery store, of laryngeal and pulmonary tuberculosis; father Lebius Clemmer, mother Caroline Rumble, both born Pa.; informant Mrs. Elizabeth Clemmer, R.F.D. 12 Point Marion; buried Mt. Moriah Cemetery 6 May 1921", "https://www.ancestry.com/search/collections/5164/records/624727"],
  fagAmadee: ["Find a Grave memorial 39473331: Amadee Clemmer, born 13 Feb 1880 at Springhill, died 11 Apr 1921, buried Mount Moriah Presbyterian Cemetery, Point Marion; married Elizabeth Wilkins 1907. It links Iona Alice Clemmer Molesy (1868–1954) as his mother; the 1880 census shows her as his sister", "https://www.findagrave.com/memorial/39473331/amadee-clemmer"],
};

// ---------- People ----------
// { id, name, short?, b, d, gen, line, lineLabel?, direct?, probable?, place, role?,
//   lede, facts:{…}, sources:[S.key, …] }
// Living people: name and links only — no dates, places or map stops.
const P = [
  { id:"april", name:"April Millet", short:"April Millet", gen:0, line:"clem", direct:true,
    lede:"Born April Clemmer, daughter of Bill Clemmer.",
    sources:[S.family] },
  { id:"billjr", name:"William “Bill” Clemmer", short:"Bill Clemmer", gen:1, line:"clem", direct:true,
    lede:"William Clemmer Jr., the son of William Bryan Clemmer and Margaret Belle Dunham.",
    sources:[S.family, S.cen1950jr] },
  { id:"wbclemmer", name:"William Bryan Clemmer", short:"William B. Clemmer", b:"1908", d:"1982", gen:2, line:"clem", direct:true,
    place:"Point Marion → Springhill Twp., Fayette Co., Pa.", role:"Coal-mine operator",
    lede:"Born at Point Marion on 27 June 1908, William was twelve when his father died of tuberculosis in 1921. He married Margaret Belle Dunham at Morgantown, across the state line, on 14 October 1938; he was 29 and she 21. In 1940 he was working for the WPA and living just outside Point Marion; by 1950 he was running a coal mine in Springhill Township, with five children in the house. He died in May 1982 and is buried beside Margaret in Evergreen Memorial Park at Point Marion, under a flat stone that reads William Clemmer, Sr.",
    facts:{ Born:"27 June 1908; Point Marion by his marriage license, Springhill by his memorial", Married:"14 Oct 1938, Morgantown, W.Va.", Died:"May 1982 (Social Security Death Index)", Burial:"Evergreen Memorial Park, Point Marion", Household:"The son Thomas, 6, in the 1940 census is Margaret's son Thomas Neil Dunham (1935–2021), counted under the Clemmer name; he is Neil T. Dunham in 1950." },
    sources:[S.cen1910, S.cen1920, S.marr1938, S.cen1940, S.draft1940, S.cen1950, S.ssdiWm, S.fagWm, S.numident] },
  { id:"mbdunham", name:"Margaret Belle Dunham", short:"Margaret Belle Dunham", b:"1916", d:"1979", gen:2, line:"dun", direct:true,
    place:"Smithfield → Springhill Twp., Fayette Co., Pa.",
    lede:"Born at Smithfield on 22 March 1916 by her marriage license (21 March by the grave index), Margaret was the daughter of Martin Dunham and Emma Miller and was fourteen and living with them in Georges Township in 1930. She married William Bryan Clemmer in 1938 and was counted as Bell in the 1950 census. She died on 11 April 1979 and is buried in Evergreen Memorial Park at Point Marion.",
    facts:{ Born:"22 Mar 1916, Smithfield, Pa. (marriage license)", Died:"11 Apr 1979", Burial:"Evergreen Memorial Park, Point Marion" },
    sources:[S.cen1930dun, S.marr1938, S.draft1940, S.cen1940, S.cen1950, S.fagMargaret, S.numident, S.obitNeil] },
  { id:"amadee", name:"Amadee H. Clemmer", short:"Amadee Clemmer", b:"1880", d:"1921", gen:3, line:"clem", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.", role:"Grocery clerk",
    lede:"Born on 13 February 1880, Amadee appears as A. H. Clemmer in 1910 and Amadee G. in 1920, in Springhill Township with his wife Elizabeth and their children. He clerked in a grocery store and died at home on 4 May 1921, aged 41, of laryngeal and pulmonary tuberculosis he had carried for most of a year. He was buried in the Mount Moriah Presbyterian Cemetery at Point Marion two days later. His death certificate names his parents as Lebius Clemmer and Caroline Rumble, and the 1880 census shows him at three months old in their house in Springhill, the youngest of six.",
    facts:{ Born:"13 Feb 1880, Pennsylvania", Died:"4 May 1921, Springhill Twp. (the grave index says 11 April; the certificate is the record)", Children:"Irene V., William B., Grace E., Bruce S. (1920 census)", Name:"His middle initial is H. on his death certificate and G. in the 1920 census.", Married:"Elizabeth Wilkins, 1907 (Find a Grave)", Siblings:"Jasper, Elle M., Oney A. (Iona Alice), Joseph, Oliver S. (1880 census)" },
    sources:[S.cen1880, S.cen1910, S.cen1920, S.dcAmadee, S.fagAmadee, S.marr1938] },
  { id:"elizwilkins", name:"Elizabeth Wilkins", short:"Elizabeth Wilkins", b:"1884", d:"1931", gen:3, line:"clem", lineLabel:"Wilkins line", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.",
    lede:"Named as William's mother on his marriage license. She was Eliza, 26, in 1910 and Elizabeth in 1920, and was widowed in 1921, when she gave the details for Amadee's death certificate from R.F.D. 12, Point Marion. She died in 1931. Her own death certificate, which should name her parents, is not yet found: it is not indexed under Clemmer.",
    sources:[S.cen1910, S.cen1920, S.dcAmadee, S.marr1938, S.fagElizabeth] },
  { id:"martindunham", name:"Martin Dunham", short:"Martin Dunham", b:"c. 1864", gen:3, line:"dun", direct:true,
    place:"Georges Twp., Fayette Co., Pa.",
    lede:"Named as Margaret's father on her marriage license. In 1930 he was 66 and living in Georges Township with his wife Emma and nine children, from Paul, 21, to Pearl, 7.",
    facts:{ Children:"Paul, Herbert, Clarence, Harry S., Eleanore C., Margaret B., Franklin W., Edith, Pearl (1930 census)" },
    sources:[S.cen1930dun, S.marr1938] },
  { id:"emmamiller", name:"Emma Miller", short:"Emma Miller", b:"c. 1881", gen:3, line:"dun", lineLabel:"Miller line", direct:true,
    place:"Georges Twp., Fayette Co., Pa.",
    lede:"Named as Margaret's mother on her marriage license; Emma Dunham, 49, in the 1930 census.",
    sources:[S.cen1930dun, S.marr1938] },
  { id:"lebius", name:"Lebbeus Bigelow Clemmer", short:"Lebbeus B. Clemmer", b:"1832", d:"1909", gen:4, line:"clem", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.", role:"Brick molder",
    lede:"Born on 15 January 1832, the son of Andrew Clemmer and Moriah Halphin, Lebbeus is Lebous in the 1880 census and Lebius on his son Amadee's death certificate. In 1880 he was 49 and living in Springhill Township with his wife Caroline and six children, the youngest, Amadee, three months old. A brick molder, he died there of chronic Bright's disease on 23 February 1909, aged 77, and was buried at Mt. Moriah Cemetery. His son Frank, of Cheat Haven, gave the details.",
    facts:{ Born:"15 Jan 1832, Pennsylvania", Died:"23 Feb 1909, Springhill Twp.", Children:"Jasper, Elle M., Oney A. (Iona Alice), Joseph, Oliver S., Amadee (1880 census); Frank (informant, 1909)" },
    sources:[S.dcLebbeus, S.cen1880, S.dcAmadee] },
  { id:"carolinerumble", name:"Caroline Rumble", short:"Caroline Rumble", b:"c. 1841", gen:4, line:"clem", lineLabel:"Rumble line", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.",
    lede:"Named as Amadee's mother on his 1921 death certificate, born in Pennsylvania. She was 39 in the 1880 census and was still living when Lebbeus died, a married man, in 1909.",
    sources:[S.cen1880, S.dcAmadee, S.dcLebbeus] },
  { id:"andrewclemmer", name:"Andrew Clemmer", short:"Andrew Clemmer", gen:5, line:"clem", direct:true,
    place:"Pennsylvania",
    lede:"Named as Lebbeus's father on his 1909 death certificate, born in Pennsylvania. So far that certificate is his only record here.",
    sources:[S.dcLebbeus] },
  { id:"moriahhalphin", name:"Moriah Halphin", short:"Moriah Halphin", gen:5, line:"clem", lineLabel:"Halphin line", direct:true,
    place:"West Virginia",
    lede:"Named as Lebbeus's mother on his 1909 death certificate, born in (what became) West Virginia. The spelling is the certificate's; Mariah and Halpin or Halfin are likely variants to search.",
    sources:[S.dcLebbeus] },
];

// ---------- Relationships ----------
// [from, to, type, probable?]; types: parent (parent → child), spouse, sibling,
// grand (a generation is missing between)
const E = [
  ["billjr","april","parent"],
  ["wbclemmer","mbdunham","spouse"],
  ["wbclemmer","billjr","parent"], ["mbdunham","billjr","parent"],
  ["amadee","elizwilkins","spouse"],
  ["amadee","wbclemmer","parent"], ["elizwilkins","wbclemmer","parent"],
  ["martindunham","emmamiller","spouse"],
  ["martindunham","mbdunham","parent"], ["emmamiller","mbdunham","parent"],
  ["lebius","carolinerumble","spouse"],
  ["lebius","amadee","parent"], ["carolinerumble","amadee","parent"],
  ["andrewclemmer","moriahhalphin","spouse"],
  ["andrewclemmer","lebius","parent"], ["moriahhalphin","lebius","parent"],
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
  0: ["The family today", ""],
  1: ["Parents", "b. 1940s"],
  2: ["Grandparents", "b. 1900s–1910s"],
  3: ["Great-grandparents", "b. 1860s–80s"],
  4: ["2× great-grandparents", "b. 1830s–40s"],
  5: ["3× great-grandparents", "b. c. 1800s"],
};

// ---------- Layout hints ----------
const LAYOUT_LINE = {};  // person id → line whose column they sit in (in-laws beside a spouse)
const LAYOUT_X = {};     // person id → fixed column, a fraction of the width

// ---------- Map ----------
// PLACES: key → { n, lat, lon }. GEO: person id → { b, bEst, d, dEst, stops:[{p, y, e}] };
// e:1 (and bEst/dEst) marks an estimated year, drawn as a dashed arc.
const PLACES = {
  pointmarion: { n:"Point Marion, Fayette Co., PA", lat:39.7387, lon:-79.8998 },
  springhill: { n:"Springhill Twp., Fayette Co., PA", lat:39.7480, lon:-79.8350 },
  smithfield: { n:"Smithfield, Fayette Co., PA", lat:39.8012, lon:-79.8084 },
};
const GEO = {
  wbclemmer: { b:1908, bEst:0, d:1982, dEst:0, stops:[ {p:"pointmarion", y:1908, e:0}, {p:"springhill", y:1910, e:0}, {p:"pointmarion", y:1982, e:1} ] },
  mbdunham: { b:1916, bEst:0, d:1979, dEst:0, stops:[ {p:"smithfield", y:1916, e:0}, {p:"springhill", y:1938, e:1}, {p:"pointmarion", y:1979, e:1} ] },
  amadee: { b:1880, bEst:0, d:1921, dEst:0, stops:[ {p:"springhill", y:1880, e:0} ] },
  elizwilkins: { b:1884, bEst:0, d:1931, dEst:0, stops:[ {p:"springhill", y:1884, e:1} ] },
  lebius: { b:1832, bEst:0, d:1909, dEst:0, stops:[ {p:"springhill", y:1832, e:1} ] },
  carolinerumble: { b:1841, bEst:1, d:1909, dEst:1, stops:[ {p:"springhill", y:1841, e:1} ] },
  martindunham: { b:1864, bEst:1, d:1930, dEst:1, stops:[ {p:"smithfield", y:1864, e:1} ] },
  emmamiller: { b:1881, bEst:1, d:1930, dEst:1, stops:[ {p:"smithfield", y:1881, e:1} ] },
};
// The map's opening frame, [[west, south], [east, north]] in degrees: southwestern
// Pennsylvania and the West Virginia line, until the records reach further.
const MAP_FRAME = [[-81.5, 38.6], [-78.2, 41.0]];

if (typeof module !== "undefined") module.exports = {
  SITE, LINES, S, P, E, EVENTS, EVENT_YEAR, EVENT_PLACE, GEN_LABELS, LAYOUT_LINE, LAYOUT_X,
  PLACES, GEO, MAP_FRAME,
};
