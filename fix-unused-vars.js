// Quick script to list all unused var issues by file
const fs = require('fs');
const content = fs.readFileSync('unused-vars-list.txt', 'utf8');
const lines = content.split('\n').filter(l => l.trim());

const byFile = {};
for (const line of lines) {
  const match = line.match(/^([^:]+):(\d+):(\d+):/);
  if (match) {
    const file = match[1].replace(/.*Remcura\\/, '');
    const lineNum = match[2];
    const rest = line.substring(match[0].length);
    if (!byFile[file]) byFile[file] = [];
    byFile[file].push({ lineNum, issue: rest });
  }
}

// Print summary
for (const [file, issues] of Object.entries(byFile)) {
  console.log(`\n${file} (${issues.length} issues):`);
  issues.forEach(i =>
    console.log(`  Line ${i.lineNum}: ${i.issue.substring(0, 80)}`)
  );
}
