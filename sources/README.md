# Source texts

Full-text OCR of the printed volumes this research was read from, so a search can
be repeated and a quotation checked. All are out of copyright and came from the
Internet Archive; each file is that item's `_djvu.txt`. OCR is imperfect — treat a
hit as a pointer to the page image, not as a transcription.

Savage is the reference the Nickerson and Busby entries lean on continuously, so
those four volumes are **committed**. The other three answered a single question
each and are **kept locally but gitignored**, to save the repository some fifteen
thousand pages of OCR; the identifiers below re-download them in one command.

### Committed

| File | Volume | archive.org identifier |
| --- | --- | --- |
| `savage-1860-vol1-A-C.txt` | Savage, *A Genealogical Dictionary of the First Settlers of New England*, vol. I (1860) | `genealogicaldic01savarich` |
| `savage-1860-vol2-D-J.txt` | Savage, vol. II (1860) | `genealogicaldic02savarich` |
| `savage-1860-vol3-K-R.txt` | Savage, vol. III (1860) | `genealogicaldic03savarich` |
| `savage-1860-vol4-S-Z.txt` | Savage, vol. IV (1860) | `genealogicaldic04savarich` |

### Local only (gitignored)

| File | Volume | archive.org identifier |
| --- | --- | --- |
| `pa-archives-3rd-ser-vol18-berks-tax-lists-1897.txt` | *Pennsylvania Archives*, Third Series, vol. XVIII — Berks County proprietary and state tax lists (1897) | `3rdpennsylvaniaarch18harruoft` |
| `egle-1892-names-of-foreigners-oaths-1727-1775.txt` | Egle, *Names of Foreigners Who Took the Oath of Allegiance … 1727–1775, with the Foreign Arrivals, 1786–1808* (1892) | `namesofforeigner00egle` |
| `1790-census-pennsylvania-heads-of-families.txt` | *Heads of Families at the First Census … 1790: Pennsylvania* | `headsoffamiliesa08unit` |

To fetch one back:

```
curl -L -o sources/<filename> https://archive.org/download/<identifier>/<identifier>_djvu.txt
```

## What each one settled

- **Savage vols. I and III** carry the Busby and Nickerson entries behind the
  September 2026 additions: Nicholas Busby's age, offices, death, and will, and
  William Nickerson's age, trade, sailing, and the names of the four children who
  crossed in 1637. Vol. II holds only the Eldred, Hedges, and Grout
  cross-references. Vol. IV was searched and yielded nothing usable.
- **Pennsylvania Archives vol. XVIII** was searched end to end for every spelling
  of Millot. It contains exactly one: `Mylot, Fred'k, taylor,` under Colebrookdale
  Township, County of Berks, 1781, carrying no valuation.
- **Egle's oath lists** contain exactly one name of the kind, `Nickolaus Miiloth`
  (OCR; read Miloth or Milloth), last of 108 on the ship Lydia, Capt. John
  Randolph, from Rotterdam, qualified 13 October 1749.
- **The 1790 Pennsylvania census** was searched for the whole state rather than
  Berks alone. No Millot of any spelling in Berks; a cluster of Millott and Melot
  households in Bedford County.

Strassburger's *Pennsylvania German Pioneers* (1934) was also consulted and its
OCR is deliberately **not** kept here: it yielded nothing, and a nine-hundred-page
volume of 1934 is more than this repository should republish. The six page images
that were actually read from it *are* committed, under `assets/strassburger-1934-v2/`,
which is a different matter — those are cited evidence, and one of them carries
Nicklauß Möloth's autograph.
