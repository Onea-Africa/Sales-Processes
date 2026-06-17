import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import TelkomPortal from '../components/telkom/TelkomPortal';
import OpenserveIspPortal from '../components/openserve/OpenserveIspPortal';
import { trackOneaEvent } from '../lib/marketing';
import { calculateCommercialAdjustment } from '../lib/pricingEngine';
import type { TalkToUsPrefill } from '../components/TalkToUsModal';

interface Props { onTalkToUs: (prefill?: TalkToUsPrefill) => void; }

const services = [
  {
    id: 'connectivity',
    label: 'Connectivity',
    icon: 'settings_ethernet',
    color: '#8CC444',
    description: 'Home and Business-grade WiFi, fibre, and network infrastructure.',
    tiers: [
      {
        name: 'Basic',
        tagline: 'Get your office connected',
        price: 'From R 2 499',
        priceId: 'connectivity.basic',
        highlight: false,
        features: [
          '10 Mbps Business WiFi',
          'Up to 10 users',
          '1 Access Point',
          'Basic Network Monitoring',
          'Email Support',
        ],
      },
      {
        name: 'Business',
        tagline: 'Managed connectivity for growing teams',
        price: 'From R 6 499',
        priceId: 'connectivity.business',
        highlight: true,
        features: [
          '100 Mbps Business WiFi',
          'Up to 50 users',
          '3 Access Points',
          'Managed Network (24×5)',
          'Smart CCTV (4 cameras)',
          'Monthly SLA Report',
          'Priority Support',
        ],
      },
      {
        name: 'Enterprise',
        tagline: 'Full infrastructure ownership',
        price: 'Custom',
        highlight: false,
        features: [
          '1 Gbps Dedicated Fibre',
          'Unlimited users',
          'Unlimited Access Points',
          '24×7 NOC Support',
          'Full CCTV Suite',
          'On-site Engineer',
          'Custom SLA',
        ],
      },
    ],
  },
  {
    id: 'it-services',
    label: 'IT Services',
    icon: 'computer',
    color: '#705d00',
    description: 'Helpdesk, managed IT, and full infrastructure solutions.',
    tiers: [
      {
        name: 'Support',
        tagline: 'On-call help when you need it',
        price: 'From R 2 999',
        priceId: 'it.support',
        highlight: false,
        features: [
          'Remote Helpdesk (8×5)',
          'Up to 5 devices',
          'Ticketing System',
          'Basic Antivirus & Patching',
          'Monthly Health Report',
        ],
      },
      {
        name: 'Managed',
        tagline: 'Proactive IT management',
        price: 'From R 6 250',
        priceId: 'it.managed',
        highlight: true,
        features: [
          'Remote & On-site Support (24×5)',
          'Up to 25 devices',
          'Proactive Monitoring',
          'Backup & Disaster Recovery',
          'Microsoft 365 Management',
          'Cybersecurity Baseline',
          'Dedicated Account Manager',
        ],
      },
      {
        name: 'Full Infrastructure',
        tagline: 'End-to-end IT ownership',
        price: 'Custom',
        highlight: false,
        features: [
          '24×7 Support & NOC',
          'Unlimited devices',
          'Server & Cloud Management',
          'Advanced Cybersecurity',
          'Business Continuity Planning',
          'On-site IT Team',
          'Custom SLA & Reporting',
        ],
      },
    ],
  },
  {
    id: 'digital-marketing',
    label: 'Digital Marketing',
    icon: 'campaign',
    color: '#9a3783',
    description: 'Social media, paid ads, content, and full-agency campaigns.',
    tiers: [
      {
        name: 'Starter',
        tagline: 'Build your online presence',
        price: 'From R 7 500',
        priceId: 'marketing.starter',
        highlight: false,
        features: [
          '2 Social Platforms',
          '8 Posts per month',
          'Basic Brand Kit',
          'Monthly Analytics Report',
          'Community Management',
        ],
      },
      {
        name: 'Growth',
        tagline: 'Scale reach and leads',
        price: 'From R 14 500',
        priceId: 'marketing.growth',
        highlight: true,
        features: [
          '4 Social Platforms',
          '16 Posts per month',
          'Paid Ad Management (client-supplied budget)',
          'Content Creation (graphics + copy)',
          'SEO Foundations',
          'Bi-weekly Reporting',
          'Dedicated Strategist',
        ],
      },
      {
        name: 'Full Agency',
        tagline: 'Your outsourced marketing team',
        price: 'From R 28 500',
        priceId: 'marketing.full',
        highlight: false,
        features: [
          'Priority Platforms',
          '30+ Posts per month',
          'Full PPC & SEO Management',
          '2 Short-form Videos per month',
          'Influencer Campaigns',
          'Weekly Strategy Calls',
          'Dedicated Account Director',
        ],
      },
    ],
  },
  {
    id: 'communications',
    label: 'Communications & PR',
    icon: 'record_voice_over',
    color: '#D6139F',
    description: 'Press releases, media outreach, reputation monitoring and full communications support.',
    tiers: [
      {
        name: 'Basic',
        tagline: 'Build a credible media presence',
        price: 'From R 7 500',
        priceId: 'pr.basic',
        highlight: false,
        features: [
          'Media monitoring',
          '1 press release per quarter',
          'Brand positioning guidance',
          'Quarterly communications review',
        ],
      },
      {
        name: 'Standard',
        tagline: 'Proactive monthly communications',
        price: 'From R 16 500',
        priceId: 'pr.standard',
        highlight: true,
        features: [
          'Monthly press release',
          'Proactive media outreach',
          'Reputation monitoring',
          'Monthly reporting',
          'Messaging and stakeholder support',
        ],
      },
      {
        name: 'Full Comms',
        tagline: 'Full reputation and campaign support',
        price: 'From R 29 000',
        priceId: 'pr.full',
        highlight: false,
        features: [
          'Everything in Standard',
          'Crisis communications readiness',
          'Multi-channel campaigns',
          'Executive messaging support',
          'Custom media and stakeholder programme',
        ],
      },
    ],
  },
];

const ISP_PROVIDERS = [
  {
    id: 'telkom',
    name: 'Telkom',
    tagline: 'Uncapped fibre, LTE & Uncapped LTE solutions via Telkom network',
    icon: 'signal_cellular_alt',
    color: '#00AEEF',
    accent: '#0092CF',
    logoSrc: '/isp/telkom-logo-trimmed.png',
    logoAlt: 'Telkom logo',
  },
  {
    id: 'openserve-isp',
    name: 'Openserve ISP',
    tagline: 'Uncapped Openserve fibre packages from 20/10 Mbps to 500/250 Mbps',
    icon: 'router',
    color: '#00A651',
    accent: '#147A4A',
    logoSrc: '/isp/openserve-logo-trimmed.png',
    logoAlt: 'Openserve logo',
  },
];

type BuilderOption = {
  id: string;
  label: string;
  onceOff?: number;
  monthly?: number;
  floorOnceOff?: number;
  floorMonthly?: number;
  dynamicPricing?: boolean;
  quantity?: boolean;
  quantityLabel?: string;
};

type BaseBreakdownItem = {
  label: string;
  amount: number;
};

type OptionLineItem = {
  id: string;
  label: string;
  quantity: number;
  onceOff: number;
  monthly: number;
  floorOnceOff?: number;
  floorMonthly?: number;
};

type SolutionBuilder = {
  id: string;
  label: string;
  icon: string;
  description: string;
  internalOnly?: boolean;
  baseOnceOff: number;
  baseMonthly: number;
  baseFloorOnceOff?: number;
  baseFloorMonthly?: number;
  pricingSource?: string;
  estimateTolerancePercent?: number;
  monthlyDescription?: string;
  baseBreakdown: BaseBreakdownItem[];
  includes: string[];
  options: BuilderOption[];
};

type CatalogPriceRecord = {
  displayOnceOff?: number;
  displayMonthly?: number;
  floorOnceOff?: number;
  floorMonthly?: number;
  availability?: 'available' | 'quote_required' | 'unavailable';
  calculation?: 'dynamic';
};

type PricingCatalog = {
  version: string;
  internal: boolean;
  tiers?: Record<string, CatalogPriceRecord>;
  builders: Record<string, {
    source?: string;
    basis?: string;
    estimateTolerancePercent?: number;
    base?: CatalogPriceRecord;
    options?: Record<string, CatalogPriceRecord>;
  }>;
};

const ACCESS_POINT_QUALITY = [
  {
    id: 'cudy-home-wifi6',
    label: 'Cudy home mesh WiFi 6',
    agentLabel: 'Cudy Dual Band WiFi 6 3000Mbps Multi-Gigabit Mesh Router',
    supplier: 'Scoop',
    sku: 'CD-M30001',
    environment: 'indoor',
    sellingPrice: 990,
  },
  {
    id: 'huawei-ekit-wifi6',
    label: 'Huawei eKit business WiFi 6',
    agentLabel: 'Huawei eKit AP361 Wi-Fi 6 Indoor Access Point',
    supplier: 'Huawei eKit PriceList 2 Mar 2026',
    sku: '50086871 / AP361',
    environment: 'indoor',
    sellingPrice: 1890,
  },
  {
    id: 'reyee-business-wifi6',
    label: 'Reyee business WiFi 6',
    agentLabel: 'Reyee RG-RAP2266GX Business WiFi 6 Access Point',
    supplier: 'Scoop',
    sku: 'RG-RAP2266GX',
    environment: 'indoor',
    sellingPrice: 2490,
  },
  {
    id: 'huawei-ekit-wifi7',
    label: 'Huawei eKit WiFi 7 indoor',
    agentLabel: 'Huawei eKit AP371 Wi-Fi 7 Indoor Access Point',
    supplier: 'Huawei eKit PriceList 2 Mar 2026',
    sku: '50087399-001 / AP371',
    environment: 'indoor',
    sellingPrice: 2990,
  },
  {
    id: 'ubiquiti-unifi-wifi7-lite',
    label: 'Ubiquiti UniFi WiFi 7 Lite',
    agentLabel: 'Ubiquiti UniFi U7 Lite WiFi 7 Access Point',
    supplier: 'Scoop',
    sku: 'U7-LITE',
    environment: 'indoor',
    sellingPrice: 3490,
  },
  {
    id: 'ubiquiti-unifi-wifi7-pro',
    label: 'Ubiquiti UniFi WiFi 7 Pro',
    agentLabel: 'Ubiquiti UniFi U7 Pro WiFi 7 Access Point',
    supplier: 'Scoop',
    sku: 'U7-PRO',
    environment: 'indoor',
    sellingPrice: 5990,
  },
  {
    id: 'cudy-outdoor-wifi6',
    label: 'Cudy outdoor WiFi 6',
    agentLabel: 'Cudy Dual Band WiFi 6 3000Mbps Outdoor Access Point',
    supplier: 'Scoop',
    sku: 'CD-AP3000O',
    environment: 'outdoor',
    sellingPrice: 2290,
  },
  {
    id: 'reyee-outdoor-wifi6',
    label: 'Reyee outdoor WiFi 6',
    agentLabel: 'Reyee RG-RAP62X Outdoor WiFi 6 Access Point',
    supplier: 'Scoop',
    sku: 'RG-RAP62X',
    environment: 'outdoor',
    sellingPrice: 2890,
  },
  {
    id: 'huawei-ekit-outdoor-wifi6',
    label: 'Huawei eKit outdoor WiFi 6',
    agentLabel: 'Huawei eKit AP761 Wi-Fi 6 Outdoor Access Point',
    supplier: 'Huawei eKit PriceList 2 Mar 2026',
    sku: '02355VFB / AP761',
    environment: 'outdoor',
    sellingPrice: 5990,
  },
  {
    id: 'ubiquiti-unifi-outdoor-wifi7',
    label: 'Ubiquiti UniFi outdoor WiFi 7',
    agentLabel: 'Ubiquiti UniFi U7 Outdoor WiFi 7 Access Point',
    supplier: 'Scoop',
    sku: 'U7-OUT',
    environment: 'outdoor',
    sellingPrice: 6490,
  },
];

const CABLING_RATES = {
  indoor: {
    label: 'Indoor CAT6 solid copper cabling',
    sku: 'CAT6-100-SC',
    fixedLinkPrice: 1850,
    includedMetresPerLink: 30,
    clientRatePerMetre: 28,
    labourRatePerMetre: 0,
  },
  outdoor: {
    label: 'Outdoor UV CAT6 solid copper cabling',
    sku: 'CAT6U-100-SC',
    fixedLinkPrice: 2250,
    includedMetresPerLink: 30,
    clientRatePerMetre: 48,
    labourRatePerMetre: 0,
  },
};

const TECHNICIAN_RATES = [
  { role: 'Junior Technician', range: 'R550 - R750/hour', estimate: 650 },
  { role: 'Mid-Level Technician', range: 'R850 - R1,250/hour', estimate: 1050 },
  { role: 'Senior Network Engineer', range: 'R1,450 - R2,500/hour', estimate: 1850 },
];

const COMPLEXITY_LEVELS = [
  {
    id: 'low',
    label: 'Low Complexity',
    description: 'Simple setup, no major cabling, existing power/network points.',
    multiplier: 1,
  },
  {
    id: 'medium',
    label: 'Medium Complexity',
    description: 'Multiple devices, moderate cabling, some drilling/trunking.',
    multiplier: 1.3,
  },
  {
    id: 'high',
    label: 'High Complexity',
    description: 'Multiple floors, outdoor APs, roof work, rack/switch setup, VLANs.',
    multiplier: 1.7,
  },
  {
    id: 'enterprise',
    label: 'Enterprise Complexity',
    description: 'Multi-site, warehouse/campus, advanced design, SLA, firewall, monitoring.',
    multiplier: 2.5,
  },
];

const LABOUR_PACKAGES = {
  'wifi-home': {
    low: { label: 'Basic Install', min: 650, max: 1500, estimate: 1100, duration: '1-3 hours', hours: 2 },
    medium: { label: 'Standard Home Install', min: 1500, max: 3500, estimate: 2500, duration: '3-6 hours', hours: 5 },
    high: { label: 'Advanced Home Install', min: 3500, max: 8500, estimate: 6000, duration: '1-2 days', hours: 12 },
    enterprise: { label: 'Advanced Home Install', min: 3500, max: 8500, estimate: 8500, duration: '1-2 days', hours: 16 },
  },
  'wifi-business': {
    low: { label: 'Small Office Install', min: 4500, max: 12000, estimate: 8500, duration: '1-2 days', hours: 14 },
    medium: { label: 'Medium Business Install', min: 12000, max: 35000, estimate: 22000, duration: '2-5 days', hours: 32 },
    high: { label: 'Enterprise Install', min: 35000, max: 150000, estimate: 65000, duration: '1-4 weeks', hours: 80 },
    enterprise: { label: 'Enterprise Install', min: 35000, max: 150000, estimate: 150000, duration: 'Custom / 1-4+ weeks', hours: 160 },
  },
} as const;

const XNEELO_MARKUP_RATE = 0.2;
const XNEELO_VAT_RATE = 0.15;
const xneeloSellingPriceExVat = (supplierPriceInclVat: number) =>
  Number(((supplierPriceInclVat / (1 + XNEELO_VAT_RATE)) * (1 + XNEELO_MARKUP_RATE)).toFixed(2));

const HOSTING_PRODUCTS = [
  { id: 'basic', label: 'Managed Basic Hosting', supplierMonthlyInclVat: 99 },
  { id: 'standard', label: 'Managed Standard Hosting', supplierMonthlyInclVat: 149 },
  { id: 'advanced', label: 'Managed Advanced Hosting', supplierMonthlyInclVat: 279 },
  { id: 'master', label: 'Managed Master Hosting', supplierMonthlyInclVat: 439 },
].map(product => ({
  ...product,
  sellingMonthly: xneeloSellingPriceExVat(product.supplierMonthlyInclVat),
}));

const XNEELO_DOMAIN_PRODUCTS = [
  { extension: '.co.za', registrationInclVat: 105, renewalInclVat: 105, freeTransfer: true },
  { extension: '.com', registrationInclVat: 279, renewalInclVat: 289 },
  { extension: '.org.za', registrationInclVat: 105, renewalInclVat: 105, freeTransfer: true },
  { extension: '.org', registrationInclVat: 239, renewalInclVat: 259 },
  { extension: '.online', registrationInclVat: 119, renewalInclVat: 769 },
  { extension: '.store', registrationInclVat: 79, renewalInclVat: 1219 },
  { extension: '.net', registrationInclVat: 339, renewalInclVat: 339 },
  { extension: '.africa', registrationInclVat: 219, renewalInclVat: 279 },
  { extension: '.capetown', registrationInclVat: 429, renewalInclVat: 429 },
  { extension: '.joburg', registrationInclVat: 429, renewalInclVat: 429 },
  { extension: '.durban', registrationInclVat: 429, renewalInclVat: 429 },
  { extension: '.net.za', registrationInclVat: 120, renewalInclVat: 120, freeTransfer: true },
  { extension: '.co.uk', registrationInclVat: 390, renewalInclVat: 390, billingPeriodYears: 2 },
  { extension: '.global', registrationInclVat: 2099, renewalInclVat: 2099 },
  { extension: '.co', registrationInclVat: 209, renewalInclVat: 679 },
  { extension: '.shop', registrationInclVat: 105, renewalInclVat: 819 },
  { extension: '.site', registrationInclVat: 189, renewalInclVat: 749 },
  { extension: '.biz', registrationInclVat: 509, renewalInclVat: 509 },
  { extension: '.info', registrationInclVat: 639, renewalInclVat: 639 },
  { extension: '.mobi', registrationInclVat: 1159, renewalInclVat: 1159 },
  { extension: '.travel', registrationInclVat: 3199, renewalInclVat: 3199 },
  { extension: '.agency', registrationInclVat: 679, renewalInclVat: 679 },
  { extension: '.digital', registrationInclVat: 879, renewalInclVat: 879 },
  { extension: '.tech', registrationInclVat: 359, renewalInclVat: 1389 },
  { extension: '.app', registrationInclVat: 449, renewalInclVat: 449 },
  { extension: '.me', registrationInclVat: 299, renewalInclVat: 499 },
  { extension: '.tv', registrationInclVat: 799, renewalInclVat: 799 },
  { extension: '.de', registrationInclVat: 199, renewalInclVat: 199 },
  { extension: '.eu', registrationInclVat: 199, renewalInclVat: 199 },
  { extension: '.cc', registrationInclVat: 399, renewalInclVat: 399 },
  { extension: '.top', registrationInclVat: 219, renewalInclVat: 219 },
  { extension: '.xyz', registrationInclVat: 339, renewalInclVat: 339 },
].map(domain => ({
  ...domain,
  registrationExVat: xneeloSellingPriceExVat(domain.registrationInclVat),
  renewalExVat: xneeloSellingPriceExVat(domain.renewalInclVat),
}));

type DomainAction = 'none' | 'register' | 'renew' | 'transfer';

const GOOGLE_ADS_PACKAGES = [
  { id: 'starter', label: 'Google Ads Starter', monthly: 4500, adSpend: 'Recommended ad spend: R5,000-R10,000/month' },
  { id: 'growth', label: 'Google Ads Growth', monthly: 7500, adSpend: 'Recommended ad spend: R10,000-R30,000/month' },
  { id: 'scale', label: 'Google Ads Scale', monthly: 12000, adSpend: 'Recommended ad spend: R30,000-R75,000/month' },
] as const;
type GoogleAdsPackageId = typeof GOOGLE_ADS_PACKAGES[number]['id'];

const SOLUTION_BUILDERS: SolutionBuilder[] = [
  {
    id: 'wifi-home',
    label: 'Residential / Home WiFi',
    icon: 'wifi',
    description: 'Once-off WiFi installation estimate for homes, apartments, gardens and coverage dead zones.',
    baseOnceOff: 2950,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Site WiFi assessment', amount: 650 },
      { label: 'Basic configuration', amount: 950 },
      { label: 'Labour and installation setup', amount: 1350 },
    ],
    includes: ['Property type', 'Rooms and floor size', 'Indoor / outdoor coverage', 'Labour and setup', 'Call-out estimate'],
    options: [
      { id: 'home-ap', label: 'Additional access point / mesh node', dynamicPricing: true },
      { id: 'home-cabling', label: 'Cabling required', dynamicPricing: true },
      { id: 'home-outdoor', label: 'Outdoor coverage area', dynamicPricing: true },
      { id: 'home-hardware', label: 'Managed WiFi hardware allowance', onceOff: 3490 },
    ],
  },
  {
    id: 'wifi-business',
    label: 'Enterprise / Business WiFi',
    icon: 'router',
    description: 'Managed office, school, warehouse or public-space WiFi with optional monthly SLA support.',
    baseOnceOff: 9500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Network discovery and planning', amount: 2200 },
      { label: 'Enterprise configuration', amount: 2600 },
      { label: 'Implementation labour', amount: 3300 },
      { label: 'Documentation and handover', amount: 1400 },
    ],
    includes: ['Guest and staff WiFi', 'VLAN option', 'Managed switch readiness', 'Monitoring', 'Remote and onsite support'],
    options: [
      { id: 'biz-ap', label: 'Additional business access point', dynamicPricing: true },
      { id: 'biz-switch', label: 'Managed switch', onceOff: 5490, quantity: true, quantityLabel: 'Switch quantity' },
      { id: 'biz-rack', label: 'Network rack / cabinet', onceOff: 4490, quantity: true, quantityLabel: 'Cabinet quantity' },
      { id: 'biz-outdoor', label: 'Outdoor coverage / bridge', dynamicPricing: true },
      { id: 'biz-sla', label: 'Enhanced SLA response', monthly: 5500 },
    ],
  },
  {
    id: 'managed-it',
    label: 'Managed IT Services',
    icon: 'support_agent',
    description: 'Proactive monitoring, support, Microsoft 365 guidance, backup oversight and device management for growing teams.',
    baseOnceOff: 4500,
    baseMonthly: 6250,
    monthlyDescription: 'Managed IT service for up to 25 devices',
    baseBreakdown: [
      { label: 'Environment discovery and onboarding', amount: 1500 },
      { label: 'Monitoring and support setup', amount: 1500 },
      { label: 'Documentation and escalation plan', amount: 1500 },
    ],
    includes: ['Up to 25 devices', 'Remote support', 'Proactive monitoring', 'Backup oversight', 'Microsoft 365 guidance', 'Monthly service review'],
    options: [
      { id: 'managed-extra-device', label: 'Device above the included 25', monthly: 250, quantity: true, quantityLabel: 'Additional device quantity' },
      { id: 'managed-onsite-day', label: 'Scheduled onsite support day', onceOff: 5500, quantity: true, quantityLabel: 'Onsite day quantity' },
      { id: 'managed-backup-device', label: 'Managed endpoint backup', monthly: 180, quantity: true, quantityLabel: 'Backup device quantity' },
      { id: 'managed-after-hours', label: 'After-hours escalation cover', monthly: 4500 },
    ],
  },
  {
    id: 'website',
    label: 'Website & Platform Development',
    icon: 'web',
    description: 'Basic entry-level business website with priced upgrades for content, functionality, integrations and ongoing support.',
    baseOnceOff: 6500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Basic website planning and page structure', amount: 800 },
      { label: 'Template-based responsive styling', amount: 1800 },
      { label: 'Build for up to 4 simple pages', amount: 2600 },
      { label: 'Contact CTA, basic SEO and deployment assistance', amount: 1300 },
    ],
    includes: ['Basic 4-page business website', 'Home, About, Services and Contact pages', 'Responsive template-based layout', 'Client-supplied logo, text and images', 'Contact form or WhatsApp CTA', 'Basic SEO setup', 'Deployment assistance'],
    options: [
      { id: 'web-extra-page', label: 'Additional standard website page', onceOff: 1800, quantity: true, quantityLabel: 'Extra page quantity' },
      { id: 'web-copywriting', label: 'Website copywriting and content loading', onceOff: 3500 },
      { id: 'web-blog', label: 'Blog / news section', onceOff: 4500 },
      { id: 'web-gallery', label: 'Portfolio, gallery or case-study section', onceOff: 3500 },
      { id: 'web-booking', label: 'Booking or appointment request flow', onceOff: 8500 },
      { id: 'web-payment', label: 'Online payment gateway integration', onceOff: 12500 },
      { id: 'web-ecommerce', label: 'E-commerce / booking flow', onceOff: 45000 },
      { id: 'web-backend', label: 'Backend / CMS or portal foundation', onceOff: 65000 },
      { id: 'web-crm', label: 'CRM or lead-routing integration', onceOff: 15000 },
      { id: 'web-tracking', label: 'GTM, GA4 and Meta Pixel tracking setup', onceOff: 4500 },
      { id: 'web-accessibility', label: 'Accessibility and usability improvement pass', onceOff: 5500 },
      { id: 'web-performance', label: 'Advanced speed and performance optimisation', onceOff: 4500 },
      { id: 'web-maintenance-basic', label: 'Basic maintenance and security care', monthly: 1500 },
      { id: 'web-maintenance', label: 'Managed maintenance, content and reporting', monthly: 4500 },
    ],
  },
  {
    id: 'hosting',
    label: 'Hosting & Infrastructure',
    icon: 'dns',
    description: 'Website hosting plans with clear monthly pricing and flexible options.',
    baseOnceOff: 0,
    baseMonthly: 103.3,
    monthlyDescription: 'Hosting plan subscription',
    baseBreakdown: [],
    includes: ['Hosting plan', 'Control panel access', 'Basic setup guidance', 'Onea support route', 'Upgrade path'],
    options: [
      { id: 'hosting-email', label: 'Business email setup', onceOff: 1250 },
      { id: 'hosting-migration', label: 'Website / email migration assistance', onceOff: 3500 },
      { id: 'hosting-backup', label: 'Managed backup monitoring', monthly: 650 },
      { id: 'hosting-security', label: 'Security and uptime monitoring', monthly: 950 },
    ],
  },
  {
    id: 'systems',
    label: 'System Integration',
    icon: 'schema',
    description: 'Automation, CRM, Google Sheets, HubSpot, Sage, dashboards and workflow integration.',
    baseOnceOff: 18000,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Discovery and workflow mapping', amount: 3500 },
      { label: 'Integration setup', amount: 5500 },
      { label: 'Automation scripting', amount: 6000 },
      { label: 'Testing, documentation and training', amount: 3000 },
    ],
    includes: ['Discovery', 'Workflow mapping', 'Automation scripting', 'Testing', 'Documentation and training'],
    options: [
      { id: 'sys-hubspot', label: 'HubSpot / CRM workflow', onceOff: 45000 },
      { id: 'sys-whatsapp', label: 'WhatsApp workflow', onceOff: 28000 },
      { id: 'sys-dashboard', label: 'Internal dashboard', onceOff: 85000 },
      { id: 'sys-api', label: 'API / Sage integration', onceOff: 65000 },
      { id: 'sys-support', label: 'Monthly integration support', monthly: 9500 },
    ],
  },
  {
    id: 'it-hardware',
    label: 'IT Hardware Procurement',
    icon: 'devices',
    description: 'Estimate for notebooks, desktops, printers, peripherals and warranty support.',
    baseOnceOff: 2500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Needs assessment', amount: 750 },
      { label: 'Supplier price comparison', amount: 750 },
      { label: 'Procurement admin', amount: 1000 },
    ],
    includes: ['Device requirements', 'Supplier comparison', 'Procurement admin', 'Warranty route', 'Delivery coordination'],
    options: [
      { id: 'it-device-setup', label: 'Device setup and handover', onceOff: 1450, quantity: true, quantityLabel: 'Device quantity' },
      { id: 'it-warranty', label: 'Warranty / care pack admin', onceOff: 750, quantity: true, quantityLabel: 'Warranty item quantity' },
      { id: 'it-bulk', label: 'Bulk order coordination', onceOff: 5500 },
      { id: 'it-onsite', label: 'Onsite deployment day', onceOff: 5500 },
    ],
  },
  {
    id: 'cybersecurity-firewall',
    label: 'Cyber Security & Fortinet Firewall',
    icon: 'security',
    description: 'Fortinet-aligned firewall, endpoint security and cyber-risk estimate for SMEs and business sites.',
    baseOnceOff: 8500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Cybersecurity baseline assessment', amount: 2200 },
      { label: 'Firewall and network security planning', amount: 2400 },
      { label: 'Fortinet Partner procurement guidance', amount: 1500 },
      { label: 'Implementation and handover allowance', amount: 2400 },
    ],
    includes: ['Fortinet Partner guidance', 'Firewall readiness check', 'Endpoint security baseline', 'Policy and access review', 'Procurement route'],
    options: [
      { id: 'cyber-firewall-device', label: 'Business firewall appliance allowance', onceOff: 14500, quantity: true, quantityLabel: 'Firewall quantity' },
      { id: 'cyber-endpoint', label: 'Endpoint security setup', onceOff: 850, quantity: true, quantityLabel: 'Endpoint quantity' },
      { id: 'cyber-vpn', label: 'VPN / remote access setup', onceOff: 4500 },
      { id: 'cyber-monitoring', label: 'Monthly security monitoring support', monthly: 5500 },
    ],
  },
  {
    id: 'apple-devices',
    label: 'Apple Device Procurement',
    icon: 'laptop_mac',
    description: 'Mac, iPad, iPhone and Apple accessory procurement path with ASBIS/Core comparison and setup options.',
    internalOnly: true,
    baseOnceOff: 2500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Apple supplier comparison', amount: 700 },
      { label: 'Procurement handling', amount: 900 },
      { label: 'Device handover preparation', amount: 900 },
    ],
    includes: ['ASBIS/Core comparison', 'Apple device sourcing', 'Accessory check', 'Warranty guidance', 'Handover prep'],
    options: [
      { id: 'apple-setup', label: 'Mac / iPad setup', onceOff: 1650, quantity: true, quantityLabel: 'Apple device quantity' },
      { id: 'apple-icare', label: 'iCare / warranty admin', onceOff: 850, quantity: true, quantityLabel: 'iCare item quantity' },
      { id: 'apple-migration', label: 'User data migration', onceOff: 2800, quantity: true, quantityLabel: 'User/device quantity' },
      { id: 'apple-mdm', label: 'Basic device management setup', onceOff: 7500 },
    ],
  },
  {
    id: 'voip-uc',
    label: 'VoIP & Unified Communications',
    icon: 'call',
    description: 'Yealink, Fanvil, 3CX, meeting-room and unified communications estimate for business clients.',
    baseOnceOff: 6500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Call-flow discovery', amount: 1500 },
      { label: 'Device and licence planning', amount: 1500 },
      { label: 'Provisioning and testing', amount: 3500 },
    ],
    includes: ['Call-flow planning', 'Device selection', 'Provisioning', 'Testing', 'Handover'],
    options: [
      { id: 'voip-phone', label: 'Desk phone provisioning', onceOff: 950, quantity: true, quantityLabel: 'Phone quantity' },
      { id: 'voip-3cx', label: '3CX / PBX setup', onceOff: 14500, monthly: 1850 },
      { id: 'voip-meeting', label: 'Meeting room kit setup', onceOff: 12500, quantity: true, quantityLabel: 'Room quantity' },
      { id: 'voip-support', label: 'Monthly VoIP support', monthly: 3500 },
    ],
  },
  {
    id: 'cctv-access',
    label: 'Smart CCTV & Access Control',
    icon: 'videocam',
    description: 'Camera, NVR, access control and smart security estimate with optional monitoring or support.',
    baseOnceOff: 7500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Security layout assessment', amount: 1800 },
      { label: 'Equipment planning', amount: 1500 },
      { label: 'Installation setup allowance', amount: 4200 },
    ],
    includes: ['Camera layout', 'NVR/storage planning', 'Access control option', 'Installation allowance', 'Handover'],
    options: [
      { id: 'cctv-camera', label: 'Installed business camera point', onceOff: 2950, quantity: true, quantityLabel: 'Camera point quantity' },
      { id: 'cctv-nvr', label: 'NVR / storage allowance', onceOff: 8500, quantity: true, quantityLabel: 'NVR quantity' },
      { id: 'cctv-access-door', label: 'Access-controlled door', onceOff: 12500, quantity: true, quantityLabel: 'Door quantity' },
      { id: 'cctv-monitoring', label: 'Monthly monitoring / health check', monthly: 3500 },
    ],
  },
  {
    id: 'structured-cabling',
    label: 'Network Cabinets & Structured Cabling',
    icon: 'lan',
    description: 'Cabinet, patch panel, switch, trunking and Cat6 data point quote path using the Onea per-link cabling model.',
    baseOnceOff: 1850,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'First installed Cat6 data point allowance', amount: 1850 },
    ],
    includes: ['Per-link data point model', '30m cable allowance', 'Cabinet option', 'Patch panel option', 'Switch option'],
    options: [
      { id: 'cabling-point', label: 'Additional Cat6 data point up to 30m', onceOff: 1850, quantity: true, quantityLabel: 'Data point quantity' },
      { id: 'cabling-cabinet', label: 'Network cabinet / rack', onceOff: 4490, quantity: true, quantityLabel: 'Cabinet quantity' },
      { id: 'cabling-patch', label: 'Patch panel and accessories', onceOff: 2950, quantity: true, quantityLabel: 'Patch panel quantity' },
      { id: 'cabling-switch', label: 'Managed switch allowance', onceOff: 5490, quantity: true, quantityLabel: 'Switch quantity' },
    ],
  },
  {
    id: 'cloud-licensing',
    label: 'Cloud Licensing / Microsoft 365',
    icon: 'cloud',
    description: 'Microsoft 365, Azure, Windows, Office and cloud licensing estimate.',
    baseOnceOff: 1850,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Licence needs check', amount: 550 },
      { label: 'Tenant / account admin', amount: 600 },
      { label: 'Procurement handling', amount: 700 },
    ],
    includes: ['Licence check', 'Supplier routing', 'Tenant readiness', 'Billing setup', 'Handover'],
    options: [
      { id: 'cloud-m365', label: 'Microsoft 365 Business Standard allowance', monthly: 349, quantity: true, quantityLabel: 'Licence quantity' },
      { id: 'cloud-tenant', label: 'Tenant setup / cleanup', onceOff: 6500 },
      { id: 'cloud-email-migration', label: 'Email migration', onceOff: 950, quantity: true, quantityLabel: 'Mailbox quantity' },
      { id: 'cloud-security', label: 'Security baseline setup', onceOff: 8500 },
    ],
  },
  {
    id: 'energy-ups',
    label: 'Energy & UPS',
    icon: 'battery_charging_full',
    description: 'UPS, power protection and small backup-power procurement path for offices and network cabinets.',
    baseOnceOff: 2500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Load requirement check', amount: 800 },
      { label: 'Supplier comparison', amount: 700 },
      { label: 'Procurement handling', amount: 1000 },
    ],
    includes: ['Load sizing', 'UPS recommendation', 'Supplier comparison', 'Procurement', 'Handover'],
    options: [
      { id: 'ups-rack', label: 'Rack UPS allowance', onceOff: 7500, quantity: true, quantityLabel: 'Rack UPS quantity' },
      { id: 'ups-tower', label: 'Tower UPS allowance', onceOff: 4500, quantity: true, quantityLabel: 'Tower UPS quantity' },
      { id: 'ups-install', label: 'Installation and cable management', onceOff: 3500 },
      { id: 'ups-health', label: 'Quarterly UPS health check', monthly: 1250 },
    ],
  },
  {
    id: 'pos-hardware',
    label: 'POS Hardware',
    icon: 'point_of_sale',
    description: 'Retail POS terminals, barcode scanners, receipt printers and counter hardware procurement path.',
    baseOnceOff: 2500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'POS needs assessment', amount: 750 },
      { label: 'Supplier comparison', amount: 700 },
      { label: 'Procurement handling', amount: 1050 },
    ],
    includes: ['POS requirements', 'Supplier comparison', 'Procurement', 'Setup option', 'Warranty route'],
    options: [
      { id: 'pos-terminal', label: 'POS terminal allowance', onceOff: 7500, quantity: true, quantityLabel: 'Terminal quantity' },
      { id: 'pos-scanner', label: 'Barcode scanner allowance', onceOff: 1850, quantity: true, quantityLabel: 'Scanner quantity' },
      { id: 'pos-printer', label: 'Receipt printer allowance', onceOff: 2950, quantity: true, quantityLabel: 'Printer quantity' },
      { id: 'pos-setup', label: 'Counter setup and testing', onceOff: 4500 },
    ],
  },
  {
    id: 'creative-brand',
    label: 'Creative, Brand & Content',
    icon: 'palette',
    description: 'Brand identity, campaign concepts, graphic design, copywriting and ongoing creative production.',
    baseOnceOff: 12500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Brand and audience discovery', amount: 2500 },
      { label: 'Creative direction', amount: 3500 },
      { label: 'Core visual system', amount: 4500 },
      { label: 'Handover and usage guidance', amount: 2000 },
    ],
    includes: ['Discovery workshop', 'Creative direction', 'Core brand look and feel', 'Two revision rounds', 'Digital-ready handover'],
    options: [
      { id: 'creative-logo', label: 'Logo development package', onceOff: 8500 },
      { id: 'creative-identity', label: 'Full corporate identity system', onceOff: 25000 },
      { id: 'creative-campaign', label: 'Campaign concept and key visual', onceOff: 18000 },
      { id: 'creative-copy', label: 'Corporate copywriting pack', onceOff: 6500 },
      { id: 'creative-retainer', label: 'Monthly design and content retainer', monthly: 12000 },
    ],
  },
  {
    id: 'media-production',
    label: 'Photography & Video Production',
    icon: 'movie',
    description: 'Corporate photography, campaign video, interviews, event coverage, editing and production management.',
    baseOnceOff: 8700,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Production planning', amount: 1800 },
      { label: 'Half-day crew and equipment', amount: 4200 },
      { label: 'Editing and delivery', amount: 2700 },
    ],
    includes: ['Production brief', 'Crew coordination', 'Professional capture', 'Licensed music where required', 'One revision round', 'Digital delivery'],
    options: [
      { id: 'media-photo-half', label: 'Corporate photography half-day', onceOff: 6500 },
      { id: 'media-photo-full', label: 'Corporate photography full-day', onceOff: 10500 },
      { id: 'media-video-essential', label: 'Essential corporate video production', onceOff: 13500 },
      { id: 'media-video-premium', label: 'Premium multi-crew video production', onceOff: 22800 },
      { id: 'media-drone', label: 'Drone coverage allowance', onceOff: 3500 },
      { id: 'media-edit', label: 'Additional edited short-form asset', onceOff: 2500, quantity: true, quantityLabel: 'Additional asset quantity' },
    ],
  },
  {
    id: 'media-buying',
    label: 'Media Planning & Buying',
    icon: 'ads_click',
    description: 'Radio, outdoor, digital and print media planning with booking coordination, cost control and reporting.',
    baseOnceOff: 6500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Audience and channel planning', amount: 2200 },
      { label: 'Media schedule and budget model', amount: 2300 },
      { label: 'Supplier coordination and controls', amount: 2000 },
    ],
    includes: ['Audience planning', 'Channel recommendation', 'Budget model', 'Placement schedule', 'Supplier coordination', 'Post-campaign reporting framework', 'Media spend excluded'],
    options: [
      { id: 'buying-radio', label: 'Radio planning, booking and production management', onceOff: 12500 },
      { id: 'buying-outdoor', label: 'Outdoor site sourcing and placement management', onceOff: 15000 },
      { id: 'buying-digital', label: 'Digital media plan and programmatic setup', onceOff: 7500 },
      { id: 'buying-print', label: 'Print placement planning and booking', onceOff: 6500 },
      { id: 'buying-report', label: 'Campaign reconciliation and ROI report', onceOff: 4500 },
      { id: 'buying-management-small', label: 'Media management - placement spend up to R50k', monthly: 7500 },
      { id: 'buying-management-growth', label: 'Media management - placement spend R50k to R150k', monthly: 15000 },
      { id: 'buying-management-scale', label: 'Media management - placement spend above R150k', monthly: 25000 },
    ],
  },
  {
    id: 'cloud-erp',
    label: 'Cloud, ERP & Data Solutions',
    icon: 'database',
    description: 'ERP discovery, cloud architecture, data migration, administration and business-system ownership.',
    baseOnceOff: 18000,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Business process discovery', amount: 4500 },
      { label: 'Solution architecture', amount: 5500 },
      { label: 'Implementation roadmap', amount: 4500 },
      { label: 'Governance and handover plan', amount: 3500 },
    ],
    includes: ['Process discovery', 'Architecture', 'Security and access review', 'Migration plan', 'Implementation roadmap', 'Management handover'],
    options: [
      { id: 'erp-discovery', label: 'Detailed ERP requirements and process blueprint', onceOff: 25000 },
      { id: 'erp-implementation', label: 'ERP implementation foundation', onceOff: 150000 },
      { id: 'erp-cloud', label: 'Azure / Google Cloud environment foundation', onceOff: 65000 },
      { id: 'erp-migration', label: 'Structured data migration project', onceOff: 85000 },
      { id: 'erp-admin', label: 'Monthly ERP and cloud administration', monthly: 18000 },
    ],
  },
  {
    id: 'fibre-activation',
    label: 'Fibre Activation & Account Management',
    icon: 'settings_ethernet',
    description: 'Openserve qualification, ISP matching, application management, activation and fault-escalation support.',
    baseOnceOff: 1250,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Coverage and address qualification', amount: 350 },
      { label: 'ISP and package matching', amount: 350 },
      { label: 'Application and activation management', amount: 550 },
    ],
    includes: ['Coverage qualification', 'ISP comparison', 'Application assistance', 'Activation tracking', 'Account handover'],
    options: [
      { id: 'fibre-business', label: 'Business fibre activation management', onceOff: 2500 },
      { id: 'fibre-multisite', label: 'Additional site coordination', onceOff: 3500, quantity: true, quantityLabel: 'Additional site quantity' },
      { id: 'fibre-router', label: 'Managed router setup', onceOff: 2500 },
      { id: 'fibre-escalation', label: 'Priority fault escalation support', monthly: 750 },
      { id: 'fibre-managed', label: 'Managed connectivity account service', monthly: 1499 },
    ],
  },
  {
    id: 'procurement-tenders',
    label: 'Corporate & Tender Procurement',
    icon: 'inventory_2',
    description: 'B-BBEE Level 1 procurement support, compliant sourcing, tender administration and delivery coordination.',
    baseOnceOff: 4500,
    baseMonthly: 0,
    baseBreakdown: [
      { label: 'Requirement and compliance review', amount: 1200 },
      { label: 'Supplier sourcing and comparison', amount: 1300 },
      { label: 'Commercial schedule and administration', amount: 2000 },
    ],
    includes: ['Requirement review', 'Compliant sourcing', 'Supplier comparison', 'Commercial schedule', 'Delivery and warranty route'],
    options: [
      { id: 'procurement-sourcing', label: 'Extended multi-supplier sourcing', onceOff: 3500 },
      { id: 'procurement-tender', label: 'Tender response administration pack', onceOff: 12500 },
      { id: 'procurement-compliance', label: 'Compliance and returnable-document pack', onceOff: 6500 },
      { id: 'procurement-delivery', label: 'Multi-site delivery coordination', onceOff: 4500 },
      { id: 'procurement-account', label: 'Monthly procurement account management', monthly: 8500 },
    ],
  },
  {
    id: 'google-ads',
    label: 'Google Ads Management',
    icon: 'ads_click',
    description: 'Certified campaign setup, conversion tracking, optimisation and reporting for lead generation and sales.',
    baseOnceOff: 6500,
    baseMonthly: 4500,
    monthlyDescription: 'Google Ads Starter management',
    baseBreakdown: [
      { label: 'Account and campaign structure', amount: 1800 },
      { label: 'Keyword and audience research', amount: 1500 },
      { label: 'Conversion tracking setup', amount: 1800 },
      { label: 'Launch quality review', amount: 1400 },
    ],
    includes: ['Campaign strategy', 'Search campaign setup', 'Keyword research', 'Ad copy', 'Conversion tracking', 'Budget controls', 'Monthly optimisation', 'Performance reporting', 'Advertising spend paid separately to Google'],
    options: [
      { id: 'gads-pmax', label: 'Performance Max campaign management', monthly: 2500 },
      { id: 'gads-shopping', label: 'Shopping feed and campaign management', onceOff: 6500, monthly: 3500 },
      { id: 'gads-offline', label: 'Offline conversion and sales tracking', onceOff: 8500, monthly: 1500 },
      { id: 'gads-landing', label: 'Conversion landing page', onceOff: 6500 },
      { id: 'gads-creative', label: 'Additional monthly ad creative pack', monthly: 3500 },
    ],
  },
  {
    id: 'marketing',
    label: 'Digital Marketing',
    icon: 'campaign',
    description: 'Social media, SEO, Google Ads, sales-focused landing pages, lead generation, conversion tracking, automation and reporting.',
    baseOnceOff: 9500,
    baseMonthly: 0,
    monthlyDescription: 'Management package selected below. Google advertising spend is paid separately to Google.',
    baseBreakdown: [
      { label: 'Campaign strategy', amount: 2500 },
      { label: 'Tracking and channel setup', amount: 2200 },
      { label: 'Keyword, audience and creative direction', amount: 2600 },
      { label: 'Reporting structure and launch plan', amount: 2200 },
    ],
    includes: ['Campaign strategy', 'Keyword research', 'Ad copy direction', 'Landing-page conversion review', 'Campaign tracking plan', 'Budget management plan', 'Plain-language reporting', 'Ongoing optimisation path', 'Google ad spend excluded'],
    options: [
      { id: 'mkt-seo', label: 'SEO setup and monthly optimisation', onceOff: 15000, monthly: 9500 },
      { id: 'mkt-content', label: 'Content creation and community pack', monthly: 12000 },
      { id: 'mkt-automation', label: 'Marketing automation', onceOff: 25000 },
    ],
  },
  {
    id: 'communications',
    label: 'Communications & PR',
    icon: 'record_voice_over',
    description: 'PR strategy, press releases, media distribution, copywriting and brand positioning.',
    baseOnceOff: 8500,
    baseMonthly: 7500,
    monthlyDescription: 'Communications and PR management retainer',
    baseBreakdown: [
      { label: 'Messaging review', amount: 2000 },
      { label: 'PR strategy setup', amount: 2500 },
      { label: 'Copywriting framework', amount: 2200 },
      { label: 'Media and stakeholder planning', amount: 1800 },
    ],
    includes: ['PR strategy', 'Messaging', 'Copywriting', 'Media distribution option', 'Reputation support'],
    options: [
      { id: 'pr-release', label: 'Press release writing', onceOff: 6500 },
      { id: 'pr-distribution', label: 'Media distribution and monitoring', onceOff: 15000 },
      { id: 'pr-campaign', label: 'PR campaign project', onceOff: 45000 },
      { id: 'pr-standard', label: 'Standard monthly communications tier', monthly: 9000 },
      { id: 'pr-full', label: 'Full communications tier upgrade', monthly: 21500 },
    ],
  },
];

const CALLOUT_ZONES = [
  { id: '0-20', label: '0-20km from Pretoria', fee: 650 },
  { id: '20-50', label: '20-50km from Pretoria', fee: 1250 },
  { id: '50-100', label: '50-100km from Pretoria', fee: 2250 },
  { id: '100+', label: '100km+ live travel calculation', fee: 0 },
];

type TravelEstimate = {
  destination: string;
  latitude: number;
  longitude: number;
  oneWayKm: number;
  roundTripKm: number;
  includedOneWayKm: number;
  excessRoundTripKm: number;
  ratePerKm: number;
  baseCallout: number;
  travelFee: number;
  method: 'live_driving_route' | 'estimated_road_distance';
  rateEffectiveDate: string;
  accommodationIncluded: boolean;
};

const VAT_RATE = 0.15;
const LAUNCH_PLATFORM_SESSION_KEY = 'launch_platform_session';
const currency = (value: number) => `R ${Math.round(value).toLocaleString('en-ZA')}`;

const CCTV_CAMERA_POINT_PRICE = 2950;
const CCTV_NVR_ALLOWANCE = 8500;
const CCTV_REMOTE_BACKUP_MONTHLY = 3500;
const CCTV_ACCESS_DOOR_PRICE = 12500;

const CCTV_PREMISES_BASE: Record<string, number> = {
  home: 4,
  retail: 6,
  office: 8,
  warehouse: 12,
  school: 16,
  estate: 24,
};

export default function PricingPage({ onTalkToUs }: Props) {
  const isAgentMode = useMemo(() => new URLSearchParams(window.location.search).get('agent') === '1', []);
  const hasLaunchPlatformSession = useMemo(() => {
    if (!isAgentMode) return true;
    try {
      const stored = localStorage.getItem(LAUNCH_PLATFORM_SESSION_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored) as { token?: string; session?: unknown };
      return Boolean(parsed?.token && parsed?.session);
    } catch {
      localStorage.removeItem(LAUNCH_PLATFORM_SESSION_KEY);
      return false;
    }
  }, [isAgentMode]);
  const canUseInternalBuilders = isAgentMode && hasLaunchPlatformSession;
  const hasRequestedBuilder = useMemo(() => {
    const requested = new URLSearchParams(window.location.search).get('solution');
    return SOLUTION_BUILDERS.some(builder => builder.id === requested && (!builder.internalOnly || canUseInternalBuilders));
  }, [canUseInternalBuilders]);
  const requestedBuilderId = useMemo(() => {
    const requested = new URLSearchParams(window.location.search).get('solution');
    return SOLUTION_BUILDERS.some(builder => builder.id === requested && (!builder.internalOnly || canUseInternalBuilders)) ? requested || SOLUTION_BUILDERS[0].id : SOLUTION_BUILDERS[0].id;
  }, [canUseInternalBuilders]);
  const [ispPortal, setIspPortal] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [builderId, setBuilderId] = useState(requestedBuilderId);
  const [builderConfiguratorOpen, setBuilderConfiguratorOpen] = useState(hasRequestedBuilder);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({});
  const [calloutZone, setCalloutZone] = useState(CALLOUT_ZONES[0].id);
  const [travelDialogOpen, setTravelDialogOpen] = useState(false);
  const [travelAddress, setTravelAddress] = useState('');
  const [travelCoordinates, setTravelCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [travelEstimate, setTravelEstimate] = useState<TravelEstimate | null>(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState('');
  const [accessPointCount, setAccessPointCount] = useState(0);
  const [cableLengthMetres, setCableLengthMetres] = useState(0);
  const [accessPointQuality, setAccessPointQuality] = useState(ACCESS_POINT_QUALITY[0].id);
  const [hostingProductId, setHostingProductId] = useState(HOSTING_PRODUCTS[0].id);
  const [domainAction, setDomainAction] = useState<DomainAction>('none');
  const [domainExtension, setDomainExtension] = useState(XNEELO_DOMAIN_PRODUCTS[0].extension);
  const [googleAdsPackageId, setGoogleAdsPackageId] = useState<GoogleAdsPackageId>(GOOGLE_ADS_PACKAGES[0].id);
  const [deliveryPriority, setDeliveryPriority] = useState<'standard' | 'priority' | 'urgent'>('standard');
  const [commercialEnvironment, setCommercialEnvironment] = useState<'standard' | 'corporate' | 'regulated'>('standard');
  const [complexityLevel, setComplexityLevel] = useState('low');
  const [installFactors, setInstallFactors] = useState<Record<string, boolean>>({});
  const [pricingCatalog, setPricingCatalog] = useState<PricingCatalog | null>(null);
  const [pricingCatalogError, setPricingCatalogError] = useState('');
  const [homeWifiDetails, setHomeWifiDetails] = useState({
    propertyType: '',
    rooms: '',
    floorSize: '',
    coverage: '',
  });
  const [cctvDetails, setCctvDetails] = useState({
    premisesType: '',
    entrances: '2',
    indoorAreas: '2',
    outdoorAreas: '2',
    nightCoverage: '',
    recordingDays: '14',
    remoteBackup: '',
    accessDoors: '0',
    internetReady: '',
  });
  const publicPricingServices = useMemo(
    () => services.filter(service => service.id !== 'connectivity'),
    [],
  );

  const visibleSolutionBuilders = useMemo(
    () => SOLUTION_BUILDERS.filter(builder => !builder.internalOnly || canUseInternalBuilders),
    [canUseInternalBuilders],
  );
  const activeBuilderCandidate = SOLUTION_BUILDERS.find(builder => builder.id === builderId) || SOLUTION_BUILDERS[0];
  const activeBuilder = activeBuilderCandidate.internalOnly && !canUseInternalBuilders ? SOLUTION_BUILDERS[0] : activeBuilderCandidate;
  const activeCatalogBuilder = pricingCatalog?.builders?.[activeBuilder.id];
  const activeZone = CALLOUT_ZONES.find(zone => zone.id === calloutZone) || CALLOUT_ZONES[0];
  const selectedBuilderOptions = activeBuilder.options.filter(option => selectedOptions[option.id]);
  const optionQuantity = (option: BuilderOption) => option.quantity ? Math.max(1, optionQuantities[option.id] || 1) : 1;
  const isWifiBuilder = activeBuilder.id === 'wifi-home' || activeBuilder.id === 'wifi-business';
  const isCctvBuilder = activeBuilder.id === 'cctv-access';
  const isHostingBuilder = activeBuilder.id === 'hosting';
  const isGoogleAdsBuilder = activeBuilder.id === 'google-ads';
  const usesCallout = isWifiBuilder || isCctvBuilder;
  const displayedBuilderOptions = isCctvBuilder ? [] : activeBuilder.options;
  const selectedApQuality = ACCESS_POINT_QUALITY.find(item => item.id === accessPointQuality) || ACCESS_POINT_QUALITY[0];
  const selectedHostingProduct = HOSTING_PRODUCTS.find(item => item.id === hostingProductId) || HOSTING_PRODUCTS[0];
  const selectedDomainProduct = XNEELO_DOMAIN_PRODUCTS.find(item => item.extension === domainExtension) || XNEELO_DOMAIN_PRODUCTS[0];
  const selectedGoogleAdsPackage = GOOGLE_ADS_PACKAGES.find(item => item.id === googleAdsPackageId) || GOOGLE_ADS_PACKAGES[0];
  const domainPriceAvailable = domainAction !== 'transfer' || Boolean(selectedDomainProduct.freeTransfer);
  const selectedComplexity = COMPLEXITY_LEVELS.find(item => item.id === complexityLevel) || COMPLEXITY_LEVELS[0];
  useEffect(() => {
    if (isAgentMode && !hasLaunchPlatformSession) {
      window.location.replace('/launch-platform?redirect=/pricing%3Fagent%3D1');
    }
  }, [hasLaunchPlatformSession, isAgentMode]);
  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(LAUNCH_PLATFORM_SESSION_KEY);
    let token = '';
    try {
      token = stored ? (JSON.parse(stored)?.token || '') : '';
    } catch {
      token = '';
    }
    fetch('/api/pricing-catalog.php', {
      headers: {
        Accept: 'application/json',
        ...(isAgentMode && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
      .then(async response => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          throw new Error(payload?.error || 'Pricing catalogue is unavailable.');
        }
        return payload as PricingCatalog;
      })
      .then(payload => {
        if (cancelled) return;
        setPricingCatalog(payload);
        setPricingCatalogError('');
      })
      .catch(error => {
        if (cancelled) return;
        setPricingCatalog(null);
        setPricingCatalogError(error instanceof Error ? error.message : 'Pricing catalogue is unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, [isAgentMode]);
  const estimate = useMemo(() => {
    const optionLineItems: OptionLineItem[] = selectedBuilderOptions.map(option => {
      const quantity = option.quantity ? Math.max(1, optionQuantities[option.id] || 1) : 1;
      const catalogPrice = activeCatalogBuilder?.options?.[option.id];
      return {
        id: option.id,
        label: option.label,
        quantity,
        onceOff: (catalogPrice?.displayOnceOff || 0) * quantity,
        monthly: (catalogPrice?.displayMonthly || 0) * quantity,
        floorOnceOff: catalogPrice?.floorOnceOff === undefined ? undefined : catalogPrice.floorOnceOff * quantity,
        floorMonthly: catalogPrice?.floorMonthly === undefined ? undefined : catalogPrice.floorMonthly * quantity,
      };
    });
    const optionOnceOff = optionLineItems.reduce((total, option) => total + option.onceOff, 0);
    const optionMonthly = optionLineItems.reduce((total, option) => total + option.monthly, 0);
    const optionFloorOnceOff = optionLineItems.reduce((total, option) => total + (option.floorOnceOff || 0), 0);
    const optionFloorMonthly = optionLineItems.reduce((total, option) => total + (option.floorMonthly || 0), 0);
    const optionFloorsComplete = selectedBuilderOptions.every(option => {
      const catalogPrice = activeCatalogBuilder?.options?.[option.id];
      return (catalogPrice?.displayOnceOff === undefined || catalogPrice.floorOnceOff !== undefined)
        && (catalogPrice?.displayMonthly === undefined || catalogPrice.floorMonthly !== undefined);
      },
    );
    const unavailableSelections = selectedBuilderOptions.filter(option => {
      const record = activeCatalogBuilder?.options?.[option.id];
      return !record || record.availability === 'quote_required' || record.availability === 'unavailable';
    });
    const callout = usesCallout
      ? activeZone.id === '100+'
        ? travelEstimate?.travelFee || 0
        : activeZone.fee
      : 0;
    const wifiHardware = isWifiBuilder ? accessPointCount * selectedApQuality.sellingPrice : 0;
    const cctvEntranceCount = Math.max(0, Number(cctvDetails.entrances) || 0);
    const cctvIndoorAreaCount = Math.max(0, Number(cctvDetails.indoorAreas) || 0);
    const cctvOutdoorAreaCount = Math.max(0, Number(cctvDetails.outdoorAreas) || 0);
    const cctvAccessDoorCount = Math.max(0, Number(cctvDetails.accessDoors) || 0);
    const cctvBaseCameraCount = CCTV_PREMISES_BASE[cctvDetails.premisesType] || 4;
    const cctvRecommendedCameraCount = isCctvBuilder
      ? Math.max(cctvBaseCameraCount, cctvEntranceCount + cctvIndoorAreaCount + cctvOutdoorAreaCount)
      : 0;
    const cctvRecorderChannels = cctvRecommendedCameraCount <= 4
      ? 4
      : cctvRecommendedCameraCount <= 8
        ? 8
        : cctvRecommendedCameraCount <= 16
          ? 16
          : 32;
    const cctvNvrCount = isCctvBuilder ? Math.max(1, Math.ceil(cctvRecommendedCameraCount / cctvRecorderChannels)) : 0;
    const cctvCameraAllowance = isCctvBuilder ? cctvRecommendedCameraCount * CCTV_CAMERA_POINT_PRICE : 0;
    const cctvNvrAllowance = isCctvBuilder ? cctvNvrCount * CCTV_NVR_ALLOWANCE : 0;
    const cctvAccessControlAllowance = isCctvBuilder ? cctvAccessDoorCount * CCTV_ACCESS_DOOR_PRICE : 0;
    const cctvRemoteBackupMonthly = isCctvBuilder && cctvDetails.remoteBackup === 'yes' ? CCTV_REMOTE_BACKUP_MONTHLY : 0;
    const cctvRecommendationNotes = isCctvBuilder ? [
      `${cctvRecommendedCameraCount} camera points recommended from your answers`,
      `${cctvRecorderChannels}-channel recorder allowance`,
      cctvOutdoorAreaCount > 0 ? 'Outdoor-rated cameras for outside areas' : 'Indoor cameras for internal coverage',
      cctvDetails.nightCoverage === 'yes' ? 'Night/low-light coverage should be prioritised' : '',
      cctvDetails.remoteBackup === 'yes' ? 'Remote viewing and off-site backup included as a monthly service option' : '',
      cctvAccessDoorCount > 0 ? `${cctvAccessDoorCount} access-controlled door${cctvAccessDoorCount === 1 ? '' : 's'} included` : '',
    ].filter(Boolean) : [];
    const coverageText = homeWifiDetails.coverage.toLowerCase();
    const needsMixedCabling = isWifiBuilder && (
      coverageText.includes('indoor and outdoor')
      || coverageText.includes('indoor / outdoor')
      || (coverageText.includes('indoor') && coverageText.includes('outdoor'))
    );
    const needsOutdoorCabling = isWifiBuilder && (
      selectedApQuality.environment === 'outdoor'
      || Boolean(selectedOptions['home-outdoor'])
      || Boolean(selectedOptions['biz-outdoor'])
      || coverageText.includes('outdoor')
      || coverageText.includes('garden')
      || coverageText.includes('pool')
      || coverageText.includes('clubhouse')
    );
    const cablingRequired = isWifiBuilder && (
      cableLengthMetres > 0
      || Boolean(selectedOptions['home-cabling'])
      || Boolean(selectedOptions['biz-ap'])
      || Boolean(selectedOptions['biz-outdoor'])
    );
    const cablingLinkCount = cablingRequired ? Math.max(1, accessPointCount) : 0;
    const assumedCableLengthMetres = cablingLinkCount > 0 && cableLengthMetres === 0
      ? cablingLinkCount * CABLING_RATES.indoor.includedMetresPerLink
      : cableLengthMetres;
    const averageCableLengthPerLink = cablingLinkCount > 0 ? assumedCableLengthMetres / cablingLinkCount : 0;
    const cablingReservationProfiles = needsMixedCabling
      ? [
          { ...CABLING_RATES.indoor, key: 'indoor', share: 0.5 },
          { ...CABLING_RATES.outdoor, key: 'outdoor', share: 0.5 },
        ]
      : [{ ...(needsOutdoorCabling ? CABLING_RATES.outdoor : CABLING_RATES.indoor), key: needsOutdoorCabling ? 'outdoor' : 'indoor', share: 1 }];
    const cablingReservations = cablingReservationProfiles.map(profile => {
      const metres = cablingLinkCount > 0 ? assumedCableLengthMetres * profile.share : 0;
      const linkCount = cablingLinkCount > 0 ? Math.max(1, Math.round(cablingLinkCount * profile.share)) : 0;
      const includedMetres = linkCount * profile.includedMetresPerLink;
      const excessMetres = Math.max(0, metres - includedMetres);
      const fixedSelling = linkCount * profile.fixedLinkPrice;
      const excessSelling = excessMetres * profile.clientRatePerMetre;
      return {
        ...profile,
        linkCount,
        metres,
        includedMetres,
        excessMetres,
        fixedSelling,
        excessSelling,
        materialSelling: fixedSelling + excessSelling,
        labour: metres * profile.labourRatePerMetre,
      };
    });
    const cablingProfile = needsMixedCabling
      ? {
          label: 'Indoor + outdoor CAT6 cabling reservation',
          sku: `${CABLING_RATES.indoor.sku} + ${CABLING_RATES.outdoor.sku}`,
          fixedLinkPrice: 1250,
          includedMetresPerLink: 30,
          clientRatePerMetre: 0,
          labourRatePerMetre: 0,
        }
      : cablingReservationProfiles[0];
    const cablingMaterialSelling = Math.round(cablingReservations.reduce((total, item) => total + item.materialSelling, 0));
    const cablingLabour = Math.round(cablingReservations.reduce((total, item) => total + item.labour, 0));
    const cablingSellingPerLink = cablingLinkCount > 0 ? cablingMaterialSelling / cablingLinkCount : 0;
    const cablingLabourPerLink = cablingLinkCount > 0 ? cablingLabour / cablingLinkCount : 0;
    const cablingAllowance = Math.round(cablingMaterialSelling);
    const labourTable = LABOUR_PACKAGES[activeBuilder.id as keyof typeof LABOUR_PACKAGES];
    const labourPackage = labourTable?.[complexityLevel as keyof typeof labourTable];
    const factorCount = Object.values(installFactors).filter(Boolean).length;
    const travelImpact = usesCallout
      ? activeZone.id === '20-50'
        ? 450
        : activeZone.id === '50-100'
          ? 950
          : activeZone.id === '100+'
            ? 0
            : 0
      : 0;
    const configurationLabour = isWifiBuilder
      ? (selectedOptions['biz-switch'] ? 1200 : 0)
        + (selectedOptions['biz-sla'] ? 950 : 0)
        + (installFactors.vlanGuest ? 1450 : 0)
        + (installFactors.firewall ? 1800 : 0)
      : 0;
    const specialistEngineer = isWifiBuilder && (complexityLevel === 'high' || complexityLevel === 'enterprise')
      ? TECHNICIAN_RATES[2].estimate * (complexityLevel === 'enterprise' ? 6 : 3)
      : 0;
    const baseLabour = labourPackage ? labourPackage.estimate : 0;
    const installationLabour = isWifiBuilder
      ? Math.round((baseLabour * selectedComplexity.multiplier) + cablingLabour + configurationLabour + travelImpact + specialistEngineer + (factorCount * 250))
      : 0;
    const durationExtra = factorCount >= 4 ? ' + access-dependent allowance' : '';
    const estimatedDuration = isWifiBuilder && labourPackage ? `${labourPackage.duration}${durationExtra}` : '';
    const accommodationFlag = isWifiBuilder && activeZone.id === '100+' && Boolean(travelEstimate && travelEstimate.oneWayKm >= 300);
    const catalogBaseOnceOff = activeCatalogBuilder?.base?.displayOnceOff;
    const catalogBaseMonthly = activeCatalogBuilder?.base?.displayMonthly;
    const basePricingAvailable = Boolean(
      activeCatalogBuilder?.base
      && activeCatalogBuilder.base.availability !== 'quote_required'
      && activeCatalogBuilder.base.availability !== 'unavailable',
    );
    const pricingAvailable = Boolean(
      pricingCatalog
      && !pricingCatalogError
      && basePricingAvailable
      && unavailableSelections.length === 0
      && (!isHostingBuilder || domainPriceAvailable)
      && (!usesCallout || activeZone.id !== '100+' || Boolean(travelEstimate)),
    );
    const serviceBaseMonthly = isHostingBuilder
      ? selectedHostingProduct.sellingMonthly
      : isGoogleAdsBuilder
        ? selectedGoogleAdsPackage.monthly
        : (catalogBaseMonthly || 0);
    const commercialAdjustmentOnceOff = calculateCommercialAdjustment(
      (catalogBaseOnceOff || 0) + optionOnceOff,
      deliveryPriority,
      commercialEnvironment,
    );
    const commercialAdjustmentMonthly = calculateCommercialAdjustment(
      serviceBaseMonthly + optionMonthly,
      deliveryPriority,
      commercialEnvironment,
      true,
    );
    const monthlyLineItems = [
      ...(isHostingBuilder
        ? [{ label: `${selectedHostingProduct.label} subscription`, amount: selectedHostingProduct.sellingMonthly }]
        : isGoogleAdsBuilder
          ? [{ label: `${selectedGoogleAdsPackage.label} management`, amount: selectedGoogleAdsPackage.monthly }]
        : activeBuilder.baseMonthly > 0
          ? [{ label: activeBuilder.monthlyDescription || `${activeBuilder.label} monthly management`, amount: activeBuilder.baseMonthly }]
          : []),
      ...(cctvRemoteBackupMonthly > 0 ? [{ label: 'Remote viewing and off-site backup', amount: cctvRemoteBackupMonthly }] : []),
      ...optionLineItems
        .filter(option => option.monthly)
        .map(option => ({ label: option.quantity > 1 ? `${option.label} x ${option.quantity}` : option.label, amount: option.monthly })),
      ...(commercialAdjustmentMonthly > 0
        ? [{ label: 'Commercial environment adjustment', amount: commercialAdjustmentMonthly }]
        : []),
    ];
    const domainOnceOff = isHostingBuilder
      ? domainAction === 'register'
        ? selectedDomainProduct.registrationExVat
        : domainAction === 'renew'
          ? selectedDomainProduct.renewalExVat
          : 0
      : 0;
    const hostingAnnualSubtotal = isHostingBuilder && domainAction !== 'none'
      ? (selectedHostingProduct.sellingMonthly * 12) + domainOnceOff
      : 0;
    const hostingAnnualVat = hostingAnnualSubtotal * VAT_RATE;
    const hostingAnnualTotal = hostingAnnualSubtotal + hostingAnnualVat;
    const baseOnceOff = catalogBaseOnceOff || 0;
    const onceOffSubtotal = baseOnceOff + optionOnceOff + commercialAdjustmentOnceOff + callout + wifiHardware + cctvCameraAllowance + cctvNvrAllowance + cctvAccessControlAllowance + cablingAllowance + installationLabour + domainOnceOff;
    const monthlySubtotal = serviceBaseMonthly + cctvRemoteBackupMonthly + optionMonthly + commercialAdjustmentMonthly;
    const onceOffVat = onceOffSubtotal * VAT_RATE;
    const monthlyVat = monthlySubtotal * VAT_RATE;
    return {
      onceOff: onceOffSubtotal,
      monthly: monthlySubtotal,
      onceOffVat,
      monthlyVat,
      onceOffInclVat: onceOffSubtotal + onceOffVat,
      monthlyInclVat: monthlySubtotal + monthlyVat,
      annual: hostingAnnualTotal,
      callout,
      requiresCustomCallout: usesCallout && activeZone.id === '100+' && !travelEstimate,
      pricingAvailable,
      unavailableSelections,
      breakdown: {
        baseOnceOff,
        baseItems: activeBuilder.baseBreakdown,
        optionOnceOff,
        optionMonthly,
        commercialAdjustmentOnceOff,
        commercialAdjustmentMonthly,
        deliveryPriority,
        commercialEnvironment,
        optionFloorOnceOff,
        optionFloorMonthly,
        optionFloorsComplete,
        optionLineItems,
        monthlyLineItems,
        wifiHardware,
        cctvRecommendedCameraCount,
        cctvRecorderChannels,
        cctvNvrCount,
        cctvCameraAllowance,
        cctvNvrAllowance,
        cctvAccessControlAllowance,
        cctvRemoteBackupMonthly,
        cctvRecommendationNotes,
        cablingProfile,
        cablingReservations,
        cableLengthMetres,
        cablingLinkCount,
        averageCableLengthPerLink,
        cablingSellingPerLink,
        cablingLabourPerLink,
        cablingMaterialSelling,
        cablingLabour,
        cablingAllowance,
        labourPackage,
        selectedComplexity,
        installationLabour,
        configurationLabour,
        travelImpact,
        specialistEngineer,
        estimatedDuration,
        accommodationFlag,
        hourlyRates: TECHNICIAN_RATES,
        hostingSellingMonthly: isHostingBuilder ? selectedHostingProduct.sellingMonthly : 0,
        domainOnceOff,
        hostingAnnualSubtotal,
        hostingAnnualVat,
        hostingAnnualTotal,
        baseFloorOnceOff: activeCatalogBuilder?.base?.floorOnceOff,
        baseFloorMonthly: activeCatalogBuilder?.base?.floorMonthly,
        pricingSource: activeCatalogBuilder?.source,
      },
    };
  }, [activeBuilder, activeCatalogBuilder, activeZone, accessPointCount, accessPointQuality, cableLengthMetres, cctvDetails, commercialEnvironment, complexityLevel, deliveryPriority, domainAction, domainPriceAvailable, homeWifiDetails, installFactors, isCctvBuilder, isGoogleAdsBuilder, isHostingBuilder, isWifiBuilder, optionQuantities, pricingCatalog, pricingCatalogError, selectedApQuality, selectedBuilderOptions, selectedComplexity, selectedDomainProduct, selectedGoogleAdsPackage, selectedHostingProduct, selectedOptions, travelEstimate, usesCallout]);

  const toggleBuilderOption = (optionId: string) => {
    const option = activeBuilder.options.find(item => item.id === optionId);
    const catalogPrice = activeCatalogBuilder?.options?.[optionId];
    if (!catalogPrice || catalogPrice.availability === 'quote_required' || catalogPrice.availability === 'unavailable') {
      return;
    }
    setSelectedOptions(prev => {
      const nextSelected = !prev[optionId];
      if (nextSelected && option?.quantity) {
        setOptionQuantities(current => ({ ...current, [optionId]: current[optionId] || 1 }));
      }
      return { ...prev, [optionId]: nextSelected };
    });
    trackOneaEvent('package_configured', {
      service_type: activeBuilder.id,
      package_name: activeBuilder.label,
      option_id: optionId,
    });
  };

  const selectBuilder = (nextBuilderId: string) => {
    setBuilderId(nextBuilderId);
    setBuilderConfiguratorOpen(true);
    setSelectedOptions({});
    setOptionQuantities({});
    setAccessPointCount(0);
    setCableLengthMetres(0);
    setDomainAction('none');
    setGoogleAdsPackageId(GOOGLE_ADS_PACKAGES[0].id);
    setDeliveryPriority('standard');
    setCommercialEnvironment('standard');
    setComplexityLevel('low');
    setInstallFactors({});
    setCalloutZone(CALLOUT_ZONES[0].id);
    setTravelEstimate(null);
    setTravelAddress('');
    setTravelCoordinates(null);
    setTravelError('');
    setHomeWifiDetails({ propertyType: '', rooms: '', floorSize: '', coverage: '' });
    setCctvDetails({
      premisesType: '',
      entrances: '2',
      indoorAreas: '2',
      outdoorAreas: '2',
      nightCoverage: '',
      recordingDays: '14',
      remoteBackup: '',
      accessDoors: '0',
      internetReady: '',
    });
    const builder = SOLUTION_BUILDERS.find(item => item.id === nextBuilderId);
    trackOneaEvent('service_selected', {
      service_type: nextBuilderId,
      package_name: builder?.label || nextBuilderId,
    });
  };

  const selectCalloutZone = (zoneId: string) => {
    setCalloutZone(zoneId);
    if (zoneId === '100+') {
      setTravelEstimate(null);
      setTravelError('');
      setTravelDialogOpen(true);
    } else {
      setTravelEstimate(null);
      setTravelCoordinates(null);
      setTravelError('');
    }
  };

  const requestCurrentLocation = () => {
    setTravelError('');
    if (!navigator.geolocation) {
      setTravelError('GPS location is not available in this browser. Enter the full destination address instead.');
      return;
    }
    setTravelLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setTravelCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setTravelLoading(false);
      },
      () => {
        setTravelLoading(false);
        setTravelError('Location access was not granted. Enter the full destination address instead.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const calculateLongDistanceTravel = async () => {
    if (!travelAddress.trim() && !travelCoordinates) {
      setTravelError('Enter the full destination address or use your current GPS location.');
      return;
    }
    setTravelLoading(true);
    setTravelError('');
    try {
      const response = await fetch('/api/travel-estimate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          address: travelAddress.trim(),
          latitude: travelCoordinates?.latitude,
          longitude: travelCoordinates?.longitude,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.travelFee) {
        throw new Error(payload?.error || 'The live route could not be calculated. Check the address and try again.');
      }
      setTravelEstimate(payload as TravelEstimate);
      setTravelDialogOpen(false);
      trackOneaEvent('long_distance_travel_calculated', {
        service_type: activeBuilder.id,
        distance_zone: '100+',
        one_way_km: payload.oneWayKm,
        travel_fee: payload.travelFee,
        calculation_method: payload.method,
      });
    } catch (error) {
      setTravelError(error instanceof Error ? error.message : 'The live route could not be calculated.');
    } finally {
      setTravelLoading(false);
    }
  };

  const buildQuoteMessage = () => {
    const selectedOptionLabels = selectedBuilderOptions.map(option => {
      const quantity = optionQuantity(option);
      return option.quantity ? `${option.label} x ${quantity}` : option.label;
    });
    const lines = [
      `Pricing builder enquiry: ${activeBuilder.label}`,
      '',
      `Selected service: ${activeBuilder.label}`,
    ];

    if (activeBuilder.id === 'wifi-home') {
      lines.push(
        `Property type: ${homeWifiDetails.propertyType || 'Not provided'}`,
        `Rooms: ${homeWifiDetails.rooms || 'Not provided'}`,
        `Approximate floor size: ${homeWifiDetails.floorSize || 'Not provided'}`,
        `Coverage needed: ${homeWifiDetails.coverage || 'Not provided'}`
      );
    }

    if (isCctvBuilder) {
      lines.push(
        `Premises type: ${cctvDetails.premisesType || 'Not provided'}`,
        `Entrances / exits: ${cctvDetails.entrances || '0'}`,
        `Indoor areas: ${cctvDetails.indoorAreas || '0'}`,
        `Outdoor areas: ${cctvDetails.outdoorAreas || '0'}`,
        `Night coverage needed: ${cctvDetails.nightCoverage || 'Not provided'}`,
        `Recording duration: ${cctvDetails.recordingDays || 'Not provided'} days`,
        `Remote viewing / off-site backup: ${cctvDetails.remoteBackup || 'Not provided'}`,
        `Access-controlled doors: ${cctvDetails.accessDoors || '0'}`,
        `Internet available onsite: ${cctvDetails.internetReady || 'Not provided'}`,
        `Recommended camera points: ${estimate.breakdown.cctvRecommendedCameraCount}`,
        `Recommended recorder: ${estimate.breakdown.cctvRecorderChannels}-channel recorder`,
        `Recommendation notes: ${estimate.breakdown.cctvRecommendationNotes.join('; ') || 'Subject to final site assessment'}`,
        `Call-out zone: ${activeZone.label}`
      );
      if (travelEstimate) {
        lines.push(
          `Travel destination: ${travelEstimate.destination}`,
          `Driving distance: ${travelEstimate.oneWayKm}km one way / ${travelEstimate.roundTripKm}km return`,
          `Travel calculation: ${currency(travelEstimate.baseCallout)} base + ${travelEstimate.excessRoundTripKm} excess return km at ${currency(travelEstimate.ratePerKm)}/km`,
          `Calculated travel fee: ${currency(travelEstimate.travelFee)}`
        );
      }
    }

    if (isWifiBuilder) {
      lines.push(
        `Additional access points / mesh nodes: ${accessPointCount}`,
        `Preferred hardware: ${selectedApQuality.label}`,
        `Selected AP reference: ${selectedApQuality.sku} (${selectedApQuality.agentLabel})`,
        `Installation complexity: ${selectedComplexity.label}`,
        `Estimated installation duration: ${estimate.breakdown.estimatedDuration || 'Subject to assessment'}`,
        `Installation labour estimate: ${currency(estimate.breakdown.installationLabour)}`,
        `Cabling profile: ${estimate.breakdown.cablingProfile.label}`,
        `Estimated cable length: ${estimate.breakdown.cableLengthMetres}m`,
        `Cabling reservation: ${estimate.breakdown.cablingReservations.map(item => `${item.label} - ${item.linkCount} link(s) at ${currency(item.fixedLinkPrice)} incl. ${item.includedMetresPerLink}m each; excess ${Math.round(item.excessMetres)}m at ${currency(item.clientRatePerMetre)}/m`).join('; ')}`,
        `Call-out zone: ${activeZone.label}`
      );
      if (travelEstimate) {
        lines.push(
          `Travel destination: ${travelEstimate.destination}`,
          `Driving distance: ${travelEstimate.oneWayKm}km one way / ${travelEstimate.roundTripKm}km return`,
          `Calculated travel fee: ${currency(travelEstimate.travelFee)}`
        );
      }
      if (estimate.breakdown.accommodationFlag) {
        lines.push('Long-distance flag: accommodation or custom travel planning may be required.');
      }
    }

    if (isHostingBuilder) {
      lines.push(
        `Hosting plan: ${selectedHostingProduct.label}`,
        `Domain requirement: ${domainAction === 'none' ? 'No domain needed' : domainAction === 'register' ? 'Register new domain' : domainAction === 'renew' ? 'Renew domain' : 'Transfer domain'}`,
        `Domain extension: ${selectedDomainProduct.extension}`
      );
      if (domainAction !== 'none') {
        lines.push(
          `Domain once-off: ${currency(estimate.breakdown.domainOnceOff)}`,
          `Annual upfront estimate incl. VAT: ${currency(estimate.annual)}`
        );
      }
    }
    if (isGoogleAdsBuilder) {
      lines.push(
        `Google Ads package: ${selectedGoogleAdsPackage.label}`,
        `${selectedGoogleAdsPackage.adSpend}`,
        'Advertising spend is paid separately to Google.'
      );
    }

    lines.push(
      '',
      `Selected options: ${selectedOptionLabels.length ? selectedOptionLabels.join(', ') : 'None selected'}`,
      `Delivery timing: ${deliveryPriority}`,
      `Commercial environment: ${commercialEnvironment}`,
      `Pricing basis: ${activeCatalogBuilder?.source || 'Onea commercial rate card'}`,
      `Expected final adjustment: within ${activeCatalogBuilder?.estimateTolerancePercent ?? 10}% if scope and supplied information remain unchanged`,
      `Estimated once-off excl. VAT: ${!estimate.pricingAvailable ? 'Confirmed quote required' : estimate.requiresCustomCallout ? 'Custom call-out required' : currency(estimate.onceOff)}`,
      estimate.pricingAvailable && !estimate.requiresCustomCallout ? `Estimated once-off incl. VAT: ${currency(estimate.onceOffInclVat)}` : '',
      estimate.pricingAvailable && estimate.monthly
        ? `Estimated monthly: ${currency(estimate.monthly)}/month excl. VAT; ${currency(estimate.monthlyInclVat)}/month incl. VAT (${estimate.breakdown.monthlyLineItems.map(item => item.label).join(', ')})`
        : estimate.pricingAvailable ? 'Monthly management: Not included / not required' : 'Monthly management: Confirmed quote required',
      '',
      'Please contact me to confirm final pricing and requirements.'
    );

    return lines.join('\n');
  };

  const requestBuilderQuote = () => {
    if (usesCallout && activeZone.id === '100+' && !travelEstimate) {
      setTravelError('Calculate the destination travel price before requesting the final quote.');
      setTravelDialogOpen(true);
      return;
    }
    const message = buildQuoteMessage();
    if (isWifiBuilder) {
      trackOneaEvent('installation_quote_generated', {
        service_type: activeBuilder.id,
        complexity_level: selectedComplexity.label,
        estimated_labour: estimate.breakdown.installationLabour,
        estimated_duration: estimate.breakdown.estimatedDuration,
        distance_zone: activeZone.label,
        once_off_total: estimate.onceOff,
        monthly_total: estimate.monthly,
      });
      trackOneaEvent('wifi_quote_submitted', {
        service_type: activeBuilder.id,
        complexity_level: selectedComplexity.label,
        estimated_labour: estimate.breakdown.installationLabour,
        estimated_duration: estimate.breakdown.estimatedDuration,
        distance_zone: activeZone.label,
        once_off_total: estimate.onceOff,
        monthly_total: estimate.monthly,
      });
    }
    trackOneaEvent('quote_request', {
      service_type: activeBuilder.id,
      package_name: activeBuilder.label,
      estimated_value: estimate.onceOff + estimate.monthly,
      once_off_total: estimate.onceOff,
      monthly_total: estimate.monthly,
      lead_source: 'pricing_solution_builder',
      access_point_count: isWifiBuilder ? accessPointCount : undefined,
      cable_length_metres: isWifiBuilder ? cableLengthMetres : undefined,
      access_point_quality: isWifiBuilder ? selectedApQuality.label : undefined,
      complexity_level: isWifiBuilder ? selectedComplexity.label : undefined,
      estimated_labour: isWifiBuilder ? estimate.breakdown.installationLabour : undefined,
      estimated_duration: isWifiBuilder ? estimate.breakdown.estimatedDuration : undefined,
      distance_zone: isWifiBuilder ? activeZone.label : undefined,
      hosting_plan: isHostingBuilder ? selectedHostingProduct.label : undefined,
      domain_action: isHostingBuilder ? domainAction : undefined,
      domain_extension: isHostingBuilder ? selectedDomainProduct.extension : undefined,
      google_ads_package: isGoogleAdsBuilder ? selectedGoogleAdsPackage.label : undefined,
      home_wifi_details: activeBuilder.id === 'wifi-home' ? homeWifiDetails : undefined,
    });
    onTalkToUs({
      service: activeBuilder.label,
      message,
    });
  };

  return (
    <div className="bg-background text-on-surface font-body-md">
      {isAgentMode && !hasLaunchPlatformSession && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white p-xl text-center">
          <div className="max-w-md">
            <p className="text-label-md font-bold uppercase tracking-[0.18em] text-primary">Launch Platform</p>
            <h1 className="mt-sm font-headline-md text-text-primary">Agent pricing requires login</h1>
            <p className="mt-sm text-on-surface-variant">Redirecting you to Launch Platform for authentication.</p>
            <Link to="/launch-platform?redirect=/pricing%3Fagent%3D1" className="mt-lg inline-flex rounded-full bg-primary px-xl py-md font-bold text-on-primary">
              Go to Login
            </Link>
          </div>
        </div>
      )}

      {/* ISP portal overlays */}
      <AnimatePresence>
        {ispPortal === 'telkom' && (
          <TelkomPortal onClose={() => setIspPortal(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ispPortal === 'openserve-isp' && (
          <OpenserveIspPortal onClose={() => setIspPortal(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {travelDialogOpen && (
          <motion.div
            className="fixed inset-0 z-[190] flex items-center justify-center bg-on-surface/45 p-md backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Calculate long-distance travel"
            onClick={event => {
              if (event.target === event.currentTarget) setTravelDialogOpen(false);
            }}
          >
            <motion.div
              className="w-full max-w-xl rounded-xl border border-border-subtle bg-white p-lg shadow-2xl sm:p-xl"
              initial={{ y: 28, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-md">
                <div>
                  <p className="text-label-md font-bold uppercase tracking-widest text-primary">100km+ travel estimate</p>
                  <h3 className="mt-xs font-headline-md text-text-primary">Where will the team travel?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTravelDialogOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-primary"
                  aria-label="Close travel calculator"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <label htmlFor="travel-destination" className="mt-lg block text-body-sm font-bold text-text-primary">
                Full destination address
              </label>
              <textarea
                id="travel-destination"
                value={travelAddress}
                onChange={event => {
                  setTravelAddress(event.target.value);
                  setTravelCoordinates(null);
                }}
                rows={3}
                placeholder="Street address, suburb, city and province"
                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
              />

              <div className="my-md flex items-center gap-sm text-[12px] uppercase tracking-widest text-on-surface-variant">
                <span className="h-px flex-1 bg-border-subtle" />
                or
                <span className="h-px flex-1 bg-border-subtle" />
              </div>

              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={travelLoading}
                className="flex w-full items-center justify-center gap-sm rounded-full border-2 border-primary px-lg py-sm font-bold text-primary disabled:opacity-50"
              >
                <span className="material-symbols-outlined">my_location</span>
                {travelCoordinates ? 'GPS location captured' : 'Use current GPS location'}
              </button>

              <div className="mt-md rounded-lg bg-soft-surface p-md text-body-sm text-on-surface-variant">
                <p><strong className="text-text-primary">Calculation:</strong> R2,250 covers travel up to 100km one way. Additional distance is calculated as a return trip at the SARS rate of R4.95/km, effective March 1, 2026.</p>
                <p className="mt-xs">The address or GPS point is sent securely for route calculation only. Accommodation is not included and will be confirmed separately if an overnight stay is necessary.</p>
              </div>

              {travelError && (
                <p className="mt-md rounded-lg border border-red-200 bg-red-50 p-sm text-body-sm text-red-700">{travelError}</p>
              )}

              <button
                type="button"
                onClick={calculateLongDistanceTravel}
                disabled={travelLoading || (!travelAddress.trim() && !travelCoordinates)}
                className="mt-lg w-full rounded-full bg-primary px-xl py-md font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {travelLoading ? 'Calculating live route...' : 'Calculate Travel Price'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl text-center">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Transparent Pricing</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary mb-md">Simple, Scalable Plans</h1>
            <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
              Use the public guide to compare starting prices, view live ISP options for connectivity, then build a tailored estimate with the Onea Solution Builder.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── ISP Provider Selection ── */}
      <section className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="grid grid-cols-1 items-center gap-xl rounded-2xl border border-onea-violet/20 bg-onea-violet/5 p-xl md:grid-cols-[1fr_auto]" delay={0.05}>
            <div>
              <span className="inline-block px-md py-xs bg-onea-violet/10 text-onea-violet rounded-full font-label-md text-label-md mb-md">Start here</span>
              <h2 className="font-headline-md text-text-primary mb-sm">Onea Solution Builder</h2>
              <p className="text-body-lg font-bold text-text-primary mb-sm">Build an estimated solution before requesting a final quote</p>
              <p className="text-on-surface-variant text-body-md max-w-3xl">
                Configure WiFi installation, managed IT, hosting, web development, cyber security, system integration, digital marketing or communications support. Estimates are for planning only and final pricing is subject to site assessment and confirmation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                document.getElementById('onea-solution-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center justify-center gap-sm rounded-full bg-onea-violet px-xl py-md font-bold text-white shadow-lg shadow-onea-violet/15 hover:bg-[#b80f88]"
            >
              Open Builder
              <span className="material-symbols-outlined text-[20px]">open_in_full</span>
            </button>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="grid grid-cols-1 gap-xl rounded-2xl border border-[#1a1a1a]/10 bg-[#fbfcf6] p-xl md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-block px-md py-xs bg-[#1a1a1a]/5 text-text-primary rounded-full font-label-md text-label-md mb-md">Apple Device Procurement</span>
              <h2 className="font-headline-md text-text-primary mb-sm">Get your Apple devices through Onea Africa</h2>
              <p className="text-on-surface-variant text-body-lg max-w-3xl">
                Browse MacBook, MacBook Neo, MacBook Pro, MacBook Air, Mac mini, Mac Studio, iMac, iPad, iPhone and individual Apple accessories. Select an exact ASBIS SKU to see its current Onea selling price.
              </p>
              <p className="mt-sm text-body-sm text-on-surface-variant">
                Final pricing, availability, configuration and delivery timelines are confirmed before quote approval.
              </p>
            </div>
            <Link
              to="/apple-device-procurement"
              className="inline-flex items-center justify-center gap-sm rounded-full bg-[#1a1a1a] px-xl py-md font-bold text-white hover:opacity-90"
            >
              View Apple Devices
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section id="pricing-overview" className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="text-center mb-xxl">
            <span className="inline-block px-md py-xs bg-onea-yellow/30 text-[#5f4d00] rounded-full font-label-md text-label-md mb-lg">Public Pricing Guide</span>
            <h2 className="font-headline-md text-text-primary mb-md">Compare starting points before building a quote</h2>
            <p className="text-on-surface-variant text-body-lg max-w-3xl mx-auto">
              These guide prices help clients understand budget range and service fit. Final pricing is configured in the Solution Builder or confirmed after a site and scope review.
            </p>
          </AnimatedSection>

          <div className="space-y-xxl">
            {publicPricingServices.map(service => (
              <section key={service.id} aria-labelledby={`${service.id}-pricing-heading`}>
                <div className="mb-lg flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[28px]" style={{ color: service.color }}>{service.icon}</span>
                      <h3 id={`${service.id}-pricing-heading`} className="font-headline-md text-text-primary">{service.label}</h3>
                    </div>
                    <p className="mt-xs text-body-md text-on-surface-variant">{service.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const targetBuilder =
                        service.id === 'connectivity'
                          ? 'wifi-business'
                          : service.id === 'it-services'
                            ? 'managed-it'
                            : service.id === 'digital-marketing'
                              ? 'marketing'
                              : 'communications';
                      selectBuilder(targetBuilder);
                    }}
                    className="inline-flex items-center justify-center gap-xs rounded-full border border-primary px-lg py-sm text-body-sm font-bold text-primary hover:bg-primary/5"
                  >
                    Configure {service.label}
                    <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
                  {service.tiers.map(tier => (
                    <article
                      key={`${service.id}-${tier.name}`}
                      className={`relative rounded-xl border bg-white p-lg ${
                        tier.highlight
                          ? 'border-primary shadow-lg ring-1 ring-primary/20'
                          : 'border-border-subtle'
                      }`}
                    >
                      {tier.highlight && (
                        <span className="absolute right-lg top-lg rounded-full bg-primary px-md py-xs text-[11px] font-bold uppercase tracking-widest text-on-primary">
                          Most requested
                        </span>
                      )}
                      <h4 className="pr-24 font-headline-sm text-[20px] text-text-primary">{tier.name}</h4>
                      <p className="mt-xs min-h-[44px] text-body-sm text-on-surface-variant">{tier.tagline}</p>
                      <p className="mt-md text-[30px] font-extrabold text-text-primary">{tier.price}</p>
                      <p className="mt-xs text-[12px] text-on-surface-variant">Guide price in ZAR excluding VAT. The builder shows VAT-inclusive totals before submission.</p>
                      {isAgentMode
                        && hasLaunchPlatformSession
                        && 'priceId' in tier
                        && tier.priceId
                        && pricingCatalog?.tiers?.[tier.priceId]?.floorMonthly !== undefined && (
                        <div className="mt-sm rounded-lg border border-onea-violet/20 bg-onea-violet/5 p-sm text-[12px] text-on-surface-variant">
                          <div className="flex justify-between gap-sm">
                            <span>Internal floor</span>
                            <strong className="text-text-primary">{currency(pricingCatalog.tiers[tier.priceId].floorMonthly!)}</strong>
                          </div>
                          {pricingCatalog.tiers[tier.priceId].displayMonthly !== undefined && (
                            <div className="mt-xs flex justify-between gap-sm">
                              <span>Negotiation band</span>
                              <strong className="text-text-primary">
                                {currency(pricingCatalog.tiers[tier.priceId].displayMonthly! - pricingCatalog.tiers[tier.priceId].floorMonthly!)}
                              </strong>
                            </div>
                          )}
                        </div>
                      )}
                      <ul className="mt-lg space-y-sm">
                        {tier.features.slice(0, 4).map(feature => (
                          <li key={feature} className="flex gap-sm text-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined mt-[1px] text-[16px] text-primary">check_circle</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {tier.features.length > 4 && (
                        <details className="mt-md rounded-lg border border-border-subtle bg-soft-surface p-sm">
                          <summary className="cursor-pointer text-body-sm font-bold text-text-primary">View more inclusions</summary>
                          <ul className="mt-sm space-y-xs">
                            {tier.features.slice(4).map(feature => (
                              <li key={feature} className="flex gap-sm text-body-sm text-on-surface-variant">
                                <span className="material-symbols-outlined mt-[1px] text-[15px] text-primary">add_circle</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="text-center mb-xxl">
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Internet Service Providers</span>
            <h2 className="font-headline-md text-text-primary mb-md">Choose a connectivity provider path</h2>
            <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
              For fibre and LTE enquiries, view available ISP packages first. Managed WiFi, cabling, access points and support can still be configured through Onea.
            </p>
          </AnimatedSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-xl max-w-5xl mx-auto" stagger={0.08}>
            {ISP_PROVIDERS.map(isp => (
              <StaggerItem key={isp.id}>
                <motion.button
                  onClick={() => {
                    setIspPortal(isp.id);
                    setComingSoon(null);
                  }}
                  className="w-full text-left group"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                >
                  <div
                    className="rounded-2xl border-2 p-xl h-full flex flex-col items-center text-center transition-all"
                    style={{ borderColor: `${isp.color}30`, background: `${isp.color}06` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isp.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${isp.color}22`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${isp.color}30`; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  >
                    <div className="mb-lg inline-flex min-h-[72px] items-center justify-center rounded-full border border-white/90 bg-white/95 px-xl py-md shadow-sm">
                      <img
                        src={isp.logoSrc}
                        alt={isp.logoAlt}
                        className="max-h-10 w-auto object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `linear-gradient(135deg, ${isp.color}, ${isp.accent})` }}
                    >
                      <span className="material-symbols-outlined text-[36px] text-white">{isp.icon}</span>
                    </div>
                    <h3 className="font-headline-md text-[22px] mb-sm" style={{ color: isp.color }}>{isp.name}</h3>
                    <p className="text-on-surface-variant text-body-md mb-xl flex-1">{isp.tagline}</p>
                    <span
                      className="inline-flex items-center gap-sm px-xl py-md rounded-full font-bold text-white text-body-md"
                      style={{ background: `linear-gradient(135deg, ${isp.color}, ${isp.accent})` }}
                    >
                      Apply Now
                      <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                    </span>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <AnimatePresence>
            {comingSoon && (
              <motion.div
                className="mt-xxl rounded-2xl border border-border-subtle bg-soft-surface p-xl md:p-xxl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-[40px] text-primary mb-md block">construction</span>
                <h3 className="font-headline-md text-text-primary mb-sm">
                  {ISP_PROVIDERS.find(i => i.id === comingSoon)?.name} Packages
                </h3>
                <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-xl">
                  Packages coming soon. Talk to our team for current availability and pricing in your area.
                </p>
                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <motion.button
                    onClick={() => onTalkToUs()}
                    className="bg-primary text-on-primary px-xl py-md rounded-full font-bold"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Talk to Our Team
                  </motion.button>
                  <button
                    onClick={() => setComingSoon(null)}
                    className="border-2 border-border-subtle text-on-surface-variant px-xl py-md rounded-full font-bold hover:border-primary hover:text-primary transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Onea Solution Builder */}
      <section id="onea-solution-builder" className="scroll-mt-24 py-xxl border-b border-border-subtle bg-soft-surface">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="text-center mb-xxl" delay={0.05}>
            <span className="inline-block px-md py-xs bg-onea-violet/10 text-onea-violet rounded-full font-label-md text-label-md mb-lg">Onea Solution Builder</span>
            {isAgentMode && hasLaunchPlatformSession && (
              <span className="ml-sm inline-flex items-center gap-xs rounded-full bg-onea-violet px-md py-xs text-label-md font-bold text-white">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                Agent breakdown active
              </span>
            )}
            <h2 className="font-headline-md text-text-primary mb-md">Build an estimated solution before requesting a final quote</h2>
            <p className="text-on-surface-variant text-body-lg max-w-3xl mx-auto">
              Configure Onea's technology, connectivity, creative, communications and managed services using current market anchors and Onea delivery rates. Accurate answers are designed to produce a near-final commercial estimate before submission.
            </p>
          </AnimatedSection>

          <div className={`grid grid-cols-1 gap-xl items-start ${
            builderConfiguratorOpen
              ? 'fixed inset-0 z-[80] overflow-y-auto bg-soft-surface px-md py-xl sm:px-xl lg:grid-cols-[1.05fr_0.95fr]'
              : ''
          }`}>
            {builderConfiguratorOpen && (
              <button
                type="button"
                onClick={() => setBuilderConfiguratorOpen(false)}
                className="fixed right-md top-md z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-text-primary shadow-lg border border-border-subtle hover:border-primary"
                aria-label="Close configurator"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            )}
            <div className="space-y-lg">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-md ${builderConfiguratorOpen ? 'hidden' : ''}`}>
                {visibleSolutionBuilders.map(builder => (
                  <button
                    key={builder.id}
                    type="button"
                    onClick={() => selectBuilder(builder.id)}
                    className={`text-left rounded-xl border-2 bg-white p-lg transition-all ${
                      activeBuilder.id === builder.id ? 'border-primary shadow-lg' : 'border-border-subtle hover:border-primary/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px] text-primary">{builder.icon}</span>
                    <h3 className="font-headline-sm text-[18px] text-text-primary mt-sm">{builder.label}</h3>
                    <p className="text-body-sm text-on-surface-variant mt-xs leading-relaxed">{builder.description}</p>
                    <span className="mt-md inline-flex items-center gap-xs text-body-sm font-bold text-primary">
                      Configure quote
                      <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className={`rounded-2xl border border-border-subtle bg-white p-xl ${builderConfiguratorOpen ? 'shadow-2xl' : 'hidden'}`}>
                <div className="flex items-start gap-md mb-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">{activeBuilder.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-text-primary">{activeBuilder.label}</h3>
                    <p className="text-on-surface-variant text-body-md mt-xs">{activeBuilder.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">Included</p>
                    {activeBuilder.id === 'wifi-home' ? (
                      <div className="space-y-sm">
                        <label className="block">
                          <span className="text-body-sm font-semibold text-text-primary">Property type</span>
                          <select
                            value={homeWifiDetails.propertyType}
                            onChange={event => setHomeWifiDetails(prev => ({ ...prev, propertyType: event.target.value }))}
                            className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                          >
                            <option value="">Select property type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Office / home office">Office / home office</option>
                            <option value="Guest house / lodge">Guest house / lodge</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-body-sm font-semibold text-text-primary">Rooms</span>
                          <input
                            type="number"
                            min={1}
                            value={homeWifiDetails.rooms}
                            onChange={event => setHomeWifiDetails(prev => ({ ...prev, rooms: event.target.value }))}
                            placeholder="Example: 4"
                            className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                        </label>
                        <label className="block">
                          <span className="text-body-sm font-semibold text-text-primary">Approximate floor size</span>
                          <input
                            type="text"
                            value={homeWifiDetails.floorSize}
                            onChange={event => setHomeWifiDetails(prev => ({ ...prev, floorSize: event.target.value }))}
                            placeholder="Example: 180 sqm"
                            className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                        </label>
                        <label className="block">
                          <span className="text-body-sm font-semibold text-text-primary">Coverage needed</span>
                          <select
                            value={homeWifiDetails.coverage}
                            onChange={event => setHomeWifiDetails(prev => ({ ...prev, coverage: event.target.value }))}
                            className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                          >
                            <option value="">Select coverage</option>
                            <option value="Indoor only">Indoor only</option>
                            <option value="Indoor and outdoor">Indoor and outdoor</option>
                            <option value="Garden / swimming pool / clubhouse">Garden / swimming pool / clubhouse</option>
                            <option value="Dead zones and weak signal areas">Dead zones and weak signal areas</option>
                          </select>
                        </label>
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-md text-body-sm text-on-surface-variant">
                          Labour and setup are included in the starting estimate. Final installation depends on site layout, cabling and hardware choice.
                        </div>
                      </div>
                    ) : (
                      isCctvBuilder ? (
                        <div className="space-y-sm">
                          <label className="block">
                            <span className="text-body-sm font-semibold text-text-primary">What type of property needs security?</span>
                            <select
                              value={cctvDetails.premisesType}
                              onChange={event => setCctvDetails(prev => ({ ...prev, premisesType: event.target.value }))}
                              className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                            >
                              <option value="">Select property type</option>
                              <option value="home">Home / townhouse</option>
                              <option value="retail">Retail shop / restaurant</option>
                              <option value="office">Office / small business</option>
                              <option value="warehouse">Warehouse / workshop</option>
                              <option value="school">School / guesthouse / lodge</option>
                              <option value="estate">Estate / campus / multiple buildings</option>
                            </select>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                            <label className="block">
                              <span className="text-body-sm font-semibold text-text-primary">Entrances / exits</span>
                              <input
                                type="number"
                                min={0}
                                value={cctvDetails.entrances}
                                onChange={event => setCctvDetails(prev => ({ ...prev, entrances: event.target.value }))}
                                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="text-body-sm font-semibold text-text-primary">Indoor areas</span>
                              <input
                                type="number"
                                min={0}
                                value={cctvDetails.indoorAreas}
                                onChange={event => setCctvDetails(prev => ({ ...prev, indoorAreas: event.target.value }))}
                                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="text-body-sm font-semibold text-text-primary">Outdoor areas</span>
                              <input
                                type="number"
                                min={0}
                                value={cctvDetails.outdoorAreas}
                                onChange={event => setCctvDetails(prev => ({ ...prev, outdoorAreas: event.target.value }))}
                                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                              />
                            </label>
                          </div>
                          <label className="block">
                            <span className="text-body-sm font-semibold text-text-primary">Do you need night or low-light coverage?</span>
                            <select
                              value={cctvDetails.nightCoverage}
                              onChange={event => setCctvDetails(prev => ({ ...prev, nightCoverage: event.target.value }))}
                              className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                            >
                              <option value="">Select night coverage</option>
                              <option value="yes">Yes, important after hours</option>
                              <option value="partial">Only at entrances / outside</option>
                              <option value="no">Mostly daytime coverage</option>
                            </select>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                            <label className="block">
                              <span className="text-body-sm font-semibold text-text-primary">How long should recordings be kept?</span>
                              <select
                                value={cctvDetails.recordingDays}
                                onChange={event => setCctvDetails(prev => ({ ...prev, recordingDays: event.target.value }))}
                                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                              >
                                <option value="7">7 days</option>
                                <option value="14">14 days</option>
                                <option value="30">30 days</option>
                                <option value="60">60+ days</option>
                              </select>
                            </label>
                            <label className="block">
                              <span className="text-body-sm font-semibold text-text-primary">Access-controlled doors</span>
                              <input
                                type="number"
                                min={0}
                                value={cctvDetails.accessDoors}
                                onChange={event => setCctvDetails(prev => ({ ...prev, accessDoors: event.target.value }))}
                                className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                              />
                            </label>
                          </div>
                          <label className="block">
                            <span className="text-body-sm font-semibold text-text-primary">Remote viewing and off-site backup?</span>
                            <select
                              value={cctvDetails.remoteBackup}
                              onChange={event => setCctvDetails(prev => ({ ...prev, remoteBackup: event.target.value }))}
                              className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                            >
                              <option value="">Select backup preference</option>
                              <option value="yes">Yes, I want remote viewing / backup</option>
                              <option value="no">No, local recording is enough</option>
                              <option value="unsure">Not sure, please advise</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-body-sm font-semibold text-text-primary">Is internet already available onsite?</span>
                            <select
                              value={cctvDetails.internetReady}
                              onChange={event => setCctvDetails(prev => ({ ...prev, internetReady: event.target.value }))}
                              className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                            >
                              <option value="">Select internet status</option>
                              <option value="yes">Yes, fibre or stable internet is available</option>
                              <option value="no">No, connectivity is needed too</option>
                              <option value="unsure">Not sure</option>
                            </select>
                          </label>
                        </div>
                      ) : (
                        <ul className="space-y-sm">
                          {activeBuilder.includes.map(item => (
                            <li key={item} className="flex items-start gap-sm text-body-md">
                              <span className="material-symbols-outlined text-primary text-[17px] mt-0.5">check_circle</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )
                    )}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">{isCctvBuilder ? 'Recommendation' : 'Add options'}</p>
                    {isCctvBuilder ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-lg">
                        <p className="text-body-sm font-semibold text-text-primary">Recommended starter design</p>
                        <div className="mt-md space-y-xs text-body-sm text-on-surface-variant">
                          <div className="flex justify-between gap-md"><span>Camera points</span><strong className="text-text-primary">{estimate.breakdown.cctvRecommendedCameraCount}</strong></div>
                          <div className="flex justify-between gap-md"><span>Recorder</span><strong className="text-text-primary">{estimate.breakdown.cctvRecorderChannels}-channel</strong></div>
                          <div className="flex justify-between gap-md"><span>Recording target</span><strong className="text-text-primary">{cctvDetails.recordingDays} days</strong></div>
                          <div className="flex justify-between gap-md"><span>Access doors</span><strong className="text-text-primary">{cctvDetails.accessDoors || 0}</strong></div>
                        </div>
                        <div className="mt-md space-y-xs">
                          {estimate.breakdown.cctvRecommendationNotes.map(note => (
                            <p key={note} className="flex items-start gap-sm text-body-sm text-on-surface-variant">
                              <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">check_circle</span>
                              {note}
                            </p>
                          ))}
                        </div>
                        {cctvDetails.internetReady === 'no' && (
                          <p className="mt-md rounded-lg border border-onea-yellow/40 bg-onea-yellow/10 p-sm text-body-sm text-on-surface-variant">
                            Connectivity should be quoted with the CCTV system for remote viewing and backup.
                          </p>
                        )}
                      </div>
                    ) : (
                    <div className="space-y-sm">
                      {displayedBuilderOptions.map(option => {
                        const catalogPrice = activeCatalogBuilder?.options?.[option.id];
                        const unavailable = !catalogPrice
                          || catalogPrice.availability === 'quote_required'
                          || catalogPrice.availability === 'unavailable';
                        return (
                        <label key={option.id} className={`flex items-start gap-sm rounded-lg border border-border-subtle p-md ${unavailable ? 'cursor-not-allowed opacity-65' : 'cursor-pointer hover:border-primary/40'}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedOptions[option.id])}
                            disabled={unavailable}
                            onChange={() => toggleBuilderOption(option.id)}
                            className="mt-1 accent-[#8CC444]"
                          />
                          <span className="flex-1">
                            <span className="block font-semibold text-text-primary">{option.label}</span>
                            <span className="block text-[12px] text-on-surface-variant">
                              {unavailable
                                ? 'Current price unavailable - request a confirmed quote'
                                : catalogPrice.displayMonthly
                                  ? `Adds ${currency(catalogPrice.displayMonthly)}/mo${option.quantity ? ' each' : ''} when selected`
                                  : catalogPrice.displayOnceOff
                                    ? `Adds ${currency(catalogPrice.displayOnceOff)}${option.quantity ? ' each' : ''} when selected`
                                    : option.dynamicPricing
                                    ? 'Calculated from the quantity, hardware and installation selections below'
                                    : 'Currently unavailable - contact Onea for a confirmed quote'}
                            </span>
                            {option.quantity && selectedOptions[option.id] && (
                              <span className="mt-sm block">
                                <span className="mb-xs block text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">{option.quantityLabel || 'Quantity'}</span>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={optionQuantities[option.id] || 1}
                                  onClick={event => event.stopPropagation()}
                                  onChange={event => {
                                    const nextValue = Math.max(1, Number(event.target.value) || 1);
                                    setOptionQuantities(prev => ({ ...prev, [option.id]: nextValue }));
                                  }}
                                  className="w-28 rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                                />
                              </span>
                            )}
                          </span>
                        </label>
                      )})}
                    </div>
                    )}
                  </div>
                </div>

                <div className="mt-xl rounded-xl border border-onea-violet/20 bg-onea-violet/5 p-lg">
                  <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Project details</p>
                  <div className="mt-md grid grid-cols-1 gap-md md:grid-cols-2">
                    <label className="block">
                      <span className="text-body-sm font-semibold text-text-primary">Timing</span>
                      <select
                        value={deliveryPriority}
                        onChange={event => setDeliveryPriority(event.target.value as 'standard' | 'priority' | 'urgent')}
                        className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                      >
                        <option value="standard">Standard</option>
                        <option value="priority">Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-body-sm font-semibold text-text-primary">Business type</span>
                      <select
                        value={commercialEnvironment}
                        onChange={event => setCommercialEnvironment(event.target.value as 'standard' | 'corporate' | 'regulated')}
                        className="mt-xs w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                      >
                        <option value="standard">Small or medium business</option>
                        <option value="corporate">Corporate</option>
                        <option value="regulated">Government or regulated</option>
                      </select>
                    </label>
                  </div>
                </div>

                {isWifiBuilder && (
                  <div className="mt-xl rounded-xl border border-primary/20 bg-primary/5 p-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                      <div>
                        <label htmlFor="access-point-count" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                          Additional access points / mesh nodes
                        </label>
                        <input
                          id="access-point-count"
                          type="number"
                          min={0}
                          max={50}
                          value={accessPointCount}
                          onChange={event => setAccessPointCount(Math.max(0, Math.min(50, Number(event.target.value) || 0)))}
                          className="mt-sm w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                        />
                        <p className="mt-xs text-body-sm text-on-surface-variant">
                          The number selected adjusts added hardware and cable-link pricing.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="access-point-quality" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                          Preferred hardware brand
                        </label>
                        <select
                          id="access-point-quality"
                          value={accessPointQuality}
                          onChange={event => setAccessPointQuality(event.target.value)}
                          className="mt-sm w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                        >
                          {ACCESS_POINT_QUALITY.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-sm rounded-lg border border-primary/20 bg-white p-md">
                          <p className="text-body-sm font-semibold text-text-primary">{selectedApQuality.label}</p>
                          <p className="mt-xs text-body-sm text-on-surface-variant">{selectedApQuality.agentLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-lg grid grid-cols-1 md:grid-cols-2 gap-lg border-t border-primary/20 pt-lg">
                      <div>
                        <label htmlFor="cable-length" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                          Estimated cable length
                        </label>
                        <input
                          id="cable-length"
                          type="number"
                          min={0}
                          max={5000}
                          value={cableLengthMetres}
                          onChange={event => setCableLengthMetres(Math.max(0, Math.min(5000, Number(event.target.value) || 0)))}
                          className="mt-sm w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-text-primary focus:border-primary focus:outline-none"
                        />
                        <p className="mt-xs text-body-sm text-on-surface-variant">
                          Data points include up to 30m per link. Extra cable is charged at R15/m indoor or R32/m outdoor.
                        </p>
                      </div>
                      <div className="rounded-lg border border-primary/20 bg-white p-md">
                        <p className="text-body-sm font-semibold text-text-primary">Current cabling rule</p>
                        <p className="mt-xs text-body-sm text-on-surface-variant">
                          {estimate.breakdown.cablingProfile.label}: {estimate.breakdown.cablingLinkCount} link{estimate.breakdown.cablingLinkCount === 1 ? '' : 's'} at approx. {Math.round(estimate.breakdown.averageCableLengthPerLink)}m each.
                        </p>
                        <div className="mt-xs space-y-xs text-body-sm text-on-surface-variant">
                          {estimate.breakdown.cablingReservations.map(item => (
                            <p key={item.key}>
                              {item.label}: {item.linkCount} link{item.linkCount === 1 ? '' : 's'} at {currency(item.fixedLinkPrice)} incl. {item.includedMetresPerLink}m each; {Math.round(item.excessMetres)}m extra at {currency(item.clientRatePerMetre)}/m.
                            </p>
                          ))}
                        </div>
                        <p className="mt-xs text-body-sm font-bold text-primary">
                          Cabling estimate: {currency(estimate.breakdown.cablingAllowance)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-lg border-t border-primary/20 pt-lg">
                      <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-sm">Installation complexity</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                        {COMPLEXITY_LEVELS.map(level => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => {
                              setComplexityLevel(level.id);
                              trackOneaEvent('installation_complexity_selected', {
                                service_type: activeBuilder.id,
                                complexity_level: level.label,
                              });
                            }}
                            className={`rounded-lg border p-md text-left transition-all ${
                              complexityLevel === level.id ? 'border-primary bg-white shadow-md' : 'border-border-subtle bg-white/80 hover:border-primary/40'
                            }`}
                          >
                            <span className="block font-semibold text-text-primary">{level.label}</span>
                            <span className="mt-xs block text-[12px] text-on-surface-variant">{level.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-lg border-t border-primary/20 pt-lg">
                      <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-sm">Site conditions</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                        {[
                          ['multiFloor', 'Multiple floors'],
                          ['ceilingAccess', 'Ceiling / roof access needed'],
                          ['wallDrilling', 'Wall drilling required'],
                          ['trunking', 'Conduit / trunking required'],
                          ['existingPoints', 'Existing network points available'],
                          ['rackInstall', 'Rack installation required'],
                          ['powerAvailable', 'Power available at AP locations'],
                          ['vlanGuest', 'Guest WiFi / VLAN setup'],
                          ['firewall', 'Managed switch / firewall configuration'],
                        ].map(([id, label]) => (
                          <label key={id} className="flex items-start gap-sm rounded-lg border border-border-subtle bg-white p-sm cursor-pointer hover:border-primary/40">
                            <input
                              type="checkbox"
                              checked={Boolean(installFactors[id])}
                              onChange={() => setInstallFactors(prev => ({ ...prev, [id]: !prev[id] }))}
                              className="mt-1 accent-[#8CC444]"
                            />
                            <span className="text-body-sm font-semibold text-text-primary">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isHostingBuilder && (
                  <div className="mt-xl rounded-xl border border-onea-violet/20 bg-onea-violet/5 p-lg">
                    <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">Hosting plan</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      {HOSTING_PRODUCTS.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setHostingProductId(product.id)}
                          className={`rounded-lg border px-md py-sm text-left transition-all ${
                            hostingProductId === product.id ? 'border-onea-violet bg-white shadow-md' : 'border-border-subtle bg-white/80 hover:border-onea-violet/40'
                          }`}
                        >
                          <span className="block font-semibold text-text-primary">{product.label}</span>
                          <span className="block text-primary font-bold">{currency(product.sellingMonthly)}/month</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-md text-body-sm text-on-surface-variant">
                      Customer pricing shows the final monthly selling price only.
                    </p>

                    <div className="mt-lg border-t border-onea-violet/20 pt-lg">
                      <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">Domain</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
                        {[
                          { id: 'none', label: 'No domain needed' },
                          { id: 'register', label: 'Register new domain' },
                          { id: 'renew', label: 'Renew domain' },
                          { id: 'transfer', label: 'Transfer domain' },
                        ].map(action => (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => setDomainAction(action.id as DomainAction)}
                            className={`rounded-lg border px-md py-sm text-left text-body-sm font-semibold transition-all ${
                              domainAction === action.id ? 'border-onea-violet bg-white shadow-md text-onea-violet' : 'border-border-subtle bg-white/80 text-on-surface-variant hover:border-onea-violet/40'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                      {domainAction !== 'none' && (
                        <label className="mt-md block">
                          <span className="mb-xs block text-body-sm font-semibold text-text-primary">Domain extension</span>
                          <select
                            value={domainExtension}
                            onChange={event => setDomainExtension(event.target.value)}
                            className="w-full rounded-lg border border-border-subtle bg-white px-md py-sm text-body-sm text-text-primary"
                          >
                            {XNEELO_DOMAIN_PRODUCTS.map(domain => (
                              <option key={domain.extension} value={domain.extension}>
                                {domain.extension} - register {currency(domain.registrationExVat)} / renew {currency(domain.renewalExVat)} excl. VAT
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {domainAction !== 'none' && (
                        <p className="mt-md text-body-sm text-on-surface-variant leading-relaxed">
                          {domainAction === 'transfer' && !selectedDomainProduct.freeTransfer
                            ? `${selectedDomainProduct.extension} transfer pricing is not published by xneelo and must be confirmed before submission.`
                            : `Domain ${domainAction} is charged at ${currency(domainAction === 'register' ? selectedDomainProduct.registrationExVat : domainAction === 'renew' ? selectedDomainProduct.renewalExVat : 0)} excluding VAT. ${selectedDomainProduct.billingPeriodYears === 2 ? 'The published period is two years.' : 'The published period is one year.'}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isGoogleAdsBuilder && (
                  <div className="mt-xl rounded-xl border border-primary/20 bg-primary/5 p-lg">
                    <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">Management package</p>
                    <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
                      {GOOGLE_ADS_PACKAGES.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setGoogleAdsPackageId(product.id)}
                          className={`rounded-lg border px-md py-md text-left transition-all ${
                            googleAdsPackageId === product.id ? 'border-primary bg-white shadow-md' : 'border-border-subtle bg-white/80 hover:border-primary/40'
                          }`}
                        >
                          <span className="block font-semibold text-text-primary">{product.label}</span>
                          <span className="mt-xs block text-primary font-bold">{currency(product.monthly)}/month</span>
                          <span className="mt-xs block text-[12px] text-on-surface-variant">{product.adSpend}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-md text-body-sm text-on-surface-variant">Advertising spend is paid separately to Google and remains under the client's control.</p>
                  </div>
                )}

                {usesCallout && (
                  <div className="mt-xl">
                    <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-md">Call-out zone from Pretoria</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      {CALLOUT_ZONES.map(zone => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => selectCalloutZone(zone.id)}
                          className={`rounded-lg border px-md py-sm text-left text-body-sm font-semibold transition-all ${
                            calloutZone === zone.id ? 'border-primary bg-primary/10 text-primary' : 'border-border-subtle bg-white text-on-surface-variant'
                          }`}
                        >
                          {zone.label}
                          <span className="block text-[12px] font-normal">
                            {zone.id === '100+'
                              ? travelEstimate
                                ? `${travelEstimate.oneWayKm}km one way - ${currency(travelEstimate.travelFee)} travel`
                                : 'Enter destination for a live price'
                              : 'Included in final estimate'}
                          </span>
                        </button>
                      ))}
                    </div>
                    {calloutZone === '100+' && travelEstimate && (
                      <div className="mt-md rounded-xl border border-primary/25 bg-primary/5 p-md">
                        <div className="flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold text-text-primary">Calculated travel: {currency(travelEstimate.travelFee)}</p>
                            <p className="mt-xs text-body-sm text-on-surface-variant">
                              {travelEstimate.oneWayKm}km one way, {travelEstimate.roundTripKm}km return. R2,250 base plus {travelEstimate.excessRoundTripKm} excess return km at {currency(travelEstimate.ratePerKm)}/km.
                            </p>
                            <p className="mt-xs text-[12px] text-on-surface-variant">
                              {travelEstimate.method === 'live_driving_route' ? 'Live driving route' : 'Estimated road distance'} to {travelEstimate.destination}.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTravelDialogOpen(true)}
                            className="shrink-0 rounded-full border border-primary px-md py-xs text-body-sm font-bold text-primary"
                          >
                            Change destination
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <aside className={`rounded-2xl border border-primary/25 bg-white p-xl shadow-xl lg:sticky lg:top-24 ${builderConfiguratorOpen ? '' : 'hidden'}`}>
              <span className="inline-flex items-center gap-xs rounded-full bg-primary/10 px-md py-xs text-label-md font-bold text-primary">
                <span className="material-symbols-outlined text-[16px]">calculate</span>
                Live estimate
              </span>
              <h3 className="font-headline-md text-text-primary mt-lg">{activeBuilder.label}</h3>
              <p className="text-on-surface-variant text-body-md mt-xs">
                {activeBuilder.id === 'website'
                  ? 'Estimated pricing. Final quote subject to site assessment and confirmation.'
                  : `Commercial estimate based on Onea's current rate card and the scope selected below.`}
              </p>

              {estimate.pricingAvailable && activeCatalogBuilder?.estimateTolerancePercent !== undefined && (
                <div className="mt-lg rounded-xl border border-primary/25 bg-primary/5 p-md">
                  <p className="font-bold text-text-primary">Near-final price confidence</p>
                  <p className="mt-xs text-body-sm leading-relaxed text-on-surface-variant">
                    If the information supplied is accurate and the scope does not change, the final quote should normally remain within {activeCatalogBuilder.estimateTolerancePercent}% of this estimate. Supplier substitutions, media spend and undisclosed site conditions are excluded.
                  </p>
                </div>
              )}

              {!estimate.pricingAvailable && (
                <div className="mt-lg rounded-xl border border-onea-yellow/50 bg-onea-yellow/10 p-md">
                  <p className="font-bold text-text-primary">Confirmed pricing required</p>
                  <p className="mt-xs text-body-sm leading-relaxed text-on-surface-variant">
                    {pricingCatalogError
                      ? pricingCatalogError
                      : usesCallout && activeZone.id === '100+' && !travelEstimate
                        ? 'Enter the destination address or GPS location to calculate the 100km+ travel price.'
                      : estimate.unavailableSelections.length
                        ? `A verified price is not currently available for: ${estimate.unavailableSelections.map(option => option.label).join(', ')}.`
                        : 'The current rate card could not verify this configuration.'}
                    {' '}Onea will confirm the exact supplier or rate-card price before issuing a quote.
                  </p>
                </div>
              )}

              {activeBuilder.id === 'wifi-home' && (
                <div className="mt-lg rounded-xl border border-primary/20 bg-primary/5 p-md">
                  <p className="text-body-sm font-semibold text-text-primary">What this starting estimate includes</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant leading-relaxed">
                    Standard call-out, basic setup/configuration and a simple indoor WiFi assessment. Hardware, cabling, outdoor coverage and extra access points are added when selected.
                  </p>
                </div>
              )}

              <div className={`grid grid-cols-1 gap-md mt-xl ${estimate.pricingAvailable && estimate.monthly ? 'sm:grid-cols-2' : ''}`}>
                <div className="rounded-xl bg-soft-surface p-lg">
                  <p className="text-label-md uppercase tracking-widest text-on-surface-variant font-bold">Once-off excl. VAT</p>
                  <p className="text-[32px] font-extrabold text-text-primary mt-xs">
                    {!estimate.pricingAvailable ? 'Confirm quote' : estimate.requiresCustomCallout ? 'Custom' : currency(estimate.onceOff)}
                  </p>
                  {estimate.pricingAvailable && !estimate.requiresCustomCallout && (
                    <p className="mt-xs text-body-sm font-semibold text-on-surface-variant">
                      {currency(estimate.onceOffInclVat)} incl. VAT
                    </p>
                  )}
                </div>
                {estimate.pricingAvailable && estimate.monthly > 0 && (
                  <div className="rounded-xl bg-soft-surface p-lg">
                    <p className="text-label-md uppercase tracking-widest text-on-surface-variant font-bold">Monthly excl. VAT</p>
                    <p className="text-[32px] font-extrabold text-primary mt-xs">{currency(estimate.monthly)}/mo</p>
                    <p className="mt-xs text-body-sm font-semibold text-on-surface-variant">{currency(estimate.monthlyInclVat)}/mo incl. VAT</p>
                    <div className="mt-sm space-y-xs text-body-sm text-on-surface-variant">
                      {estimate.breakdown.monthlyLineItems.map(item => (
                        <div key={item.label} className="flex justify-between gap-md">
                          <span>{item.label}</span>
                          <strong className="text-text-primary">{currency(item.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isWifiBuilder && (
                <div className="mt-md rounded-xl border border-primary/20 bg-primary/5 p-md">
                  <p className="text-body-sm font-semibold text-text-primary">Installation estimate</p>
                  <div className="mt-xs space-y-xs text-body-sm text-on-surface-variant">
                    <div className="flex justify-between gap-md"><span>Hardware</span><strong className="text-text-primary">{currency(estimate.breakdown.wifiHardware)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Cabling</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingAllowance)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Call-out / Travel</span><strong className="text-text-primary">{estimate.requiresCustomCallout ? 'Custom' : currency(estimate.callout)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Installation Labour</span><strong className="text-text-primary">{currency(estimate.breakdown.installationLabour)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Setup & Configuration</span><strong className="text-text-primary">{currency(estimate.breakdown.configurationLabour)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Estimated duration</span><strong className="text-text-primary">{estimate.breakdown.estimatedDuration || 'Subject to assessment'}</strong></div>
                  </div>
                  <p className="mt-md text-[12px] text-on-surface-variant leading-relaxed">
                    Estimated installation time and pricing are subject to site assessment, infrastructure condition, access, distance, and final technical confirmation.
                  </p>
                </div>
              )}

              {isCctvBuilder && (
                <div className="mt-md rounded-xl border border-primary/20 bg-primary/5 p-md">
                  <p className="text-body-sm font-semibold text-text-primary">Recommended security design</p>
                  <div className="mt-xs space-y-xs text-body-sm text-on-surface-variant">
                    <div className="flex justify-between gap-md"><span>Camera points</span><strong className="text-text-primary">{estimate.breakdown.cctvRecommendedCameraCount}</strong></div>
                    <div className="flex justify-between gap-md"><span>Recorder</span><strong className="text-text-primary">{estimate.breakdown.cctvRecorderChannels}-channel</strong></div>
                    <div className="flex justify-between gap-md"><span>Cameras / installation allowance</span><strong className="text-text-primary">{currency(estimate.breakdown.cctvCameraAllowance)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Recorder / storage allowance</span><strong className="text-text-primary">{currency(estimate.breakdown.cctvNvrAllowance)}</strong></div>
                    {estimate.breakdown.cctvAccessControlAllowance > 0 && (
                      <div className="flex justify-between gap-md"><span>Access control allowance</span><strong className="text-text-primary">{currency(estimate.breakdown.cctvAccessControlAllowance)}</strong></div>
                    )}
                    <div className="flex justify-between gap-md"><span>Call-out / Travel</span><strong className="text-text-primary">{estimate.requiresCustomCallout ? 'Custom' : currency(estimate.callout)}</strong></div>
                  </div>
                  <p className="mt-md text-[12px] text-on-surface-variant leading-relaxed">
                    This recommendation is based on your answers. Final camera placement, storage and access-control design are confirmed after a site assessment.
                  </p>
                </div>
              )}

              {isHostingBuilder && domainAction !== 'none' && domainPriceAvailable && (
                <div className="mt-md rounded-xl border border-primary/20 bg-primary/5 p-md">
                  <p className="text-body-sm font-semibold text-text-primary">Domain and annual hosting estimate</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant leading-relaxed">
                    Domain {domainAction} for {selectedDomainProduct.extension} is {currency(estimate.breakdown.domainOnceOff)} once-off excluding VAT. Annual upfront estimate: 12 months hosting plus domain fee and 15% VAT = {currency(estimate.annual)}.
                  </p>
                </div>
              )}

              {isAgentMode && hasLaunchPlatformSession && (
                <div className="mt-xl rounded-xl border border-onea-violet/30 bg-onea-violet/5 p-md">
                  <div className="flex items-center gap-xs mb-md">
                    <span className="material-symbols-outlined text-onea-violet text-[18px]">admin_panel_settings</span>
                    <p className="text-body-sm font-bold text-text-primary">Agent breakdown</p>
                  </div>
                  <div className="space-y-xs text-body-sm text-on-surface-variant">
                    <div className="rounded-lg border border-onea-violet/20 bg-white/70 p-sm">
                      <p className="font-bold text-text-primary">Anchor and floor controls</p>
                      <div className="mt-xs flex justify-between gap-md">
                        <span>Pricing source</span>
                        <strong className="max-w-[65%] text-right text-text-primary">{estimate.breakdown.pricingSource || 'Pending Neo sign-off'}</strong>
                      </div>
                      <div className="mt-xs flex justify-between gap-md">
                        <span>Base once-off floor</span>
                        <strong className="text-text-primary">
                          {estimate.breakdown.baseFloorOnceOff === undefined ? 'Pending sign-off' : currency(estimate.breakdown.baseFloorOnceOff)}
                        </strong>
                      </div>
                      <div className="mt-xs flex justify-between gap-md">
                        <span>Base monthly floor</span>
                        <strong className="text-text-primary">
                          {estimate.breakdown.baseFloorMonthly === undefined ? 'Pending sign-off' : currency(estimate.breakdown.baseFloorMonthly)}
                        </strong>
                      </div>
                      {estimate.breakdown.baseFloorOnceOff !== undefined && estimate.breakdown.baseOnceOff > 0 && (
                        <div className="mt-xs flex justify-between gap-md">
                          <span>Base once-off negotiation band</span>
                          <strong className="text-text-primary">{currency(estimate.breakdown.baseOnceOff - estimate.breakdown.baseFloorOnceOff)}</strong>
                        </div>
                      )}
                      {estimate.breakdown.baseFloorMonthly !== undefined && estimate.monthly > 0 && (
                        <div className="mt-xs flex justify-between gap-md">
                          <span>Base monthly negotiation band</span>
                          <strong className="text-text-primary">{currency(activeBuilder.baseMonthly - estimate.breakdown.baseFloorMonthly)}</strong>
                        </div>
                      )}
                    </div>
                    {estimate.breakdown.baseItems.length > 0 ? (
                      <div className="rounded-lg border border-border-subtle bg-white/70 p-sm">
                        <div className="flex justify-between gap-md font-bold">
                          <span className="text-text-primary">Base once-off</span>
                          <strong className="text-text-primary">{currency(estimate.breakdown.baseOnceOff)}</strong>
                        </div>
                        <div className="mt-xs space-y-xs border-t border-border-subtle pt-xs">
                          {estimate.breakdown.baseItems.map(item => (
                            <div key={item.label} className="flex justify-between gap-md">
                              <span>{item.label}</span>
                              <strong className="text-text-primary">{currency(item.amount)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between gap-md"><span>Base once-off</span><strong className="text-text-primary">{currency(estimate.breakdown.baseOnceOff)}</strong></div>
                    )}
                    {usesCallout && <div className="flex justify-between gap-md"><span>Call-out</span><strong className="text-text-primary">{estimate.requiresCustomCallout ? 'Custom' : currency(estimate.callout)}</strong></div>}
                    <div className="flex justify-between gap-md"><span>Selected options once-off</span><strong className="text-text-primary">{currency(estimate.breakdown.optionOnceOff)}</strong></div>
                    <div className="flex justify-between gap-md"><span>Delivery / procurement adjustment</span><strong className="text-text-primary">{currency(estimate.breakdown.commercialAdjustmentOnceOff)}</strong></div>
                    {estimate.breakdown.optionLineItems.length > 0 && (
                      <div className="rounded-lg border border-border-subtle bg-white/70 p-sm">
                        <p className="font-bold text-text-primary">Selected option quantities</p>
                        {estimate.breakdown.optionLineItems.map(item => (
                          <div key={item.id} className="border-b border-border-subtle py-xs last:border-0">
                            <div className="flex justify-between gap-md">
                              <span>{item.label}{item.quantity > 1 ? ` x ${item.quantity}` : ''}</span>
                              <strong className="text-text-primary">{currency(item.onceOff + item.monthly)}</strong>
                            </div>
                            <div className="mt-[2px] flex justify-between gap-md text-[11px]">
                              <span>Floor / negotiation room</span>
                              <strong className="text-text-primary">
                                {item.floorOnceOff === undefined && item.floorMonthly === undefined
                                  ? 'Pending sign-off'
                                  : `${currency((item.floorOnceOff || 0) + (item.floorMonthly || 0))} / ${currency((item.onceOff + item.monthly) - ((item.floorOnceOff || 0) + (item.floorMonthly || 0)))}`
                                }
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {estimate.breakdown.optionLineItems.length > 0 && (
                      <div className="flex justify-between gap-md">
                        <span>Option floor coverage</span>
                        <strong className="text-text-primary">
                          {estimate.breakdown.optionFloorsComplete
                            ? `${currency(estimate.breakdown.optionFloorOnceOff + estimate.breakdown.optionFloorMonthly)} total floor`
                            : 'Some floors pending sign-off'}
                        </strong>
                      </div>
                    )}
                    {estimate.breakdown.optionMonthly > 0 && (
                      <div className="flex justify-between gap-md"><span>Selected options monthly</span><strong className="text-text-primary">{currency(estimate.breakdown.optionMonthly)}</strong></div>
                    )}
                    {estimate.breakdown.monthlyLineItems.length > 0 && (
                      <div className="rounded-lg border border-border-subtle bg-white/70 p-sm">
                        <p className="font-bold text-text-primary">Monthly line items</p>
                        {estimate.breakdown.monthlyLineItems.map(item => (
                          <div key={item.label} className="flex justify-between gap-md">
                            <span>{item.label}</span>
                            <strong className="text-text-primary">{currency(item.amount)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                    {isWifiBuilder && (
                      <>
                        <div className="flex justify-between gap-md"><span>AP quantity</span><strong className="text-text-primary">{accessPointCount} x {selectedApQuality.agentLabel}</strong></div>
                        <div className="flex justify-between gap-md"><span>AP SKU / supplier</span><strong className="text-text-primary">{selectedApQuality.sku} / {selectedApQuality.supplier}</strong></div>
                        <div className="flex justify-between gap-md"><span>AP selling price</span><strong className="text-text-primary">{currency(estimate.breakdown.wifiHardware)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cabling type</span><strong className="text-text-primary">{estimate.breakdown.cablingProfile.label}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cabling SKU</span><strong className="text-text-primary">{estimate.breakdown.cablingProfile.sku}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cable length</span><strong className="text-text-primary">{estimate.breakdown.cableLengthMetres}m</strong></div>
                        <div className="flex justify-between gap-md"><span>Cable links</span><strong className="text-text-primary">{estimate.breakdown.cablingLinkCount}</strong></div>
                        <div className="flex justify-between gap-md"><span>Avg. metres per link</span><strong className="text-text-primary">{Math.round(estimate.breakdown.averageCableLengthPerLink)}m</strong></div>
                        {estimate.breakdown.cablingReservations.map(item => (
                          <div key={item.key} className="flex justify-between gap-md">
                            <span>{item.key === 'indoor' ? 'Indoor reservation' : 'Outdoor reservation'}</span>
                            <strong className="text-text-primary">{item.linkCount} link{item.linkCount === 1 ? '' : 's'} + {Math.round(item.excessMetres)}m excess</strong>
                          </div>
                        ))}
                        <div className="flex justify-between gap-md"><span>Client cable link price</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingSellingPerLink)}</strong></div>
                        {estimate.breakdown.cablingReservations.map(item => (
                          <div key={`${item.key}-rate`} className="flex justify-between gap-md">
                            <span>{item.key === 'indoor' ? 'Indoor extra cable rate' : 'Outdoor extra cable rate'}</span>
                            <strong className="text-text-primary">{currency(item.clientRatePerMetre)}/m after {item.includedMetresPerLink}m</strong>
                          </div>
                        ))}
                        <div className="flex justify-between gap-md"><span>Cabling material selling</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingMaterialSelling)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cabling labour per link</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingLabourPerLink)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cabling labour</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingLabour)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Cabling allowance</span><strong className="text-text-primary">{currency(estimate.breakdown.cablingAllowance)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Labour package</span><strong className="text-text-primary">{estimate.breakdown.labourPackage?.label || 'Not applicable'}</strong></div>
                        <div className="flex justify-between gap-md"><span>Complexity</span><strong className="text-text-primary">{estimate.breakdown.selectedComplexity.label}</strong></div>
                        <div className="flex justify-between gap-md"><span>Configuration labour</span><strong className="text-text-primary">{currency(estimate.breakdown.configurationLabour)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Travel impact</span><strong className="text-text-primary">{currency(estimate.breakdown.travelImpact)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Specialist engineer time</span><strong className="text-text-primary">{currency(estimate.breakdown.specialistEngineer)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Installation labour total</span><strong className="text-text-primary">{currency(estimate.breakdown.installationLabour)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Estimated duration</span><strong className="text-text-primary">{estimate.breakdown.estimatedDuration}</strong></div>
                        {estimate.breakdown.accommodationFlag && (
                          <div className="flex justify-between gap-md"><span>Accommodation flag</span><strong className="text-text-primary">Review required</strong></div>
                        )}
                        <div className="mt-sm rounded-lg border border-border-subtle bg-white/70 p-sm">
                          <p className="font-bold text-text-primary">Internal hourly rates</p>
                          {estimate.breakdown.hourlyRates.map(rate => (
                            <div key={rate.role} className="flex justify-between gap-md">
                              <span>{rate.role}</span>
                              <strong className="text-text-primary">{rate.range}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {isHostingBuilder && (
                      <>
                        <div className="flex justify-between gap-md"><span>Hosting plan</span><strong className="text-text-primary">{selectedHostingProduct.label}</strong></div>
                        <div className="flex justify-between gap-md"><span>Selling monthly</span><strong className="text-text-primary">{currency(estimate.breakdown.hostingSellingMonthly)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Negotiation floor</span><strong className="text-text-primary">{estimate.breakdown.baseFloorMonthly === undefined ? 'Pending sign-off' : currency(estimate.breakdown.baseFloorMonthly)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Domain action</span><strong className="text-text-primary">{domainAction}</strong></div>
                        <div className="flex justify-between gap-md"><span>Domain once-off</span><strong className="text-text-primary">{currency(estimate.breakdown.domainOnceOff)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Annual subtotal</span><strong className="text-text-primary">{currency(estimate.breakdown.hostingAnnualSubtotal)}</strong></div>
                        <div className="flex justify-between gap-md"><span>VAT 15%</span><strong className="text-text-primary">{currency(estimate.breakdown.hostingAnnualVat)}</strong></div>
                        <div className="flex justify-between gap-md"><span>Annual total incl. VAT</span><strong className="text-text-primary">{currency(estimate.breakdown.hostingAnnualTotal)}</strong></div>
                      </>
                    )}
                  </div>
                  <p className="mt-md text-[12px] text-on-surface-variant">Visible only when the pricing page is opened with agent mode.</p>
                </div>
              )}

              <div className="mt-xl rounded-xl border border-onea-yellow/40 bg-onea-yellow/10 p-md">
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {activeBuilder.id === 'website'
                    ? 'This is a planning estimate to help you understand the likely once-off and monthly costs. Final pricing is confirmed after Onea Africa reviews your requirements, location and installation needs.'
                    : 'This is a planning estimate. Onea confirms the final price after reviewing your requirements.'}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={requestBuilderQuote}
                className="mt-xl w-full rounded-full bg-primary px-xl py-md font-bold text-on-primary hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Request Final Quote
              </motion.button>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl bg-soft-surface text-center">
        <div className="max-w-[700px] mx-auto px-xl">
          <AnimatedSection>
            <h2 className="font-headline-md text-text-primary mb-md">Need a custom bundle?</h2>
            <p className="text-on-surface-variant text-body-lg mb-xl">
              We design bespoke packages combining connectivity, digital marketing and PR for maximum impact. Let's talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <motion.button
                onClick={() => onTalkToUs()}
                className="bg-primary text-on-primary px-xl py-md rounded-full font-bold"
                whileHover={{ scale: 1.04, opacity: 0.9 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Talk to Our Team
              </motion.button>
              <Link to="/case-studies" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
                See Our Work
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
