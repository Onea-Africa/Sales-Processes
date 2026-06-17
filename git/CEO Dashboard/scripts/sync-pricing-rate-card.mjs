import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pricingPagePath = path.join(root, 'src', 'pages', 'PricingPage.tsx');
const catalogPath = path.join(root, 'public', 'api', 'data', 'pricing-rate-card.json');
const source = fs.readFileSync(pricingPagePath, 'utf8');
const start = source.indexOf('const SOLUTION_BUILDERS: SolutionBuilder[] =');
const end = source.indexOf('\nconst CALLOUT_ZONES', start);

if (start < 0 || end < 0) {
  throw new Error('Could not locate SOLUTION_BUILDERS in PricingPage.tsx.');
}

const expression = source
  .slice(start, end)
  .replace('const SOLUTION_BUILDERS: SolutionBuilder[] =', '')
  .trim()
  .replace(/;$/, '');
const builders = Function(`"use strict"; return (${expression});`)();
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const policies = {
  'wifi-home': { floorRatio: 0.68, source: 'Onea installed WiFi market rate card', basis: 'installed_service', tolerance: 10 },
  'wifi-business': { floorRatio: 0.68, source: 'Onea enterprise WiFi market rate card', basis: 'installed_service', tolerance: 10 },
  'managed-it': { floorRatio: 0.64, source: 'Onea managed-services rate card', basis: 'service_rate_card', tolerance: 5 },
  website: { floorRatio: 0.62, source: 'Onea web and platform development rate card', basis: 'service_rate_card', tolerance: 5 },
  hosting: { floorRatio: 5 / 6, source: 'xneelo public VAT-inclusive pricing plus fixed 20% Onea markup', basis: 'managed_resale', tolerance: 5 },
  systems: { floorRatio: 0.62, source: 'Onea systems integration rate card', basis: 'service_rate_card', tolerance: 5 },
  'it-hardware': { floorRatio: 0.78, source: 'Onea procurement rate card plus current market hardware allowance', basis: 'market_anchor', tolerance: 12 },
  'cybersecurity-firewall': { floorRatio: 0.70, source: 'Onea cyber implementation rate card plus business firewall allowance', basis: 'market_anchor', tolerance: 10 },
  'apple-devices': { floorRatio: 0.70, source: 'Onea Apple procurement and deployment service rate card', basis: 'service_rate_card', tolerance: 5 },
  'voip-uc': { floorRatio: 0.72, source: 'Onea UC provisioning rate card plus current business hardware allowance', basis: 'market_anchor', tolerance: 10 },
  'cctv-access': { floorRatio: 0.72, source: 'Onea installed CCTV and access-control market rate card', basis: 'installed_service', tolerance: 10 },
  'structured-cabling': { floorRatio: 0.70, source: 'Onea installed Cat6 and cabinet market rate card', basis: 'installed_service', tolerance: 8 },
  'cloud-licensing': { floorRatio: 0.78, source: 'Microsoft public business pricing anchor plus Onea cloud administration', basis: 'market_anchor', tolerance: 8 },
  'energy-ups': { floorRatio: 0.75, source: 'Onea UPS procurement and installation market rate card', basis: 'market_anchor', tolerance: 12 },
  'pos-hardware': { floorRatio: 0.75, source: 'Onea POS procurement and setup market rate card', basis: 'market_anchor', tolerance: 12 },
  'creative-brand': { floorRatio: 0.65, source: 'Onea creative and brand services rate card', basis: 'service_rate_card', tolerance: 5 },
  'media-production': { floorRatio: 0.68, source: 'Onea production rate card benchmarked against Pretoria and Johannesburg packages', basis: 'service_rate_card', tolerance: 8 },
  'media-buying': { floorRatio: 0.65, source: 'Onea media planning and campaign management rate card; placement spend excluded', basis: 'service_rate_card', tolerance: 5 },
  'cloud-erp': { floorRatio: 0.62, source: 'Onea cloud, ERP and data consulting rate card', basis: 'service_rate_card', tolerance: 8 },
  'fibre-activation': { floorRatio: 0.60, source: 'Onea Openserve reseller activation and account-management rate card', basis: 'service_rate_card', tolerance: 5 },
  'procurement-tenders': { floorRatio: 0.65, source: 'Onea Level 1 B-BBEE procurement and tender administration rate card', basis: 'service_rate_card', tolerance: 5 },
  'google-ads': { floorRatio: 0.65, source: 'Onea certified Google Ads management rate card benchmarked against South African and global agency pricing', basis: 'service_rate_card', tolerance: 5 },
  marketing: { floorRatio: 0.65, source: 'Onea full-service digital marketing rate card', basis: 'service_rate_card', tolerance: 5 },
  communications: { floorRatio: 0.68, source: 'Onea communications and PR rate card', basis: 'service_rate_card', tolerance: 5 },
};

const tierAnchors = {
  'connectivity.basic': { displayMonthly: 2499, floorMonthly: 1499 },
  'connectivity.business': { displayMonthly: 6499, floorMonthly: 4499 },
  'it.support': { displayMonthly: 2999, floorMonthly: 1999 },
  'it.managed': { displayMonthly: 6250, floorMonthly: 4500 },
  'marketing.starter': { displayMonthly: 7500, floorMonthly: 5000 },
  'marketing.growth': { displayMonthly: 14500, floorMonthly: 9500 },
  'marketing.full': { displayMonthly: 28500, floorMonthly: 21000 },
  'pr.basic': { displayMonthly: 7500, floorMonthly: 5000 },
  'pr.standard': { displayMonthly: 16500, floorMonthly: 11000 },
  'pr.full': { displayMonthly: 29000, floorMonthly: 20000 },
};

const deliveryRoles = {
  'wifi-home': ['operations', 'networkEngineer', 'technician'],
  'wifi-business': ['clientStrategy', 'technologyArchitect', 'networkEngineer', 'technician'],
  'managed-it': ['operations', 'technologyArchitect', 'cloudInfrastructure', 'erpSupport'],
  website: ['clientStrategy', 'seniorDeveloper', 'creative'],
  hosting: ['operations', 'seniorDeveloper', 'officeAdmin'],
  systems: ['clientStrategy', 'technologyArchitect', 'seniorDeveloper', 'erpSupport'],
  'it-hardware': ['operations', 'cloudInfrastructure', 'officeAdmin', 'accounts'],
  'cybersecurity-firewall': ['technologyArchitect', 'cloudInfrastructure', 'networkEngineer'],
  'apple-devices': ['operations', 'cloudInfrastructure', 'officeAdmin'],
  'voip-uc': ['technologyArchitect', 'networkEngineer', 'technician'],
  'cctv-access': ['operations', 'networkEngineer', 'technician'],
  'structured-cabling': ['operations', 'networkEngineer', 'technician'],
  'cloud-licensing': ['cloudInfrastructure', 'officeAdmin', 'accounts'],
  'energy-ups': ['operations', 'networkEngineer', 'technician'],
  'pos-hardware': ['operations', 'erpSupport', 'technician'],
  'creative-brand': ['clientStrategy', 'creative', 'communications'],
  'media-production': ['clientStrategy', 'creative', 'operations'],
  'media-buying': ['clientStrategy', 'communications', 'accounts'],
  'cloud-erp': ['technologyArchitect', 'cloudInfrastructure', 'erpSupport', 'seniorDeveloper'],
  'fibre-activation': ['operations', 'officeAdmin', 'accounts'],
  'procurement-tenders': ['executiveStrategy', 'operations', 'officeAdmin', 'accounts'],
  'google-ads': ['clientStrategy', 'communications', 'seniorDeveloper', 'accounts'],
  marketing: ['clientStrategy', 'creative', 'communications', 'seniorDeveloper'],
  communications: ['clientStrategy', 'communications', 'creative'],
};

function floor(value, ratio) {
  return value === undefined ? undefined : Math.round(value * ratio);
}

function pricedRecord(onceOff, monthly, ratio, availability = 'available') {
  const record = { availability };
  if (onceOff !== undefined) {
    record.displayOnceOff = onceOff;
    record.floorOnceOff = floor(onceOff, ratio);
  }
  if (monthly !== undefined) {
    record.displayMonthly = monthly;
    record.floorMonthly = floor(monthly, ratio);
  }
  return record;
}

const preserved = catalog.builders || {};
catalog.builders = {};

for (const [tierId, tier] of Object.entries(catalog.tiers || {})) {
  tier.availability ||= 'available';
  Object.assign(tier, tierAnchors[tierId] || {});
}

for (const builder of builders) {
  const policy = policies[builder.id] || { floorRatio: 0.75, source: 'Onea internal rate card pending source confirmation' };
  const existing = preserved[builder.id] || {};
  const base = {
    ...(existing.base || {}),
    ...pricedRecord(
    builder.baseOnceOff,
    builder.baseMonthly,
    policy.floorRatio,
    policy.quoteRequired ? 'quote_required' : 'available',
    ),
  };

  const options = {};
  for (const option of builder.options || []) {
    const quoteRequired = policy.quoteRequired
      || (policy.quoteRequiredOptionIds || []).includes(option.id)
      || (option.onceOff === undefined && option.monthly === undefined && !option.dynamicPricing);
    const record = {
      ...(existing.options?.[option.id] || {}),
      ...pricedRecord(
      option.onceOff,
      option.monthly,
      policy.floorRatio,
      quoteRequired ? 'quote_required' : 'available',
      ),
    };
    if (option.dynamicPricing) {
      record.availability = 'available';
      record.calculation = 'dynamic';
    }
    options[option.id] = record;
  }

  catalog.builders[builder.id] = {
    source: policy.source,
    basis: policy.basis,
    estimateTolerancePercent: policy.tolerance,
    deliveryRoles: deliveryRoles[builder.id] || [],
    base,
    options,
  };
}

catalog.marginPolicies = {
  apple: { displayMarginPercent: 35, floorMarginPercent: 15 },
  hardware: { displayMarginPercent: 45, floorMarginPercent: 20 },
  networking: { displayMarginPercent: 50, floorMarginPercent: 22 },
  cctv: { displayMarginPercent: 50, floorMarginPercent: 22 },
  ups: { displayMarginPercent: 45, floorMarginPercent: 20 },
  pos: { displayMarginPercent: 45, floorMarginPercent: 20 },
  hosting: { displayMarginPercent: 20, floorMarginPercent: 20 },
  licensing: { displayMarginPercent: 30, floorMarginPercent: 12 },
};
catalog.marketResearch = {
  reviewedAt: new Date().toISOString().slice(0, 10),
  strategy: 'Maximum realistic market anchor with an internal negotiation floor',
  sources: [
    'Onea Africa Company Profile 2026 2.0',
    'Onea Pricing Strategy Addendum - Maximum-Anchor Pricing',
    'xneelo South Africa public hosting pricing',
    'Microsoft South Africa Microsoft 365 business pricing',
    'South African agency, web, video, CCTV and managed-service public pricing benchmarks',
  ],
};
catalog.internalDeliveryModel = {
  purpose: 'Protected delivery-rate floors used to test whether a service price can support the Onea team required to deliver it. These are not employee salary figures.',
  roles: {
    executiveStrategy: { label: 'Executive strategy and commercial oversight', displayHourly: 2500, floorHourly: 1400 },
    operations: { label: 'Operations and project management', displayHourly: 1450, floorHourly: 850 },
    clientStrategy: { label: 'Client and campaign strategy', displayHourly: 1650, floorHourly: 950 },
    technologyArchitect: { label: 'Technology architecture and CTO oversight', displayHourly: 2500, floorHourly: 1450 },
    seniorDeveloper: { label: 'Senior development and integration', displayHourly: 1850, floorHourly: 1100 },
    cloudInfrastructure: { label: 'Cloud and IT infrastructure', displayHourly: 1750, floorHourly: 1000 },
    networkEngineer: { label: 'Senior network engineering', displayHourly: 1850, floorHourly: 1050 },
    technician: { label: 'Technical installation', displayHourly: 750, floorHourly: 500 },
    erpSupport: { label: 'ERP, systems and repairs specialist', displayHourly: 1650, floorHourly: 950 },
    communications: { label: 'Communications, PR and editorial', displayHourly: 1450, floorHourly: 800 },
    creative: { label: 'Creative direction and design', displayHourly: 1350, floorHourly: 750 },
    officeAdmin: { label: 'Office and procurement administration', displayHourly: 750, floorHourly: 450 },
    accounts: { label: 'Accounts and commercial administration', displayHourly: 850, floorHourly: 500 },
  },
  commercialRules: {
    rushMultiplier: 1.3,
    afterHoursMultiplier: 1.5,
    publicSectorAdministrationMultiplier: 1.1,
    defaultServiceDepositPercent: 60,
    defaultHardwareDepositPercent: 80,
    quoteValidityDays: 7,
  },
};
catalog.version = new Date().toISOString().slice(0, 10);
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Synced ${builders.length} Solution Builder rate cards.`);
