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
  name: 'YOUR NAME',
  title: 'YOUR TITLE',
  tagline: 'TAGLINE GOES HERE',
}

export const HERO_LINKS: HeroLink[] = [
  { label: 'GitHub', href: 'https://github.com/YOUR-USERNAME' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/YOUR-PROFILE' },
  { label: 'Email', href: 'mailto:YOUR.EMAIL@example.com' },
  { label: 'Resume', href: '/resume.pdf' },
]

export const ABOUT = {
  text: 'ABOUT PARAGRAPH GOES HERE. Replace this with a short paragraph about who you are and what you build.',
}

export const PROJECTS: Project[] = [
  {
    id: 'project-one',
    title: 'PROJECT ONE',
    description: 'PROJECT ONE DESCRIPTION GOES HERE.',
    tech: ['TECH ONE', 'TECH TWO', 'TECH THREE'],
    repoUrl: 'https://github.com/YOUR-USERNAME/PROJECT-ONE',
    demoUrl: 'https://PROJECT-ONE-DEMO.example.com',
  },
  {
    id: 'project-two',
    title: 'PROJECT TWO',
    description: 'PROJECT TWO DESCRIPTION GOES HERE.',
    tech: ['TECH ONE', 'TECH TWO', 'TECH THREE'],
    repoUrl: 'https://github.com/YOUR-USERNAME/PROJECT-TWO',
    demoUrl: 'https://PROJECT-TWO-DEMO.example.com',
  },
]

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'timeline-one',
    title: 'MILESTONE ONE',
    date: 'DATE GOES HERE',
    description: 'MILESTONE ONE DESCRIPTION GOES HERE.',
  },
  {
    id: 'timeline-two',
    title: 'MILESTONE TWO',
    date: 'DATE GOES HERE',
    description: 'MILESTONE TWO DESCRIPTION GOES HERE.',
  },
  {
    id: 'timeline-three',
    title: 'MILESTONE THREE',
    date: 'DATE GOES HERE',
    description: 'MILESTONE THREE DESCRIPTION GOES HERE.',
  },
]

export const FOOTER_SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/YOUR-USERNAME' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/YOUR-PROFILE' },
  { label: 'Email', href: 'mailto:YOUR.EMAIL@example.com' },
]

// Blog files stay in app/blog. Set this to true and render BLOG_POSTS
// from app/page.tsx when you want to show blog links again.
export const BLOG_ENABLED = false

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'BLOG POST TITLE GOES HERE',
    description: 'BLOG POST DESCRIPTION GOES HERE.',
    link: '/blog/example-mdx-metadata',
    uid: 'blog-one',
  },
]
