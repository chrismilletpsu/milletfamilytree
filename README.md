# Millet Genealogy

An interactive family network for the Millet, Mickley/Michelet, Moyer, Nickerson, and Christoffersen/Olsen lines, from Metz, Norwich, and Egersund to Tamaqua and Highland Park.

Open `index.html` in a browser. The published site is served from this repository by Render, which deploys `index.html` from the root of `main`. Click any person for what the records say and where each fact came from; every person carries their own list of sources. Solid edges are parent to child, dashed edges are marriages, and dotted edges are links the records make likely but do not yet prove.

The page is a single self-contained HTML file; it loads D3 from cdnjs.cloudflare.com and fonts from Google Fonts.

## Research priorities

`PRIORITIES.md` ranks the tree's open questions — every missing parent and every join carried as probable — by expected ancestors gained per unit of research effort, and names the best next step for each. It is generated:

```
python3 tools/prioritize.py
```

The script reads the tree from `index.html` and what has already been searched from `tools/research_state.py`, which holds each open question's candidate sources, the judged chance each has of answering it, and how much of that chance earlier searches have already spent. When a search comes back empty, lower that source's residual there and re-run; the wall shows up in the ranking. Standard library only; Python 3.9 or later.
