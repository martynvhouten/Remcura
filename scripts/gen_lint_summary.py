import json, pathlib
report=json.load(open('docs/audit/lint-report.json'))
lines=['# ESLint Summary','', '- Generated: {}'.format(report['generatedAt']), '- Total issues: {}'.format(report['totalIssues']), '- Unique rules triggering: {}'.format(len(report['rules'])), '', '## Top Rules by Count']
for rule in report['rules'][:20]:
