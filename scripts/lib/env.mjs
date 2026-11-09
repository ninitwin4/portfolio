// Loads .env.local for scripts run with plain node. Next.js does this itself,
// but `node scripts/*.mjs` does not, and both the indexer and the eval harness
// need OPENAI_API_KEY.
//
// Values already in the environment win, so CI or a shell export can override
// the file without editing it.

import { readFileSync } from 'node:fs'

export function loadEnvLocal(file = '.env.local') {
  try {
    const text = readFileSync(file, 'utf8')

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
    // Optional: the variables may already be exported in the environment.
  }
}
