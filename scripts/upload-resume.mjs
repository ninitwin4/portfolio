import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { put } from '@vercel/blob'

const BLOB_PATHNAME = 'resumes/resume.pdf'

function loadEnvLocal() {
  try {
    const text = readFileSync('.env.local', 'utf8')

    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue
      }

      const [key, ...rest] = trimmed.split('=')
      const value = rest
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '')

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // .env.local is optional for this script if env vars are already exported.
  }
}

async function main() {
  loadEnvLocal()

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      'Missing BLOB_READ_WRITE_TOKEN. Create a Blob store in Vercel, then add the token to .env.local.',
    )
    process.exit(1)
  }

  delete process.env.VERCEL_OIDC_TOKEN

  const pdfPath = process.env.RESUME_PDF_PATH || 'private/resume.pdf'
  const file = await readFile(pdfPath)

  const blob = await put(BLOB_PATHNAME, file, {
    access: 'private',
    contentType: 'application/pdf',
    addRandomSuffix: false,
  })

  console.log('Resume uploaded to Vercel Blob.')
  console.log('')
  console.log('Add this to Vercel production env:')
  console.log(`RESUME_BLOB_PATHNAME=${blob.pathname}`)
  console.log('')
  console.log('You can remove RESUME_PDF_BASE64 from Vercel if it was set earlier.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
