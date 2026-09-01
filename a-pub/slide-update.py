import json
import re
from pathlib import Path

# ---------- Step 1: Load source of truth (grade1.json & grade2.json) ----------
def load_lesson_word_lists(grade_file):
    with open(grade_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    lesson_words = {}
    for lesson in data['lessons']:
        lesson_id = lesson['id']
        words = set()
        for section in lesson['sections']:
            if section.get('type') == 'wordGrid' and 'words' in section:
                words.update(section['words'])
        lesson_words[lesson_id] = words
    return lesson_words

grade1_words = load_lesson_word_lists('grade1.json')
grade2_words = load_lesson_word_lists('grade2.json')

# ---------- Step 2: Helper to extract current words from a grid ----------
def extract_words_from_grid(html):
    grid_pattern = re.compile(r'<div class="words-grid">(.*?)</div>', re.DOTALL)
    match = grid_pattern.search(html)
    if not match:
        return [], match
    inner = match.group(1)
    button_pattern = re.compile(r'<button class="word-cell"[^>]*>([^<]+)</button>')
    words = button_pattern.findall(inner)
    return words, match

# ---------- Step 3: Process the target JSON ----------
target_file = 'phonics_wordcolors_robust.json'
with open(target_file, 'r', encoding='utf-8') as f:
    target_data = json.load(f)

updated_pages = []

for page in target_data['pages']:
    page_id = page['id']
    html = page['html']

    # Extract current grid words
    current_words, grid_match = extract_words_from_grid(html)
    if not current_words or not grid_match:
        # No grid found; leave unchanged
        updated_pages.append(page)
        continue

    current_set = set(current_words)

    # Determine which grade this page belongs to
    if page_id.startswith('grade_1_'):
        source_dict = grade1_words
    elif page_id.startswith('grade_2_'):
        source_dict = grade2_words
    else:
        updated_pages.append(page)
        continue

    # Find the lesson whose word set has the largest overlap with current_set
    best_lesson = None
    best_score = -1
    for lesson_id, word_set in source_dict.items():
        # Number of words from this page that appear in this lesson's official list
        score = len(current_set & word_set)
        # We want a perfect match (all current words are valid)
        # If multiple lessons contain all words, pick the one with the smallest size
        if score > best_score and score == len(current_set):
            best_score = score
            best_lesson = lesson_id
            # Break if we found a perfect match with the exact same size
            if score == len(current_set) and score == len(word_set):
                break

    if best_lesson is None:
        print(f"Warning: No matching lesson found for page {page_id}. Keeping original.")
        updated_pages.append(page)
        continue

    valid_words = source_dict[best_lesson]
    # Filter buttons
    prefix, inner, suffix = grid_match.group(0), grid_match.group(1), ''
    # Actually, let's rebuild the grid properly
    grid_full = grid_match.group(0)
    grid_open = '<div class="words-grid">'
    grid_close = '</div>'
    # Extract all buttons and keep only valid ones
    button_pattern = re.compile(r'<button class="word-cell"[^>]*>([^<]+)</button>')
    all_buttons = button_pattern.findall(inner)
    kept_words = [w for w in all_buttons if w in valid_words]

    # Rebuild the inner HTML of the grid
    new_buttons = []
    for word in kept_words:
        new_buttons.append(f'<button class="word-cell" type="button" data-word="{word}">{word}</button>')
    new_inner = ''.join(new_buttons)
    new_grid = grid_open + new_inner + grid_close

    # Replace in the full HTML
    new_html = html.replace(grid_full, new_grid)

    # Update page
    page['html'] = new_html
    updated_pages.append(page)

    print(f"Page {page_id} matched to lesson {best_lesson} – kept {len(kept_words)} of {len(current_words)} words")

# Update the pages list
target_data['pages'] = updated_pages

# ---------- Step 4: Save the cleaned JSON ----------
output_file = 'phonics_wordcolors_robust_cleaned.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(target_data, f, indent=2, ensure_ascii=False)

print(f"\nCleaned JSON saved to {output_file}")
print("All done!")