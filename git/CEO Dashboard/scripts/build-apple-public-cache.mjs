import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'public', 'api', 'data', 'apple-public-prices.json');

function readArg(name) {
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || '' : '';
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\u00a0/g, ' ')
    .replace(/Â/g, '')
    .trim();
}

function getTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i'));
  return decodeXml(match?.[1] || '');
}

function toNumber(value) {
  const numeric = String(value || '').replace(/[^0-9.\-]/g, '');
  return Number.isFinite(Number(numeric)) ? Number(numeric) : 0;
}

function stockStatus(available) {
  return available > 0 ? 'in_stock' : 'confirm_stock';
}

function itemKind(groupName, description) {
  const text = `${groupName} ${description}`.toLowerCase();
  return /(accessor|case|cover|adapter|cable|charger|keyboard|mouse|trackpad|pencil|airpods|earpods|band|watch|hub|dock|sleeve|tips|protector)/.test(text)
    ? 'accessory'
    : 'device';
}

const username = readArg('username') || process.env.ASBIS_USERNAME || '';
const password = readArg('password') || process.env.ASBIS_PASSWORD || '';

if (!username || !password) {
  console.error('Missing ASBIS credentials. Provide ASBIS_USERNAME and ASBIS_PASSWORD or pass --username and --password.');
  process.exit(1);
}

const feedUrl = new URL('https://services.it4profit.com/product/en/739/PriceAvail.xml');
feedUrl.searchParams.set('USERNAME', username);
feedUrl.searchParams.set('PASSWORD', password);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 90_000);

let raw;
try {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: 'application/xml,text/xml,*/*',
      'User-Agent': 'OneaAppleCacheBuilder/1.0',
    },
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`ASBIS feed returned HTTP ${response.status}`);
  }

  raw = await response.text();
} finally {
  clearTimeout(timeout);
}

const blocks = raw.match(/<PRICE>[\s\S]*?<\/PRICE>/gi) || [];
const bySku = new Map();
const fetchedAt = new Date().toISOString();

for (const block of blocks) {
  const vendor = getTag(block, 'VENDOR_NAME').toUpperCase();
  if (vendor !== 'APPLE') {
    continue;
  }

  const sku = getTag(block, 'WIC');
  const groupName = getTag(block, 'GROUP_NAME');
  const description = getTag(block, 'DESCRIPTION');
  const retailPrice = toNumber(getTag(block, 'RETAIL_PRICE'));
  const myPrice = toNumber(getTag(block, 'MY_PRICE'));
  const available = toNumber(getTag(block, 'AVAIL'));
  const displayPrice = retailPrice > 0 ? Math.round(retailPrice) : (myPrice > 0 ? Math.round(myPrice * 1.2) : 0);

  if (!sku || !description || displayPrice <= 0) {
    continue;
  }

  bySku.set(sku, {
    sku,
    model: groupName || description,
    description,
    displayPrice,
    stockStatus: stockStatus(available),
    itemKind: itemKind(groupName, description),
    availability: 'available',
    fetchedAt,
  });
}

const products = Array.from(bySku.values()).sort((a, b) => {
  if (a.stockStatus !== b.stockStatus) {
    return a.stockStatus === 'in_stock' ? -1 : 1;
  }
  return a.displayPrice - b.displayPrice;
});

const payload = {
  updatedAt: fetchedAt,
  products,
};

await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));

console.log(`Saved ${products.length} Apple products to ${outputPath}`);
