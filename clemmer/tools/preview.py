#!/usr/bin/env python3
"""Build a preview of the tree that renders with JavaScript switched off.

The page draws everything with script, and chat file viewers show HTML as a static
snapshot with scripts disabled, so sending index.html (even with its data inlined) shows
an empty tree. This lays the page out in headless Chrome, captures the finished DOM
(header, opening card, and the drawn tree as SVG), removes every script, and checks the
result by rendering it again with scripts disabled.

    python3 tools/preview.py OUTDIR

writes OUTDIR/clemmer-preview.html (the static page) and OUTDIR/clemmer-preview.png (a
screenshot of that page rendered with scripts off). Exits 1 if the snapshot does not hold
every person in data.js. Needs Google Chrome and node; D3 is fetched once from cdnjs and
cached in tools/.cache/.
"""
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
D3_URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"
LIVE_URL = "https://millet-family-tree.onrender.com/clemmer/"
W, H = 1400, 1000

# Runs once the page has laid itself out: give the tree a viewBox, so the captured drawing
# scales to whatever width the viewer has instead of being cropped to this window.
SNAP = """<script>
setTimeout(() => {
  const s = document.getElementById("svg");
  s.setAttribute("viewBox", `0 0 ${s.clientWidth} ${s.clientHeight}`);
  s.setAttribute("preserveAspectRatio", "xMidYMid meet");
  document.documentElement.dataset.snapshot = "done";
}, 1500);
</script>"""


def chrome(args, timeout=60, until=None):
    """Run headless Chrome in a throwaway profile; return its stdout.

    Headless Chrome often writes its screenshot and then fails to exit, so when `until`
    names a file, stop as soon as that file has been written."""
    prof = tempfile.mkdtemp(prefix="chrome-preview-")
    cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
           "--no-default-browser-check", f"--user-data-dir={prof}",
           f"--window-size={W},{H}"] + args
    outf = tempfile.TemporaryFile()
    p = subprocess.Popen(cmd, stdout=outf, stderr=subprocess.DEVNULL, start_new_session=True)
    end = time.time() + timeout
    while time.time() < end and p.poll() is None:
        if until and os.path.exists(until) and os.path.getsize(until) > 0:
            time.sleep(1)   # let the write finish
            break
        time.sleep(0.5)
    if p.poll() is None:
        try:
            os.killpg(p.pid, signal.SIGKILL)
        except OSError:
            p.kill()
        p.wait()
    # the profile path is unique to this run, so anything still holding it is ours
    subprocess.run(["pkill", "-f", prof], stderr=subprocess.DEVNULL)
    shutil.rmtree(prof, ignore_errors=True)
    outf.seek(0)
    return outf.read().decode("utf-8", "replace")


def d3_source():
    cache = os.path.join(ROOT, "tools", ".cache", "d3.min.js")
    if not os.path.exists(cache):
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with urllib.request.urlopen(D3_URL) as r, open(cache, "wb") as f:
            f.write(r.read())
    return open(cache, encoding="utf-8").read()


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out_dir = os.path.abspath(sys.argv[1])
    os.makedirs(out_dir, exist_ok=True)
    people = int(subprocess.check_output(
        ["node", "-e", "console.log(require('./data.js').P.length)"], cwd=ROOT).strip())

    # 1. A self-contained copy of the page, to lay out.
    html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    inline = {f'<script src="{D3_URL}"></script>': d3_source(),
              '<script src="data.js"></script>': open(os.path.join(ROOT, "data.js"), encoding="utf-8").read(),
              '<script src="land.js"></script>': open(os.path.join(ROOT, "land.js"), encoding="utf-8").read()}
    for tag, code in inline.items():
        if tag not in html:
            sys.exit(f"index.html no longer contains {tag}")
        html = html.replace(tag, "<script>\n" + code.replace("</script>", "<\\/script>") + "\n</script>")
    html = html.replace("</body>", SNAP + "\n</body>")
    work = tempfile.mkdtemp(prefix="clemmer-preview-")
    live = os.path.join(work, "live.html")
    open(live, "w", encoding="utf-8").write(html)

    # 2. Let it lay out, then capture the DOM it built.
    dom = chrome(["--virtual-time-budget=6000", "--dump-dom", "file://" + live], timeout=60)
    if 'data-snapshot="done"' not in dom:
        sys.exit("the page did not finish laying out in headless Chrome")

    # 3. Strip every script and point the reader at the live page.
    dom = re.sub(r"<script\b[^>]*>.*?</script>", "", dom, flags=re.S | re.I)
    dom = re.sub(r'<div class="hint" id="hintTree">.*?</div>',
                 f'<div class="hint" id="hintTree">A still picture of the tree. '
                 f'<a href="{LIVE_URL}">Open the live tree</a> to click people and see their records.</div>',
                 dom, flags=re.S)
    if not dom.lstrip().lower().startswith("<!doctype"):
        dom = "<!doctype html>\n" + dom
    page = os.path.join(out_dir, "clemmer-preview.html")
    open(page, "w", encoding="utf-8").write(dom)

    # 4. Check it the way a chat viewer shows it: scripts off.
    drawn = len(re.findall(r'<g class="node[ "]', dom))
    png = os.path.join(out_dir, "clemmer-preview.png")
    if os.path.exists(png):
        os.remove(png)
    # The page carries no scripts; the check copy also forbids them outright, so what is
    # photographed is exactly what a viewer with scripts switched off would show.
    check = os.path.join(work, "check.html")
    open(check, "w", encoding="utf-8").write(dom.replace(
        "<head>", '<head><meta http-equiv="Content-Security-Policy" content="script-src \'none\'">', 1))
    chrome([f"--screenshot={png}", "file://" + check], timeout=45, until=png)
    shutil.rmtree(work, ignore_errors=True)
    ok = drawn == people and os.path.exists(png) and os.path.getsize(png) > 20000
    print(f"{page}: {os.path.getsize(page)//1024} KB, {drawn} of {people} people drawn, no scripts")
    print(f"{png}: {'written' if os.path.exists(png) else 'MISSING'}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
