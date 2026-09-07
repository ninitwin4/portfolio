// Inspect the chunks the corpus produces, before spending anything on
// embeddings. Run: npm run chunk  (add -- --full to print whole chunks,
// -- --json to pipe them somewhere else.)

import { loadCorpus, MIN_WORDS, MAX_WORDS, countWords } from './lib/chunk.mjs'

function preview(text, limit = 96) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > limit ? `${flat.slice(0, limit)}...` : flat
}

async function main() {
  const args = process.argv.slice(2)
  const chunks = await loadCorpus('content')

  if (args.includes('--json')) {
    console.log(JSON.stringify(chunks, null, 2))
    return
  }

  const full = args.includes('--full')
  let currentSource = null

  for (const chunk of chunks) {
    if (chunk.source !== currentSource) {
      currentSource = chunk.source
      console.log(`\n${chunk.title}  (${chunk.source}.md)`)
      console.log('-'.repeat(72))
    }

    const flag =
      chunk.wordCount < MIN_WORDS
        ? '  [under]'
        : chunk.wordCount > MAX_WORDS
          ? '  [over]'
          : ''

    const path = chunk.headings.join(' / ') || chunk.section
    const merged =
      chunk.headings.length > 1 ? `  (${chunk.headings.length} sections)` : ''

    console.log(
      `  ${String(chunk.wordCount).padStart(4)}w  ${path}${flag}${merged}`,
    )
    console.log(`        ${chunk.id}`)
    console.log(`        ${full ? `\n${chunk.text}\n` : preview(chunk.text)}`)
  }

  const words = chunks.map((chunk) => chunk.wordCount)
  const total = words.reduce((sum, n) => sum + n, 0)
  const sorted = [...words].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0
  const under = chunks.filter((c) => c.wordCount < MIN_WORDS)
  const over = chunks.filter((c) => c.wordCount > MAX_WORDS)

  console.log(`\n${'='.repeat(72)}`)
  console.log(
    `${chunks.length} chunks · ${total} words · ` +
      `min ${sorted[0] ?? 0} / median ${median} / max ${sorted[sorted.length - 1] ?? 0}`,
  )
  console.log(`target range ${MIN_WORDS}-${MAX_WORDS} words per chunk`)

  if (under.length) {
    console.log(
      `\n${under.length} chunk(s) still under ${MIN_WORDS} words - these are whole documents too short to merge further:`,
    )
    for (const chunk of under) {
      console.log(`  ${chunk.wordCount}w  ${chunk.source} · ${chunk.section}`)
    }
  }
  if (over.length) {
    console.log(`\n${over.length} chunk(s) over ${MAX_WORDS} words:`)
    for (const chunk of over) {
      console.log(`  ${chunk.wordCount}w  ${chunk.source} · ${chunk.section}`)
    }
  }

  // Rough gauge of whether retrieval is doing real work yet. Under about
  // 8k words the whole corpus fits comfortably in one prompt and top-k
  // retrieval is mostly ceremony.
  console.log(
    `\ncorpus is ~${Math.round((total * 4) / 3)} tokens; ` +
      `retrieval starts earning its keep past roughly 8,000 words.`,
  )

  // Ids key the embeddings file. A collision there is invisible - the second
  // chunk overwrites the first and simply never gets retrieved - so it is
  // caught here, loudly, before anything is embedded.
  const counts = new Map()
  for (const chunk of chunks) {
    counts.set(chunk.id, (counts.get(chunk.id) ?? 0) + 1)
  }
  const collisions = [...counts].filter(([, count]) => count > 1)

  if (collisions.length) {
    console.error(`\n${collisions.length} duplicate chunk id(s):`)
    for (const [id, count] of collisions) {
      console.error(`  ${count}x  ${id}`)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
