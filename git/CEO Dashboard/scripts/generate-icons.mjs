import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const BRAND_GREEN = { r: 140, g: 196, b: 68, alpha: 1 };
const __dir = dirname(fileURLToPath(import.meta.url));
const LOGO = join(__dir, '..', 'public', 'logo.png');
const OUT  = join(__dir, '..', 'public', 'icons');

mkdirSync(OUT, { recursive: true });

async function makeIcon(size) {
  // Square green background, logo centred and padded to 70% of icon size
  const logoSize = Math.round(size * 0.70);
  const pad      = Math.round((size - logoSize) / 2);

  const logo = await sharp(LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: BRAND_GREEN })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_GREEN },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(join(OUT, `icon-${size}x${size}.png`));

  console.log(`✓ icon-${size}x${size}.png`);
}

await makeIcon(192);
await makeIcon(512);
console.log('Icons generated → public/icons/');
