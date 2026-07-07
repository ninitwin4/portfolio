'use client'

import { FormEvent, useState } from 'react'

type FormState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

const inputClass =
  'w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-accent/50'

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const message = String(formData.get('message') || '').trim()

    if (!name || !email || !message) {
      setFormState({
        status: 'error',
        message: 'Please fill out every field.',
      })
      return
    }

    setFormState({ status: 'loading', message: 'Sending your message...' })

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact',
          name,
          email,
          message,
        }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Unable to send your message.')
      }

      form.reset()
      setFormState({
        status: 'success',
        message: result.message || 'Thanks - your message was sent.',
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
        <label className="font-mono text-xs uppercase tracking-wider text-muted" htmlFor="name">
          Name
        </label>
        <input
          className={inputClass}
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-wider text-muted" htmlFor="email">
          Email
        </label>
        <input
          className={inputClass}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          className="font-mono text-xs uppercase tracking-wider text-muted"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          className={`${inputClass} min-h-32 resize-y`}
          id="message"
          name="message"
          required
        />
      </div>

      <button
        className="rounded-full border border-accent/30 bg-foreground px-4 py-2 text-sm text-background transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-transparent dark:hover:text-accent"
        disabled={formState.status === 'loading'}
        type="submit"
      >
        {formState.status === 'loading' ? 'Sending...' : 'Send message'}
      </button>

      {formState.message && (
        <p
          className={
            formState.status === 'error'
              ? 'text-sm text-red-600 dark:text-red-400'
              : 'text-sm text-muted'
          }
        >
          {formState.message}
        </p>
      )}
    </form>
  )
}
