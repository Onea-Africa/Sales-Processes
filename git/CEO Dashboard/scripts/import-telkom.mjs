import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const workbookPath = path.resolve(process.cwd(), 'data', 'Onea_Africa_Telkom_Package_Catalogue.xlsx');
const outPath = path.resolve(process.cwd(), 'src', 'data', 'telkom-packages.ts');

if (!fs.existsSync(workbookPath)) {
  console.error('Excel file not found:', workbookPath);
  process.exit(2);
}

const wb = xlsx.readFile(workbookPath, { cellDates: true });
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

// Heuristics: detect column names
const nameKeys = ['Package', 'Package Name', 'Name', 'Product', 'Plan'];
const speedKeys = ['Speed', 'Mbps', 'Speed/Allowance', 'Allowance'];
const priceKeys = ['Price', 'R', 'Monthly', 'Price (R)'];
const fnoKeys = ['FNO', 'FNOs', 'Operator', 'Fibre Network Operator'];

function findKey(obj, candidates) {
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const found = keys.find(k => k.toLowerCase().trim() === c.toLowerCase().trim());
    if (found) return found;
  }
  return null;
}

const packages = rows.map(r => {
  const nameKey = findKey(r, nameKeys);
  const speedKey = findKey(r, speedKeys);
  const priceKey = findKey(r, priceKeys);
  const fnoKey = findKey(r, fnoKeys);

  const name = nameKey ? String(r[nameKey]).trim() : '';
  const speed = speedKey ? String(r[speedKey]).trim() : '';
  let priceRaw = priceKey ? String(r[priceKey]).trim() : '';
  // strip currency
  priceRaw = priceRaw.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const price = priceRaw === '' ? 0 : parseFloat(priceRaw) || 0;

  let fno = [];
  if (fnoKey && r[fnoKey]) {
    fno = String(r[fnoKey]).split(/[;,|/]+/).map(s => s.trim()).filter(Boolean);
  }

  return { name, speed: speed || (name.toLowerCase().includes('lte') ? 'LTE' : name.toLowerCase().includes('prepaid') ? 'Prepaid' : ''), price, fno };
}).filter(p => p.name);

const content = `/* Auto-generated from data/Onea_Africa_Telkom_Package_Catalogue.xlsx */\nexport const TELKOM_PACKAGES = ${JSON.stringify(packages, null, 2)} as const;\nexport default TELKOM_PACKAGES;\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote', outPath, 'with', packages.length, 'packages');
