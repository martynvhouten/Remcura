import re
from pathlib import Path

tables = set()
pattern = re.compile(r"Tables<\\'([^\\']+)\\'>")
for path in Path('src').rglob('*.ts'):
    text = path.read_text(encoding='utf-8', errors='ignore')
    tables.update(pattern.findall(text))

Path('tmp_tables.txt').write_text('\n'.join(sorted(tables)), encoding='utf-8')

