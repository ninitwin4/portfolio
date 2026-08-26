import type { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/lib/constants'
import { PROJECTS } from './data'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: WEBSITE_URL,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...PROJECTS.map((project) => ({
      url: `${WEBSITE_URL}/projects/${project.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
