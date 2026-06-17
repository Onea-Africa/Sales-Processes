import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(repoRoot, 'dist-ready');
const targetDir = path.join(repoRoot, 'dist');

async function main() {
  await fs.mkdir(targetDir, { recursive: true });
  await fs.rm(path.join(targetDir, 'assets'), { recursive: true, force: true });
  await fs.cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
  console.log(`Synced ${sourceDir} into ${targetDir}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
