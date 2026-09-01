#!/usr/bin/env python3
"""
Update deck: White modal, word-by-word color cycling (robust), close button top-left.
"""

import json
from pathlib import Path

# ============== NEW CSS ==============
NEW_CSS = r"""
.content-root{width:100%;height:100%;padding:18px 20px;overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif}
.lesson-split{display:grid;grid-template-columns:48% 52%;height:100%;gap:18px}
.lesson-column{min-width:0;display:flex;flex-direction:column}
.column-heading{font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#E2571C;margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid #F5A623}
.words-grid{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-content:center;gap:10px;padding:8px}
.word-cell{min-height:62px;border:2px solid #dee2e6;border-radius:10px;background:#fff;font-size:22px;font-weight:800;color:#1a1a1a;cursor:pointer;transition:.12s;box-shadow:0 2px 5px rgba(0,0,0,.05)}
.word-cell:hover{border-color:#F5A623}
.word-cell.selected{background:#dc3545;border-color:#dc3545;color:#fff}
.sentences-list{display:flex;flex-direction:column;gap:8px;justify-content:center;flex:1}
.sentence-row{width:100%;text-align:left;padding:14px 16px;border:2px solid #dee2e6;border-radius:10px;background:#fff;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,.05)}
.sentence-row:hover{border-color:#F5A623;background:#fffaf1}
"""

# ============== NEW JS (robust color cycling) ==============
NEW_JS = r"""
const cells = root.querySelectorAll('.word-cell');
cells.forEach(cell => {
  cell.addEventListener('click', () => cell.classList.toggle('selected'));
});

// ---- Create overlay with inline styles ----
const overlay = document.createElement('div');
overlay.className = 'sentence-fullscreen';
overlay.style.cssText = `
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: #ffffff !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10 !important;
  padding: 60px !important;
  box-sizing: border-box !important;
  pointer-events: auto !important;
`;

// Close button
const closeBtn = document.createElement('button');
closeBtn.type = 'button';
closeBtn.setAttribute('aria-label', 'Close');
closeBtn.textContent = '×';
closeBtn.style.cssText = `
  position: absolute;
  left: 20px;
  top: 20px;
  width: 48px;
  height: 48px;
  border: 2px solid #333;
  border-radius: 50%;
  background: #fff;
  color: #333;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
`;

// Sentence text container
const textEl = document.createElement('div');
textEl.style.cssText = `
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 6vw, 80px);
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  color: #1a1a1a;
  max-width: 95%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 12px;
  pointer-events: auto;
`;

overlay.appendChild(closeBtn);
overlay.appendChild(textEl);

// Attach to page frame (or fallback to root)
const pageFrame = root.closest('.page-frame');
if (pageFrame) {
  pageFrame.appendChild(overlay);
} else {
  root.appendChild(overlay);
}

const close = () => {
  overlay.classList.remove('open');
  overlay.style.display = 'none';
  textEl.innerHTML = '';
};
closeBtn.addEventListener('click', close);
overlay.addEventListener('click', e => {
  if (e.target === overlay) close();
});

// ---- Robust color cycling: data-state tracks black->red->blue->black ----
const COLOR_STATES = ['black', 'red', 'blue'];
const COLOR_HEX = {
  black: '#1a1a1a',
  red: '#e63946',
  blue: '#1d6fd6'
};
function cycleColor(span) {
  let state = span.dataset.colorState || 'black';
  const idx = COLOR_STATES.indexOf(state);
  const next = COLOR_STATES[(idx + 1) % COLOR_STATES.length];
  span.dataset.colorState = next;
  span.style.color = COLOR_HEX[next];
}

root.querySelectorAll('.sentence-row').forEach(row => {
  row.addEventListener('click', () => {
    const words = row.textContent.trim().split(/\s+/).filter(Boolean);
    textEl.innerHTML = '';
    words.forEach(word => {
      const span = document.createElement('span');
      span.textContent = word;
      span.dataset.colorState = 'black';
      span.style.color = COLOR_HEX.black;
      span.style.cursor = 'pointer';
      span.style.padding = '4px 6px';
      span.style.borderRadius = '6px';
      span.style.transition = 'color 0.1s';
      span.style.userSelect = 'none';
      span.addEventListener('click', () => cycleColor(span));
      textEl.appendChild(span);
    });
    overlay.classList.add('open');
    overlay.style.display = 'flex';
  });
});

if (!window.__phonicsSentenceEscapeInstalled) {
  window.__phonicsSentenceEscapeInstalled = true;
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.sentence-fullscreen.open').forEach(o => {
        o.classList.remove('open');
        o.style.display = 'none';
        const t = o.querySelector('.sentence-modal-text');
        if (t) t.innerHTML = '';
      });
    }
  });
}
"""

def convert(input_path: str, output_path: str = None):
    input_path = Path(input_path)
    if output_path is None:
        output_path = input_path.with_name(input_path.stem + "_wordcolors_robust.json")
    else:
        output_path = Path(output_path)

    print(f"Loading: {input_path}")
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    pages = data.get("pages", [])
    print(f"Found {len(pages)} pages")

    for i, page in enumerate(pages, 1):
        page["css"] = NEW_CSS.strip()
        page["js"]  = NEW_JS.strip()
        print(f"  Updated page {i}: {page.get('name', page.get('id', '?'))}")

    print(f"\nSaving to: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("Done!")
    print("Color cycling now works: black → red → blue → black")

if __name__ == "__main__":
    # ---------- EDIT THESE TWO LINES ----------
    INPUT_FILE  = "Crystal12.json"               # your original file
    OUTPUT_FILE = "phonics_wordcolors_robust.json" # output file
    # ------------------------------------------

    convert(INPUT_FILE, OUTPUT_FILE)