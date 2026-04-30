import re

file_path = '/Users/vedang/PDFtoWebsite/.github/scripts/jobs-sync.mjs'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"(const BAMBOOHR_SLUGS = \[)(.*?)(\];)"
new_str = "\n  'zendesk',\n"
content = re.sub(pattern, r"\1" + new_str + r"\3", content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
