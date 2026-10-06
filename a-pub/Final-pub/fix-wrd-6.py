"""
fix_remaining.py

Fixes the two remaining issues left in grade6_fix2.corrected.json
after the initial round of corrections described in the CHIS memo
(5 October 2026).

Fix 1 — AK Unit 3 (Word Meaning):
    The Unit 3 answer key still lists "chorus" and "echo", which are
    neither in the Unit 3 Word Store nor answers to the Unit 3 meanings.
    They must be replaced with "camera" and "capital".

Fix 2 — AK Unit 13 (Word Meaning):
    The Unit 13 answer key still lists "obey" as the answer to
    "To measure how heavy something is". It must be replaced with
    "weigh" — the memo explicitly requires removing "obey" and
    substituting a genuine ei example.

Usage:
    python fix_remaining.py grade6_fix2.corrected.json

A backup is written to <filename>.bak before the file is overwritten.
"""

import json
import sys
import shutil
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def find_page(data, name_contains):
    for page in data.get("pages", []):
        if name_contains.lower() in page.get("name", "").lower():
            return page
    return None


def replace_in_html(page, old, new):
    """Replace old -> new inside a page's html field. Returns True if changed."""
    if not page:
        return False
    html = page.get("html", "")
    if old not in html:
        return False
    page["html"] = html.replace(old, new)
    return True


# ---------------------------------------------------------------------------
# Fixes
# ---------------------------------------------------------------------------

UNIT3_OLD = "1 mechanic, 2 architect, 3 chorus, 4 echo, 5 plaque, 6 antique"
UNIT3_NEW = "1 mechanic, 2 architect, 3 camera, 4 capital, 5 plaque, 6 antique"

UNIT13_OLD = "1 achieve, 2 relief, 3 reign, 4 obey, 5 species, 6 deceive"
UNIT13_NEW = "1 achieve, 2 relief, 3 reign, 4 weigh, 5 species, 6 deceive"


def apply_fixes(data):
    applied = []
    skipped = []

    # ---- Fix 1: AK Unit 3 ----
    ak_u3 = find_page(data, "AK — Word Meaning (1/2)")
    if ak_u3 is None:
        skipped.append("AK — Word Meaning (1/2) page not found")
    elif replace_in_html(ak_u3, UNIT3_OLD, UNIT3_NEW):
        applied.append("AK Unit 3: chorus/echo → camera/capital")
    else:
        # Maybe the page exists but the exact string differs (e.g. spacing).
        # Fall back to a looser replacement just in case.
        html = ak_u3.get("html", "")
        # try common variant with different spacing
        variants = [
            UNIT3_OLD,
            UNIT3_OLD.replace(", ", ","),
            UNIT3_OLD.replace(",", ", "),
        ]
        done = False
        for v in variants:
            if replace_in_html(ak_u3, v, UNIT3_NEW):
                applied.append("AK Unit 3: chorus/echo → camera/capital (variant)")
                done = True
                break
        if not done:
            skipped.append(
                "AK Unit 3: could not find the chorus/echo line to replace "
                "(maybe already fixed?)"
            )

    # ---- Fix 2: AK Unit 13 ----
    ak_u13 = find_page(data, "AK — Word Meaning (2/2)")
    if ak_u13 is None:
        skipped.append("AK — Word Meaning (2/2) page not found")
    elif replace_in_html(ak_u13, UNIT13_OLD, UNIT13_NEW):
        applied.append("AK Unit 13: obey → weigh")
    else:
        variants = [
            UNIT13_OLD,
            UNIT13_OLD.replace(", ", ","),
            UNIT13_OLD.replace(",", ", "),
        ]
        done = False
        for v in variants:
            if replace_in_html(ak_u13, v, UNIT13_NEW):
                applied.append("AK Unit 13: obey → weigh (variant)")
                done = True
                break
        if not done:
            skipped.append(
                "AK Unit 13: could not find the obey line to replace "
                "(maybe already fixed?)"
            )

    return applied, skipped


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"ERROR: file not found: {path}")
        sys.exit(2)

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    applied, skipped = apply_fixes(data)

    print("=" * 72)
    print("APPLYING REMAINING FIXES")
    print("=" * 72)

    if applied:
        print("\nApplied:")
        for a in applied:
            print(f"  [OK]   {a}")
    else:
        print("\nNothing applied.")

    if skipped:
        print("\nSkipped:")
        for s in skipped:
            print(f"  [--]   {s}")

    if not applied:
        print("\nNo changes written.")
        sys.exit(1)

    # Backup then write
    backup = path.with_suffix(path.suffix + ".bak")
    shutil.copy2(path, backup)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nBackup written to: {backup}")
    print(f"Updated file:      {path}")
    print("=" * 72)


if __name__ == "__main__":
    main()