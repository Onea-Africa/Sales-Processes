import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dir, '..', 'public');
const SOURCE = join(PUBLIC, 'get-connected-profile.png');
const OUT = join(PUBLIC, 'icons');

mkdirSync(OUT, { recursive: true });

async function makeIcon(size) {
  const icon = await sharp(SOURCE)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  await sharp(icon).toFile(join(PUBLIC, `icon-${size}x${size}.png`));
  await sharp(icon).toFile(join(OUT, `icon-${size}x${size}.png`));

  console.log(`created icon-${size}x${size}.png`);
}

await makeIcon(192);
await makeIcon(512);

await sharp(SOURCE)
  .resize(180, 180, { fit: 'cover', position: 'center' })
  .png()
  .toFile(join(PUBLIC, 'apple-touch-icon.png'));

await sharp(SOURCE)
  .resize(64, 64, { fit: 'cover', position: 'center' })
  .png()
  .toFile(join(PUBLIC, 'favicon.png'));

await sharp(SOURCE)
  .resize(1200, 630, { fit: 'cover', position: 'center' })
  .png()
  .toFile(join(PUBLIC, 'og-image.png'));

console.log('icons generated in public/ and public/icons/');
