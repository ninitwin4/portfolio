// Edit this file to update the visible portfolio content.

type HeroLink = {
  label: string
  href: string
}

export type Media =
  | {
      type: 'image'
      src: string
      alt: string
      width: number
      height: number
      caption?: string
    }
  | {
      type: 'video'
      src: string
      poster: string
      alt: string
      width: number
      height: number
      caption?: string
    }

export type ProjectSection = {
  title: string
  body: string[]
  figures?: Media[]
}

// A citable deposit of the project's code - a DOI-backed software record.
// Optional on every kind; omit it and the case-study page renders nothing.
type ProjectArchive = {
  // Leading word of the block, e.g. 'Archived'.
  status: string
  // Bare DOI. The page links it through doi.org.
  doi: string
  // One line under it: what the record is, and how it is licensed.
  note: string
}

// Shared by every project shape. These are the only fields the homepage card
// reads, so a new shape never means touching the card.
type ProjectBase = {
  slug: string
  title: string
  tagline: string
  tags: string[]
  year: string
  archive?: ProjectArchive
  thumbnail: Media
  // Falls back to the thumbnail when omitted.
  hero?: Media
  sections: ProjectSection[]
}

// `kind` decides the metadata around the story - which links appear, whether
// the meta strip shows a stack or a role. The story itself is always sections.
type EngineeringProject = ProjectBase & {
  kind: 'engineering'
  stack: string[]
  links: { live?: string; demo?: string; github?: string }
}

type FounderProject = ProjectBase & {
  kind: 'founder'
  role: string
  links: { website?: string }
}

type DesignProject = ProjectBase & {
  kind: 'design'
  role: string
  links: { live?: string; figma?: string }
}

export type Project = EngineeringProject | FounderProject | DesignProject

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
  // Right-hand column of the hero. Condensed from the About section - edit freely.
  intro: [
    'Co-founded a consumer app and scaled it from 0 to 2,000+ users, then led AI data operations at a robotics startup, growing the team from 25 operators to 130 across 10 sites.',
    'I think like a PM and build like an engineer. Currently deep in evaluation, agent tooling, and the messy parts of shipping AI that works.',
  ],
}

export const HERO_LINKS: HeroLink[] = [
  { label: 'GitHub', href: 'https://github.com/ninitwin4' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ni-ni-tin-win/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@journi_ni/shorts' },
  { label: 'Resume', href: '/resume' },
]

export const ABOUT = {
  paragraphs: [
    'I co-founded a consumer app and scaled it from 0 to 2,000+ users, then joined an AI robotics startup as an operator and was promoted within months to lead the team, helping grow the data operation from 25 operators to 130 across 10 sites.',
    'I think like a PM and build like an engineer. Recently: a full-stack voice AI agent shipped in a single day – FastAPI backend, 13 endpoints, 9 wired as agent tools across three live third-party APIs – and a matching engine whose tiered pipeline cut LLM calls 86%, validated with a custom eval harness.',
    'Three threads, one job: turning messy problems into systems that work – a data pipeline, a team, or a product. I do my best work where people run with a whole problem, not just their slice.',
    "If there's a problem to solve, I find a way.",
  ],
}

export const PROJECTS: Project[] = [
  {
    kind: 'engineering',
    slug: 'matching-engine',
    title: 'Matching Engine',
    tagline:
      'A domain-agnostic AI matching engine - one scoring core, any industry, from housing to healthcare.',
    tags: ['Python', 'FastAPI', 'Claude API', 'React', 'Evals'],
    year: '2026',
    stack: [
      'Python',
      'FastAPI',
      'Anthropic Claude API',
      'React',
      'Tailwind',
      'Vite',
      'pytest',
    ],
    links: {
      live: 'https://ninitwin4.github.io/matching-engine/',
      demo: 'https://www.youtube.com/watch?v=FQaMMsk5KHk',
      github: 'https://github.com/ninitwin4/matching-engine',
    },
    archive: {
      status: 'Archived',
      doi: '10.5281/zenodo.22699739',
      note: 'Citable software record on Zenodo · v1.1.0 · MIT licensed',
    },
    thumbnail: {
      type: 'image',
      src: '/projects/matching-engine/housing.png',
      alt: 'The Matching Engine interface showing a ranked list of roommate matches with explainable scores.',
      width: 1521,
      height: 1600,
    },
    sections: [
      {
        title: 'The Problem',
        body: [
          'Most matching products are built for a single vertical - a roommate app, a dating app, a hiring tool - with the matching logic fused to that one use case. Change the industry and you rewrite the engine.',
          'I wanted to separate the two: a generic scoring engine that knows only entities, attributes, constraints, and weights, and per-domain config files describing what those mean for a given industry. The engine is the product; each domain is a consumer.',
          'Housing is the first reference implementation. Healthcare - patient to therapist - is the second, added as a config file and seed data with the engine running unchanged.',
        ],
        figures: [
          {
            type: 'image',
            src: '/projects/matching-engine/healthcare.png',
            alt: 'The same engine scoring the healthcare domain, matching patients to therapists.',
            width: 1600,
            height: 1267,
            caption:
              'The same engine, a different config file: healthcare added without touching the scoring core.',
          },
        ],
      },
      {
        title: 'How It Works',
        body: [
          'Matching runs as a three-tier pipeline. Tier 0 filters on hard gates - location, licensure, gender requirements - so incompatible pairs are removed before scoring rather than ranked low. Tier 1 computes a deterministic 0-90 base score from structured attributes, combining hard constraints, similarity scoring where alike is better, and complementary scoring where one side’s strength fills the other’s need.',
          'Tier 2 is a bounded LLM nuance layer. It reads free-text bios for signal the structured fields cannot capture and applies a bonus of at most ±10 - hard-capped in code, not by prompt - to top candidates only, with graceful fallback to deterministic-only scoring if the model call fails.',
          'Scores are computed in both directions and the lower one is displayed. A match is only as strong as its least-enthusiastic side.',
        ],
      },
      {
        title: 'Key Decisions',
        body: [
          'A deterministic core with a bounded AI bonus, not an LLM verdict. The tempting build is to hand both profiles to a model and let it return a score. That is unexplainable and unstable across runs. Constraining the model to a capped adjustment on top of a deterministic base meant every score could be decomposed and shown to the user - base, AI delta, final - and a bad model day could never invert a ranking.',
          'Tiering the pipeline for cost, not just correctness. Running the LLM layer only on candidates that survive filtering and rank near the top cut LLM calls by 86% against a naive score-everything approach, with no measurable loss in match quality.',
          'Evals before features. The scoring logic is validated by an eval harness with authored golden pairs plus an LLM-judged groundedness check on the AI bonus. Every significant decision is recorded as an ADR in the repo, which is what made it safe to add a second domain without fear of silently regressing the first.',
        ],
      },
      {
        title: 'Security & Scope',
        body: [
          'I triaged security by risk rather than treating it as all-or-nothing. Handled: the API key lives in a gitignored environment file and is never committed, and the AI bonus is contained in code so it can never override a hard constraint.',
          'Planned before any public deployment: rate limiting on the LLM-backed endpoint so a public link cannot run up API cost, and deliberate input separation for prompt-injection handling on user-authored bios - the ±10 cap already limits the blast radius.',
          'Out of scope by design: authentication and PII. This is a portfolio demo on synthetic seed data. The healthcare domain demonstrates domain-agnosticism only - it is not a clinical product and makes no medical claims.',
        ],
      },
    ],
  },
  {
    kind: 'design',
    slug: 'cstu-veteran',
    title: 'CSTU Veteran Admissions',
    tagline:
      'Designed a veteran admissions site from scratch for a university newly approved to enroll veterans.',
    tags: ['Product Design', 'Information Architecture', 'Web', 'Figma'],
    year: '2023',
    role: 'Product Designer - sole designer, owned the project end to end from concept to launch',
    links: {
      live: 'https://www.cstu.edu/pages/admission/international_students/veteran.html?v=b5658dd8f1',
      figma:
        'https://www.figma.com/design/AppUFeekmfmiNTgMYyYNeT/CSTU-Veteran-Web?node-id=0-1&t=rNfJa0QvvkHnf70L-1',
    },
    thumbnail: {
      type: 'image',
      src: '/projects/cstu-veteran/landing.jpg',
      alt: 'The CSTU veteran education landing page shown on a laptop.',
      width: 1600,
      height: 788,
    },
    sections: [
      {
        title: 'The Problem',
        body: [
          'The university had just received approval to enroll veteran students but had nothing to point them to. Prospective veterans needed a clear path to eligibility, benefits, and applying - none of which existed yet.',
        ],
      },
      {
        title: 'What I Did',
        body: [
          'I started from a blank page: defined the site structure and content hierarchy, designed every screen, and worked through to launch.',
          'The core challenge was sitting between two sides - what veterans needed to know to apply, and what the university was required to present. I structured the site so the institution’s information landed in the order veterans actually needed it.',
        ],
        figures: [
          {
            type: 'image',
            src: '/projects/cstu-veteran/benefits.jpg',
            alt: 'The tuition benefits section listing GI Bill entitlements, above a section listing certificate, bachelor, and master programs.',
            width: 1600,
            height: 800,
            caption:
              'Benefits and GI Bill eligibility come before programs - the question veterans ask first, answered first.',
          },
          {
            type: 'image',
            src: '/projects/cstu-veteran/mobile.jpg',
            alt: 'The CSTU veteran page on mobile, showing the hero, headline, and Veterans at CSTU section.',
            width: 1073,
            height: 1300,
            caption: 'The same hierarchy carried through to mobile.',
          },
          {
            type: 'image',
            src: '/projects/cstu-veteran/in-context.jpg',
            alt: 'A veteran in uniform reading the CSTU veteran education page on a laptop.',
            width: 1600,
            height: 1280,
            caption: 'The launched site.',
          },
        ],
      },
    ],
  },
  {
    kind: 'founder',
    slug: 'chat-chin',
    title: 'Chat Chin',
    tagline:
      "Myanmar's first car-servicing app - roadside help, workshops, parts, and reviews in one place. Co-founded and grown to 2,000+ users.",
    tags: ['Founder', 'Product 0→1', 'Mobile', '2,000+ users'],
    year: '2019',
    role: 'Co-founder - product and design, end to end',
    links: { website: 'https://chat-chin.com' },
    thumbnail: {
      type: 'image',
      src: '/projects/chat-chin/cover.jpg',
      alt: 'The Chat Chin logo and app icon on a phone home screen.',
      width: 1600,
      height: 1000,
    },
    hero: {
      type: 'video',
      src: '/projects/chat-chin/motion-logo.mp4',
      poster: '/projects/chat-chin/cover.jpg',
      alt: 'The animated Chat Chin brand logo.',
      width: 1920,
      height: 1080,
    },
    sections: [
      {
        title: 'The Market Gap',
        body: [
          'I spent five years working in my family’s automotive business in Myanmar. In that time I kept seeing the same gap, and nobody was solving it.',
          'If your car broke down in the middle of the road, you were on your own. There was no reliable way to find a trustworthy workshop nearby, no way to know what a fair price looked like, no way to call for roadside help and know someone would actually come. For female drivers especially, that meant being stranded somewhere unfamiliar with no good options.',
          'The information existed - it was just scattered across word of mouth, Facebook pages, and whoever you happened to know. Nothing brought it together.',
        ],
      },
      {
        title: 'What We Built',
        body: [
          'I co-founded Chat Chin, Myanmar’s first car-servicing mobile app: a single place for everything to do with your car. Think Yelp, but for drivers.',
          'Location-based search to find what is actually near you. Roadside assistance when you are stranded. Listings for car workshops and parts retailers, with reviews and ratings so drivers could tell the good ones from the rest. Live fuel prices, insurance, and emergency services in one hub on the home screen.',
        ],
        figures: [
          {
            type: 'image',
            src: '/projects/chat-chin/homepage.png',
            alt: 'The Chat Chin app home screen with services, emergency, insurance, and fuel shortcuts.',
            width: 962,
            height: 1400,
            caption:
              'The home screen: every car-related need as one entry point, with live fuel prices surfaced up front.',
          },
          {
            type: 'image',
            src: '/projects/chat-chin/listing.png',
            alt: 'A Chat Chin workshop listing showing ratings, reviews, call and directions actions, and a map.',
            width: 962,
            height: 1400,
            caption:
              'A workshop listing - ratings, reviews, one-tap call and directions. The trust layer that did not exist before.',
          },
        ],
      },
      {
        title: 'Outcome',
        body: [
          'We took Chat Chin from concept to a live product with 2,000+ users. I owned product and design end to end - defining what to build, designing the experience, and shipping it into a market that had never had a product like it.',
        ],
      },
    ],
  },
]

function compact<T>(items: (T | '' | false | undefined | null)[]): T[] {
  return items.filter((item): item is T => Boolean(item))
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug)
}

// Each shape stores its own link fields; this flattens them into one ordered
// row so the case-study page renders every kind identically.
export function getProjectLinks(project: Project): HeroLink[] {
  switch (project.kind) {
    case 'engineering':
      return compact([
        project.links.demo && { label: 'Watch demo', href: project.links.demo },
        project.links.live && { label: 'Live site', href: project.links.live },
        project.links.github && { label: 'GitHub', href: project.links.github },
      ])
    case 'founder':
      return compact([
        project.links.website && {
          label: 'Visit site',
          href: project.links.website,
        },
      ])
    case 'design':
      return compact([
        project.links.live && { label: 'Live site', href: project.links.live },
        project.links.figma && { label: 'Figma', href: project.links.figma },
      ])
  }
}

export function getProjectMeta(project: Project): { label: string; value: string }[] {
  return [
    { label: 'Year', value: project.year },
    project.kind === 'engineering'
      ? { label: 'Stack', value: project.stack.join(' · ') }
      : { label: 'Role', value: project.role },
  ]
}

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
