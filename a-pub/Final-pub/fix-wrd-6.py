#!/usr/bin/env python3
"""
fix-wrd-6.py

Applies the Year-6 corrections from
"Major Concerns in the CHIS Phonics Books" (5 October 2026):

  Item 1  — Unit 3: rebuild the c / ch / qu groups of the /k/ sound
  Item 2a — Unit 7: move "moisture" from the /ou/ group to the /oi/ group
  Item 2b — Unit 13: replace the non-ei word "obey" with "weigh"

Matching is quote-insensitive: smart quotes (' ' " ") and dashes (– —)
in the source are treated as their ASCII equivalents when locating
each fragment. The replacement is written verbatim.
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# PATCHES  —  page_id  ->  list of (old, new)
# ---------------------------------------------------------------------------

PATCHES: dict[str, list[tuple[str, str]]] = {

    # =====================================================================
    # Item 1 — Unit 3: rebuild c / ch / qu
    # =====================================================================

    "rh0018": [
        (
            '<div class="wl-grid"><div class="wl-cell"><span>character</span></div>'
            '<div class="wl-cell"><span>chaos</span></div>'
            '<div class="wl-cell"><span>echo</span></div>'
            '<div class="wl-cell"><span>school</span></div>'
            '<div class="wl-cell"><span>stomach</span></div>'
            '<div class="wl-cell"><span>chorus</span></div>'
            '<div class="wl-cell"><span>chemist</span></div>'
            '<div class="wl-cell"><span>technique</span></div>'
            '<div class="wl-cell"><span>ache</span></div>'
            '<div class="wl-cell"><span>architect</span></div>'
            '<div class="wl-cell"><span>mechanic</span></div>'
            '<div class="wl-cell"><span>chronic</span></div>'
            '<div class="wl-cell"><span>antique</span></div>'
            '<div class="wl-cell"><span>unique</span></div>'
            '<div class="wl-cell"><span>boutique</span></div>'
            '<div class="wl-cell"><span>plaque</span></div>'
            '<div class="wl-cell"><span>clique</span></div>'
            '<div class="wl-cell"><span>picturesque</span></div></div>',
            '<div class="wl-grid"><div class="wl-cell"><span>camera</span></div>'
            '<div class="wl-cell"><span>capital</span></div>'
            '<div class="wl-cell"><span>category</span></div>'
            '<div class="wl-cell"><span>combine</span></div>'
            '<div class="wl-cell"><span>crystal</span></div>'
            '<div class="wl-cell"><span>discuss</span></div>'
            '<div class="wl-cell"><span>character</span></div>'
            '<div class="wl-cell"><span>chaos</span></div>'
            '<div class="wl-cell"><span>chemist</span></div>'
            '<div class="wl-cell"><span>technique</span></div>'
            '<div class="wl-cell"><span>architect</span></div>'
            '<div class="wl-cell"><span>mechanic</span></div>'
            '<div class="wl-cell"><span>antique</span></div>'
            '<div class="wl-cell"><span>unique</span></div>'
            '<div class="wl-cell"><span>boutique</span></div>'
            '<div class="wl-cell"><span>plaque</span></div>'
            '<div class="wl-cell"><span>clique</span></div>'
            '<div class="wl-cell"><span>picturesque</span></div></div>',
        ),
        (
            '<div class="gx-k"><div class="gx-label">Key Ideas</div><ul class="wb-bullets">'
            '<li>The /k/ sound is often spelled <em>c</em> at the start or middle of a word '
            '(<em>character</em>, <em>chaos</em>, <em>school</em>, <em>echo</em>, '
            '<em>stomach</em>, <em>chorus</em>).</li>'
            '<li>In words from Greek, /k/ is spelled <em>ch</em>: <em>chemist</em>, '
            '<em>ache</em>, <em>architect</em>, <em>mechanic</em>, <em>chronic</em>, '
            '<em>technique</em>.</li>'
            '<li>In words from French, /k/ is spelled <em>qu</em>: <em>antique</em>, '
            '<em>unique</em>, <em>boutique</em>, <em>plaque</em>, <em>clique</em>, '
            '<em>picturesque</em>.</li></ul></div>',
            '<div class="gx-k"><div class="gx-label">Key Ideas</div><ul class="wb-bullets">'
            '<li>The /k/ sound is often spelled <em>c</em> at the start or middle of a word: '
            '<em>camera</em>, <em>capital</em>, <em>category</em>, <em>combine</em>, '
            '<em>crystal</em>, <em>discuss</em>.</li>'
            '<li>In words from Greek, /k/ is spelled <em>ch</em>: <em>character</em>, '
            '<em>chaos</em>, <em>chemist</em>, <em>technique</em>, <em>architect</em>, '
            '<em>mechanic</em>.</li>'
            '<li>In words from French, /k/ is spelled <em>qu</em>: <em>antique</em>, '
            '<em>unique</em>, <em>boutique</em>, <em>plaque</em>, <em>clique</em>, '
            '<em>picturesque</em>.</li>'
            '<li>Watch out for words with more than one /k/ spelling: <em>technique</em> '
            '(ch + qu) and <em>mechanic</em> (ch + c).</li></ul></div>',
        ),
        (
            '<div class="wb-chiplist ws-bank">'
            '<span class="wb-chip">chaos</span><span class="wb-chip">architect</span>'
            '<span class="wb-chip">echo</span><span class="wb-chip">mechanic</span>'
            '<span class="wb-chip">stomach</span><span class="wb-chip">school</span>'
            '<span class="wb-chip">boutique</span><span class="wb-chip">chorus</span>'
            '<span class="wb-chip">character</span><span class="wb-chip">chemist</span>'
            '<span class="wb-chip">antique</span><span class="wb-chip">ache</span>'
            '<span class="wb-chip">unique</span><span class="wb-chip">picturesque</span>'
            '<span class="wb-chip">clique</span><span class="wb-chip">technique</span>'
            '<span class="wb-chip">chronic</span><span class="wb-chip">plaque</span></div>',
            '<div class="wb-chiplist ws-bank">'
            '<span class="wb-chip">category</span><span class="wb-chip">plaque</span>'
            '<span class="wb-chip">chemist</span><span class="wb-chip">discuss</span>'
            '<span class="wb-chip">unique</span><span class="wb-chip">architect</span>'
            '<span class="wb-chip">camera</span><span class="wb-chip">clique</span>'
            '<span class="wb-chip">technique</span><span class="wb-chip">character</span>'
            '<span class="wb-chip">combine</span><span class="wb-chip">boutique</span>'
            '<span class="wb-chip">chaos</span><span class="wb-chip">crystal</span>'
            '<span class="wb-chip">mechanic</span><span class="wb-chip">antique</span>'
            '<span class="wb-chip">capital</span><span class="wb-chip">picturesque</span></div>',
        ),
    ],

    "rh0019": [
        (
            '<tr><td>A group of musicians playing together</td>'
            '<td>________________________</td></tr>',
            '<tr><td>A device used for taking photographs</td>'
            '<td>________________________</td></tr>',
        ),
        (
            '<tr><td>A repeating sound</td><td>________________________</td></tr>',
            "<tr><td>The city where a country's government is based</td>"
            '<td>________________________</td></tr>',
        ),
    ],

    # FIXED: full paragraph; matching is now quote-insensitive
    "rh0021": [
        (
            '<p class="gx-proofpara">Willowbrook is a picturesk little town, '
            'but last Saturday there was kaos in its main street. '
            'The school korus was singing beside the fountain, and their voices '
            'seemed to echo off every wall. A crowd gathered, and a mechanic and an '
            "architect stopped to watch. Suddenly, a boy with a terrible stomak ache "
            "fainted on the pavement. A man from the kemist's shop rushed to help him, "
            'using a simple tecnique he had learned years ago, and soon the boy was '
            'smiling again. Everyone showed real karacter that day. Later, the mayor '
            'fixed a shiny plaque to the door of the old boutik to thank them, and the '
            'whole town felt proud of its unique little community. The children cheered, '
            'and the choir sang once more as the sun set over the hills. Nobody in '
            'Willowbrook will forget that afternoon.</p>',
            '<p class="gx-proofpara">Willowbrook is a picturesk little town, '
            'but last Saturday there was kaos in its main street. A crowd gathered '
            'when a mechanic and an arkitect stopped to watch the new camera crew '
            'filming beside the fountain. A boy with a terrible stomach pain fainted '
            "on the pavement. A man from the kemist's shop rushed to help him, using "
            'a simple tecnique he had learned years ago, and soon the boy was smiling '
            'again. Everyone showed real karacter that day. Later, the mayor fixed a '
            'shiny plake to the door of the old boutik to thank them, and the whole '
            'town felt proud of its unique little community. The children cheered, and '
            'a choir sang once more as the sun set over the hills. Nobody in '
            'Willowbrook will forget that afternoon.</p>',
        ),
    ],

    "rh0022": [
        (
            '<div class="wb-chiplist">'
            '<div class="wb-chip">character</div><div class="wb-chip">chaos</div>'
            '<div class="wb-chip">echo</div><div class="wb-chip">school</div>'
            '<div class="wb-chip">stomach</div><div class="wb-chip">chorus</div>'
            '<div class="wb-chip">chemist</div><div class="wb-chip">technique</div>'
            '<div class="wb-chip">ache</div><div class="wb-chip">architect</div>'
            '<div class="wb-chip">mechanic</div><div class="wb-chip">chronic</div>'
            '<div class="wb-chip">antique</div><div class="wb-chip">unique</div>'
            '<div class="wb-chip">boutique</div><div class="wb-chip">plaque</div>'
            '<div class="wb-chip">clique</div><div class="wb-chip">picturesque</div></div>',
            '<div class="wb-chiplist">'
            '<div class="wb-chip">camera</div><div class="wb-chip">capital</div>'
            '<div class="wb-chip">category</div><div class="wb-chip">combine</div>'
            '<div class="wb-chip">crystal</div><div class="wb-chip">discuss</div>'
            '<div class="wb-chip">character</div><div class="wb-chip">chaos</div>'
            '<div class="wb-chip">chemist</div><div class="wb-chip">technique</div>'
            '<div class="wb-chip">architect</div><div class="wb-chip">mechanic</div>'
            '<div class="wb-chip">antique</div><div class="wb-chip">unique</div>'
            '<div class="wb-chip">boutique</div><div class="wb-chip">plaque</div>'
            '<div class="wb-chip">clique</div><div class="wb-chip">picturesque</div></div>',
        ),
    ],

    "rh0023": [
        (
            '<tr><td class="wb-word">character</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">chaos</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">echo</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">school</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">stomach</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">chorus</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">chemist</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">technique</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">ache</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">architect</td><td>________________</td><td>________________</td></tr>',
            '<tr><td class="wb-word">camera</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">capital</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">category</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">combine</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">crystal</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">discuss</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">character</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">chaos</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">chemist</td><td>________________</td><td>________________</td></tr>'
            '<tr><td class="wb-word">technique</td><td>________________</td><td>________________</td></tr>',
        ),
    ],

    # =====================================================================
    # Item 2a — Unit 7: moisture moves to /oi/
    # =====================================================================

    "rh0044": [
        (
            '<li>The /ou/ sound is spelled <em>ou</em> in: <em>account</em>, '
            '<em>amount</em>, <em>council</em>, <em>announce</em>, <em>moisture</em>. '
            'It is spelled <em>ow</em> in words such as <em>cow</em>, <em>now</em>, '
            '<em>allow</em>.</li>',
            '<li>The /ou/ sound is spelled <em>ou</em> in: <em>account</em>, '
            '<em>amount</em>, <em>council</em>, <em>announce</em>. '
            'It is spelled <em>ow</em> in words such as <em>cow</em>, <em>now</em>, '
            '<em>allow</em>.</li>',
        ),
        (
            '<tr><td class="ws-td" style="height:36px"><span class="ws-n">5.</span></td>'
            '<td class="ws-td" style="height:36px"><span class="ws-n">5.</span></td></tr>'
            '</table>',
            '<tr><td class="ws-td" style="height:36px"></td>'
            '<td class="ws-td" style="height:36px"><span class="ws-n">5.</span></td></tr>'
            '<tr><td class="ws-td" style="height:36px"></td>'
            '<td class="ws-td" style="height:36px"><span class="ws-n">6.</span></td></tr>'
            '</table>',
        ),
    ],

    # =====================================================================
    # Item 2b — Unit 13: obey -> weigh
    # =====================================================================

    "rh0084": [
        (
            '<div class="wl-cell"><span>reign</span></div>'
            '<div class="wl-cell"><span>obey</span></div></div>',
            '<div class="wl-cell"><span>reign</span></div>'
            '<div class="wl-cell"><span>weigh</span></div></div>',
        ),
        (
            '<div class="wb-chiplist ws-bank"><span class="wb-chip">obey</span>',
            '<div class="wb-chiplist ws-bank"><span class="wb-chip">weigh</span>',
        ),
    ],

    "rh0085": [
        (
            '<tr><td>To follow orders or rules</td><td>________________________</td></tr>',
            '<tr><td>To measure how heavy something is</td>'
            '<td>________________________</td></tr>',
        ),
    ],

    "rh0086": [
        (
            'He told Kojo to obey his own conscience above every shortcut,',
            'He told Kojo to weigh every choice against his own conscience,',
        ),
    ],

    "rh0087": [
        (
            'every family had to obey one simple rule',
            'every family had to follow one simple rule',
        ),
    ],

    "rh0088": [
        (
            '<div class="wb-chip">reign</div><div class="wb-chip">obey</div></div>',
            '<div class="wb-chip">reign</div><div class="wb-chip">weigh</div></div>',
        ),
    ],

    "rh0089": [
        (
            '<tr><td class="wb-word">obey</td><td>________________</td><td>________________</td></tr>',
            '<tr><td class="wb-word">weigh</td><td>________________</td><td>________________</td></tr>',
        ),
    ],

    # =====================================================================
    # Answer keys
    # =====================================================================

    "rh0092": [
        (
            '<p class="wb-para"><b>Unit 3 — The /k/ Sound</b><br>'
            'c: character, chaos, echo, school, stomach, chorus<br>'
            'ch: chemist, technique, ache, architect, mechanic, chronic<br>'
            'qu: antique, unique, boutique, plaque, clique, picturesque</p>',
            '<p class="wb-para"><b>Unit 3 — The /k/ Sound</b><br>'
            'c: camera, capital, category, combine, crystal, discuss<br>'
            'ch: character, chaos, chemist, technique, architect, mechanic<br>'
            'qu: antique, unique, boutique, plaque, clique, picturesque<br>'
            '<em>Note: technique (ch + qu) and mechanic (ch + c) each contain '
            'two /k/ spellings.</em></p>',
        ),
    ],

    "rh0093": [
        (
            '<p class="wb-para"><b>Unit 7 — The /ou/ and /oi/ Sounds</b><br>'
            '/ou/: account, amount, council, announce, moisture<br>'
            '/oi/: employ, appoint, destroy, enjoy, joyful</p>',
            '<p class="wb-para"><b>Unit 7 — The /ou/ and /oi/ Sounds</b><br>'
            '/ou/: account, amount, council, announce<br>'
            '/oi/: moisture, employ, appoint, destroy, enjoy, joyful</p>',
        ),
    ],

    "rh0095": [
        (
            '<p class="wb-para"><b>Unit 13 — The ie and ei Combination</b><br>'
            'ie: achieve, chief, relief, mischievous, species<br>'
            'ei: ceiling, receive, deceive, reign, obey</p>',
            '<p class="wb-para"><b>Unit 13 — The ie and ei Combination</b><br>'
            'ie: achieve, chief, relief, mischievous, species<br>'
            'ei: ceiling, receive, deceive, reign, weigh</p>',
        ),
        (
            'moisture (ou)',
            'moisture (oi)',
        ),
    ],

    "rh0098": [
        (
            '<p class="wb-para"><b>Unit 3</b><br>'
            'picturesque, chaos, chorus, stomach, chemist, technique, '
            'character, boutique</p>',
            '<p class="wb-para"><b>Unit 3</b><br>'
            'picturesque, chaos, architect, chemist, technique, '
            'character, plaque, boutique</p>',
        ),
    ],
}


# ---------------------------------------------------------------------------
# Quote-normalizing matcher
# ---------------------------------------------------------------------------

_TRANS = str.maketrans({
    "\u2018": "'",   # ' left single
    "\u2019": "'",   # ' right single
    "\u201c": '"',   # " left double
    "\u201d": '"',   # " right double
    "\u2013": "-",   # – en dash
    "\u2014": "-",   # — em dash
    "\u00a0": " ",   # non-breaking space
})


def _norm(s: str) -> str:
    """Fold smart quotes / dashes / nbsp to ASCII for matching."""
    return s.translate(_TRANS)


def find_and_replace(source: str, old: str, new: str) -> tuple[str, int]:
    """
    Return (new_source, occurrences).
    First tries an exact match. If that fails, retries on a
    quote-normalized copy (1:1 char mapping, so offsets line up).
    """
    n = source.count(old)
    if n == 1:
        return source.replace(old, new), 1
    if n > 1:
        return source, n

    # normalized fallback
    ns = _norm(source)
    no = _norm(old)
    n2 = ns.count(no)
    if n2 != 1:
        return source, n2

    i = ns.find(no)
    j = i + len(no)
    real_old = source[i:j]  # the actual source slice (has smart quotes)
    return source[:i] + new + source[j:], 1


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

def apply_patches(html: str, patches: list[tuple[str, str]], page_id: str) -> str:
    for idx, (old, new) in enumerate(patches, 1):
        html, n = find_and_replace(html, old, new)
        if n == 0:
            raise SystemExit(
                f"\n\u2717 {page_id}: patch #{idx} matched 0 times.\n"
                f"  Fragment (first 240 chars):\n    {old[:240]!r}\n"
                f"  \u2192 Source HTML differs from script expectations."
            )
        if n > 1:
            raise SystemExit(
                f"\n\u2717 {page_id}: patch #{idx} matched {n} times "
                f"(expected 1).\n  Fragment: {old[:240]!r}"
            )
    return html


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("grade6-fini-2.json")
    if not src.exists():
        raise SystemExit(f"\u2717 Input file not found: {src}")

    dst = src.with_name(f"{src.stem}.corrected{src.suffix}")
    bak = src.with_name(f"{src.stem}.backup{src.suffix}")

    shutil.copy2(src, bak)
    print(f"\u2713 Backup:  {bak}")

    data = json.loads(src.read_text(encoding="utf-8"))
    by_id = {p["id"]: p for p in data.get("pages", [])}

    missing = [pid for pid in PATCHES if pid not in by_id]
    if missing:
        raise SystemExit(f"\u2717 Page IDs not found in source: {missing}")

    total = 0
    for pid, patches in PATCHES.items():
        page = by_id[pid]
        page["html"] = apply_patches(page["html"], patches, pid)
        total += len(patches)
        print(f"\u2713 Patched {pid}  ({len(patches)} change"
              f"{'s' if len(patches) != 1 else ''})")

    dst.write_text(json.dumps(data, ensure_ascii=False, indent=2),
                   encoding="utf-8")
    print(f"\n\u2713 Wrote:   {dst}")
    print(f"  Pages patched: {len(PATCHES)}   Total edits: {total}")


if __name__ == "__main__":
    main()