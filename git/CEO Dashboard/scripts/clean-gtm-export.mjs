import fs from 'node:fs/promises';
import path from 'node:path';

const sourcePath =
  process.argv[2] || 'C:/Users/neani/Downloads/GTM-K2KS9WK4_v5.json';
const outputPath =
  process.argv[3] || path.resolve('GTM-K2KS9WK4_onea-clean.json');

const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
const version = source.containerVersion;

const googleTag = version.tag.find(
  (tag) => tag.name === 'Google Tag G-2M1L1837RC',
);
const existingLeadTag = version.tag.find(
  (tag) =>
    tag.type === 'gaawe' &&
    tag.parameter?.some(
      (parameter) =>
        parameter.key === 'measurementIdOverride' &&
        parameter.value === 'G-2M1L1837RC',
    ),
);
const existingLeadTrigger = version.trigger.find(
  (trigger) => trigger.name === 'Lead Submit Trigger',
);

if (!googleTag || !existingLeadTag || !existingLeadTrigger) {
  throw new Error('The expected Onea Google tag or lead trigger is missing.');
}

const leadTag = structuredClone(existingLeadTag);
leadTag.name = 'GA4 - generate_lead';
leadTag.parameter = leadTag.parameter.map((parameter) =>
  parameter.key === 'eventName'
    ? { ...parameter, value: 'generate_lead' }
    : parameter,
);

const leadTrigger = structuredClone(existingLeadTrigger);
leadTrigger.name = 'Custom Event - generate_lead';
leadTrigger.customEventFilter = leadTrigger.customEventFilter.map((filter) => ({
  ...filter,
  parameter: filter.parameter.map((parameter) =>
    parameter.key === 'arg1'
      ? { ...parameter, value: 'generate_lead' }
      : parameter,
  ),
}));

const cleaned = {
  ...source,
  exportTime: new Date().toISOString().replace('T', ' ').replace('Z', ''),
  containerVersion: {
    ...version,
    name: 'Onea clean GA4 lead tracking',
    description:
      'Single Google tag plus one generate_lead event. Clarity and Meta remain consent-controlled in the website.',
    tag: [googleTag, leadTag],
    trigger: [leadTrigger],
    customTemplate: [],
  },
};

await fs.writeFile(outputPath, `${JSON.stringify(cleaned, null, 2)}\n`);
console.log(outputPath);
