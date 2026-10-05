#!/usr/bin/env python3
"""
fix_index_of_sounds.py

Fixes the "Index of Sounds" page in the Crystal Phonics — Year 6 JSON file.

Problem:
    The page references in the Index of Sounds do not match the actual
    start pages of Units 1-13.

Fix:
    Set the start-page references for Units 1-13 to:
        5, 11, 17, 23, 31, 37, 43, 49, 57, 63, 69, 75, 83

Usage:
    python fix_index_of_sounds.py grade6_fix.json grade6.json
    python fix_index_of_sounds.py grade6_fix.json          # overwrite in place
"""

import json
import re
import sys
from pathlib import Path

# Actual start page for each unit
CORRECT_PAGES = {
    1: 5,
    2: 11,
    3: 17,
    4: 23,
    5: 31,
    6: 37,
    7: 43,
    8: 49,
    9: 57,
    10: 63,
    11: 69,
    12: 75,
    13: 83,
}

INDEX_PAGE_ID = "rh0100"

# Matches:  Unit 1 — Page 12    (em-dash, en-dash, or hyphen; spaces optional)
UNIT_PAGE_RE = re.compile(r"(Unit\s+(\d{1,2})\s*[—–-]\s*Page\s+)(\d+)")


def fix_html(html: str):
    """Rewrite every `Unit N — Page X` reference. Returns (new_html, changes)."""
    changes = []

    def repl(match: re.Match) -> str:
        prefix   = match.group(1)
        unit     = int(match.group(2))
        old_page = int(match.group(3))

        if unit not in CORRECT_PAGES:
            return match.group(0)          # leave unknown units alone

        new_page = CORRECT_PAGES[unit]
        if new_page != old_page:
            changes.append((unit, old_page, new_page))
        return f"{prefix}{new_page}"

    return UNIT_PAGE_RE.sub(repl, html), changes


def fix_json(data: dict):
    """Locate the Index of Sounds page and update it. Returns (data, log)."""
    log = []
    pages = data.get("pages")
    if not isinstance(pages, list):
        raise ValueError("JSON has no 'pages' list at the top level.")

    found = False
    for page in pages:
        if page.get("id") != INDEX_PAGE_ID:
            continue

        found = True
        old_html = page.get("html", "")
        if not old_html:
            log.append(f"[!] Page {INDEX_PAGE_ID} has no 'html' field.")
            break

        new_html, changes = fix_html(old_html)

        if not changes:
            log.append(f"[i] Page {INDEX_PAGE_ID} ({page.get('name','')}) "
                       "already has the correct page numbers.")
        else:
            log.append(f"[+] Page {INDEX_PAGE_ID} ({page.get('name','')}): "
                       f"updated {len(changes)} reference(s).")
            for unit, old, new in changes:
                log.append(f"      Unit {unit:>2}: {old:>3} -> {new}")

        page["html"] = new_html
        break

    if not found:
        log.append(f"[!] Could not find a page with id='{INDEX_PAGE_ID}'. "
                   "No changes made.")

    return data, log


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) >= 3 else src

    if not src.exists():
        print(f"[!] Input file not found: {src}")
        return 1

    with src.open("r", encoding="utf-8") as f:
        data = json.load(f)

    data, log = fix_json(data)

    with dst.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    for line in log:
        print(line)

    print(f"\n[✓] Wrote {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())