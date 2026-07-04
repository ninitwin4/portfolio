// Edit this file to update the visible portfolio content.

type HeroLink = {
  label: string
  href: string
}

type Project = {
  id: string
  title: string
  description: string
  tech: string[]
  repoUrl: string
  demoUrl: string
}

type TimelineEntry = {
  id: string
  title: string
  date: string
  description: string
}

type SocialLink = {
  label: string
  href: string
}

type BlogPost = {
  title: string
  description: string
  link: string
  uid: string
}

export const HERO = {
  name: 'Ni Ni Tin Win',
  title: 'Building AI systems',
  tagline:
    'I care about making AI reliable - data quality, evaluation, and the human layer that makes models trustworthy.',
}

export const HERO_LINKS: HeroLink[] = [
  { label: 'GitHub', href: 'https://github.com/ninitwin4' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ni-ni-tin-win/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@journi_ni/shorts' },
]

export const ABOUT = {
  text: "Co-founded and shipped a mobile app to 2,000+ users, then moved from front-end design toward AI engineering. Along the way, I supported AI model training and became the primary troubleshooter for home robotics systems. I thrive in fast-evolving environments and I'm looking to make a measurable impact in the US AI ecosystem.",
}

export const PROJECTS: Project[] = [
  {
    id: 'matching-engine',
    title: 'Matching Engine',
    description:
      'An AI-native, domain-agnostic compatibility-matching engine built on a hybrid scoring model - a deterministic core plus a bounded LLM nuance layer - designed for explainable scores and an eval-first workflow. Applied LLM security practices: prompt-injection mitigation, input/output validation, and secure handling of API keys. Interactive front-end in React & TypeScript.',
    tech: ['Python', 'Anthropic Claude API', 'React', 'TypeScript', 'LLM'],
    repoUrl: 'https://github.com/ninitwin4/matching-engine',
    demoUrl: 'https://github.com/ninitwin4/matching-engine',
  },
  {
    id: 'chat-chin',
    title: 'Chat-Chin',
    description:
      "Co-founded Myanmar's first car-servicing app and grew it to 2,000+ users. Owned product and design end to end - from concept to a live product people used.",
    tech: ['Product', 'Startup', 'Mobile', '2,000+ users'],
    repoUrl: 'https://chat-chin.com',
    demoUrl: 'https://chat-chin.com',
  },
]

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'ai-systems-transition',
    title: 'Made the full transition to building AI systems',
    date: '2026',
    description: 'Deepening AI engineering.',
  },
  {
    id: 'ai-data-operations',
    title: 'AI Data Operations at a robotics company',
    date: '2024',
    description: 'Supported AI model training and robotics troubleshooting.',
  },
  {
    id: 'design-ai-products',
    title: 'Designed AI-adjacent product experiences',
    date: '2023',
    description:
      'Designed a veteran admissions portal; front-end design for an AI insights platform.',
  },
  {
    id: 'formal-design-study',
    title: 'Began formal study in product and graphic design',
    date: '2022',
    description: 'Studied in San Francisco.',
  },
  {
    id: 'chat-chin-founded',
    title: "Co-founded Chat-Chin, Myanmar's first car-servicing app",
    date: '2019',
    description: 'Grew the app to 2,000+ users.',
  },
]

export const FOOTER_SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/ninitwin4' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ni-ni-tin-win/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@journi_ni/shorts' },
]

// Blog files stay in app/blog. Set this to true and render BLOG_POSTS
// from app/page.tsx when you want to show blog links again.
export const BLOG_ENABLED = false

export const BLOG_POSTS: BlogPost[] = []
