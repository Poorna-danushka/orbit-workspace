import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'coverage']);
const failures = [];

const isCommentOnly = (content) => {
  const meaningfulLines = content.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    return trimmed && !/^(?:\/\/|\/\*|\*|\*\/|<!--|-->)/.test(trimmed);
  });
  return meaningfulLines.length === 0;
};

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  if (entries.length === 0) failures.push(`empty directory: ${path.relative(root, directory)}`);

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) await walk(target);
      continue;
    }

    const details = await stat(target);
    const relative = path.relative(root, target);
    if (details.size === 0) {
      failures.push(`zero-byte file: ${relative}`);
      continue;
    }

    if (/\.(?:js|cjs|mjs)$/.test(entry.name)) {
      const contents = await readFile(target, 'utf8');
      if (isCommentOnly(contents)) failures.push(`comment-only source file: ${relative}`);
    }
  }
};

await walk(root);

if (failures.length > 0) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Backend structure check passed: no empty directories, zero-byte files, or comment-only JavaScript files.\n');
}
