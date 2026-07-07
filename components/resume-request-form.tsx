'use client'

import { FormEvent, useState } from 'react'

type FormState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

export function ResumeRequestForm() {
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') || '').trim()

    if (!email) {
      setFormState({
        status: 'error',
        message: 'Please enter your email address.',
      })
      return
    }

    setFormState({ status: 'loading', message: 'Sending your resume...' })

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'resume',
          email,
        }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Unable to send the resume.')
      }

      form.reset()
      setFormState({
        status: 'success',
        message: result.message || "Thanks - I'll send it right over.",
      })
    } catch (error) {
      setFormState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-400" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-950 outline-none ring-1 ring-zinc-200 transition focus:ring-zinc-400 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800 dark:focus:ring-zinc-600"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <button
        className="rounded-full bg-zinc-950 px-4 py-2 text-sm text-zinc-50 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
        disabled={formState.status === 'loading'}
        type="submit"
      >
        {formState.status === 'loading' ? 'Sending...' : 'Send resume'}
      </button>

      {formState.message && (
        <p
          className={
            formState.status === 'error'
              ? 'text-sm text-red-600 dark:text-red-400'
              : 'text-sm text-zinc-600 dark:text-zinc-400'
          }
        >
          {formState.message}
        </p>
      )}
    </form>
  )
}
