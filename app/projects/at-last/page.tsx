import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Crimson_Pro, Italiana } from 'next/font/google'
import { AT_LAST } from '@/app/data'

// Web stand-ins for the client's licensed brand font (Masqualero). Loaded
// here, not in the root layout, so only this page pays for them.
const display = Italiana({
  variable: '--font-at-last-display',
  subsets: ['latin'],
  weight: '400',
})
const text = Crimson_Pro({
  variable: '--font-at-last-text',
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: AT_LAST.title,
  description: AT_LAST.subtitle,
  alternates: { canonical: '/projects/at-last' },
  openGraph: {
    title: AT_LAST.title,
    description: AT_LAST.subtitle,
    url: '/projects/at-last',
    type: 'article',
    images: [{ url: '/projects/at-last/thumb.jpg', alt: AT_LAST.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: AT_LAST.title,
    description: AT_LAST.subtitle,
    images: ['/projects/at-last/thumb.jpg'],
  },
}

// At Last palette (from the client's design system), used only on this page.
const olive = 'bg-[#63644F] text-[#EEE9E3]'
const linen = 'bg-[#EEE9E3] text-[#2B2622]'
const label =
  'text-xs uppercase tracking-[0.28em] [font-family:var(--font-at-last-text)]'
const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-8'
const displayFont = '[font-family:var(--font-at-last-display)]'

export default function AtLastPage() {
  return (
    <main
      className={`${display.variable} ${text.variable} [font-family:var(--font-at-last-text)] tracking-normal`}
    >
      <div className={linen}>
        <div className={`${wrap} py-5`}>
          <Link
            href="/#projects"
            className={`${label} text-[#57574A] transition-colors hover:text-[#2B2622]`}
          >
            ← Back to projects
          </Link>
        </div>
      </div>

      {/* Hero: photo panel + olive title panel, as in the investor materials. */}
      <section className={`grid md:grid-cols-[2fr_3fr] ${olive}`}>
        <div className="relative min-h-64 md:min-h-[480px]">
          <Image
            src="/projects/at-last/agave.jpg"
            alt="An agave field under a night sky in the high desert."
            fill
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 px-6 py-12 sm:px-12 lg:px-16">
          <p className={`${label} text-[#E4E1D6]`}>{AT_LAST.eyebrow}</p>
          <h1
            className={`${displayFont} text-6xl leading-none tracking-[0.06em] sm:text-7xl lg:text-8xl`}
          >
            {AT_LAST.title}
          </h1>
          <p className="max-w-xl text-xl leading-relaxed italic sm:text-2xl">
            {AT_LAST.subtitle}
          </p>
          <dl className="mt-2 grid gap-4 border-t border-[#8A8B74] pt-5 sm:grid-cols-3">
            {AT_LAST.meta.map((row) => (
              <div key={row.label}>
                <dt className={`${label} text-[#E4E1D6]`}>{row.label}</dt>
                <dd className="mt-1 text-lg">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={linen}>
        <div className={`${wrap} grid gap-14 py-16 sm:py-20`}>
          <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
            <h2 className={`${label} text-[#57574A]`}>About the project</h2>
            <p className="text-xl leading-relaxed italic sm:text-2xl">
              {AT_LAST.about}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-12">
            <div className="space-y-3">
              <h2 className={`${label} text-[#57574A]`}>My role</h2>
              <p className="text-lg italic">{AT_LAST.roleLead}</p>
            </div>
            <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {AT_LAST.role.map((item, index) => (
                <li
                  key={item.title}
                  className="flex flex-col border-t border-[#B5A99C] pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5"
                >
                  <span className={`${displayFont} text-3xl text-[#63644F]`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 flex-1 leading-relaxed">{item.body}</p>
                  <p
                    className={`${label} mt-4 border-t border-[#B5A99C] pt-3 text-[#57574A]`}
                  >
                    {item.tag}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-5">
            <h2 className={`${label} text-[#57574A]`}>Selected pages</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {AT_LAST.pages.map((page) => (
                <figure key={page.src} className="space-y-2">
                  <div className="overflow-hidden border border-[#B5A99C] bg-[#EEE9E3]">
                    <Image
                      src={page.src}
                      alt={page.alt}
                      width={page.width}
                      height={page.height}
                      sizes="(min-width: 640px) 560px, 100vw"
                      className="aspect-[16/9] h-auto w-full object-contain"
                    />
                  </div>
                  <figcaption className={`${label} text-[#57574A]`}>
                    {page.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 border-t border-[#B5A99C] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">
              The full case study and the 10-slide deck are available on
              request.
            </p>
            <Link
              href="/#contact"
              className="inline-flex shrink-0 items-center gap-2 bg-[#2B2622] px-6 py-3 text-sm tracking-[0.2em] text-[#EEE9E3] uppercase transition-colors hover:bg-[#63644F]"
            >
              Request the full case study <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={olive}>
        <h2 className="sr-only">Outcome</h2>
        <ul
          className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4`}
        >
          {AT_LAST.outcome.map((stat) => (
            <li key={stat.label} className="border-b border-[#8A8B74] pb-3">
              <p className={`${displayFont} text-6xl leading-none`}>
                {stat.value}
              </p>
              <p className={`${label} mt-3 text-[#E4E1D6]`}>{stat.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#2B2622] text-[#EEE9E3]">
        <div
          className={`${wrap} flex flex-col gap-6 py-14 sm:flex-row sm:items-end sm:justify-between`}
        >
          <p className={`${displayFont} text-3xl text-balance sm:text-4xl`}>
            {AT_LAST.closing}
          </p>
          <div className="space-y-1 sm:shrink-0 sm:text-right">
            <p className={label}>Ni Ni · ninitinwin.com</p>
            <p className={`${label} text-[#B5A99C]`}>
              {AT_LAST.confidentiality}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
