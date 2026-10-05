import json

# Load your deco4.json file
with open('deco4.json', 'r') as f:
    data = json.load(f)

# Iterate through all lessons
for lesson in data.get('lessons', []):
    # Check if page2 and comprehension exist
    if 'page2' in lesson and 'comprehension' in lesson['page2']:
        # Correction: Use "Answer the questions below" for open questions
        lesson['page2']['comprehension']['instruction'] = "Answer the questions below."
    
    # Check if page2 and sentenceWriting exist
    if 'page2' in lesson and 'sentenceWriting' in lesson['page2']:
        # Correction: Use "Write Your Own Sentence" wherever pupils must compose a sentence
        original_instruction = lesson['page2']['sentenceWriting'].get('instruction', '')
        # Prepend the new standard instruction
        lesson['page2']['sentenceWriting']['instruction'] = "Write Your Own Sentence. " + original_instruction

# Save the updated JSON back to a new file (or overwrite the original)
with open('deco4_corrected.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Corrections applied successfully to deco4.json!")