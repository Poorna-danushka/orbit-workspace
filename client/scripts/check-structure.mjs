import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const roots = ['src', 'tests', 'public'];
const invalidFileName = /(?:\.(?:bak|orig|old|tmp)|-copy\.[^.]+)$/i;
const failures = [];

async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  if (entries.length === 0) {
    failures.push(`Empty directory: ${directory}`);
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(entryPath);
      continue;
    }

    if (!entry.isFile()) continue;
    const fileStat = await stat(entryPath);
    if (fileStat.size === 0) failures.push(`Zero-byte file: ${entryPath}`);
    if (invalidFileName.test(entry.name)) failures.push(`Junk file: ${entryPath}`);
  }
}

for (const root of roots) {
  try {
    await visit(root);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      continue;
    }
    throw error;
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Structure check passed: src/, tests/, and public/ contain no empty directories, zero-byte files, or junk files.');
}
