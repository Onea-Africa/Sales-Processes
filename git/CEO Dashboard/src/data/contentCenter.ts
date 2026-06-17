export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export type ContentType =
  | 'Blog'
  | 'Case Study'
  | 'Google Business Post'
  | 'LinkedIn Caption'
  | 'Campaign Brief'
  | 'Testimonial'
  | 'Job Advert';

export interface ContentCenterItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  category: string;
  targetAudience: string;
  status: ContentStatus;
  owner: string;
  dueDate: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  cta: string;
  internalNotes: string;
  updatedAt: string;
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

export const CONTENT_TYPE_OPTIONS: ContentType[] = [
  'Blog',
  'Case Study',
  'Google Business Post',
  'LinkedIn Caption',
  'Campaign Brief',
  'Testimonial',
  'Job Advert',
];

export const CONTENT_CATEGORY_OPTIONS = [
  'Connectivity',
  'Connect',
  'Communicate',
  'Converse',
  'WiFi',
  'Smart CCTV',
  'Managed IT',
  'Digital Marketing',
  'Website & Hosting',
  'Microsoft 365',
  'Case Study',
  'Campaign',
  'Testimonial',
  'Careers',
];

export const contentCenterSeed: ContentCenterItem[] = [
  {
    id: 'wifi-dead-zone-blog',
    type: 'Blog',
    title: 'Why WiFi Extenders Do Not Always Fix Dead Zones',
    slug: 'why-wifi-extenders-do-not-always-fix-dead-zones',
    category: 'WiFi',
    targetAudience: 'Homeowners, guesthouses, small offices and retail sites across South Africa',
    status: 'draft',
    owner: 'PR / Comms',
    dueDate: '2026-06-14',
    excerpt:
      'WiFi extenders can help in some homes, but dead zones often need better placement, cabling and access point planning.',
    body:
      'Many South African homes and small businesses try to fix poor WiFi by buying another extender. Sometimes that helps, but often it simply repeats a weak signal in another room.\n\nA proper WiFi plan starts with the layout, wall type, number of users, device load and where the fibre router is installed. In some cases a mesh system is enough. In larger homes, offices or guesthouses, properly cabled access points give a more stable result.\n\nOnea Africa helps clients plan WiFi coverage before they spend money on the wrong hardware.',
    seoTitle: 'Why WiFi Extenders Do Not Always Fix Dead Zones | Onea Africa',
    seoDescription:
      'Learn why WiFi extenders do not always solve dead zones and when a planned access point or mesh WiFi setup is a better option.',
    keywords: 'WiFi dead zones South Africa, WiFi extender, mesh WiFi, access point installation',
    cta: 'Plan My WiFi Coverage',
    internalNotes:
      'Public-safe. Do not mention supplier costs or internal cabling margins. Link CTA to /pricing?solution=wifi-home.',
    updatedAt: '2026-06-01',
  },
  {
    id: 'sme-managed-it-campaign',
    type: 'Campaign Brief',
    title: 'SME Managed IT Support Campaign',
    slug: 'sme-managed-it-support-campaign',
    category: 'Managed IT',
    targetAudience: 'South African SMEs with no internal IT department',
    status: 'review',
    owner: 'PR / Comms',
    dueDate: '2026-06-21',
    excerpt:
      'Position Onea Africa as the practical IT partner for small teams that need device, email, backup and support help.',
    body:
      'Campaign message: Practical IT support without hiring a full-time IT person.\n\nCore problems to call out: unreliable devices, unmanaged email, weak backups, slow support, unclear supplier handling and no single point of accountability.\n\nPrimary channels: LinkedIn, Google Business Profile and WhatsApp follow-up.\n\nMain CTA: Request IT Support.',
    seoTitle: 'Managed IT Support for South African SMEs | Onea Africa',
    seoDescription:
      'Onea Africa helps South African SMEs with practical IT support, Microsoft 365, device procurement, backups and support planning.',
    keywords: 'managed IT support South Africa, SME IT support, Microsoft 365 setup, business IT help',
    cta: 'Request IT Support',
    internalNotes:
      'Keep the campaign national. Gauteng can be used for on-site availability, but do not make the campaign Pretoria-only.',
    updatedAt: '2026-06-01',
  },
  {
    id: 'google-business-wifi-assessment',
    type: 'Google Business Post',
    title: 'Free WiFi Coverage Assessment',
    slug: 'google-business-wifi-coverage-assessment',
    category: 'WiFi',
    targetAudience: 'Home and business clients with weak WiFi coverage',
    status: 'draft',
    owner: 'PR / Comms',
    dueDate: '2026-06-07',
    excerpt:
      'Short Google Business post for WiFi dead zones, router placement, mesh and access point planning.',
    body:
      'Struggling with WiFi dead zones at home or work? Onea Africa helps plan proper WiFi coverage using the right access points, cabling and hardware for your space. Request a WiFi estimate today.',
    seoTitle: 'Free WiFi Coverage Assessment',
    seoDescription: 'Google Business post caption for WiFi coverage and access point planning.',
    keywords: 'WiFi coverage, WiFi assessment, access points',
    cta: 'Build an Estimate',
    internalNotes:
      'Pair with the generated WiFi Google Business visual. Do not include supplier names or internal pricing.',
    updatedAt: '2026-06-01',
  },
  {
    id: 'field-connectivity-technician',
    type: 'Job Advert',
    title: 'Field Connectivity Technician',
    slug: 'field-connectivity-technician',
    category: 'Connect',
    targetAudience: 'Pretoria, Gauteng',
    status: 'draft',
    owner: 'Operations / HR',
    dueDate: '',
    excerpt: 'Full-time',
    body:
      "Install, configure and maintain WiFi, fibre and CCTV systems for business clients. You'll work closely with the field operations team and represent Onea Africa on-site.",
    seoTitle: 'Field Connectivity Technician | Onea Africa Careers',
    seoDescription:
      'Field Connectivity Technician role at Onea Africa. Install and maintain WiFi, fibre and CCTV systems for business clients.',
    keywords: 'field technician jobs, WiFi installer, fibre technician, CCTV technician',
    cta: 'Apply Now',
    internalNotes:
      'Draft job advert. Apply button opens on the public careers page only after admin/uploader approval and publishing.',
    updatedAt: '2026-06-04',
  },
  {
    id: 'digital-marketing-specialist',
    type: 'Job Advert',
    title: 'Digital Marketing Specialist',
    slug: 'digital-marketing-specialist',
    category: 'Communicate',
    targetAudience: 'Remote / Pretoria',
    status: 'draft',
    owner: 'PR / Comms',
    dueDate: '',
    excerpt: 'Full-time',
    body:
      'Manage social media campaigns, content creation and paid digital advertising for a portfolio of SME clients. Data-driven thinker with a creative edge.',
    seoTitle: 'Digital Marketing Specialist | Onea Africa Careers',
    seoDescription:
      'Digital Marketing Specialist role at Onea Africa for social media campaigns, content and paid digital advertising.',
    keywords: 'digital marketing jobs, social media specialist, paid advertising jobs',
    cta: 'Apply Now',
    internalNotes:
      'Draft job advert. Apply button opens on the public careers page only after admin/uploader approval and publishing.',
    updatedAt: '2026-06-04',
  },
  {
    id: 'junior-pr-comms-officer',
    type: 'Job Advert',
    title: 'Junior PR & Comms Officer',
    slug: 'junior-pr-comms-officer',
    category: 'Converse',
    targetAudience: 'Pretoria, Gauteng',
    status: 'draft',
    owner: 'PR / Comms',
    dueDate: '',
    excerpt: 'Full-time',
    body:
      'Support media relations, write press releases and assist with stakeholder communications. Ideal for a recent graduate with a passion for storytelling and brand building.',
    seoTitle: 'Junior PR & Comms Officer | Onea Africa Careers',
    seoDescription:
      'Junior PR and communications role at Onea Africa for media relations, press releases and stakeholder communications.',
    keywords: 'PR jobs, communications officer, junior PR South Africa',
    cta: 'Apply Now',
    internalNotes:
      'Draft job advert. Apply button opens on the public careers page only after admin/uploader approval and publishing.',
    updatedAt: '2026-06-04',
  },
];
