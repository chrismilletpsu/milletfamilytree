"""Curated research state for tools/prioritize.py.

Everything the tree itself cannot say lives here: which records could answer
each open question, how likely each is to answer it, what it costs to consult,
and -- the part that matters -- how much of that chance is already spent,
because the source has been searched and came back empty.

The probabilities are judgement, not measurement. They are kept on a coarse
scale so they can be argued with, and each one carries a note tying it to the
research log (RESEARCH.md, "item N" = Phase 3 log entry N; "lead N" = open lead N).

p  -- chance the source answers the question, if consulted properly
      0.8  names the parents by design, and is known to cover the time and place
      0.6  normally names the parents; coverage or identification uncertain
      0.4  indirect but often decisive (household, sponsor pattern, a presumed father's will)
      0.2  indirect and uncertain
      0.1  long shot
r  -- residual: the share of p still unspent
      1.0  untried
      0.6  partly examined (first page of hits, one volume of several)
      0.35 searched and negative, but the negative is uncontrolled (index gaps, OR-matching, incomplete batch)
      0.1  searched and negative with a control, or read end to end
      0.05 exhausted
"""

# --------------------------------------------------------------------------
# Model parameters
# --------------------------------------------------------------------------
PARAMS = dict(
    decay=0.85,          # weight per generation of distance: a missing great-grandparent outweighs a 10x-great
    continuation=0.55,   # chance each further generation is recovered once a gap is opened
    runway_cap=5.0,      # most generations credited behind any one gap
    parent_gap=30,       # years between a person's birth and their parents'
    collateral=0.10,     # value of a collateral person's parents relative to a direct ancestor's
)

# Earliest year to which the relevant records reasonably reach, for the parents' place.
REGIONS = {
    "pa_german":   (1735, "Pennsylvania German church registers reach the 1730s"),
    "pa_modern":   (1735, "Pennsylvania families; church registers reach the 1730s"),
    "us_wales":    (1700, "Welsh-born parents; Welsh parish registers and UK censuses"),
    "us_de_unk":   (1800, "German-born parents, home village unknown"),
    "slovakia":    (1730, "Slovak Catholic registers, free on FamilySearch, from the 1700s"),
    "baden":       (1650, "Baden and Württemberg Kirchenbücher"),
    "denmark":     (1650, "Danish church books, free on Arkivalieronline, from the 1640s"),
    "ny_dutch":    (1680, "Albany County Dutch and Palatine families"),
    "new_england": (1600, "New England town records, then English parish registers"),
    "england":     (1540, "English parish registers begin 1538"),
    "norway":      (1700, "Norwegian church books, free on Digitalarkivet"),
    "switzerland": (1560, "Swiss Reformed registers, many from the 1520s-1560s"),
    "metz":        (1561, "Metz Protestant registers run 1561-1685"),
    "palatinate":  (1650, "Zweibrücken and Palatinate Reformed registers"),
}

# --------------------------------------------------------------------------
# Errands: a place to look. cost is effort units:
#   0.5 grep a text already on disk   1.0 free indexed search online
#   1.5 held subscription or slow site 2-2.5 heavy image reading
#   3 buy or borrow a book, paid site not held   4 family history centre film
#   5 correspondence or a visit
# --------------------------------------------------------------------------
ERRANDS = {
    "roberts_gen":   (0.5, "Roberts, History of Lehigh County (1914) vols II-III genealogies -- local OCR, grep"),
    "savage":        (0.5, "Savage, Genealogical Dictionary (1860) -- committed in sources/, grep"),
    "mick1893":      (0.5, "1893 Mickley genealogy -- local OCR, grep"),
    "egypt_reg":     (1.0, "Printed Egypt Reformed register, Pa. Archives 6th ser. vol. VI (HathiTrust mdp.35112103983625, per-page OCR)"),
    "otis":          (1.0, "Otis, Genealogical Notes of Barnstable Families (archive.org)"),
    "faust_brum":    (1.0, "Faust & Brumbaugh, Lists of Swiss Emigrants to the American Colonies (archive.org)"),
    "nham_wills_a":  (1.0, "Northampton Will Books 1752-1787 (FamilySearch full text, Northampton place filter)"),
    "nham_deeds":    (1.5, "Northampton Deed Books 1797-1835 (FamilySearch full text)"),
    "lehigh_ft":     (1.5, "Lehigh parish, estate and Orphans' Court images (FamilySearch full text, Lehigh filter)"),
    "pa_marr":       (1.0, "Pennsylvania county marriage licences 1885-1950 (FamilySearch)"),
    "census":        (1.0, "US federal censuses 1850-1940 (FamilySearch / Ancestry)"),
    "ny_vitals":     (1.5, "New York State and NYC marriage, birth and death indexes and certificates"),
    "nj_vitals":     (1.5, "New Jersey birth, marriage and death records"),
    "ct_barbour":    (1.0, "Barbour Collection of Connecticut vital records"),
    "ma_vr":         (1.0, "Massachusetts town vital records (Chatham, Harwich)"),
    "eng_parish":    (1.0, "England births, christenings and marriages indexes (FamilySearch, FreeREG)"),
    "metz_ft":       (1.0, "FamilySearch index of the Metz Protestant registers"),
    "digitalark":    (1.5, "Digitalarkivet church books and censuses (advanced person search)"),
    "dk_emig":       (1.5, "Danish Emigration Archives database and Danish Family Search censuses"),
    "findagrave":    (1.0, "Find a Grave and published cemetery transcriptions"),
    "pa_land":       (1.0, "Pennsylvania Land Office warrants and patents (FamilySearch full text)"),
    "pa_death":      (1.5, "Pennsylvania death certificates 1906-1970 (Ancestry) -- name both parents"),
    "anc_probate":   (1.5, "Ancestry, Pennsylvania Wills and Probate 1683-1993 -- covers Northampton 1787-1839, the gap in FamilySearch"),
    "ss_apps":       (1.5, "US Social Security Applications and Claims Index (Ancestry) -- names parents"),
    "hamburg":       (1.5, "Hamburg passenger lists 1850-1934 (Ancestry) -- give the home town"),
    "natz":          (1.5, "Naturalization records (county and federal)"),
    "newspapers":    (1.5, "GenealogyBank newspapers"),
    "genealogies":   (1.5, "Published family genealogies (archive.org, HathiTrust, Google Books)"),
    "berks_ft":      (1.0, "Berks and Philadelphia estates and Orphans' Court (FamilySearch full text)"),
    "stjohns_conf":  (2.0, "St. John's Orwigsburg confirmation lists, 1830s (DAR register on FamilySearch)"),
    "metz_browse":   (2.5, "Metz Protestant registers GG236-GG253, read page by page (secretary hand)"),
    "norwich":       (2.0, "Norwich freemen rolls and parish registers"),
    "wright_berks":  (3.0, "F. Edward Wright, Berks County Church Records of the 18th Century (Hill Church and others)"),
    "longswamp_lu":  (3.0, "Longswamp Lutheran register (not freely transcribed)"),
    "burgert":       (3.0, "Burgert, Western Palatinate emigrants; Hacker, Auswanderungen (library loan)"),
    "archion":       (3.0, "Archion -- Zweibrücken church books (paid; not held)"),
    "bayonne":       (3.0, "Bayonne Slovak Catholic parish registers"),
    "fhc_zion":      (4.0, "Zion (Red Church) Orwigsburg, Rice compilation -- FHL film, family history centre"),
    "fhc_jordan":    (4.0, "Jordan Lutheran originals and Hinke copy -- FHL film, family history centre"),
    "berks_deeds":   (4.0, "Berks deeds 1767-1794 -- county Recorder of Deeds or browse film"),
    "berlin":        (5.0, "Archiv der Französischen Kirche zu Berlin -- by correspondence"),
    "metz_offices":  (5.0, "Metz municipal accounts and parlement rolls (liasses anciennes)"),
    "bern_kb":       (2.0, "Canton Bern parish registers (Staatsarchiv Bern, free online)"),
    "fs_de_index":   (1.0, "FamilySearch Germany births and baptisms index"),
}

S = lambda errand, p, r, note: (errand, p, r, note)

# --------------------------------------------------------------------------
# Joins the tree carries as probable: (parent, child) -> confidence.
# --------------------------------------------------------------------------
JOINS = {
    ("louis", "jj1"):              (0.50, "reasoned from Karl Michelet's 1883 letters; the Metz absence proves nothing (items 4-5)"),
    ("jehan", "jacquemin"):        (0.20, "the Berlin table's first generation is not a generation (negative findings)"),
    ("sgtfred", "martin"):         (0.45, "confirmation at Pike in 1805 puts Martin's birth c.1789-91; a generation may be missing (lead 3)"),
    ("martin", "fred1820"):        (0.65, "a boy 10-14 in Martin's 1830 household, and the FamilySearch tree (negative findings)"),
    ("martinmeyer", "petermeyer"): (0.70, "Martin stood godfather to Peter's daughter; same congregation 1785 (items 28, 30)"),
    ("thorsvenumsen", "ingermarie"): (0.75, "strong but circumstantial; the Søgne registers have a 1759-1821 gap"),
    ("ulrich", "elizbarbara"):     (0.95, "stated outright by Roberts 1914 (item 34), after two printed statements read together (item 29)"),
    ("christianmiller", "susannemiller"): (0.85, "one printed statement, Roberts 1914 (item 34)"),
}

# --------------------------------------------------------------------------
# Targets. kind "parents" = identify the missing parent(s) of a person;
# kind "join" = prove or break a probable join, keyed as "parent>child".
# runway: multiplier on the generations credited behind the gap (0.5 where
# the European home village is unknown and must be found first).
# --------------------------------------------------------------------------
TARGETS = {
  # ---- near the present --------------------------------------------------
  "marie": dict(region="pa_modern", sources=[
      S("pa_marr", 0.6, 1.0, "William Earl Williams's first marriage, Schuylkill, c.1920-21; the licence names the bride"),
      S("census", 0.4, 1.0, "1920 census, Gilberton or Tamaqua, gives the wife's name and age"),
      S("newspapers", 0.25, 1.0, "1922 Tamaqua birth notice; a death or divorce before 1930"),
      S("ss_apps", 0.55, 0.1, "tried: her Social Security record names Evelyn Beck, the stepmother"),
  ]),
  "catharineherring": dict(region="pa_modern", sources=[
      S("pa_death", 0.7, 1.0, "died 1934 -- the certificate names her parents"),
      S("census", 0.45, 1.0, "1870 and 1880 Herring households near Tamaqua"),
      S("pa_marr", 0.35, 1.0, "1887 licence to Adolph Martin"),
  ]),
  "coradornsife": dict(region="pa_german", branch="pa_modern", sources=[
      S("pa_death", 0.75, 1.0, "alive 1930, so a Pennsylvania death certificate naming her parents is likely"),
      S("census", 0.5, 1.0, "1880 Dornsife households, Schuylkill and Northumberland"),
  ]),
  "williamh": dict(region="us_wales", sources=[
      S("pa_death", 0.7, 1.0, "alive 1930; his certificate names his Welsh-born parents"),
      S("census", 0.5, 1.0, "1870 and 1880 Williams households, Mahanoy valley"),
  ]),
  "adolphmartin": dict(region="baden", runway=0.5, sources=[
      S("pa_death", 0.5, 1.0, "if he died in Pennsylvania after 1906; the tree's Casper and Magdalena are unsourced"),
      S("hamburg", 0.35, 1.0, "1881 arrival gives the home town"),
      S("natz", 0.3, 1.0, "Schuylkill naturalization gives the birthplace"),
      S("pa_marr", 0.3, 1.0, "1887 licence"),
  ]),
  "josephmihm": dict(region="us_de_unk", sources=[
      S("census", 0.55, 1.0, "1870 and 1880 Mihm household in New York"),
      S("ny_vitals", 0.5, 1.0, "NYC birth of 1867 names both parents"),
      S("nj_vitals", 0.45, 1.0, "1888 marriage record names parents"),
  ]),
  "louisamayer": dict(region="us_de_unk", sources=[
      S("census", 0.6, 1.0, "1880 Jacob Mayer household names his wife"),
      S("nj_vitals", 0.45, 1.0, "1888 marriage record names her mother"),
  ]),
  "orpha": dict(region="ny_dutch", sources=[
      S("census", 0.5, 1.0, "1880 Castle or Caswell household, Coeymans"),
      S("ny_vitals", 0.5, 1.0, "New York marriage certificate names her parents"),
      S("nj_vitals", 0.25, 1.0, "death after 1940 in New Jersey"),
  ]),
  "georgebaran": dict(region="slovakia", runway=0.5, sources=[
      S("natz", 0.35, 1.0, "a post-1906 naturalization gives the village"),
      S("bayonne", 0.35, 1.0, "the children's baptisms name the parents' origin"),
      S("nj_vitals", 0.3, 1.0, "his New Jersey death certificate"),
      S("hamburg", 0.15, 1.0, "1889 arrival; lists of that year are thin"),
  ]),
  "marybaran": dict(region="slovakia", runway=0.5, sources=[
      S("ss_apps", 0.3, 1.0, "the children's applications give her maiden name, then the village"),
      S("bayonne", 0.3, 1.0, "the children's baptisms"),
      S("nj_vitals", 0.2, 1.0, "her death certificate"),
  ]),
  "jacobmayer": dict(region="us_de_unk", sources=[
      S("natz", 0.25, 1.0, "naturalization, New York"),
      S("hamburg", 0.1, 1.0, "arrival before 1860"),
  ]),
  "melvina": dict(region="ny_dutch", sources=[
      S("census", 0.55, 1.0, "1850 Baumes household, Albany County"),
      S("findagrave", 0.3, 1.0, "died 1898, Albany County"),
  ]),
  "hansjacob": dict(region="denmark", runway=0.8, sources=[
      S("dk_emig", 0.45, 0.8, "the 1885 emigration entry gives Martin's parish; the site was unreachable before (lead 22)"),
      S("census", 0.1, 1.0, "Martin's US records rarely give the parish"),
  ]),
  "karen": dict(region="denmark", runway=0.8, sources=[
      S("dk_emig", 0.4, 0.8, "same route; her maiden name comes from Martin's baptism"),
  ]),
  "huldah": dict(region="ny_dutch", sources=[
      S("genealogies", 0.35, 1.0, "a Meech family genealogy"),
      S("findagrave", 0.2, 1.0, "died 1860"),
  ]),

  # ---- the Millet line ---------------------------------------------------
  "fred1820": dict(region="pa_german", sources=[
      S("fhc_zion", 0.5, 1.0, "his baptism c.1820 names his mother; Ancestry does not hold the register (lead 12)"),
      S("stjohns_conf", 0.3, 0.8, "a confirmation in the 1830s names both parents (lead 13)"),
  ]),
  "martin>fred1820": dict(kind="join", region="pa_german", sources=[
      S("fhc_zion", 0.55, 1.0, "the baptism is the one record that proves or breaks it (lead 12)"),
      S("stjohns_conf", 0.3, 0.8, "confirmation lists, mid-1830s (lead 13)"),
      S("berks_ft", 0.2, 0.35, "Schuylkill Orphans' Court searched for Millot: nothing (negative findings)"),
      S("anc_probate", 0.25, 0.1, "no estate for Martin Millot anywhere in Pennsylvania (negative findings)"),
  ]),
  "martin": dict(region="pa_german", sources=[
      S("wright_berks", 0.4, 1.0, "his baptism c.1789-91 at Hill Church names his mother (lead 14)"),
      S("longswamp_lu", 0.15, 1.0, "the unread Lutheran book of the Longswamp union church (lead 27)"),
  ]),
  "sgtfred>martin": dict(kind="join", region="pa_german", sources=[
      S("wright_berks", 0.5, 1.0, "Martin's baptism at Hill Church names his father; Ancestry indexes only the 1805 confirmations (leads 3, 14)"),
      S("longswamp_lu", 0.15, 1.0, "lead 27"),
      S("berks_ft", 0.3, 0.35, "Berks estates and Orphans' Court searched for Millot spellings: nothing (negative findings)"),
      S("berks_deeds", 0.2, 1.0, "a deed of 1767-1794 naming heirs (lead 27)"),
  ]),
  "sgtfred": dict(region="pa_german", runway=0.5, sources=[
      S("berks_ft", 0.3, 0.6, "estates 1750-1785 for a Möloth; the Millot sweeps may not have tried that spelling (lead 4)"),
      S("pa_land", 0.1, 1.0, "his own warrant or patent may name a prior owner (lead 27)"),
      S("burgert", 0.15, 1.0, "Western Palatinate emigrants (lead 29)"),
      S("archion", 0.1, 1.0, "Zweibrücken church books"),
      S("longswamp_lu", 0.1, 1.0, "lead 27"),
  ]),

  # ---- Moyer, Kern and Mickley -------------------------------------------
  "martinmeyer>petermeyer": dict(kind="join", region="pa_german", sources=[
      S("egypt_reg", 0.45, 1.0, "Peter's own baptism c.1752 and his brothers' 1755-70 -- the item-30 sweep extracted Peter's children, not Martin's"),
      S("anc_probate", 0.6, 1.0, "Martin's 1807 will names his sons; it is in the Northampton gap (item 33)"),
      S("roberts_gen", 0.3, 0.1, "the Meyer sketch lists Peter's ten children 1776-1793 but not his parentage (item 34)"),
      S("nham_deeds", 0.35, 0.7, "deeds of 1801-1824 on a Martin Meyer estate naming heirs; 80 hits seen, not read (item 33)"),
  ]),
  "catharinakern": dict(region="pa_german", sources=[
      S("egypt_reg", 0.6, 0.05, "read every Kern entry: nothing 1742-1757 (item 30)"),
      S("fhc_jordan", 0.3, 1.0, "Jordan Lutheran originals"),
      S("lehigh_ft", 0.25, 0.6, "37 Lehigh hits for 'Catharina Kern'; first page read (item 32)"),
      S("roberts_gen", 0.4, 0.1, "the Kern sketch lists both households and no Catharina (item 32)"),
      S("anc_probate", 0.35, 1.0, "Georg Jacob Kern's will, Northampton 1787-1839 (item 33)"),
      S("nham_wills_a", 0.1, 1.0, "the elder George Kern's will, if before 1787 -- 'George Kern' not yet searched"),
  ]),
  "christinanewan": dict(region="pa_german", sources=[
      S("egypt_reg", 0.35, 1.0, "'Newan' may be Neuhard/Newhard, a leading Egypt family; baptism c.1781"),
      S("roberts_gen", 0.25, 0.1, "the Newhard sketch has no Christina of her generation, so 'Newan' as Newhard is unsupported (item 34)"),
      S("lehigh_ft", 0.2, 1.0, "Lehigh parish and estate images"),
      S("anc_probate", 0.15, 1.0, "her father's will"),
  ]),
  # salomebiery -- SOLVED 18 Sept 2026 by roberts_gen, the model's top errand: the Biery and
  # Newhard sketches independently make her the eldest daughter of Henry Biery and Maria Salome
  # Newhard, born Longswamp 30 Jan 1773 (item 34). Her frontier moves up to the four below.
  "josephbiery": dict(region="switzerland", runway=0.8, sources=[
      S("faust_brum", 0.35, 1.0, "a Bern emigrant of 1739, from the Oberland"),
      S("bern_kb", 0.25, 1.0, "a Bieri baptism of 1703; the Oberland parish is not known"),
  ]),
  "elizabethdoll": dict(region="switzerland", runway=0.5, sources=[
      S("faust_brum", 0.15, 1.0, "the Doll family on the Samuel, 1739"),
      S("burgert", 0.1, 1.0, "if Palatine rather than Swiss"),
  ]),
  "michaelnewhard": dict(region="palatinate", sources=[
      S("burgert", 0.35, 1.0, "Burgert's Western Palatinate covers Zweibrücken emigrants of 1737"),
      S("fs_de_index", 0.25, 1.0, "a baptism at Zweibrücken, 9 Feb 1713"),
      S("archion", 0.3, 1.0, "the Zweibrücken Reformed registers"),
  ]),
  "barbaranewhard": dict(region="pa_german", sources=[
      S("genealogies", 0.1, 1.0, "her maiden name is recorded nowhere yet"),
  ]),
  "christianmiller": dict(region="switzerland", runway=0.5, sources=[
      S("faust_brum", 0.2, 1.0, "Müller is the commonest name in the lists"),
      S("nham_wills_a", 0.05, 1.0, "his will will not name his parents"),
  ]),
  "susannemiller": dict(region="pa_german", sources=[
      S("nham_wills_a", 0.35, 1.0, "Christian Miller of Lynn -- then Northampton County -- would name his wife in a will before 1787"),
      S("anc_probate", 0.2, 1.0, "or after 1787"),
      S("roberts_gen", 0.15, 0.2, "Mickley and Lynn Miller sketches read: father named, mother not (item 34)"),
  ]),
  "petermeyer": dict(region="pa_german", sources=[
      S("egypt_reg", 0.1, 1.0, "his baptism names his mother Magdalena, rarely her maiden name"),
  ]),
  "martinmeyer": dict(region="pa_german", runway=0.5, sources=[
      S("roberts_gen", 0.15, 0.1, "the Meyer sketch names no immigrant (item 34)"),
      S("anc_probate", 0.05, 1.0, "his will will not name his parents"),
  ]),
  "elizbarbara": dict(region="switzerland", sources=[
      S("nham_wills_a", 0.4, 1.0, "Ulrich died 1762 in what was by then Northampton; his will names his wife"),
      S("faust_brum", 0.3, 1.0, "Swiss emigrant lists name wives"),
  ]),
  "ulrich>elizbarbara": dict(kind="join", region="switzerland", sources=[
      S("nham_wills_a", 0.45, 1.0, "Ulrich's 1762 will would name his daughter"),
      S("faust_brum", 0.25, 1.0, "family lists at emigration"),
  ]),
  "ulrich": dict(region="switzerland", runway=0.8, sources=[
      S("faust_brum", 0.35, 1.0, "gives the home parish; Burkhalter is a Bernese name"),
      S("nham_wills_a", 0.05, 1.0, "his will will not name his parents"),
  ]),

  # ---- Norway ------------------------------------------------------------
  "marthe": dict(region="norway", sources=[
      S("digitalark", 0.6, 1.0, "her own baptism c.1820, Eigersund; not yet looked for (lead 21)"),
  ]),
  "oleolsen": dict(region="norway", sources=[
      S("digitalark", 0.25, 0.8, "first identify which Ole Olsen of Egersund, a gardmann in 1863 (lead 21)"),
  ]),
  "oleandreas": dict(region="norway", sources=[
      S("digitalark", 0.45, 0.1, "Hidra baptism candidates positively excluded"),
      S("digitalark", 0.25, 1.0, "his confirmation c.1828, and the Flekkefjord registers, untried"),
  ]),
  "ingermarie": dict(region="norway", sources=[
      S("digitalark", 0.15, 0.5, "Søgne registers missing 1759-1821; her mother would need Thor's marriage"),
  ]),
  "thorsvenumsen>ingermarie": dict(kind="join", region="norway", sources=[
      S("digitalark", 0.3, 0.3, "the 1838 marriage forlovere and the 1865 census, already used"),
      S("digitalark", 0.2, 1.0, "Ole Thorsen's own baptism and confirmation would name his father; untried"),
  ]),
  "thorsvenumsen": dict(region="norway", sources=[
      S("digitalark", 0.55, 1.0, "b. 1777 per the 1801 census; a Holum baptism would name the father Svenum"),
  ]),

  # ---- New England -------------------------------------------------------
  "sybil": dict(region="new_england", sources=[
      S("ct_barbour", 0.6, 1.0, "b. 1740; Ridgefield or Norwalk births"),
      S("genealogies", 0.3, 1.0, "a Norris genealogy"),
  ]),
  "dorcas": dict(region="new_england", sources=[
      S("ma_vr", 0.6, 1.0, "Chatham vital records; the Covells are well documented"),
      S("otis", 0.2, 1.0, "Barnstable families"),
      S("savage", 0.15, 0.1, "Savage's only Covells are of Marblehead and Malden (item 34)"),
  ]),
  "deliverance": dict(region="new_england", sources=[
      S("otis", 0.6, 1.0, "Otis covers the Lombards of Barnstable"),
      S("savage", 0.4, 0.2, "the Lombard entries list no Deliverance; the Chatham branch is not in Savage (item 34)"),
      S("ma_vr", 0.3, 1.0, "Chatham and Barnstable records"),
  ]),
  "mercy": dict(region="new_england", sources=[
      S("savage", 0.5, 0.15, "the Nickerson entry stops at the 1637 family; no Williams entry names her (item 34)"),
      S("ma_vr", 0.3, 1.0, "1668 marriage"),
  ]),
  "williamsr": dict(region="england", sources=[
      S("eng_parish", 0.3, 1.0, "a Norwich baptism of 1603-04"),
      S("norwich", 0.3, 1.0, "freemen rolls: a weaver admitted by patrimony names his father"),
  ]),
  "nicholasbusby": dict(region="england", sources=[
      S("norwich", 0.3, 1.0, "freemen rolls (lead 1)"),
      S("eng_parish", 0.2, 1.0, "a baptism c.1587"),
  ]),
  "bridgetbusby": dict(region="england", sources=[
      S("eng_parish", 0.2, 1.0, "the Busby marriage c.1605-15 gives her surname first"),
  ]),

  # ---- Metz --------------------------------------------------------------
  "louis>jj1": dict(kind="join", region="metz", sources=[
      S("archion", 0.2, 0.5, "Zweibrücken books; searched in person in 1869 and told the record was lost"),
      S("berlin", 0.1, 1.0, "corroborates the table, not the American join (lead 5)"),
      S("burgert", 0.1, 1.0, "a Mückli among Palatine emigrants"),
      S("metz_browse", 0.05, 1.0, "the 1699 and 1715 declarations"),
  ]),
  "suzannemangeot": dict(region="metz", sources=[
      S("metz_ft", 0.5, 0.35, "not found in the index, but the index has proven gaps (negative findings)"),
      S("metz_browse", 0.5, 1.0, "1674 baptism in GG248-GG253, read by eye"),
  ]),
  "annephilpin": dict(region="metz", sources=[
      S("metz_ft", 0.3, 0.6, "her father Pierre is known; her baptism c.1630 would name her mother"),
      S("metz_browse", 0.3, 1.0, "read by eye"),
  ]),
  "mariecolin": dict(region="metz", sources=[
      S("metz_ft", 0.25, 0.6, "father Daniel Collin known; baptism c.1595"),
      S("metz_browse", 0.15, 1.0, "her baptism read by eye"),
  ]),
  "suzannewiriot": dict(region="metz", sources=[
      S("metz_ft", 0.15, 0.6, "father Jean Wiriot known; the 1591 marriage names only him"),
      S("metz_browse", 0.1, 1.0, "a baptism c.1570, read by eye"),
  ]),
  "jacquemin": dict(region="metz", sources=[
      S("metz_browse", 0.05, 1.0, "b. c.1550, before the registers begin in 1561"),
      S("metz_offices", 0.1, 1.0, "his offices of 1587 and 1593 (lead 8)"),
  ]),
  "jehan>jacquemin": dict(kind="join", region="metz", sources=[
      S("metz_offices", 0.05, 1.0, "no record route is known"),
  ]),
  "jehan": dict(region="metz", sources=[
      S("metz_offices", 0.02, 1.0, "fl. 1444; nothing to search"),
  ]),
}

# Branches, for the summary of where effort has gone and where value lies.
BRANCHES = {
    "pa_german":   "Pennsylvania German: Millet, Moyer, Kern, Mickley, Burkhalter",
    "switzerland": "Pennsylvania German: Millet, Moyer, Kern, Mickley, Burkhalter",
    "metz":        "Metz: the Michelets",
    "norway":      "Norway: Egersund and Søgne",
    "denmark":     "Denmark: the Christoffersens",
    "new_england": "New England and Norwich: Nickerson, Busby",
    "england":     "New England and Norwich: Nickerson, Busby",
    "ny_dutch":    "New York: Castle, Baumes, Meech",
    "pa_modern":   "Schuylkill County 1850-1930: Williams, Dornsife, Herring, Martin",
    "us_wales":    "Schuylkill County 1850-1930: Williams, Dornsife, Herring, Martin",
    "baden":       "Schuylkill County 1850-1930: Williams, Dornsife, Herring, Martin",
    "slovakia":    "Bayonne: the Barans",
    "us_de_unk":   "Jersey City: Mihm, Mayer",
}

# Errands that are one sitting however many questions they serve -- a book, a
# film, a single run of volumes. Their value is summed across targets. Every
# other errand is a separate search per person, so its value is averaged.
SHARED = {
    "roberts_gen", "savage", "mick1893", "egypt_reg", "otis", "faust_brum",
    "nham_wills_a", "nham_deeds", "wright_berks", "longswamp_lu", "burgert",
    "archion", "bayonne", "fhc_zion", "fhc_jordan", "berks_deeds", "stjohns_conf",
    "norwich", "metz_offices",
}
