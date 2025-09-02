#!/usr/bin/env node
/*
  Guard: Prevent raw <q-dialog> usage outside the baseline.
  - Fails if '<q-dialog' appears in any file except 'src/components/base/BaseDialog.vue'.
  - Suggests: use BaseDialog instead.
*/
const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
}

try {
  // Check staged files (git) or whole repo fallback
  let files = [];
  try {
    const out = run('git diff --cached --name-only');
    files = out.split(/\r?\n/).filter(Boolean);
  } catch {}

  const targetFiles = files.length
    ? files
    : run('git ls-files').split(/\r?\n/).filter(Boolean);

  const offenders = [];
  for (const file of targetFiles) {
    if (!file.startsWith('src/') || !file.endsWith('.vue')) continue;
    if (file === 'src/components/base/BaseDialog.vue') continue;
    const content = run(`git show :${file} 2> NUL || type "${file}"`);
    if (content.includes('<q-dialog')) {
      offenders.push(file);
    }
  }

  if (offenders.length) {
    console.error('\nDialog Baseline Guard: Detected raw <q-dialog> usage.');
    console.error('Please use BaseDialog instead for consistent header/footer, sizing, and a11y.');
    console.error('Offending files:');
    offenders.forEach(f => console.error(' - ' + f));
    console.error('\nFix: import BaseDialog from \"src/components/base/BaseDialog.vue\" and replace the raw q-dialog.');
    process.exit(1);
  }
} catch (e) {
  // On guard failure, do not block commits unexpectedly
  process.exit(0);
}

