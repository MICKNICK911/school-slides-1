import json
import html

def unescape_json_strings(data):
    """Recursively traverses JSON data and unescapes all HTML entities in strings."""
    if isinstance(data, dict):
        return {k: unescape_json_strings(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [unescape_json_strings(item) for item in data]
    elif isinstance(data, str):
        # html.unescape() converts &bull; to •, &mdash; to —, etc.
        return html.unescape(data)
    else:
        return data

def fix_file(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Clean the JSON data
        cleaned_data = unescape_json_strings(data)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully cleaned {input_file} -> {output_file}")
        
    except Exception as e:
        print(f"Error processing {input_file}: {e}")

# Replace these with the actual filenames for your Year 5 and Year 6 JSON files
fix_file('grade5-fini-2.json', 'grade5_corrected.json')
fix_file('grade6-fini-2.json', 'grade6_corrected.json')