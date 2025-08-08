#!/usr/bin/env node
import { globby } from 'globby';
import fs from 'fs/promises';

const CONTROL_FILES_ALLOWLIST = ['src/css/_primitives.forms.scss'];

const PATTERNS = [
  /height:\s*(?:36|40|44|48|52)px\b/gi,
  /min-height:\s*(?:36|40|44|48|52)px\b/gi,
  /line-height:\s*\d+px\b/gi,
  /padding(?:-x|\b):\s*\d+px\b/gi,
  /padding-(?:top|bottom):\s*\d+px\b/gi,
];

const isControlContext = content =>
  /\.(?:q-field|q-input|q-select|form-control|dropdown-control)\b|\b(?:input|select|textarea)\b/.test(
    content
  );

async function main() {
  const files = await globby(['src/**/*.{scss,css,vue}'], {
    gitignore: true,
    expandDirectories: true,
  });

  let warnings = 0;
  for (const file of files) {
    if (CONTROL_FILES_ALLOWLIST.some(allow => file.endsWith(allow))) continue;
    const text = await fs.readFile(file, 'utf8');
    if (!isControlContext(text)) continue;

    PATTERNS.forEach(re => {
      let m;
      while ((m = re.exec(text)) !== null) {
        const idx = m.index;
        const before = text.lastIndexOf('\n', idx) + 1;
        const after = text.indexOf('\n', re.lastIndex);
        const line = text.slice(before, after === -1 ? undefined : after);
        const lineNum = text.slice(0, before).split('\n').length;
        console.warn(`[hardcoded-controls] ${file}:${lineNum}: ${line.trim()}`);
        warnings++;
      }
    });
  }

  if (warnings === 0) {
    console.log('No hard-coded control sizes found.');
  } else {
    console.log(
      `Found ${warnings} hard-coded control size occurrences (warn-only).`
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
