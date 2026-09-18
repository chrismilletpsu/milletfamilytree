# Millet Genealogy

An interactive family network for the Millet, Mickley/Michelet, Moyer, Nickerson, and Christoffersen/Olsen lines, from Metz, Norwich, and Egersund to Tamaqua and Highland Park.

Open `index.html` in a browser. The published site is served from this repository by Render, which deploys the root of `main`. Click any person for what the records say and where each fact came from; every person carries their own list of sources. Solid edges are parent to child, dashed edges are marriages, and dotted edges are links the records make likely but do not yet prove.

The site is three files. `data.js` holds the tree itself: every person, relationship, source, notable event, place, and map movement, plus the few per-person layout hints. `land.js` holds the map's basemap, coastlines and country and town labels. `index.html` holds only the code that draws them. The page loads both with plain `<script src>` tags, so it still works opened straight from disk. It also loads D3 from cdnjs.cloudflare.com and fonts from Google Fonts.

## Editing the tree

Edit `data.js`, then check it:

```
node tools/check.js
```

The check catches the mistakes that break the page or quietly lose data: duplicate ids, a source key cited on a card but never defined in `S`, edges, events, and layout entries that name nobody, map stops at places that aren't geocoded, and a syntax error in the page's own script. It exits non-zero on any of these.

## Research priorities

`PRIORITIES.md` ranks the tree's open questions — every missing parent and every join carried as probable — by expected ancestors gained per unit of research effort, and names the best next step for each. It is generated:

```
python3 tools/prioritize.py
```

The script reads the tree from `data.js` and what has already been searched from `tools/research_state.py`, which holds each open question's candidate sources, the judged chance each has of answering it, and how much of that chance earlier searches have already spent. When a search comes back empty, lower that source's residual there and re-run; the wall shows up in the ranking. Standard library only; Python 3.9 or later.
