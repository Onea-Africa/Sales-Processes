export interface Testimonial {
  id: string;
  name: string;
  initials: string;
  quote: string;
  role: string;
  service?: string;
  location?: string;
  rating?: number;
  logoUrl?: string;
  gradFrom: string;
  gradTo: string;
}

export const fallbackTestimonials: Testimonial[] = [
  {
    id: 'shepherd-removals',
    name: 'Shepherd Removals',
    initials: 'SR',
    gradFrom: '#EA2300',
    gradTo: '#38D4FB',
    logoUrl: '/clients/shepherd.png',
    quote: 'Onea Africa transformed our brand from the ground up - website, identity and digital presence. We look professional, we rank online, and our enquiries have doubled.',
    role: 'Director, Shepherd Removals & Deliveries',
  },
  {
    id: 'lekhuleni-telecoms',
    name: 'Lekhuleni Telecoms',
    initials: 'LT',
    gradFrom: '#8CC444',
    gradTo: '#8CC444',
    logoUrl: '/clients/lekhuleni.png',
    quote: 'Their managed hosting and connectivity solutions have been rock-solid. Zero downtime in 18 months. The team is responsive and genuinely understands telecoms.',
    role: 'CEO, Lekhuleni Telecoms & Projects',
  },
  {
    id: 'rachips',
    name: 'Rachips',
    initials: 'RC',
    gradFrom: '#8CC444',
    gradTo: '#F4D350',
    logoUrl: '/clients/rachips.png',
    quote: 'Onea built our social media presence from scratch. In 6 months we went from 200 followers to over 4,000 and started getting DM orders every week.',
    role: 'Founder, Rachips',
  },
];

function keyFor(testimonial: Pick<Testimonial, 'id' | 'name'>) {
  return (testimonial.id || testimonial.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mergeTestimonials(publicTestimonials: Testimonial[] = []) {
  const seen = new Set<string>();
  return [...publicTestimonials, ...fallbackTestimonials].filter(item => {
    const key = keyFor(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchPublicTestimonials(): Promise<Testimonial[]> {
  const response = await fetch('/api/testimonials-public.php', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => null);
  return Array.isArray(payload?.testimonials) ? payload.testimonials : [];
}
