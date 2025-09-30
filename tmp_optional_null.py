import re
from pathlib import Path
from collections import defaultdict

ROOT = Path('src')
TARGET_DOC = Path('docs/audit/optional-null-mismatches.md')

insert_pattern = re.compile(r"TablesInsert<'([^']+)'>")
update_pattern = re.compile(r"TablesUpdate<'([^']+)'>")


def collect_blocks(pattern: re.Pattern[str]):
    results = []
    for path in ROOT.rglob('*'):
        if path.suffix not in {'.ts', '.tsx', '.vue'}:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        matches = list(pattern.finditer(text))
        if not matches:
            continue
        lines = text.splitlines()
        for match in matches:
            line_idx = text[: match.start()].count('\n')
            block_lines = []
            brace_depth = 0
            started = False
            for idx in range(line_idx, len(lines)):
                line = lines[idx]
                if '{' in line:
                    brace_depth += line.count('{')
                    started = True
                if '}' in line:
                    brace_depth -= line.count('}')
                block_lines.append((idx + 1, line.strip()))
                if started and brace_depth <= 0:
                    break
            results.append((path, match.group(1), block_lines))
    return results


def find_mismatches(blocks):
    issues = []
    for path, table, block_lines in blocks:
        for line_no, code in block_lines:
            if 'undefined' in code:
                issues.append({
                    'file': path.as_posix(),
                    'line': line_no,
                    'table': table,
                    'code': code
                })
    return issues


insert_blocks = collect_blocks(insert_pattern)
update_blocks = collect_blocks(update_pattern)

insert_issues = find_mismatches(insert_blocks)
update_issues = find_mismatches(update_blocks)

sections = [
    '# Optional vs. Null Usage Check',
    '',
    'Scan looks for `undefined` assignments inside objects typed as `TablesInsert<T>` '
    'or `TablesUpdate<T>`, which may violate Supabase optional/null expectations.',
    '',
    f'- Insert payloads checked: {len(insert_blocks)}',
    f'- Update payloads checked: {len(update_blocks)}',
    f'- Insert issues flagged: {len(insert_issues)}',
    f'- Update issues flagged: {len(update_issues)}',
    '',
]


def format_issue_section(title, items):
    lines = [f'## {title}', '']
    if not items:
        lines.append('_No `undefined` assignments detected._')
        return lines
    grouped = defaultdict(list)
    for item in items:
        grouped[item['file']].append(item)
    for file in sorted(grouped):
        lines.append(f'- `{file}`')
        for entry in grouped[file]:
            snippet = entry['code']
            if len(snippet) > 160:
                snippet = snippet[:157] + '...'
            lines.append(
                f"  - L{entry['line']} · table `{entry['table']}` · {snippet}"
            )
    return lines


sections.extend(format_issue_section('TablesInsert Findings', insert_issues))
sections.append('')
sections.extend(format_issue_section('TablesUpdate Findings', update_issues))
sections.append('')
sections.append('## Notes')
sections.append('- Review each flagged line to ensure nullability matches Supabase schema. '
                'If the column allows nulls, prefer explicit `null` over `undefined`. ')

TARGET_DOC.write_text('\n'.join(sections) + '\n', encoding='utf-8')

