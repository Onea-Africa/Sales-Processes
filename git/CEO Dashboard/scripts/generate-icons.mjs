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

// ── OG image 1200×630 ──────────────────────────────────────────────────────
const OG_W = 1200, OG_H = 630;
const ogLogoW = Math.round(OG_W * 0.55);
const ogLogoH = Math.round(OG_H * 0.55);
const ogLeft  = Math.round((OG_W - ogLogoW) / 2);
const ogTop   = Math.round((OG_H - ogLogoH) / 2);

const ogLogo = await sharp(LOGO)
  .resize(ogLogoW, ogLogoH, { fit: 'contain', background: BRAND_GREEN })
  .toBuffer();

await sharp({
  create: { width: OG_W, height: OG_H, channels: 4, background: BRAND_GREEN },
})
  .composite([{ input: ogLogo, top: ogTop, left: ogLeft }])
  .png()
  .toFile(join(__dir, '..', 'public', 'og-image.png'));

console.log('✓ og-image.png (1200×630)');
