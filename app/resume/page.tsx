import type { Metadata } from 'next'
import Link from 'next/link'
import { ResumeRequestForm } from '@/components/resume-request-form'
import { Container } from '@/components/container'
import { RESUME_ENABLED } from '../data'

export const metadata: Metadata = {
  title: 'Resume Request',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResumePage() {
  return (
    <Container>
      <main className="space-y-6 pt-16">
        <div className="space-y-3">
          <Link
            className="text-sm text-muted transition hover:text-accent"
            href="/"
          >
            Back home
          </Link>
          <h1 className="text-4xl font-medium leading-tight text-balance text-foreground sm:text-5xl">
            {RESUME_ENABLED ? 'Want my resume?' : 'Resume requests are paused'}
          </h1>
          <p className="text-muted">
            {RESUME_ENABLED ? (
              <>Enter your email and I&apos;ll send it right over.</>
            ) : (
              <>
                I&apos;m not sending the resume out right now. If you&apos;d
                like to get in touch,{' '}
                <Link
                  className="text-accent underline underline-offset-2"
                  href="/#contact"
                >
                  drop me a message
                </Link>{' '}
                and I&apos;ll get back to you.
              </>
            )}
          </p>
        </div>

        {RESUME_ENABLED && <ResumeRequestForm />}
      </main>
    </Container>
  )
}
