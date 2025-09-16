#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const NL_FILE = path.join(SRC_DIR, 'i18n', 'nl', 'index.ts');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function scanUsageKeys() {
  const patterns = [
    `${SRC_DIR}/**/*.vue`,
    `${SRC_DIR}/**/*.ts`,
    `${SRC_DIR}/**/*.js`,
  ];
  const ignore = ['**/node_modules/**', '**/dist/**'];
  const files = patterns.flatMap(p => glob.sync(p, { ignore }));
  const keySet = new Set();

  const regexes = [
    /\$t\(\s*['"]([^'"\)]+)['"]/g, // $t('key')
    /(?<![\w$])t\(\s*['"]([^'"\)]+)['"]/g, // t('key') not preceded by word or $
    /i18n\.(?:global\.)?t\(\s*['"]([^'"\)]+)['"]/g, // i18n.global.t('key')
  ];
  const vTRegexes = [
    /v-t\s*=\s*"([^"]+)"/g,
    /v-t\s*=\s*'([^']+)'/g,
  ];

  files.forEach(file => {
    const content = readFile(file);
    regexes.forEach(re => {
      let m;
      while ((m = re.exec(content)) !== null) {
        if (m[1]) {
          const key = m[1].trim();
          // Ignore dynamic prefixes like 'admin.userManagement.'
          if (key.endsWith('.')) return;
          keySet.add(key);
        }
      }
    });
    vTRegexes.forEach(re => {
      let m;
      while ((m = re.exec(content)) !== null) {
        if (!m[1]) continue;
        const raw = m[1].trim();
        // v-t="'common.save'" or v-t="common.save"
        const inner = raw.replace(/^['"]|['"]$/g, '');
        if (inner && !/[{}()]/.test(inner)) {
          keySet.add(inner);
        }
      }
    });
  });
  return Array.from(keySet);
}

function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const k in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
    const value = obj[k];
    const full = prefix ? `${prefix}.${k}` : k;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function loadNlTranslations() {
  const content = readFile(NL_FILE);
  const match = content.match(/export default\s*({[\s\S]*});?\s*$/);
  if (!match) throw new Error('export default object not found in nl/index.ts');
  // eslint-disable-next-line no-eval
  return eval(`(${match[1]})`);
}

function main() {
  const usage = scanUsageKeys();
  const nl = loadNlTranslations();
  const existing = new Set(extractKeys(nl));
  const missing = usage.filter(k => !existing.has(k));

  const result = { usageCount: usage.length, existingCount: existing.size, missingCount: missing.length, missing };
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('i18n usage scan');
    console.log(`Keys used: ${usage.length}`);
    console.log(`Keys in nl: ${existing.size}`);
    console.log(`Missing: ${missing.length}`);
    if (missing.length) {
      console.log(missing.slice(0, 50).map(k => ` - ${k}`).join('\n'));
      if (missing.length > 50) console.log(`... and ${missing.length - 50} more`);
    }
  }
  process.exit(0);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Scan failed:', e.message);
    process.exit(1);
  }
}


