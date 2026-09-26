# Clemmer Family Tree

An interactive family network for the Clemmer family. It lives in the Millet tree's repository
but is a separate site: this folder has its own page, data, basemap, validator and research log,
and nothing here reads from or writes to the Millet files one level up (or the reverse). The page
began as a copy of the Millet page, so a fix to one may be worth copying to the other by hand.

Render deploys the repository root, so once pushed this tree is served at `/clemmer/`.

Open `index.html` in a browser. Click any person for what the records say and where each fact
came from; every person carries their own list of sources. Solid edges are parent to child,
dashed edges are marriages, and dotted edges are links the records make likely but do not yet
prove. The Map view plays the family's recorded moves over time.

The site is three files. `data.js` holds the tree: the site's title and opening text, the
family lines and their colours, and every person, relationship, source, notable event, place
and map movement. `land.js` holds the map's basemap. `index.html` holds only the code that
draws them, with nothing about any particular family written into it. The page loads both with
plain `<script src>` tags, so it still works opened straight from disk. It also loads D3 from
cdnjs.cloudflare.com and fonts from Google Fonts.

## Editing the tree

Edit `data.js`, then check it:

```
node clemmer/tools/check.js
```

The check catches the mistakes that break the page or quietly lose data: duplicate ids, a
source cited on a card but never defined in `S`, edges, events and layout entries that name
nobody, a person on a line that `LINES` does not define, map stops at places that aren't
geocoded, tags in card prose other than `<b>` and `<i>`, and a syntax error in the page's own
script. It exits non-zero on any of these.

## Rules the data keeps

- Every fact has a source in `S`, attached to the person. What can't be cited goes in the
  prose as an open question.
- A link the records make likely but do not prove is marked `probable`.
- Living people appear with a name and their links only: no dates, no places, no map stops.
- Searches that found nothing are logged in `RESEARCH.md` with the source and its coverage.

## Sending a preview

Chat file viewers show an HTML file as a static snapshot with scripts switched off, and this
page draws everything with script, so sending `index.html` shows an empty tree. Build a preview
instead:

```
python3 tools/preview.py /path/to/outdir
```

It lays the page out in headless Chrome, saves the finished drawing as plain HTML and SVG with
every script removed, then photographs that file with scripts blocked. It exits non-zero unless
every person is in the picture. Send both `clemmer-preview.html` and `clemmer-preview.png`.
