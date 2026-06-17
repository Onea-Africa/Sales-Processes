import { blogPosts } from '../data/blogPosts';
import { caseStudies } from '../data/caseStudies';

export type PageMeta = {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
};

export type PrerenderLink = {
  href: string;
  label: string;
};

export type PrerenderSection = {
  title: string;
  body: string;
  items?: string[];
};

export type PrerenderShell = {
  eyebrow: string;
  headline: string;
  intro: string;
  highlights?: string[];
  primaryCta?: PrerenderLink;
  secondaryCta?: PrerenderLink;
  sections?: PrerenderSection[];
};

export const SITE_URL = 'https://onea.africa';

export function normalizePathname(pathname: string) {
  const trimmed = pathname.trim();
  if (trimmed === '' || trimmed === '/') return '/';
  const normalized = trimmed.replace(/\/+$/, '');
  if (normalized === '') return '/';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export const DEFAULT_META: PageMeta = {
  title: 'Onea Africa | Fibre, WiFi, IT Support & Digital Growth',
  description:
    'Onea Africa serves South African homes and businesses with fibre applications, WiFi installation, managed IT support, CCTV, digital marketing and communications services.',
  keywords:
    'Onea Africa, business fibre South Africa, WiFi installation, managed IT support, digital marketing agency, connectivity solutions',
  canonicalPath: '/',
};

const STATIC_ROUTE_META: Record<string, PageMeta> = {
  '/': DEFAULT_META,
  '/connectivity': {
    title: 'Business Fibre, WiFi & CCTV Solutions | Onea Africa',
    description:
      'Compare Openserve-aligned fibre, plan WiFi coverage, estimate cabling and request CCTV or access control support for South African homes and business sites.',
    keywords:
      'business WiFi South Africa, fibre internet Pretoria, Openserve fibre, Telkom partner, LTE connectivity, Onea Africa connectivity',
    canonicalPath: '/connectivity',
  },
  '/pricing': {
    title: 'Onea Solution Builder | Fibre, WiFi, CCTV and IT Pricing',
    description:
      'Build a planning estimate for WiFi installation, fibre packages, CCTV, cabling, IT support, hosting, web development and digital services before requesting a final quote.',
    keywords:
      'Onea Africa pricing, WiFi pricing South Africa, business internet packages, IT support pricing, digital marketing packages',
    canonicalPath: '/pricing',
  },
  '/telkom-application': {
    title: 'Telkom Application Form | Onea Africa',
    description:
      'Start the Onea Africa Telkom fibre or LTE application form online, choose a package, sign digitally and receive a submitted copy.',
    keywords:
      'Telkom application form, Telkom fibre application, Telkom LTE application, Onea Africa Telkom portal',
    canonicalPath: '/telkom-application',
  },
  '/solutions': {
    title: 'Solutions | Fibre, WiFi, IT, CCTV and Marketing | Onea Africa',
    description:
      'Explore Onea Africa services for Openserve fibre, LTE, home and business WiFi, managed IT support, CCTV, websites and corporate digital marketing.',
    keywords:
      'Onea Africa solutions, fibre Pretoria, LTE packages South Africa, WiFi extension, managed IT support, digital marketing Pretoria',
    canonicalPath: '/solutions',
  },
  '/solutions/openserve-business-fibre': {
    title: 'Openserve Business Fibre | Telkom Application Support | Onea Africa',
    description:
      'Compare Openserve, MetroFibre, Vumatel and Telkom-aligned fibre packages, then start the Onea Africa application process online.',
    keywords:
      'Openserve business fibre, Telkom fibre application, fibre packages Pretoria, Vumatel packages, MetroFibre packages, Onea Africa',
    canonicalPath: '/solutions/openserve-business-fibre',
  },
  '/solutions/lte-enterprise-packages': {
    title: 'LTE Enterprise Packages | Telkom LTE Internet | Onea Africa',
    description:
      'Review Telkom LTE data bundles, unlimited LTE and router options for business backup internet or primary wireless connectivity.',
    keywords:
      'Telkom LTE packages, LTE enterprise South Africa, business LTE backup, unlimited LTE, router add-on, Onea Africa',
    canonicalPath: '/solutions/lte-enterprise-packages',
  },
  '/solutions/home-wifi-networking': {
    title: 'Home WiFi Networking | Mesh WiFi and Router Setup | Onea Africa',
    description:
      'Improve home and small office WiFi coverage with router setup, mesh networking and fibre or LTE package guidance from Onea Africa.',
    keywords:
      'home WiFi networking, mesh WiFi Pretoria, WiFi extension, router setup, fibre WiFi, Onea Africa',
    canonicalPath: '/solutions/home-wifi-networking',
  },
  '/solutions/managed-it-support': {
    title: 'Managed IT Support | Helpdesk and Infrastructure | Onea Africa',
    description:
      'Managed IT support for South African teams, including helpdesk support, devices, hosting, backups, WiFi and connectivity operations.',
    keywords:
      'managed IT support Gauteng, IT helpdesk Pretoria, business IT support, hosting support, infrastructure support, Onea Africa',
    canonicalPath: '/solutions/managed-it-support',
  },
  '/solutions/corporate-digital-marketing': {
    title: 'Corporate Digital Marketing | SEO and Lead Funnels | Onea Africa',
    description:
      'Performance marketing, SEO landing pages, campaign assets and conversion tracking for South African businesses.',
    keywords:
      'corporate digital marketing, SEO Pretoria, lead generation South Africa, performance marketing, campaign tracking, Onea Africa',
    canonicalPath: '/solutions/corporate-digital-marketing',
  },
  '/blog': {
    title: 'Blog | Connectivity, IT and Marketing Insights | Onea Africa',
    description:
      'Read Onea Africa insights on business WiFi, connectivity, B-BBEE, digital marketing and practical technology decisions.',
    keywords:
      'Onea Africa blog, business WiFi tips, connectivity insights, B-BBEE SMEs, digital marketing South Africa',
    canonicalPath: '/blog',
  },
  '/case-studies': {
    title: 'Case Studies | Onea Africa Client Work',
    description:
      'See how Onea Africa supports clients with connectivity, digital platforms, marketing, IT infrastructure and business growth.',
    keywords:
      'Onea Africa case studies, connectivity projects, digital marketing case studies, South African business IT projects',
    canonicalPath: '/case-studies',
  },
  '/launch-platform': {
    title: 'Launch Platform | Onea Africa Secure Client Access',
    description:
      'Access Onea Africa managed client resources, Telkom application tools and secure operational dashboards.',
    keywords:
      'Onea Africa launch platform, client login, Telkom application portal, secure dashboard, managed resources',
    canonicalPath: '/launch-platform',
  },
  '/client-portal': {
    title: 'Client Portal | Fibre Support and Openserve Help | Onea Africa',
    description:
      'Log Onea Africa support requests, learn how to use the Openserve Connect app, top up Telkom prepaid fibre and request WiFi coverage extension help.',
    keywords:
      'Onea Africa client portal, Openserve Connect app, Telkom prepaid fibre top up, fibre support, WiFi extension Pretoria',
    canonicalPath: '/client-portal',
  },
  '/team': {
    title: 'Team | Onea Africa',
    description:
      'Meet the Onea Africa team behind our connectivity, IT infrastructure, digital marketing and public relations services.',
    keywords:
      'Onea Africa team, Onea Africa leadership, connectivity team Pretoria, IT services team Gauteng',
    canonicalPath: '/team',
  },
  '/careers': {
    title: 'Careers | Onea Africa',
    description:
      'Explore career opportunities at Onea Africa across connectivity, IT, marketing, support and operations.',
    keywords: 'Onea Africa careers, connectivity jobs South Africa, IT jobs Gauteng, marketing careers Pretoria',
    canonicalPath: '/careers',
  },
  '/apple-device-procurement': {
    title: 'Apple Device Procurement | Mac, iPad, iPhone and Accessories | Onea Africa',
    description:
      'Request Apple device and accessory quotes through Onea Africa, including MacBook, iMac, Mac mini, iPad, iPhone and setup support. Final pricing and availability are confirmed before quote approval.',
    keywords:
      'Apple device procurement South Africa, MacBook quote, iPad procurement, iPhone business devices, Apple accessories quote',
    canonicalPath: '/apple-device-procurement',
  },
  '/privacy': {
    title: 'Privacy Policy | Onea Africa',
    description: 'Read the Onea Africa privacy policy and how we handle personal information.',
    keywords: 'Onea Africa privacy policy, POPIA, personal information South Africa',
    canonicalPath: '/privacy',
  },
  '/terms': {
    title: 'Terms | Onea Africa',
    description: 'Read the terms and conditions for using Onea Africa services and website.',
    keywords: 'Onea Africa terms, terms and conditions, service terms',
    canonicalPath: '/terms',
  },
};

function normalizeText(value: string) {
  return value
    .replace(/â€”/g, '--')
    .replace(/â†’/g, '->')
    .replace(/â˜…/g, '*')
    .replace(/Ã—/g, 'x')
    .replace(/Â·/g, '-')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€“/g, '-');
}

function stripMarkdown(value: string) {
  return normalizeText(value)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^\-\s+/gm, '')
    .replace(/\r/g, '')
    .trim();
}

function firstParagraphs(value: string, count: number) {
  return stripMarkdown(value)
    .split(/\n{2,}/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean)
    .slice(0, count);
}

const BLOG_ROUTE_META = Object.fromEntries(
  blogPosts.map(post => [
    `/blog/${post.id}`,
    {
      title: `${post.title} | Onea Africa Blog`,
      description: post.excerpt,
      keywords: `Onea Africa blog, ${post.category}, ${post.title}, South Africa business insights`,
      canonicalPath: `/blog/${post.id}`,
    } satisfies PageMeta,
  ]),
);

const CASE_STUDY_ROUTE_META = Object.fromEntries(
  caseStudies.map(study => [
    `/case-studies/${study.id}`,
    {
      title: `${study.client} Case Study | Onea Africa`,
      description: study.desc,
      keywords: `Onea Africa case study, ${study.client}, ${study.division}, South Africa business growth`,
      canonicalPath: `/case-studies/${study.id}`,
    } satisfies PageMeta,
  ]),
);

const STATIC_PRERENDER_SHELLS: Record<string, PrerenderShell> = {
  '/': {
    eyebrow: 'Connect. Communicate. Converse.',
    headline: 'Business Connectivity, IT & Digital Growth Solutions',
    intro:
      'Onea Africa helps homes, SMEs, schools, guesthouses, offices and retail teams get connected, supported and visible online. Start with fibre, WiFi, IT support or digital growth, then request a quote when you are ready.',
    highlights: ['B-BBEE Level 1 contributor', 'Openserve and Telkom aligned paths', 'Fibre, WiFi, IT support, digital marketing and communications'],
    primaryCta: { href: '/pricing', label: 'Build an estimate' },
    secondaryCta: { href: '/connectivity', label: 'Explore services' },
    sections: [
      {
        title: 'Built for real business needs',
        body: 'Onea Africa combines connectivity, managed technology support and growth services in practical service paths for South African homes and businesses.',
        items: ['Business fibre and LTE guidance', 'WiFi design, cabling and onsite support', 'Managed IT, websites, Google Ads and communications support'],
      },
    ],
  },
  '/connectivity': {
    eyebrow: 'Connectivity',
    headline: 'Plan fibre, WiFi, CCTV and infrastructure with a clear commercial path.',
    intro:
      'Compare provider options, understand likely installation scope and move from a rough requirement to a near-final planning estimate before asking for a quote.',
    highlights: ['Openserve aligned application support', 'Home and business WiFi planning', 'Cabling, CCTV and access control estimate support'],
    primaryCta: { href: '/pricing', label: 'Open the solution builder' },
    secondaryCta: { href: '/telkom-application', label: 'Start a Telkom application' },
    sections: [
      {
        title: 'What Onea helps configure',
        body: 'The connectivity path covers fibre, LTE, WiFi design, cabling, CCTV, access control and the field realities that affect final installation pricing.',
        items: ['Address availability and provider path', 'Router, mesh, access point and coverage needs', 'Travel, site complexity and installation planning'],
      },
    ],
  },
  '/solutions': {
    eyebrow: 'Solutions',
    headline: 'Onea Africa solutions for homes, businesses and growing teams.',
    intro:
      'From reliable business fibre and LTE to managed WiFi, IT support and digital growth, Onea Africa helps clients connect better, work faster and get support when it matters.',
    highlights: ['Business fibre and LTE', 'Home and office WiFi', 'Managed IT support and digital growth'],
    primaryCta: { href: '/pricing', label: 'Compare starting prices' },
    secondaryCta: { href: '/client-portal', label: 'Get support help' },
    sections: [
      {
        title: 'Clear service paths',
        body: 'Public pages cover fibre, LTE, WiFi, managed IT support and digital marketing so that customers can understand the service before they speak to the team.',
        items: ['Openserve business fibre', 'LTE enterprise packages', 'Home WiFi networking', 'Managed IT support', 'Corporate digital marketing'],
      },
    ],
  },
  '/solutions/openserve-business-fibre': {
    eyebrow: 'Business Fibre',
    headline: 'Openserve business fibre guidance with a cleaner application path.',
    intro:
      'Compare fibre-aligned packages, understand provider constraints and prepare the right information before the Onea team confirms the final installation and commercial details.',
    highlights: ['Openserve and Telkom aligned path', 'Package comparison support', 'Application guidance from interest to submission'],
    primaryCta: { href: '/telkom-application', label: 'Apply for fibre' },
    secondaryCta: { href: '/pricing', label: 'View pricing guide' },
  },
  '/solutions/lte-enterprise-packages': {
    eyebrow: 'LTE',
    headline: 'LTE packages for backup internet, mobility and sites without fibre.',
    intro:
      'Review Telkom LTE data, unlimited options and hardware planning for business continuity, remote work and locations where fibre is not yet practical.',
    highlights: ['Primary or backup connectivity', 'Router and setup planning', 'Business continuity support'],
    primaryCta: { href: '/pricing', label: 'Compare LTE routes' },
    secondaryCta: { href: '/telkom-application', label: 'Start an LTE application' },
  },
  '/solutions/home-wifi-networking': {
    eyebrow: 'WiFi',
    headline: 'Home and office WiFi planned around real coverage, not guesswork.',
    intro:
      'Onea Africa helps fix dead zones, poor router placement and weak signal with mesh planning, access points, cabling and practical onsite support.',
    highlights: ['Dead zone diagnosis', 'Mesh and access point planning', 'Coverage extension for larger homes and offices'],
    primaryCta: { href: '/client-portal', label: 'Log a WiFi support request' },
    secondaryCta: { href: '/pricing', label: 'Estimate a WiFi project' },
  },
  '/solutions/managed-it-support': {
    eyebrow: 'Managed IT',
    headline: 'Managed IT support for growing teams that need one accountable partner.',
    intro:
      'Helpdesk, device support, hosting, backups, WiFi and day-to-day infrastructure support are packaged into practical commercial paths that fit SMEs and multi-site teams.',
    highlights: ['Helpdesk and device support', 'Hosting and infrastructure oversight', 'One support path instead of fragmented vendors'],
    primaryCta: { href: '/pricing', label: 'Compare support plans' },
    secondaryCta: { href: '/team', label: 'Meet the team' },
  },
  '/solutions/corporate-digital-marketing': {
    eyebrow: 'Digital Marketing',
    headline: 'Performance marketing for brands that need qualified leads.',
    intro:
      'Campaign strategy, SEO content, Google Ads, landing pages and conversion tracking work together so that businesses can move from scattered marketing to measurable demand.',
    highlights: ['Google Ads and search campaigns', 'Landing pages and content assets', 'Tracking tied to real lead intent'],
    primaryCta: { href: '/pricing', label: 'View marketing pricing' },
    secondaryCta: { href: '/team', label: 'See certifications and team' },
  },
  '/pricing': {
    eyebrow: 'Onea Solution Builder',
    headline: 'Simple, scalable plans with a route to a near-final estimate.',
    intro:
      'Use the public guide to compare starting prices, review live ISP options where available, and build a tailored estimate before requesting a final quote from Onea Africa.',
    highlights: ['Website and platform development from R6 500 once-off', 'Connectivity, WiFi, IT and marketing planning', 'Travel-aware installation estimates for long-distance projects'],
    primaryCta: { href: '/pricing', label: 'Build your estimate' },
    secondaryCta: { href: '/apple-device-procurement', label: 'Browse Apple procurement' },
    sections: [
      {
        title: 'What can be configured',
        body: 'The pricing route covers connectivity, WiFi, cabling, CCTV, hosting, websites, Google Ads, Apple devices and selected onsite service calculations.',
        items: ['Compare public starting prices', 'Use live availability where the site supports it', 'Request a final quote only after a clearer commercial estimate exists'],
      },
    ],
  },
  '/telkom-application': {
    eyebrow: 'Application',
    headline: 'Start a Telkom fibre or LTE application with the right details in one place.',
    intro:
      'Choose a package, complete the required customer information and move the application toward digital signing and provider submission.',
    highlights: ['Telkom and Openserve aligned package path', 'Digital signing support', 'Submitted copy and follow-up process'],
    primaryCta: { href: '/telkom-application', label: 'Open the application form' },
    secondaryCta: { href: '/pricing', label: 'Compare packages first' },
  },
  '/client-portal': {
    eyebrow: 'Client Portal',
    headline: 'Support, diagnostics and fibre help in one practical client route.',
    intro:
      'Log support requests, run the Onea Speed and WiFi Check, learn how to use the Openserve Connect app and request help with extending coverage.',
    highlights: ['Support request logging', 'Openserve app guidance', 'Prepaid fibre top-up and WiFi extension help'],
    primaryCta: { href: '/client-portal', label: 'Open client support' },
    secondaryCta: { href: '/connectivity', label: 'Return to connectivity planning' },
  },
  '/team': {
    eyebrow: 'Team',
    headline: 'The people behind Onea.',
    intro:
      'Meet the team supporting connectivity, IT infrastructure, digital marketing, communications and day-to-day delivery across the Onea Africa business.',
    highlights: ['Neo Mukwevho - Founder and Director', 'Joyce Mukwevho - Operations Lead', 'Yolanda Ndou - Finance and Compliance'],
    primaryCta: { href: '/careers', label: 'Explore careers' },
    secondaryCta: { href: '/pricing', label: 'View service pricing' },
  },
  '/careers': {
    eyebrow: 'Careers',
    headline: "Build Africa's digital future.",
    intro:
      'Onea Africa hires across connectivity, IT, field operations, support and communications as the business grows its national service footprint.',
    highlights: ['Field and technical support roles', 'Operations and service delivery', 'Marketing and communications opportunities'],
    primaryCta: { href: '/careers', label: 'View opportunities' },
    secondaryCta: { href: '/team', label: 'Meet the team' },
  },
  '/blog': {
    eyebrow: 'Insights',
    headline: 'The Onea Africa Blog',
    intro:
      'Read practical articles on connectivity, B-BBEE, digital marketing and business technology decisions for South African teams.',
    highlights: blogPosts.slice(0, 3).map(post => `${post.title} - ${post.date}`),
    primaryCta: { href: '/blog', label: 'Browse all articles' },
    secondaryCta: { href: '/pricing', label: 'Compare pricing' },
  },
  '/case-studies': {
    eyebrow: 'Case Studies',
    headline: 'Real client work across connectivity, IT and growth.',
    intro:
      'See how Onea Africa supports clients with better infrastructure, stronger digital presence and more reliable support models.',
    highlights: caseStudies.slice(0, 3).map(study => `${study.client} - ${study.tagline}`),
    primaryCta: { href: '/case-studies', label: 'Browse case studies' },
    secondaryCta: { href: '/team', label: 'Talk to the team' },
  },
  '/apple-device-procurement': {
    eyebrow: 'Apple Procurement',
    headline: 'Apple device procurement with business-friendly quoting support.',
    intro:
      'Request Mac, iPad, iPhone and accessory pricing through Onea Africa, with final availability, setup scope and delivery details confirmed before the quote is approved.',
    highlights: ['MacBook, iMac, Mac mini, iPad and iPhone support', 'Accessory and exact SKU quote requests', 'Business setup and deployment guidance'],
    primaryCta: { href: '/apple-device-procurement', label: 'Browse Apple devices' },
    secondaryCta: { href: '/pricing', label: 'Return to pricing guide' },
  },
  '/privacy': {
    eyebrow: 'Privacy',
    headline: 'How Onea Africa handles personal information.',
    intro:
      'Read the privacy policy for information on data handling, service communications and customer information protection.',
  },
  '/terms': {
    eyebrow: 'Terms',
    headline: 'Terms for using the Onea Africa website and services.',
    intro:
      'Read the commercial and website-use terms that frame requests, quotes, services and public site usage.',
  },
};

function getBlogShell(pathname: string): PrerenderShell | null {
  const normalizedPath = normalizePathname(pathname);
  const post = blogPosts.find(entry => `/blog/${entry.id}` === normalizedPath);
  if (!post) return null;

  return {
    eyebrow: post.category,
    headline: post.title,
    intro: normalizeText(post.excerpt),
    highlights: [post.date, post.readTime, `${post.author} - ${post.authorRole}`],
    primaryCta: { href: '/pricing', label: 'Compare services and pricing' },
    secondaryCta: { href: '/blog', label: 'Back to the blog' },
    sections: firstParagraphs(post.body, 2).map((paragraph: string, index: number) => ({
      title: index === 0 ? 'Overview' : 'Key point',
      body: paragraph,
    })),
  };
}

function getCaseStudyShell(pathname: string): PrerenderShell | null {
  const normalizedPath = normalizePathname(pathname);
  const study = caseStudies.find(entry => `/case-studies/${entry.id}` === normalizedPath);
  if (!study) return null;

  return {
    eyebrow: study.division,
    headline: study.tagline,
    intro: normalizeText(study.desc),
    highlights: [`${study.metric1.label}: ${normalizeText(study.metric1.value)}`, `${study.metric2.label}: ${normalizeText(study.metric2.value)}`],
    primaryCta: { href: '/pricing', label: 'Build an estimate' },
    secondaryCta: { href: '/case-studies', label: 'View more case studies' },
    sections: [
      {
        title: 'The challenge',
        body: normalizeText(study.challenge),
      },
      {
        title: 'How Onea responded',
        body: `Onea Africa combined ${study.strategies.map(strategy => normalizeText(strategy.title)).join(', ')} to create a practical delivery path for ${study.client}.`,
        items: study.strategies.map(strategy => normalizeText(strategy.title)),
      },
      {
        title: 'Result',
        body: normalizeText(study.resultsSummary),
      },
    ],
  };
}

export function getMeta(pathname: string): PageMeta {
  const normalizedPath = normalizePathname(pathname);
  if (STATIC_ROUTE_META[normalizedPath]) return STATIC_ROUTE_META[normalizedPath];
  if (BLOG_ROUTE_META[normalizedPath]) return BLOG_ROUTE_META[normalizedPath];
  if (CASE_STUDY_ROUTE_META[normalizedPath]) return CASE_STUDY_ROUTE_META[normalizedPath];

  return {
    title: 'Page Not Found | Onea Africa',
    description: 'The Onea Africa page you are looking for could not be found.',
    keywords: 'Onea Africa',
    canonicalPath: normalizedPath,
  };
}

export function shouldNoIndex(pathname: string, search = '') {
  const normalizedPath = normalizePathname(pathname);
  const isKnownPublicRoute = Boolean(
    STATIC_ROUTE_META[normalizedPath] || BLOG_ROUTE_META[normalizedPath] || CASE_STUDY_ROUTE_META[normalizedPath],
  );

  return (
    normalizedPath.startsWith('/launch-platform') ||
    normalizedPath.startsWith('/telkom-sign') ||
    normalizedPath.startsWith('/secure') ||
    new URLSearchParams(search).get('agent') === '1' ||
    !isKnownPublicRoute
  );
}

export function getCanonicalUrl(pathname: string) {
  const meta = getMeta(normalizePathname(pathname));
  return `${SITE_URL}${meta.canonicalPath === '/' ? '/' : meta.canonicalPath}`;
}

export function getPrerenderShell(pathname: string): PrerenderShell | null {
  const normalizedPath = normalizePathname(pathname);
  return STATIC_PRERENDER_SHELLS[normalizedPath] || getBlogShell(normalizedPath) || getCaseStudyShell(normalizedPath);
}

export function getPrerenderPaths() {
  return [
    ...Object.keys(STATIC_PRERENDER_SHELLS).filter(pathname => pathname !== '/launch-platform'),
    ...Object.keys(BLOG_ROUTE_META),
    ...Object.keys(CASE_STUDY_ROUTE_META),
  ];
}

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  name: 'Onea Africa',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: 'connect@onea.co.za',
  telephone: '+27694644663',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pretoria',
    addressRegion: 'Gauteng',
    addressCountry: 'ZA',
  },
  areaServed: 'South Africa',
  sameAs: [
    'https://www.facebook.com/ONEAAI',
    'https://twitter.com/ONEA_AFRICA',
    'https://www.instagram.com/onea_af',
    'https://www.linkedin.com/company/onea-africa',
  ],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Business fibre connectivity' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WiFi installation and managed networking' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Managed IT support' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Smart CCTV and access control estimates' } },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital marketing agency services' } },
  ],
};

const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What services does Onea Africa provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Onea Africa provides business fibre, LTE guidance, WiFi installation, managed IT support, digital marketing and communications services for South African homes and businesses.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Onea Africa help with WiFi installation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Onea Africa helps with router setup, mesh WiFi, access points, coverage planning and managed network support for homes, offices and business sites.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Onea Africa help with fibre and LTE packages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Onea Africa helps customers compare fibre and LTE options, choose a suitable package and complete the application path online.',
      },
    },
  ],
};

const PRICING_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Onea Africa pricing guide',
    itemListElement: [
      {
        '@type': 'Offer',
        position: 1,
        name: 'Connectivity packages',
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Service',
          name: 'Business WiFi, fibre and network infrastructure',
        },
      },
      {
        '@type': 'Offer',
        position: 2,
        name: 'Managed IT support packages',
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Service',
          name: 'Helpdesk, device support and managed IT infrastructure',
        },
      },
      {
        '@type': 'Offer',
        position: 3,
        name: 'Digital marketing packages',
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'Service',
          name: 'Social media, paid ads, content and campaign support',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are Onea Africa pricing estimates final quotes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Pricing shown on the Onea Africa pricing page is a planning estimate. Final pricing is confirmed after requirements, location, installation needs and VAT treatment are reviewed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I estimate WiFi, CCTV and cabling online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Onea Solution Builder helps estimate WiFi, CCTV, cabling, hosting, IT support and related services before requesting a formal quote.',
        },
      },
    ],
  },
];

function getBlogStructuredData(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const post = blogPosts.find(entry => `/blog/${entry.id}` === normalizedPath);
  if (!post) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Onea Africa',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: getCanonicalUrl(normalizedPath),
  };
}

function getCaseStudyStructuredData(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const study = caseStudies.find(entry => `/case-studies/${entry.id}` === normalizedPath);
  if (!study) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.tagline,
    description: study.desc,
    author: {
      '@type': 'Organization',
      name: 'Onea Africa',
    },
    about: study.client,
    mainEntityOfPage: getCanonicalUrl(normalizedPath),
  };
}

export function getStructuredData(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const items: object[] = [ORGANIZATION_SCHEMA];

  if (normalizedPath === '/') {
    items.push(HOME_FAQ_SCHEMA);
  }

  if (normalizedPath === '/pricing') {
    items.push(...PRICING_SCHEMA);
  }

  if (normalizedPath === '/case-studies') {
    items.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Onea Africa case studies',
      itemListElement: caseStudies.map((study, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getCanonicalUrl(`/case-studies/${study.id}`),
        name: study.client,
      })),
    });
  }

  const blogSchema = getBlogStructuredData(normalizedPath);
  if (blogSchema) items.push(blogSchema);

  const caseStudySchema = getCaseStudyStructuredData(normalizedPath);
  if (caseStudySchema) items.push(caseStudySchema);

  return items;
}
