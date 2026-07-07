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
          className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          href="/"
        >
          Back home
        </Link>
        <h1 className="text-2xl font-medium text-black dark:text-white">
          Want my resume?
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter your email and I&apos;ll send it right over.
        </p>
      </div>

      <ResumeRequestForm />
    </main>
  )
}
