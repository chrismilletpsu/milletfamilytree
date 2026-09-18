#!/usr/bin/env python3
"""Rank the open research questions in the Millet family tree.

Reads the tree (index.html) and the curated research state
(tools/research_state.py), scores every gap, and writes PRIORITIES.md.

    python3 tools/prioritize.py            # write PRIORITIES.md and print the top of it
    python3 tools/prioritize.py --stdout   # print the whole report instead

The model, in brief
-------------------
A *target* is either the missing parent(s) of someone in the tree, or a join
the tree carries as probable. Each target has a value, in "ancestor units":

  parents  V = conf(X) * m * w(g+1) * yield(runway)
  join     V = conf(child) * (1 - c) * sum of w(g) over the parent and every ancestor above it

  w(g)      = decay ** (g - 1)            nearer generations weigh more
  runway    = generations of records behind the gap, from the region's horizon
  yield(R)  = 1 + q + q^2 + ... + q^R     each further generation recovered with chance q
  conf(X)   = product of the confidences of the probable joins between X and the present
  m         = missing parents (1 or 2); c = confidence in the join

Each target lists sources, each with a chance p of answering and a residual r
of that chance still unspent after the searching already done. Then

  chance left   P = 1 - prod(1 - p * r)
  wall          W = sum(p * (1 - r)) / sum(p)   share of the evidence already spent
  step score      = V * p * r / cost        expected ancestor units per unit of effort

A target's priority is its best step score. An errand's score is the sum of its
step scores over every target it serves, because one visit can answer several.
"""
import os, re, sys, math, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import research_state as RS

P = RS.PARAMS

# ---------------------------------------------------------------- the tree
def load_tree(path):
    t = open(path, encoding="utf-8").read()
    ptxt = t[t.index("const P"):t.index("const E")]
    people = {}
    for c in re.split(r'(?=\{ id:")', ptxt)[1:]:
        head = c[:900]
        pid = re.match(r'\{ id:"([^"]+)"', c).group(1)
        def f(k):
            m = re.search(r'\b' + k + r':"([^"]*)"', head)
            return m.group(1) if m else ""
        g = re.search(r"\bgen:(-?\d+)", head)
        people[pid] = dict(id=pid, name=f("name"), short=f("short") or f("name"), b=f("b"),
                           gen=int(g.group(1)) if g else None, place=f("place"),
                           direct="direct:true" in head, probable="probable:true" in head)
    etxt = re.search(r"const E\s*=\s*\[(.*?)\n  \];", t, re.S).group(1)
    edges = re.findall(r'\["([a-zA-Z0-9_]+)","([a-zA-Z0-9_]+)","(\w+)"', etxt)
    return people, edges

def year_of(p):
    m = re.search(r"(1[0-9]{3})", p["b"] or "")
    if m:
        return int(m.group(1))
    return 1970 - 30 * (p["gen"] or 0)

# ---------------------------------------------------------------- the model
def build(people, edges):
    parents = collections.defaultdict(set)   # recorded parent edges only
    up = collections.defaultdict(set)        # parent and 'grand' edges: anything above
    down = collections.defaultdict(set)
    for a, b, kind in edges:
        if kind == "parent":
            parents[b].add(a)
        if kind in ("parent", "grand"):
            up[b].add(a)
            down[a].add(b)

    def join_c(a, b):
        return RS.JOINS[(a, b)][0] if (a, b) in RS.JOINS else 1.0

    # chain confidence from the present upward
    conf = {}
    for pid in sorted(people, key=lambda i: (people[i]["gen"] if people[i]["gen"] is not None else 99)):
        p = people[pid]
        if not p["direct"]:
            continue
        if p["gen"] is None or p["gen"] <= 0:
            conf[pid] = 1.0
            continue
        kids = [k for k in down[pid] if people.get(k, {}).get("direct") and k in conf]
        conf[pid] = max((join_c(pid, k) * conf[k] for k in kids), default=1.0)

    def ancestors(pid):
        seen, stack = set(), list(up[pid])
        while stack:
            a = stack.pop()
            if a not in seen:
                seen.add(a)
                stack.extend(up[a])
        return seen

    return parents, up, down, conf, ancestors

def w(g, prm=P):
    return prm["decay"] ** max(g - 1, 0)

def runway_yield(year, region, factor=1.0, prm=P):
    horizon = RS.REGIONS.get(region, (1735, ""))[0]
    gens = (year - prm["parent_gap"] - horizon) / prm["parent_gap"]
    R = max(0.0, min(gens, prm["runway_cap"])) * factor
    q = prm["continuation"]
    return (1 - q ** (R + 1)) / (1 - q), R

def default_region(p):
    place = p["place"]
    for key, region in (("Norway", "norway"), ("Metz", "metz"), ("England", "england"),
                        ("Denmark", "denmark"), ("MA", "new_england"), ("CT", "new_england")):
        if key in place:
            return region
    return "pa_modern"

def score(people, edges, prm=P, noise=None):
    """noise: optional function p -> perturbed p, for the robustness check."""
    nz = noise or (lambda p_: p_)
    parents, up, down, conf, ancestors = build(people, edges)
    targets, problems = [], []

    for key, spec in RS.TARGETS.items():
        kind = spec.get("kind", "parents")
        if kind == "join":
            a, b = key.split(">")
            if (a, b) not in RS.JOINS:
                problems.append(f"join target {key} has no confidence in JOINS")
            if a not in people or b not in people:
                problems.append(f"join target {key} names someone not in the tree")
    for (a, b) in RS.JOINS:
        if b not in down[a]:
            problems.append(f"JOINS lists {a}>{b} but the tree has no such edge")

    # parents targets: every person missing a recorded parent
    for pid, p in people.items():
        known = len(parents[pid])
        if known >= 2 or p["gen"] is None:
            continue
        spec = RS.TARGETS.get(pid)
        m = 2 - known
        region = spec["region"] if spec else default_region(p)
        y, R = runway_yield(year_of(p), region, spec.get("runway", 1.0) if spec else 1.0, prm)
        base = m * w(p["gen"] + 1, prm) * y
        if p["direct"]:
            V = conf.get(pid, 1.0) * base
        else:
            V = prm["collateral"] * base
        sources = spec["sources"] if spec else [("__default", 0.3, 1.0, "uncurated: a standard record search")]
        sources = [(e, min(nz(p_), 0.95), r, note) for (e, p_, r, note) in sources]
        targets.append(dict(key=pid, kind="parents", person=p, gen=p["gen"] + 1, V=V, m=m, base=base,
                            region=(spec or {}).get("branch", region),
                            known=known, runway=R, direct=p["direct"], curated=bool(spec),
                            conf=conf.get(pid, 1.0), sources=sources))

    # chance left on each frontier, needed to value what is being built above a join
    def chance(sources):
        return 1 - math.prod(1 - s[1] * s[2] for s in sources) if sources else 0.0
    frontier = {t["key"]: t for t in targets}

    # join targets: the ancestors already resting on the join, plus the ancestors
    # we expect to find above it, all of whom inherit its uncertainty
    for (a, b), (c, why) in RS.JOINS.items():
        key = f"{a}>{b}"
        above = {a} | ancestors(a)
        mass = sum(w(people[x]["gen"], prm) for x in above if x in people and people[x]["gen"])
        hope = sum(frontier[x]["base"] * chance(frontier[x]["sources"]) for x in above if x in frontier)
        V = conf.get(b, 1.0) * (1 - c) * (mass + hope)
        spec = RS.TARGETS.get(key, {"sources": []})
        srcs = [(e, min(nz(p_), 0.95), r, note) for (e, p_, r, note) in spec["sources"]]
        targets.append(dict(key=key, kind="join", person=people[a], child=people[b], gen=people[a]["gen"],
                            region=spec.get("region", "pa_german"),
                            V=V, c=c, why=why, above=len(above), hope=hope, direct=True, curated=key in RS.TARGETS,
                            conf=conf.get(b, 1.0), sources=srcs))

    errands = dict(RS.ERRANDS)
    errands["__default"] = (1.5, "Standard record search (uncurated default)")
    for t in targets:
        prior = 1 - math.prod(1 - s[1] for s in t["sources"]) if t["sources"] else 0.0
        left = 1 - math.prod(1 - s[1] * s[2] for s in t["sources"]) if t["sources"] else 0.0
        t["P_prior"], t["P"] = prior, left
        total = sum(s[1] for s in t["sources"])
        t["spent"] = sum(s[1] * (1 - s[2]) for s in t["sources"])
        t["wall"] = t["spent"] / total if total > 0 else 0.0
        t["gain"] = t["V"] * left
        steps = []
        for (e, p_, r, note) in t["sources"]:
            if e not in errands:
                problems.append(f"{t['key']} cites unknown errand {e}")
                continue
            steps.append((t["V"] * p_ * r / errands[e][0], e, p_, r, note))
        steps.sort(reverse=True)
        t["steps"] = steps
        t["score"] = steps[0][0] if steps else 0.0

    agg = collections.defaultdict(lambda: dict(score=0.0, gain=0.0, serves=[]))
    for t in targets:
        for (s, e, p_, r, note) in t["steps"]:
            agg[e]["gain"] += t["V"] * p_ * r
            agg[e]["serves"].append((s, t))
    for e, v in agg.items():
        n = len(v["serves"])
        v["shared"] = e in RS.SHARED
        v["effort"] = errands[e][0] * (1 if v["shared"] else n)
        v["score"] = v["gain"] / v["effort"]
    return targets, agg, errands, conf, problems

# ---------------------------------------------------------------- robustness
def _ranks(values):
    order = sorted(range(len(values)), key=lambda i: -values[i])
    r = [0] * len(values)
    for pos, i in enumerate(order):
        r[i] = pos + 1
    return r

def spearman(a, b):
    ra, rb = _ranks(a), _ranks(b)
    n = len(a)
    return 1 - 6 * sum((x - y) ** 2 for x, y in zip(ra, rb)) / (n * (n * n - 1))

def direct_scores(targets):
    return {t["key"]: t["score"] for t in targets if t["direct"]}

def robustness(people, edges, draws=400, sigma=0.35, seed=20260918):
    """Two checks. (1) Vary the two structural parameters and compare the target
    ranking with the baseline. (2) Perturb every judged probability p by a
    lognormal factor (sigma 0.35, about +/-40%) and count how often each target
    stays in the top ten and each errand in the top five."""
    import random
    base_t, base_e = score(people, edges)[:2]
    base = direct_scores(base_t)
    keys = sorted(base)
    top10 = set(sorted(keys, key=lambda k: -base[k])[:10])
    grid = []
    for decay in (0.7, 0.85, 0.95):
        for q in (0.4, 0.55, 0.7):
            prm = dict(P, decay=decay, continuation=q)
            s = direct_scores(score(people, edges, prm)[0])
            alt10 = set(sorted(keys, key=lambda k: -s[k])[:10])
            grid.append((decay, q, spearman([base[k] for k in keys], [s[k] for k in keys]), len(top10 & alt10)))
    rng = random.Random(seed)
    in10 = collections.Counter()
    e_in5 = collections.Counter()
    for _ in range(draws):
        noise = lambda p_: p_ * math.exp(rng.gauss(0, sigma))
        tt, ag = score(people, edges, P, noise)[:2]
        s = direct_scores(tt)
        for k in sorted(keys, key=lambda k: -s[k])[:10]:
            in10[k] += 1
        for e in sorted((e for e in ag if e != "__default"), key=lambda e: -ag[e]["score"])[:5]:
            e_in5[e] += 1
    return grid, {k: in10[k] / draws for k in keys}, {e: e_in5[e] / draws for e in e_in5}, draws

# ---------------------------------------------------------------- report
def label(t):
    if t["kind"] == "join":
        return f"Prove {t['person']['short']} → {t['child']['short']}"
    who = t["person"]["short"]
    return f"Parents of {who}" if t["m"] == 2 else f"Other parent of {who}"

def completeness(people, conf):
    rows = []
    by = collections.defaultdict(list)
    for pid, p in people.items():
        if p["direct"] and p["gen"] and p["gen"] > 0:
            by[p["gen"]].append(pid)
    for g in sorted(by):
        n = len(by[g])
        cw = sum(conf.get(i, 1.0) for i in by[g])
        rows.append((g, 2 ** g, n, n / 2 ** g, cw / 2 ** g))
    return rows

def report(people, edges):
    targets, agg, errands, conf, problems = score(people, edges)
    grid, stable, estable, draws = robustness(people, edges)
    direct = [p for p in people.values() if p["direct"] and (p["gen"] or 0) > 0]
    slots = sum(t["m"] for t in targets if t["kind"] == "parents" and t["direct"])
    wrong = sum(1 - conf.get(p["id"], 1.0) for p in direct)
    L = []
    say = L.append
    today = datetime.date.today().isoformat()
    say("# Research priorities")
    say("")
    say(f"*Generated {today} by `tools/prioritize.py` from `index.html` and `tools/research_state.py`. "
        "Re-run it after any change to the tree or to the research log; edit the state file to record a new search.*")
    say("")
    direct_t = sorted([t for t in targets if t["direct"]], key=lambda t: -t["score"])
    top10 = direct_t[:10]
    untried = sum(1 for t in top10 if t["spent"] == 0)
    spent_total = sum(t["spent"] for t in direct_t) or 1.0
    deep = {"pa_german", "switzerland", "metz"}
    deep_spent = sum(t["spent"] for t in direct_t if t["region"] in deep) / spent_total
    gain_total = sum(t["gain"] for t in direct_t) or 1.0
    deep_gain = sum(t["gain"] for t in direct_t if t["region"] in deep) / gain_total
    best_e = max(((v["score"], e) for e, v in agg.items() if e != "__default"))[1]
    say("## Headline")
    say("")
    say(f"- **{untried} of the ten highest-priority targets have never been searched** — no search against them is "
        "recorded in RESEARCH.md. The cheapest gains in the tree are untouched.")
    say(f"- **{deep_spent:.0%} of the research effort spent so far** (measured as evidence consumed by searches that came "
        f"back empty) has gone to the Pennsylvania German and Metz branches, which now hold **{deep_gain:.0%} of the "
        "expected gain left**.")
    say(f"- **Best single errand:** {errands[best_e][1].replace(' -- ', ' — ')}.")
    say(f"- **Best single target:** {label(direct_t[0])} — {direct_t[0]['steps'][0][4].replace(' -- ', ' — ')}.")
    say("")
    say("## The tree at a glance")
    say("")
    say(f"- **{len(people)} people**, of whom **{len(direct)} are direct ancestors** of Chris.")
    say(f"- **{slots} parent-slots are open** on the direct line, spread across "
        f"**{sum(1 for t in targets if t['kind']=='parents' and t['direct'])} people**.")
    say(f"- **{len(RS.JOINS)} joins are carried as probable.** Summed over every direct ancestor, the tree currently holds "
        f"about **{wrong:.1f} ancestors in expectation that are not really ancestors** — the cost of those joins, "
        "and the case for proving them before building on top of them.")
    say("")
    say("Pedigree completeness by generation (a generation has 2^g slots). The last column discounts each ancestor "
        "by the confidence of the joins beneath them.")
    say("")
    say("| Gen | Slots | In tree | Complete | Confidence-weighted |")
    say("|---:|---:|---:|---:|---:|")
    for g, s, n, pc, cw in completeness(people, conf):
        say(f"| {g} | {s} | {n} | {pc:.0%} | {cw:.0%} |")
    say("")

    say("## What to do next — errands, ranked")
    say("")
    say("Ranked by **expected ancestor units per unit of effort**. An errand that is one sitting — a book, a film, a single run "
        "of volumes — is credited with every question it can answer at once. An errand that is really a separate search per "
        "person is charged once per person. Cost is effort: 0.5 = grep a file already on disk, 1 = a free indexed search, "
        "1.5 = a held subscription, 3 = a book or a paid site, 4 = a family history centre, 5 = a letter or a visit. "
        "**Top 5** is the share of the robustness draws in which the errand stays in the top five.")
    say("")
    say("| # | Errand | Sitting | Effort | Expected gain | Score | Top 5 | Serves |")
    say("|---:|---|---|---:|---:|---:|---:|---|")
    ranked = sorted(((v["score"], e, v) for e, v in agg.items() if e != "__default"), reverse=True)
    for i, (s, e, v) in enumerate(ranked[:15], 1):
        serves = "; ".join(label(t) for _, t in sorted(v["serves"], key=lambda x: -x[0])[:4])
        more = len(v["serves"]) - 4
        if more > 0:
            serves += f"; +{more} more"
        n = len(v["serves"])
        kind = "one" if v["shared"] else (f"{n} searches" if n > 1 else "1 search")
        say(f"| {i} | {errands[e][1]} | {kind} | {v['effort']:g} | {v['gain']:.3f} | **{s:.3f}** | {estable.get(e, 0):.0%} | {serves} |")
    say("")

    say("## Targets, ranked")
    say("")
    say("**Value** is in ancestor units (see *How the model works*). **Chance left** is the probability the listed sources "
        "still hold the answer; **wall** is the share of the evidence already spent on searches that came back empty.")
    say("")
    say("**Top 10** is the share of the robustness draws in which the target stays in the top ten.")
    say("")
    say("| # | Target | Gen | Value | Chance left | Wall | Best next step | Score | Top 10 |")
    say("|---:|---|---:|---:|---:|---:|---|---:|---:|")
    for i, t in enumerate(direct_t, 1):
        step = t["steps"][0] if t["steps"] else None
        nxt = f"{errands[step[1]][1].split(' (')[0].split(' --')[0]} — {step[4].replace(' -- ', ' — ')}" if step else "—"
        flag = "" if t["curated"] else " *(uncurated)*"
        say(f"| {i} | {label(t)}{flag} | {t['gen']} | {t['V']:.3f} | {t['P']:.0%} | {t['wall']:.0%} | {nxt} | {t['score']:.3f} | {stable[t['key']]:.0%} |")
    say("")

    say("## Walls — where the searching is done and the door is shut")
    say("")
    say("Targets where at least 40% of the evidence has been spent on searches that came back empty. The model already "
        "deprioritises these; they are listed so the reason is visible, and so the one door still open is named.")
    say("")
    walls = sorted([t for t in direct_t if t["wall"] >= 0.4], key=lambda t: -t["wall"])
    for t in walls:
        say(f"- **{label(t)}** — {t['wall']:.0%} of the evidence spent; **{t['P']:.0%} chance left**.")
        for e, p_, r, note in [s for s in t["sources"] if s[2] < 1.0]:
            say(f"  - spent: {errands[e][1].split(' (')[0].split(' --')[0]} — {note.replace(' -- ', ' — ')}")
        live = [s for s in t["sources"] if s[2] >= 1.0]
        if live:
            best = max(live, key=lambda s: s[1] / errands[s[0]][0])
            say(f"  - still open: {errands[best[0]][1].split(' (')[0].split(' --')[0]} — {best[3].replace(' -- ', ' — ')}")
        else:
            say("  - nothing untried is listed")
    say("")
    say("### Low odds by nature")
    say("")
    say("Not walls — nothing has been spent on these — but no listed source gives better than a one-in-five chance. "
        "They are where the records simply stop.")
    say("")
    low = [t for t in direct_t if t["wall"] < 0.4 and t["P"] < 0.2]
    say("; ".join(f"{label(t)} ({t['P']:.0%})" for t in sorted(low, key=lambda t: -t["P"])) + ".")
    say("")
    say("## Where the effort has gone, and where the value is")
    say("")
    say("Per branch of the tree: the value still open, the evidence already spent on searches that came back empty, and "
        "the gain still expected (value × chance left).")
    say("")
    say("| Branch | Open targets | Value open | Evidence spent | Expected gain left | Best score |")
    say("|---|---:|---:|---:|---:|---:|")
    br = collections.defaultdict(lambda: [0, 0.0, 0.0, 0.0, 0.0])
    for t in direct_t:
        b = RS.BRANCHES.get(t["region"], t["region"])
        row = br[b]
        row[0] += 1; row[1] += t["V"]; row[2] += t["spent"]; row[3] += t["gain"]; row[4] = max(row[4], t["score"])
    for b, (n, v, s, g, best) in sorted(br.items(), key=lambda x: -x[1][3]):
        say(f"| {b} | {n} | {v:.2f} | {s:.2f} | {g:.2f} | {best:.3f} |")
    say("")
    say("## How robust is this ranking?")
    say("")
    say("Two checks, because the probabilities are judgement. **Structural parameters**: the ranking of direct-line targets "
        "was recomputed under each combination below and compared with the baseline by Spearman's rank correlation and by "
        "how many of the baseline top ten survive.")
    say("")
    say("| decay | continuation | Spearman ρ | Top-10 kept |")
    say("|---:|---:|---:|---:|")
    for d, q, rho, kept in grid:
        mark = " (baseline)" if (d, q) == (P["decay"], P["continuation"]) else ""
        say(f"| {d} | {q}{mark} | {rho:.3f} | {kept}/10 |")
    say("")
    say(f"**Judged probabilities**: every p was multiplied by an independent lognormal factor (σ = 0.35, roughly ±40%) "
        f"over {draws} draws. The *Top 10* and *Top 5* columns above report the result. A target at 90% or more is in the "
        "top ten whatever reasonable view one takes of the odds; one near 50% sits on the boundary and depends on the judgement.")
    say("")
    say("## Leaves outside the direct line")
    say("")
    say(f"People not in Chris's direct line whose parents are missing. Their value is scaled by {P['collateral']:g}, since "
        "their parents extend a side branch rather than the pedigree; they are listed for completeness, not effort.")
    say("")
    coll = sorted([t for t in targets if not t["direct"]], key=lambda t: -t["V"])
    say(", ".join(f"{t['person']['short']} ({t['person']['b'] or '?'})" for t in coll) + ".")
    say("")

    say("## How the model works")
    say("")
    say(__doc__.split("The model, in brief")[1].split('"""')[0].strip("\n-").replace("\n", "\n    "))
    say("")
    say("Parameters: " + ", ".join(f"`{k}` = {v}" for k, v in P.items()) + ". The probabilities are judgement on a "
        "coarse scale set out at the top of `tools/research_state.py`; they are there to be argued with. Sources for "
        "one target are treated as independent, which overstates the chance left when two sources share a failure "
        "(a will that was never written is missing from every copy).")
    if problems:
        say("")
        say("### Data problems")
        for pr in problems:
            say(f"- {pr}")
    return "\n".join(L) + "\n", targets, ranked, errands, problems

def main():
    people, edges = load_tree(os.path.join(ROOT, "index.html"))
    text, targets, ranked, errands, problems = report(people, edges)
    if "--stdout" in sys.argv:
        print(text)
        return
    out = os.path.join(ROOT, "PRIORITIES.md")
    open(out, "w", encoding="utf-8").write(text)
    print(f"wrote {out}")
    print("\nTop errands:")
    for i, (s, e, v) in enumerate(ranked[:8], 1):
        print(f"  {i}. [{s:.3f}] {errands[e][1][:95]}")
    print("\nTop targets:")
    for i, t in enumerate(sorted([t for t in targets if t["direct"]], key=lambda t: -t["score"])[:12], 1):
        print(f"  {i:2}. [{t['score']:.3f}] {label(t):52s} V={t['V']:.3f} left={t['P']:.0%} wall={t['wall']:.0%}")
    if problems:
        print("\nData problems:", *problems, sep="\n  ")

if __name__ == "__main__":
    main()
