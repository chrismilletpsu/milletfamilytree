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
    "Behind them the families reach back into Fayette County and across the line into Monongalia: Andrew Clemmer in Springhill by 1850, the Rumbles and Varners, the Wilkinses from Morgantown, the Dunhams and Dewalts, and the Millers.",
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
  cen1850: ["1850 census, Springhill Twp., Fayette Co., Pa., dwelling 235: Andrew Clemmen, 40, Maria, 38, and children Lebbens (18), Jacob (15), Delila (12), Gasper (9), Michael (7), Minerva (6), Margaret (5) and Barbary A. (2)", FS + "M4HD-KVZ"],
  cen1880andrew: ["1880 census, Springhill Twp., Fayette Co., Pa., ED 56: Andrew Clemmer, 69, laborer, living in the household of Nicholas Ganow", FS + "MWF8-PCM"],
  dcCaroline: ["Pennsylvania death certificate 114721 (1909): Caroline Clemmer, born 10 Jan 1841 in Pa., died 24 Dec 1909 at Springhill Twp., married, of mitral heart disease; father Godfrey Rumble, mother Rebecca Varner; informant Jasper Clemmer Sr., Cheat Haven; buried Mt. Moriah 26 Dec 1909", "https://www.ancestry.com/search/collections/5164/records/281182"],
  marr1907: ["Fayette Co., Pa., marriage license docket 44, p. 47, license 19339, 4 Sep 1907: Amedee Clemmer, 27, huckster, of Cheat Haven, born Fayette Co., son of Leebbius and Caroline Clemmer, and Eliza Wilkins, 24, of Smithfield, born Morgantown, W.Va., daughter of Harry and Mary", "https://www.ancestry.com/search/collections/61381/records/2789906"],
  cen1900wilkins: ["1900 census, Springhill Twp., Fayette Co., Pa.: Henry H. Wilkens, born Dec 1843 in W.Va., wife Mary C., born July 1844 in W.Va., and children including Maggie, Melenda, Harvey, Chas and Eliza E., born Sept 1884 in W.Va.", FS + "M3SG-DH9"],
  dcMartin: ["Pennsylvania death certificate 72324 (1943): Martin Dunham, born 12 May 1863 in Fayette Co., died 26 Aug 1943 at Springhill Twp., residence rural Point Marion, a farmer, of a stroke; father John Dunham, mother Rebecca Dewalt, both born Fayette Co.; informant Joe Dunham, Fairchance", "https://www.ancestry.com/search/collections/5164/records/4646075"],
  dcEmma: ["Pennsylvania death certificate 26280 (1942): Mrs. Emma Dunham, born 7 Jan 1881 in Fayette Co., died 15 Mar 1942 at Georges Twp. (Smithfield R.D. 1) of diabetic coma, wife of Martin Dunham, 79; father Wm Miller, mother Ida Emme, both born Fayette Co.; informant Jo Dunham, Fairchance", "https://www.ancestry.com/search/collections/5164/records/3877890"],
  marr1899: ["Fayette Co., Pa., marriage license 9443, 24 Aug 1899, Uniontown: Martin Dunham, 36, son of John and Rebecca, and Emma Miller, 18, daughter of Wm. G. and Ida", FS + "VF32-6MY"],
  cen1880martin: ["1880 census, Springhill Twp., Fayette Co., Pa.: Martin Dunham, 17, living and working in the household of Franklin Stewart", FS + "MWF8-YJR"],
  fagMartin: ["Find a Grave index: Martin Dunham, 12 May 1863 – 26 Aug 1943, Miller-Sisler Cemetery, Haydentown, Georges Twp.", FS + "QV2R-1GJ4"],
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
    facts:{ Born:"13 Feb 1880, Pennsylvania", Died:"4 May 1921, Springhill Twp. (the grave index says 11 April; the certificate is the record)", Children:"Irene V., William B., Grace E., Bruce S. (1920 census)", Name:"His middle initial is H. on his death certificate and G. in the 1920 census.", Married:"Eliza Wilkins, 4 Sep 1907, Fayette Co. license 19339; he was a huckster living at Cheat Haven", Siblings:"Jasper, Elle M., Oney A. (Iona Alice), Joseph, Oliver S. (1880 census)" },
    sources:[S.cen1880, S.marr1907, S.cen1910, S.cen1920, S.dcAmadee, S.fagAmadee, S.marr1938] },
  { id:"elizwilkins", name:"Elizabeth Wilkins", short:"Elizabeth Wilkins", b:"1884", d:"1931", gen:3, line:"clem", lineLabel:"Wilkins line", direct:true,
    place:"Morgantown, W.Va. → Springhill Twp., Fayette Co., Pa.",
    lede:"Born at Morgantown, West Virginia, in September 1884 (the 7th, by her grave), Eliza was sixteen and living with her parents, Henry and Mary Wilkins, in Springhill Township in 1900. She married Amadee Clemmer on 4 September 1907; her license names her parents as Harry and Mary. She was Eliza in 1910 and Elizabeth in 1920, and was widowed in 1921, when she gave the details for Amadee's death certificate from R.F.D. 12, Point Marion. She died on 2 April 1931.",
    facts:{ Born:"7 Sep 1884, Morgantown, W.Va.", Married:"4 Sep 1907, Fayette Co.", Died:"2 Apr 1931 (Find a Grave)", "Not found":"Her death certificate: not in the Pennsylvania index under any name for that date and county, nor in the West Virginia death index." },
    sources:[S.cen1900wilkins, S.marr1907, S.cen1910, S.cen1920, S.dcAmadee, S.marr1938, S.fagElizabeth] },
  { id:"henrywilkins", name:"Henry H. Wilkins", short:"Henry Wilkins", b:"1843", gen:4, line:"clem", lineLabel:"Wilkins line", direct:true,
    place:"West Virginia → Springhill Twp., Fayette Co., Pa.",
    lede:"Born in (West) Virginia in December 1843, Henry H. Wilkins, spelled Wilkens by the enumerator, was living in Springhill Township in 1900 with his wife Mary and their younger children. His daughter Eliza's marriage license names her father as Harry.",
    sources:[S.cen1900wilkins, S.marr1907] },
  { id:"marycwilkins", name:"Mary C. Wilkins", short:"Mary C. Wilkins", b:"1844", gen:4, line:"clem", lineLabel:"Wilkins line", direct:true,
    place:"West Virginia → Springhill Twp., Fayette Co., Pa.",
    lede:"Born in (West) Virginia in July 1844, Mary C. was Henry's wife in the 1900 census and is named as Eliza's mother on her marriage license. Her maiden name is not yet known.",
    sources:[S.cen1900wilkins, S.marr1907] },
  { id:"martindunham", name:"Martin Dunham", short:"Martin Dunham", b:"1863", d:"1943", gen:3, line:"dun", direct:true,
    place:"Springhill Twp. → Georges Twp., Fayette Co., Pa.", role:"Farmer",
    lede:"Born in Fayette County on 12 May 1863, the son of John Dunham and Rebecca Dewalt, Martin was seventeen in 1880 and working in Franklin Stewart's household in Springhill Township. He married Emma Miller at Uniontown on 24 August 1899, when he was 36 and she 18. In 1930 he was farming in Georges Township with Emma and nine children, from Paul, 21, to Pearl, 7. Emma died in 1942; Martin died the next year, on 26 August 1943, near Point Marion, and is buried in the Miller-Sisler Cemetery at Haydentown.",
    facts:{ Born:"12 May 1863, Fayette Co.", Married:"24 Aug 1899, Uniontown", Died:"26 Aug 1943, Springhill Twp.", Children:"Paul, Herbert, Clarence, Harry S., Eleanore C., Margaret B., Franklin W., Edith, Pearl (1930 census); Joe, the informant on both parents' certificates" },
    sources:[S.cen1880martin, S.marr1899, S.cen1930dun, S.dcMartin, S.fagMartin, S.marr1938] },
  { id:"emmamiller", name:"Emma Miller", short:"Emma Miller", b:"1881", d:"1942", gen:3, line:"dun", lineLabel:"Miller line", direct:true,
    place:"Georges Twp., Fayette Co., Pa.",
    lede:"Born in Fayette County on 7 January 1881, the daughter of William G. Miller and Ida, Emma married Martin Dunham at eighteen in 1899 and spent her life in Georges Township, where she was 49 with nine children at home in 1930. She died there, at Smithfield R.D. 1, of a diabetic coma on 15 March 1942.",
    facts:{ Born:"7 Jan 1881, Fayette Co.", Married:"24 Aug 1899, Uniontown", Died:"15 Mar 1942, Georges Twp." },
    sources:[S.marr1899, S.cen1930dun, S.dcEmma, S.marr1938] },
  { id:"johndunham", name:"John Dunham", short:"John Dunham", gen:4, line:"dun", direct:true,
    place:"Fayette Co., Pa.",
    lede:"Named as Martin's father on his 1899 marriage license and his 1943 death certificate, which gives his birthplace as Fayette County.",
    sources:[S.marr1899, S.dcMartin] },
  { id:"rebeccadewalt", name:"Rebecca Dewalt", short:"Rebecca Dewalt", gen:4, line:"dun", lineLabel:"Dewalt line", direct:true,
    place:"Fayette Co., Pa.",
    lede:"Named as Martin's mother on his 1899 marriage license (as Rebecca) and his 1943 death certificate (as Rebecca Dewalt, born in Fayette County).",
    sources:[S.marr1899, S.dcMartin] },
  { id:"wmgmiller", name:"William G. Miller", short:"William G. Miller", gen:4, line:"dun", lineLabel:"Miller line", direct:true,
    place:"Fayette Co., Pa.",
    lede:"Named as Emma's father on her 1899 marriage license (Wm. G.) and her 1942 death certificate (Wm Miller, born in Fayette County).",
    sources:[S.marr1899, S.dcEmma] },
  { id:"idaemme", name:"Ida Emme", short:"Ida Emme", gen:4, line:"dun", lineLabel:"Miller line", direct:true,
    place:"Fayette Co., Pa.",
    lede:"Named as Emma's mother on her 1899 marriage license (Ida) and her 1942 death certificate, which gives her maiden name as Emme, born in Fayette County. The surname is as the certificate spells it; the index read it as Ian Emme.",
    sources:[S.marr1899, S.dcEmma] },
  { id:"lebius", name:"Lebbeus Bigelow Clemmer", short:"Lebbeus B. Clemmer", b:"1832", d:"1909", gen:4, line:"clem", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.", role:"Brick molder",
    lede:"Born on 15 January 1832, the son of Andrew Clemmer and Moriah Halphin, Lebbeus is Lebous in the 1880 census and Lebius on his son Amadee's death certificate. In 1880 he was 49 and living in Springhill Township with his wife Caroline and six children, the youngest, Amadee, three months old. A brick molder, he died there of chronic Bright's disease on 23 February 1909, aged 77, and was buried at Mt. Moriah Cemetery. His son Frank, of Cheat Haven, gave the details.",
    facts:{ Born:"15 Jan 1832, Pennsylvania", Died:"23 Feb 1909, Springhill Twp.", Children:"Jasper, Elle M., Oney A. (Iona Alice), Joseph, Oliver S., Amadee (1880 census); Frank (informant, 1909)" },
    sources:[S.cen1850, S.cen1880, S.marr1907, S.dcLebbeus, S.dcAmadee] },
  { id:"carolinerumble", name:"Caroline Rumble", short:"Caroline Rumble", b:"1841", d:"1909", gen:4, line:"clem", lineLabel:"Rumble line", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.",
    lede:"Born in Pennsylvania on 10 January 1841, the daughter of Godfrey Rumble and Rebecca Varner, Caroline was 39 in 1880, keeping house in Springhill Township for Lebbeus and six children. She outlived him by ten months and died of heart disease on Christmas Eve 1909. Her son Jasper Clemmer Sr. of Cheat Haven gave the details, and she was buried at Mt. Moriah two days later.",
    facts:{ Born:"10 Jan 1841, Pennsylvania", Died:"24 Dec 1909, Springhill Twp." },
    sources:[S.cen1880, S.marr1907, S.dcCaroline, S.dcAmadee, S.dcLebbeus] },
  { id:"godfreyrumble", name:"Godfrey Rumble", short:"Godfrey Rumble", gen:5, line:"clem", lineLabel:"Rumble line", direct:true,
    place:"Pennsylvania",
    lede:"Named as Caroline's father on her 1909 death certificate.",
    sources:[S.dcCaroline] },
  { id:"rebeccavarner", name:"Rebecca Varner", short:"Rebecca Varner", gen:5, line:"clem", lineLabel:"Varner line", direct:true,
    place:"Pennsylvania",
    lede:"Named as Caroline's mother on her 1909 death certificate.",
    sources:[S.dcCaroline] },
  { id:"andrewclemmer", name:"Andrew Clemmer", short:"Andrew Clemmer", b:"c. 1810", gen:5, line:"clem", direct:true,
    place:"Springhill Twp., Fayette Co., Pa.", role:"Laborer",
    lede:"Born in Pennsylvania about 1810, Andrew was 40 in 1850 and living in Springhill Township with his wife Maria and nine children, from Lebbeus, 18, to Barbary A., 2. In 1880 he was 69, still in Springhill, working as a laborer and living in Nicholas Ganow's household. Where he came from is the next question. Other researchers call him Andrew Blosser Clemmer, 1810–1887; no record here says so yet.",
    facts:{ Children:"Lebbeus, Jacob, Delila, Jasper, Michael, Minerva, Margaret, Barbary A. (1850 census)" },
    sources:[S.cen1850, S.cen1880andrew, S.dcLebbeus] },
  { id:"moriahhalphin", name:"Moriah Halphin", short:"Moriah Halphin", gen:5, line:"clem", lineLabel:"Halphin line", direct:true,
    place:"West Virginia",
    b:"c. 1812",
    lede:"Named as Lebbeus's mother on his 1909 death certificate, born in (what became) West Virginia. She is Maria, 38, in the 1850 census, which gives her birthplace as Pennsylvania. The spelling is the certificate's; Mariah and Halpin or Halfin are likely variants to search.",
    sources:[S.cen1850, S.dcLebbeus] },
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
  ["godfreyrumble","rebeccavarner","spouse"],
  ["godfreyrumble","carolinerumble","parent"], ["rebeccavarner","carolinerumble","parent"],
  ["henrywilkins","marycwilkins","spouse"],
  ["henrywilkins","elizwilkins","parent"], ["marycwilkins","elizwilkins","parent"],
  ["johndunham","rebeccadewalt","spouse"],
  ["johndunham","martindunham","parent"], ["rebeccadewalt","martindunham","parent"],
  ["wmgmiller","idaemme","spouse"],
  ["wmgmiller","emmamiller","parent"], ["idaemme","emmamiller","parent"],
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
  5: ["3× great-grandparents", "b. c. 1810s"],
};

// ---------- Layout hints ----------
const LAYOUT_LINE = {};  // person id → line whose column they sit in (in-laws beside a spouse)
const LAYOUT_X = {       // person id → fixed column, a fraction of the width;
                         // kept within the middle half while the tree is small, so it fits legibly
  // Clemmer side, left: each couple's parents sit above them in the same order
  andrewclemmer:0.31, moriahhalphin:0.35, godfreyrumble:0.40, rebeccavarner:0.44,
  lebius:0.33, carolinerumble:0.42, henrywilkins:0.48, marycwilkins:0.52,
  amadee:0.38, elizwilkins:0.50,
  // Dunham side, right
  johndunham:0.57, rebeccadewalt:0.61, wmgmiller:0.67, idaemme:0.72,
  martindunham:0.59, emmamiller:0.70,
};

// ---------- Map ----------
// PLACES: key → { n, lat, lon }. GEO: person id → { b, bEst, d, dEst, stops:[{p, y, e}] };
// e:1 (and bEst/dEst) marks an estimated year, drawn as a dashed arc.
const PLACES = {
  pointmarion: { n:"Point Marion, Fayette Co., PA", lat:39.7387, lon:-79.8998 },
  springhill: { n:"Springhill Twp., Fayette Co., PA", lat:39.7480, lon:-79.8350 },
  smithfield: { n:"Smithfield, Fayette Co., PA", lat:39.8012, lon:-79.8084 },
  cheathaven: { n:"Cheat Haven, Fayette Co., PA", lat:39.7195, lon:-79.8540 },
  morgantown: { n:"Morgantown, Monongalia Co., WV", lat:39.6295, lon:-79.9559 },
};
const GEO = {
  wbclemmer: { b:1908, bEst:0, d:1982, dEst:0, stops:[ {p:"pointmarion", y:1908, e:0}, {p:"springhill", y:1910, e:0}, {p:"pointmarion", y:1982, e:1} ] },
  mbdunham: { b:1916, bEst:0, d:1979, dEst:0, stops:[ {p:"smithfield", y:1916, e:0}, {p:"springhill", y:1938, e:1}, {p:"pointmarion", y:1979, e:1} ] },
  amadee: { b:1880, bEst:0, d:1921, dEst:0, stops:[ {p:"springhill", y:1880, e:0}, {p:"cheathaven", y:1907, e:0}, {p:"springhill", y:1910, e:0} ] },
  elizwilkins: { b:1884, bEst:0, d:1931, dEst:0, stops:[ {p:"morgantown", y:1884, e:0}, {p:"springhill", y:1900, e:0} ] },
  henrywilkins: { b:1843, bEst:0, d:1900, dEst:1, stops:[ {p:"morgantown", y:1843, e:1}, {p:"springhill", y:1900, e:1} ] },
  marycwilkins: { b:1844, bEst:0, d:1900, dEst:1, stops:[ {p:"morgantown", y:1844, e:1}, {p:"springhill", y:1900, e:1} ] },
  andrewclemmer: { b:1810, bEst:1, d:1880, dEst:1, stops:[ {p:"springhill", y:1810, e:1} ] },
  moriahhalphin: { b:1812, bEst:1, d:1860, dEst:1, stops:[ {p:"springhill", y:1812, e:1} ] },
  lebius: { b:1832, bEst:0, d:1909, dEst:0, stops:[ {p:"springhill", y:1832, e:1} ] },
  carolinerumble: { b:1841, bEst:0, d:1909, dEst:0, stops:[ {p:"springhill", y:1841, e:1} ] },
  martindunham: { b:1863, bEst:0, d:1943, dEst:0, stops:[ {p:"springhill", y:1863, e:1}, {p:"smithfield", y:1900, e:0}, {p:"springhill", y:1943, e:1} ] },
  emmamiller: { b:1881, bEst:0, d:1942, dEst:0, stops:[ {p:"smithfield", y:1881, e:1} ] },
};
// The map's opening frame, [[west, south], [east, north]] in degrees: southwestern
// Pennsylvania and the West Virginia line, until the records reach further.
const MAP_FRAME = [[-81.5, 38.6], [-78.2, 41.0]];

if (typeof module !== "undefined") module.exports = {
  SITE, LINES, S, P, E, EVENTS, EVENT_YEAR, EVENT_PLACE, GEN_LABELS, LAYOUT_LINE, LAYOUT_X,
  PLACES, GEO, MAP_FRAME,
};
