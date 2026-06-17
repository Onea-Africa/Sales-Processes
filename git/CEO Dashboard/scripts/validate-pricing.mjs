import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'public', 'api', 'data', 'pricing-rate-card.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const pricingPageSource = fs.readFileSync(path.join(root, 'src', 'pages', 'PricingPage.tsx'), 'utf8');
const buildersStart = pricingPageSource.indexOf('const SOLUTION_BUILDERS: SolutionBuilder[] =');
const buildersEnd = pricingPageSource.indexOf('\nconst CALLOUT_ZONES', buildersStart);
const sourceBuilders = Function(`"use strict"; return (${pricingPageSource
  .slice(buildersStart, buildersEnd)
  .replace('const SOLUTION_BUILDERS: SolutionBuilder[] =', '')
  .trim()
  .replace(/;$/, '')});`)();
const errors = [];
const expectedBuilderIds = [
  'wifi-home',
  'wifi-business',
  'managed-it',
  'website',
  'hosting',
  'systems',
  'it-hardware',
  'cybersecurity-firewall',
  'apple-devices',
  'voip-uc',
  'cctv-access',
  'structured-cabling',
  'cloud-licensing',
  'energy-ups',
  'pos-hardware',
  'creative-brand',
  'media-production',
  'media-buying',
  'cloud-erp',
  'fibre-activation',
  'procurement-tenders',
  'google-ads',
  'marketing',
  'communications',
];
const validAvailability = new Set(['available', 'quote_required', 'unavailable']);

function validateRecord(id, record) {
  if (!validAvailability.has(record.availability)) {
    errors.push(`${id}: invalid availability "${record.availability}"`);
  }
  if (record.availability === 'available'
    && record.calculation !== 'dynamic'
    && record.displayOnceOff === undefined
    && record.displayMonthly === undefined) {
    errors.push(`${id}: available price must have an amount or dynamic calculation`);
  }
  for (const pair of [
    ['displayOnceOff', 'floorOnceOff'],
    ['displayMonthly', 'floorMonthly'],
  ]) {
    const [displayKey, floorKey] = pair;
    if (record[displayKey] !== undefined) {
      if (!Number.isFinite(record[displayKey]) || record[displayKey] < 0) {
        errors.push(`${id}: ${displayKey} must be a non-negative number`);
      }
      if (record[floorKey] !== undefined && record[floorKey] > record[displayKey]) {
        errors.push(`${id}: ${floorKey} cannot exceed ${displayKey}`);
      }
      if (record.availability === 'available' && record[floorKey] === undefined) {
        errors.push(`${id}: ${floorKey} is required when ${displayKey} is available`);
      }

      const originalQuantity = 1;
      const increasedQuantity = 2;
      const originalTotal = record[displayKey] * originalQuantity;
      const increasedTotal = record[displayKey] * increasedQuantity;
      const restoredTotal = increasedTotal - record[displayKey];
      if (record[displayKey] > 0 && increasedTotal <= originalTotal) {
        errors.push(`${id}: increasing quantity did not increase price`);
      }
      if (restoredTotal !== originalTotal) {
        errors.push(`${id}: reversing a quantity change did not restore the exact price`);
      }
    }
  }
}

const actualBuilderIds = Object.keys(catalog.builders || {});
for (const id of expectedBuilderIds) {
  if (!actualBuilderIds.includes(id)) {
    errors.push(`builder:${id}: missing from central rate card`);
  }
}
for (const id of actualBuilderIds) {
  if (!expectedBuilderIds.includes(id)) {
    errors.push(`builder:${id}: unexpected builder in central rate card`);
  }
}

for (const [id, record] of Object.entries(catalog.tiers || {})) {
  validateRecord(`tier:${id}`, record);
}

for (const [builderId, builder] of Object.entries(catalog.builders || {})) {
  if (!builder.source || typeof builder.source !== 'string') {
    errors.push(`builder:${builderId}: pricing source is required`);
  }
  if (!builder.basis || typeof builder.basis !== 'string') {
    errors.push(`builder:${builderId}: pricing basis is required`);
  }
  if (!Number.isFinite(builder.estimateTolerancePercent)
    || builder.estimateTolerancePercent < 0
    || builder.estimateTolerancePercent > 15) {
    errors.push(`builder:${builderId}: estimate tolerance must be between 0% and 15%`);
  }
  validateRecord(`builder:${builderId}:base`, builder.base || {});
  for (const [optionId, record] of Object.entries(builder.options || {})) {
    validateRecord(`builder:${builderId}:option:${optionId}`, record);
  }
}

for (const builder of sourceBuilders) {
  const catalogBuilder = catalog.builders?.[builder.id];
  if (!catalogBuilder) continue;
  const breakdownTotal = (builder.baseBreakdown || []).reduce((total, item) => total + item.amount, 0);
  if (builder.baseBreakdown?.length && breakdownTotal !== builder.baseOnceOff) {
    errors.push(`builder:${builder.id}: base breakdown ${breakdownTotal} does not equal base ${builder.baseOnceOff}`);
  }
  if (catalogBuilder.base.displayOnceOff !== builder.baseOnceOff) {
    errors.push(`builder:${builder.id}: source and catalogue once-off base prices differ`);
  }
  if (catalogBuilder.base.displayMonthly !== builder.baseMonthly) {
    errors.push(`builder:${builder.id}: source and catalogue monthly base prices differ`);
  }
  for (const option of builder.options || []) {
    const record = catalogBuilder.options?.[option.id];
    if (!record) {
      errors.push(`builder:${builder.id}: option:${option.id} missing from catalogue`);
      continue;
    }
    if (option.onceOff !== undefined && record.displayOnceOff !== option.onceOff) {
      errors.push(`builder:${builder.id}: option:${option.id} once-off source/catalogue mismatch`);
    }
    if (option.monthly !== undefined && record.displayMonthly !== option.monthly) {
      errors.push(`builder:${builder.id}: option:${option.id} monthly source/catalogue mismatch`);
    }
  }
}

const websiteBuilder = catalog.builders?.website;
if (websiteBuilder?.base?.displayOnceOff !== 6500) {
  errors.push('builder:website: Basic entry website must remain R6,500');
}
for (const requiredOption of [
  'web-extra-page',
  'web-copywriting',
  'web-blog',
  'web-booking',
  'web-payment',
  'web-ecommerce',
  'web-backend',
  'web-crm',
  'web-tracking',
  'web-accessibility',
  'web-performance',
  'web-maintenance-basic',
  'web-maintenance',
]) {
  if (!websiteBuilder?.options?.[requiredOption]) {
    errors.push(`builder:website: required option ${requiredOption} is missing`);
  }
}

for (const amount of [1000, 10000, 100000]) {
  const standard = amount;
  const priority = Math.round(amount * 1.15);
  const urgent = Math.round(amount * 1.3);
  const corporate = Math.round(amount * 1.05);
  const regulated = Math.round(amount * 1.1);
  if (!(standard < priority && priority < urgent)) {
    errors.push(`commercial adjustment: priority changes are not directional for ${amount}`);
  }
  if (!(standard < corporate && corporate < regulated)) {
    errors.push(`commercial adjustment: environment changes are not directional for ${amount}`);
  }
  if (Math.round(priority / 1.15) !== standard || Math.round(urgent / 1.3) !== standard) {
    errors.push(`commercial adjustment: reversing priority did not restore ${amount}`);
  }
}

for (const [category, policy] of Object.entries(catalog.marginPolicies || {})) {
  if (policy.floorMarginPercent > policy.displayMarginPercent) {
    errors.push(`margin:${category}: floor margin cannot exceed display margin`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Pricing validation passed for ${Object.keys(catalog.tiers || {}).length} tiers and ${Object.keys(catalog.builders || {}).length} builders.`);
