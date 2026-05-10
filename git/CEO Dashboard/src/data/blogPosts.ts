export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: 'Connectivity' | 'Business' | 'Digital Marketing';
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'what-is-business-wifi',
    title: 'What is Business WiFi and Why Your SME Needs It',
    excerpt: 'Slow internet costs South African SMEs an average of 2.4 hours per employee per week. Here\'s how enterprise-grade WiFi changes the game.',
    body: `In 2026, reliable internet is not a luxury — it is the foundation of every South African business operation. Yet many SMEs are still running on residential DSL or shared mobile data, creating bottlenecks that cost money and productivity every single day.

**What makes business WiFi different?**

Business-grade WiFi differs from home internet in three critical ways:

1. **Dedicated bandwidth** — Your speeds are guaranteed, not shared with neighbouring premises.
2. **Managed access points** — Multiple access points ensure full coverage across your entire office, warehouse, or retail space.
3. **Service Level Agreement (SLA)** — Enterprise WiFi comes with uptime guarantees, typically 99.5%+, and dedicated support.

**The productivity cost of poor connectivity**

According to research by the International Data Corporation, employees at companies with poor internet connectivity lose an average of 2.4 hours per week to connectivity issues. For a 10-person team, that's 24 hours of lost productivity every week — equivalent to losing one employee's Monday every single week.

**WiFi-first vs. fibre-first**

Many businesses in South Africa's secondary cities don't yet have access to fibre infrastructure. That's where managed WiFi solutions using LTE or Openserve Fibre as a backhaul become invaluable — they bring enterprise-grade performance to any location.

**What to look for in a business WiFi provider**

- **National coverage** — Can they service your locations, including those outside major metros?
- **Managed service** — Do they monitor and maintain the network, or do you?
- **Scalability** — Can the solution grow as your team grows?
- **Support SLA** — What happens when something goes wrong at 9pm on a Friday?

At Onea Africa, we've deployed managed WiFi solutions for businesses from Pretoria to the Limpopo corridor. Get in touch to find out what the right solution looks like for your business.`,
    category: 'Connectivity',
    date: '2026-04-15',
    readTime: '5 min read',
    author: 'Neanivaro Mukwevho',
    authorRole: 'Founder & Director',
  },
  {
    id: 'bbee-why-it-matters-for-smes',
    title: 'B-BBEE Level 1: Why Your Supplier\'s Rating Matters More Than Ever',
    excerpt: 'South African businesses are increasingly scrutinising the B-BBEE status of their suppliers. Here\'s what choosing a Level 1 technology partner means for your scorecard.',
    body: `Broad-Based Black Economic Empowerment (B-BBEE) is a core pillar of South Africa's economic transformation agenda. For businesses that supply goods or services to corporates or government entities, their suppliers' B-BBEE ratings directly impact their own scorecard.

**How supplier ratings affect you**

Under the B-BBEE codes, Enterprise and Supplier Development (ESD) contributes 40 points to a company's scorecard — the single largest category. A portion of those points comes specifically from the B-BBEE levels of the suppliers you use.

When you choose a Level 1 B-BBEE supplier like Onea Africa, you receive full recognition for the spend with that supplier, which can meaningfully improve your own score.

**Practical implications for technology procurement**

Many technology procurement decisions are made purely on price or features. But in South Africa's regulatory environment, the B-BBEE status of your IT, connectivity, and digital marketing suppliers should also factor into the decision — especially for businesses that supply to government or listed companies.

**Our commitment to transformation**

Onea Africa is a proudly South African, black-owned technology company. Our Level 1 B-BBEE status means:

- 100% of spend with us qualifies toward your Supplier Development contribution.
- You're supporting an entity that reinvests in local communities and skills development.
- You're making a commercially sound decision that also advances economic transformation.

To request our B-BBEE certificate or discuss how our partnership can support your compliance reporting, contact us today.`,
    category: 'Business',
    date: '2026-03-28',
    readTime: '4 min read',
    author: 'Joyce Mukwevho',
    authorRole: 'Operations Lead',
  },
  {
    id: 'digital-marketing-signs-your-business-needs-help',
    title: '5 Signs Your Business Needs a Digital Marketing Strategy in 2026',
    excerpt: 'If your website hasn\'t generated a single lead this month, or your last Instagram post was in 2024, it\'s time for a digital rethink.',
    body: `South Africa has over 40 million internet users in 2026. If your business isn't visible online, you're invisible to almost half the country. Here are five clear signs you need to invest in digital marketing.

**1. Your website generates zero enquiries**

A website that exists but doesn't convert visitors into enquiries is a lost asset. Modern websites should load in under 3 seconds, be mobile-first, and have a clear call to action on every page. If yours isn't doing this, it's time for an audit.

**2. Your social media is sporadic or non-existent**

Inconsistent posting (or no posting at all) signals to potential customers that your business might not be active. In South Africa, Facebook, Instagram, and LinkedIn remain the primary platforms for SME visibility. A consistent presence builds trust and drives inbound leads.

**3. You rely entirely on word-of-mouth**

Word-of-mouth is valuable, but it's not scalable. Digital marketing extends your reach beyond your existing network to new prospects who are actively searching for what you offer. When someone Googles "IT support company Pretoria", will they find you?

**4. You don't know where your customers come from**

If you can't answer the question "which channel brings us the most new clients?", you don't have visibility into your marketing. Analytics tools, even free ones like Google Analytics, give you this data instantly.

**5. Your competitors are outranking you online**

Do a simple test: Google your core service plus your city. Are your competitors appearing above you? If yes, that's lost business every single day. SEO, paid search, and content marketing can change this within weeks.

**Where to start**

The most common mistake SMEs make is trying to be everywhere at once. Start with one or two channels — usually Google Search and one social platform — and do them well before expanding.

Onea Africa's Communicate division helps South African businesses build digital marketing foundations that convert visitors into clients. Let's talk about your business.`,
    category: 'Digital Marketing',
    date: '2026-03-10',
    readTime: '6 min read',
    author: 'Neanivaro Mukwevho',
    authorRole: 'Founder & Director',
  },
];
