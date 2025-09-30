import re
from collections import defaultdict
from pathlib import Path


def collect_entries(root: Path):
    pattern = re.compile(r"\$t\(")
    entries = []
    for path in root.rglob("*"):
        if path.suffix not in {".ts", ".tsx", ".vue"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for idx, line in enumerate(text.splitlines(), start=1):
            if pattern.search(line):
                entries.append((path.as_posix(), idx, line.strip()))
    return entries


def split_groups(entries):
    services, components, others = [], [], []
    for file, line, code in entries:
        lower = file.lower()
        record = {"file": file, "line": line, "code": code}
        if "/services/" in lower or lower.endswith("service.ts"):
            services.append(record)
        elif "/components/" in lower or file.endswith(".vue"):
            components.append(record)
        else:
            others.append(record)
    return services, components, others


def format_section(title, records):
    lines = [f"### {title}", ""]
    if not records:
        lines.append("_None_")
        return lines
    grouped = defaultdict(list)
    for record in records:
        grouped[record["file"]].append(record)
    for file in sorted(grouped):
        lines.append(f"- `{file}`")
        for item in grouped[file]:
            snippet = item["code"]
            if len(snippet) > 140:
                snippet = snippet[:137] + "..."
            lines.append(f"  - L{item['line']}: {snippet}")
    return lines


def main():
    root = Path("src")
    entries = collect_entries(root)
    services, components, others = split_groups(entries)

    sections = [
        "# $t( Usage Inventory",
        "",
        "## Summary",
        f"- Total occurrences: {len(entries)}",
        f"- Services: {len(services)}",
        f"- Components/Views: {len(components)}",
        f"- Other (stores/utilities/pages): {len(others)}",
        "",
    ]
    sections.extend(format_section("Services", services))
    sections.append("")
    sections.extend(format_section("Components & Pages", components))
    sections.append("")
    sections.extend(format_section("Other Locations", others))
    sections.append("")
    sections.append("## Notes")
    sections.append("- Distinguish backend error messages from UI copy before key refactors.")

    output = Path("docs/audit/i18n-usage.md")
    output.write_text("\n".join(sections) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
import re
