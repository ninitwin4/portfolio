import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { get } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { CreateEmailOptions } from 'resend'

export const runtime = 'nodejs'

type ContactRequest = {
  type: 'contact'
  name: string
  email: string
  message: string
}

type ResumeRequest = {
  type: 'resume'
  email: string
}

type EmailRequest = ContactRequest | ResumeRequest

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(
  body: { ok: boolean; message: string },
  status: number,
) {
  return NextResponse.json(body, { status })
}

function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email)
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatFromAddress(fromEmail: string, fromName: string) {
  const email = fromEmail.trim()

  if (email.includes('<') && email.includes('>')) {
    return email
  }

  return `${fromName} <${email}>`
}

function getEnv() {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const fromName = (process.env.RESEND_FROM_NAME || 'Portfolio').replace(
    /^["']|["']$/g,
    '',
  )
  const resumePath = process.env.RESUME_PDF_PATH || 'private/resume.pdf'
  const resumeBlobPathname = process.env.RESUME_BLOB_PATHNAME

  if (!apiKey || !toEmail || !fromEmail) {
    return null
  }

  return {
    apiKey,
    toEmail,
    fromEmail,
    fromName,
    resumePath,
    resumeBlobPathname,
  }
}

async function sendEmail(resend: Resend, options: CreateEmailOptions) {
  const { error } = await resend.emails.send(options)

  if (error) {
    throw new Error(error.message)
  }
}

async function getResumeFile(env: NonNullable<ReturnType<typeof getEnv>>) {
  if (env.resumeBlobPathname) {
    const result = await get(env.resumeBlobPathname, { access: 'private' })

    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error('Resume file not found in blob storage')
    }

    return Buffer.from(await new Response(result.stream).arrayBuffer())
  }

  return readFile(path.join(process.cwd(), env.resumePath))
}

async function handleContact(
  resend: Resend,
  env: NonNullable<ReturnType<typeof getEnv>>,
  body: ContactRequest,
) {
  const name = clean(body.name)
  const email = clean(body.email)
  const message = clean(body.message)

  if (!name || !email || !message) {
    return jsonResponse(
      { ok: false, message: 'Please fill out every field.' },
      400,
    )
  }

  if (!isValidEmail(email)) {
    return jsonResponse(
      { ok: false, message: 'Please enter a valid email address.' },
      400,
    )
  }

  await sendEmail(resend, {
    from: formatFromAddress(env.fromEmail, env.fromName),
    to: env.toEmail,
    replyTo: email,
    subject: `Portfolio contact from ${name}`,
    html: `
      <h1>New portfolio contact</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
    `,
  })

  return jsonResponse(
    { ok: true, message: 'Thanks - your message was sent.' },
    200,
  )
}

async function handleResume(
  resend: Resend,
  env: NonNullable<ReturnType<typeof getEnv>>,
  body: ResumeRequest,
) {
  const email = clean(body.email)

  if (!email) {
    return jsonResponse(
      { ok: false, message: 'Please enter your email address.' },
      400,
    )
  }

  if (!isValidEmail(email)) {
    return jsonResponse(
      { ok: false, message: 'Please enter a valid email address.' },
      400,
    )
  }

  const resumeFile = await getResumeFile(env)

  await sendEmail(resend, {
    from: formatFromAddress(env.fromEmail, env.fromName),
    to: email,
    subject: 'Ni Ni Tin Win Resume',
    html: `
      <p>Thanks for your interest. My resume is attached.</p>
      <p>Best,<br />Ni Ni Tin Win</p>
    `,
    attachments: [
      {
        filename: 'Ni-Ni-Tin-Win-Resume.pdf',
        content: resumeFile,
        contentType: 'application/pdf',
      },
    ],
  })

  await sendEmail(resend, {
    from: formatFromAddress(env.fromEmail, env.fromName),
    to: env.toEmail,
    subject: 'Resume requested from portfolio',
    html: `
      <h1>Resume request</h1>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    `,
  })

  return jsonResponse(
    { ok: true, message: "Thanks - I'll send it right over." },
    200,
  )
}

export async function POST(request: NextRequest) {
  const env = getEnv()

  if (!env) {
    return jsonResponse(
      { ok: false, message: 'Email is not configured yet.' },
      500,
    )
  }

  let body: EmailRequest

  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, message: 'Invalid request body.' }, 400)
  }

  const resend = new Resend(env.apiKey)

  try {
    if (body.type === 'contact') {
      return await handleContact(resend, env, body)
    }

    if (body.type === 'resume') {
      return await handleResume(resend, env, body)
    }

    return jsonResponse(
      { ok: false, message: 'Unsupported request type.' },
      400,
    )
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email route failed:', detail)

    return jsonResponse(
      {
        ok: false,
        message:
          detail.includes('verify') || detail.includes('testing emails')
            ? detail
            : 'Something went wrong sending the email. Please try again.',
      },
      500,
    )
  }
}
