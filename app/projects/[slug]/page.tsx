import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProjectMedia } from '@/components/project-media'
import { Container } from '@/components/container'
import {
  PROJECTS,
  getProject,
  getProjectLinks,
  getProjectMeta,
  type Media,
} from '@/app/data'

const MEDIA_SIZES = '(min-width: 640px) 640px, 100vw'

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) return {}

  const image =
    project.thumbnail.type === 'video'
      ? project.thumbnail.poster
      : project.thumbnail.src

  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description: project.tagline,
      url: `/projects/${slug}`,
      type: 'article',
      images: [{ url: image, alt: project.thumbnail.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.tagline,
      images: [image],
    },
  }
}

function Figure({ media, priority }: { media: Media; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <ProjectMedia
        media={media}
        sizes={MEDIA_SIZES}
        priority={priority}
        className="h-auto w-full"
      />
      {media.caption && (
        <figcaption className="border-t border-border px-4 py-3 text-sm text-muted">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) notFound()

  const links = getProjectLinks(project)
  const meta = getProjectMeta(project)
  const hero = project.hero ?? project.thumbnail

  return (
    <Container>
      <main className="space-y-12 pt-16">
        <header className="space-y-5">
        <Link
          className="inline-block text-sm text-muted transition-colors hover:text-accent"
          href="/#projects"
        >
          ← Back to projects
        </Link>

        <div className="space-y-3">
          <h1 className="text-4xl font-medium leading-tight text-balance text-foreground sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-lg text-muted">{project.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}

        {project.archive && (
          <div className="border-l-2 border-border pl-4 text-sm">
            <p className="font-medium text-foreground">
              {project.archive.status} · DOI{' '}
              <a
                href={`https://doi.org/${project.archive.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-accent"
              >
                {project.archive.doi}
              </a>
            </p>
            <p className="text-muted">{project.archive.note}</p>
          </div>
        )}
      </header>

      <Figure media={hero} priority />

      <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-2">
        {meta.map((row) => (
          <div key={row.label} className="space-y-1">
            <dt className="font-mono text-xs uppercase tracking-widest text-accent-violet">
              {row.label}
            </dt>
            <dd className="text-muted">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-14">
        {project.sections.map((section, index) => (
          <section key={section.title} className="space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-xs tracking-widest text-accent-violet">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="text-2xl font-medium text-foreground">
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            {section.figures && section.figures.length > 0 && (
              <div className="space-y-4 pt-2">
                {section.figures.map((figure) => (
                  <Figure key={figure.src} media={figure} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

        <div className="border-t border-border pt-6">
          <Link
            className="text-sm text-muted transition-colors hover:text-accent"
            href="/#projects"
          >
            ← Back to projects
          </Link>
        </div>
      </main>
    </Container>
  )
}
