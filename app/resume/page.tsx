import type { Metadata } from 'next'
import Link from 'next/link'
import { ResumeRequestForm } from '@/components/resume-request-form'

export const metadata: Metadata = {
  title: 'Resume Request',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResumePage() {
  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <Link
          className="text-sm text-muted transition hover:text-accent"
          href="/"
        >
          Back home
        </Link>
        <h1 className="text-4xl font-medium leading-tight text-balance text-foreground sm:text-5xl">
          Want my resume?
        </h1>
        <p className="text-muted">
          Enter your email and I&apos;ll send it right over.
        </p>
      </div>

      <ResumeRequestForm />
    </main>
  )
}
