import re
import sys
import os

BANNED_WORDS = [
    "utilize", "leverage", "robust", "delve", "navigate", "elevate", "unlock",
    "streamline", "facilitate", "foster", "empower", "holistic", "comprehensive",
    "innovative", "seamlessly", "pivotal", "crucial", "cutting-edge",
    "groundbreaking", "game-changing", "in today's fast-paced world",
    "at the end of the day", "highly motivated", "synergistic", "dynamic",
    "in today's fast-paced digital world", "in today's world", "look no further",
    "tap into"
]

def clean_jsx(text):
    # Remove imports
    text = re.sub(r'import\s+.*?;', '', text)
    # Remove JSX SVG wrappers and content
    text = re.sub(r'<svg.*?>.*?</svg>', '', text, flags=re.DOTALL)
    # Remove React component boilerplate
    text = re.sub(r'export\s+default\s+function\s+\w+\(\)\s*\{', '', text)
    text = re.sub(r'return\s*\(\s*<div.*?>', '', text)
    # Remove HTML tags (e.g., <p>, <h2>, <ul>, etc.)
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove JS curly braces content (e.g. className={h2})
    text = re.sub(r'\{[^\}]+\}', ' ', text)
    # Remove double braces or return statement trailing parts
    text = re.sub(r'\);\s*\}', '', text)
    return text

def check_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    cleaned = clean_jsx(content)
    
    # Calculate word count
    words = cleaned.split()
    word_count = len(words)
    
    # Check banned words
    found_banned = []
    content_lower = content.lower()
    for word in BANNED_WORDS:
        # Check as substring or phrase
        if word in content_lower:
            found_banned.append(word)
            
    # Check colons in prose
    # We want to find colons that are not inside HTML tags, import statements, or object keys
    # Let's search inside the cleaned prose for colons
    prose_colons = []
    lines = cleaned.split('\n')
    for line_num, line in enumerate(lines, 1):
        if ':' in line:
            # check if it's a URL or something similar
            # If it's a simple text colon, report it
            prose_colons.append((line_num, line.strip()))

    # Check dashes
    dashes = []
    for line_num, line in enumerate(content.split('\n'), 1):
        if '—' in line or '–' in line:
            dashes.append((line_num, line.strip()))

    print(f"--- Analysis for {os.path.basename(filepath)} ---")
    print(f"Word Count (prose only): {word_count}")
    if word_count < 1100:
        print("WARNING: Word count is below 1100 words!")
    else:
        print("Word count: OK")

    if found_banned:
        print(f"BANNED WORDS FOUND: {found_banned}")
    else:
        print("Banned words: NONE")

    if prose_colons:
        print(f"COLONS FOUND IN PROSE ({len(prose_colons)}):")
        for num, line in prose_colons[:10]:
            print(f"  Line {num}: {line}")
    else:
        print("Colons in prose: NONE")

    if dashes:
        print(f"EM/EN DASHES FOUND ({len(dashes)}):")
        for num, line in dashes[:10]:
            print(f"  Line {num}: {line}")
    else:
        print("Dashes: NONE")
    print("\n")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        check_file(sys.argv[1])
    else:
        print("Please provide a file path.")
