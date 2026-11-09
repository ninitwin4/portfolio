// Build the retrieval index: chunk content/, embed anything whose text has
// changed, and write lib/rag/corpus.json.
//
// Run: npm run corpus  (add -- --force to re-embed everything.)
//
// One command on purpose. Editing the corpus should be `edit, run this, push` -
// if refreshing the index took three steps it would quietly stop happening.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import { loadCorpus } from './lib/chunk.mjs'
import { loadEnvLocal } from './lib/env.mjs'
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  embedTexts,
} from '../lib/rag/embed.ts'

const OUTPUT = 'lib/rag/corpus.json'

// Six decimals is far more precision than cosine ranking can use, and it roughly
// halves the committed file. The similarity scores are identical to five places.
const PRECISION = 6

// $0.02 per million tokens for text-embedding-3-small, for the report only.
const COST_PER_MILLION_TOKENS = 0.02

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

function round(embedding) {
  return embedding.map((value) => Number(value.toFixed(PRECISION)))
}

// Hand-rolled so each embedding lands on a single line. JSON.stringify with an
// indent would put all 1,536 floats on their own lines, turning any content edit
// into a 20,000-line diff and making the file useless to review.
function serialize(index) {
  const chunks = index.chunks.map((chunk) => {
    const { embedding, ...meta } = chunk
    const fields = Object.entries(meta)
      .map(
        ([key, value]) =>
          `      ${JSON.stringify(key)}: ${JSON.stringify(value)}`,
      )
      .join(',\n')

    return `    {\n${fields},\n      "embedding": [${embedding.join(',')}]\n    }`
  })

  return (
    `{\n` +
    `  "model": ${JSON.stringify(index.model)},\n` +
    `  "dimensions": ${index.dimensions},\n` +
    `  "generatedAt": ${JSON.stringify(index.generatedAt)},\n` +
    `  "chunks": [\n${chunks.join(',\n')}\n  ]\n` +
    `}\n`
  )
}

async function readExisting() {
  try {
    const text = await readFile(OUTPUT, 'utf8')
    const index = JSON.parse(text)

    // A model change invalidates every stored vector, so treat the whole index
    // as stale rather than mixing vectors from two models in one file.
    if (index.model !== EMBEDDING_MODEL) {
      console.log(
        `existing index used ${index.model}, now ${EMBEDDING_MODEL} - re-embedding all chunks`,
      )
      return { chunks: new Map(), generatedAt: null }
    }

    return {
      chunks: new Map(index.chunks.map((chunk) => [chunk.id, chunk])),
      generatedAt: index.generatedAt,
    }
  } catch {
    return { chunks: new Map(), generatedAt: null }
  }
}

async function main() {
  loadEnvLocal()

  const force = process.argv.slice(2).includes('--force')
  const chunks = await loadCorpus('content')

  const ids = new Set()
  for (const chunk of chunks) {
    if (ids.has(chunk.id)) {
      console.error(`duplicate chunk id: ${chunk.id} - run npm run chunk`)
      process.exit(1)
    }
    ids.add(chunk.id)
  }

  const previous = force
    ? { chunks: new Map(), generatedAt: null }
    : await readExisting()
  const existing = previous.chunks

  const withHashes = chunks.map((chunk) => ({
    ...chunk,
    hash: hashText(chunk.embedText),
  }))

  const stale = withHashes.filter((chunk) => {
    const previous = existing.get(chunk.id)
    return !previous || previous.hash !== chunk.hash
  })

  const removed = [...existing.keys()].filter((id) => !ids.has(id))

  console.log(
    `${chunks.length} chunks · ${stale.length} to embed · ` +
      `${chunks.length - stale.length} reused · ${removed.length} removed`,
  )

  let tokens = 0
  const fresh = new Map()

  if (stale.length) {
    const { embeddings, tokens: used } = await embedTexts(
      stale.map((chunk) => chunk.embedText),
    )
    tokens = used

    stale.forEach((chunk, i) => {
      fresh.set(chunk.id, round(embeddings[i]))
    })
  }

  const changed = stale.length > 0 || removed.length > 0

  const index = {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    // Only moves when the index actually changes. Stamping every run would
    // dirty the file on a no-op and defeat the point of hashing.
    generatedAt:
      changed || !previous.generatedAt
        ? new Date().toISOString()
        : previous.generatedAt,
    chunks: withHashes.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      source: chunk.source,
      section: chunk.section,
      headings: chunk.headings,
      url: chunk.url,
      kind: chunk.kind,
      // The chunk text ships in the index because it is what gets sent to the
      // model at answer time. It is also why content/ is effectively public -
      // see DECISIONS.md 005.
      text: chunk.text,
      wordCount: chunk.wordCount,
      hash: chunk.hash,
      embedding: fresh.get(chunk.id) ?? existing.get(chunk.id).embedding,
    })),
  }

  await mkdir('lib/rag', { recursive: true })
  await writeFile(OUTPUT, serialize(index), 'utf8')

  const cost = (tokens / 1_000_000) * COST_PER_MILLION_TOKENS
  console.log(
    `wrote ${OUTPUT} · ${index.chunks.length} vectors · ` +
      `${tokens} tokens embedded · $${cost.toFixed(5)}`,
  )

  if (!stale.length) {
    console.log('nothing changed - no API call made')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
